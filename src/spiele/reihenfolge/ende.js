import { T } from '../../texte.js';
import { el, knopf, zeige } from '../../kern/ui.js';
import { avatarUrl, farbStil, merkeRekord } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { konfetti } from '../../kern/konfetti.js';

function stern(verdient, nummer) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `stern ${verdient ? 'verdient' : 'leer'}`);
  svg.style.animationDelay = `${0.3 + nummer * 0.35}s`;
  const pfad = document.createElementNS(ns, 'path');
  pfad.setAttribute('d', 'M50 6 L62 37 L95 38 L69 59 L78 92 L50 73 L22 92 L31 59 L5 38 L38 37 Z');
  svg.append(pfad);
  return svg;
}

// Immer ein Lob – auch wer sich nur zwei Tiere gemerkt hat, hat etwas geschafft.
export function zeigeEnde(r, { profil, laenge, alles }) {
  const R = T.reihenfolge;
  const sterne = laenge >= 7 ? 3 : laenge >= 4 ? 2 : 1;
  const { neu, bisher } = merkeRekord(profil, `reihenfolge-${r.auswahl.stufe}`, laenge);
  const titel = alles ? R.ganzGeschafft : profil.gast ? T.ende.lob[0] : T.ende.lobPersoenlich(profil.name);

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: '--set-farbe: #EADCF7' },
      el('img', { class: 'avatar ende-avatar', src: avatarUrl(profil), alt: '', style: farbStil(profil) }),
      el('h1', { class: 'lob', 'data-vorlesen': titel }, titel),
      el('div', { class: 'sterne', role: 'img', 'aria-label': T.ende.sterne(sterne) }, [1, 2, 3].map((n) => stern(n <= sterne, n))),
      el('p', { class: 'zusammenfassung' }, laenge > 0 ? R.ergebnis(laenge) : R.nochNichts),
      profil.gast
        ? null
        : neu && laenge > 0
          ? el('p', { class: 'bestleistung neu' }, R.neuerRekord)
          : bisher
            ? el('p', { class: 'bestleistung' }, R.alterRekord(bisher))
            : null,
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => r.zeigeSpiel(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => r.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );
  klang.fertig();
  konfetti();
  sprich(titel);
}
