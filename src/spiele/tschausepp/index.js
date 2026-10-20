// Tschau Sepp: 2 bis 4 Spieler, freie Plätze spielt das Tablet (gemütlich oder knifflig).
// Spielen mehrere Menschen, wird das Tablet weitergegeben – dazwischen sind die Karten verdeckt.
import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../../kern/ui.js';
import { speicher, sichere } from '../../kern/speicher.js';
import { TABLET, alleProfile, avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeSiegerEnde } from '../../kern/bildschirme/siegerende.js';
import { FARBEN, neuesSpiel, darfLegen, lege, zieheStattLegen, passe, computerWahl, oben, lieblingsfarbe } from './regeln.js';
import { karteSvg, rueckseiteSvg, ZEICHEN, farbe as farbCode, kartenName } from './karten.js';

export const FARBE = '#E6F0DC';
const DENKPAUSE = 1000;

function svgEl(html, klasse) {
  const box = el('span', { class: klasse });
  box.innerHTML = html;
  return box;
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
      el('ol', { class: 'regeln-liste' }, T.tschausepp.regelnText.map((satz) => el('li', {}, satz))),
      knopf(T.nuenistei.regelnSchliessen, schliessen, 'knopf-haupt'),
    ),
  );
  document.body.append(hintergrund);
}

