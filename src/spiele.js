// Alle Spiele im Hauptmenü, geordnet nach Bereichen. Ein neues Spiel = ein Eintrag hier
// (Name in texte.js unter «spiele», Bild in public/spiele/).
// ab: ab welcher Kategorie das Spiel gedacht ist ('alle', 'kg', 'kl12', 'kl34', 'kl56')

export const BEREICHE = ['gedaechtnis', 'raum', 'mathe', 'lesen', 'natur', 'brett'];

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
    bild: 'spiele/lern-mengezahl.svg',
    farbe: '#FBE7C6',
    starte: (app) => app.lernmemory.waehleArt('mengezahl'),
  },
  {
    id: 'lern-bildwort',
    bereich: 'lesen',
    ab: 'kg',
    bild: 'spiele/lern-bildwort.svg',
    farbe: '#DCEBFA',
    starte: (app) => app.lernmemory.waehleArt('bildwort'),
  },
  {
    id: 'lern-buchstaben',
    bereich: 'lesen',
    ab: 'kg',
    bild: 'spiele/lern-buchstaben.svg',
    farbe: '#EADCF7',
    starte: (app) => app.lernmemory.waehleArt('buchstaben'),
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
