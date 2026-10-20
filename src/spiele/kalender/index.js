// «Kalender und Fahrplan» (KopfFit): Wochentage rechnen, ein Kalenderblatt lesen,
// den passenden Zug für einen Termin finden.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { MONATE, WOCHENTAGE, runde, tageImMonat, wochentag, zeit } from './aufgaben.js';

export const FARBE = '#E4EEE8';
const AUFGABEN = 8;

// Kalenderblatt eines Monats (Montag zuerst, wie in der Schweiz üblich)
function kalenderblatt(jahr, monat, markiert = null) {
  const erster = wochentag(jahr, monat, 1);
  const tage = tageImMonat(jahr, monat);
  const zellen = [
    ...WOCHENTAGE.map((t, i) => el('span', { class: `kal-kopf ${i >= 5 ? 'kal-we' : ''}` }, t.slice(0, 2))),
    ...Array.from({ length: erster }, () => el('span', {})),
    ...Array.from({ length: tage }, (_, i) => {
      const tag = i + 1;
      const wt = (erster + i) % 7;
      return el('span', { class: `kal-tag ${wt >= 5 ? 'kal-we' : ''} ${tag === markiert ? 'kal-markiert' : ''}` }, String(tag));
    }),
  ];
  return el('div', { class: 'kal-blatt' }, el('div', { class: 'kal-titel' }, `${MONATE[monat]} ${jahr}`), el('div', { class: 'kal-raster' }, zellen));
}

// Abfahrtstafel mit vier Zügen
function tafel(x) {
  return el(
    'div',
    { class: 'uh-tafel kal-tafel' },
    el('div', { class: 'kal-strecke' }, `${x.von} → ${x.nach}`),
    x.zuege.map((z) =>
      el('div', { class: 'uh-zeile' }, el('span', { class: 'uh-art' }, T.kalender.ab), el('span', { class: 'uh-zeit' }, zeit(z.ab)), el('span', { class: 'uh-art' }, T.kalender.an), el('span', { class: 'uh-zeit' }, zeit(z.an))),
    ),
  );
}

function frage(x) {
  const K = T.kalender;
  if (x.art === 'wochentag') {
    return {
      text: K.frageWochentag(WOCHENTAGE[x.heute], x.wann),
      antworten: x.optionen.map((t) => ({ text: WOCHENTAGE[t], richtig: t === x.ergebnis })),
      erklaerung: K.erklaerungWochentag(x.wann, WOCHENTAGE[x.ergebnis], x.schritt < 0),
      hilfe: () => ({ text: K.hilfeWochentag(WOCHENTAGE[x.heute]), bild: el('div', { class: 'kal-woche' }, WOCHENTAGE.map((t, i) => el('span', { class: i === x.heute ? 'kal-heute' : '' }, t.slice(0, 2)))) }),
    };
  }
  if (x.art === 'kalender') {
    const monat = MONATE[x.monat];
    if (x.frage === 'wochentag') {
      return {
        text: K.frageDatum(x.tag, monat),
        bild: () => kalenderblatt(x.jahr, x.monat),
        antworten: x.optionen.map((t) => ({ text: WOCHENTAGE[t], richtig: t === x.ergebnis })),
        erklaerung: K.erklaerungDatum(x.tag, monat, WOCHENTAGE[x.ergebnis]),
        hilfe: () => ({ text: K.hilfeKalender, ersetzeBild: kalenderblatt(x.jahr, x.monat, x.tag) }),
      };
    }
    if (x.frage === 'ersterSonntag') {
      return {
        text: K.frageSonntag(monat),
        bild: () => kalenderblatt(x.jahr, x.monat),
        antworten: x.optionen.map((t) => ({ text: `${t}. ${monat}`, richtig: t === x.ergebnis })),
        erklaerung: K.erklaerungSonntag(x.ergebnis, monat),
        hilfe: () => ({ text: K.hilfeSonntag }),
      };
    }
    return {
      text: K.frageTage(monat, x.jahr),
      bild: () => kalenderblatt(x.jahr, x.monat),
      antworten: x.optionen.map((t) => ({ text: K.tage(t), richtig: t === x.ergebnis })),
      erklaerung: K.erklaerungTage(monat, x.ergebnis),
      hilfe: () => ({ text: K.hilfeTage }),
    };
  }
  return {
    text: K.frageZug(x.nach, zeit(x.termin)),
    bild: () => tafel(x),
    antworten: x.zuege.map((z) => ({ text: K.zug(zeit(z.ab)), richtig: z === x.ergebnis })),
    erklaerung: K.erklaerungZug(zeit(x.ergebnis.ab), zeit(x.ergebnis.an)),
    hilfe: () => ({ text: K.hilfeZug(zeit(x.termin)) }),
  };
}

const STUFEN_BILD = { wochentage: 'Mo Di Mi', kalender: '14. März', fahrplan: '13:02 → 13:58' };

export function kalenderSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'kalender',
    farbe: FARBE,
    texte: T.kalender,
    anzahl: AUFGABEN,
    ruhig: true,
    empfehlung: {},
    stufenBild: (id) => el('span', { class: 'fs-stufen-text sw-mini' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
