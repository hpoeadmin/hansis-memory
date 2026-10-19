// Aufgaben für den «Einmaleins-Meister» (Lehrplan 21, 3./4. Klasse).
// Jede Aufgabe: { art, a, b, op: '×' | ':', ergebnis, rest?, kern: { a, b }, antworten }
// art: 'mal' | 'teilen' | 'zehner-mal' | 'zehner-teilen' | 'rest'; kern = die Einmaleins-Aufgabe dahinter

export const STUFEN = {
  // 2./3. Klasse: die leichten Reihen
  reihen: { reihen: [2, 5, 10] },
  // 3. Klasse: das ganze kleine Einmaleins
  alle: { reihen: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  // 4. Klasse: Umkehraufgaben (Teilen)
  teilen: { reihen: [2, 3, 4, 5, 6, 7, 8, 9, 10], teilen: true },
  // 4. Klasse: Zehnereinmaleins und Teilen mit Rest
  profi: { reihen: [2, 3, 4, 5, 6, 7, 8, 9], profi: true },
};

function zahl(min, max, zufall) {
  return min + Math.floor(zufall() * (max - min + 1));
}

function waehle(liste, zufall) {
  return liste[Math.floor(zufall() * liste.length)];
}

function mischen(liste, zufall) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

// Text einer Antwort: «24» oder «4 Rest 3»
export function antwortText(ergebnis, rest) {
  return rest ? `${ergebnis} Rest ${rest}` : String(ergebnis);
}

// Vier Antworten: die richtige und drei typische Fehler (Nachbarn in der Reihe, ±1, vertauscht)
function auswahl(richtig, kandidaten, zufall) {
  const falsch = [];
  for (const k of mischen(kandidaten, zufall)) {
    if (k > 0 && k !== richtig && !falsch.includes(k)) falsch.push(k);
    if (falsch.length === 3) break;
  }
  let extra = 1;
  while (falsch.length < 3) {
    const k = richtig + extra * (extra % 2 ? 1 : -1) * Math.ceil(extra / 2);
    if (k > 0 && k !== richtig && !falsch.includes(k)) falsch.push(k);
    extra++;
  }
  return mischen([richtig, ...falsch], zufall).map((wert) => ({ wert, richtig: wert === richtig }));
}

export function aufgabe(stufe, zufall = Math.random) {
  const s = STUFEN[stufe];
  const a = waehle(s.reihen, zufall);
  const b = zahl(1, 10, zufall);

  if (s.profi) {
    const art = waehle(['zehner-mal', 'zehner-teilen', 'rest'], zufall);
    if (art === 'zehner-mal') {
      // 30 × 7 = 210
      const z = a * 10;
      const ergebnis = z * b;
      return {
        art, a: z, b, op: '×', ergebnis, kern: { a, b },
        antworten: auswahl(ergebnis, [a * b, z * (b + 1), z * (b - 1), ergebnis * 10, ergebnis + 10], zufall).map((x) => ({ ...x, text: String(x.wert) })),
      };
    }
    if (art === 'zehner-teilen') {
      // 420 : 7 = 60
      const ergebnis = b * 10;
      const gesamt = a * ergebnis;
      return {
        art, a: gesamt, b: a, op: ':', ergebnis, kern: { a, b },
        antworten: auswahl(ergebnis, [b, ergebnis + 10, ergebnis - 10, b * 100, ergebnis + 1], zufall).map((x) => ({ ...x, text: String(x.wert) })),
      };
    }
    // Teilen mit Rest: 23 : 5 = 4 Rest 3
    const rest = zahl(1, a - 1, zufall);
    const gesamt = a * b + rest;
    const richtig = antwortText(b, rest);
    const falsch = new Set();
    for (const [e, r] of mischen([[b, rest + 1], [b + 1, rest], [b - 1, rest + a], [b, rest - 1], [b + 1, rest - 1]], zufall)) {
      if (e > 0 && r >= 0 && r < a + a && antwortText(e, r) !== richtig) falsch.add(antwortText(e, r));
      if (falsch.size === 3) break;
    }
    return {
      art, a: gesamt, b: a, op: ':', ergebnis: b, rest, kern: { a, b },
      antworten: mischen([richtig, ...falsch], zufall).map((text) => ({ text, richtig: text === richtig })),
    };
  }

  if (s.teilen && zufall() < 0.7) {
    // 56 : 8 = 7
    const gesamt = a * b;
    return {
      art: 'teilen', a: gesamt, b: a, op: ':', ergebnis: b, kern: { a, b },
      antworten: auswahl(b, [b + 1, b - 1, b + 2, a, gesamt - a], zufall).map((x) => ({ ...x, text: String(x.wert) })),
    };
  }

  // 7 × 8 = 56 (die Reihe steht vorne oder hinten)
  const vorne = zufall() < 0.5;
  const ergebnis = a * b;
  return {
    art: 'mal', a: vorne ? a : b, b: vorne ? b : a, op: '×', ergebnis, kern: { a, b },
    antworten: auswahl(ergebnis, [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ergebnis + 1, ergebnis - 1], zufall).map((x) => ({ ...x, text: String(x.wert) })),
  };
}

// Eine Runde ohne doppelte Aufgaben
export function runde(stufe, anzahl, zufall = Math.random) {
  const liste = [];
  const gesehen = new Set();
  for (let versuch = 0; liste.length < anzahl && versuch < anzahl * 50; versuch++) {
    const x = aufgabe(stufe, zufall);
    const schluessel = `${x.a}${x.op}${x.b}`;
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    liste.push(x);
  }
  return liste;
}
