import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { Toon, ToonFace } from "../kit/Toon";
import type { Pose } from "../kit/Character";
import { canvasTexture, FONT, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";

/** Cenários do short "The bike so fast they BANNED it" (Velocar, 1933). Bicicletas andam para +z. */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; e?: string; ei?: number; map?: THREE.Texture }> = ({ c, r = 0.6, e, ei = 0, map }) => (
  <meshStandardMaterial color={c} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
);
export const LIGHT_VELO = <Lights warm="#ffe2b0" sky="#f0e0c8" key={2.3} keyPos={[-3, 6, 4]} />;
export const LIGHT_ROOM = <Lights warm="#ffd9a0" sky="#e8d8c0" key={2.0} keyPos={[2, 5, 4]} />;
export const LIGHT_SKY = <Lights warm="#fff1d6" sky="#cfe6ff" key={2.4} keyPos={[-4, 6, 5]} />;

/** Tubo entre dois pontos. */
const Tube: React.FC<{ a: V3; b: V3; r?: number; c: string }> = ({ a, b, r = 0.025, c }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5), len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return <mesh position={mid} quaternion={q}><cylinderGeometry args={[r, r, len, 10]} /><M c={c} r={0.4} /></mesh>;
};
const Wheel: React.FC<{ p: V3; r: number; spin: number }> = ({ p, r, spin }) => (
  <group position={p} rotation={[spin, 0, 0]}>
    <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[r, 0.035, 10, 36]} /><M c="#1b1b1f" r={0.8} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} rotation={[i * Math.PI / 3, 0, 0]}><boxGeometry args={[0.012, r * 2, 0.012]} /><M c="#c9ced6" r={0.3} /></mesh>)}
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.06, 12]} /><M c="#9aa3ad" r={0.3} /></mesh>
  </group>
);

/** Bicicleta de corrida comum (1930). Selim ~0.95 de altura. */
export const RoadBike: React.FC<{ spin: number; c?: string }> = ({ spin, c = "#c62a2a" }) => (
  <group>
    <Wheel p={[0, 0.35, -0.5]} r={0.35} spin={spin} /><Wheel p={[0, 0.35, 0.52]} r={0.35} spin={spin} />
    <Tube a={[0, 0.35, -0.5]} b={[0, 0.88, -0.18]} c={c} /><Tube a={[0, 0.35, -0.5]} b={[0, 0.38, 0.0]} c={c} />
    <Tube a={[0, 0.38, 0.0]} b={[0, 0.88, -0.18]} c={c} /><Tube a={[0, 0.88, -0.18]} b={[0, 0.86, 0.42]} c={c} />
    <Tube a={[0, 0.38, 0.0]} b={[0, 0.86, 0.42]} c={c} /><Tube a={[0, 0.86, 0.42]} b={[0, 0.35, 0.52]} c={c} />
    <Tube a={[0, 0.86, 0.42]} b={[0, 0.98, 0.46]} c={c} />
    <Tube a={[-0.18, 0.95, 0.5]} b={[0.18, 0.95, 0.5]} c="#1b1b1f" r={0.02} />
    <mesh position={[0, 0.94, -0.2]} scale={[0.6, 0.25, 1.4]}><sphereGeometry args={[0.1, 12, 8]} /><M c="#3a2a1e" /></mesh>
  </group>
);

