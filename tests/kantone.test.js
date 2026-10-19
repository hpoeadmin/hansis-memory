import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { KANTONE, MODI, kantoneFuer } from '../src/spiele/kantone/kantone.js';
import { STUFEN } from '../src/spiele/memory/sets.js';

describe('Kantone', () => {
  it('alle 26 Kantone mit Wappen', () => {
    expect(KANTONE).toHaveLength(26);
    expect(new Set(KANTONE.map((k) => k.kz)).size).toBe(26);
    for (const k of KANTONE) expect(existsSync(`public/spiele/kantone/${k.kz}.svg`)).toBe(true);
  });

  it('jede Spielart hat genug Kantone für ihr Memory', () => {
    for (const modus of Object.keys(MODI)) {
      expect(kantoneFuer(modus).length).toBeGreaterThanOrEqual(STUFEN[MODI[modus].stufe].paare);
    }
  });

  it('Hauptorte: nur Kantone mit anders lautendem Hauptort', () => {
    for (const k of kantoneFuer('hauptorte')) expect(k.hauptort).not.toBe(k.name);
  });
});
