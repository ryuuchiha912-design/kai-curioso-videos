"""Trilha NOVA (lo-fi + synthwave + cinema + terror + kalimba/flauta + coral) — série "30 Dias Preso no Aeroporto" Parte 1.
Nenhum instrumento repetido dos vídeos anteriores. Trilha e efeitos a 50% da voz (-6 dB), mix final ~-14 LUFS.
Uso: python3 mix.py [--audio]   -> /home/user/aero1.mp4
"""
import json, subprocess, sys, wave
import numpy as np

SR = 44100
tl = json.load(open("timeline.json")); L = tl["lines"]; TOTAL = tl["total"]
N = int((TOTAL + 0.5) * SR)
rng = np.random.default_rng(11)
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
def lp(x, k=8):  # passa-baixa simples (média móvel)
    return np.convolve(x, np.ones(k) / k, mode="same")
def hp(x, k=8): return x - lp(x, k)
def adsr(n, a, d, s, r):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return e * np.clip((dur - t) / max(r, 1e-4), 0, 1)
def steps(a, b, bpm, sub=4, swing=0.0):
    st = 60 / bpm / sub; t = a; k = 0
    while t < b - 0.05:
        yield t + (st * swing if k % 2 == 1 else 0), k; t += st; k += 1

# ------------------------------------------------------------------ instrumentos novos
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
Fm7, Em7, Dm7, Cm7 = [53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]
Am, Fm, G, E = [57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]

def lofi(a, b, bpm=78, drums=True, g=1.0, prog=(Fm7, Em7, Dm7, Cm7)):
    bar = 240 / bpm; t = a; i = 0
    while t < b - 0.2:
        ch = prog[i % len(prog)]
        for k, n in enumerate(ch): M(rhodes(NOTE(n), bar * 0.95), t + k * 0.012, 0.18 * g)
        M(rhodes(NOTE(ch[0] - 12), bar), t, 0.22 * g)
        for k in range(2): M(rhodes(NOTE(ch[[3, 2, 1, 2][(i + k) % 4]] + 12), 0.8), t + bar * (0.5 + 0.25 * k), 0.09 * g)
        t += bar; i += 1
    M(vinyl(b - a), a, 1.0 * g)
    if drums:
        for tt, k in steps(a, b, bpm, 4, swing=0.18):
            if k % 16 in (0, 10): M(lofi_kick(), tt, 0.55 * g)
            if k % 8 == 4: M(lofi_snare(), tt, 0.32 * g)
            if k % 2 == 0: M(lofi_hat(), tt, 0.22 * g)
def synthwave(a, b, bpm=104, g=1.0, prog=(Am, Fm, [48, 52, 55], G)):
    for tt, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        M(arp_sq(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12 + (12 if k % 8 >= 4 else 0))), tt, 0.16 * g)
        if k % 2 == 0: M(sub_pulse(NOTE(ch[0] - 24)), tt, 0.4 * g)
        if k % 16 == 8: M(gated_snare(), tt, 0.22 * g)
def cinema(a, b, bpm=96, g=1.0, root=45, taikos=True):
    for tt, k in steps(a, b, bpm, 4):
        M(stacc(NOTE(root + [0, 0, 12, 0, 3, 0, 12, 7][k % 8])), tt, 0.18 * g)
        if taikos and k % 8 == 0: M(taiko(), tt, 0.6 * g)
        if taikos and k % 16 == 14: M(taiko(), tt, 0.4 * g)
def horror(a, b, g=1.0, whispers=2, glass=True):
    M(rumble(b - a + 1), a, 0.9 * g)
    M(cluster(60, b - a + 1), a, 0.35 * g)
    for i in range(whispers): M(whisper(1.2), a + (i + 0.5) * (b - a) / max(whispers, 1), 0.35 * g)
    if glass:
        for tt, k in steps(a + 0.5, b, 40, 1): M(glassharm(NOTE([76, 75, 79, 70][k % 4]), 2.2, det=0.03), tt, 0.16 * g)
