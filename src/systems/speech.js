// Vorlesen: Hinweise, Fang und Aufgaben mit deutscher Stimme.
// Kuno kann noch nicht gut lesen, deshalb ist Vorlesen standardmäßig an.
//
// Zwei Wege:
// 1. Erzählerstimme (Piper, Stimme "Thorsten"): jeder bekannte Satz liegt fertig als voice/clips/<key>.mp3.
//    Die Dateien erzeugt eine GitHub Action aus voice/texts.json (siehe docs/REZEPTE.md, "Vorlese-Texte").
// 2. Gibt es nicht für jeden Satz eines Textes eine Datei (z. B. "Willkommen in Kunos Insel!"),
//    liest die Stimme des Geräts (Web Speech) den ganzen Text. So wechselt die Stimme nie mitten im Text.
// iOS spielt Ton erst nach einer ersten Berührung; die schaltet beides hier frei.
// Blatt-Modul ohne Spiel-Abhängigkeiten.
import { ac } from './audio-ctx.js';
import { splitSpeech, voiceKey } from './voice-split.js';

const KEY = 'cubos-vorlesen';
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}
let voice = null, lastText = '';

// ---------- Erzählerstimme (fertige Dateien) ----------
let clips = null;
// Als Datei geöffnet (file://, z. B. im Browser-Test) gibt es keine Sprachdateien.
const canFetch = typeof fetch === 'function' && typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
const manifest = canFetch
  ? fetch('voice/manifest.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((m) => { clips = new Set((m && m.clips) || []); }).catch(() => { clips = new Set(); })
  : Promise.resolve().then(() => { clips = new Set(); });
const buffers = new Map();
let playing = [], token = 0;

function decode(a, data) {
  return new Promise((res, rej) => { const p = a.decodeAudioData(data, res, rej); if (p && p.then) p.then(res, rej); });
}
function loadClip(a, key) {
  if (!buffers.has(key)) {
    const p = fetch('voice/clips/' + key + '.mp3').then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then((d) => decode(a, d));
    p.catch(() => buffers.delete(key));
    buffers.set(key, p);
  }
  return buffers.get(key);
}
function stopClips() { token++; for (const s of playing) { try { s.stop(); } catch (e) {} } playing = []; }

/** Spielt die Sätze nacheinander. false, wenn eine Datei fehlt (dann liest die Gerätestimme). */
async function playClips(keys, my) {
  const a = ac();
  if (!a) return false;
  let bufs;
  try { bufs = await Promise.all(keys.map((k) => loadClip(a, k))); } catch (e) { return false; }
  if (my !== token) return true;
  let t = a.currentTime + 0.05;
  for (const b of bufs) {
    const s = a.createBufferSource();
    s.buffer = b; s.connect(a.destination); s.start(t);
    s.onended = () => { playing = playing.filter((x) => x !== s); };
    playing.push(s);
    t += b.duration + 0.18;
  }
  return true;
}

// ---------- Gerätestimme (Web Speech) ----------
/** Beste deutsche Stimme: lokale Stimmen mit freundlichem Klang zuerst. */
function pickVoice() {
  if (!synth) return;
  const de = synth.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang));
  // Hochwertige Stimmen zuerst: auf dem iPad unter Einstellungen > Bedienungshilfen > Gesprochene Inhalte > Stimmen
  // lassen sich "Premium" oder "Erweitert" laden. Danach bekannte deutsche Namen, dann irgendeine deutsche Stimme.
  const good = de.filter((v) => /premium|erweitert|enhanced|neural|natural/i.test(v.name));
  const fav = ['Anna', 'Helena', 'Petra', 'Martin', 'Marlene', 'Vicki', 'Google Deutsch'];
  voice = fav.map((n) => good.find((v) => v.name.includes(n))).find(Boolean) || good[0]
    || fav.map((n) => de.find((v) => v.name.includes(n))).find(Boolean) || de.find((v) => v.localService) || de[0] || null;
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }

function speakDevice(text) {
  if (!synth) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = 0.9; u.pitch = 1;
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch (e) {}
}

// Erste Berührung schaltet Ton und Stimme auf iOS frei (leerer Satz, AudioContext wecken)
if (typeof window !== 'undefined') window.addEventListener('pointerdown', () => { ac(); if (synth) { try { synth.speak(new SpeechSynthesisUtterance('')); } catch (e) {} } }, { once: true, capture: true });

/** Liest text vor. Ein neuer Text unterbricht den alten. */
function speak(text, { force = false } = {}) {
  if (!text) return;
  lastText = text;
  if (!enabled && !force) return;
  stopClips();
  try { synth && synth.cancel(); } catch (e) {}
  const my = token, keys = splitSpeech(text).map(voiceKey);
  const go = async () => {
    if (my !== token) return;
    if (clips && clips.size && keys.every((k) => clips.has(k)) && await playClips(keys, my)) return;
    if (my === token) speakDevice(text);
  };
  if (clips) go(); else Promise.race([manifest, new Promise((r) => setTimeout(r, 1500))]).then(go);
}
/** Letzten Text noch einmal vorlesen (z. B. beim Antippen des Hinweises). */
const repeatSpeech = () => speak(lastText, { force: true });
function setSpeech(on) { enabled = !!on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (!on) { stopClips(); try { synth && synth.cancel(); } catch (e) {} } }
const speechOn = () => enabled;
const speechAvailable = () => !!synth || typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';

export { repeatSpeech, setSpeech, speak, speechAvailable, speechOn };
