// Startet das Spiel headless in Chromium und stellt Hilfen für die Szenarien bereit.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../..');
// Eigener Chromium-Pfad über CHROME_PATH, sonst der vorinstallierte (Cloud-Umgebung) oder der von Playwright (CI).
const LOCAL = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const CHROME = process.env.CHROME_PATH || (fs.existsSync(LOCAL) ? LOCAL : undefined);
const THREE = path.join(ROOT, 'node_modules/three/build/three.min.js');

/** Liefert den Pfad der Testseite für ein Ziel: 'legacy' (alter Einzeldatei-Stand) oder 'dist' (die gebaute App). */
export function pageFor(target) {
  const out = path.join(ROOT, 'tests/output');
  fs.mkdirSync(out, { recursive: true });
  if (target === 'legacy') {
    let s = fs.readFileSync(path.join(ROOT, 'legacy/kunos-welt.html'), 'utf8');
    const dbg = fs.readFileSync(path.join(HERE, 'legacy-debug.js'), 'utf8');
    const end = s.lastIndexOf('})();');
    s = s.slice(0, end) + dbg + '\n' + s.slice(end);
    const f = path.join(out, 'legacy.html');
    fs.writeFileSync(f, s);
    return f;
  }
  return path.join(ROOT, 'index.html'); // die ausgelieferte App
}

export async function launch() {
  return chromium.launch({ executablePath: CHROME, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-proxy-server'] });
}

export async function open(browser, target, { width = 1180, height = 820, storage = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route(/three(\.min)?\.js/, (r) => r.fulfill({ path: THREE, contentType: 'text/javascript' }));
  await ctx.addInitScript({ path: path.join(HERE, 'env.js') });
  if (storage) await ctx.addInitScript((s) => { if (!sessionStorage.getItem('__seeded')) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); } }, storage);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.stack || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto('file://' + pageFor(target));
  await page.waitForFunction(() => window.__cubo, null, { timeout: 20000, polling: 100 });
  await page.waitForTimeout(400); // Vorschaubilder entstehen nach 60 ms per setTimeout
  return { ctx, page, errors };
}
