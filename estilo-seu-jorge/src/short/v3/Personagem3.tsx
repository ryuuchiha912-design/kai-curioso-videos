import { ReactNode, useMemo } from "react";
import * as THREE from "three";
import { Outlines } from "@react-three/drei";

// ============================================================
// Personagem estilo "cabeça grande + corpo de pera + membros de palito"
// Rosto desenhado em 2D (textura dinâmica), contorno marrom grosso.
// ============================================================

export type Rosto = {
  fala: number;        // 0..1 boca abrindo
  surpresa: number;    // 0..1
  sorriso: number;     // 0..1 sorriso aberto (dentes)
  sorrisinho: number;  // 0..1 sorriso de canto (linha)
  palpebra: number;    // 0..1 pálpebra caída (cínico/desconfiado)
  olhosFelizes: number;// 0..1 olhos fechados em arco "^^"
  piscar: number;      // 0..1
  nervoso: number;     // 0..1 dentes cerrados
  assobio: number;     // 0..1 boquinha "o"
  suor: number;        // 0..1
  olharX: number; olharY: number;
  sobrancelha: number; // -1 brava .. 1 levantada
};
export const ROSTO: Rosto = { fala: 0, surpresa: 0, sorriso: 0, sorrisinho: 0, palpebra: 0, olhosFelizes: 0, piscar: 0, nervoso: 0, assobio: 0, suor: 0, olharX: 0, olharY: 0, sobrancelha: 0 };

export type Braco = { ombroZ: number; ombroX: number; cotovelo: number; cotoveloZ?: number };
export type Pose = { E: Braco; D: Braco; cabecaX: number; cabecaY: number; cabecaZ: number; corpoZ: number };
export const BRACO_SOLTO: Braco = { ombroZ: 0.12, ombroX: 0, cotovelo: 0.25 };
export const POSE: Pose = { E: BRACO_SOLTO, D: BRACO_SOLTO, cabecaX: 0, cabecaY: 0, cabecaZ: 0, corpoZ: 0 };

export type Roupa = "lisa" | "listrada" | "xadrez" | "terno";
export type Look = {
  pele: string;
  cabelo: string;
  cabeloTipo: "curto" | "longo" | "careca" | "lateral";
  barba?: boolean;
  roupa: Roupa;
  cor1: string;   // cor principal da roupa
  cor2?: string;  // listra / xadrez / gravata
  mangaLonga?: boolean;
  calca: string;
  sapato: string;
  oculosEscuros?: number; // 0..1 (anima entrada)
};

export const CONTORNO = "#2e1c12";
const LINHA = "#3b2416";
const RH = 0.56;
const W = 512;

