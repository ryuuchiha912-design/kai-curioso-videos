"""Som da flauta mágica do short 2: motivo ORIGINAL de 3 notas (Mi5, Sol5, Dó6, um arpejo maior subindo),
timbre de ocarina sintetizado (seno + 2o/3o harmônico fraco + sopro + vibrato).
NÃO é melodia de nenhum jogo. Saída: public/audio/ocarina/flauta.wav
GAP deve bater com NOTE_GAP (frames) em src/short2/timeline.ts."""
import numpy as np, wave, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
GAP = 8 / 30                      # uma nota a cada 8 frames
NOTES = [659.25, 783.99, 1046.50]  # E5 G5 C6
DURS = [0.38, 0.38, 1.1]
rng = np.random.default_rng(7)
total = GAP * 2 + DURS[-1] + 0.4
out = np.zeros(int(total * SR))
for i, (f0, d) in enumerate(zip(NOTES, DURS)):
    n = int(d * SR); t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
    tone = np.sin(ph) + 0.12 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = rng.standard_normal(n) * 0.04
    breath = np.convolve(breath, np.ones(30) / 30, mode="same") * 6
    env = np.minimum(1, t / 0.035) * np.exp(-np.maximum(0, t - d * 0.55) * 7)
    note = (tone + breath) * env
    s = int(i * GAP * SR); out[s:s + n] += note
# pequena reverberação (ecos)
for dly, g in [(0.09, 0.3), (0.17, 0.2), (0.29, 0.12)]:
    k = int(dly * SR); out[k:] += out[:-k] * g
out = out / np.abs(out).max() * 0.6
p = ROOT / "public/audio/ocarina/flauta.wav"
with wave.open(str(p), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", p, round(total, 2), "s")
