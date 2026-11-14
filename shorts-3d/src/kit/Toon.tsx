import React from "react";
import * as THREE from "three";
import { canvasTexture } from "./textures";
import type { Pose } from "./Character";

/**
 * "Toon": cabeçudo de pernas finas (proporção do short Dobra).
 * Cabeça redonda grande (~36% da altura), rosto simples de olhos de bolinha,
 * moletom arredondado, pernas e braços finos. Tudo em formas simples.
 */
export type ToonExpr = "neutral" | "smile" | "happy" | "surprised" | "worried" | "smug" | "sad";
export type ToonFace = { expr: ToonExpr; blink?: number; look?: [number, number]; mouthOpen?: number; blush?: boolean; sweat?: boolean; eyes?: "dot" | "big"; iris?: string; lid?: number };
export type ToonKind = "kai" | "bia" | "ren" | "nico" | "general" | "extra";

const INK = "#1d1512";
const q = (v: number, s = 6) => Math.round(v * s) / s;

/** Textura do rosto: olhos ovais pretos com brilho, sobrancelha fina, boca pequena. */
export function toonFaceTexture(st: ToonFace) {
  const look = st.look ?? [0, 0];
  const key = ["toon", st.expr, q(st.blink ?? 0, 4), q(look[0]), q(look[1]), q(st.mouthOpen ?? -1, 5), st.blush, st.sweat, st.eyes ?? "dot", st.iris ?? "", q(st.lid ?? 0, 10)].join("|");
  return canvasTexture(key, 512, 512, (ctx, S) => {
    ctx.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S * 0.5, dx = S * 0.15;
    const e = st.expr, blink = st.blink ?? 0;
    if (st.blush || e === "happy") {
      ctx.fillStyle = "rgba(255,120,120,0.42)";
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * dx * 1.55, cy + 58, 30, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    for (const side of [-1, 1] as const) {
      const x = cx + side * dx, y = cy;
      const big = e === "surprised";
      const w = big ? 34 : 29, h = big ? 50 : 42;
      if (st.eyes === "big" && e !== "happy" && blink < 0.9) {
        // olho de desenho: branco grande com contorno, pupila pequena e pálpebra que dá a "atitude"
        const W2 = big ? 60 : 54, H2 = big ? 68 : 60;
        const ex = cx + side * S * 0.128;
        const base: Record<ToonExpr, number> = { neutral: 0.22, smile: 0.2, happy: 0, surprised: 0, worried: 0.2, smug: 0.52, sad: 0.36 };
        const L = Math.min(0.9, Math.max(base[e] + (st.lid ?? 0) * (e === "surprised" ? 0.3 : 1), blink));
        const tiltL = e === "worried" || e === "sad" ? -0.32 * side : e === "smug" ? 0.06 * side : 0;
        const lidY = y - H2 + 2 * H2 * L;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(ex, y, W2, H2, 0, 0, Math.PI * 2); ctx.clip();
        ctx.save(); ctx.translate(ex, lidY); ctx.rotate(tiltL);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(-W2 * 2, 0, W2 * 4, H2 * 3);
        ctx.restore();
        const pr = big ? 11 : 15;
        const px = ex + look[0] * W2 * 0.55, py = Math.max(lidY + pr * 0.6, y + 4 + look[1] * H2 * 0.45);
        if (st.iris) {
          // íris colorida (cinza, vermelha...) com anel escuro e pupila
          const ir = big ? 26 : 30;
          ctx.fillStyle = st.iris; ctx.beginPath(); ctx.arc(px, py, ir, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px, py + 2, ir * 0.42, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - ir * 0.38, py - ir * 0.38, ir * 0.22, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.35, pr * 0.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(ex, y, W2, H2, 0, 0, Math.PI * 2); ctx.stroke();
        if (L > 0.05) {
          ctx.save(); ctx.beginPath(); ctx.ellipse(ex, y, W2 + 4, H2 + 4, 0, 0, Math.PI * 2); ctx.clip();
          ctx.translate(ex, lidY); ctx.rotate(tiltL); ctx.lineWidth = 9; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(-W2 * 1.2, 0); ctx.lineTo(W2 * 1.2, 0); ctx.stroke(); ctx.restore();
        }
      } else if (blink > 0.7 || e === "happy") {
        ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath();
        if (e === "happy") ctx.arc(x, y + 10, w, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(x - w, y + 2); ctx.quadraticCurveTo(x, y + 10, x + w, y + 2); }
        ctx.stroke();
      } else {
        const hh = h * (1 - blink * 0.8);
        const px = x + look[0] * 6, py = y + look[1] * 6;
        ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(px, py, w, hh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(px - w * 0.28, py - hh * 0.38, w * 0.32, hh * 0.26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + w * 0.3, py + hh * 0.35, w * 0.13, 0, Math.PI * 2); ctx.fill();
        if (e === "smug") { ctx.fillStyle = "#f7dcc6"; ctx.fillRect(x - w - 4, y - h - 6, w * 2 + 8, h * 0.95); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - w - 2, y - h * 0.08); ctx.lineTo(x + w + 2, y - h * 0.08); ctx.stroke(); }
      }
      // sobrancelha
      let tilt = 0, lift = 0;
      if (e === "worried" || e === "sad") { tilt = 0.35; lift = 4; }
      if (e === "surprised") lift = -14;
      if (e === "smug") { tilt = side < 0 ? -0.25 : 0.1; lift = 6; }
      if (e === "happy" || e === "smile") lift = -6;
      ctx.save(); ctx.translate(st.eyes === "big" ? cx + side * S * 0.128 : x, y - (st.eyes === "big" ? 92 : 74) + lift); ctx.rotate(tilt * side);
      ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-26, 3); ctx.quadraticCurveTo(0, -8, 26, 3); ctx.stroke(); ctx.restore();
    }
    // boca
    const my = cy + 96; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.lineCap = "round";
    const open = st.mouthOpen;
    if (open !== undefined && open > 0.05) {
      ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(cx, my + 4, 16 + 6 * open, 6 + 18 * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (e === "surprised") { ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(cx, my + 6, 13, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else if (e === "happy") { ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.moveTo(cx - 28, my - 4); ctx.quadraticCurveTo(cx, my + 34, cx + 28, my - 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (e === "smile") { ctx.beginPath(); ctx.moveTo(cx - 20, my); ctx.quadraticCurveTo(cx, my + 16, cx + 20, my); ctx.stroke(); }
    else if (e === "smug") { ctx.beginPath(); ctx.moveTo(cx - 16, my + 4); ctx.quadraticCurveTo(cx + 4, my + 10, cx + 22, my - 4); ctx.stroke(); }
    else if (e === "worried" || e === "sad") { ctx.beginPath(); ctx.moveTo(cx - 18, my + 10); ctx.quadraticCurveTo(cx, my - 4, cx + 18, my + 10); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(cx - 12, my + 4); ctx.lineTo(cx + 12, my + 4); ctx.stroke(); }
    if (st.sweat) {
      const tx = cx + dx * 2.3, ty = cy - 70;
      ctx.fillStyle = "#9fe0ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 20, ty + 38, tx, ty + 48); ctx.quadraticCurveTo(tx - 20, ty + 38, tx, ty); ctx.fill(); ctx.stroke();
    }
  });
}

export type ToonLook = { skin: string; hoodie: string; hoodie2: string; pants: string; shoe: string; sole: string; hair: string };
/** Visual de figurante (kind "extra"): cabelo, bigode, óculos, gravata, boné de ciclista. */
export type ToonStyle = { hair?: "short" | "bald" | "cap" | "bun" | "curly"; cap?: string; mustache?: boolean; glasses?: boolean; tie?: string };
const LOOK: Record<ToonKind, ToonLook> = {
  kai: { skin: "#f7dcc6", hoodie: "#24356a", hoodie2: "#1a2650", pants: "#262a36", shoe: "#2b2b33", sole: "#f07a1a", hair: "#16161c" },
  bia: { skin: "#f1c7a0", hoodie: "#2fa59a", hoodie2: "#23857c", pants: "#3a3f6b", shoe: "#f4f1ea", sole: "#e04b3c", hair: "#4a2a1a" },
  ren: { skin: "#f6e2d4", hoodie: "#1b1b21", hoodie2: "#232329", pants: "#2a2d38", shoe: "#1c1c22", sole: "#ececf0", hair: "#121216" },
  extra: { skin: "#f1c7a0", hoodie: "#555b66", hoodie2: "#4a4f58", pants: "#2e3440", shoe: "#2b2b2b", sole: "#1b1b1f", hair: "#2a211c" },
  general: { skin: "#f1c7a0", hoodie: "#5d6b3a", hoodie2: "#4e5a30", pants: "#4a5530", shoe: "#4a3020", sole: "#2a1a10", hair: "#3a2a1e" },
  nico: { skin: "#f8e4d6", hoodie: "#f1f1f4", hoodie2: "#dedee6", pants: "#2b2e3a", shoe: "#f4f4f6", sole: "#16161a", hair: "#141418" },
};
const mat = (c: string, r = 0.6) => <meshStandardMaterial color={c} roughness={r} />;

const HEAD_R = 0.36, HEAD_Y = 1.64, SHOULDER_Y = 1.22, HIP_Y = 0.72;

/** Perfil de gota (topo redondo em y=0, ponta em y=-1), girado em torno do eixo y. */
const DROP = new THREE.LatheGeometry(
  Array.from({ length: 24 }, (_, i) => {
    const v = i / 23; // 0 topo .. 1 ponta
    const head = 0.22;
    const r = v < head ? Math.sqrt(Math.max(0, 1 - ((head - v) / head) ** 2)) : Math.pow(1 - (v - head) / (1 - head), 1.15);
    return new THREE.Vector2(Math.max(r, 0.0001) * 0.5, head * 0.5 - v);
  }).reverse(), // de baixo para cima: normais para fora
  20,
);

/**
 * Mecha colada na cabeça: presa na superfície (azimute `az`, elevação `el`),
 * achatada na direção da normal e inclinada para dentro para acompanhar a curva.
 * Topo redondo em cima, ponta para baixo.
 */
const Strand: React.FC<{ az: number; el: number; w: number; h: number; t?: number; roll?: number; c: string; R?: number; r?: number; hug?: number }> = ({ az, el, w, h, t = 0.035, roll = 0, c, R = HEAD_R * 1.0, r = 0.5, hug = 1 }) => (
  <group rotation={[0, az, 0]}>
    <group rotation={[-el, 0, 0]}>
      <group position={[0, 0, R]} rotation={[0, 0, roll]}>
        <group rotation={[(h * 0.5 / HEAD_R) * hug, 0, 0]}>
          <mesh geometry={DROP} scale={[w * 2, h, t * 2]} castShadow>
            {mat(c, r)}
          </mesh>
        </group>
      </group>
    </group>
  </group>
);

const KaiHair: React.FC<{ c: string }> = ({ c }) => (
  <group>
    {/* calota lisa cobrindo topo e nuca */}
    <mesh position={[0, 0.02, -0.015]} rotation={[-0.5, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.07, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat(c, 0.55)}
    </mesh>
    <mesh position={[0, -0.02, -0.06]} rotation={[-1.05, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.045, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat(c, 0.55)}
    </mesh>
    {/* franja repartida no meio: mechas pontudas que nascem sob a calota e caem para os lados */}
    {([
      [0.11, 0.18, 0.085], [0.33, 0.18, 0.09], [0.56, 0.21, 0.09], [0.8, 0.26, 0.085], [1.02, 0.3, 0.08],
    ] as const).flatMap(([az, h, w], i) => [-1, 1].map((sd) => (
      <Strand key={`${i}${sd}`} az={sd * az} el={0.58 - i * 0.04} w={w} h={h} roll={sd * (0.22 + i * 0.05)} c={c} R={HEAD_R * 1.035} t={0.02} hug={0.7} />
    )))}
    {/* mechas laterais compridas, rentes ao rosto, na frente da orelha */}
    {[-1, 1].map((sd) => (
      <group key={sd}>
        <Strand az={sd * 1.22} el={0.3} w={0.08} h={0.42} t={0.022} roll={sd * 0.04} c={c} R={HEAD_R * 1.04} hug={0.6} />
        <Strand az={sd * 1.45} el={0.25} w={0.085} h={0.36} t={0.022} roll={sd * 0.08} c={c} R={HEAD_R * 1.04} hug={0.6} />
      </group>
    ))}
  </group>
);

/** Espeto de cabelo saindo da cabeça (cone), apontando para fora com inclinação. */
const Spike: React.FC<{ az: number; el: number; len: number; w: number; tilt?: [number, number]; c: string; R?: number }> = ({ az, el, len, w, tilt = [0, 0], c, R = HEAD_R * 1.0 }) => (
  <group rotation={[0, az, 0]}>
    <group rotation={[-el, 0, 0]}>
      <group position={[0, 0, R]} rotation={[Math.PI / 2 + tilt[0], 0, tilt[1]]}>
        <mesh position={[0, len / 2 - 0.02, 0]} scale={[1, 1, 0.55]} castShadow>
          <coneGeometry args={[w, len, 12]} />
          {mat(c, 0.55)}
        </mesh>
      </group>
    </group>
  </group>
);

/** Ren: cabelo preto bagunçado, espetado, franja pesada caindo nos olhos. */
const RenHair: React.FC<{ c: string }> = ({ c }) => {
  const spikes: [number, number, number, number, number, number][] = [];
  // coroa e nuca: anéis de espetos com inclinações variadas (determinístico)
  const rings: [number, number, number, number][] = [[1.3, 6, 0.13, 0.12], [1.0, 10, 0.14, 0.125], [0.7, 13, 0.14, 0.12], [0.4, 14, 0.13, 0.115], [0.1, 14, 0.12, 0.11], [-0.2, 12, 0.11, 0.1]];
  rings.forEach(([el, n, len, w], r) => {
    for (let i = 0; i < n; i++) {
      const az = (i / n) * Math.PI * 2 + r * 0.37;
      const front = Math.cos(az) > 0.55 && el < 1.0; // a frente fica para a franja
      if (front) continue;
      const k = Math.sin(i * 12.9898 + r * 78.233) * 43758.5453; const rnd = k - Math.floor(k);
      spikes.push([az, el, len * (0.75 + rnd * 0.6), w, (rnd - 0.5) * 0.7 - 0.75, (rnd - 0.5) * 0.9]);
    }
  });
  return (
    <group>
      <mesh position={[0, 0.03, -0.02]} rotation={[-0.45, 0, 0]} castShadow>
        <sphereGeometry args={[HEAD_R * 1.08, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        {mat(c, 0.55)}
      </mesh>
      <mesh position={[0, -0.02, -0.06]} rotation={[-1.05, 0, 0]}>
        <sphereGeometry args={[HEAD_R * 1.06, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        {mat(c, 0.55)}
      </mesh>
      {spikes.map(([az, el, len, w, tx, tz], i) => <Spike key={i} az={az} el={el} len={len} w={w} tilt={[tx, tz]} c={c} R={HEAD_R * 1.02} />)}
      {/* franja pesada e bagunçada, caindo até os olhos */}
      {([
        [-0.5, 0.62, 0.11, 0.3, -0.35], [-0.25, 0.66, 0.12, 0.33, -0.1], [0.0, 0.68, 0.12, 0.34, 0.12], [0.24, 0.66, 0.12, 0.32, 0.3], [0.5, 0.62, 0.11, 0.3, 0.45],
        [-0.78, 0.55, 0.1, 0.32, -0.5], [0.78, 0.55, 0.1, 0.32, 0.55], [-1.05, 0.42, 0.09, 0.34, -0.3], [1.05, 0.42, 0.09, 0.34, 0.3],
      ] as const).map(([az, el, w, h, roll], i) => (
        <Strand key={i} az={az} el={el} w={w} h={h} roll={roll} c={c} R={HEAD_R * 1.04} t={0.024} hug={0.75} />
      ))}
      {/* mechas laterais sobre as orelhas */}
      {[-1, 1].map((sd) => <Strand key={sd} az={sd * 1.35} el={0.35} w={0.09} h={0.3} t={0.03} roll={sd * 0.25} c={c} R={HEAD_R * 1.05} hug={0.6} />)}
    </group>
  );
};

/** Nico: cabelo preto curto em "chanel" bagunçado, franja reta na testa e pontas viradas para fora. */
const NicoHair: React.FC<{ c: string }> = ({ c }) => {
  const OPEN = 1.05; // abertura do rosto
  return (
    <group>
      <mesh position={[0, 0.03, -0.02]} rotation={[-0.4, 0, 0]} castShadow>
        <sphereGeometry args={[HEAD_R * 1.08, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        {mat(c, 0.55)}
      </mesh>
      {/* volume do chanel: casca que desce até o queixo nos lados e atrás, aberta na frente */}
      <mesh position={[0, 0.0, -0.01]} scale={[1.04, 1, 1]} castShadow>
        <sphereGeometry args={[HEAD_R * 1.1, 48, 28, Math.PI / 2 + OPEN, Math.PI * 2 - 2 * OPEN, 0, Math.PI * 0.74]} />
        {mat(c, 0.55)}
      </mesh>
      {/* mechas dos lados e de trás, terminando em pontas viradas para fora */}
      {Array.from({ length: 13 }, (_, i) => {
        const az = (i / 12 - 0.5) * 2 * (Math.PI - OPEN) + Math.PI; // de um lado ao outro, por trás
        const k = Math.sin(i * 12.9898) * 43758.5453; const rnd = k - Math.floor(k);
        return <Strand key={i} az={az} el={0.05 + rnd * 0.08} w={0.11} h={0.36 + rnd * 0.08} t={0.03} roll={(rnd - 0.5) * 0.5} c={c} R={HEAD_R * 1.1} hug={0.35} />;
      })}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Strand az={sd * 0.98} el={0.32} w={0.1} h={0.4} t={0.024} roll={sd * 0.18} c={c} R={HEAD_R * 1.05} hug={0.6} />
          <Strand az={sd * 1.15} el={0.25} w={0.11} h={0.44} t={0.026} roll={sd * 0.05} c={c} R={HEAD_R * 1.07} hug={0.5} />
          <Strand az={sd * 1.4} el={0.2} w={0.11} h={0.44} t={0.03} roll={sd * -0.12} c={c} R={HEAD_R * 1.08} hug={0.45} />
          {/* pontas viradas para fora na altura do queixo */}
          {[1.3, 1.75, 2.25].map((a, j) => (
            <Spike key={j} az={sd * a} el={-0.42 - j * 0.05} len={0.12 + j * 0.02} w={0.06} tilt={[0.5, sd * (0.5 + j * 0.15)]} c={c} R={HEAD_R * 1.08} />
          ))}
        </group>
      ))}
      {/* franja reta e cheia, logo acima dos olhos */}
      {Array.from({ length: 11 }, (_, i) => {
        const az = (i / 10 - 0.5) * 1.8;
        const k = Math.sin(i * 7.31 + 1.7) * 43758.5453; const rnd = k - Math.floor(k);
        return <Strand key={i} az={az} el={0.66} w={0.1} h={0.21 + rnd * 0.04} t={0.024} roll={az * 0.12 + (rnd - 0.5) * 0.12} c={c} R={HEAD_R * 1.04} hug={0.8} />;
      })}
      {/* dois fios rebeldes no topo */}
      <Spike az={0.3} el={1.35} len={0.14} w={0.03} tilt={[-0.9, 0.5]} c={c} R={HEAD_R * 1.05} />
      <Spike az={-0.6} el={1.25} len={0.1} w={0.025} tilt={[-0.7, -0.6]} c={c} R={HEAD_R * 1.05} />
    </group>
  );
};

/** General: quepe militar com aba e distintivo dourado. */
const GeneralCap: React.FC = () => (
  <group>
    <mesh position={[0, 0.08, -0.04]} rotation={[-0.5, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.04, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat("#3a2a1e", 0.6)}
    </mesh>
    <mesh position={[0, 0.3, 0]} rotation={[-0.12, 0, 0]} castShadow>
      <cylinderGeometry args={[0.36, 0.33, 0.16, 32]} />
      {mat("#4e5a30", 0.7)}
    </mesh>
    <mesh position={[0, 0.39, -0.02]} rotation={[-0.12, 0, 0]} scale={[1, 0.25, 1]}>
      <sphereGeometry args={[0.38, 32, 16]} />
      {mat("#5d6b3a", 0.7)}
    </mesh>
    <mesh position={[0, 0.2, 0.3]} rotation={[0.35, 0, 0]} scale={[1, 0.18, 0.6]}>
      <sphereGeometry args={[0.24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      {mat("#1d1a14", 0.4)}
    </mesh>
    <mesh position={[0, 0.32, 0.34]} rotation={[-0.12, 0, 0]}>
      <sphereGeometry args={[0.045, 12, 10]} />
      {mat("#e0b13a", 0.3)}
    </mesh>
  </group>
);

/** Cabelos/acessórios de figurante. */
const ShortHair: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.02, -0.03]} rotation={[-0.55, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.05, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.47]} />
      {mat(c, 0.6)}
    </mesh>
    {/* franja curta e costeletas */}
    {[-0.55, -0.28, 0, 0.28, 0.55].map((az, i) => <Strand key={i} az={az} el={0.72} w={0.11} h={0.14} t={0.02} roll={az * 0.4} c={c} R={HEAD_R * 1.03} hug={0.8} />)}
    {[-1, 1].map((k) => <Strand key={k} az={k * 1.3} el={0.22} w={0.07} h={0.2} t={0.02} c={c} R={HEAD_R * 1.03} hug={0.6} />)}
  </group>
);
const ExtraHair: React.FC<{ c: string; st: ToonStyle }> = ({ c, st }) => (
  <group>
    {(st.hair === "short" || st.hair === "bun" || !st.hair) && <ShortHair c={c} />}
    {st.hair === "bald" && [-1, 1].map((k) => (
      <mesh key={k} position={[k * HEAD_R * 0.9, 0.0, -0.1]} scale={[0.45, 0.75, 1]}><sphereGeometry args={[0.14, 14, 10]} />{mat(c, 0.6)}</mesh>
    ))}
    {st.hair === "curly" && Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(a) * 0.26, 0.24 + Math.sin(i * 1.7) * 0.03, Math.sin(a) * 0.24 - 0.06]}><sphereGeometry args={[0.12, 14, 10]} />{mat(c, 0.7)}</mesh>;
    })}
    {st.hair === "curly" && <mesh position={[0, 0.3, -0.06]}><sphereGeometry args={[0.24, 18, 14]} />{mat(c, 0.7)}</mesh>}
    {st.hair === "bun" && <mesh position={[0, HEAD_R + 0.06, -0.12]}><sphereGeometry args={[0.12, 20, 16]} />{mat(c, 0.6)}</mesh>}
    {st.hair === "cap" && (
      /* boné de pano dos anos 30: cobre o topo da cabeça como um gorro justo, aba curta na frente; cabelo aparecendo nos lados */
      <group>
        {[-1, 1].map((k) => <Strand key={k} az={k * 1.3} el={0.22} w={0.08} h={0.22} t={0.02} c={c} R={HEAD_R * 1.03} hug={0.6} />)}
        {[-1, -0.5, 0, 0.5, 1].map((k, i) => <Strand key={"n" + i} az={Math.PI + k * 0.9} el={0.15} w={0.11} h={0.16} t={0.02} c={c} R={HEAD_R * 1.03} hug={0.7} />)}
        <mesh position={[0, 0.03, -0.02]} rotation={[-0.4, 0, 0]} castShadow>
          <sphereGeometry args={[HEAD_R * 1.09, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          {mat(st.cap ?? "#f2f2f2", 0.65)}
        </mesh>
        <mesh position={[0, 0.03, -0.02]} rotation={[-0.4, 0, 0]}>
          <torusGeometry args={[HEAD_R * 1.09 * Math.sin(Math.PI * 0.4), 0.018, 8, 40]} />
          {mat("#1b1b1f", 0.6)}
        </mesh>
        <mesh position={[0, 0.2, 0.31]} rotation={[0.55, 0, 0]} scale={[1, 0.1, 0.5]}>
          <sphereGeometry args={[0.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {mat(st.cap ?? "#f2f2f2", 0.5)}
        </mesh>
      </group>
    )}
    {st.mustache && <mesh position={[0, -0.085, HEAD_R * 0.98]} scale={[1.5, 0.4, 0.45]}><sphereGeometry args={[0.06, 14, 10]} />{mat(c === "#d9b45a" ? "#8a6a3a" : c, 0.6)}</mesh>}
    {st.glasses && [-1, 1].map((k) => (
      <mesh key={k} position={[k * 0.12, 0.0, HEAD_R * 0.95]}><torusGeometry args={[0.075, 0.012, 8, 24]} />{mat("#2a2a30", 0.4)}</mesh>
    ))}
  </group>
);

const BiaHair: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.02, -0.015]} rotation={[-0.5, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.07, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat(c, 0.6)}
    </mesh>
    <mesh position={[0, -0.03, -0.06]} rotation={[-1.0, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.04, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat(c, 0.6)}
    </mesh>
    {/* franja de lado: mechas largas penteadas para a direita */}
    {([[-0.85, 0.22, 0.1, 0.7], [-0.55, 0.21, 0.11, 0.9], [-0.25, 0.21, 0.11, 0.9], [0.05, 0.2, 0.105, 0.85], [0.35, 0.19, 0.095, 0.7], [0.68, 0.2, 0.085, 0.45], [0.98, 0.24, 0.08, 0.3]] as const).map(([az, h, w, roll], i) => (
      <Strand key={i} az={az} el={0.58} w={w} h={h} roll={roll} c={c} r={0.6} R={HEAD_R * 1.035} t={0.02} hug={0.7} />
    ))}
    {[-1, 1].map((sd) => <Strand key={sd} az={sd * 1.3} el={0.28} w={0.08} h={0.3} t={0.022} c={c} R={HEAD_R * 1.04} r={0.6} hug={0.6} />)}
    {/* coque */}
    <mesh position={[0, HEAD_R + 0.07, -0.12]} castShadow>
      <sphereGeometry args={[0.13, 24, 20]} />
      {mat(c, 0.6)}
    </mesh>
    <mesh position={[0, HEAD_R + 0.0, -0.09]} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.09, 0.022, 10, 24]} />
      {mat("#ffd23f", 0.4)}
    </mesh>
  </group>
);

/** Retalho de esfera com o rosto. */
const ToonFacePatch: React.FC<{ state: ToonFace }> = ({ state }) => {
  const tex = toonFaceTexture(state);
  const W = 1.7, H = 1.5;
  return (
    <mesh renderOrder={2}>
      <sphereGeometry args={[HEAD_R * 1.004, 48, 48, Math.PI / 2 - W / 2, W, Math.PI / 2 - H / 2, H]} />
      <meshStandardMaterial map={tex} transparent roughness={0.5} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
};

export type ToonProps = { kind: ToonKind; pose?: Pose; face: ToonFace; holdR?: React.ReactNode; holdL?: React.ReactNode; position?: [number, number, number]; rotationY?: number; scale?: number; look?: Partial<ToonLook>; style?: ToonStyle };

export const Toon: React.FC<ToonProps> = ({ kind, pose = {}, face, holdR, holdL, position = [0, 0, 0], rotationY = 0, scale = 1, look, style = {} }) => {
  const L = { ...LOOK[kind], ...(look ?? {}) };
  const armL = pose.armL ?? [0, 0, -0.15];
  const armR = pose.armR ?? [0, 0, 0.15];
  const head = pose.head ?? [0, 0, 0];
  const sq = pose.squash ?? 1;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, pose.bob ?? 0, 0]} scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        {/* pernas finas */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.1, HIP_Y, 0]} rotation={[(s < 0 ? pose.legL : pose.legR) ?? 0, 0, 0]}>
            <mesh position={[0, -0.32, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.56, 6, 14]} />
              {mat(L.pants)}
            </mesh>
            <group position={[0, -0.66, 0.04]}>
              <mesh scale={[1, 0.6, 1.55]} castShadow>
                <sphereGeometry args={[0.085, 20, 16]} />
                {mat(L.shoe, 0.4)}
              </mesh>
              <mesh position={[0, -0.03, 0]} scale={[1.05, 0.25, 1.6]}>
                <sphereGeometry args={[0.085, 20, 16]} />
                {mat(L.sole, 0.4)}
              </mesh>
            </group>
          </group>
        ))}
        <group rotation={[pose.lean ?? 0, pose.twist ?? 0, 0]} position={[0, HIP_Y, 0]}>
          <group position={[0, -HIP_Y, 0]}>
            {/* moletom */}
            <mesh position={[0, 0.98, 0]} scale={[1.12, 1, 0.95]} castShadow>
              <capsuleGeometry args={[0.2, 0.3, 8, 24]} />
              {mat(L.hoodie, 0.75)}
            </mesh>
            <mesh position={[0, 0.72, 0]} scale={[1.12, 0.35, 0.95]}>
              <sphereGeometry args={[0.215, 24, 16]} />
              {mat(L.hoodie2, 0.75)}
            </mesh>
            {/* bolso canguru */}
            {kind !== "ren" && kind !== "nico" && kind !== "general" && kind !== "extra" && (
              <mesh position={[0, 0.86, 0.17]} scale={[1, 0.5, 0.25]}>
                <sphereGeometry args={[0.13, 20, 12]} />
                {mat(L.hoodie2, 0.75)}
              </mesh>
            )}
            {kind === "ren" ? (
              <group>
                {/* gola da camiseta (preta) */}
                <mesh position={[0, 1.27, 0.0]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
                  <torusGeometry args={[0.12, 0.022, 10, 28]} />
                  {mat("#111114", 0.7)}
                </mesh>
              </group>
            ) : kind === "extra" ? (
              <group>
                {style.tie ? <>
                  <mesh position={[0, 1.27, 0.03]} rotation={[Math.PI / 2 - 0.2, 0, 0]}><torusGeometry args={[0.11, 0.03, 8, 24]} />{mat("#f4f4f6", 0.6)}</mesh>
                  <mesh position={[0, 1.13, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.06, 0.24, 0.02]} />{mat(style.tie, 0.5)}</mesh>
                </> : <mesh position={[0, 1.27, 0.0]} rotation={[Math.PI / 2 - 0.15, 0, 0]}><torusGeometry args={[0.12, 0.022, 10, 28]} />{mat(L.hoodie2, 0.7)}</mesh>}
              </group>
            ) : kind === "general" ? (
              <group>
                {/* farda: gravata, cinto e medalhas */}
                <mesh position={[0, 1.15, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.05, 0.22, 0.02]} />{mat("#2e2a20", 0.6)}</mesh>
                <mesh position={[0, 0.76, 0]} scale={[1.13, 1, 0.96]}><cylinderGeometry args={[0.215, 0.215, 0.06, 28]} />{mat("#3a2a1e", 0.5)}</mesh>
                {[0, 1, 2].map((i) => <mesh key={i} position={[-0.12 + i * 0.05, 1.08, 0.2]}><boxGeometry args={[0.04, 0.03, 0.02]} />{mat(["#c62a2a", "#2c6fb6", "#e0b13a"][i], 0.5)}</mesh>)}
              </group>
            ) : kind === "nico" ? (
              <group>
                {/* jaqueta esportiva branca: gola alta preta e zíper */}
                <mesh position={[0, 1.31, 0]} castShadow>
                  <cylinderGeometry args={[0.135, 0.17, 0.13, 28]} />
                  {mat("#17171b", 0.7)}
                </mesh>
                <mesh position={[0, 0.98, 0.205]} rotation={[0.04, 0, 0]}>
                  <boxGeometry args={[0.022, 0.5, 0.02]} />
                  {mat("#17171b", 0.6)}
                </mesh>
                
              </group>
            ) : kind === "kai" ? (
              <group>
                {/* cachecol preto com ponta laranja */}
                <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <torusGeometry args={[0.17, 0.07, 14, 32]} />
                  {mat("#1a1a20", 0.8)}
                </mesh>
                <mesh position={[0.09, 1.1, 0.19]} rotation={[0.12, 0, 0.06]} castShadow>
                  <boxGeometry args={[0.11, 0.32, 0.04]} />
                  {mat("#1a1a20", 0.8)}
                </mesh>
                <mesh position={[0.1, 0.95, 0.205]} rotation={[0.12, 0, 0.06]}>
                  <boxGeometry args={[0.112, 0.05, 0.045]} />
                  {mat("#f07a1a", 0.6)}
                </mesh>
              </group>
            ) : (
              <group>
                {/* capuz e cordões */}
                <mesh position={[0, 1.28, -0.12]} rotation={[0.5, 0, 0]} scale={[1, 0.6, 0.7]} castShadow>
                  <sphereGeometry args={[0.2, 20, 14]} />
                  {mat(L.hoodie2, 0.75)}
                </mesh>
                {[-1, 1].map((s) => (
                  <mesh key={s} position={[s * 0.05, 1.16, 0.2]}>
                    <cylinderGeometry args={[0.009, 0.009, 0.16, 6]} />
                    {mat("#f4f1ea")}
                  </mesh>
                ))}
              </group>
            )}
            {/* braços: manga + mão */}
            {[-1, 1].map((s) => {
              const r = s < 0 ? armL : armR;
              return (
                <group key={s} position={[s * 0.25, SHOULDER_Y, 0]} rotation={r}>
                  <mesh castShadow><sphereGeometry args={[0.075, 16, 12]} />{mat(kind === "nico" ? "#17171b" : L.hoodie, 0.75)}</mesh>
                  {kind === "ren" ? (
                    <group>
                      {/* manga curta preta, braço de fora e munhequeira preta */}
                      <mesh position={[0, -0.07, 0]} castShadow><capsuleGeometry args={[0.072, 0.1, 6, 12]} />{mat(L.hoodie, 0.75)}</mesh>
                      <mesh position={[0, -0.22, 0]} castShadow><capsuleGeometry args={[0.05, 0.3, 6, 12]} />{mat(L.skin, 0.5)}</mesh>
                      {s < 0 && <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.055, 0.024, 8, 20]} />{mat("#111114", 0.7)}</mesh>}
                    </group>
                  ) : (
                    <mesh position={[0, -0.2, 0]} castShadow>
                      <capsuleGeometry args={[0.06, 0.32, 6, 12]} />
                      {mat(L.hoodie, 0.75)}
                    </mesh>
                  )}
                  <group position={[0, -0.43, 0]}>
                    <mesh castShadow><sphereGeometry args={[0.07, 20, 16]} />{mat(L.skin, 0.5)}</mesh>
                    {s < 0 ? holdL : holdR}
                  </group>
                </group>
              );
            })}
            {/* cabeça */}
            <group position={[0, HEAD_Y - 0.3, 0]} rotation={head}>
              <group position={[0, 0.3, 0]}>
                <mesh castShadow><sphereGeometry args={[HEAD_R, 48, 40]} />{mat(L.skin, 0.5)}</mesh>
                <ToonFacePatch state={face} />
                {[-1, 1].map((s) => (
                  <mesh key={s} position={[s * HEAD_R * 0.97, -0.02, 0]} scale={[0.45, 1, 0.8]}>
                    <sphereGeometry args={[0.075, 16, 12]} />
                    {mat(L.skin, 0.5)}
                  </mesh>
                ))}
                {kind === "kai" ? <KaiHair c={L.hair} /> : kind === "ren" ? <RenHair c={L.hair} /> : kind === "nico" ? <NicoHair c={L.hair} /> : kind === "general" ? <GeneralCap /> : kind === "extra" ? <ExtraHair c={L.hair} st={style} /> : <BiaHair c={L.hair} />}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Altura da cabeça (centro) para mirar a câmera. */
export const TOON_HEAD_Y = HEAD_Y;
