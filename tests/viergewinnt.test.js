import { describe, it, expect } from 'vitest';
import { neuesBrett, setze, gewinnReihe, voll, moeglich, computerZug } from '../src/spiele/viergewinnt/regeln.js';

function brettAus(zuege) {
  const b = neuesBrett();
  zuege.forEach((s, i) => setze(b, s, i % 2));
  return b;
}

describe('Vier gewinnt – Regeln', () => {
  it('Steine fallen nach unten, volle Spalten sind gesperrt', () => {
    const b = neuesBrett();
    for (let i = 0; i < 6; i++) expect(setze(b, 2, 0)).toBe(i);
    expect(setze(b, 2, 0)).toBe(-1);
    expect(moeglich(b)).not.toContain(2);
  });

  it('erkennt waagrecht, senkrecht und schräg', () => {
    expect(gewinnReihe(brettAus([0, 0, 1, 1, 2, 2, 3]), 0)).toHaveLength(4);
    expect(gewinnReihe(brettAus([0, 1, 0, 1, 0, 1, 0]), 0)).toHaveLength(4);
    // schräg: Rot auf (0,0), (1,1), (2,2), (3,3)
    const b = neuesBrett();
    const legen = [[0, 0], [1, 1], [1, 0], [2, 1], [2, 1], [2, 0], [3, 1], [3, 1], [3, 1], [3, 0]];
    for (const [s, seite] of legen) setze(b, s, seite);
    expect(gewinnReihe(b, 0)).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]]);
  });
});

describe('Vier gewinnt – Computer', () => {
  it('gewinnt sofort, wenn es geht, und verhindert den Sieg des Gegners', () => {
    for (const stufe of ['gemuetlich', 'knifflig']) {
      // Gelb (1) hat drei waagrecht unten: 1,2,3 → Spalte 0 oder 4 gewinnt
      const b = brettAus([6, 1, 6, 2, 5, 3]);
      expect([0, 4]).toContain(computerZug(b, 1, stufe));
      // Rot (0) droht mit 1,2,3 unten – Gelb muss blocken
      const c = brettAus([1, 6, 2, 6, 3]);
      expect([0, 4]).toContain(computerZug(c, 1, 'knifflig'));
    }
  });

  it('knifflig schlägt gemütlich meistens', () => {
    let siegeKnifflig = 0;
    for (let spiel = 0; spiel < 10; spiel++) {
      const b = neuesBrett();
      let seite = spiel % 2;
      const stufen = ['gemuetlich', 'knifflig'];
      while (!voll(b) && !gewinnReihe(b, 0) && !gewinnReihe(b, 1)) {
        setze(b, computerZug(b, seite, stufen[seite]), seite);
        seite = 1 - seite;
      }
      if (gewinnReihe(b, 1)) siegeKnifflig++;
    }
    expect(siegeKnifflig).toBeGreaterThanOrEqual(7);
  });
});
