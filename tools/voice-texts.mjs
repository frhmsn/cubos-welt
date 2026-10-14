// Sammelt alle Sätze, die das Spiel vorlesen kann, und schreibt sie nach voice/texts.json.
// Aus dieser Liste macht die GitHub Action "Erzählerstimme" (.github/workflows/voice.yml) die Sprachdateien.
//
//   node tools/voice-texts.mjs          Liste neu schreiben
//   node tools/voice-texts.mjs --check  nur prüfen, ob die Liste aktuell ist (Teil von npm run lint)
//
// Quellen:
// 1. Feste Texte in hint(...), speak(...) und stopFishing(...) überall in src (Teile mit Variablen fallen weg).
// 2. Texte aus den Inhaltsdateien: Aufgaben, Fische, Wale, Bildstile, so zusammengesetzt wie im Spiel.
// Sätze, die hier fehlen (z. B. mit Weltnamen), liest im Spiel die Stimme des Geräts.
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { splitSpeech } from '../src/systems/voice-split.js';
import { CHAPTERS } from '../src/content/quests/index.js';
import { FISH, FISH_LIST } from '../src/content/fish/index.js';
import { WHALE } from '../src/content/whales/index.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'voice/texts.json');
const CALLS = new Set(['hint', 'speak', 'stopFishing']);
const texts = new Set();
const add = (t) => { for (const s of splitSpeech(t)) texts.add(s); };
// Nur ganze Sätze aus festen Textteilen: Großbuchstabe am Anfang, Satzzeichen am Ende.
const whole = (s) => /^[A-ZÄÖÜ„]/.test(s) && /[.!?:]$/.test(s);

// ---------- 1. Feste Texte im Code ----------
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : p.endsWith('.js') ? [p] : [];
  });
}
for (const f of files(path.join(root, 'src'))) {
  const src = fs.readFileSync(f, 'utf8');
  if (!/\b(hint|speak|stopFishing)\(/.test(src)) continue;
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
  walk.simple(ast, {
    CallExpression(n) {
      if (n.callee.type !== 'Identifier' || !CALLS.has(n.callee.name) || !n.arguments[0]) return;
      walk.full(n.arguments[0], (m) => {
        const parts = m.type === 'Literal' && typeof m.value === 'string' ? [m.value]
          : m.type === 'TemplateLiteral' ? m.quasis.map((q) => q.value.cooked) : [];
        for (const p of parts) {
          for (const s of splitSpeech(p)) {
            if (whole(s)) texts.add(s);
            else if (process.env.VOICE_DEBUG) console.log('weg:', JSON.stringify(s));
          }
        }
      });
    },
  });
}

// ---------- 2. Inhalte ----------
add('Geschafft! Super! Du hast einen Stern bekommen. Nächste Aufgabe: Deine nächste Aufgabe: Toll!');
for (const c of CHAPTERS) {
  add(c.title);
  add(`Das Kapitel ${c.title} ist geschafft.`);
  if (c.bonus) add(`Du bekommst ${c.bonus.akk || c.bonus.text}!`);
  for (const t of c.tasks) { add(t.text); add(t.tip); }
}
for (const f of FISH_LIST) {
  const S = FISH[f.id];
  add(S.wow ? `Wow, ein ${S.label}!` : `Du hast ${S.art || 'einen'} ${S.label} gefangen!`);
  if (f.bigCatch) add(f.bigCatch.title);
  add(`${S.plural} gibt es ${S.where}.`);
  add(`${S.plural} leben eigentlich ${S.where}.`);
}
add('Neuer Rekord!');
add('Willkommen in der neuen Welt!');
for (let n = 20; n <= 60; n++) add(`Die Welt ist jetzt ${n} mal ${n} Felder groß!`);
for (const w of Object.values(WHALE)) { add(`Ein ${w.label}!`); add(`Ein ${w.label} direkt neben dir!`); }
const dream = fs.readFileSync(path.join(root, 'src/render/dream.js'), 'utf8');
for (const [, label] of dream.matchAll(/^\s+\w+:\s+\{ label: '([^']+)'/gm)) add('Stil ' + label);

// ---------- Schreiben oder prüfen ----------
const list = [...texts].sort((a, b) => a.localeCompare(b, 'de'));
const json = JSON.stringify(list, null, 1) + '\n';
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== json) {
    console.error('voice/texts.json ist nicht aktuell. Bitte "node tools/voice-texts.mjs" ausführen und mit committen.');
    process.exit(1);
  }
  console.log(`Vorlese-Texte aktuell (${list.length} Sätze).`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json);
  console.log(`voice/texts.json: ${list.length} Sätze.`);
}
