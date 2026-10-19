import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige } from '../ui.js';
import { speicher } from '../speicher.js';
import { bildUrl } from '../sets.js';
import { albumVon, avatarUrl, farbStil } from '../profile.js';
import { abzeichen } from '../abzeichen.js';
import { sprich } from '../vorlesen.js';

function zeigeTier(set, tier) {
  const schliessen = () => hintergrund.remove();
  const hintergrund = el(
    'div',
    { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
    el(
      'div',
      { class: 'dialog tier-dialog' },
      el('img', { class: 'tier-gross', src: bildUrl(set, tier.bild), alt: '' }),
      el('h2', { class: 'tier-name' }, tier.name),
      el('p', { class: 'tier-info' }, tier.info),
      knopf(T.album.schliessen, schliessen, 'knopf-haupt'),
    ),
  );
  // Tipp neben das Fenster schliesst es ebenfalls
  beiTipp(hintergrund, (e) => {
    if (e.target === hintergrund) schliessen();
  });
  document.body.append(hintergrund);
  sprich(`${tier.name}. ${tier.info}`);
}

function setAbschnitt(set, gesammelt) {
  const komplett = gesammelt.length === set.tiere.length;
  const felder = set.tiere.map((tier) => {
    if (!gesammelt.includes(tier.id)) {
      return el(
        'div',
        { class: 'album-feld leer', 'aria-label': T.album.nochNicht },
        el('span', { class: 'album-fragezeichen', 'aria-hidden': 'true' }, '?'),
      );
    }
    const feld = el(
      'button',
      { class: 'album-feld', type: 'button', 'aria-label': tier.name },
      el('img', { src: bildUrl(set, tier.bild), alt: '' }),
      el('span', { class: 'album-name' }, tier.name),
    );
    beiTipp(feld, () => zeigeTier(set, tier), { scrollbar: true });
    return feld;
  });

  return el(
    'section',
    { class: 'album-set', style: `--set-farbe: ${set.farbe}` },
    el(
      'header',
      { class: 'album-set-kopf' },
      el('h2', {}, set.name),
      el('span', { class: 'album-anzahl' }, T.album.anzahl(gesammelt.length, set.tiere.length)),
      komplett ? abzeichen(set) : null,
    ),
    el(
      'div',
      { class: 'fortschritt', 'aria-hidden': 'true' },
      el('span', { style: `width: ${(gesammelt.length / set.tiere.length) * 100}%` }),
    ),
    el('div', { class: 'album-raster' }, felder),
  );
}

export function zeigeAlbum(app, profilId) {
  const profile = speicher.profile;
  const kopf = el(
    'header',
    { class: 'kopfzeile' },
    knopf(`‹ ${T.allgemein.zurueck}`, () => app.zeigeStart(), 'knopf-zurueck'),
    el('h1', { class: 'kopf-titel' }, T.album.titel),
  );

  if (profile.length === 0) {
    zeige(el('main', { class: 'bildschirm album' }, kopf, el('p', { class: 'hinweis' }, T.album.keineSpieler)));
    return;
  }

  const profil =
    profile.find((p) => p.id === profilId) ??
    profile.find((p) => speicher.letzteSpieler.includes(p.id)) ??
    profile[0];

  const reiter = profile.map((p) => {
    const r = el(
      'button',
      {
        class: `album-reiter ${p.id === profil.id ? 'aktiv' : ''}`,
        type: 'button',
        style: farbStil(p),
        'aria-pressed': p.id === profil.id ? 'true' : 'false',
      },
      el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }),
      el('span', {}, p.name),
    );
    beiTipp(r, () => zeigeAlbum(app, p.id), { scrollbar: true });
    return r;
  });

  const spielbar = app.sets.filter((s) => s.status === 'bereit');
  const abzeichenListe = spielbar
    .filter((s) => albumVon(profil, s.id).length === s.tiere.length)
    .map((s) => abzeichen(s, true));

  zeige(
    el(
      'main',
      { class: 'bildschirm album' },
      kopf,
      profile.length > 1 ? el('div', { class: 'album-reiter-liste' }, reiter) : null,
      el(
        'div',
        { class: 'album-inhalt' },
        el('h2', { class: 'album-wessen', style: farbStil(profil) }, T.album.wessen(profil.name)),
        el(
          'section',
          { class: 'abzeichen-bereich' },
          el('h2', {}, T.album.abzeichen),
          abzeichenListe.length
            ? el('div', { class: 'abzeichen-liste' }, abzeichenListe)
            : el('p', { class: 'hinweis' }, T.album.keineAbzeichen),
        ),
        spielbar.map((s) => setAbschnitt(s, albumVon(profil, s.id))),
      ),
    ),
  );
}
