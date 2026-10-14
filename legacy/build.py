"""Baut aus kunos-welt.html eine eigenständige Web-App für den Home-Bildschirm."""
import os, shutil, json, zipfile
from PIL import Image, ImageDraw

SRC = '/home/claude/kunos-welt.html'
OUT = '/home/claude/kunos-welt-web'
THREE = '/tmp/claude-0/smoke/node_modules/three/build/three.min.js'
VERSION = 'v12'

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

src = open(SRC, encoding='utf-8').read()
src = src.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js')
cut = src.index('</style>') + len('</style>')
head_part, body_part = src[:cut], src[cut:]

html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Cubos Welt">
<meta name="theme-color" content="#8FD3FF">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">
{head_part}
</head>
<body>
{body_part}
<script>
if('serviceWorker' in navigator){{addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{{}}));}}
</script>
</body>
</html>
'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
shutil.copy(THREE, os.path.join(OUT, 'three.min.js'))

manifest = {
    "name": "Cubos Welten entdecken", "short_name": "Cubos Welt", "lang": "de",
    "start_url": "./", "scope": "./", "display": "fullscreen", "orientation": "any",
    "background_color": "#8FD3FF", "theme_color": "#8FD3FF",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
    ]
}
open(os.path.join(OUT, 'manifest.webmanifest'), 'w').write(json.dumps(manifest, indent=2, ensure_ascii=False))

sw = f"""const C='kunos-welt-{VERSION}';
const F=['./','index.html','three.min.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();}});
self.addEventListener('fetch',e=>{{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{{const cp=r.clone();if(r.ok&&new URL(e.request.url).origin===location.origin)caches.open(C).then(c=>c.put(e.request,cp));return r;}})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
}});
"""
open(os.path.join(OUT, 'sw.js'), 'w').write(sw)

# App-Symbol: Himmel, Hügel, Haus, Gleis
def icon(size):
    S = 1024
    im = Image.new('RGB', (S, S), '#8FD3FF')
    d = ImageDraw.Draw(im)
    for y in range(S):
        t = y / S
        d.line([(0, y), (S, y)], fill=(int(143 - 40 * t), int(211 - 30 * t), 255))
    d.ellipse([700, 110, 900, 310], fill='#FFC21A')
    d.ellipse([-300, 560, 1324, 1500], fill='#6BBA47')
    d.rectangle([0, 820, S, S], fill='#5DA83E')
    # Gleis
    d.rectangle([0, 870, S, 900], fill='#A0937F')
    for x in range(10, S, 70):
        d.rectangle([x, 862, x + 34, 908], fill='#6B4F32')
    d.rectangle([0, 868, S, 878], fill='#8A9096')
    d.rectangle([0, 892, S, 902], fill='#8A9096')
    # Haus
    d.rectangle([300, 470, 640, 780], fill='#FFF1B8')
    d.polygon([(250, 490), (470, 290), (690, 490)], fill='#D7261E')
    d.rectangle([430, 620, 520, 780], fill='#8E5A30')
    d.rectangle([330, 540, 410, 610], fill='#8CC4E8')
    d.rectangle([550, 540, 620, 610], fill='#8CC4E8')
    d.rectangle([560, 330, 610, 420], fill='#9C4A3A')
    # Baum
    d.rectangle([780, 640, 815, 790], fill='#7A5232')
    d.ellipse([700, 500, 900, 690], fill='#3E9B4F')
    return im.resize((size, size), Image.LANCZOS)

for n in (180, 192, 512):
    icon(n).save(os.path.join(OUT, f'icon-{n}.png'))

readme = """CUBOS WELTEN ENTDECKEN als App auf dem iPad (Vollbild)

So kommt das Spiel auf den Home-Bildschirm:

1. Kostenloses Konto auf github.com anlegen (falls noch keins da ist).
2. Neues Repository anlegen, z. B. "cubos-welt", Sichtbarkeit "Public".
3. Im Repository auf "Add file" > "Upload files" tippen und ALLE Dateien
   aus diesem Ordner hochladen (index.html, three.min.js, sw.js,
   manifest.webmanifest und die drei icon-Bilder). "Commit changes".
4. Settings > Pages: bei "Branch" "main" und "/ (root)" wählen, Save.
   Nach ein bis zwei Minuten steht dort die Adresse,
   z. B. https://DEIN-NAME.github.io/cubos-welt/
5. Diese Adresse auf dem iPad in Safari öffnen.
6. Teilen-Knopf > "Zum Home-Bildschirm" > "Hinzufügen".
7. Ab jetzt immer über das neue Symbol starten. Dann läuft das Spiel randlos
   ohne Browserleiste.

Welten mitnehmen:
- Menü (drei Punkte) > "Alle Welten kopieren". Der Code enthält alle Welten,
  das Fangbuch und damit auch die Fische fürs Aquarium.
- Auf dem anderen Gerät: Menü > "Code einfügen", Code einfügen, "Laden".
- Welten, die schon da sind, werden nicht doppelt gespeichert.

Wichtig: Die App speichert ihre Welten auf dem iPad selbst. Safari und das
Home-Bildschirm-Symbol haben getrennte Speicher. Also immer übers Symbol
spielen. Lieblingswelten ab und zu als Welt-Code sichern.
"""
open(os.path.join(OUT, 'LIESMICH.txt'), 'w', encoding='utf-8').write(readme)

zp = '/home/claude/kunos-welt-web.zip'
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(os.listdir(OUT)):
        z.write(os.path.join(OUT, f), arcname='kunos-welt/' + f)
print('built', OUT, os.path.getsize(zp), 'bytes')
