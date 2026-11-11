"""Trilha + efeitos do short dos pombos (canal do Nico). Trilha/efeitos a -6 dB da voz, ~-14 LUFS."""
import json
import subprocess
import wave

import numpy as np

SR = 44100
tl = json.load(open("src/data/pombo-timeline.json"))
SUF = ""
_W = [w["start"] for l in tl["lines"] for w in l["words"]]
# os efeitos usam os índices de palavra do roteiro em português; em outro idioma, traduz pelo mapa
_MAP = {int(k): v for k, v in json.load(open(f"src/data/aviao{SUF}-map.json")).items()} if SUF else {}
class _Words:
    def __getitem__(self, i): return _W[_MAP.get(i, i)] if SUF else _W[i]
W = _Words()
LS = [l["start"] for l in tl["lines"]]
TOTAL = tl["total"]
N = int(TOTAL * SR) + SR // 2
rng = np.random.default_rng(7)


def read_wav(path):
    with wave.open(path) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return a.reshape(-1, f.getnchannels()).mean(axis=1)


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def tone(f, dur, wave_="sine", a=0.005, r=0.2, glide=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = f * (1 + glide * t / dur)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) if wave_ == "sine" else (2 * ((ph / (2 * np.pi)) % 1) - 1) if wave_ == "saw" else np.sign(np.sin(ph))
    return s * env(n, a, r)


