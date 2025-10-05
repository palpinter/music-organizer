import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import cliProgress from 'cli-progress';
import { copyFile, moveFile, calculateTotalSize, formatBytes } from '../../utils/file-operations';
import { createBackupManifest, generateBackupPath, BackupManifest } from '../../utils/backup';
import logger from '../../utils/logger';

interface ReorganizationPlan {
  timestamp: string;
  sourceLibrary: string;
  targetLibrary: string;
  summary: {
    totalFiles: number;
    classifiedFiles: number;
    unclassifiedFiles: number;
    totalMoves: number;
    conflicts: number;
    conflictingFiles: number;
  };
  fileMoves: Array<{
    sourcePath: string;
    targetPath: string;
    artist?: string;
    album?: string;
    title?: string;
  }>;
  conflicts: any[];
}

export const organizeCommand = new Command('organize')
  .description('Execute library reorganization from plan')
  .argument('<plan>', 'Path to reorganization plan JSON file')
  .option('--mode <mode>', 'Operation mode: copy or move', 'copy')
  .option('--no-verify', 'Skip file integrity verification (faster but risky)')
  .option('--backup <dir>', 'Create backup manifest in directory')
  .option('--dry-run', 'Simulate operations without actual file changes')
  .action(async (planFile: string, options) => {
    try {
      logger.info(`Loading reorganization plan from: ${planFile}`);

      // Load plan
      const planPath = path.resolve(planFile);
      if (!(await fs.pathExists(planPath))) {
        logger.error(`Plan file does not exist: ${planPath}`);
        process.exit(1);
      }

      const plan: ReorganizationPlan = await fs.readJson(planPath);

      // Validate plan
      if (plan.summary.conflicts > 0) {
        logger.error(`Plan has ${plan.summary.conflicts} conflicts. Please resolve them first.`);
        console.log('\nRun "plan" command again to regenerate conflict-free plan.\n');
        process.exit(1);
      }

      const mode = options.mode === 'move' ? 'move' : 'copy';
      const isDryRun = options.dryRun || false;
      const verifyIntegrity = options.verify !== false;

      logger.info(`Mode: ${mode}`);
      logger.info(`Verify integrity: ${verifyIntegrity}`);
      logger.info(`Dry run: ${isDryRun}`);

      // Calculate total size
      console.log('\nCalculating total size...');
      const sourcePaths = plan.fileMoves.map(m => m.sourcePath);
      const totalSize = await calculateTotalSize(sourcePaths);

      console.log(`Total size: ${formatBytes(totalSize)}`);
      console.log(`Total files: ${plan.fileMoves.length}`);
      console.log();

      if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
      }

      // Create backup manifest if requested
      let backupManifestPath: string | undefined;
      if (options.backup && !isDryRun) {
        const backupDir = generateBackupPath(path.resolve(options.backup));
        const manifest: BackupManifest = {
          timestamp: new Date().toISOString(),
          sourceLibrary: plan.sourceLibrary,
          targetLibrary: plan.targetLibrary,
          files: plan.fileMoves.map(m => ({
            sourcePath: m.sourcePath,
            targetPath: m.targetPath
          }))
        };

        backupManifestPath = await createBackupManifest(backupDir, manifest);
        console.log(`📋 Backup manifest created: ${backupManifestPath}\n`);
      }

      // Progress bar
      const progressBar = new cliProgress.SingleBar({
        format: `${mode === 'copy' ? 'Copying' : 'Moving'} |{bar}| {percentage}% | {value}/{total} files | {eta_formatted} remaining | {file}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      progressBar.start(plan.fileMoves.length, 0, {
        file: '',
        eta_formatted: 'calculating...'
      });

      // Execute file operations
      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [] as Array<{ file: string; error: string }>
      };

      let processedBytes = 0;
      const startTime = Date.now();

      for (let i = 0; i < plan.fileMoves.length; i++) {
        const move = plan.fileMoves[i];
        const fileName = path.basename(move.sourcePath);

        progressBar.update(i, {
          file: fileName.substring(0, 50)
        });

        if (isDryRun) {
          // Dry run - just log
          logger.debug(`[DRY RUN] Would ${mode}: ${move.sourcePath} -> ${move.targetPath}`);
          results.success++;
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate work
        } else {
          // Check if source exists
          if (!(await fs.pathExists(move.sourcePath))) {
            logger.warn(`Source file not found: ${move.sourcePath}`);
            results.skipped++;
            continue;
          }

          // Execute operation
          const result = mode === 'copy'
            ? await copyFile(move.sourcePath, move.targetPath, { verify: verifyIntegrity })
            : await moveFile(move.sourcePath, move.targetPath, { verify: verifyIntegrity });

          if (result.success) {
            results.success++;

            // Update processed bytes for ETA calculation
            try {
              const stats = await fs.stat(move.sourcePath);
              processedBytes += stats.size;
            } catch (error) {
              // Ignore stat errors
            }
          } else {
            results.failed++;
            results.errors.push({
              file: move.sourcePath,
              error: result.error || 'Unknown error'
            });

            if (results.failed > 10) {
              progressBar.stop();
              logger.error('Too many errors (>10). Stopping operation.');
              console.log('\n❌ Operation aborted due to excessive errors.\n');
              process.exit(1);
            }
          }
        }

        // Update ETA
        const elapsed = Date.now() - startTime;
        const remaining = plan.fileMoves.length - i - 1;
        const avgTime = elapsed / (i + 1);
        const etaMs = avgTime * remaining;
        const etaSec = Math.ceil(etaMs / 1000);
        const etaMin = Math.floor(etaSec / 60);
        const etaFormatted = etaMin > 0
          ? `${etaMin}m ${etaSec % 60}s`
          : `${etaSec}s`;

        progressBar.update(i + 1, {
          eta_formatted: etaFormatted
        });
      }

      progressBar.stop();

      // Display summary
      const elapsed = Date.now() - startTime;
      const elapsedSec = Math.floor(elapsed / 1000);
      const elapsedMin = Math.floor(elapsedSec / 60);

      console.log('\n=== Reorganization Summary ===\n');
      console.log(`Mode:         ${mode}`);
      console.log(`Total files:  ${plan.fileMoves.length}`);
      console.log(`✅ Success:    ${results.success}`);
      if (results.skipped > 0) {
        console.log(`⏭️  Skipped:    ${results.skipped}`);
      }
      if (results.failed > 0) {
        console.log(`❌ Failed:     ${results.failed}`);
      }
      console.log(`Time:         ${elapsedMin}m ${elapsedSec % 60}s`);

      if (results.errors.length > 0) {
        console.log('\n=== Errors ===\n');
        results.errors.slice(0, 10).forEach((err, idx) => {
          console.log(`${idx + 1}. ${err.file}`);
          console.log(`   Error: ${err.error}`);
        });

        if (results.errors.length > 10) {
          console.log(`\n... and ${results.errors.length - 10} more errors`);
        }
      }

      if (isDryRun) {
        console.log('\n🔍 DRY RUN completed - no files were modified\n');
      } else if (results.failed === 0) {
        console.log('\n✅ Reorganization completed successfully!\n');
      } else {
        console.log('\n⚠️  Reorganization completed with errors\n');
        process.exit(1);
      }

    } catch (error) {
      logger.error('Reorganization failed:', error);
      process.exit(1);
    }
  });
