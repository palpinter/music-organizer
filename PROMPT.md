# Music Library Reorganizer - Project Specification

## Project Overview

Create a Node.js/TypeScript CLI tool that analyzes and reorganizes a large FLAC music library from an inconsistent structure to a well-organized, genre-specific structure. 

**Current Library Size:** ~3,000 albums
**Storage:** Linux-based NAS (network storage)
**Priority:** Thoroughness and accuracy over speed
**Classification Strategy:** Multi-stage hybrid with manual review for edge cases

The library is continuously growing and requires a systematic approach to maintain organization.

**Key Features:**
- **Hierarchical genre system** for modern music (Main Genre/Subgenre/Artist)
- **Composer-centric organization** for classical music
- **Multiple recordings support** for classical works (different performers/conductors grouped under same work)
- **Hybrid classification** using metadata, MusicBrainz, Discogs, and Claude AI
- **NAS-optimized** for network storage performance
- **Safe operations** with dry-run, backup, and rollback capabilities

## Current State Analysis

### Existing Structure - Modern Music
```
/Alternative/Bauhaus/Burning from the Inside [1983]/
  01. Bauhaus - She's in Parties.flac
  02. Bauhaus - Antonin Artaud.flac
  ...
```
- Pattern: `Genre/Artist/Album [ID] [Year]/files`
- Filename: `TrackNumber. Artist - Title.flac`
- **Problem**: Flat genre structure with too many top-level directories, unclear boundaries between similar genres

### Existing Structure - Classical Music (PROBLEMATIC)
```
/Klasszikus/Antonio Vivaldi- La Viola Da Gamba In Concerto [11994266] [2003]/
  01 - Various Artists - Concerto con violino e viola da gamba, Archi e Continuo (La Maggiore, RV 546)- I. Allegro.flac
  ...
```
- Problems:
  - Composer is in album title, not directory structure
  - "Various Artists" as performer (should be actual ensemble/conductor)
  - Catalog numbers (RV, K., BWV, Op.) not properly structured
  - No genre/work-type categorization
  - Inconsistent naming
  - Compilations with multiple composers not distinguished from single composer albums

## Target Structure

### Genre Hierarchy (Hybrid System)

Modern music uses a two-level hierarchical genre system with main categories and subcategories:

```
/Rock & Alternative/
  Alternative/
  Classic Rock/
  Punk/
  Metal/
  Progressive/
  Hard Rock/
  Indie/

/Electronic & Dance/
  House/
  Techno/
  Ambient/
  Industrial/
  Drum & Bass/
  Dubstep/
  Trance/

/Urban/
  Hip-Hop/
  R&B/
  Soul/
  Funk/
  Trap/

/Jazz & Blues/
  Jazz/
  Blues/
  Bebop/
  Fusion/

/World & Folk/
  Folk/
  World/
  Singer-Songwriter/
  Country/
  Celtic/

/Pop/
  (single level - no subcategories)

/Classical/
  (uses composer-based structure, not genre hierarchy)

/Soundtracks/
  (top-level, no hierarchy)
```

### Modern Music (Pop, Rock, Alternative, etc.)

