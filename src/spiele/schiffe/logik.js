// Schiffe versenken: Regeln und Computergegner (ohne Bildschirm, damit testbar).
// Feld: x = Spalte (0 = A), y = Zeile (0 = 1). Schiff: { id, laenge, x, y, quer }
// quer = waagrecht. Schiffe dürfen sich nicht berühren, auch nicht über Eck.
// Nach einem Treffer darf man nochmals schiessen.

export const GROESSEN = {
  klein: { n: 8, schiffe: [4, 3, 3, 2] },
  gross: { n: 10, schiffe: [5, 4, 3, 3, 2] },
};

export const BUCHSTABEN = 'ABCDEFGHIJ';
export const feldName = (x, y) => `${BUCHSTABEN[x]}${y + 1}`;

export function zellen(schiff) {
  return Array.from({ length: schiff.laenge }, (_, i) => (schiff.quer ? [schiff.x + i, schiff.y] : [schiff.x, schiff.y + i]));
}

const schluessel = (x, y) => `${x},${y}`;

// Passt das Schiff aufs Feld, ohne ein anderes zu berühren?
export function passt(schiffe, schiff, n) {
  const eigene = zellen(schiff);
  if (eigene.some(([x, y]) => x < 0 || y < 0 || x >= n || y >= n)) return false;
  const belegt = new Set();
  for (const s of schiffe) {
    if (s.id === schiff.id) continue;
    for (const [x, y] of zellen(s)) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) belegt.add(schluessel(x + dx, y + dy));
    }
  }
  return eigene.every(([x, y]) => !belegt.has(schluessel(x, y)));
}

// Flotte zufällig verteilen (grosse Schiffe zuerst)
export function zufallsFlotte(groesse, zufall = Math.random) {
  const { n, schiffe: laengen } = GROESSEN[groesse];
  for (let neuversuch = 0; neuversuch < 100; neuversuch++) {
    const schiffe = [];
    let ok = true;
    laengen.forEach((laenge, id) => {
      if (!ok) return;
      for (let versuch = 0; versuch < 300; versuch++) {
        const quer = zufall() < 0.5;
        const schiff = {
          id,
          laenge,
          quer,
          x: Math.floor(zufall() * (quer ? n - laenge + 1 : n)),
          y: Math.floor(zufall() * (quer ? n : n - laenge + 1)),
        };
        if (passt(schiffe, schiff, n)) {
          schiffe.push(schiff);
          return;
        }
      }
      ok = false;
    });
    if (ok) return schiffe;
  }
  throw new Error('Keine Flotte gefunden');
}

export function neuesBrett(groesse, schiffe) {
  return { n: GROESSEN[groesse].n, schiffe, schuesse: [] };
}

export function schiffAuf(brett, x, y) {
  return brett.schiffe.find((s) => zellen(s).some(([a, b]) => a === x && b === y)) ?? null;
}

export const beschossen = (brett, x, y) => brett.schuesse.some((s) => s.x === x && s.y === y);

export function istVersenkt(brett, schiff) {
  return zellen(schiff).every(([x, y]) => beschossen(brett, x, y));
}

export const alleVersenkt = (brett) => brett.schiffe.every((s) => istVersenkt(brett, s));

// Ein Schuss: 'wasser', 'treffer' oder 'versenkt' (null, wenn das Feld schon beschossen war)
export function schiesse(brett, x, y) {
  if (beschossen(brett, x, y)) return null;
  const schiff = schiffAuf(brett, x, y);
  brett.schuesse.push({ x, y, treffer: Boolean(schiff) });
  if (!schiff) return { ergebnis: 'wasser' };
  return { ergebnis: istVersenkt(brett, schiff) ? 'versenkt' : 'treffer', schiff };
}

// ---------- Computergegner ----------
// Er sieht nur, was auch ein Mensch sähe: seine Schüsse, Treffer und versenkte Schiffe.

function freieFelder(brett) {
  const frei = [];
  for (let y = 0; y < brett.n; y++) for (let x = 0; x < brett.n; x++) if (!beschossen(brett, x, y)) frei.push([x, y]);
  return frei;
}

function waehle(liste, zufall) {
  return liste[Math.floor(zufall() * liste.length)];
}

export function computerSchuss(brett, stufe, zufall = Math.random) {
  const n = brett.n;
  const knifflig = stufe === 'knifflig';
  // Felder neben versenkten Schiffen können (wegen der Abstandsregel) kein Schiff sein
  const tabu = new Set();
  if (knifflig) {
    for (const s of brett.schiffe) {
      if (!istVersenkt(brett, s)) continue;
      for (const [x, y] of zellen(s)) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) tabu.add(schluessel(x + dx, y + dy));
    }
  }
  const offen = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !beschossen(brett, x, y) && !tabu.has(schluessel(x, y));

  // Treffer an Schiffen, die noch nicht versenkt sind
  const treffer = brett.schuesse.filter((s) => s.treffer && !istVersenkt(brett, schiffAuf(brett, s.x, s.y)));
  // Gemütlich: verfolgt einen Treffer nur manchmal weiter
  if (treffer.length && (knifflig || zufall() < 0.55)) {
    let ziele = [];
    if (treffer.length >= 2) {
      // In einer Linie weiterschiessen
      const quer = treffer.every((t) => t.y === treffer[0].y);
      const laengs = treffer.every((t) => t.x === treffer[0].x);
      if (quer || laengs) {
        const werte = treffer.map((t) => (quer ? t.x : t.y));
        const min = Math.min(...werte);
        const max = Math.max(...werte);
        ziele = quer
          ? [[min - 1, treffer[0].y], [max + 1, treffer[0].y]]
          : [[treffer[0].x, min - 1], [treffer[0].x, max + 1]];
      }
    }
    if (!ziele.some(([x, y]) => offen(x, y))) {
      ziele = treffer.flatMap((t) => [[t.x + 1, t.y], [t.x - 1, t.y], [t.x, t.y + 1], [t.x, t.y - 1]]);
    }
    const moeglich = ziele.filter(([x, y]) => offen(x, y));
    if (moeglich.length) return waehle(moeglich, zufall);
  }

  let frei = freieFelder(brett).filter(([x, y]) => !tabu.has(schluessel(x, y)));
  if (knifflig) {
    // Schachbrettmuster: jedes Schiff (mind. 2 Felder) wird so gefunden
    const muster = frei.filter(([x, y]) => (x + y) % 2 === 0);
    if (muster.length) frei = muster;
  }
  if (!frei.length) frei = freieFelder(brett);
  return waehle(frei, zufall);
}
