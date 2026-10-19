import { describe, it, expect } from 'vitest';
import { WOERTER, STUFEN, runde } from '../src/spiele/wortarten/woerter.js';

const mischen = (liste) => [...liste].sort(() => Math.random() - 0.5);
const alle = [...WOERTER.nomen, ...WOERTER.verb, ...WOERTER.adjektiv];

describe('Wortliste', () => {
  it('hat je 40 Wörter pro Wortart und kein Wort doppelt', () => {
    expect(WOERTER.nomen).toHaveLength(40);
    expect(WOERTER.verb).toHaveLength(40);
    expect(WOERTER.adjektiv).toHaveLength(40);
    const klein = alle.map((w) => w.wort.toLowerCase());
    expect(new Set(klein).size).toBe(klein.length);
  });

  it('Nomen sind gross, Verben und Adjektive klein geschrieben', () => {
    for (const w of WOERTER.nomen) expect(w.wort[0]).toBe(w.wort[0].toUpperCase());
    for (const w of [...WOERTER.verb, ...WOERTER.adjektiv]) expect(w.wort[0]).toBe(w.wort[0].toLowerCase());
  });

  it('Schweizer Schreibweise: kein ß', () => {
    for (const w of alle) {
      expect(w.wort).not.toContain('ß');
      expect(w.probe).not.toContain('ß');
    }
  });

  it('jedes Wort hat eine Probe', () => {
    for (const w of WOERTER.nomen) expect(w.probe).toMatch(/^(der|die|das) /);
    for (const w of WOERTER.verb) expect(w.probe).toMatch(/^er /);
    for (const w of WOERTER.adjektiv) expect(w.probe).toContain(' – ');
  });
});

describe('Runde', () => {
  it('mischt die Wortarten der Stufe gleichmässig', () => {
    const r = runde('drei', 12, mischen);
    expect(r).toHaveLength(12);
    for (const art of STUFEN.drei.arten) expect(r.filter((w) => w.art === art)).toHaveLength(4);
    const zwei = runde('zwei', 12, mischen);
    expect(zwei.every((w) => w.art !== 'adjektiv')).toBe(true);
  });
});
