// Wirbeltierklassen (1. Gymnasium, Biologie): Säugetiere, Vögel, Reptilien, Amphibien, Fische –
// und Wirbellose zum Abgrenzen. Tiere aus den Memory-Sätzen plus eigene Zeichnungen
// (public/spiele/tiere/) für Amphibien, Reptilien und Fische.
import { waehle, ohneDoppelte } from '../../kern/antworten.js';

export const KLASSEN = ['saeuger', 'vogel', 'reptil', 'amphibie', 'fisch', 'wirbellos'];

// Tier-ID → Klasse (Tiere aus den Memory-Sätzen)
export const ZUORDNUNG = {
  saeuger: ['kuh', 'schwein', 'pferd', 'esel', 'schaf', 'ziege', 'hund', 'katze', 'kaninchen', 'maus', 'wal', 'delfin', 'robbe', 'reh', 'hirsch', 'fuchs', 'igel', 'eichhoernchen', 'dachs', 'wildschwein', 'hase', 'baer', 'wolf', 'luchs', 'biber', 'fledermaus'],
  vogel: ['huhn', 'ente', 'pinguin', 'adler', 'eule', 'papagei', 'storch', 'flamingo', 'pelikan', 'schwalbe'],
  fisch: ['hai', 'seepferdchen', 'kugelfisch', 'forelle', 'goldfisch'],
  reptil: ['meeresschildkroete', 'eidechse', 'schlange', 'krokodil'],
  amphibie: ['frosch', 'kroete', 'feuersalamander'],
  wirbellos: ['krake', 'seestern', 'krabbe', 'qualle', 'schmetterling', 'biene', 'marienkaefer', 'libelle'],
};

// Die neu gezeichneten Tiere (nicht in den Memory-Sätzen)
export const EIGENE_TIERE = [
  { id: 'frosch', name: 'Frosch', artikel: 'der' },
  { id: 'kroete', name: 'Kröte', artikel: 'die' },
  { id: 'feuersalamander', name: 'Feuersalamander', artikel: 'der' },
  { id: 'eidechse', name: 'Eidechse', artikel: 'die' },
  { id: 'schlange', name: 'Ringelnatter', artikel: 'die' },
  { id: 'krokodil', name: 'Krokodil', artikel: 'das' },
  { id: 'forelle', name: 'Forelle', artikel: 'die' },
  { id: 'goldfisch', name: 'Goldfisch', artikel: 'der' },
];

// Tiere, bei denen man sich leicht täuscht – mit Begründung (Stufe «Knifflig»)
export const KNIFFLIG = ['wal', 'delfin', 'robbe', 'fledermaus', 'pinguin', 'seepferdchen', 'hai', 'meeresschildkroete', 'krake', 'seestern', 'krokodil', 'feuersalamander', 'igel', 'schlange'];

export const klasseVon = (id) => KLASSEN.find((k) => ZUORDNUNG[k].includes(id));

export const STUFEN = {
  fuenf: { optionen: KLASSEN.slice(0, 5), tiere: 'wirbeltiere' },
  sechs: { optionen: KLASSEN, tiere: 'alle' },
  merkmale: { optionen: KLASSEN.slice(0, 5), merkmale: true },
  knifflig: { optionen: KLASSEN, tiere: 'knifflig' },
};

export const MERKMALE = ['fell', 'milch', 'federn', 'schnabel', 'schuppenhaut', 'lederei', 'feuchteHaut', 'kaulquappe', 'kiemen', 'flossen'];
const MERKMAL_KLASSE = {
  fell: 'saeuger', milch: 'saeuger', federn: 'vogel', schnabel: 'vogel', schuppenhaut: 'reptil',
  lederei: 'reptil', feuchteHaut: 'amphibie', kaulquappe: 'amphibie', kiemen: 'fisch', flossen: 'fisch',
};

// tiere: [{ id, … }] – alle Tiere, die es als Bild gibt
export function aufgabe(stufe, tiere, zufall = Math.random) {
  const st = STUFEN[stufe];
  if (st.merkmale) {
    const merkmal = waehle(MERKMALE, zufall);
    return { art: 'merkmal', merkmal, richtig: MERKMAL_KLASSE[merkmal], optionen: st.optionen };
  }
  let pool = tiere.filter((t) => klasseVon(t.id));
  if (st.tiere === 'wirbeltiere') pool = pool.filter((t) => klasseVon(t.id) !== 'wirbellos');
  if (st.tiere === 'knifflig') pool = pool.filter((t) => KNIFFLIG.includes(t.id));
  // Seltenere Klassen öfter zeigen, damit nicht fast nur Säugetiere kommen
  const klasse = waehle([...new Set(pool.map((t) => klasseVon(t.id)))], zufall);
  const tier = waehle(pool.filter((t) => klasseVon(t.id) === klasse), zufall);
  return { art: 'tier', tier, richtig: klasse, optionen: st.optionen };
}

export function runde(stufe, tiere, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, tiere, zufall), (x) => (x.art === 'tier' ? x.tier.id : x.merkmal), anzahl);
}

