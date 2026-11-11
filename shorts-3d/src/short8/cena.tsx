import React from "react";
import * as THREE from "three";
import { Box } from "../kit/props";
import { Lights } from "../kit/Stage";
import { canvasTexture, FONT, fontReady } from "../kit/textures";
import { rand } from "../kit/anim";

/** Cenários e objetos do short "Cinzeiro no avião" (canal do Nico). */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture; o?: number }> = ({ c, r = 0.6, m = 0, e, ei = 0, map, o }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} transparent={o !== undefined} opacity={o ?? 1} />
);

// ------------------------------------------------------------------ luzes
export const LIGHT_LAV = <Lights warm="#fff4e2" sky="#e9f1ff" key={2.2} keyPos={[1.5, 5, 4]} />;
export const LIGHT_DIM = <Lights warm="#ffb36b" sky="#4a5878" key={1.3} keyPos={[2, 4, 3]} />;
export const LIGHT_COLD = <Lights warm="#9fb8ff" sky="#3d4a6e" key={1.2} keyPos={[-2, 4, 3]} />;
export const LIGHT_FIRE = <Lights warm="#ff8a3a" sky="#7a3a2a" key={2.4} keyPos={[0, 3, 3]} />;
export const LIGHT_SKY = <Lights warm="#fff1d6" sky="#cfe6ff" key={2.4} keyPos={[-4, 6, 5]} />;
export const LIGHT_DUSK = <Lights warm="#ffb070" sky="#8a7ab8" key={2.0} keyPos={[-5, 3, 4]} />;

// ------------------------------------------------------------------ texturas
const panel = () =>
  canvasTexture("lav-panel", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#ece6da"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(120,100,80,${rand(i) * 0.06})`; ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 4, 4); }
    ctx.strokeStyle = "rgba(90,80,70,.35)"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4);
  });
const floorTex = () =>
  canvasTexture("lav-floor", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#6f7782"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#636a74";
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i + j) % 2) ctx.fillRect(i * 16 + 6, j * 16 + 6, 4, 4);
  });
const rep = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

