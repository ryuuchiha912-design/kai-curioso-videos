import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";

/** Cenários do short "The town where everyone lives in ONE building" (Whittier, Alasca). */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, r = 0.7, e, ei = 0, map }) => (
  <meshStandardMaterial color={c} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
);

export const LIGHT_DAY = <Lights warm="#fff4e2" sky="#dfeaff" key={2.2} keyPos={[-4, 6, 5]} />;
export const LIGHT_STORM = <Lights warm="#c9d6f0" sky="#7a8aa8" key={1.4} keyPos={[-3, 5, 4]} />;
export const LIGHT_NIGHT = <Lights warm="#8fa8ff" sky="#2a3558" key={1.1} keyPos={[-2, 5, 3]} />;
export const LIGHT_INSIDE = <Lights warm="#fff0d0" sky="#f0e8d8" key={2.0} keyPos={[2, 5, 4]} />;
export const LIGHT_SEPIA = <Lights warm="#ffd59a" sky="#e8c89a" key={2.2} keyPos={[-3, 5, 4]} />;

/** Janelas do prédio: grade 14 andares; `lit` acende algumas à noite. */
const towerTex = (lit: number, sepia = false) => canvasTexture(`torre-${lit > 0.5 ? 1 : 0}-${sepia}`, 256, 512, (ctx, w, h) => {
  ctx.fillStyle = sepia ? "#cdb48a" : "#e9e2d2"; ctx.fillRect(0, 0, w, h);
  const rows = 14, cols = 8, ch = h / rows, cw = w / cols;
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = sepia ? "rgba(90,60,30,.25)" : "rgba(60,60,80,.18)"; ctx.fillRect(0, r * ch, w, 3);
    for (let c = 0; c < cols; c++) {
      const on = lit > 0.5 && rand(r * 13 + c * 7) > 0.35;
      ctx.fillStyle = on ? "#ffd56a" : sepia ? "#7a6248" : "#4a5a72";
      ctx.fillRect(c * cw + cw * 0.22, r * ch + ch * 0.25, cw * 0.56, ch * 0.5);
    }
  }
});

/** O prédio de 14 andares (2,4 x 1,2 x 5,6). */
export const Tower: React.FC<{ p?: V3; ry?: number; s?: number; lit?: number; sepia?: boolean; build?: number }> = ({ p = [0, 0, 0], ry = 0, s = 1, lit = 0, sepia = false, build = 1 }) => {
  const H = 5.6 * build;
  const tex = towerTex(lit, sepia);
  const ft = tex;
  const side = towerTex(lit, sepia);
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, H, 1.2]} />
        <meshStandardMaterial attach="material-0" map={side} emissive={lit ? "#ffcf5a" : "#000"} emissiveMap={side} emissiveIntensity={lit ? 0.6 : 0} />
        <meshStandardMaterial attach="material-1" map={side} emissive={lit ? "#ffcf5a" : "#000"} emissiveMap={side} emissiveIntensity={lit ? 0.6 : 0} />
        <meshStandardMaterial attach="material-2" color={sepia ? "#b89c70" : "#c9c2b4"} />
        <meshStandardMaterial attach="material-3" color="#8a8478" />
        <meshStandardMaterial attach="material-4" map={ft} emissive={lit ? "#ffcf5a" : "#000"} emissiveMap={ft} emissiveIntensity={lit ? 0.6 : 0} />
        <meshStandardMaterial attach="material-5" map={ft} emissive={lit ? "#ffcf5a" : "#000"} emissiveMap={ft} emissiveIntensity={lit ? 0.6 : 0} />
      </mesh>
      {build >= 1 && <>
        <Box s={[2.5, 0.12, 1.3]} p={[0, H + 0.06, 0]} c={sepia ? "#a88c60" : "#b9b2a4"} />
        <Box s={[0.5, 0.35, 0.4]} p={[0.6, H + 0.3, 0]} c="#9a948a" />
        <mesh position={[-0.6, H + 0.6, 0]}><cylinderGeometry args={[0.02, 0.02, 1.0, 6]} /><M c="#4a4a52" /></mesh>
        <Box s={[0.6, 0.5, 0.06]} p={[0, 0.25, 0.62]} c="#5a4a3a" />
        {/* neve no topo */}
        <mesh position={[0, H + 0.13, 0]} scale={[1.25, 0.08, 0.66]}><sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><M c="#ffffff" r={0.9} /></mesh>
      </>}
      {build < 1 && Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.05, H + 0.6, 0.05]} p={[-1.3 + (i % 3) * 1.3, (H + 0.6) / 2, i < 3 ? 0.7 : -0.7]} c="#8a5a3a" />)}
    </group>
  );
};

