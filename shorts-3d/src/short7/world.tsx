import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT } from "../kit/textures";
import { clamp01, rand } from "../kit/anim";
import { getInputProps } from "remotion";

/** Modo leve (render sem placa de vídeo): sem sombras projetadas. */
const LITE = (getInputProps() as { lite?: boolean }).lite === true;

type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture; side?: THREE.Side; t?: number }> = ({ c, r = 0.7, m = 0, e, ei = 0, map, side, t }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} side={side} transparent={t !== undefined} opacity={t ?? 1} />
);
const lerpC = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(k)).getHexString();

// ------------------------------------------------------------------ luzes por clima
export const LIGHT_DAY = <Lights warm="#fff1d6" sky="#dbe9ff" key={2.3} keyPos={[-5, 8, 6]} shadows={!LITE} />;
export const LIGHT_GOLD = <Lights warm="#ffc27a" sky="#ffd9b0" key={2.4} keyPos={[6, 4, 5]} shadows={!LITE} />;
export const LIGHT_NIGHT = <Lights warm="#9fb4ff" sky="#3a4a8a" key={1.1} keyPos={[4, 8, 3]} shadows={!LITE} />;
export const LIGHT_GREY = <Lights warm="#e6e6e6" sky="#c9d2dc" key={1.7} keyPos={[-4, 7, 5]} shadows={!LITE} />;

// ------------------------------------------------------------------ céu
export const Sky: React.FC<{ night?: boolean; dusk?: boolean; frame?: number; milky?: boolean; color?: string }> = ({ night, dusk, frame = 0, milky = true, color }) => {
  const c = color ?? (night ? "#0b1030" : dusk ? "#f2a66b" : "#a9d4f2");
  return (
    <group>
      <mesh position={[0, 20, -60]}><planeGeometry args={[300, 120]} /><meshBasicMaterial color={c} /></mesh>
      {night && Array.from({ length: 260 }).map((_, i) => (
        <mesh key={i} position={[(rand(i) - 0.5) * 220, 6 + rand(i + 3) * 70, -58]}>
          <circleGeometry args={[0.08 + rand(i + 7) * 0.18 * (0.7 + 0.3 * Math.sin(frame * 0.1 + i)), 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {night && milky && (
        <mesh position={[0, 35, -59]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[240, 16]} />
          <meshBasicMaterial map={milkyTex()} transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  );
};
const milkyTex = () =>
  canvasTexture("milky", 512, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(180,170,255,0)"); g.addColorStop(0.5, "rgba(230,220,255,0.9)"); g.addColorStop(1, "rgba(180,170,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(255,255,255,${rand(i) * 0.8})`; ctx.fillRect(rand(i + 1) * w, h / 2 + (rand(i + 2) - 0.5) * h * 0.8, 1.5, 1.5); }
  });

// ------------------------------------------------------------------ texturas
const winTex = (lit: boolean, seed: number) =>
  canvasTexture(`win-${lit}-${seed}`, 128, 256, (ctx, w, h) => {
    ctx.fillStyle = "rgba(0,0,0,0)"; ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) {
      const on = lit && rand(seed * 31 + x * 7 + y * 13) > 0.45;
      ctx.fillStyle = on ? "#ffe39a" : "#2c3a4c"; ctx.fillRect(10 + x * 30, 10 + y * 30, 20, 20);
    }
  });
const vineTex = () =>
  canvasTexture("vines", 256, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      let x = rand(i) * w, y = h;
      ctx.strokeStyle = "#2f7a33"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 18; k++) { x += (rand(i * 20 + k) - 0.5) * 30; y -= 22 + rand(i + k) * 10; ctx.lineTo(x, y); }
      ctx.stroke();
      for (let k = 0; k < 40; k++) { ctx.fillStyle = k % 2 ? "#4caf50" : "#3c8f40"; ctx.beginPath(); ctx.arc(rand(i * 50 + k) * w, h - rand(i * 70 + k) * h * (0.4 + rand(i) * 0.6), 6 + rand(k) * 6, 0, Math.PI * 2); ctx.fill(); }
    }
  });
const textTex = (txt: string, color = "#ffffff", bg = "rgba(0,0,0,0)", w = 1024, h = 256, size = 120) =>
  canvasTexture(`txt-${txt}-${color}-${bg}-${FONT}`, w, h, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.font = `${size}px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const lines = txt.split("|"); lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.05));
  });

// ------------------------------------------------------------------ a cidade (com o tempo: verde, ruína, floresta)
export type CityState = { frame: number; green?: number; decay?: number; forest?: number; night?: boolean; power?: boolean; cars?: boolean };
const BCOL = ["#d9b38c", "#9fb8c9", "#c98f7a", "#e2d6b8", "#a7b49a", "#c7a6c9", "#b9c4cc"];

const Tree: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#3f9a46" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.12, 0.18, 1.8, 10]} /><M c="#7a4f2a" /></mesh>
    <mesh position={[0, 2.3, 0]} castShadow><sphereGeometry args={[0.95, 16, 12]} /><M c={c} /></mesh>
    <mesh position={[0.5, 1.9, 0.2]} castShadow><sphereGeometry args={[0.6, 14, 10]} /><M c={c} /></mesh>
    <mesh position={[-0.45, 2.0, -0.1]} castShadow><sphereGeometry args={[0.65, 14, 10]} /><M c={c} /></mesh>
  </group>
);
export const Car: React.FC<{ p: V3; ry?: number; c?: string; rust?: number; sink?: number }> = ({ p, ry = 0, c = "#c0392b", rust = 0, sink = 0 }) => {
  const col = lerpC(c, "#7a4a2a", rust);
  return (
    <group position={[p[0], p[1] - sink * 0.5, p[2]]} rotation={[0, ry, 0]}>
      <Box s={[2.0, 0.5, 0.95]} p={[0, 0.45, 0]} c={col} />
      <Box s={[1.1, 0.45, 0.85]} p={[-0.1, 0.9, 0]} c={col} />
      <Box s={[1.0, 0.36, 0.87]} p={[-0.1, 0.9, 0]} c={lerpC("#bfe3f5", "#4a4a40", rust)} />
      {[-0.65, 0.65].map((x) => [-0.48, 0.48].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.14, 16]} /><M c="#1f1f24" /></mesh>
      )))}
    </group>
  );
};
const TrafficLight: React.FC<{ p: V3; frame: number; power: boolean }> = ({ p, frame, power }) => {
  const ph = Math.floor(frame / 45) % 3; // verde, amarelo, vermelho
  const on = (i: number) => power && ((i === 2 && ph === 0) || (i === 1 && ph === 1) || (i === 0 && ph === 2));
  return (
    <group position={p}>
      <Box s={[0.12, 3.2, 0.12]} p={[0, 1.6, 0]} c="#3a3f4b" />
      <Box s={[0.4, 1.0, 0.3]} p={[0, 3.3, 0]} c="#2a2d36" />
      {["#e53935", "#fdd835", "#43a047"].map((c, i) => (
        <mesh key={i} position={[0, 3.62 - i * 0.3, 0.16]}><sphereGeometry args={[0.1, 12, 10]} /><M c={on(i) ? c : "#333"} e={c} ei={on(i) ? 1.5 : 0} /></mesh>
      ))}
    </group>
  );
};
const Lamp: React.FC<{ p: V3; lit: boolean; vine?: number }> = ({ p, lit, vine = 0 }) => (
  <group position={p}>
    <Box s={[0.1, 3.4, 0.1]} p={[0, 1.7, 0]} c="#4a505c" />
    <Box s={[0.8, 0.08, 0.08]} p={[0.35, 3.4, 0]} c="#4a505c" />
    <mesh position={[0.7, 3.3, 0]}><sphereGeometry args={[0.16, 12, 10]} /><M c={lit ? "#fff3c4" : "#888"} e="#ffe08a" ei={lit ? 1.6 : 0} /></mesh>
    {vine > 0.05 && <mesh position={[0, 1.7 * vine, 0.06]} scale={[0.5, vine, 1]}><planeGeometry args={[0.6, 3.4]} /><meshStandardMaterial map={vineTex()} transparent alphaTest={0.1} side={THREE.DoubleSide} /></mesh>}
  </group>
);

