// Kantone auf der Schweizerkarte: «Wo liegt …?» (Kanton antippen) und
// «Welcher Kanton leuchtet?» (aus vier Wappen wählen). Läuft im Frage-Rahmen.
// Karte: public/spiele/kantone-karte.svg (scripts/kantonskarte.mjs, Geodaten BFS GEOSTAT)
import { T } from '../../texte.js';
import { el, beiTipp, mischen } from '../../kern/ui.js';
import { KANTONE, RUND_UM_ZUERICH } from './kantone.js';

const BASIS = import.meta.env.BASE_URL;
const wappenUrl = (kz) => `${BASIS}spiele/kantone/${kz}.svg`;
const NS = 'http://www.w3.org/2000/svg';

let kartenText = null;

// Die Karte einmal laden (danach aus dem Zwischenspeicher bzw. offline aus dem Service Worker)
export async function ladeKarte() {
  if (!kartenText) kartenText = await (await fetch(`${BASIS}spiele/kantone-karte.svg`)).text();
  return kartenText;
}

export const KARTEN_MODI = {
  'karte-zh': { kantone: RUND_UM_ZUERICH, anzahl: 8 },
  'karte-ch': { anzahl: 12 },
};

const kanton = (kz) => KANTONE.find((k) => k.kz === kz);

// Neue Karte als Element; nur die Kantone der Spielart sind antippbar
function karte(aktiv) {
  const box = el('div', { class: 'kt-karte' });
  box.innerHTML = kartenText;
  const svg = box.querySelector('svg');
  svg.setAttribute('aria-hidden', 'true');
  for (const p of svg.querySelectorAll('.kt-kanton')) {
    if (!aktiv.includes(p.dataset.kz)) p.classList.add('kt-aus');
  }
  // Nur ein Teil der Schweiz im Spiel: auf diese Kantone zoomen
  if (aktiv.length < 26) {
    setTimeout(() => {
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      for (const kz of aktiv) {
        const b = svg.querySelector(`#kt-${kz}`).getBBox();
        x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
        x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
      }
      const rand = 30;
      svg.setAttribute('viewBox', `${x1 - rand} ${y1 - rand} ${x2 - x1 + 2 * rand} ${y2 - y1 + 2 * rand}`);
      svg.classList.add('kt-ausschnitt');
    }, 0);
  }
  return { box, svg, pfad: (kz) => svg.querySelector(`#kt-${kz}`) };
}

// Kleine Kantone bekommen einen grösseren, unsichtbaren Tippbereich
function tippZiele(svg, aktiv, beimTipp) {
  const ziele = svg.ownerDocument.createElementNS(NS, 'g');
  for (const p of svg.querySelectorAll('.kt-kanton')) {
    const kz = p.dataset.kz;
    if (!aktiv.includes(kz)) continue;
    beiTipp(p, () => beimTipp(kz));
    const { width, height } = p.getBBox?.() ?? { width: 999, height: 999 };
    if (Math.max(width, height) < 70) {
      const c = svg.ownerDocument.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.dataset.mx);
      c.setAttribute('cy', p.dataset.my);
      c.setAttribute('r', '26');
      c.setAttribute('class', 'kt-ziel');
      beiTipp(c, () => beimTipp(kz));
      ziele.append(c);
    }
  }
  svg.append(ziele);
}

function beschrifte(svg, kz, text) {
  const p = svg.querySelector(`#kt-${kz}`);
  const t = svg.ownerDocument.createElementNS(NS, 'text');
  t.setAttribute('x', p.dataset.mx);
  t.setAttribute('y', p.dataset.my);
  t.setAttribute('class', 'kt-beschriftung');
  t.textContent = text;
  svg.append(t);
  return t;
}

function woFrage(k, aktiv) {
  const KT = T.kantone;
  let fehler = 0;
  return {
    text: KT.wo(k.name),
    interaktiv: ({ richtig, falsch }) => {
      const { box, svg, pfad } = karte(aktiv);
      const seite = el(
        'div',
        { class: 'kt-gesucht' },
        el('img', { src: wappenUrl(k.kz), alt: '' }),
        el('span', {}, k.name),
      );
      // Die Karte muss im Dokument sein, damit getBBox die Grösse kennt
      setTimeout(() =>
        tippZiele(svg, aktiv, (kz) => {
          if (svg.classList.contains('geloest')) return;
          if (kz === k.kz) {
            svg.classList.add('geloest');
            pfad(kz).classList.add('kt-richtig');
            beschrifte(svg, kz, k.name);
            richtig();
            return;
          }
          fehler++;
          const p = pfad(kz);
          p.classList.add('kt-falsch');
          const schild = beschrifte(svg, kz, kanton(kz).name);
          setTimeout(() => {
            p.classList.remove('kt-falsch');
            schild.remove();
          }, 1800);
          // Nach zwei Fehlversuchen blinkt der gesuchte Kanton
          if (fehler >= 2) pfad(k.kz).classList.add('kt-hinweis');
          falsch(fehler >= 2 ? KT.falschHinweis(kanton(kz).name) : KT.falschDas(kanton(kz).name));
        }),
      0);
      return el('div', { class: 'kt-kartenfeld' }, seite, box);
    },
    antworten: [],
    erklaerung: KT.richtigWo(k.name),
  };
}

function welcherFrage(k, aktiv) {
  const KT = T.kantone;
  const andere = mischen(aktiv.filter((kz) => kz !== k.kz)).slice(0, 3);
  return {
    text: KT.welcher,
    bild: () => {
      const { box, pfad } = karte(aktiv);
      pfad(k.kz).classList.add('kt-leuchtet');
      return box;
    },
    antworten: mischen([k.kz, ...andere]).map((kz) => ({
      text: el('span', { class: 'kt-antwort' }, el('img', { src: wappenUrl(kz), alt: '' }), el('span', {}, kanton(kz).name)),
      richtig: kz === k.kz,
    })),
    erklaerung: KT.richtigWelcher(k.name),
    hilfe: () => ({ text: KT.welcherHilfe }),
  };
}

// Abwechselnd antippen und erkennen; jeder Kanton höchstens einmal pro Runde
export function kartenFragen(modus) {
  const m = KARTEN_MODI[modus];
  const aktiv = m.kantone ?? KANTONE.map((k) => k.kz);
  return mischen(aktiv)
    .slice(0, m.anzahl)
    .map((kz, i) => (i % 2 === 0 ? woFrage(kanton(kz), aktiv) : welcherFrage(kanton(kz), aktiv)));
}
