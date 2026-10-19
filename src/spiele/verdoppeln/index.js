// «Verdoppeln und Halbieren»: mit Spiegel (Doppelte) und geteilten Punkten (Hälfte).
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './aufgaben.js';

export const FARBE = '#FFF0C9';
const AUFGABEN = 10;

function punkte(n, klasse) {
  return el('div', { class: `vd-punkte ${klasse}` }, Array.from({ length: n }, () => el('span', { class: 'rz-punkt' })));
}

// Doppelte: links die Punkte, in der Mitte der Spiegel, rechts das Spiegelbild
function spiegel(n, mitSpiegelbild) {
  return el(
    'div',
    { class: 'vd-spiegel', 'aria-hidden': 'true' },
    punkte(n, 'vd-links'),
    el('span', { class: 'vd-glas' }),
    mitSpiegelbild ? punkte(n, 'vd-rechts') : el('div', { class: 'vd-punkte vd-rechts vd-leer' }, '?'),
  );
}

// Hälfte: alle Punkte; mit Hilfe in zwei gleiche Gruppen geteilt
function geteilt(n, mitTeilung) {
  if (!mitTeilung) return el('div', { class: 'vd-teilen', 'aria-hidden': 'true' }, punkte(n, 'vd-alle'));
  return el('div', { class: 'vd-spiegel', 'aria-hidden': 'true' }, punkte(n / 2, 'vd-links'), el('span', { class: 'vd-glas vd-strich' }), punkte(n / 2, 'vd-rechts'));
}

// Grosse Zahlen: Zehner und Einer getrennt verdoppeln bzw. halbieren
function hilfeGross(x) {
  const V = T.verdoppeln;
  const z = Math.floor(x.zahl / 10) * 10;
  const e = x.zahl % 10;
  if (x.art === 'doppel') return V.hilfeDoppelGross(z, e);
  return V.hilfeHalbGross(x.zahl);
}

function frage(x, stufe) {
  const V = T.verdoppeln;
  const klein = stufe !== 'bis100';
  const doppel = x.art === 'doppel';
  return {
    text: doppel ? V.frageDoppel(x.zahl) : V.frageHalb(x.zahl),
    bild: () =>
      el(
        'div',
        { class: 'rz-bild' },
        el('div', { class: 'em-aufgabe vd-aufgabe' }, doppel ? `${x.zahl} + ${x.zahl}` : `${x.zahl} : 2`, el('span', { class: 'em-gleich' }, '='), el('span', { class: 'em-frage' }, '?')),
        klein ? (doppel ? spiegel(x.zahl, false) : geteilt(x.zahl, false)) : null,
      ),
    antworten: x.antworten,
    erklaerung: doppel ? V.erklaerungDoppel(x.zahl, x.ergebnis) : V.erklaerungHalb(x.zahl, x.ergebnis),
    hilfe: () =>
      klein
        ? { text: doppel ? V.hilfeDoppel : V.hilfeHalb, bild: doppel ? spiegel(x.zahl, true) : geteilt(x.zahl, true) }
        : { text: hilfeGross(x) },
  };
}

const STUFEN_BILD = { doppel: '4 + 4', halb: '12 : 2', gemischt: '7 + 7', bis100: '25 + 25' };

export function verdoppelnSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'verdoppeln',
    farbe: FARBE,
    texte: T.verdoppeln,
    anzahl: AUFGABEN,
    empfehlung: { kg: 'doppel', kl12: 'gemischt', kl34: 'bis100' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map((x) => frage(x, stufe)),
  });
}
