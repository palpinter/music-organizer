/**
 * Genre hierarchy and mapping definitions
 */

import { MainGenre } from '../types';

export interface GenreMapping {
  mainGenre: MainGenre;
  subgenre: string;
  keywords: string[];
}

/**
 * Complete genre hierarchy mappings
 * Each entry maps raw genre strings to main genre + subgenre
 */
export const GENRE_MAPPINGS: GenreMapping[] = [
  // Alternative
  {
    mainGenre: 'Alternative',
    subgenre: '',
    keywords: [
      'alternative', 'alternative rock', 'indie', 'indie rock',
      'post-punk', 'post punk', 'gothic rock', 'gothic', 'goth rock',
      'new wave', 'darkwave', 'dark wave', 'shoegaze',
      'dream pop', 'ethereal', 'coldwave',
      'indie pop', 'indie folk', 'chamber pop',
      'lo-fi', 'lo fi', 'bedroom pop', 'jangle pop'
    ]
  },

  // Rock
  {
    mainGenre: 'Rock',
    subgenre: '',
    keywords: [
      'rock', 'classic rock', 'hard rock', 'blues rock',
      'southern rock', 'arena rock', 'album rock',
      '70s rock', '80s rock', 'rock and roll', 'rock & roll', 'rock n roll',
      'punk', 'punk rock', 'hardcore', 'hardcore punk',
      'post-hardcore', 'skate punk', 'street punk',
      'oi!', 'oi', 'anarcho-punk',
      'metal', 'heavy metal', 'death metal', 'black metal',
      'doom metal', 'doom', 'sludge', 'stoner metal', 'stoner rock',
      'thrash metal', 'thrash', 'speed metal', 'power metal',
      'progressive metal', 'metalcore', 'deathcore', 'grindcore',
      'progressive rock', 'prog rock', 'prog', 'art rock',
      'psychedelic rock', 'psychedelic', 'space rock',
      'krautrock', 'experimental rock',
      'glam rock', 'glam metal', 'hair metal',
      'sleaze rock', 'cock rock'
    ]
  },

  // Electronic
  {
    mainGenre: 'Electronic',
    subgenre: '',
    keywords: [
      'electronic', 'electronica', 'idm', 'intelligent dance music',
      'breakbeat', 'breaks', 'glitch', 'downtempo',
      'trip hop', 'trip-hop', 'chillout', 'chill out',
      'synthwave', 'vaporwave', 'future bass',
      'ambient', 'dark ambient', 'drone', 'drone ambient',
      'atmospheric', 'soundscape', 'field recording', 'lowercase',
      'lowercase sound', 'musique concrète', 'concrete music',
      'industrial', 'ebm', 'electronic body music', 'power electronics',
      'harsh noise', 'noise', 'industrial techno', 'industrial metal',
      'aggrotech', 'dark electro', 'electro-industrial'
    ]
  },

  // Dance
  {
    mainGenre: 'Dance',
    subgenre: '',
    keywords: [
      'house', 'deep house', 'tech house', 'progressive house',
      'electro house', 'acid house', 'chicago house', 'detroit house',
      'future house', 'bass house',
      'techno', 'minimal techno', 'detroit techno', 'berlin techno',
      'hard techno', 'acid techno', 'dub techno',
      'drum and bass', 'drum & bass', 'dnb', 'd&b', 'jungle',
      'liquid funk', 'neurofunk', 'jump up',
      'dubstep', 'brostep', 'post-dubstep', 'future garage',
      'bass music', 'uk bass',
      'trance', 'progressive trance', 'uplifting trance',
      'psytrance', 'psychedelic trance', 'goa trance',
      'vocal trance', 'hard trance'
    ]
  },

  // Urban
  {
    mainGenre: 'Urban',
    subgenre: '',
    keywords: [
      'hip hop', 'hip-hop', 'rap', 'hip hop/rap',
      'gangsta rap', 'conscious rap', 'alternative hip hop',
      'underground hip hop', 'boom bap', 'east coast hip hop',
      'west coast hip hop', 'southern hip hop',
      'trap', 'trap music', 'drill', 'mumble rap',
      'r&b', 'r & b', 'rnb', 'rhythm and blues',
      'contemporary r&b', 'alternative r&b', 'neo-soul',
      'soul', 'northern soul', 'southern soul',
      'motown', 'classic soul', 'deep soul',
      'funk', 'p-funk', 'g-funk', 'funk rock',
      'funk metal', 'electro funk'
    ]
  },

  // Jazz
  {
    mainGenre: 'Jazz',
    subgenre: '',
    keywords: [
      'jazz', 'bebop', 'hard bop', 'cool jazz', 'modal jazz',
      'free jazz', 'avant-garde jazz', 'smooth jazz',
      'contemporary jazz', 'jazz fusion', 'acid jazz',
      'nu jazz', 'post-bop',
      'fusion', 'jazz-rock', 'jazz rock'
    ]
  },

  // Blues
  {
    mainGenre: 'Blues',
    subgenre: '',
    keywords: [
      'blues', 'delta blues', 'chicago blues', 'electric blues',
      'acoustic blues', 'country blues', 'texas blues'
    ]
  },

  // World & Folk
  {
    mainGenre: 'World & Folk',
    subgenre: '',
    keywords: [
      'folk', 'folk music', 'contemporary folk', 'folk rock',
      'acoustic folk', 'traditional folk', 'american folk',
      'british folk', 'irish folk', 'scottish folk',
      'world', 'world music', 'ethnic', 'traditional',
      'african', 'asian', 'latin', 'middle eastern',
      'oriental', 'tribal', 'indigenous',
      'singer-songwriter', 'singer/songwriter', 'songwriter',
      'acoustic', 'acoustic pop',
      'country', 'country music', 'country rock', 'alt-country',
      'alternative country', 'bluegrass', 'americana',
      'outlaw country', 'honky tonk',
      'celtic', 'celtic music', 'celtic folk'
    ]
  },

  // Pop
  {
    mainGenre: 'Pop',
    subgenre: '',
    keywords: [
      'pop', 'pop music', 'synth-pop', 'synth pop', 'synthpop',
      'electropop', 'electro-pop', 'dance-pop', 'dance pop',
      'bubblegum pop', 'teen pop', 'power pop',
      'art pop', 'baroque pop', 'experimental pop'
    ]
  }
];

