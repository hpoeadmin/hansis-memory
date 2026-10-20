import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './styles.css';
import { T } from './texte.js';
import { speicher } from './kern/speicher.js';
import { zeige, el } from './kern/ui.js';
import { entsperreAudio } from './kern/klang.js';
import { starteAktualisierung } from './kern/aktualisierung.js';
import { zeigeProfil } from './kern/bildschirme/profil.js';
import { zeigeEinstellungen, wendeRueckseiteAn } from './kern/bildschirme/einstellungen.js';
import { zeigeHauptmenue } from './hauptmenue.js';
import { ladeSets } from './spiele/memory/sets.js';
import { memorySteuerung } from './spiele/memory/index.js';
import { nuensteiSteuerung } from './spiele/nuenistei/index.js';
import { eileMitWeileSteuerung } from './spiele/eilemitweile/index.js';
import { lernMemorySteuerung } from './spiele/lernmemory/index.js';
import { lebensraumSteuerung } from './spiele/lebensraum/index.js';
import { reihenfolgeSteuerung } from './spiele/reihenfolge/index.js';
import { wortartenSteuerung } from './spiele/wortarten/index.js';
import { frankenSteuerung } from './spiele/franken/index.js';
import { einmaleinsSteuerung } from './spiele/einmaleins/index.js';
import { uhrSteuerung } from './spiele/uhr/index.js';
import { kantoneSteuerung } from './spiele/kantone/index.js';
import { rechnenSteuerung } from './spiele/rechnen/index.js';
import { zahlenhausSteuerung } from './spiele/zahlenhaus/index.js';
import { verdoppelnSteuerung } from './spiele/verdoppeln/index.js';
import { zahlenstrahlSteuerung } from './spiele/zahlenstrahl/index.js';
import { schiffeSteuerung } from './spiele/schiffe/index.js';
import { bruecheSteuerung } from './spiele/brueche/index.js';
import { zeitformenSteuerung } from './spiele/zeitformen/index.js';
import { geografieSteuerung } from './spiele/geografie/index.js';
import { negativSteuerung } from './spiele/negativ/index.js';
import { gleichungenSteuerung } from './spiele/gleichungen/index.js';
import { faelleSteuerung } from './spiele/faelle/index.js';
import { bruchrechnenSteuerung } from './spiele/bruchrechnen/index.js';
import { antikeSteuerung } from './spiele/antike/index.js';
import { wirbeltiereSteuerung } from './spiele/wirbeltiere/index.js';
import { einkaufSteuerung } from './spiele/einkauf/index.js';
import { sprichwoerterSteuerung } from './spiele/sprichwoerter/index.js';
import { kalenderSteuerung } from './spiele/kalender/index.js';

// Das App-Objekt hält, was alle Spiele teilen. Jedes Spiel hat eine eigene
// Steuerung, die davon erbt (z.B. app.memory).
const app = {
  sets: [], // Kartensätze; auch die Tier-Avatare der Spieler kommen daher
  einstellungen: speicher.einstellungen,

  zeigeHauptmenue: () => zeigeHauptmenue(app),
  zeigeEinstellungen: () => zeigeEinstellungen(app),
  // «fertig» wird nach Speichern (mit dem Profil) oder Abbrechen (mit null) aufgerufen
  zeigeProfil: (profil, fertig) => zeigeProfil(app, profil, fertig),
};
app.memory = memorySteuerung(app);
app.nuenistei = nuensteiSteuerung(app);
app.eilemitweile = eileMitWeileSteuerung(app);
app.lernmemory = lernMemorySteuerung(app);
app.lebensraum = lebensraumSteuerung(app);
app.reihenfolge = reihenfolgeSteuerung(app);
app.wortarten = wortartenSteuerung(app);
app.franken = frankenSteuerung(app);
app.einmaleins = einmaleinsSteuerung(app);
app.uhr = uhrSteuerung(app);
app.kantone = kantoneSteuerung(app);
app.rechnen = rechnenSteuerung(app);
app.zahlenhaus = zahlenhausSteuerung(app);
app.verdoppeln = verdoppelnSteuerung(app);
app.zahlenstrahl = zahlenstrahlSteuerung(app);
app.schiffe = schiffeSteuerung(app);
app.brueche = bruecheSteuerung(app);
app.zeitformen = zeitformenSteuerung(app);
app.geografie = geografieSteuerung(app);
app.negativ = negativSteuerung(app);
app.gleichungen = gleichungenSteuerung(app);
app.faelle = faelleSteuerung(app);
app.bruchrechnen = bruchrechnenSteuerung(app);
app.antike = antikeSteuerung(app);
app.wirbeltiere = wirbeltiereSteuerung(app);
app.einkauf = einkaufSteuerung(app);
app.sprichwoerter = sprichwoerterSteuerung(app);
app.kalender = kalenderSteuerung(app);

async function starte() {
  wendeRueckseiteAn();
  zeige(el('p', { class: 'meldung' }, T.allgemein.laden));
  try {
    app.sets = await ladeSets();
    app.zeigeHauptmenue();
  } catch (fehler) {
    console.error(fehler);
    zeige(el('p', { class: 'meldung' }, T.allgemein.ladeFehler));
  }
}

// Ton darf erst nach der ersten Berührung starten (iPad)
document.addEventListener('pointerdown', entsperreAudio, { capture: true });

starte();
starteAktualisierung();
