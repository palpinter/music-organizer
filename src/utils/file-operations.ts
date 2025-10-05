/**
 * File operation utilities with integrity verification
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import logger from './logger';

export interface CopyOptions {
  verify?: boolean;
  preserveTimestamps?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  sourcePath: string;
  targetPath: string;
  error?: string;
  checksum?: string;
}

/**
 * Calculate file checksum (MD5)
 */
export async function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Copy file with optional verification
 */
export async function copyFile(
  source: string,
  target: string,
  options: CopyOptions = {}
): Promise<FileOperationResult> {
  const { verify = true, preserveTimestamps = true } = options;

  try {
    // Ensure target directory exists
    await fs.ensureDir(path.dirname(target));

    // Calculate source checksum if verification enabled
    let sourceChecksum: string | undefined;
    if (verify) {
      sourceChecksum = await calculateChecksum(source);
    }

    // Copy file
    await fs.copy(source, target, {
      overwrite: false,
      errorOnExist: true,
      preserveTimestamps
    });

    // Verify target checksum
    if (verify && sourceChecksum) {
      const targetChecksum = await calculateChecksum(target);

      if (sourceChecksum !== targetChecksum) {
        // Checksums don't match - remove target and fail
        await fs.remove(target);
        throw new Error(`Checksum mismatch: source=${sourceChecksum}, target=${targetChecksum}`);
      }
    }

    return {
      success: true,
      sourcePath: source,
      targetPath: target,
      checksum: sourceChecksum
    };
  } catch (error) {
    logger.error(`Failed to copy ${source} to ${target}:`, error);
    return {
      success: false,
      sourcePath: source,
      targetPath: target,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Move file with verification
 */
export async function moveFile(
  source: string,
  target: string,
  options: CopyOptions = {}
): Promise<FileOperationResult> {
  const { verify = true } = options;

  try {
    // Ensure target directory exists
    await fs.ensureDir(path.dirname(target));

    // Calculate source checksum if verification enabled
    let sourceChecksum: string | undefined;
    if (verify) {
      sourceChecksum = await calculateChecksum(source);
    }

    // Move file
    await fs.move(source, target, {
      overwrite: false
    });

    // Verify target checksum
    if (verify && sourceChecksum) {
      const targetChecksum = await calculateChecksum(target);

      if (sourceChecksum !== targetChecksum) {
        throw new Error(`Checksum mismatch after move: source=${sourceChecksum}, target=${targetChecksum}`);
      }
    }

    return {
      success: true,
      sourcePath: source,
      targetPath: target,
      checksum: sourceChecksum
    };
  } catch (error) {
    logger.error(`Failed to move ${source} to ${target}:`, error);
    return {
      success: false,
      sourcePath: source,
      targetPath: target,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Verify file exists and matches checksum
 */
export async function verifyFile(
  filePath: string,
  expectedChecksum?: string
): Promise<boolean> {
  try {
    if (!(await fs.pathExists(filePath))) {
      return false;
    }

    if (expectedChecksum) {
      const actualChecksum = await calculateChecksum(filePath);
      return actualChecksum === expectedChecksum;
    }

    return true;
  } catch (error) {
    logger.error(`Failed to verify ${filePath}:`, error);
    return false;
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Calculate total size of files
 */
export async function calculateTotalSize(filePaths: string[]): Promise<number> {
  let total = 0;

  for (const filePath of filePaths) {
    try {
      total += await getFileSize(filePath);
    } catch (error) {
      logger.warn(`Failed to get size for ${filePath}:`, error);
    }
  }

  return total;
}
