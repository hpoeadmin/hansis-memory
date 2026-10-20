// Sprichwörter (KopfFit): Anfang, Ende und Bedeutung. Schweizer Schreibweise (ss statt ß).
import { waehle, mischen, ohneDoppelte } from '../../kern/antworten.js';

export const SPRICHWOERTER = [
  ['Morgenstund hat', 'Gold im Mund', 'Wer früh aufsteht, schafft viel.'],
  ['Wer zuletzt lacht,', 'lacht am besten', 'Erst am Schluss zeigt sich, wer gewonnen hat.'],
  ['Ende gut,', 'alles gut', 'Wenn es gut ausgeht, ist der Ärger vergessen.'],
  ['Übung macht', 'den Meister', 'Wer viel übt, wird gut.'],
  ['Ohne Fleiss', 'kein Preis', 'Erfolg braucht Arbeit.'],
  ['Aller Anfang', 'ist schwer', 'Neues ist am Anfang mühsam.'],
  ['Wer A sagt,', 'muss auch B sagen', 'Was man anfängt, muss man auch weiterführen.'],
  ['Lügen haben', 'kurze Beine', 'Lügen kommen bald heraus.'],
  ['Der Apfel fällt nicht', 'weit vom Stamm', 'Kinder sind ähnlich wie ihre Eltern.'],
  ['Reden ist Silber,', 'Schweigen ist Gold', 'Manchmal ist es besser, nichts zu sagen.'],
  ['Wer anderen eine Grube gräbt,', 'fällt selbst hinein', 'Wer anderen schaden will, schadet sich selbst.'],
  ['Viele Köche', 'verderben den Brei', 'Wenn zu viele mitreden, wird nichts Rechtes daraus.'],
  ['Eile mit', 'Weile', 'Wer zu sehr hetzt, macht Fehler.'],
  ['In der Kürze', 'liegt die Würze', 'Kurz gesagt ist oft am besten.'],
  ['Was du heute kannst besorgen,', 'das verschiebe nicht auf morgen', 'Erledige Dinge gleich.'],
  ['Kleider machen', 'Leute', 'Wie man sich kleidet, macht Eindruck auf andere.'],
  ['Wer rastet,', 'der rostet', 'Wer sich nicht bewegt, wird unbeweglich.'],
  ['Steter Tropfen', 'höhlt den Stein', 'Mit Geduld erreicht man viel.'],
  ['Hunde, die bellen,', 'beissen nicht', 'Wer laut droht, tut oft nichts.'],
  ['Der frühe Vogel', 'fängt den Wurm', 'Wer früh dran ist, hat einen Vorteil.'],
  ['Wo ein Wille ist,', 'ist auch ein Weg', 'Wer etwas wirklich will, findet eine Lösung.'],
  ['Gut Ding', 'will Weile haben', 'Gute Arbeit braucht Zeit.'],
  ['Was Hänschen nicht lernt,', 'lernt Hans nimmermehr', 'Was man jung nicht lernt, lernt man später schwer.'],
  ['Besser spät', 'als nie', 'Lieber verspätet als gar nicht.'],
  ['Geteilte Freude', 'ist doppelte Freude', 'Freude wird grösser, wenn man sie teilt.'],
  ['Wer nicht wagt,', 'der nicht gewinnt', 'Ohne Mut kein Erfolg.'],
  ['Es ist noch kein Meister', 'vom Himmel gefallen', 'Jeder muss zuerst lernen.'],
  ['Ein Unglück kommt', 'selten allein', 'Oft passiert Schlimmes gleich mehrfach.'],
  ['Wie man in den Wald hineinruft,', 'so schallt es heraus', 'Wie man andere behandelt, so wird man behandelt.'],
  ['Neue Besen', 'kehren gut', 'Neue Leute sind am Anfang besonders eifrig.'],
  ['Einem geschenkten Gaul', 'schaut man nicht ins Maul', 'An Geschenken soll man nichts aussetzen.'],
  ['Den Letzten', 'beissen die Hunde', 'Wer zu spät kommt, hat das Nachsehen.'],
  ['Wer im Glashaus sitzt,', 'soll nicht mit Steinen werfen', 'Wer selbst Fehler hat, soll andere nicht tadeln.'],
  ['Not macht', 'erfinderisch', 'In schwierigen Lagen findet man neue Lösungen.'],
  ['Stille Wasser', 'sind tief', 'Ruhige Menschen haben oft viel im Kopf.'],
  ['Die Katze lässt das Mausen', 'nicht', 'Alte Gewohnheiten legt man nicht ab.'],
  ['Zeit ist', 'Geld', 'Zeit ist wertvoll.'],
  ['Ordnung ist', 'das halbe Leben', 'Wer Ordnung hält, hat es leichter.'],
].map(([anfang, ende, bedeutung]) => ({ anfang, ende, bedeutung }));

export const STUFEN = {
  leicht: { art: 'ende', optionen: 3 }, // Ende ergänzen, drei zur Wahl
  ergaenzen: { art: 'ende', optionen: 4 },
  bedeutung: { art: 'bedeutung', optionen: 4 }, // Was bedeutet es?
};

export function aufgabe(stufe, zufall = Math.random) {
  const { art, optionen } = STUFEN[stufe];
  const s = waehle(SPRICHWOERTER, zufall);
  const andere = mischen(SPRICHWOERTER.filter((x) => x !== s), zufall).slice(0, optionen - 1);
  const feld = art === 'ende' ? 'ende' : 'bedeutung';
  return {
    art,
    s,
    antworten: mischen([s, ...andere], zufall).map((x) => ({ text: x[feld], richtig: x === s })),
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => x.s.anfang, anzahl);
}
