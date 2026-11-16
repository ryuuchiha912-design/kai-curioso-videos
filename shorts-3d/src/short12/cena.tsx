import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { Toon, ToonFace, ToonLook, ToonStyle } from "../kit/Toon";
import { canvasTexture, FONT, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";

/** Cenários do short "This throw was so far they had to change the javelin" (Uwe Hohn, 1984).
 *  Escala: 1 unidade = 1 metro. O lançador fica em x=0 e lança para +x. A pista (vermelha) atravessa em x≈108–118. */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, r = 0.65, e, ei = 0, map }) => (
  <meshStandardMaterial color={c} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
);
export const LIGHT_STADIUM = <Lights warm="#fff1d6" sky="#cfe6ff" key={2.5} keyPos={[-30, 60, 40]} />;
export const LIGHT_ROOM = <Lights warm="#ffd9a0" sky="#e8d8c0" key={2.0} keyPos={[2, 5, 4]} />;

export const TRACK_X0 = 108;
/** Trajetória do dardo (0..1 → posição e ângulo). Pico ≈ 26 m. */
export const flight = (u: number, dist = 104.8, peak = 26): { p: V3; a: number } => {
  const x = dist * u, y = 1.9 * (1 - u) + 4 * peak * u * (1 - u);
  const dy = -1.9 + 4 * peak * (1 - 2 * u), dx = dist;
  return { p: [x, Math.max(0.05, y), 0], a: Math.atan2(dy, dx) };
};

/** Dardo: haste comprida, ponta de metal, empunhadura de cordão. Deitado ao longo de +x. */
export const Javelin: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string; old?: boolean; glow?: boolean }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#e8eef4", old = false, glow = false }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.028, 0.02, 2.4, 10]} /><M c={old ? "#e0b13a" : c} r={0.3} e={glow ? "#ffe9a0" : undefined} ei={glow ? 0.5 : 0} /></mesh>
    <mesh position={[1.28, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow><coneGeometry args={[0.03, 0.22, 10]} /><M c="#9aa3ad" r={0.25} /></mesh>
    <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.036, 0.036, 0.3, 10]} /><M c="#c62a2a" r={0.8} /></mesh>
  </group>
);

/** Rastro de vento atrás do dardo. */
export const Trail: React.FC<{ pts: V3[]; c?: string; op?: number }> = ({ pts, c = "#ffffff", op = 0.7 }) => (
  <group>
    {pts.slice(1).map((b, i) => {
      const a = pts[i]; const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
      const mid = va.clone().add(vb).multiplyScalar(0.5), len = va.distanceTo(vb);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      return <mesh key={i} position={mid} quaternion={q}><cylinderGeometry args={[0.05 + i * 0.004, 0.05 + i * 0.004, len, 6]} /><meshBasicMaterial color={c} transparent opacity={op * (i + 1) / pts.length} /></mesh>;
    })}
  </group>
);

const grassTex = () => canvasTexture("jav-grass", 256, 256, (ctx, w, h) => {
  ctx.fillStyle = "#4f9a46"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"; ctx.fillRect(i * 32, 0, 32, h); }
});
const signTex = (txt: string) => canvasTexture(`jav-sign-${txt}-${fontReady()}`, 256, 160, (ctx, w, h) => {
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#1b1b1f"; ctx.fillRect(0, 0, w, 14); ctx.fillRect(0, h - 14, w, 14);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `92px ${FONT}`; ctx.fillStyle = "#1b1b1f"; ctx.fillText(txt, w / 2, h / 2 + 4);
});
export const DistSign: React.FC<{ x: number; z?: number; txt?: string; hot?: boolean }> = ({ x, z = -16, txt, hot }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.9, 0]}><planeGeometry args={[2.4, 1.5]} /><meshStandardMaterial map={signTex(txt ?? String(x))} emissive={hot ? "#ff6a3a" : "#000"} emissiveIntensity={hot ? 0.35 : 0} /></mesh>
    <Box s={[0.12, 0.2, 0.12]} p={[0, 0.1, -0.05]} c="#1b1b1f" shadow={false} />
  </group>
);

