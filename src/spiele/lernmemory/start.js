import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { ARTEN } from './index.js';

const BASIS = import.meta.env.BASE_URL;

export function zeigeStart(m) {
  const L = T.lernmemory;
  const kacheln = Object.entries(ARTEN).map(([id, art]) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${art.farbe}` },
      el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${art.bild}`, alt: '' })),
      el('span', { class: 'set-name' }, L.arten[id].titel),
      el('span', { class: 'modus-text' }, L.arten[id].text),
    );
    beiTipp(k, () => m.waehleArt(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => m.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.lernmemory),
      ),
      el('p', { class: 'frage' }, L.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}
