"""Trilha + efeitos do short "This throw was so far they had to change the javelin" (Nico Explains, EN).
Uso: python3 scripts/mix_javelin.py  -> public/audio/javelin-en/mix.mp3"""
import json, subprocess, wave
import numpy as np
SR = 44100
tl = json.load(open("src/data/javelin-en-timeline.json")); L = tl["lines"]; TOTAL = tl["total"]
WD = [w for l in L for w in l["words"]]
W = lambda i: WD[i]["start"]
N = int((TOTAL + 0.3) * SR)
rng = np.random.default_rng(5)
TT = lambda d: np.arange(int(d * SR)) / SR
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * g
def lp(x, k=8): return np.convolve(x, np.ones(k) / k, mode="same")
def hp(x, k=8): return x - lp(x, k)
def adsr(n, a, d, s, r):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return e * np.clip((dur - t) / max(r, 1e-4), 0, 1)
def steps(a, b, bpm, sub=4, swing=0.0):
    st = 60 / bpm / sub; t = a; k = 0
    while t < b - 0.05:
        yield t + (st * swing if k % 2 == 1 else 0), k; t += st; k += 1
def rhodes(f, d=2.2):  # piano elétrico (FM suave) com tremolo
    t = TT(d); mod = np.sin(2 * np.pi * f * 1.0 * t) * 1.6 * np.exp(-t * 3)
    s = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4)
    return s * np.exp(-t * 1.1) * (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)) * np.minimum(1, t / 0.006)
def vinyl(d):
    n = int(d * SR); x = rng.standard_normal(n) * 0.012; pops = rng.random(n) < 0.00035
    x[pops] += rng.choice([-1, 1], pops.sum()) * rng.random(pops.sum()) * 0.6; return lp(x, 3)
def lofi_kick():
    t = TT(0.4); return lp(np.sin(2 * np.pi * (48 * t + 60 * (1 - np.exp(-t * 25)) / 25)) * np.exp(-t * 8), 6)
def lofi_snare():
    t = TT(0.25); n = rng.standard_normal(len(t)); return lp(n, 5) * np.exp(-t * 16) * 0.7 + 0.25 * np.sin(2 * np.pi * 200 * t) * np.exp(-t * 25)
def lofi_hat():
    t = TT(0.05); return hp(rng.standard_normal(len(t)), 3) * np.exp(-t * 80) * 0.3
def arp_sq(f, d=0.16):  # synthwave: quadrada filtrada, curtinha
    t = TT(d); x = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + np.sin(2 * np.pi * f * 1.005 * t) * 0.4
    return lp(x, 10) * adsr(len(t), 0.003, 0.06, 0.4, 0.05)
def sub_pulse(f, d=0.22):
    t = TT(d); return np.sin(2 * np.pi * f * t) * adsr(len(t), 0.005, 0.1, 0.6, 0.08)
def gated_snare():
    t = TT(0.35); n = rng.standard_normal(len(t)); return lp(n, 3) * np.where(t < 0.22, 1, np.exp(-(t - 0.22) * 40)) * 0.6
def taiko():
    t = TT(0.9); b = np.sin(2 * np.pi * (52 + 40 * np.exp(-t * 12)) * t) * np.exp(-t * 4); n = lp(rng.standard_normal(len(t)), 12) * np.exp(-t * 18) * 0.8
    return b * 1.2 + n
def braam(root=36, d=2.6):  # metais graves de cinema (aditivo, ataque lento, curto — sem zumbido longo)
    t = TT(d); f = NOTE(root); s = sum((0.9 / k) * np.sin(2 * np.pi * f * k * t + 0.3 * k) for k in range(1, 9))
    s += 0.5 * sum((0.9 / k) * np.sin(2 * np.pi * f * 1.5 * k * t) for k in range(1, 5))
    return lp(s, 14) * adsr(len(t), 0.18, 0.5, 0.55, 1.2) * 0.5
def stacc(f, d=0.18):  # corda staccato (seno + harmônicos, sem serrote)
    t = TT(d); s = sum((1 / k) * np.sin(2 * np.pi * f * k * t) for k in range(1, 6)); return s * adsr(len(t), 0.01, 0.08, 0.3, 0.06) * 0.6
