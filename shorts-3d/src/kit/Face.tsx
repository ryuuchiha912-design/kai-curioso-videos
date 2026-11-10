import * as THREE from "three";
import { canvasTexture } from "./textures";

/**
 * Rosto = textura desenhada em código sobre a frente da cabeça.
 * Trocar de expressão é só trocar o desenho. Tudo da mesma "família" visual.
 */
export type Expr =
  | "neutral" | "smile" | "happy" | "joy" | "excited" | "surprised" | "amazed"
  | "sad" | "worried" | "determined" | "tearsJoy" | "focused" | "wink" | "talk";

export type FaceState = {
  expr: Expr;
  blink?: number; // 0..1
  look?: [number, number]; // -1..1 direção do olhar
  mouthOpen?: number; // 0..1 sobrescreve boca (fala)
  sweat?: boolean;
  blush?: boolean;
  tears?: boolean;
};

const S = 512;
const INK = "#2b1a12";

const q = (v: number, steps = 6) => Math.round(v * steps) / steps;

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, st: FaceState, side: -1 | 1) {
  const e = st.expr;
  const blink = Math.max(st.blink ?? 0, 0);
  const [lx, ly] = st.look ?? [0, 0];
  let w = 34, h = 46;
  if (e === "surprised" || e === "amazed" || e === "excited") { w = 40; h = 56; }
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
  // branco do olho
  ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.ellipse(x, y, w, hh, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // pupila
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w - 3, Math.max(hh - 3, 1), 0, 0, Math.PI * 2); ctx.clip();
  const pr = e === "surprised" ? 14 : e === "amazed" || e === "excited" ? 27 : 22;
  const px = x + lx * w * 0.45, py = y + ly * hh * 0.4 + 4;
  ctx.fillStyle = "#3b2416"; ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 1.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#120a06"; ctx.beginPath(); ctx.ellipse(px, py + 2, pr * 0.55, pr * 0.65, 0, 0, Math.PI * 2); ctx.fill();
  // brilhos
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.45, pr * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + pr * 0.35, py + pr * 0.35, pr * 0.14, 0, Math.PI * 2); ctx.fill();
  if (e === "amazed" || e === "excited") {
    // estrelinha de brilho
    ctx.save(); ctx.translate(px + pr * 0.2, py - pr * 0.1); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 11; const a = (i * Math.PI) / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

function brow(ctx: CanvasRenderingContext2D, x: number, y: number, st: FaceState, side: -1 | 1) {
  const e = st.expr;
  let tilt = 0, lift = 0;
  if (e === "sad" || e === "worried") { tilt = 0.35; lift = 2; }
  if (e === "determined" || e === "focused") { tilt = -0.4; lift = 10; }
  if (e === "surprised" || e === "amazed") lift = -16;
  if (e === "excited" || e === "happy" || e === "joy" || e === "tearsJoy") lift = -8;
  ctx.save(); ctx.translate(x, y - 66 + lift); ctx.rotate(tilt * side);
  ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-26, 4); ctx.quadraticCurveTo(0, -8, 26, 4); ctx.stroke();
  ctx.restore();
}

