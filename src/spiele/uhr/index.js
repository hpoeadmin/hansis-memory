// «Uhr lesen»: Zeigeruhr ablesen (volle/halbe Stunden, Viertel, Fünf-Minuten-Schritte)
// und Zeitspannen am Fahrplan ausrechnen (4. Klasse).
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde, zeitWorte, digital, dauerText, bisVolleStunde } from './zeit.js';

export const FARBE = '#DCEBFA';
const AUFGABEN = 10;
const K = '#2E2A26';

function svg(html, klasse) {
  const box = el('div', { class: klasse });
  box.innerHTML = html;
  return box;
}

// Zeigeruhr mit Zahlen 1–12, Minutenstrichen, kurzem Stunden- und langem Minutenzeiger
export function uhrSvg(h, m) {
  let striche = '';
  for (let i = 0; i < 60; i++) {
    const w = (i * 6 * Math.PI) / 180;
    const gross = i % 5 === 0;
    const r1 = gross ? 82 : 86;
    striche += `<line x1="${100 + r1 * Math.sin(w)}" y1="${100 - r1 * Math.cos(w)}" x2="${100 + 92 * Math.sin(w)}" y2="${100 - 92 * Math.cos(w)}" stroke="${K}" stroke-width="${gross ? 3.5 : 1.5}"/>`;
  }
  let zahlen = '';
  for (let i = 1; i <= 12; i++) {
    const w = (i * 30 * Math.PI) / 180;
    zahlen += `<text x="${100 + 66 * Math.sin(w)}" y="${100 - 66 * Math.cos(w) + 8}" text-anchor="middle" font-size="22" font-family="'Atkinson Hyperlegible', system-ui, sans-serif" font-weight="700" fill="${K}">${i}</text>`;
  }
  const stunde = ((h % 12) + m / 60) * 30;
  const minute = m * 6;
  return (
    `<svg viewBox="0 0 200 200" class="uhr" aria-hidden="true">` +
    `<circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="${K}" stroke-width="7"/>` +
    striche +
    zahlen +
    `<line x1="100" y1="100" x2="100" y2="54" stroke="#2E5FA8" stroke-width="10" stroke-linecap="round" transform="rotate(${stunde} 100 100)"/>` +
    `<line x1="100" y1="100" x2="100" y2="22" stroke="${K}" stroke-width="6" stroke-linecap="round" transform="rotate(${minute} 100 100)"/>` +
    `<circle cx="100" cy="100" r="7" fill="#D52B1E" stroke="${K}" stroke-width="2"/>` +
    `</svg>`
  );
}

// Abfahrtstafel wie am Bahnhof
function fahrplan(x) {
  const U = T.uhr;
  return el(
    'div',
    { class: 'uh-tafel' },
    el('div', { class: 'uh-zeile' }, el('span', { class: 'uh-ort' }, x.von), el('span', { class: 'uh-art' }, U.ab), el('span', { class: 'uh-zeit' }, digital(...x.ab))),
    el('div', { class: 'uh-pfeil', 'aria-hidden': 'true' }, '↓'),
    el('div', { class: 'uh-zeile' }, el('span', { class: 'uh-ort' }, x.nach), el('span', { class: 'uh-art' }, U.an), el('span', { class: 'uh-zeit' }, digital(...x.an))),
  );
}

function uhrFrage(x, stufe) {
  const U = T.uhr;
  // Bei Fünf-Minuten-Schritten steht die Digitalzeit gross, sonst die Worte
  const gross = stufe === 'fuenf';
  return {
    text: U.wieSpaet,
    bild: () => svg(uhrSvg(x.h, x.m), 'uh-uhr'),
    antworten: x.antworten.map((a) => ({
      text: gross ? digital(a.h, a.m) : zeitWorte(a.h, a.m),
      klein: gross ? zeitWorte(a.h, a.m) : digital(a.h, a.m),
      richtig: a.richtig,
    })),
    erklaerung: U.esIst(zeitWorte(x.h, x.m)),
    hilfe: () => ({ text: U.hilfeUhr(x.m) }),
  };
}

function dauerFrage(x) {
  const U = T.uhr;
  const erst = bisVolleStunde(x.ab);
  return {
    text: U.wieLange(x.von, x.nach),
    sprich: U.wieLangeVorlesen(x.von, digital(...x.ab), x.nach, digital(...x.an)),
    bild: () => fahrplan(x),
    antworten: x.antworten.map((a) => ({ text: dauerText(a.dauer), richtig: a.richtig })),
    erklaerung: U.dauerIst(dauerText(x.dauer)),
    hilfe: () => ({
      text: erst && erst < x.dauer
        ? U.hilfeDauer(digital(...x.ab), digital(x.ab[0] + 1, 0), dauerText(erst), digital(...x.an))
        : U.hilfeDauerKurz,
    }),
  };
}

const STUFEN_BILD = { stunden: [3, 30], viertel: [9, 15], fuenf: [10, 25] };

export function uhrSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'uhr',
    farbe: FARBE,
    texte: T.uhr,
    anzahl: AUFGABEN,
    empfehlung: { kl12: 'stunden', kl34: 'fuenf', kl56: 'dauer' },
    stufenBild: (id) => {
      if (id === 'dauer') return el('span', { class: 'fs-stufen-text uh-mini-tafel' }, '13:45 → 15:10');
      const box = el('span', { class: 'uh-mini' });
      box.innerHTML = uhrSvg(...STUFEN_BILD[id]);
      return box;
    },
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map((x) => (x.art === 'uhr' ? uhrFrage(x, stufe) : dauerFrage(x))),
  });
}
