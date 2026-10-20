// Kalender und Fahrplan (KopfFit): Wochentage, Kalenderblatt, den richtigen Zug wählen.
import { zahl, waehle, mischen, ohneDoppelte } from '../../kern/antworten.js';

export const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const STUFEN = {
  wochentage: { art: 'wochentag' }, // Heute ist Dienstag – welcher Tag ist übermorgen?
  kalender: { art: 'kalender' }, // Auf welchen Wochentag fällt der 14.?
  fahrplan: { art: 'fahrplan' }, // Welchen Zug nehme ich?
};

// Wochentag 0 = Montag
export const wochentag = (jahr, monat, tag) => (new Date(jahr, monat, tag).getDay() + 6) % 7;
export const tageImMonat = (jahr, monat) => new Date(jahr, monat + 1, 0).getDate();

// «übermorgen», «in 3 Tagen», «gestern» …
const SCHRITTE = [
  [1, 'morgen'], [2, 'übermorgen'], [3, 'in 3 Tagen'], [4, 'in 4 Tagen'], [7, 'in einer Woche'],
  [-1, 'gestern'], [-2, 'vorgestern'], [-3, 'vor 3 Tagen'],
];

function wochentagAufgabe(zufall) {
  const heute = zahl(0, 6, zufall);
  const [schritt, wann] = waehle(SCHRITTE, zufall);
  const ergebnis = (((heute + schritt) % 7) + 7) % 7;
  // Typische Fehler: einen Tag daneben, in die falsche Richtung gezählt
  const kandidaten = [ergebnis + 1, ergebnis - 1, heute - schritt, heute].map((t) => ((t % 7) + 7) % 7);
  const optionen = [ergebnis];
  for (const k of [...mischen(kandidaten, zufall), ...mischen([0, 1, 2, 3, 4, 5, 6], zufall)]) {
    if (optionen.length === 4) break;
    if (!optionen.includes(k)) optionen.push(k);
  }
  return { art: 'wochentag', heute, wann, schritt, ergebnis, optionen: mischen(optionen, zufall) };
}

function kalenderAufgabe(zufall) {
  const jahr = waehle([2026, 2027], zufall);
  const monat = zahl(0, 11, zufall);
  const frage = waehle(['wochentag', 'ersterSonntag', 'tage'], zufall);
  if (frage === 'wochentag') {
    const tag = zahl(2, tageImMonat(jahr, monat) - 1, zufall);
    const ergebnis = wochentag(jahr, monat, tag);
    const optionen = mischen([ergebnis, (ergebnis + 1) % 7, (ergebnis + 6) % 7, (ergebnis + 3) % 7], zufall);
    return { art: 'kalender', frage, jahr, monat, tag, ergebnis, optionen };
  }
  if (frage === 'ersterSonntag') {
    const ersterTag = wochentag(jahr, monat, 1);
    const ergebnis = 1 + ((6 - ersterTag + 7) % 7);
    const optionen = mischen([ergebnis, ergebnis + 7, ergebnis + 1, ergebnis === 1 ? 3 : ergebnis - 1], zufall);
    return { art: 'kalender', frage, jahr, monat, ergebnis, optionen };
  }
  const ergebnis = tageImMonat(jahr, monat);
  const optionen = mischen([28, 29, 30, 31].filter((t) => t !== ergebnis).slice(0, 2).concat(ergebnis), zufall);
  return { art: 'kalender', frage, jahr, monat, ergebnis, optionen };
}

// Fahrplan: Züge im Halbstundentakt; gesucht ist der letzte Zug, der rechtzeitig ankommt
const STRECKEN = [
  ['Zürich HB', 'Bern', 56, 2], ['Zürich HB', 'Luzern', 41, 10], ['Winterthur', 'Zürich HB', 22, 4],
  ['Zürich HB', 'Basel SBB', 53, 7], ['Zürich HB', 'St. Gallen', 64, 9], ['Zofingen', 'Olten', 9, 1],
];

export const zeit = (minuten) => `${Math.floor(minuten / 60)}:${String(minuten % 60).padStart(2, '0')}`;

function fahrplanAufgabe(zufall) {
  const [von, nach, dauer, minute] = waehle(STRECKEN, zufall);
  const stunde = zahl(8, 16, zufall);
  const abfahrten = [0, 30, 60, 90].map((m) => stunde * 60 + minute + m);
  const zuege = abfahrten.map((ab) => ({ ab, an: ab + dauer }));
  // Termin zwischen der 2. und 4. Ankunft, auf eine Viertelstunde gerundet
  const termin = Math.ceil((zuege[1].an + zahl(1, 50, zufall)) / 15) * 15;
  const passend = zuege.filter((z) => z.an <= termin);
  if (!passend.length || passend.length === zuege.length) return fahrplanAufgabe(zufall);
  const ergebnis = passend.at(-1);
  return { art: 'fahrplan', von, nach, zuege, termin, ergebnis };
}

export function aufgabe(stufe, zufall = Math.random) {
  const art = STUFEN[stufe].art;
  if (art === 'wochentag') return wochentagAufgabe(zufall);
  if (art === 'kalender') return kalenderAufgabe(zufall);
  return fahrplanAufgabe(zufall);
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(
    () => aufgabe(stufe, zufall),
    (x) => (x.art === 'wochentag' ? `${x.heute}${x.schritt}` : x.art === 'kalender' ? `${x.frage}${x.jahr}${x.monat}${x.tag ?? ''}` : `${x.von}${x.termin}`),
    anzahl,
  );
}
