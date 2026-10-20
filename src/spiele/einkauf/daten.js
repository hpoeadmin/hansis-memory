// Einkaufsliste merken (KopfFit): Dinge aus dem Alltag mit Bild (Emoji, auf jedem Tablet vorhanden).
import { mischen } from '../../kern/antworten.js';

export const DINGE = [
  ['🍞', 'Brot'], ['🥛', 'Milch'], ['🧀', 'Käse'], ['🍎', 'Äpfel'], ['🥚', 'Eier'], ['🧈', 'Butter'],
  ['☕', 'Kaffee'], ['🥬', 'Salat'], ['🥕', 'Rüebli'], ['🥔', 'Kartoffeln'], ['🍌', 'Bananen'], ['🍅', 'Tomaten'],
  ['🍋', 'Zitronen'], ['🍯', 'Honig'], ['🐟', 'Fisch'], ['🍝', 'Teigwaren'], ['🍚', 'Reis'], ['🍫', 'Schokolade'],
  ['🍇', 'Trauben'], ['🍐', 'Birnen'], ['🍄', 'Pilze'], ['🧅', 'Zwiebeln'], ['🥒', 'Gurke'], ['🍓', 'Erdbeeren'],
  ['🍒', 'Kirschen'], ['🧂', 'Salz'], ['💐', 'Blumen'], ['🧼', 'Seife'], ['📰', 'Zeitung'], ['🍷', 'Wein'],
  ['🥜', 'Nüsse'], ['🍵', 'Tee'], ['🧻', 'WC-Papier'], ['🕯️', 'Kerzen'], ['🥩', 'Fleisch'], ['🥐', 'Gipfeli'],
].map(([bild, name]) => ({ bild, name }));

export const STUFEN = {
  vier: { anzahl: 4, auswahl: 9 },
  sechs: { anzahl: 6, auswahl: 12 },
  acht: { anzahl: 8, auswahl: 15 },
};

export const DURCHGAENGE = 4;

// Eine Liste und die Auswahl zum Wiederfinden (Liste plus andere Dinge, gemischt)
export function durchgang(stufe, zufall = Math.random) {
  const { anzahl, auswahl } = STUFEN[stufe];
  const alle = mischen(DINGE, zufall);
  const liste = alle.slice(0, anzahl);
  const andere = alle.slice(anzahl, auswahl);
  return { liste, auswahl: mischen([...liste, ...andere], zufall) };
}

// Bewertung: gefunden, falsch gewählt, vergessen
export function bewerte(liste, gewaehlt) {
  const gefunden = gewaehlt.filter((d) => liste.includes(d));
  const falsch = gewaehlt.filter((d) => !liste.includes(d));
  const vergessen = liste.filter((d) => !gewaehlt.includes(d));
  return { gefunden, falsch, vergessen, perfekt: !falsch.length && !vergessen.length };
}
