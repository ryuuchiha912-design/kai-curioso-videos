import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";

/** Objetos e luzes só do short 4 ("A voz do Leo"). Tudo desenhado em código. */
type V3 = [number, number, number];
const FONT = "'Lilita One', 'Nunito', sans-serif";

export const WARM = <Lights warm="#ffc58a" sky="#ffd9b8" key={2.3} keyPos={[-5, 4.5, 4]} />;
export const NIGHT = <Lights warm="#8fa8ff" sky="#2b3a7a" key={1.1} keyPos={[2, 5, 3]} />;
export const FLASH = <Lights warm="#e8f0ff" sky="#c8d8ff" key={4.5} keyPos={[-1, 5, -3]} />;

// --------------------------------------------------------------- posições do quarto
export const LEO: V3 = [-0.5, 0, 0.1];
export const TABLE: V3 = [0.45, 0, 0.25];
export const TOP_Y = 0.62;
export const ECO: V3 = [0.62, TOP_Y, 0.32];
export const LAPTOP: V3 = [0.3, TOP_Y, 0.12];

export const Table: React.FC = () => (
  <group position={TABLE}>
    <Box s={[1.0, 0.06, 0.62]} p={[0, TOP_Y - 0.03, 0]} c="#e7b27a" />
    {[[-0.44, -0.25], [0.44, -0.25], [-0.44, 0.25], [0.44, 0.25]].map(([x, z], i) => (
      <Box key={i} s={[0.06, TOP_Y - 0.06, 0.06]} p={[x, (TOP_Y - 0.06) / 2, z]} c="#c98a4b" />
    ))}
  </group>
);

// --------------------------------------------------------------- telas do notebook
export type ScreenMode = "wave" | "prices" | "studio";
const screenTex = (mode: ScreenMode, q: number) =>
  canvasTexture(`reel-screen-${mode}-${mode === "wave" ? q : 0}-${fontReady()}`, 512, 320, (ctx, w, h) => {
    if (mode === "wave") {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2a1f4d"); g.addColorStop(1, "#151030");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 32; i++) {
        const a = 0.15 + 0.85 * Math.abs(Math.sin(i * 0.7 + q * 0.9) * Math.cos(i * 0.23 - q * 0.4));
        const bh = a * h * 0.6;
        ctx.fillStyle = i % 2 ? "#4ff0d2" : "#ffd23f";
        ctx.fillRect(20 + i * 15, h / 2 - bh / 2, 10, bh);
      }
    } else if (mode === "prices") {
      ctx.fillStyle = "#fff8ec"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2a1a10"; ctx.textAlign = "center";
      ctx.font = `52px ${FONT}`; ctx.fillText("VOZ PREMIUM", w / 2, 80);
      ctx.fillStyle = "#e8432f"; ctx.font = `110px ${FONT}`; ctx.fillText("R$ $$$", w / 2, 200);
      ctx.fillStyle = "#7a6a5a"; ctx.font = `46px ${FONT}`; ctx.fillText("por mês", w / 2, 270);
    } else {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#3b2a7a"); g.addColorStop(1, "#7a3b8f");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
      ctx.font = `66px ${FONT}`; ctx.fillText("Voice Studio", w / 2, 95);
      ctx.fillStyle = "#4ff0d2"; ctx.font = `38px ${FONT}`; ctx.fillText("código aberto · roda no seu PC", w / 2, 150);
      // botão de baixar
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath(); ctx.roundRect(w / 2 - 120, 185, 240, 100, 28); ctx.fill();
      ctx.fillStyle = "#2a1a10";
      ctx.beginPath(); ctx.moveTo(w / 2 - 30, 205); ctx.lineTo(w / 2 + 30, 205); ctx.lineTo(w / 2 + 30, 235); ctx.lineTo(w / 2 + 55, 235);
      ctx.lineTo(w / 2, 272); ctx.lineTo(w / 2 - 55, 235); ctx.lineTo(w / 2 - 30, 235); ctx.closePath(); ctx.fill();
    }
  });

export const Laptop: React.FC<{ p?: V3; rot?: V3; s?: number; mode: ScreenMode; f: number }> = ({ p = LAPTOP, rot = [0, -0.25, 0], s = 1, mode, f }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[0.5, 0.025, 0.34]} p={[0, 0.0125, 0]} c="#c9ccd6" r={0.3} />
    <Box s={[0.44, 0.005, 0.2]} p={[0, 0.027, 0.03]} c="#3a3d48" />
    <group position={[0, 0.025, -0.165]} rotation={[-0.22, 0, 0]}>
      <Box s={[0.5, 0.33, 0.02]} p={[0, 0.165, 0]} c="#c9ccd6" r={0.3} />
      <mesh position={[0, 0.165, 0.011]}>
        <planeGeometry args={[0.46, 0.29]} />
        <meshBasicMaterial map={screenTex(mode, Math.floor(f / 3))} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

// --------------------------------------------------------------- microfone de brinquedo
export const Mic: React.FC = () => (
  <group rotation={[0.4, 0, 0]}>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.02, 0.016, 0.14, 14]} />
      <meshStandardMaterial color="#e94b3c" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.16, 0]}>
      <sphereGeometry args={[0.045, 18, 14]} />
      <meshStandardMaterial color="#9aa0ad" roughness={0.3} metalness={0.6} />
    </mesh>
  </group>
);