/** Placa "proibido fumar": cigarro cortado num círculo vermelho. */
export const noSmokeTex = (lit: number) =>
  canvasTexture(`nosmoke-${lit > 0.5 ? 1 : 0}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = lit > 0.5 ? "#fff8e6" : "#e8e2d4"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f1ea"; ctx.fillRect(58, 112, 120, 30);
    ctx.fillStyle = "#e08a3c"; ctx.fillRect(150, 112, 28, 30);
    ctx.fillStyle = "#d8402e"; ctx.fillRect(52, 112, 8, 30);
    ctx.strokeStyle = "#2a1a10"; ctx.lineWidth = 4; ctx.strokeRect(52, 112, 126, 30);
    ctx.strokeStyle = "#d62a1e"; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 96, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 68, h / 2 - 68); ctx.lineTo(w / 2 + 68, h / 2 + 68); ctx.stroke();
  });

/** Texto pintado numa textura (prancheta, carimbo). */
const textTex = (key: string, lines: [string, number, string][], bg: string, w = 512, h = 640) =>
  canvasTexture(`txt-${key}-${fontReady()}`, w, h, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let y = 70;
    for (const [t, size, c] of lines) {
      ctx.fillStyle = c; ctx.font = `${size}px ${FONT}`; ctx.fillText(t, w / 2, y + size / 2); y += size * 1.35;
    }
  });

// ------------------------------------------------------------------ banheiro do avião
/** Medidas: largura 2,2 (x de -1,1 a 1,1), fundo em z=-0,9, sem parede da frente (é onde fica a câmera). */
export const DOOR_X = 1.08;
export const ASHTRAY: V3 = [DOOR_X - 0.04, 1.2, 0.35];
export const BIN: V3 = [-0.5, 0.55, -0.34];

export const Lavatory: React.FC<{ signLit?: number; frame?: number; dark?: number }> = ({ signLit = 1, frame = 0, dark = 0 }) => {
  const pT = rep(panel(), 2, 2), fT = rep(floorTex(), 3, 3);
  const glow = dark > 0.5 ? 0.15 : 0.9;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.3]} receiveShadow><planeGeometry args={[2.3, 2.6]} /><M c="#ffffff" map={fT} r={0.8} /></mesh>
      <mesh position={[0, 1.45, -0.9]} receiveShadow><planeGeometry args={[2.3, 2.9]} /><M c="#ffffff" map={pT} /></mesh>
      <mesh position={[-1.1, 1.45, 0.3]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[2.6, 2.9]} /><M c="#ffffff" map={pT} /></mesh>
      <mesh position={[1.1, 1.45, 0.3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[2.6, 2.9]} /><M c="#ffffff" map={pT} /></mesh>
      {/* teto com luz */}
      <Box s={[2.3, 0.08, 2.6]} p={[0, 2.92, 0.3]} c="#dcd6ca" />
      <Box s={[0.9, 0.03, 0.3]} p={[0, 2.87, -0.2]} c="#fffbe8" e="#fff6d0" ei={glow} shadow={false} />
      {/* bancada com pia e espelho */}
      <Box s={[1.15, 0.95, 0.56]} p={[-0.5, 0.475, -0.62]} c="#c9c2b4" />
      <Box s={[1.2, 0.05, 0.6]} p={[-0.5, 0.97, -0.62]} c="#9aa3ad" r={0.35} />
      <mesh position={[-0.55, 0.97, -0.62]} scale={[1, 0.35, 0.8]}><sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><M c="#e6ebef" r={0.25} m={0.3} /></mesh>
      <Box s={[0.05, 0.22, 0.05]} p={[-0.55, 1.1, -0.85]} c="#b9c2cc" r={0.25} />
      <Box s={[0.05, 0.05, 0.16]} p={[-0.55, 1.2, -0.79]} c="#b9c2cc" r={0.25} />
      <mesh position={[-0.5, 1.75, -0.89]}><planeGeometry args={[1.05, 0.95]} /><M c="#bcd6e6" r={0.15} m={0.2} /></mesh>
      <Box s={[1.12, 1.02, 0.02]} p={[-0.5, 1.75, -0.9]} c="#8f98a3" />
      {/* tampa de metal do lixo, na frente da bancada */}
      <Box s={[0.34, 0.22, 0.02]} p={[BIN[0], BIN[1], BIN[2] + 0.005]} c="#aeb6bf" r={0.3} />
      <Box s={[0.22, 0.04, 0.02]} p={[BIN[0], BIN[1] + 0.05, BIN[2] + 0.02]} c="#6d757e" r={0.3} />
      {/* vaso */}
      <group position={[0.55, 0, -0.45]}>
        <mesh position={[0, 0.22, 0]} scale={[1, 1, 1.25]}><cylinderGeometry args={[0.2, 0.15, 0.44, 24]} /><M c="#f5f6f7" r={0.3} /></mesh>
        <mesh position={[0, 0.46, 0.02]} scale={[1, 0.25, 1.3]}><sphereGeometry args={[0.22, 24, 12]} /><M c="#e9ecef" r={0.3} /></mesh>
        <Box s={[0.44, 0.5, 0.14]} p={[0, 0.62, -0.28]} c="#e9ecef" r={0.3} />
      </group>
      {/* placa de proibido fumar */}
      <mesh position={[-0.5, 2.45, -0.88]}><planeGeometry args={[0.38, 0.38]} /><M c="#ffffff" map={noSmokeTex(signLit)} e="#ffffff" ei={signLit * 0.25} /></mesh>
      {/* porta (parede da direita) */}
      <group position={[DOOR_X, 0, 0.35]}>
        <Box s={[0.03, 2.2, 1.0]} p={[0, 1.15, 0]} c="#d7cfc0" />
        <Box s={[0.04, 0.05, 0.22]} p={[-0.02, 1.0, -0.38]} c="#7e8791" r={0.3} />
        <mesh position={[-0.02, 1.62, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.3, 0.3]} /><M c="#ffffff" map={noSmokeTex(signLit)} e="#ffffff" ei={signLit * 0.25} /></mesh>
      </group>
      <Ashtray p={ASHTRAY} />
      {frame < 0 && null}
    </group>
  );
};

/** Cinzeiro de metal embutido na porta (virado para dentro do banheiro, -x). */
export const Ashtray: React.FC<{ p: V3; open?: number; glow?: number }> = ({ p, open = 0, glow = 0 }) => (
  <group position={p} rotation={[0, -Math.PI / 2, 0]}>
    <Box s={[0.3, 0.2, 0.05]} p={[0, 0, 0]} c="#b7c0c9" r={0.25} />
    <group position={[0, 0.06, 0.03]} rotation={[open * 1.1, 0, 0]}>
      <Box s={[0.26, 0.09, 0.025]} p={[0, -0.045, 0]} c="#9aa4ae" r={0.25} />
    </group>
    <Box s={[0.2, 0.025, 0.02]} p={[0, -0.05, 0.03]} c="#2a2d33" />
    {glow > 0.01 && (
      <mesh position={[0, 0, 0.04]} scale={0.9 + glow * 0.15}>
        <torusGeometry args={[0.24, 0.018, 8, 40]} />
        <meshBasicMaterial color="#ffd23f" transparent opacity={glow} />
      </mesh>
    )}
  </group>
);

/** Cigarro com ponta acesa e fumaça subindo. */
export const Cigarette: React.FC<{ p?: V3; rot?: V3; s?: number; frame: number; lit?: number; smoke?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, frame, lit = 1, smoke = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.014, 0.014, 0.17, 12]} /><M c="#f4f1ea" /></mesh>
    <mesh position={[-0.105, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.0142, 0.0142, 0.05, 12]} /><M c="#e08a3c" /></mesh>
    <mesh position={[0.088, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.0143, 0.0143, 0.012, 12]} /><M c="#ff5a1a" e="#ff5a1a" ei={lit * (1.2 + Math.sin(frame * 0.7) * 0.4)} /></mesh>
    {smoke > 0.01 && <Smoke p={[0.1, 0.02, 0]} frame={frame} k={smoke} />}
  </group>
);

/** Fiapos de fumaça (bolinhas cinza que sobem, crescem e somem). */
export const Smoke: React.FC<{ p?: V3; frame: number; k?: number; n?: number; size?: number; rise?: number; color?: string }> = ({ p = [0, 0, 0], frame, k = 1, n = 7, size = 0.03, rise = 0.5, color = "#d9dde2" }) => (
  <group position={p}>
    {Array.from({ length: n }, (_, i) => {
      const t = (frame / 40 + i / n) % 1;
      const sz = size * (0.5 + t * 2.2) * k;
      return (
        <mesh key={i} position={[Math.sin(t * 6 + i) * 0.04 * (1 + t * 2), t * rise, Math.cos(t * 5 + i) * 0.02]} scale={sz}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={color} transparent opacity={(1 - t) * 0.75 * k} roughness={1} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

/** Mão misteriosa (manga cinza) segurando o cigarro, entra pela lateral. */
export const SneakyHand: React.FC<{ p: V3; rot?: V3; frame: number; children?: React.ReactNode }> = ({ p, rot = [0, 0, 0], children }) => (
  <group position={p} rotation={rot}>
    <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.08, 0.6, 6, 12]} /><M c="#5d6470" r={0.8} /></mesh>
    <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.05, 16]} /><M c="#4b515c" r={0.8} /></mesh>
    <mesh position={[0.04, 0, 0]} scale={[1.1, 0.8, 1]}><sphereGeometry args={[0.075, 16, 12]} /><M c="#e9c3a6" r={0.5} /></mesh>
    {[0, 1].map((i) => <mesh key={i} position={[0.11, 0.02 - i * 0.03, 0.02]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.018, 0.05, 4, 8]} /><M c="#e9c3a6" r={0.5} /></mesh>)}
    <group position={[0.14, 0.0, 0.03]}>{children}</group>
  </group>
);

/** Lixeira (vista de cima, em corte) cheia de papel. `fire` 0..1 faz o fogo crescer. */
export const TrashBin: React.FC<{ p?: V3; frame: number; papers?: number; fire?: number }> = ({ p = [0, 0, 0], frame, papers = 1, fire = 0 }) => (
  <group position={p}>
    <Box s={[0.9, 0.06, 0.6]} p={[0, -0.03, 0]} c="#8b939c" r={0.3} />
    <Box s={[0.9, 0.6, 0.04]} p={[0, 0.3, -0.3]} c="#a7afb8" r={0.3} />
    <Box s={[0.04, 0.6, 0.6]} p={[-0.45, 0.3, 0]} c="#9aa2ab" r={0.3} />
    <Box s={[0.04, 0.6, 0.6]} p={[0.45, 0.3, 0]} c="#9aa2ab" r={0.3} />
    <Box s={[0.9, 0.3, 0.04]} p={[0, 0.15, 0.3]} c="#b7bfc8" r={0.3} />
    {Array.from({ length: 22 }, (_, i) => {
      const sc = Math.max(0.0001, Math.min(1, papers * 22 - i));
      const burnt = fire > 0.2 + rand(i) * 0.5;
      return (
        <mesh key={i} position={[(rand(i) - 0.5) * 0.75, 0.08 + rand(i + 5) * 0.28, (rand(i + 9) - 0.5) * 0.45]} rotation={[rand(i + 1) * 3, rand(i + 2) * 3, 0]} scale={0.085 * sc * (0.8 + rand(i + 3) * 0.5)}>
          <icosahedronGeometry args={[1, 0]} />
          <M c={burnt ? "#3a2c26" : i % 5 === 0 ? "#dfe8f0" : "#f6f4ee"} r={0.9} />
        </mesh>
      );
    })}
    {fire > 0.01 && <Fire p={[0, 0.3, 0]} frame={frame} k={fire} />}
  </group>
);

/** Labaredas: cones laranja/amarelos tremendo. */
export const Fire: React.FC<{ p?: V3; frame: number; k?: number; w?: number }> = ({ p = [0, 0, 0], frame, k = 1, w = 0.7 }) => (
  <group position={p}>
    {Array.from({ length: 9 }, (_, i) => {
      const fl = 0.75 + Math.sin(frame * 0.9 + i * 2.1) * 0.25;
      const h = (0.25 + rand(i) * 0.3) * k * fl;
      return (
        <group key={i} position={[(rand(i + 4) - 0.5) * w * Math.min(1, k * 1.5), h / 2, (rand(i + 7) - 0.5) * 0.3]}>
          <mesh scale={[1, 1, 1]}><coneGeometry args={[0.07 * k + 0.02, h, 10]} /><meshBasicMaterial color={i % 3 === 0 ? "#ffd23f" : "#ff7a1a"} /></mesh>
          <mesh position={[0, -h * 0.15, 0]}><coneGeometry args={[0.035 * k + 0.01, h * 0.6, 8]} /><meshBasicMaterial color="#fff2a8" /></mesh>
        </group>
      );
    })}
    <pointLight color="#ff8a3a" intensity={3 * k} distance={3} />
  </group>
);

/** Prancheta com a regra. */
export const Clipboard: React.FC<{ p?: V3; rot?: V3; s?: number; en?: boolean }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, en = false }) => {
  const tex = en
    ? textTex("rule-en", [["SAFETY", 64, "#2a1a10"], ["RULE", 64, "#2a1a10"], ["", 30, "#000"], ["LAVATORY", 54, "#c0392b"], ["ASHTRAY:", 54, "#c0392b"], ["REQUIRED ✔", 56, "#1e8a4a"]], "#fffaf0")
    : textTex("regra", [["REGRA DE", 64, "#2a1a10"], ["SEGURANÇA", 64, "#2a1a10"], ["", 30, "#000"], ["CINZEIRO NO", 54, "#c0392b"], ["BANHEIRO:", 54, "#c0392b"], ["OBRIGATÓRIO ✔", 56, "#1e8a4a"]], "#fffaf0");
  return (
    <group position={p} rotation={rot} scale={s}>
      <Box s={[0.42, 0.54, 0.02]} c="#a8683a" />
      <mesh position={[0, -0.01, 0.012]}><planeGeometry args={[0.36, 0.45]} /><meshStandardMaterial map={tex} roughness={0.7} /></mesh>
      <Box s={[0.16, 0.05, 0.03]} p={[0, 0.25, 0.015]} c="#8d949c" r={0.3} />
    </group>
  );
};

// ------------------------------------------------------------------ avião por fora
/** Avião genérico (sem marca nenhuma): fuselagem ao longo de x, nariz em +x. */
export const Plane: React.FC<{ p?: V3; rot?: V3; s?: number; frame: number; smoke?: number; fireWin?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, frame, smoke = 0, fireWin = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.32, 3.2, 12, 28]} /><M c="#f4f5f7" r={0.4} /></mesh>
    <Box s={[3.6, 0.07, 0.02]} p={[0, -0.02, 0.32]} c="#7d8a99" shadow={false} />
    {/* janelas */}
    {Array.from({ length: 16 }, (_, i) => (
      <mesh key={i} position={[-1.5 + i * 0.19, 0.1, 0.305]} scale={[1, 1.3, 0.4]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <M c={i < 3 && fireWin > 0.05 ? "#ff8a3a" : "#2b3a4c"} e={i < 3 ? "#ff6a1a" : "#000"} ei={i < 3 ? fireWin * 1.5 : 0} />
      </mesh>
    ))}
    {/* cabine */}
    <mesh position={[1.85, 0.16, 0.18]} rotation={[0, 0.5, 0]} scale={[1, 0.5, 0.4]}><sphereGeometry args={[0.1, 12, 8]} /><M c="#2b3a4c" /></mesh>
    {/* asas */}
    {[-1, 1].map((sd) => (
      <group key={sd} position={[0.1, -0.12, sd * 0.3]} rotation={[0, sd * 0.45, 0]}>
        <Box s={[0.7, 0.06, 2.0]} p={[0, 0, sd * 1.0]} c="#e4e7eb" />
        <mesh position={[0.25, -0.18, sd * 0.8]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.11, 0.55, 18]} /><M c="#c7ccd3" r={0.4} /></mesh>
      </group>
    ))}
    {/* cauda */}
    <group position={[-1.75, 0.3, 0]} rotation={[0, 0, 0.5]}><Box s={[0.6, 0.85, 0.06]} p={[0, 0.3, 0]} c="#e4e7eb" /></group>
    {[-1, 1].map((sd) => <Box key={sd} s={[0.4, 0.04, 0.7]} p={[-1.85, 0.05, sd * 0.4]} rot={[0, sd * 0.4, 0]} c="#e4e7eb" />)}
    {smoke > 0.01 && (
      <group position={[-1.6, 0.25, 0]}>
        {Array.from({ length: 14 }, (_, i) => {
          const t = (frame / 30 + i / 14) % 1;
          return (
            <mesh key={i} position={[-t * 3.2, t * 0.4 + Math.sin(i) * 0.05, Math.sin(i * 1.7) * 0.15]} scale={(0.1 + t * 0.45) * smoke}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#4a4d55" transparent opacity={(1 - t) * 0.85} roughness={1} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
    )}
  </group>
);

/** Nuvens chapadas (cachos de esferas). */
export const Clouds: React.FC<{ frame: number; speed?: number; y?: number; color?: string; spread?: number }> = ({ frame, speed = 0.03, y = -1.5, color = "#ffffff", spread = 30 }) => (
  <group>
    {Array.from({ length: 16 }, (_, i) => {
      const x = (((rand(i) * spread - frame * speed * (0.6 + rand(i + 3) * 0.6)) % spread) + spread) % spread - spread / 2;
      const z = -8 + rand(i + 1) * 10;
      const yy = y + (rand(i + 2) - 0.5) * 1.6;
      const sc = 0.6 + rand(i + 4) * 0.9;
      return (
        <group key={i} position={[x, yy, z]} scale={sc}>
          {[[0, 0, 0, 0.7], [0.6, -0.1, 0.1, 0.5], [-0.6, -0.1, 0, 0.55], [0.25, 0.35, 0, 0.5]].map(([a, b, c, r], j) => (
            <mesh key={j} position={[a, b, c]}><sphereGeometry args={[r, 16, 12]} /><M c={color} r={1} /></mesh>
          ))}
        </group>
      );
    })}
  </group>
);

/** Brilhinhos (estrelinhas) em volta de algo. */
export const Sparkles: React.FC<{ p?: V3; frame: number; r?: number; n?: number; c?: string }> = ({ p = [0, 0, 0], frame, r = 1, n = 10, c = "#fff2a8" }) => (
  <group position={p}>
    {Array.from({ length: n }, (_, i) => {
      const t = (frame * 0.03 + i / n) % 1;
      return (
        <mesh key={i} position={[Math.cos(i * 2.4) * r, (t - 0.5) * r * 1.4, Math.sin(i * 2.4) * r * 0.4]} scale={Math.sin(t * Math.PI) * 0.06 * r} rotation={[0, 0, frame * 0.1]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={c} />
        </mesh>
      );
    })}
  </group>
);
