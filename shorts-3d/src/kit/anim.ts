import { Easing, interpolate } from "remotion";

/** Regra de ouro: tudo é função do frame. Nada de relógio, nada de Math.random sem semente. */

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

const inOut = Easing.bezier(0.45, 0, 0.2, 1);

/** Interpola entre keyframes [frame, valor] com easing suave. */
export const kf = (frame: number, keys: [number, number][], easing = inOut): number => {
  if (keys.length === 1) return keys[0][1];
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (frame <= f1) {
      if (f1 === f0) return v1;
      return interpolate(frame, [f0, f1], [v0, v1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
  }
  return keys[keys.length - 1][1];
};

/** Mesma coisa para vetores [x,y,z]. */
export const kf3 = (frame: number, keys: [number, [number, number, number]][], easing = inOut): [number, number, number] =>
  [0, 1, 2].map((i) => kf(frame, keys.map(([f, v]) => [f, v[i]] as [number, number]), easing)) as [number, number, number];

/** Gesto "pop": 0 → 1 em ~5 frames, com leve overshoot (regra 5: gesto rápido). */
export const pop = (frame: number, at: number, dur = 6) =>
  interpolate(frame, [at, at + dur], [0, 1], { easing: Easing.out(Easing.back(1.8)), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Piscadas determinísticas: retorna 0..1 (1 = olho fechado). */
export const blinkAt = (frame: number, seed = 0, every = 70) => {
  const period = every + ((seed * 37) % 23);
  const t = (frame + seed * 13) % period;
  if (t < 2) return t / 2;
  if (t < 4) return 1 - (t - 2) / 2;
  return 0;
};

/** Pequeno pseudo-aleatório determinístico. */
export const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
