import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "../kit/Captions";
import { Vignette } from "../kit/Stage";
import { FPS, sec } from "../kit/anim";
import { FONT } from "../kit/textures";
import { LINES, SHOT_BOUNDS, TOTAL, hudLabel, lineAt, renderLine } from "./shots";

/** "E se você fosse a última pessoa na Terra?" — vídeo longo 16:9 (1920x1080, 30 fps), personagem Ren. */
export const Ultimo: React.FC<{ captions?: boolean; audio?: boolean; onlyLine?: number }> = ({ captions = true, audio = true, onlyLine }) => {
  const f = useCurrentFrame();
  const k = useVideoConfig().height / 1080;
  const t = f / FPS;
  const li = onlyLine ?? lineAt(t);
  const [a, b] = SHOT_BOUNDS[li];
  const lab = hudLabel(f);
  const fadeIn = interpolate(t, [0, 0.4], [1, 0], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(t, [TOTAL - 1.2, TOTAL], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {renderLine(li, f, sec(a), sec(b))}
      <Vignette />
      {lab && t > LINES[6].start + 1.5 && (
        <div style={{ position: "absolute", left: 40 * k, top: 34 * k, padding: `${10 * k}px ${22 * k}px`, borderRadius: 16 * k, background: "rgba(10,10,14,0.72)", fontFamily: FONT, color: "#fff", fontSize: 30 * k, letterSpacing: 2 * k }}>
          SEM HUMANOS: <span style={{ color: "#ffd23f" }}>{lab}</span>
        </div>
      )}
      {captions && <Captions lines={LINES.map((l) => l.words)} y={0.8} size={62 * k} maxWords={4} highlight="#ffd23f" />}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
      {audio && <Audio src={staticFile("audio/ultimo/mix.mp3")} />}
    </AbsoluteFill>
  );
};
