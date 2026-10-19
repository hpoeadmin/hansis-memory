import { T } from '../../texte.js';
import { el, knopf, zeige } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { konfetti } from '../../kern/konfetti.js';
import { FARBE } from './index.js';

// Am Schluss wird jede Seite gelobt – auch wer diesmal nicht gewonnen hat.
export function zeigeEnde(s) {
  const S = T.schiffe;
  const { spielerIds, sieger, bretter } = s.partie;
  const spieler = spielerIds.map(s.profilVon);
  const gewinner = spieler[sieger];
  const andere = spieler[1 - sieger];
  const schuesse = bretter[1 - sieger].schuesse.length;

  const titel = gewinner.computer ? S.tabletGewonnen : S.gewonnen(gewinner.name);
  const zeilen = [gewinner.computer ? S.lobAndere(andere.name) : S.mitSchuessen(schuesse)];
  if (!gewinner.computer && !andere.computer) zeilen.push(S.lobAndere(andere.name));

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: `--set-farbe: ${FARBE}` },
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
        knopf(T.ende.nochmals, () => s.nochmals(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => s.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );

  klang.fertig();
  if (!gewinner.computer) konfetti();
  sprich(titel);
}
