import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../ui.js';
import { alleProfile, avatarUrl, farbStil, findeProfil } from '../profile.js';

// Spielerauswahl für alle Spiele.
// optionen: { farbe, min, max, vorauswahl, zurueck(), weiter(profile) }
// vorauswahl = Profil-IDs, die schon gewählt sind (z.B. die zuletzt gewählten)
export function zeigeSpieler(app, optionen) {
  const { farbe, min = 1, max = 4, vorauswahl = [], zurueck, weiter } = optionen;
  const gewaehlt = vorauswahl
    .filter((id) => alleProfile().some((p) => p.id === id))
    .slice(0, max);

  const losKnopf = knopf(T.spieler.los, () => {
    if (gewaehlt.length < min) return;
    weiter(gewaehlt.map(findeProfil));
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
      else if (gewaehlt.length < max) gewaehlt.push(profil.id);
      aktualisiere();
    }, { scrollbar: true });
    return { profil, kachel, nummer };
  });

  const neuKachel = el(
    'button',
    { class: 'spieler-kachel spieler-neu', type: 'button' },
    el('span', { class: 'plus', 'aria-hidden': 'true' }, '+'),
    el('span', { class: 'spieler-name' }, T.spieler.neu),
  );
  beiTipp(
    neuKachel,
    () =>
      app.zeigeProfil(null, (neu) => {
        // Ein neu angelegter Spieler ist gleich ausgewählt
        const auswahl = neu && gewaehlt.length < max ? [...gewaehlt, neu.id] : gewaehlt;
        zeigeSpieler(app, { ...optionen, vorauswahl: auswahl });
      }),
    { scrollbar: true },
  );

  function aktualisiere() {
    for (const { profil, kachel, nummer } of kacheln) {
      const index = gewaehlt.indexOf(profil.id);
      kachel.classList.toggle('gewaehlt', index >= 0);
      kachel.setAttribute('aria-pressed', index >= 0 ? 'true' : 'false');
      nummer.textContent = index >= 0 ? String(index + 1) : '';
    }
    losKnopf.classList.toggle('inaktiv', gewaehlt.length < min);
    losKnopf.setAttribute('aria-disabled', gewaehlt.length < min ? 'true' : 'false');
  }
  aktualisiere();

  zeige(
    el(
      'main',
      { class: 'bildschirm spieler', style: `--set-farbe: ${farbe}` },
      el(
        'header',
        { class: 'kopfzeile' },
        knopf(`‹ ${T.allgemein.zurueck}`, zurueck, 'knopf-zurueck'),
        el('h1', { class: 'kopf-titel' }, T.spieler.frage),
      ),
      el('p', { class: 'hinweis' }, T.spieler.hinweis(min, max)),
      el('div', { class: 'spieler-raster' }, kacheln.map((k) => k.kachel), neuKachel),
      el('footer', { class: 'fusszeile' }, losKnopf),
    ),
  );
}
