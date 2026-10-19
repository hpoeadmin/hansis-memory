// Computerspieler für Eile mit Weile: bewertet jeden möglichen Zug mit einfachen Faustregeln.
import { BAENKLI, ERSTES_ZIEL, FELDER, HAUS, absolut, aufFeld, zuege } from './regeln.js';

// Wie gefährlich ist ein Feld? Zählt fremde Figuren, die es mit einem Wurf von 1–6 erreichen.
function gefahr(zustand, arm, feld) {
  if (BAENKLI.has(feld)) return 0;
  let n = 0;
  for (const anderer of zustand.arme) {
    if (anderer === arm) continue;
    zustand.figuren[anderer].forEach((pos) => {
      if (pos < 0 || pos >= FELDER) return;
      const abstand = (feld - absolut(anderer, pos) + FELDER) % FELDER;
      if (abstand >= 1 && abstand <= 6 && pos + abstand < FELDER) n++;
    });
  }
  return n;
}

function bewerte(zustand, zug) {
  const arm = zustand.amZug;
  let wert = 0;
  if (zug.von === HAUS) wert += 45;
  if (zug.nach >= ERSTES_ZIEL) wert += zug.von < ERSTES_ZIEL ? 70 : 10;
  else {
    const feld = absolut(arm, zug.nach);
    const fremde = aufFeld(zustand, feld).filter((f) => f.arm !== arm);
    if (!BAENKLI.has(feld) && fremde.length) {
      // Schlagen lohnt sich besonders, wenn die fremde Figur schon weit ist
      for (const f of fremde) wert += 50 + zustand.figuren[f.arm][f.figur] / 2;
    }
    if (BAENKLI.has(feld)) {
      wert += 20;
      const eigene = aufFeld(zustand, feld).filter((f) => f.arm === arm).length;
      if (eigene === 1) wert += 15; // Sperre bauen
    }
    wert -= 18 * gefahr(zustand, arm, feld);
    if (zug.von >= 0 && zug.von < FELDER) {
      wert += 12 * gefahr(zustand, arm, absolut(arm, zug.von)); // aus der Gefahr ziehen
    }
  }
  wert += (zug.nach - Math.max(zug.von, 0)) * 0.5; // vorwärts kommen
  return wert + Math.random() * 6; // etwas Abwechslung
}

export function waehleZug(zustand) {
  const liste = zuege(zustand);
  let bester = null;
  let bestWert = -Infinity;
  for (const zug of liste) {
    const wert = bewerte(zustand, zug);
    if (wert > bestWert) {
      bestWert = wert;
      bester = zug;
    }
  }
  return bester;
}
