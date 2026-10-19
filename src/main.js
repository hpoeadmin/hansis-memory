import './styles.css';
import { T } from './texte.js';
import { ladeSets } from './sets.js';
import { zeige, el } from './ui.js';
import { zeigeStart } from './screens/start.js';
import { zeigeStufe } from './screens/stufe.js';
import { zeigeSpiel } from './screens/spiel.js';
import { zeigeEnde } from './screens/ende.js';

const app = {
  sets: [],
  auswahl: { set: null, stufe: null },
  einstellungen: { aufdeckDauer: 2500 },

  zeigeStart: () => zeigeStart(app),
  waehleSet(set) {
    app.auswahl.set = set;
    zeigeStufe(app);
  },
  waehleStufe(stufe) {
    app.auswahl.stufe = stufe;
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
