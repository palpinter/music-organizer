/**
 * Path utilities for file system operations
 */

/**
 * Sanitize a string for use in file/directory names
 * Removes or replaces characters that are problematic in filesystems
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Replace problematic characters with safe alternatives
    .replace(/:/g, ' -')         // Colon to dash with space
    .replace(/["]/g, '')         // Remove quotes
    .replace(/[<>|?*]/g, '_')    // Other Windows forbidden chars
    .replace(/\//g, '-')         // Path separator
    .replace(/\\/g, '-')         // Windows path separator
    .replace(/\x00/g, '')        // Null bytes
    .replace(/\.+$/, '')         // Trailing dots (Windows)
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
}

/**
 * Sanitize directory name (same as filename but allows some flexibility)
 */
export function sanitizeDirectoryName(dirname: string): string {
  return sanitizeFilename(dirname);
}

/**
 * Truncate a string to fit within filesystem limits
 * Most filesystems support 255 bytes per component
 */
export function truncatePathComponent(component: string, maxLength: number = 200): string {
  if (component.length <= maxLength) {
    return component;
  }

  // Try to truncate at a word boundary
  const truncated = component.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace).trim();
  }

  return truncated.trim();
}

/**
 * Format artist name for directory (handle "Various Artists", etc.)
 */
export function formatArtistName(artist: string): string {
  const sanitized = sanitizeDirectoryName(artist);

  // Handle "Various Artists" - keep as is
  if (sanitized.toLowerCase().includes('various')) {
    return 'Various Artists';
  }

  return sanitized;
}

/**
 * Format album title for directory
 */
export function formatAlbumTitle(album: string, year?: number): string {
  const sanitized = sanitizeDirectoryName(album);

  if (year) {
    return `${year} - ${sanitized}`;
  }

  return sanitized;
}

/**
 * Format track filename (with track number)
 */
export function formatTrackFilename(
  trackNumber: number | undefined,
  title: string,
  extension: string = '.flac'
): string {
  const sanitizedTitle = sanitizeFilename(title);

  if (trackNumber !== undefined) {
    const paddedNumber = trackNumber.toString().padStart(2, '0');
    return `${paddedNumber} - ${sanitizedTitle}${extension}`;
  }

  return `${sanitizedTitle}${extension}`;
}

/**
 * Parse composer name and return in "Lastname, Firstname" format
 */
export function parseComposerName(composer: string): string {
  const trimmed = composer.trim();

  // Already in "Lastname, Firstname" format?
  if (trimmed.includes(',')) {
    return sanitizeDirectoryName(trimmed);
  }

  // Split into parts
  const parts = trimmed.split(/\s+/);

  if (parts.length === 0) {
    return sanitizeDirectoryName(composer);
  }

  if (parts.length === 1) {
    // Single name (e.g., "Bach")
    return sanitizeDirectoryName(parts[0]);
  }

  // Assume last part is surname, rest is first name
  const surname = parts[parts.length - 1];
  const firstname = parts.slice(0, -1).join(' ');

  return sanitizeDirectoryName(`${surname}, ${firstname}`);
}

/**
 * Detect if a name looks like a composer vs. performer
 */
export function isComposerName(name: string): boolean {
  const lower = name.toLowerCase();

  // Common composer indicators
  const composerIndicators = [
    'bach', 'mozart', 'beethoven', 'vivaldi', 'handel',
    'chopin', 'liszt', 'brahms', 'wagner', 'verdi',
    'puccini', 'debussy', 'ravel', 'stravinsky', 'tchaikovsky',
    'dvořák', 'dvorak', 'schubert', 'schumann', 'mendelssohn'
  ];

  return composerIndicators.some(indicator => lower.includes(indicator));
}
