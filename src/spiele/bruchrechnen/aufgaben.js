// Bruchrechnen (1. Gymnasium): Plus/Minus mit verschiedenen Nennern, Mal, Geteilt, gemischte Zahlen.
// Bruch: [zaehler, nenner], Ergebnisse immer vollständig gekürzt.
import { zahl, waehle, mischen, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  plusminus: { arten: ['plus', 'minus'] },
  mal: { arten: ['mal'] },
  geteilt: { arten: ['geteilt'] },
  gemischt: { arten: ['plus', 'minus', 'mal', 'geteilt', 'gemischtPlus'] },
};

export const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
export const kgV = (a, b) => (a / ggT(a, b)) * b;

export function kuerze([z, n]) {
  const g = ggT(z, n) || 1;
  return [z / g, n / g];
}

export const gleich = (a, b) => a[0] * b[1] === a[1] * b[0];
export const text = ([z, n]) => (n === 1 ? String(z) : `${z}/${n}`);

// Gemischte Zahl als Text: 11/4 → «2 3/4»
export function gemischt([z, n]) {
  const ganz = Math.floor(z / n);
  const rest = z % n;
  if (!ganz) return text([z, n]);
  return rest ? `${ganz} ${rest}/${n}` : String(ganz);
}

const NENNER = [2, 3, 4, 5, 6, 8, 9, 10, 12];

function echterBruch(zufall, nenner = NENNER) {
  const n = waehle(nenner, zufall);
  return kuerze([zahl(1, n - 1, zufall), n]);
}

function rechne(art, a, b) {
  const [z1, n1] = a;
  const [z2, n2] = b;
  if (art === 'plus' || art === 'gemischtPlus') return kuerze([z1 * n2 + z2 * n1, n1 * n2]);
  if (art === 'minus') return kuerze([z1 * n2 - z2 * n1, n1 * n2]);
  if (art === 'mal') return kuerze([z1 * z2, n1 * n2]);
  return kuerze([z1 * n2, n1 * z2]);
}

export function aufgabe(stufe, zufall = Math.random) {
  const art = waehle(STUFEN[stufe].arten, zufall);
  let a = echterBruch(zufall);
  let b = echterBruch(zufall);
  if (art === 'gemischtPlus') {
    // 1 1/2 + 2 3/4: als unechte Brüche gespeichert
    a = kuerze([a[0] + a[1] * zahl(1, 3, zufall), a[1]]);
    b = kuerze([b[0] + b[1] * zahl(1, 2, zufall), b[1]]);
  }
  if (art === 'minus' && a[0] * b[1] <= b[0] * a[1]) [a, b] = [b, a];
  if (art === 'minus' && gleich(a, b)) return aufgabe(stufe, zufall);
  if ((art === 'plus' || art === 'minus') && a[1] === b[1]) b = echterBruch(zufall, NENNER.filter((n) => n !== a[1]));
  const ergebnis = rechne(art, a, b);
  if (ergebnis[0] <= 0) return aufgabe(stufe, zufall);

  // Typische Fehler: Zähler und Nenner einzeln addiert, Kehrwert vergessen / falsch, mal statt plus
  const [z1, n1] = a;
  const [z2, n2] = b;
  const kandidaten = [
    [z1 + z2, n1 + n2],
    [Math.abs(z1 - z2) || 1, Math.abs(n1 - n2) || 1],
    [z1 * z2, n1 * n2],
    [z1 * n2, n1 * z2],
    [z1 + z2, n1 * n2],
    [ergebnis[0] + 1, ergebnis[1]],
    [ergebnis[0], ergebnis[1] + 1],
    [z1 * z2, n1 + n2],
  ].map(kuerze);
  const liste = [ergebnis];
  for (const k of [...mischen(kandidaten, zufall), ...Array.from({ length: 30 }, () => echterBruch(zufall))]) {
    if (liste.length === 4) break;
    if (k[0] <= 0 || k[1] <= 0 || liste.some((x) => gleich(x, k))) continue;
    liste.push(k);
  }
  const zeichen = { plus: '+', gemischtPlus: '+', minus: '−', mal: '·', geteilt: ':' }[art];
  return {
    art,
    a,
    b,
    zeichen,
    ergebnis,
    antworten: mischen(liste, zufall).map((bruch) => ({ bruch, text: text(bruch), richtig: bruch === ergebnis })),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${text(x.a)}${x.zeichen}${text(x.b)}`, anzahl);
}