def noise(dur, a=0.002, r=0.1, lp=0.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    if lp > 0:  # passa-baixa de 1 polo
        y = np.zeros(n); k = lp
        for i in range(1, n):
            y[i] = y[i - 1] + k * (x[i] - y[i - 1])
        x = y / (np.abs(y).max() + 1e-9)
    return x * env(n, a, r)


def mx(*sigs):
    """Soma sinais de durações diferentes."""
    n = max(len(x) for x in sigs)
    out = np.zeros(n)
    for x in sigs:
        out[: len(x)] += x
    return out


def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g


# ------------------------------------------------------------------ música: marchinha militar engraçada (fagote + caixa)
music = np.zeros(N)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
T44 = LS[7] - 0.15      # "cancelado": a música murcha
T48 = LS[8] - 0.1       # volta a marcha
bpm = 112; beat = 60 / bpm
mel = [55, 59, 62, 59, 57, 60, 64, 60, 55, 59, 62, 67, 66, 62, 57, 50]
bass = [43, 43, 50, 50, 45, 45, 50, 50]
def march(a, b, vel=1.0):
    t = a; k = 0
    while t < b - 0.2:
        put(music, mx(tone(NOTE(mel[k % 16]), beat * 0.45, "saw", r=0.12) * 0.6, tone(NOTE(mel[k % 16]) * 2, beat * 0.3, r=0.06) * 0.3), t, 0.28 * vel)
        if k % 2 == 0: put(music, tone(NOTE(bass[(k // 2) % 8]), beat * 0.9, r=0.2), t, 0.5 * vel)
        put(music, noise(0.07, r=0.03), t + (beat / 4 if k % 2 else 0), 0.22 * vel)
        if k % 4 == 3: [put(music, noise(0.04, r=0.015), t + beat * 0.5 + j * beat / 8, 0.18 * vel) for j in range(3)]
        t += beat / 2; k += 1
march(0.0, T44)
put(music, mx(tone(NOTE(55), 0.5, "saw", r=0.3), tone(NOTE(54), 0.5, "saw", r=0.3)), T44 + 0.05, 0.3)
put(music, tone(NOTE(53), 1.4, "saw", r=0.8, glide=-0.08), T44 + 0.6, 0.3)  # "uóóó" triste
march(T48, TOTAL, 0.9)
i1 = int((TOTAL - 0.4) * SR); music[i1:] *= np.linspace(1, 0, len(music) - i1)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
whoosh = lambda d=0.35: noise(d, a=0.15, r=0.12, lp=0.08)
popf = lambda: tone(500, 0.12, r=0.04, glide=1.5)
ting = lambda f=1760: mx(tone(f, 0.6, r=0.25), tone(f * 1.5, 0.6, r=0.15) * 0.4)
coo = lambda: mx(tone(420, 0.25, r=0.12, glide=-0.3), tone(380, 0.3, r=0.15, glide=-0.2) * 0.6)  # "pruu"
peck = lambda: mx(noise(0.02, r=0.006), tone(1800, 0.02, r=0.006))
for i in (12, 13, 28, 37, 51, 60, 69, 74, 86, 99, 114):
    put(sfx, whoosh(), W[i] - 0.3, 0.35)
put(sfx, noise(5.0, a=0.5, r=99, lp=0.03), 0.0, 0.35)                    # vento da bomba
put(sfx, coo(), W[8] - 0.05, 0.9)
put(sfx, tone(220, 0.3, r=0.1), W[12] - 0.05, 0.4)                        # "sério" (bum seco)
for k in range(10): put(sfx, peck(), W[20] + k * 0.3, 0.8)                # bicadas
put(sfx, popf(), W[22] - 0.1, 0.7)
put(sfx, tone(600, 0.3, r=0.15, glide=-0.4), W[34] - 0.05, 0.5); put(sfx, tone(400, 0.3, r=0.15, glide=0.6), W[36] - 0.05, 0.5)
for k in range(3): put(sfx, coo(), W[44] + k * 0.18, 0.6)
put(sfx, ting(1318), W[50] - 0.05, 0.6)
put(sfx, mx(tone(90, 0.6, r=0.25, glide=-0.4), noise(0.4, r=0.2, lp=0.1)), W[57] - 0.05, 1.0)   # explosão no alvo
put(sfx, ting(1760), W[58] - 0.05, 0.5)
for k in range(8): put(sfx, mx(tone(260 + 40 * (k % 3), 0.12, "saw", r=0.05), noise(0.08, r=0.04)), W[64] + k * 0.16, 0.45)  # gargalhada dos generais
put(sfx, mx(tone(70, 0.4, r=0.12, glide=-0.5), noise(0.12, r=0.04, lp=0.1)), W[72] - 0.06, 1.0)  # carimbo
put(sfx, tone(NOTE(84), 0.6, r=0.3), W[84] - 0.05, 0.5)                  # Orcon
for k in range(20): put(sfx, tone(1200 + 400 * (k % 4), 0.04, "square", r=0.02), W[91] + k * 0.12, 0.2)  # bipes do computador
for k in range(4): put(sfx, coo(), W[113] + k * 0.2, 0.5)
put(sfx, popf(), W[118] - 0.08, 0.7)

# ------------------------------------------------------------------ mixagem com níveis travados
voice = read_wav("public/audio/pombo/narr.wav")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]


def gated_rms(x, gate_db=-40):
    blk = SR // 10
    n = len(x) // blk
    r = np.sqrt((x[: n * blk].reshape(n, blk) ** 2).mean(axis=1) + 1e-12)
    loud = r[20 * np.log10(r) > 20 * np.log10(r.max()) + gate_db]
    return float(np.sqrt((loud ** 2).mean()))


vr = gated_rms(voice)
music *= (0.5 * vr) / gated_rms(music)
sfx *= (0.5 * vr) / gated_rms(sfx)
cap = 0.7 * np.abs(voice).max()
if np.abs(sfx).max() > cap:
    sfx *= cap / np.abs(sfx).max()
db = lambda a, b: 20 * np.log10(gated_rms(a) / gated_rms(b))
print(f"trilha vs voz: {db(music, voice):+.1f} dB | efeitos vs voz: {db(sfx, voice):+.1f} dB | pico efeitos/pico voz: {np.abs(sfx).max() / np.abs(voice).max():.2f}")
mix = voice + music + sfx
mix /= max(1.0, np.abs(mix).max() / 0.98)
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("out/pombo_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())

# loudness: um ganho linear até ~-14 LUFS + limitador de pico -1 dBFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/pombo_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
info = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
gain = -14 - float(info["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/pombo_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "out/pombo_mix.wav"], check=True)
print(f"loudness de entrada {info['input_i']} LUFS, ganho aplicado {gain:+.2f} dB -> out/pombo_mix.wav")

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/pombo_mix.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/pombo/mix.mp3"], check=True)
print(f"-> public/audio/pombo/mix.mp3")
