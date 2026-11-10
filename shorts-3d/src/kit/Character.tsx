import React from "react";
import * as THREE from "three";
import { FacePatch, FaceState } from "./Face";
import { stripes } from "./textures";

/**
 * Regra 1 (proporção): cabeça enorme e redonda (~50% da altura), corpo pequeno arredondado,
 * braços e pernas finos. Tudo com formas simples: esfera, cápsula, cilindro.
 */
export type Pose = {
  armL?: [number, number, number]; // rotação do ombro (x frente/trás, y, z lateral)
  armR?: [number, number, number];
  legL?: number; // rotação x do quadril
  legR?: number;
  lean?: number; // inclinação do corpo pra frente
  twist?: number; // giro do tronco
  head?: [number, number, number];
  bob?: number; // deslocamento vertical (pulo, passo)
  squash?: number; // 1 = normal
};

export const SKIN = "#f4c49e";
const mat = (color: string, rough = 0.62) => <meshStandardMaterial color={color} roughness={rough} />;

const HEAD_R = 0.46;
const HEAD_Y = 1.18;
const SHOULDER_Y = 0.78;
const HIP_Y = 0.4;

const Limb: React.FC<{ len: number; r: number; color: string; end?: React.ReactNode }> = ({ len, r, color, end }) => (
  <group>
    <mesh position={[0, -len / 2, 0]} castShadow>
      <capsuleGeometry args={[r, len, 6, 14]} />
      {mat(color)}
    </mesh>
    <group position={[0, -len, 0]}>{end}</group>
  </group>
);

const Hand: React.FC<{ holding?: React.ReactNode }> = ({ holding }) => (
  <group>
    <mesh castShadow>
      <sphereGeometry args={[0.075, 20, 16]} />
      {mat(SKIN, 0.5)}
    </mesh>
    {holding}
  </group>
);

const Shoe: React.FC<{ color: string }> = ({ color }) => (
  <mesh position={[0, -0.02, 0.05]} scale={[1, 0.62, 1.5]} castShadow>
    <sphereGeometry args={[0.08, 20, 16]} />
    {mat(color, 0.4)}
  </mesh>
);

export type CharacterProps = {
  kind: "leo" | "bia" | "caio" | "caioAdult";
  pose?: Pose;
  face: FaceState;
  holdR?: React.ReactNode;
  holdL?: React.ReactNode;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
};

