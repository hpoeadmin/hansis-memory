import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../ui.js';
import { speicher, sichere } from '../speicher.js';
import { avatarUrl, farbStil, loescheProfil } from '../profile.js';
import { klang } from '../klang.js';
import { sprich, vorlesenMoeglich } from '../vorlesen.js';
import { SPIELE } from '../../spiele.js';

const BASIS = import.meta.env.BASE_URL;

export function wendeRueckseiteAn() {
  document.documentElement.dataset.rueckseite = speicher.einstellungen.rueckseite;
}

// Eine Reihe grosser Wahlknöpfe; der gewählte hat Häkchen und Farbe.
function auswahl(titel, optionen, schluessel, nachAenderung) {
  const knoepfe = optionen.map(({ wert, text, vorschau }) => {
    const k = el(
      'button',
      { class: 'wahl-knopf', type: 'button' },
      vorschau ?? null,
      el('span', {}, text),
    );
    beiTipp(
      k,
      () => {
        speicher.einstellungen[schluessel] = wert;
        sichere();
        aktualisiere();
        nachAenderung?.(wert);
      },
      { scrollbar: true },
    );
    return { wert, k };
  });

  function aktualisiere() {
    for (const { wert, k } of knoepfe) {
      const aktiv = speicher.einstellungen[schluessel] === wert;
      k.classList.toggle('gewaehlt', aktiv);
      k.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    }
  }
  aktualisiere();

  return el(
    'section',
    { class: 'einstellung' },
    el('h2', {}, titel),
    el('div', { class: 'wahl-liste', role: 'group', 'aria-label': titel }, knoepfe.map((x) => x.k)),
  );
}

function spielerVerwaltung(app) {
  const zeilen = speicher.profile.map((profil) =>
    el(
      'li',
      { class: 'verwaltung-zeile', style: farbStil(profil) },
      el('img', { class: 'avatar', src: avatarUrl(profil), alt: '' }),
      el('span', { class: 'verwaltung-name' }, profil.name),
      knopf(
        T.einstellungen.aendern,
        () => app.zeigeProfil(profil, () => zeigeEinstellungen(app, 'spieler')),
        '',
        { scrollbar: true },
      ),
      knopf(
        T.einstellungen.loeschen,
        async () => {
          const ja = await bestaetigen(
            T.einstellungen.loeschenFrage(profil.name),
            T.einstellungen.loeschenJa,
            T.einstellungen.loeschenNein,
          );
          if (ja) {
            loescheProfil(profil);
            zeigeEinstellungen(app, 'spieler');
          }
        },
        'knopf-loeschen',
        { scrollbar: true },
      ),
    ),
  );

  return el(
    'section',
    { class: 'einstellung' },
    el('h2', {}, T.einstellungen.spieler),
    zeilen.length
      ? el('ul', { class: 'verwaltung-liste' }, zeilen)
      : el('p', { class: 'hinweis' }, T.einstellungen.keineSpieler),
    knopf(
      `+ ${T.einstellungen.neuerSpieler}`,
      () => app.zeigeProfil(null, () => zeigeEinstellungen(app, 'spieler')),
      '',
      { scrollbar: true },
    ),
  );
}

// Spiele im Hauptmenü zeigen oder ausblenden – eines bleibt immer sichtbar
function spieleImMenue() {
  const E = T.einstellungen;
  const hinweis = el('p', { class: 'hinweis', role: 'status' });
  const zeilen = SPIELE.map((spiel) => {
    const knoepfe = [
      { sichtbar: true, text: E.zeigen },
      { sichtbar: false, text: E.ausblenden },
    ].map(({ sichtbar, text }) => {
      const k = el('button', { class: 'wahl-knopf', type: 'button' }, el('span', {}, text));
      beiTipp(
        k,
        () => {
          const liste = speicher.einstellungen.ausgeblendet ?? [];
          if (!sichtbar && liste.length >= SPIELE.length - 1 && !liste.includes(spiel.id)) {
            hinweis.textContent = E.einesBleibt;
            return;
          }
          hinweis.textContent = '';
          speicher.einstellungen.ausgeblendet = sichtbar
            ? liste.filter((id) => id !== spiel.id)
            : [...new Set([...liste, spiel.id])];
          sichere();
          alleAktualisieren();
        },
        { scrollbar: true },
      );
      return { sichtbar, k };
    });
    function aktualisiere() {
      const ist = !(speicher.einstellungen.ausgeblendet ?? []).includes(spiel.id);
      for (const { sichtbar, k } of knoepfe) {
        k.classList.toggle('gewaehlt', sichtbar === ist);
        k.setAttribute('aria-pressed', sichtbar === ist ? 'true' : 'false');
      }
    }
    return { spiel, knoepfe, aktualisiere };
  });
  function alleAktualisieren() {
    zeilen.forEach((z) => z.aktualisiere());
  }
  alleAktualisieren();

  return el(
    'section',
    { class: 'einstellung' },
    el('h2', {}, E.spieleImMenue),
    el(
      'ul',
      { class: 'verwaltung-liste' },
      zeilen.map(({ spiel, knoepfe }) =>
        el(
          'li',
          { class: 'verwaltung-zeile spiel-zeile' },
          el('img', { class: 'spiel-symbol', src: `${BASIS}${spiel.bild}`, alt: '' }),
          el('span', { class: 'verwaltung-name' }, T.spiele[spiel.id]),
          el('span', { class: 'wahl-liste' }, knoepfe.map(({ k }) => k)),
        ),
      ),
    ),
    hinweis,
  );
}

