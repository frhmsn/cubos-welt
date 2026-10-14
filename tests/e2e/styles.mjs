// Stil-Vergleich: dieselbe Stadt in allen Stilen, von oben und beim Laufen.
// Aufruf: npm run build && node tests/e2e/styles.mjs   (Bilder: tests/output/stile/)
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, ROOT } from './harness.mjs';
const out = path.join(ROOT, 'tests/output/stile'); fs.mkdirSync(out, { recursive: true });
const STYLES = ['klar', 'bilderbuch', 'diorama', 'maerchen', 'abendgold', 'pastell'];
const clean = () => { for (const id of ['hint', 'questToast', 'questDock', 'top', 'inv', 'pad', 'joy', 'walkBtns']) { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; } };
const b = await launch();
for (const st of STYLES) {
  const { page, ctx } = await open(b, 'dist');
  await page.evaluate((st) => { const c = window.__cubo; c.style(st); c.frames(90); }, st);
  await page.evaluate(clean);
  await page.screenshot({ path: path.join(out, `${st}-oben.png`) });
  await page.evaluate(() => { const c = window.__cubo, p = c.center(7, 7); c.setCam(p.x, p.z, 40); c.startWalk(); c.frames(30); });
  await page.evaluate(clean);
  await page.screenshot({ path: path.join(out, `${st}-laufen.png`) });
  await ctx.close();
}
await b.close();
console.log('Bilder in', out);
