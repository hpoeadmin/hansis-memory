// Gemeinsamer Rahmen für Frage-Spiele mit Stufen (Einmaleins, Uhr lesen):
// Stufenwahl → Spieler → Fragen mit Antwortknöpfen → Rundenende.
//
// spiel = {
//   id,                     Schlüssel in T.spiele
//   farbe,                  Hintergrundfarbe
//   texte,                  { frage, stufen: { id: { titel, text } }, frageVon(n, gesamt),
//                             richtig: [...], nochmals, ergebnisEinzel, ergebnisSpieler }
//   stufenBild(id),         kleines Bild für die Stufen-Kachel (Element)
//   empfehlung,             { kl12: 'stufe', kl34: …, kl56: … }
//   anzahl,                 Fragen pro Runde
//   erzeugeFragen(stufe, anzahl) → [frage]
// }
// frage = {
//   text,                   Frage (wird gezeigt und vorgelesen)
//   bild?: () => Element,   z.B. Uhr, Punktefeld, Fahrplan
//   antworten: [{ text, klein?, richtig }],
//   erklaerung?,            nach der richtigen Antwort
//   hilfe?: (antwort) => { text, bild? }   nach einer falschen Antwort
//   interaktiv?: ({ richtig(), falsch(text) }) => Element   statt bild und Knöpfen:
//                           das Element meldet die Antwort selbst (Karte antippen)
// }
import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from './ui.js';
import { speicher } from './speicher.js';
import { avatarUrl, farbStil, findeProfil, merkeLetzteSpieler } from './profile.js';
import { passendeStufe } from './schulstufe.js';
import { klang } from './klang.js';
import { sprich } from './vorlesen.js';
import { zeigeSpieler } from './bildschirme/spieler.js';
import { zeigeRundenende } from './bildschirme/rundenende.js';

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

