#!/usr/bin/env node
/**
 * Fix misclassified Classical works in classifications.json
 */

const fs = require('fs-extra');
const path = require('path');

const CLASSICAL_COMPOSERS = [
  'Corelli', 'Lully', 'Bizet', 'Wagner', 'Gounod', 'Monteverdi',
  'Rameau', 'Pergolesi', 'Bach', 'Mozart', 'Handel', 'Vivaldi',
  'Beethoven', 'Brahms', 'Schubert', 'Schumann', 'Mahler',
  'Verdi', 'Puccini', 'Rossini', 'Donizetti', 'Bellini',
  'Gluck', 'Purcell', 'Charpentier', 'Couperin', 'Telemann',
  'Haydn', 'Debussy', 'Ravel', 'Stravinsky', 'Prokofiev',
  'Shostakovich', 'Tchaikovsky', 'Rachmaninoff', 'Chopin', 'Liszt'
];

async function fixClassifications() {
  const filePath = path.join(process.env.HOME, 'zenetar-classifications.json');
  console.log(`Loading: ${filePath}`);

  const data = await fs.readJson(filePath);
  let fixedCount = 0;

  for (const item of data.classifications) {
    // Skip if already Classical
    if (item.mainGenre === 'Classical') continue;

    // Check if album title starts with a classical composer name followed by colon
    for (const composer of CLASSICAL_COMPOSERS) {
      const pattern = new RegExp(`^${composer}\\s*:`, 'i');
      if (pattern.test(item.album)) {
        console.log(`Fixing: ${item.mainGenre} → Classical | ${item.artist} - ${item.album}`);
        item.mainGenre = 'Classical';
        item.source = 'manual';
        fixedCount++;
        break;
      }
    }
  }

  console.log(`\nFixed ${fixedCount} classifications`);

  // Save backup
  const backupPath = filePath.replace('.json', '-backup.json');
  await fs.copy(filePath, backupPath);
  console.log(`Backup saved to: ${backupPath}`);

  // Save updated file
  await fs.writeJson(filePath, data, { spaces: 2 });
  console.log(`Updated file saved to: ${filePath}`);
}

fixClassifications().catch(console.error);
