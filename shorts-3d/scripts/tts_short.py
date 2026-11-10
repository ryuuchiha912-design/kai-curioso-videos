"""Gera as falas do short com Edge TTS + tempo de cada palavra -> public/audio/short + src/data/short-timeline.json"""
import asyncio, json, subprocess, pathlib, edge_tts
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICES = {
  "narrador": dict(voice="pt-BR-AntonioNeural", rate="+8%", pitch="+0Hz"),
  "bia":      dict(voice="pt-BR-FranciscaNeural", rate="+5%", pitch="+10Hz"),
  "leo":      dict(voice="pt-BR-ThalitaMultilingualNeural", rate="+12%", pitch="+45Hz"),
}
GAP = 0.18  # respiro entre falas (s)
def dur(p):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(p)]).decode().strip())
async def gen(line):
    v = VOICES[line["who"]]
    out = ROOT/"public/audio/short"/f"l{line['id']:02d}.mp3"
    c = edge_tts.Communicate(line["text"], v["voice"], rate=v["rate"], pitch=v["pitch"], boundary="WordBoundary")
    words=[]
    with open(out,"wb") as f:
        async for ch in c.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="WordBoundary":
                words.append({"text":ch["text"],"start":ch["offset"]/1e7,"end":(ch["offset"]+ch["duration"])/1e7})
    return out, words
async def main():
    lines = json.loads((ROOT/"src/data/short-lines.json").read_text(encoding="utf-8"))
    t = 0.25; tl=[]
    for ln in lines:
        out, words = await gen(ln)
        lead = words[0]["start"]  # silencio inicial do arquivo
        speech_end = words[-1]["end"]
        start = t - lead          # o audio comeca antes, p/ a 1a palavra cair em t
        tl.append({**ln, "audio": f"audio/short/{out.name}", "audioStart": round(start,3), "fileDur": round(dur(out),3),
                   "start": round(t,3), "end": round(start+speech_end,3),
                   "words": [{"text":w["text"],"start":round(start+w["start"],3),"end":round(start+w["end"],3)} for w in words]})
        t = start + speech_end + GAP
    total = t + 0.6
    (ROOT/"src/data/short-timeline.json").write_text(json.dumps({"total":round(total,3),"lines":tl},ensure_ascii=False,indent=1),encoding="utf-8")
    print("total", round(total,2), "s")
asyncio.run(main())
