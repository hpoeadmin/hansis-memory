// «Bruchrechnen»: Plus, Minus, Mal und Geteilt mit Brüchen und gemischten Zahlen.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { bruchEl } from '../brueche/index.js';
import { runde, kgV, kuerze } from './aufgaben.js';

export const FARBE = '#FBE0D0';
const AUFGABEN = 10;

// Bruch, ganze Zahl oder gemischte Zahl (2 ¾) als Element
function zahlEl([z, n], mitGemischt = false) {
  if (n === 1) return el('span', { class: 'brr-ganz' }, String(z));
  const ganz = Math.floor(z / n);
  if (mitGemischt && ganz) return el('span', { class: 'brr-gemischt' }, el('span', { class: 'brr-ganz' }, String(ganz)), bruchEl([z % n, n]));
  return bruchEl([z, n]);
}

function hilfeText(x) {
  const R = T.bruchrechnen;
  if (x.art === 'mal') return R.hilfeMal;
  if (x.art === 'geteilt') return R.hilfeGeteilt(`${x.b[1]}/${x.b[0]}`);
  const hn = kgV(x.a[1], x.b[1]);
  const erw = (b) => `${(b[0] * hn) / b[1]}/${hn}`;
  return R.hilfePlusMinus(hn, erw(x.a), x.zeichen, erw(x.b));
}

function frage(x) {
  const R = T.bruchrechnen;
  const gemischtAnzeigen = x.art === 'gemischtPlus';
  return {
    text: R.tippe,
    bild: () =>
      el(
        'div',
        { class: 'em-aufgabe brr-aufgabe' },
        zahlEl(x.a, gemischtAnzeigen),
        el('span', {}, x.zeichen),
        zahlEl(x.b, gemischtAnzeigen),
        el('span', { class: 'em-gleich' }, '='),
        el('span', { class: 'em-frage' }, '?'),
      ),
    antworten: x.antworten.map((a) => {
      const [z, n] = a.bruch;
      // Unechte Brüche zusätzlich als gemischte Zahl zeigen
      const klein = n > 1 && z > n ? `= ${Math.floor(z / n)} ${z % n}/${n}` : null;
      return { text: zahlEl(a.bruch), klein, richtig: a.richtig };
    }),
    erklaerung: R.erklaerung(R.gekuerzt(kuerze(x.ergebnis))),
    hilfe: () => ({ text: hilfeText(x) }),
  };
}

const STUFEN_BILD = { plusminus: '⅔ + ¼', mal: '¾ · ⅖', geteilt: '½ : ¾', gemischt: '1½ + 2¾' };

export function bruchrechnenSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'bruchrechnen',
    farbe: FARBE,
    texte: T.bruchrechnen,
    anzahl: AUFGABEN,
    empfehlung: { gymi: 'plusminus' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
