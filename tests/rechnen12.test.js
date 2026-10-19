import { describe, it, expect } from 'vitest';
import * as rechnen from '../src/spiele/rechnen/aufgaben.js';
import * as haus from '../src/spiele/zahlenhaus/aufgaben.js';
import * as doppel from '../src/spiele/verdoppeln/aufgaben.js';
import * as strahl from '../src/spiele/zahlenstrahl/aufgaben.js';

function pruefeAntworten(x, richtig) {
  expect(new Set(x.antworten.map((a) => a.text)).size).toBe(4);
  const r = x.antworten.filter((a) => a.richtig);
  expect(r).toHaveLength(1);
  expect(r[0].wert).toBe(richtig);
  for (const a of x.antworten) expect(a.wert).toBeGreaterThanOrEqual(0);
}

describe('Rechnen bis 20 / bis 100', () => {
  it('Ergebnisse stimmen und bleiben im Zahlenraum', () => {
    for (const stufe of Object.keys(rechnen.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = rechnen.aufgabe(stufe);
        expect(x.ergebnis).toBe(x.op === '+' ? x.a + x.b : x.a - x.b);
        expect(x.ergebnis).toBeGreaterThanOrEqual(0);
        expect(Math.max(x.a, x.ergebnis)).toBeLessThanOrEqual(rechnen.STUFEN[stufe].max);
        pruefeAntworten(x, x.ergebnis);
      }
    }
  });

  it('bis 20 ohne Übergang bleibt im Zehner, «Über den Zehner» überschreitet ihn', () => {
    for (let i = 0; i < 300; i++) {
      const x = rechnen.aufgabe('bis20');
      const [gross, klein] = x.op === '+' ? [x.ergebnis, x.a] : [x.a, x.ergebnis];
      expect(Math.floor(gross / 10)).toBe(Math.floor(klein / 10));
      const u = rechnen.aufgabe('uebergang');
      const [g2, k2] = u.op === '+' ? [u.ergebnis, u.a] : [u.a, u.ergebnis];
      expect(g2).toBeGreaterThan(10);
      expect(k2).toBeLessThan(10);
    }
  });
});

describe('Zahlenhaus', () => {
  it('die Zimmer ergeben zusammen das Dach', () => {
    for (const stufe of Object.keys(haus.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = haus.aufgabe(stufe);
        expect(x.links + x.rechts).toBe(x.dach);
        expect(x.links).toBeGreaterThan(0);
        expect(x.rechts).toBeGreaterThan(0);
        expect(x.ergebnis).toBe(x[x.frei]);
        pruefeAntworten(x, x.ergebnis);
      }
    }
    for (let i = 0; i < 100; i++) expect(haus.aufgabe('zehner').dach).toBe(10);
  });
});

describe('Verdoppeln und Halbieren', () => {
  it('Doppelte und Hälften stimmen', () => {
    for (const stufe of Object.keys(doppel.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = doppel.aufgabe(stufe);
        expect(x.ergebnis).toBe(x.art === 'doppel' ? x.zahl * 2 : x.zahl / 2);
        expect(Number.isInteger(x.ergebnis)).toBe(true);
        pruefeAntworten(x, x.ergebnis);
      }
    }
  });
});

describe('Zahlenstrahl', () => {
  it('Zielzahlen liegen auf dem Strahl', () => {
    for (let i = 0; i < 300; i++) {
      const x = strahl.aufgabe('bis20');
      expect(x.ziel).toBeGreaterThan(0);
      expect(x.ziel).toBeLessThan(20);
    }
  });

  it('Nachbarzahlen und Nachbarzehner', () => {
    for (let i = 0; i < 500; i++) {
      const x = strahl.aufgabe('nachbarn');
      const soll = { nach: x.zahl + 1, vor: x.zahl - 1, zehnerVor: Math.floor(x.zahl / 10) * 10, zehnerNach: Math.ceil(x.zahl / 10) * 10 }[x.frage];
      expect(x.ergebnis).toBe(soll);
      if (x.frage.startsWith('zehner')) expect(x.zahl % 10).not.toBe(0);
      pruefeAntworten(x, x.ergebnis);
    }
  });

  it('getippte Stelle wird zur nächsten Zahl', () => {
    expect(strahl.zahlAnStelle(0.5, 20)).toBe(10);
    expect(strahl.zahlAnStelle(0.371, 100)).toBe(37);
    expect(strahl.zahlAnStelle(-0.1, 100)).toBe(0);
    expect(strahl.zahlAnStelle(1.2, 20)).toBe(20);
  });
});
