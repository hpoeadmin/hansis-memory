import { T } from '../../texte.js';
import { el, knopf, zeige } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { konfetti } from '../../kern/konfetti.js';
import { imZiel } from './regeln.js';
import { FARBEN } from './brett.js';

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

// Am Schluss werden alle gelobt; die Liste zeigt, wie viele Figuren jede Farbe im Ziel hat.
export function zeigeEnde(e) {
  const E = T.eilemitweile;
  const N = T.nuenistei;
  const { zustand, sitze } = e.partie;
  const sieger = zustand.sieger;
  const gewinner = e.profilVon(sitze.find((s) => s.arm === sieger).profilId);
  const titel = gewinner.computer ? N.tabletGewonnen : N.gewonnen(gewinner.name);
  const lobsaetze = [...T.ende.lobSpieler];

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: '--set-farbe: #F6E3B4' },
      el('h1', { class: 'lob lob-alle', 'data-vorlesen': titel }, titel),
      el('p', { class: 'zusammenfassung' }, gewinner.computer ? T.ende.alleTitel : zufall(N.lobSieger)),
      el(
        'ul',
        { class: 'ergebnis-liste' },
        sitze.map((s, i) => {
          const p = e.profilVon(s.profilId);
          return el(
            'li',
            { class: 'ergebnis-zeile', style: `${farbStil(p)} --spieler-farbe: ${FARBEN[s.arm]}` },
            el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }),
            el(
              'span',
              { class: 'ergebnis-text' },
              el('span', { class: 'ergebnis-name' }, `${p.name} · ${E.farben[s.arm]}`),
              el('span', { class: 'ergebnis-lob' }, lobsaetze[i % lobsaetze.length]),
            ),
            el('span', { class: 'ergebnis-paare' }, E.imZiel(imZiel(zustand, s.arm))),
            s.arm === sieger ? el('span', { class: 'ergebnis-abzeichen' }, '★') : null,
          );
        }),
      ),
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(N.nochmals, () => e.nochmals(), 'knopf-haupt'),
        knopf(N.hauptmenue, () => e.zeigeHauptmenue(), 'knopf-neben'),
      ),
    ),
  );

  klang.fertig();
  if (!gewinner.computer) konfetti();
  sprich(titel);
}
