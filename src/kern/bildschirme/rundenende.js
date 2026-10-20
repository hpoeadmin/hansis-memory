// Gemeinsamer Abschluss für Fragerunden (Wo wohne ich?, Wortarten, Bezahlen mit Franken):
// Einzelspiel mit Sternen, Mehrspieler mit Lob für alle.
// texte: { einzel(richtig, gesamt), spieler(n) }; zusatz(s): optionale Zeile im Einzelspiel
import { T } from '../../texte.js';
import { el, knopf, zeige, mischen } from '../ui.js';
import { avatarUrl, farbStil } from '../profile.js';
import { klang } from '../klang.js';
import { sprich } from '../vorlesen.js';
import { konfetti } from '../konfetti.js';

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

// ruhig: für Erwachsene (KopfFit) – sachlicheres Lob, kein Konfetti
export function zeigeRundenende(steuerung, { spieler, gesamt, texte, farbe, zusatz, ruhig = false }) {
  let inhalt;
  if (spieler.length === 1) {
    const s = spieler[0];
    // Viele Treffer beim ersten Versuch = viele Sterne; mindestens einer gibt es immer
    const sterne = s.richtig >= gesamt * 0.9 ? 3 : s.richtig >= gesamt * 0.6 ? 2 : 1;
    const titel = ruhig ? T.ende.lobRuhig(s.profil.gast ? null : s.profil.name) : s.profil.gast ? T.ende.lob[0] : T.ende.lobPersoenlich(s.profil.name);
    inhalt = [
      el('img', { class: 'avatar ende-avatar', src: avatarUrl(s.profil), alt: '', style: farbStil(s.profil) }),
      el('h1', { class: 'lob', 'data-vorlesen': titel }, titel),
      el('div', { class: 'sterne', role: 'img', 'aria-label': T.ende.sterne(sterne) }, [1, 2, 3].map((n) => stern(n <= sterne, n))),
      el('p', { class: 'zusammenfassung' }, texte.einzel(s.richtig, gesamt)),
      zusatz?.(s) ?? null,
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
            el('span', { class: 'ergebnis-paare' }, texte.spieler(s.richtig)),
          ),
        ),
      ),
    ];
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: `--set-farbe: ${farbe}` },
      inhalt,
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => steuerung.zeigeSpiel(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => steuerung.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );
  klang.fertig();
  if (!ruhig) konfetti();
  const titel = document.querySelector('[data-vorlesen]');
  if (titel) sprich(titel.dataset.vorlesen);
}
