// Geometrie und Zeichnung des Eile-mit-Weile-Bretts (wie der freigegebene Entwurf).
// Koordinaten im SVG-Raster 700 × 700. Arm 0 = oben (Rot), 1 = rechts (Grün),
// 2 = unten (Blau), 3 = links (Gelb); alles andere entsteht durch Drehen um 90°.
import { BAENKLI, FELDER, HAUS, absolut } from './regeln.js';

const NS = 'http://www.w3.org/2000/svg';
const K = '#2E2A26';
const O = 350;
const W = 44; // Feldbreite quer zum Weg
const E = 20;
const REIHEN = 6;
const HOEHE = 29; // Feldhöhe in Laufrichtung
const A = O - E - REIHEN * HOEHE; // Abstand Armende – Mitte
const R1 = A - 66;
const R2 = R1 + W;

export const FARBEN = ['#D64545', '#2F8F46', '#2F6FD0', '#F6C945']; // Rot, Grün, Blau, Gelb
export const HELL = ['#F4C0C0', '#BFE3B4', '#BFD3F2', '#FBE7A0'];

const yReihe = (i) => E + (i + 0.5) * HOEHE;

function dreh(x, y, k) {
  for (let i = 0; i < k; i++) [x, y] = [2 * O - y, x];
  return [x, y];
}

// Die 76 Felder in Spielrichtung; Feld 19 × Arm ist das Start-Bänkli des Arms
export const WEG = [];
for (let k = 0; k < 4; k++) {
  WEG.push({ xy: dreh(O, yReihe(0), k), art: 'start', arm: k });
  for (let i = 0; i < REIHEN; i++) WEG.push({ xy: dreh(O + W, yReihe(i), k), art: 'feld', arm: k });
  const [cx, cy] = dreh(O + A, O - A, k);
  for (let j = 0; j < 6; j++) {
    const w = ((180 + 90 * k - (j + 0.5) * 15) * Math.PI) / 180;
    WEG.push({ xy: [cx + ((R1 + R2) / 2) * Math.cos(w), cy + ((R1 + R2) / 2) * Math.sin(w)], art: 'bogen', arm: k, j });
  }
  for (let i = REIHEN - 1; i >= 0; i--) WEG.push({ xy: dreh(O - W, yReihe(i), (k + 1) % 4), art: 'feld', arm: (k + 1) % 4 });
}

export const ZIELGASSE = [0, 1, 2, 3].map((k) => Array.from({ length: 8 }, (_, i) => dreh(O, yReihe(i + 1), k)));
const HAUSMITTE = [0, 1, 2, 3].map((k) => dreh(105, 105, k));
const HAUSPLATZ = [
  [-34, -34],
  [34, -34],
  [-34, 34],
  [34, 34],
];

export function koordinate(arm, figur, pos) {
  if (pos === HAUS) {
    const [x, y] = HAUSMITTE[arm];
    return [x + HAUSPLATZ[figur][0], y + HAUSPLATZ[figur][1]];
  }
  if (pos < FELDER) return WEG[absolut(arm, pos)].xy;
  return ZIELGASSE[arm][pos - FELDER];
}

// Alle Zwischenschritte eines Zugs (für die Hüpf-Animation)
export function pfad(arm, figur, von, nach) {
  if (von === HAUS) return [koordinate(arm, figur, 0)];
  const liste = [];
  for (let p = von + 1; p <= nach; p++) liste.push(koordinate(arm, figur, p));
  return liste;
}

// ---------- Grundbrett (einmal als SVG-Text) ----------

