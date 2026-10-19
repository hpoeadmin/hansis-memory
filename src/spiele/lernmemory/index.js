// Lern-Memory: Ablauf Übungsart → Stufe → Spieler → Spiel → Abschluss.
// Nutzt die Bildschirme des Memory; nur die Paare sind anders.
import { speicher } from '../../kern/speicher.js';
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { T } from '../../texte.js';
import { zeigeStufe } from '../memory/stufe.js';
import { zeigeSpiel } from '../memory/spiel.js';
import { zeigeEnde } from '../memory/ende.js';
import { lernPaare } from './paare.js';

export const ARTEN = {
  bildwort: { farbe: '#DCEBFA', bild: 'spiele/lern-bildwort.svg' },
  mengezahl: { farbe: '#FBE7C6', bild: 'spiele/lern-mengezahl.svg' },
  buchstaben: { farbe: '#EADCF7', bild: 'spiele/lern-buchstaben.svg' },
};

export function lernMemorySteuerung(app) {
  const m = Object.create(app);
  m.lern = null;
  m.auswahl = { set: null, stufe: null, spieler: [] };

  // Die drei Übungsarten haben eigene Kacheln im Hauptmenü – «zurück» führt dorthin
  m.zeigeStart = () => app.zeigeHauptmenue();
  m.waehleArt = (art) => {
    m.lern = art;
    m.auswahl.set = { id: `lern-${art}`, name: T.lernmemory.arten[art].titel, farbe: ARTEN[art].farbe };
    zeigeStufe(m);
  };
  m.zeigeStufe = () => zeigeStufe(m);
  m.waehleStufe = (stufe) => {
    m.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: m.auswahl.set.farbe,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: m.zeigeStufe,
      weiter: m.starteSpiel,
    });
  };
  m.starteSpiel = (profile) => {
    m.auswahl.spieler = profile;
    merkeLetzteSpieler(profile);
    zeigeSpiel(m);
  };
  m.zeigeSpiel = () => zeigeSpiel(m);
  m.zeigeEnde = (ergebnis) => zeigeEnde(m, ergebnis);
  m.erzeugePaare = (anzahl) => lernPaare(m.lern, anzahl, app.sets);
  return m;
}
