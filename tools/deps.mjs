// Zeigt die Import-Abhängigkeiten von src/: Zyklen und Module ohne Zyklus.
// Aufruf: node tools/deps.mjs [--free]   (--free: nur Module, die in keinem Zyklus stecken)
import fs from 'node:fs';
import path from 'node:path';
const SRC = path.resolve('src');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) files.push(p); } })(SRC);
const rel = (p) => path.relative(SRC, p);
const graph = new Map(), allEdges = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const deps = [];
  const all = [];
  for (const m of s.matchAll(/^import\s+(?:[\w$]+\s+from\s+|\{[^}]*\}\s+from\s+)?'([^']+)';(.*)$/gm)) {
    const t = rel(path.resolve(path.dirname(f), m[1]));
    all.push(t);
    if (m[2].includes('Ladereihenfolge')) continue; // Reihenfolge-Import zählt nicht als echte Abhängigkeit
    deps.push(t);
  }
  graph.set(rel(f), deps);
  allEdges.set(rel(f), all);
}
// Tarjan
let idx = 0; const st = [], on = new Set(), I = new Map(), L = new Map(), sccs = [];
function sc(v) { I.set(v, idx); L.set(v, idx); idx++; st.push(v); on.add(v);
  for (const w of graph.get(v) || []) { if (!I.has(w)) { sc(w); L.set(v, Math.min(L.get(v), L.get(w))); } else if (on.has(w)) L.set(v, Math.min(L.get(v), I.get(w))); }
  if (L.get(v) === I.get(v)) { const c = []; let w; do { w = st.pop(); on.delete(w); c.push(w); } while (w !== v); sccs.push(c); } }
for (const v of graph.keys()) if (!I.has(v)) sc(v);
const cyc = sccs.filter((c) => c.length > 1);
// Module, die main.js nie lädt, laufen nie (z. B. ein UI-Modul, das nur Knöpfe verdrahtet)
const seen = new Set(); (function go(v) { if (seen.has(v)) return; seen.add(v); for (const w of allEdges.get(v) || []) go(w); })('main.js');
// src/extras/ enthält ausgebaute Erweiterungen, die absichtlich nicht geladen werden
const orphans = [...graph.keys()].filter((f) => !seen.has(f) && !f.startsWith('extras' + path.sep));
if (orphans.length) { console.log('NICHT GELADEN (von main.js aus nicht erreichbar): ' + orphans.join(', ')); process.exitCode = 1; }
if (process.argv.includes('--free')) console.log(sccs.filter((c) => c.length === 1).map((c) => c[0]).sort().join('\n'));
else { console.log(`${graph.size} Module, ${cyc.length} Zyklus-Gruppe(n)`); for (const c of cyc) console.log(`Zyklus mit ${c.length} Modulen: ${c.sort().join(', ')}`); }
