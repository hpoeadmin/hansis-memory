# Fortschritt – Hansi’s Memory

## Stand

| Schritt | Inhalt | Status |
|---|---|---|
| 1 | Stilprobe (Kuh, Schwein, Huhn) | ✅ freigegeben |
| 2 | Alle 12 Bauernhof-Tiere | ✅ |
| 3 | Spielbare Grundversion (Menü → Stufe → Spiel → Abschluss, 1 Spieler) | ✅ |
| 4 | Stufen und Raster für Quer- und Hochformat | ✅ (bereits in der Grundversion enthalten, noch auf echtem iPad prüfen) |
| 5 | Spielerprofile und Mehrspielermodus | ✅ |
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
- **Schrift:** Atkinson Hyperlegible (OFL) über das npm-Paket `@fontsource/atkinson-hyperlegible`. Vite packt die Schriftdateien beim Build lokal ein, zur Laufzeit wird nichts von aussen geladen.
- **Speicher:** alles unter dem Schlüssel `hansis-memory` im localStorage (`src/speicher.js`): Profile, zuletzt gewählte Spieler, Einstellungen, Bestleistungen, Album. Gilt pro Gerät.
- **Profile:** Name (max. 14 Zeichen), eine von 6 Farben (jede mit Namen) und ein Bauernhof-Tier als Avatar. Dazu gibt es immer einen «Gast», für den nichts gespeichert wird.
- **Spielerauswahl:** 1–4 Spieler. Die Reihenfolge des Antippens ist die Spielreihenfolge und wird als Nummer angezeigt. Die zuletzt gewählten Spieler sind vorausgewählt. Neue Spieler lassen sich vorerst direkt hier anlegen; Ändern und Löschen kommt in die Einstellungen hinter dem Elternschloss.
- **Wer ist dran:** grosses Schild mit Avatar, Name, «ist dran» bzw. «darf nochmals!» in der Spielerfarbe. In der Punkteliste markiert ein Pfeil zusätzlich den aktiven Spieler.
- **Mehrspieler-Abschluss:** alle Spieler in Spielreihenfolge, jeder mit eigenem Lobsatz. Ein kleines Abzeichen «Meiste Paare» gibt es nur, wenn nicht alle gleich viele haben.
- **Bestleistung:** pro Profil und Stufe die wenigsten Züge, nur im Einzelspiel.
- **Album:** Gefundene Tiere werden schon jetzt pro Profil gespeichert. Die Anzeige folgt in Schritt 7.

## Offene Fragen

- keine
