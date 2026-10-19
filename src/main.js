import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './styles.css';
import { T } from './texte.js';
import { ladeSets } from './sets.js';
import { speicher } from './speicher.js';
import { merkeLetzteSpieler } from './profile.js';
import { zeige, el } from './ui.js';
import { entsperreAudio } from './klang.js';
import { starteAktualisierung } from './aktualisierung.js';
import { zeigeStart } from './screens/start.js';
import { zeigeStufe } from './screens/stufe.js';
import { zeigeSpieler } from './screens/spieler.js';
import { zeigeProfil } from './screens/profil.js';
import { zeigeSpiel } from './screens/spiel.js';
import { zeigeEnde } from './screens/ende.js';
import { zeigeAlbum } from './screens/album.js';
import { zeigeEinstellungen, wendeRueckseiteAn } from './screens/einstellungen.js';

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
  // Ohne «zurueck» geht es danach zur Spielerauswahl
  zeigeProfil(profil, zurueck) {
    zeigeProfil(app, profil, (gespeichert) => {
      if (zurueck) return zurueck(gespeichert);
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
  zeigeAlbum: (profilId) => zeigeAlbum(app, profilId),
  zeigeEinstellungen: () => zeigeEinstellungen(app),
};

async function starte() {
  wendeRueckseiteAn();
  zeige(el('p', { class: 'meldung' }, T.allgemein.laden));
  try {
    app.sets = await ladeSets();
    app.zeigeStart();
  } catch (fehler) {
    console.error(fehler);
    zeige(el('p', { class: 'meldung' }, T.allgemein.ladeFehler));
  }
}

// Ton darf erst nach der ersten Berührung starten (iPad)
document.addEventListener('pointerdown', entsperreAudio, { capture: true });

starte();
starteAktualisierung();
