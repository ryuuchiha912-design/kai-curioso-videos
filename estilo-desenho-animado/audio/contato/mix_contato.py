"""Trilha + efeitos — "E se você visse como as pessoas salvaram o seu número?" (muda a cada parte da história).
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
    for t, k in steps(a, b, 76, 2): M(inst_box(NOTE([76, 79, 83, 79, 81, 79, 76, 71][k % 8]), detune=det), t, 0.22 * g)
def groove(a, b, bpm, prog, inten=1.0, drums=True):
    for t, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        if k % 2 == 0: M(inst_marimba(NOTE(ch[(k // 2) % 3] + 12 + (12 if k % 8 == 6 else 0))), t, 0.26 * inten)
        if k % 4 == 0: M(inst_bass(NOTE(ch[0] - 12), 0.3), t, 0.45 * inten)
        if drums:
            if k % 8 == 0: M(dr_kick(), t, 0.5 * inten)
            if k % 8 == 4: M(dr_snare(), t, 0.25 * inten)
            if k % 2 == 1: M(dr_hat(), t, 0.18 * inten)
# 0) gancho — mistério: pad + caixinha + tic-tac
M(inst_pad([NOTE(n) for n in (45, 52, 57)], L_(1) + 0.4, att=0.3), 0.0, 0.42); box_motif(0.15, L_(1) - 0.15)
for t, k in steps(0.3, L_(1) - 0.2, 90, 1): M(tick(), t, 0.22)
# 1-2) a regra, a mãe, a menina — brincalhão (marimba, depois bateria leve)
groove(L_(1) - 0.15, L_(2) - 0.1, 108, [C, Am, F, G], 0.8, drums=False)
groove(L_(2) - 0.1, L_(3) - 0.15, 112, [F, G, C, Am], 0.95)
# 3) lembrança — violão quente; corte seco na briga
br = wn(3, "briga") - 0.05
for t, k in steps(L_(3) - 0.15, br, 84, 2):
    ch = [C, Em, F, G][(k // 8) % 4]; M(inst_pluck(NOTE(ch[[0, 1, 2, 1, 2, 1, 0, 2][k % 8]] + 12), 1.5, 0.8), t, 0.28)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0] - 12), 2.0, 0.6), t, 0.36)
M(stinger(), br, 0.35)
for t, k in steps(br + 0.6, L_(4) - 0.15, 60, 1): M(inst_piano(NOTE([57, 55][k % 2]), 1.6, 0.5), t, 0.2)
# 4-5) o número sobe / hipóteses — pizzicato cômico-tenso + baixo andando
for t, k in steps(L_(4) - 0.15, L_(6) - 0.15, 104, 2):
    ch = [Am, Dm, E, Am][(k // 8) % 4]; M(inst_pizz(NOTE(ch[k % 3] + 12)), t, 0.26)
    if k % 2 == 0: M(inst_bass(NOTE(ch[0] - 12 + [0, 3, 5, 7][(k // 2) % 4]), 0.25), t, 0.38)
# 6) a mudança — piano pesado + impacto no "sábado"
for i, (t, k) in enumerate(steps(L_(6) - 0.15, L_(7) - 0.15, 60, 0.5)):
    ch = [Am, F][i % 2]; M(inst_pad([NOTE(n) for n in ch], 2.2, att=0.4), t, 0.33); M(inst_piano(NOTE(ch[0] - 12), 2.0), t, 0.4)
M(timp(), wn(6, "sábado") - 0.02, 0.6)
# 7) ponto de ônibus — suspense: tic-tac + coração + piano espaçado
for t, k in steps(L_(7) - 0.15, L_(8) - 0.3, 92, 1): M(tick(), t, 0.25 + 0.15 * (t - L_(7)) / (L_(8) - L_(7)))
heartbeat(70, 92, L_(7), L_(8) - 0.3, 0.45)
for t, k in steps(L_(7), L_(8) - 0.3, 46, 1): M(inst_piano(NOTE([64, 60, 62, 59][k % 4]), 2.2, 0.4), t, 0.16)
M(riser(1.6), L_(8) - 1.9, 0.35)
# 8-10) a revelação e o seu celular — silêncio curto, depois piano + cordas crescendo
for i, (t, k) in enumerate(steps(L_(8) + 0.15, L_(11) - 0.3, 64 / 4, 1)):
    ch = [F, G, Em, Am][i % 4]; M(inst_pad([NOTE(n) for n in ch] + [NOTE(ch[0] + 12)], min(4.5, L_(11) - t), att=1.0, rel=0.4), t, 0.3 + 0.04 * i); M(inst_piano(NOTE(ch[0] - 12), 3.6), t, 0.36)
for t, k in steps(L_(8) + 0.15, L_(11) - 0.3, 64, 2): M(inst_piano(NOTE([69, 72, 76, 72, 71, 74, 77, 74][k % 8]), 1.4, 0.5), t, 0.15)
M(choir([NOTE(n) for n in (57, 64, 69)], L_(11) - L_(10), att=1.5), L_(10), 0.28)
# 11) vibra… Player 2 — respiro, depois esperança (marimba + bateria leve)
pl = wn(11, "player") - 0.05
M(riser(1.4), pl - 1.4, 0.3)
groove(pl, L_(12) - 0.1, 112, [C, G, Am, F], 1.0)
# 12) final quentinho
for t, k in steps(L_(12) - 0.1, TOTAL, 84, 2):
    ch = [F, C, G, Am][(k // 8) % 4]; M(kalimba(NOTE(ch[[0, 2, 1, 2][k % 4]] + 24)), t, 0.22)
    if k % 8 == 0: M(rhodes(NOTE(ch[0]), 2.4), t, 0.22)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
def whoosh2():
    t = TT(0.45); return hp(lp(rng.standard_normal(len(t)), 4), 30) * np.sin(np.pi * t / 0.45) ** 2 * 0.8
def pop_():
    t = TT(0.18); f = 500 + 900 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * 0.8
def ding(f=1320):
    t = TT(0.8); return np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * 0.6
def key_click():
    t = TT(0.04); return hp(rng.standard_normal(len(t)), 2) * np.exp(-t * 160) * 0.6
def buzz(d=0.9):
    t = TT(d); return np.sign(np.sin(2 * np.pi * 180 * t)) * 0.25 * lp(np.ones(len(t)), 3) * ((t * 6) % 1 < 0.6)
def slam():
    t = TT(0.6); return np.sin(2 * np.pi * 55 * t) * np.exp(-t * 9) * 1.6 + lp(rng.standard_normal(len(t)), 6) * np.exp(-t * 22)
def sparkle_():
    out = np.zeros(int(1.2 * SR))
    for i, f in enumerate([1568, 1976, 2349, 3136]):
        s = ding(f) * 0.5; j = int(i * 0.07 * SR); out[j:j + len(s)] += s[: len(out) - j]
    return out
for li in range(1, len(L)): put(sfx, whoosh2(), L_(li) - 0.3, 0.18)
put(sfx, pop_(), 0.25, 0.5); put(sfx, ding(1560), wn(0, "quatrocentos") - 0.02, 0.4)
for i in range(6): put(sfx, pop_(), L_(1) + 0.3 + i * 0.35, 0.35)
put(sfx, pop_(), L_(2) + 0.2, 0.45); put(sfx, pop_(), wn(2, "menina") + 0.5, 0.45)
put(sfx, slam(), wn(3, "briga") - 0.02, 0.8)
for w_ in ("treze", "catorze"): put(sfx, ding(1760), wn(4, w_) - 0.02, 0.4)
for w_ in ("dívida", "raiva", "vingança"): put(sfx, pop_(), wn(5, w_) - 0.05, 0.5)
a, b = wn(7, "escreve"), wn(7, "apaga")
for k in range(10): put(sfx, key_click(), a + 0.11 * k, 0.5)
for k in range(10): put(sfx, key_click(), b + 0.05 * k, 0.35)
put(sfx, ding(1760), wn(7, "quatrocentos") - 0.02, 0.4)
put(sfx, ding(1320), wn(9, "quatrocentos") - 0.02, 0.45)
a = wn(10, "escreve")
for k in range(10): put(sfx, key_click(), a + 0.11 * k, 0.5)
put(sfx, whoosh2(), wn(10, "manda") - 0.05, 0.6); put(sfx, ding(2093), wn(10, "manda") + 0.3, 0.35)
put(sfx, buzz(0.9), wn(11, "vibra") - 0.05, 0.5)
put(sfx, sparkle_(), wn(11, "player") - 0.05, 0.6)

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
OUT = "../../out/contato/final.mp4"
if "--video" in sys.argv:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", sys.argv[sys.argv.index("--video") + 1], "-i", "mix.wav", "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT], check=True)
    print("video -> " + OUT + "")
