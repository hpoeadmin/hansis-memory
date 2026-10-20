// Klassen und Schulstufen nach der Volksschule im Kanton Zürich (Lehrplan 21):
// 2 Jahre Kindergarten, Primarschule 1.–6. Klasse, danach Oberstufe.
// Das Schuljahr beginnt im August. Im Profil wird die Klasse zusammen mit dem
// Schuljahr gespeichert, in dem sie eingetragen wurde – so zählt die App jedes
// Jahr im August automatisch eine Klasse weiter.

export const KLASSEN = [
  { id: 'vorkg', n: -2 },
  { id: 'kg1', n: -1 },
  { id: 'kg2', n: 0 },
  { id: '1', n: 1 },
  { id: '2', n: 2 },
  { id: '3', n: 3 },
  { id: '4', n: 4 },
  { id: '5', n: 5 },
  { id: '6', n: 6 },
  { id: 'ober', n: 7 },
  { id: 'gymi', n: 7 }, // Langgymnasium – zählt nicht weiter, bleibt «Gymnasium»
  { id: 'erw', n: 99 },
];

// Kategorien für Spiele und Stufen (je zwei Schuljahre)
export const KATEGORIEN = ['vorkg', 'kg', 'kl12', 'kl34', 'kl56', 'gymi', 'erw'];

// Schuljahr als Jahreszahl seines Beginns: 19.10.2026 → 2026, 15.6.2027 → 2026
export function schuljahr(datum = new Date()) {
  return datum.getMonth() >= 7 ? datum.getFullYear() : datum.getFullYear() - 1;
}

// Die heutige Klasse eines Profils (oder null, wenn keine eingetragen ist)
export function aktuelleKlasse(profil, datum = new Date()) {
  const start = KLASSEN.findIndex((k) => k.id === profil?.klasse);
  if (start < 0) return null;
  const klasse = KLASSEN[start];
  if (klasse.id === 'erw' || klasse.id === 'gymi') return klasse;
  const jahre = Math.max(0, schuljahr(datum) - (profil.klasseSchuljahr ?? schuljahr(datum)));
  const oberstufe = KLASSEN.findIndex((k) => k.id === 'ober');
  return KLASSEN[Math.min(start + jahre, oberstufe)];
}

// Kategorie einer Klasse: das Gymnasium hat eine eigene, sonst zählt die Schulstufe
export function kategorieVonKlasse(klasse) {
  return klasse.id === 'gymi' ? 'gymi' : kategorieVon(klasse.n);
}

export function kategorieVon(n) {
  if (n <= -2) return 'vorkg';
  if (n <= 0) return 'kg';
  if (n <= 2) return 'kl12';
  if (n <= 4) return 'kl34';
  if (n < 99) return 'kl56';
  return 'erw';
}

// Welche Stufe eines Spiels passt zu diesen Spielern? tabelle: { kategorie: stufe }
// Bei mehreren Spielern gilt das jüngste Kind; Erwachsene und Profile ohne Klasse zählen nicht.
// Gibt { stufe, profil } zurück oder null (z.B. nur Erwachsene).
export function passendeStufe(profile, tabelle, datum = new Date()) {
  let juengstes = null;
  for (const profil of profile) {
    const klasse = aktuelleKlasse(profil, datum);
    if (!klasse || klasse.id === 'erw') continue;
    if (!juengstes || klasse.n < juengstes.klasse.n) juengstes = { profil, klasse };
  }
  if (!juengstes) return null;
  const stufe = tabelle[kategorieVonKlasse(juengstes.klasse)];
  return stufe ? { stufe, profil: juengstes.profil } : null;
}
