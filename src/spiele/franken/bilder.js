// Münzen und Noten als SVG – nah am Schweizer Original (Farbe, Grösse, Wertseite),
// aber vereinfacht gezeichnet, damit sie klar als Spielgeld erkennbar bleiben.
// Münzen: Wertseite wie im Portemonnaie (5 Rp. goldgelb, sonst Silber; ½, 1, 2, 5 Fr. mit Kranz).
// Noten: 9. Serie im Hochformat (10 gelb, 20 rot, 50 grün) mit Weltkugel und Motiv.
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

// Durchmesser in Millimetern wie die echten Münzen – die Grössen stimmen untereinander
const MUENZE = {
  5: { mm: 17.15, gold: true },
  10: { mm: 19.15 },
  20: { mm: 21.05 },
  50: { mm: 18.2, kranz: true, zahl: '½', fr: true },
  100: { mm: 23.2, kranz: true, zahl: '1', fr: true },
  200: { mm: 27.4, kranz: true, zahl: '2', fr: true },
  500: { mm: 31.45, kranz: true, zahl: '5', fr: true },
};

// Noten: Farbe der echten Serie, Länge in mm (Breite 70 mm)
const NOTE = {
  1000: { hell: '#FBE38A', farbe: '#E9B417', dunkel: '#8A6A08', mm: 123, motiv: 'zeit' },
  2000: { hell: '#F6B3A6', farbe: '#D8453A', dunkel: '#7E1F18', mm: 130, motiv: 'licht' },
  5000: { hell: '#C3E3A6', farbe: '#5DA544', dunkel: '#2C5E1E', mm: 137, motiv: 'wind' },
};

const r1 = (x) => Math.round(x * 10) / 10;

