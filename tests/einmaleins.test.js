import { describe, it, expect } from 'vitest';
import { STUFEN, aufgabe, runde } from '../src/spiele/einmaleins/rechnen.js';

describe('Einmaleins-Aufgaben', () => {
  it('haben vier verschiedene Antworten und genau eine richtige', () => {
    for (const stufe of Object.keys(STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = aufgabe(stufe);
        const texte = x.antworten.map((a) => a.text);
        expect(new Set(texte).size).toBe(4);
        expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
      }
    }
  });

  it('die richtige Antwort stimmt', () => {
    for (const stufe of Object.keys(STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = aufgabe(stufe);
        const richtig = x.antworten.find((a) => a.richtig).text;
        if (x.op === '×') expect(Number(richtig)).toBe(x.a * x.b);
        else if (x.rest) {
          expect(richtig).toBe(`${x.ergebnis} Rest ${x.rest}`);
          expect(x.ergebnis * x.b + x.rest).toBe(x.a);
          expect(x.rest).toBeLessThan(x.b);
        } else expect(Number(richtig) * x.b).toBe(x.a);
      }
    }
  });

  it('leichte Reihen bleiben bei 2, 5 und 10', () => {
    for (let i = 0; i < 200; i++) {
      const { kern } = aufgabe('reihen');
      expect([2, 5, 10]).toContain(kern.a);
    }
  });

  it('eine Runde hat keine doppelten Aufgaben', () => {
    const r = runde('alle', 10);
    expect(r).toHaveLength(10);
    expect(new Set(r.map((x) => `${x.a}${x.op}${x.b}`)).size).toBe(10);
  });
});
