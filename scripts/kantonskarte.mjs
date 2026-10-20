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

// Seen mit Namen: der nächste bekannte Seemittelpunkt (Breite, Länge) gibt den Namen
const SEE_NAMEN = [
  ['genfersee', 'Genfersee', 46.45, 6.55], ['bodensee', 'Bodensee', 47.6, 9.4],
  ['neuenburgersee', 'Neuenburgersee', 46.9, 6.85], ['lagomaggiore', 'Lago Maggiore', 45.95, 8.65],
  ['vierwaldstaettersee', 'Vierwaldstättersee', 47.0, 8.45], ['zuerichsee', 'Zürichsee', 47.25, 8.65],
  ['luganersee', 'Luganersee', 45.98, 8.97], ['thunersee', 'Thunersee', 46.7, 7.72],
  ['bielersee', 'Bielersee', 47.08, 7.17], ['zugersee', 'Zugersee', 47.12, 8.48],
  ['brienzersee', 'Brienzersee', 46.73, 7.97], ['walensee', 'Walensee', 47.12, 9.2],
  ['murtensee', 'Murtensee', 46.93, 7.08], ['sempachersee', 'Sempachersee', 47.14, 8.15],
  ['hallwilersee', 'Hallwilersee', 47.28, 8.22], ['sihlsee', 'Sihlsee', 47.13, 8.78],
  ['greifensee', 'Greifensee', 47.35, 8.68], ['lacdejoux', 'Lac de Joux', 46.63, 6.28],
  ['aegerisee', 'Ägerisee', 47.12, 8.62], ['sarnersee', 'Sarnersee', 46.87, 8.21],
  ['gruyere', 'Lac de la Gruyère', 46.66, 7.08], ['baldeggersee', 'Baldeggersee', 47.2, 8.26],
].map(([id, name, lat, lon]) => ({ id, name, punkt: proj([lon, lat]) }));

const seen = topo.objects.lakes.geometries
  .map((g) => ringeVon(g).filter((r) => flaeche(r) > MIN_SEE))
  .filter((ringe) => ringe.length)
  .map((ringe) => {
    const [mx, my] = mitte(ringe);
    const naechster = SEE_NAMEN.reduce((a, b) => (Math.hypot(b.punkt[0] - mx, b.punkt[1] - my) < Math.hypot(a.punkt[0] - mx, a.punkt[1] - my) ? b : a));
    const passt = Math.hypot(naechster.punkt[0] - mx, naechster.punkt[1] - my) < 40;
    const name = passt ? ` id="see-${naechster.id}" data-see="${naechster.id}" data-name="${naechster.name}"` : '';
    return `<path class="kt-see"${name} data-mx="${zahl(mx)}" data-my="${zahl(my)}" d="${pfad(ringe)}"/>`;
  });

// Städte und Berge als Punkte auf der Karte (für «Schweizer Geografie»)
const ORTE = {
  staedte: [
    ['Zürich', 47.377, 8.54], ['Bern', 46.948, 7.447], ['Basel', 47.56, 7.588], ['Genf', 46.204, 6.143],
    ['Lausanne', 46.52, 6.633], ['Luzern', 47.05, 8.309], ['St. Gallen', 47.424, 9.377], ['Lugano', 46.004, 8.951],
    ['Winterthur', 47.5, 8.724], ['Biel', 47.137, 7.247], ['Chur', 46.849, 9.532], ['Sitten', 46.233, 7.36],
    ['Schaffhausen', 47.696, 8.635], ['Freiburg', 46.806, 7.162], ['Neuenburg', 46.99, 6.931], ['Bellinzona', 46.192, 9.017],
    ['Thun', 46.758, 7.628], ['Aarau', 47.392, 8.044], ['Zug', 47.166, 8.516],
  ],
  berge: [
    ['Dufourspitze', 45.937, 7.867, 4634], ['Matterhorn', 45.976, 7.659, 4478], ['Eiger', 46.577, 8.005, 3967],
    ['Säntis', 47.249, 9.343, 2502], ['Pilatus', 46.979, 8.255, 2128], ['Rigi', 47.056, 8.485, 1798],
    ['Titlis', 46.772, 8.437, 3238], ['Piz Bernina', 46.382, 9.908, 4049], ['Tödi', 46.811, 8.915, 3614],
    ['Napf', 47.005, 7.94, 1408], ['Weisshorn', 46.101, 7.716, 4506], ['Niesen', 46.645, 7.651, 2362],
  ],
  // Römerstädte und -lager in der Schweiz (Name, Breite, Länge, heutiger Ort)
  roemer: [
    ['Augusta Raurica', 47.533, 7.722, 'Augst'], ['Vindonissa', 47.479, 8.221, 'Windisch'],
    ['Aventicum', 46.882, 7.042, 'Avenches'], ['Turicum', 47.37, 8.541, 'Zürich'],
    ['Octodurus', 46.102, 7.072, 'Martigny'], ['Lousonna', 46.517, 6.6, 'Lausanne'],
    ['Curia', 46.85, 9.532, 'Chur'], ['Genava', 46.204, 6.143, 'Genf'],
    ['Salodurum', 47.208, 7.537, 'Solothurn'], ['Vitudurum', 47.51, 8.758, 'Oberwinterthur'],
  ],
};
const orte = Object.fromEntries(
  Object.entries(ORTE).map(([art, liste]) => [
    art,
    liste.map(([name, lat, lon, extra]) => {
      const [x, y] = proj([lon, lat]);
      // extra: Höhe (Berge) oder heutiger Ort (Römer)
      const zusatz = typeof extra === 'number' ? { hoehe: extra } : extra ? { heute: extra } : {};
      return { name, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, ...zusatz };
    }),
  ]),
);
writeFileSync(
  'src/spiele/geografie/orte.json',
  `${JSON.stringify(orte, null, 1)}\n`,
);

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 ${BREITE + 12} ${HOEHE + 12}">\n` +
  `<!-- Geodaten: Bundesamt für Statistik (BFS), GEOSTAT; aufbereitet mit swiss-maps (Interactive Things) -->\n` +
  // Farben als Attribute: so sieht die Karte auch als <img> richtig aus, CSS kann sie übersteuern
  `<g class="kt-kantone" fill="#F3E3C3" stroke="#2E2A26" stroke-width="1.6" stroke-linejoin="round">\n${kantone.join('\n')}\n</g>\n` +
  `<g class="kt-seen" fill="#9CCBF0" pointer-events="none">\n${seen.join('\n')}\n</g>\n</svg>\n`;
writeFileSync('public/spiele/kantone-karte.svg', svg);
console.log(`${kantone.length} Kantone, ${seen.length} Seen, ${(svg.length / 1024).toFixed(0)} KB, ${BREITE}×${HOEHE}`);
