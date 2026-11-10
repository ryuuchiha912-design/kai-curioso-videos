import React from "react";
import * as THREE from "three";

/**
 * O "jogo de aventura" que aparece nas TVs. 100% original:
 * herói de capa ROXA e chapéu redondo mostarda, castelo de arenito com cúpulas laranja,
 * flauta de barro terracota, e a mágica é uma PONTE DE LUZ (não troca dia/noite).
 * retro = 1998 (desenhado em 96x72 e ampliado sem suavizar, com linhas de varredura);
 * novo  = hoje (liso, gradientes, brilho).
 */
export type GameState = {
  frame: number;
  retro: boolean;
  scene: "castle" | "abyss";
  flute?: number; // 0..1 levanta a flauta
  notes?: number; // 0..3 (fração = nota surgindo)
  bridge?: number; // 0..1 ponte de luz atravessando
  walk?: number; // deslocamento do herói (0..1)
};

const C = {
  skyTop: "#7fd6ff", skyBot: "#d9f4ff", hill: "#6cc49a", ground: "#56b37a", groundDark: "#3f8f5f",
  stone: "#e8c890", stoneDark: "#c9a46a", dome: "#ff8a3d", cape: "#8a4fd8", capeDark: "#6232a8",
  hat: "#e8b931", skin: "#f4c49e", boot: "#7a4a2a", flute: "#c8643c", void: "#2a1846", bridge: "#ffe68a", note: "#ffd23f",
};

