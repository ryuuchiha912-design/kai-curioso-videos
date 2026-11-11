import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";
import { FlatChar } from "../kit/Flat";

/** Cenários e objetos do short "Os pombos que quase pilotaram bombas" (canal do Nico). */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, r = 0.6, m = 0, e, ei = 0, map }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
);

export const LIGHT_LAB = <Lights warm="#fff1d6" sky="#e6f2ff" key={2.3} keyPos={[-3, 6, 5]} />;
export const LIGHT_SKY = <Lights warm="#fff1d6" sky="#cfe6ff" key={2.4} keyPos={[-4, 6, 5]} />;
export const LIGHT_WARM = <Lights warm="#ffc27a" sky="#ffd9b0" key={2.4} keyPos={[4, 4, 4]} />;
export const LIGHT_DARK = <Lights warm="#9fb8ff" sky="#3d4a6e" key={1.6} keyPos={[-2, 5, 3]} />;

const rep = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
const wallTex = () => canvasTexture("pombo-wall", 256, 256, (ctx, w, h) => {
  ctx.fillStyle = "#c9b98f"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 200; i++) { ctx.fillStyle = `rgba(80,60,30,${rand(i) * 0.07})`; ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 6, 6); }
});
const floorTex = () => canvasTexture("pombo-floor", 256, 256, (ctx, w, h) => {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = (i + j) % 2 ? "#8a6a48" : "#7a5c3e"; ctx.fillRect(i * 64, j * 64, 64, 64); }
});

