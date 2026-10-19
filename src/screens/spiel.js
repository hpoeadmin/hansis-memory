import { T } from '../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen, warte } from '../ui.js';
import { STUFEN, bildUrl } from '../sets.js';
import { bestesRaster } from '../raster.js';

const FLIP_DAUER = 500; // ms, muss zur CSS-Animation passen
const KARTEN_VERHAELTNIS = 0.8; // Breite / Höhe (Bild + Name)
const ABSTAND = 14;

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

  const zustand = { zuege: 0, gefunden: 0, offen: [], gesperrt: false, beendet: false };

  const zuegeAnzeige = el('span', { class: 'zahl' }, '0');
  const paareAnzeige = el('span', { class: 'zahl' }, T.spiel.vonGesamt(0, paare));
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
      paareAnzeige.textContent = T.spiel.vonGesamt(zustand.gefunden, paare);
      if (zustand.gefunden === paare) {
        zustand.beendet = true;
        await warte(1400);
        app.zeigeEnde({ paare, zuege: zustand.zuege });
        return;
      }
      zustand.gesperrt = false;
    } else {
      await warte(app.einstellungen.aufdeckDauer);
      setzeOffen(a, false);
      setzeOffen(b, false);
      await warte(FLIP_DAUER);
      zustand.gesperrt = false;
    }
  }

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

  zeige(
    el(
      'main',
      { class: 'bildschirm spiel' },
      el(
        'header',
        { class: 'spiel-kopf' },
        el(
          'div',
          { class: 'anzeige' },
          el('span', { class: 'beschriftung' }, T.spiel.zuege),
          zuegeAnzeige,
        ),
        el(
          'div',
          { class: 'anzeige' },
          el('span', { class: 'beschriftung' }, T.spiel.paare),
          paareAnzeige,
        ),
        knopf(T.spiel.beenden, beenden, 'knopf-beenden'),
      ),
      brett,
    ),
  );
  passeRasterAn();
}
