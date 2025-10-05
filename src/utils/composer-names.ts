/**
 * Composer full name mappings
 * Maps various forms of composer names to their full canonical form
 */

export const COMPOSER_FULL_NAMES: Record<string, string> = {
  // Bach family
  'bach': 'Bach, Johann Sebastian',
  'bach, j.s.': 'Bach, Johann Sebastian',
  'bach, j.s': 'Bach, Johann Sebastian',
  'bach, johann sebastian': 'Bach, Johann Sebastian',
  'j.s. bach': 'Bach, Johann Sebastian',
  'johann sebastian bach': 'Bach, Johann Sebastian',

  'bach, c.p.e.': 'Bach, Carl Philipp Emanuel',
  'bach, c.p.e': 'Bach, Carl Philipp Emanuel',
  'c.p.e. bach': 'Bach, Carl Philipp Emanuel',

  'bach, w.f.': 'Bach, Wilhelm Friedemann',
  'bach, j.c.': 'Bach, Johann Christian',

  // Mozart
  'mozart': 'Mozart, Wolfgang Amadeus',
  'mozart, w.a.': 'Mozart, Wolfgang Amadeus',
  'mozart, wolfgang amadeus': 'Mozart, Wolfgang Amadeus',
  'wolfgang amadeus mozart': 'Mozart, Wolfgang Amadeus',
  'w.a. mozart': 'Mozart, Wolfgang Amadeus',

  // Beethoven
  'beethoven': 'Beethoven, Ludwig van',
  'beethoven, ludwig van': 'Beethoven, Ludwig van',
  'ludwig van beethoven': 'Beethoven, Ludwig van',

  // Vivaldi
  'vivaldi': 'Vivaldi, Antonio',
  'vivaldi, antonio': 'Vivaldi, Antonio',
  'antonio vivaldi': 'Vivaldi, Antonio',

  // Handel
  'handel': 'Handel, George Frideric',
  'handel, george frideric': 'Handel, George Frideric',
  'handel, g.f.': 'Handel, George Frideric',
  'george frideric handel': 'Handel, George Frideric',

  // Haydn
  'haydn': 'Haydn, Joseph',
  'haydn, joseph': 'Haydn, Joseph',
  'joseph haydn': 'Haydn, Joseph',

  // Brahms
  'brahms': 'Brahms, Johannes',
  'brahms, johannes': 'Brahms, Johannes',
  'johannes brahms': 'Brahms, Johannes',

  // Schubert
  'schubert': 'Schubert, Franz',
  'schubert, franz': 'Schubert, Franz',
  'franz schubert': 'Schubert, Franz',

  // Schumann
  'schumann': 'Schumann, Robert',
  'schumann, robert': 'Schumann, Robert',
  'robert schumann': 'Schumann, Robert',

  // Chopin
  'chopin': 'Chopin, Frédéric',
  'chopin, frédéric': 'Chopin, Frédéric',
  'chopin, frederic': 'Chopin, Frédéric',
  'frédéric chopin': 'Chopin, Frédéric',

  // Liszt
  'liszt': 'Liszt, Franz',
  'liszt, franz': 'Liszt, Franz',
  'franz liszt': 'Liszt, Franz',

  // Wagner
  'wagner': 'Wagner, Richard',
  'wagner, richard': 'Wagner, Richard',
  'richard wagner': 'Wagner, Richard',

  // Verdi
  'verdi': 'Verdi, Giuseppe',
  'verdi, giuseppe': 'Verdi, Giuseppe',
  'giuseppe verdi': 'Verdi, Giuseppe',

  // Puccini
  'puccini': 'Puccini, Giacomo',
  'puccini, giacomo': 'Puccini, Giacomo',
  'giacomo puccini': 'Puccini, Giacomo',

  // Tchaikovsky
  'tchaikovsky': 'Tchaikovsky, Pyotr Ilyich',
  'tchaikovsky, pyotr ilyich': 'Tchaikovsky, Pyotr Ilyich',
  'pyotr ilyich tchaikovsky': 'Tchaikovsky, Pyotr Ilyich',

  // Rachmaninoff
  'rachmaninoff': 'Rachmaninoff, Sergei',
  'rachmaninoff, sergei': 'Rachmaninoff, Sergei',
  'sergei rachmaninoff': 'Rachmaninoff, Sergei',
  'rachmaninov': 'Rachmaninoff, Sergei',

  // Debussy
  'debussy': 'Debussy, Claude',
  'debussy, claude': 'Debussy, Claude',
  'claude debussy': 'Debussy, Claude',

  // Ravel
  'ravel': 'Ravel, Maurice',
  'ravel, maurice': 'Ravel, Maurice',
  'maurice ravel': 'Ravel, Maurice',

  // Strauss (Richard)
  'strauss, richard': 'Strauss, Richard',
  'richard strauss': 'Strauss, Richard',
  'r. strauss': 'Strauss, Richard',
  'r.strauss': 'Strauss, Richard',

  // Strauss (Johann II)
  'strauss, johann': 'Strauss, Johann II',
  'johann strauss': 'Strauss, Johann II',

  // Mahler
  'mahler': 'Mahler, Gustav',
  'mahler, gustav': 'Mahler, Gustav',
  'gustav mahler': 'Mahler, Gustav',

  // Shostakovich
  'shostakovich': 'Shostakovich, Dmitri',
  'shostakovich, dmitri': 'Shostakovich, Dmitri',
  'dmitri shostakovich': 'Shostakovich, Dmitri',

  // Stravinsky
  'stravinsky': 'Stravinsky, Igor',
  'stravinsky, igor': 'Stravinsky, Igor',
  'igor stravinsky': 'Stravinsky, Igor',

  // Prokofiev
  'prokofiev': 'Prokofiev, Sergei',
  'prokofiev, sergei': 'Prokofiev, Sergei',
  'sergei prokofiev': 'Prokofiev, Sergei',

  // Bartók
  'bartok': 'Bartók, Béla',
  'bartók': 'Bartók, Béla',
  'bartok, bela': 'Bartók, Béla',
  'bartók, béla': 'Bartók, Béla',
  'béla bartók': 'Bartók, Béla',

  // Dvořák
  'dvorak': 'Dvořák, Antonín',
  'dvorak, antonin': 'Dvořák, Antonín',

  // Baroque composers
  'monteverdi': 'Monteverdi, Claudio',
  'monteverdi, claudio': 'Monteverdi, Claudio',
  'claudio monteverdi': 'Monteverdi, Claudio',

  'purcell': 'Purcell, Henry',
  'purcell, henry': 'Purcell, Henry',
  'henry purcell': 'Purcell, Henry',

  'corelli': 'Corelli, Arcangelo',
  'corelli, arcangelo': 'Corelli, Arcangelo',
  'arcangelo corelli': 'Corelli, Arcangelo',

  'telemann': 'Telemann, Georg Philipp',
  'telemann, georg philipp': 'Telemann, Georg Philipp',
  'georg philipp telemann': 'Telemann, Georg Philipp',

  'rameau': 'Rameau, Jean-Philippe',
  'rameau, jean-philippe': 'Rameau, Jean-Philippe',
  'jean-philippe rameau': 'Rameau, Jean-Philippe',

  'lully': 'Lully, Jean-Baptiste',
  'lully, jean-baptiste': 'Lully, Jean-Baptiste',
  'jean-baptiste lully': 'Lully, Jean-Baptiste',

  'couperin': 'Couperin, François',
  'couperin, françois': 'Couperin, François',
  'françois couperin': 'Couperin, François',

  'pergolesi': 'Pergolesi, Giovanni Battista',
  'pergolesi, giovanni battista': 'Pergolesi, Giovanni Battista',
  'giovanni battista pergolesi': 'Pergolesi, Giovanni Battista',

  'scarlatti': 'Scarlatti, Domenico',
  'scarlatti, domenico': 'Scarlatti, Domenico',
  'domenico scarlatti': 'Scarlatti, Domenico',

  'boccherini': 'Boccherini, Luigi',
  'boccherini, luigi': 'Boccherini, Luigi',
  'luigi boccherini': 'Boccherini, Luigi',

  // Opera composers
  'rossini': 'Rossini, Gioachino',
  'rossini, gioachino': 'Rossini, Gioachino',
  'gioachino rossini': 'Rossini, Gioachino',

  'donizetti': 'Donizetti, Gaetano',
  'donizetti, gaetano': 'Donizetti, Gaetano',
  'gaetano donizetti': 'Donizetti, Gaetano',

  'bellini': 'Bellini, Vincenzo',
  'bellini, vincenzo': 'Bellini, Vincenzo',
  'vincenzo bellini': 'Bellini, Vincenzo',

  'bizet': 'Bizet, Georges',
  'bizet, georges': 'Bizet, Georges',
  'georges bizet': 'Bizet, Georges',

  'gounod': 'Gounod, Charles',
  'gounod, charles': 'Gounod, Charles',
  'charles gounod': 'Gounod, Charles',

  'massenet': 'Massenet, Jules',
  'massenet, jules': 'Massenet, Jules',
  'jules massenet': 'Massenet, Jules',

  'gluck': 'Gluck, Christoph Willibald',
  'gluck, christoph willibald': 'Gluck, Christoph Willibald',
  'christoph willibald gluck': 'Gluck, Christoph Willibald',

  'charpentier': 'Charpentier, Marc-Antoine',
  'charpentier, marc-antoine': 'Charpentier, Marc-Antoine',
  'marc-antoine charpentier': 'Charpentier, Marc-Antoine',

  // 20th century
  'berlioz': 'Berlioz, Hector',
  'berlioz, hector': 'Berlioz, Hector',
  'hector berlioz': 'Berlioz, Hector',

  'bruckner': 'Bruckner, Anton',
  'bruckner, anton': 'Bruckner, Anton',
  'anton bruckner': 'Bruckner, Anton',

  'sibelius': 'Sibelius, Jean',
  'sibelius, jean': 'Sibelius, Jean',
  'jean sibelius': 'Sibelius, Jean',

  'grieg': 'Grieg, Edvard',
  'grieg, edvard': 'Grieg, Edvard',
  'edvard grieg': 'Grieg, Edvard',

  'mendelssohn': 'Mendelssohn, Felix',
  'mendelssohn, felix': 'Mendelssohn, Felix',
  'felix mendelssohn': 'Mendelssohn, Felix',

  'saint-saëns': 'Saint-Saëns, Camille',
  'saint-saens': 'Saint-Saëns, Camille',
  'camille saint-saëns': 'Saint-Saëns, Camille',

  'fauré': 'Fauré, Gabriel',
  'faure': 'Fauré, Gabriel',
  'gabriel fauré': 'Fauré, Gabriel',

  'elgar': 'Elgar, Edward',
  'elgar, edward': 'Elgar, Edward',
  'edward elgar': 'Elgar, Edward',

  'vaughan williams': 'Vaughan Williams, Ralph',
  'ralph vaughan williams': 'Vaughan Williams, Ralph',

  'holst': 'Holst, Gustav',
  'holst, gustav': 'Holst, Gustav',
  'gustav holst': 'Holst, Gustav',

  // Renaissance
  'byrd': 'Byrd, William',
  'byrd, william': 'Byrd, William',
  'william byrd': 'Byrd, William',

  'palestrina': 'Palestrina, Giovanni Pierluigi da',
  'giovanni pierluigi da palestrina': 'Palestrina, Giovanni Pierluigi da',

  'tallis': 'Tallis, Thomas',
  'tallis, thomas': 'Tallis, Thomas',
  'thomas tallis': 'Tallis, Thomas',

  // Modern composers
  'bernstein': 'Bernstein, Leonard',
  'bernstein, leonard': 'Bernstein, Leonard',
  'leonard bernstein': 'Bernstein, Leonard',

  'copland': 'Copland, Aaron',
  'copland, aaron': 'Copland, Aaron',
  'aaron copland': 'Copland, Aaron',

  'gershwin': 'Gershwin, George',
  'gershwin, george': 'Gershwin, George',
  'george gershwin': 'Gershwin, George',

  'britten': 'Britten, Benjamin',
  'britten, benjamin': 'Britten, Benjamin',
  'benjamin britten': 'Britten, Benjamin',
};

/**
 * Remove diacritics/accents from string for normalized lookup
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize composer name to full canonical form
 */
export function normalizeComposerName(composer: string): string {
  const normalized = composer.toLowerCase().trim();

  // Check if we have a mapping (exact match)
  if (COMPOSER_FULL_NAMES[normalized]) {
    return COMPOSER_FULL_NAMES[normalized];
  }

  // Try without diacritics (e.g., "Dvorák" -> "dvorak")
  const withoutDiacritics = removeDiacritics(normalized);
  if (COMPOSER_FULL_NAMES[withoutDiacritics]) {
    return COMPOSER_FULL_NAMES[withoutDiacritics];
  }

  // If no mapping found, return original with proper capitalization
  return composer.trim();
}
