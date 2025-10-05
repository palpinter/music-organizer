#!/usr/bin/env node
/**
 * Interactive tool to fix genre consistency issues
 * Finds artists classified into multiple genres and helps consolidate them
 */

import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';

interface Classification {
  artist: string;
  album: string;
  mainGenre: string;
  subgenre?: string;
  source: string;
  confidence: string;
  reasoning?: string;
}

interface ClassificationFile {
  classifications: Classification[];
  libraryPath: string;
  statistics: any;
}

interface ArtistGenres {
  artist: string;
  genres: Map<string, Classification[]>; // mainGenre -> albums
  totalAlbums: number;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * Find artists with inconsistent genre classifications
 */
function findInconsistentArtists(classifications: Classification[]): ArtistGenres[] {
  const artistMap = new Map<string, Map<string, Classification[]>>();

  // Group by artist and genre
  for (const classification of classifications) {
    const artist = classification.artist;

    if (!artistMap.has(artist)) {
      artistMap.set(artist, new Map());
    }

    const genreMap = artistMap.get(artist)!;
    const mainGenre = classification.mainGenre;

    if (!genreMap.has(mainGenre)) {
      genreMap.set(mainGenre, []);
    }

    genreMap.get(mainGenre)!.push(classification);
  }

  // Find artists with multiple genres
  const inconsistent: ArtistGenres[] = [];

  for (const [artist, genreMap] of artistMap) {
    if (genreMap.size > 1) {
      const totalAlbums = Array.from(genreMap.values())
        .reduce((sum, albums) => sum + albums.length, 0);

      inconsistent.push({
        artist,
        genres: genreMap,
        totalAlbums
      });
    }
  }

  // Sort by number of genres (most problematic first)
  return inconsistent.sort((a, b) => b.genres.size - a.genres.size);
}

/**
 * Display artist inconsistencies
 */
function displayArtist(artistData: ArtistGenres): void {
  console.log('\n' + '='.repeat(80));
  console.log(`Artist: ${artistData.artist}`);
  console.log(`Total albums: ${artistData.totalAlbums}`);
  console.log(`Split across ${artistData.genres.size} genres:\n`);

  let optionNum = 1;
  const genreOptions: string[] = [];

  for (const [mainGenre, albums] of artistData.genres) {
    console.log(`  [${optionNum}] ${mainGenre} (${albums.length} albums):`);
    genreOptions.push(mainGenre);

    albums.forEach((album, idx) => {
      const subgenre = album.subgenre ? ` → ${album.subgenre}` : '';
      const reasoning = album.reasoning ? ` (${album.reasoning.slice(0, 60)}...)` : '';
      console.log(`      ${idx + 1}. ${album.album}${subgenre}${reasoning}`);
    });

    console.log('');
    optionNum++;
  }

  console.log('');
}

/**
 * Get user choice for correct genre
 */
async function getUserChoice(genreOptions: string[]): Promise<number | null> {
  while (true) {
    const answer = await question(`Choose correct genre [1-${genreOptions.length}], or 's' to skip, 'q' to quit: `);

    if (answer.toLowerCase() === 'q') {
      return null;
    }

    if (answer.toLowerCase() === 's') {
      return -1; // Skip
    }

    const choice = parseInt(answer, 10);
    if (!isNaN(choice) && choice >= 1 && choice <= genreOptions.length) {
      return choice - 1;
    }

    console.log('Invalid choice. Please try again.');
  }
}

/**
 * Main interactive loop
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: fix-consistency <classification-file.json>');
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

  const inconsistent = findInconsistentArtists(data.classifications);

  if (inconsistent.length === 0) {
    console.log('\n✅ No inconsistencies found! All artists have consistent genres.\n');
    rl.close();
    return;
  }

  console.log(`\n⚠️  Found ${inconsistent.length} artists with inconsistent genres\n`);

  const changes: Array<{
    artist: string;
    fromGenre: string;
    toGenre: string;
    albums: string[];
  }> = [];

  for (const artistData of inconsistent) {
    displayArtist(artistData);

    const genreOptions = Array.from(artistData.genres.keys());
    const choice = await getUserChoice(genreOptions);

    if (choice === null) {
      // Quit
      console.log('\nQuitting without saving changes.\n');
      rl.close();
      return;
    }

    if (choice === -1) {
      // Skip
      console.log('Skipped.\n');
      continue;
    }

    const correctGenre = genreOptions[choice];
    console.log(`\n✅ Setting all albums to: ${correctGenre}\n`);

    // Record changes
    for (const [genre, albums] of artistData.genres) {
      if (genre !== correctGenre) {
        changes.push({
          artist: artistData.artist,
          fromGenre: genre,
          toGenre: correctGenre,
          albums: albums.map(a => a.album)
        });

        // Update classifications
        for (const album of albums) {
          const idx = data.classifications.findIndex(
            c => c.artist === album.artist && c.album === album.album
          );
          if (idx !== -1) {
            data.classifications[idx].mainGenre = correctGenre;
            // Keep original subgenre or clear if not compatible
          }
        }
      }
    }
  }

  rl.close();

  if (changes.length === 0) {
    console.log('\nNo changes made.\n');
    return;
  }

  // Show summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY OF CHANGES');
  console.log('='.repeat(80) + '\n');

  for (const change of changes) {
    console.log(`${change.artist}:`);
    console.log(`  Moved ${change.albums.length} albums from "${change.fromGenre}" → "${change.toGenre}"`);
    change.albums.forEach(album => {
      console.log(`    - ${album}`);
    });
    console.log('');
  }

  // Ask for confirmation
  const confirm = await new Promise<string>((resolve) => {
    const confirmRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    confirmRl.question('Save changes? (yes/no): ', (answer) => {
      confirmRl.close();
      resolve(answer);
    });
  });

  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\nChanges not saved.\n');
    return;
  }

  // Save updated file
  const backupPath = classificationPath.replace('.json', '.backup.json');
  await fs.copy(classificationPath, backupPath);
  console.log(`\nBackup saved to: ${backupPath}`);

  // Recalculate statistics
  const genreCounts = new Map<string, number>();
  for (const c of data.classifications) {
    genreCounts.set(c.mainGenre, (genreCounts.get(c.mainGenre) || 0) + 1);
  }

  data.statistics.byMainGenre = Object.fromEntries(genreCounts);

  await fs.writeJson(classificationPath, data, { spaces: 2 });

  console.log(`\n✅ Changes saved to: ${classificationPath}\n`);
  console.log('Run "plan" command again to regenerate with consistent genres.\n');
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
