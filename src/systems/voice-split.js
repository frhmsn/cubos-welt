// Vorlese-Texte in Sätze teilen und jedem Satz einen festen Dateinamen geben.
// Wird im Spiel (speech.js) und beim Erzeugen der Sprachdateien (tools/voice-texts.mjs) benutzt,
// deshalb ohne Abhängigkeiten und ohne Browser.

/** Teilt einen Text an Satzenden (. ! ? :) in einzelne Sätze. */
function splitSpeech(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?:])\s+/).map((s) => s.trim()).filter(Boolean);
}

/** Fester Name für einen Satz (FNV-1a, 8 Hex-Zeichen). Gleicher Satz, gleiche Datei. */
function voiceKey(sentence) {
  let h = 0x811c9dc5;
  for (const ch of sentence) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export { splitSpeech, voiceKey };
