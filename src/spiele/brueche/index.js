// «Brüche»: Bruchteile an Pizza und Schokoladentafel erkennen, gleichwertige Brüche,
// Brüche vergleichen und Bruchteile von Mengen.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './aufgaben.js';

export const FARBE = '#FDE3D3';
const AUFGABEN = 10;
const K = '#2E2A26';
const FUELLUNG = '#E2543A';

// Bruch übereinander geschrieben: Zähler, Strich, Nenner
export function bruchEl([z, n], klasse = '') {
  return el(
    'span',
    { class: `br-bruch ${klasse}`, 'aria-label': `${z} ${T.brueche.von} ${n}` },
    el('span', { class: 'br-zaehler' }, String(z)),
    el('span', { class: 'br-nenner' }, String(n)),
  );
}

function svgBox(html, klasse) {
  const box = el('div', { class: klasse });
  box.innerHTML = html;
  return box;
}

// Pizza: n gleich grosse Stücke, z davon gefärbt
function kreis([z, n]) {
  let stuecke = '';
  for (let i = 0; i < n; i++) {
    const w1 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const w2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = (w) => `${(100 + 90 * Math.cos(w)).toFixed(1)} ${(100 + 90 * Math.sin(w)).toFixed(1)}`;
    const gross = 1 / n > 0.5 ? 1 : 0;
    stuecke += `<path d="M100 100 L${p(w1)} A90 90 0 ${gross} 1 ${p(w2)} Z" fill="${i < z ? FUELLUNG : '#FFF6E0'}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  return svgBox(`<svg viewBox="0 0 200 200" class="br-svg" aria-hidden="true">${stuecke}</svg>`, 'br-form');
}

// Schokoladentafel bzw. Streifen: n gleiche Teile nebeneinander
export function balken([z, n], breite = 300) {
  const b = breite / n;
  let teile = '';
  for (let i = 0; i < n; i++) {
    teile += `<rect x="${4 + i * b}" y="4" width="${b}" height="56" fill="${i < z ? FUELLUNG : '#FFF6E0'}" stroke="${K}" stroke-width="4"/>`;
  }
  return svgBox(`<svg viewBox="0 0 ${breite + 8} 64" class="br-svg br-balken" aria-hidden="true">${teile}</svg>`, 'br-form');
}

// Bruchteil von einer Menge: n Gruppen, z davon gefärbt
function gruppen(x) {
  const proGruppe = x.menge / x.bruch[1];
  return el(
    'div',
    { class: 'br-gruppen', 'aria-hidden': 'true' },
    Array.from({ length: x.bruch[1] }, (_, g) =>
      el('div', { class: `br-gruppe ${g < x.bruch[0] ? 'an' : ''}` }, Array.from({ length: proGruppe }, () => el('span', { class: 'rz-punkt' }))),
    ),
  );
}

function frage(x) {
  const B = T.brueche;
  if (x.art === 'erkennen') {
    return {
      text: x.form === 'kreis' ? B.frageKreis : B.frageBalken,
      bild: () => (x.form === 'kreis' ? kreis(x.bruch) : balken(x.bruch)),
      antworten: x.antworten.map((a) => ({ text: bruchEl(a.bruch), richtig: a.richtig })),
      erklaerung: B.erklaerungErkennen(x.bruch[0], x.bruch[1]),
      hilfe: () => ({ text: B.hilfeErkennen }),
    };
  }
  if (x.art === 'gleich') {
    return {
      text: B.frageGleich,
      bild: () => el('div', { class: 'br-bild' }, bruchEl(x.gegeben, 'br-gross'), balken(x.gegeben)),
      antworten: x.antworten.map((a) => ({ text: bruchEl(a.bruch), richtig: a.richtig })),
      erklaerung: B.erklaerungGleich(x.gegeben, x.bruch),
      hilfe: () => ({ text: B.hilfeGleich, bild: el('div', { class: 'br-bild' }, balken(x.gegeben), balken(x.bruch)) }),
    };
  }
  if (x.art === 'vergleichen') {
    return {
      text: B.frageVergleichen,
      bild: () => el('div', { class: 'br-bild br-paar' }, bruchEl(x.a, 'br-gross'), el('span', { class: 'br-oder' }, B.oder), bruchEl(x.b, 'br-gross')),
      antworten: x.antworten.map((a) => ({ text: bruchEl(a.bruch), richtig: a.richtig })),
      erklaerung: B.erklaerungVergleichen(x.bruch),
      hilfe: () => ({ text: B.hilfeVergleichen, bild: el('div', { class: 'br-bild' }, balken(x.a), balken(x.b)) }),
    };
  }
  const [z, n] = x.bruch;
  return {
    text: B.frageBruchteil(z, n, x.menge),
    sprich: B.vorlesenVon(z, n, x.menge),
    bild: () => el('div', { class: 'br-bild br-paar' }, bruchEl(x.bruch, 'br-gross'), el('span', { class: 'br-oder' }, B.von), el('span', { class: 'br-menge' }, String(x.menge))),
    antworten: x.antworten,
    erklaerung: B.erklaerungVon(z, n, x.menge, x.ergebnis),
    hilfe: () => ({ text: B.hilfeVon(x.menge, n, z), bild: gruppen(x) }),
  };
}

const STUFEN_BILD = { erkennen: [3, 4], gleich: [2, 4], vergleichen: [2, 3], von: [3, 4] };

export function bruecheSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'brueche',
    farbe: FARBE,
    texte: T.brueche,
    anzahl: AUFGABEN,
    empfehlung: { kl34: 'erkennen', kl56: 'gleich' },
    stufenBild: (id) => (id === 'erkennen' ? kreis(STUFEN_BILD[id]) : el('span', { class: 'fs-stufen-text' }, bruchEl(STUFEN_BILD[id]), id === 'vergleichen' ? ' < ' : id === 'gleich' ? ' = ' : ' von 20', id === 'vergleichen' ? bruchEl([3, 4]) : id === 'gleich' ? bruchEl([1, 2]) : '')),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
