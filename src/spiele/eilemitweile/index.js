// Eile mit Weile: Ablauf Anzahl Farben → Spieler → Spiel → Abschluss.
// Freie Plätze übernimmt das Tablet. Das laufende Spiel wird nach jedem Zug gespeichert.
import { speicher, sichere } from '../../kern/speicher.js';
import { TABLET, alleProfile } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { neuesSpiel } from './regeln.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#F6E3B4';

// Welche Arme (Farben) bei wie vielen Mitspielenden: gegenüber, dann im Uhrzeigersinn
const ARME = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };

export function eileMitWeileSteuerung(app) {
  const e = Object.create(app);
  const daten = () => (speicher.eilemitweile ??= { laufend: null });

  e.zeigeStart = () => zeigeStart(e);
  e.laufendesSpiel = () => daten().laufend;

  e.waehleAnzahl = (anzahl) => {
    zeigeSpieler(app, {
      farbe: FARBE,
      min: 1,
      max: anzahl,
      vorauswahl: daten().letzteSpieler ?? [],
      zurueck: e.zeigeStart,
      weiter: (profile) => {
        daten().letzteSpieler = profile.map((p) => p.id);
        const arme = ARME[anzahl];
        // Menschen bekommen die ersten Farben, die übrigen spielt das Tablet
        const sitze = arme.map((arm, i) => ({ arm, profilId: profile[i]?.id ?? TABLET.id }));
        e.starte({ sitze, beginnt: arme[0] });
      },
    });
  };

  e.starte = ({ sitze, beginnt }) => {
    e.partie = { sitze, beginnt, zustand: neuesSpiel(sitze.map((s) => s.arm), beginnt), verlauf: [] };
    e.speichere();
    zeigeSpiel(e);
  };

  e.weiterspielen = () => {
    e.partie = daten().laufend;
    zeigeSpiel(e);
  };

  // Nochmals: gleiche Plätze, die nächste Farbe beginnt
  e.nochmals = () => {
    const { sitze, beginnt } = e.partie;
    const arme = sitze.map((s) => s.arm);
    e.starte({ sitze, beginnt: arme[(arme.indexOf(beginnt) + 1) % arme.length] });
  };

  e.speichere = () => {
    daten().laufend = e.partie;
    sichere();
  };

  e.spielFertig = () => {
    daten().laufend = null;
    sichere();
    zeigeEnde(e);
  };

  e.profilVon = (id) =>
    id === TABLET.id ? TABLET : (alleProfile().find((p) => p.id === id) ?? alleProfile().at(-2));

  return e;
}
