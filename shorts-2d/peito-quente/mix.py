"""Trilha + efeitos — Kai: "E se você SENTISSE quando alguém pensa em você?" (muda a cada parte da história).
Uso: python3 mix.py  -> /home/user/kai_peito_quente.mp4"""
import json, subprocess, wave, sys
import numpy as np
SR = 44100
tl = json.load(open("timeline.json")); L = tl["lines"]; TOTAL = tl["total"]
N = int((TOTAL + 0.5) * SR)
rng = np.random.default_rng(17)
TT = lambda d: np.arange(int(d * SR)) / SR
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
L_ = lambda i: L[i]["start"]
def wn(li, pat, n=0):
    c = 0
    for w in L[li]["words"]:
        if pat in w["text"].lower():
            if c == n: return w["start"]
            c += 1
    return L[li]["start"]
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
def env(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def tone(f, d, a=0.005, r=0.6, harm=(1, 0.35, 0.12)):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, r)
def noise(d, a=0.002, r=0.1):
    n = int(d * SR); return np.convolve(rng.standard_normal(n), np.ones(30) / 30, mode="same") * env(n, a, r)
music = np.zeros(N)
def M(sig, at, g): put(music, sig, at, g)
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

Am, F, C, G, Em, Dm, E = [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [52, 55, 59], [50, 53, 57], [52, 56, 59]
def box_motif(a, b, g=1.0, det=0.0):
    for t, k in steps(a, b, 72, 2): M(inst_box(NOTE([76, 79, 83, 79, 81, 79, 76, 71][k % 8]), detune=det), t, 0.22 * g)
# 1) gancho 03:17 — caixinha + pad grave + batimento
M(inst_pad([NOTE(n) for n in (45, 52, 57)], L_(1) + 0.5, att=0.4), 0.0, 0.45); box_motif(0.2, L_(1) - 0.2); heartbeat(62, 70, 0.3, L_(1) - 0.3, 0.45)
# 2) a regra + Bia — marimba alegre, depois bateria leve
def groove(a, b, bpm, prog, inten=1.0, drums=True):
    for t, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        if k % 2 == 0: M(inst_marimba(NOTE(ch[(k // 2) % 3] + 12 + (12 if k % 8 == 6 else 0))), t, 0.26 * inten)
        if k % 4 == 0: M(inst_bass(NOTE(ch[0] - 12), 0.3), t, 0.45 * inten)
        if drums:
            if k % 8 == 0: M(dr_kick(), t, 0.5 * inten)
            if k % 8 == 4: M(dr_snare(), t, 0.25 * inten)
            if k % 2 == 1: M(dr_hat(), t, 0.18 * inten)
groove(L_(1) - 0.2, L_(2) - 0.2, 104, [C, Am, F, G], 0.8, drums=False)
groove(L_(2) - 0.2, wn(3, "era") - 0.1, 108, [F, G, C, Am], 0.95)
# 3) "era a caneta" — corte seco + pizzicato cômico
for t, k in steps(wn(3, "era") + 0.4, L_(4) - 0.2, 120, 2): M(inst_pizz(NOTE([60, 59, 57, 55][k % 4])), t, 0.25)
# 4) avó — violão doce
for t, k in steps(L_(4) - 0.2, L_(5) - 0.2, 80, 2):
    ch = [C, Em, F, G][(k // 8) % 4]; M(inst_pluck(NOTE(ch[[0, 1, 2, 1, 2, 1, 0, 2][k % 8]] + 12), 1.5, 0.8), t, 0.28)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0] - 12), 2.0, 0.6), t, 0.36)
# 5) 03:17 de novo — mistério + tic-tac
M(inst_pad([NOTE(n) for n in (45, 52, 56)], L_(7) - L_(5) + 1, att=0.8), L_(5) - 0.2, 0.45); box_motif(L_(5), L_(7) - 0.2, 1.0, 0.012)
for t, k in steps(L_(5), L_(7) - 0.2, 80, 1): M(tick(), t, 0.3)
heartbeat(70, 84, L_(6), L_(7) - 0.2, 0.45)
# 6) investigação — pizzicato
for t, k in steps(L_(7) - 0.2, L_(8) - 0.2, 100, 2):
    ch = [Am, Dm, E, Am][(k // 8) % 4]; M(inst_pizz(NOTE(ch[k % 3] + 12)), t, 0.26)
    if k % 2 == 0: M(inst_bass(NOTE(ch[0] - 12 + [0, 3, 5, 7][(k // 2) % 4]), 0.25), t, 0.38)
# 7) o pai e a briga — piano pesado
for i, (t, k) in enumerate(steps(L_(8) - 0.2, L_(10) - 0.2, 60 / 4, 1)):
    ch = [Am, F, Dm, E][i % 4]; M(inst_pad([NOTE(n) for n in ch], 4.6, att=1.0), t, 0.35); M(inst_piano(NOTE(ch[0] - 12), 3.8), t, 0.4)
for t, k in steps(L_(8), L_(10) - 0.2, 60, 2): M(inst_piano(NOTE([69, 72, 76, 72][k % 4]), 1.4, 0.5), t, 0.16)
# 8) dói + quente ou frio — tensão subindo
heartbeat(84, 132, L_(10) - 0.1, L_(13) - 0.3, 0.55)
M(cluster(57, L_(13) - L_(10)), L_(10), 0.25)
for t, k in steps(L_(11), L_(13) - 0.3, 96, 1): M(tick(), t, 0.25 + 0.2 * (t - L_(11)) / (L_(13) - L_(11)))
M(riser(2.6), L_(13) - 2.8, 0.4)
# 9) a fresta: silêncio, depois piano suave (o pai)
for t, k in steps(wn(13, "pai"), L_(15) - 0.2, 56, 2): M(inst_piano(NOTE([72, 76, 79, 76, 74, 77, 81, 77][k % 8]), 1.8, 0.5), t, 0.2)
M(inst_pad([NOTE(n) for n in (48, 55, 64)], L_(15) - L_(14) + 1, att=1.5), L_(14), 0.35)
# 10) pensa nele — cordas crescendo até o pico; corte no "frio"
cut = wn(17, "frio") - 0.05
for i, (t, k) in enumerate(steps(L_(15) - 0.2, cut, 64 / 4, 1)):
    ch = [F, G, Em, Am][i % 4]; M(inst_pad([NOTE(n) for n in ch] + [NOTE(ch[0] + 12)], min(4.5, cut - t + 0.1), att=1.0, rel=0.3), t, 0.36 + 0.05 * i); M(inst_piano(NOTE(ch[0] - 12), min(3.8, cut - t + 0.1)), t, 0.38)
M(choir([NOTE(n) for n in (57, 64, 69)], cut - L_(16) + 0.1, att=1.5), L_(16), 0.35)
M(inst_piano(NOTE(57), 3.5), cut + 0.05, 0.45)
# 11) volta pro começo — rebobinar + caixinha do começo
M(revswell(1.0), L_(18) - 0.6, 0.3); box_motif(L_(18), L_(19) - 0.1)
# 12) final quentinho
for t, k in steps(L_(19) - 0.1, TOTAL, 84, 2):
    ch = [F, C, G, Am][(k // 8) % 4]; M(kalimba(NOTE(ch[[0, 2, 1, 2][k % 4]] + 24)), t, 0.2)
    if k % 8 == 0: M(rhodes(NOTE(ch[0]), 2.4), t, 0.22)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
def sizzle(d):
    t = TT(d); return hp(rng.standard_normal(len(t)), 3) * (rng.random(len(t)) < 0.08) * 0.8 * adsr(len(t), 0.2, 0.2, 0.8, 0.4)
def whoosh2():
    t = TT(0.45); return hp(lp(rng.standard_normal(len(t)), 4), 30) * np.sin(np.pi * t / 0.45) ** 2 * 0.8
def deflate():
    t = TT(0.9); f = 500 * np.exp(-t * 2.2) + 80; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.7
def slam():
    t = TT(0.6); return np.sin(2 * np.pi * 55 * t) * np.exp(-t * 9) * 1.6 + lp(rng.standard_normal(len(t)), 6) * np.exp(-t * 22)
def creak():
    t = TT(1.0); f = 160 + 50 * np.sin(2 * np.pi * 1.1 * t); return lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (rng.random(len(t)) < 0.4), 4) * np.exp(-t * 1.5) * 0.5
def thump():
    t = TT(0.3); return np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18) * 1.2
def ding(f=1320):
    t = TT(0.8); return np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * 0.6
for li in range(1, len(L)):
    if li not in (13, 17, 18): put(sfx, whoosh2(), L_(li) - 0.3, 0.2)
put(sfx, sizzle(L_(1)), 0.0, 0.35)
put(sfx, ding(1560), wn(2, "bia") - 0.05, 0.4)
put(sfx, deflate(), wn(3, "era") - 0.1, 0.6)
put(sfx, ding(1180), wn(4, "avó") - 0.05, 0.35)
for k, w in enumerate(["dormindo", "dormindo", "roncando"]): put(sfx, thump(), wn(7, w, 1 if k == 1 else 0) + 0.2, 0.6)
put(sfx, slam(), wn(9, "bateu") - 0.02, 0.9)
put(sfx, sizzle(L_(13) - L_(11)), L_(11), 0.4); put(sfx, sizzle(2.5), wn(12, "fervendo") - 0.2, 0.7)
put(sfx, creak(), L_(13) + 0.2, 0.55)
put(sfx, sizzle(2.0), wn(16, "mão") + 0.1, 0.4)
rw = TT(0.8); put(sfx, np.sin(2 * np.pi * (1200 - 900 * rw / 0.8) * rw) * 0.3 + hp(rng.standard_normal(len(rw)), 3) * 0.3, L_(18) - 0.5, 0.5)

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
voice = read("narr_full.wav"); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
vr = grms(voice)
music *= 0.5 * vr / grms(music); sfx *= 0.5 * vr / grms(sfx)
for arr in (music, sfx):
    cap = 0.8 * np.abs(voice).max()
    if np.abs(arr).max() > cap: arr *= cap / np.abs(arr).max()
db = lambda a: 20 * np.log10(grms(a) / vr)
print(f"trilha {db(music):+.1f} dB | efeitos {db(sfx):+.1f} dB")
mix = voice + music + sfx; mix /= max(1.0, np.abs(mix).max() / 0.98)
with wave.open("mix_raw.wav", "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "mix_raw.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
gain = -14 - float(json.loads(m[m.rindex("{"): m.rindex("}") + 1])["input_i"])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.891:level=false", "-ar", "48000", "-ac", "2", "mix.wav"], check=True)
print(f"ganho {gain:+.2f} dB -> mix.wav")
if "--audio" not in sys.argv:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%04d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "/home/user/kai_peito_quente.mp4"], check=True)
    print("video -> /home/user/kai_peito_quente.mp4")
