import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../ui.js';
import { speicher, sichere } from '../speicher.js';
import { avatarUrl, farbStil, loescheProfil } from '../profile.js';
import { klang } from '../klang.js';
import { sprich, vorlesenMoeglich } from '../vorlesen.js';

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
        () => app.zeigeProfil(profil, () => zeigeEinstellungen(app)),
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
            zeigeEinstellungen(app);
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
      () => app.zeigeProfil(null, () => zeigeEinstellungen(app)),
      '',
      { scrollbar: true },
    ),
  );
}

export function zeigeEinstellungen(app) {
  const E = T.einstellungen;
  const einAus = [
    { wert: true, text: E.ein },
    { wert: false, text: E.aus },
  ];

  const vorlesen = vorlesenMoeglich()
    ? auswahl(E.vorlesen, einAus, 'vorlesen', (an) => an && sprich(E.vorlesenProbe))
    : el('section', { class: 'einstellung' }, el('h2', {}, E.vorlesen), el('p', { class: 'hinweis' }, E.vorlesenFehlt));

  const rueckseiten = ['blau', 'gruen', 'orange'].map((wert) => ({
    wert,
    text: E.rueckseiten[wert],
    vorschau: el('span', { class: 'rueckseite-vorschau', 'data-muster': wert, 'aria-hidden': 'true' }),
  }));

  zeige(
    el(
      'main',
      { class: 'bildschirm einstellungen' },
      el(
        'header',
        { class: 'kopfzeile' },
        el('h1', { class: 'kopf-titel' }, E.titel),
        knopf(E.fertig, () => app.zeigeStart(), 'knopf-haupt knopf-fertig'),
      ),
      el(
        'div',
        { class: 'einstellungen-inhalt' },
        auswahl(E.ton, einAus, 'ton', (an) => an && klang.paar()),
        vorlesen,
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
        auswahl(
          E.namen,
          [
            { wert: true, text: E.ja },
            { wert: false, text: E.nein },
          ],
          'namen',
        ),
        spielerVerwaltung(app),
      ),
    ),
  );
}
