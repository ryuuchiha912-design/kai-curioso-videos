import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, Outlines, Billboard } from "@react-three/drei";
import { CONTORNO } from "./Personagem3";

const M = ({ c, r = 0.7, e, ei = 0, map }: { c?: string; r?: number; e?: string; ei?: number; map?: THREE.Texture }) => (
  <meshStandardMaterial color={map ? "#fff" : c} map={map ?? null} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} />
);
const OL = ({ t = 0.012 }: { t?: number }) => <Outlines thickness={t} color={CONTORNO} />;

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};

const cidadeNoite = (g: CanvasRenderingContext2D) => {
  const gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, "#6f8fae"); gr.addColorStop(1, "#a9bfd3");
  g.fillStyle = gr; g.fillRect(0, 0, 400, 300);
  for (let b = 0; b < 10; b++) {
    const x = b * 42 - 6, w = 38 + ((b * 13) % 16), h = 110 + ((b * 67) % 140);
    g.fillStyle = b % 2 ? "#7d93ab" : "#8aa0b7"; g.fillRect(x, 300 - h, w, h);
    for (let wy = 300 - h + 8; wy < 292; wy += 16) for (let wx = x + 5; wx < x + w - 5; wx += 10)
      if (((wx * 7 + wy * 3 + b) % 4) < 1) { g.fillStyle = "#e8eef5"; g.fillRect(wx, wy, 4, 6); }
  }
};

const cartaoPostal = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#f2e9d8"; g.fillRect(0, 0, 300, 220);
  g.fillStyle = "#7cc6e6"; g.fillRect(10, 10, 280, 120);
  g.fillStyle = "#f3d07a"; g.fillRect(10, 130, 280, 50);
  g.fillStyle = "#f5c043"; g.beginPath(); g.arc(230, 50, 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#6b4a2b"; g.lineWidth = 8; g.beginPath(); g.moveTo(110, 170); g.quadraticCurveTo(100, 100, 125, 60); g.stroke();
  g.fillStyle = "#2f8a4c"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(125 + Math.cos(i * 1.3) * 26, 58 + Math.sin(i * 1.3) * 10, 32, 9, i * 1.3, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#c2412d"; g.font = "bold 26px sans-serif"; g.textAlign = "center"; g.fillText("BOAS FÉRIAS!", 150, 208);
};

const calendario = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#f6f2ea"; g.fillRect(0, 0, 256, 300);
  g.fillStyle = "#c8383a"; g.fillRect(0, 0, 256, 60);
  g.fillStyle = "#fff"; g.font = "bold 34px sans-serif"; g.textAlign = "center"; g.fillText("MAIO", 128, 44);
  g.font = "bold 20px sans-serif";
  for (let d = 1; d <= 31; d++) {
    const c = (d + 2) % 7, r = Math.floor((d + 2) / 7);
    g.fillStyle = c === 0 ? "#c8383a" : "#333"; g.fillText(String(d), 22 + c * 35, 95 + r * 40);
  }
  g.strokeStyle = "#c8383a"; g.lineWidth = 3; g.beginPath(); g.arc(22 + 5 * 35, 88 + 2 * 40, 16, 0, Math.PI * 2); g.stroke();
};

const relogio = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#f7f4ee"; g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#222"; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  for (let h = 1; h <= 12; h++) { const a = (h / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(String(h), 128 + Math.cos(a) * 95, 128 + Math.sin(a) * 95); }
};

const telaCelular = (g: CanvasRenderingContext2D) => {
  const gr = g.createLinearGradient(0, 0, 128, 256); gr.addColorStop(0, "#8f6bff"); gr.addColorStop(1, "#ff7bb0");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 16; i++) { g.fillStyle = ["#fff", "#ffd36b", "#7be0ff", "#9cff9c"][i % 4]; g.beginPath(); g.roundRect(14 + (i % 4) * 27, 50 + Math.floor(i / 4) * 30, 20, 20, 5); g.fill(); }
  g.fillStyle = "#fff"; g.font = "bold 20px sans-serif"; g.textAlign = "center"; g.fillText("10:02", 64, 32);
};

