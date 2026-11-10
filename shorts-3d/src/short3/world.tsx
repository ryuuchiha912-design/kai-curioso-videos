import React from "react";
import * as THREE from "three";
import { canvasTexture } from "../kit/textures";
import { Lights } from "../kit/Stage";
import { rand } from "../kit/anim";

/** Cenários e objetos do short da capivara: beira do rio, céu, doces, passarinho. */

type V3 = [number, number, number];
export type TOD = "morning" | "noon" | "afternoon" | "night" | "dawn";

const rep = new Map<string, THREE.Texture>();
const repeat = (t: THREE.Texture, rx: number, ry: number) => {
  const k = `${t.uuid}-${rx}-${ry}`;
  if (rep.has(k)) return rep.get(k)!;
  const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true;
  rep.set(k, c); return c;
};

const gradient = (stops: string[]) =>
  canvasTexture(`grad-${stops.join("-")}`, 8, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });

const grassTex = () =>
  canvasTexture("capy-grass", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#7cc25a"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      ctx.strokeStyle = rand(i) > 0.5 ? "rgba(60,120,40,0.35)" : "rgba(190,240,140,0.3)";
      ctx.lineWidth = 2; const x = rand(i + 3) * w, y = rand(i + 7) * h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand(i + 11) - 0.5) * 4, y - 6 - rand(i + 13) * 6); ctx.stroke();
    }
  });

const waterTex = () =>
  canvasTexture("capy-water", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#4fb3d9"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + rand(i) * 0.35})`;
      ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 10 + rand(i + 3) * 30, 2.5);
    }
  });

const checkerTex = () =>
  canvasTexture("capy-towel", 256, 256, (ctx, w, h) => {
    const n = 8;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#e8413a" : "#fff4e6"; ctx.fillRect((i * w) / n, (j * h) / n, w / n + 1, h / n + 1);
    }
    ctx.fillStyle = "rgba(232,65,58,0.35)";
    for (let i = 0; i < n; i++) { ctx.fillRect((i * w) / n, 0, w / n / 2, h); }
  });

// ------------------------------------------------------------------ luz por hora do dia
export const SKY: Record<TOD, string[]> = {
  morning: ["#8fd3ff", "#cdeeff", "#fff1c9"],
  noon: ["#5fb8f5", "#a6dcff", "#e9f7ff"],
  afternoon: ["#ffb36b", "#ffd29a", "#ffe9c4"],
  night: ["#141a45", "#2c3577", "#5d4f8f"],
  dawn: ["#7f8fe0", "#ff9ec4", "#ffc58a"],
};
export const BG: Record<TOD, string> = { morning: "#cdeeff", noon: "#a6dcff", afternoon: "#ffd29a", night: "#2c3577", dawn: "#ffb0a8" };

export const LIGHTS: Record<TOD, React.ReactNode> = {
  morning: <Lights warm="#fff0c8" sky="#bfe6ff" key={2.3} keyPos={[4, 5, 5]} />,
  noon: <Lights warm="#fff8e8" sky="#cfe9ff" key={2.6} keyPos={[1, 8, 4]} />,
  afternoon: <Lights warm="#ffb070" sky="#ffc7a0" key={2.4} keyPos={[-5, 3, 4]} />,
  night: (
    <>
      <Lights warm="#b9c6ff" sky="#4a5aa8" key={1.1} keyPos={[-3, 6, 2]} />
      <pointLight position={[0.9, 0.6, 1.0]} intensity={4} distance={5} decay={1.4} color="#ffb860" />
    </>
  ),
  dawn: <Lights warm="#ffc09a" sky="#ffb0d0" key={2.3} keyPos={[5, 3, 4]} />,
};

// ------------------------------------------------------------------ peças do cenário
export const Tree: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#4caf50" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.1, 0.14, 1.2, 10]} /><meshStandardMaterial color="#7a4f2a" roughness={0.9} /></mesh>
    {[[0, 1.5, 0, 0.7], [-0.4, 1.25, 0.1, 0.5], [0.42, 1.3, -0.05, 0.52], [0.05, 1.95, 0, 0.45]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 20, 16]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>
    ))}
  </group>
);

