import { describe, it, expect } from 'vitest';
import { kartenspiel, neuesSpiel, darfLegen, lege, zieheStattLegen, passe, computerWahl, spielbar } from '../src/spiele/tschausepp/regeln.js';

const k = (farbe, wert) => ({ farbe, wert });

function zustand(haende, obenKarte) {
  return { haende, stapel: kartenspiel(), ablage: [obenKarte], amZug: 0, wunsch: null, strafe: 0, sieger: null };
}

describe('Tschau Sepp – Regeln', () => {
  it('36 Karten, faire Verteilung, erste Karte keine Sonderkarte', () => {
    expect(kartenspiel()).toHaveLength(36);
    for (let i = 0; i < 50; i++) {
      const z = neuesSpiel(3);
      expect(z.haende.every((h) => h.length === 7)).toBe(true);
      expect(['7', '8', 'B']).not.toContain(z.ablage[0].wert);
      expect(z.stapel.length + z.ablage.length + 21).toBe(36);
    }
    expect(neuesSpiel(4).haende[0]).toHaveLength(6);
  });

  it('Farbe oder Wert bedienen, Bauer immer', () => {
    const z = zustand([[], []], k('herz', '9'));
    expect(darfLegen(z, k('herz', 'K'))).toBe(true);
    expect(darfLegen(z, k('kreuz', '9'))).toBe(true);
    expect(darfLegen(z, k('kreuz', 'K'))).toBe(false);
    expect(darfLegen(z, k('kreuz', 'B'))).toBe(true);
  });

  it('Bauer: Wunschfarbe gilt', () => {
    const b = k('kreuz', 'B');
    const z = zustand([[b, k('herz', '6'), k('herz', '9')], [k('ecke', 'A')]], k('herz', '9'));
    lege(z, b, { wunsch: 'ecke' });
    expect(z.wunsch).toBe('ecke');
    expect(darfLegen(z, k('ecke', 'A'))).toBe(true);
    expect(darfLegen(z, k('herz', '9'))).toBe(false);
  });

  it('7: zwei ziehen, mit 7 kontern verdoppelt', () => {
    const s1 = k('herz', '7');
    const s2 = k('kreuz', '7');
    const z = zustand([[s1, k('herz', '6'), k('herz', 'D')], [s2, k('ecke', '6'), k('ecke', 'D')], [k('schaufel', '6'), k('schaufel', 'K')]], k('herz', '9'));
    lege(z, s1, { tschau: true });
    expect(z.strafe).toBe(2);
    expect(darfLegen(z, k('ecke', '6'))).toBe(false);
    lege(z, s2, { tschau: true });
    expect(z.strafe).toBe(4);
    const r = zieheStattLegen(z);
    expect(r.karten).toHaveLength(4);
    expect(z.haende[2]).toHaveLength(6);
    expect(z.amZug).toBe(0);
  });

  it('8: der Nächste setzt aus', () => {
    const acht = k('herz', '8');
    const z = zustand([[acht, k('herz', '6'), k('kreuz', '6')], [k('ecke', 'A')], [k('schaufel', 'A')]], k('herz', '9'));
    const e = lege(z, acht, { tschau: true });
    expect(e.aussetzen).toBe(1);
    expect(z.amZug).toBe(2);
  });

  it('ohne «Tschau!» zwei Strafkarten, mit der letzten Karte gewonnen', () => {
    const a = k('herz', 'A');
    const z = zustand([[a, k('herz', '6')], [k('ecke', '6')]], k('herz', '9'));
    const e = lege(z, a);
    expect(e.strafkarten).toBe(2);
    expect(z.haende[0]).toHaveLength(3);
    const z2 = zustand([[k('herz', 'A')], [k('ecke', '6')]], k('herz', '9'));
    lege(z2, z2.haende[0][0]);
    expect(z2.sieger).toBe(0);
  });
});

describe('Tschau Sepp – Computer', () => {
  it('legt nur erlaubte Karten und spielt ein ganzes Spiel zu Ende', () => {
    for (let spiel = 0; spiel < 100; spiel++) {
      const z = neuesSpiel(4);
      let zuege = 0;
      while (z.sieger === null && zuege < 2000) {
        const wahl = computerWahl(z, spiel % 2 ? 'knifflig' : 'gemuetlich');
        if (wahl) {
          expect(darfLegen(z, wahl.karte)).toBe(true);
          lege(z, wahl.karte, { wunsch: wahl.wunsch, tschau: true });
        } else {
          const r = zieheStattLegen(z);
          if (!r.strafe) {
            const neu = r.karten[0];
            if (neu && darfLegen(z, neu)) lege(z, neu, { wunsch: neu.wert === 'B' ? 'herz' : null, tschau: true });
            else passe(z);
          }
        }
        zuege++;
      }
      expect(z.sieger).not.toBe(null);
      // Keine Karte geht verloren
      const alle = z.haende.flat().length + z.stapel.length + z.ablage.length;
      expect(alle).toBe(36);
      expect(spielbar(z, 0)).toBeDefined();
    }
  });
});
