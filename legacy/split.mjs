// Einmaliges Umbau-Werkzeug: zerlegt legacy/kunos-welt.html in ES-Module unter src/.
// Es bleibt im Repo, damit nachvollziehbar ist, wie src/ entstanden ist. Nicht erneut ausführen,
// sobald in src/ von Hand weitergearbeitet wurde (es überschreibt src/).
//
// Vorgehen:
// 1. Das Spiel-Skript wird geparst, jede Anweisung auf oberster Ebene bekommt eine Zieldatei.
// 2. eslint-scope löst jede Variablen-Referenz auf. Wird ein Name in einer anderen Datei gelesen,
//    entsteht ein import/export. Wird er in einer anderen Datei neu zugewiesen, wandert er in das
//    gemeinsame Objekt `state` (ES-Module erlauben keine Zuweisung an importierte Namen).
// 3. Jede Datei importiert zuerst ihre Vorgängerin. So laufen die Module genau in der alten
//    Reihenfolge, auch wenn sie sich gegenseitig importieren.
// 4. Eine Prüfung stellt sicher, dass kein Modul beim Laden auf etwas zugreift, das erst später entsteht.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as eslintScope from 'eslint-scope';
import MagicString from 'magic-string';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'legacy/kunos-welt.html'), 'utf8');

// ---------- HTML zerlegen ----------
const styleA = html.indexOf('<style>') + 7, styleB = html.indexOf('</style>');
const css = html.slice(styleA, styleB).trim() + '\n';
const bodyA = styleB + 8; // Das Artifact hat kein <body>: Markup steht direkt nach </style>
const threeTag = html.indexOf('<script src="https://cdnjs');
const markup = html.slice(bodyA, threeTag).trim();
const scA = html.indexOf('<script>', threeTag) + 8, scB = html.indexOf('</script>', scA);
let script = html.slice(scA, scB);
// Test-Schnittstelle als letzter Abschnitt, damit sie wie jeder andere Teil aufgelöst wird
const dbg = fs.readFileSync(path.join(ROOT, 'tests/e2e/legacy-debug.js'), 'utf8')
  .replace(/^\/\/.*\n/gm, '').replace('window.__cubo = {', 'if (window.__CUBO_DEBUG) window.__cubo = {');
const startMark = script.indexOf('/* ---------- Start ---------- */');
script = script.slice(0, startMark) + '/* ---------- Test-Schnittstelle ---------- */\n' + dbg + '\n' + script.slice(startMark);

const ast = acorn.parse(script, { ecmaVersion: 2022, sourceType: 'script', locations: true, ranges: true });
const iife = ast.body.find((s) => s.type === 'ExpressionStatement').expression.callee;
const body = iife.body.body.filter((s) => !(s.type === 'ExpressionStatement' && s.directive));