// Kranz aus Blättern um die untere Hälfte (wie auf ½, 1, 2 und 5 Franken)
function kranz(farbe) {
  let blaetter = '';
  for (let seite = -1; seite <= 1; seite += 2) {
    for (let i = 0; i < 6; i++) {
      const winkel = ((90 + seite * (20 + i * 16)) * Math.PI) / 180;
      const x = 50 + 34 * Math.cos(winkel);
      const y = 50 + 34 * Math.sin(winkel);
      const drehung = (winkel * 180) / Math.PI + 90 * seite;
      blaetter += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="6" ry="2.6" transform="rotate(${r1(drehung + seite * 25)} ${r1(x)} ${r1(y)})" fill="${farbe}"/>`;
    }
  }
  return blaetter;
}

function muenzeSvg(wert) {
  const m = MUENZE[wert];
  const id = `m${wert}`;
  const [hell, mitte, dunkel] = m.gold ? ['#FBE7A1', '#DDB54A', '#9C7A1E'] : ['#F4F6F8', '#C3C9CF', '#7F878F'];
  const zahl = m.zahl ?? String(wert);
  const zahlGroesse = m.fr ? 40 : zahl.length > 1 ? 40 : 46;
  const zahlY = m.fr ? 58 : 63;
  const inhalt = m.fr
    ? `<text x="${m.zahl === '½' ? 42 : 44}" y="${zahlY}" text-anchor="middle" font-size="${zahlGroesse}" ${SCHRIFT} fill="${dunkel}">${zahl}</text>` +
      `<text x="${m.zahl === '½' ? 62 : 59}" y="${zahlY - 2}" text-anchor="start" font-size="13" ${SCHRIFT} fill="${dunkel}">Fr.</text>` +
      kranz(dunkel)
    : `<text x="50" y="${zahlY}" text-anchor="middle" font-size="${zahlGroesse}" ${SCHRIFT} fill="${dunkel}">${zahl}</text>`;
  return (
    `<svg viewBox="0 0 100 100" class="geld-muenze" aria-hidden="true" style="--mm: ${m.mm}">` +
    `<defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${hell}"/><stop offset="0.6" stop-color="${mitte}"/><stop offset="1" stop-color="${dunkel}"/></radialGradient></defs>` +
    `<circle cx="50" cy="50" r="47" fill="url(#${id})" stroke="${K}" stroke-width="3"/>` +
    // geriffelter Rand
    `<circle cx="50" cy="50" r="44.5" fill="none" stroke="${dunkel}" stroke-width="3" stroke-dasharray="1.2 1.6" opacity="0.7"/>` +
    `<circle cx="50" cy="50" r="41" fill="none" stroke="${dunkel}" stroke-width="1.5" opacity="0.6"/>` +
    inhalt +
    `</svg>`
  );
}

// Motive der 9. Serie, stark vereinfacht
function motiv(art, n) {
  if (art === 'zeit') {
    // Zahnrad (Zeit)
    let zaehne = '';
    for (let i = 0; i < 10; i++) zaehne += `<rect x="-3" y="-17" width="6" height="7" rx="1" transform="rotate(${i * 36})"/>`;
    return `<g transform="translate(35 70) scale(0.8)" fill="${n.dunkel}">${zaehne}<circle r="12"/><circle r="5" fill="${n.hell}"/></g>`;
  }
  if (art === 'licht') {
    // Prisma mit Lichtstrahlen
    const strahlen = ['#F6C33B', '#7CC36B', '#5AA0E0', '#9C6BD0']
      .map((f, i) => `<line x1="38" y1="72" x2="58" y2="${62 + i * 6}" stroke="${f}" stroke-width="3"/>`)
      .join('');
    return `<line x1="12" y1="64" x2="32" y2="72" stroke="#FFFFFF" stroke-width="3"/>${strahlen}<polygon points="35,60 45,80 25,80" fill="${n.hell}" stroke="${n.dunkel}" stroke-width="2.5"/>`;
  }
  // Pusteblume (Wind)
  let schirm = '';
  for (let i = 0; i < 12; i++) {
    const w = (i * 30 * Math.PI) / 180;
    schirm += `<line x1="0" y1="0" x2="${r1(13 * Math.cos(w))}" y2="${r1(13 * Math.sin(w))}"/><circle cx="${r1(13 * Math.cos(w))}" cy="${r1(13 * Math.sin(w))}" r="1.8"/>`;
  }
  return `<g transform="translate(35 64) scale(0.9)" stroke="${n.dunkel}" fill="${n.dunkel}" stroke-width="1.5">${schirm}<line x1="0" y1="0" x2="0" y2="24" stroke-width="2.5"/></g>`;
}

function noteSvg(wert) {
  const n = NOTE[wert];
  const hoehe = Math.round((n.mm / 70) * 70);
  const zahl = wert / 100;
  return (
    `<svg viewBox="0 0 70 ${hoehe}" class="geld-note" aria-hidden="true" style="--mm: ${n.mm}">` +
    `<defs><linearGradient id="n${wert}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${n.hell}"/><stop offset="1" stop-color="${n.farbe}"/></linearGradient></defs>` +
    `<rect x="2" y="2" width="66" height="${hoehe - 4}" rx="4" fill="url(#n${wert})" stroke="${K}" stroke-width="3"/>` +
    // Weltkugel mit Längen- und Breitengraden
    `<g fill="none" stroke="${n.dunkel}" stroke-width="1.3" opacity="0.4"><circle cx="35" cy="70" r="24"/><ellipse cx="35" cy="70" rx="11" ry="24"/><line x1="11" y1="70" x2="59" y2="70"/><path d="M14 58 H56 M14 82 H56"/></g>` +
    // Wert gross oben
    `<text x="35" y="34" text-anchor="middle" font-size="${zahl >= 10 ? 30 : 34}" ${SCHRIFT} fill="${K}">${zahl}</text>` +
    motiv(n.motiv, n) +
    // Schweizerkreuz und Beschriftung
    `<rect x="${57 - 6}" y="${hoehe - 22}" width="12" height="12" rx="1.5" fill="#D52B1E"/>` +
    `<path d="M${57 - 1.3} ${hoehe - 20} h2.6 v3.4 h3.4 v2.6 h-3.4 v3.4 h-2.6 v-3.4 h-3.4 v-2.6 h3.4 z" fill="#FFFFFF"/>` +
    `<text x="8" y="${hoehe - 11}" font-size="8" ${SCHRIFT} fill="${K}">FRANKEN</text>` +
    `</svg>`
  );
}

export function geldSvg(wert) {
  return NOTE[wert] ? noteSvg(wert) : muenzeSvg(wert);
}
