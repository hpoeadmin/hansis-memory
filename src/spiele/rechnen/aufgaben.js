// Plus und Minus für die 1./2. Klasse (Lehrplan 21): bis 10, bis 20, Zehnerübergang, bis 100.
// Aufgabe: { a, op: '+' | '−', b, ergebnis, art, antworten }
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  bis10: { max: 10 },
  bis20: { max: 20 },
  uebergang: { max: 20 },
  bis100: { max: 100 },
};

function plusOderMinus(zufall) {
  return zufall() < 0.5 ? '+' : '−';
}

// Ein Paar (a, b) passend zur Stufe; bei Minus ist a die grössere Zahl
function zahlen(stufe, op, zufall) {
  if (stufe === 'bis10') {
    const gross = zahl(2, 10, zufall);
    const klein = zahl(1, gross - 1, zufall);
    return op === '+' ? [klein, gross - klein] : [gross, klein];
  }
  if (stufe === 'bis20') {
    // ohne Zehnerübergang: 13 + 4, 18 − 5
    const e = zahl(1, 8, zufall);
    const b = zahl(1, 9 - e, zufall);
    return op === '+' ? [10 + e, b] : [10 + e + b, b];
  }
  if (stufe === 'uebergang') {
    // mit Zehnerübergang: 8 + 5, 13 − 6
    const a = zahl(2, 9, zufall);
    const b = zahl(11 - a, 9, zufall);
    return op === '+' ? [a, b] : [a + b, b];
  }
  // bis 100: reine Zehner, Zehner dazu, Einer ohne und mit Übergang
  const art = waehle(['zehner', 'zehnerDazu', 'einer', 'uebergang'], zufall);
  if (art === 'zehner') {
    const a = zahl(1, 8, zufall) * 10;
    const b = zahl(1, (100 - a) / 10, zufall) * 10;
    return op === '+' ? [a, b] : [a + b, b];
  }
  if (art === 'zehnerDazu') {
    const a = zahl(11, 79, zufall);
    const b = zahl(1, Math.floor((99 - a) / 10), zufall) * 10;
    return op === '+' ? [a, b] : [a + b, b];
  }
  const z = zahl(1, 8, zufall) * 10;
  if (art === 'einer') {
    const e = zahl(1, 8, zufall);
    const b = zahl(1, 9 - e, zufall);
    return op === '+' ? [z + e, b] : [z + e + b, b];
  }
  const e = zahl(2, 9, zufall);
  const b = zahl(11 - e, 9, zufall);
  return op === '+' ? [z + e, b] : [z + e + b, b];
}

export function aufgabe(stufe, zufall = Math.random) {
  const op = plusOderMinus(zufall);
  const [a, b] = zahlen(stufe, op, zufall);
  const ergebnis = op === '+' ? a + b : a - b;
  const andere = op === '+' ? a - b : a + b;
  // Typische Fehler: um eins verzählt, Zehner falsch, falsch gerechnet (plus statt minus)
  const kandidaten = [ergebnis + 1, ergebnis - 1, ergebnis + 10, ergebnis - 10, andere, ergebnis + 2, ergebnis - 2];
  return {
    a,
    op,
    b,
    ergebnis,
    antworten: vierAntworten(ergebnis, kandidaten, zufall, { min: 0, max: STUFEN[stufe].max }),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${x.a}${x.op}${x.b}`, anzahl);
}
