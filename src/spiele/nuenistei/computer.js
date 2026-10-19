// Computergegner für Nüni Stei.
// «gemuetlich»: nimmt oft, aber nicht immer, eine Mühle mit; sonst eher zufällig.
// «knifflig»: rechnet einige Züge voraus (Alpha-Beta-Suche).
import { MUEHLEN, NACHBARN, anzahl, fuehreAus, phase, zuege } from './regeln.js';

const SIEG = 100000;

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

// Würde ein Stein von «seite» auf «punkt» eine Mühle schliessen?
function schliesstMuehle(brett, punkt, seite, ohne = null) {
  return MUEHLEN.some(
    (m) => m.includes(punkt) && m.every((q) => q === punkt || (q !== ohne && brett[q] === seite)),
  );
}

function gemuetlich(zustand) {
  const liste = zuege(zustand);
  if (zustand.wegnehmen) return zufall(liste);
  const seite = zustand.amZug;
  const muehlen = liste.filter((z) => schliesstMuehle(zustand.brett, z.nach, seite, z.von));
  if (muehlen.length && Math.random() < 0.6) return zufall(muehlen);
  const abwehr = liste.filter((z) => schliesstMuehle(zustand.brett, z.nach, 1 - seite, z.von));
  if (abwehr.length && Math.random() < 0.4) return zufall(abwehr);
  return zufall(liste);
}

// Bewertung aus Sicht von «seite»
function bewerte(z, seite) {
  if (z.sieger === seite) return SIEG;
  if (z.sieger === 1 - seite) return -SIEG;
  if (z.sieger === 'remis') return 0;
  const material = (s) => anzahl(z, s) + z.zuSetzen[s];
  const offeneZwei = (s) =>
    MUEHLEN.filter((m) => {
      const eigene = m.filter((q) => z.brett[q] === s).length;
      const frei = m.filter((q) => z.brett[q] === null).length;
      return eigene === 2 && frei === 1;
    }).length;
  const beweglich = (s) =>
    z.brett.reduce(
      (summe, st, p) => summe + (st === s ? NACHBARN[p].filter((q) => z.brett[q] === null).length : 0),
      0,
    );
  let wert = 100 * (material(seite) - material(1 - seite));
  wert += 12 * (offeneZwei(seite) - offeneZwei(1 - seite));
  if (phase(z, seite) === 'ziehen' || phase(z, 1 - seite) === 'ziehen') {
    wert += 3 * (beweglich(seite) - beweglich(1 - seite));
  }
  return wert;
}

function suche(z, tiefe, alpha, beta, seite) {
  if (z.sieger !== null) return bewerte(z, seite) + tiefe;
  // Ein offenes Wegnehmen wird immer noch zu Ende gerechnet, sonst täuscht die Bewertung
  if (tiefe <= 0 && !z.wegnehmen) return bewerte(z, seite);
  const liste = zuege(z);
  const maximieren = z.amZug === seite;
  let best = maximieren ? -Infinity : Infinity;
  for (const zug of liste) {
    const wert = suche(fuehreAus(z, zug), tiefe - 1, alpha, beta, seite);
    if (maximieren) {
      best = Math.max(best, wert);
      alpha = Math.max(alpha, wert);
    } else {
      best = Math.min(best, wert);
      beta = Math.min(beta, wert);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function knifflig(zustand) {
  const seite = zustand.amZug;
  const tiefe = phase(zustand) === 'setzen' ? 3 : 4;
  let beste = [];
  let bestWert = -Infinity;
  for (const zug of zuege(zustand)) {
    const nachher = fuehreAus(zustand, zug);
    // Bei gleich guten Zügen gewinnt der, der sofort mehr bringt (z.B. Mühle jetzt statt später)
    const wert =
      suche(nachher, tiefe - 1, -Infinity, Infinity, seite) + bewerte(nachher, seite) / 1000;
    if (wert > bestWert) {
      bestWert = wert;
      beste = [zug];
    } else if (wert === bestWert) {
      beste.push(zug);
    }
  }
  return zufall(beste);
}

export function waehleZug(zustand, stufe) {
  return stufe === 'knifflig' ? knifflig(zustand) : gemuetlich(zustand);
}
