// Pflegt die Ladereihenfolge-Imports im Zyklus-Kern (siehe docs/ARCHITEKTUR.md).
// Aufrufen, nachdem Code verschoben wurde und `npm run deps` einen kleineren Kern zeigt:
//   node tools/rechain.mjs
// Was es tut: liest die bisherige Kette (jedes Kern-Modul importiert zuerst seinen Vorgänger),
// entfernt Module, die nicht mehr im Zyklus stecken, und verknüpft die übrigen in alter Reihenfolge neu.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SRC = path.resolve('src');
const CHAIN = /^import '([^']+)'; \/\/ Ladereihenfolge[^\n]*\n/m;
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) files.push(path.relative(SRC, p)); } })(SRC);
const prevOf = new Map(), hasNext = new Set();
for (const f of files) {
  const m = fs.readFileSync(path.join(SRC, f), 'utf8').match(CHAIN);
  if (m) { const p = path.relative(SRC, path.resolve(path.dirname(path.join(SRC, f)), m[1])); prevOf.set(f, p); hasNext.add(p); }
}
const tail = [...prevOf.keys()].find((f) => !hasNext.has(f));
const order = [];
for (let f = tail; f; f = prevOf.get(f)) order.unshift(f);
const out = execSync('node tools/deps.mjs', { cwd: path.resolve('.') }).toString();
const core = new Set(out.includes('Modulen: ') ? out.split('Modulen: ')[1].trim().split(', ') : []);
let prev = null, changed = 0;
for (const f of order) {
  const p = path.join(SRC, f);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(CHAIN, '');
  if (core.has(f)) {
    if (prev) {
      let r = path.posix.relative(path.posix.dirname(f), prev);
      if (!r.startsWith('.')) r = './' + r;
      const lines = s.split('\n');
      lines.splice(1, 0, `import '${r}'; // Ladereihenfolge: läuft nach ${prev} (siehe docs/ARCHITEKTUR.md)`);
      s = lines.join('\n');
    }
    prev = f;
  }
  if (s !== before) { fs.writeFileSync(p, s); changed++; }
}
// main.js lädt zuerst das letzte Kern-Modul, damit der ganze Kern in Kettenreihenfolge läuft
{
  const mp = path.join(SRC, 'main.js');
  let m = fs.readFileSync(mp, 'utf8').replace(/^import '[^']+'; \/\/ Kern zuerst laden[^\n]*\n/m, '');
  if (prev) { const lines = m.split('\n'); lines.splice(1, 0, `import './${prev}'; // Kern zuerst laden, in Kettenreihenfolge (tools/rechain.mjs pflegt diese Zeile)`); m = lines.join('\n'); }
  fs.writeFileSync(mp, m);
}
const inCore = order.filter((f) => core.has(f));
console.log(`Kette: ${inCore.length} Module (${changed} Dateien geändert). Letztes Kern-Modul: ${prev}`);
const missing = [...core].filter((f) => !order.includes(f));
if (missing.length) console.log('ACHTUNG, im Kern aber nicht in der Kette: ' + missing.join(', '));
