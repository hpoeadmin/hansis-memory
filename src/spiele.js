// Alle Spiele im Hauptmenü. Ein neues Spiel = ein Eintrag hier
// (Name in texte.js unter «spiele», Bild in public/spiele/).
export const SPIELE = [
  {
    id: 'memory',
    bild: 'spiele/memory.svg',
    farbe: '#DDF0C8',
    status: 'bereit',
    starte: (app) => app.memory.zeigeStart(),
  },
  { id: 'nuenistei', bild: 'spiele/nuenistei.svg', farbe: '#EAD7B7', status: 'bald' },
  { id: 'eilemitweile', bild: 'spiele/eilemitweile.svg', farbe: '#F6E3B4', status: 'bald' },
];
