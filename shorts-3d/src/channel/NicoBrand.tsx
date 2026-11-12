import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Lights, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { Plane } from "../short8/cena";
import { Tower } from "../short10/cena";
import { Pigeon } from "../short9/cena";

/** Identidade visual do canal do Nico: foto de perfil (800x800) e banner (2560x1440). */
const LIGHT = <Lights warm="#fff1d6" sky="#e6f2ff" key={2.4} keyPos={[-3, 5, 6]} />;
const NICO_FACE = { expr: "smile" as const, eyes: "big" as const, iris: "#e2a236", lid: -0.14, look: [0, 0.05] as [number, number], blush: true };

const Rays: React.FC<{ c1: string; c2: string; cx?: string; cy?: string }> = ({ c1, c2, cx = "50%", cy = "50%" }) => (
  <AbsoluteFill style={{ background: `repeating-conic-gradient(from 0deg at ${cx} ${cy}, ${c1} 0deg 10deg, ${c2} 10deg 20deg)` }} />
);
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; rot?: number }> = ({ children, size, color = "#fff", rot = 0 }) => (
  <div style={{ fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, lineHeight: 0.95, color, whiteSpace: "nowrap", WebkitTextStroke: `${size * 0.13}px #1b0f08`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,.55)`, transform: `rotate(${rot}deg)` }}>{children}</div>
);

/** Foto de perfil: o rosto do Nico sorrindo, fundo de raios laranja (fica bem no círculo do YouTube). */
export const NicoAvatar: React.FC = () => (
  <AbsoluteFill>
    <Rays c1="#f2a23a" c2="#f7b955" />
    <Stage flat background="transparent" lights={LIGHT} cam={{ pos: [0.1, 1.72, 1.55], target: [0, 1.62, 0], fov: 34 }} fg={
      <Cel thickness={0.012}>
        <Toon kind="nico" position={[0, 0, 0]} rotationY={0.12} face={NICO_FACE} pose={{ head: [0.02, 0.05, -0.06] }} />
      </Cel>
    } />
  </AbsoluteFill>
);

/** Banner: tudo o que importa fica na faixa central "segura" (1546x423), que aparece em TV, PC e celular. */
export const NicoBanner: React.FC<{ lang?: "en" | "pt" }> = ({ lang = "en" }) => {
  const { width } = useVideoConfig();
  const en = lang === "en";
  return (
    <AbsoluteFill>
      <Rays c1="#2c6fb6" c2="#3a80c9" cx="38%" cy="50%" />
      <Stage flat background="transparent" lights={LIGHT} cam={{ pos: [0, 1.25, 8.2], target: [0, 1.25, 0], fov: 30 }} fg={
        <Cel>
          {/* Nico à esquerda da faixa central, acenando */}
          <Toon kind="nico" position={[-2.05, 0.25, 0]} rotationY={0.35} face={{ ...NICO_FACE, expr: "happy" }} pose={{ armR: [-0.2, 0, 2.5], armL: [0, 0, -0.2], head: [0, 0.1, -0.08] }} />
          {/* objetos dos episódios à direita */}
          <group position={[2.6, 2.75, -1.0]} rotation={[0.1, -0.3, 0.12]} scale={0.26}><Plane frame={0} /></group>
          <group position={[3.6, -0.3, -1.6]} scale={0.27}><Tower /></group>
          <Pigeon p={[2.15, 0.3, 0.4]} ry={-0.5} s={1.7} frame={9} goggles happy />
          <Pigeon p={[-3.0, 0.25, 0.3]} ry={0.5} s={1.6} frame={4} happy />
        </Cel>
      } />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateX(${width * 0.035}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <T size={150} color="#ffd23f" rot={-2}>{en ? "NICO EXPLAINS" : "NICO EXPLICA"}</T>
          <div style={{ background: "#1b0f08", borderRadius: 30, padding: "10px 34px" }}>
            <T size={54}>{en ? "Weird facts, explained in 1 minute" : "Curiosidades reais em 1 minuto"}</T>
          </div>
          <T size={44} color="#ffffff">{en ? "New Shorts every week ✦" : "Shorts novos toda semana ✦"}</T>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
