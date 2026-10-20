// Antike (1. Gymnasium): Ereignisse mit Jahr. Negative Jahre = vor Christus (v. Chr.).
// um: das Jahr ist ungefähr. Jahreszahlen nach gängigen Schulbüchern.
import { zahl, waehle, mischen, ohneDoppelte } from '../../kern/antworten.js';

export const EREIGNISSE = [
  { jahr: -3300, um: true, text: 'Ötzi lebt in den Alpen' },
  { jahr: -3200, um: true, text: 'In Mesopotamien entsteht die Keilschrift' },
  { jahr: -2560, um: true, text: 'Die grosse Pyramide von Gizeh wird gebaut' },
  { jahr: -1330, um: true, text: 'Tutanchamun ist Pharao in Ägypten' },
  { jahr: -776, text: 'Die ersten Olympischen Spiele finden statt' },
  { jahr: -753, text: 'Rom wird gegründet (nach der Sage)' },
  { jahr: -508, text: 'Athen führt die Demokratie ein' },
  { jahr: -490, text: 'Die Schlacht bei Marathon' },
  { jahr: -323, text: 'Alexander der Grosse stirbt' },
  { jahr: -218, text: 'Hannibal überquert mit Elefanten die Alpen' },
  { jahr: -58, text: 'Caesar besiegt die Helvetier bei Bibracte' },
  { jahr: -44, text: 'Julius Caesar wird ermordet' },
  { jahr: -27, text: 'Augustus wird der erste römische Kaiser' },
  { jahr: 79, text: 'Der Vesuv begräbt Pompeji' },
  { jahr: 122, text: 'Der Hadrianswall in Britannien wird gebaut' },
  { jahr: 380, text: 'Das Christentum wird römische Staatsreligion' },
  { jahr: 476, text: 'Das Weströmische Reich geht unter' },
];

// «753 v. Chr.», «um 2560 v. Chr.», «79 n. Chr.»
export function jahrText(jahr, um = false) {
  const t = jahr < 0 ? `${-jahr} v. Chr.` : `${jahr} n. Chr.`;
  return um ? `um ${t}` : t;
}

export const STUFEN = {
  frueher: { art: 'frueher' }, // Welches Ereignis war früher?
  zahlen: { art: 'zahlen' }, // Welches Jahr ist am frühesten? (v. Chr. verstehen)
  jahr: { art: 'jahr' }, // Wann war …?
  roemer: { art: 'roemer' }, // Römer in der Schweiz auf der Karte
};

// Mindestabstand, damit «früher» klar ist
const ABSTAND = 40;

function verschiedeneEreignisse(anzahl, zufall) {
  for (let versuch = 0; versuch < 200; versuch++) {
    const liste = mischen(EREIGNISSE, zufall).slice(0, anzahl);
    const jahre = liste.map((e) => e.jahr).sort((a, b) => a - b);
    if (jahre.every((j, i) => i === 0 || j - jahre[i - 1] >= ABSTAND)) return liste;
  }
  return mischen(EREIGNISSE, zufall).slice(0, anzahl);
}

export function aufgabe(stufe, zufall = Math.random) {
  const art = STUFEN[stufe].art;
  if (art === 'frueher') {
    const [a, b] = verschiedeneEreignisse(2, zufall);
    const frueher = a.jahr < b.jahr ? a : b;
    return { art, ereignisse: [a, b], richtig: frueher };
  }
  if (art === 'zahlen') {
    // Drei Jahreszahlen, mindestens eine vor Christus; gesucht ist die früheste
    const jahre = new Set();
    while (jahre.size < 3) {
      const vorChristus = jahre.size === 0 || zufall() < 0.6;
      jahre.add(vorChristus ? -zahl(1, 60, zufall) * 10 : zahl(1, 50, zufall) * 10);
    }
    const liste = [...jahre];
    return { art, jahre: liste, richtig: Math.min(...liste) };
  }
  // Wann war …? Vier Jahre von Ereignissen, die weit genug auseinanderliegen
  const vier = verschiedeneEreignisse(4, zufall);
  const gesucht = waehle(vier, zufall);
  return { art, gesucht, optionen: mischen(vier, zufall) };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(
    () => aufgabe(stufe, zufall),
    (x) => (x.art === 'zahlen' ? x.jahre.join() : x.art === 'frueher' ? x.ereignisse.map((e) => e.jahr).sort().join() : x.gesucht.jahr),
    anzahl,
  );
}