// ---------- Zieldateien: Zeile, ab der eine Datei gilt ----------
const lineOf = (re) => { const k = script.search(re); if (k < 0) throw new Error('nicht gefunden: ' + re); return script.slice(0, k).split('\n').length; };
const sec = (name) => lineOf(new RegExp('/\\* ---------- ' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' ---------- \\*/'));
const decl = (re) => lineOf(re);
const BREAKS = [
  [1, 'core/util.js'],
  [decl(/const TILE=4/), 'core/grid.js'],
  [decl(/const clamp=/), 'core/util.js'],
  [decl(/const rightOf=/), 'core/grid.js'],
  [decl(/function mulberry\(/), 'core/util.js'],
  [sec('Katalog'), 'content/catalog.js'],
  [sec('Renderer & Szene'), 'render/renderer.js'],
  [sec('Material & Geometrie'), 'render/materials.js'],
  [sec('Boden'), 'content/models/ground.js'],
  [sec('Gleise, Bahnhof, Häfen'), 'content/models/rail.js'],
  [sec('Häuser'), 'content/models/buildings.js'],
  [sec('Autos'), 'content/models/vehicles.js'],
  [sec('Tiere'), 'content/models/animals.js'],
  [sec('Selbst bauen: Blöcke'), 'content/models/blocks.js'],
  [sec('Welt-Zustand'), 'core/world.js'],
  [sec('Kollision'), 'core/collision.js'],
  [sec('Autos fahren'), 'systems/traffic.js'],
  [sec('Eisenbahn'), 'systems/trains.js'],
  [sec('Fähre'), 'systems/ferries.js'],
  [sec('Tiere laufen'), 'systems/animals.js'],
  [sec('Sound'), 'systems/audio.js'],
  [sec('Tag und Nacht'), 'render/daynight.js'],
  [sec('Echte Lichter'), 'render/lights.js'],
  [sec('Kamera Bauen'), 'render/build-camera.js'],
  [sec('Bauen'), 'systems/build.js'],
  [sec('Eingabe Bauen'), 'ui/build-input.js'],
  [sec('Laufen & Fahren'), 'systems/player.js'],
  [decl(/function stationNear\(/), 'ui/station-panel.js'],
  [decl(/function updateWalk\(/), 'systems/player.js'],
  [sec('UI'), 'ui/modes.js'],
  [sec('Meine Welten'), 'core/storage.js'],
  [sec('Fische und Angeln'), 'content/fish.js'],
  [decl(/function fishOk\(/), 'systems/fish.js'],
  [sec('Wale'), 'content/whales.js'],
  [decl(/let whaleBook=/), 'systems/whales.js'],
  [decl(/function whaleModel\(/), 'content/whales.js'],
  [decl(/const whales=\[\]/), 'systems/whales.js'],
  [decl(/let fishing=null/), 'systems/fishing.js'],
  [sec('Unterwasserwelt'), 'systems/underwater.js'],
  [sec('Aquarium-Becken'), 'systems/aquarium.js'],
  [sec('Weltreise'), 'systems/travel.js'],
  [sec('Welt-Codes'), 'core/world-codes.js'],
  [decl(/let codeMode=/), 'ui/worlds-menu.js'],
  [decl(/function fangData\(/), 'systems/fishing.js'],
  [decl(/\$\('#mExportAll'\)/), 'ui/worlds-menu.js'],
  [decl(/const ICON_FULL=/), 'ui/fullscreen.js'],
  [decl(/let thumbs=/), 'ui/inventory.js'],
  [sec('Speichern'), 'core/save.js'],
  [decl(/function sampleWorld\(/), 'content/sample-world.js'],
  [sec('Bauwerkstatt'), 'systems/editor.js'],
  [sec('Schleife'), 'core/loop.js'],
  [sec('Start'), 'main.js'],
  [sec('Test-Schnittstelle'), 'debug.js'],
];
BREAKS.sort((a, b) => a[0] - b[0]);
const fileOfLine = (l) => { let f = BREAKS[0][1]; for (const [k, v] of BREAKS) if (k <= l) f = v; return f; };

const stmts = body.map((s, k) => ({ node: s, k, file: fileOfLine(s.loc.start.line) }));
const order = [];
for (const s of stmts) if (!order.includes(s.file)) order.push(s.file);
const stmtAt = (pos) => { let lo = 0, hi = stmts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (stmts[m].node.start <= pos) lo = m; else hi = m - 1; } return stmts[lo]; };

// ---------- Gültigkeitsbereiche ----------
const sm = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' });
const fnScope = sm.acquire(iife);
const vars = new Map(); // Name -> Infos
for (const v of fnScope.variables) {
  if (!v.defs.length || v.name === 'arguments') continue;
  const d = v.defs[0];
  const st = stmtAt(d.name.start);
  vars.set(v.name, { v, file: st.file, stmt: st, kind: d.type === 'FunctionName' ? 'function' : d.parent && d.parent.kind || d.type });
}

// Eltern für Kurzschreibweise { name } und für "liegt in einer Funktion?"
const parent = new Map();
walk.fullAncestor(ast, (n, _s, anc) => { if (anc.length > 1) parent.set(n, anc[anc.length - 2]); });
const insideFunction = (n, stop) => { let p = parent.get(n); while (p) { if (/Function/.test(p.type)) return true; if (p === stop) break; p = parent.get(p); } return false; };

const uses = new Map(order.map((f) => [f, new Map()])); // Datei -> (Quelldatei -> Set(Namen))
const exportsOf = new Map(order.map((f) => [f, new Set()]));
const stateVars = new Set();
const eagerIssues = [];
for (const [name, info] of vars) {
  for (const r of info.v.references) {
    const st = stmtAt(r.identifier.start);
    if (st.file !== info.file && r.isWrite() && !r.init) stateVars.add(name);
  }
}
for (const [name, info] of vars) {
  for (const r of info.v.references) {
    const st = stmtAt(r.identifier.start);
    // Prüfung: Zugriff beim Laden (nicht in einer Funktion) auf etwas, das noch nicht existiert?
    if (info.kind !== 'function' && !insideFunction(r.identifier, st.node) && st.node !== info.stmt.node) {
      const a = order.indexOf(st.file), b = order.indexOf(info.file);
      if (b > a || (a === b && info.stmt.k > st.k)) eagerIssues.push(`${name}: ${st.file} braucht es beim Laden, entsteht aber in ${info.file}`);
    }
    if (st.file === info.file || stateVars.has(name)) continue;
    const m = uses.get(st.file);
    if (!m.has(info.file)) m.set(info.file, new Set());
    m.get(info.file).add(name);
    exportsOf.get(info.file).add(name);
  }
}
if (eagerIssues.length) { console.error('Ladereihenfolge verletzt:\n' + [...new Set(eagerIssues)].join('\n')); process.exit(1); }

// ---------- Umschreiben: geteilte Zustände nach game.* ----------
if (/\bgame\b/.test(script)) throw new Error('Der Name game ist schon vergeben');
const ms = new MagicString(script);
for (const name of stateVars) {
  const info = vars.get(name);
  for (const r of info.v.references) {
    if (r.init) continue; // Deklaration, wird unten ersetzt
    const id = r.identifier, p = parent.get(id);
    if (p && p.type === 'Property' && p.shorthand && p.value === id) ms.overwrite(id.start, id.end, `${name}: game.${name}`);
    else ms.overwrite(id.start, id.end, `game.${name}`);
  }
}
for (const s of stmts) {
  const n = s.node;
  if (n.type !== 'VariableDeclaration' || !n.declarations.some((d) => stateVars.has(d.id.name))) continue;
  const parts = []; let group = [];
  const flush = () => { if (group.length) { parts.push(`${n.kind} ${group.join(', ')};`); group = []; } };
  for (const d of n.declarations) {
    const init = d.init ? ms.slice(d.init.start, d.init.end) : 'undefined';
    if (stateVars.has(d.id.name)) { flush(); parts.push(`game.${d.id.name} = ${init};`); }
    else group.push(ms.slice(d.start, d.end));
  }
  flush();
  ms.overwrite(n.start, n.end, parts.join(' '));
}

// ---------- Dateien schreiben ----------
const INFO = JSON.parse(fs.readFileSync(path.join(ROOT, 'legacy/split-info.json'), 'utf8'));
const SRC = path.join(ROOT, 'src');
const rel = (from, to) => { let r = path.posix.relative(path.posix.dirname(from), to); if (!r.startsWith('.')) r = './' + r; return r; };
const usesState = new Set();
for (const name of stateVars) for (const r of vars.get(name).v.references) usesState.add(stmtAt(r.identifier.start).file);
const bodies = new Map(order.map((f) => [f, []]));
let prevEnd = body[0].start;
for (const s of stmts) {
  let txt = ms.slice(prevEnd, s.node.end);
  prevEnd = s.node.end;
  bodies.get(s.file).push(txt);
}
fs.rmSync(SRC, { recursive: true, force: true });
order.forEach((f, idx) => {
  const lines = [];
  lines.push(`// ${INFO[f] || f}`);
  if (idx > 0) lines.push(`import '${rel(f, order[idx - 1])}'; // Ladereihenfolge: dieses Modul läuft nach ${order[idx - 1]}`);
  if (usesState.has(f)) lines.push(`import { game } from '${rel(f, 'core/state.js')}';`);
  for (const [src, names] of [...uses.get(f)].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))) {
    lines.push(`import { ${[...names].sort().join(', ')} } from '${rel(f, src)}';`);
  }
  let code = bodies.get(f).join('').replace(/^\s*\n/, '').replace(/^[ \t]+/gm, (m) => m) + '\n';
  code = code.replace(/^\s*\/\* ---------- (.+?) ---------- \*\/\s*$/gm, '\n// ---------- $1 ----------');
  const ex = [...exportsOf.get(f)].sort();
  const out = lines.join('\n') + '\n\n' + code.trim() + '\n' + (ex.length ? `\nexport { ${ex.join(', ')} };\n` : '');
  fs.mkdirSync(path.dirname(path.join(SRC, f)), { recursive: true });
  fs.writeFileSync(path.join(SRC, f), out);
});
const stateDoc = [...stateVars].sort().map((n) => ` *   ${n}  (früher in ${vars.get(n).file})`).join('\n');
fs.writeFileSync(path.join(SRC, 'core/state.js'), `// Gemeinsamer, veränderlicher Spielzustand.
// Hier liegen Werte, die mehrere Module neu setzen (z. B. der aktuelle Modus).
// Werte, die nur ein Modul ändert, bleiben dort als normale Variable.
// Die Startwerte setzt jeweils das Modul, aus dem der Wert stammt.
/**
 * Felder:
${stateDoc}
 */
export const game = {};
`);
fs.writeFileSync(path.join(SRC, 'styles.css'), css);
const head = html.slice(0, html.indexOf('<style>')).trim();
fs.writeFileSync(path.join(SRC, 'index.html'), `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<!-- APP-HEAD -->
${head}
<link rel="stylesheet" href="./styles.css">
<script type="module" src="./main.js"></script>
</head>
<body>
${markup}
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<!-- APP-BODY -->
</body>
</html>
`);
console.log(`${order.length} Module, ${stateVars.size} geteilte Zustände: ${[...stateVars].join(', ')}`);
console.log('Reihenfolge:', order.join(' > '));
