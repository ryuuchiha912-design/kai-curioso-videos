import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Lights, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { Plane } from "../short8/cena";

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

/** Objetos de "curiosidade" para o banner. */
const Globe: React.FC<{ p: [number, number, number]; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s} rotation={[0.3, 0.6, 0.2]}>
    <mesh><sphereGeometry args={[0.6, 32, 24]} /><meshStandardMaterial color="#3a8fd8" /></mesh>
    {[[0.35, 0.25, 0.4, 0.22], [-0.3, -0.1, 0.45, 0.26], [0.1, -0.4, 0.42, 0.18], [-0.1, 0.45, 0.35, 0.16]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} scale={[1, 0.8, 0.35]}><sphereGeometry args={[r, 16, 12]} /><meshStandardMaterial color="#4caf50" /></mesh>
    ))}
    <mesh rotation={[Math.PI / 2, 0, 0.4]}><torusGeometry args={[0.78, 0.035, 8, 40]} /><meshStandardMaterial color="#e0b13a" /></mesh>
  </group>
);
const Bulb: React.FC<{ p: [number, number, number]; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s} rotation={[0, 0, -0.2]}>
    <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.45, 28, 20]} /><meshStandardMaterial color="#ffe27a" emissive="#ffd23f" emissiveIntensity={0.9} /></mesh>
    <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.22, 0.2, 0.32, 20]} /><meshStandardMaterial color="#9aa3ad" /></mesh>
    <mesh position={[0, -0.42, 0]}><sphereGeometry args={[0.12, 14, 10]} /><meshStandardMaterial color="#3a3f4b" /></mesh>
  </group>
);
const Magnifier: React.FC<{ p: [number, number, number]; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s} rotation={[0.2, 0.3, 0.6]}>
    <mesh><torusGeometry args={[0.42, 0.08, 12, 40]} /><meshStandardMaterial color="#e07b39" /></mesh>
    <mesh><circleGeometry args={[0.4, 32]} /><meshStandardMaterial color="#bfe3f5" transparent opacity={0.6} /></mesh>
    <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.07, 0.09, 0.75, 14]} /><meshStandardMaterial color="#6b4426" /></mesh>
  </group>
);
const Sparkle: React.FC<{ x: string; y: string; size: number; c?: string; rot?: number }> = ({ x, y, size, c = "#fff6c8", rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "'Lilita One', sans-serif", fontSize: size, color: c, transform: `rotate(${rot}deg)`, WebkitTextStroke: `${size * 0.1}px #1b0f08`, paintOrder: "stroke fill" }}>?</div>
);

/** Banner: tudo o que importa fica na faixa central "segura" (1546x423), que aparece em TV, PC e celular. */
export const NicoBanner: React.FC<{ lang?: "en" | "pt" }> = ({ lang = "en" }) => {
  const { width } = useVideoConfig();
  const en = lang === "en";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 50%, #3f86cf 0%, #2c5fa8 45%, #24306e 100%)" }} />
      <AbsoluteFill style={{ background: "repeating-conic-gradient(from 0deg at 45% 50%, rgba(255,255,255,0.06) 0deg 8deg, rgba(255,255,255,0) 8deg 16deg)" }} />
      <Sparkle x="6%" y="12%" size={170} rot={-14} c="#ffd23f" />
      <Sparkle x="88%" y="62%" size={150} rot={12} c="#ffffff" />
      <Sparkle x="73%" y="8%" size={110} rot={8} c="#ffffff" />
      <Sparkle x="16%" y="70%" size={120} rot={10} c="#ffffff" />
      <Stage flat background="transparent" lights={LIGHT} cam={{ pos: [0, 1.25, 8.2], target: [0, 1.25, 0], fov: 30 }} fg={
        <Cel>
          {/* Nico grande, apontando para o nome do canal */}
          <Toon kind="nico" position={[-2.0, -0.35, 0.6]} rotationY={0.45} scale={1.25} face={{ ...NICO_FACE, expr: "happy" }} pose={{ armR: [-0.15, 0, 1.55], armL: [0, 0, -0.25], head: [0, 0.2, -0.1] }} />
          <group position={[2.55, 2.75, -1.0]} rotation={[0.1, -0.3, 0.12]} scale={0.26}><Plane frame={0} /></group>
          <Bulb p={[2.6, 1.35, 0]} s={0.75} />
          <Globe p={[3.15, 0.2, -0.4]} s={0.8} />
          <Magnifier p={[-3.25, 2.1, -0.3]} s={0.75} />
        </Cel>
      } />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateX(${width * 0.04}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <T size={168} color="#ffd23f" rot={-2}>{en ? "NICO EXPLAINS" : "NICO EXPLICA"}</T>
          <div style={{ background: "#1b0f08", borderRadius: 34, padding: "10px 38px", border: "6px solid #ffd23f" }}>
            <T size={56}>{en ? "Weird facts, explained in 1 minute" : "Curiosidades reais em 1 minuto"}</T>
          </div>
          <T size={44} color="#ffffff">{en ? "New Shorts every week" : "Shorts novos toda semana"}</T>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
