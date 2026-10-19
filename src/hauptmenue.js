import { T } from './texte.js';
import { el, beiTipp, zeige } from './kern/ui.js';
import { elternschloss } from './kern/schloss.js';
import { SPIELE } from './spiele.js';

const BASIS = import.meta.env.BASE_URL;

export function zeigeHauptmenue(app) {
  const ausgeblendet = app.einstellungen.ausgeblendet ?? [];
  const kacheln = SPIELE.filter((spiel) => !ausgeblendet.includes(spiel.id)).map((spiel) => {
    const bereit = spiel.status === 'bereit';
    const kachel = el(
      'button',
      {
        class: `set-kachel spiel-kachel ${bereit ? '' : 'gesperrt'}`,
        type: 'button',
        style: `--set-farbe: ${spiel.farbe}`,
        'aria-disabled': bereit ? false : 'true',
      },
      el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${spiel.bild}`, alt: '' })),
      el('span', { class: 'set-name' }, T.spiele[spiel.id]),
      bereit ? null : el('span', { class: 'set-bald' }, T.hauptmenue.kommtBald),
    );
    if (bereit) beiTipp(kachel, () => spiel.starte(app));
    return kachel;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start hauptmenue' },
      el(
        'header',
        { class: 'start-kopf' },
        elternschloss(() => app.zeigeEinstellungen()),
        el('h1', { class: 'titel' }, T.hauptmenue.titel),
      ),
      el('p', { class: 'frage' }, T.hauptmenue.frage),
      el('div', { class: 'set-raster spiel-raster', style: `--anzahl: ${kacheln.length}` }, kacheln),
    ),
  );
}

