import { useMemo } from "react";
import * as THREE from "three";

// Personagem 3D estilo "boneco de brinquedo": cabeça grande, olhos enormes, corpo de pino.
export type Expressao = {
  fala: number; // 0..1 abertura da boca
  surpresa: number; // 0..1 olhos arregalados, sobrancelhas pra cima
  sorriso: number; // 0..1
  piscar: number; // 0..1 (1 = olho fechado)
  olharX: number; // -1..1
  olharY: number; // -1..1
  bracoE: number; // rotação do braço esquerdo (rad)
  bracoD: number; // rotação do braço direito (rad)
  inclinarCabeca: number; // rad
};

export type Visual = {
  pele: string;
  cabelo: string;
  camisa: string;
  calca: string;
  sapato: string;
};

const R = 0.9; // raio da cabeça

const Mat = ({ cor, rough = 0.55 }: { cor: string; rough?: number }) => (
  <meshStandardMaterial color={cor} roughness={rough} metalness={0} />
);

const Olho = ({ x, e }: { x: number; e: Expressao }) => {
  const abre = Math.max(0.06, 1 - e.piscar) * (1 + e.surpresa * 0.25);
  const pupila = 0.11 * (1 - e.surpresa * 0.3);
  const px = e.olharX * 0.07;
  const py = e.olharY * 0.06;
  return (
    <group position={[x, 0.12, 0.74]} rotation={[0, x * 0.45, 0]}>
      <group scale={[1 + e.surpresa * 0.12, abre * 1.18, 0.55]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 32, 24]} />
          <Mat cor="#ffffff" rough={0.25} />
        </mesh>
        <mesh position={[px, py, 0.2]}>
          <sphereGeometry args={[pupila, 24, 16]} />
          <Mat cor="#151515" rough={0.2} />
        </mesh>
        <mesh position={[px + 0.045, py + 0.05, 0.29]}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};

const Sobrancelha = ({ x, e, cor }: { x: number; e: Expressao; cor: string }) => {
  const lado = Math.sign(x);
  const sobe = 0.44 + e.surpresa * 0.12 + e.sorriso * 0.03;
  const ang = lado * (-0.15 + e.surpresa * 0.35 - e.sorriso * 0.05);
  return (
    <mesh position={[x, sobe, 0.8]} rotation={[-0.35, x * 0.4, Math.PI / 2 + ang]}>
      <capsuleGeometry args={[0.035, 0.2, 6, 12]} />
      <Mat cor={cor} />
    </mesh>
  );
};

const Boca = ({ e }: { e: Expressao }) => {
  const abre = 0.03 + e.fala * 0.16 + e.surpresa * 0.14;
  const larg = 0.2 + e.sorriso * 0.1 - e.surpresa * 0.06;
  return (
    <group position={[0, -0.36, 0.8]} rotation={[0.35, 0, 0]}>
      {/* boca aberta */}
      <mesh scale={[larg, abre, 0.06]}>
        <sphereGeometry args={[1, 32, 16]} />
        <Mat cor="#5a1414" rough={0.4} />
      </mesh>
      {/* dentes */}
      {abre > 0.06 && (
        <mesh position={[0, abre * 0.55, 0.035]} scale={[larg * 0.8, abre * 0.35, 0.04]}>
          <sphereGeometry args={[1, 24, 12]} />
          <Mat cor="#ffffff" rough={0.3} />
        </mesh>
      )}
      {/* sorriso (arco) */}
      {e.sorriso > 0.05 && (
        <mesh position={[0, 0.08, 0.02]} rotation={[0, 0, Math.PI]} scale={[1, e.sorriso, 1]}>
          <torusGeometry args={[larg * 1.05, 0.025, 8, 24, Math.PI]} />
          <Mat cor="#3a0d0d" />
        </mesh>
      )}
    </group>
  );
};

const Braco = ({ lado, ang, v }: { lado: 1 | -1; ang: number; v: Visual }) => (
  <group position={[lado * 0.52, 1.5, 0]} rotation={[0, 0, lado * (0.18 + ang)]}>
    <mesh position={[0, -0.36, 0]} castShadow>
      <capsuleGeometry args={[0.11, 0.5, 8, 16]} />
      <Mat cor={v.camisa} />
    </mesh>
    <mesh position={[0, -0.78, 0]} castShadow>
      <sphereGeometry args={[0.16, 24, 16]} />
      <Mat cor={v.pele} />
    </mesh>
  </group>
);

export const Personagem = ({
  e,
  v,
  position = [0, 0, 0],
  rotationY = 0,
  escala = 1,
  pulo = 0,
}: {
  e: Expressao;
  v: Visual;
  position?: [number, number, number];
  rotationY?: number;
  escala?: number;
  pulo?: number;
}) => {
  const corpo = useMemo(() => {
    const pts = [
      [0, 0], [0.5, 0.02], [0.6, 0.25], [0.58, 0.6], [0.5, 0.95], [0.36, 1.15], [0.2, 1.22], [0, 1.24],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  const cabeloGeo = useMemo(
    () => new THREE.SphereGeometry(R * 1.04, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.44),
    []
  );

  return (
    <group position={[position[0], position[1] + pulo, position[2]]} rotation={[0, rotationY, 0]} scale={escala}>
      {/* pernas e sapatos */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.22, 0, 0]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.4, 8, 16]} />
            <Mat cor={v.calca} />
          </mesh>
          <mesh position={[0, 0.1, 0.08]} scale={[1, 0.6, 1.4]} castShadow>
            <sphereGeometry args={[0.17, 24, 16]} />
            <Mat cor={v.sapato} rough={0.35} />
          </mesh>
        </group>
      ))}
      {/* tronco */}
      <mesh geometry={corpo} position={[0, 0.5, 0]} castShadow receiveShadow>
        <Mat cor={v.camisa} />
      </mesh>
      {/* gola */}
      <mesh position={[0, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.06, 12, 32]} />
        <Mat cor="#f4f1ea" />
      </mesh>
      <Braco lado={-1} ang={e.bracoE} v={v} />
      <Braco lado={1} ang={e.bracoD} v={v} />

      {/* cabeça */}
      <group position={[0, 2.45, 0]} rotation={[0, 0, e.inclinarCabeca]}>
        <mesh castShadow receiveShadow scale={[1, 0.97, 0.94]}>
          <sphereGeometry args={[R, 48, 32]} />
          <Mat cor={v.pele} rough={0.6} />
        </mesh>
        <mesh geometry={cabeloGeo} rotation={[-0.5, 0, 0]} castShadow>
          <Mat cor={v.cabelo} rough={0.7} />
        </mesh>
        {/* orelhas */}
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.87, 0, 0]} scale={[0.5, 1, 0.8]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <Mat cor={v.pele} />
          </mesh>
        ))}
        {/* nariz */}
        <mesh position={[0, -0.1, 0.88]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <Mat cor={v.pele} />
        </mesh>
        <Olho x={-0.3} e={e} />
        <Olho x={0.3} e={e} />
        <Sobrancelha x={-0.3} e={e} cor={v.cabelo} />
        <Sobrancelha x={0.3} e={e} cor={v.cabelo} />
        <Boca e={e} />
      </group>
    </group>
  );
};
