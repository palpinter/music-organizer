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
  // Rock & Alternative - Alternative
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Alternative',
    keywords: [
      'alternative', 'alternative rock', 'indie', 'indie rock',
      'post-punk', 'post punk', 'gothic rock', 'gothic', 'goth rock',
      'new wave', 'darkwave', 'dark wave', 'shoegaze',
      'dream pop', 'ethereal', 'coldwave'
    ]
  },

  // Rock & Alternative - Punk
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Punk',
    keywords: [
      'punk', 'punk rock', 'hardcore', 'hardcore punk',
      'post-hardcore', 'skate punk', 'street punk',
      'oi!', 'oi', 'anarcho-punk'
    ]
  },

  // Rock & Alternative - Metal
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Metal',
    keywords: [
      'metal', 'heavy metal', 'death metal', 'black metal',
      'doom metal', 'doom', 'sludge', 'stoner metal', 'stoner rock',
      'thrash metal', 'thrash', 'speed metal', 'power metal',
      'progressive metal', 'metalcore', 'deathcore', 'grindcore'
    ]
  },

  // Rock & Alternative - Classic Rock
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Classic Rock',
    keywords: [
      'classic rock', 'rock', 'hard rock', 'blues rock',
      'southern rock', 'arena rock', 'album rock',
      '70s rock', '80s rock', 'rock and roll', 'rock & roll', 'rock n roll'
    ]
  },

  // Rock & Alternative - Progressive
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Progressive',
    keywords: [
      'progressive rock', 'prog rock', 'prog', 'art rock',
      'psychedelic rock', 'psychedelic', 'space rock',
      'krautrock', 'experimental rock'
    ]
  },

  // Rock & Alternative - Hard Rock
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Hard Rock',
    keywords: [
      'hard rock', 'glam rock', 'glam metal', 'hair metal',
      'sleaze rock', 'cock rock'
    ]
  },

  // Rock & Alternative - Indie
  {
    mainGenre: 'Rock & Alternative',
    subgenre: 'Indie',
    keywords: [
      'indie pop', 'indie folk', 'chamber pop',
      'lo-fi', 'lo fi', 'bedroom pop', 'jangle pop'
    ]
  },

  // Electronic & Dance - House
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'House',
    keywords: [
      'house', 'deep house', 'tech house', 'progressive house',
      'electro house', 'acid house', 'chicago house', 'detroit house',
      'future house', 'bass house'
    ]
  },

  // Electronic & Dance - Techno
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Techno',
    keywords: [
      'techno', 'minimal techno', 'detroit techno', 'berlin techno',
      'hard techno', 'acid techno', 'dub techno'
    ]
  },

  // Electronic & Dance - Ambient
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Ambient',
    keywords: [
      'ambient', 'dark ambient', 'drone', 'drone ambient',
      'atmospheric', 'soundscape', 'field recording', 'lowercase',
      'lowercase sound', 'musique concrète', 'concrete music'
    ]
  },

  // Electronic & Dance - Industrial
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Industrial',
    keywords: [
      'industrial', 'ebm', 'electronic body music', 'power electronics',
      'harsh noise', 'noise', 'industrial techno', 'industrial metal',
      'aggrotech', 'dark electro', 'electro-industrial'
    ]
  },

  // Electronic & Dance - Drum & Bass
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Drum & Bass',
    keywords: [
      'drum and bass', 'drum & bass', 'dnb', 'd&b', 'jungle',
      'liquid funk', 'neurofunk', 'jump up'
    ]
  },

  // Electronic & Dance - Dubstep
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Dubstep',
    keywords: [
      'dubstep', 'brostep', 'post-dubstep', 'future garage',
      'bass music', 'uk bass'
    ]
  },

  // Electronic & Dance - Trance
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Trance',
    keywords: [
      'trance', 'progressive trance', 'uplifting trance',
      'psytrance', 'psychedelic trance', 'goa trance',
      'vocal trance', 'hard trance'
    ]
  },

  // Electronic & Dance - Other Electronic
  {
    mainGenre: 'Electronic & Dance',
    subgenre: 'Electronic',
    keywords: [
      'electronic', 'electronica', 'idm', 'intelligent dance music',
      'breakbeat', 'breaks', 'glitch', 'downtempo',
      'trip hop', 'trip-hop', 'chillout', 'chill out',
      'synthwave', 'vaporwave', 'future bass'
    ]
  },

  // Urban - Hip-Hop
  {
    mainGenre: 'Urban',
    subgenre: 'Hip-Hop',
    keywords: [
      'hip hop', 'hip-hop', 'rap', 'hip hop/rap',
      'gangsta rap', 'conscious rap', 'alternative hip hop',
      'underground hip hop', 'boom bap', 'east coast hip hop',
      'west coast hip hop', 'southern hip hop'
    ]
  },

  // Urban - Trap
  {
    mainGenre: 'Urban',
    subgenre: 'Trap',
    keywords: [
      'trap', 'trap music', 'drill', 'mumble rap'
    ]
  },

  // Urban - R&B
  {
    mainGenre: 'Urban',
    subgenre: 'R&B',
    keywords: [
      'r&b', 'r & b', 'rnb', 'rhythm and blues',
      'contemporary r&b', 'alternative r&b', 'neo-soul'
    ]
  },

  // Urban - Soul
  {
    mainGenre: 'Urban',
    subgenre: 'Soul',
    keywords: [
      'soul', 'northern soul', 'southern soul',
      'motown', 'classic soul', 'deep soul'
    ]
  },

  // Urban - Funk
  {
    mainGenre: 'Urban',
    subgenre: 'Funk',
    keywords: [
      'funk', 'p-funk', 'g-funk', 'funk rock',
      'funk metal', 'electro funk'
    ]
  },

  // Jazz & Blues - Jazz
  {
    mainGenre: 'Jazz & Blues',
    subgenre: 'Jazz',
    keywords: [
      'jazz', 'bebop', 'hard bop', 'cool jazz', 'modal jazz',
      'free jazz', 'avant-garde jazz', 'smooth jazz',
      'contemporary jazz', 'jazz fusion', 'acid jazz',
      'nu jazz', 'post-bop'
    ]
  },

  // Jazz & Blues - Blues
  {
    mainGenre: 'Jazz & Blues',
    subgenre: 'Blues',
    keywords: [
      'blues', 'delta blues', 'chicago blues', 'electric blues',
      'acoustic blues', 'country blues', 'texas blues',
      'blues rock' // Can be crossover
    ]
  },

  // Jazz & Blues - Fusion
  {
    mainGenre: 'Jazz & Blues',
    subgenre: 'Fusion',
    keywords: [
      'fusion', 'jazz-rock', 'jazz rock'
    ]
  },

  // World & Folk - Folk
  {
    mainGenre: 'World & Folk',
    subgenre: 'Folk',
    keywords: [
      'folk', 'folk music', 'contemporary folk', 'folk rock',
      'acoustic folk', 'traditional folk', 'american folk',
      'british folk', 'irish folk', 'scottish folk'
    ]
  },

  // World & Folk - World
  {
    mainGenre: 'World & Folk',
    subgenre: 'World',
    keywords: [
      'world', 'world music', 'ethnic', 'traditional',
      'african', 'asian', 'latin', 'middle eastern',
      'oriental', 'tribal', 'indigenous'
    ]
  },

  // World & Folk - Singer-Songwriter
  {
    mainGenre: 'World & Folk',
    subgenre: 'Singer-Songwriter',
    keywords: [
      'singer-songwriter', 'singer/songwriter', 'songwriter',
      'acoustic', 'acoustic pop'
    ]
  },

  // World & Folk - Country
  {
    mainGenre: 'World & Folk',
    subgenre: 'Country',
    keywords: [
      'country', 'country music', 'country rock', 'alt-country',
      'alternative country', 'bluegrass', 'americana',
      'outlaw country', 'honky tonk'
    ]
  },

  // World & Folk - Celtic
  {
    mainGenre: 'World & Folk',
    subgenre: 'Celtic',
    keywords: [
      'celtic', 'celtic music', 'celtic folk'
    ]
  },

  // Pop
  {
    mainGenre: 'Pop',
    subgenre: 'Pop',
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
    'Rock & Alternative',
    'Electronic & Dance',
    'Urban',
    'Jazz & Blues',
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
