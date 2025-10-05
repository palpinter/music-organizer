import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { scanDirectory, groupByAlbum, getAlbumMetadata } from '../../core/scanner';
import logger from '../../utils/logger';

export const analyzeCommand = new Command('analyze')
  .description('Analyze music library structure and metadata')
  .argument('<path>', 'Path to music library')
  .option('-o, --output <file>', 'Output file for analysis report (JSON)', 'analysis-report.json')
  .option('--no-metadata', 'Skip metadata extraction (faster scan)')
  .option('--non-recursive', 'Do not scan subdirectories')
  .action(async (libraryPath: string, options) => {
    try {
      logger.info(`Starting analysis of: ${libraryPath}`);

      // Validate path
      const absolutePath = path.resolve(libraryPath);
      if (!(await fs.pathExists(absolutePath))) {
        logger.error(`Path does not exist: ${absolutePath}`);
        process.exit(1);
      }

      const stat = await fs.stat(absolutePath);
      if (!stat.isDirectory()) {
        logger.error(`Path is not a directory: ${absolutePath}`);
        process.exit(1);
      }

      // Scan directory
      logger.info('Scanning directory for FLAC files...');
      const scanResult = await scanDirectory(absolutePath, {
        recursive: !options.nonRecursive,
        extractMetadata: options.metadata !== false,
      });

      logger.info(`Found ${scanResult.flacFiles.length} FLAC files`);

      if (scanResult.errors.length > 0) {
        logger.warn(`Encountered ${scanResult.errors.length} errors during scan`);
      }

      // Group by album
      const albumMap = groupByAlbum(scanResult.flacFiles);
      logger.info(`Organized into ${albumMap.size} albums`);

      // Generate statistics
      const genreCount = new Map<string, number>();
      const artistCount = new Map<string, number>();
      const yearCount = new Map<number, number>();

      for (const [, files] of albumMap) {
        const albumMetadata = getAlbumMetadata(files);

        if (albumMetadata.genre) {
          const count = genreCount.get(albumMetadata.genre) || 0;
          genreCount.set(albumMetadata.genre, count + 1);
        }

        if (albumMetadata.artist) {
          const count = artistCount.get(albumMetadata.artist) || 0;
          artistCount.set(albumMetadata.artist, count + 1);
        }

        if (albumMetadata.year) {
          const count = yearCount.get(albumMetadata.year) || 0;
          yearCount.set(albumMetadata.year, count + 1);
        }
      }

      // Create report
      const report = {
        timestamp: new Date().toISOString(),
        libraryPath: absolutePath,
        summary: {
          totalFiles: scanResult.totalFiles,
          flacFiles: scanResult.flacFiles.length,
          albums: albumMap.size,
          errors: scanResult.errors.length,
        },
        statistics: {
          byGenre: Object.fromEntries(
            Array.from(genreCount.entries()).sort((a, b) => b[1] - a[1])
          ),
          byArtist: Object.fromEntries(
            Array.from(artistCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 50) // Top 50
          ),
          byYear: Object.fromEntries(
            Array.from(yearCount.entries()).sort((a, b) => a[0] - b[0])
          ),
        },
        errors: scanResult.errors,
      };

      // Display summary
      console.log('\n=== Analysis Summary ===\n');
      console.log(`Total files:     ${report.summary.totalFiles}`);
      console.log(`FLAC files:      ${report.summary.flacFiles}`);
      console.log(`Albums:          ${report.summary.albums}`);
      console.log(`Errors:          ${report.summary.errors}`);

      if (genreCount.size > 0) {
        console.log('\n=== Top Genres ===\n');
        Array.from(genreCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([genre, count]) => {
            console.log(`  ${genre}: ${count} albums`);
          });
      }

      if (artistCount.size > 0) {
        console.log('\n=== Top Artists (by album count) ===\n');
        Array.from(artistCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([artist, count]) => {
            console.log(`  ${artist}: ${count} albums`);
          });
      }

      // Save report
      const outputPath = path.resolve(options.output);
      await fs.writeJson(outputPath, report, { spaces: 2 });
      logger.info(`Analysis report saved to: ${outputPath}`);

      console.log(`\nFull report saved to: ${outputPath}\n`);
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });
