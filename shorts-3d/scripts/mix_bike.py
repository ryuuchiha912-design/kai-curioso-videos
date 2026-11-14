"""Trilha + efeitos do short da bicicleta proibida (inglês) (canal do Nico). Trilha/efeitos a -6 dB da voz, ~-14 LUFS."""
import json
import subprocess
import wave

import numpy as np

SR = 44100
tl = json.load(open("src/data/bike-en-timeline.json"))
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


# ------------------------------------------------------------------ música: marcha francesa animada (anos 30) → tensão na reunião → final
music = np.zeros(N)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
MEET, END = LS[10] - 0.15, LS[13] - 0.1
def march(a, b, vel=1.0, bpm=132):
    beat = 60 / bpm; t = a; k = 0
    mel = [72, 74, 76, 79, 77, 76, 74, 72, 71, 72, 74, 76, 74, 72, 71, 67]
    bass = [48, 55, 48, 55, 53, 60, 55, 62]
    while t < b - 0.2:
        put(music, mx(tone(NOTE(mel[k % 16]), beat * 0.45, "square", r=0.08) * 0.35, tone(NOTE(mel[k % 16]), beat * 0.5, r=0.12) * 0.6), t, 0.3 * vel)
        if k % 2 == 0: put(music, tone(NOTE(bass[(k // 2) % 8]), beat * 0.9, r=0.18), t, 0.5 * vel)
        put(music, noise(0.03, r=0.01), t + beat / 4, 0.12 * vel)
        t += beat / 2; k += 1
march(0.0, MEET)
# tensão só na reunião (suave, sem zumbido), e a marcha volta na cena das corridas de hoje
TENS_END = LS[12] - 0.15
tens = mx(tone(NOTE(55), TENS_END - MEET, a=0.6, r=99), tone(NOTE(50), TENS_END - MEET, a=0.8, r=99) * 0.7)
n = len(tens); tens *= np.clip(np.arange(n) / (0.6 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.6 * SR), 0, 1)
put(music, tens, MEET, 0.35)
t = MEET
while t < TENS_END - 0.4: put(music, tone(NOTE(38), 0.35, r=0.15), t, 0.45); t += 0.9
march(TENS_END, END, 0.9, 132)
march(END, TOTAL, 0.8, 120)
for a, b in ((MEET - 0.25, MEET),):
    i0, i1 = int(a * SR), int(b * SR); music[i0:i1] *= np.linspace(1, 0.2, i1 - i0)
i1 = int((TOTAL - 0.4) * SR); music[i1:] *= np.linspace(1, 0, len(music) - i1)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
whoosh = lambda d=0.35: noise(d, a=0.15, r=0.12, lp=0.08)
popf = lambda: tone(500, 0.12, r=0.04, glide=1.5)
ting = lambda f=1760: mx(tone(f, 0.6, r=0.25), tone(f * 1.5, 0.6, r=0.15) * 0.4)
thud = lambda: mx(tone(70, 0.4, r=0.12, glide=-0.5), noise(0.12, r=0.04, lp=0.1))
for i in (8, 23, 42, 45, 62, 82, 99, 106, 109, 126, 136, 151):
    put(sfx, whoosh(), W[i] - 0.3, 0.35)
put(sfx, noise(2.6, a=0.05, r=1.5, lp=0.05), 0.0, 0.6)                    # vento do gancho
put(sfx, thud(), W[6] - 0.06, 1.0)                                           # BANNED
put(sfx, ting(1046), W[8] - 0.05, 0.5); put(sfx, popf(), W[26] - 0.08, 0.6)
for i in (33, 34, 39): put(sfx, popf(), W[i] - 0.08, 0.5)
for k in range(14): put(sfx, mx(tone(240 + 60 * (k % 3), 0.12, "saw", r=0.05), noise(0.08, r=0.04)), W[43] - 0.1 + k * 0.12, 0.4)   # risadas
put(sfx, ting(1318), W[48] - 0.05, 0.6)
put(sfx, noise(3.0, a=0.3, r=99, lp=0.04), LS[6], 0.45)                     # vento na explicação
put(sfx, popf(), W[70] - 0.08, 0.6); put(sfx, ting(1568), W[76] - 0.05, 0.5)
for k in range(16): put(sfx, tone(2400, 0.03, r=0.01), LS[7] + 0.2 + k * 0.25, 0.3)   # tique-taque do cronômetro
put(sfx, ting(1046), W[104] - 0.05, 0.5)
put(sfx, mx(ting(1318), ting(1661) * 0.7, ting(1976) * 0.5), W[107] - 0.05, 0.7)       # recorde
for k in range(10): put(sfx, noise(0.05, r=0.02), W[107] + 0.2 + k * 0.08, 0.35)          # aplausos
put(sfx, thud(), W[122] - 0.06, 1.0)                                         # carimbo
put(sfx, mx(tone(300, 0.5, r=0.25, glide=-0.5)), W[128] - 0.05, 0.6)
put(sfx, thud(), W[133] - 0.06, 1.0)
put(sfx, popf(), W[153] - 0.08, 0.6); put(sfx, popf(), W[156] - 0.08, 0.6)

# ------------------------------------------------------------------ mixagem com níveis travados
voice = read_wav("public/audio/bike-en/narr.wav")
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
with wave.open("out/bike_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())

# loudness: um ganho linear até ~-14 LUFS + limitador de pico -1 dBFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/bike_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
info = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
gain = -14 - float(info["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/bike_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "out/bike_mix.wav"], check=True)
print(f"loudness de entrada {info['input_i']} LUFS, ganho aplicado {gain:+.2f} dB -> out/bike_mix.wav")

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/bike_mix.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/bike-en/mix.mp3"], check=True)
print(f"-> public/audio/bike-en/mix.mp3")
