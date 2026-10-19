// «Wo wohne ich?»: Tier anschauen, Lebensraum antippen. Ablauf Länge → Spieler → Spiel → Abschluss.
// Die Lebensräume sind die vier Kartensätze (Bauernhof, Meer, Wald, Luft).
import { speicher } from '../../kern/speicher.js';
import { merkeLetzteSpieler } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#FBE7C6';
export const RUNDEN = { kurz: 6, mittel: 10, lang: 16 };
export const ORT_BILD = {
  bauernhof: 'spiele/lebensraum-bauernhof.svg',
  meerestiere: 'spiele/lebensraum-meer.svg',
  waldtiere: 'spiele/lebensraum-wald.svg',
  'in-der-luft': 'spiele/lebensraum-luft.svg',
};

export function lebensraumSteuerung(app) {
  const l = Object.create(app);
  l.auswahl = { runden: RUNDEN.kurz, spieler: [] };

  l.zeigeStart = () => zeigeStart(l);
  l.waehleLaenge = (laenge) => {
    l.auswahl.runden = RUNDEN[laenge];
    zeigeSpieler(app, {
      farbe: FARBE,
      max: 4,
      vorauswahl: speicher.letzteSpieler,
      zurueck: l.zeigeStart,
      weiter: l.starteSpiel,
    });
  };
  l.starteSpiel = (profile) => {
    l.auswahl.spieler = profile;
    merkeLetzteSpieler(profile);
    zeigeSpiel(l);
  };
  l.zeigeSpiel = () => zeigeSpiel(l);
  l.zeigeEnde = (ergebnis) => zeigeEnde(l, ergebnis);
  return l;
}
