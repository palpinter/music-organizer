#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeCommand } from './cli/commands/analyze';

const program = new Command();

program
  .name('music-organizer')
  .description('CLI tool for organizing FLAC music library with intelligent genre classification')
  .version('0.1.0');

// Add commands
program.addCommand(analyzeCommand);

// TODO: Add more commands as they are implemented
// program.addCommand(classifyCommand);
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
