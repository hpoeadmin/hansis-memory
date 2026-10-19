import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen } from '../../kern/ui.js';
import { avatarUrl, farbStil, merkeGefunden } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { bildUrl, tierName } from '../memory/sets.js';
import { ORT_BILD } from './index.js';

const BASIS = import.meta.env.BASE_URL;

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

// Tiere so mischen, dass alle Lebensräume vorkommen und nicht zweimal dasselbe Tier erscheint
function waehleTiere(sets, anzahl) {
  const proSet = sets.map((set) => mischen(set.tiere).map((tier) => ({ set, tier })));
  const liste = [];
  for (let i = 0; liste.length < anzahl; i++) {
    for (const reihe of mischen(proSet)) if (reihe[i] && liste.length < anzahl) liste.push(reihe[i]);
  }
  return mischen(liste);
}

export function zeigeSpiel(l) {
  const L = T.lebensraum;
  const sets = l.sets.filter((s) => s.status === 'bereit');
  const fragen = waehleTiere(sets, l.auswahl.runden);
  const spieler = l.auswahl.spieler.map((profil) => ({ profil, richtig: 0, neueTiere: [], neuesAbzeichen: false }));
  const mehrspieler = spieler.length > 1;
  let nummer = 0;
  let ersterVersuch = true;
  let beantwortet = false;
  let beendet = false;

  const amZug = el('div', { class: 'am-zug lr-am-zug', role: 'status', 'aria-live': 'polite' });
  const zaehler = el('span', { class: 'anzeige lr-zaehler' });
  const tierKarte = el('div', { class: 'lr-tier' });
  const frage = el('p', { class: 'meldung lr-frage', role: 'status', 'aria-live': 'polite' });
  const orte = el('div', { class: 'lr-orte' });
  const weiterKnopf = knopf(L.weiter, weiter, 'knopf-haupt lr-weiter');

  function aktiver() {
    return spieler[nummer % spieler.length];
  }

  function zeigeFrage() {
    const { set, tier } = fragen[nummer];
    ersterVersuch = true;
    beantwortet = false;
    weiterKnopf.hidden = true;
    zaehler.textContent = L.tierVon(nummer + 1, fragen.length);

    const s = aktiver();
    amZug.style.cssText = farbStil(s.profil);
    amZug.replaceChildren(
      el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
      el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, s.profil.name), ' ', el('span', { class: 'am-zug-text' }, T.spiel.istDran)),
    );
    amZug.hidden = !mehrspieler;

    tierKarte.style.cssText = `--set-farbe: ${set.farbe}`;
    tierKarte.replaceChildren(
      el('img', { src: bildUrl(set, tier.bild), alt: '' }),
      el('span', { class: 'lr-tiername' }, tierName(tier)),
    );
    const text = L.wo(tier.artikel, tier.name);
    frage.textContent = text;
    frage.classList.remove('richtig');
    sprich(text);

    orte.replaceChildren(
      ...sets.map((ort) => {
        const k = el(
          'button',
          { class: 'lr-ort', type: 'button', style: `--set-farbe: ${ort.farbe}` },
          el('img', { src: `${BASIS}${ORT_BILD[ort.id]}`, alt: '' }),
          el('span', { class: 'lr-ortname' }, L.orte[ort.id]),
        );
        beiTipp(k, () => antworte(ort, k));
        return k;
      }),
    );
  }

  function antworte(ort, knopfElement) {
    if (beantwortet || beendet || knopfElement.classList.contains('falsch')) return;
    const { set, tier } = fragen[nummer];
    if (ort.id === set.id) {
      beantwortet = true;
      knopfElement.classList.add('richtig');
      klang.paar();
      const s = aktiver();
      if (ersterVersuch) s.richtig++;
      const album = merkeGefunden(s.profil, set, tier.id);
      if (album.neu) s.neueTiere.push(tier);
      if (album.komplett) s.neuesAbzeichen = true;
      frage.textContent = `${zufall(L.richtig)} ${tier.info}`;
      frage.classList.add('richtig');
      sprich(tier.info);
      weiterKnopf.textContent = nummer + 1 < fragen.length ? L.weiter : L.fertig;
      weiterKnopf.hidden = false;
    } else {
      ersterVersuch = false;
      knopfElement.classList.add('falsch');
      frage.textContent = L.falsch(tier.artikel, tier.name, L.orte[ort.id]);
      frage.classList.remove('richtig');
    }
  }

  function weiter() {
    if (!beantwortet || beendet) return;
    nummer++;
    if (nummer < fragen.length) {
      if (mehrspieler) klang.wechsel();
      zeigeFrage();
      return;
    }
    beendet = true;
    l.zeigeEnde({ spieler, gesamt: fragen.length });
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      l.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm lr-spiel', style: '--set-farbe: #FBE7C6' },
      el('header', { class: 'spiel-kopf' }, amZug, zaehler, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el('div', { class: 'lr-oben' }, tierKarte, el('div', { class: 'lr-rechts' }, frage, weiterKnopf)),
      orte,
    ),
  );
  zeigeFrage();
}
