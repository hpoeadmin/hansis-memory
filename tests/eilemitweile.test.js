import { describe, it, expect } from 'vitest';
import {
  BAENKLI,
  FELDER,
  HAUS,
  absolut,
  neuesSpiel,
  wuerfle,
  zuege,
  fuehreAus,
  passe,
  zielVon,
  fremdeSperre,
} from '../src/spiele/eilemitweile/regeln.js';
import { waehleZug } from '../src/spiele/eilemitweile/computer.js';

// Rot = 0, Grün = 1, Blau = 2, Gelb = 3
function spiel(figuren, amZug = 0, wurf = null) {
  const z = neuesSpiel(Object.keys(figuren).map(Number), amZug);
  for (const [arm, liste] of Object.entries(figuren)) z.figuren[arm] = [...liste];
  return { ...z, wurf };
}

describe('Brett', () => {
  it('hat 76 Felder und 12 Bänkli, je 3 pro Arm', () => {
    expect(FELDER).toBe(76);
    expect(BAENKLI.size).toBe(12);
    expect(absolut(1, 0)).toBe(19);
    expect(absolut(3, 60)).toBe((57 + 60) % 76);
  });
});

describe('Herauskommen und Würfeln', () => {
  it('herauskommen nur mit einer 6', () => {
    const z = neuesSpiel([0, 2]);
    expect(zuege(wuerfle(z, 5))).toEqual([]);
    expect(zuege(wuerfle(z, 6))).toEqual([{ figur: 0, von: HAUS, nach: 0 }]);
  });

  it('nach einer 6 nochmals würfeln, sonst ist der Nächste dran', () => {
    let z = fuehreAus(wuerfle(neuesSpiel([0, 2]), 6), { figur: 0, von: HAUS, nach: 0 });
    expect(z.amZug).toBe(0);
    z = fuehreAus(wuerfle(z, 3), { figur: 0, von: 0, nach: 3 });
    expect(z.amZug).toBe(2);
  });

  it('ohne möglichen Zug geht es weiter – nach einer 6 aber nochmals', () => {
    const z = neuesSpiel([0, 1, 2]);
    expect(passe(wuerfle(z, 4)).amZug).toBe(1);
    // Rot ist eingesperrt (fremde Sperre auf dem Start-Bänkli), hat aber eine 6 gewürfelt
    const gruenPos = (0 - 19 + 76) % 76;
    const mitSechs = spiel({ 0: [HAUS, HAUS, HAUS, HAUS], 1: [gruenPos, gruenPos, HAUS, HAUS] }, 0, 6);
    expect(zuege(mitSechs)).toEqual([]);
    expect(passe(mitSechs).amZug).toBe(0);
  });
});

describe('Schlagen und Bänkli', () => {
  it('auf einem normalen Feld wird eine fremde Figur geschlagen', () => {
    // Rot steht auf 10, Grün steht auf dem gleichen Feld wie Rot 13 (absolut 13)
    const gruenPos = (13 - 19 + 76) % 76; // Grün-Position für absolutes Feld 13
    const z = spiel({ 0: [10, HAUS, HAUS, HAUS], 1: [gruenPos, HAUS, HAUS, HAUS] }, 0, 3);
    const n = fuehreAus(z, { figur: 0, von: 10, nach: 13 });
    expect(n.figuren[1][0]).toBe(HAUS);
    expect(n.letzterZug.geschlagen).toHaveLength(1);
  });

  it('auf einem Bänkli teilen sich beide das Feld', () => {
    const feld = 5; // Bänkli
    const gruenPos = (feld - 19 + 76) % 76;
    const z = spiel({ 0: [2, HAUS, HAUS, HAUS], 1: [gruenPos, HAUS, HAUS, HAUS] }, 0, 3);
    const n = fuehreAus(z, { figur: 0, von: 2, nach: 5 });
    expect(n.figuren[1][0]).toBe(gruenPos);
    expect(n.letzterZug.geschlagen).toEqual([]);
  });

  it('zwei gleiche Figuren auf einem Bänkli sperren die anderen', () => {
    const feld = 14; // Bänkli
    const gruenPos = (feld - 19 + 76) % 76;
    const z = spiel({ 0: [10, HAUS, HAUS, HAUS], 1: [gruenPos, gruenPos, HAUS, HAUS] }, 0, 6);
    expect(fremdeSperre(z, feld, 0)).toBe(true);
    expect(zielVon(z, 0, 0, 4)).toBe(null); // landen geht nicht
    expect(zielVon(z, 0, 0, 6)).toBe(null); // vorbei geht nicht
    expect(zielVon(z, 0, 0, 3)).toBe(13); // davor geht
  });

  it('die eigenen Figuren dürfen an der eigenen Sperre vorbei', () => {
    const z = spiel({ 0: [5, 5, 2, HAUS] }, 0, 6);
    expect(zielVon(z, 0, 2, 6)).toBe(8);
  });

  it('eine fremde Sperre auf dem Start-Bänkli verhindert das Herauskommen', () => {
    const gruenPos = (0 - 19 + 76) % 76;
    const z = spiel({ 0: [HAUS, HAUS, HAUS, HAUS], 1: [gruenPos, gruenPos, HAUS, HAUS] }, 0, 6);
    expect(zuege(z)).toEqual([]);
  });
});

describe('Ziel', () => {
  it('ins Ziel muss man genau würfeln', () => {
    const z = spiel({ 0: [80, HAUS, HAUS, HAUS] }, 0, 4);
    expect(zielVon(z, 0, 0, 3)).toBe(83);
    expect(zielVon(z, 0, 0, 4)).toBe(null);
  });

  it('ein besetztes Zielfeld kann man nicht nehmen', () => {
    const z = spiel({ 0: [74, 78, HAUS, HAUS] }, 0, 4);
    expect(zielVon(z, 0, 0, 4)).toBe(null);
    expect(zielVon(z, 0, 0, 5)).toBe(79);
  });

  it('wer alle 4 Figuren im Ziel hat, gewinnt', () => {
    const z = spiel({ 0: [80, 81, 82, 75], 2: [HAUS, HAUS, HAUS, HAUS] }, 0, 1);
    const n = fuehreAus(z, { figur: 3, von: 75, nach: 76 });
    expect(n.sieger).toBe(0);
  });
});

describe('Computer', () => {
  it('spielt ganze Partien mit 4 Farben nur mit erlaubten Zügen', () => {
    for (let partie = 0; partie < 5; partie++) {
      let z = neuesSpiel([0, 1, 2, 3]);
      let runden = 0;
      while (z.sieger === null && runden < 5000) {
        z = wuerfle(z, 1 + Math.floor(Math.random() * 6));
        const zug = waehleZug(z);
        if (zug) {
          expect(zuege(z)).toContainEqual(zug);
          z = fuehreAus(z, zug);
        } else {
          z = passe(z);
        }
        runden++;
      }
      expect(z.sieger).not.toBe(null);
    }
  });

  it('schlägt lieber, als einfach weiterzuziehen', () => {
    const gruenPos = (13 - 19 + 76) % 76;
    const z = spiel({ 0: [10, 40, HAUS, HAUS], 1: [gruenPos, HAUS, HAUS, HAUS] }, 0, 3);
    expect(waehleZug(z)).toEqual({ figur: 0, von: 10, nach: 13 });
  });
});
