/**
 * Classification result caching system
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ClassificationResult } from '../types';
import logger from '../utils/logger';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'music-organizer');
const CACHE_FILE = path.join(CACHE_DIR, 'genre-cache.json');

interface CacheEntry {
  artist: string;
  album: string;
  year?: number;
  result: ClassificationResult;
}

interface CacheData {
  version: string;
  entries: CacheEntry[];
}

/**
 * Classification cache manager
 */
export class ClassificationCache {
  private cache: Map<string, ClassificationResult> = new Map();
  private cacheFile: string;

  constructor(cacheFile?: string) {
    this.cacheFile = cacheFile || CACHE_FILE;
  }

  /**
   * Generate cache key from album info
   */
  private getCacheKey(artist: string, album: string, year?: number): string {
    const normalizedArtist = artist.toLowerCase().trim();
    const normalizedAlbum = album.toLowerCase().trim();
    return `${normalizedArtist}||${normalizedAlbum}||${year || 'unknown'}`;
  }

  /**
   * Load cache from disk
   */
  async load(): Promise<void> {
    try {
      await fs.ensureDir(CACHE_DIR);

      if (!(await fs.pathExists(this.cacheFile))) {
        logger.info('No cache file found, starting with empty cache');
        return;
      }

      const data: CacheData = await fs.readJson(this.cacheFile);

      for (const entry of data.entries) {
        const key = this.getCacheKey(entry.artist, entry.album, entry.year);
        this.cache.set(key, entry.result);
      }

      logger.info(`Loaded ${this.cache.size} cached classifications`);
    } catch (error) {
      logger.warn('Failed to load cache:', error);
    }
  }

  /**
   * Save cache to disk
   */
  async save(): Promise<void> {
    try {
      await fs.ensureDir(CACHE_DIR);

      const entries: CacheEntry[] = [];

      for (const [key, result] of this.cache.entries()) {
        const [artist, album, year] = key.split('||');
        entries.push({
          artist,
          album,
          year: year === 'unknown' ? undefined : parseInt(year, 10),
          result
        });
      }

      const data: CacheData = {
        version: '1.0',
        entries
      };

      await fs.writeJson(this.cacheFile, data, { spaces: 2 });
      logger.info(`Saved ${entries.length} classifications to cache`);
    } catch (error) {
      logger.error('Failed to save cache:', error);
    }
  }

  /**
   * Get classification from cache
   */
  get(artist: string, album: string, year?: number): ClassificationResult | null {
    const key = this.getCacheKey(artist, album, year);
    return this.cache.get(key) || null;
  }

  /**
   * Store classification in cache
   */
  set(artist: string, album: string, result: ClassificationResult, year?: number): void {
    const key = this.getCacheKey(artist, album, year);
    this.cache.set(key, result);
  }

  /**
   * Check if album is in cache
   */
  has(artist: string, album: string, year?: number): boolean {
    const key = this.getCacheKey(artist, album, year);
    return this.cache.has(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
let cacheInstance: ClassificationCache | null = null;

/**
 * Get or create cache instance
 */
export function getCache(cacheFile?: string): ClassificationCache {
  if (!cacheInstance) {
    cacheInstance = new ClassificationCache(cacheFile);
  }
  return cacheInstance;
}
