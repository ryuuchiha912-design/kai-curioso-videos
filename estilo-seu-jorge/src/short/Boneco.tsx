import { useMemo } from "react";
import * as THREE from "three";
import { Outlines } from "@react-three/drei";

// Boneco estilo "cabeça + tronco + pernas de palito", com rosto desenhado em 2D (textura).
export type Rosto = {
  fala: number; // 0..1
  surpresa: number; // 0..1
  sorriso: number; // 0..1
  palpebra: number; // 0..1 (pálpebra caída / desconfiado)
  piscar: number; // 0..1
  nervoso: number; // 0..1 (dentes cerrados)
  suor: number; // 0..1
  olharX: number; // -1..1
  olharY: number; // -1..1
  sobrancelha: number; // -1 (brava) .. 1 (preocupada/levantada)
};

export type Pose = {
  bracoE: number; // ângulo do ombro (rad, 0 = para baixo)
  bracoD: number;
  cotoveloE: number;
  cotoveloD: number;
  cabecaY: number; // giro da cabeça
  cabecaZ: number; // inclinação
};

export type Look = {
  pele: string;
  cabelo: string;
  cabeloTipo: "curto" | "longo" | "careca";
  camisa: string;
  listras?: string;
  calca: string;
  sapato: string;
};

export const ROSTO_NEUTRO: Rosto = { fala: 0, surpresa: 0, sorriso: 0, palpebra: 0, piscar: 0, nervoso: 0, suor: 0, olharX: 0, olharY: 0, sobrancelha: 0 };
export const POSE_NEUTRA: Pose = { bracoE: 0.12, bracoD: 0.12, cotoveloE: 0.3, cotoveloD: 0.3, cabecaY: 0, cabecaZ: 0 };

const CONTORNO = "#2b1d14";
const RH = 0.5; // raio da cabeça
const W = 512;

