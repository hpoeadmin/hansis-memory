import { describe, it, expect } from 'vitest';
import {
  NACHBARN,
  MUEHLEN,
  neuesSpiel,
  fuehreAus,
  zuege,
  wegnehmbare,
  zieleVon,
  phase,
} from '../src/spiele/nuenistei/regeln.js';
import { waehleZug } from '../src/spiele/nuenistei/computer.js';

// Hilfsfunktion: Brett aus Listen von Punkten bauen
function stellung(weiss, schwarz, extra = {}) {
  const z = neuesSpiel();
  for (const p of weiss) z.brett[p] = 0;
  for (const p of schwarz) z.brett[p] = 1;
  z.zuSetzen = [0, 0];
  return { ...z, ...extra };
}

describe('Brett', () => {
  it('hat 24 Punkte, 16 Mühlen und symmetrische Nachbarn', () => {
    expect(NACHBARN).toHaveLength(24);
    expect(MUEHLEN).toHaveLength(16);
    NACHBARN.forEach((liste, p) => liste.forEach((q) => expect(NACHBARN[q]).toContain(p)));
    expect(NACHBARN.flat()).toHaveLength(64); // 32 Linien, je zweimal
  });
});

describe('Setzen und Mühle', () => {
  it('Weiss beginnt, danach ist Schwarz dran', () => {
    const z = fuehreAus(neuesSpiel(), { art: 'setzen', nach: 0 });
    expect(z.brett[0]).toBe(0);
    expect(z.amZug).toBe(1);
    expect(z.zuSetzen).toEqual([8, 9]);
  });

  it('eine Mühle erlaubt einen Stein wegzunehmen, danach wechselt der Zug', () => {
    let z = neuesSpiel();
    for (const [nach] of [[0], [8], [1], [9]]) z = fuehreAus(z, { art: 'setzen', nach });
    z = fuehreAus(z, { art: 'setzen', nach: 2 }); // Mühle 0-1-2
    expect(z.wegnehmen).toBe(true);
    expect(z.amZug).toBe(0);
    expect(z.letzteMuehle).toEqual([0, 1, 2]);
    expect(zuege(z).every((zug) => zug.art === 'weg')).toBe(true);
    z = fuehreAus(z, { art: 'weg', punkt: 8 });
    expect(z.brett[8]).toBe(null);
    expect(z.amZug).toBe(1);
    expect(z.wegnehmen).toBe(false);
  });

  it('Steine in einer Mühle sind geschützt, solange es andere gibt', () => {
    const z = stellung([3], [0, 1, 2, 12], { wegnehmen: true, amZug: 0 });
    expect(wegnehmbare(z)).toEqual([12]);
    const nurMuehle = stellung([3], [0, 1, 2], { wegnehmen: true, amZug: 0 });
    expect(wegnehmbare(nurMuehle)).toEqual([0, 1, 2]);
  });
});

describe('Ziehen und Springen', () => {
  it('ziehen nur entlang der Linien auf freie Punkte', () => {
    const z = stellung([1, 20, 22, 14], [0, 5, 6, 12]);
    expect(phase(z)).toBe('ziehen');
    expect(zieleVon(z, 1).sort()).toEqual([2, 9]);
  });

  it('mit 3 Steinen darf man springen', () => {
    const z = stellung([1, 20, 22], [0, 5, 6, 12]);
    expect(phase(z)).toBe('springen');
    expect(zieleVon(z, 1)).toHaveLength(24 - 7);
  });
});

describe('Spielende', () => {
  it('wer nur noch 2 Steine hat, verliert', () => {
    const z0 = stellung([0, 1, 2, 12], [8, 9, 20], { amZug: 0, wegnehmen: true });
    const z = fuehreAus(z0, { art: 'weg', punkt: 20 });
    expect(z.sieger).toBe(0);
  });

  it('wer nicht mehr ziehen kann, verliert', () => {
    // Weiss steht auf den 4 äusseren Ecken, Schwarz sperrt alle Mitten
    const z0 = stellung([0, 2, 4, 6], [1, 3, 5, 7, 9], { amZug: 1 });
    const z = fuehreAus(z0, { art: 'ziehen', von: 9, nach: 10 });
    expect(z.sieger).toBe(1);
  });

  it('nach 50 Zügen ohne Mühle ist es unentschieden', () => {
    const z0 = stellung([0, 12, 20, 22], [8, 4, 6, 18], { amZug: 0, zuegeOhneMuehle: 49 });
    const z = fuehreAus(z0, { art: 'ziehen', von: 0, nach: 1 });
    expect(z.sieger).toBe('remis');
  });
});

describe('Computer', () => {
  it('wählt immer einen erlaubten Zug', () => {
    for (const stufe of ['gemuetlich', 'knifflig']) {
      let z = neuesSpiel();
      for (let i = 0; i < 40 && z.sieger === null; i++) {
        const zug = waehleZug(z, stufe);
        expect(zuege(z)).toContainEqual(zug);
        z = fuehreAus(z, zug);
      }
    }
  });

  it('schliesst auf «knifflig» eine Mühle, statt nur abzuwehren', () => {
    // Weiss kann mit 2 eine Mühle setzen, Schwarz droht mit 10 – die eigene Mühle geht vor
    const z = neuesSpiel();
    z.brett[0] = z.brett[1] = 0;
    z.brett[8] = z.brett[9] = 1;
    z.zuSetzen = [7, 7];
    expect(waehleZug(z, 'knifflig')).toEqual({ art: 'setzen', nach: 2 });
  });

  it('nimmt auf «knifflig» einen Stein weg, der eine Mühle droht', () => {
    const z = stellung([0, 1, 2, 20], [8, 9, 14, 22], { amZug: 0, wegnehmen: true });
    z.zuSetzen = [0, 2]; // Schwarz könnte mit 10 die Mühle 8-9-10 setzen
    const zug = waehleZug(z, 'knifflig');
    expect([8, 9]).toContain(zug.punkt);
  });
});