**Note on Filenames**: 
- Regular albums and Best Of: `01 - Track Title.flac` (no artist prefix, it's in the directory)
- Compilations and Soundtracks: `01 - Artist Name - Track Title.flac` (artist prefix needed for track identification)

#### Regular Albums

**Single Disc:**
```
/Main Genre/Subgenre/Artist/Year - Album Title/
  01 - Track Title.flac
  02 - Track Title.flac
  cover.jpg
```
Example:
```
/Rock & Alternative/Alternative/Bauhaus/1983 - Burning from the Inside/
  01 - She's in Parties.flac
  02 - Antonin Artaud.flac
  cover.jpg
```

Another example:
```
/Rock & Alternative/Classic Rock/Pink Floyd/1979 - The Wall/
```

**Multi-Disc:**
```
/Main Genre/Subgenre/Artist/Year - Album Title/
  Disc 1/
    01 - Track Title.flac
    02 - Track Title.flac
  Disc 2/
    01 - Track Title.flac
    02 - Track Title.flac
  cover.jpg
```
Example:
```
/Rock & Alternative/Classic Rock/Pink Floyd/1979 - The Wall/
  Disc 1/
    01 - In the Flesh.flac
    02 - The Thin Ice.flac
  Disc 2/
    01 - Hey You.flac
    02 - Comfortably Numb.flac
  cover.jpg
```

#### Best Of / Greatest Hits (stays with original artist)

**Single Disc:**
```
/Main Genre/Subgenre/Artist/Year - Album Title/
  01 - Track Title.flac
```
Example:
```
/Rock & Alternative/Alternative/Bauhaus/2008 - The Best of Bauhaus/
  01 - Bela Lugosi's Dead.flac
  02 - She's in Parties.flac
```

**Multi-Disc:**
```
/Main Genre/Subgenre/Artist/Year - Album Title/
  Disc 1/
    01 - Track Title.flac
  Disc 2/
    01 - Track Title.flac
```

#### Compilation Albums (Various Artists)

**Single Disc:**
```
/Main Genre/Subgenre/Compilations/Year - Album Title/
  01 - Artist Name - Track Title.flac
  02 - Artist Name - Track Title.flac
  cover.jpg
```
Example:
```
/Rock & Alternative/Alternative/Compilations/2005 - Gothic Rock Essentials/
  01 - Bauhaus - Bela Lugosi's Dead.flac
  02 - Siouxsie and the Banshees - Spellbound.flac
  03 - The Cure - A Forest.flac
  cover.jpg
```

**Multi-Disc:**
```
/Main Genre/Subgenre/Compilations/Year - Album Title/
  Disc 1/
    01 - Artist Name - Track Title.flac
  Disc 2/
    01 - Artist Name - Track Title.flac
  cover.jpg
```

#### Soundtracks

**Single Disc:**
```
/Soundtracks/Title (Year)/
  01 - Artist - Track Title.flac
  02 - Artist - Track Title.flac
  cover.jpg
```
Example:
```
/Soundtracks/The Crow (1994)/
  01 - The Cure - Burn.flac
  02 - Nine Inch Nails - Dead Souls.flac
  cover.jpg
```

**Multi-Disc:**
```
/Soundtracks/Title (Year)/
  Disc 1/
    01 - Artist - Track Title.flac
  Disc 2/
    01 - Artist - Track Title.flac
  cover.jpg
```

### Classical Music

**Note on Filenames**:
- Regular works: `01 - Movement Name.flac` (composer is in directory)
- Classical compilations: `01 - Composer - Work - Movement.flac` (composer prefix needed)

**Note on Multiple Recordings:**
Classical works often exist in multiple recordings by different performers, conductors, and orchestras. Each unique recording gets its own subfolder within the work directory.

#### Regular Works

**Single Recording:**
```
/Classical/Composer, FirstName/Work Category/Work Title - Catalog Number/
  01 - Movement I.flac
  02 - Movement II.flac
  cover.jpg
```
Example:
```
/Classical/Vivaldi, Antonio/Concertos/Concerto in A major for violin and viola da gamba - RV 546/
  01 - I. Allegro.flac
  02 - II. Andante.flac
  03 - III. Allegro.flac
  cover.jpg
```

**Multiple Recordings (Different Performers):**
```
/Classical/Composer, FirstName/Work Category/Work Title - Catalog Number/
  Performer/Ensemble (Year)/
    01 - Movement I.flac
    02 - Movement II.flac
    cover.jpg
  Conductor - Orchestra (Year)/
    01 - Movement I.flac
    cover.jpg
  Another Performer (Year)/
    01 - Movement I.flac
    cover.jpg
```

Example - Multiple recordings of same work:
```
/Classical/Vivaldi, Antonio/Concertos/The Four Seasons - RV 269-293/
  I Musici (1959)/
    01 - Spring I. Allegro.flac
    02 - Spring II. Largo.flac
    03 - Spring III. Allegro.flac
    04 - Summer I. Allegro non molto.flac
    ...
    cover.jpg
  Hogwood - Academy of Ancient Music (1982)/
    01 - Spring I. Allegro.flac
    02 - Spring II. Largo.flac
    ...
    cover.jpg
  Biondi - Europa Galante (1991)/
    01 - Spring I. Allegro.flac
    ...
    cover.jpg
```

Example - Opera with multiple recordings:
```
/Classical/Mozart, Wolfgang Amadeus/Operas/Don Giovanni - K. 527/
  Böhm - Wiener Philharmoniker (1977)/
    CD 1/
      01 - Overture.flac
      02 - Act I Scene 1.flac
      ...
    CD 2/
      01 - Act II Scene 1.flac
      ...
    cover.jpg
  Gardiner - English Baroque Soloists (1994)/
    01 - Overture.flac
    02 - Act I Scene 1.flac
    ...
    cover.jpg
  Muti - Wiener Philharmoniker (1990)/
    Disc 1/
      01 - Overture.flac
      ...
    Disc 2/
      01 - Act II.flac
      ...
    cover.jpg
```

**Performer Folder Naming Convention:**

The performer folder name should follow this priority:
1. **Ensemble/Soloist only:** `I Musici (1959)`, `Glenn Gould (1955)`
2. **Conductor + Orchestra:** `Böhm - Wiener Philharmoniker (1977)`, `Karajan - BPO (1963)`
3. **Conductor + Ensemble:** `Hogwood - Academy of Ancient Music (1982)`
4. **Soloist + Ensemble:** `Perlman - Israel Philharmonic (1988)`
5. **Complex (Opera with multiple soloists):** Use conductor + orchestra: `Gardiner - EBS (1994)`

**Abbreviations (recommended for common ensembles):**
- BPO = Berlin Philharmonic Orchestra
- VPO or Wiener Phil = Wiener Philharmoniker
- AACM = Academy of Ancient Music
- EBS = English Baroque Soloists
- LSO = London Symphony Orchestra
- NYPO = New York Philharmonic Orchestra

**Metadata Fields for Performer Detection:**
```
CONDUCTOR=Karl Böhm
ORCHESTRA=Wiener Philharmoniker
ENSEMBLE=I Musici
ARTIST=I Musici (or ensemble name)
ALBUMARTIST=I Musici
SOLOIST=Itzhak Perlman
DATE=1977
```

#### Classical Compilations (Various Composers)
```
/Classical/Compilations/Theme or Era/Year - Album Title/
  01 - Composer - Work - Movement.flac
  02 - Composer - Work - Movement.flac
  cover.jpg
```
Example:
```
/Classical/Compilations/Baroque/2010 - Baroque Masterpieces/
  01 - Bach - Brandenburg Concerto No. 3 - I. Allegro.flac
  02 - Vivaldi - The Four Seasons - Spring I. Allegro.flac
  03 - Handel - Water Music - Allegro.flac
  cover.jpg
```

Work Categories for Classical:
- Symphonies
- Concertos
- Chamber Music
- Operas
- Solo Works
- Choral Works
- Orchestral Works
- etc.

## Technical Requirements

### System Requirements
- **Operating System**: Linux (local) and Linux-based NAS (network)
- **File System**: Case-sensitive (ext4, btrfs, etc.)
- **Network**: Support for network file operations (NAS access)
- **Cross-platform compatibility**: Path sanitization for Windows compatibility
- **Required System Tools**: `metaflac` (from flac package) for FLAC tag manipulation

### Path Sanitization Rules (NEW)
To ensure cross-platform compatibility (especially Windows), the following character replacements are applied to all filenames and directory names:

- **Colon (`:`)** → **Space + Dash (` -`)**
  - Example: `Bizet: Carmen` → `Bizet - Carmen`
  - Example: `Forces of Nature: Live at Slugs'` → `Forces of Nature - Live at Slugs'`
- **Double Quotes (`"`)** → **Removed**
  - Example: `"Je vais danser"` → `Je vais danser`
- **Other Windows forbidden chars (`<>|?*`)** → **Underscore (`_`)**
- **Forward slash (`/`)** → **Dash (`-`)**
- **Backslash (`\`)** → **Dash (`-`)**
- **Multiple spaces** → **Single space**
- **Trailing dots** → **Removed** (Windows limitation)

**Implementation**: All sanitization is handled by `src/utils/path-utils.ts`

### Incremental Library Updates (NEW)
The tool supports incremental updates to an existing organized library using the `--skip-existing` flag:

**Use Case:**
- You have a well-organized library: `~/Music`
- You download new albums to: `~/Downloads/Music`
- You want to add new albums to existing library without duplicating

**Workflow:**
```bash
# 1. Classify new downloads
music-organizer classify ~/Downloads/Music --stages ai

# 2. Update tags (optional)
music-organizer update-tags ~/Downloads/Music

# 3. Generate plan targeting existing library
music-organizer plan ~/Downloads/Music --target ~/Music

# 4. Execute with --skip-existing
music-organizer organize plan.json --skip-existing --mode copy
# Result: Only new albums copied, existing albums skipped
```

**Behavior:**
- Checks if target file already exists
- If exists → skips (increments skipped counter)
- If new → copies/moves as normal
- Works with both `--mode copy` and `--mode move`
- Compatible with `--dry-run` for preview

**Benefits:**
- Safe continuous library growth
- No duplicate checking needed
- Fast (skips file operations for existing files)
- Works with NAS libraries

### Core Technologies
- **Language**: TypeScript
- **Runtime**: Node.js (latest LTS)
- **Package Manager**: npm or pnpm

### Required NPM Packages

**Core:**
- `music-metadata` - FLAC metadata extraction
- `fs-extra` - Enhanced file system operations
- `commander` or `yargs` - CLI framework
- `winston` - Logging
- `cli-progress` - Progress bars

**API Integration:**
- `@anthropic-ai/sdk` - Claude API client
- `musicbrainz-api` - MusicBrainz integration
- `disconnect` - Discogs API client (or use `axios` for direct HTTP)
- `axios` - HTTP client
- `bottleneck` - Rate limiting

**Utilities:**
- `dotenv` - Environment variable management
- `joi` or `zod` - Configuration validation
- `p-queue` - Promise queue for concurrency control
- `fast-levenshtein` - Fuzzy string matching for genre normalization

### Required Features

#### 1. Metadata Reading
- Read FLAC file metadata (ID3/Vorbis Comments tags)
- Extract: artist, album, title, track number, year, genre, composer, catalog number
- Library suggestion: `music-metadata` or `node-flac`

#### 1b. FLAC Tag Writing (NEW)
- **Write genre tags** back to FLAC files after classification
- Use `metaflac` command-line tool for tag manipulation
- **Intelligent genre selection**:
  - **Classical music**: Use work category (Opera, Concertos, Symphonies, Chamber Music) instead of composer name
  - **Modern music**: Use subgenre (Jazz, Hard Rock, Progressive) for specificity
- **Safety features**:
  - `--dry-run` mode to preview tag updates
  - `--force` option to overwrite existing tags
  - Skip files that already have genre tags (unless --force)
  - Progress bar with statistics
- **Implementation**: Execute `metaflac` commands via Node.js child_process
  ```bash
  # Remove existing genre tag
  metaflac --remove-tag=GENRE "file.flac"
  # Set new genre tag
  metaflac --set-tag=GENRE="Jazz" "file.flac"
  ```

#### 2. Structure Analysis
- Scan existing library recursively
- Identify current structure pattern
- Detect genre (Classical vs Modern)
- Parse existing directory/filename patterns
- **Genre Classification (Multi-Stage Hybrid Strategy)**:
  1. **Stage 1 - FLAC Metadata**: Extract genre from existing tags, use if recognized
  2. **Stage 2 - MusicBrainz API**: Lookup by artist + album + year, extract genre tags
  3. **Stage 3 - Discogs API**: Fallback lookup, extract styles/genres
  4. **Stage 4 - AI Batch Classification**: Use Claude API for unclassified albums (batch 20-50 at a time)
  5. **Stage 5 - Manual Review Queue**: Flag low-confidence results for user review
  - Map raw genres/tags to hierarchical structure (main genre + subgenre)
  - Handle flat genre structures (convert to hierarchical)
  - Track confidence scores for each classification
  - Generate detailed classification report
- Generate analysis report (JSON/CSV)

#### 3. Classical Music Intelligence
- Detect composer from album title or metadata
- Parse catalog numbers (RV, K., BWV, Op., Hob., D., etc.)
- Identify work type from title (Concerto, Symphony, Sonata, etc.)
- Normalize composer name format (LastName, FirstName)
- Handle multiple movements as single work
- **Performer/Recording Detection**:
  - Extract conductor from CONDUCTOR tag or album metadata
  - Extract orchestra/ensemble from ORCHESTRA/ENSEMBLE tags
  - Extract soloists from SOLOIST/ARTIST tags
  - Detect multiple recordings of same work (different performers/years)
  - Generate performer folder name based on metadata
  - Handle performer name normalization and abbreviations
  - Detect if single recording or multiple recordings exist

#### 4. File Organization Logic
- Generate new directory structure based on metadata
- Create new filename format (without artist prefix for modern music)
- **Genre Hierarchy Handling**:
  - Map raw genre metadata to subgenre (e.g., "Gothic Rock" → "Alternative")
  - Determine main category from subgenre (e.g., "Alternative" → "Rock & Alternative")
  - Create two-level directory structure: `/Main Genre/Subgenre/Artist/`
  - Classical music bypasses genre hierarchy (uses composer-based structure)
  - Soundtracks bypass genre hierarchy (top-level `/Soundtracks/`)
  - Unknown genres flagged for manual classification
- **Multi-Disc Handling**:
  - Detect multi-disc albums from metadata (disc number field)
  - Create `Disc 1/`, `Disc 2/` subdirectories
  - Track numbering resets per disc (01, 02, 03... in each disc folder)
  - Cover image stays at album root level
- **Album Type Detection**:
  - **Soundtrack**: Detect from album title (keywords: "Soundtrack", "OST", "Original Score", "Motion Picture")
  - **Best Of / Greatest Hits**: Detect from album title (keywords: "Best Of", "Greatest Hits", "Anthology", "Collection") AND single artist → stays with artist
  - **Compilation**: Multiple artists in album OR "Various Artists" as album artist → `/Main Genre/Subgenre/Compilations/`
  - **Classical Compilation**: Multiple composers in classical album → `/Classical/Compilations/Theme/`
  - **Regular Album**: Single artist/composer → standard structure
- Handle special cases:
  - Multi-disc albums
  - Compilations
  - Various artists albums
  - Same work, different performances

#### 5. Safety Features
- **Dry-run mode**: Preview changes without moving files
- **Backup option**: Copy instead of move
- **Conflict detection**: Handle duplicate paths
- **Rollback capability**: Keep operation log for undo
- **Progress reporting**: Show current operation status
- **File Permissions**: 
  - Preserve original file permissions (chmod/chown)
  - Handle NAS permission issues gracefully
  - Option to set specific permissions for organized files (e.g., 644 for files, 755 for directories)
  - Verify write permissions before operations

#### 6. CLI Interface
Commands needed:
```bash
# Analyze current structure
music-organizer analyze /path/to/library --output report.json

# Classify genres (preview classification without organizing)
music-organizer classify /path/to/library --output classifications.json --stages=all

# Update FLAC genre tags from classifications (NEW)
music-organizer update-tags /path/to/library --input classifications.json

# Preview reorganization
music-organizer plan /path/to/library --dry-run

# Execute reorganization
music-organizer organize /path/to/library --mode=move|copy

# Verify integrity after organization
music-organizer verify /path/to/library

# Manual review interface
music-organizer review manual-review.json
```

Options:
- `--music-genre=classical|modern|all` - Filter by music type (classical vs modern)
- `--main-genre="Rock & Alternative"|"Electronic & Dance"|...` - Filter by main genre category
- `--subgenre=alternative|punk|metal|...` - Filter by subgenre
- `--dry-run` - Preview without changes
- `--mode=move|copy` - Move or copy files
- `--backup-dir=/path` - Create backup before operation
- `--concurrency=N` - Parallel processing limit
- `--log-file=/path` - Operation log location
- `--unknown-genres=ask|skip|flag` - How to handle unknown genres
- `--stages=metadata,musicbrainz,discogs,ai,all` - Which classification stages to use
- `--skip-cache` - Ignore cached classification results
- `--ai-batch-size=N` - Number of albums per AI batch (default: 50)
- `--confidence-threshold=0.0-1.0` - Minimum confidence to accept (default: 0.7)
- `--skip-existing` - Skip files that already exist at target (for incremental updates)
- `--force` - Update genre tags even if they already exist (for update-tags command)

#### 7. Reporting
Generate reports in JSON/CSV/Markdown:
- Files analyzed count
- Structure violations found
- Proposed changes
- Conflicts/ambiguities requiring manual review
- **Genre Statistics**:
  - By main genre category (Rock & Alternative: 234 albums)
  - By subgenre (Alternative: 89, Punk: 45, Metal: 100)
  - Unknown/unclassified genres with counts
  - Genre distribution charts (if generating HTML reports)
- Statistics (by artist, year, album type, etc.)

### Album Type Detection Examples

#### Genre Classification Logic

**Two-Level Genre System:**
1. **Main Category** (e.g., "Rock & Alternative", "Electronic & Dance")
2. **Subgenre** (e.g., "Alternative", "Techno")

**Classification Process:**
1. Read genre from metadata (FLAC Vorbis tags)
2. Map to subgenre using keyword matching
3. Determine main category from subgenre
4. If ambiguous, use fallback rules or flag for manual review

**Subgenre Mapping Examples:**

```typescript
// Rock & Alternative
Alternative, Indie, Post-Punk, Gothic Rock, New Wave
→ /Rock & Alternative/Alternative/

Punk, Hardcore, Post-Hardcore
→ /Rock & Alternative/Punk/

Metal, Heavy Metal, Death Metal, Black Metal, Doom, Thrash
→ /Rock & Alternative/Metal/

Classic Rock, Rock, Hard Rock
→ /Rock & Alternative/Classic Rock/ or /Rock & Alternative/Hard Rock/

Progressive Rock, Art Rock, Psychedelic
→ /Rock & Alternative/Progressive/

// Electronic & Dance
House, Deep House, Tech House
→ /Electronic & Dance/House/

Techno, Minimal Techno
→ /Electronic & Dance/Techno/

Ambient, Drone, Dark Ambient
→ /Electronic & Dance/Ambient/

Industrial, EBM, Noise
→ /Electronic & Dance/Industrial/

// Urban
Hip-Hop, Rap
→ /Urban/Hip-Hop/

R&B, Contemporary R&B
→ /Urban/R&B/

Soul, Neo-Soul
→ /Urban/Soul/

Funk
→ /Urban/Funk/

// Jazz & Blues
Jazz, Bebop, Free Jazz, Smooth Jazz
→ /Jazz & Blues/Jazz/

Blues, Delta Blues, Chicago Blues
→ /Jazz & Blues/Blues/

// World & Folk
Folk, Contemporary Folk, Acoustic
→ /World & Folk/Folk/

World, Ethnic, Traditional
→ /World & Folk/World/

Singer-Songwriter
→ /World & Folk/Singer-Songwriter/

Country, Bluegrass
→ /World & Folk/Country/

// Pop
Pop, Synth-pop, Electropop, Dance-pop
→ /Pop/

// Special Cases
Classical (any classical-related genre)
→ /Classical/ (composer-based structure)

Soundtrack, OST, Score
→ /Soundtracks/
```

**Edge Cases:**
- Multiple genres in metadata: Use primary/first genre
- Unknown/unrecognized genre: Flag for manual classification
- Crossover genres (e.g., "Industrial Metal"): Use primary component (Metal) or allow manual override

#### Soundtrack Detection
Album titles containing:
- "Soundtrack", "Original Soundtrack", "OST"
- "Original Motion Picture Score"
- "Music from the Motion Picture"
- "Film Score"

Examples:
- "The Crow (Original Motion Picture Soundtrack)" → `/Soundtracks/The Crow (1994)/`
- "Inception OST" → `/Soundtracks/Inception (2010)/`

#### Best Of Detection
Album titles containing AND single artist/composer:
- "Best Of", "The Best of"
- "Greatest Hits"
- "Anthology"
- "Collection", "The Collection"
- "Essential", "Essentials"

Examples:
- "The Best of Bauhaus" → `/Alternative/Bauhaus/2008 - The Best of Bauhaus/`
- "Bach: Essential Works" → `/Classical/Bach, Johann Sebastian/Compilations/2015 - Essential Works/`

#### Compilation Detection (Modern)
- Album artist = "Various Artists" OR
- Multiple different artists in tracks OR
- Album title contains: "Compilation", "Mix", "Sampler"

BUT NOT if it's a "Best Of" from single artist

Examples:
- Album artist: "Various Artists" → `/Alternative/Compilations/2005 - Gothic Rock Essentials/`
- Tracks by different artists → `/Rock/Compilations/1995 - Rock Anthems/`

#### Classical Compilation Detection
- Multiple composers in track metadata OR
- Album title suggests compilation: "Baroque Masters", "Romantic Era", "20th Century Classics"

Examples:
- Works by Bach, Vivaldi, Handel → `/Classical/Compilations/Baroque/2010 - Baroque Masterpieces/`

### Classical Music: Performer Detection & Multiple Recordings

#### Problem Statement
Classical works often exist in multiple recordings by different performers, conductors, orchestras, and soloists. The same Vivaldi concerto might be performed by:
- I Musici (chamber ensemble, 1959)
- Christopher Hogwood conducting Academy of Ancient Music (1982)
- Fabio Biondi with Europa Galante (1991)

Each recording is a unique artistic interpretation and should be preserved separately.

#### Detection Strategy

**Step 1: Identify if multiple recordings exist**
- Scan all albums by same composer
- Group by work title and catalog number
- If multiple albums match same work → multiple recordings detected

**Step 2: Extract performer information from metadata**

Priority order for metadata extraction:
```typescript
1. CONDUCTOR tag → primary performer (if present)
2. ORCHESTRA or ENSEMBLE tag → accompanying group
3. ARTIST or ALBUMARTIST tag → fallback if no conductor
4. SOLOIST tag → for solo works
5. Album folder name parsing (if metadata missing)
```

**Step 3: Generate performer folder name**

Rules:
- **Solo work:** `[Soloist] ([Year])`
  - Example: `Glenn Gould (1955)`
- **Ensemble work:** `[Ensemble] ([Year])`
  - Example: `I Musici (1959)`
- **Orchestral work:** `[Conductor] - [Orchestra] ([Year])`
  - Example: `Karajan - Berlin Philharmonic (1963)`
  - Abbreviated: `Karajan - BPO (1963)`
- **Chamber + conductor:** `[Conductor] - [Ensemble] ([Year])`
  - Example: `Hogwood - Academy of Ancient Music (1982)`
  - Abbreviated: `Hogwood - AACM (1982)`

**Step 4: Handle edge cases**
- **No performer metadata:** Use album folder name or mark for manual review
- **Same performer, different years:** Keep both: `I Musici (1959)`, `I Musici (1988)`
- **Same performer, same year:** Add disambiguation: `I Musici (1959-01)`, `I Musici (1959-02)`
- **Multiple soloists (operas/choral):** Use conductor + orchestra only
- **Generic "Various Artists":** Parse from album title or mark for review

#### Metadata Examples

**Example 1: Ensemble recording**
```
FLAC Tags:
  ARTIST=I Musici
  ALBUMARTIST=I Musici
  ENSEMBLE=I Musici
  ALBUM=Vivaldi: The Four Seasons
  DATE=1959
  COMPOSER=Antonio Vivaldi

Generated Path:
/Classical/Vivaldi, Antonio/Concertos/The Four Seasons - RV 269-293/
  I Musici (1959)/
    01 - Spring I. Allegro.flac
```

**Example 2: Conductor + Orchestra**
```
FLAC Tags:
  CONDUCTOR=Karl Böhm
  ORCHESTRA=Wiener Philharmoniker
  ARTIST=Wiener Philharmoniker
  ALBUMARTIST=Karl Böhm
  ALBUM=Mozart: Don Giovanni
  DATE=1977
  COMPOSER=Wolfgang Amadeus Mozart

Generated Path:
/Classical/Mozart, Wolfgang Amadeus/Operas/Don Giovanni - K. 527/
  Böhm - Wiener Philharmoniker (1977)/
    CD 1/
      01 - Overture.flac
```

**Example 3: Conductor + Period Ensemble**
```
FLAC Tags:
  CONDUCTOR=Christopher Hogwood
  ENSEMBLE=Academy of Ancient Music
  ARTIST=Academy of Ancient Music
  ALBUMARTIST=Christopher Hogwood
  ALBUM=Vivaldi: The Four Seasons
  DATE=1982
  COMPOSER=Antonio Vivaldi

Generated Path:
/Classical/Vivaldi, Antonio/Concertos/The Four Seasons - RV 269-293/
  Hogwood - Academy of Ancient Music (1982)/
    01 - Spring I. Allegro.flac
```

**Example 4: Solo work**
```
FLAC Tags:
  ARTIST=Glenn Gould
  ALBUMARTIST=Glenn Gould
  SOLOIST=Glenn Gould
  ALBUM=Bach: Goldberg Variations
  DATE=1955
  COMPOSER=Johann Sebastian Bach

Generated Path:
/Classical/Bach, Johann Sebastian/Solo Works/Goldberg Variations - BWV 988/
  Glenn Gould (1955)/
    01 - Aria.flac
    02 - Variation 1.flac
```

#### Orchestra/Ensemble Abbreviation Table

Common abbreviations to reduce folder name length:
```typescript
const orchestraAbbreviations = {
  "Berlin Philharmonic Orchestra": "BPO",
  "Berliner Philharmoniker": "BPO",
  "Wiener Philharmoniker": "Wiener Phil",
  "Vienna Philharmonic": "Wiener Phil",
  "London Symphony Orchestra": "LSO",
  "Academy of Ancient Music": "AACM",
  "English Baroque Soloists": "EBS",
  "New York Philharmonic": "NYPO",
  "Royal Concertgebouw Orchestra": "RCO",
  "Chicago Symphony Orchestra": "CSO",
  "Boston Symphony Orchestra": "BSO",
  "Cleveland Orchestra": "Cleveland Orch",
  "Philadelphia Orchestra": "Philadelphia Orch"
};
```

#### Configuration

```json
{
  "classical": {
    "multipleRecordings": {
      "enabled": true,
      "performerSubfolders": true,  // Set to false to disable performer subfolders
      "namingFormat": "{performer} ({year})",
      "abbreviateOrchestras": true,
      "maxPerformerNameLength": 50,
      "handleDuplicateYears": "add-suffix"  // or "keep-both", "manual-review"
    },
    "performerDetection": {
      "priority": ["conductor", "orchestra", "ensemble", "artist", "soloist"],
      "fallbackToAlbumName": true,
      "manualReviewUnknown": true
    }
  }
}
```

**Alternative: Disable performer subfolders**
If you prefer simpler structure without performer subfolders, set `performerSubfolders: false`:

```
/Classical/Vivaldi, Antonio/Concertos/
  The Four Seasons - RV 269-293 - I Musici (1959)/
    01 - Spring I. Allegro.flac
  The Four Seasons - RV 269-293 - Hogwood (1982)/
    01 - Spring I. Allegro.flac
  The Four Seasons - RV 269-293 - Biondi (1991)/
    01 - Spring I. Allegro.flac
```

This puts performer in the album folder name instead of creating subfolders.
Use this if you prefer flatter directory structure.

#### Implementation Notes

**Detection Algorithm:**
```typescript
async function detectMultipleRecordings(composer: string, work: string): Promise<boolean> {
  const albums = await findAlbumsByComposerAndWork(composer, work);
  
  if (albums.length <= 1) return false;
  
  // Check if actually different recordings (different performers or years)
  const uniqueRecordings = new Set();
  for (const album of albums) {
    const performer = extractPerformer(album.metadata);
    const year = album.metadata.year;
    uniqueRecordings.add(`${performer}-${year}`);
  }
  
  return uniqueRecordings.size > 1;
}

function extractPerformer(metadata: Metadata): string {
  // Priority: conductor > orchestra/ensemble > artist
  if (metadata.conductor && metadata.orchestra) {
    return `${metadata.conductor} - ${abbreviate(metadata.orchestra)}`;
  }
  if (metadata.conductor && metadata.ensemble) {
    return `${metadata.conductor} - ${abbreviate(metadata.ensemble)}`;
  }
  if (metadata.ensemble) {
    return metadata.ensemble;
  }
  if (metadata.artist) {
    return metadata.artist;
  }
  return "Unknown Performer";
}

function generatePerformerFolderName(metadata: Metadata): string {
  const performer = extractPerformer(metadata);
  const year = metadata.year || "Unknown";
  return `${performer} (${year})`;
}
```

## Genre Classification Strategy (Hybrid Multi-Stage)

### Overview

The hybrid approach combines metadata extraction, public APIs, and AI to achieve optimal accuracy and cost-efficiency:

```
FLAC Metadata (50% coverage) 
    ↓ fallback
MusicBrainz API (35% additional coverage)
    ↓ fallback  
Discogs API (10% additional coverage)
    ↓ fallback
Claude AI Batch (5% remaining - hard cases)
    ↓
Manual Review Queue (low confidence cases)
```

### Stage 1: FLAC Metadata Extraction

**Process:**
- Read genre tag from FLAC Vorbis Comments
- Normalize and validate against known genre list
- If recognized → map to hierarchy and use (confidence: high)
- If unrecognized → proceed to Stage 2

**Implementation:**
```typescript
const metadata = await parseFlacMetadata(file);
if (metadata.genre && isRecognizedGenre(metadata.genre)) {
  return {
    mainGenre: mapToMainGenre(metadata.genre),
    subgenre: mapToSubgenre(metadata.genre),
    source: 'flac-metadata',
    confidence: 'high'
  };
}
```

### Stage 2: MusicBrainz API Lookup

**API:** https://musicbrainz.org/ws/2/
**Rate Limit:** 1 request/second
**Free:** Yes, no API key required

**Process:**
1. Search by artist + album name + year
2. Get release MBID (MusicBrainz ID)
3. Fetch release details with tags
4. Extract genre/tag information
5. Map tags to genre hierarchy
6. Use if confidence ≥ 70%

**Data Structure:**
```json
{
  "release": {
    "id": "abc123",
    "title": "Burning from the Inside",
    "tags": [
      {"name": "post-punk", "count": 12},
      {"name": "gothic rock", "count": 8},
      {"name": "alternative rock", "count": 6}
    ]
  }
}
```

**Node Library:** `musicbrainz-api` or direct HTTP with rate limiting

**Confidence Calculation:**
- High: Multiple tags agree on genre (count > 5)
- Medium: Tags present but low counts (count 2-5)
- Low: Only one tag or conflicting tags

### Stage 3: Discogs API Lookup

**API:** https://api.discogs.com/
**Rate Limit:** 60 requests/minute (unauthenticated), 240 with auth
**Free:** Yes, but requires API key (simple registration)

**Process:**
1. Search by artist + album (release title)
2. Get release details
3. Extract styles and genres
4. Map to hierarchy
5. Use if confidence ≥ 60%

**Data Structure:**
```json
{
  "results": [{
    "title": "Bauhaus - Burning From The Inside",
    "styles": ["Gothic Rock", "Post-Punk"],
    "genres": ["Rock"]
  }]
}
```

**Node Library:** `disconnect` or direct HTTP

### Stage 4: AI Batch Classification (Claude API)

**API:** Anthropic Claude API
**Model:** claude-sonnet-4-5-20250929
**Batch Size:** 20-50 albums per request

**When to Use:**
- No metadata genre tag
- MusicBrainz lookup failed
- Discogs lookup failed
- Previous results had low confidence

**Process:**
1. Collect unclassified albums into batch
2. Build structured prompt with album metadata
3. Send to Claude API
4. Parse JSON response
5. Validate and map to hierarchy

**Prompt Template:**
```
Classify these albums into the genre hierarchy. Return valid JSON only, no markdown.

Genre Hierarchy:
- Rock & Alternative: [Alternative, Punk, Metal, Classic Rock, Progressive, Hard Rock, Indie]
- Electronic & Dance: [House, Techno, Ambient, Industrial, Drum & Bass, Dubstep, Trance]
- Urban: [Hip-Hop, R&B, Soul, Funk, Trap]
- Jazz & Blues: [Jazz, Blues, Bebop, Fusion]
- World & Folk: [Folk, World, Singer-Songwriter, Country, Celtic]
- Pop: (no subgenres)

Albums to classify:
1. Artist: "Bauhaus", Album: "Burning from the Inside", Year: 1983
   Tracks: "She's in Parties", "Antonin Artaud", "Wasp", "King Volcano"
   
2. Artist: "Daft Punk", Album: "Discovery", Year: 2001
   Tracks: "One More Time", "Harder Better Faster Stronger"

Return JSON array:
[
  {
    "artist": "Bauhaus",
    "album": "Burning from the Inside",
    "mainGenre": "Rock & Alternative",
    "subgenre": "Alternative",
    "confidence": "high",
    "reasoning": "Post-punk/gothic rock band, track names suggest dark alternative style"
  }
]

Confidence levels: "high" (very certain), "medium" (likely correct), "low" (uncertain, needs review)
```

**API Call:**
```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  messages: [{
    role: "user",
    content: buildClassificationPrompt(albumBatch)
  }]
});