function zeigeStart(t) {
  const S = T.tschausepp;
  const daten = t.daten();
  const stufen = ['gemuetlich', 'knifflig'].map((st) => {
    const k = knopf(S.stufen[st], () => {
      daten.stufe = st;
      sichere();
      zeigeStart(t);
    }, `sv-groesse ${daten.stufe === st ? 'gewaehlt' : ''}`);
    k.setAttribute('aria-pressed', daten.stufe === st ? 'true' : 'false');
    return k;
  });
  const kacheln = [2, 3, 4].map((n) => {
    const facher = el('div', { class: 'set-bild ts-facher' }, Array.from({ length: n }, (_, i) => svgEl(rueckseiteSvg(), `ts-mini ts-mini-${i}`)));
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${FARBE}` },
      facher,
      el('span', { class: 'set-name' }, S.anzahl(n)),
      el('span', { class: 'modus-text' }, S.tabletFuellt),
    );
    beiTipp(k, () => t.waehleAnzahl(n));
    return k;
  });
  zeige(
    el(
      'main',
      { class: 'bildschirm start' },
      el(
        'header',
        { class: 'start-kopf' },
        knopf(`‹ ${T.hauptmenue.zurueck}`, () => t.zeigeHauptmenue(), 'knopf-zurueck kopf-links'),
        el('h1', { class: 'titel' }, T.spiele.tschausepp),
        knopf(S.regeln, zeigeRegeln, 'knopf-album'),
      ),
      el('div', { class: 'sv-groessen' }, el('span', { class: 'sv-groessen-titel' }, S.tablet), stufen),
      el('div', { class: 'set-raster spiel-raster', style: '--anzahl: 3' }, kacheln),
    ),
  );
}

// Zu zweit oder mehr Menschen: «Gib das Tablet an …», erst danach sieht man die Karten
function zeigeWeitergeben(profil, weiter) {
  zeige(
    el(
      'main',
      { class: 'bildschirm ende sv-weitergeben', style: `--set-farbe: ${FARBE}` },
      el('img', { class: 'avatar ende-avatar', src: avatarUrl(profil), alt: '', style: farbStil(profil) }),
      el('h1', { class: 'lob' }, T.schiffe.weitergeben(profil.name)),
      el('p', { class: 'zusammenfassung' }, T.tschausepp.geheim),
      knopf(T.schiffe.bereit(profil.name), weiter, 'knopf-haupt sv-bereit'),
    ),
  );
}

function zeigeSpiel(t) {
  const S = T.tschausepp;
  const z = t.partie.zustand;
  const spieler = t.partie.sitze;
  const menschen = spieler.filter((p) => !p.computer).length;
  const stufe = t.partie.stufe;
  let sicht = null; // Index des Menschen, dessen Karten man sieht
  let tschauGesagt = false;
  let gezogen = null; // gerade gezogene Karte, die man noch legen darf
  let beendet = false;
  let gesperrt = false;

  const meldung = el('p', { class: 'ts-meldung', role: 'status', 'aria-live': 'polite' });
  const gegnerBox = el('div', { class: 'ts-gegner' });
  const mitteBox = el('div', { class: 'ts-mitte' });
  const handBox = el('div', { class: 'ts-hand' });
  const knoepfeBox = el('div', { class: 'ts-knoepfe' });

  const istMensch = (i) => !spieler[i].computer;

  function melde(text, vorlesen = true) {
    meldung.textContent = text;
    if (vorlesen) sprich(text);
  }

  function zeichne() {
    // Mitspielende oben (ohne den, dessen Karten unten liegen)
    gegnerBox.replaceChildren(
      ...spieler
        .map((p, i) => ({ p, i }))
        .filter(({ i }) => i !== sicht)
        .map(({ p, i }) =>
          el(
            'div',
            { class: `ts-mitspieler ${z.amZug === i && z.sieger === null ? 'aktiv' : ''}`, style: farbStil(p) },
            el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }),
            el('span', { class: 'ts-name' }, p.name),
            el('span', { class: 'ts-anzahl' }, S.karten(z.haende[i].length)),
          ),
        ),
    );
    // Stapel (antippen = ziehen) und Ablage
    const stapel = el('button', { class: 'ts-stapel', type: 'button', 'aria-label': S.ziehen }, svgEl(rueckseiteSvg(), 'ts-karte'));
    beiTipp(stapel, ziehen);
    const o = oben(z);
    const infos = [];
    if (z.wunsch) infos.push(el('span', { class: 'ts-wunsch', style: `color: ${farbCode(z.wunsch)}` }, S.wunschIst(ZEICHEN[z.wunsch], S.farben[z.wunsch])));
    if (z.strafe) infos.push(el('span', { class: 'ts-strafe' }, S.strafeOffen(z.strafe)));
    mitteBox.replaceChildren(
      el('div', { class: 'ts-ablage-paar' }, stapel, svgEl(karteSvg(o), 'ts-karte ts-ablage')),
      el('div', { class: 'ts-infos' }, infos),
    );
    // Eigene Hand
    const binDran = sicht !== null && z.amZug === sicht && !gesperrt && z.sieger === null;
    if (sicht === null) handBox.replaceChildren(el('p', { class: 'ts-verdeckt' }, S.verdeckt));
    else {
      handBox.replaceChildren(
        ...z.haende[sicht].map((k) => {
          const darf = binDran && (!gezogen || k === gezogen) && darfLegen(z, k);
          const b = el('button', { class: `ts-handkarte ${darf ? 'darf' : ''} ${k === gezogen ? 'neu' : ''}`, type: 'button', 'aria-label': kartenName(k, T) }, svgEl(karteSvg(k), 'ts-karte'));
          b.disabled = !darf;
          beiTipp(b, () => legeKarte(k));
          return b;
        }),
      );
    }
    // Knöpfe: «Tschau!» bei zwei Karten, «Weitergeben» nach dem Ziehen
    const knoepfe = [];
    if (binDran && z.haende[sicht].length === 2) {
      const tk = knopf(tschauGesagt ? S.tschauGesagt : S.tschau, () => {
        tschauGesagt = true;
        klang.hupf();
        sprich(S.tschau);
        zeichne();
      }, `ts-tschau ${tschauGesagt ? 'gesagt' : ''}`);
      knoepfe.push(tk);
    }
    if (binDran && gezogen) knoepfe.push(knopf(S.weitergeben, () => { gezogen = null; passe(z); naechsterZug(); }, 'knopf-neben'));
    knoepfeBox.replaceChildren(...knoepfe);
  }

  function legeKarte(k) {
    if (gesperrt || beendet || z.amZug !== sicht || !darfLegen(z, k)) return;
    if (k.wert === 'B') {
      waehleFarbe((wunsch) => ausfuehren(k, wunsch));
      return;
    }
    ausfuehren(k, null);
  }

  function waehleFarbe(fertig) {
    const schliessen = (f) => {
      hintergrund.remove();
      fertig(f);
    };
    const hintergrund = el(
      'div',
      { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
      el(
        'div',
        { class: 'dialog' },
        el('h2', { class: 'dialog-frage' }, S.welcheFarbe),
        el('div', { class: 'ts-farbwahl' }, FARBEN.map((f) => knopf(`${ZEICHEN[f]} ${S.farben[f]}`, () => schliessen(f), `ts-farbknopf ts-${f}`))),
      ),
    );
    document.body.append(hintergrund);
  }

  // Eine Karte legen (Mensch oder Tablet) und die Folgen ansagen
  function ausfuehren(k, wunsch) {
    const wer = z.amZug;
    const tschau = istMensch(wer) ? tschauGesagt : stufe === 'knifflig' || Math.random() > 0.25;
    gezogen = null;
    tschauGesagt = false;
    const e = lege(z, k, { wunsch, tschau });
    klang.umdrehen();
    const name = spieler[wer].name;
    const teile = [S.legt(name, kartenName(k, T))];
    if (z.sieger !== null) {
      melde(`${teile[0]} ${S.sepp}`);
      return schluss();
    }
    if (z.haende[wer].length === 1 && !e.strafkarten) teile.push(S.tschauRuf(name));
    if (e.strafkarten) teile.push(S.vergessen(name));
    if (k.wert === '7') teile.push(S.siebenZiehen(spieler[z.amZug].name, z.strafe));
    if (e.aussetzen !== null) teile.push(S.aussetzen(spieler[e.aussetzen].name));
    if (k.wert === 'B') teile.push(S.wuenscht(name, S.farben[wunsch]));
    melde(teile.join(' '));
    naechsterZug(true);
  }

  function ziehen() {
    if (gesperrt || beendet || z.amZug !== sicht || gezogen) return;
    const r = zieheStattLegen(z);
    klang.hupf();
    if (r.strafe) {
      melde(S.strafeGezogen(r.karten.length));
      naechsterZug(true);
      return;
    }
    const neu = r.karten[0];
    if (neu && darfLegen(z, neu)) {
      gezogen = neu;
      melde(S.gezogenPasst);
      zeichne();
      return;
    }
    melde(S.gezogenPasstNicht);
    passe(z);
    naechsterZug(true);
  }

  // Den nächsten Zug vorbereiten: Tablet spielt, oder ein Mensch bekommt das Tablet
  function naechsterZug(warten = false) {
    if (beendet) return;
    const dran = z.amZug;
    if (!istMensch(dran)) {
      gesperrt = true;
      if (menschen > 1) sicht = null;
      zeichne();
      setTimeout(tabletZug, warten ? DENKPAUSE + 400 : DENKPAUSE);
      return;
    }
    gesperrt = false;
    if (menschen > 1 && sicht !== dran) {
      const zeigen = () => {
        sicht = dran;
        aufbauen();
        melde(S.duBistDran(spieler[dran].name));
      };
      setTimeout(() => zeigeWeitergeben(spieler[dran], zeigen), warten ? 1400 : 0);
      return;
    }
    sicht = dran;
    zeichne();
    if (!warten) melde(S.duBistDran(spieler[dran].name));
    else setTimeout(() => !beendet && z.amZug === dran && melde(S.duBistDran(spieler[dran].name), false), 1400);
  }

  function tabletZug() {
    if (beendet) return;
    const wahl = computerWahl(z, stufe);
    if (wahl) return ausfuehren(wahl.karte, wahl.wunsch);
    const name = spieler[z.amZug].name;
    const r = zieheStattLegen(z);
    if (r.strafe) {
      melde(S.tabletStrafe(name, r.karten.length));
      return naechsterZug(true);
    }
    const neu = r.karten[0];
    if (neu && darfLegen(z, neu)) {
      // Die gezogene Karte passt: gleich legen
      const wunsch = neu.wert === 'B' ? lieblingsfarbe(z.haende[z.amZug].filter((k) => k !== neu).concat(neu)) : null;
      return ausfuehren(neu, wunsch);
    }
    melde(S.tabletZieht(name));
    passe(z);
    naechsterZug(true);
  }

  function schluss() {
    beendet = true;
    zeichne();
    klang.paar();
    setTimeout(() => zeigeSiegerEnde(t, { spieler, sieger: z.sieger, farbe: FARBE }), 1800);
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      t.zeigeStart();
    }
  }

  function aufbauen() {
    zeige(
      el(
        'main',
        { class: 'bildschirm ts-spiel', style: `--set-farbe: ${FARBE}` },
        el('header', { class: 'spiel-kopf' }, gegnerBox, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
        meldung,
        mitteBox,
        knoepfeBox,
        handBox,
      ),
    );
    zeichne();
  }

  aufbauen();
  naechsterZug();
}

export function tschauSeppSteuerung(app) {
  const t = Object.create(app);
  t.daten = () => (speicher.tschausepp ??= { stufe: 'gemuetlich' });
  t.zeigeStart = () => zeigeStart(t);

  t.waehleAnzahl = (anzahl) => {
    zeigeSpieler(app, {
      farbe: FARBE,
      min: 1,
      max: anzahl,
      vorauswahl: t.daten().letzteSpieler ?? speicher.letzteSpieler,
      zurueck: t.zeigeStart,
      weiter: (profile) => {
        t.daten().letzteSpieler = profile.map((p) => p.id);
        sichere();
        t.partie = { anzahl, menschen: profile.map((p) => p.id), stufe: t.daten().stufe ?? 'gemuetlich' };
        t.starte();
      },
    });
  };

  t.starte = () => {
    const { anzahl, menschen } = t.partie;
    const profile = menschen.map((id) => alleProfile().find((p) => p.id === id) ?? alleProfile().at(-2));
    // Freie Plätze: Tablet, Tablet 2 …
    const tablets = Array.from({ length: anzahl - profile.length }, (_, i) => ({ ...TABLET, name: i ? `${TABLET.name} ${i + 1}` : TABLET.name }));
    t.partie.sitze = [...profile, ...tablets];
    t.partie.zustand = neuesSpiel(anzahl);
    zeigeSpiel(t);
  };

  // Nochmals: gleiche Plätze, neue Karten; jemand anderes beginnt
  t.nochmals = () => {
    t.partie.menschen = [...t.partie.menschen.slice(1), t.partie.menschen[0]];
    t.starte();
  };
  return t;
}
