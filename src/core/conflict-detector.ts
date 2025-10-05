/**
 * Detect conflicts in reorganization plan
 */

import { Conflict } from '../types';

export interface FileMove {
  sourcePath: string;
  targetPath: string;
  artist?: string;
  album?: string;
  title?: string;
}

export interface ConflictDetectionResult {
  conflicts: Conflict[];
  totalFiles: number;
  conflictingFiles: number;
}

/**
 * Detect conflicts in a list of file moves
 */
export function detectConflicts(moves: FileMove[]): ConflictDetectionResult {
  const conflicts: Conflict[] = [];
  const targetPaths = new Map<string, FileMove[]>();

  // Group files by target path
  for (const move of moves) {
    const existing = targetPaths.get(move.targetPath);
    if (existing) {
      existing.push(move);
    } else {
      targetPaths.set(move.targetPath, [move]);
    }
  }

  // Find duplicate target paths
  for (const [targetPath, movesForPath] of targetPaths) {
    if (movesForPath.length > 1) {
      conflicts.push({
        type: 'duplicate-path',
        files: movesForPath.map(m => m.sourcePath),
        suggestion: `Multiple files would be moved to: ${targetPath}`
      });
    }
  }

  // Find files with missing metadata
  for (const move of moves) {
    if (!move.artist || !move.album || !move.title) {
      conflicts.push({
        type: 'missing-metadata',
        files: [move.sourcePath],
        suggestion: `File has incomplete metadata (artist: ${move.artist}, album: ${move.album}, title: ${move.title})`
      });
    }
  }

  const conflictingFiles = new Set<string>();
  for (const conflict of conflicts) {
    conflict.files.forEach(f => conflictingFiles.add(f));
  }

  return {
    conflicts,
    totalFiles: moves.length,
    conflictingFiles: conflictingFiles.size
  };
}

/**
 * Check if a path would be too long for the filesystem
 */
export function isPathTooLong(path: string, maxLength: number = 255): boolean {
  // Most filesystems limit individual path components to 255 bytes
  // Total path length varies (4096 on Linux, 260 on Windows)

  const components = path.split('/');

  for (const component of components) {
    if (component.length > maxLength) {
      return true;
    }
  }

  return false;
}
