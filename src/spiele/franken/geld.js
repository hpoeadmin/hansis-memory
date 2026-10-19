// Rechnen mit Franken und Rappen – alle Beträge intern in Rappen (ganze Zahlen),
// damit keine Rundungsfehler entstehen. Kleinste Münze: 5 Rappen.

// Münzen und Noten des Spiels (Spielgeld, keine Nachbildung echter Münzen)
export const GELD = [
  { wert: 5, art: 'muenze' },
  { wert: 10, art: 'muenze' },
  { wert: 20, art: 'muenze' },
  { wert: 50, art: 'muenze' },
  { wert: 100, art: 'muenze' },
  { wert: 200, art: 'muenze' },
  { wert: 500, art: 'muenze' },
  { wert: 1000, art: 'note' },
  { wert: 2000, art: 'note' },
  { wert: 5000, art: 'note' },
];

// Stufen: welches Geld es gibt, welche Preise, ob der Betrag auf dem Teller angezeigt wird
export const STUFEN = {
  franken: { geld: [100, 200, 500, 1000, 2000], schritt: 100, min: 100, max: 2000, anzeige: true },
  rappen: { geld: [10, 20, 50, 100, 200, 500, 1000, 2000], schritt: 10, min: 50, max: 2000, anzeige: true },
  kopf: { geld: [5, 10, 20, 50, 100, 200, 500, 1000, 2000], schritt: 5, min: 50, max: 2000, anzeige: false },
  rueckgeld: { geld: [5, 10, 20, 50, 100, 200, 500, 1000], schritt: 5, min: 105, max: 4500, anzeige: false },
};

// «Fr. 7.50» bzw. «7.50» – Schweizer Schreibweise mit Punkt
export function betrag(rappen, mitFr = true) {
  const text = `${Math.floor(rappen / 100)}.${String(rappen % 100).padStart(2, '0')}`;
  return mitFr ? `Fr. ${text}` : text;
}

// Beschriftung einer Münze oder Note: «5 Rp.», «2 Fr.», «20 Fr.»
export function geldName(wert) {
  return wert < 100 ? `${wert} Rp.` : `${wert / 100} Fr.`;
}

// Zufälliger Preis im Raster der Stufe
export function preis(stufe, zufall = Math.random) {
  const { schritt, min, max } = STUFEN[stufe];
  const anzahl = Math.floor((max - min) / schritt) + 1;
  return min + Math.floor(zufall() * anzahl) * schritt;
}

// Für «Rückgeld»: die kleinste Note, die den Preis bezahlt (10, 20 oder 50 Fr.)
export function bezahltMit(preisRappen) {
  return [1000, 2000, 5000].find((note) => note > preisRappen);
}

// Eine Aufgabe: was auf den Teller muss (Preis oder Rückgeld)
export function aufgabe(stufe, zufall = Math.random) {
  const p = preis(stufe, zufall);
  if (stufe !== 'rueckgeld') return { preis: p, ziel: p };
  const note = bezahltMit(p);
  return { preis: p, note, ziel: note - p };
}

// Zerlegung mit möglichst wenig Münzen und Noten (für den Lösungsvorschlag)
export function zerlegung(rappen, erlaubt) {
  const werte = [...erlaubt].sort((a, b) => b - a);
  const liste = [];
  let rest = rappen;
  for (const w of werte) {
    while (rest >= w) {
      liste.push(w);
      rest -= w;
    }
  }
  return rest === 0 ? liste : null;
}

export function summe(liste) {
  return liste.reduce((a, b) => a + b, 0);
}
