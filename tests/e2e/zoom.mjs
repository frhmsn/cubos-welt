// Weit herausgezoomt, Tag und Nacht: prüft auf Streifen (Tiefen-Genauigkeit) und Unschärfe.
// Aufruf: npm run build && node tests/e2e/zoom.mjs [stil]   (Bilder: tests/output/zoom/)
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, ROOT } from './harness.mjs';
const out = path.join(ROOT, 'tests/output/zoom'); fs.mkdirSync(out, { recursive: true });
const st = process.argv[2] || 'diorama';
const b = await launch();
const { page, ctx } = await open(b, 'dist');
for (const [name, d] of [['nah', 48], ['weit', 110], ['ganz-weit', 160]]) {
  await page.evaluate(([st, d]) => { const c = window.__cubo; c.style(st); const p = c.center(10, 10); c.setCam(p.x, p.z, d); c.frames(40); }, [st, d]);
  await page.evaluate(() => { for (const id of ['hint', 'questToast', 'questDock']) { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; } });
  await page.screenshot({ path: path.join(out, `${st}-${name}.png`) });
}
await ctx.close(); await b.close();
console.log('Bilder in', out);
