import React from "react";
import * as THREE from "three";
import { canvasTexture } from "./textures";
import type { Expr, FaceState } from "./Face";
import { rand } from "./anim";

/**
 * Jujuba, a capivara. Mesmo estilo do kit (cabeça enorme, corpo pequeno), mas com
 * cabeça "quadradona", focinho retangular e orelhinhas redondas.
 *
 * `inflate` (0..1): o corpo vai virando uma esfera. As patas encolhem para dentro da bola,
 * os braços ficam colados na superfície e a cabeça fica presa no topo-frente.
 *
 * O rosto segue o mesmo sistema do kit (textura de canvas trocada por expressão/piscada),
 * só que dividido em dois: olhos+sobrancelhas na cabeça e a boca no focinho.
 */

export type CapyPose = {
  armL?: [number, number, number];
  armR?: [number, number, number];
  legL?: number;
  legR?: number;
  lean?: number;
  head?: [number, number, number];
  bob?: number;
  squash?: number;
};

export type CapyProps = {
  pose?: CapyPose;
  face: FaceState;
  inflate?: number; // 0..1
  holdR?: React.ReactNode;
  holdL?: React.ReactNode;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  messy?: number; // 0..1 topete bagunçado
  flower?: boolean;
};

export const CAPY = { fur: "#a8733f", furDark: "#7a4f2a", snout: "#8a5a34", belly: "#cfa16c", paw: "#4a2e18" };
const INK = "#2b1a12";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------ texturas
const furTex = (base: string, shade: string) =>
  canvasTexture(`capyfur2-${base}-${shade}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "round";
    for (let i = 0; i < 2600; i++) {
      const x = rand(i) * w, y = rand(i + 900) * h, l = 3 + rand(i + 1800) * 4;
      ctx.strokeStyle = rand(i + 2700) > 0.5 ? `${shade}26` : "rgba(255,230,190,0.12)";
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * 0.3, y + l); ctx.stroke();
    }
  });

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, st: FaceState, side: -1 | 1) {
  const e = st.expr;
  const blink = Math.max(st.blink ?? 0, 0);
  const [lx, ly] = st.look ?? [0, 0];
  let w = 36, h = 46;
  if (e === "surprised" || e === "amazed" || e === "excited") { w = 42; h = 56; }
  if (e === "determined" || e === "focused") h = 38;
  const closedArc = e === "joy" || e === "tearsJoy" || (e === "wink" && side === 1);
  if (closedArc || blink > 0.85) {
    ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineCap = "round";
    ctx.beginPath();
    if (closedArc) ctx.arc(x, y + 10, w * 0.9, Math.PI * 1.15, Math.PI * 1.85);
    else { ctx.moveTo(x - w, y + 4); ctx.quadraticCurveTo(x, y + 14, x + w, y + 4); }
    ctx.stroke();
    return;
  }
  const hh = h * (1 - blink);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.ellipse(x, y, w, hh, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w - 3, Math.max(hh - 3, 1), 0, 0, Math.PI * 2); ctx.clip();
  const pr = e === "surprised" ? 15 : e === "amazed" || e === "excited" ? 28 : 23;
  const px = x + lx * w * 0.45, py = y + ly * hh * 0.4 + 4;
  ctx.fillStyle = "#3b2416"; ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 1.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#120a06"; ctx.beginPath(); ctx.ellipse(px, py + 2, pr * 0.55, pr * 0.65, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.45, pr * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + pr * 0.35, py + pr * 0.35, pr * 0.14, 0, Math.PI * 2); ctx.fill();
  if (e === "amazed" || e === "excited") {
    ctx.save(); ctx.translate(px + pr * 0.2, py - pr * 0.1); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 11; const a = (i * Math.PI) / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

function brow(ctx: CanvasRenderingContext2D, x: number, y: number, e: Expr, side: -1 | 1) {
  let tilt = 0, lift = 0;
  if (e === "sad" || e === "worried") { tilt = 0.4; lift = 2; }
  if (e === "determined" || e === "focused") { tilt = -0.4; lift = 10; }
  if (e === "surprised" || e === "amazed") lift = -16;
  if (e === "excited" || e === "happy" || e === "joy" || e === "tearsJoy") lift = -8;
  ctx.save(); ctx.translate(x, y - 66 + lift); ctx.rotate(tilt * side);
  ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-26, 4); ctx.quadraticCurveTo(0, -8, 26, 4); ctx.stroke();
  ctx.restore();
}

/** Olhos, sobrancelhas, bochechas, suor e lágrimas (vai na cabeça). */
const eyesTexture = (st: FaceState) => {
  const look = st.look ?? [0, 0];
  const q = (v: number, s = 6) => Math.round(v * s) / s;
  const key = ["capyeyes", st.expr, q(st.blink ?? 0, 4), q(look[0]), q(look[1]), st.sweat, st.blush, st.tears].join("|");
  return canvasTexture(key, 512, 512, (ctx) => {
    const S = 512, cy = S * 0.5, dx = S * 0.15;
    ctx.clearRect(0, 0, S, S);
    ctx.translate(S / 2, cy); ctx.scale(1.3, 1.3); ctx.translate(-S / 2, -cy);
    const e = st.expr;
    if (st.blush || e === "joy" || e === "excited" || e === "tearsJoy" || e === "happy") {
      ctx.fillStyle = "rgba(255,110,110,0.5)";
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(S / 2 + s * dx * 1.55, cy + 66, 30, 17, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    eye(ctx, S / 2 - dx, cy, st, -1); eye(ctx, S / 2 + dx, cy, st, 1);
    brow(ctx, S / 2 - dx, cy, e, -1); brow(ctx, S / 2 + dx, cy, e, 1);
    if (st.tears || e === "tearsJoy") {
      ctx.fillStyle = "#7fd3ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 4;
      for (const s of [-1, 1]) {
        const tx = S / 2 + s * (dx + 30), ty = cy + 40;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + s * 16, ty + 40, tx, ty + 56); ctx.quadraticCurveTo(tx - s * 16, ty + 40, tx, ty); ctx.fill(); ctx.stroke();
      }
    }
    if (st.sweat) {
      const tx = S / 2 + dx * 2.2, ty = cy - 100;
      ctx.fillStyle = "#9fe0ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 26, ty + 46, tx, ty + 60); ctx.quadraticCurveTo(tx - 26, ty + 46, tx, ty); ctx.fill(); ctx.stroke();
    }
  });
};

/** Boca + dentinhos de capivara (vai na frente do focinho). */
const mouthTexture = (st: FaceState) => {
  const open = st.mouthOpen;
  const key = ["capymouth", st.expr, open === undefined ? -1 : Math.round(open * 5) / 5].join("|");
  return canvasTexture(key, 512, 256, (ctx) => {
    const W = 512, x = W / 2, y = 128;
    ctx.clearRect(0, 0, W, 256);
    // narinas
    ctx.fillStyle = "#2a160b";
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * 62, 64, 30, 17, s * 0.4, 0, Math.PI * 2); ctx.fill(); }
    // risquinho do focinho
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x, 86); ctx.lineTo(x, y); ctx.stroke();
    const e = st.expr;
    const teeth = (yy: number) => {
      ctx.fillStyle = "#fffaf0"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(x + (s < 0 ? -25 : 1), yy, 24, 30, 5); ctx.fill(); ctx.stroke(); }
    };
    const openMouth = (w: number, h: number) => {
      ctx.fillStyle = "#6e1f1f"; ctx.strokeStyle = INK; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + h * 2, x + w, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = "#e46b6b";
      ctx.beginPath(); ctx.ellipse(x, y + h * 1.25, w * 0.55, h * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      teeth(y - 1);
    };
    if (open !== undefined && open > 0.05 && e !== "sad") {
      if (e === "surprised" || e === "amazed") {
        ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(x, y + 26, 24 + 8 * open, 18 + 30 * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        teeth(y - 2);
      } else openMouth(48 + 18 * open, 10 + 34 * open);
      return;
    }
    switch (e) {
      case "neutral": case "focused":
        ctx.beginPath(); ctx.moveTo(x - 46, y + 4); ctx.quadraticCurveTo(x, y + 14, x + 46, y + 4); ctx.stroke(); teeth(y + 6); break;
      case "smile": case "wink": case "determined":
        ctx.beginPath(); ctx.moveTo(x - 64, y - 6); ctx.quadraticCurveTo(x - 32, y + 22, x, y); ctx.quadraticCurveTo(x + 32, y + 22, x + 64, y - 6); ctx.stroke(); teeth(y + 4); break;
      case "talk": openMouth(44, 18); break;
      case "happy": openMouth(58, 26); break;
      case "joy": case "excited": case "tearsJoy": openMouth(72, 40); break;
      case "surprised": case "amazed":
        ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(x, y + 26, 26, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); teeth(y - 2); break;
      case "sad":
        ctx.beginPath(); ctx.moveTo(x - 46, y + 28); ctx.quadraticCurveTo(x, y + 2, x + 46, y + 28); ctx.stroke(); teeth(y + 6); break;
      case "worried":
        ctx.beginPath(); ctx.moveTo(x - 50, y + 16);
        ctx.bezierCurveTo(x - 25, y, x - 12, y + 28, x, y + 14); ctx.bezierCurveTo(x + 12, y, x + 25, y + 28, x + 50, y + 16); ctx.stroke(); teeth(y + 16); break;
    }
  });
};

// ------------------------------------------------------------ peças
const Fur: React.FC<{ dark?: boolean; rough?: number; color?: string }> = ({ dark, rough = 0.78, color }) => {
  const t = furTex(color ?? (dark ? CAPY.furDark : CAPY.fur), "#3a2210");
  return <meshStandardMaterial map={t} roughness={rough} />;
};

const Paw: React.FC<{ holding?: React.ReactNode }> = ({ holding }) => (
  <group>
    <mesh castShadow scale={[1, 0.85, 1]}>
      <sphereGeometry args={[0.068, 18, 14]} />
      <meshStandardMaterial color={CAPY.paw} roughness={0.6} />
    </mesh>
    {holding}
  </group>
);

const Flower: React.FC = () => (
  <group>
    {Array.from({ length: 5 }).map((_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.055, Math.sin(a) * 0.055, 0]} scale={[1, 1, 0.45]}>
          <sphereGeometry args={[0.045, 14, 10]} />
          <meshStandardMaterial color="#ff8a2a" roughness={0.5} />
        </mesh>
      );
    })}
    <mesh position={[0, 0, 0.02]}>
      <sphereGeometry args={[0.035, 12, 10]} />
      <meshStandardMaterial color="#ffd23f" roughness={0.4} />
    </mesh>
  </group>
);

const HEAD_R = 0.44;

export const Capybara: React.FC<CapyProps> = ({
  pose = {}, face, inflate = 0, holdR, holdL, position = [0, 0, 0], rotationY = 0, scale = 1, messy = 0, flower = true,
}) => {
  const k = Math.max(0, Math.min(1.2, inflate));
  const ke = k <= 1 ? k * k * (3 - 2 * k) : k; // acima de 1 = "estica" do overshoot
  // corpo: pera pequena -> esfera grande
  const rx = lerp(0.27, 0.92, ke), ry = lerp(0.33, 0.92, ke), rz = lerp(0.25, 0.92, ke);
  const legLen = lerp(0.17, 0.05, ke);
  const bodyY = legLen + ry * 0.92;
  const headY = bodyY + ry * lerp(0.95, 0.78, ke) + HEAD_R * lerp(0.62, 0.55, ke);
  const headZ = lerp(0.03, 0.32, ke);
  const armL = pose.armL ?? [0, 0, -0.35];
  const armR = pose.armR ?? [0, 0, 0.35];
  const head = pose.head ?? [0, 0, 0];
  const sq = pose.squash ?? 1;
  const rough = lerp(0.78, 0.32, ke); // inchada fica "brilhante" como balão
  const eyesTex = eyesTexture(face);
  const mouthTex = mouthTexture(face);
  // ombros na superfície do corpo
  const shY = bodyY + ry * 0.28;
  const shX = rx * 0.93;

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, pose.bob ?? 0, 0]} scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        {/* pernas */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * rx * 0.45, legLen + ry * 0.92 - ry * 0.82, 0]} rotation={[(s < 0 ? pose.legL : pose.legR) ?? 0, 0, 0]}>
            <mesh position={[0, -legLen / 2, 0]} castShadow>
              <capsuleGeometry args={[0.07, Math.max(legLen, 0.01), 6, 12]} />
              <Fur dark />
            </mesh>
            <mesh position={[0, -legLen - 0.02, 0.05]} scale={[1, 0.55, 1.45]} castShadow>
              <sphereGeometry args={[0.085, 18, 14]} />
              <meshStandardMaterial color={CAPY.paw} roughness={0.6} />
            </mesh>
          </group>
        ))}
        <group position={[0, legLen, 0]} rotation={[pose.lean ?? 0, 0, 0]}>
          <group position={[0, -legLen, 0]}>
            {/* corpo */}
            <mesh position={[0, bodyY, 0]} scale={[rx, ry, rz]} castShadow receiveShadow>
              <sphereGeometry args={[1, 48, 40]} />
              <Fur rough={rough} />
            </mesh>
            {/* barriga clara */}
            <mesh position={[0, bodyY - ry * 0.08, 0]} scale={[rx * 1.012, ry * 1.012, rz * 1.012]}>
              <sphereGeometry args={[1, 40, 32, Math.PI / 2 - 0.75, 1.5, Math.PI / 2 - 0.85, 1.7]} />
              <meshStandardMaterial color={CAPY.belly} roughness={rough} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
            {/* braços */}
            {[-1, 1].map((s) => {
              const r = s < 0 ? armL : armR;
              return (
                <group key={s} position={[s * shX, shY, rz * 0.15]} rotation={r}>
                  <mesh position={[0, -0.09, 0]} castShadow>
                    <capsuleGeometry args={[0.055, 0.14, 6, 12]} />
                    <Fur dark rough={rough} />
                  </mesh>
                  <group position={[0, -0.2, 0]}>
                    <Paw holding={s < 0 ? holdL : holdR} />
                  </group>
                </group>
              );
            })}
            {/* cabeça */}
            <group position={[0, headY - 0.3, headZ]} rotation={head}>
              <group position={[0, 0.3, 0]}>
                {/* crânio quadradão */}
                <group scale={[1.04, 0.92, 1.08]}>
                  <mesh castShadow>
                    <sphereGeometry args={[HEAD_R, 48, 40]} />
                    <Fur />
                  </mesh>
                  <mesh renderOrder={2} position={[0, 0.03, 0]}>
                    <sphereGeometry args={[HEAD_R * 1.006, 48, 40, Math.PI / 2 - 0.85, 1.7, Math.PI / 2 - 0.95, 1.2]} />
                    <meshStandardMaterial map={eyesTex} transparent roughness={0.55} polygonOffset polygonOffsetFactor={-2} />
                  </mesh>
                </group>
                {/* focinho retangular */}
                <group position={[0, -0.13, HEAD_R * 0.66]} scale={[0.29, 0.19, 0.25]}>
                  <mesh castShadow>
                    <sphereGeometry args={[1, 40, 30]} />
                    <meshStandardMaterial color={CAPY.snout} roughness={0.6} />
                  </mesh>
                  <mesh renderOrder={2}>
                    <sphereGeometry args={[1.01, 40, 30, Math.PI / 2 - 1.0, 2.0, Math.PI / 2 - 0.9, 1.75]} />
                    <meshStandardMaterial map={mouthTex} transparent roughness={0.55} polygonOffset polygonOffsetFactor={-2} />
                  </mesh>
                </group>
                {/* orelhas */}
                {[-1, 1].map((s) => (
                  <group key={s} position={[s * HEAD_R * 0.7, HEAD_R * 0.68, -0.12]} rotation={[0, 0, -s * 0.45]} scale={0.72}>
                    <mesh scale={[1, 1, 0.55]} castShadow>
                      <sphereGeometry args={[0.085, 18, 14]} />
                      <Fur dark />
                    </mesh>
                    <mesh position={[0, 0, 0.035]} scale={[0.6, 0.6, 0.3]}>
                      <sphereGeometry args={[0.085, 14, 10]} />
                      <meshStandardMaterial color="#d98a7a" roughness={0.7} />
                    </mesh>
                  </group>
                ))}
                {/* topete */}
                {[-1, 0, 1].map((s, i) => (
                  <mesh key={s} position={[s * 0.05, HEAD_R * 0.86, 0.04]} rotation={[0.2 + messy * (rand(i + 7) - 0.5) * 2.2, 0, s * (0.4 + messy * 0.9)]} castShadow>
                    <coneGeometry args={[0.035, 0.13 + messy * 0.06, 8]} />
                    <Fur dark />
                  </mesh>
                ))}
                {flower && (
                  <group position={[HEAD_R * 0.86, HEAD_R * 0.5, 0.06]} rotation={[0, 0.6, -0.3]}>
                    <Flower />
                  </group>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Centro da cabeça (coordenadas locais, sem escala) para mirar a câmera em closes. */
export const capyHead = (inflate: number): [number, number, number] => {
  const k = Math.max(0, Math.min(1.2, inflate));
  const ke = k <= 1 ? k * k * (3 - 2 * k) : k;
  const ry = lerp(0.33, 0.92, ke), legLen = lerp(0.17, 0.05, ke);
  const bodyY = legLen + ry * 0.92;
  return [0, bodyY + ry * lerp(0.95, 0.78, ke) + HEAD_R * lerp(0.62, 0.55, ke), lerp(0.03, 0.32, ke) + 0.1];
};
/** Centro do corpo. */
export const capyBody = (inflate: number): [number, number, number] => {
  const k = Math.max(0, Math.min(1.2, inflate));
  const ke = k <= 1 ? k * k * (3 - 2 * k) : k;
  const ry = lerp(0.33, 0.92, ke);
  return [0, lerp(0.17, 0.05, ke) + ry * 0.92, 0];
};
