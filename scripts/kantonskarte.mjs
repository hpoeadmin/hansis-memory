// Erzeugt die vereinfachte Kantonskarte public/spiele/kantone-karte.svg
// aus den TopoJSON-Daten des npm-Pakets «swiss-maps» (ch-combined.json).
// Geodaten: Bundesamt für Statistik (BFS), GEOSTAT – nicht-kommerzielle Nutzung mit Quellenangabe.
// Aufruf: node scripts/kantonskarte.mjs <pfad/zu/ch-combined.json>
import { readFileSync, writeFileSync } from 'node:fs';

// BFS-Nummer 1–26 → Kürzel (gleiche Reihenfolge wie src/spiele/kantone/kantone.js)
const KUERZEL = 'zh be lu ur sz ow nw gl zg fr so bs bl sh ar ai sg gr ag tg ti vd vs ne ge ju'.split(' ');
const BREITE = 1000;
const TOLERANZ = 0.9; // Vereinfachung in Bildpunkten
const MIN_SEE = 25; // kleinere Seen weglassen (Fläche in Bildpunkten²)

const topo = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;

// Bögen entschlüsseln (delta-kodiert) → Längen-/Breitengrad
const boegenGeo = topo.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
});

// Projektion: gleichabständig, Längengrade um cos(46.8°) gestaucht
const COS = Math.cos((46.8 * Math.PI) / 180);
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const arc of boegenGeo) for (const [lon, lat] of arc) {
  minX = Math.min(minX, lon * COS); maxX = Math.max(maxX, lon * COS);
  minY = Math.min(minY, -lat); maxY = Math.max(maxY, -lat);
}
const massstab = BREITE / (maxX - minX);
const HOEHE = Math.ceil((maxY - minY) * massstab);
const proj = ([lon, lat]) => [(lon * COS - minX) * massstab, (-lat - minY) * massstab];

// Douglas-Peucker pro Bogen – gemeinsame Grenzen bleiben deckungsgleich
function vereinfache(punkte) {
  if (punkte.length <= 2) return punkte;
  const behalten = new Array(punkte.length).fill(false);
  behalten[0] = behalten[punkte.length - 1] = true;
  const stapel = [[0, punkte.length - 1]];
  while (stapel.length) {
    const [a, b] = stapel.pop();
    const [ax, ay] = punkte[a];
    const [bx, by] = punkte[b];
    const lx = bx - ax, ly = by - ay;
    const laenge = Math.hypot(lx, ly) || 1;
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(lx * (ay - punkte[i][1]) - ly * (ax - punkte[i][0])) / laenge;
      if (d > max) { max = d; idx = i; }
    }
    if (max > TOLERANZ) {
      behalten[idx] = true;
      stapel.push([a, idx], [idx, b]);
    }
  }
  return punkte.filter((_, i) => behalten[i]);
}

const boegen = boegenGeo.map((arc) => vereinfache(arc.map(proj)));
const bogen = (i) => (i >= 0 ? boegen[i] : [...boegen[~i]].reverse());

function ring(indizes) {
  const punkte = [];
  for (const i of indizes) {
    const b = bogen(i);
    punkte.push(...(punkte.length ? b.slice(1) : b));
  }
  return punkte;
}

const zahl = (v) => (Math.round(v * 10) / 10).toString();
const pfad = (ringe) =>
  ringe
    .filter((r) => r.length > 2)
    .map((r) => `M${r.map(([x, y]) => `${zahl(x)} ${zahl(y)}`).join('L')}Z`)
    .join('');

function flaeche(r) {
  let f = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    f += x1 * y2 - x2 * y1;
  }
  return Math.abs(f / 2);
}

function ringeVon(geo) {
  const polygone = geo.type === 'Polygon' ? [geo.arcs] : geo.arcs;
  return polygone.flatMap((poly) => poly.map(ring));
}

// Mittelpunkt (für Beschriftung/Markierung): Schwerpunkt des grössten Rings
function mitte(ringe) {
  const r = ringe.reduce((a, b) => (flaeche(b) > flaeche(a) ? b : a));
  let cx = 0, cy = 0, f = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    const k = x1 * y2 - x2 * y1;
    f += k; cx += (x1 + x2) * k; cy += (y1 + y2) * k;
  }
  return [cx / (3 * f), cy / (3 * f)];
}

const kantone = topo.objects.cantons.geometries.map((g) => {
  const ringe = ringeVon(g);
  const kz = KUERZEL[Number(g.id) - 1];
  const [mx, my] = mitte(ringe);
  return `<path id="kt-${kz}" class="kt-kanton" data-kz="${kz}" data-mx="${zahl(mx)}" data-my="${zahl(my)}" d="${pfad(ringe)}"/>`;
});

const seen = topo.objects.lakes.geometries
  .map((g) => ringeVon(g).filter((r) => flaeche(r) > MIN_SEE))
  .filter((ringe) => ringe.length)
  .map((ringe) => `<path class="kt-see" d="${pfad(ringe)}"/>`);

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 ${BREITE + 12} ${HOEHE + 12}">\n` +
  `<!-- Geodaten: Bundesamt für Statistik (BFS), GEOSTAT; aufbereitet mit swiss-maps (Interactive Things) -->\n` +
  // Farben als Attribute: so sieht die Karte auch als <img> richtig aus, CSS kann sie übersteuern
  `<g class="kt-kantone" fill="#F3E3C3" stroke="#2E2A26" stroke-width="1.6" stroke-linejoin="round">\n${kantone.join('\n')}\n</g>\n` +
  `<g class="kt-seen" fill="#9CCBF0" pointer-events="none">\n${seen.join('\n')}\n</g>\n</svg>\n`;
writeFileSync('public/spiele/kantone-karte.svg', svg);
console.log(`${kantone.length} Kantone, ${seen.length} Seen, ${(svg.length / 1024).toFixed(0)} KB, ${BREITE}×${HOEHE}`);
