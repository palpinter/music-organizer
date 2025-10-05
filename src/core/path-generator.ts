/**
 * Path generation for reorganized music library
 */

import path from 'path';
import { FlacMetadata, ClassificationResult } from '../types';
import {
  formatArtistName,
  formatAlbumTitle,
  formatTrackFilename,
  sanitizeDirectoryName,
  parseComposerName
} from '../utils/path-utils';
import { COMPOSER_FULL_NAMES, removeDiacritics } from '../utils/composer-names';

export interface PathGenerationOptions {
  basePath: string;
  usePerformerFolders?: boolean; // For classical music
}

export interface GeneratedPath {
  fullPath: string;
  directory: string;
  filename: string;
  relativePath: string;
}

/**
 * Generate target path for a modern music file
 */
export function generateModernPath(
  metadata: FlacMetadata,
  classification: ClassificationResult,
  options: PathGenerationOptions
): GeneratedPath {
  const { basePath } = options;

  const mainGenre = classification.mainGenre || 'Unknown';
  const subgenre = classification.subgenre || '';
  const artist = metadata.albumArtist || metadata.artist || 'Unknown Artist';
  const album = metadata.album || 'Unknown Album';
  const year = metadata.year;

  // Build path: /Main Genre/Subgenre/Artist/Year - Album/
  const components: string[] = [basePath];

  // Main genre folder
  components.push(sanitizeDirectoryName(mainGenre));

  // Subgenre folder (if not empty and different from main genre)
  if (subgenre && subgenre.trim() !== '' && subgenre !== mainGenre) {
    components.push(sanitizeDirectoryName(subgenre));
  }

  // Artist folder
  components.push(formatArtistName(artist));

  // Album folder (with year if available)
  components.push(formatAlbumTitle(album, year));

  const directory = path.join(...components);

  // Generate filename
  const title = metadata.title || 'Unknown Track';
  const trackNumber = metadata.trackNumber;
  const filename = formatTrackFilename(trackNumber, title, '.flac');

  const fullPath = path.join(directory, filename);
  const relativePath = path.relative(basePath, fullPath);

  return {
    fullPath,
    directory,
    filename,
    relativePath
  };
}

/**
 * Generate target path for a classical music file
 */
export function generateClassicalPath(
  metadata: FlacMetadata,
  classification: ClassificationResult,
  options: PathGenerationOptions
): GeneratedPath {
  const { basePath, usePerformerFolders = true } = options;

  // For classical: /Classical/Composer, Firstname/Work Category/Work Title/
  const components: string[] = [basePath, 'Classical'];

  // Get composer (subgenre is work category, not composer!)
  let composer = metadata.composer || '';

  // Try to extract from album title if not in metadata
  if (!composer || composer.trim() === '') {
    composer = extractComposerFromAlbumTitle(metadata.album || '');
  }

  // Last resort: try albumArtist
  if (!composer || composer.trim() === '') {
    const albumArtist = metadata.albumArtist || metadata.artist || '';
    composer = extractComposerFromArtist(albumArtist);
  }

  if (!composer || composer.trim() === '') {
    composer = 'Unknown Composer';
  }

  // Format composer name: "Lastname, Firstname"
  const composerFormatted = parseComposerName(composer);
  components.push(composerFormatted);

  // Work category: use AI classification first, fallback to detection
  const workCategory = classification.subgenre || detectWorkCategory(metadata.album || metadata.title || '');
  components.push(sanitizeDirectoryName(workCategory));

  // Album/Work title - clean it from composer prefix
  const album = metadata.album || 'Unknown Work';
  const cleanedAlbum = cleanAlbumTitleFromComposer(album, composer);
  components.push(sanitizeDirectoryName(cleanedAlbum));

  // Optional: Performer subfolder for multiple recordings
  if (usePerformerFolders && hasPerformerInfo(metadata)) {
    const performerFolder = generatePerformerFolder(metadata);
    components.push(performerFolder);
  }

  const directory = path.join(...components);

  // Generate filename
  const title = metadata.title || 'Unknown Track';
  const trackNumber = metadata.trackNumber;
  const filename = formatTrackFilename(trackNumber, title, '.flac');

  const fullPath = path.join(directory, filename);
  const relativePath = path.relative(basePath, fullPath);

  return {
    fullPath,
    directory,
    filename,
    relativePath
  };
}

/**
 * Extract composer from album title (e.g., "Bizet: Carmen" -> "Bizet")
 */
