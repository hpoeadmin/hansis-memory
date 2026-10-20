// «Wirbeltiere»: Tiere ihrer Klasse zuordnen (Säugetier, Vogel, Reptil, Amphibie, Fisch, wirbellos)
// oder die Klasse an einem Merkmal erkennen.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { bildUrl } from '../memory/sets.js';
import { EIGENE_TIERE, runde } from './klassen.js';

export const FARBE = '#E3EEDC';
const AUFGABEN = 10;
const BASIS = import.meta.env.BASE_URL;

// Alle Tiere mit Bild: aus den Memory-Sätzen und die eigenen Zeichnungen
function alleTiere(sets) {
  const ausSets = sets.filter((s) => s.status === 'bereit').flatMap((set) => set.tiere.map((t) => ({ ...t, url: bildUrl(set, t.bild) })));
  return [...ausSets, ...EIGENE_TIERE.map((t) => ({ ...t, url: `${BASIS}spiele/tiere/${t.id}.svg` }))];
}

function frage(x) {
  const W = T.wirbeltiere;
  if (x.art === 'merkmal') {
    return {
      text: W.frageMerkmal,
      bild: () => el('p', { class: 'an-ereignis an-gross' }, W.merkmale[x.merkmal]),
      antworten: x.optionen.map((k) => ({ text: W.klassen[k], richtig: k === x.richtig })),
      erklaerung: W.erklaerungMerkmal(W.merkmale[x.merkmal], W.klassen[x.richtig]),
      hilfe: () => ({ text: W.hilfe }),
    };
  }
  const t = x.tier;
  const mitArtikel = `${t.artikel} ${t.name}`;
  return {
    text: W.frageTier(mitArtikel),
    bild: () => el('div', { class: 'wt-tier' }, el('img', { src: t.url, alt: '' }), el('span', { class: 'wt-name' }, t.name)),
    antworten: x.optionen.map((k) => ({ text: W.klassen[k], richtig: k === x.richtig })),
    erklaerung: W.begruendung[t.id] ?? W.erklaerungTier(mitArtikel, W.einzahl[x.richtig], W.kurz[x.richtig]),
    hilfe: () => ({ text: W.hilfe }),
  };
}

const STUFEN_BILD = { fuenf: 'kuh', sechs: 'biene', merkmale: 'pinguin', knifflig: 'wal' };

export function wirbeltiereSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'wirbeltiere',
    farbe: FARBE,
    texte: T.wirbeltiere,
    anzahl: AUFGABEN,
    empfehlung: { gymi: 'sechs' },
    stufenBild: (id) => {
      const tier = alleTiere(app.sets).find((t) => t.id === STUFEN_BILD[id]);
      return el('img', { src: tier?.url ?? '', alt: '' });
    },
    erzeugeFragen: (stufe, anzahl) => runde(stufe, alleTiere(app.sets), anzahl).map(frage),
  });
}
