import React from "react";
import * as THREE from "three";
import { labelTexture } from "./textures";
import { rand } from "./anim";

type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number }> = ({ c, r = 0.6, m = 0, e, ei = 0 }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} />
);

/** Box arredondado barato: caixa + leve chanfro visual via escala. */
export const Box: React.FC<{ s: V3; p?: V3; c: string; r?: number; rot?: V3; e?: string; ei?: number; shadow?: boolean }> = ({ s, p = [0, 0, 0], c, r, rot, e, ei, shadow = true }) => (
  <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <M c={c} r={r} e={e} ei={ei} />
  </mesh>
);

/** Placa com texto: número falado vira objeto na cena (regra 3). `pop` 0..1 controla a entrada. */
export const Sign: React.FC<{ text: string; p?: V3; rot?: V3; w?: number; h?: number; bg?: string; fg?: string; pop?: number; border?: string; post?: boolean }> = ({
  text, p = [0, 0, 0], rot = [0, 0, 0], w = 1.2, h = 0.6, bg = "#fff6dc", fg = "#2a1a10", pop = 1, border = "#2a1a10", post = false,
}) => {
  const tex = labelTexture(text, bg, fg, 512, Math.round((512 * h) / w), border);
  const s = Math.max(pop, 0.0001);
  return (
    <group position={p} rotation={rot} scale={[s, s, s]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.05]} />
        <meshStandardMaterial attach="material-0" color={bg} />
        <meshStandardMaterial attach="material-1" color={bg} />
        <meshStandardMaterial attach="material-2" color={bg} />
        <meshStandardMaterial attach="material-3" color={bg} />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color={bg} />
      </mesh>
      {post && <Box s={[0.05, 0.6, 0.05]} p={[0, -h / 2 - 0.3, -0.03]} c="#8a5a3a" />}
    </group>
  );
};

export const Coin: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.018, 28]} />
      <M c="#ffc93c" r={0.25} m={0.65} />
    </mesh>
    <mesh position={[0, 0.0095, 0]}>
      <torusGeometry args={[0.052, 0.006, 6, 24]} />
      <M c="#e8a900" r={0.25} m={0.6} />
    </mesh>
  </group>
);

/** Porquinho-cofre. `crack` 0..1 separa as metades. */
export const PiggyBank: React.FC<{ p?: V3; rot?: V3; s?: number; crack?: number; squash?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, crack = 0, squash = 1 }) => {
  const pink = "#ff9cb8";
  const piece = (side: -1 | 1) => (
    <group position={[side * crack * 0.5, crack * 0.25 - crack * crack * 0.35, side * crack * 0.15]} rotation={[0, 0, side * crack * 1.1]}>
      <mesh scale={[1.2, 1, 1]} castShadow>
        <sphereGeometry args={[0.3, 32, 24, side < 0 ? Math.PI : 0, Math.PI]} />
        <meshStandardMaterial color={pink} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* focinho / rabinho */}
      {side > 0 ? (
        <group>
          <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.11, 0.1, 24]} />
            <M c="#ff86a6" r={0.35} />
          </mesh>
          {[-0.035, 0.035].map((x) => (
            <mesh key={x} position={[x, 0, 0.412]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <M c="#a8385a" />
            </mesh>
          ))}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.1, 0.09, 0.27]}>
              <sphereGeometry args={[0.03, 12, 10]} />
              <M c="#2b1a12" r={0.2} />
            </mesh>
          ))}
        </group>
      ) : (
        <mesh position={[0, 0.05, -0.36]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI * 1.6]} />
          <M c="#ff86a6" />
        </mesh>
      )}
      {/* orelhas */}
      <mesh position={[side * 0.13, 0.27, 0.12]} rotation={[0.3, 0, side * -0.3]} castShadow>
        <coneGeometry args={[0.07, 0.12, 12]} />
        <M c="#ff86a6" r={0.35} />
      </mesh>
      {/* patas */}
      {[-0.15, 0.15].map((z) => (
        <mesh key={z} position={[side * 0.14, -0.26, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.1, 14]} />
          <M c="#ff86a6" r={0.35} />
        </mesh>
      ))}
    </group>
  );
  return (
    <group position={p} rotation={rot} scale={[s / Math.sqrt(squash), s * squash, s / Math.sqrt(squash)]}>
      <group position={[0, 0.31, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {piece(-1)}
        {piece(1)}
        {crack < 0.05 && <Box s={[0.12, 0.01, 0.025]} p={[0, 0.3, 0]} c="#2b1a12" shadow={false} />}
      </group>
    </group>
  );
};

export const Hammer: React.FC<{ p?: V3; rot?: V3 }> = ({ p = [0, 0, 0], rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}>
    <mesh position={[0, -0.15, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 0.36, 12]} />
      <M c="#ffd23f" />
    </mesh>
    <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
      <M c="#e8432f" r={0.4} />
    </mesh>
  </group>
);

/** Aquário retangular iluminado com peixinhos simples dentro. */
export const Tank: React.FC<{ p?: V3; s?: V3; water?: string; frame: number; seed?: number; fishes?: number; glow?: number }> = ({
  p = [0, 0, 0], s = [1, 0.7, 0.5], water = "#4cc3ff", frame, seed = 0, fishes = 3, glow = 0.9,
}) => {
  const colors = ["#ff7a2f", "#ffd23f", "#ff5fa2", "#7cf06b", "#b36bff", "#ffffff"];
  return (
    <group position={p}>
      <mesh>
        <boxGeometry args={s} />
        <meshStandardMaterial color={water} emissive={water} emissiveIntensity={glow} transparent opacity={0.8} roughness={0.1} />
      </mesh>
      <Box s={[s[0] + 0.04, 0.05, s[2] + 0.04]} p={[0, -s[1] / 2, 0]} c="#2c3346" />
      <Box s={[s[0] + 0.04, 0.04, s[2] + 0.04]} p={[0, s[1] / 2, 0]} c="#2c3346" />
      {Array.from({ length: fishes }).map((_, i) => {
        const r = rand(seed * 10 + i);
        const speed = 0.02 + r * 0.025;
        const ph = (frame * speed + r * 10) % (Math.PI * 2);
        const x = Math.sin(ph) * s[0] * 0.38;
        const dir = Math.cos(ph) > 0 ? 1 : -1;
        const y = (rand(seed * 7 + i * 3) - 0.5) * s[1] * 0.6;
        return (
          <group key={i} position={[x, y, s[2] * 0.3]} scale={[dir, 1, 1]}>
            <mesh scale={[1.4, 1, 0.6]}>
              <sphereGeometry args={[0.045 + r * 0.03, 12, 10]} />
              <meshStandardMaterial color={colors[(seed + i) % colors.length]} emissive={colors[(seed + i) % colors.length]} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.3]}>
              <coneGeometry args={[0.04, 0.06, 8]} />
              <meshStandardMaterial color={colors[(seed + i) % colors.length]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Aquário redondo de vidro. */
export const Bowl: React.FC<{ p?: V3; s?: number; children?: React.ReactNode }> = ({ p = [0, 0, 0], s = 1, children }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.36, 40, 32, 0, Math.PI * 2, 0.55, Math.PI - 0.55]} />
      <meshStandardMaterial color="#9fe3ff" emissive="#4cc3ff" emissiveIntensity={0.35} transparent opacity={0.45} roughness={0.05} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.24, 0.26, 0.06, 32]} />
      <M c="#ffe7a8" r={0.9} />
    </mesh>
    <group position={[0, 0.3, 0]}>{children}</group>
  </group>
);

/** Saquinho plástico com água e o peixe dentro. */
export const FishBag: React.FC<{ p?: V3; s?: number; children?: React.ReactNode; swing?: number }> = ({ p = [0, 0, 0], s = 1, children, swing = 0 }) => (
  <group position={p} rotation={[0, 0, swing]} scale={s}>
    <group position={[0, -0.32, 0]}>
      <mesh scale={[1, 1.1, 1]}>
        <sphereGeometry args={[0.2, 32, 24]} />
        <meshStandardMaterial color="#bfeeff" emissive="#4cc3ff" emissiveIntensity={0.25} transparent opacity={0.5} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.12, 0.2, 20, 1, true]} />
        <meshStandardMaterial color="#e8faff" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <torusGeometry args={[0.03, 0.012, 8, 16]} />
        <M c="#ff5a36" />
      </mesh>
      <group scale={0.55}>{children}</group>
    </group>
  </group>
);

