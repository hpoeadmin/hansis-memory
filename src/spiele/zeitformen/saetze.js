// Zeitformen (5./6. Klasse, Lehrplan 21): Präsens, Präteritum, Perfekt, Plusquamperfekt, Futur.
// Jeder Satz: Subjekt (3. Person Einzahl), Verbformen, Hilfsverb im Perfekt und der Rest des Satzes.
// Keine trennbaren Verben (wie «einkaufen»), damit die Satzstellung immer gleich bleibt.
import { waehle, mischen, ohneDoppelte } from '../../kern/antworten.js';

// [Subjekt, Infinitiv, Präsens, Präteritum, Partizip, Hilfsverb, Rest]
const SAETZE = [
  ['Lena', 'gehen', 'geht', 'ging', 'gegangen', 'sein', 'ins Schwimmbad'],
  ['Tim', 'spielen', 'spielt', 'spielte', 'gespielt', 'haben', 'Fussball im Garten'],
  ['Die Katze', 'schlafen', 'schläft', 'schlief', 'geschlafen', 'haben', 'auf dem Sofa'],
  ['Der Zug', 'fahren', 'fährt', 'fuhr', 'gefahren', 'sein', 'nach Bern'],
  ['Mia', 'lesen', 'liest', 'las', 'gelesen', 'haben', 'ein spannendes Buch'],
  ['Opa', 'kochen', 'kocht', 'kochte', 'gekocht', 'haben', 'eine feine Suppe'],
  ['Der Vogel', 'fliegen', 'fliegt', 'flog', 'geflogen', 'sein', 'über den See'],
  ['Noah', 'schreiben', 'schreibt', 'schrieb', 'geschrieben', 'haben', 'einen Brief an Grosi'],
  ['Die Lehrerin', 'erzählen', 'erzählt', 'erzählte', 'erzählt', 'haben', 'eine Geschichte'],
  ['Das Kind', 'rennen', 'rennt', 'rannte', 'gerannt', 'sein', 'über die Wiese'],
  ['Papa', 'backen', 'backt', 'backte', 'gebacken', 'haben', 'einen Zopf'],
  ['Die Sonne', 'scheinen', 'scheint', 'schien', 'geschienen', 'haben', 'den ganzen Tag'],
  ['Elena', 'singen', 'singt', 'sang', 'gesungen', 'haben', 'im Chor'],
  ['Der Hund', 'bellen', 'bellt', 'bellte', 'gebellt', 'haben', 'laut am Zaun'],
  ['Luca', 'schwimmen', 'schwimmt', 'schwamm', 'geschwommen', 'sein', 'durch den Fluss'],
  ['Die Familie', 'wandern', 'wandert', 'wanderte', 'gewandert', 'sein', 'auf den Uetliberg'],
  ['Sara', 'malen', 'malt', 'malte', 'gemalt', 'haben', 'ein buntes Bild'],
  ['Der Bauer', 'füttern', 'füttert', 'fütterte', 'gefüttert', 'haben', 'die Kühe'],
  ['Grosi', 'trinken', 'trinkt', 'trank', 'getrunken', 'haben', 'einen Tee'],
  ['Der Ball', 'rollen', 'rollt', 'rollte', 'gerollt', 'sein', 'unter das Auto'],
  ['Jonas', 'finden', 'findet', 'fand', 'gefunden', 'haben', 'einen alten Schlüssel'],
  ['Die Klasse', 'besuchen', 'besucht', 'besuchte', 'besucht', 'haben', 'das Museum'],
  ['Ein Schiff', 'kommen', 'kommt', 'kam', 'gekommen', 'sein', 'in den Hafen'],
  ['Anna', 'essen', 'isst', 'ass', 'gegessen', 'haben', 'eine Bratwurst'],
  ['Der Schnee', 'fallen', 'fällt', 'fiel', 'gefallen', 'sein', 'auf die Dächer'],
  ['Ben', 'bauen', 'baut', 'baute', 'gebaut', 'haben', 'eine Hütte im Wald'],
  ['Die Ente', 'fressen', 'frisst', 'frass', 'gefressen', 'haben', 'die Brotkrumen'],
  ['Mama', 'arbeiten', 'arbeitet', 'arbeitete', 'gearbeitet', 'haben', 'im Spital'],
  ['Leo', 'springen', 'springt', 'sprang', 'gesprungen', 'sein', 'ins kalte Wasser'],
  ['Die Kinder', 'lachen', 'lacht', 'lachte', 'gelacht', 'haben', 'über den Witz'],
].map(([subjekt, infinitiv, praesens, praeteritum, partizip, hilfsverb, rest]) => ({
  subjekt, infinitiv, praesens, praeteritum, partizip, hilfsverb, rest,
}));

