import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige } from '../ui.js';
import { speicher } from '../speicher.js';
import { alleProfile, avatarUrl, farbStil, findeProfil } from '../profile.js';

const MAX_SPIELER = 4;

export function zeigeSpieler(app) {
  // Die zuletzt gewählten Spieler sind schon vorausgewählt
  const gewaehlt = speicher.letzteSpieler.filter((id) => findeProfil(id));

  const losKnopf = knopf(T.spieler.los, () => {
    if (gewaehlt.length === 0) return;
    app.starteSpiel(gewaehlt.map(findeProfil));
  }, 'knopf-haupt knopf-los');

  const kacheln = alleProfile().map((profil) => {
    const nummer = el('span', { class: 'spieler-nummer', 'aria-hidden': 'true' });
    const kachel = el(
      'button',
      { class: 'spieler-kachel', type: 'button', style: farbStil(profil) },
      nummer,
      el('img', { class: 'avatar', src: avatarUrl(profil), alt: '' }),
      el('span', { class: 'spieler-name' }, profil.name),
    );
    beiTipp(kachel, () => {
      const index = gewaehlt.indexOf(profil.id);
      if (index >= 0) gewaehlt.splice(index, 1);
      else if (gewaehlt.length < MAX_SPIELER) gewaehlt.push(profil.id);
      aktualisiere();
    });
    return { profil, kachel, nummer };
  });

  const neuKachel = el(
    'button',
    { class: 'spieler-kachel spieler-neu', type: 'button' },
    el('span', { class: 'plus', 'aria-hidden': 'true' }, '+'),
    el('span', { class: 'spieler-name' }, T.spieler.neu),
  );
  beiTipp(neuKachel, () => app.zeigeProfil(null));

  function aktualisiere() {
    for (const { profil, kachel, nummer } of kacheln) {
      const index = gewaehlt.indexOf(profil.id);
      kachel.classList.toggle('gewaehlt', index >= 0);
      kachel.setAttribute('aria-pressed', index >= 0 ? 'true' : 'false');
      nummer.textContent = index >= 0 ? String(index + 1) : '';
    }
    losKnopf.classList.toggle('inaktiv', gewaehlt.length === 0);
    losKnopf.setAttribute('aria-disabled', gewaehlt.length === 0 ? 'true' : 'false');
  }
  aktualisiere();

  zeige(
    el(
      'main',
      { class: 'bildschirm spieler', style: `--set-farbe: ${app.auswahl.set.farbe}` },
      el(
        'header',
        { class: 'kopfzeile' },
        knopf(`‹ ${T.allgemein.zurueck}`, () => app.zeigeStufe(), 'knopf-zurueck'),
        el('h1', { class: 'kopf-titel' }, T.spieler.frage),
      ),
      el('p', { class: 'hinweis' }, T.spieler.hinweis),
      el('div', { class: 'spieler-raster' }, kacheln.map((k) => k.kachel), neuKachel),
      el('footer', { class: 'fusszeile' }, losKnopf),
    ),
  );
}
