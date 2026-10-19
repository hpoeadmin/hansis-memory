import { T } from '../../texte.js';
import { el } from '../../kern/ui.js';
import { zeigeRundenende } from '../../kern/bildschirme/rundenende.js';
import { FARBE } from './index.js';

export function zeigeEnde(l, { spieler, gesamt }) {
  zeigeRundenende(l, {
    spieler,
    gesamt,
    farbe: FARBE,
    texte: { einzel: T.lebensraum.ergebnisEinzel, spieler: T.lebensraum.ergebnisSpieler },
    // Neue Tiere fürs Album
    zusatz: (s) =>
      s.neueTiere.length ? el('p', { class: 'neu-im-album' }, T.ende.neuImAlbum(s.neueTiere.map((t) => t.name).join(', '))) : null,
  });
}
