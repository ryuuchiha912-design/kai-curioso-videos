import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { ALL_WORDS, LINES } from "./timeline";
import { SHOTS } from "./shots";

/** O short "Moedinha": 1080x1920, cada quadro calculado a partir do tempo. */
export const Short: React.FC<{ captions?: boolean; onlyShot?: string }> = ({ captions = true, onlyShot }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = onlyShot ? SHOTS.find((s) => s.name.startsWith(onlyShot))! : SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <Vignette />
      {captions && <Captions lines={LINES.map((l) => l.words)} />}
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.audioStart * FPS)} durationInFrames={Math.ceil(l.fileDur * FPS) + 2}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
