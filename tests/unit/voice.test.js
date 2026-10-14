// Vorlese-Texte: Sätze teilen und Dateinamen. Die Python-Seite (tools/voice_build.py) rechnet denselben Namen.
import { describe, it, expect } from 'vitest';
import { splitSpeech, voiceKey } from '../../src/systems/voice-split.js';

describe('Vorlesen', () => {
  it('teilt an Satzenden und Doppelpunkten', () => {
    expect(splitSpeech('Super! Du hast einen Stern bekommen. Nächste Aufgabe: Bau ein Haus.'))
      .toEqual(['Super!', 'Du hast einen Stern bekommen.', 'Nächste Aufgabe:', 'Bau ein Haus.']);
    expect(splitSpeech('  Brumm!  ')).toEqual(['Brumm!']);
    expect(splitSpeech('')).toEqual([]);
  });
  it('gibt jedem Satz einen festen Namen', () => {
    // Werte aus tools/voice_build.py, damit beide Seiten gleich bleiben
    expect(voiceKey('Wow, ein Hai!')).toBe('65e9c9e9');
    expect(voiceKey('Größer geht es nicht.')).toBe('4489be5c');
    expect(voiceKey('Mal ein Meer mit dem Feld „Meer".')).toBe('12c9bfa8');
  });
});
