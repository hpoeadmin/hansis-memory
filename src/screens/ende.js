import { T } from '../texte.js';
import { el, knopf, zeige } from '../ui.js';

// Sterne: immer mindestens einer – es gibt kein «Verlieren».
export function berechneSterne(paare, zuege) {
  if (zuege <= paare * 1.5) return 3;
  if (zuege <= paare * 2.5) return 2;
  return 1;
}

function stern(verdient) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `stern ${verdient ? 'verdient' : 'leer'}`);
  svg.setAttribute('aria-hidden', 'true');
  const pfad = document.createElementNS(ns, 'path');
  pfad.setAttribute(
    'd',
    'M50 6 L62 37 L95 38 L69 59 L78 92 L50 73 L22 92 L31 59 L5 38 L38 37 Z',
  );
  svg.append(pfad);
  return svg;
}

export function zeigeEnde(app, { paare, zuege }) {
  const sterne = berechneSterne(paare, zuege);
  const lob = T.ende.lob[Math.floor(Math.random() * T.ende.lob.length)];

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: `--set-farbe: ${app.auswahl.set.farbe}` },
      el('h1', { class: 'lob' }, lob),
      el(
        'div',
        { class: 'sterne', role: 'img', 'aria-label': T.ende.sterne(sterne) },
        [1, 2, 3].map((n) => stern(n <= sterne)),
      ),
      el('p', { class: 'zusammenfassung' }, T.ende.zusammenfassung(paare, zuege)),
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => app.zeigeSpiel(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => app.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );
}
