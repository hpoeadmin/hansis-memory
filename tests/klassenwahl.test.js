import { describe, it, expect } from 'vitest';
import { spieleFuer, SPIELE } from '../src/spiele.js';

const ids = (klasse) => spieleFuer(klasse).map((s) => s.id);

describe('Spiele pro Klasse', () => {
  it('«Alle Spiele» zeigt jedes Spiel', () => {
    expect(spieleFuer('alle')).toHaveLength(SPIELE.length);
  });

  it('Kindergarten: keine Spiele ab der Schule', () => {
    expect(ids('kg')).toContain('lern-mengezahl');
    expect(ids('kg')).not.toContain('wortarten');
    expect(ids('kg')).not.toContain('nuenistei');
  });

  it('3./4. Klasse: neue Spiele, aber keine Kindergarten-Lernspiele', () => {
    expect(ids('kl34')).toEqual(expect.arrayContaining(['franken', 'wortarten', 'memory']));
    expect(ids('kl34')).not.toContain('lern-buchstaben');
  });

  it('Brettspiele stehen nur unter «Spiele» und «Alle Spiele»', () => {
    expect(ids('brett').sort()).toEqual(['eilemitweile', 'nuenistei', 'schiffe']);
    for (const klasse of ['kg', 'kl12', 'kl34', 'kl56']) {
      expect(ids(klasse)).not.toContain('nuenistei');
      expect(ids(klasse)).not.toContain('eilemitweile');
    }
    expect(ids('alle')).toContain('nuenistei');
  });
});
