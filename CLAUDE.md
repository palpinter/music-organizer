# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js/TypeScript CLI tool that reorganizes a large FLAC music library (~3,000 albums) from an inconsistent structure into a well-organized, genre-specific hierarchy. The tool uses a hybrid multi-stage classification strategy combining metadata extraction, public APIs (MusicBrainz, Discogs), and Claude AI for intelligent genre classification.

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js (latest LTS)
- **Package Manager**: npm or pnpm
- **Key Dependencies**:
  - `music-metadata` - FLAC metadata extraction
  - `@anthropic-ai/sdk` - Claude API client
  - `musicbrainz-api` - MusicBrainz integration
  - `disconnect` - Discogs API client
  - `commander` or `yargs` - CLI framework
  - `winston` - Logging
  - `bottleneck` - Rate limiting
  - `fs-extra` - Enhanced file operations

## Build and Development Commands

This project is in the planning stage. Once implemented, the expected commands will be:

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Link for global use (development)
npm link
```

## Core Architecture

### Directory Structure

```
src/
├── cli/              # CLI commands (analyze, classify, plan, organize, verify)
├── core/             # Core logic (scanner, metadata, classifier, organizer)
├── classification/   # Multi-stage classification system
│   ├── strategy.ts           # Orchestrator
│   ├── flac-classifier.ts    # Stage 1: Metadata
│   ├── musicbrainz.ts        # Stage 2: MusicBrainz API
│   ├── discogs.ts            # Stage 3: Discogs API
│   ├── ai-classifier.ts      # Stage 4: Claude AI
│   └── manual-review.ts      # Stage 5: Manual review
├── classical/        # Classical music specific logic
│   ├── composer.ts           # Composer name parsing
│   ├── catalog.ts            # Catalog number parsing (RV, K., BWV, etc.)
│   ├── performer.ts          # Performer detection & naming
│   └── multiple-recordings.ts # Group recordings by work
├── modern/           # Modern music logic (genre mapping)
└── utils/            # File ops, logging, reporting, rate limiting
```

### Classification Pipeline (Hybrid Multi-Stage)

The system uses a waterfall approach for genre classification:

1. **Stage 1 - FLAC Metadata** (~50% coverage): Extract genre from Vorbis tags
2. **Stage 2 - MusicBrainz API** (~35% additional): Free API, 1 req/sec rate limit
3. **Stage 3 - Discogs API** (~10% additional): Free with API key, 60 req/min
4. **Stage 4 - Claude AI Batch** (~5% remaining): Process 20-50 albums per batch
5. **Stage 5 - Manual Review**: Flag low-confidence results for user review

**Expected costs for 3,000 album library**: $0.40-0.80 (only AI portion)

### Genre Hierarchy System

Modern music uses a two-level hierarchical structure:

- **Main Genres**: Rock & Alternative, Electronic & Dance, Urban, Jazz & Blues, World & Folk, Pop, Classical, Soundtracks
- **Subgenres**: Alternative, Punk, Metal, House, Techno, Hip-Hop, etc.

Path format: `/Main Genre/Subgenre/Artist/Year - Album Title/`

Classical music uses composer-centric structure:
`/Classical/Composer, FirstName/Work Category/Work Title - Catalog Number/`

### Classical Music: Multiple Recordings

Classical works often exist in multiple recordings by different performers. The system:
- Detects multiple recordings of the same work (by catalog number)
- Extracts performer info from CONDUCTOR, ORCHESTRA, ENSEMBLE, SOLOIST tags
- Creates performer subfolders: `Performer/Ensemble (Year)/`
- Example: `/Classical/Vivaldi, Antonio/Concertos/The Four Seasons - RV 269-293/I Musici (1959)/`

### Key TypeScript Interfaces

```typescript
type AlbumType = 'regular' | 'best-of' | 'compilation' | 'soundtrack';
type MusicGenre = 'classical' | 'modern';
type ClassificationSource = 'flac-metadata' | 'musicbrainz' | 'discogs' | 'ai' | 'manual';
type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ClassificationResult {
  mainGenre?: MainGenre;
  subgenre?: string;
  source: ClassificationSource;
  confidence: ConfidenceLevel;
  timestamp: Date;
}