export const Cloud: React.FC<{ p: V3; s?: number; tint?: string }> = ({ p, s = 1, tint = "#ffffff" }) => (
  <group position={p} scale={s}>
    {[[0, 0, 0, 0.6], [0.6, -0.1, 0, 0.45], [-0.6, -0.1, 0.05, 0.48], [0.25, 0.3, -0.1, 0.45], [-0.3, 0.25, 0, 0.4]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 20, 16]} /><meshStandardMaterial color={tint} roughness={1} emissive={tint} emissiveIntensity={0.25} /></mesh>
    ))}
  </group>
);

const Stone: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <mesh position={p} scale={[s, s * 0.55, s * 0.8]} castShadow receiveShadow><sphereGeometry args={[0.25, 14, 10]} /><meshStandardMaterial color="#a39a8f" roughness={0.9} /></mesh>
);

const Flowerbed: React.FC<{ p: V3; c: string }> = ({ p, c }) => (
  <group position={p}>
    <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.008, 0.008, 0.16, 5]} /><meshStandardMaterial color="#3e8f3a" /></mesh>
    <mesh position={[0, 0.17, 0]}><sphereGeometry args={[0.04, 10, 8]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
  </group>
);

export const Riverbank = {
  back: ({ tod, frame = 0 }: { tod: TOD; frame?: number }) => {
    const w = waterTex();
    const wt = repeat(w, 10, 2);
    wt.offset.set(frame * 0.0025, 0);
    return (
      <group>
        <mesh position={[0, 8, -26]}><planeGeometry args={[140, 34]} /><meshBasicMaterial map={gradient(SKY[tod])} /></mesh>
        {tod === "night" && (
          <>
            <mesh position={[6, 9, -25]}><circleGeometry args={[1.4, 40]} /><meshBasicMaterial color="#fff6d8" /></mesh>
            {Array.from({ length: 50 }).map((_, i) => (
              <mesh key={i} position={[(rand(i) - 0.5) * 60, 4 + rand(i + 9) * 14, -25.5]}><circleGeometry args={[0.06 + rand(i + 4) * 0.05, 6]} /><meshBasicMaterial color="#fffbe6" /></mesh>
            ))}
          </>
        )}
        {(tod === "morning" || tod === "dawn") && <mesh position={[-7, 5, -25]}><circleGeometry args={[1.8, 40]} /><meshBasicMaterial color="#fff2b0" /></mesh>}
        {/* morros */}
        {[-14, -5, 5, 14].map((x, i) => (
          <mesh key={i} position={[x, -2, -20]} scale={[1.6, 1, 1]}><sphereGeometry args={[6 + rand(i) * 2, 24, 16]} /><meshStandardMaterial color={tod === "night" ? "#2f4d4a" : "#6fae5c"} roughness={1} /></mesh>
        ))}
        {/* margem de lá */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -13]}><planeGeometry args={[120, 8]} /><meshStandardMaterial map={repeat(grassTex(), 30, 2)} roughness={1} /></mesh>
        {Array.from({ length: 14 }).map((_, i) => <Tree key={i} p={[-24 + i * 3.7 + rand(i) * 1.5, 0, -11 - rand(i + 5) * 3]} s={1.3 + rand(i + 2) * 0.6} c={i % 3 ? "#4caf50" : "#3d9a47"} />)}
        {/* rio */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -6]} receiveShadow>
          <planeGeometry args={[120, 7]} />
          <meshStandardMaterial map={wt} roughness={0.15} metalness={0.1} emissive={tod === "night" ? "#1a2a66" : "#2a90c0"} emissiveIntensity={0.25} />
        </mesh>
        {/* árvore grande do lado de cá */}
        <Tree p={[-2.6, 0, -2.2]} s={1.5} />
        <Tree p={[3.2, 0, -2.6]} s={1.2} c="#5cbf5a" />
      </group>
    );
  },
  front: ({ tod, frame = 0, towel = true, lantern }: { tod: TOD; frame?: number; towel?: boolean; lantern?: boolean }) => (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[40, 9]} />
        <meshStandardMaterial map={repeat(grassTex(), 14, 3)} roughness={1} />
      </mesh>
      {/* barranco até a água */}
      <mesh rotation={[-Math.PI / 2 - 0.25, 0, 0]} position={[0, -0.1, -2.6]} receiveShadow><planeGeometry args={[40, 0.8]} /><meshStandardMaterial color="#9c7a52" roughness={1} /></mesh>
      {towel && (
        <mesh rotation={[-Math.PI / 2, 0, 0.12]} position={[0.1, 0.006, 0.25]} receiveShadow>
          <planeGeometry args={[1.9, 1.5]} />
          <meshStandardMaterial map={checkerTex()} roughness={0.9} />
        </mesh>
      )}
      <Stone p={[-1.3, 0.04, -1.4]} s={1.2} />
      <Stone p={[-0.9, 0.03, -1.7]} s={0.7} />
      <Stone p={[1.7, 0.04, -1.2]} s={1} />
      {Array.from({ length: 16 }).map((_, i) => (
        <Flowerbed key={i} p={[(rand(i + 30) - 0.5) * 7, 0, -0.9 + rand(i + 40) * 3.5]} c={["#ff8a2a", "#ffd23f", "#ff6fa8", "#ffffff"][i % 4]} />
      ))}
      {lantern && (
        <group position={[0.95, 0, 0.75]}>
          <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.07, 0.08, 0.2, 12]} /><meshStandardMaterial color="#ffe1a0" emissive="#ffb347" emissiveIntensity={1.6} transparent opacity={0.9} /></mesh>
          <mesh position={[0, 0.25, 0]}><coneGeometry args={[0.09, 0.07, 12]} /><meshStandardMaterial color="#3a2a24" /></mesh>
        </group>
      )}
      {tod === "night" && Array.from({ length: 14 }).map((_, i) => {
        const t = frame * 0.03 + i;
        return (
          <mesh key={i} position={[(rand(i) - 0.5) * 5 + Math.sin(t) * 0.3, 0.4 + rand(i + 3) * 1.4 + Math.sin(t * 1.3) * 0.15, -1.5 + rand(i + 6) * 2.5]}>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshBasicMaterial color={Math.sin(t * 3) > -0.3 ? "#fff59a" : "#8c8a4a"} />
          </mesh>
        );
      })}
    </group>
  ),
};

