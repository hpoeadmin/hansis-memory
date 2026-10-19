// Liest Tiernamen und Lob langsam auf Deutsch vor (Web Speech API).
// Ein/aus über speicher.einstellungen.vorlesen.
import { speicher } from './speicher.js';

const sprache = window.speechSynthesis;
let stimme = null;

function waehleStimme() {
  const stimmen = sprache?.getVoices() ?? [];
  stimme =
    stimmen.find((s) => s.lang === 'de-CH') ??
    stimmen.find((s) => s.lang === 'de-DE') ??
    stimmen.find((s) => s.lang?.startsWith('de')) ??
    null;
}

if (sprache) {
  waehleStimme();
  sprache.addEventListener?.('voiceschanged', waehleStimme);
}

export function vorlesenMoeglich() {
  return Boolean(sprache);
}

export function sprich(text) {
  if (!speicher.einstellungen.vorlesen || !sprache) return;
  sprache.cancel();
  const satz = new SpeechSynthesisUtterance(text);
  satz.lang = stimme?.lang ?? 'de-DE';
  if (stimme) satz.voice = stimme;
  satz.rate = 0.8;
  satz.pitch = 1.05;
  sprache.speak(satz);
}
