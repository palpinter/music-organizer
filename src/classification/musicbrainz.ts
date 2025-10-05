/**
 * MusicBrainz API integration for genre classification
 */

import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';
import { ClassificationResult, MusicBrainzRelease } from '../types';
import { mapGenre } from '../modern/genre-definitions';
import logger from '../utils/logger';

const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'MusicOrganizer/0.1.0 (https://github.com/your-username/music-organizer)';

/**
 * MusicBrainz API client with rate limiting
 */
export class MusicBrainzClient {
  private client: AxiosInstance;
  private limiter: Bottleneck;

  constructor() {
    // Rate limiter: 1 request per second
    this.limiter = new Bottleneck({
      minTime: 1000, // 1 second between requests
      maxConcurrent: 1
    });

    this.client = axios.create({
      baseURL: MUSICBRAINZ_API_URL,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Search for a release by artist and album
   */
  async searchRelease(artist: string, album: string, year?: number): Promise<MusicBrainzRelease | null> {
    try {
      const query = this.buildSearchQuery(artist, album, year);

      const response = await this.limiter.schedule(() =>
        this.client.get('/release', {
          params: {
            query,
            fmt: 'json',
            limit: 1
          }
        })
      );

      const releases = response.data?.releases;

      if (!releases || releases.length === 0) {
        logger.debug(`No MusicBrainz results for: ${artist} - ${album}`);
        return null;
      }

      return releases[0];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          logger.warn('MusicBrainz rate limit exceeded');
        } else {
          logger.warn(`MusicBrainz API error: ${error.message}`);
        }
      } else {
        logger.warn('MusicBrainz lookup failed:', error);
      }
      return null;
    }
  }

  /**
   * Get release details with tags
   */
  async getReleaseTags(releaseId: string): Promise<Array<{ name: string; count: number }>> {
    try {
      const response = await this.limiter.schedule(() =>
        this.client.get(`/release/${releaseId}`, {
          params: {
            fmt: 'json',
            inc: 'tags'
          }
        })
      );

      return response.data?.tags || [];
    } catch (error) {
      logger.warn(`Failed to get tags for release ${releaseId}:`, error);
      return [];
    }
  }

  /**
   * Clean album name for search (remove IDs, remastered markers, etc.)
   */
  private cleanAlbumName(album: string): string {
    return album
      .replace(/\[.*?\]/g, '') // Remove [ID] and [Year] brackets
      .replace(/\(Remastered\)/gi, '') // Remove (Remastered)
      .replace(/\(.*?Remaster.*?\)/gi, '') // Remove any remaster variants
      .replace(/\(Deluxe.*?\)/gi, '') // Remove (Deluxe Edition)
      .replace(/\(.*?Edition.*?\)/gi, '') // Remove (Special Edition), etc.
      .trim()
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Build search query string
   */
  private buildSearchQuery(artist: string, album: string, year?: number): string {
    const cleanedAlbum = this.cleanAlbumName(album);
    let query = `artist:"${artist}" AND release:"${cleanedAlbum}"`;

    if (year) {
      query += ` AND date:${year}`;
    }

    return query;
  }

  /**
   * Classify album using MusicBrainz
   */
  async classify(artist: string, album: string, year?: number): Promise<ClassificationResult | null> {
    logger.debug(`MusicBrainz lookup: ${artist} - ${album}`);

    const release = await this.searchRelease(artist, album, year);

    if (!release) {
      return null;
    }

    // Get tags for this release
    const tags = await this.getReleaseTags(release.id);

    if (tags.length === 0) {
      logger.debug(`No tags found for: ${artist} - ${album}`);
      return null;
    }

    // Try to map the highest-rated tag to our genre hierarchy
    const sortedTags = tags.sort((a, b) => b.count - a.count);

    for (const tag of sortedTags) {
      const mapped = mapGenre(tag.name);

      if (mapped) {
        // Calculate confidence based on tag count
        const confidence = tag.count >= 5 ? 'high' : tag.count >= 2 ? 'medium' : 'low';

        return {
          mainGenre: mapped.mainGenre,
          subgenre: mapped.subgenre,
          source: 'musicbrainz',
          confidence,
          rawData: {
            releaseId: release.id,
            tags: sortedTags.slice(0, 5) // Top 5 tags
          },
          timestamp: new Date()
        };
      }
    }

    logger.debug(`No mappable tags for: ${artist} - ${album}`, { tags: sortedTags.map(t => t.name) });
    return null;
  }
}

// Singleton instance
let clientInstance: MusicBrainzClient | null = null;

/**
 * Get or create MusicBrainz client instance
 */
export function getMusicBrainzClient(): MusicBrainzClient {
  if (!clientInstance) {
    clientInstance = new MusicBrainzClient();
  }
  return clientInstance;
}
