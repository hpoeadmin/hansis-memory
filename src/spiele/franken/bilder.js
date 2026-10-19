// Münzen und Noten als SVG – nah am Schweizer Original (Farbe, Grösse, Wertseite),
// aber vereinfacht gezeichnet, damit sie klar als Spielgeld erkennbar bleiben.
// Münzen: Wertseite wie das Original (5 Rp. goldgelb, sonst Silber; Wertzahl in Serifenschrift
// im Kranz mit Schleife; Fünfliber mit «5FR.», Wappen und zwei Zweigen).
// Noten: 9. Serie im Hochformat (10 gelb, 20 rot, 50 grün) mit Weltkugel und Motiv.
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

// Durchmesser in Millimetern wie die echten Münzen – die Grössen stimmen untereinander.
// zahl/fr: Beschriftung der Wertseite wie auf dem Original («½ Fr.», «20», «5FR.» mit Wappen)
const MUENZE = {
  5: { mm: 17.15, gold: true, zahl: '5' },
  10: { mm: 19.15, zahl: '10' },
  20: { mm: 21.05, zahl: '20' },
  50: { mm: 18.2, zahl: '½', fr: true },
  100: { mm: 23.2, zahl: '1', fr: true },
  200: { mm: 27.4, zahl: '2', fr: true },
  500: { mm: 31.45, wappen: true },
};
const SERIF = 'font-family="\'Times New Roman\', Times, Georgia, serif" font-weight="700"';

// Noten: Farbe der echten Serie, Länge in mm (Breite 70 mm)
const NOTE = {
  1000: { hell: '#FBE38A', farbe: '#E9B417', dunkel: '#8A6A08', mm: 123, motiv: 'zeit' },
  2000: { hell: '#F6B3A6', farbe: '#D8453A', dunkel: '#7E1F18', mm: 130, motiv: 'licht' },
  5000: { hell: '#C3E3A6', farbe: '#5DA544', dunkel: '#2C5E1E', mm: 137, motiv: 'wind' },
};

const r1 = (x) => Math.round(x * 10) / 10;

// Kranz: zwei Zweige wachsen von der Schleife unten auf beiden Seiten bis fast nach oben
// (wie auf 5 Rp. bis 2 Fr.)
function kranz(farbe, licht) {
  let teile = '';
  for (const seite of [-1, 1]) {
    for (let i = 0; i < 11; i++) {
      const grad = 90 + seite * (16 + i * 15.2);
      const w = (grad * Math.PI) / 180;
      const x = 50 + 34 * Math.cos(w);
      const y = 50 + 34 * Math.sin(w);
      const richtung = grad + seite * 90; // Wuchsrichtung entlang des Kreises
      for (const neigung of [-38, 38]) {
        const n = ((richtung + neigung) * Math.PI) / 180;
        const bx = x + 3.4 * Math.cos(n);
        const by = y + 3.4 * Math.sin(n);
        teile += `<ellipse cx="${r1(bx)}" cy="${r1(by)}" rx="4" ry="1.8" transform="rotate(${r1(richtung + neigung)} ${r1(bx)} ${r1(by)})"/>`;
      }
    }
  }
  // Schleife unten
  const schleife =
    `<ellipse cx="45" cy="85" rx="4.5" ry="2.4" transform="rotate(-20 45 85)"/>` +
    `<ellipse cx="55" cy="85" rx="4.5" ry="2.4" transform="rotate(20 55 85)"/><circle cx="50" cy="85.5" r="2"/>`;
  return `<g fill="${farbe}" stroke="${licht}" stroke-width="0.4">${teile}${schleife}</g>`;
}

// Zweig neben dem Wappen auf dem Fünfliber
function zweig(seite, farbe) {
  const x0 = 50 + seite * 29;
  let blaetter = '';
  for (let i = 0; i < 7; i++) {
    const y = 74 - i * 6.2;
    const x = x0 + seite * Math.sin(i / 2) * 2;
    blaetter += `<ellipse cx="${r1(x - seite * 3)}" cy="${r1(y)}" rx="3.6" ry="1.4" transform="rotate(${seite * 40} ${r1(x - seite * 3)} ${r1(y)})"/>`;
    blaetter += `<ellipse cx="${r1(x + seite * 3)}" cy="${r1(y - 1)}" rx="3.6" ry="1.4" transform="rotate(${-seite * 40} ${r1(x + seite * 3)} ${r1(y - 1)})"/>`;
  }
  return `<g fill="${farbe}"><path d="M${x0} 78 Q${x0 + seite * 3} 56 ${x0} 34" fill="none" stroke="${farbe}" stroke-width="1.2"/>${blaetter}</g>`;
}

// Geprägte Schrift: dunkle Schrift mit heller Kante unten rechts
function praegung(x, y, groesse, text, dunkel, licht, extra = '') {
  return (
    `<text x="${x + 0.7}" y="${y + 0.7}" text-anchor="middle" font-size="${groesse}" ${SERIF} fill="${licht}"${extra}>${text}</text>` +
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${groesse}" ${SERIF} fill="${dunkel}"${extra}>${text}</text>`
  );
}

function muenzeSvg(wert) {
  const m = MUENZE[wert];
  const id = `m${wert}`;
  const [hell, mitte, dunkel] = m.gold ? ['#FFF0B8', '#E0BC55', '#8F6E16'] : ['#FAFBFC', '#C9CED4', '#737B84'];
  const relief = m.gold ? '#6E5410' : '#4D545C';
  const licht = m.gold ? '#FFF6D0' : '#FFFFFF';

  // Perlkreis innen am Rand
  let perlen = '';
  for (let i = 0; i < 60; i++) {
    const w = (i * 6 * Math.PI) / 180;
    perlen += `<circle cx="${r1(50 + 42 * Math.cos(w))}" cy="${r1(50 + 42 * Math.sin(w))}" r="0.9"/>`;
  }

  let inhalt;
  if (m.wappen) {
    inhalt =
      praegung(50, 27, 17, '5FR.', relief, licht) +
      `<path d="M35 33 H65 V51 C65 64 58 71 50 75 C42 71 35 64 35 51 Z" fill="${mitte}" stroke="${relief}" stroke-width="2"/>` +
      `<path d="M47 39 h6 v8 h8 v6 h-8 v8 h-6 v-8 h-8 v-6 h8 z" fill="${licht}" stroke="${relief}" stroke-width="0.8"/>` +
      zweig(-1, relief) +
      zweig(1, relief);
  } else if (m.fr) {
    inhalt = praegung(50, 59, 29, `${m.zahl}<tspan font-size="21"> Fr.</tspan>`, relief, licht) + kranz(relief, licht);
  } else {
    inhalt = praegung(50, m.zahl.length > 1 ? 62 : 64, m.zahl.length > 1 ? 34 : 40, m.zahl, relief, licht) + kranz(relief, licht);
  }

  return (
    `<svg viewBox="0 0 100 100" class="geld-muenze" aria-hidden="true" style="--mm: ${m.mm}">` +
    `<defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${hell}"/><stop offset="0.6" stop-color="${mitte}"/><stop offset="1" stop-color="${dunkel}"/></radialGradient></defs>` +
    `<circle cx="50" cy="50" r="47" fill="url(#${id})" stroke="${K}" stroke-width="3"/>` +
    `<circle cx="50" cy="50" r="45" fill="none" stroke="${licht}" stroke-width="1.2" opacity="0.8"/>` +
    `<g fill="${relief}" opacity="0.75">${perlen}</g>` +
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
