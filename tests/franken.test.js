import { describe, it, expect } from 'vitest';
import { STUFEN, betrag, geldName, preis, aufgabe, bezahltMit, zerlegung, summe } from '../src/spiele/franken/geld.js';

describe('Schreibweise', () => {
  it('Beträge wie auf dem Preisschild', () => {
    expect(betrag(750)).toBe('Fr. 7.50');
    expect(betrag(5)).toBe('Fr. 0.05');
    expect(betrag(2000)).toBe('Fr. 20.00');
    expect(betrag(465, false)).toBe('4.65');
  });

  it('Münzen und Noten', () => {
    expect(geldName(5)).toBe('5 Rp.');
    expect(geldName(50)).toBe('50 Rp.');
    expect(geldName(200)).toBe('2 Fr.');
    expect(geldName(2000)).toBe('20 Fr.');
  });
});

describe('Preise', () => {
  it('liegen im Raster und Bereich der Stufe', () => {
    for (const [name, s] of Object.entries(STUFEN)) {
      for (let i = 0; i < 300; i++) {
        const p = preis(name);
        expect(p % s.schritt).toBe(0);
        expect(p).toBeGreaterThanOrEqual(s.min);
        expect(p).toBeLessThanOrEqual(s.max);
      }
    }
  });

  it('ganze Franken haben keine Rappen', () => {
    for (let i = 0; i < 100; i++) expect(preis('franken') % 100).toBe(0);
  });
});

describe('Rückgeld', () => {
  it('bezahlt mit der kleinsten passenden Note', () => {
    expect(bezahltMit(750)).toBe(1000);
    expect(bezahltMit(1000)).toBe(2000);
    expect(bezahltMit(4500)).toBe(5000);
  });

  it('das Rückgeld ist Note minus Preis', () => {
    for (let i = 0; i < 200; i++) {
      const a = aufgabe('rueckgeld');
      expect(a.ziel).toBe(a.note - a.preis);
      expect(a.ziel).toBeGreaterThan(0);
    }
  });
});

describe('Zerlegung', () => {
  it('jeder Betrag jeder Stufe lässt sich mit dem Geld der Stufe legen', () => {
    for (const [name, s] of Object.entries(STUFEN)) {
      for (let i = 0; i < 300; i++) {
        const { ziel } = aufgabe(name);
        const z = zerlegung(ziel, s.geld);
        expect(z).not.toBe(null);
        expect(summe(z)).toBe(ziel);
      }
    }
  });

  it('nimmt möglichst grosse Münzen', () => {
    expect(zerlegung(750, STUFEN.rappen.geld)).toEqual([500, 200, 50]);
    expect(zerlegung(465, STUFEN.kopf.geld)).toEqual([200, 200, 50, 10, 5]);
  });
});
