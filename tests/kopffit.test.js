import { describe, it, expect } from 'vitest';
import * as sw from '../src/spiele/sprichwoerter/daten.js';
import * as ka from '../src/spiele/kalender/aufgaben.js';
import * as ek from '../src/spiele/einkauf/daten.js';
import { spieleFuer } from '../src/spiele.js';

describe('Sprichwörter', () => {
  it('genau eine richtige Antwort, keine doppelten', () => {
    for (const stufe of Object.keys(sw.STUFEN)) {
      for (let i = 0; i < 300; i++) {
        const x = sw.aufgabe(stufe);
        expect(x.antworten).toHaveLength(sw.STUFEN[stufe].optionen);
        expect(new Set(x.antworten.map((a) => a.text)).size).toBe(x.antworten.length);
        expect(x.antworten.filter((a) => a.richtig)).toHaveLength(1);
      }
    }
  });

  it('Schweizer Schreibweise', () => {
    for (const s of sw.SPRICHWOERTER) expect(`${s.anfang}${s.ende}${s.bedeutung}`).not.toContain('ß');
  });
});

describe('Kalender und Fahrplan', () => {
  it('Wochentage stimmen mit dem echten Kalender', () => {
    expect(ka.WOCHENTAGE[ka.wochentag(2026, 9, 20)]).toBe('Dienstag'); // 20. Oktober 2026
    expect(ka.tageImMonat(2028, 1)).toBe(29);
  });

  it('Aufgaben haben eine eindeutige richtige Antwort', () => {
    for (const stufe of Object.keys(ka.STUFEN)) {
      for (let i = 0; i < 400; i++) {
        const x = ka.aufgabe(stufe);
        if (x.art === 'wochentag') {
          expect(new Set(x.optionen).size).toBe(4);
          expect(x.optionen).toContain(x.ergebnis);
          expect(x.ergebnis).toBe((((x.heute + x.schritt) % 7) + 7) % 7);
        } else if (x.art === 'kalender') {
          expect(new Set(x.optionen).size).toBe(x.optionen.length);
          expect(x.optionen).toContain(x.ergebnis);
          if (x.frage === 'ersterSonntag') expect(ka.wochentag(x.jahr, x.monat, x.ergebnis)).toBe(6);
        } else {
          // Der gewählte Zug kommt rechtzeitig an, der nächste nicht
          expect(x.ergebnis.an).toBeLessThanOrEqual(x.termin);
          const i2 = x.zuege.indexOf(x.ergebnis);
          expect(x.zuege[i2 + 1].an).toBeGreaterThan(x.termin);
        }
      }
    }
  });
});

describe('Einkaufsliste', () => {
  it('Liste ist in der Auswahl enthalten, ohne doppelte Dinge', () => {
    for (const stufe of Object.keys(ek.STUFEN)) {
      const d = ek.durchgang(stufe);
      expect(d.liste).toHaveLength(ek.STUFEN[stufe].anzahl);
      expect(d.auswahl).toHaveLength(ek.STUFEN[stufe].auswahl);
      for (const x of d.liste) expect(d.auswahl).toContain(x);
      expect(new Set(d.auswahl.map((x) => x.name)).size).toBe(d.auswahl.length);
    }
  });

  it('Bewertung', () => {
    const d = ek.durchgang('vier');
    const andere = d.auswahl.find((x) => !d.liste.includes(x));
    const r = ek.bewerte(d.liste, [d.liste[0], d.liste[1], andere]);
    expect(r.gefunden).toHaveLength(2);
    expect(r.falsch).toEqual([andere]);
    expect(r.vergessen).toHaveLength(2);
    expect(ek.bewerte(d.liste, [...d.liste]).perfekt).toBe(true);
  });
});

describe('Kachel KopfFit', () => {
  it('eigene Spiele und passende bestehende', () => {
    const ids = spieleFuer('kopffit').map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['einkauf', 'sprichwoerter', 'kalender', 'memory', 'nuenistei', 'geografie']));
    expect(spieleFuer('kl34').map((s) => s.id)).not.toContain('sprichwoerter');
  });
});
