import { T } from '../../texte.js';
import { el, knopf, zeige, bestaetigen, warte } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { fuehreAus, imZiel, passe, wuerfle, zuege } from './regeln.js';
import { waehleZug } from './computer.js';
import { FARBEN, pfad, sperren, zeichneBrett } from './brett.js';

const DENKPAUSE = 800; // ms, bevor das Tablet würfelt oder zieht
const HUEPFER = 140; // ms pro Feld beim Ziehen
const MAX_VERLAUF = 80;

const PUNKTE = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

function wuerfelBild(augen) {
  const box = el('div', { class: 'emw-wuerfel', role: 'img', 'aria-label': augen ? String(augen) : '' });
  const punkte = (PUNKTE[augen] ?? [])
    .map(([a, b]) => `<circle cx="${60 + a * 28}" cy="${60 + b * 28}" r="10" fill="#2E2A26"/>`)
    .join('');
  box.innerHTML = `<svg viewBox="0 0 120 120"><rect x="8" y="8" width="104" height="104" rx="22" fill="#FFFFFF" stroke="#2E2A26" stroke-width="7"/>${punkte}</svg>`;
  return box;
}

export function zeigeSpiel(e) {
  const E = T.eilemitweile;
  const partie = e.partie;
  const profil = {};
  for (const s of partie.sitze) profil[s.arm] = e.profilVon(s.profilId);
  const istComputer = (arm) => Boolean(profil[arm].computer);
  const name = (arm) => (profil[arm].computer ? `${profil[arm].name} (${E.farben[arm]})` : profil[arm].name);

  let beschaeftigt = false; // Würfel rollt, Figur hüpft oder Tablet denkt
  let beendet = false;
  let bewegt = null;
  let meldungText = '';
  let anzeigeWurf = partie.zustand.wurf;

  const meldung = el('div', { class: 'meldung', role: 'status', 'aria-live': 'polite' });
  const spielerListe = el('div', { class: 'emw-spieler' });
  const brettBox = el('div', { class: 'emw-mitte' });
  const wuerfelBox = el('div', { class: 'emw-wuerfelbox' });
  const wuerfelKnopf = knopf(E.wuerfeln, wuerfeln, 'knopf-haupt knopf-wuerfeln');
  const wuerfelHinweis = el('p', { class: 'emw-hinweis' });
  const zurueckKnopf = knopf(T.nuenistei.zugZurueck, zugZurueck, 'knopf-zug-zurueck');
  const beendenKnopf = knopf(T.spiel.beenden, beenden, 'knopf-beenden');

  // ---------- Anzeige ----------

  function standardMeldung(z) {
    const arm = z.amZug;
    if (istComputer(arm)) return E.tabletWuerfelt(E.farben[arm]);
    if (z.wurf === null) return E.wuerfelnHinweis(name(arm));
    return z.wurf === 6 ? E.sechs(name(arm)) : E.gewuerfelt(name(arm), z.wurf);
  }

  function zeichne() {
    const z = partie.zustand;
    const arm = z.amZug;
    meldung.textContent = meldungText || standardMeldung(z);

    spielerListe.replaceChildren(
      ...z.arme.map((a) => {
        const p = profil[a];
        const aktiv = a === arm && z.sieger === null;
        return el(
          'div',
          {
            class: `emw-spielerkarte ${aktiv ? 'aktiv' : ''}`,
            style: `${farbStil(p)} --brettfarbe: ${FARBEN[a]}`,
          },
          el('img', { class: 'avatar', src: avatarUrl(p), alt: '' }),
          el(
            'span',
            { class: 'emw-spielertext' },
            el('span', { class: 'emw-name' }, p.name),
            el(
              'span',
              { class: 'emw-info' },
              [E.farben[a], imZiel(z, a) ? E.imZiel(imZiel(z, a)) : null, p.computer ? E.tablet : null]
                .filter(Boolean)
                .join(' · '),
            ),
          ),
          aktiv ? el('span', { class: 'emw-pfeil', 'aria-hidden': 'true' }, '▶') : null,
        );
      }),
    );

    const mensch = !istComputer(arm) && !beschaeftigt;
    const beweglich = mensch && z.wurf !== null ? zuege(z) : [];
    brettBox.replaceChildren(
      zeichneBrett({ zustand: z, beweglich, bewegt, sperren: sperren(z) }, (element, zug) =>
        beiTippZug(element, zug),
      ),
    );

    wuerfelBox.replaceChildren(wuerfelBild(anzeigeWurf));
    const darfWuerfeln = mensch && z.wurf === null && z.sieger === null;
    wuerfelKnopf.classList.toggle('inaktiv', !darfWuerfeln);
    wuerfelKnopf.setAttribute('aria-disabled', darfWuerfeln ? 'false' : 'true');
    wuerfelHinweis.textContent = mensch && z.wurf !== null ? E.wuerfelnWarten : '';
    wuerfelKnopf.style.cssText = `--spieler-farbe: ${FARBEN[arm]}`;

    zurueckKnopf.hidden = e.einstellungen.emwZugZurueck === false;
    const moeglich = !beschaeftigt && partie.verlauf.some((s) => !istComputer(s.amZug));
    zurueckKnopf.classList.toggle('inaktiv', !moeglich);
  }

  // Figuren reagieren schon beim Berühren (wie überall), Tippflächen sind gross
  function beiTippZug(element, zug) {
    element.addEventListener('pointerdown', (ereignis) => {
      ereignis.preventDefault();
      ziehe(zug);
    });
  }

  // ---------- Ablauf ----------

  async function wuerfeln() {
    const z = partie.zustand;
    if (beendet || beschaeftigt || z.wurf !== null || z.sieger !== null) return;
    if (istComputer(z.amZug) && !automatisch) return;
    beschaeftigt = true;
    meldungText = '';
    klang.wuerfeln();
    for (let i = 0; i < 6; i++) {
      anzeigeWurf = 1 + Math.floor(Math.random() * 6);
      zeichne();
      await warte(70);
    }
    const augen = 1 + Math.floor(Math.random() * 6);
    anzeigeWurf = augen;
    partie.zustand = wuerfle(z, augen);
    sprich(E.augen[augen - 1]);
    beschaeftigt = false;

    const moeglich = zuege(partie.zustand);
    const arm = partie.zustand.amZug;
    if (moeglich.length === 0) {
      meldungText = augen === 6 ? E.keinZugSechs(name(arm)) : E.keinZug(name(arm), augen);
      beschaeftigt = true;
      zeichne();
      await warte(1600);
      if (beendet) return;
      beschaeftigt = false;
      meldungText = '';
      partie.zustand = passe(partie.zustand);
      e.speichere();
      zeichne();
      weiter();
      return;
    }
    e.speichere();
    zeichne();
    if (istComputer(arm)) {
      await warte(DENKPAUSE);
      if (!beendet) ziehe(waehleZug(partie.zustand), true);
    }
  }

  let automatisch = false;

  async function ziehe(zug, vomComputer = false) {
    const z = partie.zustand;
    if (beendet || beschaeftigt || !zug) return;
    if (istComputer(z.amZug) !== vomComputer) return;
    beschaeftigt = true;
    meldungText = '';
    if (!vomComputer) {
      partie.verlauf.push(z);
      if (partie.verlauf.length > MAX_VERLAUF) partie.verlauf.shift();
    }

    // Die Figur hüpft Feld für Feld
    for (const xy of pfad(z.amZug, zug.figur, zug.von, zug.nach)) {
      bewegt = { arm: z.amZug, figur: zug.figur, xy };
      zeichne();
      klang.hupf();
      await warte(HUEPFER);
      if (beendet) return;
    }
    bewegt = null;

    const vorher = z;
    partie.zustand = fuehreAus(z, zug);
    const { geschlagen } = partie.zustand.letzterZug;
    if (geschlagen.length) {
      klang.schlagen();
      meldungText = E.geschlagen(name(vorher.amZug), geschlagen.map((g) => name(g.arm)).join(' und '));
    } else if (zug.nach >= 76 && zug.von < 76) {
      klang.paar();
    }
    e.speichere();
    beschaeftigt = false;
    zeichne();

    if (partie.zustand.sieger !== null) {
      beendet = true;
      await warte(1400);
      e.spielFertig();
      return;
    }
    if (geschlagen.length) await warte(1200);
    meldungText = '';
    zeichne();
    weiter();
  }

  // Ist das Tablet dran, würfelt und zieht es selbst
  async function weiter() {
    const z = partie.zustand;
    if (beendet || z.sieger !== null || !istComputer(z.amZug)) return;
    beschaeftigt = true;
    zeichne();
    await warte(DENKPAUSE);
    if (beendet) return;
    beschaeftigt = false;
    automatisch = true;
    if (partie.zustand.wurf === null) await wuerfeln();
    else ziehe(waehleZug(partie.zustand), true);
    automatisch = false;
  }

  function zugZurueck() {
    if (beschaeftigt || e.einstellungen.emwZugZurueck === false) return;
    let ziel = null;
    while (partie.verlauf.length) {
      ziel = partie.verlauf.pop();
      if (!istComputer(ziel.amZug)) break;
    }
    if (!ziel) return;
    partie.zustand = ziel;
    anzeigeWurf = ziel.wurf;
    meldungText = '';
    e.speichere();
    zeichne();
  }

  async function beenden() {
    const ja = await bestaetigen(T.nuenistei.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      e.speichere();
      e.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm emw-spiel' },
      meldung,
      spielerListe,
      brettBox,
      el('div', { class: 'emw-rechts' }, wuerfelBox, wuerfelKnopf, wuerfelHinweis),
      el('footer', { class: 'muehle-fuss emw-fuss' }, zurueckKnopf, beendenKnopf),
    ),
  );
  zeichne();
  // Tippen auf den Würfel selbst würfelt auch
  wuerfelBox.addEventListener('pointerdown', (ereignis) => {
    ereignis.preventDefault();
    wuerfeln();
  });
  weiter();
}
