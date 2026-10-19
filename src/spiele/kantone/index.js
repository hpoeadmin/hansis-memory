// «Kantone der Schweiz»: Memory mit Wappen und Namen, oder Kanton und Hauptort.
// Ablauf Spielart → Spieler → Memory → Abschluss (Bildschirme des Memory).
import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, mischen } from '../../kern/ui.js';
import { speicher } from '../../kern/speicher.js';
import { findeProfil, merkeLetzteSpieler } from '../../kern/profile.js';
import { passendeStufe } from '../../kern/schulstufe.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { STUFEN } from '../memory/sets.js';
import { zeigeSpiel } from '../memory/spiel.js';
import { zeigeEnde } from '../memory/ende.js';
import { MODI, kantoneFuer } from './kantone.js';

export const FARBE = '#F7DCDC';
const BASIS = import.meta.env.BASE_URL;
const EMPFEHLUNG = { kl12: 'nachbarn', kl34: 'nachbarn', kl56: 'hauptorte' };
const MODUS_BILD = { nachbarn: ['zh', 'ag', 'sg'], alle: ['ur', 'ge', 'vs'], hauptorte: ['gr'] };

export const wappenUrl = (kz) => `${BASIS}spiele/kantone/${kz}.svg`;

function paare(modus, anzahl) {
  const m = MODI[modus];
  return mischen(kantoneFuer(modus))
    .slice(0, anzahl)
    .map((k) =>
      m.paar === 'kanton-hauptort'
        ? {
            id: k.kz,
            a: { art: 'wappen', kanton: k, mitName: true },
            b: { art: 'wort', text: k.hauptort },
            anzeige: { bild: wappenUrl(k.kz), text: `${k.name}: ${k.hauptort}` },
          }
        : {
            id: k.kz,
            a: { art: 'wappen', kanton: k },
            b: { art: 'wort', text: k.name, trennung: k.trennung },
            anzeige: { bild: wappenUrl(k.kz), text: k.name },
          },
    );
}

function zeigeStart(m) {
  const KT = T.kantone;
  const empfohlen = passendeStufe(speicher.letzteSpieler.map(findeProfil).filter(Boolean), EMPFEHLUNG);
  const kacheln = Object.keys(MODI).map((id) => {
    const bild = el('div', { class: 'set-bild kt-modusbild' }, MODUS_BILD[id].map((kz) => el('img', { src: wappenUrl(kz), alt: '' })));
    if (id === 'hauptorte') bild.append(el('span', { class: 'kt-hauptort' }, 'Chur'));
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      bild,
      el('span', { class: 'set-name' }, KT.modi[id].titel),
      el('span', { class: 'modus-text' }, KT.modi[id].text),
      empfohlen?.stufe === id ? el('span', { class: 'passt-schild' }, T.schule.passtFuer(empfohlen.profil.name)) : null,
    );
    beiTipp(k, () => m.waehleModus(id));
    return k;
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => m.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.kantone),
      ),
      el('p', { class: 'frage' }, KT.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}

export function kantoneSteuerung(app) {
  const m = Object.create(app);
  m.modus = 'nachbarn';
  m.lern = null;
  m.auswahl = { set: null, stufe: null, spieler: [] };

  m.zeigeStart = () => zeigeStart(m);
  m.waehleModus = (modus) => {
    m.modus = modus;
    m.lern = `kantone-${modus}`;
    m.auswahl.set = { id: 'kantone', name: T.kantone.modi[modus].titel, farbe: FARBE };
    m.auswahl.stufe = MODI[modus].stufe;
    zeigeSpieler(app, {
      farbe: FARBE,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: m.zeigeStart,
      weiter: (profile) => {
        m.auswahl.spieler = profile;
        merkeLetzteSpieler(profile);
        zeigeSpiel(m);
      },
    });
  };
  m.zeigeSpiel = () => zeigeSpiel(m);
  m.zeigeEnde = (ergebnis) => zeigeEnde(m, ergebnis);
  m.erzeugePaare = () => paare(m.modus, STUFEN[m.auswahl.stufe].paare);
  return m;
}