export const FoodJar: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <group position={p} scale={s}>
    <mesh castShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.2, 24]} />
      <meshStandardMaterial color="#ffe28a" transparent opacity={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.105, 0.105, 0.05, 24]} />
      <M c="#e8432f" r={0.4} />
    </mesh>
    <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.05, 0.015, 8, 20]} />
      <M c="#ff6fa3" />
    </mesh>
  </group>
);

/** Peixe chique e caro: azul, barbatanas longas. */
export const FancyFish: React.FC<{ frame: number; p?: V3; s?: number; rotY?: number }> = ({ frame, p = [0, 0, 0], s = 1, rotY = 0 }) => {
  const w = Math.sin(frame * 0.25);
  return (
    <group position={p} scale={s} rotation={[0, rotY, 0]}>
      <mesh scale={[1.3, 1, 0.5]} castShadow>
        <sphereGeometry args={[0.2, 32, 24]} />
        <meshStandardMaterial color="#3a6dff" roughness={0.15} metalness={0.3} emissive="#1d2f9a" emissiveIntensity={0.4} />
      </mesh>
      {/* cauda enorme de véu */}
      <group position={[-0.24, 0, 0]} rotation={[0, w * 0.4, 0]}>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.6, 1, 0.12]}>
          <coneGeometry args={[0.24, 0.45, 24]} />
          <meshStandardMaterial color="#c84bff" roughness={0.2} transparent opacity={0.9} emissive="#7a1fd0" emissiveIntensity={0.4} />
        </mesh>
      </group>
      <mesh position={[0, 0.26, 0]} rotation={[0, 0, -0.4 + w * 0.1]} scale={[1.8, 1, 0.1]}>
        <coneGeometry args={[0.12, 0.3, 16]} />
        <meshStandardMaterial color="#c84bff" roughness={0.2} emissive="#7a1fd0" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.24, 0]} rotation={[0, 0, Math.PI + 0.4 - w * 0.1]} scale={[1.6, 1, 0.1]}>
        <coneGeometry args={[0.1, 0.26, 16]} />
        <meshStandardMaterial color="#c84bff" roughness={0.2} emissive="#7a1fd0" emissiveIntensity={0.4} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.14, 0.05, sd * 0.08]}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.025, 0, sd * 0.03]}>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
      {/* coroinha de "peixe chique" */}
      <mesh position={[0.05, 0.27, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.07, 0.05, 0.07, 5, 1, true]} />
        <meshStandardMaterial color="#ffd23f" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
