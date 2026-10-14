// Einfache Prüfungen für src/: fehlende und ungenutzte Importe, Gedankenstriche in Texten.
// Fehlende Importe sind tückisch: der Build läuft durch, erst im Spiel kommt ein ReferenceError.
// Läuft in `npm run check`. Aufruf: node tools/lint.mjs [--fix]   (--fix entfernt ungenutzte Importe)
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import * as eslintScope from 'eslint-scope';

// Namen, die im Browser global sind und ohne Import benutzt werden dürfen
const GLOBALS = new Set(('window document navigator location localStorage sessionStorage performance console setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame '
  + 'addEventListener matchMedia devicePixelRatio innerWidth innerHeight THREE Math JSON Date Array Object Number String Boolean Map Set WeakMap Promise Error TypeError Symbol '
  + 'Uint8Array Float32Array Uint16Array Int16Array Int32Array Uint32Array Float64Array ArrayBuffer Blob Response TextEncoder TextDecoder CompressionStream DecompressionStream btoa atob globalThis '
  + 'Infinity NaN isNaN isFinite parseInt parseFloat AudioContext webkitAudioContext Image structuredClone undefined').split(/\s+/));
const SRC = path.resolve('src');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|css|html)$/.test(f)) files.push(p); } })(SRC);
let bad = 0;
const FIX = process.argv.includes('--fix');
for (const p of files) {
  const s = fs.readFileSync(p, 'utf8'), rel = path.relative('.', p);
  if (/[–—]/.test(s)) { console.log(`${rel}: Gedankenstrich gefunden (bitte Komma oder Punkt)`); bad++; }
  if (!p.endsWith('.js')) continue;
  try {
    const ast = acorn.parse(s, { ecmaVersion: 2022, sourceType: 'module', ranges: true });
    const sm = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
    const missing = new Set();
    for (const r of sm.globalScope.through) if (!GLOBALS.has(r.identifier.name)) missing.add(r.identifier.name);
    for (const n of missing) { console.log(`${rel}: "${n}" ist weder importiert noch deklariert`); bad++; }
  } catch (e) { console.log(`${rel}: Syntaxfehler ${e.message}`); bad++; }
  const body = s.replace(/^import [^\n]*\n/gm, '');
  let fixed = s;
  for (const m of s.matchAll(/^import \{ ([^}]*) \} from '([^']+)';\n/gm)) {
    const names = m[1].split(',').map((x) => x.trim());
    const used = names.filter((n) => new RegExp('(?<![\\w$])' + n.replace('$', '\\$') + '(?![\\w$])').test(body));
    if (used.length === names.length) continue;
    if (FIX) fixed = fixed.replace(m[0], used.length ? `import { ${used.join(', ')} } from '${m[2]}';\n` : '');
    else for (const n of names.filter((x) => !used.includes(x))) { console.log(`${rel}: Import "${n}" aus ${m[2]} wird nicht benutzt`); bad++; }
  }
  if (FIX && fixed !== s) { fs.writeFileSync(p, fixed); console.log(`${rel}: ungenutzte Importe entfernt`); }
}
console.log(bad ? `\n${bad} Hinweise` : 'lint: alles sauber');
process.exit(bad ? 1 : 0);
