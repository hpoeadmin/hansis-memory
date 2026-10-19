import { describe, it, expect } from 'vitest';
import { STUFEN, aufgabe, zeitWorte, digital, dauerText } from '../src/spiele/uhr/zeit.js';

describe('Uhrzeit in Worten', () => {
  it('wie man es in der Schule lernt', () => {
    expect(zeitWorte(3, 0)).toBe('drei Uhr');
    expect(zeitWorte(1, 0)).toBe('ein Uhr');
    expect(zeitWorte(3, 30)).toBe('halb vier');
    expect(zeitWorte(12, 30)).toBe('halb eins');
    expect(zeitWorte(3, 15)).toBe('Viertel nach drei');
    expect(zeitWorte(3, 45)).toBe('Viertel vor vier');
    expect(zeitWorte(11, 45)).toBe('Viertel vor zwölf');
    expect(zeitWorte(3, 25)).toBe('fünf vor halb vier');
    expect(zeitWorte(3, 35)).toBe('fünf nach halb vier');
    expect(zeitWorte(3, 50)).toBe('zehn vor vier');
  });

  it('digital und Zeitspannen', () => {
    expect(digital(3, 5)).toBe('3:05');
    expect(dauerText(41)).toBe('41 min');
    expect(dauerText(60)).toBe('1 h');
    expect(dauerText(85)).toBe('1 h 25 min');
  });
});

describe('Aufgaben', () => {
  it('vier verschiedene Antworten, genau eine richtig, passend zur Stufe', () => {
    for (const stufe of Object.keys(STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = aufgabe(stufe);
        const schluessel = x.antworten.map((a) => (x.art === 'uhr' ? `${a.h}:${a.m}` : a.dauer));
        expect(new Set(schluessel).size).toBe(4);
        expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
        if (x.art === 'uhr') {
          for (const a of x.antworten) {
            expect(a.h).toBeGreaterThanOrEqual(1);
            expect(a.h).toBeLessThanOrEqual(12);
            if (stufe !== 'fuenf') expect(STUFEN[stufe].minuten).toContain(a.m);
          }
        } else {
          const ab = x.ab[0] * 60 + x.ab[1];
          const an = x.an[0] * 60 + x.an[1];
          expect(an - ab).toBe(x.dauer);
          for (const a of x.antworten) expect(a.dauer).toBeGreaterThan(0);
        }
      }
    }
  });
});