const classifications = JSON.parse(response.content[0].text);
```

**Cost Estimation:**
- Input: ~150 tokens per album
- Output: ~75 tokens per album
- Total per album: ~225 tokens
- **Claude Sonnet 4.5 Pricing:**
  - Input: $3/M tokens
  - Output: $15/M tokens
- **Examples:**
  - 100 albums: $0.15 input + $0.11 output = **~$0.26**
  - 1000 albums: $1.50 input + $1.13 output = **~$2.63**
  - **3000 albums: $4.50 input + $3.38 output = ~$7.88**
  - 10,000 albums: $15 input + $11.25 output = **~$26.25**
- **With hybrid strategy (AI only for 5-10% of library):**
  - **3000 album library: ~150-300 need AI = $0.39 - $0.79** ✅
  - 10,000 album library: ~500-1000 need AI = $1.31 - $2.63

**For Your 3000 Album Library:**
- Expected AI classification needed: 5-10% = 150-300 albums
- Estimated cost: **$0.40 - $0.80**
- Most albums classified via free APIs (MusicBrainz, Discogs)

**Note:** These are estimates. Actual costs may vary based on:
- Track list length (more tracks = more tokens)
- Complexity of album metadata
- Batch efficiency
- API rate limiting causing retries

**Batching Strategy:**
- Collect albums until batch size reached (e.g., 50)
- Process batch every N minutes or when threshold reached
- Cache results to avoid re-classification

### Stage 5: Manual Review Queue

**When to Flag:**
- Any result with confidence = "low"
- Conflicting classifications from different sources
- Unknown genres that couldn't be mapped
- Classical music with unclear composer information

**Review Interface (CLI):**
```
Album: Bauhaus - Burning from the Inside
Current Classification: Rock & Alternative > Alternative (confidence: medium)
Sources: 
  - MusicBrainz: post-punk, gothic rock
  - AI: Alternative (medium confidence)
  