/** Arquibancada com torcida (fileiras de bolinhas coloridas), ao longo de z, voltada para +x ou −x. */
export const Stands: React.FC<{ x: number; z0: number; z1: number; face?: 1 | -1; rows?: number; f?: number; mood?: "cheer" | "still" | "shock"; seed?: number }> = ({ x, z0, z1, face = 1, rows = 5, f = 0, mood = "cheer", seed = 0 }) => {
  const n = Math.floor((z1 - z0) / 1.6);
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: rows }, (_, r) => (
        <group key={r} position={[-face * r * 1.4, 1.0 + r * 1.1, 0]}>
          <Box s={[1.4, 0.3, z1 - z0]} p={[0, -0.45, (z0 + z1) / 2]} c={r % 2 ? "#8a93a3" : "#9aa3b3"} shadow={false} />
          {Array.from({ length: n }, (_, i) => {
            const k = seed + r * 97 + i; const z = z0 + i * 1.6 + rand(k) * 0.6;
            const col = ["#c62a2a", "#2c6fb6", "#e0b13a", "#3e9b4a", "#7a4cc8", "#f2f2f2", "#e07b2e"][Math.floor(rand(k + 5) * 7)];
            const hop = mood === "cheer" ? Math.abs(Math.sin(f * 0.35 + k)) * 0.25 : 0;
            const arms = mood === "cheer" && rand(k + 9) > 0.5;
            return (
              <group key={i} position={[0, hop, z]}>
                <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.36, 8, 6]} /><M c={col} /></mesh>
                <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.3, 10, 8]} /><M c={["#f1c7a0", "#e8b98f", "#c88f66", "#f5d2b0", "#8a5a3a"][Math.floor(rand(k + 2) * 5)]} /></mesh>
                {rand(k + 3) > 0.55 && <mesh position={[0, 0.94, 0]} scale={[1.1, 0.4, 1.1]}><sphereGeometry args={[0.3, 8, 6]} /><M c={["#2a211c", "#d9b45a", "#1b1716", "#8e8a86"][Math.floor(rand(k + 4) * 4)]} /></mesh>}
                {mood === "shock" && <mesh position={[face * 0.28, 0.66, 0]} scale={[0.3, 1, 1]}><sphereGeometry args={[0.1, 8, 6]} /><M c="#3a1410" /></mesh>}
                {arms && [-1, 1].map((s) => <mesh key={s} position={[0, 1.0, s * 0.32]} rotation={[s * 0.4, 0, 0]}><capsuleGeometry args={[0.07, 0.4, 4, 6]} /><M c={col} /></mesh>)}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
};

/** Estádio: gramado com setor do dardo, arcos de distância, pista vermelha atravessando no fim, arquibancadas. */
export const Stadium: React.FC<{ f?: number; mood?: "cheer" | "still" | "shock"; signs?: boolean; hundred?: boolean; crowd?: boolean }> = ({ f = 0, mood = "cheer", signs = true, hundred = false, crowd = true }) => {
  const gt = grassTex(); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(20, 8);
  const sector = 0.25; // ~14°
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[55, 0, 0]} receiveShadow><planeGeometry args={[220, 120]} /><M c="#ffffff" map={gt} /></mesh>
      {/* corredor de corrida do lançador */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.01, 0]}><planeGeometry args={[34, 4]} /><M c="#b5523b" /></mesh>
      {[-2, 2].map((z) => <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.02, z]}><planeGeometry args={[34, 0.08]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.02, 0]}><planeGeometry args={[0.15, 4]} /><meshBasicMaterial color="#ffffff" /></mesh>
      {/* linhas do setor */}
      {[-1, 1].map((k) => <mesh key={k} rotation={[-Math.PI / 2, 0, -k * sector]} position={[Math.cos(sector) * 55, 0.02, k * Math.sin(sector) * 55]}><planeGeometry args={[110, 0.12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      {/* arcos de distância a cada 10 m */}
      {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((d) => (
        <mesh key={d} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[d - 0.06, d + 0.06, 48, 1, -sector, sector * 2]} /><meshBasicMaterial color={hundred && d === 100 ? "#ffd23f" : "#ffffff"} side={THREE.DoubleSide} /></mesh>
      ))}
      {hundred && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[99.6, 100.4, 64, 1, -sector * 1.4, sector * 2.8]} /><meshBasicMaterial color="#ffd23f" side={THREE.DoubleSide} /></mesh>}
      {signs && [50, 60, 70, 80, 90, 100].map((d) => <DistSign key={d} x={d} z={-Math.tan(sector) * d - 4} hot={hundred && d === 100} />)}
      {/* pista vermelha no fim do campo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TRACK_X0 + 5, 0.015, 0]} receiveShadow><planeGeometry args={[10, 140]} /><M c="#c4513a" /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[TRACK_X0 + i * 1.22, 0.03, 0]}><planeGeometry args={[0.07, 140]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      {/* muro + arquibancadas */}
      <Box s={[0.6, 1.2, 140]} p={[TRACK_X0 + 11, 0.6, 0]} c="#2c6fb6" shadow={false} />
      {crowd && <Stands x={TRACK_X0 + 13} z0={-40} z1={40} face={-1} rows={6} f={f} mood={mood} seed={3} />}
      {crowd && <group rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -36]}><Stands x={0} z0={-20} z1={110} face={-1} rows={6} f={f} mood={mood} seed={41} /></group>}
      <Box s={[140, 1.2, 0.6]} p={[45, 0.6, -33]} c="#2c6fb6" shadow={false} />
      {/* placar e refletores */}
      <group position={[TRACK_X0 + 24, 16, 18]} rotation={[0, -Math.PI / 2 - 0.3, 0]}><Box s={[16, 8, 0.6]} p={[0, 0, 0]} c="#1b1b1f" shadow={false} /><Box s={[0.8, 12, 0.8]} p={[-5, -10, 0]} c="#3a3f4b" shadow={false} /><Box s={[0.8, 12, 0.8]} p={[5, -10, 0]} c="#3a3f4b" shadow={false} /></group>
      {[[-10, -40], [60, -44], [125, -30], [125, 30]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Box s={[0.8, 34, 0.8]} p={[0, 17, 0]} c="#9aa3ad" shadow={false} /><Box s={[5, 3, 0.8]} p={[0, 35, 0]} c="#e9eef2" e="#ffffff" ei={0.6} shadow={false} /></group>)}
    </group>
  );
};

