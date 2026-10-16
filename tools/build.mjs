// Baut die App aus dist/index.html (vorher: vite build) für GitHub Pages
// direkt ins Repo-Wurzelverzeichnis:
//   index.html, three.min.js, sw.js, manifest.webmanifest, icon-*.png
// Die Dateien im Wurzelverzeichnis sind erzeugt. Nie von Hand ändern, sondern src/ ändern und neu bauen.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const NAME = 'Cubos Welten entdecken', SHORT = 'Cubos Welt';

const built = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');
if (!built.includes(CDN)) throw new Error('Three.js-Einbindung nicht gefunden');

// ---------- App ----------
// Statusleiste undurchsichtig ('default'): Mit 'black-translucent' macht iOS 26 die Home-Bildschirm-App unten
// um die Höhe der Statusleiste zu kurz, darunter bleibt ein Streifen, den die Seite nicht füllen kann
// (WebKit-Fehler 301108/301994). iOS liest die Einstellung nur beim Hinzufügen zum Home-Bildschirm.
const appHead = `<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${SHORT}">
<meta name="theme-color" content="#8FD3FF">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">`;
const appBody = `<script>
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}
</script>`;
const app = built.replace(CDN, 'three.min.js').replace('<!-- APP-HEAD -->', appHead).replace('<!-- APP-BODY -->', appBody);
const version = crypto.createHash('sha1').update(app).digest('hex').slice(0, 10);

const out = (f, data) => fs.writeFileSync(path.join(ROOT, f), data);
out('index.html', app);
fs.copyFileSync(path.join(ROOT, 'node_modules/three/build/three.min.js'), path.join(ROOT, 'three.min.js'));
for (const n of [180, 192, 512]) fs.copyFileSync(path.join(ROOT, `assets/icons/icon-${n}.png`), path.join(ROOT, `icon-${n}.png`));
out('manifest.webmanifest', JSON.stringify({
  name: NAME, short_name: SHORT, lang: 'de', start_url: './', scope: './', display: 'fullscreen', orientation: 'any',
  background_color: '#8FD3FF', theme_color: '#8FD3FF',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2) + '\n');
// Neue Version bei jeder Änderung: der Cache-Name hängt am Inhalt von index.html.
out('sw.js', `// Erzeugt von tools/build.mjs. Version ${version}
const C='cubos-welt-${version}';
const F=['./','index.html','three.min.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();if(r.ok&&new URL(e.request.url).origin===location.origin)caches.open(C).then(c=>c.put(e.request,cp));return r;})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
`);
console.log(`gebaut: index.html (${(Buffer.byteLength(app) / 1024).toFixed(0)} KB), App-Version ${version}`);
