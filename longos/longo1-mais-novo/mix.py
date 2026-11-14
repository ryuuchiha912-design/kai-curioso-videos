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


# ------------------------------------------------------------------ trilha por trecho
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
def arps(a, b, chords, bpm, vel=1.0, pat=(0, 1, 2, 1, 2, 1, 0, 1), dec=0.9, oct_=12, bass=True):
    beat = 60 / bpm; t = a; k = 0
    while t < b - 0.3:
        ch = chords[(k // 8) % len(chords)]
        put(music, tone(NOTE(ch[pat[k % 8]] + oct_), 1.4, r=dec), t, 0.3 * vel)
        if bass and k % 8 == 0: put(music, tone(NOTE(ch[0] - 12), 3.0, a=0.01, r=1.6), t, 0.38 * vel)
        t += beat / 2; k += 1
MYST = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]
PLAY = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
TENS = [[57, 60, 64], [56, 60, 63], [57, 60, 64], [52, 56, 59]]
SAD = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
WARM = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
HOPE = [[53, 57, 60], [55, 59, 62], [60, 64, 67], [57, 60, 64]]
L_ = lambda i: L[i]["start"]
arps(0.0, L_(3) - 0.3, MYST, 70, vel=0.85, dec=1.0)
arps(L_(3) - 0.2, L_(8) - 0.3, PLAY, 100, vel=0.8, pat=(0, 2, 1, 2, 0, 2, 1, 2), dec=0.4)
arps(L_(8) - 0.2, L_(21) - 0.3, TENS, 78, vel=0.75, dec=0.7)
put(music, tone(NOTE(45), 4.0, r=2.5, harm=(1, 0.5)), L_(21) - 0.05, 0.6)
arps(L_(22) - 0.2, L_(26) - 0.3, TENS, 70, vel=0.7, dec=0.8)
arps(L_(26) - 0.2, L_(33) - 0.3, SAD, 58, vel=0.9, dec=1.3)
arps(L_(33) - 0.2, L_(39) - 0.3, WARM, 64, vel=0.85, dec=1.1)
arps(L_(39) - 0.2, L_(49) - 0.3, SAD, 56, vel=0.85, dec=1.3)
# canção de ninar (caixinha de música) na reta final
lull = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 74, 72]
t = L_(49) - 0.2; k = 0
while t < L_(59) - 0.6: put(music, tone(NOTE(lull[k % len(lull)] + 12), 1.2, a=0.003, r=0.5, harm=(1, 0.25)), t, 0.2); t += 0.62; k += 1
arps(L_(49) - 0.2, L_(59) - 0.6, SAD, 48, vel=0.6, dec=1.6)
arps(L_(61) - 0.2, TOTAL, HOPE, 64, vel=1.05, dec=1.2)
pad_t = np.arange(N) / SR
pad = 0.07 * (np.sin(2 * np.pi * NOTE(60) * pad_t) + np.sin(2 * np.pi * NOTE(64) * pad_t) + np.sin(2 * np.pi * NOTE(67) * pad_t))
music += pad * np.clip((pad_t - L_(65)) / 1.5, 0, 1)

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
if os.path.isdir("frames") and len(os.listdir("frames")) > 10:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", "frames/%05d.jpg", "-i", "mix.wav", "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", "/home/user/neo_mais_novo.mp4"], check=True)
    print("video -> /home/user/neo_mais_novo.mp4")