/**
 * Normalize genre string for comparison
 */
export function normalizeGenreString(genre: string): string {
  return genre
    .toLowerCase()
    .trim()
    .replace(/[\/\-_]/g, ' ')  // Replace separators with space
    .replace(/\s+/g, ' ');      // Normalize whitespace
}

/**
 * Map a raw genre string to main genre and subgenre
 */
export function mapGenre(rawGenre: string): { mainGenre: MainGenre; subgenre: string } | null {
  if (!rawGenre || rawGenre.trim() === '') {
    return null;
  }

  const normalized = normalizeGenreString(rawGenre);

  // Try exact match first
  for (const mapping of GENRE_MAPPINGS) {
    if (mapping.keywords.includes(normalized)) {
      return {
        mainGenre: mapping.mainGenre,
        subgenre: mapping.subgenre
      };
    }
  }

  // Try partial match (contains keyword)
  for (const mapping of GENRE_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return {
          mainGenre: mapping.mainGenre,
          subgenre: mapping.subgenre
        };
      }
    }
  }

  return null;
}

/**
 * Get all possible main genres
 */
export function getAllMainGenres(): MainGenre[] {
  return [
    'Rock',
    'Alternative',
    'Electronic',
    'Dance',
    'Urban',
    'Jazz',
    'Blues',
    'World & Folk',
    'Pop',
    'Classical',
    'Soundtracks'
  ];
}

/**
 * Get subgenres for a main genre
 */
export function getSubgenres(mainGenre: MainGenre): string[] {
  const subgenres = new Set<string>();

  for (const mapping of GENRE_MAPPINGS) {
    if (mapping.mainGenre === mainGenre) {
      subgenres.add(mapping.subgenre);
    }
  }

  return Array.from(subgenres);
}
