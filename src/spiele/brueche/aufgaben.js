// Brüche (5./6. Klasse, Lehrplan 21): erkennen, gleichwertige Brüche, vergleichen, Bruchteil von.
// Bruch: [zaehler, nenner]
import { zahl, waehle, mischen, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  erkennen: {}, // Welcher Bruch ist gefärbt?
  gleich: {}, // Welcher Bruch ist gleich viel?
  vergleichen: {}, // Welcher Bruch ist grösser?
  von: {}, // Wie viel ist ¾ von 20?
};

const NENNER = [2, 3, 4, 5, 6, 8, 10, 12];

export const ggT = (a, b) => (b ? ggT(b, a % b) : a);
export const gleichViel = ([a, b], [c, d]) => a * d === b * c;
export const text = ([z, n]) => `${z}/${n}`;

function bruch(zufall, nenner = NENNER) {
  const n = waehle(nenner, zufall);
  return [zahl(1, n - 1, zufall), n];
}

// Vier Bruch-Antworten ohne doppelte Texte
function antwortenAus(richtig, kandidaten, zufall, istRichtig = (b) => b === richtig) {
  const liste = [richtig];
  // Reichen die typischen Fehler nicht, kommen zufällige Brüche dazu
  const extra = Array.from({ length: 40 }, () => bruch(zufall));
  for (const b of [...mischen(kandidaten, zufall), ...extra]) {
    if (liste.length === 4) break;
    if (b[0] <= 0 || b[1] <= 1 || b[0] >= b[1]) continue;
    if (liste.some((x) => text(x) === text(b) || gleichViel(x, b))) continue;
    liste.push(b);
  }
  return mischen(liste, zufall).map((b) => ({ bruch: b, text: text(b), richtig: istRichtig(b) }));
}

function erkennen(zufall) {
  const [z, n] = bruch(zufall);
  // Typische Fehler: Nenner und Zähler vertauscht gelesen, ungefärbte Teile gezählt, ein Teil daneben
  const kandidaten = [[n - z, n], [z, n + 1], [z, n - 1], [z + 1, n], [z - 1, n], [z, n + 2], [z + 1, n + 1]];
  return { art: 'erkennen', bruch: [z, n], form: zufall() < 0.5 ? 'kreis' : 'balken', antworten: antwortenAus([z, n], kandidaten, zufall) };
}

function gleich(zufall) {
  // Ein gekürzter Bruch und ein erweiterter: 2/4 = 1/2
  let [z, n] = bruch(zufall, [2, 3, 4, 5, 6]);
  const g = ggT(z, n);
  z /= g;
  n /= g;
  const faktor = waehle([2, 3, 4], zufall);
  const gegeben = [z * faktor, n * faktor];
  const richtig = [z, n];
  const kandidaten = [[z + 1, n], [z, n + 1], [z * faktor, n], [z, n * faktor], [z + faktor, n + faktor], [n - z, n]];
  return { art: 'gleich', gegeben, bruch: richtig, antworten: antwortenAus(richtig, kandidaten, zufall, (b) => gleichViel(b, gegeben)) };
}

function vergleichen(zufall) {
  let a;
  let b;
  do {
    a = bruch(zufall, [2, 3, 4, 5, 6, 8]);
    b = bruch(zufall, [2, 3, 4, 5, 6, 8]);
  } while (gleichViel(a, b) || a[1] === b[1] && a[0] === b[0]);
  const groesser = a[0] * b[1] > b[0] * a[1] ? a : b;
  return {
    art: 'vergleichen',
    a,
    b,
    bruch: groesser,
    antworten: mischen([a, b], zufall).map((x) => ({ bruch: x, text: text(x), richtig: x === groesser })),
  };
}

function von(zufall) {
  const n = waehle([2, 3, 4, 5, 6, 8, 10], zufall);
  const z = zahl(1, n - 1, zufall);
  const menge = n * zahl(2, n <= 5 ? 6 : 4, zufall);
  const ergebnis = (menge / n) * z;
  const teil = menge / n;
  const kandidaten = [teil, ergebnis + teil, ergebnis - teil, menge - ergebnis, menge / z, ergebnis + 1];
  return { art: 'von', bruch: [z, n], menge, ergebnis, antworten: vierAntworten(ergebnis, kandidaten.map(Math.round), zufall, { min: 1 }) };
}

const ARTEN = { erkennen, gleich, vergleichen, von };

export function aufgabe(stufe, zufall = Math.random) {
  return ARTEN[stufe](zufall);
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(
    () => aufgabe(stufe, zufall),
    (x) => `${x.art}${text(x.bruch)}${x.gegeben ?? ''}${x.a ?? ''}${x.b ?? ''}${x.menge ?? ''}`,
    anzahl,
  );
}
