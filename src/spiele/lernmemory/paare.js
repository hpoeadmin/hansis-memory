// Paare für das Lern-Memory: Bild–Wort, Menge–Zahl, Gross–klein.
import { mischen } from '../../kern/ui.js';
import { bildUrl } from '../memory/sets.js';

// Buchstaben ohne die seltenen Q, X und Y
const BUCHSTABEN = 'ABCDEFGHIJKLMNOPRSTUVWZ'.split('');

function alleTiere(sets) {
  return sets.filter((s) => s.status === 'bereit').flatMap((set) => set.tiere.map((tier) => ({ set, tier })));
}

export function lernPaare(art, anzahl, sets) {
  if (art === 'bildwort') {
    return mischen(alleTiere(sets))
      .slice(0, anzahl)
      .map(({ set, tier }) => ({
        id: `${set.id}-${tier.id}`,
        a: { art: 'bild', set, tier },
        b: { art: 'wort', text: tier.name, trennung: tier.trennung },
        anzeige: { bild: bildUrl(set, tier.bild), tier },
      }));
  }
  if (art === 'mengezahl') {
    const tiere = mischen(alleTiere(sets));
    return Array.from({ length: anzahl }, (_, i) => {
      const n = i + 1;
      const { set, tier } = tiere[i];
      return {
        id: `zahl-${n}`,
        a: { art: 'menge', n, set, tier },
        b: { art: 'zahl', n },
        anzeige: { text: String(n) },
      };
    });
  }
  // Gross und klein
  return mischen(BUCHSTABEN)
    .slice(0, anzahl)
    .map((gross) => ({
      id: `buchstabe-${gross}`,
      a: { art: 'buchstabe', text: gross },
      b: { art: 'buchstabe', text: gross.toLowerCase() },
      anzeige: { text: `${gross} ${gross.toLowerCase()}` },
    }));
}
