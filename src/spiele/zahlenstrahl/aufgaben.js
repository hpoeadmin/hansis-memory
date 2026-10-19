// Zahlenstrahl (1./2. Klasse): Zahlen auf dem Strahl finden, Nachbarzahlen und Nachbarzehner.
// Aufgabe: { art: 'finden', ziel, bis, toleranz } oder { art: 'nachbar', frage, zahl, ergebnis, antworten }
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  bis20: { art: 'finden', bis: 20, toleranz: 0 },
  bis100: { art: 'finden', bis: 100, toleranz: 1 },
  nachbarn: { art: 'nachbar', bis: 100 },
};

export function aufgabe(stufe, zufall = Math.random) {
  const s = STUFEN[stufe];
  if (s.art === 'finden') return { art: 'finden', ziel: zahl(1, s.bis - 1, zufall), bis: s.bis, toleranz: s.toleranz };
  const frage = waehle(['nach', 'vor', 'zehnerVor', 'zehnerNach'], zufall);
  const z = frage.startsWith('zehner') ? zahl(11, 89, zufall) : zahl(2, 98, zufall);
  if (frage.startsWith('zehner') && z % 10 === 0) return aufgabe(stufe, zufall);
  const ergebnis = { nach: z + 1, vor: z - 1, zehnerVor: Math.floor(z / 10) * 10, zehnerNach: Math.ceil(z / 10) * 10 }[frage];
  const kandidaten = frage.startsWith('zehner')
    ? [ergebnis + 10, ergebnis - 10, z, frage === 'zehnerVor' ? ergebnis + 10 : ergebnis - 10, z + 1]
    : [z, frage === 'nach' ? z - 1 : z + 1, ergebnis + 10, ergebnis - 10, ergebnis + 2];
  return { art: 'nachbar', frage, zahl: z, ergebnis, antworten: vierAntworten(ergebnis, kandidaten, zufall, { min: 0, max: 100 }) };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => (x.art === 'finden' ? `f${x.ziel}` : `${x.frage}${x.zahl}`), anzahl);
}

// Getippte Stelle (0–1 über die Strahllänge) → nächste ganze Zahl
export function zahlAnStelle(anteil, bis) {
  return Math.max(0, Math.min(bis, Math.round(anteil * bis)));
}
