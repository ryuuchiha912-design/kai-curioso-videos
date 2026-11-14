"""Trilha (piano emocional) + efeitos — "No dia em que todos os pais viraram crianças" + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/pais_criancas.mp4
"""
import json, os, subprocess, wave
import numpy as np

SR = 44100
tl = json.load(open("timeline.json"))
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


# ------------------------------------------------------------------ trilha por trecho
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
def arps(a, b, chords, bpm, vel=1.0, pat=(0, 1, 2, 1, 2, 1, 0, 1), dec=0.9, oct_=12, bass=True):
    beat = 60 / bpm; t = a; k = 0
    while t < b - 0.3:
        ch = chords[(k // 8) % len(chords)]
        put(music, tone(NOTE(ch[pat[k % 8]] + oct_), 1.4, r=dec), t, 0.3 * vel)
        if bass and k % 8 == 0: put(music, tone(NOTE(ch[0] - 12), 3.0, a=0.01, r=1.6), t, 0.38 * vel)
        t += beat / 2; k += 1
PLAY = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]   # C F G C (leve, brincalhão)
WARM = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]   # C G Am F
SAD = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]    # Am F C G
HOPE = [[53, 57, 60], [55, 59, 62], [60, 64, 67], [57, 60, 64]]   # F G C Am
L_ = lambda i: L[i]["start"]
arps(0.0, L_(7) - 0.3, PLAY, 96, vel=0.85, pat=(0, 2, 1, 2, 0, 2, 1, 2), dec=0.4)
arps(L_(7) - 0.2, L_(11) - 0.3, WARM, 68, dec=1.0)
arps(L_(11) - 0.2, L_(15) - 0.4, SAD, 56, vel=0.9, dec=1.3)
put(music, tone(NOTE(48), 3.0, r=2.0, harm=(1, 0.5)), wstart(15, "vou") - 0.05, 0.5)
arps(L_(15) + 0.6, L_(17) - 0.3, SAD, 56, vel=0.75, dec=1.3)
arps(L_(17) - 0.2, TOTAL, HOPE, 64, vel=1.05, dec=1.2)
pad_t = np.arange(N) / SR
pad = 0.07 * (np.sin(2 * np.pi * NOTE(60) * pad_t) + np.sin(2 * np.pi * NOTE(64) * pad_t) + np.sin(2 * np.pi * NOTE(67) * pad_t))
music += pad * np.clip((pad_t - L_(19)) / 1.5, 0, 1)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
pop = lambda f=700: tone(f, 0.16, r=0.05, harm=(1, 0.3))
whoosh = lambda: noise(0.5, a=0.2, r=0.2)
bell = lambda: tone(NOTE(84), 1.2, r=0.5, harm=(1, 0.5, 0.25)) + tone(NOTE(91), 1.2, r=0.35, harm=(1,))
crash = lambda: noise(0.5, a=0.002, r=0.15)
thud = lambda: tone(90, 0.35, r=0.12, harm=(1, 0.5))
click = lambda: noise(0.04, a=0.001, r=0.01)
for li in range(1, len(L)): put(sfx, whoosh(), L_(li) - 0.35, 0.25)
put(sfx, bell(), wstart(0, "viraram") - 0.1, 0.6)
put(sfx, crash(), wstart(1, "barulho") + 0.25, 1.0)
put(sfx, pop(900), wstart(1, "seis") - 0.1, 0.6); put(sfx, pop(900), wstart(2, "sete") - 0.1, 0.6)
put(sfx, pop(600), wstart(3, "castigo") + 0.2, 0.7); put(sfx, pop(600), wstart(3, "quarto") - 0.05, 0.7)
for k in range(5): put(sfx, pop(700 + k * 120), L_(5) + 0.4 + k * 0.25, 0.4)
put(sfx, bell(), wstart(5, "dez") - 0.1, 0.5)
put(sfx, noise(2.2, a=0.3, r=1.2), wstart(6, "queimei") - 0.1, 0.35); put(sfx, pop(500), wstart(6, "duas") - 0.1, 0.7)
put(sfx, pop(700), wstart(7, "mentiu") - 0.1, 0.5)
put(sfx, click(), L_(9) + 0.05, 1.0)
put(sfx, thud(), wstart(10, "caiu") + 0.25, 1.0)
for p in ("louça", "roupa", "escola"): put(sfx, pop(800), wstart(11, p) - 0.1, 0.6)
for k in range(4): put(sfx, noise(0.6, a=0.25, r=0.25), L_(12) + 0.3 + k * 0.5, 0.3)
put(sfx, bell(), wstart(12, "dezesseis") - 0.1, 0.7)
put(sfx, bell(), wstart(15, "primeira") - 0.1, 0.5)
put(sfx, click(), wstart(16, "luz") - 0.15, 1.0)
for k in range(3): put(sfx, tone(NOTE(84 + k * 4), 0.8, r=0.4), wstart(19, "abracei") + k * 0.12, 0.4)
put(sfx, click(), L_(21) + 0.2, 1.0)
put(sfx, pop(800), L_(22) - 0.05, 0.7)

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


voice = read("narr_full.wav")
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
with wave.open("mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
gain = -14 - float(json.loads(m[m.rindex("{"): m.rindex("}") + 1])["input_i"])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "mix.wav"], check=True)
print(f"ganho {gain:+.2f} dB -> mix.wav")
if os.path.isdir("frames") and len(os.listdir("frames")) > 10:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%04d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", "/home/user/pais_criancas.mp4"], check=True)
    print("video -> /home/user/pais_criancas.mp4")