// ---------- desenho do rosto ----------
const desenhaRosto = (g: CanvasRenderingContext2D, r: Rosto, pele: string) => {
  g.clearRect(0, 0, W, W);
  g.lineCap = "round";
  g.lineJoin = "round";
  const cy = 250;
  const rx = 50 * (1 + r.surpresa * 0.12), ry = 58 * (1 + r.surpresa * 0.18);
  for (const lado of [-1, 1]) {
    const cx = W / 2 + lado * 62;
    // olho branco
    g.fillStyle = "#fbfaf6";
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    // pupila
    const pr = 13 * (1 - r.surpresa * 0.35);
    const px = cx + r.olharX * 22, py = cy + 6 + r.olharY * 20;
    g.fillStyle = "#17110d";
    g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath(); g.arc(px + pr * 0.35, py - pr * 0.4, pr * 0.3, 0, Math.PI * 2); g.fill();
    // pálpebra (desconfiado + piscar)
    const fecha = Math.min(1, Math.max(r.palpebra * 0.5, r.piscar));
    if (fecha > 0.01) {
      g.save();
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
      g.fillStyle = pele;
      const yLinha = cy - ry + fecha * ry * 2;
      g.fillRect(cx - rx - 5, cy - ry - 5, rx * 2 + 10, yLinha - (cy - ry) + 5);
      g.restore();
      g.strokeStyle = CONTORNO; g.lineWidth = 7;
      g.beginPath(); g.moveTo(cx - rx * Math.sqrt(1 - Math.min(0.99, ((yLinha - cy) / ry) ** 2)), yLinha);
      g.lineTo(cx + rx * Math.sqrt(1 - Math.min(0.99, ((yLinha - cy) / ry) ** 2)), yLinha); g.stroke();
    }
    // contorno do olho
    g.strokeStyle = CONTORNO; g.lineWidth = 7;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    // sobrancelha (traço grosso curvo)
    const sob = r.sobrancelha + r.surpresa * 0.8;
    const by = cy - ry - 22 - r.surpresa * 14;
    const inner = cx - lado * 34, outer = cx + lado * 38;
    const yIn = by - sob * 14 + (sob < 0 ? -sob * 4 : 0);
    const yOut = by + sob * 6;
    g.strokeStyle = "#3a2417"; g.lineWidth = 14;
    g.beginPath(); g.moveTo(inner, yIn);
    g.quadraticCurveTo(cx, Math.min(yIn, yOut) - 12, outer, yOut); g.stroke();
  }
  // boca
  const my = 372;
  g.strokeStyle = CONTORNO; g.lineWidth = 7;
  if (r.nervoso > 0.5) {
    const w = 64, h = 34;
    g.fillStyle = "#fbfaf6";
    g.beginPath(); g.roundRect(W / 2 - w, my - h / 2, w * 2, h, 14); g.fill(); g.stroke();
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(W / 2 - w, my); g.lineTo(W / 2 + w, my); g.stroke();
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(W / 2 + i * 17, my - h / 2); g.lineTo(W / 2 + i * 17, my + h / 2); g.stroke(); }
  } else {
    const abre = Math.max(r.fala * 34, r.surpresa * 46);
    const w = 30 + r.sorriso * 26 - r.surpresa * 6;
    if (abre > 4 || r.sorriso > 0.3) {
      const h = Math.max(abre, r.sorriso * 26);
      g.fillStyle = "#5b1a14";
      g.beginPath();
      if (r.sorriso > 0.3) {
        g.moveTo(W / 2 - w, my - 6);
        g.quadraticCurveTo(W / 2, my - 10, W / 2 + w, my - 6);
        g.quadraticCurveTo(W / 2 + w * 0.7, my + h * 1.4, W / 2, my + h * 1.3);
        g.quadraticCurveTo(W / 2 - w * 0.7, my + h * 1.4, W / 2 - w, my - 6);
      } else {
        g.ellipse(W / 2, my, w * 0.75, h / 2 + 3, 0, 0, Math.PI * 2);
      }
      g.fill();
      // língua
      g.save(); g.clip();
      g.fillStyle = "#c9524a";
      g.beginPath(); g.ellipse(W / 2, my + h * 0.9, w * 0.5, h * 0.45, 0, 0, Math.PI * 2); g.fill();
      if (r.sorriso > 0.3) { g.fillStyle = "#fbfaf6"; g.fillRect(W / 2 - w, my - 14, w * 2, 14); }
      g.restore();
      g.stroke();
    } else {
      g.beginPath(); g.moveTo(W / 2 - 22, my); g.quadraticCurveTo(W / 2, my + 4 + r.sorriso * 10, W / 2 + 22, my); g.stroke();
    }
  }
  // gota de suor
  if (r.suor > 0.02) {
    const sx = W / 2 + 140, sy = 175 + r.suor * 30;
    g.globalAlpha = Math.min(1, r.suor * 3);
    g.fillStyle = "#7cc7ee"; g.strokeStyle = "#2b6f99"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(sx, sy - 40);
    g.quadraticCurveTo(sx + 28, sy, sx, sy + 20); g.quadraticCurveTo(sx - 28, sy, sx, sy - 40);
    g.fill(); g.stroke();
    g.fillStyle = "#d8f1ff"; g.beginPath(); g.ellipse(sx - 7, sy + 2, 5, 9, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
};

const Mat = ({ c, r = 0.62 }: { c: string; r?: number }) => <meshStandardMaterial color={c} roughness={r} />;
const OL = ({ t = 0.012 }: { t?: number }) => <Outlines thickness={t} color={CONTORNO} />;

const listrasTex = (base: string, cor: string) => {
  const c = document.createElement("canvas"); c.width = 8; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = base; g.fillRect(0, 0, 8, 64);
  g.fillStyle = cor; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16, 8, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 1.5);
  t.colorSpace = THREE.SRGBColorSpace; return t;
};

