// Wörter für das Spiel «Wortarten» (3./4. Klasse, Lehrplan 21: Nomen, Verb, Adjektiv).
// Nur eindeutige, kindgerechte Wörter; Schweizer Schreibweise (ss statt ß).
// probe: die Probe, mit der man die Wortart erkennt
//   Nomen    → mit Artikel («der Igel»)
//   Verb     → er/sie-Form («er rennt»)
//   Adjektiv → Steigerung («schnell – schneller»)

const NOMEN = [
  ['Hund', 'der'], ['Katze', 'die'], ['Pferd', 'das'], ['Vogel', 'der'], ['Baum', 'der'],
  ['Haus', 'das'], ['Schule', 'die'], ['Tisch', 'der'], ['Apfel', 'der'], ['Blume', 'die'],
  ['Sonne', 'die'], ['Mond', 'der'], ['Wald', 'der'], ['Berg', 'der'], ['See', 'der'],
  ['Brot', 'das'], ['Käse', 'der'], ['Ball', 'der'], ['Buch', 'das'], ['Stift', 'der'],
  ['Fenster', 'das'], ['Garten', 'der'], ['Freund', 'der'], ['Lehrerin', 'die'], ['Velo', 'das'],
  ['Znüni', 'das'], ['Kuh', 'die'], ['Schnee', 'der'], ['Zug', 'der'], ['Brücke', 'die'],
  ['Wolke', 'die'], ['Fisch', 'der'], ['Hase', 'der'], ['Igel', 'der'], ['Fuchs', 'der'],
  ['Tür', 'die'], ['Lampe', 'die'], ['Uhr', 'die'], ['Rucksack', 'der'], ['Schaf', 'das'],
].map(([wort, artikel]) => ({ wort, art: 'nomen', probe: `${artikel} ${wort}` }));

const VERBEN = [
  ['rennen', 'rennt'], ['springen', 'springt'], ['schwimmen', 'schwimmt'], ['lachen', 'lacht'],
  ['singen', 'singt'], ['lesen', 'liest'], ['schreiben', 'schreibt'], ['malen', 'malt'],
  ['essen', 'isst'], ['trinken', 'trinkt'], ['schlafen', 'schläft'], ['spielen', 'spielt'],
  ['bauen', 'baut'], ['fliegen', 'fliegt'], ['klettern', 'klettert'], ['hüpfen', 'hüpft'],
  ['rechnen', 'rechnet'], ['kochen', 'kocht'], ['tanzen', 'tanzt'], ['werfen', 'wirft'],
  ['fangen', 'fängt'], ['suchen', 'sucht'], ['finden', 'findet'], ['helfen', 'hilft'],
  ['lernen', 'lernt'], ['erzählen', 'erzählt'], ['wandern', 'wandert'], ['putzen', 'putzt'],
  ['weinen', 'weint'], ['rufen', 'ruft'], ['bellen', 'bellt'], ['wiehern', 'wiehert'],
  ['flüstern', 'flüstert'], ['träumen', 'träumt'], ['zeichnen', 'zeichnet'], ['turnen', 'turnt'],
  ['giessen', 'giesst'], ['denken', 'denkt'], ['grunzen', 'grunzt'], ['pfeifen', 'pfeift'],
].map(([wort, form]) => ({ wort, art: 'verb', probe: `er ${form}` }));

const ADJEKTIVE = [
  ['gross', 'grösser'], ['klein', 'kleiner'], ['schnell', 'schneller'], ['langsam', 'langsamer'],
  ['laut', 'lauter'], ['leise', 'leiser'], ['warm', 'wärmer'], ['kalt', 'kälter'],
  ['hell', 'heller'], ['dunkel', 'dunkler'], ['schön', 'schöner'], ['lustig', 'lustiger'],
  ['traurig', 'trauriger'], ['müde', 'müder'], ['stark', 'stärker'], ['schwach', 'schwächer'],
  ['hoch', 'höher'], ['tief', 'tiefer'], ['lang', 'länger'], ['kurz', 'kürzer'],
  ['alt', 'älter'], ['jung', 'jünger'], ['neu', 'neuer'], ['weich', 'weicher'],
  ['hart', 'härter'], ['nass', 'nasser'], ['trocken', 'trockener'], ['süss', 'süsser'],
  ['sauer', 'saurer'], ['rund', 'runder'], ['mutig', 'mutiger'], ['freundlich', 'freundlicher'],
  ['fleissig', 'fleissiger'], ['schwer', 'schwerer'], ['dick', 'dicker'], ['dünn', 'dünner'],
  ['heiss', 'heisser'], ['frisch', 'frischer'], ['bunt', 'bunter'], ['wild', 'wilder'],
].map(([wort, mehr]) => ({ wort, art: 'adjektiv', probe: `${wort} – ${mehr}` }));

export const WOERTER = { nomen: NOMEN, verb: VERBEN, adjektiv: ADJEKTIVE };

// Stufen: welche Wortarten vorkommen und ob die Grossschreibung verraten wird
export const STUFEN = {
  zwei: { arten: ['nomen', 'verb'], grossbuchstaben: false },
  drei: { arten: ['nomen', 'verb', 'adjektiv'], grossbuchstaben: false },
  profi: { arten: ['nomen', 'verb', 'adjektiv'], grossbuchstaben: true },
};

// Eine Runde: gleich viele Wörter jeder Art, gemischt, kein Wort doppelt
export function runde(stufe, anzahl, mischen) {
  const { arten } = STUFEN[stufe];
  const proArt = Math.ceil(anzahl / arten.length);
  const liste = arten.flatMap((art) => mischen(WOERTER[art]).slice(0, proArt));
  return mischen(liste).slice(0, anzahl);
}
