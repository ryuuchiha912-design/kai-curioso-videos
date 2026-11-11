import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { buildShots, Lang, timing } from "./shots";

/** Short "Por que o banheiro do avião tem cinzeiro?" (canal do Nico, 1080x1920). */
export const Aviao: React.FC<{ captions?: boolean; audio?: boolean; lang?: Lang }> = ({ captions = true, audio = true, lang = "pt" }) => {
  const f = useCurrentFrame();
  const SHOTS = React.useMemo(() => buildShots(lang), [lang]);
  const { total: TOTAL, words: WORDS } = timing(lang);
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
      {audio && <Audio src={staticFile(lang === "en" ? "audio/aviao-en/mix.mp3" : "audio/aviao/mix.mp3")} />}
    </AbsoluteFill>
  );
};
