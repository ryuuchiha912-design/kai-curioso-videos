import React from "react";
import { FacePatch, FaceState } from "./Face";

/**
 * Eco: robozinho-caixa-de-som (personagem original do short 4).
 * Regra 1 levada ao extremo: ele é quase só "cabeça" (o alto-falante), com perninhas curtas.
 * Tudo é parâmetro: luz da antena, sobrancelha, bigode, ondas de som, aceno da antena.
 */
export type RobotProps = {
  face: FaceState;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  /** 0 = luz verde-água (normal), 1 = vermelha (voz grave) */
  red?: number;
  /** 0..1 sobrancelha grossa "dramática" */
  brows?: number;
  /** 0..1 bigodinho "de 40 anos" */
  mustache?: number;
  /** 0..1 intensidade das ondas de som (quando fala) */
  talk?: number;
  /** frame atual, para as ondas e o brilho */
  frame?: number;
  /** rotação z da antena (aceno / "não-não") */
  wag?: number;
  /** passos (rad) para as perninhas */
  step?: number;
  bob?: number;
  squash?: number;
};

const R = 0.42;
const BODY_Y = 0.62;
const SHELL = "#ff9f43";
const SHELL_DARK = "#d9742a";
const GRILLE = "#2c2340";

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

export const Robot: React.FC<RobotProps> = ({
  face, position = [0, 0, 0], rotationY = 0, scale = 1, red = 0, brows = 0, mustache = 0, talk = 0, frame = 0, wag = 0, step = 0, bob = 0, squash = 1,
}) => {
  const glow = mix("#4ff0d2", "#ff3b3b", red);
  const pulse = 0.6 + 0.4 * talk * Math.abs(Math.sin(frame * 0.5));
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* perninhas */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.15, 0.3, 0]} rotation={[s * Math.sin(step) * 0.5, 0, 0]}>
          <mesh position={[0, -0.13, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.2, 6, 12]} />
            <meshStandardMaterial color="#5a4a6e" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.27, 0.04]} scale={[1, 0.55, 1.4]} castShadow>
            <sphereGeometry args={[0.08, 18, 14]} />
            <meshStandardMaterial color={SHELL_DARK} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <group position={[0, BODY_Y + bob, 0]} scale={[1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash)]}>
        {/* corpo = caixa de som redonda */}
        <mesh castShadow scale={[1, 0.94, 0.92]}>
          <sphereGeometry args={[R, 48, 40]} />
          <meshStandardMaterial color={SHELL} roughness={0.45} />
        </mesh>
        <group scale={[1, 0.94, 0.92]}>
          <FacePatch radius={R} state={face} />
        </group>
        {/* aro do alto-falante em volta do rosto */}
        <mesh position={[0, 0, R * 0.62]} rotation={[0, 0, 0]}>
          <torusGeometry args={[R * 0.74, 0.025, 10, 48]} />
          <meshStandardMaterial color={SHELL_DARK} roughness={0.4} />
        </mesh>
        {/* "woofers" dos lados = orelhas */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * R * 0.93, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.07, 28]} />
              <meshStandardMaterial color={GRILLE} roughness={0.7} />
            </mesh>
            <mesh position={[0, s * 0.04, 0]} scale={[1, 1 + 0.5 * talk * Math.abs(Math.sin(frame * 0.7 + s)), 1]}>
              <cylinderGeometry args={[0.07, 0.08, 0.03, 24]} />
              <meshStandardMaterial color="#6d5d8a" roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* antena */}
        <group position={[0, R * 0.9, 0]} rotation={[0, 0, wag]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.24, 10]} />
            <meshStandardMaterial color="#5a4a6e" />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <sphereGeometry args={[0.065, 20, 16]} />
            <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.4 * pulse} toneMapped={false} />
          </mesh>
        </group>
        {/* sobrancelhas dramáticas */}
        {brows > 0.01 &&
          [-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.11, 0.14, R * 0.9]} rotation={[-0.2, 0, -s * 0.35]} scale={brows}>
              <boxGeometry args={[0.15, 0.045, 0.04]} />
              <meshStandardMaterial color="#2b1a12" roughness={0.8} />
            </mesh>
          ))}
        {/* bigodinho */}
        {mustache > 0.01 && (
          <group position={[0, -0.075, R * 0.93]} scale={mustache}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.055, 0, 0]} rotation={[0, 0, Math.PI / 2 + s * 0.35]} scale={[0.75, 1, 0.6]}>
                <capsuleGeometry args={[0.03, 0.07, 6, 12]} />
                <meshStandardMaterial color="#2b1a12" roughness={0.8} />
              </mesh>
            ))}
          </group>
        )}
        {/* ondas de som quando fala */}
        {talk > 0.01 &&
          [0, 1, 2].map((k) => {
            const ph = ((frame * 0.06 + k / 3) % 1);
            return (
              <mesh key={k} position={[0, 0, R * 0.95 + ph * 0.35]}>
                <torusGeometry args={[R * (0.55 + ph * 0.7), 0.012, 6, 40]} />
                <meshBasicMaterial color={glow} transparent opacity={talk * (1 - ph) * 0.7} toneMapped={false} />
              </mesh>
            );
          })}
      </group>
    </group>
  );
};
