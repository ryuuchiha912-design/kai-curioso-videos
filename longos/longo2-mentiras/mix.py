"""Trilha (piano emocional) + efeitos — "E se você ficasse 1 ano MAIS NOVO todo dia?" (canal do Neo, 16:9) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/longo2_mentiras.mp4
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


# ------------------------------------------------------------------ trilha por trecho (instrumentos diferentes em cada parte)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
L_ = lambda i: L[i]["start"]
TT = lambda d: np.arange(int(d * SR)) / SR
def inst_piano(f, d=1.8, br=1.0):
    t = TT(d); return sum(h * np.sin(2 * np.pi * f * k * 1.0007 ** (k - 1) * t) * np.exp(-t * (1.6 + k * 0.9)) for k, h in enumerate((1, 0.5 * br, 0.25 * br, 0.12 * br), 1)) * np.minimum(1, t / 0.004)
def inst_marimba(f, d=0.7):
    t = TT(d); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)) * np.exp(-t * 5) * np.minimum(1, t / 0.002)
def inst_pluck(f, d=1.2, damp=1.0):
    t = TT(d); return sum((1 / k) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.5 + k * 1.8) * damp) for k in range(1, 7)) * np.minimum(1, t / 0.002)
def inst_pizz(f): return inst_pluck(f, 0.35, 4.0)
def inst_box(f, d=1.4, detune=0.0):
    t = TT(d); f = f * (1 + detune); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.25 * np.sin(2 * np.pi * 5.04 * f * t) * np.exp(-t * 14)) * np.exp(-t * 2.2) * np.minimum(1, t / 0.002)
def inst_pad(freqs, d, att=1.2, rel=1.4):
    t = TT(d); g = np.zeros_like(t)
    for f in freqs:
        for dt in (-0.004, 0.0, 0.004): g += np.sin(2 * np.pi * f * (1 + dt) * t + 0.4 * np.sin(2 * np.pi * 4.8 * t))
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    return g * env / (3 * len(freqs))
def inst_bass(f, d=0.5):
    t = TT(d); return np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t))) * np.exp(-t * 3) * np.minimum(1, t / 0.005)
def dr_kick():
    t = TT(0.35); return np.sin(2 * np.pi * (45 * t + 75 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)
def dr_snare():
    t = TT(0.2); n = rng.standard_normal(len(t)); return (0.7 * np.diff(n, prepend=0) * 0.5 + 0.4 * np.sin(2 * np.pi * 185 * t)) * np.exp(-t * 22)
def dr_hat():
    t = TT(0.06); n = rng.standard_normal(len(t)); return np.diff(n, prepend=0) * 0.35 * np.exp(-t * 70)
def dr_tom(f=110):
    t = TT(0.5); return np.sin(2 * np.pi * f * (1 - 0.25 * t) * t) * np.exp(-t * 7)
def heart():
    t = TT(0.6); k = lambda o: np.where(t >= o, np.sin(2 * np.pi * 52 * (t - o)) * np.exp(-(t - o) * 14), 0); return k(0) + 0.7 * k(0.22)
def tick():
    t = TT(0.03); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200)
def riser(d):
    t = TT(d); n = np.convolve(rng.standard_normal(len(t)), np.ones(6) / 6, mode="same"); return (n * 0.5 + 0.5 * np.sin(2 * np.pi * (200 + 600 * (t / d) ** 2) * t)) * (t / d) ** 2.2
def stinger():
    t = TT(2.5); n = np.diff(rng.standard_normal(len(t)), prepend=0); return np.sin(2 * np.pi * 55 * t) * np.exp(-t * 1.6) * 1.2 + n * 0.25 * np.exp(-t * 3)
def M(sig, at, g): put(music, sig, at, g)
def steps(a, b, bpm, sub=4):
    st = 60 / bpm / sub; t = a; k = 0
    while t < b - 0.05: yield t, k; t += st; k += 1
# acordes (graus MIDI)
Am, F, C, G, Em, Dm, E = [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [52, 55, 59], [50, 53, 57], [52, 56, 59]

# 1) curiosidade — pad + caixinha + vibração do celular (L0–2)
a, b = 0.0, L_(3) - 0.2
for i, ch in enumerate([Am, F, C, G]): M(inst_pad([NOTE(n) for n in ch], (b - a) / 4 + 1.5), a + i * (b - a) / 4, 0.5)
for t, k in steps(a + 0.4, b, 76, 2): M(inst_box(NOTE([76, 79, 84, 79, 81, 79, 76, 72][k % 8])), t, 0.2)
M(riser(2.0), L_(3) - 2.2, 0.3)
# 2) grana chegando — groove leve: marimba + baixo + bateria (L3–8)
def groove(a, b, bpm, prog, inten=1.0, lead=inst_marimba):
    for t, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        if k % 2 == 0: M(lead(NOTE(ch[(k // 2) % 3] + 12 + (12 if k % 8 == 6 else 0))), t, 0.26 * inten)
        if k % 4 == 0: M(inst_bass(NOTE(ch[0] - 12 + (7 if k % 16 == 12 else 0)), 0.3), t, 0.5 * inten)
        if k % 8 == 0: M(dr_kick(), t, 0.55 * inten)
        if k % 8 == 4: M(dr_snare(), t, 0.3 * inten)
        if k % 2 == 1: M(dr_hat(), t, 0.22 * inten)
groove(L_(3) - 0.2, L_(9) - 0.25, 104, [C, Am, F, G], 0.9)
# 3) os fatos — pensativo: pizzicato + tic-tac (L9–11)
a, b = L_(9) - 0.2, L_(12) - 0.25
for t, k in steps(a, b, 92, 2): M(inst_pizz(NOTE([Am, Dm, E, Am][(k // 8) % 4][k % 3] + 12)), t, 0.28)
for t, k in steps(a, b, 92, 1): M(tick(), t, 0.3)
# 4) caçando mentira — groove mais forte, sobe até os R$ 50 mil (L12–22)
groove(L_(12) - 0.2, L_(16) - 0.2, 112, [Am, F, C, G], 1.0, inst_pluck)
M(stinger(), L_(16) - 0.05, 0.5)
groove(L_(16) + 0.4, L_(20) - 0.2, 116, [C, G, Am, F], 1.05)
for t, k in steps(L_(20) - 0.2, L_(22) - 0.2, 84, 2): M(inst_pizz(NOTE([Am, Em, F, E][(k // 8) % 4][k % 3] + 12)), t, 0.25)
groove(L_(22) - 0.1, L_(23) - 0.3, 120, [C, G], 1.1)
# 5) "origem: mãe" — corta a música, coração + pad tenso (L23–24)
a, b = L_(23) - 0.1, L_(25) - 0.2
M(inst_pad([NOTE(n) for n in [52, 55, 59]], b - a + 1, att=1.5), a, 0.5)
for t, k in steps(a + 0.5, b, 72, 1): M(heart(), t, 0.6)
M(riser(2.0), L_(25) - 2.2, 0.3)
# 6) almoço na casa da mãe — violão doce (L25–31)
a, b = L_(25) - 0.2, L_(32) - 0.3
for t, k in steps(a, b, 80, 2):
    ch = [C, Em, F, G][(k // 8) % 4]; M(inst_pluck(NOTE(ch[[0, 1, 2, 1, 2, 1, 0, 2][k % 8]] + 12), 1.5, 0.8), t, 0.28)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0] - 12), 2.0, 0.6), t, 0.38)
# 7) extrato de madrugada — piano triste (L32–34)
a, b = L_(32) - 0.2, L_(34) - 0.2
for i, (t, k) in enumerate(steps(a, b, 56 / 4, 1)):
    ch = [Am, F, C, E][i % 4]; M(inst_pad([NOTE(n) for n in ch], 4.6, att=1.2), t, 0.4); M(inst_piano(NOTE(ch[0] - 12), 3.5), t, 0.35)
for t, k in steps(a, b, 56, 2): M(inst_piano(NOTE([76, 72, 69, 72, 74, 71, 68, 71][k % 8]), 1.6, 0.6), t, 0.2)
M(stinger(), L_(34) - 0.05, 0.8)
# 8) as contas e a cirurgia — drama que cresce (L35–42)
a, b = L_(35) - 0.2, L_(42) - 0.3
for i, (t, k) in enumerate(steps(a, b, 60 / 4, 1)):
    ch = [Am, F, Dm, E][i % 4]; M(inst_pad([NOTE(n) for n in ch] + [NOTE(ch[0] + 12)], 5.5, att=1.4), t, 0.35 + 0.03 * i); M(inst_piano(NOTE(ch[0] - 12), 3.8), t, 0.38)
for t, k in steps(L_(37), b, 60, 2): M(inst_piano(NOTE([69, 72, 76, 72][k % 4]), 1.4, 0.5), t, 0.16)
M(stinger(), L_(39) - 0.05, 0.6)
# 9) decisão: pagar tudo — piano firme subindo (L42)
a, b = L_(42) - 0.2, L_(43) - 0.2
for t, k in steps(a, b, 88, 2): M(inst_piano(NOTE([60, 64, 67, 72, 76, 72, 67, 64][k % 8] + 12), 1.2, 0.7), t, 0.25)
M(inst_pad([NOTE(n) for n in [60, 64, 67]], b - a + 1, att=0.8), a, 0.4)
# 10) hospital — monitor + coração + pad tenso (L43–46), alívio (L47)
a, b = L_(43) - 0.2, L_(47) - 0.2
M(inst_pad([NOTE(n) for n in [45, 52, 57]], b - a + 1.5, att=2.0), a, 0.45)
for t, k in steps(a, b, 70, 1): M(tone(NOTE(93), 0.12, a=0.003, r=0.08, harm=(1,)), t, 0.25)
for t, k in steps(L_(45), b, 66, 1): M(heart(), t, 0.5)
M(inst_pad([NOTE(n) for n in [60, 64, 67, 72]], 5, att=0.4), L_(47) - 0.1, 0.55)
for k2 in range(4): M(inst_box(NOTE([72, 76, 79, 84][k2] + 12)), L_(47) + k2 * 0.18, 0.25)
# 11) quarto do hospital e o Davi — caixinha + violão (L48–50)
a, b = L_(48) - 0.2, L_(51) - 0.3
for t, k in steps(a, b, 72, 2):
    ch = [F, C, G, Am][(k // 8) % 4]; M(inst_pluck(NOTE(ch[k % 3] + 12), 1.4, 0.9), t, 0.24)
    if k % 4 == 0: M(inst_box(NOTE(ch[2] + 24)), t, 0.12)
# 12) final de esperança — piano + cordas + bateria suave (L51–fim), com marimba no bolo
a, b = L_(51) - 0.2, TOTAL
prog = [F, G, C, Am]
for i, (t, k) in enumerate(steps(a, b, 70 / 4, 1)):
    ch = prog[i % 4]; M(inst_pad([NOTE(n + 12) for n in ch], 60 / 70 * 4 + 1.5, att=0.8), t, 0.42); M(inst_bass(NOTE(ch[0] - 12), 1.5), t, 0.35)
for t, k in steps(a, b, 70, 2):
    ch = prog[(k // 8) % 4]; M(inst_piano(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12), 1.5, 0.7), t, 0.22)
    if t > L_(54) - 0.3:
        if k % 8 == 0: M(dr_kick(), t, 0.35)
        if k % 8 == 4: M(dr_snare(), t, 0.16)
        if k % 2 == 1: M(dr_hat(), t, 0.13)
for t, k in steps(L_(56), L_(57) - 0.2, 104, 2): M(inst_marimba(NOTE([C, G][(k // 8) % 2][k % 3] + 24)), t, 0.15)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
pop = lambda f=700: tone(f, 0.16, r=0.05, harm=(1, 0.3))
whoosh = lambda: noise(0.5, a=0.2, r=0.2)
bell = lambda: tone(NOTE(84), 1.2, r=0.5, harm=(1, 0.5, 0.25)) + tone(NOTE(91), 1.2, r=0.35, harm=(1,))
def kaching():
    t = TT(0.6); return (np.sin(2 * np.pi * NOTE(96) * t) + 0.6 * np.sin(2 * np.pi * NOTE(103) * t)) * np.exp(-t * 6) * np.where(t > 0.06, 1, 0) + np.diff(rng.standard_normal(len(t)), prepend=0) * 0.3 * np.exp(-t * 40)
def buzz():
    t = TT(0.5); return np.sin(2 * np.pi * 150 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 8 * t))) * np.exp(-t * 2)
def wn(li, pat, n=0):
    c = 0
    for w in L[li]["words"]:
        if pat in w["text"].lower():
            if c == n: return w["start"]
            c += 1
    return L[li]["start"]
for li in range(1, len(L)): put(sfx, whoosh(), L_(li) - 0.35, 0.18)
# cada "plim" (mentira) = caixa registradora
for li, l in enumerate(L):
    for wi, w in enumerate(l["words"]):
        if w["text"].lower().startswith("plim") and not (wi > 0 and "nenhum" in l["words"][wi - 1]["text"].lower()):
            put(sfx, kaching(), w["start"] - 0.04, 0.55)
for at in (wn(0, "recebeu"), wn(1, "outra", 0), wn(1, "outra", 1), wn(23, "cem"), wn(56, "cem")):
    put(sfx, buzz(), at - 0.3, 0.6); put(sfx, kaching(), at, 0.5)
put(sfx, bell(), wn(16, "doze"), 0.5); put(sfx, bell(), wn(22, "cinquenta"), 0.5)
put(sfx, noise(0.08, a=0.001, r=0.03), L_(12) + 0.2, 0.6)                 # clique da TV
for k in range(3): put(sfx, noise(0.18, a=0.01, r=0.08), wn(29, "tosse") + k * 0.3, 0.45)
put(sfx, tone(NOTE(60), 1.6, r=0.9, harm=(1, 0.5)), wn(42, "pagou"), 0.4)
for k in range(3): put(sfx, tone(NOTE(84 + k * 4), 0.8, r=0.4), wn(53, "agora") + k * 0.12, 0.4)
put(sfx, pop(800), L_(57) - 0.05, 0.7)

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
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%05d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "/home/user/longo2_mentiras.mp4"], check=True)
print("video -> /home/user/longo2_mentiras.mp4")
