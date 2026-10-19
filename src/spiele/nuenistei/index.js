// Nüni Stei: Ablauf Spielart → Spieler → Spiel → Abschluss.
// Ein laufendes Spiel wird nach jedem Zug gespeichert und kann später weitergehen.
import { speicher, sichere } from '../../kern/speicher.js';
import { TABLET, alleProfile } from '../../kern/profile.js';
import { zeigeSpieler } from '../../kern/bildschirme/spieler.js';
import { neuesSpiel } from './regeln.js';
import { zeigeStart } from './start.js';
import { zeigeSpiel } from './spiel.js';
import { zeigeEnde } from './ende.js';

export const FARBE = '#EAD7B7';

export function nuensteiSteuerung(app) {
  const n = Object.create(app);
  const daten = () => (speicher.nuenistei ??= { laufend: null });

  n.zeigeStart = () => zeigeStart(n);
  n.laufendesSpiel = () => daten().laufend;

  // modus: { gegner: 'mensch' | 'tablet', stufe: 'gemuetlich' | 'knifflig' }
  n.waehleModus = (modus) => {
    const anzahl = modus.gegner === 'mensch' ? 2 : 1;
    zeigeSpieler(app, {
      farbe: FARBE,
      min: anzahl,
      max: anzahl,
      vorauswahl: daten().letzteSpieler ?? [],
      zurueck: n.zeigeStart,
      weiter: (profile) => {
        daten().letzteSpieler = profile.map((p) => p.id);
        const ids = profile.map((p) => p.id);
        if (modus.gegner === 'tablet') ids.push(TABLET.id);
        n.starte({ modus, spielerIds: ids });
      },
    });
  };

  n.starte = ({ modus, spielerIds }) => {
    n.partie = { modus, spielerIds, zustand: neuesSpiel(), verlauf: [] };
    n.speichere();
    zeigeSpiel(n);
  };

  n.weiterspielen = () => {
    n.partie = daten().laufend;
    zeigeSpiel(n);
  };

  // Nochmals: die Farben wechseln, damit jede Seite einmal beginnt
  n.nochmals = () => {
    const { modus, spielerIds } = n.partie;
    n.starte({ modus, spielerIds: [...spielerIds].reverse() });
  };

  n.speichere = () => {
    daten().laufend = n.partie;
    sichere();
  };

  n.spielFertig = () => {
    daten().laufend = null;
    sichere();
    zeigeEnde(n);
  };

  // Gelöschte Profile werden durch den Gast ersetzt
  n.profilVon = (id) =>
    id === TABLET.id ? TABLET : (alleProfile().find((p) => p.id === id) ?? alleProfile().at(-2));

  return n;
}
