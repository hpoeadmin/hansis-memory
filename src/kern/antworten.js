// Hilfen für Frage-Spiele mit Zahlen: Zufall, Mischen und vier Antworten.

export function zahl(min, max, zufall = Math.random) {
  return min + Math.floor(zufall() * (max - min + 1));
}

export function waehle(liste, zufall = Math.random) {
  return liste[Math.floor(zufall() * liste.length)];
}

export function mischen(liste, zufall = Math.random) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

// Vier Zahlen-Antworten: die richtige und drei aus den Kandidaten (typische Fehler),
// notfalls Nachbarzahlen. Nur Zahlen von min bis max.
export function vierAntworten(richtig, kandidaten, zufall = Math.random, { min = 0, max: grenze = Infinity } = {}) {
  let max = grenze;
  const falsch = [];
  const passt = (k) => Number.isInteger(k) && k >= min && k <= max && k !== richtig && !falsch.includes(k);
  for (const k of mischen(kandidaten, zufall)) {
    if (passt(k)) falsch.push(k);
    if (falsch.length === 3) break;
  }
  // Notfalls Nachbarzahlen; reicht der Zahlenraum nicht, darf es auch etwas darüber sein
  for (let d = 1; falsch.length < 3 && d < 1000; d++) {
    for (const k of [richtig + d, richtig - d]) if (falsch.length < 3 && passt(k)) falsch.push(k);
    if (d === 50) max = Infinity;
  }
  return mischen([richtig, ...falsch], zufall).map((wert) => ({ wert, text: String(wert), richtig: wert === richtig }));
}

// Eine Runde ohne doppelte Aufgaben
export function ohneDoppelte(erzeuge, schluessel, anzahl) {
  const liste = [];
  const gesehen = new Set();
  for (let versuch = 0; liste.length < anzahl && versuch < anzahl * 60; versuch++) {
    const x = erzeuge();
    const s = schluessel(x);
    if (gesehen.has(s)) continue;
    gesehen.add(s);
    liste.push(x);
  }
  return liste;
}
