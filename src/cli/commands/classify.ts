import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import cliProgress from 'cli-progress';
import { scanDirectory, groupByAlbum, getAlbumMetadata } from '../../core/scanner';
import { classifyAlbumsBatch, AlbumInfo } from '../../classification/strategy';
import { getCache } from '../../classification/cache';
import logger from '../../utils/logger';

export const classifyCommand = new Command('classify')
  .description('Classify music library genres using multi-stage strategy')
  .argument('<path>', 'Path to music library')
  .option('-o, --output <file>', 'Output file for classification results (JSON)', 'classifications.json')
  .option('--skip-cache', 'Ignore cached classifications')
  .option('--stages <stages>', 'Classification stages to use (comma-separated: metadata,musicbrainz,discogs,ai)', 'metadata,musicbrainz')
  .action(async (libraryPath: string, options) => {
    try {
      logger.info(`Starting classification of: ${libraryPath}`);

      // Validate path
      const absolutePath = path.resolve(libraryPath);
      if (!(await fs.pathExists(absolutePath))) {
        logger.error(`Path does not exist: ${absolutePath}`);
        process.exit(1);
      }

      // Parse stages
      const stagesArray = options.stages.split(',').map((s: string) => s.trim());
      const useAllStages = stagesArray.includes('all');

      const stages = {
        flacMetadata: useAllStages || stagesArray.includes('metadata'),
        musicbrainz: useAllStages || stagesArray.includes('musicbrainz'),
        discogs: useAllStages || stagesArray.includes('discogs'),
        ai: useAllStages || stagesArray.includes('ai')
      };

      logger.info(`Enabled stages: ${stagesArray.join(', ')}`);

      // Load cache
      const cache = getCache();
      if (!options.skipCache) {
        await cache.load();
      }

      // Scan directory
      logger.info('Scanning directory for FLAC files...');
      const scanResult = await scanDirectory(absolutePath, {
        recursive: true,
        extractMetadata: true
      });

      logger.info(`Found ${scanResult.flacFiles.length} FLAC files`);

      // Group by album
      const albumMap = groupByAlbum(scanResult.flacFiles);
      logger.info(`Organized into ${albumMap.size} albums`);

      // Prepare album list for classification
      const albums: AlbumInfo[] = [];
      const albumTracks = new Map<string, string[]>(); // Store tracks per album

      for (const [, files] of albumMap) {
        const albumMetadata = getAlbumMetadata(files);

        if (albumMetadata.artist && albumMetadata.album) {
          const key = `${albumMetadata.artist}||${albumMetadata.album}`;

          // Extract track titles
          const trackTitles = files
            .filter(f => f.metadata?.title)
            .map(f => f.metadata!.title!);

          albumTracks.set(key, trackTitles);

          albums.push({
            artist: albumMetadata.artist,
            album: albumMetadata.album,
            year: albumMetadata.year,
            genre: albumMetadata.genre,
            tracks: trackTitles
          });
        }
      }

      logger.info(`Classifying ${albums.length} albums...`);

      // Progress bar
      const progressBar = new cliProgress.SingleBar({
        format: 'Classification |{bar}| {percentage}% | {value}/{total} albums | {album}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      progressBar.start(albums.length, 0, { album: '' });

      // Classify albums
      const results = await classifyAlbumsBatch(
        albums,
        {
          useCache: !options.skipCache,
          stages
        },
        (current, _total, album) => {
          progressBar.update(current, {
            album: `${album.artist} - ${album.album}`.substring(0, 50)
          });
        }
      );

      progressBar.stop();

      // Save cache
      if (!options.skipCache) {
        await cache.save();
      }

      // Generate statistics
      const stats = {
        total: albums.length,
        classified: results.size,
        unclassified: albums.length - results.size,
        bySource: {
          flacMetadata: 0,
          musicbrainz: 0,
          discogs: 0,
          ai: 0,
          manual: 0
        },
        byConfidence: {
          high: 0,
          medium: 0,
          low: 0
        },
        byMainGenre: {} as Record<string, number>
      };

      for (const result of results.values()) {
        // Map source names to stats keys
        const sourceKey = result.source === 'flac-metadata' ? 'flacMetadata' : result.source;
        if (sourceKey in stats.bySource) {
          stats.bySource[sourceKey as keyof typeof stats.bySource]++;
        }
        stats.byConfidence[result.confidence]++;

        if (result.mainGenre) {
          stats.byMainGenre[result.mainGenre] = (stats.byMainGenre[result.mainGenre] || 0) + 1;
        }
      }

      // Convert results to JSON-friendly format
      const classificationsArray = Array.from(results.entries()).map(([key, result]) => {
        const [artist, album] = key.split('||');
        return {
          artist,
          album,
          mainGenre: result.mainGenre,
          subgenre: result.subgenre,
          source: result.source,
          confidence: result.confidence,
          reasoning: result.reasoning
        };
      });

      const report = {
        timestamp: new Date().toISOString(),
        libraryPath: absolutePath,
        statistics: stats,
        classifications: classificationsArray
      };

      // Display summary
      console.log('\n=== Classification Summary ===\n');
      console.log(`Total albums:    ${stats.total}`);
      console.log(`Classified:      ${stats.classified} (${((stats.classified / stats.total) * 100).toFixed(1)}%)`);
      console.log(`Unclassified:    ${stats.unclassified}`);

      console.log('\n=== By Source ===\n');
      console.log(`  Metadata:      ${stats.bySource.flacMetadata}`);
      console.log(`  MusicBrainz:   ${stats.bySource.musicbrainz}`);
      console.log(`  Discogs:       ${stats.bySource.discogs}`);
      console.log(`  AI:            ${stats.bySource.ai}`);

      console.log('\n=== By Confidence ===\n');
      console.log(`  High:          ${stats.byConfidence.high}`);
      console.log(`  Medium:        ${stats.byConfidence.medium}`);
      console.log(`  Low:           ${stats.byConfidence.low}`);

      if (Object.keys(stats.byMainGenre).length > 0) {
        console.log('\n=== By Main Genre ===\n');
        Object.entries(stats.byMainGenre)
          .sort((a, b) => b[1] - a[1])
          .forEach(([genre, count]) => {
            console.log(`  ${genre}: ${count} albums`);
          });
      }

      // Save report
      const outputPath = path.resolve(options.output);
      await fs.writeJson(outputPath, report, { spaces: 2 });
      logger.info(`Classification report saved to: ${outputPath}`);

      console.log(`\nFull report saved to: ${outputPath}\n`);
    } catch (error) {
      logger.error('Classification failed:', error);
      process.exit(1);
    }
  });
