// «Zahlenstrahl»: Zahl auf dem Strahl antippen (bis 20, bis 100) und Nachbarzahlen/-zehner.
import { T } from '../../texte.js';
import { el, beiTipp } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde, zahlAnStelle } from './aufgaben.js';

export const FARBE = '#E0EEF8';
const AUFGABEN = 10;
const K = '#2E2A26';
const B = 1000; // Breite des Strahls im SVG
const RAND = 30;
const Y = 70;

const xVon = (wert, bis) => RAND + (wert / bis) * (B - 2 * RAND);

// Strahl mit Strichen; beschriftet sind 0, das Ende und (bis 100) die Zehner
function strahlSvg(bis, markiert = []) {
  let striche = '';
  for (let i = 0; i <= bis; i++) {
    const x = xVon(i, bis);
    const zehner = bis === 100 ? i % 10 === 0 : i % 5 === 0;
    const fuenfer = bis === 100 && i % 5 === 0;
    const h = zehner ? 26 : fuenfer ? 18 : 11;
    striche += `<line x1="${x}" y1="${Y - h}" x2="${x}" y2="${Y + h}" stroke="${K}" stroke-width="${zehner ? 4 : 2.5}"/>`;
    const beschriftet = bis === 100 ? i % 10 === 0 : true;
    if (beschriftet) striche += `<text x="${x}" y="${Y + 58}" text-anchor="middle" font-size="${bis === 100 ? 26 : 30}" font-weight="700" font-family="'Atkinson Hyperlegible', system-ui, sans-serif" fill="${K}">${i}</text>`;
  }
  const marken = markiert
    .map(({ wert, farbe, text }) => {
      const x = xVon(wert, bis);
      return `<path d="M${x} ${Y - 30} l-12 -22 h24 Z" fill="${farbe}" stroke="${K}" stroke-width="2.5"/>` +
        (text ? `<text x="${x}" y="${Y - 62}" text-anchor="middle" font-size="30" font-weight="700" font-family="'Atkinson Hyperlegible', system-ui, sans-serif" fill="${K}" stroke="#FFFFFF" stroke-width="6" paint-order="stroke">${text}</text>` : '');
    })
    .join('');
  return (
    `<svg viewBox="0 -40 ${B} 190" class="zs-strahl" aria-hidden="true">` +
    `<rect x="0" y="-40" width="${B}" height="190" fill="transparent"/>` +
    `<line x1="${RAND - 10}" y1="${Y}" x2="${B - RAND + 20}" y2="${Y}" stroke="${K}" stroke-width="5"/>` +
    `<path d="M${B - RAND + 26} ${Y} l-16 -10 v20 Z" fill="${K}"/>` +
    striche +
    marken +
    `</svg>`
  );
}

function findenFrage(x) {
  const Z = T.zahlenstrahl;
  return {
    text: Z.finde(x.ziel),
    interaktiv: ({ richtig, falsch }) => {
      const box = el('div', { class: 'zs-box' });
      box.innerHTML = strahlSvg(x.bis);
      let geloest = false;
      beiTipp(box, (ereignis) => {
        if (geloest || !ereignis?.clientX) return;
        const svg = box.querySelector('svg');
        const r = svg.getBoundingClientRect();
        // Bildschirmposition → Stelle auf dem Strahl (0–1)
        const svgX = ((ereignis.clientX - r.left) / r.width) * B;
        const getippt = zahlAnStelle((svgX - RAND) / (B - 2 * RAND), x.bis);
        if (Math.abs(getippt - x.ziel) <= x.toleranz) {
          geloest = true;
          box.innerHTML = strahlSvg(x.bis, [{ wert: x.ziel, farbe: '#7CC36B', text: String(x.ziel) }]);
          richtig();
          return;
        }
        box.innerHTML = strahlSvg(x.bis, [{ wert: getippt, farbe: '#C9C2B8', text: String(getippt) }]);
        falsch(getippt < x.ziel ? Z.weiterRechts(getippt, x.ziel) : Z.weiterLinks(getippt, x.ziel));
      });
      return box;
    },
    antworten: [],
    erklaerung: Z.gefunden(x.ziel),
  };
}

function nachbarFrage(x) {
  const Z = T.zahlenstrahl;
  return {
    text: Z.nachbar[x.frage](x.zahl),
    bild: () => {
      const box = el('div', { class: 'zs-box' });
      box.innerHTML = strahlSvg(100, [{ wert: x.zahl, farbe: '#F6A940', text: String(x.zahl) }]);
      return box;
    },
    antworten: x.antworten,
    erklaerung: Z.nachbarErklaerung[x.frage](x.zahl, x.ergebnis),
    hilfe: () => ({ text: Z.nachbarHilfe[x.frage] }),
  };
}

const STUFEN_BILD = { bis20: [20, 13], bis100: [100, 37], nachbarn: [100, 50] };

export function zahlenstrahlSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'zahlenstrahl',
    farbe: FARBE,
    texte: T.zahlenstrahl,
    anzahl: AUFGABEN,
    empfehlung: { kg: 'bis20', kl12: 'bis100', kl34: 'nachbarn' },
    stufenBild: (id) => {
      const box = el('span', { class: 'zs-mini' });
      const [bis, wert] = STUFEN_BILD[id];
      box.innerHTML = strahlSvg(bis, [{ wert, farbe: '#F6A940' }]);
      return box;
    },
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map((x) => (x.art === 'finden' ? findenFrage(x) : nachbarFrage(x))),
  });
}
