// Vier gewinnt: 7 Spalten, 6 Reihen. Feld: brett[spalte][reihe], Reihe 0 = unten.
// Steine: 0 (Seite 1, rot), 1 (Seite 2, gelb), null = leer.

export const SPALTEN = 7;
export const REIHEN = 6;

export function neuesBrett() {
  return Array.from({ length: SPALTEN }, () => Array(REIHEN).fill(null));
}

export const kopie = (brett) => brett.map((s) => [...s]);
export const frei = (brett, spalte) => brett[spalte].indexOf(null);
export const moeglich = (brett) => [...Array(SPALTEN).keys()].filter((s) => frei(brett, s) >= 0);
export const voll = (brett) => moeglich(brett).length === 0;

// Stein in eine Spalte fallen lassen; gibt die Reihe zurück (oder -1, wenn die Spalte voll ist)
export function setze(brett, spalte, seite) {
  const reihe = frei(brett, spalte);
  if (reihe >= 0) brett[spalte][reihe] = seite;
  return reihe;
}

const RICHTUNGEN = [[1, 0], [0, 1], [1, 1], [1, -1]];

// Vier in einer Reihe? Gibt die vier Felder zurück oder null
export function gewinnReihe(brett, seite) {
  for (let s = 0; s < SPALTEN; s++) {
    for (let r = 0; r < REIHEN; r++) {
      for (const [ds, dr] of RICHTUNGEN) {
        const felder = [0, 1, 2, 3].map((i) => [s + i * ds, r + i * dr]);
        if (felder.every(([x, y]) => x >= 0 && x < SPALTEN && y >= 0 && y < REIHEN && brett[x][y] === seite)) return felder;
      }
    }
  }
  return null;
}

// Schneller Test nur um den zuletzt gesetzten Stein (für das Vorausdenken des Computers)
export function gewinntMit(brett, spalte, reihe) {
  const seite = brett[spalte][reihe];
  for (const [ds, dr] of RICHTUNGEN) {
    let n = 1;
    for (const v of [1, -1]) {
      let x = spalte + v * ds;
      let y = reihe + v * dr;
      while (x >= 0 && x < SPALTEN && y >= 0 && y < REIHEN && brett[x][y] === seite) {
        n++;
        x += v * ds;
        y += v * dr;
      }
    }
    if (n >= 4) return true;
  }
  return false;
}

// ---------- Computergegner ----------

// Bewertung aller Vierer-Fenster: viele eigene, keine fremden Steine = gut
function bewerte(brett, seite) {
  const andere = 1 - seite;
  let punkte = 0;
  // Die Mitte ist wertvoll
  for (let r = 0; r < REIHEN; r++) if (brett[3][r] === seite) punkte += 3;
  for (let s = 0; s < SPALTEN; s++) {
    for (let r = 0; r < REIHEN; r++) {
      for (const [ds, dr] of RICHTUNGEN) {
        const ende = [s + 3 * ds, r + 3 * dr];
        if (ende[0] < 0 || ende[0] >= SPALTEN || ende[1] < 0 || ende[1] >= REIHEN) continue;
        let eigene = 0;
        let fremde = 0;
        for (let i = 0; i < 4; i++) {
          const f = brett[s + i * ds][r + i * dr];
          if (f === seite) eigene++;
          else if (f === andere) fremde++;
        }
        if (eigene && fremde) continue;
        if (eigene === 3) punkte += 6;
        else if (eigene === 2) punkte += 2;
        if (fremde === 3) punkte -= 8;
        else if (fremde === 2) punkte -= 2;
      }
    }
  }
  return punkte;
}

// Mitte zuerst prüfen: so findet Alpha-Beta schneller gute Züge
const REIHENFOLGE = [3, 2, 4, 1, 5, 0, 6];

// Wert der Stellung aus Sicht von «seite»; amZug ist dran (der Gegner hat zuletzt gesetzt)
function minimax(brett, tiefe, alpha, beta, amZug, seite) {
  if (tiefe === 0) return bewerte(brett, seite);
  const spalten = REIHENFOLGE.filter((s) => frei(brett, s) >= 0);
  if (!spalten.length) return 0;
  const maximieren = amZug === seite;
  let best = maximieren ? -Infinity : Infinity;
  for (const s of spalten) {
    const r = setze(brett, s, amZug);
    // Sieg mit diesem Zug: je früher, desto besser
    const wert = gewinntMit(brett, s, r)
      ? (maximieren ? 100000 + tiefe : -100000 - tiefe)
      : minimax(brett, tiefe - 1, alpha, beta, 1 - amZug, seite);
    brett[s][r] = null;
    if (maximieren) {
      best = Math.max(best, wert);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, wert);
      beta = Math.min(beta, best);
    }
    if (alpha >= beta) break;
  }
  return best;
}

// stufe: 'gemuetlich' (schaut 2 Züge voraus, macht manchmal einen Zufallszug) oder 'knifflig' (7 Züge)
export function computerZug(brett, seite, stufe, zufall = Math.random) {
  const spalten = REIHENFOLGE.filter((s) => frei(brett, s) >= 0);
  const b = kopie(brett);
  // Gewinnen geht immer vor; einen sofortigen Sieg des Gegners verhindern auch die gemütliche Stufe
  for (const s of spalten) {
    const r = setze(b, s, seite);
    const sieg = gewinntMit(b, s, r);
    b[s][r] = null;
    if (sieg) return s;
  }
  if (stufe === 'gemuetlich' && zufall() < 0.3) return spalten[Math.floor(zufall() * spalten.length)];
  for (const s of spalten) {
    const r = setze(b, s, 1 - seite);
    const gefahr = gewinntMit(b, s, r);
    b[s][r] = null;
    if (gefahr) return s;
  }
  // 7 Züge voraus: auf dem Mac unter 50 ms, auf einem Tablet gut unter einer Sekunde
  const tiefe = stufe === 'knifflig' ? 7 : 2;
  let besterWert = -Infinity;
  let beste = [];
  for (const s of spalten) {
    const r = setze(b, s, seite);
    const wert = minimax(b, tiefe - 1, -Infinity, Infinity, 1 - seite, seite);
    b[s][r] = null;
    if (wert > besterWert) {
      besterWert = wert;
      beste = [s];
    } else if (wert === besterWert) beste.push(s);
  }
  return beste[Math.floor(zufall() * beste.length)];
}
