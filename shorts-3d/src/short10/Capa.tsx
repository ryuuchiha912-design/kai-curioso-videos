import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage, Vignette } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { LIGHT_DAY, Snow, Tower, Valley } from "./cena";

/** Capa (inglês) do short da cidade num prédio só. */
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; rot?: number }> = ({ children, size, color = "#fff", rot = 0 }) => (
  <div style={{ fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, lineHeight: 0.95, color, textAlign: "center", WebkitTextStroke: `${size * 0.13}px #1b0f08`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,.55)`, transform: `rotate(${rot}deg)`, textTransform: "uppercase" }}>{children}</div>
);
export const TorreCapa: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Stage flat background="#cfe3f5" lights={LIGHT_DAY} cam={{ pos: [1.6, 1.3, 6.2], target: [0.3, 2.9, -1.2], fov: 46 }} fg={
      <Cel>
        <Valley /><Tower p={[0, 0, -2]} />
        <Toon kind="nico" position={[1.15, 0, 3.7]} rotationY={0.25} face={{ expr: "surprised", eyes: "big", iris: "#e2a236", lid: -0.14, look: [-0.3, -0.5] }} pose={{ armL: [-0.2, 0, -2.4], armR: [-0.2, 0, 2.4], head: [-0.2, -0.1, 0] }} />
        <Snow frame={30} area={10} />
      </Cel>
    } />
    <Vignette />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, gap: 4 }}>
      <T size={112}>A whole town</T>
      <T size={128} color="#ffd23f" rot={-3}>in 1 building?!</T>
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
      <div style={{ background: "#2c6fb6", padding: "12px 40px", borderRadius: 28, border: "10px solid #1b0f08", transform: "rotate(-3deg)" }}><T size={84}>Alaska, USA</T></div>
    </AbsoluteFill>
  </AbsoluteFill>
);
