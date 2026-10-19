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

// Noten der 9. Serie (nach Foto): Grundfarben oben → unten, Farbe der Wertzahl, Streifen rechts.
// Länge in mm (Breite 70 mm), Namen wie auf der Note in zwei Landessprachen.
const NOTE = {
  1000: {
    verlauf: ['#FBD77A', '#FCE6A6', '#FBD28A'],
    streifen: '#F6A940',
    zahl: '#EE8A17',
    dunkel: '#A85A0A',
    linie: '#E9A23B',
    mm: 123,
    motiv: 'zeit',
    namen: ['Zehn Franken', 'Dix Francs'],
  },
  2000: {
    verlauf: ['#F0525A', '#F48C8F', '#F9D3D3'],
    streifen: '#E8323E',
    zahl: '#D61F2C',
    dunkel: '#8E1022',
    linie: '#D93A48',
    mm: 130,
    motiv: 'licht',
    namen: ['Zwanzig Franken', 'Vingt Francs'],
  },
  5000: {
    verlauf: ['#39B04A', '#B9DE6A', '#DDF0EA'],
    streifen: '#62C35A',
    zahl: '#23893A',
    dunkel: '#1B5E2A',
    linie: '#4FA85A',
    mm: 137,
    motiv: 'wind',
    namen: ['Fünfzig Franken', 'Cinquante Francs'],
  },
};

