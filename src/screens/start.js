import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige } from '../ui.js';
import { bildUrl } from '../sets.js';
import { elternschloss } from '../schloss.js';

export function zeigeStart(app) {
  const kacheln = app.sets.map((set) => {
    const bereit = set.status === 'bereit';
    const kachel = el(
      'button',
      {
        class: `set-kachel ${bereit ? '' : 'gesperrt'}`,
        type: 'button',
        style: `--set-farbe: ${set.farbe}`,
        'aria-disabled': bereit ? false : 'true',
      },
      el(
        'div',
        { class: 'set-bild' },
        set.titelbild
          ? el('img', { src: bildUrl(set, set.titelbild), alt: '' })
          : el('span', { class: 'set-fragezeichen', 'aria-hidden': 'true' }, '?'),
      ),
      el('span', { class: 'set-name' }, set.name),
      bereit ? null : el('span', { class: 'set-bald' }, T.start.kommtBald),
    );
    if (bereit) beiTipp(kachel, () => app.waehleSet(set));
    return kachel;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        elternschloss(() => app.zeigeEinstellungen()),
        el('h1', { class: 'titel' }, T.start.titel),
        knopf(T.album.knopf, () => app.zeigeAlbum(), 'knopf-album'),
      ),
      el('p', { class: 'frage' }, T.start.frage),
      el('div', { class: 'set-raster' }, kacheln),
    ),
  );
}
