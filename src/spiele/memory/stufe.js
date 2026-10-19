import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { STUFEN } from './sets.js';
import { speicher } from '../../kern/speicher.js';
import { findeProfil } from '../../kern/profile.js';
import { passendeStufe } from '../../kern/schulstufe.js';

// Passende Kartenzahl je Schulstufe
const EMPFEHLUNG = { vorkg: 'leicht', kg: 'leicht', kl12: 'mittel', kl34: 'schwer', kl56: 'schwer' };

export function zeigeStufe(app) {
  const zuletzt = speicher.letzteSpieler.map(findeProfil).filter(Boolean);
  const empfohlen = passendeStufe(zuletzt, EMPFEHLUNG);
  const knoepfe = Object.entries(STUFEN).map(([id, stufe]) => {
    // Kleine Kartenstapel zeigen die Menge, nicht nur das Wort
    const punkte = Array.from({ length: stufe.paare * 2 }, () =>
      el('span', { class: 'mini-karte' }),
    );
    const k = el(
      'button',
      { class: `stufe-knopf stufe-${id}`, type: 'button' },
      el('span', { class: 'stufe-name' }, T.stufe[id]),
      el('span', { class: 'stufe-paare' }, T.stufe.paare(stufe.paare)),
      el('span', { class: 'mini-karten', 'aria-hidden': 'true' }, punkte),
      empfohlen?.stufe === id ? el('span', { class: 'passt-schild' }, T.schule.passtFuer(empfohlen.profil.name)) : null,
    );
    beiTipp(k, () => app.waehleStufe(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm stufe', style: `--set-farbe: ${app.auswahl.set.farbe}` },
      el(
        'header',
        { class: 'kopfzeile' },
        knopf(`‹ ${T.allgemein.zurueck}`, () => app.zeigeStart(), 'knopf-zurueck'),
        el('h1', { class: 'kopf-titel' }, app.auswahl.set.name),
      ),
      el('p', { class: 'frage' }, T.stufe.frage),
      el('div', { class: 'stufe-liste' }, knoepfe),
    ),
  );
}