/** Rua principal: asfalto no eixo x (z de -3 a 3), calçadas, prédios atrás (z ≈ -8). */
export const City: React.FC<CityState & { span?: number }> = ({ frame, green = 0, decay = 0, forest = 0, night = false, power = !night, cars = true, span = 34 }) => {
  const road = lerpC(lerpC("#4f535e", "#6b7a5a", green), "#4e6b3a", forest);
  const n = Math.round(span / 6);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[span * 2 + 20, 40]} /><M c={lerpC("#6f9a54", "#4e7f3a", forest)} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow><planeGeometry args={[span * 2 + 20, 6]} /><M c={road} r={0.95} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, sd * 4]} receiveShadow><planeGeometry args={[span * 2 + 20, 2]} /><M c={lerpC("#c9c2b4", "#7f9a62", Math.max(green * 0.8, forest))} /></mesh>)}
      {forest < 0.6 && Array.from({ length: 14 }).map((_, i) => <Box key={i} s={[1.4, 0.01, 0.15]} p={[-span + i * 5, 0.025, 0]} c="#f4f1ea" shadow={false} />)}
      {/* prédios */}
      {Array.from({ length: n * 2 + 1 }).map((_, k) => {
        const i = k - n, x = i * 6 + (rand(k) - 0.5);
        const hgt = 5 + rand(k + 11) * 12;
        const fall = clamp01((decay - 0.4 - rand(k + 5) * 0.4) / 0.4);
        const h = hgt * (1 - fall * 0.75);
        const col = lerpC(BCOL[k % BCOL.length], "#8a8a80", decay * 0.6);
        return (
          <group key={k} position={[x, 0, -8 - rand(k + 2) * 2]} rotation={[0, 0, (rand(k + 9) - 0.5) * 0.3 * fall]}>
            <Box s={[5, h, 4]} p={[0, h / 2, 0]} c={col} />
            <mesh position={[0, h / 2, 2.01]}><planeGeometry args={[4.4, h - 0.6]} /><meshStandardMaterial map={winTex(!!(night && power), k)} transparent emissive="#ffe39a" emissiveIntensity={night && power ? 0.35 : 0} emissiveMap={winTex(!!(night && power), k)} /></mesh>
            {green > 0.15 && <mesh position={[0, h * 0.5 * Math.min(1, green * 1.2), 2.05]} scale={[1, Math.min(1, green * 1.2), 1]}><planeGeometry args={[4.6, h]} /><meshStandardMaterial map={vineTex()} transparent alphaTest={0.1} /></mesh>}
          </group>
        );
      })}
      {/* postes e semáforo */}
      {Array.from({ length: 6 }).map((_, i) => <Lamp key={i} p={[-span + 6 + i * 12, 0, 3.4]} lit={night && power} vine={green} />)}
      {forest < 0.7 && <TrafficLight p={[5, 0, 3.2]} frame={frame} power={power} />}
      {/* carros parados */}
      {cars && [[-6, -1.4, 0.3, "#c0392b"], [-8.5, 1.2, -0.2, "#2c6fb6"], [3.5, -1.0, 0.6, "#f2b636"], [9, 1.2, -0.4, "#ececec"], [-12, 0.8, 0.1, "#3e9b4a"]].map(([x, z, ry, c], i) => (
        <Car key={i} p={[x as number, 0, z as number]} ry={ry as number} c={c as string} rust={decay} sink={forest} />
      ))}
      {/* mato no asfalto */}
      {green > 0.05 && Array.from({ length: 80 }).map((_, i) => {
        const x = (rand(i) - 0.5) * span * 2, z = (rand(i + 1) - 0.5) * 9, s = green * (0.5 + rand(i + 2));
        return <mesh key={i} position={[x, 0.05, z]} scale={[s, s * 0.8, s]}><coneGeometry args={[0.35, 0.6, 7]} /><M c={i % 2 ? "#5aa84a" : "#4a9640"} /></mesh>;
      })}
      {/* árvores nascendo no meio da rua */}
      {Array.from({ length: 22 }).map((_, i) => {
        const g = clamp01((Math.max(green - 0.5, 0) * 0.6 + forest) * (0.6 + rand(i + 4) * 0.8));
        if (g < 0.05) return null;
        return <Tree key={i} p={[(rand(i + 20) - 0.5) * span * 2, 0, (rand(i + 21) - 0.5) * 12]} s={0.4 + g * 2.2} c={i % 3 ? "#3f9a46" : "#4fae52"} />;
      })}
    </group>
  );
};

