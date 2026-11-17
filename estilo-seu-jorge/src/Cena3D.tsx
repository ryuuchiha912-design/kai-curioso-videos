import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { createTikTokStyleCaptions, Caption } from "@remotion/captions";

// Legendas (em produção, gere com transcrição; aqui são manuais)
const captions: Caption[] = [
  { text: "Olá!", startMs: 0, endMs: 1200, timestampMs: 600, confidence: 1 },
  { text: " Animação", startMs: 1200, endMs: 2600, timestampMs: 1900, confidence: 1 },
  { text: " 3D", startMs: 2600, endMs: 3600, timestampMs: 3100, confidence: 1 },
  { text: " com Remotion", startMs: 3600, endMs: 5000, timestampMs: 4300, confidence: 1 },
];
const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 800 });

const Cubo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escala = spring({ frame, fps, config: { damping: 12 } });
  return (
    <mesh rotation={[frame * 0.02, frame * 0.03, 0]} scale={escala * 1.6}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f8cff" metalness={0.3} roughness={0.4} />
    </mesh>
  );
};

const Legenda = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
  if (!page) return null;
  const opacity = interpolate(ms - page.startMs, [0, 150], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
      <div style={{ opacity, fontSize: 80, fontWeight: 800, color: "white", fontFamily: "sans-serif", textShadow: "0 4px 20px rgba(0,0,0,.8)" }}>
        {page.text}
      </div>
    </AbsoluteFill>
  );
};

export const Cena3D = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0b1020, #1d2b55)" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <Cubo />
      </ThreeCanvas>
      <Legenda />
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