/** Bicicleta deitada (estilo Velocar, 1933): comprida e baixa, banco reclinado, pedais lá na frente. */
export const LyingBike: React.FC<{ spin: number; c?: string }> = ({ spin, c = "#c62a2a" }) => {
  const crank: V3 = [0, 0.5, 0.38];
  const ca = spin * 1.4;
  return (
    <group>
      <Wheel p={[0, 0.3, -0.85]} r={0.3} spin={spin * 1.2} /><Wheel p={[0, 0.3, 0.95]} r={0.3} spin={spin * 1.2} />
      {/* quadro: viga principal da roda de trás até o garfo da frente */}
      <Tube a={[0, 0.3, -0.85]} b={[0, 0.36, -0.3]} c={c} r={0.035} />
      <Tube a={[0, 0.36, -0.3]} b={[0, 0.36, 0.7]} c={c} r={0.04} />
      <Tube a={[0, 0.36, 0.7]} b={[0, 0.3, 0.95]} c={c} r={0.03} />
      <Tube a={[0, 0.36, 0.7]} b={[0, 0.62, 0.78]} c={c} r={0.03} />
      {/* haste dos pedais */}
      <Tube a={[0, 0.36, 0.15]} b={crank} c={c} r={0.03} />
      <group position={crank} rotation={[ca, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.03, 18]} /><M c="#9aa3ad" r={0.3} /></mesh>
        {[-1, 1].map((k) => <group key={k} position={[k * 0.06, 0, 0]} rotation={[k > 0 ? Math.PI : 0, 0, 0]}><Box s={[0.02, 0.16, 0.025]} p={[0, -0.08, 0]} c="#3a3f4b" shadow={false} /><Box s={[0.1, 0.025, 0.06]} p={[k * 0.04, -0.16, 0]} c="#1b1b1f" shadow={false} /></group>)}
      </group>
      {/* corrente */}
      <Tube a={[0, 0.5, 0.38]} b={[0, 0.3, -0.85]} c="#4a4d55" r={0.008} />
      {/* banco: assento + encosto reclinado */}
      <Box s={[0.4, 0.07, 0.42]} p={[0, 0.42, -0.32]} c="#3a2a1e" />
      <group position={[0, 0.44, -0.52]} rotation={[-0.78, 0, 0]}><Box s={[0.4, 0.06, 0.6]} p={[0, 0, -0.3]} c="#3a2a1e" /></group>
      <Tube a={[0, 0.36, -0.55]} b={[0, 0.72, -0.85]} c={c} r={0.02} />
      {/* guidão por baixo do banco, dos dois lados */}
      {[-1, 1].map((k) => <Tube key={k} a={[0, 0.38, -0.12]} b={[k * 0.3, 0.42, -0.2]} c="#1b1b1f" r={0.018} />)}
    </group>
  );
};

/** Ciclista sentado normal (pedalando). */
export const UprightRider: React.FC<{ p: V3; ry?: number; f: number; kind?: "nico" | "bia" | "general"; face: ToonFace; c?: string; speed?: number }> = ({ p, ry = 0, f, kind = "bia", face, c, speed = 0.4 }) => {
  const a = f * speed;
  const pose: Pose = { lean: 0.7, legL: -0.7 + Math.sin(a) * 0.45, legR: -0.7 - Math.sin(a) * 0.45, armL: [-1.25, 0, -0.08], armR: [-1.25, 0, 0.08], head: [-0.45, 0, 0], bob: Math.abs(Math.sin(a)) * 0.01 };
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <RoadBike spin={a} c={c} />
      <Toon kind={kind} position={[0, 0.24, -0.2]} face={face} pose={pose} scale={0.95} />
    </group>
  );
};
/** Ciclista deitado (o Nico como Francis Faure): costas no encosto, pernas esticadas até os pedais. */
export const LyingRider: React.FC<{ p: V3; ry?: number; f: number; face: ToonFace; speed?: number }> = ({ p, ry = 0, f, face, speed = 0.5 }) => {
  const a = f * speed;
  const TILT = -0.78;
  // perna "para baixo" no corpo inclinado vira horizontal para a frente com -0.79 de giro na perna
  const pose: Pose = { legL: -0.8 + Math.sin(a * 1.4) * 0.2, legR: -0.8 - Math.sin(a * 1.4) * 0.2, armL: [0.15, 0, -0.42], armR: [0.15, 0, 0.42], head: [0.55, 0, 0] };
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <LyingBike spin={a} />
      <group position={[0, 0.47, -0.36]} rotation={[TILT, 0, 0]}>
        <Toon kind="nico" position={[0, -0.72 * 0.92, 0.06]} face={face} pose={pose} scale={0.92} />
      </group>
    </group>
  );
};

