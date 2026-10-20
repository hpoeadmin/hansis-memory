// Vier gewinnt: zu zweit oder gegen das Tablet (gemütlich / knifflig).
// Ablauf Spielart → Spieler → Spiel → Abschluss. «Nochmals» wechselt, wer beginnt.
import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../../kern/ui.js';
import { speicher, sichere } from '../../kern/speicher.js';
import { TABLET, alleProfile, avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeSiegerEnde } from '../../kern/bildschirme/siegerende.js';
import { SPALTEN, REIHEN, neuesBrett, setze, gewinnReihe, voll, frei, computerZug } from './regeln.js';

export const FARBE = '#DCE6F7';
const BASIS = import.meta.env.BASE_URL;
const STEIN = ['#E2543A', '#F6C33B'];
const DENKPAUSE = 700;

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

function zeigeRegeln() {
  const schliessen = () => hintergrund.remove();
  const hintergrund = el(
    'div',
    { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
    el(
      'div',
      { class: 'dialog regeln-dialog' },
      el('h2', { class: 'dialog-frage' }, T.nuenistei.regeln),
      el('ol', { class: 'regeln-liste' }, T.viergewinnt.regelnText.map((satz) => el('li', {}, satz))),
      knopf(T.nuenistei.regelnSchliessen, schliessen, 'knopf-haupt'),
    ),
  );
  document.body.append(hintergrund);
}

function zeigeStart(v) {
  const V = T.viergewinnt;
  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => v.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.viergewinnt),
        knopf(V.regeln, zeigeRegeln, 'knopf-album'),
      ),
      el('p', { class: 'frage' }, V.frage),
      el(
        'div',
        { class: 'set-raster spiel-raster', style: '--anzahl: 3' },
        kachel('spiele/viergewinnt.svg', V.zuZweit, V.zuZweitText, () => v.waehleModus({ gegner: 'mensch' })),
        kachel('spiele/tablet.svg', V.gegenTablet, V.gemuetlich, () => v.waehleModus({ gegner: 'tablet', stufe: 'gemuetlich' })),
        kachel('spiele/tablet.svg', V.gegenTablet, V.knifflig, () => v.waehleModus({ gegner: 'tablet', stufe: 'knifflig' })),
      ),
    ),
  );
}

function zeigeSpiel(v) {
  const V = T.viergewinnt;
  const partie = v.partie;
  const spieler = partie.spielerIds.map(v.profilVon);
  const brett = neuesBrett();
  let amZug = 0;
  let gesperrt = false;
  let beendet = false;
  let zuletzt = null;

  const meldung = el('p', { class: 'vg-meldung', role: 'status', 'aria-live': 'polite' });
  const seiten = [el('aside', { class: 'vg-seite' }), el('aside', { class: 'vg-seite' })];
  const spalten = Array.from({ length: SPALTEN }, (_, s) => {
    const spalte = el('button', { class: 'vg-spalte', type: 'button', 'aria-label': V.spalte(s + 1) });
    beiTipp(spalte, () => wirf(s), { sperrzeit: 300 });
    return spalte;
  });
  const brettEl = el('div', { class: 'vg-brett' }, spalten);

  function zeichne(gewinn = null) {
    spalten.forEach((spalte, s) => {
      spalte.replaceChildren(
        ...Array.from({ length: REIHEN }, (_, i) => {
          const r = REIHEN - 1 - i;
          const stein = brett[s][r];
          const klassen = ['vg-loch'];
          if (stein !== null) klassen.push(`vg-stein-${stein}`);
          if (zuletzt && zuletzt[0] === s && zuletzt[1] === r) klassen.push('vg-neu');
          if (gewinn?.some(([x, y]) => x === s && y === r)) klassen.push('vg-gewinn');
          return el('span', { class: klassen.join(' '), style: `--fall: ${REIHEN - r}` });
        }),
      );
      spalte.disabled = frei(brett, s) < 0;
    });
    seiten.forEach((box, i) => {
      box.className = `vg-seite ${amZug === i && !beendet ? 'aktiv' : ''}`;
      box.style.cssText = farbStil(spieler[i]);
      const inhalt = [
        el('img', { class: 'avatar', src: avatarUrl(spieler[i]), alt: '' }),
        el('span', { class: 'seite-name' }, spieler[i].name),
        el('span', { class: 'vg-farbe', style: `background: ${STEIN[i]}` }),
      ];
      if (amZug === i && !beendet) inhalt.push(el('span', { class: 'dran-schild' }, T.nuenistei.istDran));
      box.replaceChildren(...inhalt);
    });
  }

  function melde(text) {
    meldung.textContent = text;
  }

  function wirf(s) {
    if (gesperrt || beendet || spieler[amZug].computer) return;
    zug(s);
  }

  function zug(s) {
    const r = setze(brett, s, amZug);
    if (r < 0) return;
    zuletzt = [s, r];
    klang.hupf();
    const gewinn = gewinnReihe(brett, amZug);
    if (gewinn) return schluss(amZug, gewinn);
    if (voll(brett)) return schluss(null);
    amZug = 1 - amZug;
    weiter();
  }

  function weiter() {
    zeichne();
    if (spieler[amZug].computer) {
      gesperrt = true;
      melde(V.tabletDenkt);
      setTimeout(() => {
        if (beendet) return;
        gesperrt = false;
        zug(computerZug(brett, amZug, partie.modus.stufe));
      }, DENKPAUSE);
      return;
    }
    melde(V.duBistDran(spieler[amZug].name));
  }

  function schluss(sieger, gewinn = null) {
    beendet = true;
    zeichne(gewinn);
    melde(sieger === null ? V.unentschieden : V.vierInReihe(spieler[sieger].name));
    if (sieger !== null) klang.paar();
    setTimeout(() => zeigeSiegerEnde(v, { spieler, sieger, farbe: FARBE }), 1800);
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      v.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm vg-spiel', style: `--set-farbe: ${FARBE}` },
      el('header', { class: 'spiel-kopf' }, meldung, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el('div', { class: 'vg-mitte' }, seiten[0], brettEl, seiten[1]),
    ),
  );
  weiter();
  if (!spieler[amZug].computer) sprich(V.duBistDran(spieler[amZug].name));
}

export function vierGewinntSteuerung(app) {
  const v = Object.create(app);
  const daten = () => (speicher.viergewinnt ??= {});

  v.zeigeStart = () => zeigeStart(v);
  v.profilVon = (id) => (id === TABLET.id ? TABLET : (alleProfile().find((p) => p.id === id) ?? alleProfile().at(-2)));

  // modus: { gegner: 'mensch' | 'tablet', stufe?: 'gemuetlich' | 'knifflig' }
  v.waehleModus = (modus) => {
    const anzahl = modus.gegner === 'mensch' ? 2 : 1;
    zeigeSpieler(app, {
      farbe: FARBE,
      min: anzahl,
      max: anzahl,
      vorauswahl: daten().letzteSpieler ?? speicher.letzteSpieler,
      zurueck: v.zeigeStart,
      weiter: (profile) => {
        daten().letzteSpieler = profile.map((p) => p.id);
        sichere();
        const ids = profile.map((p) => p.id);
        if (modus.gegner === 'tablet') ids.push(TABLET.id);
        v.partie = { modus, spielerIds: ids };
        zeigeSpiel(v);
      },
    });
  };

  // Nochmals: die andere Seite beginnt
  v.nochmals = () => {
    v.partie = { ...v.partie, spielerIds: [...v.partie.spielerIds].reverse() };
    zeigeSpiel(v);
  };
  return v;
}
