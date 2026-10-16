// Vergleicht zwei Testläufe: Fingerabdrücke müssen gleich sein, Bilder fast gleich.
// Aufruf: node tests/e2e/compare.mjs <A> <B>   (Name unter tests/output/ oder Pfad wie tests/baseline)
// Fehlen bei A die Bilder (z. B. tests/baseline, dort liegen nur Daten), werden nur die Daten verglichen.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { ROOT } from './harness.mjs';

const [a, b] = process.argv.slice(2);
const dir = (x) => (x.includes('/') ? path.join(ROOT, x) : path.join(ROOT, 'tests/output', x));
const A = dir(a), B = dir(b);
const LIMIT = Number(process.env.PIXEL_LIMIT || 0.5); // Prozent abweichender Pixel
let bad = 0;
const diffKeys = (x, y, pre = '') => {
  const out = [];
  for (const k of new Set([...Object.keys(x || {}), ...Object.keys(y || {})])) {
    const u = x?.[k], v = y?.[k];
    if (u && v && typeof u === 'object' && !Array.isArray(u)) out.push(...diffKeys(u, v, pre + k + '.'));
    else if (JSON.stringify(u) !== JSON.stringify(v)) out.push(pre + k);
  }
  return out;
};
// Auf GitHub: Abweichungen auch als Anmerkung, die man ohne Protokoll sieht
const note = (m) => { if (process.env.GITHUB_ACTIONS) console.log('::error title=Browser-Test::' + m.replace(/\n/g, ' ')); };
const get = (o, k) => k.split('.').reduce((x, p) => (x == null ? x : x[p]), o);
const short = (v) => { const s = JSON.stringify(v); return s && s.length > 160 ? s.slice(0, 160) + '…' : s; };
for (const f of fs.readdirSync(A).filter((f) => f.endsWith('.json')).sort()) {
  const ra = JSON.parse(fs.readFileSync(path.join(A, f))), pb = path.join(B, f);
  if (!fs.existsSync(pb)) { console.log('FEHLT  ', f); note('fehlt ' + f); bad++; continue; }
  const rb = JSON.parse(fs.readFileSync(pb));
  if (rb.error || rb.errors.length) { console.log('FEHLER ', ra.name, rb.error || rb.errors[0]); note(ra.name + ': ' + (rb.error || rb.errors[0])); bad++; }
  ra.snaps.forEach((sa, k) => {
    const sb = rb.snaps[k];
    if (!sb) { console.log('FEHLT  ', ra.name, sa.label); bad++; return; }
    const dk = diffKeys(sa.fp, sb.fp);
    if (JSON.stringify(sa.extra) !== JSON.stringify(sb.extra)) dk.push('extra');
    let pct = 0;
    if (fs.existsSync(path.join(A, sa.file))) {
      const ia = PNG.sync.read(fs.readFileSync(path.join(A, sa.file))), ib = PNG.sync.read(fs.readFileSync(path.join(B, sb.file)));
      const diff = new PNG({ width: ia.width, height: ia.height });
      const n = pixelmatch(ia.data, ib.data, diff.data, ia.width, ia.height, { threshold: 0.1 });
      pct = (100 * n) / (ia.width * ia.height);
      if (pct > LIMIT) fs.writeFileSync(path.join(B, sb.file.replace('.png', '.diff.png')), PNG.sync.write(diff));
    }
    const ok = !dk.length && pct <= LIMIT;
    if (!ok) { bad++; note(`${ra.name}/${sa.label}: ` + dk.map((k) => `${k} erwartet ${short(get(sa.fp, k))}, war ${short(get(sb.fp, k))}`).join('; ') + (pct > LIMIT ? ` Pixel ${pct.toFixed(2)} %` : '')); }
    console.log(`${ok ? 'gleich ' : 'ANDERS '} ${ra.name}/${sa.label}  Pixel ${pct.toFixed(2)} %${dk.length ? '  Daten: ' + dk.join(', ') : ''}`);
  });
}
console.log(bad ? `\n${bad} Abweichungen` : '\nAlles gleich.');
process.exit(bad ? 1 : 0);
