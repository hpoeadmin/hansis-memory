// Berechnet das Kartenraster, bei dem die Karten am grössten werden.
// verhaeltnis = Kartenbreite / Kartenhöhe

export function bestesRaster(anzahl, breite, hoehe, verhaeltnis, abstand) {
  let bestes = { spalten: anzahl, zeilen: 1, kartenBreite: 0 };
  for (let spalten = 1; spalten <= anzahl; spalten++) {
    const zeilen = Math.ceil(anzahl / spalten);
    const maxBreite = (breite - abstand * (spalten - 1)) / spalten;
    const maxHoehe = (hoehe - abstand * (zeilen - 1)) / zeilen;
    const kartenBreite = Math.floor(Math.min(maxBreite, maxHoehe * verhaeltnis));
    // Bei gleicher Grösse: Raster ohne halbleere letzte Zeile bevorzugen
    const besser =
      kartenBreite > bestes.kartenBreite ||
      (kartenBreite === bestes.kartenBreite && anzahl % spalten === 0);
    if (besser) bestes = { spalten, zeilen, kartenBreite };
  }
  return bestes;
}
