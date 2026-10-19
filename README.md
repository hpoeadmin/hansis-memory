# Hansi’s Memory

Ein Memory-Spiel für Tablets – für Enkel und Grosseltern. Ohne Zeitdruck, ohne Verlieren.

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
4. `npm run dev` starten. Der neue Satz erscheint automatisch.

Fehlt ein Bild, bricht `npm run dev` bzw. `npm run build` mit einer Meldung ab.

## Auf dem iPad installieren

Folgt, sobald die App auf GitHub Pages veröffentlicht ist.
