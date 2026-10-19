// «Wortarten»: Wort in die richtige Kiste tippen (Nomen, Verb, Adjektiv).
// Ablauf Stufe → Spieler → Spiel → Abschluss. 12 Wörter pro Runde.
import { speicher } from '../../kern/speicher.js';
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#E3F0D9';
export const WOERTER_PRO_RUNDE = 12;

export function wortartenSteuerung(app) {
  const w = Object.create(app);
  w.auswahl = { stufe: 'drei', spieler: [] };

  w.zeigeStart = () => zeigeStart(w);
  w.waehleStufe = (stufe) => {
    w.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: FARBE,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: w.zeigeStart,
      weiter: (profile) => {
        w.auswahl.spieler = profile;
        merkeLetzteSpieler(profile);
        zeigeSpiel(w);
      },
    });
  };
  w.zeigeSpiel = () => zeigeSpiel(w);
  w.zeigeEnde = (ergebnis) => zeigeEnde(w, ergebnis);
  return w;
}
