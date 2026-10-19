// Alle Spiele im Hauptmenü, geordnet nach Bereichen. Ein neues Spiel = ein Eintrag hier
// (Name in texte.js unter «spiele», Bild in public/spiele/).
// ab: ab welcher Kategorie das Spiel gedacht ist ('alle', 'kg', 'kl12', 'kl34', 'kl56')
// bis: (freiwillig) bis zu welcher Kategorie – für Ältere zu einfache Spiele fehlen dort

export const BEREICHE = ['gedaechtnis', 'raum', 'mathe', 'lesen', 'natur', 'brett'];

// Kacheln auf der Startseite: die Klassen (Reihenfolge = Alter), «Spiele» (die Brettspiele)
// und «Alle Spiele» (jedes Spiel).
export const KLASSENWAHL = ['kg', 'kl12', 'kl34', 'kl56', 'brett', 'alle'];
const RANG = { alle: 0, kg: 1, kl12: 2, kl34: 3, kl56: 4 };

// Spiele für eine Kachel: bei einer Klasse alles, was «ab» dieser Klasse oder jünger gedacht ist –
// ohne die Brettspiele, die haben ihre eigene Kachel
export function spieleFuer(klasse) {
  if (klasse === 'alle') return SPIELE;
  if (klasse === 'brett') return SPIELE.filter((spiel) => spiel.bereich === 'brett');
  return SPIELE.filter(
    (spiel) => spiel.bereich !== 'brett' && RANG[spiel.ab] <= RANG[klasse] && RANG[klasse] <= RANG[spiel.bis ?? 'kl56'],
  );
}

export const SPIELE = [
  {
    id: 'memory',
    bereich: 'gedaechtnis',
    ab: 'alle',
    bild: 'spiele/memory.svg',
    farbe: '#DDF0C8',
    starte: (app) => app.memory.zeigeStart(),
  },
  {
    id: 'reihenfolge',
    bereich: 'gedaechtnis',
    ab: 'alle',
    bild: 'spiele/reihenfolge.svg',
    farbe: '#EADCF7',
    starte: (app) => app.reihenfolge.zeigeStart(),
  },
  {
    id: 'lern-mengezahl',
    bereich: 'mathe',
    ab: 'kg',
    bis: 'kl12',
    bild: 'spiele/lern-mengezahl.svg',
    farbe: '#FBE7C6',
    starte: (app) => app.lernmemory.waehleArt('mengezahl'),
  },
  {
    id: 'rechnen',
    bereich: 'mathe',
    ab: 'kl12',
    bis: 'kl12',
    bild: 'spiele/rechnen.svg',
    farbe: '#E2F2DC',
    starte: (app) => app.rechnen.zeigeStart(),
  },
  {
    id: 'zahlenhaus',
    bereich: 'mathe',
    ab: 'kl12',
    bis: 'kl12',
    bild: 'spiele/zahlenhaus.svg',
    farbe: '#FCE3EC',
    starte: (app) => app.zahlenhaus.zeigeStart(),
  },
  {
    id: 'verdoppeln',
    bereich: 'mathe',
    ab: 'kl12',
    bis: 'kl12',
    bild: 'spiele/verdoppeln.svg',
    farbe: '#FFF0C9',
    starte: (app) => app.verdoppeln.zeigeStart(),
  },
  {
    id: 'zahlenstrahl',
    bereich: 'mathe',
    ab: 'kl12',
    bis: 'kl12',
    bild: 'spiele/zahlenstrahl.svg',
    farbe: '#E0EEF8',
    starte: (app) => app.zahlenstrahl.zeigeStart(),
  },
  {
    id: 'einmaleins',
    bereich: 'mathe',
    ab: 'kl12',
    bild: 'spiele/einmaleins.svg',
    farbe: '#FDE6D8',
    starte: (app) => app.einmaleins.zeigeStart(),
  },
  {
    id: 'uhr',
    bereich: 'mathe',
    ab: 'kl12',
    bild: 'spiele/uhr.svg',
    farbe: '#DCEBFA',
    starte: (app) => app.uhr.zeigeStart(),
  },
  {
    id: 'franken',
    bereich: 'mathe',
    ab: 'kl12',
    bild: 'spiele/franken.svg',
    farbe: '#FFF3D6',
    starte: (app) => app.franken.zeigeStart(),
  },
  {
    id: 'lern-bildwort',
    bereich: 'lesen',
    ab: 'kg',
    bis: 'kl12',
    bild: 'spiele/lern-bildwort.svg',
    farbe: '#DCEBFA',
    starte: (app) => app.lernmemory.waehleArt('bildwort'),
  },
  {
    id: 'lern-buchstaben',
    bereich: 'lesen',
    ab: 'kg',
    bis: 'kl12',
    bild: 'spiele/lern-buchstaben.svg',
    farbe: '#EADCF7',
    starte: (app) => app.lernmemory.waehleArt('buchstaben'),
  },
  {
    id: 'wortarten',
    bereich: 'lesen',
    ab: 'kl34',
    bild: 'spiele/wortarten.svg',
    farbe: '#E3F0D9',
    starte: (app) => app.wortarten.zeigeStart(),
  },
  {
    id: 'lebensraum',
    bereich: 'natur',
    ab: 'alle',
    bild: 'spiele/lebensraum.svg',
    farbe: '#FBE7C6',
    starte: (app) => app.lebensraum.zeigeStart(),
  },
  {
    id: 'kantone',
    bereich: 'natur',
    ab: 'kl34',
    bild: 'spiele/kantone.svg',
    farbe: '#F7DCDC',
    starte: (app) => app.kantone.zeigeStart(),
  },
  {
    id: 'nuenistei',
    bereich: 'brett',
    ab: 'kl12',
    bild: 'spiele/nuenistei.svg',
    farbe: '#EAD7B7',
    starte: (app) => app.nuenistei.zeigeStart(),
  },
  {
    id: 'eilemitweile',
    bereich: 'brett',
    ab: 'kg',
    bild: 'spiele/eilemitweile.svg',
    farbe: '#F6E3B4',
    starte: (app) => app.eilemitweile.zeigeStart(),
  },
];
