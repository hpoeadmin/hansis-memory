import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as br from '../src/spiele/brueche/aufgaben.js';
import * as zf from '../src/spiele/zeitformen/saetze.js';

describe('Brüche', () => {
  it('genau eine richtige Antwort, keine doppelten', () => {
    for (const stufe of Object.keys(br.STUFEN)) {
      for (let i = 0; i < 500; i++) {
        const x = br.aufgabe(stufe);
        expect(new Set(x.antworten.map((a) => a.text)).size).toBe(x.antworten.length);
        expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
        expect(x.antworten.length).toBe(stufe === 'vergleichen' ? 2 : 4);
      }
    }
  });

  it('die richtige Antwort stimmt', () => {
    for (let i = 0; i < 300; i++) {
      const e = br.aufgabe('erkennen');
      expect(e.antworten.find((a) => a.richtig).text).toBe(br.text(e.bruch));
      const g = br.aufgabe('gleich');
      expect(br.gleichViel(g.antworten.find((a) => a.richtig).bruch, g.gegeben)).toBe(true);
      // Keine zweite Antwort, die auch gleich viel wäre
      expect(g.antworten.filter((a) => br.gleichViel(a.bruch, g.gegeben))).toHaveLength(1);
      const v = br.aufgabe('vergleichen');
      const [a, b] = v.antworten.map((x) => x.bruch);
      const groesser = a[0] * b[1] > b[0] * a[1] ? a : b;
      expect(v.antworten.find((x) => x.richtig).bruch).toBe(groesser);
      const n = br.aufgabe('von');
      expect(n.ergebnis).toBe((n.menge / n.bruch[1]) * n.bruch[0]);
      expect(Number.isInteger(n.menge / n.bruch[1])).toBe(true);
    }
  });
});

describe('Zeitformen', () => {
  const s = { subjekt: 'Lena', infinitiv: 'gehen', praesens: 'geht', praeteritum: 'ging', partizip: 'gegangen', hilfsverb: 'sein', rest: 'ins Schwimmbad' };

  it('bildet alle fünf Zeitformen richtig', () => {
    expect(zf.satz(s, 'praesens')).toBe('Lena geht ins Schwimmbad.');
    expect(zf.satz(s, 'praeteritum')).toBe('Lena ging ins Schwimmbad.');
    expect(zf.satz(s, 'perfekt')).toBe('Lena ist ins Schwimmbad gegangen.');
    expect(zf.satz(s, 'plusquamperfekt')).toBe('Lena war ins Schwimmbad gegangen.');
    expect(zf.satz(s, 'futur')).toBe('Lena wird ins Schwimmbad gehen.');
    expect(zf.satz(s, 'perfekt', 'haben')).toBe('Lena hat ins Schwimmbad gegangen.');
  });

  it('Aufgaben: genau eine richtige Antwort', () => {
    for (const stufe of Object.keys(zf.STUFEN)) {
      for (let i = 0; i < 300; i++) {
        const x = zf.aufgabe(stufe);
        if (x.art === 'bilden') {
          expect(new Set(x.antworten.map((a) => a.text)).size).toBe(x.antworten.length);
          expect(x.antworten.length).toBeGreaterThanOrEqual(3);
          expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
        } else expect(x.formen).toContain(x.zeitform);
      }
    }
  });

  it('Schweizer Schreibweise: kein ß', () => {
    for (let i = 0; i < 200; i++) expect(zf.aufgabe('alle').text).not.toContain('ß');
  });
});

describe('Schweizer Geografie', () => {
  it('Städte und Berge liegen auf der Karte, die grossen Seen haben Namen', () => {
    const orte = JSON.parse(readFileSync('src/spiele/geografie/orte.json', 'utf8'));
    for (const o of [...orte.staedte, ...orte.berge]) {
      expect(o.x).toBeGreaterThan(0);
      expect(o.x).toBeLessThan(1000);
      expect(o.y).toBeGreaterThan(0);
      expect(o.y).toBeLessThan(680);
    }
    const karte = readFileSync('public/spiele/kantone-karte.svg', 'utf8');
    for (const see of ['Genfersee', 'Bodensee', 'Neuenburgersee', 'Lago Maggiore', 'Vierwaldstättersee', 'Zürichsee', 'Luganersee', 'Thunersee', 'Bielersee', 'Zugersee', 'Brienzersee', 'Walensee']) {
      expect(karte).toContain(`data-name="${see}"`);
    }
  });

  it('Städte und Berge liegen weit genug auseinander zum Antippen', () => {
    const orte = JSON.parse(readFileSync('src/spiele/geografie/orte.json', 'utf8'));
    for (const liste of [orte.staedte, orte.berge]) {
      for (const a of liste) for (const b of liste) {
        if (a === b) continue;
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(30);
      }
    }
  });
});