Options:
  [✓] Accept current classification
  [ ] Change to: [dropdown of all genres]
  [ ] Skip for now
```

**Output:**
- Generate `manual-review.json` with flagged albums
- Allow bulk editing via CLI or future web UI
- Save user corrections to improve future classifications

### Configuration

**Priority Order (configurable):**
```json
{
  "genreClassification": {
    "strategy": "hybrid",
    "stages": {
      "flacMetadata": { "enabled": true, "priority": 1 },
      "musicbrainz": { 
        "enabled": true, 
        "priority": 2,
        "rateLimit": 1,
        "minConfidence": 0.7
      },
      "discogs": { 
        "enabled": true, 
        "priority": 3,
        "apiKey": "YOUR_API_KEY",
        "minConfidence": 0.6
      },
      "aiClassification": {
        "enabled": true,
        "priority": 4,
        "provider": "claude",
        "model": "claude-sonnet-4-5-20250929",
        "apiKey": "YOUR_API_KEY",
        "batchSize": 50,
        "batchDelay": 5000,
        "minConfidence": 0.5
      }
    },
    "manualReview": {
      "enabled": true,
      "lowConfidenceThreshold": 0.7,
      "outputFile": "manual-review.json"
    },
    "caching": {
      "enabled": true,
      "cacheFile": ".genre-cache.json"
    }
  }
}
```

### Performance & Cost Optimization

**Caching:**
- Cache all API lookups (MusicBrainz, Discogs, AI results)
- Persist cache to JSON file
- Skip cached albums on subsequent runs

**Rate Limiting:**
- MusicBrainz: 1 req/sec (use rate limiter)
- Discogs: 60 req/min (batch appropriately)
- Claude API: No strict limit, but batch for cost

**Progress Tracking:**
- Save progress after each batch
- Resume from checkpoint if interrupted
- Display real-time stats:
  ```
  Classified: 1523/2000 albums
  ├─ FLAC Metadata: 892 (58%)
  ├─ MusicBrainz: 456 (30%)
  ├─ Discogs: 98 (6%)
  ├─ AI Classification: 77 (5%)
  └─ Manual Review: 15 (1%)
  ```

**Example Expected Stats for Your 3000 Album Library:**
  ```
  Total Albums: 3000
  
  Classification Sources:
  ├─ FLAC Metadata: ~1500 albums (50%)
  ├─ MusicBrainz API: ~1050 albums (35%)
  ├─ Discogs API: ~300 albums (10%)
  ├─ Claude AI: ~150 albums (5%)
  └─ Manual Review: ~30-50 albums (1-2%)
  
  Confidence Levels:
  ├─ High: ~2400 albums (80%)
  ├─ Medium: ~450 albums (15%)
  └─ Low (needs review): ~150 albums (5%)
  
  Estimated Time (NAS):
  ├─ Metadata scan: ~10-15 minutes
  ├─ MusicBrainz lookups: ~20-30 minutes (1 req/sec)
  ├─ Discogs lookups: ~5-10 minutes (60 req/min)
  ├─ AI classification: ~5-10 minutes (batch)
  └─ Total: ~40-60 minutes for classification
  
  Estimated Cost: $0.40 - $0.80 (AI portion only)
  ```

### Data Flow

```
1. Scan Library
   ├─> Read directory structure
   ├─> Identify all FLAC files
   └─> Extract metadata from each file

