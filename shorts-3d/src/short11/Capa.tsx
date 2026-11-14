import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage, Vignette } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { LIGHT_VELO, LyingRider, UprightRider, Velodrome, Wind } from "./cena";

/** Capa (inglês) do short da bicicleta proibida. */
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; rot?: number }> = ({ children, size, color = "#fff", rot = 0 }) => (
  <div style={{ fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, lineHeight: 0.95, color, textAlign: "center", WebkitTextStroke: `${size * 0.13}px #1b0f08`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,.55)`, transform: `rotate(${rot}deg)`, textTransform: "uppercase" }}>{children}</div>
);
export const BikeCapa: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Stage flat background="#e8d2b0" lights={LIGHT_VELO} cam={{ pos: [2.7, 1.0, 1.4], target: [0.3, 0.6, 0.05], fov: 48 }} fg={
      <Cel>
        <Velodrome f={10} />
        <LyingRider p={[0.3, 0, 0]} f={6} speed={0.8} face={{ expr: "smug", eyes: "big", iris: "#e2a236", lid: -0.14, look: [0.4, 0] }} />
        <UprightRider p={[1.6, 0, -3]} f={3} face={{ expr: "surprised", eyes: "big", sweat: true }} c="#3e9b4a" />
        <Wind f={20} speed={0.14} y0={0.2} y1={1.0} x={0.3} />
      </Cel>
    } />
    <Vignette />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, gap: 6 }}>
      <T size={120}>So fast they</T>
      <T size={200} color="#ffd23f" rot={-4}>BANNED it</T>
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 160 }}>
      <div style={{ background: "#d62a1e", padding: "12px 40px", borderRadius: 28, border: "10px solid #1b0f08", transform: "rotate(-3deg)" }}><T size={84}>1933</T></div>
    </AbsoluteFill>
  </AbsoluteFill>
);
