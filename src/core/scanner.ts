import fs from 'fs-extra';
import path from 'path';
import { isFlacFile, extractMetadata } from './metadata';
import { FlacMetadata } from '../types';
import logger from '../utils/logger';

export interface ScannedFile {
  path: string;
  filename: string;
  directory: string;
  metadata: FlacMetadata | null;
}

export interface ScanResult {
  totalFiles: number;
  flacFiles: ScannedFile[];
  errors: Array<{ path: string; error: string }>;
}

/**
 * Recursively scan a directory for FLAC files
 */
export async function scanDirectory(
  rootPath: string,
  options: {
    recursive?: boolean;
    extractMetadata?: boolean;
  } = {}
): Promise<ScanResult> {
  const { recursive = true, extractMetadata: shouldExtractMetadata = true } = options;

  const result: ScanResult = {
    totalFiles: 0,
    flacFiles: [],
    errors: [],
  };

  try {
    await scanDirectoryRecursive(rootPath, result, recursive, shouldExtractMetadata);
  } catch (error) {
    logger.error(`Error scanning directory ${rootPath}:`, error);
    result.errors.push({
      path: rootPath,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logger.info(`Scan complete: found ${result.flacFiles.length} FLAC files out of ${result.totalFiles} total files`);

  return result;
}

async function scanDirectoryRecursive(
  dirPath: string,
  result: ScanResult,
  recursive: boolean,
  shouldExtractMetadata: boolean
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (recursive) {
        await scanDirectoryRecursive(fullPath, result, recursive, shouldExtractMetadata);
      }
    } else if (entry.isFile()) {
      result.totalFiles++;

      if (isFlacFile(entry.name)) {
        try {
          const metadata = shouldExtractMetadata
            ? await extractMetadata(fullPath)
            : null;

          result.flacFiles.push({
            path: fullPath,
            filename: entry.name,
            directory: dirPath,
            metadata,
          });

          if (result.flacFiles.length % 100 === 0) {
            logger.info(`Scanned ${result.flacFiles.length} FLAC files...`);
          }
        } catch (error) {
          logger.warn(`Error processing ${fullPath}:`, error);
          result.errors.push({
            path: fullPath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }
}

/**
 * Group scanned files by album (based on directory)
 */
export function groupByAlbum(files: ScannedFile[]): Map<string, ScannedFile[]> {
  const albumMap = new Map<string, ScannedFile[]>();

  for (const file of files) {
    const albumDir = file.directory;

    if (!albumMap.has(albumDir)) {
      albumMap.set(albumDir, []);
    }

    albumMap.get(albumDir)!.push(file);
  }

  return albumMap;
}

/**
 * Sort files within an album by track number
 */
export function sortByTrackNumber(files: ScannedFile[]): ScannedFile[] {
  return files.sort((a, b) => {
    const trackA = a.metadata?.trackNumber ?? 999;
    const trackB = b.metadata?.trackNumber ?? 999;
    return trackA - trackB;
  });
}

/**
 * Get album-level metadata from first file in album
 */
export function getAlbumMetadata(files: ScannedFile[]): {
  album?: string;
  artist?: string;
  albumArtist?: string;
  year?: number;
  genre?: string;
} {
  if (files.length === 0) {
    return {};
  }

  const firstFile = files[0].metadata;
  if (!firstFile) {
    return {};
  }

  return {
    album: firstFile.album,
    artist: firstFile.artist,
    albumArtist: firstFile.albumArtist,
    year: firstFile.year,
    genre: firstFile.genre,
  };
}
