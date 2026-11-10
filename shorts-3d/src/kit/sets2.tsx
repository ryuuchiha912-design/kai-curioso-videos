import React from "react";
import * as THREE from "three";
import { Box, Sign } from "./props";
import { canvasTexture } from "./textures";
import { rand } from "./anim";

/**
 * Cenários do short 2. Mesmo esquema do kit: `back` (paredes, vai pra camada desfocada) e `front` (chão e móveis).
 * Os dois cômodos têm a mesma planta: TV encostada na parede do fundo (z = -2.4), o personagem no tapete no meio,
 * olhando para -z. Assim os planos de hoje "espelham" os de 1998.
 */

const texCache = new Map<string, THREE.Texture>();
const rep = (t: THREE.Texture, rx: number, ry: number) => {
  const k = `${t.uuid}-${rx}-${ry}`;
  if (texCache.has(k)) return texCache.get(k)!;
  const c = t.clone();
  c.wrapS = c.wrapT = THREE.RepeatWrapping;
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  texCache.set(k, c);
  return c;
};

const vstripes = (a: string, b: string) =>
  canvasTexture(`vstripe-${a}-${b}`, 128, 128, (ctx, w, h) => {
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = b; ctx.fillRect(0, 0, w * 0.35, h); ctx.fillRect(w * 0.55, 0, w * 0.08, h);
  });
const boards = (base: string, line: string) =>
  canvasTexture(`boards-${base}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(60,30,10,${0.04 + rand(i + 3) * 0.08})`; ctx.fillRect(0, (i * h) / 8, w, h / 8 - 3);
      ctx.fillStyle = line; ctx.fillRect(0, ((i + 1) * h) / 8 - 3, w, 3); ctx.fillRect(rand(i * 5) * w, (i * h) / 8, 3, h / 8);
    }
  });
const plain = (a: string, b: string) =>
  canvasTexture(`plain-${a}-${b}`, 128, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });

