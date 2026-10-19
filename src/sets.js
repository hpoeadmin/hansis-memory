// Lädt die Kartensätze aus public/sets/index.json (erzeugt von scripts/sets-index.mjs).

const BASIS = import.meta.env.BASE_URL;

export async function ladeSets() {
  const antwort = await fetch(`${BASIS}sets/index.json`);
  if (!antwort.ok) throw new Error(`index.json: ${antwort.status}`);
  return antwort.json();
}

export function bildUrl(set, datei) {
  return `${BASIS}sets/${set.ordner}/${datei}`;
}

export const STUFEN = {
  leicht: { paare: 6 },
  mittel: { paare: 8 },
  schwer: { paare: 12 },
};
