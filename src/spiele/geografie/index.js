// «Schweizer Geografie»: Seen, Städte und Berge auf der Schweizerkarte finden und erkennen.
// Karte und Seen: public/spiele/kantone-karte.svg; Städte und Berge: orte.json
// (beides erzeugt mit scripts/kantonskarte.mjs, Geodaten BFS GEOSTAT).
import { T } from '../../texte.js';
import { el, beiTipp, mischen } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { ladeKarte } from '../kantone/karte.js';
import ORTE from './orte.json';

export const FARBE = '#DDEFE6';
const AUFGABEN = 10;
const NS = 'http://www.w3.org/2000/svg';
const BASIS = import.meta.env.BASE_URL;
const NAH = 45; // so nah (in Kartenpunkten) muss ein Tipp bei Stadt oder Berg sein

// Die grossen Seen, die im Spiel vorkommen (Namen wie in der Karte)
const SEEN = ['Genfersee', 'Bodensee', 'Neuenburgersee', 'Lago Maggiore', 'Vierwaldstättersee', 'Zürichsee', 'Luganersee', 'Thunersee', 'Bielersee', 'Zugersee', 'Brienzersee', 'Walensee'];

export const STUFEN = {
  seen: { arten: ['see'] },
  staedte: { arten: ['stadt'] },
  berge: { arten: ['berg'] },
  gemischt: { arten: ['see', 'stadt', 'berg'] },
};

let kartenText = null;

// Begleiter der Berge («die Rigi», «das Matterhorn»); Seen sind alle männlich
const BERG_ARTIKEL = { Dufourspitze: 'die', Matterhorn: 'das', Rigi: 'die', Weisshorn: 'das' };

// Ziele einer Art: { art, name, artikel, hoehe? }
function ziele(art) {
  if (art === 'see') return SEEN.map((name) => ({ art, name, artikel: 'der' }));
  if (art === 'stadt') return ORTE.staedte.map((o) => ({ art, artikel: '', ...o }));
  if (art === 'roemer') return ORTE.roemer.map((o) => ({ art, artikel: '', ...o }));
  return ORTE.berge.map((o) => ({ art, artikel: BERG_ARTIKEL[o.name] ?? 'der', ...o }));
}

function svgEl(name, attribute) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attribute)) e.setAttribute(k, v);
  return e;
}

// Karte mit Seen, Städten (Punkte) und Bergen (Dreiecke) der Spielart
function karte(arten, leuchtet = null) {
  const box = el('div', { class: 'geo-karte kt-karte' });
  box.innerHTML = kartenText;
  const svg = box.querySelector('svg');
  svg.setAttribute('aria-hidden', 'true');
  if (arten.includes('see')) svg.classList.add('geo-mit-seen');
  const marken = svgEl('g', { class: 'geo-marken' });
  for (const art of ['stadt', 'berg', 'roemer']) {
    if (!arten.includes(art)) continue;
    for (const o of ziele(art)) {
      const an = leuchtet?.art === art && leuchtet.name === o.name;
      const g = an ? 15 : 10;
      const m =
        art === 'stadt'
          ? svgEl('circle', { cx: o.x, cy: o.y, r: an ? 15 : 9, class: `geo-stadt ${an ? 'geo-an' : ''}` })
          : art === 'roemer'
            ? svgEl('rect', { x: o.x - g, y: o.y - g, width: 2 * g, height: 2 * g, rx: 3, class: `geo-roemer ${an ? 'geo-an' : ''}` })
            : svgEl('path', { d: `M${o.x} ${o.y - (an ? 20 : 13)} l${an ? 17 : 11} ${an ? 30 : 20} h${an ? -34 : -22} Z`, class: `geo-berg ${an ? 'geo-an' : ''}` });
      m.dataset.name = o.name;
      m.dataset.art = art;
      marken.append(m);
    }
  }
  svg.append(marken);
  if (leuchtet?.art === 'see') svg.querySelector(`.kt-see[data-name="${leuchtet.name}"]`)?.classList.add('geo-an');
  return { box, svg };
}

function beschrifte(svg, x, y, text) {
  const t = svgEl('text', { x, y: y - 22, class: 'kt-beschriftung' });
  t.textContent = text;
  svg.append(t);
  return t;
}