const SEITEN = ['allgemein', 'spieler', 'memory', 'nuenistei', 'eilemitweile', 'reihenfolge'];
const SEITEN_BILD = {
  allgemein: 'spiele/einstellungen.svg',
  spieler: 'sets/bauernhof/katze.svg',
  memory: 'spiele/memory.svg',
  nuenistei: 'spiele/nuenistei.svg',
  eilemitweile: 'spiele/eilemitweile.svg',
  reihenfolge: 'spiele/reihenfolge.svg',
};

function inhaltVon(app, seite) {
  const E = T.einstellungen;
  const einAus = [
    { wert: true, text: E.ein },
    { wert: false, text: E.aus },
  ];
  const jaNein = [
    { wert: true, text: E.ja },
    { wert: false, text: E.nein },
  ];

  if (seite === 'allgemein') {
    const vorlesen = vorlesenMoeglich()
      ? auswahl(E.vorlesen, einAus, 'vorlesen', (an) => an && sprich(E.vorlesenProbe))
      : el('section', { class: 'einstellung' }, el('h2', {}, E.vorlesen), el('p', { class: 'hinweis' }, E.vorlesenFehlt));
    const version = el(
      'section',
      { class: 'einstellung' },
      el('h2', {}, E.versionTitel),
      el('p', { class: 'version-gross' }, T.version(__VERSION__)),
      el('p', { class: 'hinweis' }, E.versionText),
    );
    return [auswahl(E.ton, einAus, 'ton', (an) => an && klang.paar()), vorlesen, spieleImMenue(), version];
  }
  if (seite === 'spieler') return [spielerVerwaltung(app)];
  if (seite === 'memory') {
    const rueckseiten = ['blau', 'gruen', 'orange'].map((wert) => ({
      wert,
      text: E.rueckseiten[wert],
      vorschau: el('span', { class: 'rueckseite-vorschau', 'data-muster': wert, 'aria-hidden': 'true' }),
    }));
    return [
      auswahl(
        E.dauer,
        [
          { wert: 'normal', text: E.dauerNormal },
          { wert: 'langsam', text: E.dauerLangsam },
          { wert: 'sehr-langsam', text: E.dauerSehrLangsam },
          { wert: 'tippen', text: E.dauerTippen },
        ],
        'aufdeckDauer',
      ),
      auswahl(E.rueckseite, rueckseiten, 'rueckseite', wendeRueckseiteAn),
      auswahl(E.namen, jaNein, 'namen'),
    ];
  }
  if (seite === 'nuenistei') return [auswahl(E.zugZurueck, jaNein, 'zugZurueck')];
  if (seite === 'eilemitweile') return [auswahl(E.zugZurueck, jaNein, 'emwZugZurueck')];
  if (seite === 'reihenfolge') {
    return [
      auswahl(
        E.tempo,
        [
          { wert: 'normal', text: E.tempoNormal },
          { wert: 'langsam', text: E.tempoLangsam },
          { wert: 'sehr-langsam', text: E.tempoSehrLangsam },
        ],
        'merkTempo',
      ),
    ];
  }
  return [];
}

// Übersicht mit einer Kachel pro Bereich; jede Kachel öffnet eine eigene Seite.
export function zeigeEinstellungen(app, seite = null) {
  const E = T.einstellungen;
  const fertig = knopf(E.fertig, () => app.zeigeHauptmenue(), 'knopf-haupt knopf-fertig');

  if (!seite) {
    const kacheln = SEITEN.map((id) => {
      const k = el(
        'button',
        { class: 'set-kachel modus-kachel einstellungs-kachel', type: 'button', style: '--set-farbe: #FFFFFF' },
        el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${SEITEN_BILD[id]}`, alt: '' })),
        el('span', { class: 'set-name' }, E.seiten[id].titel),
        el('span', { class: 'modus-text' }, E.seiten[id].text),
      );
      beiTipp(k, () => zeigeEinstellungen(app, id), { scrollbar: true });
      return k;
    });
    zeige(
      el(
        'main',
        { class: 'bildschirm einstellungen' },
        el('header', { class: 'kopfzeile' }, el('h1', { class: 'kopf-titel' }, E.titel), fertig),
        el('p', { class: 'frage' }, E.frage),
        el('div', { class: 'set-raster einstellungs-raster' }, kacheln),
      ),
    );
    return;
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm einstellungen' },
      el(
        'header',
        { class: 'kopfzeile' },
        knopf(`‹ ${E.zurueck}`, () => zeigeEinstellungen(app), 'knopf-zurueck'),
        el('h1', { class: 'kopf-titel' }, E.seiten[seite].titel),
        fertig,
      ),
      el('div', { class: 'einstellungen-inhalt' }, inhaltVon(app, seite)),
    ),
  );
}
