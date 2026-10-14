// Spielt alle Szenarien gegen ein Ziel durch und speichert Fingerabdrücke und Screenshots.
// Aufruf: node tests/e2e/run.mjs <legacy|dist> [szenario ...]
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, ROOT } from './harness.mjs';
import { scenarios } from './scenarios.mjs';

// Ziel optional mit eigenem Ausgabenamen: legacy:legacy2
const [spec = 'dist', ...only] = process.argv.slice(2);
const [target, outName = target] = spec.split(':');
const outDir = path.join(ROOT, 'tests/output', outName);
fs.mkdirSync(outDir, { recursive: true });
const browser = await launch();
let failed = 0;
for (const [name, fn] of Object.entries(scenarios)) {
  if (only.length && !only.includes(name)) continue;
  const t0 = Date.now();
  const { ctx, page, errors } = await open(browser, target);
  const snaps = [];
  const snap = async (label, extra) => {
    const n = String(snaps.length + 1).padStart(2, '0');
    const file = `${name}-${n}-${label}.png`;
    await page.screenshot({ path: path.join(outDir, file) });
    snaps.push({ label, file, fp: await page.evaluate(() => window.__cubo.fp()), ...(extra ? { extra } : {}) });
  };
  let error = null;
  try { await fn({ page, snap }); } catch (e) { error = String(e && e.stack || e); }
  if (error || errors.length) failed++;
  fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify({ name, error, errors, snaps }, null, 1));
  console.log(`${error || errors.length ? 'FEHLER' : 'ok    '} ${name} (${snaps.length} Bilder, ${((Date.now() - t0) / 1000).toFixed(1)} s)${error ? '\n  ' + error.split('\n')[0] : ''}${errors.length ? '\n  ' + errors.slice(0, 3).join('\n  ') : ''}`);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
