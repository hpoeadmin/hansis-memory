// Münzen und Noten als SVG – nah am Schweizer Original (Farbe, Grösse, Wertseite),
// aber vereinfacht gezeichnet, damit sie klar als Spielgeld erkennbar bleiben.
// Münzen: Wertseite wie das Original (5 Rp. goldgelb, sonst Silber; Wertzahl in Serifenschrift
// im Kranz mit Schleife; Fünfliber mit «5FR.», Wappen und zwei Zweigen).
// Noten: 9. Serie im Hochformat (10 gelb-orange, 20 rot, 50 grün) mit Farbverlauf, Streifen,
// Wert oben links und dem Motiv der echten Note; «SPIELGELD» statt Bankname.
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

// Noten der 9. Serie: Farbverlauf, Streifen rechts, Länge in mm (Breite 70 mm)
const NOTE = {
  1000: { verlauf: ['#FFE27A', '#FBC23A', '#F39A2B'], streifen: '#F7B23A', zahl: '#FFF4D0', dunkel: '#9A5A0C', mm: 123, motiv: 'zeit', name: 'Zehn Franken' },
  2000: { verlauf: ['#F98CA0', '#EE4458', '#D9263A'], streifen: '#F2667A', zahl: '#FFE4E8', dunkel: '#8E1022', mm: 130, motiv: 'licht', name: 'Zwanzig Franken' },
  5000: { verlauf: ['#C6EA7A', '#7CC74E', '#3E9B45'], streifen: '#9FD86A', zahl: '#F0FFE0', dunkel: '#1F5E26', mm: 137, motiv: 'wind', name: 'Fünfzig Franken' },
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

// Motive der 9. Serie, vereinfacht: 10 Zahnräder (Zeit), 20 Schmetterling und Prisma (Licht),
// 50 Pusteblume und Höhenlinien (Wind)
function zahnrad(x, y, r, zaehne, farbe, loch) {
  let pfad = '';
  for (let i = 0; i < zaehne; i++) {
    pfad += `<rect x="${r1(-r * 0.18)}" y="${r1(-r * 1.28)}" width="${r1(r * 0.36)}" height="${r1(r * 0.4)}" rx="0.6" transform="rotate(${r1((i * 360) / zaehne)})"/>`;
  }
  return `<g transform="translate(${x} ${y})" fill="${farbe}">${pfad}<circle r="${r}"/><circle r="${r1(r * 0.62)}" fill="none" stroke="${loch}" stroke-width="1"/><circle r="${r1(r * 0.25)}" fill="${loch}"/></g>`;
}

function motiv(art, n) {
  if (art === 'zeit') {
    return (
      zahnrad(30, 46, 9, 12, '#C9962A', '#FBE3A0') +
      zahnrad(44, 58, 6, 9, '#B07E1C', '#FBE3A0') +
      zahnrad(22, 61, 4.5, 8, '#D7A93A', '#FBE3A0') +
      // Zeitzonen-Linien auf der Weltkugel
      `<g fill="none" stroke="${n.dunkel}" stroke-width="0.6" opacity="0.45"><circle cx="30" cy="92" r="20"/><ellipse cx="30" cy="92" rx="8" ry="20"/><ellipse cx="30" cy="92" rx="15" ry="20"/><path d="M10 92 H50 M13 82 H47 M13 102 H47"/></g>`
    );
  }
  if (art === 'licht') {
    const strahlen = ['#FFE14D', '#7BD36A', '#4EB0F0', '#9C6BE0']
      .map((f, i) => `<path d="M34 92 L60 ${82 + i * 6} L60 ${86 + i * 6} Z" fill="${f}" opacity="0.85"/>`)
      .join('');
    return (
      // Schmetterling
      `<g transform="translate(34 48)" stroke="${n.dunkel}" stroke-width="0.8">` +
      `<path d="M0 0 C-6 -14 -20 -12 -16 -2 C-14 4 -6 4 0 0 Z" fill="#C64BA0" opacity="0.9"/>` +
      `<path d="M0 0 C6 -14 20 -12 16 -2 C14 4 6 4 0 0 Z" fill="#7E4FD0" opacity="0.9"/>` +
      `<path d="M0 0 C-4 6 -12 12 -10 4 Z" fill="#E86AA8"/><path d="M0 0 C4 6 12 12 10 4 Z" fill="#A070E0"/>` +
      `<line x1="0" y1="-4" x2="0" y2="6" stroke-width="1.6"/></g>` +
      // Prisma mit Lichtstrahl
      `<path d="M6 86 L30 92" stroke="#FFFFFF" stroke-width="2.4"/>${strahlen}` +
      `<polygon points="32,80 41,98 23,98" fill="#FFFFFF" fill-opacity="0.55" stroke="${n.dunkel}" stroke-width="1.2"/>`
    );
  }
  let schirm = '';
  for (let i = 0; i < 14; i++) {
    const w = ((i * 360) / 14) * (Math.PI / 180);
    const x = r1(11 * Math.cos(w));
    const y = r1(11 * Math.sin(w));
    schirm += `<line x1="0" y1="0" x2="${x}" y2="${y}"/><circle cx="${x}" cy="${y}" r="1.4"/>`;
  }
  // davonfliegende Samen
  const flug = [[52, 30, 0.32], [58, 44, 0.26], [50, 18, 0.22]]
    .map(([x, y, g]) => `<g transform="translate(${x} ${y}) rotate(25) scale(${g})">${schirm}<line x1="0" y1="0" x2="1" y2="14" stroke-width="2"/></g>`)
    .join('');
  // Höhenlinien wie auf einer Landkarte
  const linien = [0, 1, 2, 3, 4]
    .map((i) => `<path d="M2 ${86 + i * 7} C18 ${76 + i * 7} 30 ${96 + i * 7} 48 ${82 + i * 7} S66 ${84 + i * 7} 68 ${80 + i * 7}"/>`)
    .join('');
  return (
    `<g fill="none" stroke="${n.dunkel}" stroke-width="0.7" opacity="0.4">${linien}</g>` +
    `<g transform="translate(30 50)" stroke="#FFFFFF" fill="#FFFFFF" stroke-width="0.9">${schirm}<line x1="0" y1="0" x2="2" y2="26" stroke-width="1.6"/></g>` +
    `<g stroke="#FFFFFF" fill="#FFFFFF" stroke-width="1.2">${flug}</g>`
  );
}

function noteSvg(wert) {
  const n = NOTE[wert];
  const h = Math.round((n.mm / 70) * 70);
  const zahl = wert / 100;
  const id = `n${wert}`;
  // feine Linien wie die kleine Schrift auf der Note
  let schrift = '';
  for (let i = 0; i < 4; i++) schrift += `<rect x="6" y="${28 + i * 3}" width="${16 - i * 3}" height="1" rx="0.5"/>`;
  return (
    `<svg viewBox="0 0 70 ${h}" class="geld-note" aria-hidden="true" style="--mm: ${n.mm}">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${n.verlauf[0]}"/><stop offset="0.55" stop-color="${n.verlauf[1]}"/><stop offset="1" stop-color="${n.verlauf[2]}"/></linearGradient>` +
    `<clipPath id="${id}c"><rect x="1.5" y="1.5" width="67" height="${h - 3}" rx="3"/></clipPath></defs>` +
    `<g clip-path="url(#${id}c)">` +
    `<rect width="70" height="${h}" fill="url(#${id})"/>` +
    // heller Streifen rechts, wie das Fenster der echten Note
    `<rect x="47" y="0" width="23" height="${h}" fill="${n.streifen}" opacity="0.55"/>` +
    `<rect x="47" y="0" width="1" height="${h}" fill="#FFFFFF" opacity="0.6"/>` +
    motiv(n.motiv, n) +
    // Wert oben links
    `<text x="4" y="23" font-size="24" ${SCHRIFT} fill="${n.dunkel}" stroke="${n.zahl}" stroke-width="2.2" paint-order="stroke">${zahl}</text>` +
    `<g fill="${n.dunkel}" opacity="0.45">${schrift}</g>` +
    // Name des Werts rechts unten, Wert klein in der Ecke
    `<text x="66" y="${h - 22}" text-anchor="end" font-size="4.6" ${SCHRIFT} fill="${n.dunkel}">${n.name}</text>` +
    `<text x="66" y="${h - 5}" text-anchor="end" font-size="7" ${SCHRIFT} fill="${n.dunkel}">${zahl}</text>` +
    // senkrechte Beschriftung links unten – «SPIELGELD» statt Bankname
    `<text transform="translate(9 ${h - 5}) rotate(-90)" font-size="5" ${SCHRIFT} fill="${n.dunkel}" letter-spacing="0.6">SPIELGELD</text>` +
    // kleines Schweizerkreuz
    `<rect x="54" y="6" width="9" height="9" rx="1" fill="#D52B1E"/>` +
    `<path d="M57.5 7.5 h2 v2.5 h2.5 v2 h-2.5 v2.5 h-2 v-2.5 h-2.5 v-2 h2.5 z" fill="#FFFFFF"/>` +
    `</g>` +
    `<rect x="1.5" y="1.5" width="67" height="${h - 3}" rx="3" fill="none" stroke="${K}" stroke-width="2.5"/>` +
    `</svg>`
  );
}

export function geldSvg(wert) {
  return NOTE[wert] ? noteSvg(wert) : muenzeSvg(wert);
}
