// Zeichnet das Nüni-Stei-Brett als SVG. Jeder Punkt hat eine grosse, unsichtbare
// Tippfläche (Radius 40 von 560 – auf dem iPad gut 70 px).
import { KOORDINATEN } from './regeln.js';

const NS = 'http://www.w3.org/2000/svg';
const RAND = 40;
const EINHEIT = 80;

const pos = (p) => KOORDINATEN[p].map((w) => RAND + w * EINHEIT);

function svg(tag, attribute = {}, ...kinder) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attribute)) if (v != null) e.setAttribute(k, v);
  e.append(...kinder);
  return e;
}

// Grundbrett: Holz, drei Quadrate, Verbindungslinien, Punkte
export function grundbrett() {
  const g = svg('g', { class: 'brett-grund' });
  g.append(svg('rect', { x: 4, y: 4, width: 552, height: 552, rx: 34, class: 'brett-holz' }));
  const linien = svg('g', { class: 'brett-linien' });
  for (const r of [0, 1, 2]) {
    const a = RAND + r * EINHEIT;
    const b = RAND + (6 - r) * EINHEIT;
    linien.append(svg('rect', { x: a, y: a, width: b - a, height: b - a }));
  }
  const m = RAND + 3 * EINHEIT;
  linien.append(
    svg('path', {
      d: `M${m} ${RAND} V${RAND + 2 * EINHEIT} M${m} ${RAND + 4 * EINHEIT} V${RAND + 6 * EINHEIT} ` +
        `M${RAND} ${m} H${RAND + 2 * EINHEIT} M${RAND + 4 * EINHEIT} ${m} H${RAND + 6 * EINHEIT}`,
    }),
  );
  g.append(linien);
  for (let p = 0; p < 24; p++) {
    const [x, y] = pos(p);
    g.append(svg('circle', { cx: x, cy: y, r: 11, class: 'brett-punkt' }));
  }
  return g;
}

// ansicht: { brett, gewaehlt, ziele, wegnehmbar, muehle, beweglich, zuletzt }
// zuletzt: { art, von, nach, punkt } für die Animation des letzten Zugs
export function zeichneBrett(ansicht, beiTipp) {
  const flaeche = svg('svg', { viewBox: '0 0 560 560', class: 'muehle-brett', role: 'group' });
  flaeche.append(grundbrett());

  if (ansicht.muehle) {
    const [x1, y1] = pos(ansicht.muehle[0]);
    const [x2, y2] = pos(ansicht.muehle[2]);
    flaeche.append(svg('line', { x1, y1, x2, y2, class: 'muehle-linie' }));
  }

  for (const p of ansicht.ziele ?? []) {
    const [x, y] = pos(p);
    flaeche.append(
      svg('g', { class: 'ziel' }, svg('circle', { cx: x, cy: y, r: 26, class: 'ziel-ring' }), svg('circle', { cx: x, cy: y, r: 9, class: 'ziel-punkt' })),
    );
  }

  // Ein eben weggenommener Stein verschwindet sanft
  const z = ansicht.zuletzt;
  if (z?.art === 'weg' && z.seite != null) {
    const [x, y] = pos(z.punkt);
    flaeche.append(stein(x, y, z.seite, 'stein verschwindet'));
  }

  ansicht.brett.forEach((seite, p) => {
    if (seite === null) return;
    const [x, y] = pos(p);
    let klasse = 'stein';
    if (p === ansicht.gewaehlt) klasse += ' gewaehlt';
    if (ansicht.beweglich?.includes(p)) klasse += ' beweglich';
    let stil = null;
    if (z && z.nach === p) {
      if (z.art === 'setzen') klasse += ' neu';
      else if (z.von != null) {
        const [vx, vy] = pos(z.von);
        klasse += ' gezogen';
        stil = `--dx: ${vx - x}px; --dy: ${vy - y}px`;
      }
    }
    const g = stein(x, y, seite, klasse, stil);
    if (ansicht.wegnehmbar?.includes(p)) g.append(...wegMarke(x, y));
    flaeche.append(g);
  });

  // Unsichtbare Tippflächen über allem
  for (let p = 0; p < 24; p++) {
    const [x, y] = pos(p);
    const ziel = svg('circle', { cx: x, cy: y, r: 40, class: 'tippflaeche', 'data-punkt': p });
    beiTipp(ziel, p);
    flaeche.append(ziel);
  }
  return flaeche;
}

function stein(x, y, seite, klasse, stil = null) {
  const farbe = seite === 0 ? 'weiss' : 'schwarz';
  return svg(
    'g',
    { class: `${klasse} ${farbe}`, style: stil },
    svg('circle', { cx: x, cy: y, r: 40, class: 'stein-glanz' }),
    svg('circle', { cx: x, cy: y + 5, r: 29, class: 'stein-schatten' }),
    svg('circle', { cx: x, cy: y, r: 29, class: 'stein-koerper' }),
    svg('circle', { cx: x, cy: y, r: 16, class: 'stein-rille' }),
  );
}

function wegMarke(x, y) {
  return [
    svg('circle', { cx: x, cy: y, r: 38, class: 'weg-ring' }),
    svg('circle', { cx: x + 27, cy: y - 27, r: 14, class: 'weg-knopf' }),
    svg('path', { d: `M${x + 21} ${y - 33} L${x + 33} ${y - 21} M${x + 33} ${y - 33} L${x + 21} ${y - 21}`, class: 'weg-kreuz' }),
  ];
}
