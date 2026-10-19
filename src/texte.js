// Alle Texte der App an einem Ort (Schweizer Schreibweise: «ss» statt «ß»).

export const T = {
  appName: 'Hansi’s Memory',

  start: {
    titel: 'Hansi’s Memory',
    frage: 'Welche Tiere möchtest du?',
    kommtBald: 'kommt bald',
  },

  stufe: {
    frage: 'Wie viele Karten?',
    leicht: 'Leicht',
    mittel: 'Mittel',
    schwer: 'Schwer',
    paare: (n) => `${n} Paare`,
  },

  spiel: {
    zuege: 'Züge',
    paare: 'Paare',
    vonGesamt: (gefunden, gesamt) => `${gefunden} von ${gesamt}`,
    beenden: 'Beenden',
    beendenFrage: 'Möchtest du das Spiel wirklich beenden?',
    beendenJa: 'Ja, beenden',
    beendenNein: 'Nein, weiterspielen',
    karteVerdeckt: 'Verdeckte Karte',
  },

  ende: {
    lob: ['Super gemacht!', 'Toll gemerkt!', 'Wunderbar!', 'Bravo!', 'Grossartig!'],
    zusammenfassung: (paare, zuege) =>
      `Du hast alle ${paare} Paare in ${zuege} Zügen gefunden.`,
    sterne: (n) => (n === 1 ? '1 Stern' : `${n} Sterne`),
    nochmals: 'Nochmals spielen',
    anderesSpiel: 'Anderes Spiel wählen',
  },

  allgemein: {
    zurueck: 'Zurück',
    laden: 'Einen Moment …',
    ladeFehler: 'Die Karten konnten nicht geladen werden.',
  },
};