/** Pôster genérico: um foguete. */
const rocketPoster = () =>
  canvasTexture("poster-rocket", 256, 340, (ctx, w, h) => {
    ctx.fillStyle = "#2b2a6b"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff"; for (let i = 0; i < 30; i++) ctx.fillRect(rand(i) * w, rand(i + 40) * h, 3, 3);
    ctx.fillStyle = "#ff5a36"; ctx.beginPath(); ctx.moveTo(w / 2, 40); ctx.quadraticCurveTo(w / 2 + 60, 140, w / 2 + 40, 230); ctx.lineTo(w / 2 - 40, 230); ctx.quadraticCurveTo(w / 2 - 60, 140, w / 2, 40); ctx.fill();
    ctx.fillStyle = "#9fdcff"; ctx.beginPath(); ctx.arc(w / 2, 130, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.moveTo(w / 2 - 30, 232); ctx.lineTo(w / 2, 300); ctx.lineTo(w / 2 + 30, 232); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
  });

const Wall: React.FC<{ p: [number, number, number]; ry?: number; w: number; h?: number; map: THREE.Texture }> = ({ p, ry = 0, w, h = 5, map }) => (
  <mesh position={p} rotation={[0, ry, 0]} receiveShadow>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={map} roughness={0.9} />
  </mesh>
);

// ------------------------------------------------------------------ QUARTO 1998
export const Room98 = {
  back: ({ year = "1998", calendarPop = 1 }: { year?: string; calendarPop?: number }) => {
    const wall = rep(vstripes("#ffcf8a", "#ffbf73"), 10, 1);
    return (
      <group>
        <Wall p={[0, 2.5, -2.5]} w={10} map={wall} />
        <Wall p={[-3.2, 2.5, 0.5]} ry={Math.PI / 2} w={8} map={wall} />
        <Wall p={[3.2, 2.5, 0.5]} ry={-Math.PI / 2} w={8} map={wall} />
        <Wall p={[0, 2.5, 3.6]} ry={Math.PI} w={10} map={wall} />
        {[[0, -2.47, 0], [-3.17, 0.5, Math.PI / 2], [3.17, 0.5, -Math.PI / 2], [0, 3.57, Math.PI]].map(([x, z, r], i) => (
          <Box key={i} s={[10, 0.14, 0.04]} p={[x, 0.07, z]} rot={[0, r, 0]} c="#fff4e0" />
        ))}
        {/* janela do pôr do sol na parede esquerda */}
        <group position={[-3.15, 2.0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
          <mesh><planeGeometry args={[1.5, 1.2]} /><meshBasicMaterial map={plain("#ffb36b", "#ff7a59")} toneMapped={false} /></mesh>
          <mesh position={[0.3, -0.25, 0.01]}><circleGeometry args={[0.18, 24]} /><meshBasicMaterial color="#fff1b8" toneMapped={false} /></mesh>
          <Box s={[1.6, 0.08, 0.08]} p={[0, 0.62, 0]} c="#fff4e0" />
          <Box s={[1.6, 0.08, 0.08]} p={[0, -0.62, 0]} c="#fff4e0" />
          <Box s={[0.08, 1.3, 0.08]} p={[0.76, 0, 0]} c="#fff4e0" />
          <Box s={[0.08, 1.3, 0.08]} p={[-0.76, 0, 0]} c="#fff4e0" />
          <Box s={[0.05, 1.2, 0.05]} c="#fff4e0" />
          <Box s={[0.35, 1.5, 0.06]} p={[-0.98, -0.05, 0.05]} c="#4cb6a8" />
          <Box s={[0.35, 1.5, 0.06]} p={[0.98, -0.05, 0.05]} c="#4cb6a8" />
        </group>
        {/* pôster de foguete e calendário no fundo */}
        <mesh position={[1.5, 2.3, -2.46]}><planeGeometry args={[0.8, 1.06]} /><meshStandardMaterial map={rocketPoster()} /></mesh>
        <group position={[-1.5, 2.1, -2.46]} scale={calendarPop}>
          <Box s={[0.7, 0.85, 0.03]} c="#ffffff" />
          <Box s={[0.7, 0.18, 0.035]} p={[0, 0.33, 0.005]} c="#e8432f" />
          <Sign text={year} p={[0, -0.08, 0.03]} w={0.6} h={0.42} bg="#ffffff" fg="#e8432f" border="#ffffff" />
        </group>
        {/* parede da frente (atrás do menino): cama e prateleira com bola e carrinho */}
        <group position={[1.6, 0, 3.0]}>
          <Box s={[1.4, 0.35, 1.9]} p={[0, 0.25, -0.3]} c="#c98a4b" />
          <Box s={[1.35, 0.18, 1.8]} p={[0, 0.5, -0.3]} c="#ffffff" />
          <Box s={[1.4, 0.12, 1.1]} p={[0, 0.62, -0.75]} c="#3b6bd6" />
        </group>
        <Box s={[1.2, 0.06, 0.25]} p={[-1.3, 1.5, 3.45]} c="#c98a4b" />
        <mesh position={[-1.6, 1.64, 3.42]}><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color="#ff5a36" /></mesh>
        <Box s={[0.25, 0.12, 0.14]} p={[-1.1, 1.59, 3.42]} c="#7cc95e" />
        <mesh position={[-0.6, 2.4, 3.56]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.7, 0.9]} /><meshStandardMaterial map={rocketPoster()} /></mesh>
      </group>
    );
  },
  front: () => (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial map={rep(boards("#d39a5e", "rgba(60,30,10,0.35)"), 3, 2.4)} roughness={0.8} />
      </mesh>
      {/* tapete redondo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.1]} receiveShadow>
        <circleGeometry args={[1.25, 48]} />
        <meshStandardMaterial color="#4cb6a8" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0.1]} receiveShadow>
        <ringGeometry args={[0.95, 1.05, 48]} />
        <meshStandardMaterial color="#ffcf5a" roughness={1} />
      </mesh>
      {/* rack da TV */}
      <group position={[0, 0, -1.55]}>
        <Box s={[1.5, 0.06, 0.62]} p={[0, 0.42, 0]} c="#9a6232" />
        <Box s={[1.5, 0.06, 0.62]} p={[0, 0.03, 0]} c="#9a6232" />
        <Box s={[0.06, 0.42, 0.62]} p={[-0.72, 0.21, 0]} c="#8a5428" />
        <Box s={[0.06, 0.42, 0.62]} p={[0.72, 0.21, 0]} c="#8a5428" />
        {/* fitas e cartuchos genéricos */}
        {[0, 1, 2, 3].map((i) => <Box key={i} s={[0.05, 0.22, 0.16]} p={[0.35 + i * 0.07, 0.17, 0.05]} c={["#e8432f", "#3d7be0", "#ffd23f", "#7cc95e"][i]} />)}
      </group>
    </group>
  ),
};

// ------------------------------------------------------------------ SALA HOJE
const cityWindow = () =>
  canvasTexture("city-night", 256, 200, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#14204a"); g.addColorStop(1, "#3a3f7a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const bx = i * 30 + rand(i) * 8, bh = 60 + rand(i + 4) * 90;
      ctx.fillStyle = "#1a1d3a"; ctx.fillRect(bx, h - bh, 26, bh);
      ctx.fillStyle = "#ffd77a";
      for (let y = h - bh + 8; y < h - 6; y += 14) for (let x = bx + 4; x < bx + 22; x += 8) if (rand(x * 3 + y) > 0.55) ctx.fillRect(x, y, 4, 6);
    }
  });

