import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { canvasTexture } from "./textures";

/**
 * Personagem 2D (desenho chapado com contorno) dentro do cenário 3D:
 * cabeça grande, corpo de palito. É um "cartaz" que sempre vira de frente para a câmera.
 * Os pés ficam na `position`; `h` é a altura no mundo.
 */
export type FlatExpr = "neutral" | "smile" | "happy" | "surprised" | "worried" | "smug" | "sad" | "angry";
export type FlatPose = {
  armL?: number; armR?: number;     // ângulo do braço (rad): 0 = pra baixo, π/2 = na horizontal pra fora, π = pra cima
  elbowL?: number; elbowR?: number; // dobra do cotovelo (rad)
  walk?: number;                    // fase da caminhada (rad); undefined = parado
  lean?: number;                    // inclina o corpo (rad)
  headTilt?: number;                // inclina a cabeça (rad)
  bob?: number;                     // pulinho (0..1)
};
export type FlatFace = { expr: FlatExpr; look?: [number, number]; blink?: number; mouth?: number; sweat?: boolean; blush?: boolean };
export type FlatKind = "nico" | "general" | "pigeon";

const INK = "#1b1b1f";
const q = (v: number | undefined, s = 8) => Math.round((v ?? 0) * s) / s;

function eyes(ctx: CanvasRenderingContext2D, cx: number, cy: number, f: FlatFace, iris: string, r = 44) {
  const e = f.expr, [lx, ly] = f.look ?? [0, 0], blink = f.blink ?? 0;
  for (const s of [-1, 1]) {
    const x = cx + s * 72, y = cy;
    if (e === "happy" || blink > 0.6) {
      ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath();
      if (e === "happy") ctx.arc(x, y + 14, r * 0.7, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(x - r * 0.8, y); ctx.lineTo(x + r * 0.8, y); }
      ctx.stroke(); continue;
    }
    const big = e === "surprised" ? 1.12 : 1;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(x, y, r * big, r * 1.15 * big, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const ir = e === "surprised" ? r * 0.42 : r * 0.58;
    const px = x + lx * r * 0.4, py = y + ly * r * 0.35 + 4;
    ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(px, py, ir, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px, py, ir * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - ir * 0.35, py - ir * 0.4, ir * 0.28, 0, Math.PI * 2); ctx.fill();
    // pálpebra (atitude)
    const lid = e === "smug" ? 0.5 : e === "sad" ? 0.35 : e === "angry" ? 0.3 : 0;
    if (lid > 0) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, r * big, r * 1.15 * big, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#f8e4d6"; const tilt = e === "angry" ? s * 0.35 : e === "sad" ? -s * 0.3 : 0;
      ctx.translate(x, y - r * 1.15 + lid * 2.3 * r); ctx.rotate(tilt); ctx.fillRect(-r * 2, -r * 3, r * 4, r * 3);
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-r * 2, 0); ctx.lineTo(r * 2, 0); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(x, y, r * big, r * 1.15 * big, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // sobrancelha
    const by = y - r * 1.15 * big - 22 - (e === "surprised" ? 14 : 0);
    const bt = e === "worried" || e === "sad" ? -0.35 * s : e === "angry" ? 0.4 * s : e === "smug" ? (s < 0 ? 0.25 : -0.1) : 0;
    ctx.save(); ctx.translate(x, by); ctx.rotate(bt); ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-30, 4); ctx.quadraticCurveTo(0, -8, 30, 4); ctx.stroke(); ctx.restore();
  }
}
function mouth(ctx: CanvasRenderingContext2D, cx: number, my: number, f: FlatFace) {
  const e = f.expr, open = f.mouth ?? 0;
  ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.fillStyle = "#6e1f1f";
  if (open > 0.05 || e === "surprised") {
    const o = Math.max(open, e === "surprised" ? 0.7 : 0);
    ctx.beginPath(); ctx.ellipse(cx, my + 6, 18 + 8 * o, 8 + 22 * o, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); return;
  }
  ctx.beginPath();
  if (e === "happy") { ctx.moveTo(cx - 40, my - 6); ctx.quadraticCurveTo(cx, my + 50, cx + 40, my - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); return; }
  if (e === "smile") { ctx.moveTo(cx - 28, my); ctx.quadraticCurveTo(cx, my + 24, cx + 28, my); }
  else if (e === "smug") { ctx.moveTo(cx - 22, my + 6); ctx.quadraticCurveTo(cx + 6, my + 14, cx + 30, my - 6); }
  else if (e === "worried" || e === "sad" || e === "angry") { ctx.moveTo(cx - 24, my + 14); ctx.quadraticCurveTo(cx, my - 6, cx + 24, my + 14); }
  else { ctx.moveTo(cx - 16, my + 4); ctx.lineTo(cx + 16, my + 4); }
  ctx.stroke();
}
function limb(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, elbow: number, col: string, w: number, hand?: string) {
  // ângulo medido a partir da vertical para baixo; positivo abre pra fora (o chamador ajusta o lado)
  const a1 = ang, x1 = x + Math.sin(a1) * len * 0.5, y1 = y + Math.cos(a1) * len * 0.5;
  const a2 = a1 + elbow, x2 = x1 + Math.sin(a2) * len * 0.5, y2 = y1 + Math.cos(a2) * len * 0.5;
  for (const [c, lw] of [[INK, w + 10], [col, w]] as [string, number][]) {
    ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  if (hand) { ctx.fillStyle = hand; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x2, y2, w * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  return [x2, y2];
}

/** Desenha um humano palito (Nico ou general) num canvas 512x1024; pés em (256, 1000). */
function drawPerson(ctx: CanvasRenderingContext2D, kind: "nico" | "general", p: FlatPose, f: FlatFace) {
  const W = 512, cx = W / 2;
  const bob = (p.bob ?? 0) * -30;
  const walk = p.walk;
  const skin = kind === "nico" ? "#f8e4d6" : "#f1c7a0";
  const top = kind === "nico" ? "#f1f1f4" : "#5d6b3a";
  const pants = kind === "nico" ? "#2b2e3a" : "#4a5530";
  ctx.save(); ctx.translate(cx, 1000 + bob); ctx.rotate(p.lean ?? 0); ctx.translate(-cx, -1000);
  const hipY = 700;
  // pernas
  for (const s of [-1, 1]) {
    const sw = walk === undefined ? s * 0.06 : Math.sin(walk + (s > 0 ? Math.PI : 0)) * 0.45;
    const [fx, fy] = limb(ctx, cx + s * 14, hipY, sw, 290, 0, pants, 18);
    ctx.fillStyle = kind === "nico" ? "#f4f4f6" : "#4a3020"; ctx.strokeStyle = INK; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(fx + s * 10, fy + 4, 30, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // tronco: jaqueta/farda com volume (sombra chapada do lado direito)
  const shY = 505;
  const torso = () => { ctx.beginPath(); ctx.moveTo(cx - 58, shY + 6); ctx.quadraticCurveTo(cx, shY - 14, cx + 58, shY + 6); ctx.lineTo(cx + 64, hipY + 30); ctx.quadraticCurveTo(cx, hipY + 44, cx - 64, hipY + 30); ctx.closePath(); };
  ctx.fillStyle = top; ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineJoin = "round";
  torso(); ctx.fill();
  ctx.save(); torso(); ctx.clip(); ctx.fillStyle = "rgba(20,20,40,0.16)"; ctx.fillRect(cx + 8, shY - 20, 80, 300); ctx.restore();
  torso(); ctx.stroke();
  if (kind === "nico") {
    ctx.fillStyle = "#17171b"; ctx.beginPath(); ctx.moveTo(cx - 40, shY - 4); ctx.lineTo(cx + 40, shY - 4); ctx.lineTo(cx + 34, shY + 30); ctx.lineTo(cx - 34, shY + 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#17171b"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, shY + 30); ctx.lineTo(cx, hipY + 36); ctx.stroke();
    ctx.fillStyle = "#c9ccd6"; ctx.fillRect(cx - 60, hipY + 14, 120, 14);
  } else {
    ctx.fillStyle = "#2e2a20"; ctx.fillRect(cx - 7, shY + 10, 14, 90);
    ctx.fillStyle = "#3a2a1e"; ctx.fillRect(cx - 62, hipY - 10, 124, 22);
    ["#c62a2a", "#2c6fb6", "#e0b13a"].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(cx - 50 + i * 16, shY + 40, 13, 10); });
    ctx.fillStyle = "#e0b13a"; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx + 22, shY + 60 + i * 50, 6, 0, Math.PI * 2); ctx.fill(); }
  }
  // braços (mangas grossas, mão redonda)
  limb(ctx, cx - 56, shY + 22, -(p.armL ?? 0.15), 240, -(p.elbowL ?? 0), top, 26, skin);
  limb(ctx, cx + 56, shY + 22, (p.armR ?? 0.15), 240, (p.elbowR ?? 0), top, 26, skin);
  if (kind === "nico") { ctx.fillStyle = "#17171b"; ctx.strokeStyle = INK; ctx.lineWidth = 7; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 56, shY + 18, 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
  // cabeça grande
  const hx = cx, hy = 300;
  ctx.save(); ctx.translate(hx, hy + 170); ctx.rotate(p.headTilt ?? 0); ctx.translate(-hx, -(hy + 170));
  if (kind === "nico") {
    // cabelo de trás (chanel)
    ctx.fillStyle = "#141418"; ctx.strokeStyle = INK; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(hx - 205, hy + 150); ctx.bezierCurveTo(hx - 250, hy - 250, hx + 250, hy - 250, hx + 205, hy + 150);
    for (let i = 0; i <= 8; i++) { const x = hx + 205 - i * 51; ctx.lineTo(x - 25, hy + 120 + (i % 2) * 40); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 11;
  ctx.beginPath(); ctx.ellipse(hx, hy, 190, 178, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(hx, hy, 190, 178, 0, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "rgba(150,70,40,0.14)"; ctx.beginPath(); ctx.ellipse(hx + 120, hy + 40, 150, 200, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(hx, hy, 190, 178, 0, 0, Math.PI * 2); ctx.stroke();
  // orelhas
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + s * 188, hy + 20, 24, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  if (f.blush || f.expr === "happy") { ctx.fillStyle = "rgba(255,120,120,.4)"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + s * 112, hy + 70, 34, 18, 0, 0, Math.PI * 2); ctx.fill(); } }
  eyes(ctx, hx, hy + 6, f, kind === "nico" ? "#e2a236" : "#5a3a22");
  mouth(ctx, hx, hy + 112, f);
  if (kind === "nico") {
    // franja reta e pontas
    ctx.fillStyle = "#141418"; ctx.strokeStyle = INK; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(hx - 200, hy - 20); ctx.bezierCurveTo(hx - 210, hy - 230, hx + 210, hy - 230, hx + 200, hy - 20);
    const n = 9; for (let i = 0; i <= n; i++) { const x = hx + 180 - (360 * i) / n; ctx.lineTo(x, hy - 60 + (i % 2 ? -26 : 12)); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + s * 196, hy - 60); ctx.quadraticCurveTo(hx + s * 230, hy + 60, hx + s * 210, hy + 160); ctx.lineTo(hx + s * 170, hy + 60); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  } else {
    // quepe + bigode
    ctx.fillStyle = "#4e5a30"; ctx.strokeStyle = INK; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(hx - 190, hy - 70); ctx.bezierCurveTo(hx - 200, hy - 250, hx + 200, hy - 250, hx + 190, hy - 70); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1d1a14"; ctx.beginPath(); ctx.ellipse(hx, hy - 70, 210, 30, 0, 0, Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e0b13a"; ctx.beginPath(); ctx.arc(hx, hy - 140, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3a2a1e"; ctx.beginPath(); ctx.moveTo(hx - 70, hy + 92); ctx.quadraticCurveTo(hx - 30, hy + 60, hx, hy + 80); ctx.quadraticCurveTo(hx + 30, hy + 60, hx + 70, hy + 92); ctx.quadraticCurveTo(hx, hy + 104, hx - 70, hy + 92); ctx.fill(); ctx.stroke();
  }
  if (f.sweat) { ctx.fillStyle = "#9fe0ff"; ctx.strokeStyle = "#2a7fb8"; ctx.lineWidth = 6; const tx = hx + 160, ty = hy - 120; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 28, ty + 50, tx, ty + 64); ctx.quadraticCurveTo(tx - 28, ty + 50, tx, ty); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}

/** Pombo 2D de perfil (olhando pra direita) num canvas 512x512; pés em (256, 490). */
function drawPigeon(ctx: CanvasRenderingContext2D, p: FlatPose, f: FlatFace, goggles: boolean) {
  const peck = p.headTilt ?? 0, flap = p.armL ?? 0;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // pernas
  ctx.strokeStyle = "#e0705a"; ctx.lineWidth = 12;
  for (const dx of [-20, 20]) { ctx.beginPath(); ctx.moveTo(240 + dx, 400); ctx.lineTo(240 + dx, 485); ctx.lineTo(262 + dx, 488); ctx.stroke(); }
  // corpo e cauda
  ctx.fillStyle = "#9aa3b4"; ctx.strokeStyle = INK; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(110, 300); ctx.lineTo(40, 270); ctx.lineTo(60, 330); ctx.closePath(); ctx.fillStyle = "#4a5266"; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#9aa3b4"; ctx.beginPath(); ctx.ellipse(240, 330, 140, 92, -0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // asa
  ctx.save(); ctx.translate(210, 300); ctx.rotate(-flap * 0.9);
  ctx.fillStyle = "#7c8598"; ctx.beginPath(); ctx.ellipse(0, 20, 95, 52, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#2f3542"; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-40, 30); ctx.lineTo(10, 40); ctx.moveTo(-30, 55); ctx.lineTo(20, 60); ctx.stroke();
  ctx.restore();
  // pescoço + cabeça (gira para bicar)
  ctx.save(); ctx.translate(330, 280); ctx.rotate(peck * 1.0);
  ctx.fillStyle = "#6e9a8a"; ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(10, -40, 48, 62, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7c8598"; ctx.beginPath(); ctx.arc(40, -110, 62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2a2a30"; ctx.beginPath(); ctx.moveTo(96, -116); ctx.lineTo(140, -104); ctx.lineTo(96, -92); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4f1ea"; ctx.beginPath(); ctx.ellipse(94, -120, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  // olho grande
  const happy = f.expr === "happy";
  ctx.fillStyle = "#fff"; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(52, -126, 28, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (happy) { ctx.fillStyle = "#7c8598"; ctx.beginPath(); ctx.rect(20, -100, 64, 30); ctx.fill(); }
  ctx.fillStyle = "#e2672a"; ctx.beginPath(); ctx.arc(58, -124, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(60, -124, 7, 0, Math.PI * 2); ctx.fill();
  if (goggles) {
    ctx.strokeStyle = "#5a3a20"; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-18, -140); ctx.lineTo(30, -136); ctx.stroke();
    ctx.fillStyle = "rgba(170,220,255,.55)"; ctx.strokeStyle = "#6b4426"; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(54, -128, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** Plano que vira de frente para a câmera (só no eixo vertical). */
const Billboard: React.FC<{ children: React.ReactNode; position: [number, number, number] }> = ({ children, position }) => {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useLayoutEffect(() => {
    const g = ref.current; if (!g) return;
    const dx = camera.position.x - position[0], dz = camera.position.z - position[2];
    g.rotation.set(0, Math.atan2(dx, dz), 0);
  });
  return <group ref={ref} position={position}>{children}</group>;
};

export const FlatChar: React.FC<{
  kind: FlatKind; position?: [number, number, number]; h?: number; flip?: boolean;
  pose?: FlatPose; face?: FlatFace; goggles?: boolean; shadow?: boolean; children?: React.ReactNode;
}> = ({ kind, position = [0, 0, 0], h = 2.1, flip = false, pose = {}, face = { expr: "neutral" }, goggles = false, shadow = true, children }) => {
  const pigeon = kind === "pigeon";
  const [cw, ch] = pigeon ? [512, 512] : [512, 1024];
  const key = ["flat", kind, q(pose.armL), q(pose.armR), q(pose.elbowL), q(pose.elbowR), q(pose.walk, 4), q(pose.lean, 20), q(pose.headTilt, 20), q(pose.bob, 10),
    face.expr, q(face.look?.[0], 4), q(face.look?.[1], 4), q(face.blink, 2), q(face.mouth, 5), face.sweat, face.blush, goggles].join("|");
  const tex = canvasTexture(key, cw, ch, (ctx) => { ctx.clearRect(0, 0, cw, ch); if (pigeon) drawPigeon(ctx, pose, face, goggles); else drawPerson(ctx, kind as "nico" | "general", pose, face); });
  const w = h * (cw / ch);
  const footY = pigeon ? 490 / 512 : 1000 / 1024;
  return (
    <group>
      {shadow && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], position[1] + 0.01, position[2]]}><circleGeometry args={[w * (pigeon ? 0.3 : 0.28), 24]} /><meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} /></mesh>}
      <Billboard position={position}>
        <mesh position={[0, h * (0.5 - (1 - footY)) , 0]} scale={[flip ? -1 : 1, 1, 1]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} />
        </mesh>
        {children}
      </Billboard>
    </group>
  );
};
