import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { FARBE } from './index.js';

const BASIS = import.meta.env.BASE_URL;

export function zeigeStart(r) {
  const R = T.reihenfolge;
  const kacheln = Object.keys(R.stufen).map((id) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}spiele/reihenfolge.svg`, alt: '' })),
      el('span', { class: 'set-name' }, R.stufen[id].titel),
      el('span', { class: 'modus-text' }, R.stufen[id].text),
    );
    beiTipp(k, () => r.waehleStufe(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => r.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.reihenfolge),
      ),
      el('p', { class: 'frage' }, R.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}
