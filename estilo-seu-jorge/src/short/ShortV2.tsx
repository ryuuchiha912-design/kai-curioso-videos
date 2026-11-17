import "@fontsource/nunito/900.css";
import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { Boneco, Look, Pose, Rosto, ROSTO_NEUTRO, POSE_NEUTRA } from "./Boneco";
import { Escritorio } from "./Escritorio";

// Palavras com tempo (s). Com narração real, vêm do Whisper.
const PALAVRAS: { t: number; w: string }[] = [
  { t: 0.15, w: "E" }, { t: 0.3, w: "se" }, { t: 0.5, w: "você" }, { t: 0.8, w: "acordasse" }, { t: 1.35, w: "amanhã..." },
  { t: 2.4, w: "com" }, { t: 2.6, w: "um" }, { t: 2.75, w: "milhão" }, { t: 3.3, w: "de" }, { t: 3.45, w: "reais" },
  { t: 3.9, w: "na" }, { t: 4.05, w: "conta?" },
  { t: 4.9, w: "O" }, { t: 5.05, w: "que" }, { t: 5.25, w: "você" }, { t: 5.5, w: "faria" }, { t: 5.85, w: "primeiro?" },
];
const FIM = 6.7;

// Blocos de legenda (1–2 palavras), como no estilo de referência
const BLOCOS = [
  ["E se", 0.15], ["você", 0.5], ["acordasse", 0.8], ["amanhã...", 1.35], ["com um", 2.4], ["milhão", 2.75],
  ["de reais", 3.3], ["na conta?", 3.9], ["O que", 4.9], ["você faria", 5.25], ["primeiro?", 5.85],
].map(([txt, t], i, a) => ({ txt: txt as string, t: t as number, fim: (a[i + 1]?.[1] as number) ?? FIM }));

const LEO: Look = { pele: "#e2a77c", cabelo: "#5a3825", cabeloTipo: "curto", camisa: "#3f9a76", calca: "#26262c", sapato: "#e9e4da" };
const BIA: Look = { pele: "#c98a5e", cabelo: "#b5462a", cabeloTipo: "longo", camisa: "#f4efe6", listras: "#3b5f8f", calca: "#26262c", sapato: "#7a3e22" };

const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

const Camera = ({ t }: { t: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    let p: number[], a: number[];
    if (t < 2.3) { const k = ease(t, 0, 2.3); p = [0.55, 2.9, 7.6 - k * 1.0]; a = [0.35, 2.2, 0]; }
    else if (t < 4.5) { const k = ease(t, 2.3, 4.5); p = [-0.15, 2.85, 4.1 - k * 0.5]; a = [-0.25, 2.6, 0]; }
    else { const k = ease(t, 4.5, 7); p = [0.9 - k * 0.4, 2.7, 7.0 - k * 0.5]; a = [0.4, 2.1, 0]; }
    camera.position.set(p[0], p[1], p[2]);
    camera.lookAt(new THREE.Vector3(a[0], a[1], a[2]));
  }, [t, camera]);
  return null;
};

