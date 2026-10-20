// «Sprichwörter» (KopfFit): Sprichwort ergänzen oder seine Bedeutung erkennen.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './daten.js';

export const FARBE = '#F2E8D5';
const AUFGABEN = 8;

function frage(x) {
  const S = T.sprichwoerter;
  const ganz = `${x.s.anfang} ${x.s.ende}.`;
  if (x.art === 'ende') {
    return {
      text: S.frageEnde,
      sprich: `${x.s.anfang} … ${S.frageEnde}`,
      bild: () => el('p', { class: 'zf-satz sw-satz' }, `${x.s.anfang} …`),
      antworten: x.antworten,
      erklaerung: S.erklaerung(ganz, x.s.bedeutung),
      hilfe: () => ({ text: S.hilfe }),
    };
  }
  return {
    text: S.frageBedeutung,
    sprich: `${ganz} ${S.frageBedeutung}`,
    bild: () => el('p', { class: 'zf-satz sw-satz' }, ganz),
    antworten: x.antworten,
    erklaerung: S.erklaerung(ganz, x.s.bedeutung),
    hilfe: () => ({ text: S.hilfe }),
  };
}

const STUFEN_BILD = { leicht: 'Morgenstund …', ergaenzen: 'Übung macht …', bedeutung: 'Was heisst das?' };

export function sprichwoerterSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'sprichwoerter',
    farbe: FARBE,
    texte: T.sprichwoerter,
    anzahl: AUFGABEN,
    ruhig: true,
    empfehlung: {},
    stufenBild: (id) => el('span', { class: 'fs-stufen-text sw-mini' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