export const LivingRoom = {
  back: ({ warm = 0 }: { warm?: number }) => {
    const wall = rep(plain(warm > 0.5 ? "#e9c39a" : "#a9b7cf", warm > 0.5 ? "#d9a777" : "#8fa0bd"), 1, 1);
    return (
      <group>
        <Wall p={[0, 2.5, -2.5]} w={10} map={wall} />
        <Wall p={[-3.2, 2.5, 0.5]} ry={Math.PI / 2} w={8} map={wall} />
        <Wall p={[3.2, 2.5, 0.5]} ry={-Math.PI / 2} w={8} map={wall} />
        <Wall p={[0, 2.5, 3.6]} ry={Math.PI} w={10} map={wall} />
        {/* janelão com a cidade de noite */}
        <group position={[3.15, 2.0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh><planeGeometry args={[2.0, 1.5]} /><meshBasicMaterial map={cityWindow()} toneMapped={false} /></mesh>
          <Box s={[2.1, 0.06, 0.06]} p={[0, 0.76, 0]} c="#2a2d36" />
          <Box s={[2.1, 0.06, 0.06]} p={[0, -0.76, 0]} c="#2a2d36" />
          <Box s={[0.05, 1.5, 0.06]} c="#2a2d36" />
        </group>
        {/* quadros minimalistas */}
        <Box s={[0.9, 0.6, 0.03]} p={[-1.9, 2.3, -2.46]} c="#f2f3f5" />
        <Box s={[0.8, 0.5, 0.035]} p={[-1.9, 2.3, -2.45]} c="#e0855b" />
        {/* prateleira com plantinha e caixa de jogo genérica */}
        <Box s={[1.0, 0.05, 0.22]} p={[1.9, 1.9, -2.38]} c="#3a3d46" />
        <mesh position={[1.6, 2.05, -2.38]}><cylinderGeometry args={[0.08, 0.06, 0.16, 16]} /><meshStandardMaterial color="#f2f3f5" /></mesh>
        <mesh position={[1.6, 2.22, -2.38]}><sphereGeometry args={[0.13, 14, 10]} /><meshStandardMaterial color="#4d9a5a" /></mesh>
        {/* sofá encostado atrás (parede da frente) */}
        <group position={[0, 0, 2.6]}>
          <Box s={[2.6, 0.45, 0.95]} p={[0, 0.3, 0]} c="#4e5f8a" />
          <Box s={[2.6, 0.7, 0.25]} p={[0, 0.75, 0.4]} c="#46557c" />
          <Box s={[0.25, 0.6, 0.95]} p={[-1.3, 0.5, 0]} c="#46557c" />
          <Box s={[0.25, 0.6, 0.95]} p={[1.3, 0.5, 0]} c="#46557c" />
          <Box s={[0.5, 0.35, 0.15]} p={[-0.8, 0.7, 0.2]} rot={[-0.2, 0.2, 0]} c="#ffcf5a" />
        </group>
        {/* abajur de pé, a única luz quente */}
        <group position={[-2.4, 0, 2.6]}>
          <Box s={[0.04, 1.5, 0.04]} p={[0, 0.75, 0]} c="#2a2d36" />
          <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.18, 0.25, 0.3, 24, 1, true]} /><meshStandardMaterial color="#ffe2b0" emissive="#ffb85c" emissiveIntensity={1.1} side={THREE.DoubleSide} /></mesh>
        </group>
      </group>
    );
  },
  front: () => (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial map={rep(boards("#b9a48c", "rgba(40,30,20,0.25)"), 3, 2.4)} roughness={0.7} />
      </mesh>
      {/* tapete retangular cinza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.3]} receiveShadow>
        <planeGeometry args={[2.8, 2.0]} />
        <meshStandardMaterial color="#d8d9de" roughness={1} />
      </mesh>
      {/* rack baixo */}
      <Box s={[2.6, 0.38, 0.5]} p={[0, 0.19, -2.0]} c="#2a2d36" r={0.4} />
    </group>
  ),
};