def timp(f=NOTE(38)):
    t = TT(1.2); return np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + lp(rng.standard_normal(len(t)), 20) * np.exp(-t * 30) * 0.5
def rumble(d):  # ronco grave de terror (ruído filtrado + seno lento)
    t = TT(d); n = lp(lp(rng.standard_normal(len(t)), 120), 60) * 6; s = 0.4 * np.sin(2 * np.pi * 38 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t))
    return (n + s) * np.minimum(1, t / 1.5) * np.clip((d - t) / 1.5, 0, 1)
def glassharm(f, d=2.4, det=0.0):  # harmônica de vidro (desafinada = estranha)
    t = TT(d); s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * (2.01 + det) * t) + 0.5 * np.sin(2 * np.pi * f * (1 + det) * t)
    return s * adsr(len(t), 0.25, 0.4, 0.6, 0.9) * (1 + 0.2 * np.sin(2 * np.pi * 5.5 * t)) * 0.4
def cluster(root, d=3.0):  # cordas dissonantes (cluster) em seno
    t = TT(d); s = sum(np.sin(2 * np.pi * NOTE(root + k) * t * (1 + 0.002 * np.sin(2 * np.pi * (0.7 + k * 0.13) * t))) for k in (0, 1, 2, 6, 7))
    return s * adsr(len(t), 0.6, 0.6, 0.7, 1.0) * 0.22
def whisper(d=1.4):
    t = TT(d); n = rng.standard_normal(len(t)); band = hp(lp(n, 3), 12)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * (5 + 3 * np.sin(2 * np.pi * 0.7 * t)) * t)) ** 2
    return band * am * adsr(len(t), 0.2, 0.2, 0.7, 0.5) * 0.9
def scare():  # susto
    t = TT(2.2); hit = lp(rng.standard_normal(len(t)), 4) * np.exp(-t * 9) * 1.2 + np.sin(2 * np.pi * 45 * t) * np.exp(-t * 2.5) * 1.4
    return hit + cluster(72, 2.2) * 1.6 * np.exp(-t * 1.2)
def kalimba(f, d=1.4):
    t = TT(d); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 20)) * np.exp(-t * 3.4) * np.minimum(1, t / 0.002)
def flute(f, d=1.2):
    t = TT(d); vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
    s = np.sin(2 * np.pi * f * vib * t) + 0.18 * np.sin(2 * np.pi * 2 * f * vib * t) + lp(rng.standard_normal(len(t)), 6) * 0.06
    return s * adsr(len(t), 0.08, 0.2, 0.75, 0.25) * 0.55
def choir(freqs, d, att=1.2):  # coral (vogal "ah" com formantes)
    t = TT(d); s = np.zeros_like(t)
    for f in freqs:
        for k in range(1, 12):
            fk = f * k; w = np.exp(-((fk - 750) / 300) ** 2) + 0.7 * np.exp(-((fk - 1150) / 300) ** 2) + 0.3 * np.exp(-((fk - 2600) / 500) ** 2) + 0.15
            s += w * np.sin(2 * np.pi * fk * t * (1 + 0.004 * np.sin(2 * np.pi * (5 + k * 0.1) * t)))
    return s * adsr(len(t), att, 0.5, 0.85, 1.2) / (len(freqs) * 4)
def heartbeat(bpm_a, bpm_b, a, b, g):
    t = a
    while t < b:
        k = (t - a) / max(b - a, 1e-3); bpm = bpm_a + (bpm_b - bpm_a) * k
        tt = TT(0.5); hb = lambda o: np.where(tt >= o, np.sin(2 * np.pi * 48 * (tt - o)) * np.exp(-(tt - o) * 16), 0)
        put(music, hb(0) + 0.6 * hb(0.2), t, g); t += 60 / bpm
def revswell(d=1.6):
    t = TT(d); s = lp(rng.standard_normal(len(t)), 5) * 0.5 + np.sin(2 * np.pi * NOTE(64) * t) * 0.3 + np.sin(2 * np.pi * NOTE(65) * t) * 0.3
    return s * (t / d) ** 3

