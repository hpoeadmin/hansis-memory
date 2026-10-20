// «Zeitformen»: Zeitform eines Satzes erkennen oder einen Satz in eine Zeitform setzen.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './saetze.js';

export const FARBE = '#E7E1F7';
const AUFGABEN = 10;

function frage(x) {
  const Z = T.zeitformen;
  if (x.art === 'erkennen') {
    return {
      text: Z.frageErkennen,
      sprich: `${x.text} ${Z.frageErkennen}`,
      bild: () => el('p', { class: 'zf-satz' }, x.text),
      antworten: x.formen.map((f) => ({ text: Z.namen[f], richtig: f === x.zeitform })),
      erklaerung: Z.merkmal[x.zeitform],
      hilfe: () => ({ text: Z.hilfe }),
    };
  }
  return {
    text: Z.frageBilden(Z.namen[x.zeitform]),
    sprich: `${x.gegeben} ${Z.frageBilden(Z.namen[x.zeitform])}`,
    bild: () => el('div', { class: 'zf-bild' }, el('span', { class: 'zf-etikett' }, Z.namen.praesens), el('p', { class: 'zf-satz' }, x.gegeben)),
    antworten: x.antworten,
    erklaerung: Z.merkmal[x.zeitform],
    hilfe: () => ({ text: `${Z.nochNicht} ${Z.merkmal[x.zeitform]}` }),
  };
}

const STUFEN_BILD = { drei: 'ging', alle: 'wird gehen', bilden: 'geht → ging', profi: 'war gegangen' };

export function zeitformenSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'zeitformen',
    farbe: FARBE,
    texte: T.zeitformen,
    anzahl: AUFGABEN,
    empfehlung: { kl34: 'drei', kl56: 'alle' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text zf-mini' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