/** Tela verde de radar com um navio e a mira; `hits` = bicadas (pontinhos). */
export const screenTex = (hits: number, cross = true) =>
  canvasTexture(`tela-${hits}-${cross}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#123a24"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(120,255,160,.25)"; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(w / 2, h / 2, i * 38, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = "#7dffa0";
    ctx.beginPath(); ctx.moveTo(70, 140); ctx.lineTo(186, 140); ctx.lineTo(170, 162); ctx.lineTo(86, 162); ctx.closePath(); ctx.fill();
    ctx.fillRect(110, 112, 34, 28); ctx.fillRect(146, 124, 16, 16); ctx.fillRect(122, 96, 8, 16);
    if (cross) { ctx.strokeStyle = "#ffef7a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w / 2, 40); ctx.lineTo(w / 2, h - 40); ctx.moveTo(40, h / 2); ctx.lineTo(w - 40, h / 2); ctx.stroke(); }
    for (let i = 0; i < hits; i++) { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(118 + rand(i) * 30, 120 + rand(i + 9) * 30, 5, 0, Math.PI * 2); ctx.fill(); }
  });

/** Pombo: corpo cinza, pescoço furta-cor, bico, olhos grandes. `peck` 0..1 abaixa a cabeça. */
export const Pigeon: React.FC<{ p?: V3; ry?: number; s?: number; peck?: number; frame?: number; goggles?: boolean; happy?: boolean; flap?: number }> = ({ p = [0, 0, 0], ry = 0, s = 1, peck = 0, frame = 0, goggles = false, happy = false, flap = 0 }) => {
  const bob = Math.sin(frame * 0.25) * 0.01;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.05, 0.06, 0.02]}>
          <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.012, 0.012, 0.08, 6]} /><M c="#e0705a" /></mesh>
          <mesh position={[0, -0.07, 0.025]} scale={[1, 0.3, 1.6]}><sphereGeometry args={[0.025, 8, 6]} /><M c="#e0705a" /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.16 + bob, 0]} scale={[0.85, 0.8, 1.15]} castShadow><sphereGeometry args={[0.13, 20, 16]} /><M c="#9aa3b4" /></mesh>
      <mesh position={[0, 0.17 + bob, -0.15]} rotation={[0.5, 0, 0]} scale={[0.7, 0.25, 1]}><coneGeometry args={[0.09, 0.16, 12]} /><M c="#4a5266" /></mesh>
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.1, 0.18 + bob, -0.01]} rotation={[0, 0, k * (0.15 + flap * 1.1)]}>
          <mesh scale={[0.25, 0.65, 1.1]}><sphereGeometry args={[0.11, 14, 10]} /><M c="#7c8598" /></mesh>
          <mesh position={[0, -0.02, -0.08]} scale={[0.26, 0.3, 0.5]}><sphereGeometry args={[0.1, 10, 8]} /><M c="#2f3542" /></mesh>
        </group>
      ))}
      <group position={[0, 0.25 + bob, 0.1]} rotation={[0.2 + peck * 0.9, 0, 0]}>
        <mesh position={[0, 0.02, 0]} scale={[0.75, 0.9, 0.8]}><sphereGeometry args={[0.07, 14, 12]} /><M c="#6e9a8a" /></mesh>
        <group position={[0, 0.1, 0.03]}>
          <mesh castShadow><sphereGeometry args={[0.075, 18, 14]} /><M c="#7c8598" /></mesh>
          <mesh position={[0, -0.005, 0.085]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.018, 0.06, 8]} /><M c="#2a2a30" /></mesh>
          <mesh position={[0, 0.01, 0.06]} scale={[1, 0.6, 0.6]}><sphereGeometry args={[0.022, 8, 6]} /><M c="#f4f1ea" /></mesh>
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.045, 0.02, 0.05]}>
              <mesh scale={[1, 1.15, 0.6]}><sphereGeometry args={[0.03, 12, 10]} /><M c="#ffffff" /></mesh>
              <mesh position={[k * 0.003, happy ? 0.004 : 0, 0.016]}><sphereGeometry args={[0.016, 10, 8]} /><M c="#e2672a" /></mesh>
              <mesh position={[k * 0.003, 0, 0.026]}><sphereGeometry args={[0.008, 8, 6]} /><M c="#111" /></mesh>
            </group>
          ))}
          {goggles && (
            <group position={[0, 0.03, 0.055]}>
              {[-1, 1].map((k) => <mesh key={k} position={[k * 0.045, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.032, 0.01, 6, 16]} /><M c="#6b4426" /></mesh>)}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.03]}><torusGeometry args={[0.08, 0.008, 6, 24]} /><M c="#4a3020" /></mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

/** Telinha com moldura e suporte. */
export const Screen: React.FC<{ p?: V3; ry?: number; s?: number; hits?: number }> = ({ p = [0, 0, 0], ry = 0, s = 1, hits = 0 }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <Box s={[0.5, 0.42, 0.08]} p={[0, 0, 0]} c="#3a3f4b" />
    <mesh position={[0, 0, 0.042]}><planeGeometry args={[0.42, 0.34]} /><meshStandardMaterial map={screenTex(hits)} emissive="#3cff7a" emissiveIntensity={0.25} emissiveMap={screenTex(hits)} /></mesh>
    <Box s={[0.06, 0.25, 0.06]} p={[0, -0.32, 0]} c="#3a3f4b" />
    <Box s={[0.3, 0.04, 0.2]} p={[0, -0.45, 0]} c="#3a3f4b" />
  </group>
);

/** Bomba com o nariz em corte, mostrando os pombos lá dentro. `tilt` gira as aletas. */
export const Bomb: React.FC<{ p?: V3; rot?: V3; s?: number; frame: number; tilt?: number; pigeons?: number; votes?: number[]; goggles?: boolean; happy?: boolean }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, frame, tilt = 0, pigeons = 1, votes, goggles = false, happy = false }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.6, 0, 0]} castShadow><cylinderGeometry args={[0.42, 0.42, 1.6, 32]} /><M c="#6f7a5a" r={0.5} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[-1.55, 0, 0]}><cylinderGeometry args={[0.42, 0.2, 0.3, 32]} /><M c="#6f7a5a" r={0.5} /></mesh>
    {[0, 1, 2, 3].map((i) => (
      <group key={i} position={[-1.65, 0, 0]} rotation={[i * Math.PI / 2 + tilt, 0, 0]}>
        <Box s={[0.4, 0.04, 0.42]} p={[0, 0, 0.32]} c="#5a6448" />
      </group>
    ))}
    {/* nariz aberto (metade de trás) com janela de vidro */}
    <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.42, 0, 0]}><cylinderGeometry args={[0.05, 0.42, 0.85, 32, 1, true, Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#59634a" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.41, 32]} /><M c="#2a2e26" /></mesh>
    <Box s={[0.18, 0.05, 0.75]} p={[0.32, -0.18, 0]} c="#8a6a48" />
    {Array.from({ length: pigeons }, (_, i) => {
      const z = pigeons === 1 ? 0 : (i - 1) * 0.22;
      const v = votes ? votes[i] : 0;
      return <FlatChar key={i} kind="pigeon" position={[0.32, -0.16, z]} h={0.5} flip={v < 0} shadow={false} pose={{ headTilt: Math.max(0, Math.sin(frame * 0.5 + i * 2)) * 0.5, armL: v !== 0 ? Math.abs(Math.sin(frame * 0.6)) : 0 }} face={{ expr: happy ? "happy" : "neutral" }} goggles={goggles} />;
    })}
  </group>
);

/** Navio alvo (silhueta simples). */
export const Ship: React.FC<{ p?: V3; ry?: number; s?: number; frame: number }> = ({ p = [0, 0, 0], ry = 0, s = 1, frame }) => (
  <group position={[p[0], p[1] + Math.sin(frame * 0.06) * 0.03, p[2]]} rotation={[0, ry, Math.sin(frame * 0.05) * 0.02]} scale={s}>
    <mesh scale={[1, 0.35, 0.3]}><boxGeometry args={[3, 1, 1]} /><M c="#6b7380" /></mesh>
    <Box s={[0.9, 0.5, 0.25]} p={[0.1, 0.4, 0]} c="#8a929e" />
    <Box s={[0.3, 0.3, 0.2]} p={[0.2, 0.8, 0]} c="#8a929e" />
    <mesh position={[-0.6, 0.6, 0]}><cylinderGeometry args={[0.1, 0.12, 0.6, 12]} /><M c="#4a505a" /></mesh>
  </group>
);

/** Mar chapado + alvo (anéis) em volta do navio. */
export const Sea: React.FC<{ frame: number; target?: number }> = ({ frame, target = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}><planeGeometry args={[60, 60]} /><M c="#2f7fb8" r={0.4} /></mesh>
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[((rand(i) * 30 + frame * 0.01) % 30) - 15, -0.1, -10 + rand(i + 3) * 14]}><planeGeometry args={[0.8, 0.05]} /><meshBasicMaterial color="#cfe9ff" /></mesh>)}
    {target > 0 && [1.2, 2.2, 3.2].map((r, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}><ringGeometry args={[r * target, r * target + 0.12, 48]} /><meshBasicMaterial color={i % 2 ? "#ffffff" : "#e04b3c"} /></mesh>)}
  </group>
);

/** Laboratório dos anos 40: parede, quadro-negro, bancada. */
export const Lab: React.FC = () => (
  <group>
    <mesh position={[0, 2.2, -2.6]}><planeGeometry args={[12, 4.4]} /><M c="#ffffff" map={rep(wallTex(), 3, 1)} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 8]} /><M c="#ffffff" map={rep(floorTex(), 6, 4)} r={0.8} /></mesh>
    <Box s={[12, 0.9, 0.1]} p={[0, 0.45, -2.55]} c="#6b5a3e" />
    <Box s={[2.4, 1.3, 0.06]} p={[-1.6, 2.1, -2.52]} c="#2f4537" />
    <Box s={[2.55, 1.45, 0.05]} p={[-1.6, 2.1, -2.55]} c="#8a6a48" />
    {/* desenhos de giz: pombo + seta + navio */}
    <mesh position={[-1.6, 2.1, -2.48]}><planeGeometry args={[2.3, 1.2]} /><meshBasicMaterial transparent map={chalkTex()} /></mesh>
    {/* janela com luz entrando */}
    <group position={[2.3, 2.2, -2.5]}>
      <Box s={[1.5, 1.3, 0.06]} c="#6b4426" />
      <mesh position={[0, 0, 0.04]}><planeGeometry args={[1.36, 1.16]} /><meshBasicMaterial color="#fff3c4" /></mesh>
      <Box s={[0.06, 1.16, 0.08]} p={[0, 0, 0.05]} c="#6b4426" /><Box s={[1.36, 0.06, 0.08]} p={[0, 0, 0.05]} c="#6b4426" />
    </group>
    <mesh position={[1.6, 1.2, -0.9]} rotation={[-0.55, -0.35, 0]}><planeGeometry args={[1.4, 3.2]} /><meshBasicMaterial color="#fff6d0" transparent opacity={0.08} depthWrite={false} /></mesh>
    {/* prateleira com frascos e livros */}
    <group position={[-2.6, 0, -2.3]}>
      {[0.9, 1.6, 2.3].map((y, i) => <Box key={i} s={[1.4, 0.06, 0.4]} p={[0, y, 0]} c="#7a4a2a" />)}
      <Box s={[0.06, 2.5, 0.4]} p={[-0.7, 1.25, 0]} c="#6b4426" /><Box s={[0.06, 2.5, 0.4]} p={[0.7, 1.25, 0]} c="#6b4426" />
      {Array.from({ length: 12 }, (_, i) => {
        const row = Math.floor(i / 4), x = -0.5 + (i % 4) * 0.33, y = 0.93 + row * 0.7;
        return i % 3 === 0
          ? <Box key={i} s={[0.09, 0.32, 0.26]} p={[x, y + 0.16, 0]} c={["#c0392b", "#2c6fb6", "#3e9b4a", "#e0b13a"][i % 4]} />
          : <mesh key={i} position={[x, y + 0.13, 0]}><cylinderGeometry args={[0.07, 0.07, 0.26, 12]} /><M c={["#9fd8c8", "#f2c94c", "#d7a6e8"][i % 3]} r={0.3} /></mesh>;
      })}
    </group>
    {/* gaiolas de pombo empilhadas */}
    {[[-0.2, 0, -2.15], [0.35, 0, -2.15], [0.07, 0.55, -2.15]].map(([x, y, z], i) => (
      <group key={i} position={[x, y, z]}>
        <Box s={[0.5, 0.04, 0.4]} p={[0, 0.02, 0]} c="#6b4426" /><Box s={[0.5, 0.04, 0.4]} p={[0, 0.52, 0]} c="#6b4426" />
        {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[0.015, 0.5, 0.015]} p={[-0.22 + k * 0.088, 0.27, 0.19]} c="#c9b98f" shadow={false} />)}
      </group>
    ))}
    {/* luminária pendurada */}
    <group position={[0.6, 3.3, -0.4]}>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.01, 0.01, 0.8, 6]} /><M c="#2a2a30" /></mesh>
      <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.32, 0.3, 24, 1, true]} /><meshStandardMaterial color="#3e6a4a" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -0.1, 0]}><sphereGeometry args={[0.09, 12, 10]} /><M c="#fff6d0" e="#ffe9a0" ei={1.5} /></mesh>
    </group>
    {/* caixotes */}
    <Box s={[0.6, 0.5, 0.6]} p={[2.6, 0.25, -1.6]} c="#a8783a" /><Box s={[0.45, 0.4, 0.45]} p={[2.5, 0.7, -1.6]} c="#b98848" />
    <Box s={[2.2, 0.08, 0.9]} p={[0.6, 0.95, -0.4]} c="#a8683a" />
    {[-1, 1].map((k) => [-1, 1].map((j) => <Box key={`${k}${j}`} s={[0.08, 0.95, 0.08]} p={[0.6 + k * 1.0, 0.47, -0.4 + j * 0.38]} c="#7a4a2a" />))}
  </group>
);
const chalkTex = () => canvasTexture(`giz-${fontReady()}`, 512, 256, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.ellipse(110, 140, 50, 34, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(160, 100, 22, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(220, 128); ctx.lineTo(320, 128); ctx.moveTo(300, 110); ctx.lineTo(320, 128); ctx.lineTo(300, 146); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(350, 150); ctx.lineTo(470, 150); ctx.lineTo(450, 175); ctx.lineTo(370, 175); ctx.closePath(); ctx.stroke(); ctx.strokeRect(395, 120, 30, 30);
  ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = `40px ${FONT}`; ctx.fillText("?!", 230, 70);
});

/** Pasta com carimbo vermelho. */
export const Folder: React.FC<{ p?: V3; rot?: V3; s?: number; stamp?: number; label?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, stamp = 0, label = "PROJETO POMBO" }) => {
  const tex = canvasTexture(`pasta-${label}-${fontReady()}`, 512, 384, (ctx, w, h) => {
    ctx.fillStyle = "#e6c98a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2a1a10"; ctx.textAlign = "center"; ctx.font = `52px ${FONT}`; ctx.fillText(label, w / 2, 90);
    ctx.font = `30px ${FONT}`; ctx.fillText("ULTRA SECRETO", w / 2, 140);
  });
  const st = canvasTexture(`carimbo-${fontReady()}`, 512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "#d62a1e"; ctx.lineWidth = 12; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#d62a1e"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `92px ${FONT}`; ctx.fillText("CANCELADO", w / 2, h / 2 + 4);
  });
  return (
    <group position={p} rotation={rot} scale={s}>
      <Box s={[1.1, 0.03, 0.82]} c="#d9b874" />
      <mesh position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.04, 0.78]} /><meshStandardMaterial map={tex} /></mesh>
      {stamp > 0.01 && <mesh position={[0, 0.02, 0.1]} rotation={[-Math.PI / 2, 0, 0.18]} scale={0.6 + (1 - stamp) * 1.5}><planeGeometry args={[0.95, 0.3]} /><meshBasicMaterial map={st} transparent opacity={Math.min(1, stamp * 1.5)} /></mesh>}
    </group>
  );
};

/** Computador gigante dos anos 50 (gabinetes com luzes e fitas). */
export const BigComputer: React.FC<{ p?: V3; s?: number; frame: number }> = ({ p = [0, 0, 0], s = 1, frame }) => (
  <group position={p} scale={s}>
    {[-1, 0, 1].map((k) => (
      <group key={k} position={[k * 0.95, 0, 0]}>
        <Box s={[0.9, 2.1, 0.6]} p={[0, 1.05, 0]} c="#c9ced6" />
        {k === 0 ? [0, 1].map((j) => (
          <group key={j} position={[-0.2 + j * 0.4, 1.5, 0.31]} rotation={[0, 0, frame * 0.08 * (j ? -1 : 1)]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.03, 20]} /><M c="#3a3f4b" /></mesh>
            <Box s={[0.26, 0.04, 0.04]} p={[0, 0, 0.02]} c="#8a929e" shadow={false} />
          </group>
        )) : Array.from({ length: 12 }, (_, j) => (
          <mesh key={j} position={[-0.3 + (j % 4) * 0.2, 1.7 - Math.floor(j / 4) * 0.25, 0.31]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <M c={["#e04b3c", "#ffd23f", "#4caf50"][j % 3]} e={["#e04b3c", "#ffd23f", "#4caf50"][j % 3]} ei={rand(j + Math.floor(frame / 6)) > 0.5 ? 1.2 : 0.1} />
          </mesh>
        ))}
        <Box s={[0.7, 0.4, 0.04]} p={[0, 0.6, 0.31]} c="#9aa3ad" />
      </group>
    ))}
  </group>
);

/** Nuvens chapadas. */
export const Clouds: React.FC<{ frame: number; y?: number; speed?: number }> = ({ frame, y = -1.5, speed = 0.04 }) => (
  <group>
    {Array.from({ length: 14 }, (_, i) => {
      const sp = 30, x = (((rand(i) * sp - frame * speed * (0.6 + rand(i + 3) * 0.6)) % sp) + sp) % sp - sp / 2;
      return (
        <group key={i} position={[x, y + (rand(i + 2) - 0.5) * 2, -8 + rand(i + 1) * 10]} scale={0.6 + rand(i + 4) * 0.9}>
          {[[0, 0, 0, 0.7], [0.6, -0.1, 0.1, 0.5], [-0.6, -0.1, 0, 0.55], [0.25, 0.35, 0, 0.5]].map(([a, b, c, r], j) => (
            <mesh key={j} position={[a, b, c]}><sphereGeometry args={[r, 16, 12]} /><M c="#ffffff" r={1} /></mesh>
          ))}
        </group>
      );
    })}
  </group>
);
