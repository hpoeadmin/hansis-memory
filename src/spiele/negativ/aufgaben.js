// Negative Zahlen (1. Gymnasium): Thermometer, Plus und Minus, Mal und Geteilt, Minus einer negativen Zahl.
// Aufgabe: { art, a, op, b, ergebnis, text, antworten } bzw. Thermometer { start, aenderung }
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  thermometer: { arten: ['thermometer'] },
  plusminus: { arten: ['plus', 'minus'] },
  malgeteilt: { arten: ['mal', 'geteilt'] },
  gemischt: { arten: ['plus', 'minus', 'minusNegativ', 'mal', 'geteilt'] },
};

// Zahl mit echtem Minuszeichen: −3
export const zeige = (z) => (z < 0 ? `−${-z}` : String(z));
// Als zweite Zahl in einer Rechnung negative Zahlen in Klammern: 4 − (−2)
const zweite = (z) => (z < 0 ? `(${zeige(z)})` : zeige(z));

function ohneNull(min, max, zufall) {
  let z = 0;
  while (z === 0) z = zahl(min, max, zufall);
  return z;
}

function antworten(ergebnis, extra, zufall) {
  // Typische Fehler: Vorzeichen vergessen, um eins verzählt, Betrag statt Zahl
  return vierAntworten(ergebnis, [-ergebnis, ergebnis + 1, ergebnis - 1, ergebnis + 2, ergebnis - 2, ...extra], zufall, { min: -200, max: 200 });
}

export function aufgabe(stufe, zufall = Math.random) {
  const art = waehle(STUFEN[stufe].arten, zufall);
  if (art === 'thermometer') {
    const start = zahl(-10, 10, zufall);
    let aenderung = ohneNull(-12, 12, zufall);
    if (Math.abs(start + aenderung) > 15) aenderung = -aenderung;
    const ergebnis = start + aenderung;
    return { art, start, aenderung, ergebnis, antworten: antworten(ergebnis, [start - aenderung, Math.abs(ergebnis)], zufall) };
  }
  let a;
  let b;
  let op;
  let ergebnis;
  if (art === 'plus' || art === 'minus') {
    a = ohneNull(-12, 12, zufall);
    b = zahl(1, 12, zufall);
    op = art === 'plus' ? '+' : '−';
    // Bei «plus» darf die zweite Zahl auch negativ sein: −3 + (−4)
    if (art === 'plus' && zufall() < 0.4) b = -b;
    ergebnis = op === '+' ? a + b : a - b;
  } else if (art === 'minusNegativ') {
    a = ohneNull(-10, 10, zufall);
    b = -zahl(1, 10, zufall);
    op = '−';
    ergebnis = a - b;
  } else if (art === 'mal') {
    a = ohneNull(-10, 10, zufall);
    b = ohneNull(-10, 10, zufall);
    if (a > 0 && b > 0) a = -a;
    op = '·';
    ergebnis = a * b;
  } else {
    // Geteilt geht immer auf
    const q = ohneNull(-10, 10, zufall);
    b = ohneNull(-9, 9, zufall);
    if (q > 0 && b > 0) b = -b;
    a = q * b;
    op = ':';
    ergebnis = q;
  }
  const falschesVorzeichen = op === '·' || op === ':' ? [-ergebnis] : [op === '+' ? a - b : a + b];
  return { art, a, op, b, ergebnis, text: `${zeige(a)} ${op} ${zweite(b)}`, antworten: antworten(ergebnis, falschesVorzeichen, zufall) };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => (x.art === 'thermometer' ? `t${x.start},${x.aenderung}` : x.text), anzahl);
}
