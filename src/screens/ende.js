import { T } from '../texte.js';
import { el, knopf, zeige, mischen } from '../ui.js';
import { avatarUrl, farbStil, merkeBestleistung } from '../profile.js';
import { klang } from '../klang.js';
import { sprich } from '../vorlesen.js';
import { konfetti } from '../konfetti.js';

// Sterne: immer mindestens einer – es gibt kein «Verlieren».
export function berechneSterne(paare, zuege) {
  if (zuege <= paare * 1.5) return 3;
  if (zuege <= paare * 2.5) return 2;
  return 1;
}

function stern(verdient, nummer) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `stern ${verdient ? 'verdient' : 'leer'}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.animationDelay = `${0.3 + nummer * 0.35}s`;
  const pfad = document.createElementNS(ns, 'path');
  pfad.setAttribute(
    'd',
    'M50 6 L62 37 L95 38 L69 59 L78 92 L50 73 L22 92 L31 59 L5 38 L38 37 Z',
  );
  svg.append(pfad);
  return svg;
}

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

function einzelErgebnis(app, { paare, zuege, spieler }) {
  const profil = spieler[0].profil;
  const sterne = berechneSterne(paare, zuege);
  const lob = profil.gast ? zufall(T.ende.lob) : T.ende.lobPersoenlich(profil.name);
  const { neu, bisher } = merkeBestleistung(profil, app.auswahl.stufe, zuege);
  let bestleistung = null;
  if (!profil.gast) {
    bestleistung = neu
      ? el('p', { class: 'bestleistung neu' }, T.ende.neueBestleistung)
      : el('p', { class: 'bestleistung' }, T.ende.bestleistung(bisher));
  }

  return [
    el('img', { class: 'avatar ende-avatar', src: avatarUrl(profil), alt: '', style: farbStil(profil) }),
    el('h1', { class: 'lob', 'data-vorlesen': lob }, lob),
    el(
      'div',
      { class: 'sterne', role: 'img', 'aria-label': T.ende.sterne(sterne) },
      [1, 2, 3].map((n) => stern(n <= sterne, n)),
    ),
    el('p', { class: 'zusammenfassung' }, T.ende.zusammenfassung(paare, zuege)),
    bestleistung,
  ];
}

// Im Mehrspieler-Spiel werden alle gelobt, in der Reihenfolge des Spiels.
function mehrErgebnis({ spieler }) {
  const meiste = Math.max(...spieler.map((s) => s.paare));
  const alleGleich = spieler.every((s) => s.paare === meiste);
  const lobsaetze = mischen(T.ende.lobSpieler);

  return [
    el('h1', { class: 'lob lob-alle', 'data-vorlesen': T.ende.alleTitel }, T.ende.alleTitel),
    el('p', { class: 'zusammenfassung' }, T.ende.alleText),
    el(
      'ul',
      { class: 'ergebnis-liste' },
      spieler.map((s, i) =>
        el(
          'li',
          { class: 'ergebnis-zeile', style: farbStil(s.profil) },
          el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
          el(
            'span',
            { class: 'ergebnis-text' },
            el('span', { class: 'ergebnis-name' }, s.profil.name),
            el('span', { class: 'ergebnis-lob' }, lobsaetze[i % lobsaetze.length]),
          ),
          el('span', { class: 'ergebnis-paare' }, T.ende.spielerPaare(s.paare)),
          !alleGleich && s.paare === meiste
            ? el('span', { class: 'ergebnis-abzeichen' }, T.ende.meistePaare)
            : null,
        ),
      ),
    ),
  ];
}

export function zeigeEnde(app, ergebnis) {
  const inhalt = ergebnis.spieler.length > 1 ? mehrErgebnis(ergebnis) : einzelErgebnis(app, ergebnis);

  zeige(
    el(
      'main',
      { class: 'bildschirm ende', style: `--set-farbe: ${app.auswahl.set.farbe}` },
      inhalt,
      el(
        'div',
        { class: 'ende-knoepfe' },
        knopf(T.ende.nochmals, () => app.zeigeSpiel(), 'knopf-haupt'),
        knopf(T.ende.anderesSpiel, () => app.zeigeStart(), 'knopf-neben'),
      ),
    ),
  );

  klang.fertig();
  konfetti();
  const titel = document.querySelector('[data-vorlesen]');
  if (titel) sprich(titel.dataset.vorlesen);
}
