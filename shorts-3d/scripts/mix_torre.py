"""Trilha + efeitos do short da torre (Whittier, inglês) (canal do Nico). Trilha/efeitos a -6 dB da voz, ~-14 LUFS."""
import json
import subprocess
import wave

import numpy as np

SR = 44100
tl = json.load(open("src/data/torre-en-timeline.json"))
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


# ------------------------------------------------------------------ música: sininhos de inverno → tensão → piano noturno → resolução
music = np.zeros(N)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
STORM, NIGHT, END = W[76] - 0.2, LS[7] - 0.15, LS[9] - 0.1
def bells(a, b, vel=1.0, bpm=104):
    beat = 60 / bpm; t = a; k = 0
    mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 74, 71]
    chords = [[48, 55, 64], [53, 60, 69], [50, 57, 65], [55, 62, 71]]
    while t < b - 0.2:
        put(music, mx(tone(NOTE(mel[k % 16]), 0.6, r=0.25), tone(NOTE(mel[k % 16]) * 2, 0.4, r=0.12) * 0.3), t, 0.25 * vel)
        if k % 8 == 0:
            for m in chords[(k // 8) % 4]: put(music, tone(NOTE(m), beat * 4, a=0.05, r=1.4), t, 0.12 * vel)
        if k % 2 == 0: put(music, noise(0.03, r=0.01), t, 0.08 * vel)
        t += beat / 2; k += 1
bells(0.0, STORM)
put(music, mx(tone(NOTE(38), NIGHT - STORM, "saw", a=0.4, r=99) * 0.35, tone(NOTE(45), NIGHT - STORM, "saw", a=0.6, r=99) * 0.25), STORM, 0.6)
t = STORM
while t < NIGHT - 0.3: put(music, tone(NOTE(38), 0.4, r=0.2), t, 0.7); t += 0.75
for i, m in enumerate([69, 64, 67, 62]): put(music, mx(tone(NOTE(m), 1.6, r=0.8), tone(NOTE(m - 12), 1.6, r=0.9) * 0.4), NIGHT + 0.2 + i * 0.85, 0.35)
bells(END, TOTAL, 0.9, 96)
fade = np.ones(N)
for a, b in ((STORM - 0.25, STORM), (NIGHT - 0.3, NIGHT)):
    i0, i1 = int(a * SR), int(b * SR); music[i0:i1] *= np.linspace(1, 0.2, i1 - i0)
i1 = int((TOTAL - 0.4) * SR); music[i1:] *= np.linspace(1, 0, len(music) - i1)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
whoosh = lambda d=0.35: noise(d, a=0.15, r=0.12, lp=0.08)
popf = lambda: tone(500, 0.12, r=0.04, glide=1.5)
ting = lambda f=1760: mx(tone(f, 0.6, r=0.25), tone(f * 1.5, 0.6, r=0.15) * 0.4)
for i in (13, 17, 30, 49, 65, 76, 85, 100, 105, 114, 125):
    put(sfx, whoosh(), W[i] - 0.3, 0.35)
put(sfx, noise(4.5, a=1.0, r=99, lp=0.02), 0.0, 0.3)                                  # vento leve
put(sfx, ting(1318), W[4] - 0.05, 0.5); put(sfx, popf(), W[15] - 0.08, 0.7)
put(sfx, popf(), W[19] - 0.08, 0.6); put(sfx, ting(1046), W[26] - 0.05, 0.5)
for i in (35, 38, 41, 44, 48): put(sfx, ting(1568), W[i] - 0.05, 0.4)              # placas
for k in range(int((LS[4] - LS[3]) / 0.42)): put(sfx, mx(tone(120, 0.08, r=0.03), noise(0.05, r=0.02, lp=0.2)), LS[3] + k * 0.42, 0.35)  # passos
for k in range(int((LS[5] - LS[4]) / 0.3)): put(sfx, mx(tone(150, 0.06, r=0.03), noise(0.04, r=0.02, lp=0.2)), LS[4] + k * 0.3, 0.3)
put(sfx, popf(), W[61] - 0.08, 0.6)
put(sfx, mx(tone(70, 0.4, r=0.12, glide=-0.5), noise(0.12, r=0.04, lp=0.1)), W[72] - 0.06, 0.8)
put(sfx, noise(LS[6] - STORM, a=0.6, r=99, lp=0.03), STORM, 0.7)                    # nevasca
put(sfx, mx(tone(NOTE(57), 1.2, "saw", a=0.05, r=0.9) * 0.6, tone(NOTE(61), 1.2, "saw", a=0.05, r=0.9) * 0.5), W[96] - 0.3, 0.6)  # buzina do trem
for k in range(14): put(sfx, mx(tone(70, 0.1, r=0.05), noise(0.08, r=0.04, lp=0.1)), W[96] + k * 0.22, 0.4)  # trem nos trilhos
put(sfx, mx(tone(90, 0.5, r=0.2, glide=-0.4), noise(0.2, r=0.08, lp=0.15)), W[104] - 0.06, 1.0)  # cancela fecha
put(sfx, noise(2.4, a=0.3, r=1.6, lp=0.04), LS[8], 0.35)                             # vento noturno
put(sfx, ting(1318), W[123] - 0.05, 0.5); put(sfx, popf(), W[134] - 0.08, 0.7)

# ------------------------------------------------------------------ mixagem com níveis travados
voice = read_wav("public/audio/torre-en/narr.wav")
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
with wave.open("out/torre_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())

# loudness: um ganho linear até ~-14 LUFS + limitador de pico -1 dBFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/torre_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
info = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
gain = -14 - float(info["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/torre_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "out/torre_mix.wav"], check=True)
print(f"loudness de entrada {info['input_i']} LUFS, ganho aplicado {gain:+.2f} dB -> out/torre_mix.wav")

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/torre_mix.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/torre-en/mix.mp3"], check=True)
print(f"-> public/audio/torre-en/mix.mp3")
