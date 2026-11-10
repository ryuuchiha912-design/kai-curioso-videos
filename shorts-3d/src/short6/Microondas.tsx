import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { SHOTS, TOTAL, WORDS } from "./shots";

/**
 * Short "O doce que inventou o micro-ondas" (estilo cel). Só imagem:
 * a voz, a trilha e os efeitos são mixados depois (scripts/mix_micro.py), com a trilha a 50% da voz.
 */
export const Microondas: React.FC<{ captions?: boolean; onlyShot?: string }> = ({ captions = true, onlyShot }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = onlyShot ? SHOTS.find((s) => s.name.startsWith(onlyShot))! : SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const endFade = interpolate(t, [TOTAL - 0.35, TOTAL], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot.render(f, sec(shot.from), sec(shot.to))}
      <Vignette />
      {captions && <Captions lines={[WORDS]} maxWords={1} size={104} y={0.6} highlight="#ffffff" />}
      <AbsoluteFill style={{ background: "#1a0f08", opacity: endFade }} />
    </AbsoluteFill>
  );
};
