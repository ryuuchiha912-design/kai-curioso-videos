import React from "react";
import * as THREE from "three";
import { Box, Coin, Sign } from "../kit/props";
import { Street } from "../kit/sets";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT } from "../kit/textures";
import { rand } from "../kit/anim";

type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number }> = ({ c, r = 0.6, m = 0, e, ei = 0 }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} />
);

// ------------------------------------------------------------------ luz e fundo (regra 2: quente, fim de tarde)
export const BG = "#f6c08e";
export const LIGHTS = <Lights warm="#ffd9a8" sky="#ffd7b0" key={2.6} keyPos={[-4, 5, 5]} />;
export const LIGHTS_DARK = <Lights warm="#ffb3a0" sky="#8a96c8" key={1.8} keyPos={[3, 6, 4]} />;

// ------------------------------------------------------------------ cenários
/** Rua do bairro (kit), deslocada para longe da fachada da loja do kit. */
export const StreetBack: React.FC<{ f: number }> = ({ f }) => (
  <group position={[22, 0, 0]}>{Street.back({ frame: f, sky: "#ffcf9a", sun: "#fff1c4" })}</group>
);
export const StreetFront: React.FC<{ f: number }> = ({ f }) => <group position={[22, 0, 0]}>{Street.front({ frame: f })}</group>;

const concrete = () =>
  canvasTexture("concrete", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#b9b4ab"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(60,50,40,${rand(i) * 0.08})`; ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 3, 3); }
  });
export const GarageBack: React.FC = () => (
  <group>
    <Box s={[10, 4, 0.2]} p={[0, 2, -3]} c="#e9d6b8" />
    {/* prateleiras com caixas */}
    {[0.9, 1.7].map((y, i) => (
      <group key={i}>
        <Box s={[3, 0.06, 0.5]} p={[-2.6, y, -2.7]} c="#8a5a3a" />
        {Array.from({ length: 4 }).map((_, k) => <Box key={k} s={[0.5, 0.4, 0.4]} p={[-3.7 + k * 0.7, y + 0.23, -2.7]} c={["#d9a35a", "#c98a4a", "#e0b878", "#b97a3a"][(k + i) % 4]} />)}
      </group>
    ))}
    {/* portão de enrolar aberto */}
    <Box s={[3.4, 0.5, 0.25]} p={[2.6, 3.4, -2.85]} c="#9aa3ad" />
    <Box s={[3.2, 3.1, 0.05]} p={[2.6, 1.6, -2.95]} c="#ffcf9a" e="#ffe2b0" ei={0.4} />
    <mesh position={[0, 3.6, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[10, 8]} /><meshStandardMaterial color="#d9c6a8" side={THREE.DoubleSide} /></mesh>
  </group>
);
export const GarageFront: React.FC = () => {
  const t = concrete(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial map={t} roughness={0.95} />
    </mesh>
  );
};
export const SchoolBack: React.FC<{ signPop?: number }> = ({ signPop = 1 }) => (
  <group>
    <Box s={[14, 4.5, 0.3]} p={[0, 2.25, -3.2]} c="#f2c27a" />
    <Box s={[14, 0.5, 0.4]} p={[0, 4.5, -3.15]} c="#c9673a" />
    {[-4.5, -2.2, 2.2, 4.5].map((x, i) => <Box key={i} s={[1.4, 1.2, 0.08]} p={[x, 2.6, -3.03]} c="#bfe6ff" e="#fff3c4" ei={0.15} />)}
    <Box s={[1.4, 2.2, 0.08]} p={[0, 1.1, -3.03]} c="#7a4a2a" />
    <Sign text="ESCOLA DO KAI" p={[0, 3.75, -2.95]} w={3.4} h={0.7} bg="#ffd23f" fg="#1d3d8f" border="#1d3d8f" pop={signPop} />
  </group>
);
export const SchoolFront: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[16, 10]} /><meshStandardMaterial color="#d8b38a" roughness={0.95} /></mesh>
    {Array.from({ length: 6 }).map((_, i) => <Box key={i} s={[0.05, 0.01, 6]} p={[-5 + i * 2, 0.005, 0]} c="#fff6dc" shadow={false} />)}
  </group>
);

