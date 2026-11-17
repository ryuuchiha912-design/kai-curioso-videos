import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

// Quarto aconchegante estilo "brinquedo": piso xadrez, parede colorida, janela noturna, estante e planta.
const pisoTextura = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      g.fillStyle = (i + j) % 2 ? "#e9dfcf" : "#fbf6ee";
      g.fillRect(i * 64, j * 64, 64, 64);
    }
  g.strokeStyle = "#cdbfa8";
  g.lineWidth = 3;
  for (let k = 0; k <= 4; k++) {
    g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, 256); g.stroke();
    g.beginPath(); g.moveTo(0, k * 64); g.lineTo(256, k * 64); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const M = ({ c, r = 0.6, e }: { c: string; r?: number; e?: string }) => (
  <meshStandardMaterial color={c} roughness={r} emissive={e ?? "#000"} />
);

const Livros = ({ x, y }: { x: number; y: number }) => {
  const cores = ["#e05a47", "#3b7dd8", "#f2b134", "#5bb36b", "#9b59b6", "#e07b39", "#2fa3a3"];
  return (
    <group position={[x, y, -2.6]}>
      {cores.map((c, i) => (
        <RoundedBox key={i} args={[0.16, 0.5 + ((i * 37) % 5) * 0.04, 0.42]} radius={0.03} position={[i * 0.19, 0.27, 0]} castShadow>
          <M c={c} />
        </RoundedBox>
      ))}
    </group>
  );
};

export const Cenario = ({ frame }: { frame: number }) => {
  const piso = useMemo(pisoTextura, []);
  const estrelas = useMemo(
    () => Array.from({ length: 18 }, (_, i) => [((i * 97) % 100) / 100 * 2.2 - 1.1, ((i * 53) % 100) / 100 * 1.5 - 0.5] as const),
    []
  );
  return (
    <group>
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={piso} roughness={0.5} />
      </mesh>
      {/* paredes */}
      <mesh position={[0, 4, -3]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <M c="#4fa89a" r={0.9} />
      </mesh>
      <mesh position={[-4.5, 4, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <M c="#3e9285" r={0.9} />
      </mesh>
      {/* rodapé */}
      <mesh position={[0, 0.12, -2.97]}>
        <boxGeometry args={[14, 0.24, 0.06]} />
        <M c="#f4efe4" />
      </mesh>

      {/* janela noturna */}
      <group position={[1.9, 3.6, -2.95]}>
        <RoundedBox args={[2.8, 2.3, 0.15]} radius={0.06}>
          <M c="#f6efe1" />
        </RoundedBox>
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[2.5, 2.0]} />
          <meshBasicMaterial color="#1b2a5e" />
        </mesh>
        <mesh position={[0.7, 0.5, 0.09]}>
          <circleGeometry args={[0.26, 32]} />
          <meshBasicMaterial color="#fff3b0" />
        </mesh>
        {estrelas.map(([sx, sy], i) => (
          <mesh key={i} position={[sx, sy, 0.09]} scale={1 + 0.4 * Math.sin(frame * 0.15 + i)}>
            <circleGeometry args={[0.025, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.07, 2.0, 0.04]} />
          <M c="#f6efe1" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.5, 0.07, 0.04]} />
          <M c="#f6efe1" />
        </mesh>
        {/* cortinas */}
        {[-1, 1].map((l) => (
          <RoundedBox key={l} args={[0.45, 2.7, 0.12]} radius={0.05} position={[l * 1.55, -0.1, 0.18]} castShadow>
            <M c="#d9534f" />
          </RoundedBox>
        ))}
      </group>

      {/* estante */}
      <group position={[-2.7, 0, 0]}>
        <RoundedBox args={[1.6, 3.2, 0.55]} radius={0.05} position={[0.55, 1.6, -2.65]} castShadow receiveShadow>
          <M c="#a8693a" />
        </RoundedBox>
        {[0.55, 1.6, 2.65].map((y) => (
          <mesh key={y} position={[0.55, y + 0.05, -2.33]}>
            <boxGeometry args={[1.45, 0.06, 0.1]} />
            <M c="#8b5429" />
          </mesh>
        ))}
        <Livros x={0} y={0.6} />
        <Livros x={0} y={1.65} />
        <mesh position={[0.4, 2.95, -2.55]} castShadow>
          <sphereGeometry args={[0.22, 24, 16]} />
          <M c="#3b7dd8" r={0.3} />
        </mesh>
      </group>

      {/* planta */}
      <group position={[3.6, 0, -1.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.3, 0.8, 24]} />
          <M c="#e07b39" />
        </mesh>
        {[[0, 1.25, 0, 0.5], [-0.3, 1.0, 0.1, 0.35], [0.3, 1.05, -0.1, 0.38], [0.05, 1.6, 0.05, 0.32]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 20, 14]} />
            <M c="#4caf50" />
          </mesh>
        ))}
      </group>

      {/* tapete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]} receiveShadow>
        <circleGeometry args={[2.1, 48]} />
        <M c="#f2b134" r={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0.4]} receiveShadow>
        <ringGeometry args={[1.6, 1.75, 48]} />
        <M c="#e05a47" r={0.95} />
      </mesh>
    </group>
  );
};
