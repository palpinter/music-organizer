import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import cliProgress from 'cli-progress';
import { scanDirectory } from '../../core/scanner';
import { extractMetadata } from '../../core/metadata';
import { updateFlacTags } from '../../utils/tag-writer';
import logger from '../../utils/logger';

interface ClassificationResult {
  artist: string;
  album: string;
  mainGenre: string;
  subgenre?: string;
  source: string;
  confidence: string;
}

interface ClassificationReport {
  timestamp: string;
  libraryPath: string;
  classifications: ClassificationResult[];
}

export const updateTagsCommand = new Command('update-tags')
  .description('Update FLAC file genre tags from classification results')
  .argument('<path>', 'Path to music library')
  .option('-i, --input <file>', 'Classification results JSON file', 'classifications.json')
  .option('--dry-run', 'Simulate tag updates without modifying files')
  .option('--force', 'Update genre tags even if they already exist')
  .action(async (libraryPath: string, options) => {
    try {
      logger.info(`Updating genre tags for: ${libraryPath}`);

      // Load classifications
      const classificationsPath = path.resolve(options.input);
      if (!(await fs.pathExists(classificationsPath))) {
        logger.error(`Classifications file does not exist: ${classificationsPath}`);
        process.exit(1);
      }

      const report: ClassificationReport = await fs.readJson(classificationsPath);
      logger.info(`Loaded ${report.classifications.length} classifications`);

      // Create lookup map: "artist||album" -> classification
      const classificationMap = new Map<string, ClassificationResult>();
      for (const classification of report.classifications) {
        const key = `${classification.artist}||${classification.album}`;
        classificationMap.set(key, classification);
      }

      // Scan directory
      logger.info('Scanning directory for FLAC files...');
      const scanResult = await scanDirectory(libraryPath);
      const files = scanResult.flacFiles.map(f => f.path);
      logger.info(`Found ${files.length} FLAC files`);

      const isDryRun = options.dryRun || false;
      const forceUpdate = options.force || false;

      if (isDryRun) {
        console.log('\n🔍 DRY RUN MODE - No tags will be modified\n');
      }

      // Progress bar
      const progressBar = new cliProgress.SingleBar({
        format: 'Processing |{bar}| {percentage}% | {value}/{total} files | {file}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      progressBar.start(files.length, 0, { file: '' });

      const stats = {
        processed: 0,
        updated: 0,
        skipped: 0,
        noClassification: 0,
        alreadyHasGenre: 0,
        failed: 0,
        errors: [] as Array<{ file: string; error: string }>
      };

      for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        const fileName = path.basename(filePath);

        progressBar.update(i, { file: fileName.substring(0, 50) });

        // Extract metadata
        const metadata = await extractMetadata(filePath);
        if (!metadata || !metadata.artist || !metadata.album) {
          stats.skipped++;
          continue;
        }

        // Find classification
        const key = `${metadata.artist}||${metadata.album}`;
        const classification = classificationMap.get(key);

        if (!classification) {
          stats.noClassification++;
          logger.debug(`No classification found for: ${metadata.artist} - ${metadata.album}`);
          continue;
        }

        // Check if already has genre tag
        if (!forceUpdate && metadata.genre && metadata.genre.trim().length > 0) {
          stats.alreadyHasGenre++;
          logger.debug(`Already has genre tag: ${filePath}`);
          continue;
        }

        stats.processed++;

        // Determine genre to write
        const genreToWrite = classification.mainGenre;

        if (isDryRun) {
          logger.debug(`[DRY RUN] Would update ${filePath} with genre: ${genreToWrite}`);
          stats.updated++;
        } else {
          // Update tag
          const result = await updateFlacTags(filePath, { genre: genreToWrite });

          if (result.success) {
            stats.updated++;
          } else {
            stats.failed++;
            stats.errors.push({
              file: filePath,
              error: result.error || 'Unknown error'
            });

            if (stats.failed > 10) {
              progressBar.stop();
              logger.error('Too many errors (>10). Stopping operation.');
              console.log('\n❌ Operation aborted due to excessive errors.\n');
              process.exit(1);
            }
          }
        }

        progressBar.update(i + 1);
      }

      progressBar.stop();

      // Display summary
      console.log('\n=== Tag Update Summary ===\n');
      console.log(`Total files:         ${files.length}`);
      console.log(`Processed:           ${stats.processed}`);
      console.log(`✅ Updated:           ${stats.updated}`);
      console.log(`⏭️  Skipped:           ${stats.skipped} (missing metadata)`);
      console.log(`📋 No classification: ${stats.noClassification}`);
      console.log(`✓  Already has genre: ${stats.alreadyHasGenre}`);

      if (stats.failed > 0) {
        console.log(`❌ Failed:            ${stats.failed}`);
      }

      if (stats.errors.length > 0) {
        console.log('\n=== Errors ===\n');
        stats.errors.slice(0, 10).forEach((err, idx) => {
          console.log(`${idx + 1}. ${err.file}`);
          console.log(`   Error: ${err.error}`);
        });

        if (stats.errors.length > 10) {
          console.log(`\n... and ${stats.errors.length - 10} more errors`);
        }
      }

      if (isDryRun) {
        console.log('\n🔍 DRY RUN completed - no tags were modified\n');
      } else if (stats.failed === 0) {
        console.log('\n✅ Tag update completed successfully!\n');
      } else {
        console.log('\n⚠️  Tag update completed with errors\n');
        process.exit(1);
      }

    } catch (error) {
      logger.error('Tag update failed:', error);
      process.exit(1);
    }
  });
