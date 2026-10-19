import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { FARBE } from './index.js';

const BASIS = import.meta.env.BASE_URL;

function kachel(bild, titel, untertitel, aktion, farbe = FARBE) {
  const k = el(
    'button',
    { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${farbe}` },
    el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${bild}`, alt: '' })),
    el('span', { class: 'set-name' }, titel),
    untertitel ? el('span', { class: 'modus-text' }, untertitel) : null,
  );
  beiTipp(k, aktion);
  return k;
}

function zeigeRegeln() {
  const schliessen = () => hintergrund.remove();
  const hintergrund = el(
    'div',
    { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
    el(
      'div',
      { class: 'dialog regeln-dialog' },
      el('h2', { class: 'dialog-frage' }, T.nuenistei.regeln),
      el('ol', { class: 'regeln-liste' }, T.nuenistei.regelnText.map((satz) => el('li', {}, satz))),
      knopf(T.nuenistei.regelnSchliessen, schliessen, 'knopf-haupt'),
    ),
  );
  document.body.append(hintergrund);
}

export function zeigeStart(n) {
  const N = T.nuenistei;
  const laufend = n.laufendesSpiel();
  const kacheln = [];

  if (laufend) {
    const [a, b] = laufend.spielerIds.map((id) => n.profilVon(id).name);
    kacheln.push(kachel('spiele/nuenistei.svg', N.weiterspielen, N.weiterspielenText(a, b), n.weiterspielen, '#FBE7C6'));
  }
  kacheln.push(
    kachel('spiele/nuenistei.svg', N.zuZweit, N.zuZweitText, () => n.waehleModus({ gegner: 'mensch' })),
    kachel('spiele/tablet.svg', N.gegenTablet, N.gemuetlich, () =>
      n.waehleModus({ gegner: 'tablet', stufe: 'gemuetlich' }),
    ),
    kachel('spiele/tablet.svg', N.gegenTablet, N.knifflig, () =>
      n.waehleModus({ gegner: 'tablet', stufe: 'knifflig' }),
    ),
  );

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => n.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.nuenistei),
        knopf(N.regeln, zeigeRegeln, 'knopf-album'),
      ),
      el('p', { class: 'frage' }, N.frage),
      el('div', { class: 'set-raster' }, kacheln),
    ),
  );
}
