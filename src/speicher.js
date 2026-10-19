// Spielstand, Profile und Einstellungen im localStorage dieses Geräts.

const SCHLUESSEL = 'hansis-memory';

const STANDARD = {
  version: 1,
  profile: [],
  letzteSpieler: [],
  einstellungen: {
    aufdeckDauer: 'normal', // normal | langsam | sehr-langsam | tippen
    ton: true,
    vorlesen: false,
    rueckseite: 'blau', // blau | gruen | orange
    namen: true, // Tiernamen auf den Karten
  },
  bestleistungen: {}, // { profilId: { leicht: zuege, ... } }
  album: {}, // { profilId: { setId: [tierId, ...] } }
};

function lade() {
  const daten = structuredClone(STANDARD);
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (roh) {
      const gelesen = JSON.parse(roh);
      Object.assign(daten, gelesen);
      // Neue Einstellungen bekommen ihren Standardwert
      daten.einstellungen = { ...STANDARD.einstellungen, ...gelesen.einstellungen };
    }
  } catch (fehler) {
    console.warn('Spielstand konnte nicht gelesen werden', fehler);
  }
  return daten;
}

export const speicher = lade();

export function sichere() {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(speicher));
  } catch (fehler) {
    console.warn('Spielstand konnte nicht gespeichert werden', fehler);
  }
}

export function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