// ------------------------------------------------------------------ interiores e lugares
export const Mall: React.FC<{ frame: number; dark?: boolean }> = ({ dark }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 20]} /><M c="#e9e4da" r={0.4} /></mesh>
    <Box s={[30, 8, 0.3]} p={[0, 4, -6]} c={dark ? "#8a8a96" : "#f2efe8"} />
    {[-6, -2, 2, 6].map((x, i) => (
      <group key={i} position={[x, 0, -4.5]}>
        <Box s={[3, 2.6, 1]} p={[0, 1.3, 0]} c="#c9ced6" />
        {Array.from({ length: 9 }).map((_, k) => <Box key={k} s={[0.6, 0.55, 0.4]} p={[-1 + (k % 3) * 1, 0.5 + Math.floor(k / 3) * 0.85, 0.4]} c={["#e04b3c", "#2c6fb6", "#f2b636", "#3e9b4a", "#7a4cc8"][(k + i) % 5]} />)}
      </group>
    ))}
    <Box s={[1.2, 1.0, 1.2]} p={[0, 0.5, -1]} c="#3a3f4b" />
    <mesh position={[0, 1.35, -1]} rotation={[0, 0.3, 0]}><boxGeometry args={[0.7, 0.7, 0.25]} /><meshStandardMaterial map={textTex("GAME", "#ffffff", "#7a4cc8", 256, 256, 80)} /></mesh>
    <mesh position={[0, 7.2, -5.8]}><planeGeometry args={[8, 1.2]} /><meshStandardMaterial map={textTex("SHOPPING", "#ffffff", "#c62a2a", 1024, 160, 110)} /></mesh>
  </group>
);
export const Bakery: React.FC<{ eaten?: number }> = ({ eaten = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 14]} /><M c="#d9b38c" /></mesh>
    <Box s={[20, 6, 0.3]} p={[0, 3, -4]} c="#f6d7a8" />
    <mesh position={[0, 4.8, -3.8]}><planeGeometry args={[5, 1]} /><meshStandardMaterial map={textTex("PADARIA", "#7a3a1a", "#fff3d6", 1024, 200, 130)} /></mesh>
    <Box s={[5, 1.1, 1.1]} p={[0, 0.55, -1.5]} c="#b9874f" />
    <mesh position={[0, 1.45, -1.5]}><boxGeometry args={[5, 0.7, 1.1]} /><meshStandardMaterial color="#cfefff" transparent opacity={0.3} /></mesh>
    {Array.from({ length: 12 }).map((_, i) => (i / 12 < 1 - eaten) && (
      <group key={i} position={[-2 + (i % 6) * 0.8, 1.32, -1.75 + Math.floor(i / 6) * 0.45]}>
        <mesh scale={[1, 0.6, 1]}><sphereGeometry args={[0.22, 14, 10]} /><M c="#e8b45a" /></mesh>
        <mesh position={[0, 0.1, 0]} scale={[1, 0.3, 1]}><sphereGeometry args={[0.2, 12, 8]} /><M c="#ffffff" /></mesh>
      </group>
    ))}
  </group>
);
export const Rooftop: React.FC<{ painted?: number }> = ({ painted = 1 }) => (
  <group>
    <Box s={[16, 1, 12]} p={[0, -0.5, 0]} c="#9a9a96" />
    {[-1, 1].map((s) => <Box key={s} s={[16, 0.8, 0.3]} p={[0, 0.4, s * 6]} c="#7f7f7a" />)}
    <Box s={[1.5, 1.6, 1.5]} p={[5.5, 0.8, -4]} c="#b9b4ab" />
    {painted > 0 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.5]}><planeGeometry args={[11 * painted, 4]} /><meshBasicMaterial map={textTex("TEM ALGUÉM AÍ?", "#ffe14d", "rgba(0,0,0,0)", 1024, 256, 130)} transparent /></mesh>}
  </group>
);
export const Tunnel: React.FC<{ water: number; frame: number }> = ({ water, frame }) => (
  <group>
    <mesh rotation={[0, 0, 0]} position={[0, 1.5, 0]}><cylinderGeometry args={[3, 3, 40, 24, 1, true, Math.PI / 2, Math.PI]} /><M c="#5a5f6b" side={THREE.BackSide} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[6, 40]} /><M c="#3a3d44" /></mesh>
    {[-0.7, 0.7].map((x) => <Box key={x} s={[0.1, 0.12, 40]} p={[x, 0.06, 0]} c="#9aa3ad" />)}
    {Array.from({ length: 6 }).map((_, i) => <mesh key={i} position={[2.4, 3.4, -18 + i * 7]}><sphereGeometry args={[0.15, 10, 8]} /><M c="#fff3c4" e="#ffe08a" ei={water < 0.3 ? 1 : 0} /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, water * 2.6, 0]}><planeGeometry args={[6, 40]} /><meshStandardMaterial color="#3b6d7a" transparent opacity={0.85} roughness={0.15} metalness={0.2} /></mesh>
    {water > 0.02 && Array.from({ length: 5 }).map((_, i) => { const k = ((frame * 0.03 + i / 5) % 1); return <mesh key={i} position={[(rand(i) - 0.5) * 4, water * 2.6 + 0.02, -5 + i * 2]} rotation={[-Math.PI / 2, 0, 0]} scale={0.3 + k * 1.5}><ringGeometry args={[0.4, 0.5, 24]} /><meshBasicMaterial color="#cfefff" transparent opacity={1 - k} /></mesh>; })}
  </group>
);
export const PowerPlant: React.FC<{ on: number; nuclear?: boolean; frame: number }> = ({ on, nuclear, frame }) => {
  const tower = new THREE.LatheGeometry([0, 1, 2, 3, 4, 5, 6].map((y) => new THREE.Vector2(2.2 - Math.sin((y / 6) * Math.PI) * 0.7, y)), 28);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 40]} /><M c="#8fa37a" /></mesh>
      {(nuclear ? [-4, 3] : []).map((x) => (
        <group key={x} position={[x, 0, -6]}>
          <mesh geometry={tower} castShadow><M c="#d6d2c8" side={THREE.DoubleSide} /></mesh>
          {on > 0.05 && Array.from({ length: 6 }).map((_, i) => { const k = ((frame * 0.02 + i / 6) % 1); return <mesh key={i} position={[(rand(i) - 0.5) * 1.5, 6.5 + k * 5, 0]} scale={(1 + k * 2) * on}><sphereGeometry args={[0.9, 12, 10]} /><meshStandardMaterial color="#ffffff" transparent opacity={(1 - k) * 0.7} /></mesh>; })}
        </group>
      ))}
      <Box s={[8, 4, 5]} p={[nuclear ? 9 : 0, 2, -5]} c="#b9c4cc" />
      {!nuclear && [-2.5, 0, 2.5].map((x, i) => (
        <group key={i}>
          <Box s={[0.8, 8, 0.8]} p={[x, 4, -6]} c="#8a8a90" />
          {on > 0.05 && Array.from({ length: 4 }).map((_, k) => { const t = ((frame * 0.02 + k / 4 + i * 0.3) % 1); return <mesh key={k} position={[x + t * 1.5, 8.5 + t * 4, -6]} scale={(0.5 + t) * on}><sphereGeometry args={[0.8, 10, 8]} /><meshStandardMaterial color="#8a8a90" transparent opacity={(1 - t) * 0.6} /></mesh>; })}
        </group>
      ))}
      {Array.from({ length: 5 }).map((_, i) => <mesh key={i} position={[(nuclear ? 9 : 0) - 3 + i * 1.5, 3, -2.45]}><planeGeometry args={[0.8, 0.8]} /><M c={on > 0.5 ? "#ffe39a" : "#2c3a4c"} e="#ffe39a" ei={on > 0.5 ? 0.8 : 0} /></mesh>)}
      {/* torres de transmissão */}
      {[10, 18].map((x) => <group key={x} position={[x - 30, 0, -3]}><Box s={[0.15, 7, 0.15]} p={[0, 3.5, 0]} c="#6a6f7a" /><Box s={[2.5, 0.12, 0.12]} p={[0, 6.6, 0]} c="#6a6f7a" /></group>)}
    </group>
  );
};
export const Kitchen: React.FC<{ frame: number; drip?: number; fridge?: number }> = ({ frame, drip = 1, fridge = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[16, 12]} /><M c="#d8cfbf" /></mesh>
    <Box s={[16, 5, 0.3]} p={[0, 2.5, -3]} c="#cfe3dc" />
    <Box s={[4, 1, 1]} p={[-2, 0.5, -2.2]} c="#e8e2d2" />
    <Box s={[4, 0.1, 1.1]} p={[-2, 1.02, -2.2]} c="#9aa3ad" />
    <Box s={[0.08, 0.5, 0.08]} p={[-2, 1.3, -2.55]} c="#c9ced6" />
    <Box s={[0.08, 0.08, 0.35]} p={[-2, 1.53, -2.4]} c="#c9ced6" />
    {drip > 0 && <mesh position={[-2, 1.45 - ((frame * 0.03) % 1) * 0.4 * drip, -2.25]}><sphereGeometry args={[0.04, 8, 6]} /><M c="#7fd3ff" /></mesh>}
    <group position={[2.5, 0, -2.2]}>
      <Box s={[1.4, 2.6, 1]} p={[0, 1.3, 0]} c="#f4f4f4" />
      {fridge > 0 && (
        <group>
          <group position={[0.7, 1.3, 0.5]} rotation={[0, -1.6 * fridge, 0]}><Box s={[1.4, 2.6, 0.08]} p={[-0.7, 0, 0]} c="#ececec" /></group>
          {Array.from({ length: 6 }).map((_, i) => { const k = ((frame * 0.02 + i / 6) % 1); return <mesh key={i} position={[(rand(i) - 0.5) * 1, 1.5 + k * 2, 0.8]} scale={0.3 + k}><sphereGeometry args={[0.4, 10, 8]} /><meshStandardMaterial color="#9ccc65" transparent opacity={(1 - k) * 0.6 * fridge} /></mesh>; })}
        </group>
      )}
    </group>
  </group>
);
export const Cans: React.FC<{ p?: V3; n?: number }> = ({ p = [0, 0, 0], n = 6 }) => (
  <group position={p}>
    {Array.from({ length: n }).map((_, i) => (
      <group key={i} position={[(i % 3) * 0.35 - 0.35, Math.floor(i / 3) * 0.42, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.15, 0.15, 0.4, 16]} /><M c="#c9ced6" m={0.5} r={0.3} /></mesh>
        <mesh><cylinderGeometry args={[0.152, 0.152, 0.25, 16]} /><meshStandardMaterial map={textTex("FEIJÃO", "#ffffff", "#7a3a1a", 256, 128, 60)} /></mesh>
      </group>
    ))}
  </group>
);
export const Radio: React.FC<{ p?: V3; frame: number; on?: boolean }> = ({ p = [0, 0, 0], frame, on = true }) => (
  <group position={p}>
    <Box s={[0.9, 0.55, 0.35]} p={[0, 0.28, 0]} c="#7a4a2a" />
    <mesh position={[-0.2, 0.3, 0.18]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.02, 20]} /><M c="#2a2d36" /></mesh>
    <Box s={[0.3, 0.12, 0.02]} p={[0.25, 0.38, 0.18]} c="#fff3c4" e="#ffe08a" ei={on ? 0.6 : 0} />
    <Box s={[0.02, 0.6, 0.02]} p={[0.35, 0.85, 0]} rot={[0, 0, -0.4]} c="#9aa3ad" />
    {on && [0, 1, 2].map((k) => { const t = ((frame * 0.05 + k / 3) % 1); return <mesh key={k} position={[0, 0.3, 0.2 + t * 0.6]} scale={0.5 + t}><torusGeometry args={[0.25, 0.01, 6, 20, Math.PI]} /><meshBasicMaterial color="#ffffff" transparent opacity={1 - t} /></mesh>; })}
  </group>
);
export const GasStation: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 20]} /><M c="#8a8f98" /></mesh>
    <Box s={[10, 0.3, 5]} p={[0, 4, -2]} c="#e04b3c" />
    {[-4, 4].map((x) => <Box key={x} s={[0.3, 4, 0.3]} p={[x, 2, -2]} c="#d9d9d9" />)}
    {[-1.5, 1.5].map((x) => <group key={x} position={[x, 0, -2.5]}><Box s={[0.8, 1.6, 0.5]} p={[0, 0.8, 0]} c="#f4f4f4" /><Box s={[0.6, 0.3, 0.05]} p={[0, 1.3, 0.26]} c="#2a2d36" /></group>)}
  </group>
);
export const Servers: React.FC<{ frame: number; on: number }> = ({ frame, on }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><M c="#3a3f4b" /></mesh>
    {Array.from({ length: 10 }).map((_, i) => (
      <group key={i} position={[-4.5 + (i % 5) * 2.2, 0, i < 5 ? -3 : 1]}>
        <Box s={[1.2, 3, 1]} p={[0, 1.5, 0]} c="#1f232b" />
        {Array.from({ length: 12 }).map((_, k) => {
          const lit = on > (k / 12 + rand(i * 12 + k) * 0.2) && Math.sin(frame * 0.4 + i * 3 + k) > -0.3;
          return <mesh key={k} position={[-0.3 + (k % 3) * 0.3, 0.5 + Math.floor(k / 3) * 0.6, i < 5 ? 0.51 : -0.51]}><planeGeometry args={[0.12, 0.08]} /><M c={lit ? "#5bff8a" : "#202020"} e="#5bff8a" ei={lit ? 1.5 : 0} side={THREE.DoubleSide} /></mesh>;
        })}
      </group>
    ))}
  </group>
);
const earthTex = () =>
  canvasTexture("earth", 512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#2a6bb8"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 4 ? "#4c9a4a" : "#c9b27a"; ctx.beginPath(); ctx.ellipse(rand(i) * w, h * 0.2 + rand(i + 1) * h * 0.6, 20 + rand(i + 2) * 60, 10 + rand(i + 3) * 40, rand(i + 4) * 3, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < 60; i++) { ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(rand(i + 50) * w, rand(i + 51) * h, 15 + rand(i + 52) * 35, 4 + rand(i + 53) * 8, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#f4f8ff"; ctx.fillRect(0, 0, w, 14); ctx.fillRect(0, h - 14, w, 14);
  });