/** Velódromo de madeira (reta), com a parede inclinada e a arquibancada atrás. */
const woodTex = () => canvasTexture("velo-wood", 256, 256, (ctx, w, h) => {
  ctx.fillStyle = "#c98a4a"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? "rgba(90,50,20,.12)" : "rgba(255,230,190,.08)"; ctx.fillRect(0, i * 16, w, 15); ctx.fillStyle = "rgba(70,40,15,.35)"; ctx.fillRect(0, i * 16 + 15, w, 1); }
});
export const Velodrome: React.FC<{ crowd?: boolean; modern?: boolean; f?: number; laugh?: boolean }> = ({ crowd = true, modern = false, f = 0, laugh = false }) => {
  const wt = woodTex(); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(1, 6);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 60]} /><M c="#ffffff" map={wt} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[60, 60]} /><M c={modern ? "#5a7a4a" : "#8a6a48"} /></mesh>
      {[[1.2, "#2c6fb6"], [-0.4, "#c62a2a"], [2.6, "#1b1b1f"]].map(([x, c]) => <mesh key={String(x)} rotation={[-Math.PI / 2, 0, 0]} position={[x as number, 0.01, 0]}><planeGeometry args={[0.06, 60]} /><meshBasicMaterial color={c as string} /></mesh>)}
      {/* parede inclinada */}
      <mesh position={[-3.6, 0.9, 0]} rotation={[0, 0, -0.85]}><planeGeometry args={[2.6, 60]} /><M c="#ffffff" map={wt} /></mesh>
      <Box s={[0.15, 0.5, 60]} p={[-4.55, 2.0, 0]} c="#e9e4d8" />
      {/* arquibancada com torcida */}
      {crowd && [0, 1, 2, 3].map((row) => (
        <group key={row} position={[-5.2 - row * 0.6, 1.6 + row * 0.5, 0]}>
          <Box s={[0.6, 0.12, 60]} p={[0, -0.25, 0]} c="#7a5a3a" />
          {Array.from({ length: 34 }, (_, i) => {
            const z = -16 + i * 1.0 + rand(row * 50 + i) * 0.4, col = ["#c62a2a", "#2c6fb6", "#e0b13a", "#3e9b4a", "#7a4cc8", "#f2f2f2"][(i + row) % 6];
            const hop = laugh ? Math.abs(Math.sin(f * 0.5 + i)) * 0.12 : 0;
            return (
              <group key={i} position={[0, hop, z]}>
                <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.2, 10, 8]} /><M c={col} /></mesh>
                <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.17, 12, 10]} /><M c={["#f1c7a0", "#e8b98f", "#c88f66", "#f5d2b0"][(i + row) % 4]} /></mesh>
                {i % 3 === 0 && <mesh position={[0, 0.6, 0]} scale={[1.2, 0.35, 1.2]}><sphereGeometry args={[0.16, 10, 6]} /><M c="#3a2a1e" /></mesh>}
              </group>
            );
          })}
        </group>
      ))}
      {/* bandeirolas */}
      {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-4.4, 3.6, -14 + i * 2]} rotation={[0, Math.PI / 2, Math.PI]}><coneGeometry args={[0.18, 0.4, 3]} /><M c={["#c62a2a", "#f2f2f2", "#2c6fb6"][i % 3]} /></mesh>)}
    </group>
  );
};

/** Riscos de vento passando (para trás, -z). */
export const Wind: React.FC<{ f: number; n?: number; y0?: number; y1?: number; x?: number; speed?: number }> = ({ f, n = 14, y0 = 0.2, y1 = 1.8, x = 0.4, speed = 0.08 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const t = (f * speed + rand(i)) % 1;
      return <mesh key={i} position={[x + (rand(i + 7) - 0.5) * 0.4, y0 + rand(i + 3) * (y1 - y0), 4 - t * 9]}><boxGeometry args={[0.015, 0.015, 0.9]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85} /></mesh>;
    })}
  </group>
);

/** Placar de recorde (quadro de madeira com texto). */
const boardTex = (lines: [string, number, string][], key: string) => canvasTexture(`placar-${key}-${fontReady()}`, 512, 384, (ctx, w, h) => {
  ctx.fillStyle = "#1f3a2a"; ctx.fillRect(0, 0, w, h); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let y = 70; for (const [t, s, c] of lines) { ctx.fillStyle = c; ctx.font = `${s}px ${FONT}`; ctx.fillText(t, w / 2, y); y += s * 1.25; }
});
export const RecordBoard: React.FC<{ p: V3; ry?: number; s?: number; mode: "old" | "new" | "x" }> = ({ p, ry = 0, s = 1, mode }) => {
  const lines: [string, number, string][] = mode === "old"
    ? [["HOUR RECORD", 54, "#ffe9a8"], ["44.247 km", 96, "#ffffff"], ["SINCE 1914", 50, "#ffd23f"]]
    : [["HOUR RECORD", 54, "#ffe9a8"], ["45.055 km", 96, "#7dff9a"], ["F. FAURE · 1933", 46, "#ffd23f"]];
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <Box s={[1.9, 1.45, 0.08]} p={[0, 0, -0.05]} c="#6b4426" />
      <mesh position={[0, 0, 0]}><planeGeometry args={[1.75, 1.3]} /><meshStandardMaterial map={boardTex(lines, mode === "old" ? "old" : "new")} /></mesh>
      {mode === "x" && [1, -1].map((k) => <mesh key={k} position={[0, 0, 0.03]} rotation={[0, 0, k * 0.6]}><boxGeometry args={[2.1, 0.14, 0.02]} /><meshBasicMaterial color="#e0312a" /></mesh>)}
      {[-0.7, 0.7].map((x) => <Box key={x} s={[0.07, 1.6, 0.07]} p={[x, -1.2, -0.06]} c="#6b4426" />)}
    </group>
  );
};

