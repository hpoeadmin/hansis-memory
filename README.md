# Hansis Spielplatz

Spiele für Tablets – für Enkel und Grosseltern. Ohne Zeitdruck, ohne Verlieren.
Zurzeit: **Memory** mit vier Tiersätzen. In Arbeit: **Nüni Stei** und **Eile mit Weile**.

## Aufbau

```
src/
├─ main.js          App-Objekt, Start
├─ hauptmenue.js    Spielauswahl
├─ spiele.js        Liste aller Spiele (neues Spiel = ein Eintrag)
├─ texte.js         alle Texte (Schweizer Schreibweise)
├─ kern/            Speicher, Profile, Elternschloss, Ton, Vorlesen, Update-Hinweis,
│  └─ bildschirme/  Spielerauswahl, Profil-Editor, Einstellungen
└─ spiele/
   └─ memory/       Satzwahl, Stufe, Spiel, Abschluss, Album
```

Jedes Spiel hat eine eigene Steuerung (z.B. `memorySteuerung(app)`), die vom App-Objekt erbt.
Die Spielerauswahl `zeigeSpieler(app, { farbe, max, zurueck, weiter })` nutzen alle Spiele.

## Lokal testen

Voraussetzung: [Node.js](https://nodejs.org) (z.B. mit `brew install node`).

```bash
npm install
npm run dev
```

Danach im Browser `http://localhost:5173/hansis-memory/` öffnen.

**Auf dem iPad im gleichen WLAN:** `npm run dev` zeigt auch eine Adresse wie
`http://192.168.1.23:5173/hansis-memory/`. Diese Adresse im Safari auf dem iPad öffnen.

## Neuen Tiersatz hinzufügen

1. Neuen Ordner anlegen, z.B. `public/sets/zoo/`.
2. Die SVG-Bilder hineinlegen (200 × 200, gleicher Stil wie die Bauernhof-Tiere).
3. Eine `set.json` dazulegen. Vorlage ist `public/sets/bauernhof/set.json`:
   - `"status": "bereit"` → spielbar, `"bald"` → erscheint als «kommt bald»
   - `"reihenfolge"` → Position im Startmenü
   - `"farbe"` → Hintergrundfarbe des Satzes
   - `"titelbild"` → Bild auf der Menükachel
   - `"tiere"` → 12 Einträge mit `id`, `name`, `bild` und `info` (Satz fürs Album)
   - optional `"trennung"` bei sehr langen Namen: der Name mit weichem Trennstrich, z.B. `"Meeres\u00adschildkröte"`. Dann darf der Name auf der Karte zweizeilig stehen.
4. `npm run dev` starten. Der neue Satz erscheint automatisch.

Fehlt ein Bild, bricht `npm run dev` bzw. `npm run build` mit einer Meldung ab.

## Veröffentlichung

Jeder Push auf `main` baut die App mit GitHub Actions (`.github/workflows/deploy.yml`) und veröffentlicht sie auf GitHub Pages:

**https://hpoeadmin.github.io/hansis-memory/**

Den Stand des Builds siehst du im Repository unter **Actions**.

### Neue Versionen auf den Tablets

Die App arbeitet mit einem Service Worker (`vite-plugin-pwa`) und speichert alle Dateien für den Offline-Betrieb. Das gilt für Seite, Code, Schrift, Kartensätze und Icons. Nach einer Veröffentlichung merkt die App die neue Version beim nächsten Start, beim Zurückkehren in die App und sonst alle 30 Minuten. Dann erscheint unten **«Neue Version verfügbar – Tippen zum Aktualisieren»**. Ein laufendes Spiel wird dadurch nicht unterbrochen.

Offline-Version lokal testen:

```bash
npm run build
npm run preview
```

## Auf dem iPad installieren

1. In **Safari** `https://hpoeadmin.github.io/hansis-memory/` öffnen.
2. **Teilen** (Quadrat mit Pfeil) → **Zum Home-Bildschirm** → **Hinzufügen**.
3. Ab jetzt über das Symbol «Spielplatz» starten. Die App läuft im Vollbild und auch offline.

Eine ausführliche Anleitung zum Weitergeben steht in [ANLEITUNG-FAMILIE.md](ANLEITUNG-FAMILIE.md).

## App-Icons neu erzeugen

Das Icon ist `public/icon.svg`. Nach einer Änderung:

```bash
npx pwa-assets-generator
```
