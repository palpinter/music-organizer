# Music Organizer - Development Guide

## Project Status

**Phase 1 - Core Foundation: COMPLETED** ✅
**Phase 2 - Genre Classification Pipeline: COMPLETED** ✅
**Phase 3 - Reorganization Planning: COMPLETED** ✅

### What's Been Implemented

#### Phase 1: Core Foundation
1. ✅ Project setup (package.json, tsconfig.json)
2. ✅ TypeScript interfaces and types
3. ✅ Logger utility (Winston-based)
4. ✅ FLAC metadata reader
5. ✅ Directory scanner
6. ✅ Basic CLI with `analyze` command

#### Phase 2: Genre Classification
1. ✅ Genre definitions (150+ keyword mappings)
2. ✅ Genre mapper (raw genre → main/subgenre hierarchy)
3. ✅ Classification cache system (persistent)
4. ✅ MusicBrainz API client (rate limited 1 req/sec)
5. ✅ Discogs API client (rate limited 60 req/min)
6. ✅ Claude AI batch classifier
7. ✅ Multi-stage strategy orchestrator
8. ✅ `classify` CLI command with progress bar

#### Phase 3: Reorganization Planning
1. ✅ Path sanitization utilities
2. ✅ Modern music path generator (Genre/Subgenre/Artist/Year - Album/)
3. ✅ Classical music path generator (Classical/Composer/Category/Work/)
4. ✅ Classical composer name parser (Lastname, Firstname format)
5. ✅ Performer folder generation (Conductor - Orchestra)
6. ✅ Conflict detection (duplicate paths, missing metadata)
7. ✅ `plan` CLI command with dry-run preview

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
node dist/index.js analyze ~/Zenék/Alternative --output test-report.json

# Quick scan without metadata (faster)
node dist/index.js analyze ~/Zenék --no-metadata
```

#### `classify`

Classify albums using multi-stage strategy.

```bash
node dist/index.js classify /path/to/library

# Options:
# -o, --output <file>      Output file (default: classifications.json)
# --skip-cache             Ignore cached classifications
# --stages <stages>        Comma-separated: metadata,musicbrainz,discogs,ai
#                          (default: "metadata,musicbrainz")
```

**Output:**
- Progress bar during classification
- Console summary with statistics
- JSON report with detailed classifications

**Examples:**

```bash
# Classify using metadata + MusicBrainz (default)
node dist/index.js classify ~/Zenék

# Use all stages (requires API keys)
export ANTHROPIC_API_KEY=sk-ant-...
export DISCOGS_API_KEY=your-key
node dist/index.js classify ~/Zenék --stages metadata,musicbrainz,discogs,ai

# Only AI classification (for testing)
node dist/index.js classify ~/Zenék/Alternative --stages ai
```

**API Keys (Optional):**

Create `.env` file in `~/.config/music-organizer/.env`:

```bash
# Anthropic Claude API (for AI classification)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Discogs API (for better coverage)
DISCOGS_API_KEY=your-key
DISCOGS_API_SECRET=your-secret
```

#### `plan`

Generate reorganization plan (dry-run preview).

```bash
node dist/index.js plan /path/to/library

# Options:
# -o, --output <file>          Output file (default: reorganization-plan.json)
# --target <path>              Target base directory (default: ./reorganized)
# --use-performer-folders      Use performer subfolders for classical (default: true)
```

**Output:**
- Console summary with statistics
- Directory structure preview
- Sample file moves
- Conflict detection
- JSON plan file

**Examples:**

```bash
# Generate plan with default settings
node dist/index.js plan ~/Zenék --target ~/Zenék-Reorganized

# Preview only, custom output
node dist/index.js plan ~/Zenék --target /tmp/test --output my-plan.json
```

## What Works Now

### Analyze Command

Scans directories and generates reports:

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

### Classify Command

Multi-stage genre classification:

1. **Stage 1 - FLAC Metadata**: Extract and map genre from file tags
2. **Stage 2 - MusicBrainz**: Free API lookup with tag-based classification
3. **Stage 3 - Discogs**: Fallback API (requires API key)
4. **Stage 4 - Claude AI**: Intelligent batch classification for difficult cases
5. **Caching**: Persistent cache to avoid redundant API calls
6. **Progress tracking**: Real-time progress bar
7. **Statistics**: Classification success rate, source breakdown, confidence levels

## Next Steps (Phase 4)

To continue development:

1. **Implement `organize` command**:
   - Execute file reorganization from plan
   - Copy/move modes
   - Multi-disc handling
   - Backup functionality
   - Progress bar with ETA
   - File integrity verification (checksums)
   - Resume capability after interruption

2. **Enhanced Classical Music Support**:
   - Catalog number parsing (RV, K., BWV, Op., etc.)
   - Work category auto-detection (Symphony, Concerto, etc.)
   - Multiple recordings grouping (same work, different performers)
   - Better performer extraction from tags

3. **Manual Review Interface**:
   - CLI tool to review low-confidence classifications
   - Edit classifications interactively
   - Save corrections back to cache
   - Flag albums for manual inspection

4. **Implement `verify` command**:
   - Verify reorganized library integrity
   - Compare source/target checksums
   - Report missing files
   - Validate directory structure

5. **Configuration System**:
   - Load from `~/.config/music-organizer/config.json`
   - Customizable genre mappings
   - Stage priorities
   - Path templates

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
