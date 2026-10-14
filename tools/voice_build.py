"""Erzeugt die Sprachdateien für die Erzählerstimme aus voice/texts.json.

Läuft in der GitHub Action "Erzählerstimme" (.github/workflows/voice.yml), weil die Stimme
(Piper, de_DE-thorsten-high) von Hugging Face geladen wird. Lokal geht es genauso:

    pip install piper-tts==1.8.0
    python -m piper.download_voices --data-dir ~/.piper de_DE-thorsten-high
    python tools/voice_build.py ~/.piper/de_DE-thorsten-high.onnx

Erzeugt nur fehlende Dateien. Dateien zu Sätzen, die es nicht mehr gibt, werden gelöscht.
Wer Stimme oder Tempo ändert, löscht voice/clips/ ganz, dann wird alles neu gesprochen.
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTS = os.path.join(ROOT, 'voice', 'texts.json')
CLIPS = os.path.join(ROOT, 'voice', 'clips')
MANIFEST = os.path.join(ROOT, 'voice', 'manifest.json')

# Etwas langsamer als normal (1.0), damit ein Kind gut folgen kann. Höher = langsamer.
LENGTH_SCALE = 1.15
# Etwas mehr Ausdruck in der Stimme (Standard 0.667).
NOISE_SCALE = 0.7


def voice_key(sentence):
    """Wie voiceKey() in src/systems/voice-split.js (FNV-1a über Unicode-Zeichen)."""
    h = 0x811C9DC5
    for ch in sentence:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return '%08x' % h


def main():
    model = sys.argv[1]
    voice = PiperVoice.load(model)
    cfg = SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=NOISE_SCALE, normalize_audio=True)
    texts = json.load(open(TEXTS, encoding='utf-8'))
    os.makedirs(CLIPS, exist_ok=True)
    keys = {}
    for s in texts:
        k = voice_key(s)
        if k in keys and keys[k] != s:
            sys.exit('Gleicher Dateiname für zwei Sätze: %r und %r' % (keys[k], s))
        keys[k] = s
    made = 0
    with tempfile.TemporaryDirectory() as tmp:
        for k, s in keys.items():
            out = os.path.join(CLIPS, k + '.mp3')
            if os.path.exists(out):
                continue
            wav = os.path.join(tmp, k + '.wav')
            with wave.open(wav, 'wb') as w:
                voice.synthesize_wav(s, w, syn_config=cfg)
            # Mono-MP3 mit 48 kbit/s: klein genug für viele Sätze, klar genug für Sprache.
            # Kurze Stille am Anfang abschneiden, am Ende 0,05 s Luft lassen.
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav,
                            '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,apad=pad_dur=0.05',
                            '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '48k', out], check=True)
            made += 1
            print('neu', k, s)
    removed = 0
    for f in os.listdir(CLIPS):
        if f.endswith('.mp3') and f[:-4] not in keys:
            os.remove(os.path.join(CLIPS, f))
            removed += 1
    with open(MANIFEST, 'w', encoding='utf-8') as m:
        json.dump({'voice': os.path.basename(model).replace('.onnx', ''), 'clips': sorted(keys)}, m, indent=0)
        m.write('\n')
    print('%d neu, %d gelöscht, %d Sätze insgesamt' % (made, removed, len(keys)))


if __name__ == '__main__':
    main()
