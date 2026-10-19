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

  spieler: {
    frage: 'Wer spielt mit?',
    hinweis: 'Tippe auf alle, die mitspielen (bis zu 4).',
    neu: 'Neuer Spieler',
    los: 'Los geht’s!',
  },

  profil: {
    titelNeu: 'Neuer Spieler',
    titelAendern: 'Spieler ändern',
    name: 'Name',
    namePlatzhalter: 'z.B. Lena',
    farbe: 'Lieblingsfarbe',
    tier: 'Lieblingstier',
    speichern: 'Speichern',
    abbrechen: 'Abbrechen',
    nameFehlt: 'Bitte einen Namen eintragen.',
    gast: 'Gast',
    farben: {
      rot: 'Rot',
      blau: 'Blau',
      gruen: 'Grün',
      gelb: 'Gelb',
      lila: 'Lila',
      orange: 'Orange',
    },
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
    istDran: 'ist dran',
    nochmals: 'darf nochmals!',
    punkte: (n) => (n === 1 ? '1 Paar' : `${n} Paare`),
  },

  ende: {
    lob: ['Super gemacht!', 'Toll gemerkt!', 'Wunderbar!', 'Bravo!', 'Grossartig!'],
    zusammenfassung: (paare, zuege) =>
      `Du hast alle ${paare} Paare in ${zuege} Zügen gefunden.`,
    sterne: (n) => (n === 1 ? '1 Stern' : `${n} Sterne`),
    lobPersoenlich: (name) => `Super gemacht, ${name}!`,
    neueBestleistung: 'Neue Bestleistung!',
    bestleistung: (zuege) => `Deine Bestleistung: ${zuege} Züge`,
    alleTitel: 'Toll gespielt, alle zusammen!',
    alleText: 'Ihr habt gemeinsam alle Paare gefunden.',
    spielerPaare: (n) => (n === 1 ? '1 Paar' : `${n} Paare`),
    meistePaare: 'Meiste Paare',
    lobSpieler: ['Gut aufgepasst!', 'Toll gemerkt!', 'Prima gespielt!', 'Wunderbar!'],
    nochmals: 'Nochmals spielen',
    anderesSpiel: 'Anderes Spiel wählen',
  },

  allgemein: {
    zurueck: 'Zurück',
    laden: 'Einen Moment …',
    ladeFehler: 'Die Karten konnten nicht geladen werden.',
  },
};
