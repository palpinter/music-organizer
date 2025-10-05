/**
 * Genre mapping and classification logic
 */

import { ClassificationResult, ConfidenceLevel } from '../types';
import { mapGenre } from '../modern/genre-definitions';
import logger from '../utils/logger';

/**
 * Classify genre from raw metadata string
 */
export function classifyFromMetadata(rawGenre?: string): ClassificationResult | null {
  if (!rawGenre || rawGenre.trim() === '') {
    return null;
  }

  const mapped = mapGenre(rawGenre);

  if (!mapped) {
    logger.debug(`Unknown genre: "${rawGenre}"`);
    return null;
  }

  return {
    mainGenre: mapped.mainGenre,
    subgenre: mapped.subgenre,
    source: 'flac-metadata',
    confidence: 'high',
    rawData: { originalGenre: rawGenre },
    timestamp: new Date()
  };
}

/**
 * Calculate confidence level based on various factors
 */
export function calculateConfidence(
  sources: number,
  agreement: number,
  hasDirectMatch: boolean
): ConfidenceLevel {
  if (hasDirectMatch && sources >= 2 && agreement >= 0.8) {
    return 'high';
  }

  if (sources >= 1 && agreement >= 0.6) {
    return 'medium';
  }

  return 'low';
}

/**
 * Merge multiple classification results and pick the best one
 */
export function mergeClassifications(
  results: ClassificationResult[]
): ClassificationResult | null {
  if (results.length === 0) {
    return null;
  }

  if (results.length === 1) {
    return results[0];
  }

  // Count votes for each main genre + subgenre combination
  const votes = new Map<string, { count: number; result: ClassificationResult }>();

  for (const result of results) {
    const key = `${result.mainGenre}|${result.subgenre}`;
    const existing = votes.get(key);

    if (existing) {
      existing.count++;
    } else {
      votes.set(key, { count: 1, result });
    }
  }

  // Find the most voted combination
  let bestVote: { count: number; result: ClassificationResult } | null = null;

  for (const vote of votes.values()) {
    if (!bestVote || vote.count > bestVote.count) {
      bestVote = vote;
    }
  }

  if (!bestVote) {
    return null;
  }

  // Adjust confidence based on agreement
  const agreement = bestVote.count / results.length;
  const confidence = calculateConfidence(
    results.length,
    agreement,
    bestVote.count > 1
  );

  return {
    ...bestVote.result,
    confidence,
    reasoning: `${bestVote.count}/${results.length} sources agree`
  };
}

/**
 * Detect if an album is a soundtrack
 */
export function isSoundtrack(albumTitle: string): boolean {
  const normalized = albumTitle.toLowerCase();
  const keywords = [
    'soundtrack',
    'original soundtrack',
    'ost',
    'original motion picture',
    'music from the motion picture',
    'film score',
    'original score',
    'motion picture score'
  ];

  return keywords.some(keyword => normalized.includes(keyword));
}

/**
 * Detect if an album is a "Best Of" compilation
 */
export function isBestOf(albumTitle: string): boolean {
  const normalized = albumTitle.toLowerCase();
  const keywords = [
    'best of',
    'the best of',
    'greatest hits',
    'anthology',
    'collection',
    'the collection',
    'essential',
    'essentials',
    'the essential'
  ];

  return keywords.some(keyword => normalized.includes(keyword));
}

/**
 * Detect if an album is a compilation (Various Artists)
 */
export function isCompilation(artist?: string, albumArtist?: string): boolean {
  const checkArtist = artist?.toLowerCase() || '';
  const checkAlbumArtist = albumArtist?.toLowerCase() || '';

  return (
    checkArtist.includes('various') ||
    checkArtist.includes('compilation') ||
    checkAlbumArtist.includes('various') ||
    checkAlbumArtist.includes('compilation')
  );
}
