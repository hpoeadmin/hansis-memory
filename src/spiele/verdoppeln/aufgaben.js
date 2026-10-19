// Verdoppeln und Halbieren (1./2. Klasse).
// Aufgabe: { art: 'doppel' | 'halb', zahl, ergebnis, antworten }
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  doppel: { arten: ['doppel'], bis: 10 }, // 1 bis 10 verdoppeln
  halb: { arten: ['halb'], bis: 20 }, // gerade Zahlen bis 20 halbieren
  gemischt: { arten: ['doppel', 'halb'], bis: 20 },
  bis100: { arten: ['doppel', 'halb'], bis: 100 }, // z.B. das Doppelte von 25, die Hälfte von 80
};

// Für «bis 100» nur Zahlen, die man im Kopf gut verdoppelt/halbiert
const DOPPEL_100 = [11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 40, 41, 42, 43, 44, 45, 50];
const HALB_100 = [22, 24, 26, 28, 30, 40, 42, 44, 46, 48, 50, 60, 62, 64, 66, 68, 70, 80, 82, 84, 86, 88, 90, 100];

export function aufgabe(stufe, zufall = Math.random) {
  const s = STUFEN[stufe];
  const art = waehle(s.arten, zufall);
  let z;
  if (s.bis === 100) z = waehle(art === 'doppel' ? DOPPEL_100 : HALB_100, zufall);
  else z = art === 'doppel' ? zahl(1, 10, zufall) : zahl(1, 10, zufall) * 2;
  const ergebnis = art === 'doppel' ? z * 2 : z / 2;
  // Typische Fehler: ±1, ±2, die Zahl selbst, verwechselt (Hälfte statt Doppelt)
  const kandidaten = [ergebnis + 1, ergebnis - 1, ergebnis + 2, ergebnis - 2, z, art === 'doppel' ? z + 2 : z - 2, ergebnis + 10, ergebnis - 10];
  return { art, zahl: z, ergebnis, antworten: vierAntworten(ergebnis, kandidaten, zufall, { min: 1, max: 200 }) };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${x.art}${x.zahl}`, anzahl);
}
