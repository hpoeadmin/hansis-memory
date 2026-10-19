import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { STUFEN } from './sets.js';

export function zeigeStufe(app) {
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
