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
    expect(ids('kl34')).toEqual(expect.arrayContaining(['franken', 'wortarten', 'memory', 'nuenistei']));
    expect(ids('kl34')).not.toContain('lern-buchstaben');
  });
});
