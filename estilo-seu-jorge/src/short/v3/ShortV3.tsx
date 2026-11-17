import "@fontsource/nunito/900.css";
import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { Personagem3, Look, Pose, Rosto, ROSTO, POSE, Braco } from "./Personagem3";
import { Escritorio3, Celular, Joinha, BalaoPensamento } from "./Escritorio3";

export const DURACAO_V3 = 9.8;

// Legenda em blocos de 1–2 palavras (com narração real, os tempos vêm do Whisper)
const BLOCOS = [
  ["Esse é o", 0.2], ["Seu Jorge.", 0.9], ["Ele passa", 2.55], ["o dia todo", 3.1], ["no celular...", 3.8],
  ["sonhando", 5.0], ["com as férias", 5.6], ["na praia.", 6.4], ["Até o chefe", 7.45], ["aparecer", 8.1], ["na porta.", 8.65],
].map(([txt, t], i, a) => ({ txt: txt as string, t: t as number, fim: (a[i + 1]?.[1] as number) ?? DURACAO_V3 - 0.3 }));

const JORGE: Look = { pele: "#c48a62", cabelo: "#2e1d14", cabeloTipo: "curto", barba: true, roupa: "xadrez", cor1: "#a83a2e", cor2: "#4d140f", mangaLonga: true, calca: "#2f3d5c", sapato: "#4a2c1d" };
const CHEFE: Look = { pele: "#e7b48f", cabelo: "#17171a", cabeloTipo: "curto", roupa: "terno", cor1: "#2a2e37", cor2: "#c0262d", calca: "#2a2e37", sapato: "#111" };

const e = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
const mix = (a: Braco, b: Braco, k: number): Braco => ({
  ombroZ: a.ombroZ + (b.ombroZ - a.ombroZ) * k, cotoveloZ: (a.cotoveloZ ?? 0) + ((b.cotoveloZ ?? 0) - (a.cotoveloZ ?? 0)) * k, ombroX: a.ombroX + (b.ombroX - a.ombroX) * k, cotovelo: a.cotovelo + (b.cotovelo - a.cotovelo) * k,
});

const ATRAS_CABECA: Braco = { ombroZ: 2.3, ombroX: 0.35, cotovelo: -0.6, cotoveloZ: 2.0 };
const SEGURA_CEL: Braco = { ombroZ: -0.15, ombroX: -1.15, cotovelo: 1.35 };
const SOLTO: Braco = { ombroZ: 0.15, ombroX: -0.2, cotovelo: 0.5 };

type Plano = { ini: number; de: number[]; para: number[]; alvo: number[]; fov?: number };
const PLANOS: Plano[] = [
  { ini: 0, de: [-1.9, 2.3, 5.2], para: [-1.5, 2.3, 4.6], alvo: [0.1, 2.0, 0] },
  { ini: 2.5, de: [-0.9, 2.15, 3.3], para: [-0.75, 2.2, 3.0], alvo: [0, 2.15, 0] },
  { ini: 5.0, de: [0.25, 2.4, 4.0], para: [0.2, 2.45, 3.6], alvo: [0.12, 2.6, 0] },
  { ini: 7.4, de: [-1.0, 2.35, 2.1], para: [-1.1, 2.35, 1.9], alvo: [-2.05, 2.3, -1.25] },
  { ini: 8.6, de: [0.0, 2.35, 2.5], para: [0.0, 2.4, 2.1], alvo: [0, 2.4, 0] },
];

const Camera = ({ t }: { t: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    let i = 0; PLANOS.forEach((p, k) => { if (t >= p.ini) i = k; });
    const p = PLANOS[i], fim = PLANOS[i + 1]?.ini ?? DURACAO_V3;
    const k = e(t, p.ini, fim);
    camera.position.set(...(p.de.map((v, j) => v + (p.para[j] - v) * k) as [number, number, number]));
    camera.lookAt(new THREE.Vector3(...(p.alvo as [number, number, number])));
  }, [t, camera]);
  return null;
};

const Legenda = ({ t }: { t: number }) => {
  const b = BLOCOS.find((x) => t >= x.t && t < x.fim);
  if (!b) return null;
  const s = interpolate(t - b.t, [0, 0.07], [0.9, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1180 }}>
      <div style={{
        fontFamily: "Nunito", fontWeight: 900, fontSize: 76, color: "#fff", letterSpacing: -1,
        WebkitTextStroke: "10px #0e0e0e", paintOrder: "stroke fill", textShadow: "0 6px 8px rgba(0,0,0,.5)",
        transform: `scale(${s})`,
      }}>{b.txt}</div>
    </AbsoluteFill>
  );
};

