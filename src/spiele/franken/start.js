import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { speicher } from '../../kern/speicher.js';
import { findeProfil } from '../../kern/profile.js';
import { passendeStufe } from '../../kern/schulstufe.js';
import { FARBE } from './index.js';
import { geldSvg } from './bilder.js';

const EMPFEHLUNG = { kl12: 'franken', kl34: 'rappen', kl56: 'rueckgeld' };
const BILD = { franken: [500, 200], rappen: [200, 50], kopf: [50, 5], rueckgeld: [2000] };

export function zeigeStart(f) {
  const F = T.franken;
  const empfohlen = passendeStufe(speicher.letzteSpieler.map(findeProfil).filter(Boolean), EMPFEHLUNG);
  const kacheln = Object.keys(F.stufen).map((id) => {
    const bild = el('div', { class: 'set-bild fr-stufenbild' });
    bild.innerHTML = BILD[id].map(geldSvg).join('');
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      bild,
      el('span', { class: 'set-name' }, F.stufen[id].titel),
      el('span', { class: 'modus-text' }, F.stufen[id].text),
      empfohlen?.stufe === id ? el('span', { class: 'passt-schild' }, T.schule.passtFuer(empfohlen.profil.name)) : null,
    );
    beiTipp(k, () => f.waehleStufe(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => f.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.franken),
      ),
      el('p', { class: 'frage' }, F.frage),
      el('div', { class: 'set-raster' }, kacheln),
    ),
  );
}
