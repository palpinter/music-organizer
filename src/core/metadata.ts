import { parseFile, IAudioMetadata } from 'music-metadata';
import fs from 'fs-extra';
import { FlacMetadata } from '../types';
import logger from '../utils/logger';

/**
 * Validate FLAC file by checking magic bytes
 */
async function validateFlacFile(filePath: string): Promise<void> {
  const buffer = Buffer.alloc(4);
  const fd = await fs.open(filePath, 'r');

  try {
    await fs.read(fd, buffer, 0, 4, 0);
    const magic = buffer.toString('ascii');

    // FLAC files start with "fLaC" (0x664C6143)
    if (magic !== 'fLaC') {
      // Check if it's a JPEG (ff d8 ff)
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        throw new Error('File is actually a JPEG image, not FLAC');
      }
      throw new Error(`Invalid FLAC file format (magic bytes: ${buffer.toString('hex')})`);
    }
  } finally {
    await fs.close(fd);
  }
}

/**
 * Extract metadata from a FLAC file
 */
export async function extractMetadata(filePath: string): Promise<FlacMetadata | null> {
  try {
    // Validate file format first
    await validateFlacFile(filePath);

    const metadata: IAudioMetadata = await parseFile(filePath);

    const common = metadata.common;

    // Extract basic metadata
    const flacMetadata: FlacMetadata = {
      title: common.title,
      artist: common.artist,
      albumArtist: common.albumartist,
      album: common.album,
      trackNumber: common.track?.no ?? undefined,
      discNumber: common.disk?.no ?? undefined,
      totalDiscs: common.disk?.of ?? undefined,
      year: common.year,
      genre: common.genre?.[0], // Take first genre if multiple
      composer: common.composer?.[0],
    };

    // Extract classical-specific metadata from Vorbis comments
    // These are sometimes in custom tags
    if (metadata.native?.vorbis) {
      const vorbis = metadata.native.vorbis;

      // Find specific tags
      const findTag = (tagName: string): string | undefined => {
        const tag = vorbis.find(t => t.id.toLowerCase() === tagName.toLowerCase());
        return tag?.value as string | undefined;
      };

      flacMetadata.conductor = findTag('CONDUCTOR');
      flacMetadata.orchestra = findTag('ORCHESTRA');
      flacMetadata.ensemble = findTag('ENSEMBLE');
      flacMetadata.soloist = findTag('SOLOIST');

      // Catalog number might be in CATALOGNUMBER or similar tags
      flacMetadata.catalogNumber = findTag('CATALOGNUMBER') || findTag('CATALOG');
    }

    logger.debug(`Extracted metadata from: ${filePath}`, {
      title: flacMetadata.title,
      artist: flacMetadata.artist,
      album: flacMetadata.album,
    });

    return flacMetadata;
  } catch (error) {
    // Detect corruption types and provide user-friendly messages
    let errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('FourCC contains invalid characters')) {
      errorMessage = 'Corrupted FLAC file (invalid format)';
    } else if (errorMessage.includes('JPEG')) {
      errorMessage = 'File is JPEG, not FLAC (rename or convert)';
    } else if (errorMessage.includes('Invalid FLAC')) {
      errorMessage = errorMessage; // Keep our custom message
    }

    logger.warn(`Skipping corrupted file: ${filePath} - ${errorMessage}`);

    // Throw error so scanner can track it
    throw new Error(errorMessage);
  }
}

/**
 * Check if a file is a FLAC file based on extension
 */
export function isFlacFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.flac');
}

/**
 * Normalize genre string (remove extra whitespace, lowercase for comparison)
 */
export function normalizeGenre(genre: string): string {
  return genre.trim().toLowerCase();
}

/**
 * Extract year from various date formats
 */
export function extractYear(dateString?: string): number | undefined {
  if (!dateString) return undefined;

  // Try to extract 4-digit year
  const yearMatch = dateString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0], 10);
  }

  return undefined;
}
