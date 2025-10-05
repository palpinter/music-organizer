/**
 * Core type definitions for music organizer
 */

export type AlbumType = 'regular' | 'best-of' | 'compilation' | 'soundtrack';
export type MusicGenre = 'classical' | 'modern';
export type ClassificationSource = 'flac-metadata' | 'musicbrainz' | 'discogs' | 'ai' | 'manual';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type MainGenre =
  | 'Rock & Alternative'
  | 'Electronic & Dance'
  | 'Urban'
  | 'Jazz & Blues'
  | 'World & Folk'
  | 'Pop'
  | 'Classical'
  | 'Soundtracks';

export interface ClassificationResult {
  mainGenre?: MainGenre;
  subgenre?: string;
  source: ClassificationSource;
  confidence: ConfidenceLevel;
  rawData?: any; // Original data from API/metadata
  reasoning?: string; // For AI classifications
  timestamp: Date;
}

export interface FlacMetadata {
  title?: string;
  artist?: string;
  albumArtist?: string;
  album?: string;
  trackNumber?: number;
  discNumber?: number;
  totalDiscs?: number;
  year?: number;
  genre?: string;
  composer?: string;
  catalogNumber?: string;
  // Classical-specific metadata
  conductor?: string;
  orchestra?: string;
  ensemble?: string;
  soloist?: string;
}

export interface PerformerInfo {
  name: string;  // Generated performer folder name
  conductor?: string;
  orchestra?: string;
  ensemble?: string;
  soloist?: string;
  year?: number;
}

export interface MusicFile {
  currentPath: string;
  metadata: FlacMetadata;
  classification: {
    musicGenre: MusicGenre;  // 'classical' or 'modern'
    mainGenre?: MainGenre;   // e.g., 'Rock & Alternative'
    subgenre?: string;       // e.g., 'Alternative', 'Punk'
    albumType: AlbumType;
    result?: ClassificationResult; // Detailed classification info
  };
  performer?: PerformerInfo;
  targetPath: string;
  targetFilename: string;
}

export interface Album {
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
    finalResult?: ClassificationResult; // Chosen classification
  };
  files: MusicFile[];
}

export interface MultipleRecording {
  work: string;
  composer: string;
  catalogNumber?: string;
  recordings: Array<{
    performer: string;
    year?: number;
    path: string;
    files: MusicFile[];
  }>;
}

export interface Conflict {
  type:
    | 'duplicate-path'
    | 'missing-metadata'
    | 'ambiguous-classification'
    | 'multiple-artists'
    | 'unknown-genre'
    | 'low-confidence'
    | 'missing-performer'
    | 'duplicate-recording';
  files: string[];
  suggestion?: string;
  classificationAttempts?: ClassificationResult[];
  multipleRecordings?: MultipleRecording;
}

export interface Statistics {
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

export interface ReorganizationPlan {
  files: MusicFile[];
  albums: Album[];
  conflicts: Conflict[];
  statistics: Statistics;
}

// API Response Types

export interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit': Array<{ name: string }>;
  date?: string;
  tags?: Array<{ name: string; count: number }>;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{ name: string }>;
  year?: number;
  genres?: string[];
  styles?: string[];
}

export interface AIClassificationRequest {
  artist: string;
  album: string;
  year?: number;
  tracks: string[];
}

export interface AIClassificationResponse {
  artist: string;
  album: string;
  mainGenre: MainGenre;
  subgenre: string;
  confidence: ConfidenceLevel;
  reasoning: string;
}

// Configuration Types

export interface ClassificationConfig {
  strategy: 'hybrid' | 'metadata-only' | 'api-only';
  stages: {
    flacMetadata: StageConfig;
    musicbrainz: MusicBrainzConfig;
    discogs: DiscogsConfig;
    aiClassification: AIConfig;
  };
  manualReview: ManualReviewConfig;
  caching: CachingConfig;
}

export interface StageConfig {
  enabled: boolean;
  priority: number;
}

export interface MusicBrainzConfig extends StageConfig {
  rateLimit: number;
  timeout?: number;
  retries?: number;
  minConfidence: number;
}

export interface DiscogsConfig extends StageConfig {
  apiKey?: string;
  apiSecret?: string;
  rateLimit?: number;
  minConfidence: number;
}

export interface AIConfig extends StageConfig {
  provider: 'claude';
  model: string;
  apiKey?: string;
  batchSize: number;
  batchDelay?: number;
  minConfidence: number;
  maxConcurrentBatches?: number;
}

export interface ManualReviewConfig {
  enabled: boolean;
  lowConfidenceThreshold: number;
  outputFile: string;
  interactiveMode?: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  cacheFile: string;
  ttl?: number;
}

export interface Config {
  genreClassification: ClassificationConfig;
  classical: {
    multipleRecordings: {
      enabled: boolean;
      performerSubfolders: boolean;
      abbreviateOrchestras: boolean;
    };
  };
  fileOperations: {
    mode: 'copy' | 'move';
    backupEnabled: boolean;
    verifyIntegrity: boolean;
  };
}
