import React from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { Lights, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Box, Sign } from "../kit/props";
import { FlatTV } from "../kit/props2";
import { canvasTexture } from "../kit/textures";
import { rand } from "../kit/anim";

/**
 * Cenários 3D (só o fundo) dos vídeos longos do canal do Neo.
 * Cada cenário vira uma imagem 16:9 em alta; o personagem 2D é desenhado por cima no pipeline 2D.
 * Câmera fixa na altura dos olhos: o chão onde os personagens pisam fica na faixa de baixo da imagem.
 */
type V3 = [number, number, number];
export type FundoId =
  | "banheiro" | "quarto" | "quartoNoite" | "sala" | "escritorio" | "banco" | "mercado" | "consultorio"
  | "infancia" | "infanciaNoite" | "maeSala" | "maeSalaNoite" | "maeCozinha" | "escola" | "rua" | "ruaTarde";

// ------------------------------------------------------------------ texturas
const tx = (t: THREE.Texture, rx: number, ry: number) => {
  const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c;
};
const planks = (base: string) => canvasTexture(`lp-${base}`, 512, 512, (ctx, w, h) => {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(70,35,10,${0.05 + rand(i) * 0.08})`; ctx.fillRect(0, (i * h) / 8, w, h / 8 - 3);
    ctx.fillStyle = "rgba(60,30,10,0.35)"; ctx.fillRect(0, ((i + 1) * h) / 8 - 3, w, 3); ctx.fillRect(rand(i * 3) * w, (i * h) / 8, 3, h / 8);
  }
});
const tiles = (a: string, b: string) => canvasTexture(`lt-${a}-${b}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = a; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = b; ctx.lineWidth = 4;
  for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo((i * w) / 4, 0); ctx.lineTo((i * w) / 4, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, (i * h) / 4); ctx.lineTo(w, (i * h) / 4); ctx.stroke(); }
});
const stripesV = (a: string, b: string) => canvasTexture(`lsv-${a}-${b}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = a; ctx.fillRect(0, 0, w, h); ctx.fillStyle = b; for (let i = 0; i < 8; i += 2) ctx.fillRect((i * w) / 8, 0, w / 8, h);
});
const M: React.FC<{ c: string; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, e, ei = 0, map }) => <meshStandardMaterial color={c} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} roughness={0.85} />;

// ------------------------------------------------------------------ cômodo genérico
const Room: React.FC<{ wall: string; wall2?: string; wallTex?: THREE.Texture; floor: THREE.Texture; children?: React.ReactNode; ceil?: string }> = ({ wall, wall2, wallTex, floor, children, ceil = "#f4efe6" }) => (
  <group>
    <mesh position={[0, 1.7, -2.6]} receiveShadow><planeGeometry args={[14, 3.4]} /><M c={wall} map={wallTex} /></mesh>
    <mesh position={[-5.5, 1.7, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[8, 3.4]} /><M c={wall2 ?? wall} map={wallTex} /></mesh>
    <mesh position={[5.5, 1.7, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[8, 3.4]} /><M c={wall2 ?? wall} map={wallTex} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow><planeGeometry args={[14, 8]} /><M c="#ffffff" map={floor} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.4, 1]}><planeGeometry args={[14, 8]} /><M c={ceil} /></mesh>
    <Box s={[14, 0.14, 0.05]} p={[0, 0.07, -2.57]} c="#fbf6ee" />
    {children}
  </group>
);
const Window: React.FC<{ p: V3; w?: number; h?: number; night?: boolean; sky?: string; curtain?: string }> = ({ p, w = 1.6, h = 1.3, night, sky, curtain = "#e9d8c4" }) => (
  <group position={p}>
    <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial color={sky ?? (night ? "#1a2550" : "#a9dcff")} /></mesh>
    {night ? <mesh position={[w * 0.25, h * 0.22, 0.01]}><circleGeometry args={[0.12, 24]} /><meshBasicMaterial color="#fff6cf" /></mesh>
      : <><mesh position={[-w * 0.2, -h * 0.25, 0.01]} scale={[1.8, 0.6, 1]}><circleGeometry args={[0.18, 24]} /><meshBasicMaterial color="#ffffff" /></mesh>
        {[-0.5, -0.15, 0.25].map((x, i) => <mesh key={i} position={[x * w, -h * 0.42 + 0.12 * i, 0.005]}><planeGeometry args={[0.28 * w, 0.35 + i * 0.12]} /><meshBasicMaterial color={["#7fa6c8", "#8db4d4", "#6f97bb"][i]} /></mesh>)}</>}
    <Box s={[w + 0.12, 0.08, 0.1]} p={[0, h / 2, 0]} c="#fbf6ee" /><Box s={[w + 0.12, 0.1, 0.18]} p={[0, -h / 2, 0.04]} c="#fbf6ee" />
    <Box s={[0.08, h, 0.1]} p={[w / 2, 0, 0]} c="#fbf6ee" /><Box s={[0.08, h, 0.1]} p={[-w / 2, 0, 0]} c="#fbf6ee" /><Box s={[0.05, h, 0.06]} p={[0, 0, 0]} c="#fbf6ee" />
    <Box s={[0.4, h + 0.4, 0.06]} p={[-w / 2 - 0.22, -0.1, 0.08]} c={curtain} /><Box s={[0.4, h + 0.4, 0.06]} p={[w / 2 + 0.22, -0.1, 0.08]} c={curtain} />
  </group>
);
const Door: React.FC<{ x: number; c?: string; open?: boolean }> = ({ x, c = "#a8743f", open }) => (
  <group position={[x, 0, -2.55]}>
    <Box s={[1.15, 2.25, 0.08]} p={[0, 1.12, 0]} c="#fbf6ee" />
    <Box s={[0.98, 2.12, 0.06]} p={[open ? -0.35 : 0, 1.06, open ? 0.4 : 0.05]} rot={[0, open ? 1.0 : 0, 0]} c={c} />
    {!open && <mesh position={[0.36, 1.05, 0.11]}><sphereGeometry args={[0.04, 12, 10]} /><M c="#e0b13a" /></mesh>}
  </group>
);
const Frame: React.FC<{ p: V3; w?: number; h?: number; c?: string; inner?: string }> = ({ p, w = 0.55, h = 0.7, c = "#5a3a22", inner = "#9fc7e8" }) => (
  <group position={p}><Box s={[w, h, 0.04]} c={c} /><Box s={[w - 0.1, h - 0.1, 0.045]} c={inner} /></group>
);
const Plant: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.22, 0]} castShadow><cylinderGeometry args={[0.2, 0.15, 0.44, 18]} /><M c="#c86a3a" /></mesh>
    {[[0, 0.75, 0, 0.32], [0.2, 0.62, 0.05, 0.22], [-0.2, 0.6, -0.05, 0.24], [0.05, 0.98, 0, 0.2]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 16, 12]} /><M c={["#4f9a4a", "#5fae58", "#468f45", "#69b862"][i]} /></mesh>)}
  </group>
);
const Lamp: React.FC<{ p: V3; on?: boolean }> = ({ p, on = true }) => (
  <group position={p}>
    <Box s={[0.05, 1.5, 0.05]} p={[0, 0.75, 0]} c="#3a3f4b" /><Box s={[0.36, 0.04, 0.36]} p={[0, 0.02, 0]} c="#3a3f4b" />
    <mesh position={[0, 1.55, 0]}><coneGeometry args={[0.28, 0.32, 24, 1, true]} /><meshStandardMaterial color="#f6e2b0" emissive={on ? "#ffcf70" : "#000"} emissiveIntensity={on ? 0.9 : 0} side={THREE.DoubleSide} /></mesh>
    {on && <pointLight position={[0, 1.4, 0.2]} intensity={1.6} distance={4} color="#ffcf8a" />}
  </group>
);
const Shelf: React.FC<{ p: V3; w?: number }> = ({ p, w = 1.4 }) => (
  <group position={p}>
    {[0, 0.45].map((y, i) => <Box key={i} s={[w, 0.05, 0.28]} p={[0, y, 0]} c="#b9874f" />)}
    {Array.from({ length: 9 }).map((_, i) => <Box key={i} s={[0.09, 0.28 + rand(i) * 0.1, 0.2]} p={[-w / 2 + 0.12 + i * 0.13, 0.17 + (i > 5 ? 0.45 : 0), 0]} c={["#c0392b", "#2c6fb6", "#e0b13a", "#3e9b4a", "#8e6cc8"][i % 5]} />)}
  </group>
);
const Bed: React.FC<{ p: V3; sheet?: string; ry?: number }> = ({ p, sheet = "#7a90c8", ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box s={[1.6, 0.38, 2.2]} p={[0, 0.25, 0]} c="#9a6a3e" /><Box s={[1.55, 0.18, 2.1]} p={[0, 0.52, 0]} c="#fbfbfb" />
    <Box s={[1.6, 0.14, 1.4]} p={[0, 0.66, 0.38]} c={sheet} /><Box s={[0.95, 0.22, 0.45]} p={[0, 0.7, -0.72]} c="#ffffff" />
    <Box s={[1.6, 1.0, 0.12]} p={[0, 0.6, -1.1]} c="#8a5a33" />
  </group>
);
const Desk: React.FC<{ p: V3; monitor?: boolean; lampOn?: boolean }> = ({ p, monitor, lampOn }) => (
  <group position={p}>
    <Box s={[1.5, 0.07, 0.75]} p={[0, 0.8, 0]} c="#d9a46a" />
    {[[-0.68, -0.3], [0.68, -0.3], [-0.68, 0.3], [0.68, 0.3]].map(([x, z], i) => <Box key={i} s={[0.06, 0.8, 0.06]} p={[x, 0.4, z]} c="#8a5a33" />)}
    {monitor && <group position={[0, 0.84, -0.1]}><Box s={[0.75, 0.46, 0.04]} p={[0, 0.38, 0]} c="#1e2230" /><Box s={[0.68, 0.39, 0.045]} p={[0, 0.38, 0.003]} c="#5aa6e6" e="#5aa6e6" ei={0.35} /><Box s={[0.06, 0.15, 0.06]} p={[0, 0.08, 0]} c="#2a2f3a" /></group>}
    {lampOn !== undefined && <group position={[0.55, 0.84, -0.15]}><Box s={[0.03, 0.32, 0.03]} p={[0, 0.16, 0]} c="#555" /><mesh position={[0, 0.36, 0]}><coneGeometry args={[0.16, 0.2, 20, 1, true]} /><meshStandardMaterial color="#ffd23f" emissive={lampOn ? "#ffb400" : "#000"} emissiveIntensity={lampOn ? 0.8 : 0} side={THREE.DoubleSide} /></mesh>{lampOn && <pointLight position={[0, 0.3, 0.2]} intensity={1.2} distance={3} color="#ffcf8a" />}</group>}
  </group>
);
const Chair: React.FC<{ p: V3; c?: string; ry?: number }> = ({ p, c = "#5a6070", ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}><Box s={[0.5, 0.06, 0.5]} p={[0, 0.48, 0]} c={c} /><Box s={[0.5, 0.55, 0.06]} p={[0, 0.78, -0.22]} c={c} />{[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => <Box key={i} s={[0.05, 0.48, 0.05]} p={[x, 0.24, z]} c="#2a2f3a" />)}</group>
);
const Sofa: React.FC<{ p: V3; c?: string }> = ({ p, c = "#8e3644" }) => (
  <group position={p}>
    <Box s={[2.3, 0.45, 0.9]} p={[0, 0.3, 0]} c={c} /><Box s={[2.3, 0.7, 0.25]} p={[0, 0.7, -0.35]} c={c} />
    <Box s={[0.25, 0.65, 0.9]} p={[-1.15, 0.45, 0]} c={c} /><Box s={[0.25, 0.65, 0.9]} p={[1.15, 0.45, 0]} c={c} />
    <Box s={[0.45, 0.4, 0.15]} p={[-0.7, 0.72, -0.15]} rot={[0, 0, 0.2]} c="#f2b636" /><Box s={[0.45, 0.4, 0.15]} p={[0.75, 0.72, -0.15]} rot={[0, 0, -0.2]} c="#e9d8c4" />
  </group>
);
const Wardrobe: React.FC<{ p: V3; c?: string; open?: boolean }> = ({ p, c = "#b9874f", open }) => (
  <group position={p}><Box s={[1.3, 2.1, 0.6]} p={[0, 1.05, 0]} c={c} /><Box s={[0.02, 1.9, 0.62]} p={[0, 1.05, 0]} c="#6b4426" />{open && <Box s={[0.62, 1.9, 0.04]} p={[-0.95, 1.05, 0.6]} rot={[0, -1.2, 0]} c={c} />}</group>
);
const Rug: React.FC<{ p: V3; c?: string; r?: number }> = ({ p, c = "#c9a06a", r = 1.2 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={p} scale={[1.6, 1, 1]} receiveShadow><circleGeometry args={[r, 40]} /><M c={c} /></mesh>
);
const Poster: React.FC<{ p: V3; text: string; bg?: string; fg?: string; w?: number; h?: number }> = ({ p, text, bg = "#2c6fb6", fg = "#ffffff", w = 0.8, h = 1.0 }) => (
  <Sign text={text} p={p} w={w} h={h} bg={bg} fg={fg} border={bg} />
);
const Clock: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.24, 0.24, 0.05, 32]} /><M c="#ffffff" /></mesh><Box s={[0.03, 0.15, 0.02]} p={[0, 0.06, 0.03]} c="#222" /><Box s={[0.12, 0.03, 0.02]} p={[0.05, 0, 0.03]} c="#222" /></group>
);
const Counter: React.FC<{ p: V3; w?: number; c?: string; top?: string }> = ({ p, w = 3, c = "#e9dcc6", top = "#8a5a33" }) => (
  <group position={p}><Box s={[w, 1.05, 0.7]} p={[0, 0.52, 0]} c={c} /><Box s={[w + 0.1, 0.07, 0.8]} p={[0, 1.08, 0]} c={top} /></group>
);

// ------------------------------------------------------------------ cenários
const SETS: Record<FundoId, { cam?: { pos: V3; target: V3; fov?: number }; night?: boolean; bg: string; scene: () => React.ReactNode }> = {
  banheiro: { bg: "#cfe6f2", scene: () => (
    <Room wall="#dff0f6" wallTex={tx(tiles("#e6f3f8", "#c4dbe6"), 10, 3)} floor={tx(tiles("#d9dfe6", "#b7c0cc"), 8, 5)}>
      <group position={[0, 0, -2.45]}>
        <Box s={[2.2, 1.5, 0.05]} p={[0, 1.9, 0]} c="#8fa4b3" /><Box s={[2.05, 1.36, 0.06]} p={[0, 1.9, 0.01]} c="#cfe9f5" e="#bfe3f5" ei={0.25} />
        <Counter p={[0, 0, 0.3]} w={2.4} c="#f4f4f4" top="#d9dfe6" />
        <mesh position={[0, 1.1, 0.3]}><cylinderGeometry args={[0.32, 0.26, 0.12, 24]} /><M c="#ffffff" /></mesh>
        <Box s={[0.05, 0.25, 0.05]} p={[0, 1.25, 0.05]} c="#b8c0c8" />
        <Box s={[0.12, 0.25, 0.12]} p={[0.8, 1.24, 0.25]} c="#3e9b4a" /><Box s={[0.1, 0.3, 0.1]} p={[-0.8, 1.26, 0.25]} c="#e07b39" />
      </group>
      <Box s={[0.06, 2.4, 1.6]} p={[-3.4, 1.2, -1.6]} c="#bfe3f5" /><Plant p={[3.6, 0, -1.8]} s={0.9} />
      <Box s={[0.6, 0.06, 0.6]} p={[2.6, 1.6, -2.5]} c="#ffffff" />
    </Room>) },
  quarto: { bg: "#e9dcc6", scene: () => (
    <Room wall="#e8dcc8" wall2="#dccfb9" floor={tx(planks("#c99662"), 4, 3)}>
      <Window p={[-1.0, 1.85, -2.5]} /><Bed p={[2.6, 0, -1.3]} sheet="#3a4670" /><Desk p={[-3.2, 0, -2.1]} monitor lampOn={false} /><Chair p={[-3.2, 0, -1.4]} ry={Math.PI} />
      <Shelf p={[0.9, 1.6, -2.45]} w={1.1} /><Frame p={[2.6, 2.1, -2.52]} w={0.8} h={0.55} inner="#e07b39" /><Plant p={[-4.6, 0, -1.6]} /><Rug p={[0.2, 0.01, 0.6]} c="#9aa3ad" /><Clock p={[-3.2, 2.5, -2.52]} />
    </Room>) },
  quartoNoite: { night: true, bg: "#2a3352", scene: () => (
    <Room wall="#5a6488" wall2="#4c5578" floor={tx(planks("#7a5a46"), 4, 3)} ceil="#3a4062">
      <Window p={[-1.0, 1.85, -2.5]} night /><Bed p={[2.6, 0, -1.3]} sheet="#3a4670" /><Desk p={[-3.2, 0, -2.1]} monitor lampOn /><Chair p={[-3.2, 0, -1.4]} ry={Math.PI} />
      <Shelf p={[0.9, 1.6, -2.45]} w={1.1} /><Rug p={[0.2, 0.01, 0.6]} c="#6a7390" />
    </Room>) },
  sala: { bg: "#e9dcc6", scene: () => (
    <Room wall="#e3d6c0" wall2="#d6c8b0" floor={tx(planks("#b98a5e"), 4, 3)}>
      <Door x={-3.3} /><Window p={[1.4, 1.85, -2.5]} w={2.0} /><Sofa p={[1.4, 0, -1.8]} c="#5a6488" /><Lamp p={[3.3, 0, -2.1]} on={false} />
      <Frame p={[-1.4, 1.9, -2.52]} w={0.7} h={0.9} inner="#c2577a" /><Plant p={[-4.6, 0, -1.4]} s={1.1} /><Rug p={[1.2, 0.01, 0.4]} c="#c9a06a" />
      <Box s={[0.9, 0.42, 0.5]} p={[1.4, 0.21, -0.6]} c="#8a5a33" />
    </Room>) },
  escritorio: { bg: "#dfe6ee", scene: () => (
    <Room wall="#e6ebf0" wall2="#d9e0e8" floor={tx(tiles("#b9c2cc", "#a6b0bb"), 8, 5)} ceil="#f6f8fa">
      <Window p={[-2.2, 1.9, -2.5]} w={2.6} h={1.5} /><Window p={[1.4, 1.9, -2.5]} w={2.6} h={1.5} />
      {[-3.2, 0, 3.2].map((x, i) => <group key={i}><Desk p={[x, 0, -1.6]} monitor /><Chair p={[x, 0, -0.9]} c="#2c3e66" ry={Math.PI} /><Box s={[1.6, 1.25, 0.05]} p={[x, 0.62, -2.0]} c="#c4ccd6" /></group>)}
      <Plant p={[4.8, 0, -2.0]} s={1.2} /><Sign text="RELATÓRIO" p={[4.3, 2.3, -2.52]} w={1.1} h={0.5} bg="#ffffff" fg="#2c3e66" />
    </Room>) },
  banco: { bg: "#e6e0d0", scene: () => (
    <Room wall="#e6dfcf" wall2="#d8cfbc" floor={tx(tiles("#e9e4da", "#cfc6b6"), 8, 5)}>
      <Sign text="BANCO" p={[0, 2.75, -2.52]} w={2.4} h={0.6} bg="#2c6f5a" fg="#ffffff" />
      <Counter p={[0, 0, -1.6]} w={7} c="#2c6f5a" top="#e9e4da" />
      {[-2.4, 0, 2.4].map((x, i) => <group key={i}><Box s={[1.6, 0.9, 0.04]} p={[x, 1.6, -1.6]} c="#cfe6f2" /><Desk p={[x, 0, -2.2]} monitor /></group>)}
      <Clock p={[3.8, 2.6, -2.52]} /><Plant p={[-4.8, 0, -1.2]} s={1.1} />
    </Room>) },
  mercado: { bg: "#f2ede2", scene: () => (
    <Room wall="#f2ede2" wall2="#e6dfcf" floor={tx(tiles("#f0ece4", "#d6cfc2"), 8, 5)}>
      <Sign text="MERCADO" p={[0, 2.85, -2.52]} w={2.6} h={0.55} bg="#c62a2a" fg="#ffffff" />
      {[-3.6, -1.2, 1.2, 3.6].map((x, i) => <group key={i} position={[x, 0, -2.25]}>{[0.35, 0.95, 1.55, 2.15].map((y, j) => <group key={j}><Box s={[2.1, 0.05, 0.5]} p={[0, y, 0]} c="#b9c2cc" />{Array.from({ length: 7 }).map((_, k) => <Box key={k} s={[0.22, 0.38, 0.3]} p={[-0.9 + k * 0.3, y + 0.22, 0]} c={["#e04b3c", "#f2b636", "#3e9b4a", "#2c6fb6", "#e07b39", "#8e6cc8", "#ffffff"][(k + j + i) % 7]} />)}</group>)}</group>)}
      <Counter p={[0, 0, -0.7]} w={2.6} c="#5a6070" top="#2a2f3a" /><Box s={[0.5, 0.35, 0.4]} p={[0.8, 1.3, -0.75]} c="#2a2f3a" /><Box s={[0.4, 0.22, 0.03]} p={[0.8, 1.55, -0.95]} c="#5aa6e6" e="#5aa6e6" ei={0.4} />
    </Room>) },
  consultorio: { bg: "#e7f1f2", scene: () => (
    <Room wall="#e7f1f2" wall2="#d6e6e8" floor={tx(tiles("#dfe8ea", "#c6d3d6"), 8, 5)} ceil="#ffffff">
      <Box s={[2.0, 0.55, 0.8]} p={[2.4, 0.5, -1.9]} c="#7fb8c8" /><Box s={[2.0, 0.12, 0.75]} p={[2.4, 0.83, -1.9]} c="#ffffff" /><Box s={[0.6, 0.18, 0.7]} p={[1.6, 0.98, -1.9]} rot={[0, 0, 0.3]} c="#ffffff" />
      <Box s={[1.3, 1.9, 0.5]} p={[-3.6, 0.95, -2.3]} c="#ffffff" /><Box s={[1.2, 0.9, 0.04]} p={[-3.6, 1.35, -2.04]} c="#cfe6f2" />
      <Sign text="RAIO-X" p={[-1.2, 1.9, -2.52]} w={1.1} h={0.9} bg="#1a2330" fg="#9fdcff" /><Desk p={[0.2, 0, -2.0]} monitor /><Chair p={[0.2, 0, -1.3]} c="#2c6fb6" ry={Math.PI} />
      <Plant p={[4.7, 0, -1.4]} />
    </Room>) },
  infancia: { bg: "#cfe3c8", scene: () => (
    <Room wall="#cfe3c8" wall2="#bfd6b8" wallTex={tx(stripesV("#d3e6cc", "#c6dcbe"), 10, 1)} floor={tx(planks("#d9a066"), 4, 3)}>
      <Window p={[0.2, 1.85, -2.5]} curtain="#f2b636" /><Bed p={[3.0, 0, -1.3]} sheet="#2c6fb6" /><Desk p={[-3.0, 0, -2.1]} lampOn={false} />
      <Poster p={[-1.6, 2.1, -2.52]} text="FUTEBOL" bg="#3e9b4a" /><Poster p={[1.8, 2.15, -2.52]} text="ESPAÇO" bg="#2c3e66" fg="#ffe14d" w={0.7} h={0.9} />
      <Wardrobe p={[-4.5, 0, -1.6]} c="#c98a4b" /><Rug p={[0.2, 0.01, 0.5]} c="#ffcf5a" r={1.0} />
      <mesh position={[1.1, 0.18, -1.9]}><sphereGeometry args={[0.18, 18, 14]} /><M c="#ffffff" /></mesh>
    </Room>) },
  infanciaNoite: { night: true, bg: "#2a3352", scene: () => (
    <Room wall="#53608a" wall2="#47527a" floor={tx(planks("#7a5a46"), 4, 3)} ceil="#363d5e">
      <Window p={[0.2, 1.85, -2.5]} night curtain="#a88a3a" /><Bed p={[3.0, 0, -1.3]} sheet="#2c6fb6" /><Desk p={[-3.0, 0, -2.1]} lampOn />
      <Poster p={[-1.6, 2.1, -2.52]} text="FUTEBOL" bg="#2f6a35" /><Wardrobe p={[-4.5, 0, -1.6]} c="#8a6038" /><Rug p={[0.2, 0.01, 0.5]} c="#a8925a" r={1.0} />
    </Room>) },
  maeSala: { bg: "#f2e2c8", scene: () => (
    <Room wall="#f0dcc0" wall2="#e6cfae" floor={tx(planks("#b07a4a"), 4, 3)}>
      <Window p={[-2.2, 1.85, -2.5]} curtain="#c2577a" /><Sofa p={[1.6, 0, -1.8]} c="#a8574a" /><Lamp p={[3.6, 0, -2.0]} on={false} />
      <group position={[1.6, 0, -2.5]}>{[[-0.7, 2.2, "#3f86cf"], [0, 2.35, "#e07b39"], [0.7, 2.2, "#3e9b4a"]].map(([x, y, c], i) => <Frame key={i} p={[x as number, y as number, 0]} w={0.45} h={0.55} c="#6b4426" inner={c as string} />)}</group>
      <group position={[-3.7, 0, -2.1]}><Box s={[1.3, 0.55, 0.45]} p={[0, 0.28, 0]} c="#8a5a33" /><FlatTV p={[0, 0.95, 0]} s={0.75} on={0} /></group>
      <Plant p={[-0.6, 0, -2.0]} s={1.0} /><Rug p={[0.8, 0.01, 0.5]} c="#c98a4b" /><Clock p={[-0.6, 2.6, -2.52]} />
    </Room>) },
  maeSalaNoite: { night: true, bg: "#2a3352", scene: () => (
    <Room wall="#6a5f7a" wall2="#5c526c" floor={tx(planks("#6a4a36"), 4, 3)} ceil="#3a3450">
      <Window p={[-2.2, 1.85, -2.5]} night curtain="#8a3a52" /><Sofa p={[1.6, 0, -1.8]} c="#7a3e36" /><Lamp p={[3.6, 0, -2.0]} on />
      <group position={[1.6, 0, -2.5]}>{[[-0.7, 2.2], [0, 2.35], [0.7, 2.2]].map(([x, y], i) => <Frame key={i} p={[x, y, 0]} w={0.45} h={0.55} c="#4a2e1a" inner="#5a6488" />)}</group>
      <Rug p={[0.8, 0.01, 0.5]} c="#7a5a3a" />
    </Room>) },
  maeCozinha: { bg: "#f6e7c8", scene: () => (
    <Room wall="#f6e7c8" wall2="#ead8b4" wallTex={tx(tiles("#f8ecd2", "#e8d5b0"), 12, 3)} floor={tx(tiles("#d9c09a", "#bfa47c"), 8, 5)}>
      <Window p={[-0.4, 1.95, -2.5]} w={1.4} h={1.0} curtain="#e04b3c" />
      <Counter p={[0.5, 0, -2.2]} w={5} c="#e9dcc6" top="#8a5a33" /><Box s={[2.0, 0.8, 0.4]} p={[2.1, 2.55, -2.35]} c="#c98a4b" /><Box s={[1.2, 0.8, 0.4]} p={[-2.2, 2.55, -2.35]} c="#c98a4b" />
      <Box s={[0.8, 1.9, 0.7]} p={[-3.8, 0.95, -2.15]} c="#e6eef4" /><Box s={[0.02, 1.0, 0.02]} p={[-3.5, 1.3, -1.79]} c="#888" />
      <mesh position={[1.6, 1.16, -2.2]}><cylinderGeometry args={[0.22, 0.2, 0.18, 20]} /><M c="#c0c6cc" /></mesh>
      <group position={[3.2, 0, -0.6]}><Box s={[1.6, 0.07, 0.9]} p={[0, 0.78, 0]} c="#d9a46a" />{[[-0.7, -0.38], [0.7, -0.38], [-0.7, 0.38], [0.7, 0.38]].map(([x, z], i) => <Box key={i} s={[0.06, 0.78, 0.06]} p={[x, 0.39, z]} c="#8a5a33" />)}</group>
      <Clock p={[2.8, 2.65, -2.52]} />
    </Room>) },
  escola: { bg: "#e4e0c4", scene: () => (
    <Room wall="#e4e0c4" wall2="#d6d1b2" floor={tx(planks("#c99662"), 4, 3)}>
      <group position={[0, 0, -2.5]}><Box s={[4.2, 1.6, 0.06]} p={[0, 1.75, 0]} c="#2f5a46" /><Box s={[4.4, 0.08, 0.15]} p={[0, 0.95, 0.06]} c="#b9874f" /><Sign text="2 + 2 = 4" p={[-0.8, 2.0, 0.05]} w={1.6} h={0.5} bg="#2f5a46" fg="#ffffff" /></group>
      <Window p={[-4.3, 1.9, -2.5]} w={1.4} /><Window p={[4.3, 1.9, -2.5]} w={1.4} /><Clock p={[2.6, 2.75, -2.52]} />
      {[-2.6, 0, 2.6].map((x) => (x === 0 ? [-1.0] : [-1.0, 0.6]).map((z) => <group key={`${x}${z}`}><group position={[x, 0, z]}><Box s={[1.0, 0.06, 0.6]} p={[0, 0.72, 0]} c="#d9a46a" />{[[-0.42, -0.24], [0.42, -0.24], [-0.42, 0.24], [0.42, 0.24]].map(([a, b], i) => <Box key={i} s={[0.05, 0.72, 0.05]} p={[a, 0.36, b]} c="#5a6070" />)}</group><Chair p={[x, 0, z + 0.55]} c="#3878be" ry={Math.PI} /></group>))}
    </Room>) },
  rua: { bg: "#a9dcff", scene: () => <Rua /> },
  ruaTarde: { bg: "#f6b585", scene: () => <Rua tarde /> },
};

const Rua: React.FC<{ tarde?: boolean }> = ({ tarde }) => (
  <group>
    <mesh position={[0, 6, -14]}><planeGeometry args={[80, 20]} /><meshBasicMaterial color={tarde ? "#f3a874" : "#a9dcff"} /></mesh>
    {tarde && <mesh position={[6, 2.8, -13.9]}><circleGeometry args={[1.2, 32]} /><meshBasicMaterial color="#ffe0a0" /></mesh>}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow><planeGeometry args={[60, 30]} /><M c="#8a8f99" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.2]} receiveShadow><planeGeometry args={[60, 3.4]} /><M c="#c9c2b4" map={tx(tiles("#cfc8ba", "#b3ab9c"), 24, 2)} /></mesh>
    {/* escola */}
    <group position={[0, 0, -4.5]}>
      <Box s={[9, 4.2, 1]} p={[0, 2.1, -0.5]} c={tarde ? "#e8a070" : "#f0b27a"} /><Box s={[9.4, 0.3, 1.3]} p={[0, 4.3, -0.4]} c="#b5523b" />
      {[-3.3, -1.7, 1.7, 3.3].map((x, i) => [1.4, 3.0].map((y) => <Box key={`${i}${y}`} s={[1.0, 0.9, 0.06]} p={[x, y, 0.02]} c="#bfe3f5" />))}
      <Box s={[1.6, 2.2, 0.06]} p={[0, 1.1, 0.02]} c="#6b4426" /><Sign text="ESCOLA" p={[0, 2.9, 0.08]} w={2.4} h={0.6} bg="#2c6fb6" fg="#ffffff" />
    </group>
    {/* grade */}
    {Array.from({ length: 23 }).map((_, i) => <Box key={i} s={[0.06, 1.6, 0.06]} p={[-6.6 + i * 0.6, 0.8, -1.4]} c="#3a3f4b" />)}
    <Box s={[14, 0.08, 0.08]} p={[0, 1.55, -1.4]} c="#3a3f4b" /><Box s={[14, 0.08, 0.08]} p={[0, 0.3, -1.4]} c="#3a3f4b" />
    {[[-7.5, -3], [7.5, -3.5], [-9.5, -6]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Box s={[0.3, 2.2, 0.3]} p={[0, 1.1, 0]} c="#8a5a33" /><mesh position={[0, 2.8, 0]} castShadow><sphereGeometry args={[1.3, 18, 14]} /><M c={tarde ? "#6a8a3a" : "#5fae58"} /></mesh></group>)}
    {[-10, 10].map((x, i) => <Box key={i} s={[4, 7, 3]} p={[x, 3.5, -8]} c={["#c3a6ff", "#8fd0c9"][i]} />)}
  </group>
);

const CAM_DEF = { pos: [0, 1.55, 5.4] as V3, target: [0, 1.25, 0] as V3, fov: 38 };

/** Um fundo 3D parado (para virar imagem). */
export const Fundo: React.FC<{ set: FundoId }> = ({ set }) => {
  const S = SETS[set];
  const outdoor = set === "rua" || set === "ruaTarde";
  const L = S.night ? <Lights warm="#9fb4ff" sky="#3a4a8a" key={1.0} keyPos={[3, 6, 5]} /> : set === "ruaTarde" ? <Lights warm="#ffc27a" sky="#ffd9b0" key={2.3} keyPos={[6, 5, 5]} /> : <Lights warm="#fff1d6" sky="#e6f2ff" key={outdoor ? 2.4 : 2.0} keyPos={[-3, 6, 6]} />;
  return (
    <AbsoluteFill style={{ background: S.bg }}>
      <Stage flat background={S.bg} lights={L} cam={S.cam ?? CAM_DEF} fg={<Cel thickness={0.012}>{S.scene()}</Cel>} />
    </AbsoluteFill>
  );
};
export const FUNDO_IDS = Object.keys(SETS) as FundoId[];
