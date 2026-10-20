import { describe, it, expect } from 'vitest';
import { schuljahr, aktuelleKlasse, kategorieVon, passendeStufe } from '../src/kern/schulstufe.js';

const tag = (j, m, t) => new Date(j, m - 1, t);

describe('Schuljahr (Beginn im August)', () => {
  it('wechselt am 1. August', () => {
    expect(schuljahr(tag(2026, 7, 31))).toBe(2025);
    expect(schuljahr(tag(2026, 8, 1))).toBe(2026);
    expect(schuljahr(tag(2027, 6, 15))).toBe(2026);
  });
});

describe('Klasse zählt mit', () => {
  const lena = { klasse: '2', klasseSchuljahr: 2026 };

  it('bleibt im laufenden Schuljahr gleich', () => {
    expect(aktuelleKlasse(lena, tag(2027, 7, 31)).id).toBe('2');
  });

  it('steigt im August eine Klasse auf', () => {
    expect(aktuelleKlasse(lena, tag(2027, 8, 20)).id).toBe('3');
    expect(aktuelleKlasse(lena, tag(2030, 9, 1)).id).toBe('6');
  });

  it('bleibt nach der 6. Klasse bei der Oberstufe', () => {
    expect(aktuelleKlasse(lena, tag(2035, 9, 1)).id).toBe('ober');
  });

  it('Kindergarten wird zur 1. Klasse', () => {
    expect(aktuelleKlasse({ klasse: 'kg2', klasseSchuljahr: 2026 }, tag(2027, 8, 20)).id).toBe('1');
  });

  it('Erwachsene und Profile ohne Klasse', () => {
    expect(aktuelleKlasse({ klasse: 'erw', klasseSchuljahr: 2020 }, tag(2027, 8, 20)).id).toBe('erw');
    expect(aktuelleKlasse({}, tag(2027, 8, 20))).toBe(null);
  });
});

describe('Kategorien', () => {
  it('fasst je zwei Schuljahre zusammen', () => {
    expect(kategorieVon(-2)).toBe('vorkg');
    expect(kategorieVon(-1)).toBe('kg');
    expect(kategorieVon(0)).toBe('kg');
    expect(kategorieVon(2)).toBe('kl12');
    expect(kategorieVon(4)).toBe('kl34');
    expect(kategorieVon(6)).toBe('kl56');
    expect(kategorieVon(7)).toBe('kl56');
    expect(kategorieVon(99)).toBe('erw');
  });
});

describe('Empfehlung', () => {
  const tabelle = { vorkg: 'leicht', kg: 'leicht', kl12: 'mittel', kl34: 'schwer', kl56: 'schwer' };
  it('richtet sich nach dem jüngsten Kind', () => {
    const lena = { name: 'Lena', klasse: '2', klasseSchuljahr: 2026 };
    const tim = { name: 'Tim', klasse: '6', klasseSchuljahr: 2026 };
    const grosi = { name: 'Grosi', klasse: 'erw' };
    expect(passendeStufe([tim, lena, grosi], tabelle, tag(2026, 10, 19))).toEqual({ stufe: 'mittel', profil: lena });
    expect(passendeStufe([tim], tabelle, tag(2026, 10, 19)).stufe).toBe('schwer');
    expect(passendeStufe([grosi], tabelle, tag(2026, 10, 19))).toBe(null);
  });
});

describe('Gymnasium', () => {
  it('zählt nicht weiter und hat eine eigene Kategorie', async () => {
    const { kategorieVonKlasse } = await import('../src/kern/schulstufe.js');
    const anna = { klasse: 'gymi', klasseSchuljahr: 2026 };
    expect(aktuelleKlasse(anna, tag(2028, 9, 1)).id).toBe('gymi');
    expect(kategorieVonKlasse(aktuelleKlasse(anna))).toBe('gymi');
    expect(passendeStufe([anna], { kl56: 'a', gymi: 'b' })?.stufe).toBe('b');
  });
});
