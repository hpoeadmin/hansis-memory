import { el } from '../../kern/ui.js';

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

// Tiername für die Anzeige. Lange Namen werden kleiner geschrieben; ein
// «trennung»-Eintrag in set.json (mit weichem Trennstrich \u00AD) erlaubt zwei Zeilen.
// --namen-faktor = Schriftgrösse im Verhältnis zur Kartenbreite.
export function tierName(tier) {
  const text = tier.trennung ?? tier.name;
  const teile = text.split('\u00AD');
  const laengstes = Math.max(...teile.map((t) => t.length));
  const hoechstens = teile.length > 1 ? 0.11 : 0.15;
  const faktor = Math.min(hoechstens, 1.45 / laengstes);
  return el('span', { class: 'tier-name-text', style: `--namen-faktor: ${faktor.toFixed(3)}` }, text);
}

export const STUFEN = {
  leicht: { paare: 6 },
  mittel: { paare: 8 },
  schwer: { paare: 12 },
};