// Getippte Stelle in Kartenpunkten
function kartenPunkt(svg, ereignis) {
  const p = svg.createSVGPoint();
  p.x = ereignis.clientX;
  p.y = ereignis.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function mitte(svg, ziel) {
  if (ziel.art !== 'see') return [ziel.x, ziel.y];
  const p = svg.querySelector(`.kt-see[data-name="${ziel.name}"]`);
  return [Number(p.dataset.mx), Number(p.dataset.my)];
}

// Was wurde getroffen? Ein See direkt, sonst die nächste Stadt / der nächste Berg / See
function getroffen(svg, ereignis, art) {
  if (art === 'see' && ereignis.target?.dataset?.name && ereignis.target.classList.contains('kt-see')) {
    const name = ereignis.target.dataset.name;
    return ziele('see').find((z) => z.name === name) ?? { art, name, artikel: 'der' };
  }
  const { x, y } = kartenPunkt(svg, ereignis);
  let bester = null;
  let abstand = Infinity;
  for (const z of art === 'see' ? ziele('see') : ziele(art)) {
    const [zx, zy] = mitte(svg, z);
    const d = Math.hypot(zx - x, zy - y);
    if (d < abstand) {
      abstand = d;
      bester = z;
    }
  }
  return abstand <= (art === 'see' ? NAH * 1.6 : NAH) ? bester : null;
}

function woFrage(ziel, arten) {
  const G = T.geografie;
  let fehler = 0;
  return {
    text: G.wo(ziel),
    interaktiv: ({ richtig, falsch }) => {
      const { box, svg } = karte(arten);
      let geloest = false;
      beiTipp(box, (ereignis) => {
        if (geloest || !ereignis?.clientX) return;
        const t = getroffen(svg, ereignis, ziel.art);
        if (!t) {
          falsch(G.nichtsGetroffen[ziel.art]);
          return;
        }
        const [x, y] = mitte(svg, t);
        if (t.name === ziel.name) {
          geloest = true;
          markiere(svg, t, 'geo-richtig');
          beschrifte(svg, x, y, t.name);
          richtig();
          return;
        }
        fehler++;
        const schild = beschrifte(svg, x, y, t.name);
        setTimeout(() => schild.remove(), 1800);
        // Nach zwei Fehlversuchen blinkt das gesuchte Ziel
        if (fehler >= 2) markiere(svg, ziel, 'geo-hinweis');
        falsch(fehler >= 2 ? G.falschHinweis(G.mitArtikel(t)) : G.falschDas(G.mitArtikel(t)));
      });
      return box;
    },
    antworten: [],
    erklaerung: G.erklaerung(ziel),
  };
}

function markiere(svg, ziel, klasse) {
  const e = ziel.art === 'see' ? svg.querySelector(`.kt-see[data-name="${ziel.name}"]`) : svg.querySelector(`.geo-marken [data-name="${ziel.name}"]`);
  e?.classList.add(klasse);
}

function welcherFrage(ziel, arten) {
  const G = T.geografie;
  const andere = mischen(ziele(ziel.art).filter((z) => z.name !== ziel.name)).slice(0, 3);
  return {
    text: G.welcher[ziel.art],
    bild: () => karte(arten, ziel).box,
    antworten: mischen([ziel, ...andere]).map((z) => ({ text: z.name, klein: z.heute ? T.geografie.heute(z.heute) : null, richtig: z.name === ziel.name })),
    erklaerung: G.erklaerung(ziel),
    hilfe: () => ({ text: G.welcherHilfe }),
  };
}

// Fragen zu bestimmten Arten (auch für andere Spiele, z.B. die Römer in der «Antike»)
export function kartenFragen(arten, anzahl) {
  const pool = mischen(arten.flatMap(ziele)).slice(0, anzahl);
  return pool.map((z, i) => (i % 2 === 0 ? woFrage(z, arten) : welcherFrage(z, arten)));
}

const erzeugeFragen = (stufe, anzahl) => kartenFragen(STUFEN[stufe].arten, anzahl);

// Die Karte laden, bevor Kartenfragen gestellt werden
export async function bereiteKarteVor() {
  kartenText ??= await ladeKarte();
}

export function geografieSteuerung(app) {
  const s = fragespielSteuerung(app, {
    id: 'geografie',
    farbe: FARBE,
    texte: T.geografie,
    anzahl: AUFGABEN,
    empfehlung: { kl34: 'staedte', kl56: 'gemischt' },
    stufenBild: (id) => el('img', { class: `geo-mini geo-mini-${id}`, src: `${BASIS}spiele/geografie-${id}.svg`, alt: '' }),
    erzeugeFragen,
  });
  // Die Karte vor dem Spielen laden (danach offline aus dem Zwischenspeicher)
  const waehle = s.waehleStufe;
  s.waehleStufe = async (stufe) => {
    await bereiteKarteVor();
    waehle(stufe);
  };
  return s;
}
