import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { LINES, TOTAL_SEC, W } from "./timeline";
import { SHOTS } from "./shots";
import { CommentCta, Hud, landings } from "./hud";

/** Efeitos sonoros feitos em código (ffmpeg aevalsrc), nada de terceiros. */
const sfx = (): { at: number; file: string; vol: number }[] => [
  { at: W(1, 5), file: "pop", vol: 0.5 },
  ...[0, 5, 10, 15, 20].map((d) => ({ at: W(1, 5) + d, file: "tick", vol: 0.5 })),
  { at: W(2, 3) - 2, file: "pop", vol: 0.45 },
  ...landings().map((at) => ({ at, file: "ding", vol: 0.38 })),
  { at: W(4, 1) - 2, file: "pop", vol: 0.45 },
  ...[0, 3, 6].map((d) => ({ at: W(6, 4) - 2 + d, file: "pop", vol: 0.45 })),
  { at: W(9, 2) - 2, file: "pop", vol: 0.45 },
  ...[0, 4].map((d) => ({ at: W(9, 7) - 2 + d, file: "pop", vol: 0.4 })),
  { at: W(11, 5) - 2, file: "pop", vol: 0.45 },
  { at: W(13, 9), file: "womp", vol: 0.55 },
  { at: W(15, 3) - 2, file: "pop", vol: 0.4 },
  ...[0, 3, 6, 9, 12].map((d) => ({ at: W(16, 1) - 4 + d, file: "tick", vol: 0.6 })),
  { at: W(16, 1) + 34, file: "pop", vol: 0.45 },
];

/** Short 5 ("Dobra"): 1080x1920, tudo função do frame. */
export const Dobra: React.FC<{ captions?: boolean; onlyShot?: string }> = ({ captions = true, onlyShot }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const end = Math.ceil(TOTAL_SEC * FPS);
  const shot = onlyShot ? SHOTS.find((s) => s.name.startsWith(onlyShot))! : SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const endFade = interpolate(t, [TOTAL_SEC - 0.6, TOTAL_SEC], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <Vignette />
      <Hud f={f} end={end} />
      {captions && <Captions lines={LINES.map((l) => l.words)} highlight="#ffd23f" />}
      <CommentCta f={f} />
      <AbsoluteFill style={{ background: "#1a0f08", opacity: endFade }} />
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.audioStart * FPS)} durationInFrames={Math.ceil(l.fileDur * FPS) + 2}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
      {sfx().map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={45}>
          <Audio src={staticFile(`audio/dobra/sfx_${s.file}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
