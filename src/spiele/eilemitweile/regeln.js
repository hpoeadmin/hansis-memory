// Spielregeln für Eile mit Weile – ohne Bildschirmcode, damit sie getestet werden können.
//
// Brett: 76 Felder im Uhrzeigersinn, 4 Arme mit je einer Farbe (0 = Rot oben, 1 = Grün rechts,
// 2 = Blau unten, 3 = Gelb links). Jede Farbe startet auf ihrem Start-Bänkli (Feld 19 × Arm)
// und biegt nach einer ganzen Runde in ihre Zielgasse mit 8 Feldern ab.
//
// Position einer Figur, gezählt ab dem eigenen Start-Bänkli:
//   -1      im Haus
//   0..75   auf dem Weg
//   76..83  in der Zielgasse
//
// Regeln (wie bei Hanspeter):
// - Herauskommen nur mit einer 6. Nach einer 6 darf man nochmals würfeln.
// - Auf einem Bänkli ist man sicher; landet man dort bei einer fremden Figur, teilen sich beide das Bänkli.
// - Zwei Figuren derselben Farbe auf einem Bänkli sind eine Sperre: andere Farben kommen nicht
//   vorbei und dürfen dort nicht landen. Die eigenen Figuren dürfen vorbei.
// - Landet man auf einem normalen Feld bei fremden Figuren, müssen diese zurück ins Haus.
// - Ins Ziel muss man genau würfeln (nicht über das Ende der Zielgasse hinaus).
// - Gewonnen hat, wer zuerst alle 4 Figuren in der Zielgasse hat.

export const FELDER = 76;
export const ZIELFELDER = 8;
export const FIGUREN = 4;
export const ABSTAND = 19; // Felder zwischen zwei Start-Bänkli
export const HAUS = -1;
export const ERSTES_ZIEL = FELDER; // 76
export const LETZTES_ZIEL = FELDER + ZIELFELDER - 1; // 83

// Bänkli: Start-Bänkli und je ein Bänkli auf den beiden Spalten jedes Arms
export const BAENKLI = new Set();
for (let arm = 0; arm < 4; arm++) {
  BAENKLI.add(arm * ABSTAND);
  BAENKLI.add(arm * ABSTAND + 5);
  BAENKLI.add(arm * ABSTAND + 14);
}

export function absolut(arm, position) {
  return (arm * ABSTAND + position) % FELDER;
}

export function neuesSpiel(arme, beginnt = arme[0]) {
  const figuren = {};
  for (const arm of arme) figuren[arm] = Array(FIGUREN).fill(HAUS);
  return { arme: [...arme], figuren, amZug: beginnt, wurf: null, sieger: null, letzterZug: null };
}

// Alle Figuren auf einem Feld des Wegs: [{ arm, figur }]
export function aufFeld(zustand, feld) {
  const liste = [];
  for (const arm of zustand.arme) {
    zustand.figuren[arm].forEach((pos, figur) => {
      if (pos >= 0 && pos < FELDER && absolut(arm, pos) === feld) liste.push({ arm, figur });
    });
  }
  return liste;
}

// Steht auf «feld» eine Sperre einer anderen Farbe als «arm»?
export function fremdeSperre(zustand, feld, arm) {
  if (!BAENKLI.has(feld)) return false;
  const anzahl = {};
  for (const f of aufFeld(zustand, feld)) if (f.arm !== arm) anzahl[f.arm] = (anzahl[f.arm] ?? 0) + 1;
  return Object.values(anzahl).some((n) => n >= 2);
}

// Wohin kann diese Figur mit diesem Wurf? null = gar nicht
export function zielVon(zustand, arm, figur, wurf = zustand.wurf) {
  const pos = zustand.figuren[arm][figur];
  if (pos === HAUS) {
    if (wurf !== 6 || fremdeSperre(zustand, absolut(arm, 0), arm)) return null;
    return 0;
  }
  const nach = pos + wurf;
  if (nach > LETZTES_ZIEL) return null;
  for (let schritt = pos + 1; schritt <= Math.min(nach, FELDER - 1); schritt++) {
    if (fremdeSperre(zustand, absolut(arm, schritt), arm)) return null;
  }
  if (nach >= ERSTES_ZIEL && zustand.figuren[arm].includes(nach)) return null;
  return nach;
}

export function zuege(zustand) {
  if (zustand.sieger !== null || zustand.wurf === null) return [];
  const arm = zustand.amZug;
  const liste = [];
  zustand.figuren[arm].forEach((von, figur) => {
    const nach = zielVon(zustand, arm, figur);
    if (nach === null) return;
    // Zwei Figuren im Haus machen denselben Zug – nur einmal anbieten
    if (von === HAUS && liste.some((z) => z.von === HAUS)) return;
    liste.push({ figur, von, nach });
  });
  return liste;
}

function kopie(z) {
  const figuren = {};
  for (const arm of z.arme) figuren[arm] = [...z.figuren[arm]];
  return { ...z, figuren };
}

function naechster(z, wurf) {
  z.wurf = null;
  if (wurf === 6) return; // nach einer 6 nochmals würfeln
  const i = z.arme.indexOf(z.amZug);
  z.amZug = z.arme[(i + 1) % z.arme.length];
}

export function wuerfle(zustand, augen) {
  if (zustand.wurf !== null || zustand.sieger !== null) throw new Error('Jetzt nicht würfeln');
  return { ...kopie(zustand), wurf: augen, letzterZug: null };
}

// Kein Zug möglich: weiter (nach einer 6 darf man trotzdem nochmals würfeln)
export function passe(zustand) {
  const z = kopie(zustand);
  naechster(z, zustand.wurf);
  z.letzterZug = null;
  return z;
}

export function fuehreAus(zustand, zug) {
  const arm = zustand.amZug;
  const erwartet = zielVon(zustand, arm, zug.figur);
  if (erwartet === null || erwartet !== zug.nach) throw new Error('Ungültiger Zug');
  const z = kopie(zustand);
  const von = z.figuren[arm][zug.figur];
  z.figuren[arm][zug.figur] = zug.nach;

  const geschlagen = [];
  if (zug.nach < FELDER) {
    const feld = absolut(arm, zug.nach);
    if (!BAENKLI.has(feld)) {
      for (const f of aufFeld(z, feld)) {
        if (f.arm === arm) continue;
        geschlagen.push({ ...f, von: z.figuren[f.arm][f.figur] });
        z.figuren[f.arm][f.figur] = HAUS;
      }
    }
  }
  z.letzterZug = { arm, figur: zug.figur, von, nach: zug.nach, geschlagen };

  if (z.figuren[arm].every((p) => p >= ERSTES_ZIEL)) {
    z.sieger = arm;
    z.wurf = null;
    return z;
  }
  naechster(z, zustand.wurf);
  return z;
}

export function imZiel(zustand, arm) {
  return zustand.figuren[arm].filter((p) => p >= ERSTES_ZIEL).length;
}

export function imHaus(zustand, arm) {
  return zustand.figuren[arm].filter((p) => p === HAUS).length;
}