function mouth(ctx: CanvasRenderingContext2D, x: number, y: number, st: FaceState) {
  const e = st.expr;
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.lineJoin = "round";
  const open = st.mouthOpen;
  const openMouth = (w: number, h: number) => {
    ctx.fillStyle = "#6e1f1f";
    ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + h * 2, x + w, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    // língua
    ctx.save(); ctx.clip(); ctx.fillStyle = "#e46b6b";
    ctx.beginPath(); ctx.ellipse(x, y + h * 1.2, w * 0.55, h * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // dentes
    if (h > 14) { ctx.fillStyle = "#fff"; ctx.fillRect(x - w * 0.6, y + 2, w * 1.2, 9); }
  };
  if (open !== undefined && open > 0.05 && e !== "sad") {
    if (e === "surprised" || e === "amazed") {
      ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(x, y + 12, 18 + 6 * open, 14 + 22 * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else openMouth(40 + 14 * open, 8 + 26 * open);
    return;
  }
  switch (e) {
    case "neutral": case "focused":
      ctx.beginPath(); ctx.moveTo(x - 22, y + 6); ctx.quadraticCurveTo(x, y + 12, x + 22, y + 6); ctx.stroke(); break;
    case "smile": case "wink": case "determined":
      ctx.beginPath(); ctx.moveTo(x - 36, y); ctx.quadraticCurveTo(x, y + 30, x + 36, y); ctx.stroke(); break;
    case "talk": openMouth(36, 16); break;
    case "happy": openMouth(46, 22); break;
    case "joy": case "excited": case "tearsJoy": openMouth(58, 34); break;
    case "surprised": case "amazed":
      ctx.fillStyle = "#6e1f1f"; ctx.beginPath(); ctx.ellipse(x, y + 14, 20, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); break;
    case "sad":
      ctx.beginPath(); ctx.moveTo(x - 30, y + 22); ctx.quadraticCurveTo(x, y - 2, x + 30, y + 22); ctx.stroke(); break;
    case "worried":
      ctx.beginPath(); ctx.moveTo(x - 32, y + 12);
      ctx.bezierCurveTo(x - 16, y, x - 8, y + 22, x, y + 12); ctx.bezierCurveTo(x + 8, y, x + 16, y + 22, x + 32, y + 12); ctx.stroke(); break;
  }
}

export function faceTexture(st: FaceState) {
  const look = st.look ?? [0, 0];
  const key = [st.expr, q(st.blink ?? 0, 4), q(look[0]), q(look[1]), q(st.mouthOpen ?? -1, 5), st.sweat, st.blush, st.tears].join("|");
  return canvasTexture(`face-${key}`, S, S, (ctx) => {
    ctx.clearRect(0, 0, S, S);
    const cy = S * 0.47, dx = S * 0.135;
    // traços maiores: olhos grandes são a alma do estilo
    ctx.translate(S / 2, cy); ctx.scale(1.42, 1.42); ctx.translate(-S / 2, -cy - 6);
    if (st.blush || st.expr === "joy" || st.expr === "excited" || st.expr === "tearsJoy") {
      ctx.fillStyle = "rgba(255,110,110,0.45)";
      ctx.beginPath(); ctx.ellipse(S / 2 - dx * 1.45, cy + 62, 36, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(S / 2 + dx * 1.45, cy + 62, 36, 20, 0, 0, Math.PI * 2); ctx.fill();
    }
    eye(ctx, S / 2 - dx, cy, st, -1); eye(ctx, S / 2 + dx, cy, st, 1);
    brow(ctx, S / 2 - dx, cy, st, -1); brow(ctx, S / 2 + dx, cy, st, 1);
    mouth(ctx, S / 2, cy + 92, st);
    if (st.tears || st.expr === "tearsJoy") {
      ctx.fillStyle = "#7fd3ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 4;
      for (const s of [-1, 1]) {
        const tx = S / 2 + s * (dx + 30), ty = cy + 40;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + s * 16, ty + 40, tx, ty + 56); ctx.quadraticCurveTo(tx - s * 16, ty + 40, tx, ty); ctx.fill(); ctx.stroke();
      }
    }
    if (st.sweat) {
      const tx = S / 2 + dx * 2.4, ty = cy - 90;
      ctx.fillStyle = "#9fe0ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 26, ty + 46, tx, ty + 60); ctx.quadraticCurveTo(tx - 26, ty + 46, tx, ty); ctx.fill(); ctx.stroke();
    }
  });
}

/** Retalho de esfera na frente da cabeça onde o rosto é aplicado. */
export const FacePatch: React.FC<{ radius: number; state: FaceState }> = ({ radius, state }) => {
  const tex = faceTexture(state);
  const W = 1.9, H = 1.7;
  return (
    <mesh renderOrder={2}>
      <sphereGeometry args={[radius * 1.004, 48, 48, Math.PI / 2 - W / 2, W, Math.PI / 2 - H / 2, H]} />
      <meshStandardMaterial map={tex} transparent roughness={0.55} polygonOffset polygonOffsetFactor={-2} side={THREE.FrontSide} />
    </mesh>
  );
};