// --------------------------------------------------------------- moedona "R$ 0"
const zeroTex = () =>
  canvasTexture(`reel-coin-zero-${fontReady()}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#ffc93c"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e8a900"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 20, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#8a5a00"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `92px ${FONT}`; ctx.fillText("R$0", w / 2, h / 2 + 6);
  });
export const BigCoin: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.06, 40]} />
      <meshStandardMaterial color="#ffc93c" roughness={0.25} metalness={0.6} />
    </mesh>
    {[1, -1].map((z) => (
      <mesh key={z} position={[0, 0, z * 0.031]} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
        <circleGeometry args={[0.3, 40]} />
        <meshStandardMaterial map={zeroTex()} roughness={0.3} metalness={0.4} />
      </mesh>
    ))}
  </group>
);

// --------------------------------------------------------------- caixa de presente (o "download")
export const GiftBox: React.FC<{ p?: V3; s?: number; lid?: number; shake?: number }> = ({ p = [0, 0, 0], s = 1, lid = 0, shake = 0 }) => (
  <group position={p} scale={s} rotation={[0, 0, shake]}>
    <Box s={[0.3, 0.26, 0.3]} p={[0, 0.13, 0]} c="#7a5cff" />
    <Box s={[0.06, 0.262, 0.302]} p={[0, 0.13, 0]} c="#ffd23f" shadow={false} />
    <group position={[0, 0.27 + lid * 0.5, 0]} rotation={[lid * 1.6, 0, lid * 0.6]}>
      <Box s={[0.33, 0.06, 0.33]} c="#8f75ff" />
      <Box s={[0.07, 0.065, 0.335]} c="#ffd23f" shadow={false} />
      <mesh position={[0, 0.06, 0]} scale={[1.4, 0.7, 0.7]}>
        <torusGeometry args={[0.04, 0.015, 8, 20]} />
        <meshStandardMaterial color="#ffd23f" />
      </mesh>
    </group>
  </group>
);

/** Setona "baixar". */
export const Arrow: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <group position={p} scale={s}>
    <Box s={[0.1, 0.18, 0.06]} p={[0, 0.1, 0]} c="#4ff0d2" />
    <mesh position={[0, -0.04, 0]} rotation={[0, 0, Math.PI]}>
      <coneGeometry args={[0.13, 0.14, 4]} />
      <meshStandardMaterial color="#4ff0d2" />
    </mesh>
  </group>
);

/** Botão de girar (ajuste da voz). */
export const Knob: React.FC<{ p?: V3; s?: number; turn?: number; c?: string }> = ({ p = [0, 0, 0], s = 1, turn = 0, c = "#ffd23f" }) => (
  <group position={p} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.13, 0.06, 32]} />
      <meshStandardMaterial color="#2c2340" roughness={0.5} />
    </mesh>
    <group rotation={[0, 0, -turn]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 32]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      <Box s={[0.02, 0.07, 0.02]} p={[0, 0.05, 0.065]} c="#2a1a10" shadow={false} />
    </group>
  </group>
);

// --------------------------------------------------------------- telas flutuantes dos "canais" (ícones genéricos, sem logos)
export type Icon = "play" | "note" | "camera";
const iconTex = (icon: Icon) =>
  canvasTexture(`reel-icon-${icon}`, 256, 320, (ctx, w, h) => {
    const bg = icon === "play" ? "#ff5a5f" : icon === "note" ? "#2b2b3a" : "#ff8a3d";
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 16; ctx.lineCap = "round";
    const cx = w / 2, cy = h / 2 - 20;
    if (icon === "play") {
      ctx.beginPath(); ctx.moveTo(cx - 40, cy - 55); ctx.lineTo(cx + 60, cy); ctx.lineTo(cx - 40, cy + 55); ctx.closePath(); ctx.fill();
    } else if (icon === "note") {
      ctx.fillStyle = "#4ff0d2"; ctx.strokeStyle = "#4ff0d2";
      ctx.beginPath(); ctx.ellipse(cx - 30, cy + 45, 30, 22, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy + 40); ctx.lineTo(cx, cy - 60); ctx.quadraticCurveTo(cx + 40, cy - 40, cx + 50, cy - 10); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.roundRect(cx - 70, cy - 55, 140, 110, 30); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 45, cy - 32, 7, 0, Math.PI * 2); ctx.fill();
    }
    // "barra de histórias" embaixo
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 3; i++) ctx.fillRect(30, h - 90 + i * 22, (w - 60) * (0.5 + rand(i + icon.length) * 0.5), 10);
  });
export const Panel: React.FC<{ p?: V3; rot?: V3; s?: number; icon: Icon }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, icon }) => (
  <group position={p} rotation={rot} scale={Math.max(s, 0.0001)}>
    <Box s={[0.5, 0.62, 0.04]} c="#ffffff" />
    <mesh position={[0, 0, 0.021]}>
      <planeGeometry args={[0.44, 0.56]} />
      <meshBasicMaterial map={iconTex(icon)} toneMapped={false} />
    </mesh>
  </group>
);

/** Relâmpago na janela (plano de "noite escura"). */
export const Bolt: React.FC<{ p?: V3; s?: number; on?: number }> = ({ p = [0, 0, 0], s = 1, on = 0 }) =>
  on > 0.02 ? (
    <mesh position={p} scale={s}>
      <shapeGeometry args={[boltShape]} />
      <meshBasicMaterial color="#fff6b0" transparent opacity={on} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  ) : null;
const boltShape = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0.5); sh.lineTo(-0.15, 0.05); sh.lineTo(0.02, 0.05); sh.lineTo(-0.1, -0.5); sh.lineTo(0.18, 0.12); sh.lineTo(0.01, 0.12); sh.lineTo(0.12, 0.5);
  sh.closePath();
  return sh;
})();
