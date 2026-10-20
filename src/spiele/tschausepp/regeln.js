// Tschau Sepp mit französischen Jasskarten (36 Karten: 6 bis Ass, vier Farben).
// Regeln: Farbe oder Wert bedienen. 7 = der Nächste zieht 2 (mit einer 7 kontern: dann 4 …),
// 8 = der Nächste setzt aus, Bauer = auf alles, man wünscht eine Farbe.
// Wer mit der zweitletzten Karte nicht «Tschau!» sagt, zieht 2 Strafkarten.
// Karte: { farbe: 'herz' | 'ecke' | 'schaufel' | 'kreuz', wert: '6' … '10', 'B', 'D', 'K', 'A' }

export const FARBEN = ['herz', 'ecke', 'schaufel', 'kreuz'];
export const WERTE = ['6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];

function mischen(liste, zufall) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

export const kartenspiel = () => FARBEN.flatMap((farbe) => WERTE.map((wert) => ({ farbe, wert })));

export function neuesSpiel(anzahl, zufall = Math.random) {
  const stapel = mischen(kartenspiel(), zufall);
  const proSpieler = anzahl === 4 ? 6 : 7;
  const haende = Array.from({ length: anzahl }, () => stapel.splice(0, proSpieler));
  // Die erste aufgedeckte Karte ist keine Sonderkarte
  let i = stapel.findIndex((k) => !['7', '8', 'B'].includes(k.wert));
  const ablage = stapel.splice(i, 1);
  return { haende, stapel, ablage, amZug: 0, wunsch: null, strafe: 0, sieger: null };
}

export const oben = (z) => z.ablage.at(-1);

export function darfLegen(z, karte) {
  if (z.strafe > 0) return karte.wert === '7';
  if (karte.wert === 'B') return true;
  if (z.wunsch) return karte.farbe === z.wunsch;
  const o = oben(z);
  return karte.farbe === o.farbe || karte.wert === o.wert;
}

export const spielbar = (z, spieler) => z.haende[spieler].filter((k) => darfLegen(z, k));

function nachziehen(z) {
  if (!z.stapel.length) {
    // Ablage (ausser der obersten Karte) neu mischen
    const o = z.ablage.pop();
    z.stapel = mischen(z.ablage, Math.random);
    z.ablage = [o];
  }
  return z.stapel.pop() ?? null;
}

export function ziehe(z, spieler, n) {
  const neu = [];
  for (let i = 0; i < n; i++) {
    const k = nachziehen(z);
    if (!k) break;
    z.haende[spieler].push(k);
    neu.push(k);
  }
  return neu;
}

const naechster = (z, schritte = 1) => (z.amZug + schritte) % z.haende.length;

// Karte legen. tschau: hat der Spieler «Tschau!» gesagt? Gibt zurück, was passiert ist.
export function lege(z, karte, { wunsch = null, tschau = false } = {}) {
  const spieler = z.amZug;
  const hand = z.haende[spieler];
  hand.splice(hand.indexOf(karte), 1);
  z.ablage.push(karte);
  z.wunsch = karte.wert === 'B' ? wunsch : null;
  const ereignis = { karte, spieler, strafkarten: 0, aussetzen: null };
  if (karte.wert === '7') z.strafe += 2;
  if (!hand.length) {
    z.sieger = spieler;
    return ereignis;
  }
  // Nur noch eine Karte, aber nicht «Tschau!» gesagt: 2 Strafkarten
  if (hand.length === 1 && !tschau) ereignis.strafkarten = ziehe(z, spieler, 2).length;
  if (karte.wert === '8') {
    ereignis.aussetzen = naechster(z);
    z.amZug = naechster(z, 2);
  } else z.amZug = naechster(z);
  return ereignis;
}

// Wer nicht legen kann oder will: Strafe aufnehmen (nach 7ern) oder eine Karte ziehen.
// Gibt die gezogenen Karten zurück; nach einer Strafe ist der Nächste dran.
export function zieheStattLegen(z) {
  const spieler = z.amZug;
  if (z.strafe > 0) {
    const karten = ziehe(z, spieler, z.strafe);
    z.strafe = 0;
    z.amZug = naechster(z);
    return { karten, strafe: true };
  }
  return { karten: ziehe(z, spieler, 1), strafe: false };
}

// Nach dem Ziehen einer Karte, die nicht passt (oder nicht gelegt wird): weiter
export function passe(z) {
  z.amZug = naechster(z);
}

// ---------- Computerspieler ----------

// Die Farbe, von der man am meisten Karten hat (für den Wunsch beim Bauer)
export function lieblingsfarbe(hand) {
  const zaehl = Object.fromEntries(FARBEN.map((f) => [f, 0]));
  for (const k of hand) if (k.wert !== 'B') zaehl[k.farbe]++;
  return FARBEN.reduce((a, b) => (zaehl[b] > zaehl[a] ? b : a));
}

// Gibt { karte, wunsch } oder null (ziehen) zurück
export function computerWahl(z, stufe, zufall = Math.random) {
  const spieler = z.amZug;
  const hand = z.haende[spieler];
  const moeglich = spielbar(z, spieler);
  if (!moeglich.length) return null;
  let karte;
  if (stufe === 'gemuetlich') {
    karte = moeglich[Math.floor(zufall() * moeglich.length)];
  } else {
    const nachher = z.haende[naechster(z)].length;
    const ohneBauer = moeglich.filter((k) => k.wert !== 'B');
    const angriff = ohneBauer.filter((k) => k.wert === '7' || k.wert === '8');
    const farbe = lieblingsfarbe(hand);
    // Hat der Nächste nur noch wenige Karten: ärgern mit 7 oder 8.
    // Sonst: Karten der häufigsten Farbe zuerst, den Bauer für später aufheben.
    if (nachher <= 2 && angriff.length) karte = angriff[0];
    else if (ohneBauer.length) karte = ohneBauer.find((k) => k.farbe === farbe) ?? ohneBauer[0];
    else karte = moeglich[0];
  }
  const rest = hand.filter((k) => k !== karte);
  return { karte, wunsch: karte.wert === 'B' ? lieblingsfarbe(rest.length ? rest : hand) : null };
}