// Zufallszahlen, die bei jedem Zeichnen gleich ausfallen (für Sprenkel und Linien)
function zufallsfolge(start) {
  let x = start;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

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

// Motive der 9. Serie, vereinfacht nach dem Foto
function zahnrad(x, y, r, zaehne, farbe, loch, speichen = 0) {
  let teile = '';
  for (let i = 0; i < zaehne; i++) {
    teile += `<rect x="${r1(-r * 0.16)}" y="${r1(-r * 1.22)}" width="${r1(r * 0.32)}" height="${r1(r * 0.34)}" transform="rotate(${r1((i * 360) / zaehne)})"/>`;
  }
  let speichenPfad = '';
  for (let i = 0; i < speichen; i++) {
    speichenPfad += `<rect x="-0.5" y="${r1(-r * 0.8)}" width="1" height="${r1(r * 0.8)}" transform="rotate(${r1((i * 360) / speichen)})" fill="${farbe}"/>`;
  }
  return (
    `<g transform="translate(${x} ${y})" fill="${farbe}" stroke="${loch}" stroke-width="0.25">${teile}<circle r="${r}"/>` +
    `<circle r="${r1(r * 0.8)}" fill="${loch}" stroke="none"/>${speichenPfad}<circle r="${r1(r * 0.25)}"/></g>`
  );
}

// Höhenlinien wie auf einer Landkarte
function hoehenlinien(h, farbe, zufall, anzahl, deckkraft) {
  let pfade = '';
  for (let i = 0; i < anzahl; i++) {
    const y = (i / anzahl) * h * 1.1;
    const a = r1(zufall() * 10 - 5);
    const b = r1(zufall() * 10 - 5);
    pfade += `<path d="M-2 ${r1(y)} C20 ${r1(y + a)} 30 ${r1(y - b)} 46 ${r1(y + a / 2)} S66 ${r1(y + b)} 72 ${r1(y - a)}"/>`;
  }
  return `<g fill="none" stroke="${farbe}" stroke-width="0.35" opacity="${deckkraft}">${pfade}</g>`;
}

function sprenkel(x0, y0, b, hoehe, farben, zufall, anzahl) {
  let punkte = '';
  for (let i = 0; i < anzahl; i++) {
    const x = r1(x0 + zufall() * b);
    const y = r1(y0 + zufall() * hoehe);
    if (x > 34 && y > 82) continue;
    const f = farben[Math.floor(zufall() * farben.length)];
    punkte += `<circle cx="${x}" cy="${y}" r="${r1(0.4 + zufall() * 0.9)}" fill="${f}"/>`;
  }
  return `<g opacity="0.85">${punkte}</g>`;
}

function motiv(art, n, h) {
  const zufall = zufallsfolge(art.length * 7919);
  if (art === 'zeit') {
    // Leiterbahnen oben, Uhrwerk in der Mitte, blauer Lichtfächer mit Weltkugel darunter
    let bahnen = '';
    for (let i = 0; i < 9; i++) {
      const x = r1(8 + zufall() * 54);
      const y = r1(6 + zufall() * 36);
      bahnen += `<path d="M${x} ${y} h${r1(zufall() * 10 - 5)} l4 4 v${r1(zufall() * 8)}"/><circle cx="${x}" cy="${y}" r="0.8"/>`;
    }
    let faecher = '';
    for (let i = 0; i < 16; i++) {
      const w = ((200 + i * 9) * Math.PI) / 180;
      faecher += `<line x1="30" y1="78" x2="${r1(30 + 20 * Math.cos(w))}" y2="${r1(78 - 20 * Math.sin(w))}"/>`;
    }
    return (
      `<g fill="none" stroke="${n.linie}" stroke-width="0.4" opacity="0.7">${bahnen}</g>` +
      `<g stroke="#2E7FC2" stroke-width="0.6" opacity="0.6">${faecher}</g>` +
      `<circle cx="30" cy="78" r="10" fill="#5FA9DE" opacity="0.55"/>` +
      `<g fill="none" stroke="#1D5E9A" stroke-width="0.4" opacity="0.7"><circle cx="30" cy="78" r="10"/><ellipse cx="30" cy="78" rx="4.5" ry="10"/><path d="M20 78 H40 M21.5 73 H38.5 M21.5 83 H38.5"/></g>` +
      zahnrad(30, 50, 9, 18, '#B98A3A', '#F5E1A8', 5) +
      zahnrad(42, 60, 6.5, 14, '#9C7128', '#F2D894', 4) +
      zahnrad(22, 63, 4.5, 10, '#C99B4A', '#F7E6B6', 3) +
      zahnrad(40, 44, 3.5, 9, '#8B6420', '#F2D894')
    );
  }
  if (art === 'licht') {
    const fluegel = (x, y, g, f1, f2) =>
      `<g transform="translate(${x} ${y}) scale(${g})" stroke="#4B2470" stroke-width="0.6">` +
      `<path d="M0 0 C-4 -12 -18 -14 -17 -4 C-16 2 -6 2 0 0 Z" fill="${f1}"/>` +
      `<path d="M0 0 C4 -12 18 -14 17 -4 C16 2 6 2 0 0 Z" fill="${f1}"/>` +
      `<path d="M0 0 C-3 4 -12 12 -11 3 Z" fill="${f2}"/><path d="M0 0 C3 4 12 12 11 3 Z" fill="${f2}"/>` +
      `<path d="M-10 -6 L-4 -2 M10 -6 L4 -2 M-12 -9 C-9 -8 -6 -6 -3 -3 M12 -9 C9 -8 6 -6 3 -3" fill="none" stroke-width="0.4"/>` +
      `<line x1="0" y1="-3" x2="0" y2="5" stroke-width="1.4"/></g>`;
    return (
      `<g fill="none" stroke="${n.linie}" stroke-width="0.35" opacity="0.6">` +
      [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${10 + i * 9} 4 v40 h-6 v20"/>`).join('') +
      `</g>` +
      fluegel(36, 30, 0.95, '#9C5AC6', '#C78BE0') +
      fluegel(30, 48, 0.75, '#7E4AB0', '#B27AD8') +
      // Fenster mit Schweizerkreuz
      `<rect x="20" y="60" width="26" height="13" fill="#FFFFFF" opacity="0.75" stroke="#C9A0A8" stroke-width="0.5"/>` +
      `<path d="M50 22 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="none" stroke="#D61F2C" stroke-width="1.2"/>` +
      // türkise Lichtpunkte
      sprenkel(14, 76, 30, h - 82, ['#2BB3C0', '#48C9D6', '#E85A8A', '#7FD7E0', '#FFFFFF'], zufall, 150)
    );
  }
  // Wind: Höhenlinien, Berge, blaue Weltkugel, rote Fläche mit Linien (Hand), türkis unten rechts
  let rot = '';
  for (let i = 0; i < 9; i++) {
    rot += `<path d="M20 ${66 + i * 3} C28 ${62 + i * 3} 38 ${70 + i * 3} 48 ${64 + i * 3}" />`;
  }
  return (
    hoehenlinien(h, n.dunkel, zufall, 30, 0.3) +
    `<defs><radialGradient id="kugel50" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#BFE3FA"/><stop offset="0.5" stop-color="#4C97D8"/><stop offset="1" stop-color="#1F5FA8"/></radialGradient>` +
    `<clipPath id="rot50"><path d="M22 64 C28 58 42 58 47 66 C50 78 42 92 31 90 C22 88 18 74 22 64 Z"/></clipPath></defs>` +
    `<path d="M2 74 L12 56 L18 62 L28 46 L36 56 L44 48 L54 60 L62 52 L70 64 L70 84 L2 84 Z" fill="#2F8F42" opacity="0.5"/>` +
    `<path d="M2 78 L10 66 L20 72 L30 60 L40 70 L50 62 L60 72 L70 68 L70 86 L2 86 Z" fill="#6FBE4E" opacity="0.6"/>` +
    `<path d="M28 58 A14 14 0 1 1 56 58 C52 62 32 62 28 58 Z" fill="url(#kugel50)"/>` +
    `<path d="M32 50 A10 10 0 0 1 44 44" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.7"/>` +
    `<path d="M22 64 C28 58 42 58 47 66 C50 78 42 92 31 90 C22 88 18 74 22 64 Z" fill="#E0503A"/>` +
    `<g clip-path="url(#rot50)" fill="none" stroke="#F7B06A" stroke-width="0.6">${rot}</g>` +
    `<path d="M48 74 C54 70 64 72 68 80 L68 98 C58 100 50 94 48 86 Z" fill="#53B8C8" opacity="0.6"/>` +
    `<circle cx="52" cy="82" r="2.2" fill="#1D6FA8"/>`
  );
}

function noteSvg(wert) {
  const n = NOTE[wert];
  const h = n.mm;
  const zahl = wert / 100;
  const id = `n${wert}`;
  // feine Linien wie die kleine Schrift auf der Note
  let schrift = '';
  for (let i = 0; i < 6; i++) schrift += `<rect x="5" y="${30 + i * 2.2}" width="${[17, 15, 16, 12, 16, 10][i]}" height="0.8" rx="0.4"/>`;
  let klein = '';
  for (let i = 0; i < 4; i++) klein += `<rect x="${52 - (i % 2) * 2}" y="${r1(h * 0.78 + i * 2)}" width="${12 + (i % 2) * 2}" height="0.7"/>`;
  return (
    `<svg viewBox="0 0 70 ${h}" class="geld-note" aria-hidden="true" style="--mm: ${n.mm}">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${n.verlauf[0]}"/><stop offset="0.5" stop-color="${n.verlauf[1]}"/><stop offset="1" stop-color="${n.verlauf[2]}"/></linearGradient>` +
    `<pattern id="${id}p" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="2.4" stroke="${n.linie}" stroke-width="0.25"/></pattern>` +
    `<clipPath id="${id}c"><rect width="70" height="${h}" rx="2"/></clipPath></defs>` +
    `<g clip-path="url(#${id}c)">` +
    `<rect width="70" height="${h}" fill="url(#${id})"/>` +
    `<rect width="70" height="${h}" fill="url(#${id}p)" opacity="0.45"/>` +
    // Streifen rechts (wie der Folienstreifen der echten Note)
    `<rect x="46" y="0" width="24" height="${h}" fill="${n.streifen}" opacity="0.35"/>` +
    motiv(n.motiv, n, h) +
    // helles Feld unten links (Wasserzeichen-Bereich)
    `<rect x="3" y="${r1(h * 0.68)}" width="27" height="${r1(h * 0.3)}" fill="#FFFFFF" opacity="0.4"/>` +
    // Wertzahl oben links, schmal und kräftig wie auf der Note
    `<text transform="translate(4 26) scale(0.84 1)" font-size="27" ${SCHRIFT} fill="${n.zahl}" letter-spacing="-1">${zahl}</text>` +
    `<g fill="${n.dunkel}" opacity="0.5">${schrift}</g>` +
    // Name in zwei Sprachen rechts, Kleingedrucktes darunter, Wert klein in der Ecke
    `<rect x="34" y="${r1(h * 0.69 - 5)}" width="34" height="12" fill="#FFFFFF" opacity="0.35"/>` +
    `<text x="66" y="${r1(h * 0.69)}" text-anchor="end" font-size="4.3" ${SCHRIFT} fill="${n.zahl}">${n.namen[0]}</text>` +
    `<text x="66" y="${r1(h * 0.69 + 5)}" text-anchor="end" font-size="4.3" ${SCHRIFT} fill="${n.zahl}">${n.namen[1]}</text>` +
    `<g fill="${n.dunkel}" opacity="0.45">${klein}</g>` +
    `<text x="66" y="${h - 3}" text-anchor="end" font-size="5" ${SCHRIFT} fill="${n.dunkel}">${zahl}</text>` +
    // Seriennummer senkrecht rechts, «Spielgeld» senkrecht links (statt Bankname)
    `<text transform="translate(63 ${r1(h * 0.22)}) rotate(90)" font-size="3.6" ${SCHRIFT} fill="${n.dunkel}" opacity="0.7" letter-spacing="0.5">HS${zahl}00${zahl}7</text>` +
    `<text transform="translate(7 ${h - 3}) rotate(-90)" font-size="3.8" ${SCHRIFT} fill="${n.dunkel}" letter-spacing="0.3">SPIELGELD · SPIELGELD</text>` +
    `<text transform="translate(11.5 ${h - 3}) rotate(-90)" font-size="3.8" ${SCHRIFT} fill="${n.dunkel}" letter-spacing="0.3">HANSIS SPIELPLATZ</text>` +
    `</g>` +
    `<rect x="0.4" y="0.4" width="69.2" height="${h - 0.8}" rx="2" fill="none" stroke="${n.dunkel}" stroke-opacity="0.6" stroke-width="0.8"/>` +
    `</svg>`
  );
}

export function geldSvg(wert) {
  return NOTE[wert] ? noteSvg(wert) : muenzeSvg(wert);
}
