// Rundgang Rucksack, Auftragshaus, Markt, Holz und Kaufen mit Screenshots (Entwicklungshilfe, nicht im Vergleich).
// Aufruf: npm run build && node tests/e2e/ort.mjs   (Bilder: tests/output/ort/)
import fs from 'node:fs';
import path from 'node:path';
import { launch, open, ROOT } from './harness.mjs';
const out = path.join(ROOT, 'tests/output/ort'); fs.mkdirSync(out, { recursive: true });
const b = await launch();
const { page, ctx } = await open(b, 'dist');
const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const ev = (f, a) => page.evaluate(f, a);
const shot = async (n) => { await page.screenshot({ path: path.join(out, n + '.png') }); console.log('Bild', n); };
await ev(() => { const c = window.__cubo; c.frames(60); });
await shot('1-start');
// Auftragshaus im Baumodus antippen
await ev(() => { const c = window.__cubo; c.sel('hand'); c.tap(5, 5); c.frames(5); });
await shot('2-auftragshaus');
await ev(() => { window.__cubo.click('#plBody button.oc'); window.__cubo.frames(5); });
await shot('3-angenommen');
console.log(JSON.stringify(await ev(() => window.__cubo.fp().auftrag)));
// Laufen zum Baum und fällen
await ev(() => { const c = window.__cubo, p = c.center(6, 7); c.startWalk(); c.setPl(p.x + 2.4, p.z, Math.PI / 2); c.frames(10); });
await shot('4-baum');
console.log('chop', await ev(() => window.__cubo.click('#btnChop')));
await ev(() => window.__cubo.frames(10));
await shot('5-gefaellt');
console.log(JSON.stringify(await ev(() => window.__cubo.fp().rucksack)));
// Markt mit Fischen
await ev(() => { const c = window.__cubo; c.give(0, 0, ['makrele', 'makrele', 'hai', 'barsch']); const p = c.center(9, 15); c.setPl(p.x, p.z + 3.5, 0); c.frames(10); });
await shot('6-markt-nah');
await ev(() => { window.__cubo.click('#btnPlace'); window.__cubo.frames(5); });
await shot('7-markt');
await ev(() => { window.__cubo.click('#plBody .mb.go'); window.__cubo.frames(5); });
await shot('8-verkauft');
// Kaufen
await ev(() => { const c = window.__cubo; c.click('#plClose'); c.setMode('build'); c.give(40); document.querySelectorAll('.cat')[6].click(); c.frames(5); });
await shot('9-inventar-wasser');
await ev(() => { document.querySelector('.it.locked').click(); window.__cubo.frames(5); });
await shot('10-kaufen');
await ev(() => { window.__cubo.click('#plBody .mb.go'); window.__cubo.frames(5); });
await shot('11-gekauft');
await ev(() => { document.querySelectorAll('.cat')[3].click(); window.__cubo.frames(5); });
await shot('12-haeuser');
console.log(JSON.stringify(await ev(() => window.__cubo.fp().rucksack)));
// Tür: vor das Auftragshaus stellen
await ev(() => { const c = window.__cubo, p = c.center(5, 5), d = c.doors().sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  c.startWalk(); const dx = d.x - p.x, dz = d.z - p.z, l = Math.hypot(dx, dz); c.setPl(d.x + dx / l * 1.4, d.z + dz / l * 1.4, Math.atan2(dx, dz)); c.frames(10); });
await shot('13-tuer-zu');
console.log('door', await ev(() => window.__cubo.click('#btnDoor')));
await ev(() => window.__cubo.frames(30));
await shot('14-tuer-auf');
// Motorboot fahren
await ev(() => { const c = window.__cubo; c.setMode('build'); c.sel('motorboot'); c.tap(6, 18); c.frames(5); c.startWalk(); c.enterCar('motorboot'); c.frames(30); });
await shot('15-motorboot');
console.log('Fehler:', errs.length ? errs : 'keine');
await ctx.close(); await b.close();
