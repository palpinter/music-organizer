#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { Command } from 'commander';

// Load .env from config directory
const configDir = path.join(os.homedir(), '.config', 'music-organizer');
dotenv.config({ path: path.join(configDir, '.env') });
import { analyzeCommand } from './cli/commands/analyze';
import { classifyCommand } from './cli/commands/classify';

const program = new Command();

program
  .name('music-organizer')
  .description('CLI tool for organizing FLAC music library with intelligent genre classification')
  .version('0.1.0');

// Add commands
program.addCommand(analyzeCommand);
program.addCommand(classifyCommand);

// TODO: Add more commands as they are implemented
// program.addCommand(planCommand);
// program.addCommand(organizeCommand);
// program.addCommand(verifyCommand);
// program.addCommand(reviewCommand);

// Parse arguments
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
