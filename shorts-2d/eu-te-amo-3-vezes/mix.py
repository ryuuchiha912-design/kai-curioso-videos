"""Trilha (piano emocional) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/eu_te_amo_3_vezes.mp4
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


# ------------------------------------------------------------------ piano em arpejo (Lá menor → Fá → Dó → Sol), muda de clima por trecho
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
prog_min = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
prog_warm = [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
music = np.zeros(N)


def arps(a, b, chords, bpm, vel=1.0, bass=True):
    beat = 60 / bpm; t = a; k = 0
    while t < b - 0.3:
        ch = chords[(k // 8) % len(chords)]
        pat = [0, 1, 2, 1, 2, 1, 0, 1]
        m = ch[pat[k % 8]] + 12
        put(music, tone(NOTE(m), 1.6, r=0.9), t, 0.32 * vel)
        if bass and k % 8 == 0:
            put(music, tone(NOTE(ch[0] - 12), 3.2, a=0.01, r=1.8), t, 0.4 * vel)
        t += beat / 2; k += 1


ZERO = L[16]["start"] - 0.3                       # "O número era zero." — a música para
FLASH = L[19]["start"] - 0.4                      # flashbacks
AMO = wstart(25, "amo")
arps(0.0, ZERO, prog_min, 70)
music *= np.clip((ZERO - np.arange(N) / SR) / 0.6, 0, 1)  # some antes do zero
arps(FLASH, AMO - 0.2, prog_min, 62, vel=0.8)
arps(AMO - 0.05, TOTAL, prog_warm, 66, vel=1.15)
# pad suave em toda a parte final
pad_t = np.arange(N) / SR
pad = 0.08 * (np.sin(2 * np.pi * NOTE(60) * pad_t) + np.sin(2 * np.pi * NOTE(64) * pad_t) + np.sin(2 * np.pi * NOTE(67) * pad_t))
pad *= np.clip((pad_t - AMO) / 1.5, 0, 1)
music += pad

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
bell = lambda: tone(NOTE(84), 1.2, r=0.5, harm=(1, 0.5, 0.25)) + tone(NOTE(91), 1.2, r=0.35, harm=(1,))
plims = [wstart(2, "diminui"), wstart(19, "dormindo") - 1.2, wstart(20, "eu") - 0.8, wstart(21, "quarto") + 0.4, AMO]
for p in plims:
    put(sfx, bell(), p, 0.8)
for s in (L[19]["start"] - 0.1, L[20]["start"] - 0.1, L[21]["start"] - 0.1):
    put(sfx, noise(0.6, a=0.25, r=0.25), s - 0.3, 0.5)  # sopro de flashback
# batimento depois do "zero"
for k in range(4):
    tt = L[16]["start"] + 0.2 + k * 0.85
    put(sfx, tone(55, 0.18, r=0.08, harm=(1,)), tt, 1.0); put(sfx, tone(50, 0.15, r=0.07, harm=(1,)), tt + 0.22, 0.8)
# bip do monitor no hospital
for li in (15, 24):
    t0, t1 = L[li]["start"] - 0.1, (L[li + 1]["start"] if li + 1 < len(L) else TOTAL) - 0.2
    tt = t0
    while tt < t1:
        put(sfx, tone(1000, 0.12, r=0.06, harm=(1,)), tt, 0.25); tt += 0.83
# telefone tocando (mãe liga)
for k in range(3):
    put(sfx, tone(880, 0.35, r=0.3, harm=(1, 0.3)), L[14]["start"] + k * 0.5, 0.35)
# "pop" dos títulos e bordão
for li in (3, 7, 10, 22, 23):
    put(sfx, tone(600, 0.15, r=0.05), L[li]["start"] + 0.1, 0.5)


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
                    "-movflags", "+faststart", "/home/user/eu_te_amo_3_vezes.mp4"], check=True)
    print("video -> /home/user/eu_te_amo_3_vezes.mp4")