music = np.zeros(N)
def M(sig, at, g): put(music, sig, at, g)
Am, F, C, G, E, Dm = [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [52, 56, 59], [50, 53, 57]
def kick():
    t = TT(0.35); return np.sin(2 * np.pi * (50 * t + 70 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 9)
def clap():
    t = TT(0.2); n = rng.standard_normal(len(t)); return hp(n, 3) * (np.exp(-t * 30) + 0.5 * np.exp(-np.maximum(0, t - 0.012) * 30) * (t > 0.012)) * 0.6
def hat():
    t = TT(0.05); return hp(rng.standard_normal(len(t)), 2) * np.exp(-t * 90) * 0.3
def stadium(a, b, bpm=124, g=1.0, prog=(Am, F, C, G), arp=True):
    for t, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        if k % 4 == 0: M(kick(), t, 0.7 * g)
        if k % 8 == 4: M(clap(), t, 0.4 * g)
        if k % 2 == 1: M(hat(), t, 0.25 * g)
        if k % 2 == 0: M(sub_pulse(NOTE(ch[0] - 24), 0.2), t, 0.45 * g)
        if arp: M(arp_sq(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12 + (12 if k % 16 >= 8 else 0)), 0.12), t, 0.13 * g)
        if k % 16 == 0: M(taiko(), t, 0.5 * g)
def crowd(d, a=0.4):
    t = TT(d); n = lp(rng.standard_normal(len(t)), 9) + 0.5 * lp(rng.standard_normal(len(t)), 30)
    return n * adsr(len(t), a, 0.3, 0.8, 0.8) * (1 + 0.2 * np.sin(2 * np.pi * 1.3 * t)) * 0.9
def whooshj(d=1.0):
    t = TT(d); return hp(lp(rng.standard_normal(len(t)), 3), 20) * np.sin(np.pi * t / d) ** 2 * 1.0
def thud():
    t = TT(0.6); return np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 10) * 1.4 + lp(rng.standard_normal(len(t)), 20) * np.exp(-t * 25) * 0.6
def pop(f=900):
    t = TT(0.12); return np.sin(2 * np.pi * f * t * (1 + 0.5 * np.exp(-t * 40))) * np.exp(-t * 30) * 0.7
def chime(f):
    t = TT(1.6); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 2.5) * 0.5
def pizz(f):
    t = TT(0.3); return sum((1 / k) * np.sin(2 * np.pi * f * k * t) for k in range(1, 5)) * np.exp(-t * 14) * np.minimum(1, t / 0.002)
t0 = lambda i: W(i) - 0.1
# 1) gancho + 1984: batida de estádio já no 1º segundo
stadium(0.0, t0(23), 124)
M(revswell(1.2), t0(8) - 1.1, 0.3)
# 2) 100 m: só taiko + baixo (suspense curto)
for t, k in steps(t0(23), t0(36), 124, 2):
    if k % 4 == 0: M(taiko(), t, 0.45)
    if k % 2 == 0: M(sub_pulse(NOTE(33), 0.25), t, 0.4)
