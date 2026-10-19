// «Rechnen bis 20 / bis 100»: Plus und Minus mit Zehnerfeld bzw. Hunderterfeld als Hilfe.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './aufgaben.js';

export const FARBE = '#E2F2DC';
const AUFGABEN = 10;

// Punkte für «a plus b» bzw. «a minus b»: a rot, dazugelegte b blau, weggenommene durchgestrichen
function punkt(i, a, op, b) {
  if (i < a) return op === '−' && i >= a - b ? 'rz-punkt rz-weg' : 'rz-punkt rz-a';
  if (op === '+' && i < a + b) return 'rz-punkt rz-b';
  return 'rz-punkt rz-leer';
}

// Zehnerfelder (je 2 × 5) für Zahlen bis 10 oder 20
export function zehnerfelder(anzahlFelder, a, op, b) {
  return el(
    'div',
    { class: 'rz-felder', 'aria-hidden': 'true' },
    Array.from({ length: anzahlFelder }, (_, f) =>
      el('div', { class: 'rz-zehnerfeld' }, Array.from({ length: 10 }, (_, j) => el('span', { class: punkt(f * 10 + j, a, op, b) }))),
    ),
  );
}

// Hunderterfeld: 10 Reihen zu 10
function hunderterfeld(a, op, b) {
  return el(
    'div',
    { class: 'rz-hunderter', 'aria-hidden': 'true' },
    Array.from({ length: 100 }, (_, i) => el('span', { class: punkt(i, a, op, b) })),
  );
}

function rechnung(x) {
  return `${x.a} ${x.op} ${x.b}`;
}

// Zehnerübergang: zuerst bis zum nächsten Zehner, dann den Rest
function hilfeText(x) {
  const R = T.rechnen;
  if (x.op === '+') {
    const bisZehner = 10 - (x.a % 10);
    if (x.a % 10 && x.b > bisZehner && x.b < 10) return R.hilfePlus(x.a, bisZehner, x.a + bisZehner, x.b - bisZehner);
  } else {
    const bisZehner = x.a % 10;
    if (bisZehner && x.b > bisZehner && x.b < 10) return R.hilfeMinus(x.a, bisZehner, x.a - bisZehner, x.b - bisZehner);
  }
  return x.op === '+' ? R.hilfeZaehlenPlus : R.hilfeZaehlenMinus;
}

function frage(x, stufe) {
  const R = T.rechnen;
  const felder = stufe === 'bis10' ? 1 : 2;
  return {
    text: R.tippe,
    sprich: R.vorlesen(x.a, x.op, x.b),
    bild: () =>
      el(
        'div',
        { class: 'rz-bild' },
        el('div', { class: 'em-aufgabe' }, el('span', {}, rechnung(x)), el('span', { class: 'em-gleich' }, '='), el('span', { class: 'em-frage' }, '?')),
        stufe === 'bis100' ? null : zehnerfelder(felder, x.a, x.op, x.b),
      ),
    antworten: x.antworten,
    erklaerung: `${rechnung(x)} = ${x.ergebnis}`,
    hilfe: () => ({ text: hilfeText(x), bild: stufe === 'bis100' ? hunderterfeld(x.a, x.op, x.b) : null }),
  };
}

const STUFEN_BILD = { bis10: '3 + 4', bis20: '13 + 4', uebergang: '8 + 5', bis100: '47 + 8' };

export function rechnenSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'rechnen',
    farbe: FARBE,
    texte: T.rechnen,
    anzahl: AUFGABEN,
    empfehlung: { kg: 'bis10', kl12: 'uebergang', kl34: 'bis100' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map((x) => frage(x, stufe)),
  });
}
