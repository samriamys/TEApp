#!/usr/bin/env python3
"""Generate a small, replaceable Spanish demo pack using installed libespeak-ng."""
import ctypes
import html
import json
from pathlib import Path
import wave

ROOT = Path(__file__).resolve().parents[1] / 'src' / 'assets' / 'local-content'
ROOT.mkdir(parents=True, exist_ok=True)
# These are demonstration materials, not the project's curated lesson content.
WORDS = {
    'a': [('a', 'A'), ('ala', '🪽'), ('abeja', '🐝'), ('casa', '🏠'), ('gato', '🐈'), ('manzana', '🍎')],
    'e': [('e', 'E'), ('estrella', '⭐'), ('elefante', '🐘'), ('mesa', '🪑'), ('leche', '🥛'), ('tren', '🚂')],
    'i': [('i', 'I'), ('isla', '🏝'), ('imán', '🧲'), ('libro', '📚'), ('pirata', '🏴‍☠'), ('camisa', '👕')],
    'o': [('o', 'O'), ('oso', '🐻'), ('ojo', '👁'), ('sol', '☀'), ('lobo', '🐺'), ('globo', '🎈')],
    'u': [('u', 'U'), ('uva', '🍇'), ('uña', '💅'), ('luna', '🌙'), ('nube', '☁'), ('unicornio', '🦄')],
}

lib = ctypes.CDLL('libespeak-ng.so.1')
lib.espeak_Initialize.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
lib.espeak_Initialize.restype = ctypes.c_int
lib.espeak_SetVoiceByName.argtypes = [ctypes.c_char_p]
lib.espeak_SetVoiceByName.restype = ctypes.c_int
CALLBACK = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
lib.espeak_SetSynthCallback.argtypes = [CALLBACK]
lib.espeak_Synth.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint, ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]
lib.espeak_Synth.restype = ctypes.c_int
lib.espeak_Synchronize.restype = ctypes.c_int
rate = lib.espeak_Initialize(1, 0, None, 0)  # Retrieval mode: PCM is passed to callback.
if rate <= 0 or lib.espeak_SetVoiceByName(b'es') != 0:
    raise RuntimeError('Spanish eSpeak NG voice is unavailable')
chunks = []
@CALLBACK
def collect(samples, count, _events):
    if samples and count:
        chunks.append(ctypes.string_at(samples, count * ctypes.sizeof(ctypes.c_short)))
    return 0
lib.espeak_SetSynthCallback(collect)

records = []
for letter, words in WORDS.items():
    for index, (word, symbol) in enumerate(words):
        # The Android SQLite plugin treats -1 as an insertion failure sentinel.
        record_id = -(len(records) + 1001)  # Reserved for bundled demo; server IDs are positive.
        stem = f'{letter}-{index}'
        image_path = ROOT / f'{stem}.svg'
        audio_path = ROOT / f'{stem}.wav'
        # Emoji provide simple visual prompts; the standalone letters show the letter itself.
        image_path.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280"><rect width="320" height="280" rx="32" fill="#f7f9fc"/><text x="160" y="155" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="150" fill="#426ad1">{html.escape(symbol)}</text></svg>\n''', encoding='utf-8')
        chunks.clear()
        data = ctypes.create_string_buffer(word.encode('utf-8') + b'\0')
        if lib.espeak_Synth(data, len(data), 0, 1, 0, 1, None, None) != 0 or lib.espeak_Synchronize() != 0:
            raise RuntimeError(f'Could not synthesize {word}')
        with wave.open(str(audio_path), 'wb') as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(rate)
            output.writeframes(b''.join(chunks))
        records.append({'id': record_id, 'texto': word, 'vocal': letter, 'dificultad': 1 if index < 3 else 2 if index < 5 else 3,
                        'imagen': f'assets/local-content/{stem}.svg', 'audio': f'assets/local-content/{stem}.wav'})
(ROOT / 'words.json').write_text(json.dumps({'version': 1, 'words': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
lib.espeak_Terminate()
print(f'Generated {len(records)} demonstration entries in {ROOT}')
