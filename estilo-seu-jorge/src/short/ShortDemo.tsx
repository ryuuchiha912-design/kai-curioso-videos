import "@fontsource/nunito/900.css";
import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { Personagem, Expressao, Visual } from "./Personagem";
import { Cenario } from "./Cenario";

// ---------- Roteiro: palavras com tempo (segundos) ----------
// Com narração real, esses tempos vêm automaticamente da transcrição (Whisper).
export const PALAVRAS: { t: number; w: string }[] = [
  { t: 0.15, w: "E" }, { t: 0.3, w: "se" }, { t: 0.5, w: "você" }, { t: 0.8, w: "acordasse" }, { t: 1.35, w: "amanhã..." },
  { t: 2.4, w: "com" }, { t: 2.6, w: "um" }, { t: 2.75, w: "MILHÃO" }, { t: 3.3, w: "de" }, { t: 3.45, w: "reais" },
  { t: 3.9, w: "na" }, { t: 4.05, w: "conta?" },
  { t: 4.9, w: "O" }, { t: 5.05, w: "que" }, { t: 5.25, w: "você" }, { t: 5.5, w: "faria" }, { t: 5.85, w: "primeiro?" },
];
const FIM_FALA = 6.6;

const JOAO: Visual = { pele: "#e8b48a", cabelo: "#4a2c1d", camisa: "#f2c84b", calca: "#2f4b7c", sapato: "#3b2a20" };

const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

// ---------- Câmera com cortes ----------
const Camera = ({ t }: { t: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    let pos: [number, number, number], alvo: [number, number, number];
    if (t < 2.3) {
      const k = ease(t, 0, 2.3);
      pos = [0.6 - k * 0.6, 2.6, 8.2 - k * 1.4];
      alvo = [0, 2.0, 0];
    } else if (t < 4.6) {
      const k = ease(t, 2.3, 4.6);
      pos = [0.6 - k * 0.3, 2.5, 5.0 - k * 0.6];
      alvo = [0, 2.45, 0];
    } else {
      const k = ease(t, 4.6, 7);
      pos = [-1.2 + k * 0.8, 2.3 + k * 0.3, 6.6 - k * 0.6];
      alvo = [0, 1.9, 0];
    }
    camera.position.set(...pos);
    camera.lookAt(new THREE.Vector3(...alvo));
  }, [t, camera]);
  return null;
};

// ---------- Dinheiro caindo ----------
const Dinheiro = ({ t }: { t: number }) => {
  if (t < 4.4) return null;
  return (
    <group>
      {Array.from({ length: 34 }, (_, i) => {
        const r1 = ((i * 73) % 100) / 100, r2 = ((i * 31) % 100) / 100, r3 = ((i * 57) % 100) / 100;
        const dt = t - 4.4 - r1 * 1.2;
        if (dt < 0) return null;
        const y = Math.max(0.05, 5.2 - dt * (2.6 + r2 * 1.5));
        const parado = y <= 0.05;
        const moeda = i % 3 === 0;
        return (
          <mesh
            key={i}
            position={[(r2 - 0.5) * 6, y, (r3 - 0.5) * 3 + 0.5]}
            rotation={parado ? [-Math.PI / 2, 0, r1 * 6] : [dt * (2 + r1 * 3), dt * 1.5, dt * (1 + r3 * 2)]}
            castShadow
          >
            {moeda ? <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} /> : <boxGeometry args={[0.55, 0.26, 0.01]} />}
            <meshStandardMaterial color={moeda ? "#f5c542" : "#6cc070"} metalness={moeda ? 0.6 : 0} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Expressão do personagem ao longo do tempo ----------
const expressao = (t: number, fps: number, frame: number): Expressao => {
  // fala: boca abre/fecha enquanto há palavra recente
  const falando = PALAVRAS.some((p, i) => {
    const prox = PALAVRAS[i + 1]?.t ?? FIM_FALA;
    return t >= p.t && t < Math.min(prox, p.t + 0.45);
  });
  const fala = falando ? 0.35 + 0.65 * Math.abs(Math.sin(t * 17)) : 0;
  const surpresa = ease(t, 2.6, 2.85) * (1 - ease(t, 4.3, 4.7));
  const sorriso = ease(t, 4.5, 4.9);
  // piscar a cada ~2.7s
  const ciclo = (t % 2.7) / 2.7;
  const piscar = ciclo > 0.95 ? Math.sin(((ciclo - 0.95) / 0.05) * Math.PI) : 0;
  const comemorar = spring({ frame: frame - Math.round(4.7 * fps), fps, config: { damping: 9 } });
  const balanco = Math.sin(t * 9) * 0.25 * comemorar;
  return {
    fala,
    surpresa,
    sorriso,
    piscar: surpresa > 0.5 ? 0 : piscar,
    olharX: t < 2.3 ? Math.sin(t * 1.3) * 0.4 : 0,
    olharY: surpresa * 0.2,
    bracoE: -0.1 + comemorar * 2.3 + balanco + (t < 2.3 ? Math.sin(t * 3) * 0.15 : 0),
    bracoD: -0.1 + comemorar * 2.3 - balanco + surpresa * 0.9,
    inclinarCabeca: t < 2.3 ? Math.sin(t * 1.6) * 0.08 : Math.sin(t * 4) * 0.05 * comemorar,
  };
};

// ---------- Legenda palavra por palavra ----------
const Legenda = ({ t, fps, frame }: { t: number; fps: number; frame: number }) => {
  let idx = -1;
  PALAVRAS.forEach((p, i) => { if (t >= p.t) idx = i; });
  if (idx < 0 || t > FIM_FALA) return null;
  const p = PALAVRAS[idx];
  const pop = spring({ frame: frame - Math.round(p.t * fps), fps, config: { damping: 12, stiffness: 220 } });
  const destaque = p.w === p.w.toUpperCase() && p.w.length > 2;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 260 }}>
      <div
        style={{
          fontFamily: "Nunito",
          fontWeight: 900,
          fontSize: destaque ? 120 : 92,
          color: destaque ? "#ffd84d" : "#ffffff",
          WebkitTextStroke: "14px #111",
          paintOrder: "stroke fill",
          textShadow: "0 8px 0 rgba(0,0,0,.35)",
          transform: `scale(${0.6 + pop * 0.4}) rotate(${destaque ? -3 : 0}deg)`,
          letterSpacing: 1,
        }}
      >
        {p.w}
      </div>
    </AbsoluteFill>
  );
};

export const ShortDemo = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const e = expressao(t, fps, frame);
  const pulo = t > 4.7 ? Math.abs(Math.sin((t - 4.7) * 6)) * 0.25 * ease(t, 4.7, 4.9) : 0;

  return (
    <AbsoluteFill style={{ background: "#4fa89a" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 2.5, 8] }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Camera t={t} />
        <hemisphereLight args={["#fff4e0", "#6b8f86", 1.1]} />
        <directionalLight
          position={[3, 7, 5]}
          intensity={2.4}
          color="#fff1dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-radius={6}
          shadow-bias={-0.0005}
        />
        <pointLight position={[1.9, 3.6, -1.5]} intensity={6} color="#9fb4ff" distance={6} />
        <pointLight position={[-2, 3, 3]} intensity={5} color="#ffd9a8" distance={9} />
        <Cenario frame={frame} />
        <Personagem e={e} v={JOAO} position={[0, 0, 0.4]} rotationY={-0.12} pulo={pulo} />
        <Dinheiro t={t} />
      </ThreeCanvas>
      <Legenda t={t} fps={fps} frame={frame} />
    </AbsoluteFill>
  );
};
