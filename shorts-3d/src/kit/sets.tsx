import React from "react";
import * as THREE from "three";
import { Box, Sign, Tank } from "./props";
import { canvasTexture } from "./textures";
import { rand } from "./anim";

/**
 * Regra 2 (cenário): nunca chão vazio. Cada cenário tem `back` (paredes e fundo, vai pra camada desfocada)
 * e `front` (chão e móveis, camada nítida).
 */

const checker = (a: string, b: string, n = 8) =>
  canvasTexture(`checker-${a}-${b}-${n}`, 256, 256, (ctx, w, h) => {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? a : b;
      ctx.fillRect((i * w) / n, (j * h) / n, w / n + 1, h / n + 1);
    }
  });

const planks = (base: string) =>
  canvasTexture(`planks-${base}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(80,40,10,${0.06 + rand(i) * 0.08})`;
      ctx.fillRect(0, (i * h) / 8, w, h / 8 - 3);
      ctx.fillStyle = "rgba(60,30,10,0.35)";
      ctx.fillRect(0, ((i + 1) * h) / 8 - 3, w, 3);
      ctx.fillRect(rand(i * 3) * w, (i * h) / 8, 3, h / 8);
    }
  });

const wallpaper = (a: string, b: string) =>
  canvasTexture(`wall-${a}-${b}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = b;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      ctx.beginPath(); ctx.arc(i * 43 + (j % 2) * 21 + 10, j * 43 + 10, 5, 0, Math.PI * 2); ctx.fill();
    }
  });

const texCache = new Map<string, THREE.Texture>();
const tex = (t: THREE.Texture, rx: number, ry: number) => {
  const k = `${t.uuid}-${rx}-${ry}`;
  if (texCache.has(k)) return texCache.get(k)!;
  const c = t.clone();
  texCache.set(k, c);
  c.wrapS = c.wrapT = THREE.RepeatWrapping;
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  return c;
};

// ------------------------------------------------------------------ QUARTO
export const Bedroom = {
  back: ({ night = false, calendarText = "", posterPop = 1 }: { night?: boolean; calendarText?: string; posterPop?: number }) => (
    <group>
      <mesh position={[0, 2.5, -2.5]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial map={tex(wallpaper("#8fd0c9", "#7cc1b9"), 6, 2.5)} roughness={0.9} />
      </mesh>
      <mesh position={[-3.5, 2.5, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial map={tex(wallpaper("#9fd8d1", "#86c7bf"), 4, 2.5)} roughness={0.9} />
      </mesh>
      {/* rodapé */}
      <Box s={[12, 0.15, 0.05]} p={[0, 0.075, -2.47]} c="#fff4e0" />
      {/* janela */}
      <group position={[-0.6, 2.0, -2.48]}>
        <mesh>
          <planeGeometry args={[1.5, 1.3]} />
          <meshBasicMaterial color={night ? "#1d2a5c" : "#9fdcff"} />
        </mesh>
        {night ? (
          <mesh position={[0.35, 0.3, 0.01]}>
            <circleGeometry args={[0.14, 24]} />
            <meshBasicMaterial color="#fff5c2" />
          </mesh>
        ) : (
          <mesh position={[-0.3, -0.35, 0.01]} scale={[1.6, 0.6, 1]}>
            <circleGeometry args={[0.2, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}
        <Box s={[1.62, 0.08, 0.08]} p={[0, 0.66, 0]} c="#fff4e0" />
        <Box s={[1.62, 0.08, 0.08]} p={[0, -0.66, 0]} c="#fff4e0" />
        <Box s={[0.08, 1.4, 0.08]} p={[0.78, 0, 0]} c="#fff4e0" />
        <Box s={[0.08, 1.4, 0.08]} p={[-0.78, 0, 0]} c="#fff4e0" />
        <Box s={[0.05, 1.3, 0.05]} p={[0, 0, 0]} c="#fff4e0" />
        {/* cortinas */}
        <Box s={[0.35, 1.6, 0.06]} p={[-0.98, -0.05, 0.05]} c="#ffb84d" />
        <Box s={[0.35, 1.6, 0.06]} p={[0.98, -0.05, 0.05]} c="#ffb84d" />
      </group>
      {/* calendário */}
      <group position={[-2.2, 2.0, -2.46]}>
        <Box s={[0.7, 0.85, 0.03]} p={[0, 0, 0]} c="#ffffff" />
        <Box s={[0.7, 0.18, 0.035]} p={[0, 0.33, 0.005]} c="#e8432f" />
        {calendarText && <Sign text={calendarText} p={[0, -0.08, 0.03]} w={0.6} h={0.45} bg="#ffffff" fg="#e8432f" border="#ffffff" />}
      </group>
      {/* pôster de peixe: o sonho dele */}
      <group position={[1.9, 2.3, -2.46]} scale={posterPop}>
        <mesh>
          <planeGeometry args={[0.9, 1.1]} />
          <meshStandardMaterial map={posterTex()} />
        </mesh>
      </group>
      {/* prateleira com brinquedos */}
      <Box s={[1.1, 0.06, 0.25]} p={[-2.2, 1.25, -2.38]} c="#c98a4b" />
      <Box s={[0.18, 0.22, 0.18]} p={[-2.5, 1.39, -2.38]} c="#7cc95e" />
      <mesh position={[-2.05, 1.38, -2.38]}><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color="#ff5a36" /></mesh>
      <Box s={[0.12, 0.3, 0.2]} p={[-1.8, 1.43, -2.38]} c="#4b7be0" />
    </group>
  ),
  front: ({ withBed = true, withDesk = true }: { withBed?: boolean; withDesk?: boolean }) => (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.75]} receiveShadow>
        <planeGeometry args={[12, 6.5]} />
        <meshStandardMaterial map={tex(planks("#d9a066"), 3, 2)} roughness={0.8} />
      </mesh>
      {/* tapete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.2]} receiveShadow>
        <circleGeometry args={[1.1, 48]} />
        <meshStandardMaterial color="#ffcf5a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0.2]} receiveShadow>
        <ringGeometry args={[0.8, 0.9, 48]} />
        <meshStandardMaterial color="#ff8a3d" roughness={1} />
      </mesh>
      {withBed && (
        <group position={[2.0, 0, -1.4]}>
          <Box s={[1.5, 0.35, 2.1]} p={[0, 0.25, 0]} c="#c98a4b" />
          <Box s={[1.45, 0.18, 2.0]} p={[0, 0.5, 0]} c="#ffffff" />
          <Box s={[1.5, 0.12, 1.3]} p={[0, 0.62, 0.38]} c="#ff7a59" />
          <Box s={[0.9, 0.2, 0.45]} p={[0, 0.66, -0.7]} c="#fffaf0" />
          <Box s={[1.5, 0.9, 0.12]} p={[0, 0.55, -1.05]} c="#b5763d" />
        </group>
      )}
      {withDesk && (
        <group position={[-2.0, 0, -1.3]}>
          <Box s={[1.4, 0.08, 0.8]} p={[0, 0.85, 0]} c="#e7b27a" />
          {[[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]].map(([x, z], i) => (
            <Box key={i} s={[0.07, 0.85, 0.07]} p={[x, 0.42, z]} c="#c98a4b" />
          ))}
          {/* abajur */}
          <mesh position={[0.5, 1.2, -0.15]} castShadow>
            <coneGeometry args={[0.18, 0.22, 24, 1, true]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffb400" emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <Box s={[0.03, 0.3, 0.03]} p={[0.5, 1.02, -0.15]} c="#555" />
        </group>
      )}
    </group>
  ),
};

const posterTex = () =>
  canvasTexture("poster-fish", 256, 320, (ctx, w, h) => {
    ctx.fillStyle = "#1f8fd6"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#4cc3ff";
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(rand(i) * w, rand(i + 9) * h, 6 + rand(i + 3) * 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#ff8a1f";
    ctx.beginPath(); ctx.ellipse(w * 0.48, h * 0.48, 70, 48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.48); ctx.lineTo(w * 0.05, h * 0.3); ctx.lineTo(w * 0.05, h * 0.66); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(w * 0.62, h * 0.43, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(w * 0.64, h * 0.43, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "44px 'Lilita One', sans-serif"; ctx.textAlign = "center"; ctx.fillText("PEIXES", w / 2, h * 0.9);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
  });

// ------------------------------------------------------------------ RUA
const HOUSE_COLORS = ["#ff9e7a", "#ffd166", "#8fd0c9", "#c3a6ff", "#9ed36a", "#ff7aa8"];

export const Street = {
  back: ({ frame = 0, sky = "#9fdcff", sun }: { frame?: number; sky?: string; sun?: string }) => (
    <group>
      {/* céu */}
      <mesh position={[0, 6, -14]}>
        <planeGeometry args={[120, 20]} />
        <meshBasicMaterial color={sky} />
      </mesh>
      {sun && (
        <mesh position={[-6, 4.2, -13.9]}>
          <circleGeometry args={[1.6, 40]} />
          <meshBasicMaterial color={sun} />
        </mesh>
      )}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = -40 + i * 4.6;
        if (Math.abs(x - 8.2) < 3) return null; // espaço do petshop
        const h = 2.4 + rand(i) * 1.6;
        const c = HOUSE_COLORS[i % HOUSE_COLORS.length];
        return (
          <group key={i} position={[x, 0, -3.2]}>
            <Box s={[4.2, h, 2]} p={[0, h / 2, -1]} c={c} />
            <mesh position={[0, h + 0.55, -1]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[3.2, 1.1, 4]} />
              <meshStandardMaterial color="#b5523b" roughness={0.8} />
            </mesh>
            <Box s={[0.8, 1.4, 0.08]} p={[-0.9, 0.7, 0.02]} c="#7a4a2a" />
            <Box s={[0.9, 0.7, 0.08]} p={[0.9, h * 0.62, 0.02]} c="#dff4ff" e="#fff3c4" ei={0.2} />
          </group>
        );
      })}
      {/* PETSHOP */}
      <group position={[8.2, 0, -3.2]}>
        <Box s={[5.2, 3.6, 2]} p={[0, 1.8, -1]} c="#2fb6c7" />
        <Box s={[5.4, 0.25, 2.1]} p={[0, 3.7, -1]} c="#1f8da0" />
        <Sign text="AQUA PETSHOP" p={[0, 3.1, 0.1]} w={3.6} h={0.75} bg="#ffd23f" fg="#1d3d8f" border="#1d3d8f" />
        {/* toldo listrado */}
        {Array.from({ length: 8 }).map((_, k) => (
          <Box key={k} s={[0.6, 0.08, 0.9]} p={[-2.1 + k * 0.6, 2.45, 0.35]} rot={[0.35, 0, 0]} c={k % 2 ? "#ffffff" : "#ff5a36"} />
        ))}
        <Tank p={[-1.4, 1.3, 0.05]} s={[1.6, 1.1, 0.1]} frame={frame} seed={3} fishes={4} />
        <Box s={[1.0, 2.0, 0.1]} p={[1.2, 1.0, 0.03]} c="#dff4ff" e="#bfeeff" ei={0.3} />
      </group>
    </group>
  ),
  front: ({ frame = 0 }: { frame?: number }) => (
    <group>
      {/* calçada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.6]} receiveShadow>
        <planeGeometry args={[100, 3.4]} />
        <meshStandardMaterial map={tex(checker("#e9d8c0", "#dccab0", 2), 50, 1.7)} roughness={0.9} />
      </mesh>
      <Box s={[100, 0.12, 0.25]} p={[0, 0.06, 0.15]} c="#cfc2ad" />
      {/* asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 4]} receiveShadow>
        <planeGeometry args={[100, 8]} />
        <meshStandardMaterial color="#5c5f6b" roughness={0.95} />
      </mesh>
      {Array.from({ length: 25 }).map((_, i) => (
        <Box key={i} s={[1.2, 0.01, 0.12]} p={[-48 + i * 4, -0.01, 3]} c="#fff6c8" shadow={false} />
      ))}
      {/* árvores e postes na beira */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = -30 + i * 7.3;
        return i % 2 ? (
          <group key={i} position={[x, 0, 0.0]}>
            <Box s={[0.18, 1.4, 0.18]} p={[0, 0.7, 0]} c="#8a5a3a" />
            <mesh position={[0, 1.8, 0]} castShadow>
              <sphereGeometry args={[0.7, 20, 16]} />
              <meshStandardMaterial color="#5cbf5a" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <group key={i} position={[x, 0, 0.0]}>
            <Box s={[0.08, 2.6, 0.08]} p={[0, 1.3, 0]} c="#3a3f4b" />
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.16, 16, 12]} />
              <meshStandardMaterial color="#fff6c8" emissive="#ffe08a" emissiveIntensity={0.6} />
            </mesh>
          </group>
        );
      })}
      {/* hidrante só pra dar vida */}
      <group position={[4.5, 0, -0.6]}>
        <Box s={[0.2, 0.45, 0.2]} p={[0, 0.22, 0]} c="#e8432f" />
        <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.11, 12, 10]} /><meshStandardMaterial color="#e8432f" /></mesh>
      </group>
      {frame < 0 && null}
    </group>
  ),
};

// ------------------------------------------------------------------ PETSHOP
export const PetShop = {
  back: ({ frame, glow = 1 }: { frame: number; glow?: number }) => (
    <group>
      <mesh position={[0, 2.5, -3.2]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#20365e" roughness={0.9} />
      </mesh>
      {/* parede de aquários */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 6 }).map((__, col) => (
          <Tank key={`${row}-${col}`} frame={frame} seed={row * 6 + col} p={[-3.4 + col * 1.36, 0.85 + row * 0.95, -2.9]} s={[1.24, 0.82, 0.4]}
            water={["#4cc3ff", "#3fe0d0", "#6aa8ff"][(row + col) % 3]} fishes={3} glow={0.9 * glow} />
        )),
      )}
      <Box s={[8.4, 0.1, 0.6]} p={[0.0, 0.4, -2.9]} c="#2c3346" />
      <Sign text="PEIXES" p={[0, 3.75, -2.85]} w={2.2} h={0.5} bg="#ffd23f" fg="#1d3d8f" border="#1d3d8f" />
      {/* plantas */}
      {[-4.4, 4.4].map((x) => (
        <group key={x} position={[x, 0, -2.6]}>
          <Box s={[0.5, 0.5, 0.5]} p={[0, 0.25, 0]} c="#e07a4a" />
          <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.55, 16, 12]} /><meshStandardMaterial color="#4fae5a" /></mesh>
        </group>
      ))}
    </group>
  ),
  front: ({ withCounter = true }: { withCounter?: boolean }) => (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} receiveShadow>
        <planeGeometry args={[14, 7.2]} />
        <meshStandardMaterial map={tex(checker("#f3efe6", "#9fd3e0", 2), 7, 3.6)} roughness={0.6} />
      </mesh>
      {withCounter && (
        <group position={[1.0, 0, 0.2]}>
          <Box s={[2.6, 0.95, 0.8]} p={[0, 0.475, 0]} c="#ffb84d" />
          <Box s={[2.75, 0.08, 0.95]} p={[0, 0.99, 0]} c="#fff4e0" />
          <Box s={[2.6, 0.2, 0.02]} p={[0, 0.7, 0.41]} c="#ff5a36" />
          {/* caixa registradora */}
          <group position={[-0.85, 1.03, -0.1]}>
            <Box s={[0.5, 0.25, 0.4]} p={[0, 0.12, 0]} c="#6b7a99" />
            <Box s={[0.4, 0.2, 0.05]} p={[0, 0.33, -0.12]} rot={[-0.3, 0, 0]} c="#2c3346" />
          </group>
        </group>
      )}
    </group>
  ),
};
