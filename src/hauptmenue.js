import { T } from './texte.js';
import { el, beiTipp, knopf, zeige } from './kern/ui.js';
import { elternschloss } from './kern/schloss.js';
import { speicher } from './kern/speicher.js';
import { avatarUrl } from './kern/profile.js';
import { aktuelleKlasse, kategorieVon } from './kern/schulstufe.js';
import { BEREICHE, KLASSENWAHL, spieleFuer } from './spiele.js';

const BASIS = import.meta.env.BASE_URL;

const KLASSEN_FARBE = { kg: '#FBE7C6', kl12: '#DDF0C8', kl34: '#DCEBFA', kl56: '#EADCF7', brett: '#F6E3B4', alle: '#FFF3D6' };

// Name einer Startseiten-Kachel: Klasse, «Spiele» oder «Alle Spiele»
const kachelName = (klasse) => T.klassenwahl.namen[klasse] ?? T.schule.kategorien[klasse];

function kachel(app, spiel, mitAlter) {
  const k = el(
    'button',
    { class: 'set-kachel spiel-kachel', type: 'button', style: `--set-farbe: ${spiel.farbe}` },
    el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${spiel.bild}`, alt: '' })),
    el('span', { class: 'set-name' }, T.spiele[spiel.id]),
    mitAlter ? el('span', { class: 'alters-schild' }, T.schule.ab[spiel.ab]) : null,
  );
  // Das Menü kann scrollen: ein Tipp zählt erst beim Loslassen ohne Wischen
  beiTipp(k, () => spiel.starte(app), { scrollbar: true });
  return k;
}

function sichtbareSpiele(app, klasse) {
  const ausgeblendet = app.einstellungen.ausgeblendet ?? [];
  return spieleFuer(klasse).filter((spiel) => !ausgeblendet.includes(spiel.id));
}

// Die Kinder mit Profil, die heute in diese Klasse gehen (Kindergarten inkl. «vor dem Kindergarten»)
function kinderIn(klasse) {
  if (klasse === 'alle' || klasse === 'brett') return [];
  return speicher.profile.filter((profil) => {
    const k = aktuelleKlasse(profil);
    if (!k || k.id === 'erw') return false;
    const kategorie = kategorieVon(k.n);
    return (kategorie === 'vorkg' ? 'kg' : kategorie) === klasse;
  });
}

// Startseite: zuerst die Klasse wählen, dann kommen die passenden Spiele
export function zeigeKlassenwahl(app) {
  const W = T.klassenwahl;
  const kacheln = KLASSENWAHL.map((klasse) => {
    const kinder = kinderIn(klasse);
    const k = el(
      'button',
      { class: 'set-kachel klassen-kachel', type: 'button', style: `--set-farbe: ${KLASSEN_FARBE[klasse]}` },
      el('img', { class: 'klassen-bild', src: `${BASIS}spiele/klasse-${klasse}.svg`, alt: '' }),
      el(
        'span',
        { class: 'klassen-text' },
        el('span', { class: 'set-name' }, kachelName(klasse)),
        el('span', { class: 'modus-text' }, W.anzahl(sichtbareSpiele(app, klasse).length)),
        kinder.length
          ? el(
              'span',
              { class: 'klassen-kinder' },
              kinder.map((p) =>
                el('span', { class: 'klassen-kind' }, el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }), p.name),
              ),
            )
          : null,
      ),
    );
    beiTipp(k, () => {
      app.klasse = klasse;
      zeigeHauptmenue(app);
    });
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start klassenwahl' },
      el(
        'header',
        { class: 'start-kopf' },
        elternschloss(() => app.zeigeEinstellungen()),
        el('h1', { class: 'titel' }, T.hauptmenue.titel),
      ),
      el('p', { class: 'frage' }, W.frage),
      el('div', { class: 'klassen-raster' }, kacheln),
      el('p', { class: 'version-zeile' }, T.version(__VERSION__)),
    ),
  );
}

// Spielauswahl der gewählten Klasse: ein Abschnitt pro Bereich; leere Bereiche fehlen.
// Ohne gewählte Klasse (App-Start) kommt zuerst die Klassenwahl.
export function zeigeHauptmenue(app) {
  const klasse = app.klasse;
  if (!klasse) return zeigeKlassenwahl(app);
  const sichtbar = sichtbareSpiele(app, klasse);
  const abschnitte = BEREICHE.map((bereich) => {
    const spiele = sichtbar.filter((s) => s.bereich === bereich);
    if (!spiele.length) return null;
    return el(
      'section',
      { class: 'bereich' },
      el('h2', { class: 'bereich-titel' }, T.bereiche[bereich]),
      el('div', { class: 'bereich-raster' }, spiele.map((s) => kachel(app, s, klasse === 'alle' || klasse === 'brett'))),
    );
  }).filter(Boolean);

  zeige(
    el(
      'main',
      { class: 'bildschirm start hauptmenue' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(
          `‹ ${T.klassenwahl.zurueck}`,
          () => {
            app.klasse = null;
            zeigeKlassenwahl(app);
          },
          'knopf-zurueck kopf-links',
        ),
        el('h1', { class: 'titel' }, kachelName(klasse)),
      ),
      el('div', { class: 'hauptmenue-inhalt' }, abschnitte, el('p', { class: 'version-zeile' }, T.version(__VERSION__))),
    ),
  );
}