const Braco = ({ lado, ombro, cotovelo, pele, manga }: { lado: 1 | -1; ombro: number; cotovelo: number; pele: string; manga: string }) => (
  <group position={[lado * 0.43, 2.2, 0]} rotation={[0, 0, lado * ombro]}>
    <mesh position={[lado * 0.02, -0.05, 0]} rotation={[0, 0, lado * 0.25]} castShadow>
      <cylinderGeometry args={[0.1, 0.12, 0.2, 16]} />
      <Mat c={manga} /><OL t={0.008} />
    </mesh>
    <mesh position={[0, -0.32, 0]} castShadow>
      <cylinderGeometry args={[0.028, 0.028, 0.5, 8]} />
      <Mat c={pele} />
    </mesh>
    <group position={[0, -0.56, 0]} rotation={[-cotovelo, 0, 0]}>
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.026, 0.44, 8]} />
        <Mat c={pele} />
      </mesh>
      <mesh position={[0, -0.46, 0]} castShadow>
        <sphereGeometry args={[0.065, 16, 12]} />
        <Mat c={pele} /><OL t={0.006} />
      </mesh>
    </group>
  </group>
);

export const Boneco = ({
  rosto, pose, look, position = [0, 0, 0], rotY = 0, pulo = 0,
}: { rosto: Rosto; pose: Pose; look: Look; position?: [number, number, number]; rotY?: number; pulo?: number }) => {
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = W;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { canvas: c, tex: t };
  }, []);
  desenhaRosto(canvas.getContext("2d")!, rosto, look.pele);
  tex.needsUpdate = true;

  const geo = useMemo(() => {
    const tronco = new THREE.LatheGeometry(
      [[0, 0], [0.4, 0], [0.44, 0.08], [0.45, 0.45], [0.42, 0.62], [0.3, 0.7], [0, 0.72]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
    const calca = new THREE.LatheGeometry(
      [[0, 0], [0.22, 0.02], [0.36, 0.1], [0.43, 0.25], [0.445, 0.4], [0, 0.4]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
    const L = Math.PI * 0.85;
    const face = new THREE.SphereGeometry(RH * 1.004, 48, 32, Math.PI / 2 - L / 2, L, Math.PI * 0.12, Math.PI * 0.72);
    const cabeloCurto = new THREE.SphereGeometry(RH * 1.06, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const cabeloLongo = new THREE.SphereGeometry(RH * 1.08, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);
    return { tronco, calca, face, cabeloCurto, cabeloLongo };
  }, []);
  const listras = useMemo(() => (look.listras ? listrasTex(look.camisa, look.listras) : null), [look.camisa, look.listras]);

  return (
    <group position={[position[0], position[1] + pulo, position[2]]} rotation={[0, rotY, 0]}>
      {/* pernas de palito + pés */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.17, 0, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
            <Mat c="#1d1d22" />
          </mesh>
          <mesh position={[0, 0.06, 0.04]} scale={[1, 0.75, 1.3]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <Mat c={look.sapato} r={0.4} /><OL t={0.006} />
          </mesh>
        </group>
      ))}
      {/* calça */}
      <mesh geometry={geo.calca} position={[0, 1.42, 0]} castShadow receiveShadow>
        <Mat c={look.calca} /><OL />
      </mesh>
      {/* tronco */}
      <mesh geometry={geo.tronco} position={[0, 1.8, 0]} castShadow receiveShadow>
        {listras ? <meshStandardMaterial map={listras} roughness={0.65} /> : <Mat c={look.camisa} />}
        <OL />
      </mesh>
      <Braco lado={-1} ombro={pose.bracoE} cotovelo={pose.cotoveloE} pele={look.pele} manga={look.camisa} />
      <Braco lado={1} ombro={pose.bracoD} cotovelo={pose.cotoveloD} pele={look.pele} manga={look.camisa} />

      {/* cabeça */}
      <group position={[0, 2.92, 0]} rotation={[0, pose.cabecaY, pose.cabecaZ]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[RH, 48, 32]} />
          <Mat c={look.pele} r={0.58} /><OL />
        </mesh>
        <mesh geometry={geo.face}>
          <meshStandardMaterial map={tex} transparent roughness={0.58} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        {look.cabeloTipo !== "careca" && (
          <mesh
            geometry={look.cabeloTipo === "longo" ? geo.cabeloLongo : geo.cabeloCurto}
            rotation={look.cabeloTipo === "longo" ? [-0.75, 0, 0] : [-0.42, 0, 0]}
            castShadow
          >
            <meshStandardMaterial color={look.cabelo} roughness={0.5} side={THREE.DoubleSide} />
            <OL />
          </mesh>
        )}
      </group>
    </group>
  );
};
