import asyncio, json, os, subprocess, edge_tts
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
VOICE, RATE, PITCH = "pt-BR-AntonioNeural", "+4%", "-2Hz"
L = json.load(open("lines.json"))
os.makedirs("el", exist_ok=True)
async def one(i, text, tries=4):
    for k in range(tries):
        try:
            return await _one(i, text)
        except edge_tts.exceptions.NoAudioReceived:
            await asyncio.sleep(2 * (k + 1))
    raise RuntimeError("sem audio")
async def _one(i, text):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, proxy=PROXY, boundary="WordBoundary")
    words, audio = [], bytearray()
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary": words.append({"text": ch["text"], "start": ch["offset"] / 1e7, "end": (ch["offset"] + ch["duration"]) / 1e7})
    open(f"el/l{i:02d}.mp3", "wb").write(audio)
    return words
async def main():
    t, lines, files = 0.3, [], []
    for i, (text, gap) in enumerate(L):
        w = await one(i, text)
        a = max(0.0, w[0]["start"] - 0.06); b = w[-1]["end"] + 0.18
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"el/l{i:02d}.mp3", "-af", f"atrim={a}:{b},asetpts=PTS-STARTPTS", "-ar", "44100", f"el/c{i:02d}.wav"], check=True)
        w = [{"text": x["text"], "start": x["start"] - a, "end": x["end"] - a} for x in w]
        dur = b - a
        lines.append({"cap": text, "start": round(t + (w[0]["start"] if w else 0), 3), "end": round(t + (w[-1]["end"] if w else dur), 3), "audio_at": round(t, 3), "dur": dur,
                      "words": [{"text": x["text"], "start": round(t + x["start"], 3), "end": round(t + x["end"], 3)} for x in w]})
        t += dur + gap
    total = round(t, 3)
    json.dump({"total": total, "lines": lines}, open("timeline.json", "w"), ensure_ascii=False)
    # narração contínua com os silêncios
    parts = []
    for i, l in enumerate(lines):
        parts += ["-i", f"el/c{i:02d}.wav"]
    flt = "".join(f"[{i}:a]adelay={int(l['audio_at']*1000)}|{int(l['audio_at']*1000)}[a{i}];" for i, l in enumerate(lines))
    flt += "".join(f"[a{i}]" for i in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{total}[o]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *parts, "-filter_complex", flt, "-map", "[o]", "-ar", "44100", "-ac", "1", "narr_full.wav"], check=True)
    print("total", total, "linhas", len(lines))
asyncio.run(main())
