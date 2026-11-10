import React from "react";
import * as THREE from "three";
import { Box } from "./props";
import { canvasTexture } from "./textures";
import { rand } from "./anim";

/** Objetos do short 2 (anos 90 x hoje). Tudo genérico, sem marca. */
type V3 = [number, number, number];
const M: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; t?: number }> = ({ c, r = 0.6, m = 0, e, ei = 0, t }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={ei} transparent={t !== undefined} opacity={t ?? 1} />
);

/** Tela que brilha sozinha: recebe uma textura (o jogo) e ignora a luz da cena. */
const Screen: React.FC<{ w: number; h: number; map?: THREE.Texture; p?: V3; on?: number }> = ({ w, h, map, p = [0, 0, 0], on = 1 }) => (
  <mesh position={p}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={map} color={new THREE.Color(on, on, on)} toneMapped={false} />
  </mesh>
);

/** TV de tubo: caixa funda, moldura bege, tela levemente "abaulada" (vidro por cima). */
export const CrtTV: React.FC<{ p?: V3; rot?: V3; s?: number; screen?: THREE.Texture; on?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, screen, on = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[1.1, 0.86, 0.5]} p={[0, 0.43, 0.05]} c="#cfc4b0" r={0.5} />
    {/* traseira afunilada */}
    <mesh position={[0, 0.43, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.28, 0.42, 0.42, 4, 1]} />
      <M c="#bdb19b" />
    </mesh>
    <Box s={[0.9, 0.68, 0.02]} p={[0, 0.46, 0.3]} c="#2a2a2a" />
    <Screen w={0.82} h={0.6} p={[0, 0.46, 0.312]} map={screen} on={on} />
    {/* vidro com reflexo */}
    <mesh position={[0, 0.46, 0.318]}>
      <planeGeometry args={[0.82, 0.6]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.07} roughness={0.05} metalness={0.4} />
    </mesh>
    {/* botões e alto-falante */}
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0.33 + i * 0.07, 0.07, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
        <M c="#6b6355" />
      </mesh>
    ))}
    <mesh position={[-0.42, 0.07, 0.31]}>
      <circleGeometry args={[0.012, 10]} />
      <meshBasicMaterial color={on > 0.2 ? "#ff3b2f" : "#550000"} toneMapped={false} />
    </mesh>
  </group>
);

/** TV de tela plana fina e enorme, num rack baixo. */
export const FlatTV: React.FC<{ p?: V3; rot?: V3; s?: number; screen?: THREE.Texture; on?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, screen, on = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[2.3, 1.32, 0.05]} p={[0, 1.25, 0]} c="#111317" r={0.3} />
    <Screen w={2.22} h={1.25} p={[0, 1.25, 0.027]} map={screen} on={on} />
    <Box s={[0.5, 0.05, 0.2]} p={[0, 0.58, 0]} c="#1b1d22" />
    <Box s={[0.08, 0.06, 0.05]} p={[0, 0.6, 0]} c="#1b1d22" />
  </group>
);

