"""Trilha (piano emocional) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/ouvir_pensamentos.mp4
"""
import json, os, subprocess, wave
import numpy as np

SR = 44100
tl = json.load(open("src/data/ultimo-timeline.json"))
L = tl["lines"]
TOTAL = tl["total"]
N = int((TOTAL + 0.5) * SR)
rng = np.random.default_rng(3)


def wstart(li, pat):
    for w in L[li]["words"]:
        if pat in w["text"].lower():
            return w["start"]
    return L[li]["start"]


def env(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def tone(f, d, a=0.005, r=0.6, harm=(1, 0.35, 0.12)):
    n = int(d * SR); t = np.arange(n) / SR
    s = sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm))
    return s * env(n, a, r)


def noise(d, a=0.002, r=0.1):
    n = int(d * SR)
    x = np.convolve(rng.standard_normal(n), np.ones(30) / 30, mode="same")
    return x * env(n, a, r)


def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * g


# ------------------------------------------------------------------ trilha: piano ambiente que muda com o tempo da história
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
def arps(a, b, chords, bpm, vel=1.0, pat=(0, 1, 2, 1, 2, 1, 0, 1), dec=1.4, oct_=12, bass=True):
    beat = 60 / bpm; t = a; k = 0
    while t < b - 0.3:
        ch = chords[(k // 8) % len(chords)]
        put(music, tone(NOTE(ch[pat[k % 8]] + oct_), 2.0, r=dec), t, 0.28 * vel)
        if bass and k % 8 == 0: put(music, tone(NOTE(ch[0] - 12), 4.0, a=0.02, r=2.2), t, 0.38 * vel)
        t += beat / 2; k += 1
SAD = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]     # Am F C G
WARM = [[48, 52, 55], [57, 60, 64], [53, 57, 60], [55, 59, 62]]    # C Am F G
DARK = [[57, 60, 64], [53, 56, 60], [52, 55, 59], [50, 53, 57]]
st = lambda li: L[li]["start"]
arps(0.0, st(6), DARK, 60, vel=0.8)
arps(st(7), st(20), SAD, 72, pat=(0, 2, 1, 2, 0, 2, 1, 2), dec=0.9)
arps(st(21), st(36), DARK, 64, vel=0.9)
arps(st(36) + 1.0, st(57), WARM, 70)
arps(st(58), st(64), SAD, 62)
arps(st(65), st(68), DARK, 54, vel=0.8)
arps(st(69), st(78), SAD, 60, vel=0.9)
arps(st(78), TOTAL, WARM, 58, vel=1.0, dec=2.0)
# pad suave de fundo o tempo todo
tt = np.arange(N) / SR
pad = 0.05 * (np.sin(2 * np.pi * NOTE(45) * tt) + 0.6 * np.sin(2 * np.pi * NOTE(52) * tt))
music += pad * (0.6 + 0.4 * np.sin(tt * 0.2))

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
for li in (6, 20, 28, 41, 47, 57, 68, 73):   # cartões de tempo: swoosh grave + sino
    put(sfx, noise(1.2, a=0.5, r=0.4), st(li) - 0.9, 0.7)
    put(sfx, tone(NOTE(45), 2.5, a=0.01, r=1.2, harm=(1, 0.5)), st(li) - 0.05, 0.8)
    put(sfx, tone(NOTE(81), 2.0, r=0.8), st(li), 0.35)
def birds(a, b, n):
    for i in range(n):
        t0 = a + rng.random() * (b - a)
        for k in range(3): put(sfx, tone(2400 + rng.random() * 1200, 0.07, r=0.03, harm=(1,)), t0 + k * 0.09, 0.25)
birds(st(52), st(57), 14); birds(st(58), st(68), 22); birds(st(69), st(73), 14)
for k in range(10):                                   # semáforo "clic"
    put(sfx, tone(1800, 0.03, r=0.01, harm=(1,)), st(9) + k * 0.75, 0.25)
put(sfx, noise(2.5, a=0.3, r=1.5), st(31), 0.5)        # água no túnel
put(sfx, tone(880, 0.25, r=0.15), WF := st(37) + 3.5, 0.0)
for k in range(8):                                    # rabo abanando / passinhos
    put(sfx, noise(0.05, r=0.02), st(36) + 0.3 + k * 0.3, 0.3)
put(sfx, tone(120, 1.8, "saw" if False else 1.8, r=1.0, harm=(1, 0.3)) if False else tone(120, 1.8, r=1.0, harm=(1, 0.3)), st(64), 0.6)  # silêncio pesado
for k in range(6):                                    # estática do rádio
    put(sfx, noise(0.6, a=0.05, r=0.4), st(46) + 1 + k * 1.2, 0.25)

# ------------------------------------------------------------------ níveis travados: trilha e efeitos a 50% (-6 dB) da voz
def read(path):
    with wave.open(path) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return a.reshape(-1, f.getnchannels()).mean(axis=1)


def grms(x, gate_db=-40):
    blk = SR // 10; n = len(x) // blk
    r = np.sqrt((x[: n * blk].reshape(n, blk) ** 2).mean(axis=1) + 1e-12)
    loud = r[20 * np.log10(r) > 20 * np.log10(r.max()) + gate_db]
    return float(np.sqrt((loud ** 2).mean()))


voice = read("public/audio/ultimo/narr.wav")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
vr = grms(voice)
music *= 0.5 * vr / grms(music)
sfx *= 0.5 * vr / grms(sfx)
cap = 0.7 * np.abs(voice).max()
if np.abs(sfx).max() > cap: sfx *= cap / np.abs(sfx).max()
db = lambda a: 20 * np.log10(grms(a) / vr)
print(f"trilha {db(music):+.1f} dB | efeitos {db(sfx):+.1f} dB | pico efeitos/voz {np.abs(sfx).max() / np.abs(voice).max():.2f}")
mix = voice + music + sfx
mix /= max(1.0, np.abs(mix).max() / 0.98)
with wave.open("public/audio/ultimo/mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "public/audio/ultimo/mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
gain = -14 - float(json.loads(m[m.rindex("{"): m.rindex("}") + 1])["input_i"])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/audio/ultimo/mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "public/audio/ultimo/mix.wav"], check=True)
print(f"ganho {gain:+.2f} dB -> mix.wav")
