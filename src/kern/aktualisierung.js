// Service Worker: Offline-Betrieb und Hinweis auf neue Versionen.
import { registerSW } from 'virtual:pwa-register';
import { T } from '../texte.js';
import { el, beiTipp } from './ui.js';

const PRUEF_INTERVALL = 30 * 60 * 1000; // alle 30 Minuten nach Neuem schauen

export function starteAktualisierung() {
  if (!('serviceWorker' in navigator)) return;

  const aktualisiere = registerSW({
    onNeedRefresh() {
      if (document.querySelector('.update-hinweis')) return;
      const hinweis = el(
        'button',
        { class: 'update-hinweis', type: 'button' },
        el('span', { class: 'update-titel' }, T.update.titel),
        el('span', {}, T.update.tippen),
      );
      beiTipp(hinweis, () => {
        hinweis.disabled = true;
        aktualisiere(true); // aktiviert die neue Version und lädt die Seite neu
      });
      document.body.append(hinweis);
    },
    onRegisteredSW(_url, registrierung) {
      if (!registrierung) return;
      // Ein iPad bleibt oft tagelang offen: regelmässig und beim Zurückkehren prüfen
      const pruefe = () => {
        if (navigator.onLine) registrierung.update().catch(() => {});
      };
      setInterval(pruefe, PRUEF_INTERVALL);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') pruefe();
      });
    },
  });
}