// ---------------- rosto ----------------
const desenhaRosto = (g: CanvasRenderingContext2D, r: Rosto, pele: string, oculos = false) => {
  g.clearRect(0, 0, W, W);
  g.lineCap = "round"; g.lineJoin = "round";
  const cy = 255;
  const rx = 46 * (1 + r.surpresa * 0.15), ry = 54 * (1 + r.surpresa * 0.2);
  for (const lado of [-1, 1]) {
    const cx = W / 2 + lado * 64;
    // sobrancelha
    const sob = r.sobrancelha + r.surpresa * 0.9 + r.olhosFelizes * 0.3;
    const by = cy - ry - 26 - r.surpresa * 14;
    const inner = cx - lado * 32, outer = cx + lado * 40;
    g.strokeStyle = LINHA; g.lineWidth = 15;
    g.beginPath(); g.moveTo(inner, by - sob * 14); g.quadraticCurveTo(cx, by - 16 - Math.max(0, sob) * 8, outer, by + sob * 4); g.stroke();

    if (oculos) continue;
    if (r.olhosFelizes > 0.5) {
      g.lineWidth = 13;
      g.beginPath(); g.arc(cx, cy + 18, 36, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
      continue;
    }
    g.fillStyle = "#fbf8f1";
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    const pr = 12 * (1 - r.surpresa * 0.4);
    const px = cx + r.olharX * 22, py = cy + 4 + r.olharY * 22 + r.palpebra * 14;
    g.fillStyle = "#1a120c"; g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fill();
    // pálpebra
    const fecha = Math.min(1, Math.max(r.palpebra * 0.48, r.piscar));
    if (fecha > 0.01) {
      const yL = cy - ry + fecha * ry * 2;
      g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
      g.fillStyle = pele; g.fillRect(cx - rx - 4, cy - ry - 4, rx * 2 + 8, yL - (cy - ry) + 4);
      g.restore();
      const k = Math.min(0.995, Math.abs(yL - cy) / ry), hw = rx * Math.sqrt(1 - k * k);
      g.strokeStyle = LINHA; g.lineWidth = 8;
      g.beginPath(); g.moveTo(cx - hw, yL); g.quadraticCurveTo(cx, yL + 6, cx + hw, yL); g.stroke();
    }
    g.strokeStyle = LINHA; g.lineWidth = 8;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
  }

  // boca
  const my = 352;
  g.strokeStyle = LINHA; g.lineWidth = 8;
  if (r.nervoso > 0.5) {
    const w = 62, h = 34;
    g.fillStyle = "#fbf8f1"; g.beginPath(); g.roundRect(W / 2 - w, my - h / 2, w * 2, h, 14); g.fill(); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2 - w, my); g.lineTo(W / 2 + w, my); g.stroke();
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(W / 2 + i * 16, my - h / 2); g.lineTo(W / 2 + i * 16, my + h / 2); g.stroke(); }
  } else if (r.assobio > 0.5) {
    g.beginPath(); g.ellipse(W / 2 + 6, my - 6, 13, 16, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2 - 18, my - 30); g.quadraticCurveTo(W / 2 - 32, my - 10, W / 2 - 14, my + 4); g.stroke();
  } else {
    const abre = Math.max(r.fala * 36, r.surpresa * 48, r.sorriso * 30);
    if (abre > 5) {
      const w = 34 + r.sorriso * 30 - r.surpresa * 8;
      g.fillStyle = "#6a1f17";
      g.beginPath();
      if (r.sorriso > 0.3) {
        g.moveTo(W / 2 - w, my - 10);
        g.quadraticCurveTo(W / 2, my - 4, W / 2 + w, my - 10);
        g.quadraticCurveTo(W / 2 + w * 0.8, my + abre * 1.4, W / 2, my + abre * 1.3);
        g.quadraticCurveTo(W / 2 - w * 0.8, my + abre * 1.4, W / 2 - w, my - 10);
      } else g.ellipse(W / 2, my, w * 0.7, abre / 2 + 3, 0, 0, Math.PI * 2);
      g.fill();
      g.save(); g.clip();
      g.fillStyle = "#d1574d"; g.beginPath(); g.ellipse(W / 2, my + abre * 0.95, w * 0.55, abre * 0.45, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fbf8f1"; g.fillRect(W / 2 - w, my - 22, w * 2, r.sorriso > 0.3 ? 20 : 10 + abre * 0.15);
      g.restore(); g.stroke();
    } else {
      const s = r.sorrisinho;
      g.lineWidth = 9;
      g.beginPath(); g.moveTo(W / 2 - 34 - s * 8, my - 4 - s * 6);
      g.quadraticCurveTo(W / 2 + 4, my + 6 + s * 16, W / 2 + 36 + s * 10, my - 6 - s * 16); g.stroke();
    }
  }

  if (r.suor > 0.02) {
    const sx = W / 2 + 150, sy = 170 + r.suor * 26;
    g.globalAlpha = Math.min(1, r.suor * 3);
    g.fillStyle = "#86cdf0"; g.strokeStyle = "#2c6b93"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(sx, sy - 42); g.quadraticCurveTo(sx + 30, sy, sx, sy + 22); g.quadraticCurveTo(sx - 30, sy, sx, sy - 42); g.fill(); g.stroke();
    g.fillStyle = "#e1f4ff"; g.beginPath(); g.ellipse(sx - 8, sy + 2, 5, 10, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
};

// ---------------- texturas de roupa ----------------
const texRoupa = (roupa: Roupa, c1: string, c2 = "#222") => {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = c1; g.fillRect(0, 0, 1024, 512);
  if (roupa === "listrada") { g.fillStyle = c2; for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 1024, 32); }
  if (roupa === "xadrez") {
    g.globalAlpha = 0.35; g.fillStyle = c2;
    for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 26, 512);
    for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 1024, 26);
    g.globalAlpha = 0.5; g.fillStyle = "#f3e6d8";
    for (let x = 40; x < 1024; x += 64) g.fillRect(x, 0, 3, 512);
    for (let y = 40; y < 512; y += 64) g.fillRect(0, y, 1024, 3);
    g.globalAlpha = 1;
  }
  const cx = 512; // frente da roupa = centro da textura
  g.strokeStyle = LINHA; g.lineWidth = 4;
  if (roupa === "terno") {
    g.fillStyle = "rgba(255,255,255,.07)"; for (let x = 0; x < 1024; x += 22) g.fillRect(x, 0, 2, 512); // risca de giz
    // camisa branca em V + gravata
    g.fillStyle = "#f4f1ea";
    g.beginPath(); g.moveTo(cx - 70, 512); g.lineTo(cx, 300); g.lineTo(cx + 70, 512); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(cx - 14, 500); g.lineTo(cx, 470); g.lineTo(cx + 14, 500); g.lineTo(cx + 18, 330); g.lineTo(cx, 300); g.lineTo(cx - 18, 330); g.fill();
    g.beginPath(); g.moveTo(cx - 70, 512); g.lineTo(cx, 300); g.lineTo(cx + 70, 512); g.stroke();
    g.fillStyle = "#e8e4dc"; g.fillRect(cx + 95, 150, 50, 8);
  } else {
    // abotoamento + bolsos (camisa social)
    if (roupa === "xadrez") {
      g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, 512); g.stroke();
      g.fillStyle = "#efe6d6";
      for (let y = 60; y < 480; y += 85) { g.beginPath(); g.arc(cx + 10, y, 8, 0, Math.PI * 2); g.fill(); }
      for (const l of [-1, 1]) { g.strokeRect(cx + l * 95 - 42, 290, 84, 80); g.beginPath(); g.moveTo(cx + l * 95 - 42, 312); g.lineTo(cx + l * 95 + 42, 312); g.stroke(); }
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};

