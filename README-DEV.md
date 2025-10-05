# Music Organizer - Development Guide

## Project Status

**Phase 1 - Core Foundation: COMPLETED** ✅

### What's Been Implemented

1. ✅ Project setup (package.json, tsconfig.json)
2. ✅ TypeScript interfaces and types
3. ✅ Logger utility (Winston-based)
4. ✅ FLAC metadata reader
5. ✅ Directory scanner
6. ✅ Basic CLI with `analyze` command

## Development

### Build

```bash
npm run build
```

### Run (Development)

```bash
# Using ts-node (no build required)
npm run dev -- analyze /path/to/music

# Using compiled JavaScript
node dist/index.js analyze /path/to/music
```

### Available Commands

#### `analyze`

Scans a music library and generates a report.

```bash
node dist/index.js analyze /path/to/library

# Options:
# -o, --output <file>     Output file (default: analysis-report.json)
# --no-metadata           Skip metadata extraction (faster)
# --non-recursive         Don't scan subdirectories
```

**Output:**
- Console summary with statistics
- JSON report file with detailed analysis

**Example:**

```bash
# Analyze a small test directory
node dist/index.js analyze ~/Music/Test --output test-report.json

# Quick scan without metadata (faster)
node dist/index.js analyze ~/Music --no-metadata
```

## What Works Now

The current implementation can:

1. **Scan directories** recursively for FLAC files
2. **Extract metadata** from FLAC files:
   - Basic: title, artist, album, year, genre, track number
   - Classical-specific: conductor, orchestra, ensemble, soloist, catalog number
3. **Group files** by album (based on directory)
4. **Generate statistics**:
   - Total files and albums
   - Genre distribution
   - Artist counts
   - Year distribution
5. **Export report** to JSON

## Next Steps (Phase 2)

To continue development:

1. **Genre Classification Pipeline**:
   - Stage 1: FLAC metadata genre extraction ✅ (partially done)
   - Stage 2: MusicBrainz API integration
   - Stage 3: Discogs API integration
   - Stage 4: AI classification (Claude API)
   - Stage 5: Manual review queue

2. **Implement `classify` command**:
   ```bash
   music-organizer classify /path/to/library --stages=all
   ```

3. **Configuration system**:
   - Load from `~/.config/music-organizer/config.json`
   - API key management (`.env` file)
   - Genre mapping rules

4. **Genre mapper module**:
   - Map raw genres to hierarchy (main genre + subgenre)
   - Handle unknown genres
   - Confidence scoring

## Testing

Currently no tests implemented. To add tests:

```bash
npm test
```

Create test files in `tests/` directory.

## Logs

Logs are written to:
- `~/.local/share/music-organizer/combined.log` (all logs)
- `~/.local/share/music-organizer/error.log` (errors only)
- Console (colored output)

## Project Structure

```
src/
├── cli/
│   └── commands/
│       └── analyze.ts       # Analyze command implementation
├── core/
│   ├── metadata.ts          # FLAC metadata extraction
│   └── scanner.ts           # Directory scanning
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── logger.ts            # Winston logger
└── index.ts                 # CLI entry point

dist/                        # Compiled JavaScript (after build)
```

## Notes

- The project currently only implements the **analyze** command
- Classification, planning, organization, and verification commands are **not yet implemented**
- All type definitions are in place for future implementation
- The codebase follows the architecture outlined in `PROMPT.md`