/** Lata de refri (sem marca): vermelha, faixa branca, tampa prateada, gotinhas. `open` 0..1 abre o anel. */
export const SodaCan: React.FC<{ p?: V3; rot?: V3; s?: number; old?: boolean; open?: number; sweat?: boolean }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, old = false, open = 0, sweat = true }) => {
  const tex = canvasTexture(`can-${old}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = old ? "#d8262b" : "#e8352a"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(0, h * 0.55);
    for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h * 0.5 + Math.sin((x / w) * Math.PI * 4) * 14);
    ctx.lineTo(w, h * 0.62);
    for (let x = w; x >= 0; x -= 8) ctx.lineTo(x, h * 0.6 + Math.sin((x / w) * Math.PI * 4) * 14);
    ctx.fill();
    ctx.fillStyle = old ? "#ffd23f" : "#ffffff";
    ctx.font = "bold 46px 'Lilita One', sans-serif"; ctx.textAlign = "center";
    ctx.fillText("REFRI", w * 0.25, h * 0.38); ctx.fillText("REFRI", w * 0.75, h * 0.38);
  });
  return (
    <group position={p} rotation={rot} scale={s}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.033, 0.033, 0.12, 28]} />
        <meshStandardMaterial map={tex} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.123, 0]}>
        <cylinderGeometry args={[0.028, 0.033, 0.008, 28]} />
        <M c="#d9dde2" r={0.2} m={0.8} />
      </mesh>
      {/* anel */}
      <group position={[0, 0.128, 0.008]} rotation={[-open * 1.2, 0, 0]}>
        <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.008, 0.002, 6, 16]} />
          <M c="#c0c5cc" r={0.2} m={0.8} />
        </mesh>
      </group>
      {sweat && Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.034, 0.02 + rand(i) * 0.09, Math.sin(i * 2.1) * 0.034]} scale={[1, 1.4, 1]}>
          <sphereGeometry args={[0.0035, 8, 6]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.7} roughness={0} />
        </mesh>
      ))}
    </group>
  );
};

/** Bala embrulhada (balinha com as duas pontas torcidas). */
export const Candy: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#ff6fa3" }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh scale={[1.3, 1, 1]} castShadow>
      <sphereGeometry args={[0.018, 14, 10]} />
      <M c={c} r={0.25} />
    </mesh>
    {[-1, 1].map((k) => (
      <mesh key={k} position={[k * 0.03, 0, 0]} rotation={[0, 0, (k * Math.PI) / 2]}>
        <coneGeometry args={[0.013, 0.022, 8]} />
        <M c={c} r={0.25} />
      </mesh>
    ))}
  </group>
);

const CANDY_COLORS = ["#ff6fa3", "#ffd23f", "#4cc3ff", "#7be07b", "#ff8a3d", "#c38bff"];

/** Pacote de bala aberto, com balas derramando. */
export const CandyBag: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh position={[0, 0.05, 0]} scale={[1, 0.55, 0.45]} rotation={[0, 0, -0.15]} castShadow>
      <sphereGeometry args={[0.11, 20, 14]} />
      <M c="#ff4fa0" r={0.3} m={0.3} />
    </mesh>
    <mesh position={[0.1, 0.07, 0]} rotation={[0, 0, -1.5]}>
      <cylinderGeometry args={[0.045, 0.03, 0.04, 16, 1, true]} />
      <meshStandardMaterial color="#ff8a1f" side={THREE.DoubleSide} />
    </mesh>
    {CANDY_COLORS.map((c, i) => (
      <Candy key={i} c={c} p={[0.15 + rand(i) * 0.14, 0.015, (rand(i + 7) - 0.5) * 0.14]} rot={[0, rand(i + 3) * 3, 0]} />
    ))}
  </group>
);

/** Controle anos 90: cinza, duas alças, cruz e botões coloridos (genérico). */
export const Pad98: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[0.2, 0.035, 0.08]} c="#a9a9ad" r={0.5} />
    {[-1, 1].map((k) => (
      <mesh key={k} position={[k * 0.1, -0.005, -0.04]} rotation={[0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.025, 0.06, 6, 10]} />
        <M c="#a9a9ad" />
      </mesh>
    ))}
    <Box s={[0.045, 0.012, 0.013]} p={[-0.06, 0.022, 0]} c="#333" />
    <Box s={[0.013, 0.012, 0.045]} p={[-0.06, 0.022, 0]} c="#333" />
    {["#e8432f", "#ffd23f", "#3d7be0"].map((c, i) => (
      <mesh key={c} position={[0.04 + i * 0.022, 0.022, (i % 2) * 0.016 - 0.008]}>
        <cylinderGeometry args={[0.009, 0.009, 0.008, 10]} />
        <M c={c} r={0.3} />
      </mesh>
    ))}
  </group>
);

/** Controle moderno: arredondado, branco com detalhes pretos. */
export const PadNew: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh scale={[1, 0.3, 0.55]} castShadow>
      <sphereGeometry args={[0.11, 24, 16]} />
      <M c="#f2f3f5" r={0.35} />
    </mesh>
    {[-1, 1].map((k) => (
      <mesh key={k} position={[k * 0.04, 0.03, 0.005]}>
        <cylinderGeometry args={[0.012, 0.014, 0.014, 14]} />
        <M c="#222" r={0.5} />
      </mesh>
    ))}
    <mesh position={[0, 0.034, -0.025]}>
      <boxGeometry args={[0.05, 0.004, 0.012]} />
      <meshBasicMaterial color="#6ad0ff" toneMapped={false} />
    </mesh>
  </group>
);

/** Console anos 90 (caixa cinza genérica com fenda) e console novo (placa branca). */
export const Console98: React.FC<{ p?: V3; rot?: V3 }> = ({ p = [0, 0, 0], rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}>
    <Box s={[0.36, 0.08, 0.26]} p={[0, 0.04, 0]} c="#8f8f96" r={0.5} />
    <Box s={[0.16, 0.05, 0.06]} p={[0, 0.1, -0.03]} c="#5a5a62" />
    <mesh position={[0.13, 0.081, 0.09]}>
      <circleGeometry args={[0.008, 10]} />
      <meshBasicMaterial color="#ff3b2f" toneMapped={false} />
    </mesh>
  </group>
);
export const ConsoleNew: React.FC<{ p?: V3; rot?: V3 }> = ({ p = [0, 0, 0], rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}>
    <Box s={[0.42, 0.06, 0.3]} p={[0, 0.03, 0]} c="#f2f3f5" r={0.3} />
    <Box s={[0.4, 0.004, 0.005]} p={[0, 0.045, 0.15]} c="#6ad0ff" e="#6ad0ff" ei={2} />
  </group>
);

/** Nota musical 3D (cabeça + haste + bandeirinha). Cor quente. */
export const Note: React.FC<{ p?: V3; rot?: V3; s?: number; c?: string; glow?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, c = "#ffd23f", glow = 0.6 }) => (
  <group position={p} rotation={rot} scale={Math.max(s, 0.0001)}>
    <mesh rotation={[0, 0, 0.4]} scale={[1.25, 0.9, 0.7]}>
      <sphereGeometry args={[0.06, 18, 12]} />
      <M c={c} r={0.3} e={c} ei={glow} />
    </mesh>
    <mesh position={[0.065, 0.14, 0]}>
      <cylinderGeometry args={[0.011, 0.011, 0.28, 8]} />
      <M c={c} r={0.3} e={c} ei={glow} />
    </mesh>
    <mesh position={[0.11, 0.24, 0]} rotation={[0, 0, -0.6]}>
      <boxGeometry args={[0.1, 0.035, 0.02]} />
      <M c={c} r={0.3} e={c} ei={glow} />
    </mesh>
  </group>
);

/** Celular com uma textura na tela. */
export const Phone: React.FC<{ p?: V3; rot?: V3; s?: number; screen?: THREE.Texture }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, screen }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box s={[0.075, 0.15, 0.01]} c="#15161a" r={0.2} />
    <mesh position={[0, 0, 0.0055]}>
      <planeGeometry args={[0.068, 0.14]} />
      <meshBasicMaterial map={screen} color={screen ? "#ffffff" : "#223"} toneMapped={false} />
    </mesh>
  </group>
);

// ------------------------------------------------------------ objetos da "vida passando"
export const Backpack: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh scale={[1, 1.2, 0.6]} castShadow><sphereGeometry args={[0.3, 24, 18]} /><M c="#3d7be0" /></mesh>
    <mesh position={[0, -0.08, 0.17]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.2, 20, 14]} /><M c="#ff5a36" /></mesh>
    <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.08, 0.02, 8, 20, Math.PI]} /><M c="#28407a" /></mesh>
  </group>
);
export const GradCap: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh position={[0, -0.08, 0]} castShadow><cylinderGeometry args={[0.2, 0.22, 0.16, 28]} /><M c="#1d1f2b" /></mesh>
    <Box s={[0.6, 0.03, 0.6]} c="#1d1f2b" />
    <mesh position={[0.18, -0.1, 0.18]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><M c="#ffd23f" /></mesh>
    <mesh position={[0.18, -0.22, 0.18]}><coneGeometry args={[0.035, 0.08, 10]} /><M c="#ffd23f" /></mesh>
  </group>
);
export const Badge: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => {
  const tex = canvasTexture("badge", 256, 360, (ctx, w, h) => {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3d7be0"; ctx.fillRect(0, 0, w, 80);
    ctx.fillStyle = "#f4c49e"; ctx.beginPath(); ctx.arc(w / 2, 170, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5a3420"; ctx.beginPath(); ctx.arc(w / 2, 150, 62, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#2a1a10"; ctx.font = "44px 'Lilita One', sans-serif"; ctx.textAlign = "center"; ctx.fillText("CAIO", w / 2, 300);
  });
  return (
    <group position={p} rotation={rot} scale={s}>
      <mesh castShadow><boxGeometry args={[0.36, 0.5, 0.02]} /><meshStandardMaterial attach="material-0" color="#fff" /><meshStandardMaterial attach="material-1" color="#fff" /><meshStandardMaterial attach="material-2" color="#fff" /><meshStandardMaterial attach="material-3" color="#fff" /><meshStandardMaterial attach="material-4" map={tex} /><meshStandardMaterial attach="material-5" color="#fff" /></mesh>
      <mesh position={[0, 0.42, 0]}><torusGeometry args={[0.16, 0.012, 6, 30, Math.PI]} /><M c="#e8432f" /></mesh>
    </group>
  );
};
export const Bill: React.FC<{ p?: V3; rot?: V3; s?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => {
  const tex = canvasTexture("bill", 256, 360, (ctx, w, h) => {
    ctx.fillStyle = "#fffdf5"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2a1a10"; ctx.font = "40px 'Lilita One', sans-serif"; ctx.textAlign = "center"; ctx.fillText("BOLETO", w / 2, 60);
    ctx.fillStyle = "#c9c2b0"; for (let i = 0; i < 6; i++) ctx.fillRect(30, 95 + i * 28, w - 60 - rand(i) * 60, 10);
    ctx.fillStyle = "#e8432f"; ctx.font = "34px 'Lilita One', sans-serif"; ctx.fillText("VENCE HOJE", w / 2, 290);
    ctx.fillStyle = "#111"; for (let x = 24; x < w - 24; x += 4) if (rand(x) > 0.35) ctx.fillRect(x, 310, 2 + Math.floor(rand(x + 1) * 3), 40);
  });
  return (
    <group position={p} rotation={rot} scale={s}>
      <mesh castShadow><planeGeometry args={[0.4, 0.56]} /><meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} /></mesh>
    </group>
  );
};

/** Lágrima 3D: gota esticada e brilhante. */
export const Tear: React.FC<{ p?: V3; s?: number; stretch?: number }> = ({ p = [0, 0, 0], s = 1, stretch = 1.4 }) => (
  <group position={p} scale={s}>
    <mesh scale={[1, stretch, 0.8]}>
      <sphereGeometry args={[0.022, 14, 10]} />
      <meshStandardMaterial color="#bfe9ff" emissive="#7fd3ff" emissiveIntensity={0.5} roughness={0} metalness={0.1} transparent opacity={0.85} />
    </mesh>
  </group>
);