const Dinheiro = ({ t }: { t: number }) => {
  if (t < 4.4) return null;
  return (
    <group>
      {Array.from({ length: 30 }, (_, i) => {
        const r1 = ((i * 73) % 100) / 100, r2 = ((i * 31) % 100) / 100, r3 = ((i * 57) % 100) / 100;
        const dt = t - 4.4 - r1 * 1.2;
        if (dt < 0) return null;
        const y = Math.max(0.03, 5.2 - dt * (2.4 + r2 * 1.3));
        const chao = y <= 0.03;
        return (
          <mesh key={i} position={[(r2 - 0.5) * 5, y, (r3 - 0.5) * 2.5 + 0.6]}
            rotation={chao ? [-Math.PI / 2, 0, r1 * 6] : [dt * (2 + r1 * 3), dt * 1.4, dt * (1 + r3 * 2)]} castShadow>
            <boxGeometry args={[0.5, 0.24, 0.008]} />
            <meshStandardMaterial color="#7fae6b" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

const falando = (t: number) =>
  PALAVRAS.some((p, i) => t >= p.t && t < Math.min(PALAVRAS[i + 1]?.t ?? FIM, p.t + 0.42));

const piscar = (t: number, fase: number) => {
  const c = ((t + fase) % 3.1) / 3.1;
  return c > 0.955 ? Math.sin(((c - 0.955) / 0.045) * Math.PI) : 0;
};

const Legenda = ({ t }: { t: number }) => {
  const b = BLOCOS.find((x) => t >= x.t && t < x.fim);
  if (!b) return null;
  const s = interpolate(t - b.t, [0, 0.08], [0.92, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1270 }}>
      <div style={{
        fontFamily: "Nunito", fontWeight: 900, fontSize: 74, color: "#fff", letterSpacing: -0.5,
        WebkitTextStroke: "9px #111", paintOrder: "stroke fill",
        textShadow: "0 5px 6px rgba(0,0,0,.45)", transform: `scale(${s})`,
      }}>{b.txt}</div>
    </AbsoluteFill>
  );
};

export const ShortV2 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const surpresa = ease(t, 2.65, 2.85) * (1 - ease(t, 4.2, 4.5));
  const feliz = ease(t, 4.45, 4.75);
  const comemora = spring({ frame: frame - Math.round(4.6 * fps), fps, config: { damping: 10 } });
  const bal = Math.sin(t * 10) * 0.2 * comemora;
  const fala = falando(t) ? 0.3 + 0.7 * Math.abs(Math.sin(t * 16)) : 0;

  const rostoLeo: Rosto = {
    ...ROSTO_NEUTRO,
    fala: surpresa > 0.5 ? 0 : fala,
    surpresa,
    sorriso: feliz,
    nervoso: t > 3.35 && t < 4.35 ? 1 : 0,
    suor: ease(t, 3.4, 3.9) * (1 - ease(t, 4.3, 4.5)),
    piscar: surpresa > 0.2 ? 0 : piscar(t, 0.4),
    olharX: t < 2.3 ? 0.3 * Math.sin(t * 1.2) : 0,
    sobrancelha: t > 3.35 && t < 4.35 ? 0.7 : feliz * 0.4,
  };
  const poseLeo: Pose = {
    ...POSE_NEUTRA,
    bracoE: 0.12 + comemora * 2.4 + bal,
    bracoD: 0.12 + comemora * 2.4 - bal,
    cotoveloE: 0.3 + (t < 2.3 ? 0.6 * Math.abs(Math.sin(t * 2.5)) : 0) - comemora * 0.2,
    cotoveloD: 0.3 - comemora * 0.2,
    cabecaZ: t < 2.3 ? Math.sin(t * 1.5) * 0.06 : Math.sin(t * 5) * 0.06 * comemora,
    cabecaY: 0.1,
  };
  const rostoBia: Rosto = {
    ...ROSTO_NEUTRO,
    palpebra: 1 - ease(t, 4.6, 4.9) * 0.9,
    surpresa: ease(t, 4.6, 4.9) * 0.6,
    olharX: -0.7,
    olharY: 0.1,
    piscar: piscar(t, 1.7),
    sobrancelha: -0.2 + ease(t, 4.6, 4.9) * 0.8,
  };
  const poseBia: Pose = { ...POSE_NEUTRA, cotoveloE: 1.4, cotoveloD: 1.3, bracoE: 0.35, bracoD: 0.35, cabecaY: -0.35 };
  const pulo = t > 4.6 ? Math.abs(Math.sin((t - 4.6) * 6.5)) * 0.22 * comemora : 0;

  return (
    <AbsoluteFill style={{ background: "#2a2420" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.1, far: 60 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}>
        <Camera t={t} />
        <hemisphereLight args={["#fff1dd", "#6a5a4c", 1.15]} />
        <directionalLight position={[2.5, 6, 4]} intensity={1.9} color="#ffe2bd" castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6}
          shadow-radius={8} shadow-bias={-0.0004} />
        <pointLight position={[3.15, 1.65, -2.3]} intensity={4} color="#ffc777" distance={5} />
        <pointLight position={[2.2, 1.8, -1.6]} intensity={2.5} color="#7fb2ff" distance={3.5} />
        <pointLight position={[-2.5, 3.5, 3]} intensity={4} color="#ffd9b0" distance={10} />
        <Escritorio frame={frame} />
        <Boneco rosto={rostoLeo} pose={poseLeo} look={LEO} position={[-0.25, 0, 0.5]} rotY={0.05} pulo={pulo} />
        <Boneco rosto={rostoBia} pose={poseBia} look={BIA} position={[1.15, 0, -0.4]} rotY={-0.45} />
        <Dinheiro t={t} />
      </ThreeCanvas>
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)" }} />
      <Legenda t={t} />
    </AbsoluteFill>
  );
};