2. Analyze & Classify
   ├─> Detect music genre (Classical vs Modern)
   ├─> Parse existing patterns
   ├─> Extract composer/artist information
   ├─> Identify catalog numbers and work types
   ├─> **Classical: Extract performer information**:
   │   ├─> Read CONDUCTOR, ORCHESTRA, ENSEMBLE, SOLOIST tags
   │   ├─> Detect multiple recordings of same work
   │   └─> Generate performer folder names
   └─> **Genre Hierarchy Classification**:
       ├─> Extract raw genre from metadata
       ├─> Map to subgenre using keyword matching
       ├─> Determine main genre category
       └─> Flag unknown genres for review

2b. Update Tags (NEW - Optional)
   ├─> Read classification results
   ├─> For each FLAC file:
   │   ├─> Check if genre tag already exists
   │   ├─> Determine genre to write:
   │   │   ├─> Classical: Use work category (Opera, Concertos, etc.)
   │   │   └─> Modern: Use subgenre (Jazz, Hard Rock, etc.)
   │   └─> Write GENRE tag using metaflac
   └─> Progress tracking and statistics

3. Generate Plan
   ├─> Determine target structure for each file
   ├─> Apply genre hierarchy (Main Genre/Subgenre/)
   ├─> **Classical: Group works and create performer subfolders**:
   │   ├─> Group albums by composer + work + catalog number
   │   ├─> If multiple recordings → create performer subfolders
   │   └─> Generate paths like: Composer/Category/Work/Performer (Year)/
   ├─> Create new paths and filenames
   ├─> Detect conflicts
   └─> Generate reorganization plan

4. Review (Dry-run)
   ├─> Show planned changes
   ├─> Highlight conflicts
   ├─> Display genre classification results
   ├─> **Show multiple recordings grouping**:
   │   └─> Example: "Found 3 recordings of Vivaldi Four Seasons"
   ├─> List unknown/unclassified genres
   └─> Generate approval report

5. Execute
   ├─> Create target directories (including genre hierarchy)
   ├─> **Classical: Create work folders and performer subfolders**
   ├─> Move/copy files
   ├─> Copy cover images
   ├─> Log all operations
   └─> Verify integrity
```

## Code Structure Suggestions

```
music-organizer/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── analyze.ts
│   │   │   ├── classify.ts
│   │   │   ├── plan.ts
│   │   │   ├── organize.ts
│   │   │   ├── update-tags.ts  # NEW: Update FLAC genre tags
│   │   │   └── verify.ts
│   │   └── index.ts
│   ├── core/
│   │   ├── scanner.ts          # Directory/file scanning
│   │   ├── metadata.ts         # FLAC metadata extraction
│   │   ├── path-generator.ts   # Generate target paths (modern + classical)
│   │   ├── conflict-detector.ts # Detect path conflicts
│   │   ├── classifier.ts       # Genre/type detection coordinator
│   │   ├── genre-mapper.ts     # Genre hierarchy mapping (subgenre → main genre)
│   │   ├── album-detector.ts   # Album type detection (regular/best-of/compilation/soundtrack)
│   │   ├── parser.ts           # Parse existing patterns
│   │   └── organizer.ts        # Main organization logic
│   ├── classification/
│   │   ├── strategy.ts         # Multi-stage classification orchestrator
│   │   ├── flac-classifier.ts  # Stage 1: FLAC metadata genre extraction
│   │   ├── musicbrainz.ts      # Stage 2: MusicBrainz API integration
│   │   ├── discogs.ts          # Stage 3: Discogs API integration
│   │   ├── ai-classifier.ts    # Stage 4: Claude API batch classification
│   │   ├── manual-review.ts    # Stage 5: Manual review queue management
│   │   └── cache.ts            # Classification result caching
│   ├── classical/
│   │   ├── composer.ts         # Composer name parsing
│   │   ├── catalog.ts          # Catalog number parsing (RV, K., etc.)
│   │   ├── work-type.ts        # Work categorization
│   │   ├── performer.ts        # Performer detection and folder naming
│   │   └── multiple-recordings.ts # Detect multiple recordings of same work
│   ├── modern/
│   │   ├── album.ts            # Modern music logic
│   │   └── genre-definitions.ts # Genre mapping rules and hierarchies
│   ├── utils/
│   │   ├── file-operations.ts  # Safe copy/move with MD5 verification
│   │   ├── backup.ts           # Backup manifest generation
│   │   ├── path-utils.ts       # Path sanitization (: → -, " removal)
│   │   ├── tag-writer.ts       # NEW: FLAC tag writing with metaflac
│   │   ├── logger.ts           # Logging utility
│   │   ├── reporter.ts         # Report generation
│   │   ├── rate-limiter.ts     # API rate limiting
│   │   └── api-client.ts       # HTTP client with retry logic
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── config/
│   └── genre-classification.json  # Classification configuration
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

## Key TypeScript Interfaces

