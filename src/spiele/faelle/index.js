// «Fälle und Satzglieder»: Fall eines markierten Satzteils bestimmen (Nominativ … Akkusativ)
// oder das Satzglied erkennen (Subjekt, Prädikat, Akkusativ-, Dativobjekt) – mit der Frageprobe.
import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { fragespielSteuerung } from '../../kern/fragespiel.js';
import { runde } from './saetze.js';

export const FARBE = '#F3E6D6';
const AUFGABEN = 10;

// Satz mit markiertem Teil; der erste Buchstabe gross, Punkt am Schluss
function satzEl(x) {
  return el(
    'p',
    { class: 'zf-satz fa-satz' },
    x.satz.flatMap((teil, i) => [i ? ' ' : '', i === x.index ? el('mark', { class: 'fa-markiert' }, teil.text) : teil.text]),
    '.',
  );
}

function frage(x) {
  const F = T.faelle;
  const teil = x.satz[x.index].text;
  const istFall = x.art === 'fall';
  return {
    text: istFall ? F.frageFall(teil) : F.frageSatzglied(teil),
    sprich: `${x.satz.map((t) => t.text).join(' ')}. ${istFall ? F.frageFall(teil) : F.frageSatzglied(teil)}`,
    bild: () => satzEl(x),
    antworten: x.optionen.map((o) => ({ text: istFall ? F.faelle[o] : F.satzglieder[o], richtig: o === x.richtig })),
    erklaerung: istFall ? F.erklaerungFall(teil, x.richtig) : F.erklaerungSatzglied(teil, x.richtig),
    hilfe: () => ({ text: istFall ? F.hilfeFall : F.hilfeSatzglied }),
  };
}

const STUFEN_BILD = { faelle: 'Wem?', satzglieder: 'Wer?', gemischt: 'Wen?' };

export function faelleSteuerung(app) {
  return fragespielSteuerung(app, {
    id: 'faelle',
    farbe: FARBE,
    texte: T.faelle,
    anzahl: AUFGABEN,
    empfehlung: { kl56: 'faelle', gymi: 'gemischt' },
    stufenBild: (id) => el('span', { class: 'fs-stufen-text' }, STUFEN_BILD[id]),
    erzeugeFragen: (stufe, anzahl) => runde(stufe, anzahl).map(frage),
  });
}
