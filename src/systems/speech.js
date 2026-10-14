// Vorlesen: Hinweise, Fang und Aufgaben mit deutscher Stimme (Web Speech API des Browsers).
// Kuno kann noch nicht gut lesen, deshalb ist Vorlesen standardmäßig an.
// iOS spricht erst nach einer ersten Berührung; die schaltet die Stimme hier frei.
// Blatt-Modul ohne Spiel-Abhängigkeiten.

const KEY = 'cubos-vorlesen';
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}
let voice = null, lastText = '';

/** Beste deutsche Stimme: lokale Stimmen mit freundlichem Klang zuerst. */
function pickVoice() {
  if (!synth) return;
  const de = synth.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang));
  const fav = ['Anna', 'Petra', 'Helena', 'Marlene', 'Vicki', 'Google Deutsch'];
  voice = fav.map((n) => de.find((v) => v.name.includes(n))).find(Boolean) || de.find((v) => v.localService) || de[0] || null;
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice); }

// Erste Berührung schaltet die Stimme auf iOS frei (leerer Satz)
if (typeof window !== 'undefined') window.addEventListener('pointerdown', () => { if (synth) { try { synth.speak(new SpeechSynthesisUtterance('')); } catch (e) {} } }, { once: true, capture: true });

/** Liest text vor. Ein neuer Text unterbricht den alten. */
function speak(text, { force = false } = {}) {
  if (!text) return;
  lastText = text;
  if (!synth || (!enabled && !force)) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = 0.95; u.pitch = 1.1;
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch (e) {}
}
/** Letzten Text noch einmal vorlesen (z. B. beim Antippen des Hinweises). */
const repeatSpeech = () => speak(lastText, { force: true });
function setSpeech(on) { enabled = !!on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (!on && synth) synth.cancel(); }
const speechOn = () => enabled;
const speechAvailable = () => !!synth;

export { repeatSpeech, setSpeech, speak, speechAvailable, speechOn };
