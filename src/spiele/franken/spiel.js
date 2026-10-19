import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { bildUrl } from '../memory/sets.js';
import { STUFEN, aufgabe, betrag, geldName, summe, zerlegung } from './geld.js';
import { geldSvg } from './bilder.js';
import { EINKAEUFE } from './index.js';

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

export function zeigeSpiel(f) {
  const F = T.franken;
  const stufenName = f.auswahl.stufe;
  const stufe = STUFEN[stufenName];
  const tiere = mischen(f.sets.filter((s) => s.status === 'bereit').flatMap((set) => set.tiere.map((tier) => ({ set, tier }))));
  const aufgaben = Array.from({ length: EINKAEUFE }, (_, i) => ({ ...aufgabe(stufenName), ...tiere[i] }));
  const spieler = f.auswahl.spieler.map((profil) => ({ profil, richtig: 0 }));
  const mehrspieler = spieler.length > 1;

  let nummer = 0;
  let teller = [];
  let fehlversuche = 0;
  let geloest = false;
  let beendet = false;

  const amZug = el('div', { class: 'am-zug lr-am-zug', role: 'status', 'aria-live': 'polite' });
  const zaehler = el('span', { class: 'anzeige lr-zaehler' });
  const ware = el('div', { class: 'fr-ware' });
  const auftrag = el('div', { class: 'fr-auftrag' });
  const meldung = el('p', { class: 'meldung fr-meldung', role: 'status', 'aria-live': 'polite' });
  const tellerBox = el('div', { class: 'fr-teller', 'aria-label': F.teller });
  const tellerSumme = el('p', { class: 'fr-summe' });
  const bezahlKnopf = knopf(stufenName === 'rueckgeld' ? F.rueckgeldGeben : F.bezahlen, pruefe, 'knopf-haupt fr-bezahlen');
  const weiterKnopf = knopf(T.lebensraum.weiter, weiter, 'knopf-haupt fr-bezahlen');

  // Geldbeutel: von jeder Münze und Note beliebig viele
  const beutel = el(
    'div',
    { class: 'fr-beutel' },
    stufe.geld.map((wert) => {
      const k = el('button', { class: 'fr-geld', type: 'button', 'aria-label': geldName(wert) });
      k.innerHTML = geldSvg(wert);
      beiTipp(k, () => legeHin(wert), { sperrzeit: 120 });
      return k;
    }),
  );

  const aktiver = () => spieler[nummer % spieler.length];

  function zeichneTeller() {
    tellerBox.replaceChildren(
      ...(teller.length
        ? teller.map((wert, i) => {
            const k = el('button', { class: 'fr-geld fr-auf-teller', type: 'button', 'aria-label': geldName(wert) });
            k.innerHTML = geldSvg(wert);
            beiTipp(k, () => nimmWeg(i), { sperrzeit: 120 });
            return k;
          })
        : [el('span', { class: 'fr-leer' }, F.tellerLeer)]),
    );
    tellerSumme.textContent = stufe.anzeige ? F.aufDemTeller(betrag(summe(teller))) : teller.length ? F.wegnehmen : '';
  }

  function zeigeAufgabe() {
    const a = aufgaben[nummer];
    teller = [];
    fehlversuche = 0;
    geloest = false;
    bezahlKnopf.hidden = false;
    weiterKnopf.hidden = true;
    zaehler.textContent = F.aufgabeVon(nummer + 1, aufgaben.length);
    const s = aktiver();
    amZug.hidden = !mehrspieler;
    amZug.style.cssText = farbStil(s.profil);
    amZug.replaceChildren(
      el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
      el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, s.profil.name), ' ', el('span', { class: 'am-zug-text' }, T.spiel.istDran)),
    );
    ware.style.cssText = `--set-farbe: ${a.set.farbe}`;
    ware.replaceChildren(
      el('img', { src: bildUrl(a.set, a.tier.bild), alt: '' }),
      el('span', { class: 'fr-preisschild' }, betrag(a.preis)),
    );
    const satz = F.kostet(a.tier.artikel, a.tier.name, betrag(a.preis));
    const zweiter = stufenName === 'rueckgeld' ? F.rueckgeldAufgabe(a.note / 100) : F.bezahlenAufgabe;
    auftrag.replaceChildren(el('p', { class: 'fr-satz' }, satz), el('p', { class: 'fr-satz2' }, zweiter));
    if (stufenName === 'rueckgeld') {
      const note = el('span', { class: 'fr-bezahlt-mit' });
      note.innerHTML = geldSvg(a.note);
      auftrag.append(note);
    }
    meldung.textContent = '';
    meldung.classList.remove('richtig');
    zeichneTeller();
    sprich(`${satz} ${zweiter}`);
  }

  function legeHin(wert) {
    if (geloest || beendet) return;
    teller.push(wert);
    klang.hupf();
    zeichneTeller();
  }

  function nimmWeg(i) {
    if (geloest || beendet) return;
    teller.splice(i, 1);
    zeichneTeller();
  }

  function pruefe() {
    if (geloest || beendet || !teller.length) return;
    const a = aufgaben[nummer];
    const ist = summe(teller);
    if (ist === a.ziel) {
      geloest = true;
      klang.paar();
      if (fehlversuche === 0) aktiver().richtig++;
      const text = zufall(F.richtig);
      meldung.textContent = stufe.anzeige ? text : `${text} ${F.aufDemTeller(betrag(ist))}`;
      meldung.classList.add('richtig');
      sprich(text);
      bezahlKnopf.hidden = true;
      weiterKnopf.textContent = nummer + 1 < aufgaben.length ? T.lebensraum.weiter : T.lebensraum.fertig;
      weiterKnopf.hidden = false;
      return;
    }
    fehlversuche++;
    let text;
    if (stufe.anzeige) text = ist < a.ziel ? F.zuWenigBetrag(betrag(a.ziel - ist)) : F.zuVielBetrag(betrag(ist - a.ziel));
    else text = ist < a.ziel ? F.zuWenig : F.zuViel;
    // Nach zwei Fehlversuchen: ein Lösungsvorschlag
    if (fehlversuche >= 2) text += ` ${F.vorschlag(zerlegung(a.ziel, stufe.geld).map(geldName).join(' + '))}`;
    meldung.textContent = text;
    meldung.classList.remove('richtig');
    sprich(text);
  }

  function weiter() {
    if (!geloest || beendet) return;
    nummer++;
    if (nummer < aufgaben.length) {
      if (mehrspieler) klang.wechsel();
      zeigeAufgabe();
      return;
    }
    beendet = true;
    f.zeigeEnde({ spieler, gesamt: aufgaben.length });
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      f.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm fr-spiel', style: '--set-farbe: #FFF3D6' },
      el('header', { class: 'spiel-kopf' }, amZug, zaehler, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el(
        'div',
        { class: 'fr-oben' },
        ware,
        el('div', { class: 'fr-mitte' }, auftrag, el('div', { class: 'fr-tellerbox' }, tellerBox, tellerSumme), meldung, el('div', { class: 'fr-knoepfe' }, bezahlKnopf, weiterKnopf)),
      ),
      beutel,
    ),
  );
  zeigeAufgabe();
}
