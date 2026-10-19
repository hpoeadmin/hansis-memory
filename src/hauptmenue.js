import { T } from './texte.js';
import { el, beiTipp, zeige } from './kern/ui.js';
import { elternschloss } from './kern/schloss.js';
import { BEREICHE, SPIELE } from './spiele.js';

const BASIS = import.meta.env.BASE_URL;

function kachel(app, spiel) {
  const k = el(
    'button',
    { class: 'set-kachel spiel-kachel', type: 'button', style: `--set-farbe: ${spiel.farbe}` },
    el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${spiel.bild}`, alt: '' })),
    el('span', { class: 'set-name' }, T.spiele[spiel.id]),
    el('span', { class: 'alters-schild' }, T.schule.ab[spiel.ab]),
  );
  // Das Menü kann scrollen: ein Tipp zählt erst beim Loslassen ohne Wischen
  beiTipp(k, () => spiel.starte(app), { scrollbar: true });
  return k;
}

// Hauptmenü: ein Abschnitt pro Bereich (Gedächtnis, Zahlen, Lesen …); leere Bereiche fehlen
export function zeigeHauptmenue(app) {
  const ausgeblendet = app.einstellungen.ausgeblendet ?? [];
  const sichtbar = SPIELE.filter((spiel) => !ausgeblendet.includes(spiel.id));
  const abschnitte = BEREICHE.map((bereich) => {
    const spiele = sichtbar.filter((s) => s.bereich === bereich);
    if (!spiele.length) return null;
    return el(
      'section',
      { class: 'bereich' },
      el('h2', { class: 'bereich-titel' }, T.bereiche[bereich]),
      el('div', { class: 'bereich-raster' }, spiele.map((s) => kachel(app, s))),
    );
  }).filter(Boolean);

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
      el('div', { class: 'hauptmenue-inhalt' }, abschnitte, el('p', { class: 'version-zeile' }, T.version(__VERSION__))),
    ),
  );
}
