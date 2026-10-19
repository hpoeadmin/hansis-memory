// Spielgeld als SVG: einfache Münzen und Noten, klar als Spielgeld erkennbar.
const K = '#2E2A26';
const SCHRIFT = "font-family=\"'Atkinson Hyperlegible', system-ui, sans-serif\" font-weight=\"700\"";

const MUENZE = {
  5: { r: 30, farbe: '#E8C766' },
  10: { r: 32, farbe: '#D5DBE1' },
  20: { r: 34, farbe: '#D5DBE1' },
  50: { r: 30, farbe: '#D5DBE1' },
  100: { r: 36, farbe: '#D5DBE1' },
  200: { r: 40, farbe: '#D5DBE1' },
  500: { r: 44, farbe: '#D5DBE1' },
};
const NOTE = { 1000: '#F6C945', 2000: '#EF9A9A', 5000: '#9CCC7A' };

export function geldSvg(wert) {
  if (NOTE[wert]) {
    return (
      `<svg viewBox="0 0 140 76" class="geld-note"><rect x="3" y="3" width="134" height="70" rx="10" fill="${NOTE[wert]}" stroke="${K}" stroke-width="5"/>` +
      `<rect x="12" y="12" width="116" height="52" rx="6" fill="none" stroke="${K}" stroke-opacity="0.35" stroke-width="3"/>` +
      `<text x="70" y="46" text-anchor="middle" font-size="30" ${SCHRIFT} fill="${K}">${wert / 100}</text>` +
      `<text x="70" y="64" text-anchor="middle" font-size="12" ${SCHRIFT} fill="${K}">FRANKEN</text></svg>`
    );
  }
  const { r, farbe } = MUENZE[wert];
  const zahl = wert < 100 ? wert : wert / 100;
  const einheit = wert < 100 ? 'Rp.' : 'Fr.';
  const g = 100;
  return (
    `<svg viewBox="0 0 ${g} ${g}" class="geld-muenze" style="width: ${r * 2.2}px"><circle cx="50" cy="50" r="46" fill="${farbe}" stroke="${K}" stroke-width="5"/>` +
    `<circle cx="50" cy="50" r="37" fill="none" stroke="${K}" stroke-opacity="0.3" stroke-width="3"/>` +
    `<text x="50" y="56" text-anchor="middle" font-size="${String(zahl).length > 1 ? 30 : 36}" ${SCHRIFT} fill="${K}">${zahl}</text>` +
    `<text x="50" y="76" text-anchor="middle" font-size="14" ${SCHRIFT} fill="${K}">${einheit}</text></svg>`
  );
}
