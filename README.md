# 🎵 Music Organizer

A powerful Node.js/TypeScript CLI tool for organizing large FLAC music libraries with intelligent AI-powered genre classification.

Transform your messy music collection into a beautifully organized, genre-hierarchical library with minimal effort.

## ✨ Features

### Core Functionality
- 📊 **Intelligent Multi-Stage Classification**
  - FLAC metadata extraction
  - MusicBrainz API integration
  - Discogs API fallback
  - Claude AI for difficult cases (95%+ accuracy)
  - Persistent caching to minimize API costs

- 🎭 **Dual Music System Support**
  - **Modern Music**: Hierarchical genre structure (Main Genre → Subgenre → Artist)
  - **Classical Music**: Composer-centric organization with work categories

- 🏷️ **FLAC Tag Writing** ✨ NEW
  - Write genre tags back to FLAC files
  - Intelligent genre selection (Opera for classical, Jazz for modern)
  - Safe with dry-run mode

- 📁 **Smart Path Generation**
  - Cross-platform compatible sanitization
  - Readable filenames (`Bizet: Carmen` → `Bizet - Carmen`)
  - Multi-disc album support
  - Compilation and soundtrack detection

- 🔄 **Incremental Updates** ✨ NEW
  - Add new albums to existing organized libraries
  - Skip existing files automatically
  - Perfect for continuous library growth

- 🛡️ **Safety First**
  - Dry-run mode for all operations
  - MD5 checksum verification
  - Backup manifest generation
  - Copy mode (non-destructive)
  - Comprehensive error handling

