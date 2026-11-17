import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, Outlines } from "@react-three/drei";

// Escritório doméstico à noite: tons neutros, luz quente, janela com cidade.
const C = "#2b1d14";
const M = ({ c, r = 0.7, e, ei = 0 }: { c: string; r?: number; e?: string; ei?: number }) => (
  <meshStandardMaterial color={c} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} />
);

const texTacos = () => {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    const tons = ["#8a6244", "#7f5a3d", "#936a4a", "#86603f"];
    g.fillStyle = tons[(i * 3) % 4]; g.fillRect(0, i * 64, 512, 64);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, i * 64, 512, 2);
    const off = (i * 197) % 512; g.fillRect(off, i * 64, 2, 64);
    for (let k = 0; k < 6; k++) { g.fillStyle = "rgba(60,35,20,.12)"; g.fillRect(((i * 61 + k * 89) % 512), i * 64 + 10 + k * 8, 120, 2); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  t.colorSpace = THREE.SRGBColorSpace; return t;
};

const texCidade = () => {
  const c = document.createElement("canvas"); c.width = 512; c.height = 400;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 400); grad.addColorStop(0, "#0d1736"); grad.addColorStop(1, "#24305a");
  g.fillStyle = grad; g.fillRect(0, 0, 512, 400);
  for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect((i * 131) % 512, (i * 71) % 170, 2, 2); }
  g.fillStyle = "#fff6cf"; g.beginPath(); g.arc(380, 80, 30, 0, Math.PI * 2); g.fill();
  for (let b = 0; b < 12; b++) {
    const x = b * 44 - 8, w = 40 + ((b * 13) % 20), h = 120 + ((b * 67) % 150);
    g.fillStyle = b % 2 ? "#121a33" : "#18213f"; g.fillRect(x, 400 - h, w, h);
    for (let wy = 400 - h + 10; wy < 390; wy += 18) for (let wx = x + 6; wx < x + w - 6; wx += 12)
      if (((wx * 7 + wy * 3 + b) % 5) < 2) { g.fillStyle = "#f7d27a"; g.fillRect(wx, wy, 6, 8); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

const texPoster = () => {
  const c = document.createElement("canvas"); c.width = 256; c.height = 340;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3e7cf"; g.fillRect(0, 0, 256, 340);
  g.fillStyle = "#e46f4a"; g.beginPath(); g.arc(128, 130, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#2f6f73"; g.fillRect(0, 190, 256, 70);
  g.fillStyle = "#2b1d14"; g.font = "bold 34px sans-serif"; g.textAlign = "center"; g.fillText("SONHE", 128, 300);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export const Escritorio = ({ frame }: { frame: number }) => {
  const piso = useMemo(texTacos, []);
  const cidade = useMemo(texCidade, []);
  const poster = useMemo(texPoster, []);
  const poeira = useMemo(() => Array.from({ length: 40 }, (_, i) => [((i * 97) % 100) / 10 - 5, ((i * 53) % 100) / 22, ((i * 31) % 100) / 25 - 2] as const), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial map={piso} roughness={0.55} />
      </mesh>
      {/* paredes e teto */}
      <mesh position={[0, 3, -3.2]} receiveShadow><planeGeometry args={[16, 6]} /><M c="#cbbb98" r={0.95} /></mesh>
      <mesh position={[-4.2, 3, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[12, 6]} /><M c="#bfae8b" r={0.95} /></mesh>
      <mesh position={[4.2, 3, 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[12, 6]} /><M c="#bfae8b" r={0.95} /></mesh>
      <mesh position={[0, 5.6, 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[16, 12]} /><M c="#8e8576" r={1} /></mesh>
      <mesh position={[0, 0.1, -3.17]}><boxGeometry args={[16, 0.2, 0.06]} /><M c="#efe6d4" /></mesh>

      {/* janela */}
      <group position={[1.2, 3.0, -3.15]}>
        <RoundedBox args={[2.2, 2.0, 0.14]} radius={0.04}><M c="#efe6d4" /><Outlines thickness={0.01} color={C} /></RoundedBox>
        <mesh position={[0, 0, 0.08]}><planeGeometry args={[1.95, 1.75]} /><meshBasicMaterial map={cidade} /></mesh>
        <mesh position={[0, 0, 0.1]}><boxGeometry args={[0.06, 1.75, 0.04]} /><M c="#efe6d4" /></mesh>
        <mesh position={[0, 0, 0.1]}><boxGeometry args={[1.95, 0.06, 0.04]} /><M c="#efe6d4" /></mesh>
        <mesh position={[0, -1.05, 0.12]}><boxGeometry args={[2.4, 0.08, 0.3]} /><M c="#efe6d4" /></mesh>
      </group>

      {/* pôster */}
      <mesh position={[-2.3, 3.3, -3.15]}>
        <planeGeometry args={[0.9, 1.2]} /><meshStandardMaterial map={poster} roughness={0.8} />
      </mesh>

      {/* mesa + monitor + abajur */}
      <group position={[2.4, 0, -2.3]}>
        <RoundedBox args={[2.2, 0.1, 1.0]} radius={0.03} position={[0, 1.15, 0]} castShadow receiveShadow><M c="#6b4a33" r={0.5} /><Outlines thickness={0.01} color={C} /></RoundedBox>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.95, 0.57, 0]} castShadow><boxGeometry args={[0.08, 1.14, 0.8]} /><M c="#5a3d29" /></mesh>
        ))}
        <RoundedBox args={[1.0, 0.62, 0.05]} radius={0.02} position={[-0.2, 1.7, -0.2]} castShadow><M c="#222" r={0.3} /><Outlines thickness={0.008} color={C} /></RoundedBox>
        <mesh position={[-0.2, 1.7, -0.17]}><planeGeometry args={[0.92, 0.54]} /><M c="#4d8fd6" e="#4d8fd6" ei={1.4} /></mesh>
        <mesh position={[-0.2, 1.3, -0.2]}><boxGeometry args={[0.08, 0.25, 0.06]} /><M c="#222" /></mesh>
        <mesh position={[0.75, 1.2, 0]}><cylinderGeometry args={[0.12, 0.14, 0.04, 20]} /><M c="#2f6f73" /></mesh>
        <mesh position={[0.75, 1.45, 0]}><cylinderGeometry args={[0.02, 0.02, 0.5, 8]} /><M c="#2f6f73" /></mesh>
        <mesh position={[0.75, 1.75, 0]}><coneGeometry args={[0.2, 0.22, 24, 1, true]} /><meshStandardMaterial color="#e9c46a" side={THREE.DoubleSide} emissive="#ffcf7a" emissiveIntensity={0.6} /></mesh>
        <mesh position={[0.75, 1.67, 0]}><sphereGeometry args={[0.06, 12, 8]} /><meshBasicMaterial color="#fff2c4" /></mesh>
      </group>

      {/* estante */}
      <group position={[-3.2, 0, -2.6]}>
        <RoundedBox args={[1.4, 2.8, 0.5]} radius={0.03} position={[0, 1.4, 0]} castShadow receiveShadow><M c="#7a5236" /><Outlines thickness={0.01} color={C} /></RoundedBox>
        {[0.6, 1.4, 2.2].map((y, k) => (
          <group key={y} position={[-0.5, y, 0.12]}>
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[i * 0.17, 0.2 + ((i + k) % 3) * 0.02, 0]} castShadow>
                <boxGeometry args={[0.14, 0.4 + ((i + k) % 3) * 0.05, 0.3]} />
                <M c={["#a6533f", "#3f6c8a", "#c79a45", "#5b7f4f", "#8a5a7a", "#d0c3a5"][(i + k) % 6]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* planta */}
      <group position={[-1.6, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.28, 0.22, 0.6, 20]} /><M c="#c7704d" /><Outlines thickness={0.008} color={C} /></mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[Math.sin(i * 2.4) * 0.22, 0.95 + (i % 3) * 0.2, Math.cos(i * 2.4) * 0.15]} rotation={[Math.sin(i) * 0.6, i, Math.cos(i) * 0.6]} scale={[0.14, 0.5, 0.05]} castShadow>
            <sphereGeometry args={[1, 12, 8]} /><M c="#4d7a43" />
          </mesh>
        ))}
      </group>

      {/* tapete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.01, 0.4]} receiveShadow>
        <planeGeometry args={[3.6, 2.6]} /><M c="#7d4b3e" r={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.012, 0.4]} receiveShadow>
        <planeGeometry args={[3.3, 2.3]} /><M c="#a35d4a" r={1} />
      </mesh>

      {/* luminária de teto */}
      <mesh position={[0, 5.5, 0]}><cylinderGeometry args={[0.5, 0.5, 0.06, 32]} /><meshBasicMaterial color="#fff4d6" /></mesh>

      {/* poeira flutuando */}
      {poeira.map(([x, y, z], i) => (
        <mesh key={i} position={[x + Math.sin(frame * 0.02 + i) * 0.15, y + Math.sin(frame * 0.015 + i * 2) * 0.2, z]}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshBasicMaterial color="#fff6dc" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
};