// Máscara da barba: faixa na frente/lados da cabeça, com o rosto recortado (UV equiretangular).
const mascaraBarba = () => {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, 1024, 512);
  // u: 0..1 = phi 0..2PI (frente +z em u=0.25); v: topo da textura = theta 0
  // a geometria cobre theta 0.36π..0.98π → y = (theta - 0.36) / 0.62 * 512
  g.fillStyle = "#fff";
  g.beginPath(); g.ellipse(256, 330, 265, 330, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#000";
  g.beginPath(); g.ellipse(256, 0, 168, 262, 0, 0, Math.PI * 2); g.fill(); // rosto (pele)
  g.fillRect(0, 0, 1024, 46); // acima das costeletas
  const t = new THREE.CanvasTexture(c); return t;
};

const Mat = ({ c, r = 0.62, map }: { c?: string; r?: number; map?: THREE.Texture | null }) =>
  <meshStandardMaterial color={map ? "#fff" : c} map={map ?? null} roughness={r} />;
const OL = ({ t = 0.02 }: { t?: number }) => <Outlines thickness={t} color={CONTORNO} />;

const BracoMesh = ({ lado, b, look, mapa, mao }: { lado: 1 | -1; b: Braco; look: Look; mapa: THREE.Texture | null; mao?: ReactNode }) => {
  const manga = look.mangaLonga || look.roupa === "terno";
  const corBraco = manga ? (look.roupa === "terno" ? look.cor1 : look.cor1) : look.pele;
  return (
    <group position={[lado * 0.42, 1.95, 0]} rotation={[b.ombroX, 0, lado * b.ombroZ]}>
      {!manga && (
        <mesh position={[lado * 0.02, -0.06, 0]} rotation={[0, 0, lado * 0.3]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 0.22, 16]} /><Mat c={look.cor1} map={mapa} /><OL t={0.012} />
        </mesh>
      )}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[manga ? 0.045 : 0.03, manga ? 0.045 : 0.03, 0.55, 10]} /><Mat c={corBraco} map={manga ? mapa : null} /><OL t={0.012} />
      </mesh>
      <group position={[0, -0.56, 0]} rotation={[-b.cotovelo, 0, lado * (b.cotoveloZ ?? 0)]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[manga ? 0.042 : 0.028, manga ? 0.042 : 0.028, 0.48, 10]} /><Mat c={corBraco} map={manga ? mapa : null} /><OL t={0.012} />
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 12]} /><Mat c={look.pele} /><OL t={0.012} />
        </mesh>
        {mao && <group position={[0, -0.55, 0.02]}>{mao}</group>}
      </group>
    </group>
  );
};

