import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage, Vignette } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { Javelin, LIGHT_STADIUM, Stadium, Trail, flight } from "./cena";

/** Capa (inglês) do short do dardo. */
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; rot?: number }> = ({ children, size, color = "#fff", rot = 0 }) => (
  <div style={{ fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, lineHeight: 0.95, color, textAlign: "center", WebkitTextStroke: `${size * 0.13}px #1b0f08`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,.55)`, transform: `rotate(${rot}deg)`, textTransform: "uppercase" }}>{children}</div>
);
export const JavelinCapa: React.FC = () => {
  const u = 0.93, { p, a } = flight(u);
  const trail = Array.from({ length: 8 }, (_, i) => flight(Math.max(0, u - (7 - i) * 0.014)).p);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage flat background="#bfe3f5" lights={LIGHT_STADIUM} cam={{ pos: [p[0] - 5.5, 1.5, 6.5], target: [p[0] - 0.5, 3.6, 0], fov: 58, roll: 0.05 }} fg={
        <Cel>
          <Stadium f={8} />
          <Trail pts={trail} />
          <Javelin p={p} rot={[0, 0, a]} s={1.6} />
          <Toon kind="nico" position={[p[0] - 3.6, 0, 3.4]} rotationY={-0.35} scale={1.25} face={{ expr: "surprised", eyes: "big", iris: "#e2a236", lid: -0.14, sweat: true, look: [0.7, 0.5] }} pose={{ armL: [-0.3, 0, -2.4], armR: [-0.3, 0, 2.4], head: [-0.3, 0.35, 0] }} />
        </Cel>
      } />
      <Vignette />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120, gap: 8 }}>
        <T size={112}>So far they</T>
        <T size={150} color="#ffd23f" rot={-4}>changed it</T>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div style={{ background: "#d62a1e", padding: "12px 40px", borderRadius: 28, border: "10px solid #1b0f08", transform: "rotate(-3deg)" }}><T size={96}>104.80 m</T></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