/** Montanha com neve no pico. */
export const Mountain: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#6f7f8e" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 2, 0]}><coneGeometry args={[3, 4, 7]} /><M c={c} /></mesh>
    <mesh position={[0, 3.25, 0]}><coneGeometry args={[1.15, 1.55, 7]} /><M c="#ffffff" r={0.9} /></mesh>
  </group>
);

/** Chão de neve, mar e montanhas em volta. */
export const Valley: React.FC<{ night?: boolean; sepia?: boolean }> = ({ night = false, sepia = false }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><M c={sepia ? "#e8d8b8" : night ? "#c8d2ea" : "#f4f6fa"} r={0.95} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 9]}><planeGeometry args={[60, 10]} /><M c={sepia ? "#7a8a8a" : night ? "#1e3050" : "#3f7fae"} r={0.4} /></mesh>
    {[[-9, 0, -12, 2.2], [-3, 0, -15, 2.8], [4, 0, -13, 2.4], [10, 0, -11, 2.0], [-14, 0, -6, 1.8], [15, 0, -5, 1.9]].map(([x, y, z, s], i) => <Mountain key={i} p={[x, y, z]} s={s} c={sepia ? "#8a7a62" : night ? "#3a4560" : ["#6f7f8e", "#5f6f80", "#7a8a98"][i % 3]} />)}
    {[[-4.5, 0, -2], [4.2, 0, -1.5], [-6, 0, 1.5], [5.5, 0, 2.5]].map(([x, y, z], i) => (
      <group key={i} position={[x, y, z]}>
        <Box s={[1.0, 0.7, 0.8]} p={[0, 0.35, 0]} c={["#b5523b", "#3e6a8a", "#7a8a4a", "#c9a24a"][i]} />
        <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.75, 0.4, 4]} /><M c="#ffffff" /></mesh>
      </group>
    ))}
  </group>
);

/** Neve caindo (ou nevasca com vento). */
export const Snow: React.FC<{ frame: number; n?: number; wind?: number; area?: number }> = ({ frame, n = 80, wind = 0, area = 10 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const sp = 0.012 + rand(i) * 0.01, t = (frame * sp + rand(i + 1)) % 1;
      const x = ((rand(i + 2) * area + t * wind * 8) % area) - area / 2, z = (rand(i + 3) - 0.5) * area * 0.6;
      return <mesh key={i} position={[x, 6 - t * 6.5, z]} scale={wind > 0 ? [0.08, 0.025, 0.025] : 0.035}><sphereGeometry args={[1, 6, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.95} /></mesh>;
    })}
  </group>
);

