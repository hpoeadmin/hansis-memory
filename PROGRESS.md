# Fortschritt – Hansi’s Memory

## Stand

| Schritt | Inhalt | Status |
|---|---|---|
| 1 | Stilprobe (Kuh, Schwein, Huhn) | ✅ freigegeben |
| 2 | Alle 12 Bauernhof-Tiere | ✅ |
| 3 | Spielbare Grundversion (Menü → Stufe → Spiel → Abschluss, 1 Spieler) | ✅ |
| 4 | Stufen und Raster für Quer- und Hochformat | ✅ (bereits in der Grundversion enthalten, noch auf echtem iPad prüfen) |
| 5 | Spielerprofile und Mehrspielermodus | ✅ |
| 6 | Animationen, Lob, Konfetti, Klang, Vorlesen | ✅ (Klang und Vorlesen noch auf dem iPad anhören) |
| 7 | Sammelalbum und Abzeichen | ✅ |
| 8 | Einstellungen mit Elternschloss | ✅ |
| 9 | Offline/PWA mit Update-Hinweis | ✅ |
| 10 | GitHub Pages, Anleitung für die Familie | ✅ https://hpoeadmin.github.io/hansis-memory/ |
| 11 | Satz «Meerestiere» (12 Tiere) | ✅ |
| 12 | Satz «Waldtiere» (12 Tiere) | ✅ |
| 13 | Satz «In der Luft» (12 Tiere) – alle vier Sätze spielbar | ✅ |

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
- **Klang:** Wird im Browser erzeugt (Web Audio, `src/klang.js`), keine Tondateien. Leise voreingestellt (Lautstärke 0.25). Es gibt nur freundliche Klänge: Umdrehen, Paar gefunden, Spielerwechsel, Abschluss. Bei einem Fehlversuch gibt es keinen Ton. Auf dem iPad startet der Ton erst nach der ersten Berührung.
- **Vorlesen:** Web Speech API (`src/vorlesen.js`), Stimme de-CH, sonst de-DE, Tempo 0.8. Liest beim Aufdecken den Tiernamen und am Schluss das Lob. Standardmässig aus; einschalten kommt in die Einstellungen.
- **Gefundenes Paar:** Die Karten hüpfen, und Bild und Name erscheinen 1,6 s gross über dem Brett. Die Anzeige blockiert keine Tipps.
- **Abschluss:** Konfetti (Canvas, 4 s), Sterne erscheinen nacheinander. Bei «Bewegung reduzieren» gibt es weder Konfetti noch Hüpf- oder Sternanimationen.
- **Album:** Den Knopf «Album» gibt es im Startmenü. Oben wählt man das Profil (Reiter mit Avatar und Name). Pro spielbarem Satz zeigt das Album Fortschritt («7 von 12 Tieren» und Balken) und alle 12 Felder: gefundene Tiere mit Bild und Name, noch fehlende als gestricheltes «?». Tippt man ein Tier an, erscheinen grosses Bild, Name und Infosatz (bei eingeschaltetem Vorlesen wird beides vorgelesen). Der Gast hat kein Album.
- **Abzeichen:** Wer alle 12 Tiere eines Satzes gesammelt hat, bekommt eine Medaille mit dem Titelbild des Satzes und zwei Bändern. Sie erscheint im Album oben und beim Satz sowie einmalig im Abschluss («Neues Abzeichen für Lena: Bauernhof komplett!»). Im Einzelspiel zeigt der Abschluss ausserdem «Neu im Album: …».
- **Elternschloss:** Knopf «Für Eltern» oben links im Startmenü. Man muss ihn 3 Sekunden gedrückt halten; ein gelber Balken füllt sich dabei. Lässt man früher los, erscheint «Zum Öffnen 3 Sekunden gedrückt halten.»
- **Einstellungen:** Ton (ein/aus, beim Einschalten erklingt eine Probe), Vorlesen (ein/aus, beim Einschalten ein Probesatz; der Satz schaltet auf dem iPad gleichzeitig die Sprachausgabe frei), wie lange nicht passende Karten offen bleiben (normal 2,5 s / langsam 4 s / sehr langsam 6 s / bis man tippt), Kartenrückseite (Blau mit Punkten, Grün mit Streifen, Orange mit Karos – Farbe *und* Muster unterscheiden sich), Tiernamen auf den Karten (ja/nein; ohne Namen werden die Karten quadratisch und dadurch grösser). Dazu Spieler ändern, löschen (mit Rückfrage; Album und Bestleistungen werden mitgelöscht) und neu anlegen.
- **«Bis man tippt»:** Nach einem Fehlversuch bleiben die Karten offen, und unten erscheint «Tippe, um die Karten umzudrehen.» Ein Tipp irgendwo aufs Spielbrett dreht sie um. Tipps in den ersten 0,3 s zählen nicht, damit ein versehentlicher Doppeltipp die Karten nicht sofort wieder verdeckt.
- **PWA:** `vite-plugin-pwa` (nur beim Build) erzeugt Manifest und Service Worker (Workbox, generateSW). Alle Dateien werden vorab gespeichert (`globPatterns`), dazu gehören auch die Kartensätze, weil `sets/index.json` vor dem Build entsteht. `display: fullscreen` mit Fallback `standalone`. Der Basis-Pfad `/hansis-memory/` gilt für Manifest, Scope und Navigations-Fallback.
- **Updates:** `registerType: 'prompt'`. Eine neue Version wartet, bis jemand auf den gelben Hinweis tippt; das unterbricht kein Spiel. Geprüft wird beim Start, beim Zurückkehren in die App (`visibilitychange`) und alle 30 Minuten.
- **Icons:** `public/icon.svg` (zwei Karten mit Kuh auf Grün). Die PNGs erzeugt `@vite-pwa/assets-generator` (`pwa-assets.config.js`).
- **Veröffentlichung:** GitHub Actions (`deploy.yml`, Node 22) → GitHub Pages, Quelle «GitHub Actions».
- **Meerestiere:** Satzfarbe `#CDE7F5`, Titelbild Wal. Gut unterscheidbar durch Farbe *und* Form: Wal blau, Delfin türkis und schräg springend, Hai grau mit Kiemen und weissem Maul, Krake lachsrot, Seestern orange, Krabbe rot, Schildkröte grün, Qualle rosa, Seepferdchen lila, Robbe graubraun, Pinguin schwarz-weiss, Kugelfisch gelb mit Stacheln. Bei der Krake steht im Infosatz bewusst keine Armzahl (gezeichnet sind 5 Arme).
- **Waldtiere:** Satzfarbe `#E6DCC8`, Titelbild Fuchs. Ähnliche Tiere sind bewusst verschieden gestaltet: Reh hellbraun ohne Geweih, Hirsch dunkelbraun mit Geweih; Fuchs orange, Wolf grau mit Fellbüscheln an den Wangen; Luchs mit Ohrpinseln, Flecken und Halskrause; Hase als ganzer Körper von der Seite (anders als das Kaninchen vom Bauernhof); Wildschwein mit Borstenkamm und weissen Hauern.
- **In der Luft:** Satzfarbe `#FBE7C6`, Titelbild Eule. Vögel mit Ast oder Pfosten (Adler, Eule, Papagei, Pelikan) und stehend (Storch weiss auf zwei roten Beinen, Flamingo rosa auf einem Bein). Die Schwalbe fliegt. Insekten und die Fledermaus sind von vorne oder oben gezeichnet; auf dunklen Köpfen bekommen die Augen einen weissen Ring.
- **Lange Tiernamen:** Die Schriftgrösse richtet sich nach dem längsten Wortteil (`tierName()` in `src/sets.js`). Ein optionales Feld `trennung` mit weichem Trennstrich erlaubt zwei Zeilen («Meeres-/schildkröte»). Das gilt für Karte, Paar-Anzeige und Album.
- **Tippen in scrollbaren Listen** (Album, Spielerauswahl, Profil-Editor): Dort zählt ein Tipp erst beim Loslassen und nur, wenn sich der Finger höchstens 24 px bewegt hat. So löst Scrollen nichts aus, Zittern aber schon. Auf dem Spielbrett und bei festen Knöpfen zählt der Tipp weiterhin sofort beim Berühren.

## Offene Fragen

- keine
