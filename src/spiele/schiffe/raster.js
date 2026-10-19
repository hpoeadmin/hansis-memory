// Spielfeld zeichnen: Buchstaben oben (A, B, C …), Zahlen links (1, 2, 3 …).
// optionen: { schiffeZeigen, gewaehlt (Schiff-ID), beimTipp(x, y), klein, zuletzt: {x, y} }
import { el, beiTipp } from '../../kern/ui.js';
import { BUCHSTABEN, feldName, istVersenkt, schiffAuf, zellen } from './logik.js';

function schiffsTeil(schiff, x, y) {
  const teile = zellen(schiff);
  const i = teile.findIndex(([a, b]) => a === x && b === y);
  const lage = schiff.quer ? 'quer' : 'laengs';
  if (schiff.laenge === 1) return `${lage} ganz`;
  return `${lage} ${i === 0 ? 'anfang' : i === teile.length - 1 ? 'ende' : 'mitte'}`;
}

export function zeichneRaster(brett, { schiffeZeigen = false, gewaehlt = null, beimTipp = null, klein = false, zuletzt = null } = {}) {
  const n = brett.n;
  const raster = el('div', { class: `sv-raster ${klein ? 'sv-klein' : ''} ${beimTipp ? 'sv-aktiv' : ''}`, style: `--n: ${n}` });
  raster.append(el('span', { class: 'sv-ecke' }));
  for (let x = 0; x < n; x++) raster.append(el('span', { class: 'sv-kopf' }, BUCHSTABEN[x]));

  for (let y = 0; y < n; y++) {
    raster.append(el('span', { class: 'sv-kopf' }, String(y + 1)));
    for (let x = 0; x < n; x++) {
      const schuss = brett.schuesse.find((s) => s.x === x && s.y === y);
      const schiff = schiffAuf(brett, x, y);
      const versenkt = schiff && istVersenkt(brett, schiff);
      const klassen = ['sv-feld'];
      // Eigene Schiffe immer, fremde erst, wenn sie versenkt sind
      if (schiff && (schiffeZeigen || versenkt)) {
        klassen.push('sv-schiff', ...schiffsTeil(schiff, x, y).split(' '));
        if (schiff.id === gewaehlt) klassen.push('sv-gewaehlt');
      }
      if (schuss) klassen.push(schuss.treffer ? (versenkt ? 'sv-versenkt' : 'sv-treffer') : 'sv-wasser');
      if (zuletzt && zuletzt.x === x && zuletzt.y === y) klassen.push('sv-zuletzt');
      const feld = el(beimTipp ? 'button' : 'span', { class: klassen.join(' '), 'aria-label': feldName(x, y) });
      if (beimTipp) {
        feld.type = 'button';
        beiTipp(feld, () => beimTipp(x, y), { sperrzeit: 250 });
      }
      raster.append(feld);
    }
  }
  return raster;
}

// Übersicht der gegnerischen Flotte: welche Schiffe noch schwimmen
export function flottenAnzeige(brett) {
  return el(
    'div',
    { class: 'sv-flotte', 'aria-hidden': 'true' },
    [...brett.schiffe]
      .sort((a, b) => b.laenge - a.laenge)
      .map((s) =>
        el(
          'span',
          { class: `sv-mini ${istVersenkt(brett, s) ? 'weg' : ''}` },
          Array.from({ length: s.laenge }, () => el('span', { class: 'sv-mini-teil' })),
        ),
      ),
  );
}