function draw(ctx: CanvasRenderingContext2D, W: number, H: number, st: GameState) {
  const { frame, retro, scene } = st;
  const X = (v: number) => v * W, Y = (v: number) => v * H;
  const rect = (x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(X(x), Y(y), X(w), Y(h)); };
  const circ = (x: number, y: number, r: number, c: string) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(x), Y(y), X(r), 0, Math.PI * 2); ctx.fill(); };
  const ell = (x: number, y: number, rx: number, ry: number, c: string) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(X(x), Y(y), X(rx), Y(ry), 0, 0, Math.PI * 2); ctx.fill(); };
  const poly = (pts: [number, number][], c: string) => { ctx.fillStyle = c; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.fill(); };

  // céu
  if (retro) { rect(0, 0, 1, 0.3, C.skyTop); rect(0, 0.3, 1, 0.35, C.skyBot); }
  else {
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.65); g.addColorStop(0, "#5cc4ff"); g.addColorStop(1, "#ffe9c9");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // nuvens suaves
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 0.31 + frame * 0.0006) % 1.2) - 0.1;
      ctx.globalAlpha = 0.8; ell(cx, 0.12 + (i % 2) * 0.08, 0.08, 0.03, "#ffffff"); ell(cx + 0.05, 0.11 + (i % 2) * 0.08, 0.06, 0.035, "#ffffff"); ctx.globalAlpha = 1;
    }
  }
  // morros ao fundo
  if (retro) { poly([[0, 0.65], [0.15, 0.48], [0.32, 0.65]], C.hill); poly([[0.55, 0.65], [0.75, 0.5], [1, 0.65]], C.hill); }
  else { ell(0.18, 0.68, 0.3, 0.17, "#79cfa3"); ell(0.82, 0.7, 0.35, 0.2, "#6cc49a"); }

  const castle = (cx: number, base: number, k: number) => {
    // corpo de blocos + três torres com cúpulas
    rect(cx - 0.12 * k, base - 0.16 * k, 0.24 * k, 0.16 * k, C.stone);
    rect(cx - 0.17 * k, base - 0.26 * k, 0.07 * k, 0.26 * k, C.stoneDark);
    rect(cx + 0.1 * k, base - 0.26 * k, 0.07 * k, 0.26 * k, C.stoneDark);
    rect(cx - 0.045 * k, base - 0.34 * k, 0.09 * k, 0.34 * k, C.stone);
    for (const [tx, ty, r] of [[-0.135, -0.26, 0.04], [0.135, -0.26, 0.04], [0, -0.34, 0.055]] as const) {
      if (retro) rect(cx + (tx - r) * k, base + (ty - r) * k, 2 * r * k, r * k, C.dome);
      else { ctx.fillStyle = C.dome; ctx.beginPath(); ctx.arc(X(cx + tx * k), Y(base + ty * k), X(r * k), Math.PI, 0); ctx.fill(); }
    }
    rect(cx - 0.025 * k, base - 0.07 * k, 0.05 * k, 0.07 * k, "#7a4a2a"); // portão
  };

  if (scene === "castle") {
    rect(0, 0.65, 1, 0.35, retro ? C.ground : C.ground);
    if (!retro) { const g = ctx.createLinearGradient(0, H * 0.65, 0, H); g.addColorStop(0, "#5fc283"); g.addColorStop(1, "#3c8f5c"); ctx.fillStyle = g; ctx.fillRect(0, H * 0.65, W, H * 0.35); }
    // caminho até o castelo
    poly([[0.44, 1], [0.6, 1], [0.615, 0.66], [0.585, 0.66]], retro ? "#d8b878" : "#e3c68e");
    castle(0.6, 0.66, 1.0);
    hero(0.4 + (st.walk ?? 0) * 0.08, 0.86, 1.0, 0);
  } else {
    // dois platôs e um abismo no meio
    rect(0, 0.62, 1, 0.38, C.void);
    if (!retro) { const g = ctx.createLinearGradient(0, H * 0.62, 0, H); g.addColorStop(0, "#3a2470"); g.addColorStop(1, "#140a26"); ctx.fillStyle = g; ctx.fillRect(0, H * 0.62, W, H * 0.38); }
    poly([[0, 0.62], [0.47, 0.62], [0.44, 1], [0, 1]], C.ground);
    poly([[0.74, 0.62], [1, 0.62], [1, 1], [0.77, 1]], C.ground);
    if (!retro) { rect(0, 0.62, 0.47, 0.015, "#8be0a8"); rect(0.74, 0.62, 0.26, 0.015, "#8be0a8"); }
    castle(0.84, 0.62, 0.55);
    // ponte de luz
    const b = st.bridge ?? 0;
    if (b > 0) {
      const x0 = 0.46, x1 = 0.46 + 0.3 * b;
      if (retro) { rect(x0, 0.6, x1 - x0, 0.04, C.bridge); for (let x = x0; x < x1; x += 0.04) rect(x, 0.6, 0.02, 0.04, "#fff6c9"); }
      else {
        ctx.save(); ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = W * 0.04;
        const g = ctx.createLinearGradient(X(x0), 0, X(x1), 0); g.addColorStop(0, "#fff6c9"); g.addColorStop(1, "#ffb86b");
        ctx.fillStyle = g; ctx.fillRect(X(x0), Y(0.6), X(x1 - x0), Y(0.035)); ctx.restore();
        for (let i = 0; i < 12; i++) { const px = x0 + ((i * 0.083 + frame * 0.004) % 1) * (x1 - x0); circ(px, 0.585 - ((i * 0.37) % 0.06), 0.004, "#fff6c9"); }
      }
    }
    hero(0.38, 0.62, 0.9, st.flute ?? 0);
  }

  // notas que saem da flauta
  const n = st.notes ?? 0;
  for (let i = 0; i < 3; i++) {
    const a = Math.max(0, Math.min(1, n - i));
    if (a <= 0) continue;
    const nx = 0.42 + i * 0.07, ny = 0.38 - i * 0.05 + Math.sin(frame * 0.2 + i) * 0.01;
    const r = 0.022 * (0.4 + 0.6 * a);
    if (retro) { rect(nx - r, ny - r * 0.7, r * 2, r * 1.4, C.note); rect(nx + r * 0.6, ny - r * 4, r * 0.5, r * 4, C.note); }
    else {
      ctx.save(); ctx.shadowColor = C.note; ctx.shadowBlur = W * 0.02;
      ell(nx, ny, r * 1.2, r, C.note); rect(nx + r * 0.9, ny - r * 4, r * 0.4, r * 4, C.note); rect(nx + r * 0.9, ny - r * 4, r * 1.5, r * 0.6, C.note);
      ctx.restore();
    }
  }

  function hero(hx: number, feet: number, k: number, flute: number) {
    const bob = Math.sin(frame * 0.25) * 0.004;
    const u = 0.05 * k; // "unidade" do boneco
    // capa
    poly([[hx - u * 0.6, feet - u * 2.2 + bob], [hx + u * 0.6, feet - u * 2.2 + bob], [hx + u * 0.95, feet - u * 0.35], [hx - u * 0.95, feet - u * 0.35]], retro ? C.cape : C.cape);
    if (!retro) poly([[hx - u * 0.2, feet - u * 2.1 + bob], [hx + u * 0.2, feet - u * 2.1 + bob], [hx + u * 0.5, feet - u * 0.4], [hx - u * 0.1, feet - u * 0.4]], C.capeDark);
    // botas
    rect(hx - u * 0.55, feet - u * 0.4, u * 0.45, u * 0.4, C.boot); rect(hx + u * 0.1, feet - u * 0.4, u * 0.45, u * 0.4, C.boot);
    // cabeça com capuz pontudo de elfo (mostarda com barra roxa; a ponta cai pra trás e balança)
    const hy = feet - u * 2.75 + bob;
    const sway = Math.sin(frame * 0.18) * 0.25;
    const tip: [number, number] = [hx - u * (1.7 + sway * 0.3), hy - u * (0.2 + sway)];
    if (retro) {
      rect(hx - u * 0.65, hy - u * 0.75, u * 1.3, u * 1.25, C.hat); // capuz em volta
      rect(hx - u * 0.4, hy - u * 0.4, u * 0.85, u * 0.85, C.skin); // rosto
      rect(hx - u * 1.2, hy - u * 0.65, u * 0.6, u * 0.4, C.hat); rect(tip[0], tip[1], u * 0.5, u * 0.35, C.hat); // ponta em degraus
      rect(hx - u * 0.65, hy + u * 0.35, u * 1.3, u * 0.18, C.capeDark); // barra
      rect(hx + u * 0.1, hy - u * 0.1, u * 0.18, u * 0.18, "#2b1a12");
    } else {
      circ(hx, hy - u * 0.05, u * 0.72, C.hat);
      poly([[hx - u * 0.35, hy - u * 0.65], [tip[0], tip[1]], [hx - u * 0.7, hy + u * 0.1]], C.hat);
      circ(tip[0], tip[1], u * 0.12, C.capeDark); // pompom na ponta
      circ(hx + u * 0.08, hy + u * 0.03, u * 0.48, C.skin);
      ctx.fillStyle = C.capeDark; ctx.beginPath(); ctx.arc(X(hx), Y(hy - u * 0.05), X(u * 0.72), Math.PI * 0.15, Math.PI * 0.85); ctx.lineTo(X(hx), Y(hy + u * 0.4)); ctx.fill();
      circ(hx + u * 0.08, hy + u * 0.03, u * 0.48, C.skin);
      ell(hx + u * 0.26, hy + u * 0.02, u * 0.08, u * 0.1, "#2b1a12"); ell(hx - u * 0.07, hy + u * 0.02, u * 0.08, u * 0.1, "#2b1a12");
    }
    // flauta de barro (terracota) subindo até a boca
    if (flute > 0) {
      const fy = hy + u * (1.3 - flute * 1.0), fx = hx + u * 0.55;
      if (retro) rect(fx - u * 0.3, fy - u * 0.15, u * 0.6, u * 0.3, C.flute);
      else { ell(fx, fy, u * 0.32, u * 0.2, C.flute); circ(fx - u * 0.08, fy - u * 0.05, u * 0.04, "#7a3518"); circ(fx + u * 0.1, fy - u * 0.05, u * 0.04, "#7a3518"); }
    }
  }
}

