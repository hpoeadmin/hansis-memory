// Zahlenhaus (1./2. Klasse): Zahlen zerlegen. Im Dach steht die Zahl, in den Zimmern
// zwei Teile, die zusammen die Dachzahl ergeben. Eine Stelle ist leer.
// Aufgabe: { dach, links, rechts, frei: 'dach' | 'links' | 'rechts', ergebnis, antworten }
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  zehner: { dach: [10, 10] }, // Zehnerfreunde: 3 und 7, 4 und 6 …
  bis10: { dach: [3, 10] },
  bis20: { dach: [11, 20], dachFrei: true },
};

export function aufgabe(stufe, zufall = Math.random) {
  const s = STUFEN[stufe];
  const dach = zahl(s.dach[0], s.dach[1], zufall);
  const links = zahl(1, dach - 1, zufall);
  const rechts = dach - links;
  const frei = s.dachFrei && zufall() < 0.25 ? 'dach' : waehle(['links', 'rechts'], zufall);
  const ergebnis = { dach, links, rechts }[frei];
  const bekannt = frei === 'links' ? rechts : links;
  // Typische Fehler: um eins daneben, die bekannte Zahl abgeschrieben, Dach statt Teil
  const kandidaten = frei === 'dach' ? [dach + 1, dach - 1, dach + 10, Math.abs(links - rechts)] : [ergebnis + 1, ergebnis - 1, bekannt, dach, ergebnis + 2];
  return {
    dach,
    links,
    rechts,
    frei,
    ergebnis,
    antworten: vierAntworten(ergebnis, kandidaten, zufall, { min: frei === 'dach' ? 2 : 1, max: frei === 'dach' ? 20 : Math.max(dach, 10) }),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${x.dach}-${x.links}-${x.frei}`, anzahl);
}
