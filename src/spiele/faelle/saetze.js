// Fälle und Satzglieder (1. Gymnasium). Jeder Satz ist in Teile zerlegt:
// [Text, Rolle, Fall]
//   Rolle: S Subjekt, P Prädikat, AO Akkusativobjekt, DO Dativobjekt, GO Genitivobjekt,
//          ADV Adverbiale, ATTR Attribut, PRAED Prädikativ, PTEIL zweiter Teil des Prädikats
//          (diese werden nicht als Satzglied gefragt)
//   Fall: nom, gen, dat, akk (bei Präpositionen bestimmt die Präposition den Fall)
import { waehle, ohneDoppelte } from '../../kern/antworten.js';

const SAETZE = [
  [['Der Lehrer', 'S', 'nom'], ['schenkt', 'P'], ['dem Schüler', 'DO', 'dat'], ['ein Buch', 'AO', 'akk']],
  [['Die Grossmutter', 'S', 'nom'], ['backt', 'P'], ['einen Kuchen', 'AO', 'akk']],
  [['Lena', 'S', 'nom'], ['hilft', 'P'], ['ihrem Bruder', 'DO', 'dat']],
  [['Der Hund', 'S', 'nom'], ['bringt', 'P'], ['dem Jäger', 'DO', 'dat'], ['den Stock', 'AO', 'akk']],
  [['Das Velo', 'S', 'nom'], ['des Nachbarn', 'ATTR', 'gen'], ['ist', 'P'], ['kaputt', 'PRAED']],
  [['Wir', 'S', 'nom'], ['besuchen', 'P'], ['das Museum', 'AO', 'akk']],
  [['Die Kinder', 'S', 'nom'], ['danken', 'P'], ['der Lehrerin', 'DO', 'dat']],
  [['Am Morgen', 'ADV', 'dat'], ['füttert', 'P'], ['der Bauer', 'S', 'nom'], ['die Kühe', 'AO', 'akk']],
  [['Der Zug', 'S', 'nom'], ['fährt', 'P'], ['durch den Tunnel', 'ADV', 'akk']],
  [['Mia', 'S', 'nom'], ['schreibt', 'P'], ['ihrer Freundin', 'DO', 'dat'], ['einen Brief', 'AO', 'akk']],
  [['Das Dach', 'S', 'nom'], ['des Hauses', 'ATTR', 'gen'], ['ist', 'P'], ['rot', 'PRAED']],
  [['Der Vater', 'S', 'nom'], ['erklärt', 'P'], ['den Kindern', 'DO', 'dat'], ['die Aufgabe', 'AO', 'akk']],
  [['Die Katze', 'S', 'nom'], ['jagt', 'P'], ['eine Maus', 'AO', 'akk']],
  [['Tim', 'S', 'nom'], ['gibt', 'P'], ['dem Hund', 'DO', 'dat'], ['einen Knochen', 'AO', 'akk']],
  [['Im Sommer', 'ADV', 'dat'], ['schwimmen', 'P'], ['die Kinder', 'S', 'nom'], ['im See', 'ADV', 'dat']],
  [['Der Arzt', 'S', 'nom'], ['untersucht', 'P'], ['den Patienten', 'AO', 'akk']],
  [['Die Polizei', 'S', 'nom'], ['beschuldigt', 'P'], ['den Mann', 'AO', 'akk'], ['des Diebstahls', 'GO', 'gen']],
  [['Grosi', 'S', 'nom'], ['erzählt', 'P'], ['uns', 'DO', 'dat'], ['eine Geschichte', 'AO', 'akk']],
  [['Wegen des Regens', 'ADV', 'gen'], ['bleiben', 'P'], ['wir', 'S', 'nom'], ['zu Hause', 'ADV', 'dat']],
  [['Der Trainer', 'S', 'nom'], ['lobt', 'P'], ['die Mannschaft', 'AO', 'akk']],
  [['Die Farbe', 'S', 'nom'], ['des Himmels', 'ATTR', 'gen'], ['wechselt', 'P'], ['am Abend', 'ADV', 'dat']],
  [['Das Buch', 'S', 'nom'], ['gehört', 'P'], ['dem Mädchen', 'DO', 'dat']],
  [['Nach der Schule', 'ADV', 'dat'], ['spielt', 'P'], ['Noah', 'S', 'nom'], ['Fussball', 'AO', 'akk']],
  [['Die Mutter', 'S', 'nom'], ['kauft', 'P'], ['ihrem Sohn', 'DO', 'dat'], ['neue Schuhe', 'AO', 'akk']],
  [['Der Bäcker', 'S', 'nom'], ['verkauft', 'P'], ['frisches Brot', 'AO', 'akk']],
  [['Die Kirschen', 'S', 'nom'], ['schmecken', 'P'], ['dem Kind', 'DO', 'dat']],
  [['Der Sturm', 'S', 'nom'], ['zerstört', 'P'], ['den alten Baum', 'AO', 'akk']],
  [['Trotz der Kälte', 'ADV', 'gen'], ['geht', 'P'], ['Elena', 'S', 'nom'], ['spazieren', 'PTEIL']],
].map((teile) => teile.map(([text, rolle, fall]) => ({ text, rolle, fall: fall ?? null })));

export const FAELLE = ['nom', 'gen', 'dat', 'akk'];
export const SATZGLIEDER = ['S', 'P', 'AO', 'DO'];

export const STUFEN = {
  faelle: { arten: ['fall'] },
  satzglieder: { arten: ['satzglied'] },
  gemischt: { arten: ['fall', 'satzglied'] },
};

export const satzText = (teile) => `${teile.map((t) => t.text).join(' ')}.`;

export function aufgabe(stufe, zufall = Math.random) {
  const art = waehle(STUFEN[stufe].arten, zufall);
  const satz = waehle(SAETZE, zufall);
  const moeglich = satz
    .map((teil, index) => ({ teil, index }))
    .filter(({ teil }) => (art === 'fall' ? teil.fall : SATZGLIEDER.includes(teil.rolle)));
  const { teil, index } = waehle(moeglich, zufall);
  return {
    art,
    satz,
    index,
    richtig: art === 'fall' ? teil.fall : teil.rolle,
    optionen: art === 'fall' ? FAELLE : SATZGLIEDER,
  };
}

export function runde(stufe, anzahl, zufall = Math.random) {
  return ohneDoppelte(() => aufgabe(stufe, zufall), (x) => `${satzText(x.satz)}${x.index}${x.art}`, anzahl);
}
