import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export type Word = { text: string; start: number; end: number };

/**
 * Legenda grande, palavra por palavra, comandada pelo arquivo de tempos.
 * Agrupa em blocos curtos (até 3 palavras) e acende a palavra falada.
 */
export const Captions: React.FC<{ lines: Word[][]; offsetSec?: number; y?: number; size?: number; maxWords?: number; highlight?: string }> = ({
  lines, offsetSec = 0, y = 0.64, size = 92, maxWords = 3, highlight = "#ffd23f",
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps + offsetSec;

  // monta blocos dentro de cada fala: quebra em pausa ou a cada maxWords (nunca mistura falas)
  const chunks: Word[][] = [];
  for (const words of lines) {
    let cur: Word[] = [];
    words.forEach((w, i) => {
      cur.push(w);
      const next = words[i + 1];
      const pause = next ? next.start - w.end > 0.25 : true;
      const left = words.length - i - 1;
      if ((cur.length >= maxWords && left !== 1) || pause) {
        chunks.push(cur);
        cur = [];
      }
    });
    if (cur.length) chunks.push(cur);
  }

  const idx = chunks.findIndex((c, i) => {
    const s = c[0].start - 0.05;
    const e = Math.min(chunks[i + 1] ? chunks[i + 1][0].start - 0.05 : 1e9, c[c.length - 1].end + 0.35);
    return t >= s && t < e;
  });
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const appear = interpolate(t, [chunk[0].start - 0.05, chunk[0].start + 0.08], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: height * y, pointerEvents: "none" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 36px", maxWidth: "88%", transform: `scale(${appear})` }}>
        {chunk.map((w, i) => {
          const active = t >= w.start - 0.04;
          const now = t >= w.start - 0.04 && t < w.end + 0.05;
          const s = now ? 1.12 : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: "'Lilita One', 'Arial Black', sans-serif",
                fontSize: size,
                lineHeight: 1.08,
                color: active ? (now ? highlight : "#ffffff") : "rgba(255,255,255,0.92)",
                WebkitTextStroke: `${size * 0.12}px #1b0f08`,
                paintOrder: "stroke fill",
                textShadow: `0 ${size * 0.08}px 0 rgba(0,0,0,0.55)`,
                textTransform: "uppercase",
                transform: `scale(${s}) rotate(${now ? (i % 2 ? 2 : -2) : 0}deg)`,
                display: "inline-block",
              }}
            >
              {w.text.replace(/[,.:]$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
