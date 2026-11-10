import React from "react";
import * as THREE from "three";
import { Box, Sign } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT } from "../kit/textures";
import { clamp01, rand } from "../kit/anim";

type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, r = 0.6, m = 0, e, ei = 0, map }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
);

// ------------------------------------------------------------------ luz (regra: dia normal, dourado no drama)
export const LAB_BG = "#cfe0c8";
export const LIGHT_DAY = <Lights warm="#fff1d6" sky="#e6f2ff" key={2.3} keyPos={[-3, 6, 5]} />;
export const LIGHT_GOLD = <Lights warm="#ffc27a" sky="#ffd9b0" key={2.6} keyPos={[4, 4, 4]} />;

// ------------------------------------------------------------------ texturas pintadas (chapadas, com emendas escuras)
const tiles = () =>
  canvasTexture("lab-tiles", 256, 256, (ctx, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#e9e2cf" : "#3f5a6b"; ctx.fillRect(i * s, j * s, s, s);
    }
    ctx.strokeStyle = "rgba(20,15,10,.35)"; ctx.lineWidth = 3;
    for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke(); }
  });
const planks = () =>
  canvasTexture("lab-planks", 256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#a8683a"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? "#b8774a" : "#9c5f34"; ctx.fillRect(0, (i * h) / 4, w, h / 4 - 3);
      ctx.fillStyle = "rgba(60,30,10,.5)"; ctx.fillRect(0, ((i + 1) * h) / 4 - 3, w, 3);
      for (let k = 0; k < 5; k++) { ctx.fillStyle = "rgba(70,35,12,.25)"; ctx.fillRect(rand(i * 9 + k) * w, (i * h) / 4 + 6 + rand(k + i) * 18, 30 + rand(k) * 50, 2); }
    }
  });
const wall = () =>
  canvasTexture("lab-wall", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#9cc0a4"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(40,70,50,${rand(i) * 0.06})`; ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 6, 6); }
  });
const rep = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

/** Mostrador redondo (medidor) com ponteiro. */
export const Gauge: React.FC<{ p: V3; s?: number; v?: number; rot?: V3 }> = ({ p, s = 1, v = 0.3, rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.05, 28]} /><M c="#2c2f36" /></mesh>
    <mesh position={[0, 0, 0.026]}><circleGeometry args={[0.11, 28]} /><M c="#fff6dc" /></mesh>
    <group position={[0, 0, 0.03]} rotation={[0, 0, 1.2 - v * 2.4]}><Box s={[0.012, 0.1, 0.01]} p={[0, 0.045, 0]} c="#c0392b" shadow={false} /></group>
  </group>
);

/** Laboratório de 1945: fundo (paredes, janela, prateleiras, quadro). */
export const LabBack: React.FC<{ year?: number }> = ({ year = 1 }) => (
  <group>
    <mesh position={[0, 2.2, -3]} receiveShadow><planeGeometry args={[14, 4.4]} /><M c="#ffffff" map={rep(wall(), 4, 2)} /></mesh>
    <Box s={[14, 1.0, 0.1]} p={[0, 0.5, -2.95]} c="#4f6f5c" />
    <Box s={[14, 0.08, 0.14]} p={[0, 1.02, -2.93]} c="#2f4537" />
    {/* janela com luz */}
    <group position={[-3.2, 2.4, -2.94]}>
      <Box s={[1.8, 1.5, 0.06]} c="#5a3a22" />
      <Box s={[1.6, 1.3, 0.04]} p={[0, 0, 0.02]} c="#fff4c8" e="#ffe9a8" ei={0.6} />
      <Box s={[0.05, 1.3, 0.06]} p={[0, 0, 0.04]} c="#5a3a22" />
      <Box s={[1.6, 0.05, 0.06]} p={[0, 0, 0.04]} c="#5a3a22" />
    </group>
    {/* prateleira com frascos */}
    <Box s={[2.6, 0.06, 0.35]} p={[1.6, 2.5, -2.8]} c="#6b4426" />
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[0.6 + i * 0.4, 2.68, -2.78]}><cylinderGeometry args={[0.07, 0.09, 0.3, 14]} /><M c={["#79c8d8", "#e8b14a", "#d86a6a", "#9ad88a"][i % 4]} r={0.3} /></mesh>
    ))}
    {/* painel de medidores */}
    <Box s={[1.6, 0.9, 0.12]} p={[3.6, 2.0, -2.88]} c="#3a4048" />
    {[0, 1, 2].map((i) => <Gauge key={i} p={[3.1 + i * 0.5, 2.15, -2.8]} s={1.1} v={0.2 + i * 0.3} />)}
    {/* calendário 1945 */}
    <group position={[1.2, 1.75, -2.9]} scale={Math.max(0.001, year)}>
      <Sign text="1945" w={0.8} h={0.55} bg="#fff6dc" fg="#c0392b" border="#2b1a12" />
    </group>
  </group>
);