M(riser(1.6) if False else revswell(1.8), t0(36) - 1.7, 0.35)
# 3) corrida, lançamento, voo: o mais forte, com coral subindo
stadium(t0(36), t0(45) + 0.3, 132, 1.15)
M(choir([NOTE(n) for n in (57, 64, 69)], t0(45) + 0.6 - t0(40), att=1.6), t0(40), 0.45)
M(scare() * 0 + braam(33, 2.2), t0(45) - 0.05, 0.6)
# 4) 104.80 → torcida explode e cala: silêncio com batimento
for t, k in steps(t0(52), t0(64), 62, 1): M(taiko() * 0.5, t, 0.35)
M(cluster(64, t0(64) - t0(56)), t0(56), 0.18)
# 5) juízes confusos: pizzicato cômico
for t, k in steps(t0(64), t0(78), 112, 2): M(pizz(NOTE([57, 60, 64, 63, 62, 60, 59, 57][k % 8])), t, 0.32)
# 6) "the crazy part": pausa + whoosh, depois synth sequência (decisão + 1986)
M(revswell(1.4), t0(78) - 1.2, 0.35); M(braam(36, 1.8), t0(81), 0.5)
for t, k in steps(t0(83), t0(103), 116, 4):
    ch = (Dm, F, C, G)[(k // 16) % 4]
    M(arp_sq(NOTE(ch[[0, 2, 1, 2][k % 4]] + 12), 0.12), t, 0.15)
    if k % 4 == 0: M(sub_pulse(NOTE(ch[0] - 24), 0.25), t, 0.4)
    if k % 8 == 4: M(clap(), t, 0.25)
# 7) nova trajetória: cordas staccato descendo
for t, k in steps(t0(103), t0(119), 104, 4): M(stacc(NOTE([69, 67, 65, 64, 62, 60, 59, 57][(k // 2) % 8])), t, 0.2)
for t, k in steps(t0(103), t0(119), 104, 1):
    if k % 4 == 0: M(kick(), t, 0.5)
# 8) congelado: gelo
for i, n in enumerate([88, 91, 95, 100]): M(chime(NOTE(n)), W(124) + i * 0.09, 0.35)
M(choir([NOTE(n) for n in (52, 59, 64)], t0(126) - t0(119) + 0.5, att=0.8), t0(119), 0.3)
# 9) recorde de hoje + 40 anos: piano + batida crescendo para o loop
for t, k in steps(t0(126), t0(137), 96, 2): M(rhodes(NOTE([Am, F, C, G][(k // 8) % 4][k % 3] + 12), 0.9), t, 0.18)
stadium(t0(137), TOTAL, 128, 1.1)
M(choir([NOTE(n) for n in (57, 64, 69)], TOTAL - t0(147), att=1.0), t0(147), 0.4)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
starts = [l["start"] for l in L]
for s in starts[1:]: put(sfx, whooshj(0.4), s - 0.25, 0.25)
put(sfx, whooshj(2.4), 0.0, 0.5); put(sfx, crowd(3.0), 0.0, 0.25)
put(sfx, crowd(3.5, 1.0), t0(11), 0.3)
rel = W(39) - 2 / 30; land = W(45) - 4 / 30
for k in range(6): put(sfx, thud() * 0.25, rel - 1.6 + k * 0.27, 0.35)   # passos da corrida
put(sfx, whooshj(1.0), rel - 0.15, 0.7); put(sfx, whooshj(land - rel), rel, 0.5)
put(sfx, crowd(land - rel + 2.5, 1.5), rel, 0.5)
put(sfx, thud(), land, 0.9); put(sfx, crowd(2.0, 0.05), land + 0.05, 0.6)
put(sfx, thud(), W(68), 0.5)
for i in [0, 4, 8, 11, 12, 17, 23, 27, 34, 37, 39, 45, 52, 54, 57, 62, 69, 75, 81, 85, 88, 91, 93, 97, 100, 105, 109, 116, 124, 125, 126, 133, 137, 140, 144, 149]:
    put(sfx, pop(700 + (i % 5) * 80), W(i) - 0.07, 0.35)
put(sfx, thud(), W(109) - 0.05, 0.6)

# ------------------------------------------------------------------ mixagem (níveis travados a -6 dB da voz)
def read(path):
    with wave.open(path) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return a.reshape(-1, f.getnchannels()).mean(axis=1)
def grms(x, gate_db=-40):
    blk = SR // 10; n = len(x) // blk
    r = np.sqrt((x[: n * blk].reshape(n, blk) ** 2).mean(axis=1) + 1e-12)
    loud = r[20 * np.log10(r) > 20 * np.log10(r.max()) + gate_db]
    return float(np.sqrt((loud ** 2).mean()))
voice = read("public/audio/javelin-en/narr.wav"); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
vr = grms(voice)
music *= 0.5 * vr / grms(music); sfx *= 0.5 * vr / grms(sfx)
for arr in (music, sfx):
    cap = 0.8 * np.abs(voice).max()
    if np.abs(arr).max() > cap: arr *= cap / np.abs(arr).max()
db = lambda a: 20 * np.log10(grms(a) / vr)
print(f"trilha {db(music):+.1f} dB | efeitos {db(sfx):+.1f} dB")
mix = voice + music + sfx; mix /= max(1.0, np.abs(mix).max() / 0.98)
import os; os.makedirs("out", exist_ok=True)
with wave.open("out/javelin_mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/javelin_mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
gain = -14 - float(json.loads(m[m.rindex("{"): m.rindex("}") + 1])["input_i"])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "out/javelin_mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/javelin-en/mix.mp3"], check=True)
print(f"ganho {gain:+.2f} dB -> public/audio/javelin-en/mix.mp3")
