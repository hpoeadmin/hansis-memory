import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { FARBE } from './index.js';
import { FARBEN } from './brett.js';

const BASIS = import.meta.env.BASE_URL;
const ARME = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };

function zeigeRegeln() {
  const schliessen = () => hintergrund.remove();
  const hintergrund = el(
    'div',
    { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
    el(
      'div',
      { class: 'dialog regeln-dialog' },
      el('h2', { class: 'dialog-frage' }, T.nuenistei.regeln),
      el('ol', { class: 'regeln-liste' }, T.eilemitweile.regelnText.map((satz) => el('li', {}, satz))),
      knopf(T.nuenistei.regelnSchliessen, schliessen, 'knopf-haupt'),
    ),
  );
  document.body.append(hintergrund);
}

// Kachelbild: so viele Figuren wie Farben
function figurenBild(anzahl) {
  const figuren = ARME[anzahl]
    .map((arm, i) => {
      const x = 100 + (i - (anzahl - 1) / 2) * 52;
      return (
        `<circle cx="${x}" cy="104" r="22" fill="${FARBEN[arm]}" stroke="#2E2A26" stroke-width="6"/>` +
        `<circle cx="${x - 7}" cy="99" r="3.5" fill="#2E2A26"/><circle cx="${x + 7}" cy="99" r="3.5" fill="#2E2A26"/>` +
        `<path d="M${x - 7} 109 Q${x} 115 ${x + 7} 109" fill="none" stroke="#2E2A26" stroke-width="3" stroke-linecap="round"/>`
      );
    })
    .join('');
  const bild = el('div', { class: 'set-bild' });
  bild.innerHTML = `<svg viewBox="0 0 200 200" width="100%" height="100%">${figuren}</svg>`;
  return bild;
}
function kachel(inhalt, titel, untertitel, aktion, farbe = FARBE) {
  const k = el(
    'button',
    { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${farbe}` },
    inhalt,
    el('span', { class: 'set-name' }, titel),
    untertitel ? el('span', { class: 'modus-text' }, untertitel) : null,
  );
  beiTipp(k, aktion);
  return k;
}

export function zeigeStart(e) {
  const E = T.eilemitweile;
  const laufend = e.laufendesSpiel();
  const kacheln = [];

  if (laufend) {
    const namen = laufend.sitze.map((s) => e.profilVon(s.profilId).name).join(', ');
    kacheln.push(
      kachel(
        el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}spiele/eilemitweile.svg`, alt: '' })),
        T.nuenistei.weiterspielen,
        namen,
        e.weiterspielen,
        '#FBE7C6',
      ),
    );
  }
  for (const anzahl of [2, 3, 4]) {
    kacheln.push(kachel(figurenBild(anzahl), E.anzahl(anzahl), E.anzahlText, () => e.waehleAnzahl(anzahl)));
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => e.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.eilemitweile),
        knopf(T.nuenistei.regeln, zeigeRegeln, 'knopf-album'),
      ),
      el('p', { class: 'frage' }, E.frage),
      el('div', { class: 'set-raster' }, kacheln),
    ),
  );
}