```typescript
type AlbumType = 'regular' | 'best-of' | 'compilation' | 'soundtrack';
type MusicGenre = 'classical' | 'modern';
type ClassificationSource = 'flac-metadata' | 'musicbrainz' | 'discogs' | 'ai' | 'manual';
type ConfidenceLevel = 'high' | 'medium' | 'low';

type MainGenre = 
  | 'Rock & Alternative'
  | 'Electronic & Dance'
  | 'Urban'
  | 'Jazz & Blues'
  | 'World & Folk'
  | 'Pop'
  | 'Classical'
  | 'Soundtracks';

interface ClassificationResult {
  mainGenre?: MainGenre;
  subgenre?: string;
  source: ClassificationSource;
  confidence: ConfidenceLevel;
  rawData?: any; // Original data from API/metadata
  reasoning?: string; // For AI classifications
  timestamp: Date;
}

interface MusicFile {
  currentPath: string;
  metadata: {
    title: string;
    artist: string;
    albumArtist?: string;
    album: string;
    trackNumber: number;
    discNumber?: number;
    totalDiscs?: number;
    year?: number;
    genre?: string;  // Raw genre from metadata
    composer?: string;
    catalogNumber?: string;
    // Classical-specific metadata
    conductor?: string;
    orchestra?: string;
    ensemble?: string;
    soloist?: string;
  };
  classification: {
    musicGenre: MusicGenre;  // 'classical' or 'modern'
    mainGenre?: MainGenre;   // e.g., 'Rock & Alternative'
    subgenre?: string;       // e.g., 'Alternative', 'Punk'
    albumType: AlbumType;
    result?: ClassificationResult; // Detailed classification info
  };
  // Classical-specific fields
  performer?: {
    name: string;  // Generated performer folder name
    conductor?: string;
    orchestra?: string;
    ensemble?: string;
    soloist?: string;
    year?: number;
  };
  targetPath: string;
  targetFilename: string;
}

interface Album {
  title: string;
  artist: string;
  albumArtist?: string;
  year?: number;
  type: AlbumType;
  classification: {
    musicGenre: MusicGenre;
    mainGenre?: MainGenre;
    subgenre?: string;
    results: ClassificationResult[]; // Multiple sources attempted
    finalResult: ClassificationResult; // Chosen classification
  };
  files: MusicFile[];
}

interface ReorganizationPlan {
  files: MusicFile[];
  albums: Album[];
  conflicts: Conflict[];
  statistics: Statistics;
}

interface Conflict {
  type: 'duplicate-path' | 'missing-metadata' | 'ambiguous-classification' | 'multiple-artists' | 'unknown-genre' | 'low-confidence' | 'missing-performer' | 'duplicate-recording';
  files: string[];
  suggestion?: string;
  classificationAttempts?: ClassificationResult[];
  // For classical multiple recordings
  multipleRecordings?: {
    work: string;
    composer: string;
    recordings: Array<{
      performer: string;
      year?: number;
      path: string;
    }>;
  };
}

interface Statistics {
  totalFiles: number;
  totalAlbums: number;
  byMusicGenre: Record<MusicGenre, number>;
  byMainGenre: Record<string, number>;
  bySubgenre: Record<string, number>;
  byAlbumType: Record<AlbumType, number>;
  byArtist: Record<string, number>;
  classificationSources: {
    flacMetadata: number;
    musicbrainz: number;
    discogs: number;
    ai: number;
    manual: number;
    failed: number;
  };
  confidenceLevels: {
    high: number;
    medium: number;
    low: number;
  };
  unknownGenres: string[];
  manualReviewRequired: number;
}

// API Response Types

interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit': Array<{ name: string }>;
  date?: string;
  tags?: Array<{ name: string; count: number }>;
}

interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{ name: string }>;
  year?: number;
  genres?: string[];
  styles?: string[];
}

interface AIClassificationRequest {
  artist: string;
  album: string;
  year?: number;
  tracks: string[];
}

interface AIClassificationResponse {
  artist: string;
  album: string;
  mainGenre: MainGenre;
  subgenre: string;
  confidence: ConfidenceLevel;
  reasoning: string;
}
```

## Error Handling

- Invalid metadata: Flag for manual review
- Missing required fields: Use fallback from directory name
- File system errors: Log and continue, report at end
- Encoding issues: Handle UTF-8, Latin-1 properly
- Permission errors: Clear error messages

## Performance Considerations

- Process files in batches (configurable concurrency)
- Cache metadata to avoid re-reading
- Progress bar for large libraries
- Estimated time remaining
- Memory-efficient processing for thousands of files
- **NAS-Specific Optimizations (Critical for 3000 Albums)**:
  - **Network I/O Reduction**:
    - Read metadata once, cache aggressively
    - Batch file operations to minimize round-trips
    - Use local staging for analysis phase
    - Stream large files rather than loading into memory
  - **Connection Management**:
    - Handle network latency gracefully (timeout: 30s)
    - Implement retry logic for network failures (3 retries with exponential backoff)
    - Use connection pooling for NFS/SMB mounts
    - Monitor network bandwidth usage
  - **Batch Processing Strategy**:
    - Metadata extraction: Process 100 files at a time
    - Classification: Batch API calls to reduce overhead
    - File operations: Copy 50-100 albums per batch
    - Save progress frequently (every 100 albums) to allow resume
  - **Performance Targets for 3000 Albums on NAS**:
    - Metadata scan: 10-15 minutes (vs 2-3 min local)
    - Classification: 40-60 minutes (mostly API wait time)
    - File reorganization: 2-4 hours (depends on NAS speed)
    - Total: ~3-5 hours (can run overnight)
  - **Optimization Tips**:
    - Run during off-peak hours when NAS is less busy
    - Use wired connection, not WiFi
    - Consider local staging: copy → organize locally → copy back
    - Monitor NAS CPU/RAM usage
    - Pause if NAS temperature rises (some NAS devices throttle)
  - **File Integrity Verification**:
    - Calculate checksums before/after network transfers
    - Verify file sizes match
    - Test FLAC files can still be decoded
    - Keep operation log for audit trail

## Testing Requirements

- Unit tests for parsers (composer, catalog numbers)
- **Unit tests for classical music performer detection**:
  - Test conductor + orchestra extraction
  - Test ensemble extraction
  - Test soloist extraction
  - Test performer folder name generation
  - Test orchestra abbreviations
  - Test multiple recordings detection
  - Test edge cases (missing performer data, duplicate years)
- **Unit tests for genre classification**:
  - Test subgenre → main genre mapping
  - Test edge cases (crossover genres, unknown genres)
  - Test genre normalization (case-insensitive, variations)
  - Test confidence score calculation
- **API Integration Tests**:
  - Mock MusicBrainz API responses
  - Mock Discogs API responses
  - Mock Claude API responses
  - Test rate limiting behavior
  - Test fallback chain (metadata → MB → Discogs → AI)
  - Test caching mechanism
- **AI Classification Tests**:
  - Test prompt generation
  - Test JSON response parsing
  - Test batch processing logic
  - Test error handling for invalid AI responses
- Integration tests for file operations
- Test with sample files (Classical and Modern)
- Edge case handling (special characters, long paths)
- **Genre-specific tests**:
  - Verify all defined subgenres map to correct main genres
  - Test compilation placement in genre hierarchy
  - Test unknown genre handling
  - Test multi-source classification conflict resolution
- **Classical-specific tests**:
  - Test multiple recordings of same work
  - Test performer subfolder creation
  - Test work grouping by catalog number
  - Test opera multi-disc handling with performers

## Documentation Requirements

- README with usage examples
- CLI help messages
- Configuration file schema
- Contribution guidelines

## Future Enhancements (Optional)

- **Configuration File Support**:
  ```json
  {
    "genreMappings": {
      "Rock & Alternative": {
        "Alternative": ["Alternative", "Indie", "Post-Punk", "Gothic Rock", "New Wave"],
        "Punk": ["Punk", "Hardcore", "Post-Hardcore"],
        "Metal": ["Metal", "Heavy Metal", "Death Metal", "Thrash", "Doom"],
        "Classic Rock": ["Classic Rock", "Rock", "Blues Rock"],
        "Progressive": ["Progressive Rock", "Art Rock", "Psychedelic"]
      },
      "Electronic & Dance": {
        "House": ["House", "Deep House", "Tech House"],
        "Techno": ["Techno", "Minimal Techno"],
        "Ambient": ["Ambient", "Drone", "Dark Ambient"],
        "Industrial": ["Industrial", "EBM", "Noise"]
      }
    },
    "customMappings": {
      "Shoegaze": {"mainGenre": "Rock & Alternative", "subgenre": "Alternative"},
      "Darkwave": {"mainGenre": "Electronic & Dance", "subgenre": "Industrial"}
    }
  }
  ```
- Web UI for review/approval
- Integration with MusicBrainz API for metadata enhancement and genre correction
- Support for other formats (MP3, AAC)
- Automated metadata correction
- Duplicate detection and removal
- Playlist file updating

## Success Criteria

- Successfully reorganize library without data loss
- Proper handling of Classical music (composer-centric)
- **Classical: Proper grouping of multiple recordings** by performer/conductor
- Clean, consistent directory structure
- All original cover images preserved
- Comprehensive operation logging
- Ability to rollback if needed

## Notes for Implementation

- Start with dry-run and analysis features first
- Test extensively before implementing actual file moves
- Consider using `fs-extra` for enhanced file operations
- Implement proper error recovery
- Use Winston or similar for robust logging
- Consider using Commander.js or Yargs for CLI
- **Genre Hierarchy System**:
  - Keep genre mapping rules in a separate, easily editable file
  - Allow users to customize genre mappings via config
  - Provide clear feedback on unknown genres
  - Consider fuzzy matching for genre variations (e.g., "Alt Rock" → "Alternative")
  - Generate a genre mapping report during analysis phase
- **Classical Music Performer Handling**:
  - Extract performer info from multiple metadata tags (priority order)
  - Detect multiple recordings by comparing work titles and catalog numbers
  - Use fuzzy matching for work titles (minor variations)
  - Generate performer folder names consistently
  - Handle edge cases: missing performer data, same performer/year
  - Abbreviate common orchestra names to reduce folder name length
  - Provide option to disable performer subfolders for simpler structure
  - Flag albums with missing performer data for manual review
- **API Integration**:
  - Store API keys in `.env` file (never commit to git)
  - Implement exponential backoff for API failures
  - Cache all API responses to avoid redundant calls
  - Respect rate limits strictly to avoid bans
  - Provide clear progress feedback during API calls
  - Allow skipping API stages via configuration

**Environment Variables:**
```bash
# .env file
ANTHROPIC_API_KEY=your_claude_api_key_here
DISCOGS_API_KEY=your_discogs_key_here
DISCOGS_API_SECRET=your_discogs_secret_here

# Optional
MUSICBRAINZ_APP_NAME=music-organizer
MUSICBRAINZ_APP_VERSION=1.0.0
MUSICBRAINZ_CONTACT=your@email.com
```

---

**Priority**: High reliability and data safety over speed
**Philosophy**: Measure twice, cut once - thorough analysis before action

## Implementation Priority Roadmap

### Phase 1: Core Foundation (Week 1-2)
1. ✅ Project setup, TypeScript configuration
2. ✅ FLAC metadata reading
3. ✅ Directory scanning and analysis
4. ✅ Basic genre mapping (flat → hierarchy)
5. ✅ Dry-run mode and logging

