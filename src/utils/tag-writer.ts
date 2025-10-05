/**
 * FLAC tag writing utilities using metaflac
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger';

const execAsync = promisify(exec);

export interface TagUpdate {
  genre?: string;
  // Add more tags as needed
}

export interface TagWriteResult {
  success: boolean;
  error?: string;
}

/**
 * Update FLAC file tags using metaflac
 */
export async function updateFlacTags(
  filePath: string,
  tags: TagUpdate
): Promise<TagWriteResult> {
  try {
    const commands: string[] = [];

    // Update genre tag if provided
    if (tags.genre) {
      // First remove existing GENRE tags, then set new one
      commands.push(`metaflac --remove-tag=GENRE "${filePath}"`);
      commands.push(`metaflac --set-tag=GENRE="${tags.genre}" "${filePath}"`);
    }

    // Execute all commands
    for (const cmd of commands) {
      logger.debug(`Executing: ${cmd}`);
      await execAsync(cmd);
    }

    logger.debug(`Updated tags for: ${filePath}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to update tags for ${filePath}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Read genre tag from FLAC file
 */
export async function readGenreTag(filePath: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`metaflac --show-tag=GENRE "${filePath}"`);

    // metaflac returns "GENRE=Rock" format
    const match = stdout.trim().match(/^GENRE=(.+)$/);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    logger.debug(`Failed to read genre tag from ${filePath}`);
    return null;
  }
}

/**
 * Check if file has genre tag
 */
export async function hasGenreTag(filePath: string): Promise<boolean> {
  const genre = await readGenreTag(filePath);
  return genre !== null && genre.trim().length > 0;
}
