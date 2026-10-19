// Memory: Ablauf Satz → Stufe → Spieler → Spiel → Abschluss.
// Die Steuerung erbt vom App-Objekt (Kartensätze, Einstellungen, Profile, Hauptmenü).
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { speicher } from '../../kern/speicher.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeStart } from './start.js';
import { zeigeStufe } from './stufe.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';
import { zeigeAlbum } from './album.js';

export function memorySteuerung(app) {
  const m = Object.create(app);
  m.auswahl = { set: null, stufe: null, spieler: [] };

  m.zeigeStart = () => zeigeStart(m);
  m.waehleSet = (set) => {
    m.auswahl.set = set;
    zeigeStufe(m);
  };
  m.zeigeStufe = () => zeigeStufe(m);
  m.waehleStufe = (stufe) => {
    m.auswahl.stufe = stufe;
    m.zeigeSpieler();
  };
  m.zeigeSpieler = () =>
    zeigeSpieler(app, {
      farbe: m.auswahl.set.farbe,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: m.zeigeStufe,
      weiter: m.starteSpiel,
    });
  m.starteSpiel = (profile) => {
    m.auswahl.spieler = profile;
    merkeLetzteSpieler(profile);
    zeigeSpiel(m);
  };
  m.zeigeSpiel = () => zeigeSpiel(m);
  m.zeigeEnde = (ergebnis) => zeigeEnde(m, ergebnis);
  m.zeigeAlbum = (profilId) => zeigeAlbum(m, profilId);
  return m;
}
