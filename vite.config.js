import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

// GitHub Pages veröffentlicht unter https://<benutzer>.github.io/hansis-memory/
const BASIS = '/hansis-memory/';

// Version = Zeitpunkt und Kennung des Git-Stands, z.B. «19.10.2026 18:04 · a5ac18a».
// Im Entwicklungsmodus steht «Testversion» davor.
function version(befehl) {
  const git = (args) =>
    execSync(`git ${args}`, { env: { ...process.env, TZ: 'Europe/Zurich' } }).toString().trim();
  try {
    const datum = git('log -1 --format=%cd --date=format-local:"%d.%m.%Y %H:%M"');
    const kennung = git('rev-parse --short HEAD');
    return `${befehl === 'serve' ? 'Testversion ' : ''}${datum} · ${kennung}`;
  } catch {
    return 'unbekannt';
  }
}

export default defineConfig(({ command }) => ({
  base: BASIS,
  define: {
    __VERSION__: JSON.stringify(version(command)),
  },
  plugins: [
    VitePWA({
      // Neue Versionen warten, bis jemand auf «Aktualisieren» tippt –
      // so wird kein laufendes Spiel unterbrochen.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        id: BASIS,
        name: 'Hansis Spielplatz',
        short_name: 'Spielplatz',
        description: 'Spiele für Kinder und Grosseltern: Memory und bald mehr.',
        lang: 'de-CH',
        start_url: BASIS,
        scope: BASIS,
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        background_color: '#FFF8EC',
        theme_color: '#FFF8EC',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Alles für den Offline-Betrieb: Seite, Code, Schrift, Kartensätze, Icons
        globPatterns: ['**/*.{html,js,css,woff2,svg,json,png,ico}'],
        cleanupOutdatedCaches: true,
        navigateFallback: `${BASIS}index.html`,
      },
    }),
  ],
}));
