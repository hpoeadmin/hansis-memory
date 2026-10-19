// Spielerprofile: Name, Farbe, Tier-Avatar. Dazu Album und Bestleistungen.
import { speicher, sichere, neueId } from './speicher.js';
import { T } from './texte.js';

const BASIS = import.meta.env.BASE_URL;

// Kräftige, gut unterscheidbare Farben. Jede hat einen Namen,
// damit die Farbe nie die einzige Information ist.
export const FARBEN = [
  { id: 'rot', wert: '#D64545', text: '#FFFFFF' },
  { id: 'blau', wert: '#2F6FD0', text: '#FFFFFF' },
  { id: 'gruen', wert: '#2F8F46', text: '#FFFFFF' },
  { id: 'gelb', wert: '#F2C230', text: '#2E2A26' },
  { id: 'lila', wert: '#8A4FC7', text: '#FFFFFF' },
  { id: 'orange', wert: '#E8792B', text: '#2E2A26' },
];

export const GAST = {
  id: 'gast',
  name: T.profil.gast,
  farbe: 'blau',
  avatar: 'bauernhof/maus.svg',
  gast: true,
};

export function farbeVon(profil) {
  return FARBEN.find((f) => f.id === profil.farbe) ?? FARBEN[1];
}

export function farbStil(profil) {
  const f = farbeVon(profil);
  return `--spieler-farbe: ${f.wert}; --spieler-text: ${f.text};`;
}

export function avatarUrl(profil) {
  return `${BASIS}sets/${profil.avatar}`;
}

export function alleProfile() {
  return [...speicher.profile, GAST];
}

export function findeProfil(id) {
  return alleProfile().find((p) => p.id === id);
}

export function speichereProfil(profil) {
  if (profil.id) {
    const index = speicher.profile.findIndex((p) => p.id === profil.id);
    speicher.profile[index] = profil;
  } else {
    profil.id = neueId();
    speicher.profile.push(profil);
  }
  sichere();
  return profil;
}

export function loescheProfil(profil) {
  speicher.profile = speicher.profile.filter((p) => p.id !== profil.id);
  speicher.letzteSpieler = speicher.letzteSpieler.filter((id) => id !== profil.id);
  delete speicher.album[profil.id];
  delete speicher.bestleistungen[profil.id];
  sichere();
}

export function merkeLetzteSpieler(profile) {
  speicher.letzteSpieler = profile.map((p) => p.id);
  sichere();
}

// Gibt { neu, komplett } zurück: neu = Tier war noch nicht im Album,
// komplett = mit diesem Tier ist der Satz gerade vollständig geworden.
export function merkeGefunden(profil, set, tierId) {
  if (profil.gast) return { neu: false, komplett: false };
  const album = (speicher.album[profil.id] ??= {});
  const liste = (album[set.id] ??= []);
  if (liste.includes(tierId)) return { neu: false, komplett: false };
  liste.push(tierId);
  sichere();
  return { neu: true, komplett: liste.length === set.tiere.length };
}

export function albumVon(profil, setId) {
  return speicher.album[profil.id]?.[setId] ?? [];
}

// Gibt { neu, bisher } zurück. Weniger Züge sind besser.
export function merkeBestleistung(profil, stufe, zuege) {
  if (profil.gast) return { neu: false, bisher: null };
  const eintraege = (speicher.bestleistungen[profil.id] ??= {});
  const bisher = eintraege[stufe] ?? null;
  const neu = bisher === null || zuege < bisher;
  if (neu) {
    eintraege[stufe] = zuege;
    sichere();
  }
  return { neu, bisher };
}
