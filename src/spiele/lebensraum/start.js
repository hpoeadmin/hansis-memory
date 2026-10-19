import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { FARBE } from './index.js';

const BASIS = import.meta.env.BASE_URL;

export function zeigeStart(l) {
  const L = T.lebensraum;
  const kacheln = Object.keys(L.runden).map((id) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}spiele/lebensraum.svg`, alt: '' })),
      el('span', { class: 'set-name' }, L.runden[id].titel),
      el('span', { class: 'modus-text' }, L.runden[id].text),
    );
    beiTipp(k, () => l.waehleLaenge(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => l.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.lebensraum),
      ),
      el('p', { class: 'frage' }, L.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}
