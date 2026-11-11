"""Trilha + efeitos sintetizados e mixagem do short do cinzeiro no avião (canal do Nico).
Trilha e efeitos a 50% (-6 dB) da voz; ~-14 LUFS. Uso: python3 scripts/mix_aviao.py -> public/audio/aviao/mix.mp3
"""
import json
import subprocess
import wave

import numpy as np

SR = 44100
tl = json.load(open("src/data/aviao-timeline.json"))
W = [w["start"] for l in tl["lines"] for w in l["words"]]
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


# ------------------------------------------------------------------ música
music = np.zeros(N)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
T1973 = LS[6] - 0.1      # vira tenso
TSAD = LS[8] - 0.2       # "Mais de cem pessoas morreram": quase silêncio
TWARM = LS[9] - 0.1      # resolução
# 1) curiosidade: pizzicato saltitante em Ré menor / Fá
bpm = 116; beat = 60 / bpm; t = 0.0; k = 0
mel = [62, 65, 69, 65, 64, 67, 70, 67, 62, 65, 69, 72, 70, 69, 67, 64]
bass = [38, 38, 41, 41, 43, 43, 45, 45]
while t < T1973 - 0.2:
    put(music, mx(tone(NOTE(mel[k % 16]), 0.35, r=0.09), tone(NOTE(mel[k % 16]) * 2, 0.2, r=0.04) * 0.25), t, 0.32)
    if k % 2 == 0: put(music, tone(NOTE(bass[(k // 2) % 8]), beat * 1.6, r=0.25), t, 0.45)
    if k % 4 == 2: put(music, noise(0.05, r=0.02), t, 0.1)
    t += beat / 2; k += 1
# 2) tensão: pulso grave + cordas dissonantes
t = T1973
while t < TSAD:
    put(music, tone(41, 0.5, r=0.3, glide=-0.2), t, 0.9)
    t += 0.62
put(music, mx(tone(NOTE(50), TSAD - T1973, "saw", a=1.5, r=99) * 0.25, tone(NOTE(51), TSAD - T1973, "saw", a=2.0, r=99) * 0.18), T1973, 0.5)
# 3) tristeza: duas notas de piano bem baixas
for i, m in enumerate([57, 53]):
    put(music, mx(tone(NOTE(m), 2.0, r=0.9), tone(NOTE(m + 12), 1.5, r=0.6) * 0.3), TSAD + 0.2 + i * 1.1, 0.35)
# 4) resolução quente: arpejo em Fá maior → Dó
t = TWARM; k = 0
prog = [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]
while t < TOTAL - 0.2:
    ch = prog[(k // 8) % 4]
    put(music, tone(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12), 1.0, r=0.5), t, 0.3)
    if k % 8 == 0: put(music, tone(NOTE(ch[0] - 12), 2.5, a=0.02, r=1.2), t, 0.4)
    t += 60 / 96 / 2; k += 1
fade = np.ones(N)
for a, b in ((T1973 - 0.3, T1973), (TSAD - 0.4, TSAD)):
    i0, i1 = int(a * SR), int(b * SR)
    seg = music[i0:i1] * np.linspace(1, 0.15, i1 - i0)
    music[i0:i1] = seg
i1 = int((TOTAL - 0.4) * SR); music[i1:] *= np.linspace(1, 0, len(music) - i1)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
whoosh = lambda d=0.35: noise(d, a=0.15, r=0.12, lp=0.08)
popf = lambda: tone(500, 0.12, r=0.04, glide=1.5)
ting = lambda f=1760: mx(tone(f, 0.6, r=0.25), tone(f * 1.5, 0.6, r=0.15) * 0.4)
thud = lambda: mx(tone(70, 0.4, r=0.12, glide=-0.5), noise(0.12, r=0.04, lp=0.1))
for i in (6, 13, 18, 31, 39, 48, 55, 68, 77, 82, 95, 100):
    put(sfx, whoosh(), W[i] - 0.3, 0.35)
put(sfx, tone(880, 0.25, "square", r=0.08), W[5] - 0.05, 0.25); put(sfx, tone(880, 0.25, "square", r=0.08), W[5] + 0.22, 0.25)  # placa pisca
put(sfx, ting(1318), W[12] - 0.06, 0.6)          # "?"
put(sfx, thud(), W[17] - 0.06, 1.0)               # carimbo
put(sfx, popf(), W[19] - 0.1, 0.7)                # prancheta
put(sfx, ting(1760), W[28] - 0.06, 0.45)          # brilho no cinzeiro
put(sfx, mx(noise(0.05, r=0.02), tone(2400, 0.05, r=0.02)), W[33] - 0.3, 0.6)   # isqueiro
put(sfx, noise(1.8, a=0.2, r=1.0, lp=0.05), W[33], 0.25)                        # chiado do cigarro
put(sfx, tone(400, 0.3, r=0.1, glide=-0.6), W[38] - 0.05, 0.4)                  # se esconde
put(sfx, tone(1200, 0.5, r=0.3, glide=-0.6), W[49] - 0.25, 0.4)                 # cigarro caindo
for i in range(10):                                                              # papel amassando
    put(sfx, noise(0.06, r=0.03, lp=0.5), W[52] - 0.05 + i * 0.07, 0.35)
put(sfx, ting(1046), W[55] - 0.06, 0.5)           # 1973
put(sfx, noise(5.0, a=0.6, r=99, lp=0.03), LS[6] - 0.1, 0.35)                   # ronco do avião
put(sfx, mx(tone(90, 0.8, r=0.4, glide=-0.3), noise(0.6, r=0.3, lp=0.06)), W[63] - 0.06, 0.9)  # pegou fogo
for i in range(60):                                                              # fogo estalando
    tt = LS[7] - 0.3 + i * 0.06 + rng.random() * 0.04
    put(sfx, noise(0.02, r=0.006), tt, 0.3 + 0.4 * rng.random())
put(sfx, noise(3.4, a=0.5, r=99, lp=0.04), LS[7] - 0.3, 0.3)
for i, f0 in enumerate((1318, 1661, 1976, 2637)):                                # avião salvo
    put(sfx, ting(f0), W[97] - 0.06 + i * 0.07, 0.35)
put(sfx, popf(), W[106] - 0.08, 0.7)              # comenta aí

# ------------------------------------------------------------------ mixagem com níveis travados
voice = read_wav("public/audio/aviao/narr.wav")
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
with wave.open("out/aviao_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())

# loudness: um ganho linear até ~-14 LUFS + limitador de pico -1 dBFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/aviao_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
info = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
gain = -14 - float(info["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/aviao_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "out/aviao_mix.wav"], check=True)
print(f"loudness de entrada {info['input_i']} LUFS, ganho aplicado {gain:+.2f} dB -> out/aviao_mix.wav")

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/aviao_mix.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/aviao/mix.mp3"], check=True)
print("-> public/audio/aviao/mix.mp3")
