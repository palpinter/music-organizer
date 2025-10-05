/**
 * Discogs API integration for genre classification
 */

import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';
import { ClassificationResult, DiscogsRelease } from '../types';
import { mapGenre } from '../modern/genre-definitions';
import logger from '../utils/logger';

const DISCOGS_API_URL = 'https://api.discogs.com';
const USER_AGENT = 'MusicOrganizer/0.1.0 +https://github.com/your-username/music-organizer';

/**
 * Discogs API client with rate limiting
 */
export class DiscogsClient {
  private client: AxiosInstance;
  private limiter: Bottleneck;
  private apiKey?: string;
  private apiSecret?: string;

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    // Rate limiter: 60 requests per minute (unauthenticated)
    // 240 requests per minute (authenticated)
    const rateLimit = apiKey && apiSecret ? 240 : 60;

    this.limiter = new Bottleneck({
      reservoir: rateLimit,
      reservoirRefreshAmount: rateLimit,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 1
    });

    this.client = axios.create({
      baseURL: DISCOGS_API_URL,
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 10000
    });
  }

  /**
   * Search for a release by artist and album
   */
  async searchRelease(artist: string, album: string, year?: number): Promise<DiscogsRelease | null> {
    try {
      const cleanedAlbum = this.cleanAlbumName(album);

      const params: any = {
        q: `${artist} ${cleanedAlbum}`,
        type: 'release',
        per_page: 5
      };

      // Add authentication if available
      if (this.apiKey && this.apiSecret) {
        params.key = this.apiKey;
        params.secret = this.apiSecret;
      }

      const response = await this.limiter.schedule(() =>
        this.client.get('/database/search', { params })
      );

      const results = response.data?.results;

      if (!results || results.length === 0) {
        logger.debug(`No Discogs results for: ${artist} - ${album}`);
        return null;
      }

      // Try to find best match
      for (const result of results) {
        // Check if artist matches (case-insensitive)
        const resultArtist = result.title?.split(' - ')[0]?.toLowerCase() || '';
        if (resultArtist.includes(artist.toLowerCase()) || artist.toLowerCase().includes(resultArtist)) {
          // If year is provided, try to match it
          if (year && result.year && Math.abs(result.year - year) > 2) {
            continue; // Skip if year difference is more than 2 years
          }

          return {
            id: result.id,
            title: result.title,
            artists: [{ name: artist }],
            year: result.year,
            genres: result.genre || [],
            styles: result.style || []
          };
        }
      }

      // If no perfect match, return first result
      const firstResult = results[0];
      return {
        id: firstResult.id,
        title: firstResult.title,
        artists: [{ name: artist }],
        year: firstResult.year,
        genres: firstResult.genre || [],
        styles: firstResult.style || []
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          logger.warn('Discogs rate limit exceeded');
        } else {
          logger.warn(`Discogs API error: ${error.message}`);
        }
      } else {
        logger.warn('Discogs lookup failed:', error);
      }
      return null;
    }
  }

  /**
   * Clean album name for search
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
   * Classify album using Discogs
   */
  async classify(artist: string, album: string, year?: number): Promise<ClassificationResult | null> {
    logger.debug(`Discogs lookup: ${artist} - ${album}`);

    const release = await this.searchRelease(artist, album, year);

    if (!release) {
      return null;
    }

    // Try to map genres and styles to our hierarchy
    const allGenreTags = [...(release.genres || []), ...(release.styles || [])];

    if (allGenreTags.length === 0) {
      logger.debug(`No genres/styles found for: ${artist} - ${album}`);
      return null;
    }

    // Try each tag in order
    for (const tag of allGenreTags) {
      const mapped = mapGenre(tag);

      if (mapped) {
        // Calculate confidence
        // High confidence if we have both genre and style
        const hasGenreAndStyle = (release.genres?.length || 0) > 0 && (release.styles?.length || 0) > 0;
        const confidence = hasGenreAndStyle ? 'high' : 'medium';

        return {
          mainGenre: mapped.mainGenre,
          subgenre: mapped.subgenre,
          source: 'discogs',
          confidence,
          rawData: {
            releaseId: release.id,
            genres: release.genres,
            styles: release.styles
          },
          timestamp: new Date()
        };
      }
    }

    logger.debug(`No mappable genres for: ${artist} - ${album}`, { tags: allGenreTags });
    return null;
  }
}

// Singleton instance
let clientInstance: DiscogsClient | null = null;

/**
 * Get or create Discogs client instance
 */
export function getDiscogsClient(apiKey?: string, apiSecret?: string): DiscogsClient {
  if (!clientInstance) {
    clientInstance = new DiscogsClient(apiKey, apiSecret);
  }
  return clientInstance;
}
