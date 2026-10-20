// «Einkaufsliste merken» (KopfFit): eine Einkaufsliste in Ruhe ansehen, dann die Dinge
// aus einer grösseren Auswahl wiederfinden. Ohne Zeitdruck; vier Listen pro Runde.
import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../../kern/ui.js';
import { speicher } from '../../kern/speicher.js';
import { avatarUrl, farbStil, merkeLetzteSpieler } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeRundenende } from '../../kern/bildschirme/rundenende.js';
import { STUFEN, DURCHGAENGE, durchgang, bewerte } from './daten.js';

export const FARBE = '#EEF3E2';

function dingEl(ding) {
  return [el('span', { class: 'ek-bild', 'aria-hidden': 'true' }, ding.bild), el('span', { class: 'ek-name' }, ding.name)];
}

function zeigeStart(s) {
  const E = T.einkauf;
  const kacheln = Object.keys(STUFEN).map((id) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      el('div', { class: 'set-bild ek-stufenbild' }, el('span', {}, '🧾')),
      el('span', { class: 'set-name' }, E.stufen[id].titel),
      el('span', { class: 'modus-text' }, E.stufen[id].text),
    );
    beiTipp(k, () => s.waehleStufe(id));
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
        el('h1', { class: 'titel' }, T.spiele.einkauf),
      ),
      el('p', { class: 'frage' }, E.frage),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}

function zeigeSpiel(s) {
  const E = T.einkauf;
  const spieler = s.auswahl.spieler.map((profil) => ({ profil, richtig: 0 }));
  const mehrspieler = spieler.length > 1;
  let nummer = 0;
  let beendet = false;

  const aktiver = () => spieler[nummer % spieler.length];

  function kopf() {
    const sp = aktiver();
    return el(
      'header',
      { class: 'spiel-kopf' },
      mehrspieler
        ? el('div', { class: 'am-zug lr-am-zug', style: farbStil(sp.profil) }, el('img', { class: 'avatar', src: avatarUrl(sp.profil), alt: '' }), el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, sp.profil.name), ' ', el('span', { class: 'am-zug-text' }, T.spiel.istDran)))
        : null,
      el('span', { class: 'anzeige lr-zaehler' }, E.listeVon(nummer + 1, DURCHGAENGE)),
      knopf(T.spiel.beenden, beenden, 'knopf-beenden'),
    );
  }

  // Schritt 1: die Liste in Ruhe ansehen
  function merken() {
    const d = durchgang(s.auswahl.stufe);
    zeige(
      el(
        'main',
        { class: 'bildschirm ek-spiel', style: `--set-farbe: ${FARBE}` },
        kopf(),
        el('p', { class: 'fs-frage ek-auftrag' }, E.merken(d.liste.length)),
        el('div', { class: 'ek-zettel' }, d.liste.map((ding) => el('div', { class: 'ek-eintrag' }, ...dingEl(ding)))),
        knopf(E.gemerkt, () => finden(d), 'knopf-haupt ek-knopf'),
      ),
    );
    sprich(`${E.merken(d.liste.length)} ${d.liste.map((x) => x.name).join(', ')}.`);
  }

  // Schritt 2: aus der grösseren Auswahl antippen; «Fertig» zeigt das Ergebnis
  function finden(d) {
    const gewaehlt = [];
    const zaehler = el('p', { class: 'ek-zaehler' });
    const meldung = el('p', { class: 'fs-meldung ek-meldung', role: 'status', 'aria-live': 'polite' });
    const fertigKnopf = knopf(E.fertig, auswerten, 'knopf-haupt ek-knopf');
    const knoepfe = d.auswahl.map((ding) => {
      const k = el('button', { class: 'ek-ding', type: 'button', 'aria-pressed': 'false' }, ...dingEl(ding));
      beiTipp(k, () => {
        if (fertigKnopf.dataset.fertig) return;
        const i = gewaehlt.indexOf(ding);
        if (i >= 0) gewaehlt.splice(i, 1);
        else gewaehlt.push(ding);
        k.classList.toggle('gewaehlt', i < 0);
        k.setAttribute('aria-pressed', i < 0 ? 'true' : 'false');
        klang.hupf();
        aktualisiere();
      });
      return { ding, k };
    });

    function aktualisiere() {
      zaehler.textContent = E.gewaehlt(gewaehlt.length, d.liste.length);
    }

    function auswerten() {
      if (fertigKnopf.dataset.fertig) {
        weiter();
        return;
      }
      const r = bewerte(d.liste, gewaehlt);
      fertigKnopf.dataset.fertig = 'ja';
      for (const { ding, k } of knoepfe) {
        if (r.gefunden.includes(ding)) k.classList.add('richtig');
        else if (r.falsch.includes(ding)) k.classList.add('falsch');
        else if (r.vergessen.includes(ding)) k.classList.add('vergessen');
      }
      if (r.perfekt) {
        aktiver().richtig++;
        klang.paar();
      }
      const text = r.perfekt ? E.perfekt(d.liste.length) : E.ergebnis(r.gefunden.length, d.liste.length, r.vergessen.map((x) => x.name), r.falsch.length);
      meldung.textContent = text;
      sprich(text);
      fertigKnopf.textContent = nummer + 1 < DURCHGAENGE * spieler.length ? T.lebensraum.weiter : T.lebensraum.fertig;
    }

    zeige(
      el(
        'main',
        { class: 'bildschirm ek-spiel', style: `--set-farbe: ${FARBE}` },
        kopf(),
        el('p', { class: 'fs-frage ek-auftrag' }, E.finden),
        el('div', { class: 'ek-auswahl' }, knoepfe.map((x) => x.k)),
        el('div', { class: 'ek-unten' }, zaehler, meldung, fertigKnopf),
      ),
    );
    aktualisiere();
    sprich(E.finden);
  }

  function weiter() {
    nummer++;
    if (nummer < DURCHGAENGE * spieler.length) {
      merken();
      return;
    }
    beendet = true;
    zeigeRundenende(s, {
      spieler,
      gesamt: DURCHGAENGE,
      farbe: FARBE,
      ruhig: true,
      texte: { einzel: E.ergebnisEinzel, spieler: E.ergebnisSpieler },
    });
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja && !beendet) {
      beendet = true;
      s.zeigeStart();
    }
  }

  merken();
}

export function einkaufSteuerung(app) {
  const s = Object.create(app);
  s.auswahl = { stufe: 'vier', spieler: [] };
  s.zeigeStart = () => zeigeStart(s);
  s.waehleStufe = (stufe) => {
    s.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: FARBE,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: s.zeigeStart,
      weiter: (profile) => {
        s.auswahl.spieler = profile;
        merkeLetzteSpieler(profile);
        s.zeigeSpiel();
      },
    });
  };
  s.zeigeSpiel = () => zeigeSpiel(s);
  return s;
}
