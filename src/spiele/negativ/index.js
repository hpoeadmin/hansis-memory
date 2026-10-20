// «Negative Zahlen»: am Thermometer, Plus und Minus, Mal und Geteilt mit Vorzeichenregeln.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde, zeige } from './aufgaben.js';

export const FARBE = '#DCE9F5';
const AUFGABEN = 10;
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

function svgBox(html, klasse) {
  const box = el('div', { class: klasse });
  box.innerHTML = html;
  return box;
}

// Thermometer von −20 bis +20 °C; zeigt die Starttemperatur (und mit Hilfe den Pfeil)
function thermometer(start, aenderung = null) {
  const y = (t) => 230 - (t + 20) * 5;
  let skala = '';
  // Ein Strich pro Grad, längere bei 5 und 10 – so kann man zählen
  for (let t = -20; t <= 20; t++) {
    const lang = t % 10 === 0 ? 78 : t % 5 === 0 ? 74 : 68;
    skala += `<line x1="62" y1="${y(t)}" x2="${lang}" y2="${y(t)}" stroke="${K}" stroke-width="${t % 5 ? 1.2 : 2.5}"/>`;
    if (t % 10 === 0) skala += `<text x="86" y="${y(t) + 6}" font-size="17" ${SCHRIFT} fill="${t < 0 ? '#2E5FA8' : t > 0 ? '#C8402E' : K}">${zeige(t)}</text>`;
  }
  const pfeil = aenderung === null ? '' :
    `<path d="M40 ${y(start)} L40 ${y(start + aenderung)}" stroke="#F6A940" stroke-width="5" marker-end="url(#spitze)"/>`;
  return svgBox(
    `<svg viewBox="0 0 130 270" class="ng-thermo" aria-hidden="true">` +
    `<defs><marker id="spitze" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#F6A940"/></marker></defs>` +
    `<rect x="46" y="20" width="16" height="220" rx="8" fill="#FFFFFF" stroke="${K}" stroke-width="4"/>` +
    `<circle cx="54" cy="248" r="16" fill="#E2543A" stroke="${K}" stroke-width="4"/>` +
    `<rect x="50" y="${y(start)}" width="8" height="${248 - y(start)}" fill="#E2543A"/>` +
    skala + pfeil +
    `</svg>`,
    'ng-bild',
  );
}

// Zahlenstrahl −15 bis +15 mit einem Sprung von a um b
function sprung(a, b) {
  const x = (z) => 20 + (z + 15) * 20;
  let striche = '';
  for (let z = -15; z <= 15; z++) {
    striche += `<line x1="${x(z)}" y1="${z % 5 ? 52 : 46}" x2="${x(z)}" y2="${z % 5 ? 68 : 74}" stroke="${K}" stroke-width="${z % 5 ? 2 : 3}"/>`;
    if (z % 5 === 0) striche += `<text x="${x(z)}" y="98" text-anchor="middle" font-size="18" ${SCHRIFT} fill="${K}">${zeige(z)}</text>`;
  }
  const ziel = Math.max(-15, Math.min(15, a + b));
  return svgBox(
    `<svg viewBox="0 0 640 110" class="ng-strahl" aria-hidden="true">` +
    `<line x1="10" y1="60" x2="630" y2="60" stroke="${K}" stroke-width="4"/>${striche}` +
    `<path d="M${x(a)} 40 Q${(x(a) + x(ziel)) / 2} 0 ${x(ziel)} 40" fill="none" stroke="#F6A940" stroke-width="5"/>` +
    `<circle cx="${x(a)}" cy="60" r="8" fill="#E2543A" stroke="${K}" stroke-width="2"/>` +
    `</svg>`,
    'ng-bild',
  );
}

function aufgabeEl(text) {
  return el('div', { class: 'em-aufgabe' }, el('span', {}, text), el('span', { class: 'em-gleich' }, '='), el('span', { class: 'em-frage' }, '?'));
}

function frage(x) {
  const N = T.negativ;
  if (x.art === 'thermometer') {
    return {
      text: N.thermometer(zeige(x.start), Math.abs(x.aenderung), x.aenderung > 0),
      bild: () => thermometer(x.start),
      antworten: x.antworten.map((a) => ({ ...a, text: `${zeige(a.wert)} °C` })),
      erklaerung: N.erklaerungThermo(zeige(x.start), zeige(x.ergebnis)),
      hilfe: () => ({ text: N.hilfeThermo(x.aenderung > 0), ersetzeBild: thermometer(x.start, x.aenderung) }),
    };
  }
  const malGeteilt = x.op === '·' || x.op === ':';
  return {
    text: N.tippe,
    sprich: N.vorlesen(x.text),
    bild: () => aufgabeEl(x.text),
    antworten: x.antworten.map((a) => ({ ...a, text: zeige(a.wert) })),
    erklaerung: `${x.text} = ${zeige(x.ergebnis)}`,
    hilfe: () => {
      if (malGeteilt) return { text: N.hilfeVorzeichen };
      if (x.art === 'minusNegativ') return { text: N.hilfeMinusMinus(zeige(x.a), zeige(-x.b)) };
      // Plus geht nach rechts, Minus (oder plus eine negative Zahl) nach links
      const schritt = x.op === '+' ? x.b : -x.b;
      return { text: schritt > 0 ? N.hilfeRechts(Math.abs(schritt)) : N.hilfeLinks(Math.abs(schritt)), bild: sprung(x.a, schritt) };
    },
  };
}

const STUFEN_BILD = { thermometer: '−3 °C', plusminus: '−3 + 5', malgeteilt: '−4 · 3', gemischt: '2 − (−5)' };

export function negativSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'negativ',
    farbe: FARBE,
    texte: T.negativ,
    anzahl: AUFGABEN,
    empfehlung: { kl56: 'thermometer', gymi: 'plusminus' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
