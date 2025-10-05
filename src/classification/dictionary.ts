/**
 * Artist/Composer Genre Dictionary
 * Fast lookup for known artists and composers to ensure consistency
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import logger from '../utils/logger';
import { ClassificationResult, MainGenre } from '../types';

interface Dictionary {
  artists: Record<string, string>;
  composers: Record<string, string>;
  metadata: {
    generated: string;
    totalArtists: number;
    totalComposers: number;
    version: string;
  };
}

class GenreDictionary {
  private artists: Map<string, MainGenre> = new Map();
  private composers: Map<string, MainGenre> = new Map();
  private loaded = false;

  /**
   * Load dictionary from config directory
   */
  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    try {
      const configDir = path.join(os.homedir(), '.config', 'music-organizer');
      const dictionaryPath = path.join(configDir, 'genre-dictionary.json');

      if (!(await fs.pathExists(dictionaryPath))) {
        logger.debug('Genre dictionary not found, skipping dictionary lookup');
        this.loaded = true;
        return;
      }

      const data: Dictionary = await fs.readJson(dictionaryPath);

      // Load artists
      for (const [artist, genre] of Object.entries(data.artists)) {
        this.artists.set(artist.toLowerCase(), genre as MainGenre);
      }

      // Load composers
      for (const [composer, genre] of Object.entries(data.composers)) {
        this.composers.set(composer.toLowerCase(), genre as MainGenre);
      }

      logger.info(`Loaded genre dictionary: ${this.artists.size} artists, ${this.composers.size} composers`);
      this.loaded = true;
    } catch (error) {
      logger.warn('Failed to load genre dictionary:', error);
      this.loaded = true; // Mark as loaded to avoid retry
    }
  }

  /**
   * Normalize artist name for lookup
   */
  private normalizeArtistName(artist: string): string {
    // Remove everything after comma (often performers/ensembles)
    const parts = artist.split(',');

    // If first part is very short, keep both
    if (parts[0].trim().length < 10 && parts.length > 1) {
      return parts.slice(0, 2).join(',').trim().toLowerCase();
    }

    return parts[0].trim().toLowerCase();
  }

  /**
   * Extract composer from album title
   */
  private extractComposerFromAlbum(album: string): string | null {
    // Pattern: "Composer: Work" or "Composer - Work"
    const colonMatch = album.match(/^([A-Z][a-zA-Z\s,\.]+)\s*:/);
    if (colonMatch) {
      const composer = colonMatch[1].trim();
      if (composer.length > 2 && composer.length < 50 &&
          !composer.includes('Remaster') &&
          !composer.includes('Edition')) {
        return composer.toLowerCase();
      }
    }
    return null;
  }

  /**
   * Look up genre for an artist/album
   */
  async lookup(artist: string, album: string): Promise<ClassificationResult | null> {
    if (!this.loaded) {
      await this.load();
    }

    // Try artist lookup first
    const normalizedArtist = this.normalizeArtistName(artist);
    const artistGenre = this.artists.get(normalizedArtist);

    if (artistGenre) {
      logger.debug(`Dictionary hit (artist): ${artist} → ${artistGenre}`);
      return {
        mainGenre: artistGenre,
        subgenre: undefined,
        source: 'dictionary',
        confidence: 'high',
        timestamp: new Date()
      };
    }

    // Try composer lookup for classical works
    const composer = this.extractComposerFromAlbum(album);
    if (composer) {
      const composerGenre = this.composers.get(composer);

      if (composerGenre) {
        logger.debug(`Dictionary hit (composer): ${composer} → ${composerGenre}`);
        return {
          mainGenre: composerGenre,
          subgenre: undefined, // Will be determined by path-generator based on work type
          source: 'dictionary',
          confidence: 'high',
          timestamp: new Date()
        };
      }
    }

    return null;
  }

  /**
   * Check if dictionary is available
   */
  isAvailable(): boolean {
    return this.artists.size > 0 || this.composers.size > 0;
  }

  /**
   * Get statistics
   */
  getStats(): { artists: number; composers: number } {
    return {
      artists: this.artists.size,
      composers: this.composers.size
    };
  }
}

// Singleton instance
let dictionaryInstance: GenreDictionary | null = null;

/**
 * Get or create dictionary instance
 */
export function getDictionary(): GenreDictionary {
  if (!dictionaryInstance) {
    dictionaryInstance = new GenreDictionary();
  }
  return dictionaryInstance;
}
