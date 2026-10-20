// Alle Spiele im Hauptmenü, geordnet nach Bereichen. Ein neues Spiel = ein Eintrag hier
// (Name in texte.js unter «spiele», Bild in public/spiele/).
// ab: ab welcher Kategorie das Spiel gedacht ist ('alle', 'kg', 'kl12', 'kl34', 'kl56', 'gymi')
// bis: (freiwillig) bis zu welcher Kategorie – für Ältere zu einfache Spiele fehlen dort
// kopffit: true – erscheint auch unter «KopfFit» (für Erwachsene)

export const BEREICHE = ['gedaechtnis', 'raum', 'mathe', 'lesen', 'natur', 'brett'];

// Kacheln auf der Startseite: die Klassen (Reihenfolge = Alter), «Spiele» (die Brettspiele)
// und «Alle Spiele» (jedes Spiel).
export const KLASSENWAHL = ['kg', 'kl12', 'kl34', 'kl56', 'gymi', 'kopffit', 'brett', 'alle'];
const RANG = { alle: 0, kg: 1, kl12: 2, kl34: 3, kl56: 4, gymi: 5 };

// Spiele für eine Kachel: bei einer Klasse alles, was «ab» dieser Klasse oder jünger gedacht ist –
// ohne die Brettspiele, die haben ihre eigene Kachel
export function spieleFuer(klasse) {
  if (klasse === 'alle') return SPIELE;
  if (klasse === 'brett') return SPIELE.filter((spiel) => spiel.bereich === 'brett');
  // Das Gymnasium hat nur seine eigenen Spiele
  if (klasse === 'gymi') return SPIELE.filter((spiel) => spiel.ab === 'gymi');
  // KopfFit (Erwachsene über 75): eigene Spiele und passende bestehende (kopffit: true)
  if (klasse === 'kopffit') return SPIELE.filter((spiel) => spiel.ab === 'kopffit' || spiel.kopffit);
  return SPIELE.filter(
    (spiel) => spiel.bereich !== 'brett' && RANG[spiel.ab] <= RANG[klasse] && RANG[klasse] <= RANG[spiel.bis ?? 'kl56'],
  );
}

export const SPIELE = [
  {
    id: 'memory',
    kopffit: true,
    bereich: 'gedaechtnis',
    ab: 'alle',
    bild: 'spiele/memory.svg',
    farbe: '#DDF0C8',
    starte: (app) => app.memory.zeigeStart(),
  },
  {
    id: 'reihenfolge',
    kopffit: true,
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
    id: 'brueche',
    bereich: 'mathe',
    ab: 'kl56',
    bild: 'spiele/brueche.svg',
    farbe: '#FDE3D3',
    starte: (app) => app.brueche.zeigeStart(),
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
    id: 'zeitformen',
    bereich: 'lesen',
    ab: 'kl56',
    bild: 'spiele/zeitformen.svg',
    farbe: '#E7E1F7',
    starte: (app) => app.zeitformen.zeigeStart(),
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
    kopffit: true,
    bereich: 'natur',
    ab: 'kl34',
    bild: 'spiele/kantone.svg',
    farbe: '#F7DCDC',
    starte: (app) => app.kantone.zeigeStart(),
  },
  {
    id: 'geografie',
    kopffit: true,
    bereich: 'natur',
    ab: 'kl56',
    bild: 'spiele/geografie.svg',
    farbe: '#DDEFE6',
    starte: (app) => app.geografie.zeigeStart(),
  },
  {
    id: 'negativ',
    bereich: 'mathe',
    ab: 'gymi',
    bild: 'spiele/negativ.svg',
    farbe: '#DCE9F5',
    starte: (app) => app.negativ.zeigeStart(),
  },
  {
    id: 'gleichungen',
    bereich: 'mathe',
    ab: 'gymi',
    bild: 'spiele/gleichungen.svg',
    farbe: '#E6E3F5',
    starte: (app) => app.gleichungen.zeigeStart(),
  },
  {
    id: 'faelle',
    bereich: 'lesen',
    ab: 'gymi',
    bild: 'spiele/faelle.svg',
    farbe: '#F3E6D6',
    starte: (app) => app.faelle.zeigeStart(),
  },
  {
    id: 'bruchrechnen',
    bereich: 'mathe',
    ab: 'gymi',
    bild: 'spiele/bruchrechnen.svg',
    farbe: '#FBE0D0',
    starte: (app) => app.bruchrechnen.zeigeStart(),
  },
  {
    id: 'antike',
    bereich: 'natur',
    ab: 'gymi',
    bild: 'spiele/antike.svg',
    farbe: '#F1E4C8',
    starte: (app) => app.antike.zeigeStart(),
  },
  {
    id: 'wirbeltiere',
    bereich: 'natur',
    ab: 'gymi',
    bild: 'spiele/wirbeltiere.svg',
    farbe: '#E3EEDC',
    starte: (app) => app.wirbeltiere.zeigeStart(),
  },
  {
    id: 'einkauf',
    bereich: 'gedaechtnis',
    ab: 'kopffit',
    bild: 'spiele/einkauf.svg',
    farbe: '#EEF3E2',
    starte: (app) => app.einkauf.zeigeStart(),
  },
  {
    id: 'sprichwoerter',
    bereich: 'lesen',
    ab: 'kopffit',
    bild: 'spiele/sprichwoerter.svg',
    farbe: '#F2E8D5',
    starte: (app) => app.sprichwoerter.zeigeStart(),
  },
  {
    id: 'kalender',
    bereich: 'natur',
    ab: 'kopffit',
    bild: 'spiele/kalender.svg',
    farbe: '#E4EEE8',
    starte: (app) => app.kalender.zeigeStart(),
  },
  {
    id: 'nuenistei',
    kopffit: true,
    bereich: 'brett',
    ab: 'kl12',
    bild: 'spiele/nuenistei.svg',
    farbe: '#EAD7B7',
    starte: (app) => app.nuenistei.zeigeStart(),
  },
  {
    id: 'schiffe',
    kopffit: true,
    bereich: 'brett',
    ab: 'kl12',
    bild: 'spiele/schiffe.svg',
    farbe: '#D6ECF7',
    starte: (app) => app.schiffe.zeigeStart(),
  },
  {
    id: 'eilemitweile',
    kopffit: true,
    bereich: 'brett',
    ab: 'kg',
    bild: 'spiele/eilemitweile.svg',
    farbe: '#F6E3B4',
    starte: (app) => app.eilemitweile.zeigeStart(),
  },
];