export function fragespielSteuerung(app, spiel) {
  const s = Object.create(app);
  s.auswahl = { stufe: null, spieler: [] };

  s.zeigeStart = () => zeigeStufen(s, spiel);
  s.waehleStufe = (stufe) => {
    s.auswahl.stufe = stufe;
    zeigeSpieler(app, {
      farbe: spiel.farbe,
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
  s.zeigeSpiel = () => zeigeFragen(s, spiel);
  s.zeigeEnde = ({ spieler, gesamt }) =>
    zeigeRundenende(s, {
      spieler,
      gesamt,
      farbe: spiel.farbe,
      texte: { einzel: spiel.texte.ergebnisEinzel, spieler: spiel.texte.ergebnisSpieler },
    });
  return s;
}

function zeigeStufen(s, spiel) {
  const S = spiel.texte;
  const empfohlen = passendeStufe(speicher.letzteSpieler.map(findeProfil).filter(Boolean), spiel.empfehlung);
  const kacheln = Object.keys(S.stufen).map((id) => {
    const k = el(
      'button',
      { class: 'set-kachel modus-kachel', type: 'button', style: `--set-farbe: ${spiel.farbe}` },
      el('div', { class: 'set-bild fs-stufenbild' }, spiel.stufenBild(id)),
      el('span', { class: 'set-name' }, S.stufen[id].titel),
      el('span', { class: 'modus-text' }, S.stufen[id].text),
      empfohlen?.stufe === id ? el('span', { class: 'passt-schild' }, T.schule.passtFuer(empfohlen.profil.name)) : null,
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
        el('h1', { class: 'titel' }, T.spiele[spiel.id]),
      ),
      el('p', { class: 'frage' }, S.frage),
      // Vier Stufen nebeneinander wie bei «Bezahlen mit Franken», sonst höchstens drei pro Zeile
      el('div', { class: kacheln.length === 4 ? 'set-raster' : 'set-raster spiel-raster', style: `--anzahl: ${kacheln.length}` }, kacheln),
    ),
  );
}

export function zeigeFragen(s, spiel) {
  const S = spiel.texte;
  const fragen = spiel.erzeugeFragen(s.auswahl.stufe, spiel.anzahl);
  const spieler = s.auswahl.spieler.map((profil) => ({ profil, richtig: 0 }));
  const mehrspieler = spieler.length > 1;
  let nummer = 0;
  let ersterVersuch = true;
  let beantwortet = false;
  let beendet = false;

  const amZug = el('div', { class: 'am-zug lr-am-zug', role: 'status', 'aria-live': 'polite' });
  const zaehler = el('span', { class: 'anzeige lr-zaehler' });
  const bildBox = el('div', { class: 'fs-bild' });
  const frageText = el('p', { class: 'fs-frage' });
  const meldung = el('p', { class: 'meldung fs-meldung', role: 'status', 'aria-live': 'polite' });
  const hilfeBox = el('div', { class: 'fs-hilfe' });
  const antwortBox = el('div', { class: 'fs-antworten' });
  const weiterKnopf = knopf(T.lebensraum.weiter, weiter, 'knopf-haupt fs-weiter');

  const aktiver = () => spieler[nummer % spieler.length];

  function zeigeFrage() {
    const f = fragen[nummer];
    ersterVersuch = true;
    beantwortet = false;
    weiterKnopf.hidden = true;
    zaehler.textContent = S.frageVon(nummer + 1, fragen.length);
    const sp = aktiver();
    amZug.hidden = !mehrspieler;
    amZug.style.cssText = farbStil(sp.profil);
    amZug.replaceChildren(
      el('img', { class: 'avatar', src: avatarUrl(sp.profil), alt: '' }),
      el('span', { class: 'am-zug-worte' }, el('span', { class: 'am-zug-name' }, sp.profil.name), ' ', el('span', { class: 'am-zug-text' }, T.spiel.istDran)),
    );
    // Interaktives Bild (z.B. Karte zum Antippen) meldet die Antwort selbst
    const bild = f.interaktiv
      ? f.interaktiv({ richtig: () => antworte({ richtig: true }, null), falsch: (text) => antworte({ richtig: false, text }, null) })
      : f.bild?.();
    bildBox.replaceChildren(...(bild ? [bild] : []));
    bildBox.hidden = !bild;
    frageText.textContent = f.text;
    meldung.textContent = '';
    meldung.classList.remove('richtig');
    hilfeBox.replaceChildren();
    antwortBox.replaceChildren(
      ...f.antworten.map((a) => {
        const k = el(
          'button',
          { class: 'fs-antwort', type: 'button' },
          el('span', { class: 'fs-antwort-text' }, a.text),
          a.klein ? el('span', { class: 'fs-antwort-klein' }, a.klein) : null,
        );
        beiTipp(k, () => antworte(a, k));
        return k;
      }),
    );
    sprich(f.sprich ?? f.text);
  }

  function antworte(antwort, k) {
    if (beantwortet || beendet || k?.classList.contains('falsch')) return;
    const f = fragen[nummer];
    if (antwort.richtig) {
      beantwortet = true;
      k?.classList.add('richtig');
      klang.paar();
      if (ersterVersuch) aktiver().richtig++;
      const text = f.erklaerung ? `${zufall(S.richtig)} ${f.erklaerung}` : zufall(S.richtig);
      meldung.textContent = text;
      meldung.classList.add('richtig');
      sprich(text);
      weiterKnopf.textContent = nummer + 1 < fragen.length ? T.lebensraum.weiter : T.lebensraum.fertig;
      weiterKnopf.hidden = false;
      return;
    }
    ersterVersuch = false;
    // Kein Fehlerton – nur die Hilfe
    k?.classList.add('falsch');
    const hilfe = f.hilfe?.(antwort);
    const text = hilfe?.text ?? antwort.text ?? S.nochmals;
    meldung.textContent = text;
    if (hilfe?.bild) hilfeBox.replaceChildren(hilfe.bild);
    sprich(text);
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
    s.zeigeEnde({ spieler, gesamt: fragen.length });
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
      { class: `bildschirm fs-spiel fs-${spiel.id}`, style: `--set-farbe: ${spiel.farbe}` },
      el('header', { class: 'spiel-kopf' }, amZug, zaehler, knopf(T.spiel.beenden, beenden, 'knopf-beenden')),
      el(
        'div',
        { class: 'fs-oben' },
        el('div', { class: 'fs-links' }, bildBox, hilfeBox),
        el('div', { class: 'fs-mitte' }, frageText, antwortBox, meldung, weiterKnopf),
      ),
    ),
  );
  zeigeFrage();
}