export const Earth: React.FC<{ p?: V3; r?: number; frame: number; night?: boolean }> = ({ p = [0, 0, 0], r = 6, frame, night }) => (
  <group position={p}>
    <mesh rotation={[0.3, frame * 0.002, 0]}><sphereGeometry args={[r, 48, 32]} /><meshStandardMaterial map={earthTex()} roughness={0.8} /></mesh>
    <mesh scale={1.03}><sphereGeometry args={[r, 32, 24]} /><meshBasicMaterial color="#8fd0ff" transparent opacity={0.15} side={THREE.BackSide} /></mesh>
    {night && <mesh scale={1.015} rotation={[0.3, frame * 0.002, 0]}><sphereGeometry args={[r, 48, 32]} /><meshBasicMaterial color="#000010" transparent opacity={0.4} depthWrite={false} /></mesh>}
  </group>
);
export const Satellite: React.FC<{ p: V3; rot?: V3; s?: number; burn?: number }> = ({ p, rot = [0, 0, 0], s = 1, burn = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[0.6, 0.6, 0.9]} p={[0, 0, 0]} c="#d8c06a" />
    {[-1, 1].map((sd) => <Box key={sd} s={[1.6, 0.05, 0.6]} p={[sd * 1.15, 0, 0]} c="#2c4a8a" />)}
    {burn > 0 && Array.from({ length: 8 }).map((_, i) => <mesh key={i} position={[0, 0, 0.5 + i * 0.35]} scale={burn * (1 - i / 8)}><sphereGeometry args={[0.45, 10, 8]} /><meshBasicMaterial color={i < 3 ? "#fff3c4" : "#ff8a3a"} transparent opacity={0.8 - i * 0.08} /></mesh>)}
  </group>
);
export const Station: React.FC<{ p: V3; rot?: V3; s?: number; burn?: number }> = ({ p, rot = [0, 0, 0], s = 1, burn = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[5, 0.2, 0.2]} p={[0, 0, 0]} c="#c9ced6" />
    {[-2.2, -1.4, 1.4, 2.2].map((x) => <Box key={x} s={[0.6, 0.04, 2.6]} p={[x, 0, 0]} c="#3a5a9a" />)}
    {[-0.6, 0, 0.6].map((x) => <mesh key={x} position={[x, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.22, 0.22, 0.55, 14]} /><M c="#ececec" /></mesh>)}
    {burn > 0 && Array.from({ length: 10 }).map((_, i) => <mesh key={i} position={[0, 0.4 + i * 0.45, 0]} scale={burn * (1.4 - i / 8)}><sphereGeometry args={[0.6, 10, 8]} /><meshBasicMaterial color={i < 3 ? "#fff3c4" : "#ff7a2a"} transparent opacity={0.85 - i * 0.07} /></mesh>)}
  </group>
);
export const Bridge: React.FC<{ rust: number; fall: number }> = ({ rust, fall }) => {
  const c = lerpC("#c0392b", "#6a3a22", rust);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}><planeGeometry args={[80, 40]} /><meshStandardMaterial color="#3b6d8a" roughness={0.2} /></mesh>
      {[-8, 8].map((x) => <Box key={x} s={[1, 14, 1]} p={[x, 5, 0]} c={c} />)}
      <group position={[0, 2, 0]} rotation={[0, 0, fall * 0.35]}>
        <Box s={[30, 0.4, 3]} p={[0, 0, 0]} c="#6a6f7a" />
        {Array.from({ length: 15 }).map((_, i) => <Box key={i} s={[0.08, 4, 0.08]} p={[-14 + i * 2, 2, 1.3]} c={c} />)}
      </group>
    </group>
  );
};
export const Pyramids: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 80]} /><M c="#e2c58a" /></mesh>
    {[[0, -14, 9], [-14, -22, 7], [12, -26, 6]].map(([x, z, s], i) => (
      <mesh key={i} position={[x, s * 0.7, z]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[s, s * 1.4, 4]} /><M c={["#d9b06a", "#cfa660", "#c49a58"][i]} /></mesh>
    ))}
  </group>
);
/** Montanha com rostos esculpidos genéricos (sem retratar pessoas reais). */
export const CarvedMountain: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[120, 60]} /><M c="#6f9a54" /></mesh>
    <mesh position={[0, 5, -16]} scale={[2.2, 1.2, 1]}><sphereGeometry args={[8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><M c="#a39d93" /></mesh>
    {[-6, -2, 2, 6].map((x, i) => (
      <group key={i} position={[x, 9 - Math.abs(x) * 0.25, -8.5]}>
        <mesh scale={[1, 1.3, 0.6]}><sphereGeometry args={[1.5, 16, 12]} /><M c="#b8b2a8" /></mesh>
        {[-0.5, 0.5].map((ex) => <mesh key={ex} position={[ex, 0.3, 0.85]}><sphereGeometry args={[0.18, 8, 6]} /><M c="#7a756c" /></mesh>)}
        <Box s={[0.7, 0.1, 0.1]} p={[0, -0.5, 0.85]} c="#7a756c" />
      </group>
    ))}
  </group>
);
export const Voyager: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.8, 0.4, 0.4, 32, 1, true]} /><M c="#f4f4f4" side={THREE.DoubleSide} m={0.3} /></mesh>
    <Box s={[1, 0.5, 1]} p={[0, -0.6, 0]} c="#9aa3ad" />
    <Box s={[5, 0.06, 0.06]} p={[2.5, -0.6, 0]} c="#c9ced6" />
    <Box s={[0.06, 0.06, 3]} p={[0, -0.6, -1.6]} c="#c9ced6" />
    <mesh position={[0.55, -0.6, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.35, 0.35, 0.03, 32]} /><M c="#f2c94c" m={0.8} r={0.25} e="#f2c94c" ei={0.2} /></mesh>
  </group>
);
export const OverpassWall: React.FC<{ written: number; second?: number }> = ({ written, second = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 20]} /><M c="#7a8a6a" /></mesh>
    <Box s={[14, 5, 0.6]} p={[0, 2.5, -3]} c="#a9a49a" />
    <Box s={[16, 0.8, 3]} p={[0, 5.4, -2]} c="#8f8a80" />
    {written > 0 && <mesh position={[0, 3.1, -2.68]}><planeGeometry args={[9 * written, 1.8]} /><meshBasicMaterial map={textTex("EU ESTIVE AQUI.", "#1a1a1a", "rgba(0,0,0,0)", 1024, 200, 120)} transparent /></mesh>}
    {second > 0 && <mesh position={[0, 1.7, -2.68]}><planeGeometry args={[9 * second, 1.4]} /><meshBasicMaterial map={textTex("E O BISCOITO TAMBÉM.", "#1a1a1a", "rgba(0,0,0,0)", 1024, 160, 90)} transparent /></mesh>}
  </group>
);
export const Grave: React.FC<{ p?: V3; flowers?: boolean }> = ({ p = [0, 0, 0], flowers = true }) => (
  <group position={p}>
    <mesh position={[0, 0.05, 0]} scale={[1, 0.25, 0.6]}><sphereGeometry args={[0.9, 16, 10]} /><M c="#6b4a2a" /></mesh>
    <Box s={[0.5, 0.7, 0.12]} p={[0, 0.35, -0.6]} c="#9a9a96" />
    {flowers && [-0.3, 0, 0.3].map((x, i) => <mesh key={i} position={[x, 0.25, 0.2]}><sphereGeometry args={[0.08, 8, 6]} /><M c={["#ffd23f", "#e04b3c", "#f4f4f4"][i]} /></mesh>)}
  </group>
);