/** Lá embaixo, visto do céu: chão, rio, árvores. `y` é a altura do chão. */
export const Landscape: React.FC<{ y: number; tod: TOD; frame?: number }> = ({ y, tod, frame = 0 }) => (
  <group position={[0, y, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[300, 300]} /><meshStandardMaterial map={repeat(grassTex(), 60, 60)} roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0, 0.05, 0]}><planeGeometry args={[300, 9]} /><meshStandardMaterial map={repeat(waterTex(), 40, 1)} emissive="#2a90c0" emissiveIntensity={0.3} roughness={0.2} /></mesh>
    {Array.from({ length: 70 }).map((_, i) => {
      const x = (rand(i) - 0.5) * 120, z = (rand(i + 70) - 0.5) * 120;
      if (Math.abs(z * Math.cos(0.35) + x * Math.sin(0.35)) < 7) return null;
      return <Tree key={i} p={[x, 0, z]} s={2.2 + rand(i + 3)} c={i % 3 ? "#4caf50" : "#3d9a47"} />;
    })}
    {tod === "night" && frame < 0 && null}
  </group>
);

export const SkyBack: React.FC<{ tod: TOD; frame: number; drift?: number }> = ({ tod, frame, drift = 0.01 }) => (
  <group>
    <mesh position={[0, 0, -60]}><planeGeometry args={[400, 220]} /><meshBasicMaterial map={gradient(SKY[tod])} /></mesh>
    {(tod === "dawn" || tod === "morning") && <mesh position={[14, -2, -58]}><circleGeometry args={[4, 40]} /><meshBasicMaterial color="#fff2b0" /></mesh>}
    {Array.from({ length: 16 }).map((_, i) => (
      <Cloud key={i} p={[((rand(i) - 0.5) * 70 + frame * drift * (1 + rand(i + 1))) % 70, (rand(i + 2) - 0.5) * 30, -20 - rand(i + 3) * 25]} s={2 + rand(i + 4) * 3} tint={tod === "dawn" ? "#ffe3ec" : "#ffffff"} />
    ))}
  </group>
);