export const Personagem3 = ({
  rosto, pose, look, position = [0, 0, 0], rotY = 0, pulo = 0, maoD, maoE, escala = 1,
}: { rosto: Rosto; pose: Pose; look: Look; position?: [number, number, number]; rotY?: number; pulo?: number; maoD?: ReactNode; maoE?: ReactNode; escala?: number }) => {
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = W;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return { canvas: c, tex: t };
  }, []);
  desenhaRosto(canvas.getContext("2d")!, rosto, look.pele, (look.oculosEscuros ?? 0) > 0.5);
  tex.needsUpdate = true;

  const mascara = useMemo(mascaraBarba, []);
  const mapa = useMemo(() => texRoupa(look.roupa, look.cor1, look.cor2), [look.roupa, look.cor1, look.cor2]);
  const geo = useMemo(() => {
    const v = (a: number[][]) => a.map(([x, y]) => new THREE.Vector2(x, y));
    return {
      tronco: new THREE.LatheGeometry(v([[0, 0], [0.44, 0], [0.53, 0.1], [0.56, 0.3], [0.52, 0.55], [0.42, 0.72], [0.26, 0.8], [0, 0.82]]), 48, Math.PI),
      calca: new THREE.LatheGeometry(v([[0, 0], [0.24, 0.02], [0.4, 0.1], [0.47, 0.24], [0.47, 0.36], [0, 0.36]]), 48),
      face: new THREE.SphereGeometry(RH * 1.004, 56, 36, Math.PI / 2 - (Math.PI * 0.85) / 2, Math.PI * 0.85, Math.PI * 0.12, Math.PI * 0.72),
      curto: new THREE.SphereGeometry(RH * 1.05, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42),
      longo: new THREE.SphereGeometry(RH * 1.07, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.6),
      lateral: new THREE.SphereGeometry(RH * 1.04, 48, 24, Math.PI * 1.1, Math.PI * 0.8, Math.PI * 0.25, Math.PI * 0.35),
      barba: new THREE.SphereGeometry(RH * 1.025, 64, 40, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.62),
    };
  }, []);

  const ocl = look.oculosEscuros ?? 0;
  return (
    <group position={[position[0], position[1] + pulo, position[2]]} rotation={[0, rotY, 0]} scale={escala}>
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.17, 0, 0]}>
          <mesh position={[0, 0.66, 0]} castShadow><cylinderGeometry args={[0.032, 0.032, 1.25, 8]} /><Mat c="#1e1e22" /><OL t={0.01} /></mesh>
          <mesh position={[0, 0.06, 0.04]} scale={[1, 0.72, 1.35]} castShadow><sphereGeometry args={[0.085, 16, 12]} /><Mat c={look.sapato} r={0.4} /><OL t={0.012} /></mesh>
        </group>
      ))}
      <group rotation={[0, 0, pose.corpoZ]} position={[0, 1.2, 0]}>
        <group position={[0, -1.2, 0]}>
          <mesh geometry={geo.calca} position={[0, 1.18, 0]} castShadow receiveShadow><Mat c={look.calca} /><OL /></mesh>
          <mesh geometry={geo.tronco} position={[0, 1.42, 0]} castShadow receiveShadow><Mat map={mapa} /><OL /></mesh>
          {/* gola */}
          {look.roupa !== "listrada" && (
            <group position={[0, 2.2, 0.05]}>
              {[-1, 1].map((l) => (
                <mesh key={l} position={[l * 0.12, -0.02, 0.2]} rotation={[0.9, 0, l * 0.6]} castShadow>
                  <boxGeometry args={[0.2, 0.16, 0.025]} />
                  <Mat c={look.roupa === "terno" ? look.cor1 : look.cor1} map={look.roupa === "xadrez" ? mapa : null} /><OL t={0.008} />
                </mesh>
              ))}
            </group>
          )}
          <BracoMesh lado={-1} b={pose.E} look={look} mapa={mapa} mao={maoE} />
          <BracoMesh lado={1} b={pose.D} look={look} mapa={mapa} mao={maoD} />

          {/* cabeça */}
          <group position={[0, 2.72, 0]} rotation={[pose.cabecaX, pose.cabecaY, pose.cabecaZ]}>
            <mesh castShadow receiveShadow scale={[1, 1.04, 0.96]}><sphereGeometry args={[RH, 56, 36]} /><Mat c={look.pele} r={0.6} /><OL t={0.022} /></mesh>
            <mesh geometry={geo.face} scale={[1, 1.04, 0.96]}>
              <meshStandardMaterial map={tex} transparent roughness={0.6} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
            {look.barba && (
              <mesh geometry={geo.barba} scale={[1, 1.04, 0.96]} castShadow>
                <meshStandardMaterial color={look.cabelo} roughness={0.8} alphaMap={mascara} alphaTest={0.5} side={THREE.DoubleSide} />
              </mesh>
            )}
            {look.cabeloTipo !== "careca" && (
              <mesh geometry={look.cabeloTipo === "longo" ? geo.longo : look.cabeloTipo === "lateral" ? geo.lateral : geo.curto}
                rotation={look.cabeloTipo === "longo" ? [-0.75, 0, 0] : look.cabeloTipo === "lateral" ? [0, 0, 0] : [-0.4, 0, 0]}
                scale={[1, 1.04, 0.96]} castShadow>
                <meshStandardMaterial color={look.cabelo} roughness={0.45} side={THREE.DoubleSide} /><OL t={0.02} />
              </mesh>
            )}
            {ocl > 0.01 && (
              <group position={[0, 0.06 + (1 - ocl) * 0.5, 0]} scale={0.6 + ocl * 0.4}>
                {[-1, 1].map((l) => (
                  <mesh key={l} position={[l * 0.18, 0, 0.5]} rotation={[0, l * 0.34, 0]} scale={[1, 0.85, 0.3]}>
                    <sphereGeometry args={[0.135, 24, 16]} /><meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.4} />
                  </mesh>
                ))}
                <mesh position={[0, 0.02, 0.555]}><boxGeometry args={[0.1, 0.022, 0.03]} /><meshStandardMaterial color="#0c0c0e" /></mesh>
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
