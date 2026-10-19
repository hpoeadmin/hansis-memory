// Alle Texte der App an einem Ort (Schweizer Schreibweise: «ss» statt «ß»).

export const T = {
  appName: 'Hansis Spielplatz',

  hauptmenue: {
    titel: 'Hansis Spielplatz',
    frage: 'Was möchtest du spielen?',
    kommtBald: 'kommt bald',
    zurueck: 'Spiele',
  },

  spiele: {
    memory: 'Memory',
    nuenistei: 'Nüni Stei',
    eilemitweile: 'Eile mit Weile',
  },

  start: {
    titel: 'Memory',
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
    hinweis: (max) =>
      max === 1 ? 'Tippe an, wer spielt.' : `Tippe auf alle, die mitspielen (bis zu ${max}).`,
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
    tippenZumUmdrehen: 'Tippe, um die Karten umzudrehen.',
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
    neuImAlbum: (namen) => `Neu im Album: ${namen}`,
    neuesAbzeichen: (name, setName) => `Neues Abzeichen für ${name}: ${setName} komplett!`,
    nochmals: 'Nochmals spielen',
    anderesSpiel: 'Anderes Spiel wählen',
  },

  album: {
    knopf: 'Album',
    titel: 'Album',
    wessen: (name) => `Album von ${name}`,
    keineSpieler: 'Lege zuerst einen Spieler an. Dann sammelt das Album alle Tiere, die gefunden werden.',
    anzahl: (n, gesamt) => `${n} von ${gesamt} Tieren`,
    nochNicht: 'Noch nicht gefunden',
    abzeichen: 'Abzeichen',
    abzeichenText: (setName) => `${setName} komplett!`,
    keineAbzeichen: 'Sammle alle 12 Tiere eines Satzes, dann bekommst du ein Abzeichen.',
    schliessen: 'Schliessen',
  },

  schloss: {
    knopf: 'Für Eltern',
    halten: 'Zum Öffnen 3 Sekunden gedrückt halten.',
  },

  einstellungen: {
    titel: 'Einstellungen',
    gruppeAllgemein: 'Für alle Spiele',
    gruppeSpieler: 'Spieler',
    ton: 'Ton',
    vorlesen: 'Tiernamen vorlesen',
    vorlesenFehlt: 'Dieses Gerät kann leider nicht vorlesen.',
    vorlesenProbe: 'Vorlesen ist eingeschaltet.',
    ein: 'Ein',
    aus: 'Aus',
    ja: 'Ja',
    nein: 'Nein',
    dauer: 'Nicht passende Karten bleiben offen',
    dauerNormal: 'Normal',
    dauerLangsam: 'Langsam',
    dauerSehrLangsam: 'Sehr langsam',
    dauerTippen: 'Bis man tippt',
    rueckseite: 'Kartenrückseite',
    rueckseiten: {
      blau: 'Blau mit Punkten',
      gruen: 'Grün mit Streifen',
      orange: 'Orange mit Karos',
    },
    namen: 'Tiernamen auf den Karten',
    spieler: 'Spieler',
    keineSpieler: 'Noch keine Spieler angelegt.',
    aendern: 'Ändern',
    loeschen: 'Löschen',
    loeschenFrage: (name) => `Spieler «${name}» mit Album und Bestleistungen löschen?`,
    loeschenJa: 'Ja, löschen',
    loeschenNein: 'Nein, behalten',
    neuerSpieler: 'Neuer Spieler',
    fertig: 'Fertig',
  },

  update: {
    titel: 'Neue Version verfügbar',
    tippen: 'Tippen zum Aktualisieren',
  },

  allgemein: {
    zurueck: 'Zurück',
    laden: 'Einen Moment …',
    ladeFehler: 'Die Karten konnten nicht geladen werden.',
  },
};
