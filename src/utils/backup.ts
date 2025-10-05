/**
 * Backup utilities for music library reorganization
 */

import fs from 'fs-extra';
import path from 'path';
import logger from './logger';

export interface BackupManifest {
  timestamp: string;
  sourceLibrary: string;
  targetLibrary: string;
  files: Array<{
    sourcePath: string;
    targetPath: string;
    checksum?: string;
  }>;
}

/**
 * Create backup manifest file
 */
export async function createBackupManifest(
  backupDir: string,
  manifest: BackupManifest
): Promise<string> {
  await fs.ensureDir(backupDir);

  const manifestPath = path.join(backupDir, 'backup-manifest.json');
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  logger.info(`Backup manifest created: ${manifestPath}`);
  return manifestPath;
}

/**
 * Load backup manifest
 */
export async function loadBackupManifest(backupDir: string): Promise<BackupManifest | null> {
  const manifestPath = path.join(backupDir, 'backup-manifest.json');

  if (!(await fs.pathExists(manifestPath))) {
    return null;
  }

  return await fs.readJson(manifestPath);
}

/**
 * Create backup directory with timestamp
 */
export function generateBackupPath(baseDir: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return path.join(baseDir, `backup-${timestamp}`);
}
