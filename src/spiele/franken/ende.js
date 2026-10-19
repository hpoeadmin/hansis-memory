import { T } from '../../texte.js';
import { zeigeRundenende } from '../../kern/bildschirme/rundenende.js';
import { FARBE } from './index.js';

export function zeigeEnde(f, { spieler, gesamt }) {
  zeigeRundenende(f, {
    spieler,
    gesamt,
    farbe: FARBE,
    texte: { einzel: T.franken.ergebnisEinzel, spieler: T.franken.ergebnisSpieler },
  });
}
