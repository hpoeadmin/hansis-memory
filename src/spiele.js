// Alle Spiele im Hauptmenü, geordnet nach Bereichen. Ein neues Spiel = ein Eintrag hier
// (Name in texte.js unter «spiele», Bild in public/spiele/).
// ab: ab welcher Kategorie das Spiel gedacht ist ('alle', 'kg', 'kl12', 'kl34', 'kl56')
// bis: (freiwillig) bis zu welcher Kategorie – für Ältere zu einfache Spiele fehlen dort

export const BEREICHE = ['gedaechtnis', 'raum', 'mathe', 'lesen', 'natur', 'brett'];

// Klassen auf der Startseite (Reihenfolge = Alter). «alle» zeigt jedes Spiel.
export const KLASSENWAHL = ['kg', 'kl12', 'kl34', 'kl56', 'alle'];
const RANG = { alle: 0, kg: 1, kl12: 2, kl34: 3, kl56: 4 };

// Spiele für eine Klasse: alles, was «ab» dieser Klasse oder jünger gedacht ist
export function spieleFuer(klasse) {
  if (klasse === 'alle') return SPIELE;
  return SPIELE.filter((spiel) => RANG[spiel.ab] <= RANG[klasse] && RANG[klasse] <= RANG[spiel.bis ?? 'kl56']);
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
    id: 'franken',
    bereich: 'mathe',
    ab: 'kl34',
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
