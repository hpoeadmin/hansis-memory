// «Bezahlen mit Franken»: im Spielzeugladen genau bezahlen oder Rückgeld geben.
// Ablauf Stufe → Spieler → Spiel → Abschluss. 8 Einkäufe pro Runde.
import { speicher } from '../../kern/speicher.js';
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#FFF3D6';
export const EINKAEUFE = 8;

export function frankenSteuerung(app) {
  const f = Object.create(app);
  f.auswahl = { stufe: 'rappen', spieler: [] };

  f.zeigeStart = () => zeigeStart(f);
  f.waehleStufe = (stufe) => {
    f.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: FARBE,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: f.zeigeStart,
      weiter: (profile) => {
        f.auswahl.spieler = profile;
        merkeLetzteSpieler(profile);
        zeigeSpiel(f);
      },
    });
  };
  f.zeigeSpiel = () => zeigeSpiel(f);
  f.zeigeEnde = (ergebnis) => zeigeEnde(f, ergebnis);
  return f;
}
