// «Antike»: Ereignisse ordnen, Jahre vor und nach Christus verstehen, Römer in der Schweiz.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { kartenFragen, bereiteKarteVor } from '../geografie/index.js';
import { runde, jahrText } from './ereignisse.js';

export const FARBE = '#F1E4C8';
const AUFGABEN = 10;
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

// Zeitstrahl mit markierten Jahren; der Ausschnitt passt sich an (immer mit Christi Geburt)
function zeitstrahl(markiert) {
  const jahre = markiert.map((m) => m.jahr);
  const spanne = Math.max(...jahre, 0) - Math.min(...jahre, 0);
  const schritt = spanne > 2000 ? 500 : spanne > 800 ? 200 : 100;
  const von = Math.floor((Math.min(...jahre, 0) - schritt / 2) / schritt) * schritt;
  const bis = Math.ceil((Math.max(...jahre, 0) + schritt / 2) / schritt) * schritt;
  const x = (j) => 30 + ((j - von) / (bis - von)) * 740;
  let striche = '';
  for (let j = von; j <= bis; j += schritt) {
    striche += `<line x1="${x(j)}" y1="${j === 0 ? 50 : 58}" x2="${x(j)}" y2="${j === 0 ? 94 : 86}" stroke="${K}" stroke-width="${j === 0 ? 5 : 2.5}"/>`;
    striche += `<text x="${x(j)}" y="122" text-anchor="middle" font-size="26" ${SCHRIFT} fill="${K}">${j === 0 ? '0' : Math.abs(j)}</text>`;
  }
  const marken = markiert
    .map((m, i) => {
      const y = 40 - (i % 2) * 30;
      return `<circle cx="${x(m.jahr)}" cy="72" r="13" fill="${m.farbe}" stroke="${K}" stroke-width="3"/>` +
        `<text x="${x(m.jahr)}" y="${y}" text-anchor="middle" font-size="26" ${SCHRIFT} fill="${K}" stroke="#FFFFFF" stroke-width="6" paint-order="stroke">${m.text}</text>`;
    })
    .join('');
  const box = el('div', { class: 'an-strahl' });
  box.innerHTML =
    `<svg viewBox="-10 -30 820 190" aria-hidden="true">` +
    `<line x1="20" y1="72" x2="780" y2="72" stroke="${K}" stroke-width="5"/>` +
    `<path d="M788 72 l-14 -9 v18 Z" fill="${K}"/>` +
    `<text x="${x(von / 2)}" y="152" text-anchor="middle" font-size="22" fill="#6B645C" ${SCHRIFT}>← vor Christus</text>` +
    `<text x="${x(bis / 2)}" y="152" text-anchor="middle" font-size="22" fill="#6B645C" ${SCHRIFT}>nach Christus →</text>` +
    striche +
    marken +
    `</svg>`;
  return box;
}

const FARBEN = ['#E2543A', '#3B7FD0', '#F6C33B', '#7CC36B'];

function frage(x) {
  const A = T.antike;
  if (x.art === 'frueher') {
    return {
      text: A.frueher,
      antworten: x.ereignisse.map((e) => ({ text: e.text, richtig: e === x.richtig })),
      erklaerung: A.erklaerungFrueher(x.ereignisse.map((e) => `${e.text}: ${jahrText(e.jahr, e.um)}`).join(' – ')),
      hilfe: () => ({
        text: A.hilfeZeitstrahl,
        bild: zeitstrahl(x.ereignisse.map((e, i) => ({ jahr: e.jahr, farbe: FARBEN[i], text: jahrText(e.jahr, e.um) }))),
      }),
    };
  }
  if (x.art === 'zahlen') {
    return {
      text: A.zahlen,
      antworten: x.jahre.map((j) => ({ text: jahrText(j), richtig: j === x.richtig })),
      erklaerung: A.erklaerungZahlen(jahrText(x.richtig)),
      hilfe: () => ({
        text: A.hilfeVChr,
        bild: zeitstrahl(x.jahre.map((j, i) => ({ jahr: j, farbe: FARBEN[i], text: jahrText(j) }))),
      }),
    };
  }
  return {
    text: A.wann(x.gesucht.text),
    bild: () => el('p', { class: 'an-ereignis an-gross' }, x.gesucht.text),
    antworten: x.optionen.map((e) => ({ text: jahrText(e.jahr, e.um), richtig: e === x.gesucht })),
    erklaerung: A.erklaerungWann(x.gesucht.text, jahrText(x.gesucht.jahr, x.gesucht.um)),
    hilfe: () => ({ text: A.hilfeWann }),
  };
}

const STUFEN_BILD = { frueher: 'Was zuerst?', zahlen: '753 v. Chr.', jahr: 'Wann?', roemer: 'Vindonissa' };

export function antikeSteuerung(app) {
  const s = fragespielSteuerung(app, {
    id: 'antike',
    farbe: FARBE,
    texte: T.antike,
    anzahl: AUFGABEN,
    empfehlung: { gymi: 'frueher' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text an-mini' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => (stufe === 'roemer' ? kartenFragen(['roemer'], anzahl) : runde(stufe, anzahl).map(frage)),
  });
  // Für die Römer in der Schweiz braucht es die Karte
  const waehle = s.waehleStufe;
  s.waehleStufe = async (stufe) => {
    if (stufe === 'roemer') await bereiteKarteVor();
    waehle(stufe);
  };
  return s;
}