/** Placa com texto e ícone desenhado (para as portas do corredor). */
const signTex = (txt: string, col: string) => canvasTexture(`placa-${txt}-${col}-${fontReady()}`, 512, 160, (ctx, w, h) => {
  ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "#1b120d"; ctx.lineWidth = 12; ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; let size = 84; ctx.font = `${size}px ${FONT}`;
  while (ctx.measureText(txt).width > w * 0.86) { size -= 4; ctx.font = `${size}px ${FONT}`; }
  ctx.fillText(txt, w / 2, h / 2 + 4);
});
export const Door: React.FC<{ p: V3; label: string; col: string; pop?: number; ry?: number }> = ({ p, label, col, pop = 1, ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box s={[0.9, 1.9, 0.08]} p={[0, 0.95, 0]} c="#8a6a48" />
    <mesh position={[0.32, 0.95, 0.05]}><sphereGeometry args={[0.04, 10, 8]} /><M c="#e0b13a" r={0.3} /></mesh>
    <group position={[0, 2.25, 0.06]} scale={Math.max(0.001, pop)}>
      <Box s={[1.15, 0.38, 0.05]} p={[0, 0, -0.02]} c="#1b120d" />
      <mesh position={[0, 0, 0.01]}><planeGeometry args={[1.1, 0.34]} /><meshStandardMaterial map={signTex(label, col)} /></mesh>
    </group>
  </group>
);

/** Corredor interno do prédio: piso, paredes, portas, elevador. */
export const Hallway: React.FC<{ pops: number[] }> = ({ pops }) => {
  const doors: [string, string][] = [["POLICE", "#2c6fb6"], ["POST OFFICE", "#c62a2a"], ["CLINIC", "#3e9b4a"], ["GROCERY", "#e07b39"], ["CHURCH", "#7a4cc8"]];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4, 16]} /><M c="#b9a98a" /></mesh>
      <mesh position={[-1.6, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 3.2]} /><M c="#e8dcc0" /></mesh>
      <mesh position={[1.6, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[16, 3.2]} /><M c="#e8dcc0" /></mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[4, 16]} /><M c="#f4efe2" /></mesh>
      {Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.5, 0.04, 0.3]} p={[0, 3.17, -6 + i * 2.4]} c="#fffbe8" e="#fff6d0" ei={1} shadow={false} />)}
      {doors.map(([l, c], i) => <Door key={l} p={[i % 2 ? 1.56 : -1.56, 0, 3 - i * 2.2]} ry={i % 2 ? -Math.PI / 2 : Math.PI / 2} label={l} col={c} pop={0} />)}
      {/* placas de bandeira (perpendiculares à parede), viradas para quem anda no corredor */}
      {doors.map(([l, c], i) => (
        <group key={l + "b"} position={[i % 2 ? 1.0 : -1.0, 2.55, 3 - i * 2.2]} scale={Math.max(0.001, pops[i] ?? 1)}>
          <Box s={[1.15, 0.42, 0.05]} p={[0, 0, -0.03]} c="#1b120d" />
          <mesh position={[0, 0, 0.0]}><planeGeometry args={[1.1, 0.37]} /><meshStandardMaterial map={signTex(l, c)} /></mesh>
          <Box s={[0.03, 0.3, 0.03]} p={[0, 0.35, -0.03]} c="#3a3f4b" />
        </group>
      ))}
      {/* elevador no fundo */}
      <group position={[0, 0, -7.9]}>
        <Box s={[1.4, 2.2, 0.1]} p={[0, 1.1, 0]} c="#9aa3ad" />
        <Box s={[0.02, 2.0, 0.12]} p={[0, 1.0, 0.02]} c="#5a6070" />
        <Box s={[0.5, 0.25, 0.06]} p={[0, 2.45, 0.02]} c="#1b120d" />
      </group>
    </group>
  );
};

/** Túnel subterrâneo (meio cilindro) até a escola. */
export const SchoolTunnel: React.FC<{ frame: number; lights?: number }> = ({ frame, lights = 1 }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]}><cylinderGeometry args={[1.8, 1.8, 14, 24, 1, true, Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#c9c2b4" side={THREE.BackSide} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.6, 14]} /><M c="#8a8478" /></mesh>
    {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0, 1.72, 3 - i * 2]}><sphereGeometry args={[0.08, 10, 8]} /><M c="#fff6d0" e="#ffe9a0" ei={lights * (1 + Math.sin(frame * 0.2 + i) * 0.1)} /></mesh>)}
    <group position={[0, 0, -8.9]}>
      <Box s={[1.4, 2.0, 0.1]} p={[0, 1.0, 0]} c="#3e6a8a" />
      <group position={[0, 2.3, 0.06]}><Box s={[1.45, 0.4, 0.05]} p={[0, 0, -0.02]} c="#1b120d" /><mesh position={[0, 0, 0.01]}><planeGeometry args={[1.4, 0.36]} /><meshStandardMaterial map={signTex("SCHOOL", "#f2b636")} /></mesh></group>
    </group>
  </group>
);