function rechteck([x, y], arm, fuell, rand = K, dick = 3) {
  const [w, h] = arm % 2 === 0 ? [W - 4, HOEHE - 3] : [HOEHE - 3, W - 4];
  return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="5" fill="${fuell}" stroke="${rand}" stroke-width="${dick}"/>`;
}

function bankBild([x, y]) {
  const s = 0.72;
  const r = (dx, dy, w, h, f = '#9C6B3C', rx = 0) =>
    `<rect x="${x + dx * s}" y="${y + dy * s}" width="${w * s}" height="${h * s}" rx="${rx}" fill="${f}"/>`;
  return (
    `<g stroke="${K}" stroke-width="1.6" stroke-linejoin="round">` +
    r(-11, -8, 3.5, 9) + r(7.5, -8, 3.5, 9) + r(-14, -14, 28, 7, '#9C6B3C', 1.5) +
    r(-12, 4, 3.5, 10) + r(8.5, 4, 3.5, 10) + r(-16, -1, 32, 7, '#B8814C', 1.5) +
    '</g>'
  );
}

function sektor(cx, cy, w0, w1) {
  const p = (r, w) => [cx + r * Math.cos(w), cy + r * Math.sin(w)];
  const [a0, a1, b1, b0] = [p(R2, w0), p(R2, w1), p(R1, w1), p(R1, w0)];
  return `M${a0} A${R2} ${R2} 0 0 1 ${a1} L${b1} A${R1} ${R1} 0 0 0 ${b0} Z`;
}

let grundText = null;
function grundbrett(arme) {
  let s = `<rect x="4" y="4" width="692" height="692" rx="30" fill="#FBF7EF" stroke="${K}" stroke-width="8"/>`;
  for (let k = 0; k < 4; k++) {
    const [x, y] = HAUSMITTE[k];
    const aktiv = arme.includes(k);
    s += `<rect x="${x - 78}" y="${y - 78}" width="156" height="156" rx="26" fill="${aktiv ? HELL[k] : '#EFEAE0'}" stroke="${K}" stroke-width="4"/>`;
    for (const [dx, dy] of HAUSPLATZ) s += `<circle cx="${x + dx}" cy="${y + dy}" r="22" fill="#FFFFFF" stroke="${K}" stroke-width="4"/>`;
  }
  s += `<circle cx="${O}" cy="${O}" r="34" fill="#FFFFFF" stroke="${K}" stroke-width="4"/>`;
  s += `<path d="M${O - 14} ${O} L${O - 3} ${O + 11} L${O + 16} ${O - 11}" fill="none" stroke="#2F8F46" stroke-width="6" stroke-linecap="round"/>`;
  for (let k = 0; k < 4; k++) {
    const [cx, cy] = dreh(O + A, O - A, k);
    for (let j = 0; j < 6; j++) {
      const w0 = ((180 + 90 * k - (j + 1) * 15) * Math.PI) / 180;
      const w1 = ((180 + 90 * k - j * 15) * Math.PI) / 180;
      s += `<path d="${sektor(cx, cy, w0, w1)}" fill="#FFFFFF" stroke="${K}" stroke-width="3"/>`;
    }
  }
  WEG.forEach((f, i) => {
    if (f.art === 'bogen') return;
    if (BAENKLI.has(i)) {
      const start = f.art === 'start';
      s += rechteck(f.xy, f.arm, start ? HELL[f.arm] : '#F3E3C2', start ? FARBEN[f.arm] : K, start ? 5 : 3);
      s += bankBild(f.xy);
    } else {
      s += rechteck(f.xy, f.arm, '#FFFFFF');
    }
  });
  ZIELGASSE.forEach((gasse, k) => gasse.forEach((xy) => (s += rechteck(xy, k, FARBEN[k]))));
  return s;
}

function el(tag, attribute = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attribute)) if (v != null) e.setAttribute(k, v);
  return e;
}

// ---------- Figuren ----------

const VERSATZ = [
  [-5, -4],
  [5, 4],
  [5, -4],
  [-5, 4],
];

function figurText(x, y, arm) {
  return (
    `<circle cx="${x}" cy="${y + 2.5}" r="13.5" fill="${K}" opacity="0.25"/>` +
    `<circle cx="${x}" cy="${y}" r="13.5" fill="${FARBEN[arm]}" stroke="${K}" stroke-width="3.5"/>` +
    `<circle cx="${x - 4}" cy="${y - 2.5}" r="2" fill="${K}"/><circle cx="${x + 4}" cy="${y - 2.5}" r="2" fill="${K}"/>` +
    `<path d="M${x - 4} ${y + 3} Q${x} ${y + 6} ${x + 4} ${y + 3}" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`
  );
}

// ansicht: { zustand, beweglich: [{figur, nach}], bewegt: {arm, figur, xy}, sperren: [feld] }
// beiTipp(element, zug) macht leuchtende Figuren und ihre Zielfelder antippbar.
export function zeichneBrett(ansicht, beiTipp) {
  const { zustand } = ansicht;
  const svg = el('svg', { viewBox: '0 0 700 700', class: 'emw-brett', role: 'group' });
  const grund = el('g');
  grundText ??= new Map();
  const schluessel = zustand.arme.join(',');
  if (!grundText.has(schluessel)) grundText.set(schluessel, grundbrett(zustand.arme));
  grund.innerHTML = grundText.get(schluessel);
  svg.append(grund);

  // Zielfelder der leuchtenden Figuren (gestrichelt)
  const arm = zustand.amZug;
  for (const zug of ansicht.beweglich ?? []) {
    const [x, y] = koordinate(arm, zug.figur, zug.nach);
    const ring = el('circle', { cx: x, cy: y, r: 17, class: 'emw-ziel', style: `--farbe: ${FARBEN[arm]}; --hell: ${HELL[arm]}` });
    svg.append(ring);
  }

  // Figuren nach Position gruppieren, damit gestapelte leicht versetzt erscheinen
  const gruppen = new Map();
  for (const a of zustand.arme) {
    zustand.figuren[a].forEach((pos, figur) => {
      let xy = koordinate(a, figur, pos);
      if (ansicht.bewegt && ansicht.bewegt.arm === a && ansicht.bewegt.figur === figur) xy = ansicht.bewegt.xy;
      const key = xy.map((w) => Math.round(w)).join(',');
      if (!gruppen.has(key)) gruppen.set(key, []);
      gruppen.get(key).push({ arm: a, figur, xy });
    });
  }
  const beweglichFiguren = new Set((ansicht.beweglich ?? []).map((z) => z.figur));
  const figurenEbene = el('g');
  const glanzEbene = el('g');
  for (const liste of gruppen.values()) {
    liste.forEach((f, i) => {
      const [dx, dy] = liste.length > 1 ? VERSATZ[i % 4] : [0, 0];
      const [x, y] = [f.xy[0] + dx, f.xy[1] + dy];
      if (f.arm === arm && beweglichFiguren.has(f.figur) && !ansicht.bewegt) {
        glanzEbene.append(el('circle', { cx: x, cy: y, r: 22, class: 'emw-glanz' }));
      }
      const g = el('g', { class: 'emw-figur' });
      g.innerHTML = figurText(x, y, f.arm);
      figurenEbene.append(g);
    });
  }
  svg.append(glanzEbene, figurenEbene);

  // Sperren mit einem Schloss markieren
  for (const feld of ansicht.sperren ?? []) {
    const [x0, y0] = WEG[feld].xy;
    const [x, y] = [x0 + 17, y0 - 14];
    const g = el('g', { class: 'emw-schloss' });
    g.innerHTML =
      `<circle cx="${x}" cy="${y}" r="10" fill="#FFFFFF" stroke="${K}" stroke-width="3"/>` +
      `<rect x="${x - 5.5}" y="${y - 2}" width="11" height="8" rx="2" fill="${K}"/>` +
      `<path d="M${x - 3.5} ${y - 2} V${y - 5.5} A3.5 3.5 0 0 1 ${x + 3.5} ${y - 5.5} V${y - 2}" fill="none" stroke="${K}" stroke-width="2.2"/>`;
    svg.append(g);
  }

  // Grosse, unsichtbare Tippflächen: auf der Figur und auf ihrem Zielfeld
  for (const zug of ansicht.beweglich ?? []) {
    const pos = zustand.figuren[arm][zug.figur];
    for (const [x, y] of [koordinate(arm, zug.figur, pos), koordinate(arm, zug.figur, zug.nach)]) {
      const flaeche = el('circle', { cx: x, cy: y, r: 26, class: 'emw-tipp' });
      beiTipp(flaeche, zug);
      svg.append(flaeche);
    }
  }
  return svg;
}

// Felder mit einer Sperre (zwei gleiche Figuren auf einem Bänkli)
export function sperren(zustand) {
  const liste = [];
  for (const feld of BAENKLI) {
    const anzahl = {};
    for (const a of zustand.arme) {
      zustand.figuren[a].forEach((pos) => {
        if (pos >= 0 && pos < FELDER && absolut(a, pos) === feld) anzahl[a] = (anzahl[a] ?? 0) + 1;
      });
    }
    if (Object.values(anzahl).some((n) => n >= 2)) liste.push(feld);
  }
  return liste;
}