/** Chão de ladrilhos + bancada de madeira. */
export const LabFront: React.FC<{ bench?: boolean }> = ({ bench = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 10]} /><M c="#ffffff" map={rep(tiles(), 7, 5)} r={0.8} /></mesh>
    {bench && (
      <group position={[0.3, 0, -1.2]}>
        <mesh position={[0, 0.92, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.08, 0.9]} /><M c="#ffffff" map={planks()} /></mesh>
        {[-1.2, 1.2].map((x) => [-0.38, 0.38].map((z) => <Box key={`${x}${z}`} s={[0.08, 0.9, 0.08]} p={[x, 0.45, z]} c="#7a4a2a" />))}
        <Box s={[2.5, 0.06, 0.8]} p={[0, 0.3, 0]} c="#8a5a3a" />
        {/* cabos */}
        <mesh position={[0.9, 0.97, -0.25]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.02, 8, 24]} /><M c="#1f1f24" /></mesh>
        <Gauge p={[1.0, 1.08, 0.1]} rot={[-0.3, -0.3, 0]} v={0.6} />
      </group>
    )}
  </group>
);

/** Magnetron: corpo de cobre com aletas e corneta; brilha quando ligado. */
export const Magnetron: React.FC<{ p?: V3; s?: number; on?: number; frame?: number; rotY?: number }> = ({ p = [0, 0, 0], s = 1, on = 0, frame = 0, rotY = 0 }) => {
  const glow = on * (0.7 + 0.3 * Math.sin(frame * 0.6));
  return (
    <group position={p} scale={s} rotation={[0, rotY, 0]}>
      <Box s={[0.42, 0.06, 0.42]} p={[0, 0.03, 0]} c="#3a4048" />
      <Box s={[0.34, 0.3, 0.3]} p={[0, 0.21, 0]} c="#4a525c" r={0.4} />
      <mesh position={[0, 0.24, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.04, 24]} /><M c="#c8733a" r={0.35} m={0.5} /></mesh>
      {[-1, 1].map((sd) => <Box key={sd} s={[0.05, 0.22, 0.22]} p={[sd * 0.2, 0.21, 0]} c="#b8622e" r={0.35} />)}
      {[0, 1, 2].map((i) => <Box key={`v${i}`} s={[0.3, 0.012, 0.012]} p={[0, 0.1 + i * 0.07, 0.155]} c="#2c3138" shadow={false} />)}
      <mesh position={[0, 0.4, 0]}><sphereGeometry args={[0.07, 14, 10]} /><M c="#fff2b0" e="#ffcf5a" ei={0.3 + glow * 2.5} /></mesh>
      {/* corneta de saída virada para a frente (+z) */}
      <mesh position={[0, 0.24, 0.29]} rotation={[Math.PI / 2, Math.PI / 4, 0]} castShadow><cylinderGeometry args={[0.13, 0.05, 0.22, 4, 1, true]} /><meshStandardMaterial color="#9aa3ad" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} /></mesh>
      {/* ondas invisíveis viram anéis de desenho quando liga */}
      {on > 0.05 && [0, 1, 2].map((k) => {
        const t = ((frame * 0.05 + k / 3) % 1);
        return (
          <mesh key={k} position={[0, 0.25, 0.4 + t * 0.6]} scale={0.6 + t * 1.2}>
            <torusGeometry args={[0.12, 0.008, 6, 24]} />
            <meshBasicMaterial color="#ffd54a" transparent opacity={(1 - t) * on} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Barra de doce (genérica, sem marca). melt 0..1 derrete e escorre. */
export const CandyBar: React.FC<{ p?: V3; rot?: V3; s?: number; melt?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, melt = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh scale={[1, 1 - melt * 0.55, 1 + melt * 0.2]} castShadow><boxGeometry args={[0.1, 0.2, 0.035]} /><M c="#5a3018" r={0.35} /></mesh>
    <mesh position={[0, 0.06 * (1 - melt), 0]} scale={[1.05, 0.4, 1.1]}><boxGeometry args={[0.1, 0.2, 0.035]} /><M c="#e2483a" r={0.5} /></mesh>
    {melt > 0.05 && [-0.03, 0.01, 0.035].map((x, i) => (
      <mesh key={i} position={[x, -0.1 - melt * (0.05 + i * 0.03), 0.01]} scale={[1, 1 + melt * (1.5 + i), 1]}>
        <sphereGeometry args={[0.014, 10, 8]} /><M c="#4a2612" r={0.3} />
      </mesh>
    ))}
  </group>
);

/** Mancha de chocolate na calça (fica na frente do bolso). */
export const ChocoStain: React.FC<{ p: V3; k: number }> = ({ p, k }) =>
  k <= 0.01 ? null : (
    <group position={p}>
      <mesh scale={[k, k * 1.3, 0.25]}><sphereGeometry args={[0.07, 16, 12]} /><M c="#4a2612" r={0.3} /></mesh>
      {[0, 1].map((i) => <mesh key={i} position={[-0.02 + i * 0.04, -0.07 * k - i * 0.03 * k, 0]} scale={[0.6, 1.6 * k, 0.25]}><sphereGeometry args={[0.03, 10, 8]} /><M c="#4a2612" r={0.3} /></mesh>)}
    </group>
  );

/** Tigela com milho; `pop` (quadros desde o estouro) solta pipocas voando. */
export const PopcornBowl: React.FC<{ p?: V3; s?: number; since?: number }> = ({ p = [0, 0, 0], s = 1, since = -1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.08, 0]} castShadow><sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#d9473a" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.18, 24]} /><M c={since >= 0 ? "#fff6dc" : "#f2c23a"} /></mesh>
    {since >= 0 && Array.from({ length: 40 }).map((_, i) => {
      const t0 = (i % 20) * 0.9;
      const t = (since - t0) / 30;
      if (t < 0) return null;
      const a = rand(i) * Math.PI * 2, sp = 0.4 + rand(i + 3) * 0.7, up = 2.2 + rand(i + 5) * 1.6;
      const y = Math.max(-0.05, 0.1 + up * t - 4.9 * t * t);
      return (
        <group key={i} position={[Math.cos(a) * sp * t, y, Math.sin(a) * sp * t]} rotation={[t * 9 + i, t * 7, 0]} scale={Math.min(1, t * 8)}>
          {[0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 0.018, (k % 2) * 0.015, 0]}><sphereGeometry args={[0.022, 8, 6]} /><M c="#fffbea" r={0.8} /></mesh>)}
        </group>
      );
    })}
  </group>
);

/** Ovo inteiro, tremendo (`shake`), ou explodindo (`boom` quadros desde a explosão). */
export const Egg: React.FC<{ p?: V3; s?: number; shake?: number; boom?: number }> = ({ p = [0, 0, 0], s = 1, shake = 0, boom = -1 }) =>
  boom < 0 ? (
    <group position={p} scale={s} rotation={[0, 0, Math.sin(shake * 40) * 0.12 * shake]}>
      <mesh position={[0, 0.07, 0]} scale={[1, 1.3, 1]} castShadow><sphereGeometry args={[0.055, 20, 16]} /><M c="#fff4e0" r={0.4} /></mesh>
    </group>
  ) : (
    <group position={p} scale={s}>
      {Array.from({ length: 26 }).map((_, i) => {
        const t = boom / 30;
        const a = rand(i) * Math.PI * 2, el = rand(i + 2) * 1.2;
        const sp = 1.2 + rand(i + 4) * 1.6;
        const d = sp * t;
        return (
          <mesh key={i} position={[Math.cos(a) * Math.cos(el) * d, 0.07 + Math.sin(el) * d - 2 * t * t, Math.sin(a) * Math.cos(el) * d * 0.6 + d * 0.5]} scale={Math.max(0.001, 1 - t * 0.8)}>
            <sphereGeometry args={[i % 3 ? 0.035 : 0.05, 10, 8]} /><M c={i % 3 ? "#ffd23f" : "#fff6e8"} r={0.3} />
          </mesh>
        );
      })}
    </group>
  );

/** Respingos de ovo grudados no rosto (vai dentro de um grupo na cabeça). */
export const EggFace: React.FC<{ k: number; y?: number }> = ({ k, y = 1.64 }) =>
  k <= 0.01 ? null : (
    <group position={[0, y, 0]}>
      {[[-0.12, 0.08, 0.06], [0.1, -0.05, 0.075], [0.02, 0.15, 0.045], [-0.05, -0.14, 0.05], [0.16, 0.12, 0.035]].map(([x, yy, r], i) => {
        const z = Math.sqrt(Math.max(0, 0.37 * 0.37 - x * x - yy * yy));
        return (
          <mesh key={i} position={[x, yy - (i % 2) * 0.02 * k, z]} scale={[k, k * (1 + (i % 2) * 0.4), 0.35 * k]}>
            <sphereGeometry args={[r, 14, 10]} /><M c={i === 1 ? "#ffcf2a" : "#fff7e6"} r={0.25} />
          </mesh>
        );
      })}
    </group>
  );

const doorTex = () =>
  canvasTexture("radar-door", 256, 384, (ctx, w, h) => {
    ctx.fillStyle = "#8fa3ae"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#24323a"; ctx.fillRect(30, 40, w - 60, 170);
    ctx.strokeStyle = "#1b120d"; ctx.lineWidth = 8; ctx.strokeRect(30, 40, w - 60, 170);
    ctx.fillStyle = "rgba(255,240,180,.35)"; ctx.fillRect(40, 50, 60, 150);
    ctx.fillStyle = "#c0392b"; ctx.font = `46px ${FONT}`; ctx.textAlign = "center"; ctx.fillText("FORNO", w / 2, 280);
    ctx.fillStyle = "#1b120d"; ctx.font = `30px ${FONT}`; ctx.fillText("DE RADAR", w / 2, 320);
  });
/** O primeiro forno de micro-ondas (genérico): armário alto do tamanho de uma geladeira. */
export const BigOven: React.FC<{ p?: V3; s?: number; rotY?: number; frame?: number; squash?: number }> = ({ p = [0, 0, 0], s = 1, rotY = 0, frame = 0, squash = 1 }) => (
  <group position={p} rotation={[0, rotY, 0]} scale={[s / Math.sqrt(squash), s * squash, s / Math.sqrt(squash)]}>
    <Box s={[0.95, 1.85, 0.8]} p={[0, 0.95, 0]} c="#7d929d" r={0.4} />
    <Box s={[1.0, 0.08, 0.85]} p={[0, 1.9, 0]} c="#5d6f78" />
    <mesh position={[0, 1.15, 0.405]}><planeGeometry args={[0.8, 1.2]} /><meshStandardMaterial map={doorTex()} roughness={0.5} /></mesh>
    <Box s={[0.06, 0.4, 0.06]} p={[0.38, 1.15, 0.45]} c="#d9dde2" />
    {[0, 1, 2].map((i) => <Gauge key={i} p={[-0.25 + i * 0.25, 0.4, 0.41]} s={0.75} v={0.3 + 0.2 * Math.sin(frame * 0.2 + i)} />)}
    <Box s={[0.9, 0.06, 0.06]} p={[0, 0.06, 0.38]} c="#3a4048" />
  </group>
);

const scaleTex = (kg: number) =>
  canvasTexture(`scale-${kg}`, 256, 96, (ctx, w, h) => {
    ctx.fillStyle = "#1d2a22"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#7dff8a"; ctx.font = `64px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${kg} kg`, w / 2, h / 2 + 4);
  });
/** Balança de chão com visor. */
export const FloorScale: React.FC<{ p?: V3; kg: number; s?: number }> = ({ p = [0, 0, 0], kg, s = 1 }) => (
  <group position={p} scale={s}>
    <Box s={[1.3, 0.12, 1.1]} p={[0, 0.06, 0]} c="#d4d8de" r={0.4} />
    <Box s={[0.12, 0.9, 0.12]} p={[0, 0.5, 0.62]} c="#9aa3ad" />
    <Box s={[0.95, 0.42, 0.12]} p={[0, 1.0, 0.65]} c="#3a4048" />
    <mesh position={[0, 1.0, 0.715]}><planeGeometry args={[0.86, 0.32]} /><meshBasicMaterial map={scaleTex(Math.round(kg))} toneMapped={false} /></mesh>
  </group>
);

/** Ondinhas de calor subindo (linhas onduladas). */
export const Heat: React.FC<{ p: V3; frame: number; k: number; s?: number }> = ({ p, frame, k, s = 1 }) =>
  k <= 0.01 ? null : (
    <group position={p} scale={s}>
      {[0, 1, 2].map((i) => {
        const t = ((frame * 0.04 + i / 3) % 1);
        return (
          <mesh key={i} position={[(i - 1) * 0.06, t * 0.35, 0.05]} rotation={[0, 0, Math.sin(frame * 0.3 + i) * 0.3]} scale={[1, 1, 1]}>
            <torusGeometry args={[0.03, 0.006, 6, 12, Math.PI]} />
            <meshBasicMaterial color="#ff8a3a" transparent opacity={clamp01(k) * (1 - t)} />
          </mesh>
        );
      })}
    </group>
  );