/** Corredores na pista (figurantes diferentes). */
const RUNNERS: { look: Partial<ToonLook>; style: ToonStyle }[] = [
  { look: { skin: "#8a5a3a", hoodie: "#e0312a", hoodie2: "#b82520", pants: "#1b1b1f", hair: "#141418" }, style: { hair: "short" } },
  { look: { skin: "#f1c7a0", hoodie: "#2c6fb6", hoodie2: "#245c98", pants: "#1b1b1f", hair: "#d9b45a" }, style: { hair: "bun" } },
  { look: { skin: "#c88f66", hoodie: "#3e9b4a", hoodie2: "#33803d", pants: "#2e3440", hair: "#1b1716" }, style: { hair: "curly" } },
];
export const Runner: React.FC<{ p: V3; f: number; v?: number; face: ToonFace; speed?: number; ry?: number }> = ({ p, f, v = 0, face, speed = 0.45, ry = 0 }) => {
  const R = RUNNERS[v % RUNNERS.length], a = f * speed;
  return <Toon kind="extra" look={R.look} style={R.style} position={p} rotationY={ry} face={face}
    pose={{ lean: 0.2, legL: Math.sin(a) * 0.8, legR: -Math.sin(a) * 0.8, armL: [-Math.sin(a) * 0.9, 0, -0.15], armR: [Math.sin(a) * 0.9, 0, 0.15], bob: Math.abs(Math.sin(a)) * 0.08 }} />;
};
/** Juízes (de blazer), cada um de um jeito. */
export const JUDGES: { look: Partial<ToonLook>; style: ToonStyle }[] = [
  { look: { skin: "#f1c7a0", hoodie: "#c9a227", hoodie2: "#a8861e", pants: "#2e3440", hair: "#8e8a86" }, style: { hair: "bald", mustache: true, tie: "#1b1b1f" } },
  { look: { skin: "#c88f66", hoodie: "#c9a227", hoodie2: "#a8861e", pants: "#2e3440", hair: "#1b1716" }, style: { hair: "short", glasses: true, tie: "#1b1b1f" } },
];
/** Atletas modernos (lançadores de hoje). */
export const MODERNS: { look: Partial<ToonLook>; style: ToonStyle }[] = [
  { look: { skin: "#f1c7a0", hoodie: "#1b1b1f", hoodie2: "#111114", pants: "#1b1b1f", hair: "#d9b45a" }, style: { hair: "short" } },
  { look: { skin: "#8a5a3a", hoodie: "#2c6fb6", hoodie2: "#245c98", pants: "#1b1b1f", hair: "#141418" }, style: { hair: "short" } },
  { look: { skin: "#c88f66", hoodie: "#e07b2e", hoodie2: "#c0651e", pants: "#2e3440", hair: "#1b1716" }, style: { hair: "cap", cap: "#e0312a" } },
];