export const Character: React.FC<CharacterProps> = ({ kind, pose = {}, face, holdR, holdL, position = [0, 0, 0], rotationY = 0, scale = 1 }) => {
  const leo = kind === "leo";
  const caio = kind === "caio", adult = kind === "caioAdult";
  const kid = leo || caio; // bermuda: pernas de pele
  const shirt = leo ? "#3d7be0" : caio ? "#ffc93c" : adult ? "#8a8f9c" : "#fdf6ea";
  const pants = leo ? "#28407a" : caio ? "#3b6bd6" : adult ? "#2f3a55" : "#4b4f6b";
  const shoe = leo ? "#e94b3c" : caio ? "#f2f2f2" : adult ? "#e8e8e8" : "#3a2a24";
  const armL = pose.armL ?? [0, 0, -0.18];
  const armR = pose.armR ?? [0, 0, 0.18];
  const head = pose.head ?? [0, 0, 0];
  const sq = pose.squash ?? 1;
  const stripeTex = React.useMemo(() => (leo ? stripes("#3d7be0", "#f5f1e6", 5) : null), [leo]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, pose.bob ?? 0, 0]} scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        {/* pernas */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.1, HIP_Y, 0]} rotation={[(s < 0 ? pose.legL : pose.legR) ?? 0, 0, 0]}>
            <Limb len={0.3} r={0.04} color={kid ? SKIN : pants} end={<Shoe color={shoe} />} />
            {/* bermuda / calça */}
            <mesh position={[0, -0.06, 0]} castShadow>
              <capsuleGeometry args={[0.075, kid ? 0.08 : 0.2, 6, 14]} />
              {mat(pants)}
            </mesh>
          </group>
        ))}
        <group rotation={[pose.lean ?? 0, pose.twist ?? 0, 0]} position={[0, HIP_Y, 0]}>
          <group position={[0, -HIP_Y, 0]}>
            {/* tronco */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <capsuleGeometry args={[0.21, 0.24, 8, 24]} />
              {leo ? <meshStandardMaterial map={stripeTex!} roughness={0.7} /> : mat(shirt)}
            </mesh>
            {caio && <CaioStar />}
            {adult && <HoodieBits />}
            {kind === "bia" && (
              // avental verde
              <mesh position={[0, 0.56, 0.035]} scale={[1, 1, 0.95]} castShadow>
                <cylinderGeometry args={[0.215, 0.235, 0.42, 24, 1, true, -1.1, 2.2]} />
                <meshStandardMaterial color="#2f9e6a" roughness={0.7} side={THREE.DoubleSide} />
              </mesh>
            )}
            {/* braços */}
            {[-1, 1].map((s) => {
              const r = s < 0 ? armL : armR;
              return (
                <group key={s} position={[s * 0.22, SHOULDER_Y, 0]} rotation={r}>
                  <mesh castShadow>
                    <sphereGeometry args={[0.07, 16, 12]} />
                    {leo ? <meshStandardMaterial color="#3d7be0" roughness={0.7} /> : mat(shirt)}
                  </mesh>
                  {adult && (
                    <mesh position={[0, -0.13, 0]} castShadow>
                      <capsuleGeometry args={[0.045, 0.2, 6, 12]} />
                      {mat(shirt)}
                    </mesh>
                  )}
                  <Limb len={0.3} r={0.035} color={SKIN} end={<Hand holding={s < 0 ? holdL : holdR} />} />
                </group>
              );
            })}
            {/* cabeça */}
            <group position={[0, HEAD_Y - 0.25, 0]} rotation={head}>
              <group position={[0, 0.25, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[HEAD_R, 48, 40]} />
                  {mat(SKIN, 0.5)}
                </mesh>
                <FacePatch radius={HEAD_R} state={face} />
                {/* orelhas */}
                {[-1, 1].map((s) => (
                  <mesh key={s} position={[s * HEAD_R * 0.98, -0.02, 0]} scale={[0.5, 1, 0.8]}>
                    <sphereGeometry args={[0.09, 16, 12]} />
                    {mat(SKIN, 0.5)}
                  </mesh>
                ))}
                {/* nariz */}
                <mesh position={[0, -0.03, HEAD_R * 0.99]} scale={[1.1, 0.85, 0.7]}>
                  <sphereGeometry args={[0.055, 16, 12]} />
                  {mat("#efae86", 0.5)}
                </mesh>
                {leo ? <LeoHair /> : caio ? <CaioHair /> : adult ? <AdultHair /> : <BiaHair />}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

const CAP = "#ff5a36";
const LeoHair = () => (
  <group>
    {/* cabelo castanho por baixo do boné (laterais e nuca) */}
    <mesh position={[0, 0.0, -0.03]} rotation={[-0.55, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.02, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      {mat("#6a3d22", 0.75)}
    </mesh>
    {/* boné vermelho virado pra trás */}
    <group rotation={[-0.32, 0, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[HEAD_R * 1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        {mat(CAP, 0.5)}
      </mesh>
      {/* faixa e costuras */}
      <mesh position={[0, 0.06 + HEAD_R * 1.06 * Math.cos(Math.PI * 0.4), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[HEAD_R * 1.06 * Math.sin(Math.PI * 0.4), 0.022, 10, 48]} />
        {mat("#d93d1f", 0.5)}
      </mesh>
      <mesh position={[0, 0.06 + HEAD_R * 1.07, 0]}>
        <sphereGeometry args={[0.045, 14, 10]} />
        {mat("#d93d1f", 0.5)}
      </mesh>
      {/* aba pra trás */}
      <mesh position={[0, 0.06 + HEAD_R * 1.06 * Math.cos(Math.PI * 0.4) - 0.01, -HEAD_R * 0.8]} rotation={[0.12, 0, 0]} scale={[1, 0.12, 1]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.12, 30, 1, false, Math.PI * 0.5, Math.PI]} />
        {mat("#d93d1f", 0.5)}
      </mesh>
    </group>
    {/* franjinha saindo na frente */}
    <mesh position={[0.05, 0.25, HEAD_R * 0.84]} rotation={[0.9, 0, -0.3]} scale={[1.8, 0.7, 0.45]}>
      <sphereGeometry args={[0.08, 16, 12]} />
      {mat("#6a3d22", 0.75)}
    </mesh>
  </group>
);

const CAIO_HAIR = "#5a3420";
/** Caio, 8 anos (1998): cabelo de cuia com franja reta. */
const CaioHair = () => (
  <group>
    <mesh position={[0, 0.03, -0.02]} rotation={[-0.2, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.06, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
      {mat(CAIO_HAIR, 0.7)}
    </mesh>
    {/* nuca e laterais */}
    <mesh position={[0, -0.02, -0.06]} rotation={[-0.9, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.04, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat(CAIO_HAIR, 0.7)}
    </mesh>
    {/* franja reta */}
    <mesh position={[0, 0.27, HEAD_R * 0.62]} rotation={[0.55, 0, 0]} scale={[1, 0.38, 0.55]} castShadow>
      <sphereGeometry args={[0.3, 24, 12]} />
      {mat(CAIO_HAIR, 0.7)}
    </mesh>
  </group>
);

/** Caio, 36 anos: cabelo curto e barba rala. */
const AdultHair = () => (
  <group>
    <mesh position={[0, 0.06, -0.04]} rotation={[-0.45, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.03, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
      {mat(CAIO_HAIR, 0.75)}
    </mesh>
    <mesh position={[0.06, 0.3, HEAD_R * 0.72]} rotation={[0.75, 0, -0.25]} scale={[1.7, 0.6, 0.5]}>
      <sphereGeometry args={[0.09, 16, 12]} />
      {mat(CAIO_HAIR, 0.75)}
    </mesh>
    {/* barba rala: casca escura na parte de baixo do rosto */}
    <mesh rotation={[0.35, 0, 0]} renderOrder={3}>
      <sphereGeometry args={[HEAD_R * 1.012, 40, 20, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.68, Math.PI * 0.22]} />
      <meshStandardMaterial color="#4a2e1e" roughness={0.9} transparent opacity={0.35} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  </group>
);

/** Estrela na camiseta amarela do Caio criança. */
const CaioStar = () => {
  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.045 : 0.1, a = Math.PI / 2 + (i * Math.PI) / 5;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return s;
  }, []);
  return (
    <mesh position={[0, 0.62, 0.212]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#ff5a36" roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Moletom: capuz nas costas e cordões. */
const HoodieBits = () => (
  <group>
    <mesh position={[0, 0.83, -0.14]} rotation={[0.5, 0, 0]} scale={[1, 0.6, 0.7]} castShadow>
      <sphereGeometry args={[0.2, 20, 14]} />
      {mat("#7c818e")}
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.05, 0.72, 0.205]}>
        <cylinderGeometry args={[0.008, 0.008, 0.14, 6]} />
        {mat("#f2f2f2")}
      </mesh>
    ))}
    {/* bolso canguru */}
    <mesh position={[0, 0.5, 0.19]} scale={[1, 0.55, 0.3]}>
      <sphereGeometry args={[0.13, 20, 12]} />
      {mat("#7c818e")}
    </mesh>
  </group>
);

const BiaHair = () => (
  <group>
    <mesh position={[0, 0.05, -0.02]} rotation={[-0.35, 0, 0]} castShadow>
      <sphereGeometry args={[HEAD_R * 1.045, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {mat("#3b2318", 0.7)}
    </mesh>
    {/* franja */}
    <mesh position={[0.12, 0.26, HEAD_R * 0.8]} rotation={[0.7, 0, -0.5]} scale={[1.6, 0.8, 0.5]}>
      <sphereGeometry args={[0.1, 16, 12]} />
      {mat("#3b2318", 0.7)}
    </mesh>
    {/* coque */}
    <mesh position={[0, HEAD_R + 0.1, -0.12]} castShadow>
      <sphereGeometry args={[0.17, 24, 20]} />
      {mat("#3b2318", 0.7)}
    </mesh>
    <mesh position={[0, HEAD_R + 0.02, -0.08]} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.12, 0.03, 10, 24]} />
      {mat("#ff6fa3", 0.4)}
    </mesh>
  </group>
);

/** Peixinho laranja de olhos enormes. */
export const Fish: React.FC<{ frame: number; color?: string; fin?: string; position?: [number, number, number]; rotationY?: number; scale?: number; happy?: boolean }> = ({
  frame, color = "#ff8a1f", fin = "#ffb15c", position = [0, 0, 0], rotationY = 0, scale = 1, happy = true,
}) => {
  const wig = Math.sin(frame * 0.45);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group rotation={[0, wig * 0.12, 0]}>
        <mesh scale={[1.25, 1, 0.75]} castShadow>
          <sphereGeometry args={[0.2, 32, 24]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* cauda */}
        <group position={[-0.26, 0, 0]} rotation={[0, wig * 0.6, 0]}>
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.25]}>
            <coneGeometry args={[0.16, 0.22, 24]} />
            <meshStandardMaterial color={fin} roughness={0.3} />
          </mesh>
        </group>
        {/* barbatana de cima */}
        <mesh position={[-0.02, 0.2, 0]} rotation={[0, 0, -0.5]} scale={[1, 1, 0.2]}>
          <coneGeometry args={[0.08, 0.16, 16]} />
          <meshStandardMaterial color={fin} roughness={0.3} />
        </mesh>
        {/* olhos */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.13, 0.05, s * 0.11]}>
            <mesh>
              <sphereGeometry args={[0.075, 20, 16]} />
              <meshStandardMaterial color="#fff" roughness={0.2} />
            </mesh>
            <mesh position={[0.035, 0, s * 0.045]}>
              <sphereGeometry args={[0.042, 16, 12]} />
              <meshStandardMaterial color="#1a0d06" roughness={0.1} />
            </mesh>
            <mesh position={[0.06, 0.02, s * 0.07]}>
              <sphereGeometry args={[0.013, 8, 8]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}
        {/* boquinha */}
        <mesh position={[0.245, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.025, 0.01, 8, 16, happy ? Math.PI : Math.PI * 2]} />
          <meshStandardMaterial color="#b84a10" />
        </mesh>
      </group>
    </group>
  );
};
