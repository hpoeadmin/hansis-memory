import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import * as br from '../src/spiele/bruchrechnen/aufgaben.js';
import * as an from '../src/spiele/antike/ereignisse.js';
import * as wt from '../src/spiele/wirbeltiere/klassen.js';

describe('Bruchrechnen', () => {
  const wert = ([z, n]) => z / n;
  it('Ergebnis stimmt, ist gekürzt, und nur eine Antwort hat diesen Wert', () => {
    for (const stufe of Object.keys(br.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = br.aufgabe(stufe);
        const soll = { '+': wert(x.a) + wert(x.b), '−': wert(x.a) - wert(x.b), '·': wert(x.a) * wert(x.b), ':': wert(x.a) / wert(x.b) }[x.zeichen];
        expect(wert(x.ergebnis)).toBeCloseTo(soll, 10);
        expect(br.ggT(...x.ergebnis)).toBe(1);
        expect(x.antworten).toHaveLength(4);
        expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
        expect(x.antworten.filter((a) => Math.abs(wert(a.bruch) - soll) < 1e-9)).toHaveLength(1);
      }
    }
  });

  it('gemischte Zahlen', () => {
    expect(br.gemischt([11, 4])).toBe('2 3/4');
    expect(br.gemischt([8, 4])).toBe('2');
    expect(br.gemischt([3, 4])).toBe('3/4');
  });
});

describe('Antike', () => {
  it('Jahre richtig geschrieben', () => {
    expect(an.jahrText(-753)).toBe('753 v. Chr.');
    expect(an.jahrText(79)).toBe('79 n. Chr.');
    expect(an.jahrText(-2560, true)).toBe('um 2560 v. Chr.');
  });

  it('Aufgaben haben genau eine richtige Antwort', () => {
    for (const stufe of ['frueher', 'zahlen', 'jahr']) {
      for (let i = 0; i < 300; i++) {
        const x = an.aufgabe(stufe);
        if (x.art === 'frueher') expect(x.richtig.jahr).toBe(Math.min(...x.ereignisse.map((e) => e.jahr)));
        if (x.art === 'zahlen') {
          expect(new Set(x.jahre).size).toBe(3);
          expect(x.jahre.some((j) => j < 0)).toBe(true);
        }
        if (x.art === 'jahr') {
          expect(x.optionen).toContain(x.gesucht);
          expect(new Set(x.optionen.map((e) => e.jahr)).size).toBe(4);
        }
      }
    }
  });

  it('Römerorte liegen auf der Karte', () => {
    const orte = JSON.parse(readFileSync('src/spiele/geografie/orte.json', 'utf8'));
    expect(orte.roemer.length).toBeGreaterThanOrEqual(8);
    for (const o of orte.roemer) {
      expect(o.heute).toBeTruthy();
      expect(o.x).toBeGreaterThan(0);
      expect(o.x).toBeLessThan(1000);
    }
  });
});

describe('Wirbeltiere', () => {
  // Die Sätze direkt lesen (index.json entsteht erst beim Bauen)
  const sets = readdirSync('public/sets', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => JSON.parse(readFileSync(`public/sets/${d.name}/set.json`, 'utf8')));
  const tiere = [...sets.flatMap((s) => s.tiere), ...wt.EIGENE_TIERE];

  it('jedes Tier hat genau eine Klasse, und es gibt ein Bild', () => {
    for (const t of tiere) {
      const klassen = wt.KLASSEN.filter((k) => wt.ZUORDNUNG[k].includes(t.id));
      expect(klassen, t.id).toHaveLength(1);
    }
    for (const t of wt.EIGENE_TIERE) expect(existsSync(`public/spiele/tiere/${t.id}.svg`)).toBe(true);
  });

  it('Aufgaben passen zur Stufe', () => {
    for (const stufe of Object.keys(wt.STUFEN)) {
      for (let i = 0; i < 200; i++) {
        const x = wt.aufgabe(stufe, tiere);
        expect(x.optionen).toContain(x.richtig);
        if (stufe === 'fuenf') expect(x.richtig).not.toBe('wirbellos');
        if (stufe === 'knifflig') expect(wt.KNIFFLIG).toContain(x.tier.id);
      }
    }
  });
});
