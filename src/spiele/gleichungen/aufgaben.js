// Gleichungen lösen (1. Gymnasium): x + a = b bis a·x + b = c·x + d, Lösung immer eine ganze Zahl.
// Aufgabe: { art, links: { x, zahl }, rechts: { x, zahl }, loesung, text, antworten }
// links/rechts: Anzahl x und Zahl auf der Seite der Waage (zahl kann negativ sein = minus)
import { zahl, waehle, vierAntworten, ohneDoppelte } from '../../kern/antworten.js';

export const STUFEN = {
  einfach: { arten: ['plus', 'minus'] },
  mal: { arten: ['mal', 'geteilt'] },
  zwei: { arten: ['malPlus', 'malMinus'] },
  beide: { arten: ['beide'] },
};

// «3x + 4», «x − 7», «2x», «19»
export function seite({ x, zahl: z, durch }) {
  if (durch) return `x : ${durch}`;
  const teilX = x ? `${x === 1 ? '' : x}x` : '';
  if (!teilX) return String(z);
  if (!z) return teilX;
  return `${teilX} ${z < 0 ? '−' : '+'} ${Math.abs(z)}`;
}

export function aufgabe(stufe, zufall = Math.random) {
  const art = waehle(STUFEN[stufe].arten, zufall);
  let links;
  let rechts;
  let loesung;
  if (art === 'plus' || art === 'minus') {
    loesung = zahl(1, 20, zufall);
    const a = zahl(1, 15, zufall);
    links = { x: 1, zahl: art === 'plus' ? a : -a };
    rechts = { x: 0, zahl: loesung + links.zahl };
    if (rechts.zahl <= 0) return aufgabe(stufe, zufall);
  } else if (art === 'mal') {
    loesung = zahl(1, 12, zufall);
    const a = zahl(2, 9, zufall);
    links = { x: a, zahl: 0 };
    rechts = { x: 0, zahl: a * loesung };
  } else if (art === 'geteilt') {
    const a = zahl(2, 9, zufall);
    const b = zahl(2, 10, zufall);
    loesung = a * b;
    links = { x: 1, zahl: 0, durch: a };
    rechts = { x: 0, zahl: b };
  } else if (art === 'malPlus' || art === 'malMinus') {
    loesung = zahl(1, 10, zufall);
    const a = zahl(2, 6, zufall);
    const b = zahl(1, 20, zufall);
    links = { x: a, zahl: art === 'malPlus' ? b : -b };
    rechts = { x: 0, zahl: a * loesung + links.zahl };
    if (rechts.zahl <= 0) return aufgabe(stufe, zufall);
  } else {
    // a·x + b = c·x + d mit a > c
    loesung = zahl(1, 10, zufall);
    const c = zahl(1, 4, zufall);
    const a = c + zahl(1, 4, zufall);
    const b = zahl(1, 15, zufall);
    const d = (a - c) * loesung + b;
    links = { x: a, zahl: b };
    rechts = { x: c, zahl: d };
  }
  // Typische Fehler: nicht geteilt, falsche Seite abgezogen, um eins verrechnet
  const ohneTeilen = rechts.zahl - links.zahl;
  const kandidaten = [loesung + 1, loesung - 1, ohneTeilen, rechts.zahl + Math.abs(links.zahl), loesung * 2, loesung + 2];
  return {
    art,
    links,
    rechts,
    loesung,
    text: `${seite(links)} = ${seite(rechts)}`,
    antworten: vierAntworten(loesung, kandidaten, zufall, { min: 0, max: 200 }),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => x.text, anzahl);
}

// Lösungsweg Schritt für Schritt (für Hilfe und Erklärung)
export function loesungsweg({ links, rechts, loesung }) {
  const schritte = [];
  if (links.durch) {
    schritte.push({ tun: `mal ${links.durch}`, ergebnis: `x = ${rechts.zahl * links.durch}` });
    return schritte;
  }
  let l = { ...links };
  let r = { ...rechts };
  if (r.x) {
    schritte.push({ tun: `− ${r.x}x`, ergebnis: `${seite({ x: l.x - r.x, zahl: l.zahl })} = ${r.zahl}` });
    l = { x: l.x - r.x, zahl: l.zahl };
    r = { x: 0, zahl: r.zahl };
  }
  if (l.zahl) {
    schritte.push({ tun: l.zahl > 0 ? `− ${l.zahl}` : `+ ${-l.zahl}`, ergebnis: `${seite({ x: l.x, zahl: 0 })} = ${r.zahl - l.zahl}` });
    r = { x: 0, zahl: r.zahl - l.zahl };
  }
  if (l.x !== 1) schritte.push({ tun: `: ${l.x}`, ergebnis: `x = ${loesung}` });
  return schritte;
}
