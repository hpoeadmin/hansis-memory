import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './styles.css';
import { T } from './texte.js';
import { ladeSets } from './sets.js';
import { speicher } from './speicher.js';
import { merkeLetzteSpieler } from './profile.js';
import { zeige, el } from './ui.js';
import { zeigeStart } from './screens/start.js';
import { zeigeStufe } from './screens/stufe.js';
import { zeigeSpieler } from './screens/spieler.js';
import { zeigeProfil } from './screens/profil.js';
import { zeigeSpiel } from './screens/spiel.js';
import { zeigeEnde } from './screens/ende.js';

const app = {
  sets: [],
  auswahl: { set: null, stufe: null, spieler: [] },
  einstellungen: speicher.einstellungen,

  zeigeStart: () => zeigeStart(app),
  waehleSet(set) {
    app.auswahl.set = set;
    zeigeStufe(app);
  },
  zeigeStufe: () => zeigeStufe(app),
  waehleStufe(stufe) {
    app.auswahl.stufe = stufe;
    zeigeSpieler(app);
  },
  zeigeProfil(profil) {
    zeigeProfil(app, profil, (gespeichert) => {
      // Ein neu angelegter Spieler ist gleich ausgewählt
      if (gespeichert && !profil && speicher.letzteSpieler.length < 4) {
        speicher.letzteSpieler.push(gespeichert.id);
      }
      zeigeSpieler(app);
    });
  },
  starteSpiel(profile) {
    app.auswahl.spieler = profile;
    merkeLetzteSpieler(profile);
    zeigeSpiel(app);
  },
  zeigeSpiel: () => zeigeSpiel(app),
  zeigeEnde: (ergebnis) => zeigeEnde(app, ergebnis),
};

async function starte() {
  zeige(el('p', { class: 'meldung' }, T.allgemein.laden));
  try {
    app.sets = await ladeSets();
    app.zeigeStart();
  } catch (fehler) {
    console.error(fehler);
    zeige(el('p', { class: 'meldung' }, T.allgemein.ladeFehler));
  }
}

starte();
