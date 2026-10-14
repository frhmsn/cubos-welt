// Schnell Modelle ansehen: node tests/e2e/look.mjs rochen kalmar marlin  (Bild: tests/output/look.png)
import path from 'node:path';
import { launch, open, ROOT } from './harness.mjs';
const ids = process.argv.slice(2);
const b = await launch();
const { page, errors } = await open(b, 'dist');
await page.evaluate(() => window.__cubo.emptyWorld());
await page.evaluate(([ids]) => { const c = window.__cubo; c.setCam(0, 3, 6 + ids.length * 2.2, 0); c.lineup(ids); }, [ids]);
await page.evaluate(() => window.__cubo.frames(5));
const file = path.join(ROOT, 'tests/output/look.png');
await page.screenshot({ path: file });
console.log(errors.length ? errors.join('\n') : 'ok', file);
await b.close();
