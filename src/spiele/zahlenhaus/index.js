// «Zahlenhaus»: Zahlen zerlegen wie in der Schule (Zehnerfreunde, bis 10, bis 20).
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { zehnerfelder } from '../rechnen/index.js';
import { runde } from './aufgaben.js';

export const FARBE = '#FCE3EC';
const AUFGABEN = 10;

export function haus(x, offen = false) {
  const feld = (wert, name) =>
    el('span', { class: `zh-zahl ${x.frei === name && !offen ? 'zh-frei' : ''}` }, x.frei === name && !offen ? '?' : String(wert));
  return el(
    'div',
    { class: 'zh-haus' },
    el('div', { class: 'zh-dach' }, feld(x.dach, 'dach')),
    el('div', { class: 'zh-stock' }, feld(x.links, 'links'), feld(x.rechts, 'rechts')),
  );
}

function frage(x) {
  const Z = T.zahlenhaus;
  return {
    text: x.frei === 'dach' ? Z.frageDach : Z.frageZimmer(x.dach),
    sprich: x.frei === 'dach' ? Z.vorlesenDach(x.links, x.rechts) : Z.vorlesenZimmer(x.dach, x.frei === 'links' ? x.rechts : x.links),
    bild: () => haus(x),
    antworten: x.antworten,
    erklaerung: Z.erklaerung(x.links, x.rechts, x.dach),
    // Hilfe: die Dachzahl als Punkte – der bekannte Teil rot, der gesuchte blau zum Zählen
    hilfe: () => {
      const bekannt = x.frei === 'links' ? x.rechts : x.links;
      return x.frei === 'dach'
        ? { text: Z.hilfeDach(x.links, x.rechts), bild: zehnerfelder(2, x.links, '+', x.rechts) }
        : { text: Z.hilfeZimmer(x.dach, bekannt), bild: zehnerfelder(x.dach > 10 ? 2 : 1, bekannt, '+', x.dach - bekannt) };
    },
  };
}

const STUFEN_BILD = { zehner: { dach: 10, links: 3, rechts: 7 }, bis10: { dach: 8, links: 5, rechts: 3 }, bis20: { dach: 15, links: 9, rechts: 6 } };

export function zahlenhausSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'zahlenhaus',
    farbe: FARBE,
    texte: T.zahlenhaus,
    anzahl: AUFGABEN,
    empfehlung: { kg: 'zehner', kl12: 'bis20', kl34: 'bis20' },
    stufenBild: (id) => el('div', { class: 'zh-mini' }, haus({ ...STUFEN_BILD[id], frei: 'rechts' })),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
