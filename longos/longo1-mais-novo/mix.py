"""Trilha (piano emocional) + efeitos — "E se você ficasse 1 ano MAIS NOVO todo dia?" (canal do Neo, 16:9) + efeitos sintetizados, mixados a 50% da voz; junta com os quadros.
Uso: python3 mix.py  -> /home/user/neo_mais_novo.mp4
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

# 1) mistério — pad + caixinha de música + coração (L0–2)
a, b = 0.0, L_(3) - 0.2
for i, ch in enumerate([Am, F, Dm, E]): M(inst_pad([NOTE(n) for n in ch], (b - a) / 4 + 1.5), a + i * (b - a) / 4, 0.55)
for t, k in steps(a + 0.5, b, 70, 2): M(inst_box(NOTE([81, 76, 79, 76, 77, 72, 74, 76][k % 8])), t, 0.22)
for t, k in steps(L_(2), b, 72, 1): M(heart(), t, 0.7)
M(riser(2.0), L_(3) - 2.2, 0.35)
# 2) alegre — marimba + violão + bateria leve (L3–7)
a, b = L_(3) - 0.2, L_(8) - 0.25
prog = [C, G, Am, F]
for t, k in steps(a, b, 112, 4):
    bar = int(k // 16); ch = prog[bar % 4]
    if k % 2 == 0: M(inst_marimba(NOTE(ch[(k // 2) % 3] + 12 + (12 if k % 8 == 6 else 0))), t, 0.28)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0])), t, 0.25); M(inst_bass(NOTE(ch[0] - 12), 0.45), t, 0.45)
    if k % 8 == 4: M(inst_pluck(NOTE(ch[1])), t, 0.2)
    if k % 8 == 0: M(dr_kick(), t, 0.55)
    if k % 8 == 4: M(dr_snare(), t, 0.3)
    if k % 2 == 1: M(dr_hat(), t, 0.25)
# 3) cômico-tenso — pizzicato + baixo andando + palmas (L8–15)
a, b = L_(8) - 0.15, L_(16) - 0.3
walk = [45, 47, 48, 50, 52, 50, 48, 47]
prog = [Am, Dm, E, Am]
for t, k in steps(a, b, 96, 2):
    ch = prog[(k // 8) % 4]
    M(inst_pizz(NOTE(ch[k % 3] + 12)), t, 0.32 if k % 2 == 0 else 0.18)
    if k % 2 == 0: M(inst_bass(NOTE(walk[(k // 2) % 8] - 12), 0.35), t, 0.5)
    if k % 8 == 4: M(dr_snare(), t, 0.22)
# 4) suspense no médico — tic-tac + piano espaçado + pad grave (L16–20)
a, b = L_(16) - 0.2, L_(21) - 0.2
M(inst_pad([NOTE(45), NOTE(52)], b - a + 1.0, att=2.0), a, 0.5)
for t, k in steps(a, b, 60, 1): M(tick(), t, 0.5)
for t, k in steps(a + 1, b, 30, 1): M(inst_piano(NOTE([69, 72, 71, 68][k % 4]), 2.5), t, 0.3)
# 5) "dia 13" — impacto + coração + subida (L21–23)
M(stinger(), L_(21) - 0.05, 0.9)
a, b = L_(21) + 1.0, L_(24) - 0.2
for t, k in steps(a, b, 80, 1): M(heart(), t, 0.65)
M(inst_pad([NOTE(n) for n in [52, 55, 59]], b - a + 1, att=2.5), a, 0.4)
# 6) "menor de idade" — tambores crescendo (L24–25)
a, b = L_(24) - 0.15, L_(26) - 0.2
for t, k in steps(a, b, 100, 2):
    g = 0.25 + 0.5 * (t - a) / (b - a)
    M(dr_tom(110 if k % 4 else 80), t, g * (1 if k % 2 == 0 else 0.6))
M(stinger(), L_(25) + 0.2, 0.6)
# 7) ligação pra mãe — piano emocional + cordas (L26–31)
a, b = L_(26) - 0.2, L_(32) - 0.3
prog = [Am, F, C, G]
dur = 60 / 64 * 4
for i, (t, k) in enumerate(steps(a, b, 64 / 4, 1)):
    ch = prog[i % 4]; M(inst_pad([NOTE(n) for n in ch], dur + 1.2, att=1.0), t, 0.45); M(inst_piano(NOTE(ch[0] - 12), 3.5), t, 0.35)
for t, k in steps(a, b, 64, 2): M(inst_piano(NOTE([76, 72, 69, 72, 74, 71, 67, 71][k % 8]), 1.6, 0.6), t, 0.22)
# 8) escola / mãe envelhecendo — violão agridoce (L32–38)
a, b = L_(32) - 0.2, L_(39) - 0.3
prog = [C, Em, Am, F]
for t, k in steps(a, b, 76, 2):
    ch = prog[(k // 8) % 4]; pat = [0, 1, 2, 1, 2, 1, 0, 2]
    M(inst_pluck(NOTE(ch[pat[k % 8]] + 12), 1.6, 0.8), t, 0.3)
    if k % 8 == 0: M(inst_pluck(NOTE(ch[0] - 12), 2.0, 0.6), t, 0.4); M(inst_pad([NOTE(n) for n in ch], 60 / 76 * 4 + 1, att=0.8), t, 0.25)
# 9) dentes e esquecimento — caixinha desafinada + pad sombrio + relógio (L39–45)
a, b = L_(39) - 0.2, L_(46) - 0.3
M(inst_pad([NOTE(45), NOTE(48), NOTE(52)], b - a + 1.5, att=2.0), a, 0.5)
for t, k in steps(a, b, 58, 2): M(inst_box(NOTE([81, 77, 76, 72, 74, 71, 69, 68][k % 8]), 1.6, detune=0.012 * np.sin(k)), t, 0.2)
for t, k in steps(L_(42), b, 60, 1): M(tick(), t, 0.35)
# 10) caderno e cuidados — piano quente + cordas subindo (L46–51)
a, b = L_(46) - 0.2, L_(52) - 0.3
prog = [F, C, G, Am]
for i, (t, k) in enumerate(steps(a, b, 60 / 4, 1)):
    ch = prog[i % 4]; M(inst_pad([NOTE(n + 12) for n in ch], 4 + 1.5, att=1.5), t, 0.35 + 0.05 * i); M(inst_piano(NOTE(ch[0] - 12), 3.5), t, 0.35)
for t, k in steps(a, b, 60, 2): M(inst_piano(NOTE([72, 76, 79, 76][k % 4]), 1.4, 0.5), t, 0.18)
# 11) canção de ninar — só caixinha de música + pad bem baixo (L52–58)
a, b = L_(52) - 0.2, L_(59) - 0.8
lull = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 74, 72, 74, 76, 72, 72]
for t, k in steps(a, b, 92, 1): M(inst_box(NOTE(lull[k % len(lull)] + 12), 1.6), t, 0.26)
M(inst_pad([NOTE(n) for n in [48, 55, 64]], b - a + 1, att=3.0, rel=3.0), a, 0.3)
# 12) zero: silêncio. 13) acordou / caderno — pad de suspense + subida (L61–64)
a, b = L_(61) - 0.1, L_(65) - 0.3
M(inst_pad([NOTE(n) for n in [52, 59, 64]], b - a + 1, att=1.5), a, 0.4)
for t, k in steps(a, b, 70, 1): M(inst_piano(NOTE([64, 67, 71, 72][k % 4] + 12), 1.4, 0.4), t, 0.15)
M(riser(2.5), L_(64) - 0.5, 0.3)
# 14) final — esperança: piano + cordas + bateria suave crescendo (L65–fim)
a, b = L_(65) - 0.2, TOTAL
prog = [F, G, C, Am]
for i, (t, k) in enumerate(steps(a, b, 70 / 4, 1)):
    ch = prog[i % 4]; M(inst_pad([NOTE(n + 12) for n in ch], 60 / 70 * 4 + 1.5, att=0.8), t, 0.45); M(inst_bass(NOTE(ch[0] - 12), 1.5), t, 0.4)
for t, k in steps(a, b, 70, 2):
    ch = prog[(k // 8) % 4]
    M(inst_piano(NOTE(ch[[0, 1, 2, 1][k % 4]] + 12), 1.5, 0.7), t, 0.25)
    if t > L_(66) - 0.3:
        if k % 8 == 0: M(dr_kick(), t, 0.4)
        if k % 8 == 4: M(dr_snare(), t, 0.18)
        if k % 2 == 1: M(dr_hat(), t, 0.15)

# ------------------------------------------------------------------ efeitos
sfx = np.zeros(N)
pop = lambda f=700: tone(f, 0.16, r=0.05, harm=(1, 0.3))
whoosh = lambda: noise(0.5, a=0.2, r=0.2)
bell = lambda: tone(NOTE(84), 1.2, r=0.5, harm=(1, 0.5, 0.25)) + tone(NOTE(91), 1.2, r=0.35, harm=(1,))
thud = lambda: tone(70, 0.4, a=0.002, r=0.14, harm=(1, 0.6)) + noise(0.4, a=0.002, r=0.06) * 0.6
chime = lambda: tone(NOTE(88), 0.8, r=0.3, harm=(1, 0.4)) + tone(NOTE(95), 0.8, r=0.25, harm=(1,))
def wn(li, pat, n=0):
    c = 0
    for w in L[li]["words"]:
        if pat in w["text"].lower():
            if c == n: return w["start"]
            c += 1
    return L[li]["start"]
def ring(at, n=3):
    for k in range(n):
        for j in range(8): put(sfx, tone(NOTE(81 if j % 2 == 0 else 85), 0.09, a=0.004, r=0.06, harm=(1, 0.3)), at + k * 1.4 + j * 0.09, 0.45)
for li in range(1, len(L)):
    if li not in (59, 60): put(sfx, whoosh(), L_(li) - 0.35, 0.2)
# virada do contador (cada dia novo)
for li in (3, 4, 5, 6, 7, 9, 12, 15, 16, 21, 24, 29, 32, 33, 35, 39, 42, 46, 49, 52, 54):
    put(sfx, pop(900), L_(li) - 0.1, 0.35)
put(sfx, bell(), wn(0, "nove") - 0.05, 0.6)
put(sfx, pop(800), wn(1, "oito") - 0.1, 0.6); put(sfx, pop(800), wn(1, "sete") - 0.1, 0.6)
put(sfx, thud(), wn(2, "zero", 1) - 0.05, 0.8)
put(sfx, chime(), wn(3, "presente") - 0.1, 0.7)
for p in ("costas", "olheiras", "cabelo"): put(sfx, chime(), wn(4, p) + 0.1, 0.5)
for k in range(4): put(sfx, pop(700 + k * 80), wn(7, "fotos") - 0.2 + k * 0.35, 0.5)
put(sfx, pop(500), wn(9, "gerente") - 0.1, 0.6)
put(sfx, thud(), wn(10, "menino") - 0.1, 0.6)
for p in ("alugar", "assinar", "pagar"): put(sfx, thud(), wn(24, p) + 0.1, 0.9)
put(sfx, thud(), L_(25) + 0.3, 1.0)
ring(wn(26, "mãe") - 0.1, 4)
put(sfx, chime(), wn(31, "pôster") - 0.1, 0.6)
put(sfx, pop(600), wn(33, "fáceis") - 0.1, 0.6)
put(sfx, pop(1200), wn(39, "dentes") + 0.4, 0.6)
put(sfx, bell(), wn(44, "amnésia") - 0.1, 0.5)
put(sfx, tone(NOTE(76), 2.0, r=1.2, harm=(1, 0.3)), wn(59, "zero") - 0.05, 0.6)
for k in range(10): put(sfx, tone(NOTE(88 if k % 2 == 0 else 84), 0.07, a=0.002, r=0.05, harm=(1, 0.4)), wn(60, "despertador") + k * 0.09, 0.6)
put(sfx, chime(), wn(61, "trinta") - 0.1, 0.7)
put(sfx, chime(), wn(62, "caderno") - 0.1, 0.6)
ring(wn(65, "chama") - 0.1, 2)
for k in range(3): put(sfx, tone(NOTE(84 + k * 4), 0.8, r=0.4), wn(66, "voz") + k * 0.12, 0.4)
put(sfx, pop(800), L_(67) - 0.05, 0.7)

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
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "/home/user/neo_mais_novo.mp4", "-i", "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "/home/user/neo_mais_novo_v2.mp4"], check=True)
print("video -> /home/user/neo_mais_novo_v2.mp4")