export const Celular = () => {
  const t = useMemo(() => canvasTex(128, 256, telaCelular), []);
  return (
    <group rotation={[1.2, 0, 0.2]}>
      <RoundedBox args={[0.13, 0.25, 0.018]} radius={0.008}><M c="#151515" r={0.3} /><OL t={0.006} /></RoundedBox>
      <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.115, 0.23]} /><meshBasicMaterial map={t} /></mesh>
    </group>
  );
};

export const Joinha = () => (
  <mesh position={[0, 0.07, 0.02]} rotation={[0, 0, 0.1]}>
    <capsuleGeometry args={[0.025, 0.06, 6, 10]} /><M c="#e3b58e" /><OL t={0.006} />
  </mesh>
);

// Balão de pensamento com ícone + texto
export const BalaoPensamento = ({ pos, escala, texto }: { pos: [number, number, number]; escala: number; texto: string }) => {
  const t = useMemo(() => canvasTex(256, 256, (g) => {
    g.fillStyle = "#7cc6e6"; g.beginPath(); g.arc(128, 92, 62, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(128, 92, 62, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#f3d07a"; g.fillRect(60, 112, 140, 50); g.fillStyle = "#4aa3c9"; g.fillRect(60, 104, 140, 10);
    g.fillStyle = "#f5c043"; g.beginPath(); g.arc(160, 62, 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#6b4a2b"; g.lineWidth = 6; g.beginPath(); g.moveTo(110, 140); g.quadraticCurveTo(104, 90, 120, 66); g.stroke();
    g.fillStyle = "#2f8a4c"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(120 + Math.cos(i * 1.3) * 18, 64 + Math.sin(i * 1.3) * 7, 22, 6, i * 1.3, 0, Math.PI * 2); g.fill(); }
    g.restore();
    g.fillStyle = "#2a2a2a"; g.font = "900 40px Nunito, sans-serif"; g.textAlign = "center"; g.fillText(texto, 128, 210);
  }), [texto]);
  if (escala <= 0.01) return null;
  const nuvem: [number, number, number][] = [[0, 0, 0.42], [0.32, 0.1, 0.3], [-0.32, 0.1, 0.3], [0.25, -0.25, 0.3], [-0.25, -0.25, 0.3], [0, 0.32, 0.3], [0.35, 0.3, 0.22], [-0.35, 0.3, 0.22]];
  return (
    <Billboard position={pos}>
      <group scale={escala}>
        {nuvem.map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, -0.15]} scale={[1, 1, 0.4]}><sphereGeometry args={[r, 24, 16]} /><M c="#f7f5f0" r={0.8} /><OL t={0.015} /></mesh>
        ))}
        <mesh position={[0, 0.02, 0.08]}><planeGeometry args={[0.72, 0.72]} /><meshBasicMaterial map={t} transparent /></mesh>
        <mesh position={[-0.42, -0.55, -0.1]} scale={[1, 1, 0.4]}><sphereGeometry args={[0.1, 16, 12]} /><M c="#f7f5f0" /><OL t={0.012} /></mesh>
        <mesh position={[-0.55, -0.75, -0.1]} scale={[1, 1, 0.4]}><sphereGeometry args={[0.06, 16, 12]} /><M c="#f7f5f0" /><OL t={0.01} /></mesh>
      </group>
    </Billboard>
  );
};

