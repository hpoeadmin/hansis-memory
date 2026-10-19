// Sucht alle Kartensätze in public/sets/*/set.json und schreibt
// public/sets/index.json. So kommen neue Sätze ohne Codeänderung dazu.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const setsOrdner = join(import.meta.dirname, '..', 'public', 'sets');
const sets = [];

for (const ordner of readdirSync(setsOrdner, { withFileTypes: true })) {
  if (!ordner.isDirectory()) continue;
  const datei = join(setsOrdner, ordner.name, 'set.json');
  if (!existsSync(datei)) continue;
  const set = JSON.parse(readFileSync(datei, 'utf8'));
  set.ordner = ordner.name;
  if (set.status === 'bereit') {
    for (const tier of set.tiere) {
      if (!existsSync(join(setsOrdner, ordner.name, tier.bild))) {
        throw new Error(`Bild fehlt: sets/${ordner.name}/${tier.bild}`);
      }
    }
  }
  sets.push(set);
}

sets.sort((a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99));
writeFileSync(join(setsOrdner, 'index.json'), JSON.stringify(sets, null, 2));
console.log(`Kartensätze gefunden: ${sets.map((s) => s.name).join(', ')}`);
