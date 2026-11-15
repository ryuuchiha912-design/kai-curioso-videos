"""Trilha que muda com a história + efeitos — "E se a sua FELICIDADE dobrasse todo dia?" (canal do Neo, 16:9) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/longo3_felicidade.mp4
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

# 1) gancho — mágico: pad brilhante + caixinha subindo (L0–2)
a, b = 0.0, L_(2) - 0.2
for i, ch in enumerate([C, G, Am, F]): M(inst_pad([NOTE(n + 12) for n in ch], (b - a) / 4 + 1.5), a + i * (b - a) / 4, 0.45)
for t, k in steps(a + 0.4, b, 84, 2): M(inst_box(NOTE([72, 76, 79, 84, 79, 76, 79, 88][k % 8])), t, 0.2)
M(riser(2.0), L_(2) - 2.2, 0.35)
# 2) dias felizes — groove leve que cresce a cada dia (L2–7)
def groove(a, b, bpm, prog, inten=1.0, lead=inst_marimba, hats=1):
    for t, k in steps(a, b, bpm, 4):
        ch = prog[(k // 16) % len(prog)]
        if k % 2 == 0: M(lead(NOTE(ch[(k // 2) % 3] + 12 + (12 if k % 8 == 6 else 0))), t, 0.26 * inten)
        if k % 4 == 0: M(inst_bass(NOTE(ch[0] - 12 + (7 if k % 16 == 12 else 0)), 0.3), t, 0.5 * inten)
        if k % 8 == 0: M(dr_kick(), t, 0.55 * inten)
        if k % 8 == 4: M(dr_snare(), t, 0.3 * inten)
        if k % (2 if hats == 1 else 1) == (1 if hats == 1 else 0): M(dr_hat(), t, 0.2 * inten)
groove(L_(2) - 0.2, L_(6) - 0.2, 104, [C, G, Am, F], 0.85)
groove(L_(6) - 0.2, L_(7) - 0.2, 108, [F, G, C, Am], 0.95, inst_pluck)
# 3) o fato do riso — pizzicato + tic-tac (L7)
for t, k in steps(L_(7) - 0.2, L_(8) - 0.2, 96, 2): M(inst_pizz(NOTE([C, Am, F, G][(k // 8) % 4][k % 3] + 12)), t, 0.28)
# 4) festa no cérebro — groove mais rápido, chimbal dobrado (L8–15)
groove(L_(8) - 0.2, L_(10) - 0.2, 112, [C, G, Am, F], 1.0)
M(riser(1.6), L_(10) - 1.7, 0.3)
groove(L_(10) - 0.1, L_(14) - 0.2, 120, [F, C, G, Am], 1.1, inst_marimba, hats=2)
groove(L_(14) - 0.2, L_(15) - 0.3, 124, [C, G], 1.1, inst_pluck, hats=2)
# 5) dúvida e o médico — suspense: tic-tac + piano espaçado + pad (L15–18)
a, b = L_(15) - 0.2, L_(18) - 0.3
M(inst_pad([NOTE(n) for n in [52, 55, 59]], b - a + 1, att=1.5), a, 0.45)
for t, k in steps(a, b, 80, 1): M(tick(), t, 0.3)
for t, k in steps(a, b, 40, 1): M(inst_piano(NOTE([64, 67, 63, 62][k % 4]), 2.4, 0.5), t, 0.22)
# 6) fama — groove grande (L18–22)
groove(L_(18) - 0.2, L_(22) - 0.2, 126, [C, G, Am, F], 1.15, inst_marimba, hats=2)
# 7) o Davi demitido — cômico-tenso: pizzicato + baixo andando, sem bateria (L22–28)
a, b = L_(22) - 0.2, L_(28) - 0.2
for t, k in steps(a, b, 100, 2):
    ch = [Am, Dm, E, Am][(k // 8) % 4]; M(inst_pizz(NOTE(ch[k % 3] + 12)), t, 0.26)
    if k % 2 == 0: M(inst_bass(NOTE(ch[0] - 12 + [0, 3, 5, 7][(k // 2) % 4]), 0.25), t, 0.42)
# 8) a percepção — caixinha desafinada + pad sombrio, termina em silêncio (L28–31)
a, b = L_(28) - 0.2, L_(30) + 3.0
M(inst_pad([NOTE(n) for n in [45, 52, 56]], b - a + 1, att=2.0), a, 0.42)
for t, k in steps(a, b, 70, 2): M(inst_box(NOTE([81, 77, 76, 72, 74, 76, 72, 69][k % 8]), detune=0.012 * (k % 3)), t, 0.18)
M(stinger(), L_(31) - 0.05, 0.6)
# 9) a ligação da mãe — coração + pad grave (L31–36), silêncio no "sorri"
a, b = L_(31) - 0.1, L_(33) - 0.1
M(inst_pad([NOTE(n) for n in [40, 47, 52]], b - a + 1, att=1.2), a, 0.5)
for t, k in steps(a + 0.3, b, 74, 1): M(heart(), t, 0.6)
a, b = L_(34) - 0.2, L_(36) - 0.3
for t, k in steps(a, b, 66, 2): M(inst_box(NOTE([84, 83, 79, 76, 77, 76, 72, 71][k % 8]), detune=0.02), t, 0.16)
M(inst_pad([NOTE(n) for n in [45, 48, 51]], b - a + 1, att=1.5), a, 0.38)
# 10) o velório — piano + cordas (emoção) com caixinha estranha por baixo (L36–43)
a, b = L_(36) - 0.2, L_(43) - 0.3
for i, (t, k) in enumerate(steps(a, b, 56 / 4, 1)):
    ch = [Am, F, C, E][i % 4]; M(inst_pad([NOTE(n) for n in ch] + [NOTE(ch[0] + 12)], 4.9, att=1.4), t, 0.38); M(inst_piano(NOTE(ch[0] - 12), 3.8), t, 0.36)
for t, k in steps(L_(38) - 0.2, b, 56, 2): M(inst_piano(NOTE([76, 72, 69, 72, 74, 71, 68, 71][k % 8]), 1.6, 0.6), t, 0.2)
for t, k in steps(L_(40) - 0.2, L_(41), 56, 2): M(inst_box(NOTE([88, 87, 84, 83][k % 4]), detune=0.025), t, 0.1)
M(stinger(), L_(42) - 0.05, 0.5)
# 11) a explicação — piano reflexivo (L43–47)
a, b = L_(43) - 0.2, L_(47) - 0.2
for i, (t, k) in enumerate(steps(a, b, 64 / 4, 1)):
    ch = [F, C, Dm, G][i % 4]; M(inst_pad([NOTE(n) for n in ch], 4.2, att=1.0), t, 0.33)
for t, k in steps(a, b, 64, 2): M(inst_piano(NOTE([F, C, Dm, G][(k // 8) % 4][[0, 1, 2, 1][k % 4]] + 12), 1.5, 0.6), t, 0.2)
# 12) rindo sem parar — tic-tac acelerando + pizz tenso + riser (L47–50)
a, b = L_(47) - 0.2, L_(50) - 0.1
for t, k in steps(a, b, 120, 2): M(inst_pizz(NOTE([69, 70, 69, 75][k % 4])), t, 0.24)
for t, k in steps(a, b, 120, 1): M(tick(), t, 0.3)
M(inst_pad([NOTE(n) for n in [45, 51, 57]], b - a + 1, att=1.0), a, 0.42)
M(riser(2.4), L_(49) - 0.2, 0.35)
# 13) o número caindo — notas descendo, depois SILÊNCIO no "zero" (L50–53)
a = L_(50) - 0.1
for k in range(14): M(inst_piano(NOTE(96 - k * 3), 0.9, 0.5), a + k * (L_(52) - a - 0.3) / 14, 0.22)
# 14) finalmente dói — piano sozinho, bem lento (L53–56)
a, b = L_(53) + 0.6, L_(56) - 0.3
for i, (t, k) in enumerate(steps(a, b, 48 / 2, 1)):
    ch = [Am, Em, F, E][i % 4]; M(inst_piano(NOTE(ch[0] - 12), 4.0), t, 0.34); M(inst_piano(NOTE(ch[2] + 12), 3.0, 0.6), t + 0.6, 0.2)
# 15) o abraço — cordas + piano crescendo (L56–60)
a, b = L_(56) - 0.2, L_(60) - 0.3
for i, (t, k) in enumerate(steps(a, b, 60 / 4, 1)):
    ch = [F, G, Em, Am][i % 4]; M(inst_pad([NOTE(n) for n in ch] + [NOTE(ch[0] + 12)], 5.3, att=1.2), t, 0.34 + 0.05 * i); M(inst_piano(NOTE(ch[0] - 12), 3.8), t, 0.36)
for t, k in steps(L_(57) - 0.2, b, 60, 2): M(inst_piano(NOTE([F, G, Em, Am][(k // 8) % 4][[0, 2, 1, 2][k % 4]] + 24), 1.4, 0.5), t, 0.16)
# 16) o Davi — violão agridoce (L60–64)
a, b = L_(60) - 0.2, L_(64) - 0.3
for t, k in steps(a, b, 78, 2):
    ch = [C, Em, F, G][(k // 8) % 4]; M(inst_pluck(NOTE(ch[[0, 1, 2, 1, 2, 1, 0, 2][k % 8]] + 12), 1.5, 0.8), t, 0.28)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0] - 12), 2.0, 0.6), t, 0.38)
# 17) final de esperança — piano + cordas + bateria suave crescendo (L64–fim)
a, b = L_(64) - 0.2, TOTAL
prg = [F, G, C, Am]
for i, (t, k) in enumerate(steps(a, b, 72 / 4, 1)):
    ch = prg[i % 4]; M(inst_pad([NOTE(n + 12) for n in ch], 60 / 72 * 4 + 1.5, att=0.8), t, 0.42); M(inst_bass(NOTE(ch[0] - 12), 1.5), t, 0.35)
for t, k in steps(a, b, 72, 2):
    ch = prg[(k // 8) % 4]; M(inst_piano(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12), 1.5, 0.7), t, 0.22)
    if t > L_(66) - 0.3:
        if k % 8 == 0: M(dr_kick(), t, 0.35)
        if k % 8 == 4: M(dr_snare(), t, 0.16)
        if k % 2 == 1: M(dr_hat(), t, 0.13)
for t, k in steps(L_(68) - 0.2, L_(69) - 0.2, 72, 2): M(inst_box(NOTE([C, G, Am, F][(k // 8) % 4][k % 3] + 24)), t, 0.12)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
pop = lambda f=700: tone(f, 0.16, r=0.05, harm=(1, 0.3))
whoosh = lambda: noise(0.5, a=0.2, r=0.2)
bell = lambda n=84: tone(NOTE(n), 1.2, r=0.5, harm=(1, 0.5, 0.25)) + tone(NOTE(n + 7), 1.2, r=0.35, harm=(1,))
def ring():
    t = TT(1.6); return np.sin(2 * np.pi * 880 * t) * np.sin(2 * np.pi * 1320 * t) * (np.sin(2 * np.pi * 12 * t) > 0) * np.where((t % 0.8) < 0.5, 1, 0) * 0.8
def screech():
    t = TT(1.0); return np.sin(2 * np.pi * (1800 - 600 * t) * t) * np.exp(-t * 2.5) * 0.5 + noise(1.0, a=0.01, r=0.5) * 0.6
def knock():
    k = dr_tom(90) * 1.2; n = noise(0.06, a=0.001, r=0.02); k[:len(n)] += n; return k
def boom():
    t = TT(2.5); return np.sin(2 * np.pi * 42 * t) * np.exp(-t * 1.4) * 1.3
def wn(li, pat, n=0):
    c = 0
    for w in L[li]["words"]:
        if pat in w["text"].lower():
            if c == n: return w["start"]
            c += 1
    return L[li]["start"]
for li in range(1, len(L)):
    if li not in (33, 52, 53): put(sfx, whoosh(), L_(li) - 0.35, 0.18)
# "ding" do medidor subindo (cada vez mais agudo)
ups = [wn(0, "cem"), wn(3, "duzentos"), wn(6, "quatrocentos"), wn(9, "oitocentos"), wn(10, "mil"), wn(13, "três"), wn(18, "seis"), L_(22), L_(26), wn(28, "cinquenta"), L_(31), L_(36), wn(47, "quatrocentos")]
for k, at in enumerate(ups): put(sfx, bell(79 + min(k, 12)), at - 0.02, 0.45)
put(sfx, screech(), wn(14, "freia") - 0.1, 0.55)
for k in range(3): put(sfx, knock(), L_(12) + 0.4 + k * 0.45, 0.6)
for k in range(4): put(sfx, knock(), wn(12, "volta") + k * 0.3, 0.6)
put(sfx, ring(), L_(22) - 0.1, 0.35); put(sfx, ring(), L_(31) - 0.1, 0.4)
put(sfx, noise(0.06, a=0.001, r=0.02), wn(24, "desliga"), 0.7); put(sfx, noise(0.06, a=0.001, r=0.02), wn(27, "desliga"), 0.7)
for k, w in enumerate(["cem", "dez", "mil", "cem"]): put(sfx, tone(NOTE(76 - k * 5), 0.5, r=0.25), wn(51, w, 1 if k == 3 else 0), 0.45)
put(sfx, boom(), wn(52, "zero"), 0.8)
for k in range(2): put(sfx, knock(), L_(56) + 1.0 + k * 0.35, 0.6)
put(sfx, pop(800), L_(69) - 0.05, 0.7)

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
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%05d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "/home/user/longo3_felicidade.mp4"], check=True)
print("video -> /home/user/longo3_felicidade.mp4")
