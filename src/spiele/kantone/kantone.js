// Die 26 Kantone mit Hauptort (Lehrplan 21, NMG 3./4. Klasse).
// Wappen in public/spiele/kantone/<kz>.svg (gezeichnet mit scripts/wappen.py).

export const KANTONE = [
  { kz: 'zh', name: 'Zürich', hauptort: 'Zürich' },
  { kz: 'be', name: 'Bern', hauptort: 'Bern' },
  { kz: 'lu', name: 'Luzern', hauptort: 'Luzern' },
  { kz: 'ur', name: 'Uri', hauptort: 'Altdorf' },
  { kz: 'sz', name: 'Schwyz', hauptort: 'Schwyz' },
  { kz: 'ow', name: 'Obwalden', hauptort: 'Sarnen' },
  { kz: 'nw', name: 'Nidwalden', hauptort: 'Stans' },
  { kz: 'gl', name: 'Glarus', hauptort: 'Glarus' },
  { kz: 'zg', name: 'Zug', hauptort: 'Zug' },
  { kz: 'fr', name: 'Freiburg', hauptort: 'Freiburg' },
  { kz: 'so', name: 'Solothurn', hauptort: 'Solothurn' },
  { kz: 'bs', name: 'Basel-Stadt', trennung: 'Basel-­Stadt', hauptort: 'Basel' },
  { kz: 'bl', name: 'Basel-Landschaft', trennung: 'Basel-­Land­schaft', hauptort: 'Liestal' },
  { kz: 'sh', name: 'Schaffhausen', trennung: 'Schaff­hausen', hauptort: 'Schaffhausen' },
  { kz: 'ar', name: 'Appenzell Ausserrhoden', trennung: 'Appenzell Ausser­rhoden', hauptort: 'Herisau' },
  { kz: 'ai', name: 'Appenzell Innerrhoden', trennung: 'Appenzell Inner­rhoden', hauptort: 'Appenzell' },
  { kz: 'sg', name: 'St. Gallen', hauptort: 'St. Gallen' },
  { kz: 'gr', name: 'Graubünden', trennung: 'Grau­bünden', hauptort: 'Chur' },
  { kz: 'ag', name: 'Aargau', hauptort: 'Aarau' },
  { kz: 'tg', name: 'Thurgau', hauptort: 'Frauenfeld' },
  { kz: 'ti', name: 'Tessin', hauptort: 'Bellinzona' },
  { kz: 'vd', name: 'Waadt', hauptort: 'Lausanne' },
  { kz: 'vs', name: 'Wallis', hauptort: 'Sitten' },
  { kz: 'ne', name: 'Neuenburg', trennung: 'Neuen­burg', hauptort: 'Neuenburg' },
  { kz: 'ge', name: 'Genf', hauptort: 'Genf' },
  { kz: 'ju', name: 'Jura', hauptort: 'Delsberg' },
];

// «Rund um Zürich»: Zürich, seine Nachbarn und Luzern
export const RUND_UM_ZUERICH = ['zh', 'ag', 'zg', 'sz', 'sg', 'tg', 'sh', 'lu'];

// Spielarten: welche Kantone, wie viele Paare (Memory-Stufe) und was zusammengehört
export const MODI = {
  nachbarn: { stufe: 'mittel', kantone: RUND_UM_ZUERICH, paar: 'wappen-name' },
  alle: { stufe: 'schwer', paar: 'wappen-name' },
  // Nur Kantone, deren Hauptort anders heisst – sonst wäre es zu leicht
  hauptorte: { stufe: 'mittel', paar: 'kanton-hauptort' },
};

export function kantoneFuer(modus) {
  const m = MODI[modus];
  if (m.kantone) return KANTONE.filter((k) => m.kantone.includes(k.kz));
  if (m.paar === 'kanton-hauptort') return KANTONE.filter((k) => k.hauptort !== k.name);
  return KANTONE;
}
