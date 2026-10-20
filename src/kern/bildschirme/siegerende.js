// Schluss für Spiele mit einem Sieger (Vier gewinnt, Tschau Sepp): alle Spieler mit Bild,
// der Sieger hervorgehoben; gelobt werden alle. sieger = Index oder null (unentschieden).
import { T } from '../../texte.js';
import { el, knopf, zeige } from '../ui.js';
import { avatarUrl, farbStil } from '../profile.js';
import { klang } from '../klang.js';
import { sprich } from '../vorlesen.js';
import { konfetti } from '../konfetti.js';

export function zeigeSiegerEnde(steuerung, { spieler, sieger, farbe, zusatz = null }) {
  const E = T.siegerende;
  const gewinner = sieger === null ? null : spieler[sieger];
  // «Diesmal hat das Tablet gewonnen.» – bei mehreren Tablets mit Namen («Tablet 2 hat gewonnen!»)
  const einTablet = spieler.filter((p) => p.computer).length === 1;
  const titel = !gewinner ? E.unentschieden : gewinner.computer && einTablet ? E.tabletGewonnen : E.gewonnen(gewinner.name);
  const menschen = spieler.filter((p, i) => !p.computer && i !== sieger);
  const zeilen = [zusatz, ...menschen.map((p) => E.lob(p.name))].filter(Boolean);

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: `--set-farbe: ${farbe}` },
      el(
        'div',
        { class: 'ende-paar' },
        spieler.map((p, i) =>
          el(
            'div',
            { class: `ende-spieler ${sieger === i ? 'sieger' : ''}`, style: farbStil(p) },
            el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }),
            el('span', { class: 'ergebnis-name' }, p.name),
          ),
        ),
      ),
      el('h1', { class: 'lob', 'data-vorlesen': titel }, titel),
      zeilen.map((z) => el('p', { class: 'zusammenfassung' }, z)),
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => steuerung.nochmals(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => steuerung.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );
  klang.fertig();
  if (gewinner && !gewinner.computer) konfetti();
  sprich(titel);
}