// ------------------------------------------------------------------ bichos
export const Dog: React.FC<{ p?: V3; ry?: number; s?: number; frame?: number; wag?: number; old?: number; sleep?: boolean; walk?: number }> = ({ p = [0, 0, 0], ry = 0, s = 1, frame = 0, wag = 0, old = 0, sleep = false, walk = 0 }) => {
  const fur = lerpC("#e3b16f", "#d9c8a8", old * 0.5), dark = "#a8743c", muzzle = lerpC("#f2d3a2", "#f4f4f4", old);
  const leg = (i: number) => Math.sin(frame * 0.4 + i * Math.PI) * 0.4 * walk;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <group position={[0, sleep ? -0.22 : 0, 0]}>
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.2, 0.45, 8, 16]} /><M c={fur} /></mesh>
        {!sleep && [[0.22, 0.12], [0.22, -0.12], [-0.22, 0.12], [-0.22, -0.12]].map(([x, z], i) => (
          <group key={i} position={[x, 0.3, z]} rotation={[0, 0, leg(i)]}><mesh position={[0, -0.14, 0]} castShadow><capsuleGeometry args={[0.055, 0.2, 6, 10]} /><M c={fur} /></mesh></group>
        ))}
        <group position={[0.42, sleep ? 0.45 : 0.68, 0]} rotation={[0, 0, sleep ? -0.4 : 0]}>
          <mesh castShadow><sphereGeometry args={[0.2, 20, 16]} /><M c={fur} /></mesh>
          <mesh position={[0.17, -0.05, 0]} scale={[1.2, 0.8, 0.9]}><sphereGeometry args={[0.1, 14, 10]} /><M c={muzzle} /></mesh>
          <mesh position={[0.28, -0.03, 0]}><sphereGeometry args={[0.035, 10, 8]} /><M c="#1a1210" /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[0.12, 0.05, sd * 0.1]}><sphereGeometry args={[0.032, 10, 8]} /><M c="#1a1210" /></mesh>)}
          {[-1, 1].map((sd) => <mesh key={`e${sd}`} position={[-0.02, 0.05, sd * 0.19]} rotation={[sd * 0.3, 0, 0.3]} scale={[0.6, 1.3, 0.35]}><sphereGeometry args={[0.11, 12, 10]} /><M c={dark} /></mesh>)}
        </group>
        <mesh position={[0.32, 0.55, 0]} rotation={[0, 0, Math.PI / 2 - 0.4]}><torusGeometry args={[0.14, 0.025, 8, 20]} /><M c="#c62a2a" /></mesh>
        <mesh position={[0.4, 0.43, 0]}><cylinderGeometry args={[0.045, 0.045, 0.015, 14]} /><M c="#f2c94c" m={0.6} /></mesh>
        <group position={[-0.42, 0.52, 0]} rotation={[0, Math.sin(frame * 0.6) * 0.6 * wag, 0.9]}><mesh position={[0, 0.14, 0]}><capsuleGeometry args={[0.04, 0.22, 6, 10]} /><M c={fur} /></mesh></group>
      </group>
    </group>
  );
};
export const Deer: React.FC<{ p: V3; ry?: number; s?: number }> = ({ p, ry = 0, s = 1 }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.22, 0.6, 8, 14]} /><M c="#a9733f" /></mesh>
    {[[0.3, 0.12], [0.3, -0.12], [-0.3, 0.12], [-0.3, -0.12]].map(([x, z], i) => <mesh key={i} position={[x, 0.4, z]}><capsuleGeometry args={[0.04, 0.6, 6, 8]} /><M c="#8a5a30" /></mesh>)}
    <mesh position={[0.5, 1.35, 0]} rotation={[0, 0, -0.5]}><capsuleGeometry args={[0.08, 0.35, 6, 10]} /><M c="#a9733f" /></mesh>
    <mesh position={[0.68, 1.6, 0]} scale={[1.4, 0.9, 0.9]}><sphereGeometry args={[0.12, 14, 10]} /><M c="#a9733f" /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[0.62, 1.8, sd * 0.08]} rotation={[sd * 0.4, 0, 0.2]}><cylinderGeometry args={[0.015, 0.02, 0.3, 6]} /><M c="#e8dcc0" /></mesh>)}
  </group>
);
export const Bird: React.FC<{ p: V3; frame: number; s?: number }> = ({ p, frame, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh scale={[1.3, 0.8, 0.8]}><sphereGeometry args={[0.12, 10, 8]} /><M c="#4a4a52" /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[0, 0.02, sd * 0.1]} rotation={[sd * Math.sin(frame * 0.8) * 0.8, 0, 0]} scale={[0.6, 0.1, 1.2]}><sphereGeometry args={[0.12, 8, 6]} /><M c="#3a3a42" /></mesh>)}
  </group>
);