function extractComposerFromAlbumTitle(albumTitle: string): string {
  // Match pattern: "Composer: Work" or "Composer - Work"
  const colonMatch = albumTitle.match(/^([^:]+):/);
  if (colonMatch) {
    let composer = colonMatch[1].trim();

    // If contains " - ", take the last part (actual composer name)
    // e.g., "Six Evolutions - Bach: Cello Suites" -> "Bach"
    if (composer.includes(' - ')) {
      const parts = composer.split(' - ');
      composer = parts[parts.length - 1].trim();
    }

    // Check if first word is a known composer (e.g., "Purcell Edition Volume 1" -> "Purcell")
    const words = composer.split(/\s+/);
    if (words.length > 1) {
      const firstWord = words[0].toLowerCase();
      const firstWordNormalized = removeDiacritics(firstWord);

      if (COMPOSER_FULL_NAMES[firstWord] || COMPOSER_FULL_NAMES[firstWordNormalized]) {
        return words[0]; // Return just the composer name
      }

      // Check first two words (e.g., "Saint Saens Edition")
      if (words.length >= 2) {
        const firstTwoWords = `${words[0]} ${words[1]}`.toLowerCase();
        const firstTwoWordsNormalized = removeDiacritics(firstTwoWords);

        if (COMPOSER_FULL_NAMES[firstTwoWords] || COMPOSER_FULL_NAMES[firstTwoWordsNormalized]) {
          return `${words[0]} ${words[1]}`;
        }
      }
    }

    return composer;
  }

  const dashMatch = albumTitle.match(/^([^-]+)-/);
  if (dashMatch && dashMatch[1].length < 30) { // Avoid matching track separators
    return dashMatch[1].trim();
  }

  // Try to match known composer names at the start
  // e.g., "Purcell Dido and Aeneas" -> "Purcell"
  const words = albumTitle.split(/\s+/);
  if (words.length >= 2) {
    // Check if first word(s) match a known composer
    const firstWord = words[0].toLowerCase().trim();
    const firstWordNormalized = removeDiacritics(firstWord);

    if (COMPOSER_FULL_NAMES[firstWord] || COMPOSER_FULL_NAMES[firstWordNormalized]) {
      return words[0]; // Return original capitalization
    }

    // Check first two words (e.g., "Saint Saens")
    if (words.length >= 3) {
      const firstTwoWords = `${words[0]} ${words[1]}`.toLowerCase().trim();
      const firstTwoWordsNormalized = removeDiacritics(firstTwoWords);

      if (COMPOSER_FULL_NAMES[firstTwoWords] || COMPOSER_FULL_NAMES[firstTwoWordsNormalized]) {
        return `${words[0]} ${words[1]}`;
      }
    }
  }

  return '';
}

/**
 * Clean album title from composer prefix
 * "Antonio Vivaldi: La Viola Da Gamba" -> "La Viola Da Gamba"
 */
