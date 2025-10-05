import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { scanDirectory, groupByAlbum, getAlbumMetadata } from '../../core/scanner';
import { generateTargetPath } from '../../core/path-generator';
import { detectConflicts, FileMove } from '../../core/conflict-detector';
import { getCache } from '../../classification/cache';
import logger from '../../utils/logger';

export const planCommand = new Command('plan')
  .description('Generate reorganization plan (dry-run preview)')
  .argument('<path>', 'Path to music library')
  .option('-o, --output <file>', 'Output file for reorganization plan (JSON)', 'reorganization-plan.json')
  .option('--target <path>', 'Target base directory for reorganized library', './reorganized')
  .option('--use-performer-folders', 'Use performer subfolders for classical music', true)
  .action(async (libraryPath: string, options) => {
    try {
      logger.info(`Generating reorganization plan for: ${libraryPath}`);

      // Validate path
      const absolutePath = path.resolve(libraryPath);
      if (!(await fs.pathExists(absolutePath))) {
        logger.error(`Path does not exist: ${absolutePath}`);
        process.exit(1);
      }

      const targetBasePath = path.resolve(options.target);

      // Load classifications from cache
      const cache = getCache();
      await cache.load();

      if (cache.size() === 0) {
        logger.warn('No classifications found in cache. Run "classify" command first.');
        process.exit(1);
      }

      logger.info(`Loaded ${cache.size()} classifications from cache`);

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

      // Generate file moves
      const fileMoves: FileMove[] = [];
      let classifiedFiles = 0;
      let unclassifiedFiles = 0;

      for (const [, files] of albumMap) {
        const albumMetadata = getAlbumMetadata(files);

        if (!albumMetadata.artist || !albumMetadata.album) {
          logger.debug(`Skipping album with incomplete metadata`);
          unclassifiedFiles += files.length;
          continue;
        }

        // Get classification from cache
        const classification = cache.get(
          albumMetadata.artist,
          albumMetadata.album,
          albumMetadata.year
        );

        if (!classification) {
          logger.debug(`No classification found for: ${albumMetadata.artist} - ${albumMetadata.album}`);
          unclassifiedFiles += files.length;
          continue;
        }

        // Generate target paths for each file
        for (const file of files) {
          if (!file.metadata) continue;

          try {
            const targetPath = generateTargetPath(
              file.metadata,
              classification,
              {
                basePath: targetBasePath,
                usePerformerFolders: options.usePerformerFolders
              }
            );

            fileMoves.push({
              sourcePath: file.path,
              targetPath: targetPath.fullPath,
              artist: file.metadata.artist,
              album: file.metadata.album,
              title: file.metadata.title
            });

            classifiedFiles++;
          } catch (error) {
            logger.warn(`Failed to generate path for ${file.path}:`, error);
            unclassifiedFiles++;
          }
        }
      }

      logger.info(`Generated paths for ${classifiedFiles}/${scanResult.flacFiles.length} files`);

      // Detect conflicts
      logger.info('Detecting conflicts...');
      const conflictResult = detectConflicts(fileMoves);

      // Generate directory structure preview
      const directories = new Set<string>();
      for (const move of fileMoves) {
        directories.add(path.dirname(move.targetPath));
      }

      const sortedDirs = Array.from(directories).sort();

      // Create plan
      const plan = {
        timestamp: new Date().toISOString(),
        sourceLibrary: absolutePath,
        targetLibrary: targetBasePath,
        summary: {
          totalFiles: scanResult.flacFiles.length,
          classifiedFiles,
          unclassifiedFiles,
          totalMoves: fileMoves.length,
          conflicts: conflictResult.conflicts.length,
          conflictingFiles: conflictResult.conflictingFiles
        },
        options: {
          usePerformerFolders: options.usePerformerFolders
        },
        directories: sortedDirs,
        fileMoves: fileMoves,
        conflicts: conflictResult.conflicts
      };

      // Display summary
      console.log('\n=== Reorganization Plan Summary ===\n');
      console.log(`Source:          ${absolutePath}`);
      console.log(`Target:          ${targetBasePath}`);
      console.log(`Total files:     ${plan.summary.totalFiles}`);
      console.log(`Classified:      ${plan.summary.classifiedFiles}`);
      console.log(`Unclassified:    ${plan.summary.unclassifiedFiles}`);
      console.log(`File moves:      ${plan.summary.totalMoves}`);
      console.log(`Directories:     ${sortedDirs.length}`);

      if (conflictResult.conflicts.length > 0) {
        console.log(`\n⚠️  Conflicts:     ${conflictResult.conflicts.length}`);
        console.log(`Conflicting files: ${conflictResult.conflictingFiles}`);

        console.log('\n=== Conflicts ===\n');
        conflictResult.conflicts.slice(0, 10).forEach((conflict, idx) => {
          console.log(`${idx + 1}. ${conflict.type}: ${conflict.suggestion}`);
          console.log(`   Files: ${conflict.files.slice(0, 3).join(', ')}`);
          if (conflict.files.length > 3) {
            console.log(`   ... and ${conflict.files.length - 3} more`);
          }
          console.log();
        });

        if (conflictResult.conflicts.length > 10) {
          console.log(`... and ${conflictResult.conflicts.length - 10} more conflicts`);
        }
      } else {
        console.log('\n✅ No conflicts detected');
      }

      // Show directory structure preview
      console.log('\n=== Directory Structure Preview (first 20) ===\n');
      sortedDirs.slice(0, 20).forEach(dir => {
        const relPath = path.relative(targetBasePath, dir);
        console.log(`  ${relPath}`);
      });

      if (sortedDirs.length > 20) {
        console.log(`  ... and ${sortedDirs.length - 20} more directories`);
      }

      // Show sample file moves
      console.log('\n=== Sample File Moves (first 5) ===\n');
      fileMoves.slice(0, 5).forEach(move => {
        const sourceRel = path.relative(absolutePath, move.sourcePath);
        const targetRel = path.relative(targetBasePath, move.targetPath);
        console.log(`  ${sourceRel}`);
        console.log(`  → ${targetRel}`);
        console.log();
      });

      // Save plan
      const outputPath = path.resolve(options.output);
      await fs.writeJson(outputPath, plan, { spaces: 2 });
      logger.info(`Reorganization plan saved to: ${outputPath}`);

      console.log(`\nFull plan saved to: ${outputPath}\n`);

      if (conflictResult.conflicts.length > 0) {
        console.log('⚠️  Please resolve conflicts before running "organize" command\n');
        process.exit(1);
      } else {
        console.log('✅ Plan is ready. Run "organize" command to execute.\n');
      }
    } catch (error) {
      logger.error('Plan generation failed:', error);
      process.exit(1);
    }
  });
