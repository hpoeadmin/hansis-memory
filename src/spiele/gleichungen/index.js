// «Gleichungen lösen»: die Balkenwaage bleibt im Gleichgewicht, wenn man auf beiden Seiten
// das Gleiche wegnimmt oder teilt.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde, loesungsweg } from './aufgaben.js';

export const FARBE = '#E6E3F5';
const AUFGABEN = 10;
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

// Eine Waagschale: x-Kisten (blau) und ein Gewicht mit der Zahl (orange); minus = rotes Gewicht
function schale(seite, mitte) {
  const teile = [];
  for (let i = 0; i < Math.min(seite.x, 6); i++) teile.push({ text: 'x', farbe: '#7EA8E0' });
  if (seite.x > 6) teile.push({ text: `…${seite.x}x`, farbe: '#7EA8E0' });
  if (seite.zahl) teile.push({ text: seite.zahl < 0 ? `−${-seite.zahl}` : String(seite.zahl), farbe: seite.zahl < 0 ? '#F2A2A2' : '#F6C36B' });
  const breite = teile.length * 32;
  let x = mitte - breite / 2;
  let html = `<path d="M${mitte - 110} 110 Q${mitte} 140 ${mitte + 110} 110 Z" fill="#B9B0A4" stroke="${K}" stroke-width="3"/>`;
  for (const t of teile) {
    html += `<rect x="${x + 1}" y="78" width="30" height="30" rx="6" fill="${t.farbe}" stroke="${K}" stroke-width="3"/>`;
    html += `<text x="${x + 16}" y="${t.text.length > 2 ? 99 : 101}" text-anchor="middle" font-size="${t.text.length > 2 ? 12 : 18}" ${SCHRIFT} fill="${K}">${t.text}</text>`;
    x += 32;
  }
  return html;
}

function waage(x) {
  const box = el('div', { class: 'gl-waage' });
  box.innerHTML =
    `<svg viewBox="0 0 500 190" aria-hidden="true">` +
    `<path d="M250 60 L250 170 M210 178 H290" stroke="${K}" stroke-width="6" stroke-linecap="round"/>` +
    `<polygon points="250,50 240,64 260,64" fill="${K}"/>` +
    `<line x1="20" y1="60" x2="480" y2="60" stroke="${K}" stroke-width="6" stroke-linecap="round"/>` +
    `<line x1="125" y1="60" x2="125" y2="110" stroke="${K}" stroke-width="2"/><line x1="375" y1="60" x2="375" y2="110" stroke="${K}" stroke-width="2"/>` +
    schale(x.links, 125) +
    schale(x.rechts, 375) +
    `</svg>`;
  return box;
}

function frage(x) {
  const G = T.gleichungen;
  const weg = loesungsweg(x);
  // Waage nur, wenn keine Division vorkommt (x : 3 lässt sich schlecht wiegen)
  const mitWaage = !x.links.durch;
  return {
    text: G.frage,
    sprich: G.vorlesen(x.text),
    bild: () => el('div', { class: 'gl-bild' }, el('div', { class: 'em-aufgabe gl-gleichung' }, x.text), mitWaage ? waage(x) : null),
    antworten: x.antworten.map((a) => ({ ...a, text: `x = ${a.wert}` })),
    erklaerung: G.erklaerung(weg.map((s) => `${s.tun} → ${s.ergebnis}`).join(', ')),
    // Hilfe: nur der erste Schritt
    hilfe: () => ({ text: G.hilfe(weg[0].tun, weg[0].ergebnis) }),
  };
}

const STUFEN_BILD = { einfach: 'x + 4 = 9', mal: '3x = 12', zwei: '2x + 3 = 11', beide: '5x + 2 = 3x + 8' };

export function gleichungenSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'gleichungen',
    farbe: FARBE,
    texte: T.gleichungen,
    anzahl: AUFGABEN,
    empfehlung: { kl56: 'einfach', gymi: 'zwei' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text gl-mini' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