/** Cronômetro gigante. */
export const Stopwatch: React.FC<{ p: V3; s?: number; t: number }> = ({ p, s = 1, t }) => {
  const face = canvasTexture(`relogio-${fontReady()}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#fffaf0"; ctx.beginPath(); ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1b120d"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.fillRect(w / 2 + Math.cos(a) * 100 - 3, h / 2 + Math.sin(a) * 100 - 3, 6, 6); }
    ctx.textAlign = "center"; ctx.font = `44px ${FONT}`; ctx.fillStyle = "#c62a2a"; ctx.fillText("1 HOUR", w / 2, h / 2 + 64);
  });
  return (
    <group position={p} scale={s}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.62, 0.62, 0.14, 40]} /><M c="#c9ced6" r={0.3} /></mesh>
      <mesh position={[0, 0, 0.075]}><circleGeometry args={[0.55, 40]} /><meshStandardMaterial map={face} /></mesh>
      <group position={[0, 0, 0.09]} rotation={[0, 0, -t * Math.PI * 2]}><Box s={[0.035, 0.42, 0.02]} p={[0, 0.2, 0]} c="#c62a2a" shadow={false} /></group>
      <Box s={[0.16, 0.16, 0.12]} p={[0, 0.72, 0]} c="#9aa3ad" /><Box s={[0.28, 0.08, 0.1]} p={[0, 0.84, 0]} c="#9aa3ad" />
    </group>
  );
};

/** Sala de reunião dos dirigentes (mesa comprida, quadro, documento). */
export const MeetingRoom: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 10]} /><M c="#7a5a3e" /></mesh>
    <mesh position={[0, 2.2, -3]}><planeGeometry args={[14, 4.4]} /><M c="#c9b48a" /></mesh>
    <Box s={[14, 0.9, 0.1]} p={[0, 0.45, -2.95]} c="#6b4a2e" />
    <Box s={[3.6, 0.1, 1.3]} p={[0, 0.95, -0.6]} c="#6b4426" />
    {[[-1.6, -1.2], [1.6, -1.2], [-1.6, 0.0], [1.6, 0.0]].map(([x, z], i) => <Box key={i} s={[0.1, 0.9, 0.1]} p={[x, 0.45, z - 0.6 + 0.6]} c="#4a3020" />)}
    {/* retrato e lustre */}
    <Box s={[1.2, 0.9, 0.06]} p={[0, 2.5, -2.9]} c="#8a6a2a" /><mesh position={[0, 2.5, -2.86]}><planeGeometry args={[1.0, 0.72]} /><M c="#5a6a7a" /></mesh>
    <mesh position={[0, 3.4, -0.6]}><sphereGeometry args={[0.18, 12, 10]} /><M c="#fff6d0" e="#ffe9a0" ei={1.2} /></mesh>
  </group>
);
export const Paper: React.FC<{ p: V3; stamp?: number }> = ({ p, stamp = 0 }) => {
  const tex = canvasTexture(`regras-${fontReady()}`, 384, 512, (ctx, w, h) => {
    ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2a1a10"; ctx.textAlign = "center"; ctx.font = `40px ${FONT}`; ctx.fillText("RULES", w / 2, 60);
    ctx.font = `26px ${FONT}`; ctx.fillText("WHAT IS A BICYCLE?", w / 2, 110);
    ctx.fillStyle = "rgba(60,40,20,.35)"; for (let i = 0; i < 9; i++) ctx.fillRect(40, 150 + i * 34, w - 80, 8);
  });
  const st = canvasTexture(`carimbo-bike-${fontReady()}`, 512, 200, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "#d62a1e"; ctx.lineWidth = 12; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#d62a1e"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `64px ${FONT}`; ctx.fillText("NOT A", w / 2, 62); ctx.fillText("BICYCLE", w / 2, 136);
  });
  return (
    <group position={p}>
      <mesh rotation={[-Math.PI / 2, 0, 0.1]}><planeGeometry args={[0.6, 0.8]} /><meshStandardMaterial map={tex} /></mesh>
      {stamp > 0.01 && <mesh position={[0, 0.01, 0.05]} rotation={[-Math.PI / 2, 0, 0.3]} scale={0.6 + (1 - stamp) * 1.4}><planeGeometry args={[0.7, 0.28]} /><meshBasicMaterial map={st} transparent opacity={Math.min(1, stamp * 1.5)} /></mesh>}
    </group>
  );
};
