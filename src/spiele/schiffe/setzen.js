// Schiffe setzen: das Tablet hat schon verteilt. Schiff antippen = auswählen,
// nochmals antippen = drehen, freies Feld antippen = dorthin verschieben.
import { T } from '../../texte.js';
import { el, knopf, zeige } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { GROESSEN, passt, schiffAuf, zufallsFlotte } from './logik.js';
import { zeichneRaster } from './raster.js';
import { FARBE } from './index.js';

export function zeigeSetzen(s, i, fertig) {
  const S = T.schiffe;
  const partie = s.partie;
  const brett = partie.bretter[i];
  const { n } = GROESSEN[partie.groesse];
  const profil = s.profilVon(partie.spielerIds[i]);
  let gewaehlt = null;

  const meldung = el('p', { class: 'sv-meldung', role: 'status', 'aria-live': 'polite' }, S.setzenHilfe);
  const feldBox = el('div', { class: 'sv-feldbox' });

  function zeichne() {
    feldBox.replaceChildren(zeichneRaster(brett, { schiffeZeigen: true, gewaehlt, beimTipp: tippe }));
  }

  function tippe(x, y) {
    const schiff = schiffAuf(brett, x, y);
    if (schiff) {
      if (gewaehlt === schiff.id) {
        // Drehen – wenn es so Platz hat
        const gedreht = { ...schiff, quer: !schiff.quer };
        if (passt(brett.schiffe, gedreht, n)) {
          Object.assign(schiff, gedreht);
          klang.hupf();
          meldung.textContent = S.gedreht;
        } else meldung.textContent = S.keinPlatz;
      } else {
        gewaehlt = schiff.id;
        klang.umdrehen();
        meldung.textContent = S.gewaehlt(schiff.laenge);
      }
      zeichne();
      return;
    }
    if (gewaehlt === null) {
      meldung.textContent = S.setzenHilfe;
      return;
    }
    // Verschieben: zuerst in der bisherigen Lage, sonst gedreht
    const alt = brett.schiffe.find((sch) => sch.id === gewaehlt);
    const neu = [
      { ...alt, x, y },
      { ...alt, x, y, quer: !alt.quer },
    ].find((kandidat) => passt(brett.schiffe, kandidat, n));
    if (neu) {
      Object.assign(alt, neu);
      klang.hupf();
      meldung.textContent = S.verschoben;
    } else meldung.textContent = S.keinPlatz;
    zeichne();
  }

  const neuKnopf = knopf(S.neuVerteilen, () => {
    brett.schiffe = zufallsFlotte(partie.groesse);
    gewaehlt = null;
    meldung.textContent = S.setzenHilfe;
    zeichne();
  }, 'knopf-neben');
  const fertigKnopf = knopf(S.fertigGesetzt, fertig, 'knopf-haupt');

  zeige(
    el(
      'main',
      { class: 'bildschirm sv-setzen', style: `--set-farbe: ${FARBE}` },
      el(
        'header',
        { class: 'spiel-kopf' },
        el(
          'div',
          { class: 'am-zug', style: farbStil(profil) },
          el('img', { class: 'avatar', src: avatarUrl(profil), alt: '' }),
          el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, profil.name)),
        ),
        el('h1', { class: 'sv-titel' }, S.setzenTitel),
        knopf(T.spiel.beenden, () => s.zeigeStart(), 'knopf-beenden'),
      ),
      el('div', { class: 'sv-setzen-mitte' }, feldBox, el('div', { class: 'sv-seite' }, meldung, neuKnopf, fertigKnopf)),
    ),
  );
  zeichne();
  sprich(`${profil.name}: ${S.setzenTitel} ${S.setzenHilfe}`);
}
