// Was auf einer Memory-Karte stehen kann – und wie sie aussieht.
// Ein Paar: { id, a, b, tier?, anzeige: { bild?, text }, sprache? }
//   a, b = Inhalt der beiden Karten:
//     { art: 'tier', set, tier }   Tierbild (mit Namen, wenn eingeschaltet)
//     { art: 'bild', set, tier }   Tierbild ohne Namen (Lern-Memory)
//     { art: 'wort', text }        nur das Wort
//     { art: 'menge', n, set, tier } n gleiche Tierbilder
//     { art: 'zahl', n }           die Ziffer
//     { art: 'buchstabe', text }   ein Buchstabe
import { el } from '../../kern/ui.js';
import { bildUrl, namenGroesse, tierName } from './sets.js';

// Klassisches Memory: zweimal dasselbe Tier
export function tierPaare(set, tiere) {
  return tiere.map((tier) => ({
    id: tier.id,
    a: { art: 'tier', set, tier },
    b: { art: 'tier', set, tier },
    tier,
    set,
    anzeige: { bild: bildUrl(set, tier.bild), tier },
  }));
}

// Text der Karte zum Vorlesen
export function sprache(inhalt) {
  switch (inhalt.art) {
    case 'tier':
    case 'bild':
      return inhalt.tier.name;
    case 'menge':
    case 'zahl':
      return String(inhalt.n);
    default:
      return inhalt.text;
  }
}

function mengeBild(inhalt) {
  const n = inhalt.n;
  const spalten = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  return el(
    'div',
    { class: 'karte-feld karte-menge', style: `--spalten-menge: ${spalten}; background: ${inhalt.set.farbe}` },
    Array.from({ length: n }, () => el('img', { src: bildUrl(inhalt.set, inhalt.tier.bild), alt: '', draggable: 'false' })),
  );
}

// Inhalt der Vorderseite einer Karte
export function vorderseite(inhalt) {
  switch (inhalt.art) {
    case 'tier':
      return [
        el('img', { src: bildUrl(inhalt.set, inhalt.tier.bild), alt: '', draggable: 'false' }),
        el('span', { class: 'karte-name' }, tierName(inhalt.tier)),
      ];
    case 'bild':
      return [el('img', { src: bildUrl(inhalt.set, inhalt.tier.bild), alt: '', draggable: 'false' })];
    case 'wort': {
      // Grosse Schrift für kurze Wörter, kleinere für lange; lange Namen dürfen zweizeilig sein
      const { text, faktor } = namenGroesse({ name: inhalt.text, trennung: inhalt.trennung }, 0.22, 0.16, 1.4);
      return [
        el(
          'div',
          { class: 'karte-feld karte-wort', style: `--wort-faktor: ${faktor.toFixed(3)}` },
          el('span', { class: 'tier-name-text' }, text),
        ),
      ];
    }
    case 'menge':
      return [mengeBild(inhalt)];
    case 'zahl':
      return [el('div', { class: 'karte-feld karte-zahl' }, String(inhalt.n))];
    case 'buchstabe':
      return [el('div', { class: 'karte-feld karte-buchstabe' }, inhalt.text)];
    default:
      return [];
  }
}