// ------------------------------------------------------------------ objetos
const noteTex = () =>
  canvasTexture(`nota-${FONT}`, 256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#7ec98a"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#3e8a4a"; ctx.lineWidth = 8; ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#1f5a2a"; ctx.font = `64px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R$", w / 2, h / 2 + 4);
  });
/** Nota de dinheiro genérica (não imita cédula real). */
export const Nota: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <mesh position={p} rotation={rot} scale={s} castShadow>
    <planeGeometry args={[0.32, 0.16]} />
    <meshStandardMaterial map={noteTex()} side={THREE.DoubleSide} roughness={0.8} />
  </mesh>
);
export const Pastel: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <mesh position={p} rotation={rot} scale={[s * 1.4, s * 0.45, s]} castShadow>
    <sphereGeometry args={[0.1, 20, 12, 0, Math.PI]} />
    <M c="#e8b45a" r={0.5} />
  </mesh>
);
export const PastelTray: React.FC<{ p?: V3; s?: number; n?: number }> = ({ p = [0, 0, 0], s = 1, n = 6 }) => (
  <group position={p} scale={s}>
    <Box s={[0.6, 0.03, 0.4]} p={[0, 0, 0]} c="#d0d4dc" />
    {Array.from({ length: n }).map((_, i) => <Pastel key={i} p={[-0.18 + (i % 3) * 0.18, 0.02 + Math.floor(i / 3) * 0.05, -0.08 + Math.floor(i / 3) * 0.12]} rot={[0, 0.3 * (i % 2 ? 1 : -1), 0]} />)}
  </group>
);
export const Maleta: React.FC<{ p?: V3; rot?: V3; s?: number; open?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, open = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[0.7, 0.18, 0.45]} p={[0, 0.09, 0]} c="#6b4426" r={0.4} />
    {Array.from({ length: 6 }).map((_, i) => <Box key={i} s={[0.3, 0.1, 0.17]} p={[-0.17 + (i % 2) * 0.34, 0.2, -0.1 + Math.floor(i / 2) * 0.1]} c="#7ec98a" />)}
    <group position={[0, 0.18, -0.225]} rotation={[-open * 1.9, 0, 0]}>
      <Box s={[0.7, 0.06, 0.45]} p={[0, 0.03, 0.225]} c="#7a4e2c" r={0.4} />
      <Box s={[0.16, 0.05, 0.04]} p={[0, 0.07, 0.45]} c="#2a1a10" />
    </group>
  </group>
);
export const Moto: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#e04b3c" }) => (
  <group position={p} rotation={rot} scale={s}>
    {[-0.42, 0.42].map((x, i) => (
      <mesh key={i} position={[x, 0.22, 0]} rotation={[0, 0, 0]} castShadow><torusGeometry args={[0.18, 0.06, 12, 28]} /><M c="#222" r={0.8} /></mesh>
    ))}
    <mesh position={[0, 0.45, 0]} scale={[1.6, 0.6, 0.6]} castShadow><sphereGeometry args={[0.22, 20, 14]} /><M c={c} r={0.35} m={0.2} /></mesh>
    <Box s={[0.45, 0.08, 0.22]} p={[-0.12, 0.62, 0]} c="#2a2a30" />
    <Box s={[0.05, 0.42, 0.05]} p={[0.36, 0.62, 0]} rot={[0, 0, -0.35]} c="#555" />
    <Box s={[0.05, 0.05, 0.42]} p={[0.43, 0.83, 0]} c="#333" />
    <mesh position={[0.48, 0.62, 0]}><sphereGeometry args={[0.06, 12, 10]} /><M c="#fff6c8" e="#ffe08a" ei={0.6} /></mesh>
  </group>
);
export const Cofre: React.FC<{ p?: V3; rot?: V3; s?: number; spin?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, spin = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[1.6, 1.8, 1.2]} p={[0, 0.9, 0]} c="#7d8794" r={0.35} />
    <mesh position={[0, 0.95, 0.61]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.6, 0.6, 0.06, 40]} /><M c="#aab3bf" r={0.3} m={0.5} /></mesh>
    <group position={[0, 0.95, 0.67]} rotation={[0, 0, spin]}>
      {[0, 1, 2].map((k) => <Box key={k} s={[0.7, 0.06, 0.06]} rot={[0, 0, (k * Math.PI) / 3]} c="#4a5260" />)}
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.08, 20]} /><M c="#ffd23f" r={0.3} m={0.6} /></mesh>
    </group>
  </group>
);
export const GoldPile: React.FC<{ p?: V3; s?: number; frame: number }> = ({ p = [0, 0, 0], s = 1, frame }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0, 0]} castShadow receiveShadow><coneGeometry args={[1.6, 1.4, 40]} /><M c="#f2b62c" r={0.3} m={0.55} /></mesh>
    {Array.from({ length: 70 }).map((_, i) => {
      const a = rand(i) * Math.PI * 2, r = Math.sqrt(rand(i + 7)) * 1.5;
      const y = (1 - r / 1.6) * 1.4 - 0.7 + 0.02;
      return <Coin key={i} p={[Math.cos(a) * r, y, Math.sin(a) * r]} rot={[rand(i + 3) * 0.8, rand(i + 4) * 3, 0]} s={2.2} />;
    })}
    {Array.from({ length: 10 }).map((_, i) => {
      const k = ((frame * 0.03 + i / 10) % 1);
      return <mesh key={`sp${i}`} position={[Math.cos(i * 2.4) * 1.2, 0.8 + k * 1.2, Math.sin(i * 2.4) * 0.6]} scale={(1 - k) * 0.08}><octahedronGeometry args={[1, 0]} /><M c="#fff6c8" e="#ffe08a" ei={1} /></mesh>;
    })}
  </group>
);
export const Clock: React.FC<{ p?: V3; s?: number; frame: number; speed?: number }> = ({ p = [0, 0, 0], s = 1, frame, speed = 0.05 }) => (
  <group position={p} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.35, 0.35, 0.08, 40]} /><M c="#ffffff" /></mesh>
    <mesh position={[0, 0, 0.0]} rotation={[0, 0, 0]}><torusGeometry args={[0.35, 0.04, 10, 40]} /><M c="#e04b3c" /></mesh>
    <group position={[0, 0, 0.05]} rotation={[0, 0, -frame * speed]}><Box s={[0.03, 0.26, 0.02]} p={[0, 0.12, 0]} c="#1a1a20" /></group>
    <group position={[0, 0, 0.06]} rotation={[0, 0, -frame * speed * 0.1]}><Box s={[0.04, 0.18, 0.02]} p={[0, 0.08, 0]} c="#1a1a20" /></group>
  </group>
);
const cardTex = (txt: string, red: boolean) =>
  canvasTexture(`card-${txt}-${red}-${FONT}`, 512, 320, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, red ? "#e04b3c" : "#3d6fd8"); g.addColorStop(1, red ? "#8a1f1f" : "#22357a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(40, 90, 80, 60);
    ctx.fillStyle = "#fff"; ctx.font = `44px ${FONT}`; ctx.fillText("CARTÃO", 40, 60);
    ctx.font = `92px ${FONT}`; ctx.textAlign = "right"; ctx.fillText(txt, w - 36, h - 50);
  });
export const Cartao: React.FC<{ p?: V3; rot?: V3; s?: number; txt?: string; red?: boolean }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, txt = "R$ 50", red = false }) => (
  <mesh position={p} rotation={rot} scale={s} castShadow>
    <boxGeometry args={[0.5, 0.31, 0.015]} />
    <meshStandardMaterial attach="material-0" color="#22357a" /><meshStandardMaterial attach="material-1" color="#22357a" />
    <meshStandardMaterial attach="material-2" color="#22357a" /><meshStandardMaterial attach="material-3" color="#22357a" />
    <meshStandardMaterial attach="material-4" map={cardTex(txt, red)} roughness={0.35} /><meshStandardMaterial attach="material-5" color="#22357a" />
  </mesh>
);