export const Escritorio3 = ({ frame }: { frame: number }) => {
  const tex = useMemo(() => ({
    cidade: canvasTex(400, 300, cidadeNoite),
    postal: canvasTex(300, 220, cartaoPostal),
    cal: canvasTex(256, 300, calendario),
    relogio: canvasTex(256, 256, relogio),
  }), []);
  const lava = Math.sin(frame * 0.05);
  return (
    <group>
      {/* piso, paredes, teto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[16, 16]} /><M c="#8d8a83" r={0.85} /></mesh>
      <mesh position={[0, 3, -1.6]} receiveShadow><planeGeometry args={[16, 6]} /><M c="#b8ab95" r={0.95} /></mesh>
      <mesh position={[-3.6, 3, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[10, 6]} /><M c="#ad9f88" r={0.95} /></mesh>

      {/* janela com persiana */}
      <group position={[1.55, 2.55, -1.56]}>
        <mesh position={[0, 0, 0.01]}><planeGeometry args={[1.8, 1.6]} /><meshBasicMaterial map={tex.cidade} /></mesh>
        <RoundedBox args={[2.0, 0.09, 0.12]} radius={0.02} position={[0, 0.84, 0.05]}><M c="#e9e4da" /><OL /></RoundedBox>
        <RoundedBox args={[2.1, 0.08, 0.32]} radius={0.02} position={[0, -0.84, 0.12]} castShadow><M c="#e9e4da" /><OL /></RoundedBox>
        {[-1, 1].map((l) => <RoundedBox key={l} args={[0.09, 1.7, 0.12]} radius={0.02} position={[l * 0.96, 0, 0.05]}><M c="#e9e4da" /><OL /></RoundedBox>)}
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i} position={[0, 0.78 - i * 0.045, 0.1]} rotation={[0.5, 0, 0]} castShadow><boxGeometry args={[1.84, 0.04, 0.005]} /><M c="#e8e3d8" r={0.5} /></mesh>
        ))}
        {/* aquecedor */}
        <group position={[0.3, -1.35, 0.08]}>
          {Array.from({ length: 8 }, (_, i) => <RoundedBox key={i} args={[0.08, 0.5, 0.12]} radius={0.03} position={[i * 0.1 - 0.35, 0, 0]}><M c="#ece9e2" r={0.4} /><OL t={0.006} /></RoundedBox>)}
        </group>
      </group>

      {/* cartão postal, relógio */}
      <mesh position={[-0.55, 3.1, -1.58]} rotation={[0, 0, 0.04]}><planeGeometry args={[0.66, 0.48]} /><M map={tex.postal} r={0.8} /></mesh>
      <group position={[-1.7, 3.7, -1.57]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.36, 0.36, 0.05, 40]} /><M c="#222" /><OL /></mesh>
        <mesh position={[0, 0, 0.03]}><circleGeometry args={[0.33, 40]} /><M map={tex.relogio} r={0.5} /></mesh>
        <mesh position={[0, 0.08, 0.045]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.02, 0.18, 0.01]} /><M c="#111" /></mesh>
        <mesh position={[0.08, 0, 0.045]} rotation={[0, 0, -1.4]}><boxGeometry args={[0.015, 0.24, 0.01]} /><M c="#111" /></mesh>
      </group>

      {/* porta + calendário (lado esquerdo) */}
      <group position={[-2.55, 0, -1.55]}>
        <mesh position={[0, 1.45, 0.02]}><planeGeometry args={[1.2, 2.9]} /><M c="#e9e6df" r={0.9} e="#fffaf0" ei={0.25} /></mesh>
        {[-1, 1].map((l) => <RoundedBox key={l} args={[0.1, 3.0, 0.15]} radius={0.02} position={[l * 0.65, 1.5, 0.06]}><M c="#e9e4da" /><OL /></RoundedBox>)}
        <RoundedBox args={[1.4, 0.1, 0.15]} radius={0.02} position={[0, 3.0, 0.06]}><M c="#e9e4da" /><OL /></RoundedBox>
        <group position={[-0.58, 0, 0.1]} rotation={[0, 1.1, 0]}>
          <RoundedBox args={[1.15, 2.85, 0.07]} radius={0.02} position={[0.58, 1.45, 0]} castShadow><M c="#4f5a66" r={0.5} /><OL /></RoundedBox>
          <mesh position={[1.02, 1.35, 0.07]}><sphereGeometry args={[0.06, 16, 12]} /><M c="#c9a24a" r={0.25} /></mesh>
        </group>
        <mesh position={[1.25, 2.35, -0.02]}><planeGeometry args={[0.6, 0.7]} /><M map={tex.cal} r={0.8} /></mesh>
      </group>

      {/* mesa */}
      <group position={[0, 0, 0.95]}>
        <RoundedBox args={[3.2, 0.1, 1.1]} radius={0.03} position={[0, 1.1, 0]} castShadow receiveShadow><M c="#d6c6a6" r={0.6} /><OL /></RoundedBox>
        {[-1, 1].map((l) => (
          <group key={l} position={[l * 1.15, 0.53, 0]}>
            <RoundedBox args={[0.8, 1.06, 1.0]} radius={0.02} castShadow receiveShadow><M c="#9a9488" r={0.7} /><OL /></RoundedBox>
            {[0.22, -0.2].map((y) => <mesh key={y} position={[0, y, 0.505]}><boxGeometry args={[0.7, 0.36, 0.01]} /><M c="#8a8478" /></mesh>)}
            {[0.22, -0.2].map((y) => <mesh key={`p${y}`} position={[0, y + 0.12, 0.52]}><boxGeometry args={[0.2, 0.03, 0.03]} /><M c="#5d574d" /></mesh>)}
          </group>
        ))}
        {/* luminária de lava */}
        <group position={[0.45, 1.15, -0.05]}>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.1, 0.13, 0.16, 20]} /><M c="#1f1f22" r={0.3} /><OL t={0.008} /></mesh>
          <mesh position={[0, 0.36, 0]}><cylinderGeometry args={[0.07, 0.11, 0.42, 20]} /><meshStandardMaterial color="#ff6fb5" emissive="#ff4fa0" emissiveIntensity={0.9} transparent opacity={0.85} roughness={0.15} /></mesh>
          {[0, 1, 2].map((i) => <mesh key={i} position={[Math.sin(i * 2) * 0.02, 0.22 + ((lava * 0.5 + 0.5 + i * 0.33) % 1) * 0.28, 0]}><sphereGeometry args={[0.035 + i * 0.008, 12, 8]} /><meshBasicMaterial color="#ffd0a8" /></mesh>)}
          <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.04, 0.07, 0.1, 20]} /><M c="#1f1f22" r={0.3} /><OL t={0.008} /></mesh>
          <pointLight position={[0, 0.4, 0.2]} intensity={0.7} color="#ff6fb5" distance={1.2} />
        </group>
        {/* cacto */}
        <group position={[-0.75, 1.15, 0.25]}>
          <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.12, 0.1, 0.18, 20]} /><M c="#2f5f79" /><OL t={0.008} /></mesh>
          <mesh position={[0, 0.35, 0]}><capsuleGeometry args={[0.06, 0.3, 6, 12]} /><M c="#4f8a3f" /><OL t={0.008} /></mesh>
          <mesh position={[0.09, 0.38, 0]} rotation={[0, 0, -0.6]}><capsuleGeometry args={[0.035, 0.1, 6, 10]} /><M c="#4f8a3f" /><OL t={0.006} /></mesh>
          <mesh position={[0, 0.58, 0]}><sphereGeometry args={[0.03, 10, 8]} /><M c="#e94f7a" /></mesh>
        </group>
        {/* caneca */}
        <group position={[-1.05, 1.15, -0.1]}>
          <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.08, 0.08, 0.2, 20]} /><M c="#2c4f9e" r={0.3} /><OL t={0.008} /></mesh>
          <mesh position={[0.09, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.045, 0.014, 8, 16]} /><M c="#2c4f9e" /></mesh>
          <mesh position={[0, 0.195, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.07, 20]} /><M c="#3a2214" /></mesh>
        </group>
        {/* bandeja de papéis */}
        <group position={[-1.2, 1.15, 0.05]}>
          <RoundedBox args={[0.6, 0.06, 0.45]} radius={0.01} position={[0, 0.03, 0]}><M c="#6e6e70" /><OL t={0.006} /></RoundedBox>
          <mesh position={[0, 0.065, 0]}><boxGeometry args={[0.5, 0.01, 0.38]} /><M c="#f4f1ea" /></mesh>
        </group>
        {/* ventilador */}
        <group position={[1.25, 1.15, -0.2]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.15, 0.17, 0.06, 20]} /><M c="#b23a2e" /><OL t={0.008} /></mesh>
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.3, 8]} /><M c="#b23a2e" /></mesh>
          <group position={[0, 0.48, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.26, 0.012, 8, 32]} /><M c="#c9c9c9" r={0.3} /></mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[0, 0, frame * 0.9 + (i * Math.PI * 2) / 3]}><mesh position={[0, 0.12, 0]} scale={[0.09, 0.13, 0.01]}><sphereGeometry args={[1, 12, 8]} /><M c="#c8392c" /></mesh></mesh>
            ))}
          </group>
        </group>
      </group>

      {/* cadeira */}
      <group position={[0, 0, -0.55]}>
        <RoundedBox args={[1.1, 1.3, 0.12]} radius={0.06} position={[0, 1.65, -0.1]} castShadow><M c="#2d3646" r={0.6} /><OL /></RoundedBox>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.05, 0.05, 1.0, 10]} /><M c="#222" /></mesh>
      </group>
    </group>
  );
};
