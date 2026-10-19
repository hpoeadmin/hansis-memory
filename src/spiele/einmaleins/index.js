// «Einmaleins-Meister»: kleines Einmaleins, Teilen, Zehnereinmaleins und Teilen mit Rest.
// Frage mit vier Antwortknöpfen; bei einem Fehler hilft ein Punktefeld oder ein Rechentipp.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './rechnen.js';

export const FARBE = '#FDE6D8';
const AUFGABEN = 10;

// Punktefeld: a Reihen mit je b Punkten – so sieht man, was «mal» bedeutet
function punktefeld(a, b) {
  const feld = el('div', { class: 'em-punkte', style: `--spalten: ${b}`, 'aria-hidden': 'true' });
  for (let i = 0; i < a * b; i++) feld.append(el('span', { class: Math.floor(i / b) % 2 ? 'em-punkt em-b' : 'em-punkt' }));
  return feld;
}

function rechnung(x) {
  return `${x.a} ${x.op} ${x.b}`;
}

function frage(x) {
  const E = T.einmaleins;
  const ergebnis = x.rest ? `${x.ergebnis} Rest ${x.rest}` : String(x.ergebnis);
  return {
    text: E.tippe,
    sprich: E.vorlesen(x.a, x.op, x.b),
    bild: () => el('div', { class: 'em-aufgabe' }, el('span', {}, rechnung(x)), el('span', { class: 'em-gleich' }, '='), el('span', { class: 'em-frage' }, '?')),
    antworten: x.antworten.map((a) => ({ text: a.text, richtig: a.richtig })),
    erklaerung: `${rechnung(x)} = ${ergebnis}`,
    hilfe: () => {
      const { a, b } = x.kern;
      if (x.art === 'rest') return { text: E.hilfeRest(x.b, x.a, x.b * x.ergebnis) };
      if (x.art === 'zehner-mal') return { text: E.hilfeZehnerMal(a, b, a * b) };
      if (x.art === 'zehner-teilen') return { text: E.hilfeZehnerTeilen(a * b, a, b) };
      if (x.art === 'teilen') return { text: E.hilfeTeilen(x.b, x.a), bild: punktefeld(x.b, x.ergebnis) };
      return { text: E.hilfeMal(x.a, x.b), bild: punktefeld(x.a, x.b) };
    },
  };
}

const STUFEN_BILD = { reihen: '2 · 5 · 10', alle: '7 × 8', teilen: '56 : 8', profi: '30 × 7' };

export function einmaleinsSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'einmaleins',
    farbe: FARBE,
    texte: T.einmaleins,
    anzahl: AUFGABEN,
    empfehlung: { kl12: 'reihen', kl34: 'alle', kl56: 'profi' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