function cleanAlbumTitleFromComposer(albumTitle: string, composer: string): string {
  let cleaned = albumTitle;

  // Remove "Composer:" prefix
  const colonPattern = new RegExp(`^${escapeRegex(composer)}\\s*:\\s*`, 'i');
  cleaned = cleaned.replace(colonPattern, '');

  // Remove "Something - Composer:" prefix (e.g., "Six Evolutions - Bach:")
  const dashColonPattern = new RegExp(`^.*\\s-\\s${escapeRegex(composer)}\\s*:\\s*`, 'i');
  cleaned = cleaned.replace(dashColonPattern, '');

  // Remove "Full Name:" prefix (e.g., "Antonio Vivaldi:")
  const parts = composer.split(',').map(p => p.trim());
  for (const part of parts) {
    const pattern = new RegExp(`^${escapeRegex(part)}\\s*:\\s*`, 'i');
    cleaned = cleaned.replace(pattern, '');
  }

  // Also try reversed order "Firstname Lastname:"
  if (parts.length === 2) {
    const reversed = `${parts[1]} ${parts[0]}`;
    const reversedPattern = new RegExp(`^${escapeRegex(reversed)}\\s*:\\s*`, 'i');
    cleaned = cleaned.replace(reversedPattern, '');
  }

  // Generic pattern: remove any "Name Name:" at the start
  // This catches cases like "Antonio Vivaldi:" when composer is just "Vivaldi"
  cleaned = cleaned.replace(/^[A-Z][a-z]+\s+[A-Z][a-z]+\s*:\s*/i, '');

  // Remove composer name without colon (e.g., "Purcell Dido and Aeneas" -> "Dido and Aeneas")
  if (cleaned === albumTitle) {
    // Nothing was removed yet, try removing just the composer name at start
    const composerPattern = new RegExp(`^${escapeRegex(composer)}\\s+`, 'i');
    cleaned = cleaned.replace(composerPattern, '');
  }

  return cleaned.trim();
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract composer name from artist field
 */
function extractComposerFromArtist(artist: string): string {
  // Handle formats like:
  // "Jordi Savall, Antonio Vivaldi"
  // "London Symphony Orchestra, Claudio Abbado"
  // "Antonio Vivaldi"

  const parts = artist.split(',').map(p => p.trim());

  // Look for composer-like names
  for (const part of parts) {
    const lower = part.toLowerCase();

    // Common composer names
    if (lower.includes('vivaldi') ||
        lower.includes('bach') ||
        lower.includes('mozart') ||
        lower.includes('beethoven') ||
        lower.includes('bizet') ||
        lower.includes('verdi') ||
        lower.includes('puccini')) {
      return part;
    }
  }

  // If no known composer found, return first part
  return parts[0];
}

/**
 * Detect work category from album/title
 */
export function detectWorkCategory(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('concerto')) return 'Concertos';
  if (lower.includes('symphony')) return 'Symphonies';
  if (lower.includes('sonata')) return 'Sonatas';
  if (lower.includes('quartet')) return 'Chamber Music';
  if (lower.includes('opera') || lower.includes('carmen')) return 'Opera';
  if (lower.includes('mass') || lower.includes('requiem')) return 'Sacred Music';
  if (lower.includes('suite')) return 'Suites';
  if (lower.includes('prelude') || lower.includes('fugue')) return 'Keyboard Works';

  return 'Other Works';
}

/**
 * Check if metadata has performer information
 */
function hasPerformerInfo(metadata: FlacMetadata): boolean {
  return !!(metadata.conductor || metadata.orchestra || metadata.ensemble || metadata.artist);
}

/**
 * Generate performer folder name
 * Format: "Conductor - Ensemble (Year)"
 */
function generatePerformerFolder(metadata: FlacMetadata): string {
  const parts: string[] = [];

  if (metadata.conductor) {
    // Extract last name only for conductor
    const conductorParts = metadata.conductor.split(/\s+/);
    const lastName = conductorParts[conductorParts.length - 1];
    parts.push(lastName);
  }

  if (metadata.orchestra) {
    // Abbreviate orchestra name
    const orchestra = abbreviateOrchestra(metadata.orchestra);
    parts.push(orchestra);
  } else if (metadata.ensemble) {
    parts.push(metadata.ensemble);
  } else if (!metadata.conductor) {
    // For operas/multi-performer works: use albumArtist (usually conductor/orchestra)
    // This prevents creating separate subfolders for each soloist
    const performerName = metadata.albumArtist || metadata.artist;
    if (performerName) {
      const performerParts = performerName.split(/\s+/);
      const lastName = performerParts[performerParts.length - 1];
      parts.push(lastName);
    }
  }

  let folderName = parts.join(' - ');

  // Add year if available
  if (metadata.year) {
    folderName += ` (${metadata.year})`;
  }

  return sanitizeDirectoryName(folderName);
}

/**
 * Abbreviate orchestra names
 */
function abbreviateOrchestra(orchestra: string): string {
  const abbreviations: Record<string, string> = {
    'London Symphony Orchestra': 'LSO',
    'Berlin Philharmonic': 'BPO',
    'Vienna Philharmonic': 'VPO',
    'New York Philharmonic': 'NYPO',
    'Royal Concertgebouw Orchestra': 'RCO',
    'Chicago Symphony Orchestra': 'CSO',
    'Boston Symphony Orchestra': 'BSO'
  };

  for (const [full, abbr] of Object.entries(abbreviations)) {
    if (orchestra.includes(full)) {
      return abbr;
    }
  }

  return orchestra;
}

/**
 * Main path generation function - chooses classical or modern
 */
export function generateTargetPath(
  metadata: FlacMetadata,
  classification: ClassificationResult,
  options: PathGenerationOptions
): GeneratedPath {
  // Determine if this is classical music
  const isClassical = classification.mainGenre === 'Classical';

  if (isClassical) {
    return generateClassicalPath(metadata, classification, options);
  } else {
    return generateModernPath(metadata, classification, options);
  }
}
