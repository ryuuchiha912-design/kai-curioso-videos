"""Trilha + efeitos sintetizados e mixagem do short Micro-ondas.

Regras: a voz não é alterada aqui (já vem acelerada 1,1x do passo de narração).
Trilha a 50% do RMS (com gate) da voz (-6 dB); efeitos a 50% ou menos, com pico <= 0,7x o pico da voz.
Uso: python3 scripts/mix_micro.py  -> out/micro_mix.wav
"""
import json
import subprocess
import wave

import numpy as np

SR = 48000
words = json.load(open("src/data/micro-words.json"))
W = [w["start"] for w in words["words"]]
TOTAL = words["total"]
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


# ------------------------------------------------------------------ música: marchinha curta em loop, para no "Só tinha um problema"
music = np.zeros(N)
STOP = W[76] - 0.05
bpm = 132
beat = 60 / bpm
bass = [110, 110, 146.8, 130.8, 110, 110, 164.8, 146.8]
chords = [[220, 277.2, 329.6], [220, 277.2, 329.6], [293.7, 370, 440], [261.6, 329.6, 392]]
t = 0.0
k = 0
while t < STOP:
    put(music, tone(55, 0.18, r=0.08, glide=-0.6), t, 0.9)  # bumbo
    if k % 2 == 1:
        put(music, noise(0.12, r=0.05), t, 0.25)  # caixa
    put(music, noise(0.03, r=0.01), t + beat / 2, 0.08)  # chimbal
    put(music, tone(bass[k % 8], beat * 0.9, "saw", r=0.12), t, 0.35)  # baixo dedilhado
    if k % 4 == 0:
        for fr in chords[(k // 4) % 4]:
            put(music, tone(fr, beat * 3.8, "saw", a=0.04, r=1.2) * 0.5, t, 0.12)  # metais suaves
    if k % 2 == 0:  # melodia saltitante
        put(music, tone([659.3, 587.3, 523.3, 587.3][(k // 2) % 4], beat * 0.45, "square", r=0.08), t + beat / 2, 0.05)
    t += beat
    k += 1
fade = np.ones(N)
i0, i1 = int((STOP - 0.08) * SR), int(STOP * SR)
fade[i0:i1] = np.linspace(1, 0, i1 - i0); fade[i1:] = 0
music *= fade
# drone grave depois da virada
drone = tone(55, TOTAL - STOP, "saw", a=0.3, r=99) * 0.5 + tone(82.4, TOTAL - STOP, a=0.3, r=99) * 0.4
put(music, drone, STOP, 0.6)

# ------------------------------------------------------------------ efeitos nos eventos
sfx = np.zeros(N)
whoosh = lambda d=0.35: noise(d, a=0.15, r=0.12, lp=0.08)
pop = lambda: tone(500, 0.12, r=0.04, glide=1.5)
ting = lambda f=1760: tone(f, 0.6, r=0.25) + tone(f * 1.5, 0.6, r=0.15) * 0.4
put(sfx, noise(2.6, a=0.3, r=1.5, lp=0.3), 0.0, 0.18)  # chiado de calor no gancho
for tt in (1.3, 4.4, 24.1):
    put(sfx, whoosh(), tt - 0.15, 0.5)
put(sfx, pop(), W[9] - 0.1, 0.8)  # doce aparece
put(sfx, ting(), W[13] - 0.1, 0.6)  # 1945
put(sfx, tone(120, 1.6, "saw", a=0.05, r=1.2) * 0.6 + tone(240, 1.6, "square", a=0.05, r=0.8) * 0.2, W[26] - 0.1, 0.7)  # magnetron liga
put(sfx, tone(700, 0.35, r=0.15, glide=0.8), W[28] - 0.1, 0.6)  # susto
put(sfx, noise(2.0, a=0.2, r=1.2, lp=0.25), W[32] - 0.1, 0.35)  # calça esquentando (chiado)
put(sfx, tone(300, 0.4, r=0.2, glide=-0.7), W[38] - 0.05, 0.7)  # derreteu
put(sfx, tone(1200, 0.7, a=0.02, r=0.5, glide=-0.75), W[42], 0.35)  # apito descendo (zoação)
put(sfx, pop(), W[48] - 0.1, 0.8)  # tigela
for i in range(26):  # pipocas
    put(sfx, noise(0.04, r=0.008) + tone(900 + rng.random() * 900, 0.04, r=0.01), W[53] - 0.07 + i * 0.055 + rng.random() * 0.03, 0.6)
put(sfx, pop(), W[59] - 0.1, 0.7)  # ovo aparece
for i in range(8):  # ovo tremendo
    put(sfx, tone(1500, 0.03, r=0.01), W[64] - 0.6 + i * 0.07, 0.25)
put(sfx, mx(noise(0.5, a=0.002, r=0.18, lp=0.15), tone(90, 0.3, r=0.12, glide=-0.5)), W[64] - 0.07, 1.0)  # SPLASH
put(sfx, mx(ting(1318), ting(1661) * 0.6, ting(1976) * 0.5), W[73] - 0.1, 0.5)  # forno nasce
put(sfx, mx(tone(65, 1.2, "saw", a=0.005, r=0.6), noise(0.4, r=0.2, lp=0.05)), W[76] - 0.05, 0.9)  # ferrão da virada
for i in range(6):  # balança girando
    put(sfx, tone(2200, 0.03, r=0.01), W[83] - 0.07 + i * 0.045, 0.3)
put(sfx, ting(988), W[85] - 0.07, 0.45)
put(sfx, mx(tone(48, 0.9, r=0.35, glide=-0.4), noise(0.35, r=0.15, lp=0.04)), W[86] - 0.05, 1.0)  # TUM no "quilos"

# ------------------------------------------------------------------ mixagem com níveis travados
voice = read_wav("public/audio/micro/voice.wav")
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
with wave.open("out/micro_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())

# loudness: um ganho linear até ~-14 LUFS + limitador de pico -1 dBFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/micro_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
info = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
gain = -14 - float(info["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/micro_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "out/micro_mix.wav"], check=True)
print(f"loudness de entrada {info['input_i']} LUFS, ganho aplicado {gain:+.2f} dB -> out/micro_mix.wav")
