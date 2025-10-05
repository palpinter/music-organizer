#!/usr/bin/env node
/**
 * Generate artist/composer genre dictionary from classifications
 */

import fs from 'fs-extra';
import path from 'path';

interface Classification {
  artist: string;
  album: string;
  mainGenre: string;
  subgenre?: string;
}

interface ClassificationFile {
  classifications: Classification[];
  statistics: any;
}

interface Dictionary {
  artists: Record<string, string>;
  composers: Record<string, string>;
  metadata: {
    generated: string;
    totalArtists: number;
    totalComposers: number;
    version: string;
  };
}

/**
 * Extract composer name from album title
 * Examples: "Bach: Brandenburg Concertos" -> "Bach"
 *           "Mozart: Die Zauberflöte" -> "Mozart"
 */
function extractComposerFromAlbum(album: string): string | null {
  // Pattern: "Composer: Work" or "Composer - Work"
  const colonMatch = album.match(/^([A-Z][a-zA-Z\s,\.]+)\s*:/);
  if (colonMatch) {
    const composer = colonMatch[1].trim();
    // Filter out common non-composer prefixes
    if (composer.length > 2 && composer.length < 50 &&
        !composer.includes('Remaster') &&
        !composer.includes('Edition')) {
      return composer;
    }
  }
  return null;
}

/**
 * Normalize artist name for dictionary key
 */
function normalizeArtistName(artist: string): string {
  // Remove everything after comma (often performers/ensembles)
  // e.g., "English Baroque Soloists, John Eliot Gardiner" -> "English Baroque Soloists"
  const parts = artist.split(',');

  // If first part is very short, keep both
  if (parts[0].trim().length < 10 && parts.length > 1) {
    return parts.slice(0, 2).join(',').trim();
  }

  return parts[0].trim();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: generate-dictionary <classification-file.json>');
    process.exit(1);
  }

  const classificationPath = path.resolve(args[0]);

  if (!(await fs.pathExists(classificationPath))) {
    console.error(`File not found: ${classificationPath}`);
    process.exit(1);
  }

  console.log('Loading classifications...');
  const data: ClassificationFile = await fs.readJson(classificationPath);

  console.log(`Loaded ${data.classifications.length} classifications`);

  const artists = new Map<string, string>();
  const composers = new Map<string, string>();

  // Build artist dictionary
  for (const c of data.classifications) {
    const normalizedArtist = normalizeArtistName(c.artist);

    // Add to artist dictionary
    if (!artists.has(normalizedArtist)) {
      artists.set(normalizedArtist, c.mainGenre);
    }

    // For Classical music, extract composers
    if (c.mainGenre === 'Classical') {
      const composer = extractComposerFromAlbum(c.album);
      if (composer) {
        composers.set(composer, 'Classical');
      }
    }
  }

  // Create dictionary object
  const dictionary: Dictionary = {
    artists: Object.fromEntries(artists),
    composers: Object.fromEntries(composers),
    metadata: {
      generated: new Date().toISOString(),
      totalArtists: artists.size,
      totalComposers: composers.size,
      version: '1.0.0'
    }
  };

  // Save to config directory
  const configDir = path.join(require('os').homedir(), '.config', 'music-organizer');
  await fs.ensureDir(configDir);

  const dictionaryPath = path.join(configDir, 'genre-dictionary.json');
  await fs.writeJson(dictionaryPath, dictionary, { spaces: 2 });

  console.log(`\n✅ Dictionary generated successfully!`);
  console.log(`\nStatistics:`);
  console.log(`  Artists:   ${artists.size}`);
  console.log(`  Composers: ${composers.size}`);
  console.log(`\nSaved to: ${dictionaryPath}`);

  // Show sample entries
  console.log(`\nSample artists:`);
  const artistEntries = Array.from(artists.entries());
  artistEntries.slice(0, 10).forEach(([artist, genre]) => {
    console.log(`  ${artist} → ${genre}`);
  });

  console.log(`\nSample composers:`);
  const composerEntries = Array.from(composers.entries());
  composerEntries.slice(0, 10).forEach(([composer, genre]) => {
    console.log(`  ${composer} → ${genre}`);
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
