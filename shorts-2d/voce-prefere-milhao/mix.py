"""Trilha (game show + tensão + piano) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/voce_prefere_milhao.mp4
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
        put(music, tone(NOTE(ch[pat[k % 8]] + oct_), 1.2, r=dec), t, 0.3 * vel)
        if bass and k % 8 == 0: put(music, tone(NOTE(ch[0] - 12), 2.4, a=0.01, r=1.4), t, 0.38 * vel)
        if k % 2 == 0: put(music, noise(0.04, r=0.015), t, 0.12 * vel)
        t += beat / 2; k += 1
SHOW = [[60, 64, 67], [65, 69, 72], [55, 59, 62], [60, 64, 67]]   # C F G C (game show)
TENS = [[57, 60, 64], [56, 60, 63], [55, 58, 62], [56, 59, 62]]
WARM = [[53, 57, 60], [55, 59, 62], [57, 60, 64], [52, 55, 59]]
DET, FIM, ASK = L[13]["start"] - 0.25, L[15]["end"] + 0.3, L[16]["start"] - 0.2
arps(0.0, DET, SHOW, 124, pat=(0, 2, 1, 2, 0, 2, 1, 2), dec=0.22)
music *= np.clip((DET - np.arange(N) / SR) / 0.3, 0, 1)
arps(L[14]["start"] - 0.3, FIM, WARM, 66, vel=0.9, dec=1.1)
arps(ASK, TOTAL, SHOW, 124, vel=0.9, pat=(0, 2, 1, 2, 0, 2, 1, 2), dec=0.22)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
pop = lambda f=700: tone(f, 0.16, r=0.05, harm=(1, 0.3))
whoosh = lambda: noise(0.5, a=0.2, r=0.2)
ching = lambda: tone(NOTE(88), 0.5, r=0.25, harm=(1, 0.5, 0.3)) + tone(NOTE(95), 0.5, r=0.2, harm=(1, 0.4))
coin = lambda f=1800: tone(f, 0.12, r=0.05, harm=(1, 0.6))
for li in range(1, len(L)):
    put(sfx, whoosh(), L[li]["start"] - 0.35, 0.35)
put(sfx, ching(), wstart(2, "conta") - 0.05, 1.0)                                     # 1 milhão na conta
for k in range(12): put(sfx, coin(1500 + 300 * (k % 3)), L[2]["start"] + 0.9 + k * 0.17, 0.35)
for p in ("aparece", "primo", "sabia", "existia"): put(sfx, pop(620 + 60 * len(p)), wstart(3, p) - 0.1, 0.7)
put(sfx, tone(220, 0.4, r=0.2, harm=(1, 0.5)), wstart(4, "carro") - 0.05, 0.6)           # buzina
put(sfx, noise(0.9, a=0.3, r=0.4), wstart(4, "viagem") - 0.1, 0.4)                       # avião passando
for k in range(4): put(sfx, pop(900 + k * 100), wstart(4, "celular") - 0.05 + k * 0.08, 0.5)
put(sfx, ching(), wstart(5, "patrão") - 0.1, 0.5)
for k in range(14): put(sfx, coin(2200 - k * 90), L[6]["start"] + 0.6 + k * 0.22, 0.35)  # dinheiro escorrendo
put(sfx, tone(330, 0.5, r=0.3, harm=(1, 0.4)), wstart(6, "nada") - 0.05, 0.6); put(sfx, tone(262, 0.9, r=0.5, harm=(1, 0.4)), wstart(6, "nada") + 0.3, 0.6)
for k in range(8): put(sfx, coin(1200 + k * 150), wstart(7, "investir") + k * 0.2, 0.4)  # árvore de moedas
for k in range(6): put(sfx, noise(0.12, a=0.01, r=0.05), L[8]["start"] + 1.1 + k * 0.45, 0.5)  # páginas do calendário
put(sfx, tone(NOTE(84), 1.0, r=0.5), wstart(8, "fim") - 0.1, 0.4)
put(sfx, tone(110, 0.4, r=0.15, harm=(1, 0.5)), wstart(9, "mansão") - 0.08, 0.9)           # X
put(sfx, tone(NOTE(79), 0.4, r=0.2) + tone(NOTE(84), 0.4, r=0.2) * 0, wstart(10, "medo") - 0.05, 0.6)
for k in range(30): put(sfx, tone(2600, 0.02, r=0.008, harm=(1,)), L[11]["start"] + 0.2 + k * 0.1, 0.25)  # contador subindo
put(sfx, ching(), wstart(11, "milhão") - 0.05, 0.8)
for k in range(28): put(sfx, tone(2600, 0.02, r=0.008, harm=(1,)), L[12]["start"] + 0.1 + k * 0.1, 0.25)
put(sfx, ching(), wstart(12, "quatro") + 0.4, 0.8)
put(sfx, tone(NOTE(36), 1.8, r=1.0, harm=(1, 0.5)) + noise(0.6, a=0.01, r=0.3) * 0.3, L[13]["start"] - 0.05, 1.0)  # "detalhe"
put(sfx, tone(90, 0.5, r=0.2, harm=(1, 0.5)), wstart(14, "para") - 0.08, 0.9)              # carimbo
for k in range(3): put(sfx, tone(NOTE(84 + k * 4), 0.8, r=0.4), wstart(15, "ama") + k * 0.12, 0.4)
put(sfx, pop(800), wstart(17, "a") - 0.05, 0.7); put(sfx, pop(1000), wstart(17, "b") - 0.05, 0.7)
put(sfx, pop(900), L[18]["start"] - 0.05, 0.8)

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
                    "-movflags", "+faststart", "/home/user/ouvir_pensamentos.mp4"], check=True)
    print("video -> /home/user/ouvir_pensamentos.mp4")
