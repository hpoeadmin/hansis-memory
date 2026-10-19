// Spielregeln für Nüni Stei (Mühle) – ohne Bildschirmcode, damit sie getestet werden können.
//
// Die 24 Punkte liegen auf drei Ringen (0 = aussen, 2 = innen). Pro Ring gibt es
// 8 Punkte im Uhrzeigersinn, oben links beginnend; gerade = Ecke, ungerade = Mitte.
// Punkt-Nummer = Ring * 8 + Position.
//
// Regeln (wie bei Hanspeter):
// - Jede Seite hat 9 Steine. Weiss (0) beginnt.
// - Zuerst werden alle Steine gesetzt, danach entlang der Linien gezogen.
// - Drei eigene Steine in einer Linie = Mühle: dann darf man einen gegnerischen Stein
//   wegnehmen, aber keinen aus einer Mühle – ausser es gibt nur noch solche.
// - Wer nur noch 3 Steine hat, darf springen (auf jeden freien Punkt).
// - Verloren hat, wer weniger als 3 Steine hat oder nicht mehr ziehen kann.
// - Unentschieden nach 50 Zügen ohne Mühle (damit kein Spiel endlos dauert).

export const STEINE = 9;
export const REMIS_NACH = 50;

const POSITIONEN = [
  [0, 0], [3, 0], [6, 0], [6, 3], [6, 6], [3, 6], [0, 6], [0, 3],
];

// Koordinaten 0..6 für das Zeichnen
export const KOORDINATEN = Array.from({ length: 24 }, (_, p) => {
  const ring = Math.floor(p / 8);
  const [x, y] = POSITIONEN[p % 8];
  const umrechnen = (w) => ring + (w * (6 - 2 * ring)) / 6;
  return [umrechnen(x), umrechnen(y)];
});

export const NACHBARN = Array.from({ length: 24 }, (_, p) => {
  const ring = Math.floor(p / 8);
  const i = p % 8;
  const n = [ring * 8 + ((i + 1) % 8), ring * 8 + ((i + 7) % 8)];
  if (i % 2 === 1) {
    if (ring > 0) n.push(p - 8);
    if (ring < 2) n.push(p + 8);
  }
  return n;
});

export const MUEHLEN = [];
for (let ring = 0; ring < 3; ring++) {
  for (const k of [0, 2, 4, 6]) {
    MUEHLEN.push([ring * 8 + k, ring * 8 + k + 1, ring * 8 + ((k + 2) % 8)]);
  }
}
for (const i of [1, 3, 5, 7]) MUEHLEN.push([i, 8 + i, 16 + i]);

export function neuesSpiel() {
  return {
    brett: Array(24).fill(null),
    zuSetzen: [STEINE, STEINE],
    amZug: 0,
    wegnehmen: false,
    sieger: null, // 0, 1 oder 'remis'
    zuegeOhneMuehle: 0,
    letzteMuehle: null,
  };
}

export function anzahl(zustand, seite) {
  return zustand.brett.filter((s) => s === seite).length;
}

export function phase(zustand, seite = zustand.amZug) {
  if (zustand.zuSetzen[seite] > 0) return 'setzen';
  return anzahl(zustand, seite) === 3 ? 'springen' : 'ziehen';
}

export function muehleAn(brett, punkt) {
  const seite = brett[punkt];
  if (seite === null) return null;
  return MUEHLEN.find((m) => m.includes(punkt) && m.every((q) => brett[q] === seite)) ?? null;
}

export function wegnehmbare(zustand) {
  const gegner = 1 - zustand.amZug;
  const steine = [];
  zustand.brett.forEach((s, p) => s === gegner && steine.push(p));
  const frei = steine.filter((p) => !muehleAn(zustand.brett, p));
  return frei.length ? frei : steine;
}

export function zieleVon(zustand, von) {
  if (zustand.brett[von] !== zustand.amZug || zustand.wegnehmen) return [];
  const kandidaten =
    phase(zustand) === 'springen' ? zustand.brett.map((_, p) => p) : NACHBARN[von];
  return kandidaten.filter((p) => zustand.brett[p] === null);
}

export function zuege(zustand) {
  if (zustand.sieger !== null) return [];
  if (zustand.wegnehmen) return wegnehmbare(zustand).map((punkt) => ({ art: 'weg', punkt }));
  if (phase(zustand) === 'setzen') {
    const frei = [];
    zustand.brett.forEach((s, p) => s === null && frei.push({ art: 'setzen', nach: p }));
    return frei;
  }
  const liste = [];
  zustand.brett.forEach((s, von) => {
    if (s !== zustand.amZug) return;
    for (const nach of zieleVon(zustand, von)) liste.push({ art: 'ziehen', von, nach });
  });
  return liste;
}

function kopie(z) {
  return { ...z, brett: [...z.brett], zuSetzen: [...z.zuSetzen] };
}

function wechsle(z) {
  z.amZug = 1 - z.amZug;
  const seite = z.amZug;
  if (anzahl(z, seite) + z.zuSetzen[seite] < 3) z.sieger = 1 - seite;
  else if (z.zuSetzen[seite] === 0 && zuege(z).length === 0) z.sieger = 1 - seite;
  else if (z.zuegeOhneMuehle >= REMIS_NACH) z.sieger = 'remis';
}

// Führt einen Zug aus und gibt den neuen Zustand zurück (der alte bleibt unverändert).
export function fuehreAus(zustand, zug) {
  const z = kopie(zustand);
  const seite = z.amZug;

  if (zug.art === 'weg') {
    if (!z.wegnehmen || !wegnehmbare(zustand).includes(zug.punkt)) throw new Error('Ungültig');
    z.brett[zug.punkt] = null;
    z.wegnehmen = false;
    z.letzteMuehle = null;
    wechsle(z);
    return z;
  }

  if (z.wegnehmen) throw new Error('Zuerst einen Stein wegnehmen');
  if (zug.art === 'setzen') {
    if (phase(z) !== 'setzen' || z.brett[zug.nach] !== null) throw new Error('Ungültig');
    z.brett[zug.nach] = seite;
    z.zuSetzen[seite]--;
  } else {
    if (!zieleVon(z, zug.von).includes(zug.nach)) throw new Error('Ungültig');
    z.brett[zug.von] = null;
    z.brett[zug.nach] = seite;
  }

  const muehle = muehleAn(z.brett, zug.nach);
  if (muehle && anzahl(z, 1 - seite) > 0) {
    z.wegnehmen = true;
    z.letzteMuehle = muehle;
    z.zuegeOhneMuehle = 0;
    return z;
  }
  if (z.zuSetzen[0] === 0 && z.zuSetzen[1] === 0) z.zuegeOhneMuehle++;
  z.letzteMuehle = null;
  wechsle(z);
  return z;
}