/** Montanha com a boca do túnel, estrada de uma pista com trilhos. */
export const RoadTunnel: React.FC<{ gate?: number; night?: boolean; lamp?: "red" | "green" }> = ({ gate = 0, night = false, lamp = "green" }) => (
  <group>
    <mesh position={[0, 3, -3]} scale={[1.6, 1, 1]}><coneGeometry args={[5, 7, 9]} /><M c={night ? "#3a4560" : "#6f7f8e"} /></mesh>
    <mesh position={[0, 5.4, -3]} scale={[1.6, 1, 1]}><coneGeometry args={[1.6, 2.2, 9]} /><M c="#ffffff" /></mesh>
    <Box s={[2.6, 2.4, 0.5]} p={[0, 1.2, 0.6]} c={night ? "#5a6070" : "#9aa3ad"} />
    <mesh position={[0, 1.0, 0.86]}><planeGeometry args={[1.9, 2.0]} /><meshBasicMaterial color="#0d0d12" /></mesh>
    <mesh position={[0, 2.0, 0.86]}><circleGeometry args={[0.95, 24, 0, Math.PI]} /><meshBasicMaterial color="#0d0d12" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]}><planeGeometry args={[2.0, 9]} /><M c="#4a4d55" /></mesh>
    {[-0.45, 0.45].map((x) => <Box key={x} s={[0.06, 0.05, 9]} p={[x, 0.05, 5]} c="#9aa3ad" shadow={false} />)}
    {/* semáforo */}
    <group position={[1.6, 0, 1.6]}>
      <Box s={[0.08, 2.0, 0.08]} p={[0, 1.0, 0]} c="#3a3f4b" />
      <Box s={[0.3, 0.6, 0.2]} p={[0, 2.2, 0]} c="#1b1b1f" />
      <mesh position={[0, 2.35, 0.11]}><sphereGeometry args={[0.09, 12, 10]} /><M c={lamp === "red" ? "#ff3b2f" : "#4a1a1a"} e="#ff3b2f" ei={lamp === "red" ? 2 : 0} /></mesh>
      <mesh position={[0, 2.08, 0.11]}><sphereGeometry args={[0.09, 12, 10]} /><M c={lamp === "green" ? "#4cff6a" : "#1a3a1a"} e="#4cff6a" ei={lamp === "green" ? 2 : 0} /></mesh>
    </group>
    {/* cancela */}
    <group position={[-1.2, 0.9, 2.2]} rotation={[0, 0, (1 - gate) * 1.3]}>
      <Box s={[0.15, 0.15, 0.15]} p={[0, 0, 0]} c="#3a3f4b" />
      {Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.4, 0.1, 0.06]} p={[0.2 + i * 0.4, 0, 0]} c={i % 2 ? "#ffffff" : "#d62a1e"} />)}
    </group>
    <Box s={[0.12, 0.9, 0.12]} p={[-1.2, 0.45, 2.2]} c="#3a3f4b" />
  </group>
);

/** Trenzinho (locomotiva + 2 vagões). */
export const Train: React.FC<{ z: number }> = ({ z }) => (
  <group position={[0, 0, z]}>
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 0, i * 1.7]}>
        <Box s={[0.9, 0.9, 1.5]} p={[0, 0.6, 0]} c={i === 0 ? "#2c6fb6" : "#f2b636"} />
        <Box s={[0.7, 0.3, 1.3]} p={[0, 0.25, 0]} c="#2a2a30" />
        {i > 0 && <Box s={[0.92, 0.25, 1.2]} p={[0, 0.85, 0]} c="#bfe3f5" />}
      </group>
    ))}
    <Box s={[0.6, 0.4, 0.5]} p={[0, 1.25, 0.2]} c="#2c6fb6" />
  </group>
);

/** Carrinho simples. */
export const Car: React.FC<{ p: V3; ry?: number; c?: string; lights?: boolean }> = ({ p, ry = 0, c = "#c62a2a", lights = false }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box s={[0.9, 0.35, 1.6]} p={[0, 0.35, 0]} c={c} />
    <Box s={[0.8, 0.3, 0.8]} p={[0, 0.65, -0.1]} c={c} />
    <Box s={[0.75, 0.22, 0.02]} p={[0, 0.66, -0.51]} c="#bfe3f5" />
    {[[-0.45, -0.55], [0.45, -0.55], [-0.45, 0.55], [0.45, 0.55]].map(([x, z], i) => <mesh key={i} position={[x, 0.17, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.17, 0.17, 0.1, 14]} /><M c="#1b1b1f" /></mesh>)}
    {lights && [-0.3, 0.3].map((x) => <mesh key={x} position={[x, 0.4, -0.81]}><sphereGeometry args={[0.07, 10, 8]} /><M c="#fff6c8" e="#fff6c8" ei={2} /></mesh>)}
  </group>
);

/** Placa "WHITTIER, ALASKA" num poste. */
export const TownSign: React.FC<{ p: V3; pop?: number }> = ({ p, pop = 1 }) => (
  <group position={p} scale={Math.max(0.001, pop)}>
    {[-0.6, 0.6].map((x) => <Box key={x} s={[0.08, 1.4, 0.08]} p={[x, 0.7, 0]} c="#6b4426" />)}
    <Box s={[1.7, 0.55, 0.06]} p={[0, 1.3, 0.02]} c="#1b120d" />
    <mesh position={[0, 1.3, 0.06]}><planeGeometry args={[1.62, 0.48]} /><meshStandardMaterial map={signTex("WHITTIER, ALASKA", "#3e6a4a")} /></mesh>
  </group>
);
