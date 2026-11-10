import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { FLUTE_AT, LINES, TOTAL_SEC } from "./timeline";
import { SHOTS } from "./shots";

/** Short 2 (o jogo da infância): 1080x1920, tudo função do frame. */
export const Ocarina: React.FC<{ captions?: boolean; onlyShot?: string }> = ({ captions = true, onlyShot }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = onlyShot ? SHOTS.find((s) => s.name.startsWith(onlyShot))! : SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const endFade = interpolate(t, [TOTAL_SEC - 1.2, TOTAL_SEC], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <Vignette />
      {captions && <Captions lines={LINES.map((l) => l.words)} />}
      <AbsoluteFill style={{ background: "#1a0f08", opacity: endFade }} />
      {FLUTE_AT.map((at) => (
        <Sequence key={`flauta-${at}`} from={at} durationInFrames={62}>
          <Audio src={staticFile("audio/ocarina/flauta.wav")} volume={0.45} />
        </Sequence>
      ))}
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.audioStart * FPS)} durationInFrames={Math.ceil(l.fileDur * FPS) + 2}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
