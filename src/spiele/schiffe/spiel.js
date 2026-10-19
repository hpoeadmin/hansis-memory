// Spielbildschirm: gross das Meer des Gegners (dort schiesst man), klein die eigene Flotte.
// Nach einem Treffer darf man nochmals. Gegen das Tablet sieht man dessen Schüsse auf der eigenen Flotte.
import { T } from '../../texte.js';
import { el, knopf, zeige, bestaetigen } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { alleVersenkt, computerSchuss, feldName, schiesse } from './logik.js';
import { flottenAnzeige, zeichneRaster } from './raster.js';
import { FARBE, zeigeWeitergeben } from './index.js';

const DENKPAUSE = 1100; // ms, damit man die Schüsse des Tablets mitverfolgen kann
const WECHSELPAUSE = 1600; // ms nach «Wasser», bevor die andere Seite dran ist

export function zeigeSpiel(s) {
  const S = T.schiffe;
  const partie = s.partie;
  const spieler = partie.spielerIds.map(s.profilVon);
  const gegenTablet = spieler.some((p) => p.computer);
  // Gegen das Tablet sieht man immer die Sicht des Menschen (Seite 0)
  const sicht = gegenTablet ? 0 : partie.amZug;
  const gegner = 1 - sicht;
  let gesperrt = false;
  let beendet = false;
  let zuletzt = { gegner: null, eigen: null };

  const meldung = el('p', { class: 'sv-meldung', role: 'status', 'aria-live': 'polite' });
  const zielBox = el('div', { class: 'sv-feldbox' });
  const eigenBox = el('div', { class: 'sv-feldbox' });
  const flotteBox = el('div');

  function kopf(i, aktiv) {
    return el(
      'div',
      { class: `am-zug sv-spieler ${aktiv ? '' : 'sv-wartet'}`, style: farbStil(spieler[i]) },
      el('img', { class: 'avatar', src: avatarUrl(spieler[i]), alt: '' }),
      el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, spieler[i].name), aktiv ? el('span', { class: 'am-zug-text' }, ` ${T.spiel.istDran}`) : null),
    );
  }
  const kopfBox = el('div', { class: 'sv-koepfe' });

  function zeichne() {
    kopfBox.replaceChildren(kopf(sicht, partie.amZug === sicht), kopf(gegner, partie.amZug === gegner));
    const darfSchiessen = partie.amZug === sicht && !gesperrt && !beendet;
    zielBox.replaceChildren(zeichneRaster(partie.bretter[gegner], { beimTipp: darfSchiessen ? schuss : null, zuletzt: zuletzt.gegner }));
    eigenBox.replaceChildren(zeichneRaster(partie.bretter[sicht], { schiffeZeigen: true, klein: true, zuletzt: zuletzt.eigen }));
    flotteBox.replaceChildren(flottenAnzeige(partie.bretter[gegner]));
  }

  function melde(text, vorlesen = text) {
    meldung.textContent = text;
    sprich(vorlesen);
  }

  function ergebnisText(wer, feld, r) {
    if (r.ergebnis === 'wasser') return S.wasser(wer, feld);
    if (r.ergebnis === 'versenkt') return S.versenkt(wer, feld, r.schiff.laenge);
    return S.treffer(wer, feld);
  }

  // Schuss des Menschen, der gerade dran ist
  function schuss(x, y) {
    if (gesperrt || beendet || partie.amZug !== sicht) return;
    const r = schiesse(partie.bretter[gegner], x, y);
    if (!r) {
      melde(S.schonBeschossen);
      return;
    }
    zuletzt.gegner = { x, y };
    const feld = feldName(x, y);
    if (r.ergebnis === 'wasser') klang.wechsel();
    else klang.paar();
    melde(ergebnisText(null, feld, r) + (r.ergebnis !== 'wasser' ? ` ${S.nochmals}` : ''));
    if (alleVersenkt(partie.bretter[gegner])) return gewonnen(sicht);
    if (r.ergebnis === 'wasser') {
      gesperrt = true;
      zeichne();
      setTimeout(wechsle, WECHSELPAUSE);
      return;
    }
    zeichne();
  }

  function wechsle() {
    if (beendet) return;
    partie.amZug = 1 - partie.amZug;
    if (gegenTablet) {
      tabletZug();
      return;
    }
    // Zu zweit: Tablet weitergeben, dann die Sicht der anderen Person
    const naechster = spieler[partie.amZug];
    zeigeWeitergeben(naechster, S.wegschauen(spieler[1 - partie.amZug].name), () => zeigeSpiel(s));
  }

  // Das Tablet schiesst – nach einem Treffer nochmals
  function tabletZug() {
    gesperrt = true;
    melde(S.tabletZielt);
    zeichne();
    setTimeout(() => {
      if (beendet) return;
      const brett = partie.bretter[sicht];
      const [x, y] = computerSchuss(brett, partie.modus.stufe);
      const r = schiesse(brett, x, y);
      zuletzt.eigen = { x, y };
      if (r.ergebnis === 'wasser') klang.wechsel();
      else klang.schlagen();
      melde(ergebnisText(spieler[gegner].name, feldName(x, y), r));
      zeichne();
      if (alleVersenkt(brett)) {
        setTimeout(() => gewonnen(gegner), DENKPAUSE);
        return;
      }
      if (r.ergebnis !== 'wasser') {
        setTimeout(tabletZug, DENKPAUSE);
        return;
      }
      setTimeout(() => {
        if (beendet) return;
        partie.amZug = sicht;
        gesperrt = false;
        melde(S.duBistDran(spieler[sicht].name));
        zeichne();
      }, DENKPAUSE);
    }, DENKPAUSE);
  }

  function gewonnen(i) {
    beendet = true;
    partie.sieger = i;
    zeichne();
    setTimeout(() => s.spielFertig(), 1500);
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      s.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm sv-spiel', style: `--set-farbe: ${FARBE}` },
      el('header', { class: 'spiel-kopf' }, kopfBox, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el(
        'div',
        { class: 'sv-mitte' },
        el('section', { class: 'sv-ziel' }, el('h2', { class: 'sv-ueberschrift' }, S.meerVon(spieler[gegner].name)), zielBox),
        el(
          'aside',
          { class: 'sv-seite' },
          meldung,
          el('h2', { class: 'sv-ueberschrift' }, S.nochImSpiel), flotteBox,
          el('h2', { class: 'sv-ueberschrift' }, S.deineFlotte), eigenBox,
        ),
      ),
    ),
  );
  zeichne();
  if (partie.amZug === sicht) melde(S.duBistDran(spieler[sicht].name));
  else tabletZug();
}
