// Freundliche Klänge, direkt im Browser erzeugt (Web Audio) – keine Tondateien.
// Leise voreingestellt; ein/aus über speicher.einstellungen.ton.
import { speicher } from './speicher.js';

const LAUTSTAERKE = 0.25;
let ctx = null;
let haupt = null;

// iPad/Safari erlaubt Ton erst nach einer Berührung. Darum wird der
// Audio-Kontext beim ersten Tipp erzeugt bzw. wieder aufgeweckt.
export function entsperreAudio() {
  if (!ctx) {
    const AudioKontext = window.AudioContext || window.webkitAudioContext;
    if (!AudioKontext) return;
    ctx = new AudioKontext();
    haupt = ctx.createGain();
    haupt.gain.value = LAUTSTAERKE;
    haupt.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function ton(frequenz, start, dauer, staerke = 0.3, form = 'sine') {
  const osz = ctx.createOscillator();
  const huelle = ctx.createGain();
  osz.type = form;
  osz.frequency.value = frequenz;
  const t = ctx.currentTime + start;
  huelle.gain.setValueAtTime(0.0001, t);
  huelle.gain.exponentialRampToValueAtTime(staerke, t + 0.02);
  huelle.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  osz.connect(huelle).connect(haupt);
  osz.start(t);
  osz.stop(t + dauer + 0.05);
}

function spiele(abspielen) {
  if (speicher.einstellungen.ton === false || !ctx || ctx.state !== 'running') return;
  abspielen();
}

export const klang = {
  umdrehen: () => spiele(() => ton(660, 0, 0.12, 0.12, 'triangle')),
  paar: () =>
    spiele(() => {
      ton(784, 0, 0.3, 0.3); // G5
      ton(1047, 0.13, 0.45, 0.3); // C6
    }),
  wechsel: () => spiele(() => ton(523, 0, 0.2, 0.12, 'triangle')),
  fertig: () =>
    spiele(() => {
      [523, 659, 784, 1047].forEach((f, i) => ton(f, i * 0.16, 0.4, 0.28));
      ton(1319, 0.7, 0.8, 0.22);
    }),
};
