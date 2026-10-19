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
  const { text, faktor } = namenGroesse(tier, 0.15, 0.11, 1.45);
  return el('span', { class: 'tier-name-text', style: `--namen-faktor: ${faktor.toFixed(3)}` }, text);
}

// Passt der Name einzeilig noch gross genug hin, bleibt er auf einer Zeile;
// sonst wird an der «trennung» (weicher Trennstrich) auf zwei Zeilen umgebrochen.
export function namenGroesse(tier, einzeilig, zweizeilig, breite) {
  const eineZeile = Math.min(einzeilig, breite / tier.name.length);
  if (!tier.trennung || eineZeile >= zweizeilig * 1.1) return { text: tier.name, faktor: eineZeile };
  const laengstes = Math.max(...tier.trennung.split('\u00AD').map((t) => t.length));
  return { text: tier.trennung, faktor: Math.min(zweizeilig, breite / laengstes) };
}

export const STUFEN = {
  leicht: { paare: 6 },
  mittel: { paare: 8 },
  schwer: { paare: 12 },
};