/** Placar de texto (canvas). */
const boardTex = (lines: [string, number, string][], key: string, bg = "#14202e") => canvasTexture(`jav-board-${key}-${fontReady()}`, 512, 320, (ctx, w, h) => {
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const tot = lines.reduce((s, l) => s + l[1] * 1.2, 0); let y = (h - tot) / 2 + lines[0][1] * 0.6;
  for (const [t, s, c] of lines) { ctx.fillStyle = c; ctx.font = `${s}px ${FONT}`; ctx.fillText(t, w / 2, y); y += s * 1.2; }
});
export const Board: React.FC<{ p: V3; ry?: number; s?: number; lines: [string, number, string][]; k: string; bg?: string; frame?: string }> = ({ p, ry = 0, s = 1, lines, k, bg, frame = "#3a3f4b" }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <Box s={[3.4, 2.2, 0.12]} p={[0, 0, -0.08]} c={frame} />
    <mesh><planeGeometry args={[3.2, 2.0]} /><meshStandardMaterial map={boardTex(lines, k, bg)} emissive="#ffffff" emissiveIntensity={0.08} /></mesh>
  </group>
);
/** Bloco de gelo transparente (recorde congelado). */
export const Ice: React.FC<{ p: V3; s: V3; k: number }> = ({ p, s, k }) => k <= 0 ? null : (
  <group position={p} scale={[1, k, 1]}>
    <mesh position={[0, s[1] / 2, 0]}><boxGeometry args={s} /><meshStandardMaterial color="#bfe8ff" transparent opacity={0.45} roughness={0.1} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} position={[-s[0] / 3 + i * s[0] / 3, s[1] * (0.3 + rand(i) * 0.5), s[2] / 2 + 0.01]} rotation={[0, 0, 0.6 + i]}><planeGeometry args={[0.05, s[1] * 0.4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8} /></mesh>)}
  </group>
);

/** Prancheta/planta técnica (fundo azul com grade). */
const blueprintTex = () => canvasTexture(`jav-blueprint-${fontReady()}`, 512, 512, (ctx, w, h) => {
  ctx.fillStyle = "#1d4f8a"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 2;
  for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i * 32, 0); ctx.lineTo(i * 32, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * 32); ctx.lineTo(w, i * 32); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = `34px ${FONT}`; ctx.textAlign = "left"; ctx.fillText("IAAF · 1986", 24, 48);
});
export const Blueprint: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => {
  const t = blueprintTex(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return (
    <group position={p} scale={s}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={t} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[30, 30]} /><M c="#6b4a2e" /></mesh>
    </group>
  );
};
/** Marcador do centro de gravidade (bolinha com cruz). */
export const CGMark: React.FC<{ p: V3; c?: string; s?: number }> = ({ p, c = "#ff3b30", s = 1 }) => (
  <group position={p} scale={s}>
    <mesh><sphereGeometry args={[0.09, 16, 12]} /><meshBasicMaterial color={c} /></mesh>
    <mesh rotation={[0, 0, 0]}><torusGeometry args={[0.16, 0.02, 8, 24]} /><meshBasicMaterial color={c} /></mesh>
  </group>
);
/** Curva de trajetória pontilhada. */
export const Arc: React.FC<{ dist: number; peak: number; c: string; upto?: number; z?: number; dive?: boolean }> = ({ dist, peak, c, upto = 1, z = 0, dive = false }) => {
  const n = 40, pts: V3[] = [];
  for (let i = 0; i <= n * upto; i++) { const u = i / n; const y = 4 * peak * u * (1 - u) * (dive ? 1 - 0.25 * u * u : 1); pts.push([dist * u, y + 0.05, z]); }
  return <group>{pts.map((p, i) => i % 2 ? null : <mesh key={i} position={p}><sphereGeometry args={[0.45, 8, 6]} /><meshBasicMaterial color={c} /></mesh>)}</group>;
};

/** Contorno de campo de futebol (para comparar com 100 m). */
export const SoccerOutline: React.FC<{ k: number }> = ({ k }) => k <= 0 ? null : (
  <group position={[52, 0.05, 0]}>
    {[[0, -34, 105, 0.4], [0, 34, 105, 0.4]].map(([x, z, w, h], i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}><planeGeometry args={[w * k, h]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.9} /></mesh>)}
    {[-52.5, 0, 52.5].map((x) => <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x * k, 0, 0]}><planeGeometry args={[0.4, 68]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.9} /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[9, 9.4, 40]} /><meshBasicMaterial color="#ffffff" /></mesh>
  </group>
);
