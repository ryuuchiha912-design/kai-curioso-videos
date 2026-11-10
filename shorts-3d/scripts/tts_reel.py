"""Short 4 (Reel: a voz do Leo): gera as falas com Edge TTS + tempo de cada palavra.
Saida: public/audio/reel/*.mp3 e src/data/reel-timeline.json
Linhas com {"pause": s} viram silencio (respiro dramatico). "rate" opcional por linha."""
import asyncio, json, subprocess, pathlib, edge_tts
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICES = {
  "narrador": dict(voice="pt-BR-AntonioNeural", rate="+6%", pitch="+0Hz"),
  "leo":      dict(voice="pt-BR-ThalitaMultilingualNeural", rate="+12%", pitch="+45Hz"),
  "eco":      dict(voice="pt-BR-ThalitaMultilingualNeural", rate="+12%", pitch="+45Hz"),  # o robo "clonou" a voz do Leo
  "ecoGrave": dict(voice="pt-BR-AntonioNeural", rate="-18%", pitch="-30Hz"),               # a voz criada por descricao
}
GAP = 0.18
OUT = ROOT/"public/audio/reel"
def dur(p):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(p)]).decode().strip())
async def gen(line):
    v = VOICES[line["who"]]
    out = OUT/f"l{line['id']:02d}.mp3"
    c = edge_tts.Communicate(line["text"], v["voice"], rate=line.get("rate", v["rate"]), pitch=v["pitch"], boundary="WordBoundary")
    words=[]
    with open(out,"wb") as f:
        async for ch in c.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="WordBoundary":
                words.append({"text":ch["text"],"start":ch["offset"]/1e7,"end":(ch["offset"]+ch["duration"])/1e7})
    return out, words
async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    lines = json.loads((ROOT/"src/data/reel-lines.json").read_text(encoding="utf-8"))
    t = 0.3; tl=[]; pauses=[]
    for ln in lines:
        if "pause" in ln:
            pauses.append({"id":ln["id"],"sfx":ln.get("sfx"),"start":round(t,3),"end":round(t+ln["pause"],3)})
            t += ln["pause"]; continue
        out, words = await gen(ln)
        lead = words[0]["start"]; speech_end = words[-1]["end"]
        start = t - lead
        tl.append({**ln, "audio": f"audio/reel/{out.name}", "audioStart": round(start,3), "fileDur": round(dur(out),3),
                   "start": round(t,3), "end": round(start+speech_end,3),
                   "words": [{"text":w["text"],"start":round(start+w["start"],3),"end":round(start+w["end"],3)} for w in words]})
        t = start + speech_end + GAP
    (ROOT/"src/data/reel-timeline.json").write_text(json.dumps({"total":round(t+1.8,3),"lines":tl,"pauses":pauses},ensure_ascii=False,indent=1),encoding="utf-8")
    for l in tl: print(l["id"], l["who"], l["start"], l["end"], " ".join(w["text"] for w in l["words"]))
    print("pauses", pauses, "total", round(t+1.8,2))
def thunder():
    """Trovao sintetico (ruido marrom filtrado), sem baixar nada: public/audio/reel/trovao.mp3"""
    subprocess.run(["ffmpeg","-y","-v","error","-f","lavfi","-i","anoisesrc=color=brown:duration=2.2:amplitude=0.9:seed=7",
        "-af","lowpass=f=260,afade=t=in:d=0.03,afade=t=out:st=0.25:d=1.9,volume=2.2","-ar","44100",str(OUT/"trovao.mp3")],check=True)
asyncio.run(main())
thunder()
