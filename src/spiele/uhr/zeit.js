// Uhrzeiten und Zeitspannen für «Uhr lesen» (Lehrplan 21: 2.–4. Klasse).
// Uhrzeiten auf dem Zifferblatt: h = 1–12, m = 0–55.

export const STUFEN = {
  stunden: { minuten: [0, 30] }, // volle und halbe Stunden
  viertel: { minuten: [0, 15, 30, 45] }, // auch Viertel nach / Viertel vor
  fuenf: { minuten: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] }, // Fünf-Minuten-Schritte
  dauer: { dauer: true }, // Zeitspannen am Fahrplan (4. Klasse)
};

const ZAHLWORT = ['zwölf', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf'];

const wort = (h) => ZAHLWORT[h % 12];
const naechste = (h) => (h % 12) + 1;

// «halb vier», «Viertel nach drei», «fünf vor halb vier», «ein Uhr»
export function zeitWorte(h, m) {
  const n = wort(naechste(h));
  switch (m) {
    case 0:
      return h % 12 === 1 ? 'ein Uhr' : `${wort(h)} Uhr`;
    case 5:
      return `fünf nach ${wort(h)}`;
    case 10:
      return `zehn nach ${wort(h)}`;
    case 15:
      return `Viertel nach ${wort(h)}`;
    case 20:
      return `zwanzig nach ${wort(h)}`;
    case 25:
      return `fünf vor halb ${n}`;
    case 30:
      return `halb ${n}`;
    case 35:
      return `fünf nach halb ${n}`;
    case 40:
      return `zwanzig vor ${n}`;
    case 45:
      return `Viertel vor ${n}`;
    case 50:
      return `zehn vor ${n}`;
    default:
      return `fünf vor ${n}`;
  }
}

// «3:05» bzw. «13:45»
export function digital(h, m) {
  return `${h}:${String(m).padStart(2, '0')}`;
}

// «41 min», «1 h», «1 h 25 min»
export function dauerText(minuten) {
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function waehle(liste, zufall) {
  return liste[Math.floor(zufall() * liste.length)];
}

function mischen(liste, zufall) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

// Uhr ablesen: vier Uhrzeiten, darunter typische Verwechslungen
function uhrAufgabe(stufe, zufall) {
  const minuten = STUFEN[stufe].minuten;
  const h = 1 + Math.floor(zufall() * 12);
  const m = waehle(minuten, zufall);
  const schluessel = (x, y) => `${x}:${y}`;
  const plus = (x, d) => ((x - 1 + d + 12) % 12) + 1;
  const kandidaten = [
    // Zeiger vertauscht: der kurze wird als Minutenzeiger gelesen
    [m === 0 ? 12 : m / 5, (h % 12) * 5],
    // «halb vier» mit «halb drei» verwechselt
    [plus(h, 1), m],
    [plus(h, -1), m],
    // anderer Minutenwert der Stufe
    ...minuten.filter((x) => x !== m).map((x) => [h, x]),
  ];
  const falsch = [];
  const gesehen = new Set([schluessel(h, m)]);
  for (const [x, y] of [...kandidaten.slice(0, 2), ...mischen(kandidaten.slice(2), zufall)]) {
    if (!minuten.includes(y) && stufe !== 'fuenf') continue;
    if (y % 5 || y > 55) continue;
    const k = schluessel(x, y);
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    falsch.push([x, y]);
    if (falsch.length === 3) break;
  }
  const antworten = mischen([[h, m], ...falsch], zufall).map(([x, y]) => ({
    h: x,
    m: y,
    richtig: x === h && y === m,
  }));
  return { art: 'uhr', h, m, antworten };
}

// Bahnstrecken mit ungefährer Fahrzeit in Minuten
export const STRECKEN = [
  ['Zürich HB', 'Bern', 56],
  ['Zürich HB', 'Basel SBB', 53],
  ['Zürich HB', 'Luzern', 41],
  ['Zürich HB', 'St. Gallen', 64],
  ['Zürich HB', 'Chur', 75],
  ['Zürich HB', 'Winterthur', 22],
  ['Zürich HB', 'Schaffhausen', 38],
  ['Zürich HB', 'Lugano', 116],
  ['Zürich HB', 'Genf', 162],
  ['Zürich HB', 'Brig', 128],
  ['Winterthur', 'Romanshorn', 33],
  ['Zürich HB', 'Zürich Flughafen', 12],
];

// Zeitspanne am Fahrplan: Abfahrt und Ankunft sind gegeben, die Fahrzeit ist gesucht
function dauerAufgabe(zufall) {
  const [von, nach, dauer] = waehle(STRECKEN, zufall);
  const start = 6 * 60 + Math.floor(zufall() * 12 * 12) * 5 + waehle([2, 4, 7, 9, 0, 3], zufall);
  const ende = start + dauer;
  const kandidaten = [dauer + 10, dauer - 10, dauer + 5, dauer - 5, dauer + 60, dauer - 60, dauer + 15, dauer - 15];
  const falsch = [];
  for (const d of [...kandidaten.slice(0, 1), ...mischen(kandidaten.slice(1), zufall)]) {
    if (d > 0 && d !== dauer && !falsch.includes(d)) falsch.push(d);
    if (falsch.length === 3) break;
  }
  return {
    art: 'dauer',
    von,
    nach,
    ab: [Math.floor(start / 60), start % 60],
    an: [Math.floor(ende / 60), ende % 60],
    dauer,
    antworten: mischen([dauer, ...falsch], zufall).map((d) => ({ dauer: d, richtig: d === dauer })),
  };
}

export function aufgabe(stufe, zufall = Math.random) {
  return STUFEN[stufe].dauer ? dauerAufgabe(zufall) : uhrAufgabe(stufe, zufall);
}

export function runde(stufe, anzahl, zufall = Math.random) {
  const liste = [];
  const gesehen = new Set();
  for (let versuch = 0; liste.length < anzahl && versuch < anzahl * 50; versuch++) {
    const x = aufgabe(stufe, zufall);
    const schluessel = x.art === 'uhr' ? `${x.h}:${x.m}` : `${x.von}-${x.nach}-${x.ab}`;
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    liste.push(x);
  }
  return liste;
}

// Zwischenschritt für die Hilfe: bis zur nächsten vollen Stunde, dann der Rest
export function bisVolleStunde([h, m]) {
  return m === 0 ? 0 : 60 - m;
}
