import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen, mischen, warte } from '../../kern/ui.js';
import { avatarUrl, farbStil, rekordVon } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { bildUrl } from '../memory/sets.js';
import { STUFEN } from './index.js';

// Jedes Tier hat seinen eigenen Ton (Pentatonik – klingt immer freundlich)
const TOENE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];
const TEMPO = {
  normal: { zeigen: 800, pause: 350 },
  langsam: { zeigen: 1200, pause: 500 },
  'sehr-langsam': { zeigen: 1700, pause: 700 },
};
const START_LAENGE = 2;
const MAX_LAENGE = 15;

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

export function zeigeSpiel(r) {
  const R = T.reihenfolge;
  const anzahl = STUFEN[r.auswahl.stufe];
  const profil = r.auswahl.spieler[0];
  const tempo = TEMPO[r.einstellungen.merkTempo] ?? TEMPO.normal;
  const rekord = rekordVon(profil, `reihenfolge-${r.auswahl.stufe}`);

  // Die Tiere kommen aus dem Bauernhof – vertraut für alle
  const set = r.sets.find((s) => s.id === 'bauernhof');
  const tiere = mischen(set.tiere).slice(0, anzahl);

  let folge = [];
  let eingabe = 0;
  let zeigtGerade = false;
  let versuche = 0;
  let geschafft = 0; // längste vollständig nachgetippte Folge
  let beendet = false;

  const meldung = el('p', { class: 'meldung rf-meldung', role: 'status', 'aria-live': 'polite' });
  const laengeAnzeige = el('span', { class: 'anzeige rf-anzeige' });
  const raster = el('div', { class: `rf-raster rf-${anzahl}` });

  const kacheln = tiere.map((tier, i) => {
    const k = el(
      'button',
      { class: 'rf-kachel', type: 'button', 'aria-label': tier.name, style: `--set-farbe: ${set.farbe}` },
      el('img', { src: bildUrl(set, tier.bild), alt: '', draggable: 'false' }),
    );
    beiTipp(k, () => tippe(i), { sperrzeit: 200 });
    raster.append(k);
    return k;
  });

  async function leuchte(i, dauer) {
    const k = kacheln[i];
    k.classList.add('leuchtet');
    klang.note(TOENE[i], Math.min(0.6, dauer / 1000));
    await warte(dauer);
    k.classList.remove('leuchtet');
  }

  function zeigeLaenge() {
    laengeAnzeige.textContent = rekord ? `${R.laenge(folge.length)} · ${R.rekord(rekord)}` : R.laenge(folge.length);
  }

  async function vorspielen() {
    zeigtGerade = true;
    raster.classList.add('zuschauen');
    meldung.textContent = R.zuschauen;
    zeigeLaenge();
    await warte(900);
    for (const i of folge) {
      if (beendet) return;
      await leuchte(i, tempo.zeigen);
      await warte(tempo.pause);
    }
    if (beendet) return;
    zeigtGerade = false;
    raster.classList.remove('zuschauen');
    eingabe = 0;
    meldung.textContent = R.duBist;
    sprich(R.duBist);
  }

  function neuesTier() {
    // Nicht dreimal hintereinander dasselbe Tier
    let i;
    do i = Math.floor(Math.random() * anzahl);
    while (folge.length >= 2 && folge.at(-1) === i && folge.at(-2) === i);
    folge.push(i);
  }

  async function tippe(i) {
    if (zeigtGerade || beendet) return;
    leuchte(i, 350);
    if (folge[eingabe] === i) {
      eingabe++;
      if (eingabe < folge.length) return;
      // Ganze Folge richtig
      geschafft = folge.length;
      versuche = 0;
      zeigtGerade = true;
      if (folge.length >= MAX_LAENGE) {
        beendet = true;
        await warte(600);
        r.zeigeEnde({ profil, laenge: geschafft, alles: true });
        return;
      }
      await warte(450);
      klang.paar();
      meldung.textContent = zufall(R.geschafft);
      await warte(1300);
      neuesTier();
      vorspielen();
      return;
    }
    // Falsch: einmal nochmals zeigen, beim zweiten Mal ist die Runde fertig
    versuche++;
    zeigtGerade = true;
    if (versuche >= 2) {
      beendet = true;
      await warte(700);
      // Auch angefangene Folgen zählen: so viele Tiere wurden richtig nachgetippt
      r.zeigeEnde({ profil, laenge: Math.max(geschafft, eingabe), alles: false });
      return;
    }
    meldung.textContent = R.fast;
    await warte(1400);
    vorspielen();
  }

  async function beenden() {
    const ja = await bestaetigen(T.spiel.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      r.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm rf-spiel', style: `--set-farbe: ${set.farbe}` },
      el(
        'header',
        { class: 'spiel-kopf' },
        el(
          'div',
          { class: 'punkte-chip aktiv einzel', style: farbStil(profil) },
          el('img', { class: 'avatar', src: avatarUrl(profil), alt: '' }),
          el('span', { class: 'chip-name' }, profil.name),
        ),
        laengeAnzeige,
        knopf(T.spiel.beenden, beenden, 'knopf-beenden'),
      ),
      meldung,
      raster,
    ),
  );

  for (let n = 0; n < START_LAENGE; n++) neuesTier();
  vorspielen();
}
