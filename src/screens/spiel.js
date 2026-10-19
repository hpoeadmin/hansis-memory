import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen, warte } from '../ui.js';
import { STUFEN, bildUrl } from '../sets.js';
import { bestesRaster } from '../raster.js';
import { avatarUrl, farbStil, merkeGefunden } from '../profile.js';
import { klang } from '../klang.js';
import { sprich } from '../vorlesen.js';

const FLIP_DAUER = 500; // ms, muss zur CSS-Animation passen
const KARTEN_VERHAELTNIS = 0.8; // Breite / Höhe (Bild + Name)
const ABSTAND = 14;

const AUFDECK_DAUER = { normal: 2500, langsam: 4000, 'sehr-langsam': 6000 };

export function zeigeSpiel(app) {
  const { set, stufe } = app.auswahl;
  const paare = STUFEN[stufe].paare;
  const tiere = mischen(set.tiere).slice(0, paare);
  // Bilder vorladen, damit das Aufdecken ohne Verzögerung klappt
  for (const tier of tiere) new Image().src = bildUrl(set, tier.bild);

  const karten = mischen([...tiere, ...tiere]).map((tier) => ({
    tier,
    offen: false,
    gefunden: false,
    element: null,
  }));

  const spieler = app.auswahl.spieler.map((profil) => ({
    profil,
    paare: 0,
    neueTiere: [],
    neuesAbzeichen: false,
  }));
  const mehrspieler = spieler.length > 1;
  const zustand = { zuege: 0, gefunden: 0, aktiv: 0, offen: [], gesperrt: false, beendet: false };

  // ---------- Kopfzeile ----------

  const zuegeAnzeige = el('span', { class: 'zahl' }, '0');
  const paareAnzeige = el('span', { class: 'zahl' }, T.spiel.vonGesamt(0, paare));

  const amZugAvatar = el('img', { class: 'avatar', alt: '' });
  const amZugName = el('span', { class: 'am-zug-name' });
  const amZugText = el('span', { class: 'am-zug-text' });
  const amZug = el(
    'div',
    { class: 'am-zug', role: 'status', 'aria-live': 'polite' },
    amZugAvatar,
    el('span', { class: 'am-zug-worte' }, amZugName, ' ', amZugText),
  );

  const chips = spieler.map((s) => {
    const punkte = el('span', { class: 'chip-punkte' }, '0');
    const chip = el(
      'div',
      { class: 'punkte-chip', style: farbStil(s.profil) },
      el('span', { class: 'chip-pfeil', 'aria-hidden': 'true' }, '▶'),
      el('img', { class: 'avatar', src: avatarUrl(s.profil), alt: '' }),
      el('span', { class: 'chip-name' }, s.profil.name),
      punkte,
    );
    return { chip, punkte };
  });

  function aktualisiereKopf(nochmals = false) {
    const s = spieler[zustand.aktiv];
    amZug.style.cssText = farbStil(s.profil);
    amZugAvatar.src = avatarUrl(s.profil);
    amZugName.textContent = s.profil.name;
    amZugText.textContent = nochmals ? T.spiel.nochmals : T.spiel.istDran;
    amZug.classList.remove('wechsel');
    void amZug.offsetWidth; // Animation neu starten
    amZug.classList.add('wechsel');
    spieler.forEach((sp, i) => {
      chips[i].chip.classList.toggle('aktiv', i === zustand.aktiv);
      chips[i].punkte.textContent = String(sp.paare);
      chips[i].punkte.setAttribute('aria-label', T.spiel.punkte(sp.paare));
    });
  }

  // ---------- Paar-Anzeige: Tiername gross über dem Brett ----------

  const paarBild = el('img', { alt: '' });
  const paarName = el('span', { class: 'paar-name' });
  const paarAnzeige = el(
    'div',
    { class: 'paar-anzeige', 'aria-hidden': 'true' },
    el('div', { class: 'paar-karte' }, paarBild, paarName),
  );
  let paarZeit = null;

  function zeigePaar(tier) {
    paarBild.src = bildUrl(set, tier.bild);
    paarName.textContent = tier.name;
    paarAnzeige.classList.remove('sichtbar');
    void paarAnzeige.offsetWidth;
    paarAnzeige.classList.add('sichtbar');
    clearTimeout(paarZeit);
    paarZeit = setTimeout(() => paarAnzeige.classList.remove('sichtbar'), 1600);
  }

  // ---------- Karten ----------

  const brett = el('div', { class: 'brett', style: `--set-farbe: ${set.farbe}` });

  for (const karte of karten) {
    karte.element = el(
      'button',
      { class: 'karte', type: 'button', 'aria-label': T.spiel.karteVerdeckt },
      el(
        'div',
        { class: 'karte-innen' },
        el('div', { class: 'seite rueckseite' }),
        el(
          'div',
          { class: 'seite vorderseite' },
          el('img', { src: bildUrl(set, karte.tier.bild), alt: '', draggable: 'false' }),
          el('span', { class: 'karte-name' }, karte.tier.name),
        ),
      ),
    );
    beiTipp(karte.element, () => tippeKarte(karte));
    brett.append(karte.element);
  }

  function setzeOffen(karte, offen) {
    karte.offen = offen;
    karte.element.classList.toggle('offen', offen);
    karte.element.setAttribute('aria-label', offen ? karte.tier.name : T.spiel.karteVerdeckt);
  }

  async function tippeKarte(karte) {
    if (zustand.gesperrt || karte.offen || karte.gefunden || zustand.beendet) return;
    setzeOffen(karte, true);
    zustand.offen.push(karte);
    klang.umdrehen();
    sprich(karte.tier.name);

    if (zustand.offen.length < 2) {
      // Während die Karte dreht, werden weitere Tipps ignoriert
      zustand.gesperrt = true;
      await warte(FLIP_DAUER);
      zustand.gesperrt = false;
      return;
    }

    zustand.gesperrt = true;
    zustand.zuege++;
    zuegeAnzeige.textContent = String(zustand.zuege);
    const [a, b] = zustand.offen;
    zustand.offen = [];
    await warte(FLIP_DAUER);

    if (a.tier.id === b.tier.id) {
      a.gefunden = b.gefunden = true;
      a.element.classList.add('gefunden');
      b.element.classList.add('gefunden');
      zustand.gefunden++;
      const s = spieler[zustand.aktiv];
      s.paare++;
      const album = merkeGefunden(s.profil, set, a.tier.id);
      if (album.neu) s.neueTiere.push(a.tier);
      if (album.komplett) s.neuesAbzeichen = true;
      paareAnzeige.textContent = T.spiel.vonGesamt(zustand.gefunden, paare);
      klang.paar();
      zeigePaar(a.tier);
      if (zustand.gefunden === paare) {
        zustand.beendet = true;
        aktualisiereKopf();
        await warte(1800);
        beobachter.disconnect();
        app.zeigeEnde({ paare, zuege: zustand.zuege, spieler });
        return;
      }
      // Wer ein Paar findet, darf nochmals
      if (mehrspieler) aktualisiereKopf(true);
      zustand.gesperrt = false;
    } else {
      await warte(AUFDECK_DAUER[app.einstellungen.aufdeckDauer] ?? AUFDECK_DAUER.normal);
      setzeOffen(a, false);
      setzeOffen(b, false);
      await warte(FLIP_DAUER);
      if (mehrspieler) {
        zustand.aktiv = (zustand.aktiv + 1) % spieler.length;
        aktualisiereKopf();
        klang.wechsel();
      }
      zustand.gesperrt = false;
    }
  }

  // ---------- Raster ----------

  function passeRasterAn() {
    const { width, height } = brett.getBoundingClientRect();
    if (!width || !height) return;
    const r = bestesRaster(karten.length, width, height, KARTEN_VERHAELTNIS, ABSTAND);
    brett.style.setProperty('--spalten', r.spalten);
    brett.style.setProperty('--kb', `${r.kartenBreite}px`);
  }
  const beobachter = new ResizeObserver(passeRasterAn);
  beobachter.observe(brett);

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      zustand.beendet = true;
      beobachter.disconnect();
      app.zeigeStart();
    }
  }

  const beendenKnopf = knopf(T.spiel.beenden, beenden, 'knopf-beenden');

  const kopf = mehrspieler
    ? el(
        'header',
        { class: 'spiel-kopf mehrspieler' },
        amZug,
        el('div', { class: 'punkte-liste' }, chips.map((c) => c.chip)),
        beendenKnopf,
      )
    : el(
        'header',
        { class: 'spiel-kopf' },
        el(
          'div',
          { class: 'punkte-chip aktiv einzel', style: farbStil(spieler[0].profil) },
          el('img', { class: 'avatar', src: avatarUrl(spieler[0].profil), alt: '' }),
          el('span', { class: 'chip-name' }, spieler[0].profil.name),
        ),
        el('div', { class: 'anzeige' }, el('span', { class: 'beschriftung' }, T.spiel.zuege), zuegeAnzeige),
        el('div', { class: 'anzeige' }, el('span', { class: 'beschriftung' }, T.spiel.paare), paareAnzeige),
        beendenKnopf,
      );

  zeige(el('main', { class: 'bildschirm spiel' }, kopf, brett, paarAnzeige));
  if (mehrspieler) aktualisiereKopf();
  passeRasterAn();
}
