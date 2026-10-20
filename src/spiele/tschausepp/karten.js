// Französische Jasskarten als SVG: Ecken mit Wert und Farbe, in der Mitte das Farbzeichen gross,
// bei Bauer, Dame und König ein Buchstabe im Rahmen.
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

export const ZEICHEN = { herz: '♥', ecke: '♦', schaufel: '♠', kreuz: '♣' };
export const ROT = { herz: true, ecke: true, schaufel: false, kreuz: false };
const FIGUR = { B: 'Bauer', D: 'Dame', K: 'König' };

export function farbe(f) {
  return ROT[f] ? '#D0342C' : '#22201E';
}

export function karteSvg({ farbe: f, wert }) {
  const c = farbe(f);
  const z = ZEICHEN[f];
  const mitte = FIGUR[wert]
    ? `<rect x="22" y="34" width="56" height="72" rx="8" fill="${ROT[f] ? '#FDECEB' : '#EEF0F2'}" stroke="${c}" stroke-width="2.5"/>` +
      `<text x="50" y="80" text-anchor="middle" font-size="40" ${SCHRIFT} fill="${c}">${wert}</text>` +
      `<text x="50" y="100" text-anchor="middle" font-size="16" fill="${c}">${z}</text>`
    : `<text x="50" y="88" text-anchor="middle" font-size="${wert === 'A' ? 62 : 50}" fill="${c}">${z}</text>`;
  return (
    `<svg viewBox="0 0 100 140" class="ts-karte-svg" aria-hidden="true">` +
    `<rect x="2" y="2" width="96" height="136" rx="10" fill="#FFFFFF" stroke="${K}" stroke-width="3"/>` +
    `<text x="10" y="26" font-size="${wert === '10' ? 20 : 24}" ${SCHRIFT} fill="${c}">${wert}</text>` +
    `<text x="11" y="44" font-size="18" fill="${c}">${z}</text>` +
    `<g transform="rotate(180 50 70)"><text x="10" y="26" font-size="${wert === '10' ? 20 : 24}" ${SCHRIFT} fill="${c}">${wert}</text>` +
    `<text x="11" y="44" font-size="18" fill="${c}">${z}</text></g>` +
    mitte +
    `</svg>`
  );
}

export function rueckseiteSvg() {
  let muster = '';
  for (let y = 16; y < 130; y += 14) for (let x = 14; x < 92; x += 14) muster += `<circle cx="${x}" cy="${y}" r="3" fill="#FFFFFF" opacity="0.5"/>`;
  return (
    `<svg viewBox="0 0 100 140" class="ts-karte-svg" aria-hidden="true">` +
    `<rect x="2" y="2" width="96" height="136" rx="10" fill="#2E5FA8" stroke="${K}" stroke-width="3"/>` +
    `<rect x="9" y="9" width="82" height="122" rx="6" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.7"/>` +
    muster +
    `</svg>`
  );
}

export const kartenName = ({ farbe: f, wert }, T) => `${T.tschausepp.farben[f]} ${T.tschausepp.werte[wert] ?? wert}`;
