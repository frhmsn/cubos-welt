// Einfache Prüfungen für src/: ungenutzte Importe und Gedankenstriche in Texten.
// Läuft in `npm run check`. Aufruf: node tools/lint.mjs
import fs from 'node:fs';
import path from 'node:path';
const SRC = path.resolve('src');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|css|html)$/.test(f)) files.push(p); } })(SRC);
let bad = 0;
for (const p of files) {
  const s = fs.readFileSync(p, 'utf8'), rel = path.relative('.', p);
  if (/[–—]/.test(s)) { console.log(`${rel}: Gedankenstrich gefunden (bitte Komma oder Punkt)`); bad++; }
  if (!p.endsWith('.js')) continue;
  const body = s.replace(/^import [^\n]*\n/gm, '');
  for (const m of s.matchAll(/^import \{ ([^}]*) \} from '([^']+)';/gm)) {
    for (const n of m[1].split(',').map((x) => x.trim())) {
      if (!new RegExp('(?<![\\w$])' + n.replace('$', '\\$') + '(?![\\w$])').test(body)) { console.log(`${rel}: Import "${n}" aus ${m[2]} wird nicht benutzt`); bad++; }
    }
  }
}
console.log(bad ? `\n${bad} Hinweise` : 'lint: alles sauber');
process.exit(bad ? 1 : 0);
