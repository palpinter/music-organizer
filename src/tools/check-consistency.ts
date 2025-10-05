#!/usr/bin/env node
/**
 * Check and report genre consistency issues
 * Finds artists classified into multiple genres
 */

import fs from 'fs-extra';
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
  genres: Map<string, Classification[]>;
  totalAlbums: number;
}

/**
 * Find artists with inconsistent genre classifications
 */
function findInconsistentArtists(classifications: Classification[]): ArtistGenres[] {
  const artistMap = new Map<string, Map<string, Classification[]>>();

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

  return inconsistent.sort((a, b) => b.genres.size - a.genres.size);
}

/**
 * Generate report
 */
function generateReport(inconsistent: ArtistGenres[]): string {
  let report = '';

  report += '# Genre Consistency Report\n\n';
  report += `Found ${inconsistent.length} artists with inconsistent genres\n\n`;
  report += '---\n\n';

  for (const artistData of inconsistent) {
    report += `## ${artistData.artist}\n\n`;
    report += `**Total albums:** ${artistData.totalAlbums}  \n`;
    report += `**Split across ${artistData.genres.size} genres**\n\n`;

    let optionNum = 1;
    for (const [mainGenre, albums] of artistData.genres) {
      report += `### [${optionNum}] ${mainGenre} (${albums.length} albums)\n\n`;

      for (const album of albums) {
        const subgenre = album.subgenre ? ` → ${album.subgenre}` : '';
        const source = ` [${album.source}]`;
        report += `- **${album.album}**${subgenre}${source}\n`;

        if (album.reasoning) {
          report += `  > ${album.reasoning}\n`;
        }
      }

      report += '\n';
      optionNum++;
    }

    report += '**Recommendation:** Most albums (${Array.from(artistData.genres.entries()).sort((a,b) => b[1].length - a[1].length)[0][0]}) should be the correct genre.\n\n';
    report += '---\n\n';
  }

  return report;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: check-consistency <classification-file.json>');
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
    return;
  }

  console.log(`\n⚠️  Found ${inconsistent.length} artists with inconsistent genres\n`);

  // Display summary
  console.log('Top 20 most problematic artists:\n');
  inconsistent.slice(0, 20).forEach((artist, idx) => {
    const genreList = Array.from(artist.genres.keys()).join(', ');
    console.log(`${idx + 1}. ${artist.artist}`);
    console.log(`   ${artist.totalAlbums} albums across ${artist.genres.size} genres: ${genreList}`);
  });

  // Generate full report
  const report = generateReport(inconsistent);
  const reportPath = classificationPath.replace('.json', '-consistency-report.md');
  await fs.writeFile(reportPath, report);

  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