// «Die Kinder» ist Mehrzahl – dafür gibt es eigene Formen
const MEHRZAHL = { 'Die Kinder': { praesens: 'lachen', praeteritum: 'lachten' } };

export const ZEITFORMEN = ['praesens', 'praeteritum', 'perfekt', 'plusquamperfekt', 'futur'];

const HILFS = {
  sein: { praesens: 'ist', praeteritum: 'war', mehrPraesens: 'sind', mehrPraeteritum: 'waren' },
  haben: { praesens: 'hat', praeteritum: 'hatte', mehrPraesens: 'haben', mehrPraeteritum: 'hatten' },
};

// Den Satz in einer Zeitform bilden (hilfsverb lässt sich für Fehler-Antworten vertauschen)
export function satz(s, zeitform, hilfsverb = s.hilfsverb) {
  const mehr = Boolean(MEHRZAHL[s.subjekt]);
  const h = HILFS[hilfsverb];
  const teile = {
    praesens: [mehr ? MEHRZAHL[s.subjekt].praesens : s.praesens, s.rest],
    praeteritum: [mehr ? MEHRZAHL[s.subjekt].praeteritum : s.praeteritum, s.rest],
    perfekt: [mehr ? h.mehrPraesens : h.praesens, s.rest, s.partizip],
    plusquamperfekt: [mehr ? h.mehrPraeteritum : h.praeteritum, s.rest, s.partizip],
    futur: [mehr ? 'werden' : 'wird', s.rest, s.infinitiv],
  }[zeitform];
  return `${s.subjekt} ${teile.join(' ')}.`;
}

export const STUFEN = {
  drei: { formen: ['praesens', 'praeteritum', 'perfekt'] },
  alle: { formen: ZEITFORMEN },
  bilden: { formen: ['praeteritum', 'perfekt', 'futur'], bilden: true },
  profi: { formen: ['praeteritum', 'perfekt', 'plusquamperfekt', 'futur'], bilden: true },
};

export function aufgabe(stufe, zufall = Math.random) {
  const st = STUFEN[stufe];
  const s = waehle(SAETZE, zufall);
  if (!st.bilden) {
    const zeitform = waehle(st.formen, zufall);
    return { art: 'erkennen', s, zeitform, text: satz(s, zeitform), formen: st.formen };
  }
  // Satz im Präsens gegeben, gesucht ist eine andere Zeitform
  const ziel = waehle(st.formen, zufall);
  const anderes = s.hilfsverb === 'sein' ? 'haben' : 'sein';
  const kandidaten = [
    satz(s, ziel),
    ...(ziel === 'perfekt' || ziel === 'plusquamperfekt' ? [satz(s, ziel, anderes)] : []),
    ...ZEITFORMEN.filter((z) => z !== ziel && z !== 'praesens').map((z) => satz(s, z)),
  ];
  const antworten = [...new Set(kandidaten)].slice(0, 4);
  return {
    art: 'bilden',
    s,
    zeitform: ziel,
    gegeben: satz(s, 'praesens'),
    antworten: mischen(antworten, zufall).map((text) => ({ text, richtig: text === satz(s, ziel) })),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${x.s.subjekt}${x.zeitform}`, anzahl);
}
