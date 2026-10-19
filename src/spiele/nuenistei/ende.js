import { T } from '../../texte.js';
import { el, knopf, zeige } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { konfetti } from '../../kern/konfetti.js';

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

// Am Schluss wird jede Seite gelobt – auch wer diesmal nicht gewonnen hat.
export function zeigeEnde(n) {
  const N = T.nuenistei;
  const { zustand, spielerIds } = n.partie;
  const spieler = spielerIds.map(n.profilVon);
  const sieger = zustand.sieger;

  let titel;
  let zeilen;
  if (sieger === 'remis') {
    titel = N.remis;
    zeilen = [N.lobRemis];
  } else {
    const gewinner = spieler[sieger];
    const andere = spieler[1 - sieger];
    titel = gewinner.computer ? N.tabletGewonnen : N.gewonnen(gewinner.name);
    zeilen = gewinner.computer ? [N.lobAndere(andere.name)] : [zufall(N.lobSieger)];
    if (!gewinner.computer && !andere.computer) zeilen.push(N.lobAndere(andere.name));
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: '--set-farbe: #EAD7B7' },
      el(
        'div',
        { class: 'ende-paar' },
        spieler.map((s, i) =>
          el(
            'div',
            { class: `ende-spieler ${sieger === i ? 'sieger' : ''}`, style: farbStil(s) },
            el('img', { class: 'avatar', src: avatarUrl(s), alt: '' }),
            el('span', { class: 'ergebnis-name' }, s.name),
          ),
        ),
      ),
      el('h1', { class: 'lob', 'data-vorlesen': titel }, titel),
      zeilen.map((z) => el('p', { class: 'zusammenfassung' }, z)),
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(N.nochmals, () => n.nochmals(), 'knopf-haupt'),
        knopf(N.hauptmenue, () => n.zeigeHauptmenue(), 'knopf-neben'),
      ),
    ),
  );

  klang.fertig();
  if (sieger === 'remis' || !spieler[sieger].computer) konfetti();
  sprich(titel);
}
