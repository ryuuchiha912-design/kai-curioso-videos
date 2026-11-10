import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { LINES, TOTAL_SEC, W } from "./timeline";
import { SHOTS, flashAt } from "./shots";

/** Short 4 ("A voz do Leo"): 1080x1920, tudo função do frame. */
export const Reel: React.FC<{ captions?: boolean; onlyShot?: string }> = ({ captions = true, onlyShot }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = onlyShot ? SHOTS.find((s) => s.name.startsWith(onlyShot))! : SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const endFade = interpolate(t, [TOTAL_SEC - 0.8, TOTAL_SEC], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <AbsoluteFill style={{ background: "#e8f0ff", opacity: flashAt(f) * 0.55, mixBlendMode: "screen" }} />
      <Vignette />
      {captions && <Captions lines={LINES.map((l) => l.words)} />}
      <AbsoluteFill style={{ background: "#1a0f08", opacity: endFade }} />
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.audioStart * FPS)} durationInFrames={Math.ceil(l.fileDur * FPS) + 2}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
      {[W(8, 3) - 1, W(8, 5) - 1].map((at, i) => (
        <Sequence key={`trovao${i}`} from={at} durationInFrames={sec(2.2)}>
          <Audio src={staticFile("audio/reel/trovao.mp3")} volume={i ? 0.35 : 0.25} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
