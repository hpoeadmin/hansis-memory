# Fortschritt – Hansi’s Memory

## Stand

| Schritt | Inhalt | Status |
|---|---|---|
| 1 | Stilprobe (Kuh, Schwein, Huhn) | ✅ freigegeben |
| 2 | Alle 12 Bauernhof-Tiere | ✅ |
| 3 | Spielbare Grundversion (Menü → Stufe → Spiel → Abschluss, 1 Spieler) | ✅ |
| 4 | Stufen und Raster für Quer- und Hochformat | ✅ (bereits in der Grundversion enthalten, noch auf echtem iPad prüfen) |
| 5 | Spielerprofile und Mehrspielermodus | offen |
| 6 | Animationen, Lob, Konfetti, Klang, Vorlesen | offen |
| 7 | Sammelalbum und Abzeichen | offen |
| 8 | Einstellungen mit Elternschloss | offen |
| 9 | Offline/PWA mit Update-Hinweis | offen |
| 10 | GitHub Pages, Anleitung für die Familie | offen |

## Entscheidungen

- **Technik:** Vite + Vanilla JS, keine Laufzeit-Abhängigkeiten. Basis-Pfad `/hansis-memory/` für GitHub Pages.
- **Kartensätze:** Je Satz ein Ordner `public/sets/<name>/` mit `set.json` und SVG-Bildern. Das Skript `scripts/sets-index.mjs` sammelt vor `dev` und `build` alle Sätze in `public/sets/index.json`. Neue Sätze brauchen keine Codeänderung. Sätze mit `"status": "bald"` erscheinen als «kommt bald».
- **Zeichenstil:** 200×200 SVG, Satzfarbe als Hintergrund (Bauernhof `#DDF0C8`), Kontur `#2E2A26` mit 6 px, runde Linienenden, Bäckchen und Glanzpunkt in den Augen.
- **Tippen:** Ein Tipp zählt schon beim Berühren (`pointerdown`). Weitere Tipps innerhalb von 350 ms werden ignoriert, damit lange oder zittrige Berührungen nur einmal zählen. Während eine Karte dreht, sind Tipps gesperrt.
- **Raster:** Die Spalten werden so gewählt, dass die Karten am grössten werden. Die Berechnung läuft bei jeder Grössenänderung neu (ResizeObserver).
- **Sterne (1 Spieler):** 3 Sterne bei höchstens 1,5 × Paare Züge, 2 Sterne bei höchstens 2,5 × Paare, sonst 1 Stern. Mindestens 1 Stern gibt es immer.
- **Gefundene Paare** bekommen ein Häkchen, damit die Information nicht nur über Farbe läuft.
- **Texte:** alle zentral in `src/texte.js`.

## Offene Fragen

- Darf die Schrift Atkinson Hyperlegible heruntergeladen und lokal eingebunden werden? Bis dahin wird die Systemschrift verwendet.
