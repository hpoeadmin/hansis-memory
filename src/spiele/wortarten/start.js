import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { speicher } from '../../kern/speicher.js';
import { findeProfil } from '../../kern/profile.js';
import { passendeStufe } from '../../kern/schulstufe.js';
import { FARBE } from './index.js';

const EMPFEHLUNG = { kl12: 'zwei', kl34: 'drei', kl56: 'profi' };

// Kleines Bild pro Stufe: die Kisten, die vorkommen
function kistenBild(stufe) {
  const arten = stufe === 'zwei' ? ['nomen', 'verb'] : ['nomen', 'verb', 'adjektiv'];
  const box = el('div', { class: 'set-bild wa-stufenbild' });
  box.append(
    ...arten.map((art) =>
      el('span', { class: `wa-mini wa-${art}` }, stufe === 'profi' ? T.wortarten.kisten[art].name.toUpperCase() : T.wortarten.kisten[art].name),
    ),
  );
  return box;
}

export function zeigeStart(w) {
  const W = T.wortarten;
  const empfohlen = passendeStufe(speicher.letzteSpieler.map(findeProfil).filter(Boolean), EMPFEHLUNG);
  const kacheln = Object.keys(W.stufen).map((id) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      kistenBild(id),
      el('span', { class: 'set-name' }, W.stufen[id].titel),
      el('span', { class: 'modus-text' }, W.stufen[id].text),
      empfohlen?.stufe === id ? el('span', { class: 'passt-schild' }, T.schule.passtFuer(empfohlen.profil.name)) : null,
    );
    beiTipp(k, () => w.waehleStufe(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => w.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.wortarten),
      ),
      el('p', { class: 'frage' }, W.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}
