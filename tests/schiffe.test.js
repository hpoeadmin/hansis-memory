import { describe, it, expect } from 'vitest';
import { GROESSEN, zufallsFlotte, passt, neuesBrett, schiesse, alleVersenkt, computerSchuss, zellen, feldName } from '../src/spiele/schiffe/logik.js';

describe('Flotte', () => {
  it('zufällig verteilt, alle Schiffe im Feld und ohne Berührung', () => {
    for (const groesse of Object.keys(GROESSEN)) {
      for (let i = 0; i < 200; i++) {
        const flotte = zufallsFlotte(groesse);
        const { n, schiffe } = GROESSEN[groesse];
        expect(flotte.map((s) => s.laenge)).toEqual(schiffe);
        for (const s of flotte) expect(passt(flotte, s, n)).toBe(true);
      }
    }
  });

  it('Schiffe dürfen sich nicht berühren, auch nicht über Eck', () => {
    const a = { id: 0, laenge: 3, x: 0, y: 0, quer: true };
    expect(passt([a], { id: 1, laenge: 2, x: 3, y: 1, quer: true }, 8)).toBe(false);
    expect(passt([a], { id: 1, laenge: 2, x: 4, y: 1, quer: true }, 8)).toBe(true);
    expect(passt([a], { id: 1, laenge: 2, x: 7, y: 0, quer: true }, 8)).toBe(false);
  });

  it('Feldnamen wie auf dem Plan', () => {
    expect(feldName(0, 0)).toBe('A1');
    expect(feldName(2, 4)).toBe('C5');
    expect(feldName(9, 9)).toBe('J10');
  });
});

describe('Schiessen', () => {
  it('Wasser, Treffer, versenkt', () => {
    const brett = neuesBrett('klein', [{ id: 0, laenge: 2, x: 1, y: 1, quer: true }]);
    expect(schiesse(brett, 0, 0).ergebnis).toBe('wasser');
    expect(schiesse(brett, 0, 0)).toBe(null);
    expect(schiesse(brett, 1, 1).ergebnis).toBe('treffer');
    expect(schiesse(brett, 2, 1).ergebnis).toBe('versenkt');
    expect(alleVersenkt(brett)).toBe(true);
  });
});

describe('Computergegner', () => {
  function spieleBisEnde(stufe) {
    const brett = neuesBrett('gross', zufallsFlotte('gross'));
    let schuesse = 0;
    while (!alleVersenkt(brett)) {
      const [x, y] = computerSchuss(brett, stufe);
      expect(schiesse(brett, x, y)).not.toBe(null);
      schuesse++;
    }
    return schuesse;
  }

  it('schiesst nie zweimal aufs gleiche Feld und wird fertig', () => {
    for (let i = 0; i < 30; i++) {
      expect(spieleBisEnde('gemuetlich')).toBeLessThanOrEqual(100);
      expect(spieleBisEnde('knifflig')).toBeLessThanOrEqual(100);
    }
  });

  it('knifflig braucht im Schnitt deutlich weniger Schüsse als gemütlich', () => {
    let g = 0;
    let k = 0;
    for (let i = 0; i < 60; i++) {
      g += spieleBisEnde('gemuetlich');
      k += spieleBisEnde('knifflig');
    }
    expect(k).toBeLessThan(g * 0.85);
  });

  it('versenkt ein angeschossenes Schiff gezielt', () => {
    const brett = neuesBrett('gross', [{ id: 0, laenge: 4, x: 3, y: 5, quer: true }, { id: 1, laenge: 2, x: 0, y: 0, quer: false }]);
    schiesse(brett, 4, 5);
    let n = 0;
    while (!zellen(brett.schiffe[0]).every(([x, y]) => brett.schuesse.some((s) => s.x === x && s.y === y))) {
      const [x, y] = computerSchuss(brett, 'knifflig');
      schiesse(brett, x, y);
      n++;
    }
    expect(n).toBeLessThanOrEqual(6);
  });
});
