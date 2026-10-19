import { T } from '../../texte.js';
import { el, knopf, zeige, mischen } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
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

export function zeigeEnde(l, { spieler, gesamt }) {
  const L = T.lebensraum;
  let inhalt;
  if (spieler.length === 1) {
    const s = spieler[0];
    // Sterne wie beim Memory: viele Treffer beim ersten Versuch = viele Sterne
    const sterne = s.richtig >= gesamt * 0.9 ? 3 : s.richtig >= gesamt * 0.6 ? 2 : 1;
    const titel = s.profil.gast ? T.ende.lob[0] : T.ende.lobPersoenlich(s.profil.name);
    inhalt = [
      el('img', { class: 'avatar ende-avatar', src: avatarUrl(s.profil), alt: '', style: farbStil(s.profil) }),
      el('h1', { class: 'lob', 'data-vorlesen': titel }, titel),
      el('div', { class: 'sterne', role: 'img', 'aria-label': T.ende.sterne(sterne) }, [1, 2, 3].map((n) => stern(n <= sterne, n))),
      el('p', { class: 'zusammenfassung' }, L.ergebnisEinzel(s.richtig, gesamt)),
      s.neueTiere.length ? el('p', { class: 'neu-im-album' }, T.ende.neuImAlbum(s.neueTiere.map((t) => t.name).join(', '))) : null,
    ];
  } else {
    const lob = mischen(T.ende.lobSpieler);
    inhalt = [
      el('h1', { class: 'lob lob-alle', 'data-vorlesen': T.ende.alleTitel }, T.ende.alleTitel),
      el(
        'ul',
        { class: 'ergebnis-liste' },
        spieler.map((s, i) =>
          el(
            'li',
            { class: 'ergebnis-zeile', style: farbStil(s.profil) },
            el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
            el('span', { class: 'ergebnis-text' }, el('span', { class: 'ergebnis-name' }, s.profil.name), el('span', { class: 'ergebnis-lob' }, lob[i % lob.length])),
            el('span', { class: 'ergebnis-paare' }, L.ergebnisSpieler(s.richtig)),
          ),
        ),
      ),
    ];
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: '--set-farbe: #FBE7C6' },
      inhalt,
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => l.zeigeSpiel(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => l.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );
  klang.fertig();
  konfetti();
  const titel = document.querySelector('[data-vorlesen]');
  if (titel) sprich(titel.dataset.vorlesen);
}
