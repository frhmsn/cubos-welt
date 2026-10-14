// Übernimmt den letzten Testlauf (tests/output/aktuell) als neue Referenz (tests/baseline).
// Nur aufrufen, wenn die Abweichungen gewollt sind und die Screenshots geprüft wurden.
// Gespeichert werden nur die Daten (JSON), keine Bilder, damit das Repo klein bleibt.
import fs from 'node:fs';
import path from 'node:path';
const from = path.resolve('tests/output/aktuell'), to = path.resolve('tests/baseline');
if (!fs.existsSync(from)) { console.error('Erst testen: npm run test:e2e'); process.exit(1); }
fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(to, { recursive: true });
let n = 0;
for (const f of fs.readdirSync(from).filter((f) => f.endsWith('.json'))) {
  const r = JSON.parse(fs.readFileSync(path.join(from, f)));
  if (r.error || r.errors.length) { console.error('Szenario mit Fehler, keine Referenz: ' + r.name); process.exit(1); }
  fs.copyFileSync(path.join(from, f), path.join(to, f)); n++;
}
console.log(`${n} Szenarien als Referenz gespeichert in tests/baseline/`);