const piscar = (t: number, fase: number) => {
  const c = ((t + fase) % 3.3) / 3.3;
  return c > 0.955 ? Math.sin(((c - 0.955) / 0.045) * Math.PI) : 0;
};

export const ShortV3 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // ---------- Seu Jorge ----------
  const kCel = e(t, 2.45, 2.85) * (1 - e(t, 8.6, 8.8));
  const oculos = spring({ frame: frame - Math.round(5.3 * fps), fps, config: { damping: 11 } }) * (t < 8.6 ? 1 : 0);
  const balao = spring({ frame: frame - Math.round(5.7 * fps), fps, config: { damping: 12 } }) * (t < 7.4 ? 1 : 0);
  const susto = t >= 8.6;
  const rJorge: Rosto = {
    ...ROSTO,
    olhosFelizes: t < 2.5 ? 1 : 0,
    sorrisinho: t < 2.5 ? 0.9 : t < 5 ? 0.7 : 0,
    sorriso: t >= 5 && t < 8.6 ? e(t, 5.2, 5.5) : 0,
    palpebra: t >= 2.5 && t < 5 ? 0.85 : 0,
    olharY: t >= 2.5 && t < 5 ? 0.7 : 0,
    olharX: t >= 2.5 && t < 5 ? 0.25 : susto ? -0.6 : 0,
    assobio: t >= 4.3 && t < 5 ? 1 : 0,
    nervoso: susto ? 1 : 0,
    suor: susto ? e(t, 8.8, 9.3) : 0,
    surpresa: susto ? 0.6 : 0,
    sobrancelha: susto ? 0.6 : t < 2.5 ? 0.2 : 0,
    piscar: susto ? 0 : piscar(t, 0.3),
  };
  const balanco = Math.sin(t * 2.2) * 0.05;
  const pJorge: Pose = {
    ...POSE,
    E: susto ? mix(ATRAS_CABECA, SOLTO, e(t, 8.6, 8.8)) : ATRAS_CABECA,
    D: mix(susto ? mix(ATRAS_CABECA, SOLTO, e(t, 8.6, 8.8)) : ATRAS_CABECA, SEGURA_CEL, kCel),
    cabecaX: t >= 2.5 && t < 5 ? 0.12 : -0.05,
    cabecaZ: susto ? 0 : balanco,
    cabecaY: susto ? -0.25 : 0,
    corpoZ: susto ? 0 : balanco * 0.4,
  };
  const pulinho = susto ? Math.max(0, Math.sin((t - 8.6) * 14)) * 0.12 * (1 - e(t, 8.8, 9.1)) : 0;

  // ---------- Chefe ----------
  const entra = e(t, 7.4, 7.75);
  const rChefe: Rosto = { ...ROSTO, olhosFelizes: 1, sorriso: 1, sobrancelha: 0.3 };
  const pChefe: Pose = {
    ...POSE, cabecaZ: -0.12 + Math.sin(t * 6) * 0.03, corpoZ: -0.08,
    D: { ombroZ: -0.3 * entra, ombroX: -1.0 * entra, cotovelo: 1.6 * entra },
    E: SOLTO,
  };

  return (
    <AbsoluteFill style={{ background: "#2a2622" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 38, near: 0.05, far: 60 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
        <Camera t={t} />
        <hemisphereLight args={["#fff3e2", "#5e544a", 0.55]} />
        <ambientLight intensity={0.25} />
        {/* key forte lateral (metade do rosto em sombra, como na referência) */}
        <directionalLight position={[-4, 5, 3]} intensity={2.8} color="#fff0dc" castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}
          shadow-radius={10} shadow-bias={-0.0004} />
        {/* luz fria da janela */}
        <directionalLight position={[3, 3, -1]} intensity={0.9} color="#cfe0ff" />
        <pointLight position={[0, 3.5, 3]} intensity={3} color="#ffe6c9" distance={8} />
        <Escritorio3 frame={frame} />

        <Personagem3 rosto={rJorge} pose={pJorge} position={[0, -0.28, 0]} pulo={pulinho}
          look={{ ...JORGE, oculosEscuros: oculos }} maoD={kCel > 0.5 ? <Celular /> : undefined} />
        <BalaoPensamento pos={[0.62, 3.5, 0.4]} escala={balao * 0.48} texto="PRAIA" />

        {t >= 7.3 && t < 8.6 && (
          <Personagem3 rosto={rChefe} pose={pChefe} look={CHEFE}
            position={[-2.4 + entra * 0.45, -0.3, -1.2]} rotY={0.32} maoD={<Joinha />} />
        )}
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.4) 100%)" }} />
      <Legenda t={t} />
    </AbsoluteFill>
  );
};
