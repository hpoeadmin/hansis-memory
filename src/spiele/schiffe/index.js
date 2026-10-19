// Schiffe versenken: Ablauf Spielart → Spieler → Schiffe setzen → Spiel → Abschluss.
// Zu zweit wird das Tablet weitergegeben; ein Zwischenbildschirm verdeckt die Flotten.
import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../../kern/ui.js';
import { speicher, sichere } from '../../kern/speicher.js';
import { TABLET, alleProfile, avatarUrl, farbStil } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { GROESSEN, neuesBrett, zufallsFlotte } from './logik.js';
import { zeigeSetzen } from './setzen.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#D6ECF7';
const BASIS = import.meta.env.BASE_URL;

function kachel(bild, titel, untertitel, aktion) {
  const k = el(
    'button',
    { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
    el('div', { class: 'set-bild' }, el('img', { src: `${BASIS}${bild}`, alt: '' })),
    el('span', { class: 'set-name' }, titel),
    untertitel ? el('span', { class: 'modus-text' }, untertitel) : null,
  );
  beiTipp(k, aktion);
  return k;
}

function zeigeStart(s) {
  const S = T.schiffe;
  const daten = s.daten();
  const groessenKnoepfe = Object.keys(GROESSEN).map((g) => {
    const k = knopf(S.groessen[g], () => {
      daten.groesse = g;
      sichere();
      zeigeStart(s);
    }, `sv-groesse ${daten.groesse === g ? 'gewaehlt' : ''}`);
    k.setAttribute('aria-pressed', daten.groesse === g ? 'true' : 'false');
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => s.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.schiffe),
        knopf(S.regeln, () => zeigeRegeln(), 'knopf-album'),
      ),
      el('div', { class: 'sv-groessen' }, el('span', { class: 'sv-groessen-titel' }, S.feld), groessenKnoepfe),
      el(
        'div',
        { class: 'set-raster spiel-raster', style: '--anzahl: 3' },
        kachel('spiele/schiffe.svg', S.zuZweit, S.zuZweitText, () => s.waehleModus({ gegner: 'mensch' })),
        kachel('spiele/tablet.svg', S.gegenTablet, S.gemuetlich, () => s.waehleModus({ gegner: 'tablet', stufe: 'gemuetlich' })),
        kachel('spiele/tablet.svg', S.gegenTablet, S.knifflig, () => s.waehleModus({ gegner: 'tablet', stufe: 'knifflig' })),
      ),
    ),
  );
}

function zeigeRegeln() {
  const schliessen = () => hintergrund.remove();
  const hintergrund = el(
    'div',
    { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
    el(
      'div',
      { class: 'dialog regeln-dialog' },
      el('h2', { class: 'dialog-frage' }, T.schiffe.regeln),
      el('ol', { class: 'regeln-liste' }, T.schiffe.regelnText.map((satz) => el('li', {}, satz))),
      knopf(T.nuenistei.regelnSchliessen, schliessen, 'knopf-haupt'),
    ),
  );
  document.body.append(hintergrund);
}

// Zu zweit: «Gib das Tablet an …» – erst nach dem Tippen sieht man wieder ein Spielfeld
export function zeigeWeitergeben(profil, text, weiter) {
  const k = knopf(T.schiffe.bereit(profil.name), weiter, 'knopf-haupt sv-bereit');
  zeige(
    el(
      'main',
      { class: 'bildschirm ende sv-weitergeben', style: `--set-farbe: ${FARBE}` },
      el('img', { class: 'avatar ende-avatar', src: avatarUrl(profil), alt: '', style: farbStil(profil) }),
      el('h1', { class: 'lob' }, T.schiffe.weitergeben(profil.name)),
      el('p', { class: 'zusammenfassung' }, text),
      k,
    ),
  );
}

export function schiffeSteuerung(app) {
  const s = Object.create(app);
  s.daten = () => (speicher.schiffe ??= { groesse: 'klein' });

  s.zeigeStart = () => zeigeStart(s);

  // modus: { gegner: 'mensch' | 'tablet', stufe?: 'gemuetlich' | 'knifflig' }
  s.waehleModus = (modus) => {
    const anzahl = modus.gegner === 'mensch' ? 2 : 1;
    zeigeSpieler(app, {
      farbe: FARBE,
      min: anzahl,
      max: anzahl,
      vorauswahl: s.daten().letzteSpieler ?? speicher.letzteSpieler,
      zurueck: s.zeigeStart,
      weiter: (profile) => {
        s.daten().letzteSpieler = profile.map((p) => p.id);
        sichere();
        const ids = profile.map((p) => p.id);
        if (modus.gegner === 'tablet') ids.push(TABLET.id);
        s.starte({ modus, spielerIds: ids });
      },
    });
  };

  s.profilVon = (id) => (id === TABLET.id ? TABLET : (alleProfile().find((p) => p.id === id) ?? alleProfile().at(-2)));

  s.starte = ({ modus, spielerIds }) => {
    const groesse = s.daten().groesse ?? 'klein';
    s.partie = {
      modus,
      groesse,
      spielerIds,
      // bretter[i] = das Meer von Spieler i (seine Schiffe, die Schüsse des Gegners)
      bretter: spielerIds.map(() => neuesBrett(groesse, zufallsFlotte(groesse))),
      amZug: 0,
      sieger: null,
    };
    s.setzeSchiffe(0);
  };

  // Menschen setzen ihre Schiffe nacheinander, das Tablet verteilt zufällig
  s.setzeSchiffe = (i) => {
    const spieler = s.partie.spielerIds.map(s.profilVon);
    if (i >= spieler.length) {
      s.beginne();
      return;
    }
    if (spieler[i].computer) {
      s.setzeSchiffe(i + 1);
      return;
    }
    const setzen = () => zeigeSetzen(s, i, () => s.setzeSchiffe(i + 1));
    if (s.partie.modus.gegner === 'mensch') zeigeWeitergeben(spieler[i], T.schiffe.wegschauen(spieler[1 - i].name), setzen);
    else setzen();
  };

  s.beginne = () => {
    s.partie.amZug = 0;
    // Zu zweit hält gerade die zweite Person das Tablet – zuerst zurückgeben
    if (s.partie.modus.gegner === 'mensch') {
      const [erste, zweite] = s.partie.spielerIds.map(s.profilVon);
      zeigeWeitergeben(erste, T.schiffe.wegschauen(zweite.name), () => zeigeSpiel(s));
    } else zeigeSpiel(s);
  };

  // Nochmals: gleiche Spieler, neue Flotten; die andere Seite beginnt
  s.nochmals = () => {
    const { modus, spielerIds } = s.partie;
    s.starte({ modus, spielerIds: modus.gegner === 'mensch' ? [...spielerIds].reverse() : spielerIds });
  };

  s.spielFertig = () => zeigeEnde(s);
  return s;
}
