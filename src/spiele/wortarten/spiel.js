import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { STUFEN, runde } from './woerter.js';
import { WOERTER_PRO_RUNDE } from './index.js';

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

export function zeigeSpiel(w) {
  const W = T.wortarten;
  const stufe = STUFEN[w.auswahl.stufe];
  const woerter = runde(w.auswahl.stufe, WOERTER_PRO_RUNDE, mischen);
  const spieler = w.auswahl.spieler.map((profil) => ({ profil, richtig: 0 }));
  const mehrspieler = spieler.length > 1;
  let nummer = 0;
  let ersterVersuch = true;
  let beantwortet = false;
  let beendet = false;

  const amZug = el('div', { class: 'am-zug lr-am-zug', role: 'status', 'aria-live': 'polite' });
  const zaehler = el('span', { class: 'anzeige lr-zaehler' });
  const wortKarte = el('div', { class: 'wa-wort' });
  const meldung = el('p', { class: 'meldung lr-frage wa-meldung', role: 'status', 'aria-live': 'polite' });
  const kisten = el('div', { class: `wa-kisten wa-${stufe.arten.length}` });
  const weiterKnopf = knopf(T.lebensraum.weiter, weiter, 'knopf-haupt lr-weiter');

  const kistenKnoepfe = stufe.arten.map((art) => {
    const k = el(
      'button',
      { class: `wa-kiste wa-${art}`, type: 'button' },
      el('span', { class: 'wa-kiste-name' }, W.kisten[art].name),
      el('span', { class: 'wa-kiste-hilfe' }, W.kisten[art].hilfe),
    );
    beiTipp(k, () => antworte(art, k));
    return k;
  });
  kisten.append(...kistenKnoepfe);

  const aktiver = () => spieler[nummer % spieler.length];

  function zeigeWort() {
    const wort = woerter[nummer];
    ersterVersuch = true;
    beantwortet = false;
    weiterKnopf.hidden = true;
    zaehler.textContent = W.wortVon(nummer + 1, woerter.length);
    const s = aktiver();
    amZug.hidden = !mehrspieler;
    amZug.style.cssText = farbStil(s.profil);
    amZug.replaceChildren(
      el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
      el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, s.profil.name), ' ', el('span', { class: 'am-zug-text' }, T.spiel.istDran)),
    );
    // In der Profi-Stufe verrät die Grossschreibung nichts
    wortKarte.textContent = stufe.grossbuchstaben ? wort.wort.toUpperCase() : wort.wort;
    meldung.textContent = W.frageWort;
    meldung.classList.remove('richtig');
    for (const k of kistenKnoepfe) k.classList.remove('richtig', 'falsch');
    sprich(wort.wort);
  }

  function antworte(art, kiste) {
    if (beantwortet || beendet || kiste.classList.contains('falsch')) return;
    const wort = woerter[nummer];
    if (art === wort.art) {
      beantwortet = true;
      kiste.classList.add('richtig');
      klang.paar();
      if (ersterVersuch) aktiver().richtig++;
      // Die Probe zeigen: so erkennt man die Wortart
      wortKarte.textContent = wort.art === 'nomen' ? wort.probe : wort.wort;
      const text = `${zufall(W.richtig)} ${W.erklaerung[wort.art](wort.probe)}`;
      meldung.textContent = text;
      meldung.classList.add('richtig');
      sprich(text);
      weiterKnopf.textContent = nummer + 1 < woerter.length ? T.lebensraum.weiter : T.lebensraum.fertig;
      weiterKnopf.hidden = false;
    } else {
      ersterVersuch = false;
      kiste.classList.add('falsch');
      const text = W.tipp[art](stufe.grossbuchstaben ? wort.wort.toUpperCase() : wort.wort);
      meldung.textContent = text;
      meldung.classList.remove('richtig');
      sprich(text);
    }
  }

  function weiter() {
    if (!beantwortet || beendet) return;
    nummer++;
    if (nummer < woerter.length) {
      if (mehrspieler) klang.wechsel();
      zeigeWort();
      return;
    }
    beendet = true;
    w.zeigeEnde({ spieler, gesamt: woerter.length });
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      w.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm wa-spiel', style: '--set-farbe: #E3F0D9' },
      el('header', { class: 'spiel-kopf' }, amZug, zaehler, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el('div', { class: 'wa-oben' }, wortKarte, el('div', { class: 'lr-rechts' }, meldung, weiterKnopf)),
      kisten,
    ),
  );
  zeigeWort();
}
