// «Merk dir die Reihenfolge»: Tiere leuchten nacheinander auf, man tippt sie nach.
// Ablauf Stufe (4, 6 oder 9 Tiere) → Spieler (genau 1) → Spiel → Abschluss.
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { speicher } from '../../kern/speicher.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#EADCF7';
export const STUFEN = { vier: 4, sechs: 6, neun: 9 };

export function reihenfolgeSteuerung(app) {
  const r = Object.create(app);
  r.auswahl = { stufe: 'vier', spieler: [] };

  r.zeigeStart = () => zeigeStart(r);
  r.waehleStufe = (stufe) => {
    r.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: FARBE,
      min: 1,
      max: 1,
      vorauswahl: speicher.letzteSpieler.slice(0, 1),
      zurueck: r.zeigeStart,
      weiter: (profile) => {
        r.auswahl.spieler = profile;
        // Die Memory-Auswahl mehrerer Spieler nicht überschreiben
        if (speicher.letzteSpieler.length <= 1) merkeLetzteSpieler(profile);
        zeigeSpiel(r);
      },
    });
  };
  r.zeigeSpiel = () => zeigeSpiel(r);
  r.zeigeEnde = (ergebnis) => zeigeEnde(r, ergebnis);
  return r;
}
