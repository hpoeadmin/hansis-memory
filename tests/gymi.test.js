import { describe, it, expect } from 'vitest';
import * as ng from '../src/spiele/negativ/aufgaben.js';
import * as gl from '../src/spiele/gleichungen/aufgaben.js';
import * as fa from '../src/spiele/faelle/saetze.js';
import { spieleFuer } from '../src/spiele.js';

function eineRichtige(x, wert) {
  expect(new Set(x.antworten.map((a) => a.text)).size).toBe(4);
  const r = x.antworten.filter((a) => a.richtig);
  expect(r).toHaveLength(1);
  expect(r[0].wert).toBe(wert);
}

describe('Negative Zahlen', () => {
  it('Ergebnisse stimmen', () => {
    for (const stufe of Object.keys(ng.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = ng.aufgabe(stufe);
        if (x.art === 'thermometer') {
          expect(x.ergebnis).toBe(x.start + x.aenderung);
          expect(Math.abs(x.ergebnis)).toBeLessThanOrEqual(15);
        } else {
          const soll = { '+': x.a + x.b, '−': x.a - x.b, '·': x.a * x.b, ':': x.a / x.b }[x.op];
          expect(x.ergebnis).toBe(soll);
          expect(Number.isInteger(x.ergebnis)).toBe(true);
        }
        eineRichtige(x, x.ergebnis);
      }
    }
  });

  it('schreibt Minuszeichen und Klammern richtig', () => {
    expect(ng.zeige(-3)).toBe('−3');
    for (let i = 0; i < 200; i++) {
      const x = ng.aufgabe('gemischt');
      if (x.b < 0) expect(x.text).toMatch(/\(−\d+\)$/);
    }
  });
});

describe('Gleichungen', () => {
  it('die Lösung erfüllt die Gleichung', () => {
    for (const stufe of Object.keys(gl.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = gl.aufgabe(stufe);
        const wert = (s) => (s.durch ? x.loesung / s.durch : s.x * x.loesung + s.zahl);
        expect(wert(x.links)).toBe(wert(x.rechts));
        expect(Number.isInteger(x.loesung)).toBe(true);
        eineRichtige(x, x.loesung);
        const weg = gl.loesungsweg(x);
        expect(weg.at(-1).ergebnis).toBe(`x = ${x.loesung}`);
      }
    }
  });

  it('schreibt Gleichungen wie im Heft', () => {
    expect(gl.seite({ x: 3, zahl: 4 })).toBe('3x + 4');
    expect(gl.seite({ x: 1, zahl: -7 })).toBe('x − 7');
    expect(gl.seite({ x: 2, zahl: 0 })).toBe('2x');
    expect(gl.seite({ x: 0, zahl: 19 })).toBe('19');
  });
});

describe('Fälle und Satzglieder', () => {
  it('jede Aufgabe hat einen markierten Teil mit Antwort', () => {
    for (const stufe of Object.keys(fa.STUFEN)) {
      for (let i = 0; i < 300; i++) {
        const x = fa.aufgabe(stufe);
        expect(x.optionen).toContain(x.richtig);
        const teil = x.satz[x.index];
        if (x.art === 'fall') expect(teil.fall).toBe(x.richtig);
        else expect(teil.rolle).toBe(x.richtig);
      }
    }
  });

  it('das Subjekt steht immer im Nominativ, Objekte im passenden Fall', () => {
    for (let i = 0; i < 300; i++) {
      const { satz } = fa.aufgabe('gemischt');
      for (const t of satz) {
        if (t.rolle === 'S') expect(t.fall).toBe('nom');
        if (t.rolle === 'AO') expect(t.fall).toBe('akk');
        if (t.rolle === 'DO') expect(t.fall).toBe('dat');
        if (t.rolle === 'GO') expect(t.fall).toBe('gen');
      }
    }
  });
});

describe('Kachel Gymi', () => {
  it('zeigt nur die Gymi-Spiele, und diese fehlen bei den Klassen', () => {
    expect(spieleFuer('gymi').map((s) => s.id).sort()).toEqual(['antike', 'bruchrechnen', 'faelle', 'gleichungen', 'negativ', 'wirbeltiere']);
    expect(spieleFuer('kl56').map((s) => s.id)).not.toContain('gleichungen');
  });
});
