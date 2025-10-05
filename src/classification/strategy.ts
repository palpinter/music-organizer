/**
 * Multi-stage classification strategy orchestrator
 */

import { ClassificationResult, AIClassificationRequest } from '../types';
import { classifyFromMetadata } from '../core/genre-mapper';
import { getMusicBrainzClient } from './musicbrainz';
import { getDiscogsClient } from './discogs';
import { getAIClassifier } from './ai-classifier';
import { getCache } from './cache';
import logger from '../utils/logger';

export interface ClassificationOptions {
  useCache?: boolean;
  stages?: {
    flacMetadata?: boolean;
    musicbrainz?: boolean;
    discogs?: boolean;
    ai?: boolean;
  };
  minConfidence?: number;
}

export interface AlbumInfo {
  artist: string;
  album: string;
  year?: number;
  genre?: string;
  tracks?: string[];
}

/**
 * Classify an album using multi-stage strategy
 */
export async function classifyAlbum(
  albumInfo: AlbumInfo,
  options: ClassificationOptions = {}
): Promise<ClassificationResult | null> {
  const {
    useCache = true,
    stages = {
      flacMetadata: true,
      musicbrainz: true,
      discogs: false,
      ai: false
    }
  } = options;

  const { artist, album, year, genre } = albumInfo;

  logger.debug(`Classifying: ${artist} - ${album}`);

  // Stage 0: Check cache
  if (useCache) {
    const cache = getCache();
    const cached = cache.get(artist, album, year);

    if (cached) {
      logger.debug(`Cache hit: ${artist} - ${album}`);
      return cached;
    }
  }

  const results: ClassificationResult[] = [];

  // Stage 1: FLAC Metadata
  if (stages.flacMetadata && genre) {
    const metadataResult = classifyFromMetadata(genre);

    if (metadataResult) {
      logger.debug(`Metadata classification: ${metadataResult.mainGenre} > ${metadataResult.subgenre}`);
      results.push(metadataResult);

      // If high confidence from metadata, we can return early
      if (metadataResult.confidence === 'high') {
        if (useCache) {
          const cache = getCache();
          cache.set(artist, album, metadataResult, year);
        }
        return metadataResult;
      }
    }
  }

  // Stage 2: MusicBrainz API
  if (stages.musicbrainz) {
    try {
      const mbClient = getMusicBrainzClient();
      const mbResult = await mbClient.classify(artist, album, year);

      if (mbResult) {
        logger.debug(`MusicBrainz classification: ${mbResult.mainGenre} > ${mbResult.subgenre} (${mbResult.confidence})`);
        results.push(mbResult);

        // If high confidence from MusicBrainz, save to cache and return
        if (mbResult.confidence === 'high') {
          if (useCache) {
            const cache = getCache();
            cache.set(artist, album, mbResult, year);
          }
          return mbResult;
        }
      }
    } catch (error) {
      logger.warn('MusicBrainz classification failed:', error);
    }
  }

  // Stage 3: Discogs API
  if (stages.discogs) {
    try {
      const discogsClient = getDiscogsClient();
      const discogsResult = await discogsClient.classify(artist, album, year);

      if (discogsResult) {
        logger.debug(`Discogs classification: ${discogsResult.mainGenre} > ${discogsResult.subgenre} (${discogsResult.confidence})`);
        results.push(discogsResult);

        // If high confidence from Discogs, save to cache and return
        if (discogsResult.confidence === 'high') {
          if (useCache) {
            const cache = getCache();
            cache.set(artist, album, discogsResult, year);
          }
          return discogsResult;
        }
      }
    } catch (error) {
      logger.warn('Discogs classification failed:', error);
    }
  }

  // Stage 4: AI Classification
  if (stages.ai) {
    try {
      const aiClassifier = getAIClassifier(process.env.ANTHROPIC_API_KEY);

      if (!aiClassifier.isAvailable()) {
        logger.warn('AI classification unavailable: ANTHROPIC_API_KEY not set');
      } else {
        // For single album, we could batch it, but for now classify directly
        const aiRequest: AIClassificationRequest = {
          artist,
          album,
          year,
          tracks: albumInfo.tracks || []
        };

        const aiResult = await aiClassifier.classify(aiRequest);

        if (aiResult) {
          logger.debug(`AI classification: ${aiResult.mainGenre} > ${aiResult.subgenre} (${aiResult.confidence})`);
          results.push(aiResult);

          // Even low confidence AI results are valuable
          if (useCache) {
            const cache = getCache();
            cache.set(artist, album, aiResult, year);
          }
          return aiResult;
        }
      }
    } catch (error) {
      logger.warn('AI classification failed:', error);
    }
  }

  // If we have any results, pick the best one
  if (results.length > 0) {
    const bestResult = pickBestResult(results);

    if (useCache && bestResult) {
      const cache = getCache();
      cache.set(artist, album, bestResult, year);
    }

    return bestResult;
  }

  logger.debug(`No classification found for: ${artist} - ${album}`);
  return null;
}

/**
 * Pick the best classification result from multiple sources
 */
function pickBestResult(results: ClassificationResult[]): ClassificationResult | null {
  if (results.length === 0) {
    return null;
  }

  if (results.length === 1) {
    return results[0];
  }

  // Sort by confidence (high > medium > low) and source priority
  const confidenceScore = (confidence: string): number => {
    switch (confidence) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const sourceScore = (source: string): number => {
    switch (source) {
      case 'flac-metadata': return 4;
      case 'musicbrainz': return 3;
      case 'discogs': return 2;
      case 'ai': return 1;
      case 'manual': return 5;
      default: return 0;
    }
  };

  results.sort((a, b) => {
    const confDiff = confidenceScore(b.confidence) - confidenceScore(a.confidence);
    if (confDiff !== 0) return confDiff;

    return sourceScore(b.source) - sourceScore(a.source);
  });

  return results[0];
}

/**
 * Classify multiple albums in batch
 */
export async function classifyAlbumsBatch(
  albums: AlbumInfo[],
  options: ClassificationOptions = {},
  onProgress?: (current: number, total: number, album: AlbumInfo) => void
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];

    if (onProgress) {
      onProgress(i + 1, albums.length, album);
    }

    const result = await classifyAlbum(album, options);

    if (result) {
      const key = `${album.artist}||${album.album}`;
      results.set(key, result);
    }
  }

  return results;
}