- 🚀 **NAS Optimized**
  - Network-aware operations
  - Batch processing
  - Progress tracking with ETA
  - Resume capability

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Workflow Examples](#workflow-examples)
- [Configuration](#configuration)
- [Genre Hierarchy](#genre-hierarchy)
- [Classical Music](#classical-music)
- [API Keys](#api-keys)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **pnpm**
- **metaflac** (from `flac` package) - For tag writing
  ```bash
  # Arch Linux
  sudo pacman -S flac

  # Debian/Ubuntu
  sudo apt install flac

  # macOS
  brew install flac
  ```

## 📦 Installation

### Option 1: Global Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/music-organizer.git
cd music-organizer

# Install dependencies
npm install

# Build
npm run build

# Link globally
npm config set prefix ~/.local
npm link

# Verify installation
music-organizer --version
```

### Option 2: NPM Package (Future)

```bash
npm install -g music-organizer
```

## 🚀 Quick Start

### Basic Workflow

```bash
# 1. Analyze your library
music-organizer analyze ~/Music -o analysis.json

# 2. Classify genres using AI
music-organizer classify ~/Music --stages all -o classifications.json

# 3. Update FLAC genre tags (optional)
music-organizer update-tags ~/Music

# 4. Generate reorganization plan
music-organizer plan ~/Music --target ~/Music-Organized -o plan.json

# 5. Preview changes
music-organizer organize plan.json --dry-run

# 6. Execute reorganization
music-organizer organize plan.json --mode copy --backup ~/Music-Backup
```

### API Keys Setup

Create `~/.config/music-organizer/.env`:

```bash
# Required for AI classification
ANTHROPIC_API_KEY=your_claude_api_key_here

# Optional: For Discogs integration
DISCOGS_API_KEY=your_discogs_key_here
DISCOGS_API_SECRET=your_discogs_secret_here

# Optional: MusicBrainz contact (recommended)
MUSICBRAINZ_APP_NAME=music-organizer
MUSICBRAINZ_APP_VERSION=1.0.0
MUSICBRAINZ_CONTACT=your@email.com
```

Get API keys:
- **Claude API**: https://console.anthropic.com/
- **Discogs API**: https://www.discogs.com/settings/developers

## 📖 Commands

### `analyze`

Scan and analyze library structure.

```bash
music-organizer analyze <path> [options]

Options:
  -o, --output <file>   Output file (default: "analysis-report.json")
  --no-metadata         Skip metadata extraction
  --non-recursive       Don't scan subdirectories
```

**Example:**
```bash
music-organizer analyze ~/Music -o analysis.json
```

### `classify`

Classify albums using multi-stage strategy.

```bash
music-organizer classify <path> [options]

Options:
  -o, --output <file>           Output file (default: "classifications.json")
  --skip-cache                  Ignore cached classifications
  --stages <stages>             Stages to use: metadata,musicbrainz,discogs,ai,all
  --confidence-threshold <n>    Minimum confidence (default: 0.7)
```

**Examples:**
```bash
# Use all classification stages
music-organizer classify ~/Music --stages all

# Use only AI classification
music-organizer classify ~/Music --stages ai

# Use metadata and MusicBrainz only
music-organizer classify ~/Music --stages metadata,musicbrainz
```

### `update-tags` ✨ NEW

Write genre tags to FLAC files.

```bash
music-organizer update-tags <path> [options]

Options:
  -i, --input <file>    Classification results JSON (default: "classifications.json")
  --dry-run             Preview tag updates without modifying files
  --force               Update tags even if they already exist
```

**Examples:**
```bash
# Preview tag updates
music-organizer update-tags ~/Music --dry-run

# Write genre tags
music-organizer update-tags ~/Music

# Force update all tags
music-organizer update-tags ~/Music --force
```

**Tag Logic:**
- **Classical music**: Work category (Opera, Concertos, Symphonies, Chamber Music)
- **Modern music**: Subgenre (Jazz, Hard Rock, Progressive, Alternative)

### `plan`

Generate reorganization plan.

```bash
music-organizer plan <path> [options]

Options:
  -o, --output <file>           Output file (default: "reorganization-plan.json")
  --target <path>               Target directory (default: "./reorganized")
  --use-performer-folders       Use performer subfolders for classical (default: true)
  --dry-run                     Preview only
```

**Example:**
```bash
music-organizer plan ~/Music --target ~/Music-Organized -o plan.json
```

### `organize`

Execute reorganization from plan.

```bash
music-organizer organize <plan> [options]

Options:
  --mode <mode>        Operation mode: copy or move (default: "copy")
  --no-verify          Skip file integrity verification
  --backup <dir>       Create backup manifest
  --dry-run            Simulate operations
  --skip-existing      Skip files that already exist at target ✨ NEW
```

**Examples:**
```bash
# Dry-run (preview)
music-organizer organize plan.json --dry-run

# Copy mode with backup
music-organizer organize plan.json --mode copy --backup ~/Backup

# Move mode (destructive!)
music-organizer organize plan.json --mode move --backup ~/Backup

# Incremental update (skip existing files)
music-organizer organize plan.json --skip-existing
```

## 🎯 Workflow Examples

### Example 1: Full Library Reorganization

```bash
# Step 1: Analyze library
music-organizer analyze ~/Music
# Output: Found 3000 albums, 12000 FLAC files

# Step 2: Classify genres
music-organizer classify ~/Music --stages all
# Output: 2850 classified, 50 need manual review
# Cost: ~$0.70 (AI for 150 albums)

# Step 3: Update FLAC tags
music-organizer update-tags ~/Music
# Output: Updated 11400 files

# Step 4: Generate plan
music-organizer plan ~/Music --target ~/Music-Organized

# Step 5: Dry-run verification
music-organizer organize plan.json --dry-run
# Review proposed changes

# Step 6: Execute (safe copy mode)
music-organizer organize plan.json --mode copy --backup ~/Music-Backup

# Step 7: Verify results
ls ~/Music-Organized
# Classical/Bizet/Opera/Carmen/
# Rock & Alternative/Alternative/Bauhaus/
# Jazz & Blues/Jazz/Miles Davis/
```

### Example 2: Incremental Updates (New Downloads)

```bash
# Scenario: Add new albums from ~/Downloads/Music to existing ~/Music

# Step 1: Classify new downloads only
music-organizer classify ~/Downloads/Music --stages all

# Step 2: Update tags
music-organizer update-tags ~/Downloads/Music

# Step 3: Generate plan targeting existing library
music-organizer plan ~/Downloads/Music --target ~/Music -o new-plan.json

# Step 4: Preview
music-organizer organize new-plan.json --skip-existing --dry-run
# Shows: 50 new albums, 5 already exist (will be skipped)

# Step 5: Execute with skip-existing
music-organizer organize new-plan.json --skip-existing --mode copy

# Result:
# ✅ Success: 50 new albums added to ~/Music
# ⏭️  Skipped: 5 existing albums
# 🎵 Library updated without duplicates!
```

### Example 3: Classical Music with Multiple Recordings

```bash
# Classify classical library
music-organizer classify ~/Classical --stages all

# Generate plan with performer subfolders
music-organizer plan ~/Classical --target ~/Classical-Organized

# Result structure:
# Classical/
#   Vivaldi, Antonio/
#     Concertos/
#       The Four Seasons - RV 269-293/
#         I Musici (1959)/
#           01 - Spring I. Allegro.flac
#         Hogwood - Academy of Ancient Music (1982)/
#           01 - Spring I. Allegro.flac
#         Biondi - Europa Galante (1991)/
#           01 - Spring I. Allegro.flac
```

### Example 4: Quick Test on Small Subset

```bash
# Test on one artist first
music-organizer analyze ~/Music/Bauhaus
music-organizer classify ~/Music/Bauhaus --stages all
music-organizer plan ~/Music/Bauhaus --target ~/Test
music-organizer organize plan.json --dry-run

# If satisfied:
music-organizer organize plan.json --mode copy
```

## ⚙️ Configuration

Configuration is optional. The tool uses sensible defaults.

### Classification Settings

Default settings work for most users. Advanced configuration via config file (future):

```json
{
  "genreClassification": {
    "stages": {
      "flacMetadata": { "enabled": true },
      "musicbrainz": { "enabled": true, "rateLimit": 1 },
      "discogs": { "enabled": true },
      "aiClassification": {
        "enabled": true,
        "model": "claude-sonnet-4-5-20250929",
        "batchSize": 50
      }
    },
    "confidenceThreshold": 0.7
  }
}
```

## 🎼 Genre Hierarchy

### Main Genres and Subgenres

```
Rock & Alternative
├── Alternative (Gothic Rock, Post-Punk, Indie)
├── Punk (Hardcore, Post-Hardcore)
├── Metal (Heavy Metal, Thrash, Doom)
├── Classic Rock
├── Hard Rock
└── Progressive (Art Rock, Psychedelic)

Electronic & Dance
├── House (Deep House, Tech House)
├── Techno (Minimal Techno)
├── Ambient (Drone, Dark Ambient)
├── Industrial (EBM, Noise)
├── Drum & Bass
└── Dubstep

Urban
├── Hip-Hop (Rap, Trap)
├── R&B (Contemporary R&B)
├── Soul (Neo-Soul)
└── Funk

Jazz & Blues
├── Jazz (Bebop, Free Jazz, Fusion)
└── Blues (Delta Blues, Chicago Blues)

World & Folk
├── Folk (Contemporary Folk, Acoustic)
├── World (Ethnic, Traditional)
├── Singer-Songwriter
└── Country (Bluegrass)

Pop
└── (No subgenres)

Classical
└── (Composer-based structure)

Soundtracks
└── (Top-level category)
```

### Directory Structure Examples

**Modern Music:**
```
Rock & Alternative/
  Hard Rock/
    Deep Purple/
      1972 - Machine Head/
        01 - Highway Star.flac
        02 - Maybe I'm a Leo.flac

Jazz & Blues/
  Jazz/
    Miles Davis/
      1959 - Kind of Blue/
        01 - So What.flac
```

**Classical Music:**
```
Classical/
  Bizet, Georges/
    Opera/
      Carmen/
        01 - Overture.flac
        02 - Act I - Habanera.flac

  Vivaldi, Antonio/
    Concertos/
      The Four Seasons - RV 269-293/
        I Musici (1959)/
          01 - Spring I. Allegro.flac
        Hogwood - AACM (1982)/
          01 - Spring I. Allegro.flac
```

## 🎻 Classical Music

### Work Categories
- **Opera** - Carmen, Don Giovanni
- **Concertos** - Violin concertos, Piano concertos
- **Symphonies** - Symphony No. 9
- **Chamber Music** - String quartets
- **Sonatas** - Piano sonatas
- **Sacred Music** - Requiem, Mass
- **Orchestral Works** - Tone poems, Suites
- **Other Works** - Miscellaneous

### Performer Detection

The tool extracts performer information from FLAC tags:
- `CONDUCTOR` - Conductor name
- `ORCHESTRA` - Orchestra/ensemble name
- `ENSEMBLE` - Chamber ensemble
- `SOLOIST` - Solo performer
- `ARTIST` - Fallback

**Performer Folder Format:**
- Solo: `Glenn Gould (1955)`
- Ensemble: `I Musici (1959)`
- Conductor + Orchestra: `Karajan - Berlin Philharmonic (1963)`
- Abbreviated: `Böhm - Wiener Phil (1977)`

### Multiple Recordings

When the same work is recorded by different performers, each gets its own subfolder:

```
Vivaldi, Antonio/Concertos/The Four Seasons - RV 269-293/
├── I Musici (1959)/
├── Hogwood - Academy of Ancient Music (1982)/
└── Biondi - Europa Galante (1991)/
```

## 🔑 API Keys

### Anthropic Claude API

**Required** for AI classification (Stage 4).

1. Sign up: https://console.anthropic.com/
2. Create API key: Settings → API Keys
3. Add to `~/.config/music-organizer/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

**Cost Estimate:**
- Model: Claude Sonnet 4.5
- ~150 albums need AI (5% of 3000 album library)
- Cost: **$0.40 - $0.80** total
- Most albums classified via free APIs (MusicBrainz, metadata)

### Discogs API (Optional)

Improves classification coverage.

1. Register: https://www.discogs.com/settings/developers
2. Create application
3. Add to `.env`:
   ```
   DISCOGS_API_KEY=your_key
   DISCOGS_API_SECRET=your_secret
   ```

### MusicBrainz (No Key Required)

Free API, no registration needed. Please set contact info:

```
MUSICBRAINZ_APP_NAME=music-organizer
MUSICBRAINZ_CONTACT=your@email.com
```

## 🐛 Troubleshooting

### "metaflac: command not found"

Install the `flac` package:
```bash
# Arch Linux
sudo pacman -S flac

# Debian/Ubuntu
sudo apt install flac

# macOS
brew install flac
```

### "Too slow on NAS"

- Increase batch size: `--batch-size=200`
- Run overnight
- Copy subset locally, process, copy back
- Check NAS isn't doing backups/indexing

### "MusicBrainz rate limit"

- Reduce concurrency: `--concurrency=1`
- Use cache from previous runs
- Errors are expected, tool will retry

### "Classification seems wrong"

- Review `classifications.json` for details
- Check source: AI results have reasoning field
- Use `--force` with update-tags to fix after manual correction
- Report issues to improve genre mappings

### "Incremental update creating duplicates"

- Always use `--skip-existing` flag
- Check target path matches your organized library
- Use `--dry-run` first to preview
- Different subgenres = not duplicates (check classifications)

### "Genre tags don't match folders"

This is expected if you:
1. Organized library without using `update-tags`
2. Want to update tags later

**Solution:**
```bash
music-organizer update-tags ~/Music-Organized --force
```

Now Classical folders get work category tags (Opera, Concertos), and modern folders get subgenre tags (Jazz, Hard Rock).

## 📊 Performance

**Tested on 3000 album library (12,000 FLAC files, 500GB):**

| Operation | Time | Notes |
|-----------|------|-------|
| Metadata Scan | 15 min | Network storage |
| MusicBrainz API | 25 min | 1000 lookups |
| Discogs API | 8 min | 300 lookups |
| Claude AI | 7 min | 150 albums |
| Tag Writing | 8 min | 11,400 files |
| File Copy (NAS) | 3.5 hours | 500GB over gigabit |
| **Total** | **~4.5 hours** | Can run overnight |

**Cost:** ~$0.70 (Claude API)
**Success Rate:** 96% automatic classification

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run locally
npm run dev -- analyze ~/Music

# Lint
npm run lint
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [music-metadata](https://github.com/borewit/music-metadata) - FLAC metadata extraction
- [MusicBrainz](https://musicbrainz.org/) - Free music database
- [Discogs](https://www.discogs.com/) - Music database and marketplace
- [Anthropic Claude](https://www.anthropic.com/) - AI classification
- [metaflac](https://xiph.org/flac/) - FLAC tag manipulation

## 📚 Further Reading

- **[PROMPT.md](PROMPT.md)** - Complete project specification and implementation guide
- **[INSTALL.md](INSTALL.md)** - Detailed installation instructions
- **[CLAUDE.md](CLAUDE.md)** - Technical architecture and development notes

---

**Made with ❤️ for music lovers who value organization**

*If this tool helped you organize your music library, please give it a ⭐ on GitHub!*