def kal(a, b, bpm=88, g=1.0, prog=(Fm7, Cm7, Dm7, Em7), fl=True):
    for tt, k in steps(a, b, bpm, 2):
        ch = prog[(k // 8) % len(prog)]
        M(kalimba(NOTE(ch[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12)), tt, 0.22 * g)
        if k % 8 == 0: M(rhodes(NOTE(ch[0] - 12), 2.4), tt, 0.18 * g)
    if fl:
        for tt, k in steps(a + 1.0, b, bpm / 4, 1): M(flute(NOTE([72, 74, 76, 71, 69, 72][k % 6]), 60 / bpm * 3.6), tt, 0.16 * g)
def cida_waltz(a, b, g=1.0):  # valsa estranha da Dona Cida (harmônica de vidro desafinada, 3/4)
    for tt, k in steps(a, b, 84, 1):
        if k % 3 == 0: M(glassharm(NOTE([45, 41, 43, 40][(k // 3) % 4]) * 2, 1.6, det=0.02), tt, 0.16 * g)
        else: M(glassharm(NOTE([69, 72, 71, 68][(k // 3) % 4] + (0 if k % 3 == 1 else 4)), 0.9, det=0.035), tt, 0.1 * g)

# ------------------------------------------------------------------ roteiro musical (muda a cada parte)
horror(0.0, L_(3) - 0.4, 1.0, whispers=2); M(revswell(1.6), wn(2, "último") - 1.5, 0.4); M(scare(), wn(2, "último"), 0.45)
lofi(L_(3) - 0.2, L_(5) - 0.2, 78, drums=False)                               # aniversário da mãe
lofi(L_(5) - 0.2, L_(9) - 0.25, 82, drums=True)                               # o caos + o áudio
synthwave(L_(9) - 0.2, L_(13) - 0.2, 104)                                       # o aeroporto lotado
M(rumble(L_(14) - L_(13) + 1), L_(13) - 0.2, 0.9); heartbeat(60, 72, L_(13), L_(14) - 0.3, 0.5)
cinema(L_(14) - 0.2, L_(17) - 0.2, 96)                                          # as regras
M(braam(33), wn(17, "porque") - 0.3, 0.8); M(whisper(1.6), wn(17, "coisas"), 0.5); M(rumble(L_(18) - L_(17)), L_(17), 0.6)
kal(L_(18) - 0.2, L_(21) - 0.2, 88)                                             # a Lia
cida_waltz(L_(21) - 0.2, L_(23) - 0.2)                                          # Dona Cida
M(braam(31), wn(23, "lugar") - 0.4, 0.8); M(cluster(58, 3), wn(23, "lugar"), 0.4)
cinema(L_(24) - 0.2, wn(27, "para") - 0.3, 104, root=43)                       # a corda
for tt, k in steps(L_(25), wn(27, "para") - 0.3, 104, 2): M(timp(), tt, 0.25 if k % 4 == 0 else 0.0)
M(scare(), wn(28, "sem") - 0.1, 0.6)                                            # a corda volta sem ninguém
horror(L_(29) - 0.2, L_(32) - 0.3, 1.1, whispers=3); M(scare(), wn(31, "rosto") - 0.05, 0.4)
lofi(L_(32) - 0.2, L_(36) - 0.3, 70, drums=False, g=0.9, prog=(Dm7, Cm7, [46, 50, 53, 57], [45, 48, 52, 55]))   # áudios tristes
M(rumble(L_(39) - L_(36)), L_(36) + 0.4, 0.9); M(cluster(55, L_(38) - L_(36)), L_(36) + 0.6, 0.3)   # o gerador para
kal(L_(39) - 0.2, L_(41) - 0.3, 70, g=0.8, prog=(Dm7, [46, 50, 53, 57], Fm7, Cm7))
cida_waltz(L_(41) - 0.2, L_(45) - 0.2, 1.1); M(cluster(57, 2.5), wn(43, "muito"), 0.35)
lofi(L_(45) - 0.2, L_(46) - 0.2, 70, drums=False, g=0.8)                       # "eu vou chegar"
heartbeat(70, 120, L_(46) - 0.1, L_(47) + 1.0, 0.55); M(scare(), wn(47, "vazio") - 0.05, 0.55)
horror(L_(48) - 0.2, L_(49) - 0.2, 1.0, whispers=2, glass=False)
cinema(L_(49) - 0.2, L_(51) - 0.2, 72, g=0.9, root=40)                         # as pessoas somem
for at in (wn(49, "trinta"), L_(50) + 0.4): M(braam(28), at - 0.2, 0.7)
M(scare(), wn(51, "apagados") - 0.05, 0.5)
lofi(L_(52) - 0.2, L_(55) - 0.2, 74, drums=True, g=0.8)                        # dormindo em roda
synthwave(L_(55) - 0.2, L_(58) - 0.1, 116, g=0.8, prog=(Am, Am, Fm, E))         # o sinal
lofi(L_(58) - 0.1, L_(60) - 0.2, 66, drums=False, g=0.9)
for tt, k in steps(L_(59), L_(60) - 0.2, 66 / 2, 1): M(flute(NOTE([76, 74, 72, 71][k % 4]), 1.8), tt, 0.18)
M(cluster(61, 4), wn(60, "não") - 0.2, 0.5); M(whisper(1.8), wn(60, "senhora"), 0.5); M(scare(), wn(60, "doze"), 0.35)
heartbeat(66, 90, L_(62) - 0.1, L_(64) - 0.2, 0.55); M(rumble(L_(64) - L_(62)), L_(62), 0.7)
cinema(L_(64) - 0.2, L_(67) - 0.2, 120, g=1.1, root=45)                        # o avião vindo
M(choir([NOTE(n) for n in (57, 60, 64)], L_(67) - L_(64), att=2.5), L_(64), 0.5)
for at in (L_(65) + 0.2, L_(66) + 0.2): M(braam(33), at, 0.8)
M(scare(), wn(67, "chegou") - 0.05, 0.55)
cida_waltz(L_(68) - 0.2, L_(69) - 0.2, 1.2)
M(choir([NOTE(n) for n in (45, 52, 57, 60)], L_(71) - L_(69) + 1, att=1.5), L_(69) - 0.2, 0.6)
for tt, k in steps(L_(69), L_(70) + 0.6, 80, 1): M(taiko(), tt, 0.55 if k % 2 == 0 else 0.3)
M(scare(), wn(70, "nasceu") + 0.3, 0.7)
M(choir([NOTE(n) for n in (53, 57, 60)], TOTAL - L_(71) + 0.5, att=2.0), L_(71) + 0.3, 0.35); M(glassharm(NOTE(76), 3.0, det=0.03), L_(71) + 1.0, 0.15)

# ------------------------------------------------------------------ efeitos (todos novos)
sfx = np.zeros(N)
def whoosh2():
    t = TT(0.45); return hp(lp(rng.standard_normal(len(t)), 4), 30) * np.sin(np.pi * t / 0.45) ** 2 * 0.8
def step():
    t = TT(0.25); return lp(rng.standard_normal(len(t)), 20) * np.exp(-t * 25) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 30) * 0.6
def creak():
    t = TT(0.9); f = 180 + 40 * np.sin(2 * np.pi * 1.3 * t); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (rng.random(len(t)) < 0.35) * np.exp(-t * 2) * 0.3
def vibrate():
    t = TT(1.4); return np.sin(2 * np.pi * 170 * t) * (np.sin(2 * np.pi * 2.5 * t) > 0) * 0.6
def beep(f=1200, d=0.12):
    t = TT(d); return np.sin(2 * np.pi * f * t) * adsr(len(t), 0.005, 0.02, 0.8, 0.02)
def powerdown():
    t = TT(1.8); f = 220 * np.exp(-t * 1.6) + 30; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2) * 0.8 + lp(rng.standard_normal(len(t)), 30) * np.exp(-t * 3) * 0.4
def jet(d=4.0):
    t = TT(d); return lp(rng.standard_normal(len(t)), 6) * (t / d) ** 1.5 * 1.2 + np.sin(2 * np.pi * (200 + 900 * (t / d) ** 2) * t) * (t / d) ** 2 * 0.3
def hiss(d=1.2):
    t = TT(d); return hp(rng.standard_normal(len(t)), 4) * adsr(len(t), 0.05, 0.2, 0.6, 0.6) * 0.5
def ropecreak():
    t = TT(0.7); return lp(np.sign(np.sin(2 * np.pi * (90 + 30 * t) * t)) * (rng.random(len(t)) < 0.5), 8) * np.exp(-t * 3) * 0.6
for li in range(1, len(L)):
    if li not in (26, 27, 52, 61): put(sfx, whoosh2(), L_(li) - 0.3, 0.22)
for k in range(8): put(sfx, ropecreak(), L_(25) + 0.3 + k * 0.9, 0.35)
for k in range(10): put(sfx, step(), L_(30) - 0.6 + k * 0.62, 0.5 * (0.4 + 0.6 * abs(np.sin(k * 0.6))))
put(sfx, creak(), L_(29) + 1.0, 0.4); put(sfx, creak(), L_(48) + 0.5, 0.35)
put(sfx, powerdown(), wn(36, "apagam") - 0.05, 0.7)
put(sfx, vibrate(), L_(55) + 0.2, 0.55)
for k in range(3): put(sfx, beep(1000 - k * 100), wn(56, "três") + k * 1.0, 0.4)
for k in range(11): put(sfx, beep(1500, 0.06), L_(57) + 0.6 + k * 0.12, 0.3)
put(sfx, beep(900, 0.08), L_(58) + 0.8, 0.4); put(sfx, beep(700, 0.3), L_(61) + 0.3, 0.4)
put(sfx, jet(4.5), wn(63, "turbina") - 3.0, 0.7); put(sfx, jet(5.0), L_(65) - 1.0, 0.6)
put(sfx, hiss(1.4), wn(69, "porta") + 0.1, 0.6)
put(sfx, beep(1320, 0.2), wn(67, "chegou") - 0.1, 0.35)

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
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%05d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "/home/user/aero1.mp4"], check=True)
    print("video -> /home/user/aero1.mp4")
