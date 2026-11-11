import React from "react";
import { AbsoluteFill } from "remotion";
import { Vignette } from "../kit/Stage";
import { Ashtray, Cigarette } from "./cena";
import { Box } from "../kit/props";
import { Lav, Nico, nicoFace } from "./shots";

/** Capa 1080x1920 do short do avião: Nico assustado apontando o cinzeiro, título gigante. */
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; rot?: number }> = ({ children, size, color = "#fff", rot = 0 }) => (
  <div style={{
    fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, lineHeight: 0.95, color, textAlign: "center",
    WebkitTextStroke: `${size * 0.13}px #1b0f08`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,.55)`,
    transform: `rotate(${rot}deg)`, textTransform: "uppercase",
  }}>{children}</div>
);

export const Capa: React.FC<{ lang?: "pt" | "en" }> = ({ lang = "pt" }) => {
  const en = lang === "en";
  const f = 40;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Lav cam={{ pos: [0.05, 1.5, 2.5], target: [0.08, 1.38, 0.3], fov: 42 }}>
        <group position={[0.5, 1.42, 0.25]} rotation={[0, Math.PI / 2 - 0.25, 0]} scale={2.3}>
          <Box s={[0.03, 0.36, 0.46]} p={[0.04, 0, 0]} c="#8f98a3" />
          <Ashtray p={[0, 0, 0]} glow={0} open={0.2} />
          <group rotation={[0, -Math.PI / 2, 0]}><Cigarette p={[-0.05, -0.045, 0.05]} rot={[0.2, 0.3, -0.25]} s={0.6} frame={f} lit={0.6} smoke={0.8} /></group>
        </group>
        <mesh position={[0.5, 1.42, 0.32]} rotation={[0, -0.25, 0]}>
          <torusGeometry args={[0.44, 0.035, 8, 48]} />
          <meshBasicMaterial color="#ff3b2f" />
        </mesh>
        <Nico f={f} p={[-0.42, 0, 0.55]} ry={0.35} face={nicoFace(f, [[0, "surprised"]], { look: [0.75, 0.05], sweat: true, blink: 0 })}
          pose={{ armR: [-0.15, 0, 1.4], armL: [-0.4, 0, -0.9], head: [0.05, 0.2, 0.08], lean: -0.04 }} />
      </Lav>
      <Vignette />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120, gap: 6 }}>
        <T size={118}>{en ? "Why is there an" : "Por que tem"}</T>
        <T size={190} color="#ffd23f" rot={-3}>{en ? "ashtray" : "cinzeiro"}</T>
        <T size={128}>{en ? "on planes?!" : "no avião?!"}</T>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div style={{ background: "#d62a1e", padding: "14px 40px", borderRadius: 28, border: "10px solid #1b0f08", transform: "rotate(-4deg)" }}>
          <T size={92}>{en ? "Smoking is banned!" : "É proibido fumar!"}</T>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