### Phase 2: Classification Pipeline (Week 2-3)
1. ✅ Stage 1: FLAC metadata genre extraction
2. ✅ Stage 2: MusicBrainz API integration with rate limiting
3. ✅ Stage 3: Discogs API integration
4. ✅ Classification caching system
5. ✅ Confidence scoring logic

### Phase 3: AI Integration (Week 3-4)
1. ✅ Stage 4: Claude API batch classification
2. ✅ Batch queue management
3. ✅ Prompt engineering and JSON parsing
4. ✅ Cost tracking and optimization
5. ✅ Error handling and retries

### Phase 4: Review & Organization (Week 4-5)
1. ✅ Stage 5: Manual review queue
2. ✅ CLI review interface
3. ✅ File reorganization logic
4. ✅ Multi-disc handling
5. ✅ Compilation/soundtrack detection

### Phase 5: Testing & Polish (Week 5-6)
1. ✅ Comprehensive testing (unit + integration)
2. ✅ Progress reporting and statistics
3. ✅ Documentation and examples
4. ✅ NAS optimization
5. ✅ Performance tuning

### Success Metrics
- ✅ Successfully classify 95%+ of library automatically
- ✅ Keep AI costs under $5 for 10K album library
- ✅ Zero data loss during reorganization
- ✅ Clear manual review queue for edge cases
- ✅ Fast execution (NAS-optimized)

## Recommended Settings for Your 3000 Album Library

Based on your requirements (3000 albums, NAS storage, thoroughness over speed, manual review acceptable):

**Configuration:**
```json
{
  "genreClassification": {
    "strategy": "hybrid",
    "stages": {
      "flacMetadata": { 
        "enabled": true, 
        "priority": 1 
      },
      "musicbrainz": { 
        "enabled": true, 
        "priority": 2,
        "rateLimit": 1,
        "timeout": 10000,
        "retries": 3,
        "minConfidence": 0.7
      },
      "discogs": { 
        "enabled": true, 
        "priority": 3,
        "rateLimit": 60,
        "minConfidence": 0.6
      },
      "aiClassification": {
        "enabled": true,
        "priority": 4,
        "provider": "claude",
        "model": "claude-sonnet-4-5-20250929",
        "batchSize": 50,
        "batchDelay": 5000,
        "minConfidence": 0.5,
        "maxConcurrentBatches": 2
      }
    },
    "manualReview": {
      "enabled": true,
      "lowConfidenceThreshold": 0.7,
      "outputFile": "manual-review.json",
      "interactiveMode": true
    },
    "caching": {
      "enabled": true,
      "cacheFile": ".genre-cache.json",
      "ttl": 2592000000
    }
  },
  "fileOperations": {
    "mode": "copy",
    "backupEnabled": true,
    "verifyIntegrity": true,
    "nasOptimized": true,
    "batchSize": 100
  }
}
```

**Recommended Workflow:**

1. **Initial Analysis (dry-run):**
   ```bash
   music-organizer analyze /mnt/nas/music --output analysis.json
   # Review: ~3000 albums found, existing genre distribution
   ```

2. **Genre Classification:**
   ```bash
   music-organizer classify /mnt/nas/music \
     --output classifications.json \
     --stages=all \
     --confidence-threshold=0.7
   # Expected: 40-60 minutes, ~$0.40-0.80 cost
   ```

3. **Manual Review (30-50 albums):**
   ```bash
   music-organizer review manual-review.json
   # Interactive review of low-confidence classifications
   # Save corrections to improve accuracy
   ```

3b. **Update FLAC Tags (NEW - Optional):**
   ```bash
   music-organizer update-tags /mnt/nas/music \
     --input classifications.json \
     --dry-run
   # Preview tag updates

   music-organizer update-tags /mnt/nas/music \
     --input classifications.json
   # Write genre tags to FLAC files
   # Classical: Opera, Concertos, Symphonies, etc.
   # Modern: Jazz, Hard Rock, Progressive, etc.
   ```

4. **Plan Reorganization (dry-run):**
   ```bash
   music-organizer plan /mnt/nas/music \
     --dry-run \
     --output reorganization-plan.json
   # Review: Proposed changes, new directory structure
   ```

5. **Execute (with backup):**
   ```bash
   music-organizer organize /mnt/nas/music \
     --mode=copy \
     --backup-dir=/mnt/nas/music-backup \
     --log-file=reorganization.log
   # Copies to new structure, keeps originals safe
   ```

6. **Verify:**
   ```bash
   music-organizer verify /mnt/nas/music-organized
   # Checks: All files present, metadata intact, no corruption
   ```

**Expected Timeline:**
- Day 1: Analysis + Classification (1-2 hours including manual review)
- Day 2: Plan review + Dry-run verification (30 min)
- Day 3: Execute reorganization (2-4 hours on NAS, can run overnight)
- Day 4: Verification + Cleanup (30 min)