/** Textura viva do jogo (redesenhada a cada frame, determinística). */
export const useGameTexture = (st: GameState) => {
  const pack = React.useMemo(() => {
    const big = document.createElement("canvas");
    const small = document.createElement("canvas");
    if (st.retro) { big.width = 384; big.height = 288; small.width = 96; small.height = 72; }
    else { big.width = 768; big.height = 432; }
    const tex = new THREE.CanvasTexture(big);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (st.retro) { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter; }
    return { big, small, tex };
  }, [st.retro]);
  const { big, small, tex } = pack;
  const bctx = big.getContext("2d")!;
  if (st.retro) {
    const sctx = small.getContext("2d")!;
    draw(sctx, small.width, small.height, st);
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(small, 0, 0, big.width, big.height);
    // linhas de varredura + leve brilho de tubo
    bctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let y = 0; y < big.height; y += 3) bctx.fillRect(0, y, big.width, 1);
    const g = bctx.createRadialGradient(big.width / 2, big.height / 2, big.height * 0.2, big.width / 2, big.height / 2, big.width * 0.62);
    g.addColorStop(0, "rgba(255,255,255,0.06)"); g.addColorStop(1, "rgba(0,0,0,0.45)");
    bctx.fillStyle = g; bctx.fillRect(0, 0, big.width, big.height);
  } else {
    draw(bctx, big.width, big.height, st);
  }
  tex.needsUpdate = true;
  return tex;
};
