import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { SHOTS, TOTAL, WORDS } from "./shots";

/** Short "This bike was so fast they BANNED it" (canal do Nico, 1080x1920). */
export const Bike: React.FC<{ captions?: boolean; audio?: boolean }> = ({ captions = true, audio = true }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const endFade = interpolate(t, [TOTAL - 0.35, TOTAL], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <Vignette />
      {shot.overlay?.(f)}
      {captions && <Captions lines={[WORDS]} maxWords={1} size={104} y={0.62} highlight="#ffffff" />}
      <AbsoluteFill style={{ background: "#0d0d12", opacity: endFade }} />
      {audio && <Audio src={staticFile("audio/bike-en/mix.mp3")} />}
    </AbsoluteFill>
  );
};
