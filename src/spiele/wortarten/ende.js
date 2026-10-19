import { T } from '../../texte.js';
import { zeigeRundenende } from '../../kern/bildschirme/rundenende.js';
import { FARBE } from './index.js';

export function zeigeEnde(w, { spieler, gesamt }) {
  zeigeRundenende(w, {
    spieler,
    gesamt,
    farbe: FARBE,
    texte: { einzel: T.wortarten.ergebnisEinzel, spieler: T.wortarten.ergebnisSpieler },
  });
}