// ------------------------------------------------------------------ doces
const sprinkleTex = () =>
  canvasTexture("brig", 128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#4a2614"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { ctx.fillStyle = rand(i) > 0.5 ? "#2a140a" : "#6b3a1f"; ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 6, 2.5); }
  });

export const Brigadeiro: React.FC<{ p?: V3; s?: number; cup?: boolean }> = ({ p = [0, 0, 0], s = 1, cup = true }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.06, 0]} castShadow><sphereGeometry args={[0.06, 20, 16]} /><meshStandardMaterial map={sprinkleTex()} roughness={0.8} /></mesh>
    {cup && <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.065, 0.045, 0.05, 16, 1, true]} /><meshStandardMaterial color="#c9a14a" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} /></mesh>}
  </group>
);

const swirlTex = (a: string, b: string) =>
  canvasTexture(`swirl-${a}-${b}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = b; ctx.lineWidth = 16; ctx.beginPath();
    for (let t = 0; t < 30; t += 0.05) { const r = t * 4.2; ctx.lineTo(w / 2 + Math.cos(t) * r, h / 2 + Math.sin(t) * r); }
    ctx.stroke();
  });

export const Lollipop: React.FC<{ p?: V3; rot?: V3; s?: number; a?: string; b?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, a = "#ff4f8b", b = "#fff3f8" }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.008, 0.008, 0.24, 6]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
      <meshStandardMaterial attach="material-0" color={a} roughness={0.3} />
      <meshStandardMaterial attach="material-1" map={swirlTex(a, b)} roughness={0.25} />
      <meshStandardMaterial attach="material-2" map={swirlTex(a, b)} roughness={0.25} />
    </mesh>
  </group>
);

const waffleTex = () =>
  canvasTexture("waffle", 128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#e0a85a"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#a8702c"; ctx.lineWidth = 4;
    for (let i = -h; i < w + h; i += 22) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + h, 0); ctx.stroke(); }
  });

export const IceCream: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#ffb3c7" }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.07, 0.2, 18]} /><meshStandardMaterial map={waffleTex()} roughness={0.8} /></mesh>
    <mesh position={[0, 0.23, 0]} castShadow><sphereGeometry args={[0.08, 20, 16]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
    <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.022, 10, 8]} /><meshStandardMaterial color="#d81e3a" roughness={0.3} /></mesh>
  </group>
);

export const Bonbon: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#e8b83a" }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh castShadow><sphereGeometry args={[0.055, 18, 14]} /><meshStandardMaterial color={c} metalness={0.75} roughness={0.28} /></mesh>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[sd * 0.07, 0, 0]} rotation={[0, 0, (sd * Math.PI) / 2]}><coneGeometry args={[0.035, 0.05, 8]} /><meshStandardMaterial color={c} metalness={0.75} roughness={0.3} /></mesh>
    ))}
  </group>
);

export const Plate: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <mesh position={p} scale={s} receiveShadow castShadow><cylinderGeometry args={[0.32, 0.26, 0.03, 32]} /><meshStandardMaterial color="#ffffff" roughness={0.3} /></mesh>
);

export const Cake: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <group position={p} scale={s}>
    <Plate p={[0, 0.015, 0]} s={1.25} />
    {[0, 1].map((i) => (
      <mesh key={i} position={[0, 0.12 + i * 0.2, 0]} castShadow><cylinderGeometry args={[0.3 - i * 0.07, 0.3 - i * 0.07, 0.18, 32]} /><meshStandardMaterial color="#5a2e18" roughness={0.6} /></mesh>
    ))}
    {[0, 1].map((i) => (
      <mesh key={i} position={[0, 0.21 + i * 0.2, 0]}><torusGeometry args={[0.3 - i * 0.07, 0.025, 8, 32]} /><meshStandardMaterial color="#fff2e2" roughness={0.4} /></mesh>
    ))}
    <mesh position={[0, 0.52, 0]} castShadow><sphereGeometry args={[0.06, 16, 12]} /><meshStandardMaterial color="#d81e3a" roughness={0.25} /></mesh>
  </group>
);

const melonTex = () =>
  canvasTexture("melon", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#ff4f5e"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2a1410";
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(w * (0.2 + rand(i) * 0.6), h * (0.25 + rand(i + 5) * 0.4), 5, 9, rand(i + 2), 0, Math.PI * 2); ctx.fill(); }
  });

/** Fatia de melancia em pé, formato "D" deitado: casca verde embaixo. */
export const Watermelon: React.FC<{ p?: V3; rot?: V3; s?: number; bite?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <group rotation={[0, 0, Math.PI]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 32, 1, true, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#2f9a3e" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[0, 0, sd * 0.05]} rotation={[0, sd < 0 ? Math.PI : 0, 0]}>
          <circleGeometry args={[0.3, 32, 0, Math.PI]} />
          <meshStandardMaterial map={melonTex()} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
    <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.6, 0.1]} /><meshStandardMaterial color="#ff6a74" roughness={0.5} /></mesh>
  </group>
);

// ------------------------------------------------------------------ passarinho
export const Bird: React.FC<{ frame: number; p?: V3; rotY?: number; s?: number; peck?: number; flap?: number; look?: number }> = ({ frame, p = [0, 0, 0], rotY = 0, s = 1, peck = 0, flap = 1, look = 0 }) => {
  const w = Math.sin(frame * 0.9) * 0.9 * flap;
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={s}>
      <group rotation={[peck * 0.9, look, 0]}>
        <mesh castShadow><sphereGeometry args={[0.12, 20, 16]} /><meshStandardMaterial color="#3d8bff" roughness={0.5} /></mesh>
        <mesh position={[0, -0.03, 0.05]} scale={[0.8, 0.8, 0.7]}><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color="#cfe6ff" roughness={0.6} /></mesh>
        <mesh position={[0, 0.0, 0.14]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.03, 0.07, 10]} /><meshStandardMaterial color="#ffc93c" roughness={0.4} /></mesh>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh position={[sd * 0.055, 0.04, 0.09]}><sphereGeometry args={[0.025, 10, 8]} /><meshStandardMaterial color="#120a06" roughness={0.2} /></mesh>
            <mesh position={[sd * 0.06, 0.05, 0.11]}><sphereGeometry args={[0.008, 6, 6]} /><meshBasicMaterial color="#ffffff" /></mesh>
            <group position={[sd * 0.11, 0.02, -0.01]} rotation={[0, 0, sd * (0.3 + w)]}>
              <mesh position={[sd * 0.06, 0, 0]} scale={[1, 0.25, 0.7]}><sphereGeometry args={[0.07, 12, 8]} /><meshStandardMaterial color="#2a6fd6" roughness={0.5} /></mesh>
            </group>
          </group>
        ))}
        <mesh position={[0, 0.03, -0.13]} rotation={[-0.7, 0, 0]} scale={[1, 0.3, 1]}><coneGeometry args={[0.05, 0.1, 8]} /><meshStandardMaterial color="#2a6fd6" /></mesh>
      </group>
    </group>
  );
};

/** Estrelinhas de impacto ("plim"). */
export const Sparkle: React.FC<{ p: V3; t: number; c?: string }> = ({ p, t, c = "#fff59a" }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <group position={p}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2, r = 0.05 + t * 0.35;
        return <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} scale={1 - t}><sphereGeometry args={[0.03, 8, 6]} /><meshBasicMaterial color={c} /></mesh>;
      })}
    </group>
  );
};