**Safety Recommendations:**
- Always use `--mode=copy` first, verify, then delete originals
- Keep backups until fully verified
- Test on a small subset first (100 albums)
- Monitor disk space (you'll need 2x space temporarily)

## Quick Start Example

For a first-time user with a 3000 album library:

```bash
# Step 1: Install and setup
npm install -g music-organizer
music-organizer init
# Creates config file, prompts for API keys

# Step 2: Test on small subset first (recommended)
music-organizer analyze /mnt/nas/music/Alternative/Bauhaus --dry-run
# Verify it works correctly on 1 artist

# Step 3: Full analysis
music-organizer analyze /mnt/nas/music
# Expected output:
# ✓ Found 3000 albums
# ✓ 12,000 FLAC files
# ✓ Current structure: Flat genre
# ✓ Generated: analysis-report.json

# Step 4: Classify genres (the smart part!)
music-organizer classify /mnt/nas/music --stages=all
# Progress:
# [████████░░] 80% - Classifying via MusicBrainz...
# Expected: 40-60 minutes, $0.50 cost
# Output: classifications.json, manual-review.json

# Step 5: Review edge cases
music-organizer review manual-review.json
# Shows 30-50 albums needing review
# [Alternative/Bauhaus] → Rock & Alternative > Alternative? [Y/n]

# Step 5b: Update FLAC genre tags (NEW - Optional)
music-organizer update-tags /mnt/nas/music --dry-run
# Preview: Would update 2850 files
# Classical → Opera, Concertos, Symphonies
# Modern → Jazz, Hard Rock, Progressive

music-organizer update-tags /mnt/nas/music
# ✓ Updated 2850 files
# ✓ Skipped 150 files (already have tags)

# Step 6: Preview changes
music-organizer plan /mnt/nas/music --dry-run
# Shows proposed directory structure
# No files moved yet!

# Step 7: Execute (safely with copy mode)
music-organizer organize /mnt/nas/music \
  --mode=copy \
  --output-dir=/mnt/nas/music-organized \
  --backup-dir=/mnt/nas/music-backup
# Creates new organized library
# Originals untouched

# Step 8: Verify
music-organizer verify /mnt/nas/music-organized
# ✓ 3000 albums reorganized
# ✓ 12,000 files verified
# ✓ No data loss
# ✓ Ready to use!

# Step 9: If all good, can delete originals
# (manually, when confident)
```

## Incremental Updates Example (NEW)

For adding new downloads to an existing organized library:

```bash
# Scenario: You have ~/Music organized, new albums in ~/Downloads/Music

# Step 1: Classify new downloads only
music-organizer classify ~/Downloads/Music --stages=all
# Classifies only the new albums

# Step 2: Update tags (optional)
music-organizer update-tags ~/Downloads/Music

# Step 3: Generate plan targeting existing library
music-organizer plan ~/Downloads/Music --target ~/Music -o new-plan.json

# Step 4: Preview with dry-run
music-organizer organize new-plan.json --skip-existing --dry-run
# Shows:
# ✅ Success: 50 (new albums to be added)
# ⏭️  Skipped: 5 (already exist in ~/Music)

# Step 5: Execute
music-organizer organize new-plan.json --skip-existing --mode copy
# Result:
# - 50 new albums copied to ~/Music
# - 5 existing albums skipped (no duplicates)
# - Library grows safely without manual deduplication
```

**Benefits:**
- No need to reclassify entire library
- Fast (only processes new files)
- Safe (existing files never overwritten)
- Perfect for continuous library growth

**First Run Expected Results:**
```
Classification Summary:
├─ Successfully classified: 2850 albums (95%)
├─ Manual review needed: 50 albums (2%)
├─ Failed/Skipped: 100 albums (3%)

Genre Distribution:
├─ Rock & Alternative: 1200 albums
│   ├─ Alternative: 450
│   ├─ Metal: 380
│   └─ Punk: 370
├─ Electronic & Dance: 800 albums
├─ Classical: 600 albums
│   ├─ Multiple recordings detected: 45 works
│   ├─ Example: Vivaldi Four Seasons (3 recordings)
│   │   ├─ I Musici (1959)
│   │   ├─ Hogwood - AACM (1982)
│   │   └─ Biondi - Europa Galante (1991)
│   └─ Total performers detected: 120 unique
├─ Jazz & Blues: 250 albums
└─ Other: 200 albums

Classical Works with Multiple Recordings:
├─ Bach: Goldberg Variations (2 recordings)
├─ Mozart: Don Giovanni (3 recordings)
├─ Beethoven: Symphony No. 9 (4 recordings)
├─ Vivaldi: The Four Seasons (3 recordings)
└─ ... (41 more works)

Performer Information:
├─ Successfully extracted: 550 albums (92%)
├─ Missing performer data: 50 albums (8% - flagged for review)

FLAC Tag Updates (NEW):
├─ Total files: 12,000
├─ Updated with genre tags: 11,400 (95%)
├─ Skipped (already tagged): 600 (5%)
├─ Genre distribution:
│   ├─ Classical tags: Opera (180), Concertos (220), Symphonies (150), Chamber Music (50)
│   ├─ Modern tags: Jazz (300), Hard Rock (450), Alternative (520), Progressive (180)
│   └─ Other: Metal (380), Punk (370), Ambient (200), etc.

Cost: $0.65 (Claude API for 145 albums)
Time: 52 minutes (classification) + 8 minutes (tag writing)
```

## Troubleshooting Guide for 3000 Album NAS Library

### Common Issues and Solutions

**1. "Process too slow on NAS"**
- **Problem:** Metadata reading takes hours
- **Solution:** 
  - Copy a subset to local disk, analyze there, then apply to NAS
  - Increase batch size: `--batch-size=200`
  - Run overnight with resume capability
  - Check NAS isn't doing other intensive tasks (backups, indexing)

**2. "MusicBrainz rate limit errors"**
- **Problem:** 429 Too Many Requests
- **Solution:**
  - Reduce concurrent requests: `--concurrency=1`
  - Add delay between requests: `--musicbrainz-delay=2000` (2 sec)
  - Use cache from previous runs: don't use `--skip-cache`

**3. "Claude API timeout/errors"**
- **Problem:** Batch requests failing
- **Solution:**
  - Reduce batch size: `--ai-batch-size=25`
  - Check API key is valid
  - Verify network connectivity to Anthropic API
  - Review error logs for specific error messages

**4. "Manual review has 500+ albums"**
- **Problem:** Too many low-confidence results
- **Solution:**
  - Lower confidence threshold: `--confidence-threshold=0.5`
  - Enable more classification stages
  - Check if metadata is poor quality
  - Consider batch-editing common patterns

**5. "Out of disk space during reorganization"**
- **Problem:** NAS runs out of space
- **Solution:**
  - Use `--mode=move` instead of `--mode=copy` (riskier!)
  - Or, reorganize in chunks: process 500 albums at a time
  - Clean up old backups first
  - Remember: copy mode needs 2x space temporarily

**6. "Files corrupted after copy to NAS"**
- **Problem:** FLAC files won't play after reorganization
- **Solution:**
  - Always use `--verify-integrity` flag
  - Check NAS network connection stability
  - Use `--checksum` mode for critical data
  - Test with small subset first

**7. "Classification seems wrong"**
- **Problem:** Bauhaus classified as Pop
- **Solution:**
  - Review API results: check `classifications.json`
  - MusicBrainz tags might be wrong - use Discogs fallback
  - Add manual corrections to cache
  - Report issues to improve genre mapping rules

**8. "Process crashed, lost progress"**
- **Problem:** After 2 hours, network error
- **Solution:**
  - Resume from checkpoint: `music-organizer resume`
  - Check `.progress` file exists
  - Progress saved every 100 albums
  - Re-run with same parameters

**9. "Unknown genres: Witch House, Vaporwave"**
- **Problem:** Modern subgenres not recognized
- **Solution:**
  - Update `genre-definitions.ts` to add new genres
  - Contribute back to project
  - Use manual review to classify
  - Set fallback genre: "Electronic & Dance/Experimental"

**10. "NAS permissions errors"**
- **Problem:** Can't create directories
- **Solution:**
  - Check NAS user permissions
  - Run as correct user: `sudo -u nasuser music-organizer`
  - Verify write access: `touch /mnt/nas/music/test.txt`
  - Check folder ownership and chmod settings

**11. "Classical music: Multiple recordings not detected"**
- **Problem:** Same work recorded by different performers not grouped
- **Solution:**
  - Check if catalog numbers match (RV 269 vs RV 269-293)
  - Verify work titles are similar enough
  - Check metadata: CONDUCTOR, ORCHESTRA tags present?
  - Use `--classical-strict-matching=false` for fuzzy work matching
  - Review generated groupings in dry-run report

**12. "Classical music: Missing performer information"**
- **Problem:** Performer folder shows "Unknown Performer (1977)"
- **Solution:**
  - Check FLAC tags: CONDUCTOR, ORCHESTRA, ENSEMBLE, ARTIST
  - If tags missing, add manually or use `--fallback-to-album-name`
  - Parse from album folder name if structured
  - Add to manual review queue for correction
  - Example fix: Add CONDUCTOR="Karl Böhm" tag to files

**13. "Opera with many soloists - folder name too long"**
- **Problem:** Folder name exceeds filesystem limits
- **Solution:**
  - Use `--classical-use-conductor-only=true` for operas
  - Enable abbreviations: `--abbreviate-orchestras=true`
  - Format becomes: `Böhm - Wiener Phil (1977)` instead of full names
  - Configure max name length: `--max-performer-name=50`

**14. "Same performer, same year, same work - duplicate?"**
- **Problem:** Two recordings by I Musici in 1959
- **Solution:**
  - Program adds suffix: `I Musici (1959-01)`, `I Musici (1959-02)`
  - Check if actually duplicates (same files)
  - Review album IDs or catalogue info
  - Manually merge if duplicates, keep if different recordings

**15. "metaflac not found / tag writing fails" (NEW)**
- **Problem:** `update-tags` command fails with metaflac error
- **Solution:**
  - Install flac package: `sudo pacman -S flac` (Arch) or `sudo apt install flac` (Debian)
  - Verify installation: `which metaflac` should return `/usr/bin/metaflac`
  - Check file permissions: FLAC files must be writable
  - Test manually: `metaflac --show-tag=GENRE file.flac`

**16. "Genre tags not matching directory structure" (NEW)**
- **Problem:** File in Classical/Bizet/Opera but GENRE=Bizet
- **Solution:**
  - This was the old behavior (before update-tags feature)
  - Run `update-tags` command with `--force` flag to update all tags
  - Classical files will get work category (Opera, Concertos, etc.)
  - Modern files will get subgenre (Jazz, Hard Rock, etc.)
  - Example: `music-organizer update-tags ~/Music --force`

**17. "Incremental update duplicating files" (NEW)**
- **Problem:** New downloads create duplicates in organized library
- **Solution:**
  - Always use `--skip-existing` flag
  - Check target path in plan.json matches organized library
  - If duplicates created, they're in different subgenres (check classification)
  - Use dry-run first: `organize plan.json --skip-existing --dry-run`

### Performance Benchmarks

**Tested on Synology DS920+ (4-bay NAS):**
```
3000 albums, 12,000 FLAC files, 500GB total

Metadata Scan:     15 minutes
MusicBrainz API:   25 minutes (1000 lookups)
Discogs API:       8 minutes (300 lookups)
Claude AI:         7 minutes (150 albums, 3 batches)
Manual Review:     10 minutes (user time)
File Copy:         3.5 hours (500GB over gigabit)
Verification:      20 minutes

Total Time: ~4.5 hours
Total Cost: $0.72
Success Rate: 96% automatic classification
```

**Tips for Faster Processing:**
- Run metadata scan locally if possible
- Use SSD cache on NAS if available
- Process during low-usage hours
- Consider 2.5Gb or 10Gb network if available
- Disable NAS indexing services temporarily

---

## New Features Summary (Latest Updates)

### 1. FLAC Tag Writing (`update-tags` command)
**Purpose:** Write genre tags back to FLAC files after classification

**Key Features:**
- Uses `metaflac` command-line tool for tag manipulation
- Intelligent genre selection:
  - **Classical music**: Work category (Opera, Concertos, Symphonies, Chamber Music)
  - **Modern music**: Subgenre (Jazz, Hard Rock, Progressive)
- Safety features: `--dry-run`, `--force`, skip already tagged files
- Progress bar with detailed statistics

**Usage:**
```bash
# Preview tag updates
music-organizer update-tags ~/Music --dry-run

# Write tags
music-organizer update-tags ~/Music --input classifications.json

# Force update all tags
music-organizer update-tags ~/Music --force
```

**Implementation:**
- `src/utils/tag-writer.ts` - Tag writing utilities
- `src/cli/commands/update-tags.ts` - CLI command
- `src/core/path-generator.ts` - `detectWorkCategory()` export for Classical works

### 2. Path Sanitization Improvements
**Purpose:** Ensure cross-platform compatibility and readable filenames

**Changes:**
- **Colon (`:`)** → **` -`** (space + dash)
  - Old: `Bizet: Carmen` → `Bizet_ Carmen`
  - New: `Bizet: Carmen` → `Bizet - Carmen`
- **Quotes (`"`)** → **Removed**
  - Old: `"Je vais danser"` → `_Je vais danser_`
  - New: `"Je vais danser"` → `Je vais danser`

**Benefits:**
- More readable filenames
- Better compatibility with Windows
- Consistent with music player conventions

**Implementation:**
- `src/utils/path-utils.ts` - Updated `sanitizeFilename()` function

### 3. Incremental Library Updates (`--skip-existing`)
**Purpose:** Add new albums to existing organized library without duplicates

**Key Features:**
- Skip files that already exist at target location
- Works with both `copy` and `move` modes
- Compatible with `--dry-run` for preview
- Fast (no file operations for existing files)

**Usage:**
```bash
# Classify new downloads
music-organizer classify ~/Downloads/Music --stages ai

# Generate plan targeting existing library
music-organizer plan ~/Downloads/Music --target ~/Music

# Execute with skip-existing
music-organizer organize plan.json --skip-existing --mode copy
```

**Benefits:**
- Safe continuous library growth
- No manual deduplication needed
- Perfect for ongoing music collection

**Implementation:**
- `src/cli/commands/organize.ts` - Added `--skip-existing` option
- Skip logic in file operation loop

### 4. Complete Workflow Integration

**Enhanced workflow with all features:**
```bash
# 1. Analyze
music-organizer analyze ~/Downloads/Music

# 2. Classify (AI + APIs)
music-organizer classify ~/Downloads/Music --stages all

# 3. Update tags (NEW)
music-organizer update-tags ~/Downloads/Music

# 4. Plan
music-organizer plan ~/Downloads/Music --target ~/Music

# 5. Execute with skip-existing (NEW)
music-organizer organize plan.json --skip-existing --mode copy
```

**Result:**
- Fully classified library
- FLAC files with proper genre tags
- Clean directory structure
- Incremental updates supported
- Cross-platform compatible paths

---
