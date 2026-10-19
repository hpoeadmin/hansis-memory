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