interface MusicFile {
  currentPath: string;
  metadata: { /* artist, album, year, genre, composer, conductor, etc */ };
  classification: { /* musicGenre, mainGenre, subgenre, albumType */ };
  performer?: { /* Classical: conductor, orchestra, ensemble, soloist */ };
  targetPath: string;
}
```

## Important Implementation Guidelines

### API Integration

- **MusicBrainz**: No API key required, strict 1 req/sec rate limit, use `bottleneck` for throttling
- **Discogs**: Requires API key in `.env`, 60 req/min unauthenticated (240 with auth)
- **Claude API**: Use `claude-sonnet-4-5-20250929` model, batch 20-50 albums per request
- **Rate Limiting**: Use exponential backoff, respect limits strictly to avoid bans
- **Caching**: Cache ALL API responses to `.genre-cache.json` to avoid redundant calls

### NAS Optimization (Critical)

The target library is on NAS storage. Optimize for network I/O:
- Read metadata once, cache aggressively
- Batch file operations (50-100 albums per batch)
- Use local staging for analysis phase
- Implement retry logic for network failures (3 retries, exponential backoff)
- Save progress every 100 albums for resume capability
- Expected processing time for 3,000 albums: 3-5 hours

### Safety Features

- **Dry-run mode**: Preview all changes before execution
- **Copy mode**: Default to copy instead of move to preserve originals
- **Backup**: Always create backups before reorganization
- **File integrity**: Verify checksums before/after network transfers
- **Conflict detection**: Handle duplicate paths gracefully
- **Rollback**: Keep operation log for undo capability

### Configuration

API keys stored in `~/.config/music-organizer/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
DISCOGS_API_KEY=...
DISCOGS_API_SECRET=...
MUSICBRAINZ_APP_NAME=music-organizer
```

Genre classification config in `~/.config/music-organizer/config.json` (see PROMPT.md for full schema)

## Testing Strategy

- Unit tests for parsers (composer names, catalog numbers, genre mapping)
- Classical music: Test performer detection, multiple recordings, catalog parsing
- Genre classification: Test all stages, fallback chain, confidence scoring
- API integration: Mock responses, test rate limiting, caching
- NAS operations: Test network resilience, integrity verification

## Command-Line Interface

```bash
# Analyze current structure
music-organizer analyze /path/to/library --output report.json

# Classify genres (multi-stage hybrid)
music-organizer classify /path/to/library --stages=all --output classifications.json

# Preview reorganization
music-organizer plan /path/to/library --dry-run

# Execute reorganization
music-organizer organize /path/to/library --mode=copy --backup-dir=/path/to/backup

# Verify integrity
music-organizer verify /path/to/library

# Manual review interface
music-organizer review manual-review.json
```

## Development Priorities

1. **Phase 1**: Core foundation (metadata reading, directory scanning, genre mapping)
2. **Phase 2**: Classification pipeline (metadata → MusicBrainz → Discogs)
3. **Phase 3**: AI integration (Claude API batch classification)
4. **Phase 4**: Review & organization (manual review, file reorganization)
5. **Phase 5**: Testing & polish (NAS optimization, comprehensive testing)

## Key Design Principles

- **Thoroughness over speed**: Measure twice, cut once
- **Data safety**: Zero data loss tolerance, always use copy mode first
- **Progressive enhancement**: Each classification stage improves on previous
- **User control**: Manual review for edge cases, clear reporting
- **Cost efficiency**: Minimize AI usage through free API layers first

## Common Development Tasks

When adding new genre mappings:
1. Update `src/modern/genre-definitions.ts` with new subgenre mapping
2. Add to main genre category in hierarchy
3. Update tests in `tests/classification/genre-mapper.test.ts`

When adding new classical catalog formats:
1. Update regex patterns in `src/classical/catalog.ts`
2. Add test cases for the new format (e.g., D. for Schubert, Hob. for Haydn)

When modifying AI prompts:
1. Edit prompt template in `src/classification/ai-classifier.ts`
2. Update expected token counts for cost estimation
3. Test with sample batch to verify JSON parsing works

## Additional Resources

- **Full specification**: See `PROMPT.md` for complete technical requirements
- **Installation guide**: See `INSTALL.md` for Arch Linux setup instructions
- **Genre hierarchy**: Defined in PROMPT.md lines 55-102
- **Classical structure**: Multiple recordings explained in PROMPT.md lines 235-295
- **API integration**: Details in PROMPT.md lines 899-1098
