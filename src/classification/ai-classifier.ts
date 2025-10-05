/**
 * Claude AI batch classification for difficult cases
 */

import Anthropic from '@anthropic-ai/sdk';
import { ClassificationResult, AIClassificationRequest, AIClassificationResponse } from '../types';
import logger from '../utils/logger';

const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 4096;

/**
 * Claude AI batch classifier
 */
export class AIClassifier {
  private client: Anthropic | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Check if AI classification is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Build classification prompt for a batch of albums
   */
  private buildPrompt(albums: AIClassificationRequest[]): string {
    const genreHierarchy = `
Genre Hierarchy:
- Rock & Alternative: [Alternative, Punk, Metal, Classic Rock, Progressive, Hard Rock, Indie]
- Electronic & Dance: [House, Techno, Ambient, Industrial, Drum & Bass, Dubstep, Trance, Electronic]
- Urban: [Hip-Hop, R&B, Soul, Funk, Trap]
- Jazz & Blues: [Jazz, Blues, Bebop, Fusion]
- World & Folk: [Folk, World, Singer-Songwriter, Country, Celtic]
- Pop: (no subgenres)
- Classical: [Opera, Concertos, Symphonies, Chamber Music, Sonatas, Sacred Music, Keyboard Works, Orchestral Works, Other Works]
  IMPORTANT: For Classical, use WORK CATEGORY as subgenre, NEVER use composer name as subgenre!
- Soundtracks: (no subgenres)
`.trim();

    const albumsList = albums.map((album, idx) => {
      const tracksStr = album.tracks.slice(0, 5).join('", "'); // First 5 tracks
      return `${idx + 1}. Artist: "${album.artist}", Album: "${album.album}", Year: ${album.year || 'unknown'}
   Sample tracks: "${tracksStr}"`;
    }).join('\n\n');

    return `Classify these albums into the genre hierarchy. Return ONLY valid JSON, no markdown formatting.

${genreHierarchy}

Albums to classify:
${albumsList}

Return a JSON array with this exact structure:
[
  {
    "artist": "Dead Can Dance",
    "album": "Into the Labyrinth",
    "mainGenre": "World & Folk",
    "subgenre": "World",
    "confidence": "high",
    "reasoning": "Ethereal world music with folk influences"
  }
]

Confidence levels:
- "high": Very certain about the classification
- "medium": Likely correct but some ambiguity
- "low": Uncertain, needs manual review

Return ONLY the JSON array, nothing else.`;
  }

  /**
   * Parse AI response and validate
   */
  private parseResponse(response: string): AIClassificationResponse[] {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed;
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      logger.debug('Raw response:', response);
      throw error;
    }
  }

  /**
   * Classify a batch of albums using Claude AI
   */
  async classifyBatch(albums: AIClassificationRequest[]): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>();

    if (!this.isAvailable()) {
      logger.warn('AI classification not available (no API key)');
      return results;
    }

    if (albums.length === 0) {
      return results;
    }

    logger.info(`AI classifying ${albums.length} albums...`);

    try {
      const prompt = this.buildPrompt(albums);

      const response = await this.client!.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const classifications = this.parseResponse(textContent.text);

      // Map classifications to results
      for (const classification of classifications) {
        const key = `${classification.artist}||${classification.album}`;

        logger.debug(`AI result key: "${key}"`);

        results.set(key, {
          mainGenre: classification.mainGenre,
          subgenre: classification.subgenre,
          source: 'ai',
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          rawData: {
            model: MODEL,
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens
          },
          timestamp: new Date()
        });
      }

      logger.info(`AI classified ${results.size}/${albums.length} albums`);

      // Log token usage
      logger.info(`Tokens used: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);

    } catch (error) {
      logger.error('AI classification failed:', error);
    }

    return results;
  }

  /**
   * Clean album name for matching (same as MusicBrainz/Discogs)
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
   * Classify a single album
   */
  async classify(album: AIClassificationRequest): Promise<ClassificationResult | null> {
    const results = await this.classifyBatch([album]);

    // Try both cleaned and original album names
    const cleanedAlbum = this.cleanAlbumName(album.album);
    const key1 = `${album.artist}||${album.album}`;
    const key2 = `${album.artist}||${cleanedAlbum}`;

    return results.get(key1) || results.get(key2) || null;
  }
}

// Singleton instance
let classifierInstance: AIClassifier | null = null;

/**
 * Get or create AI classifier instance
 */
export function getAIClassifier(apiKey?: string): AIClassifier {
  if (!classifierInstance) {
    classifierInstance = new AIClassifier(apiKey);
  }
  return classifierInstance;
}
