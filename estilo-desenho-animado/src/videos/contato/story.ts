// "E se você visse como as pessoas salvaram o seu número?" — short de ~72 s no estilo bonecos 2D num mundo 3D.
// Uma rua de bairro (world.ts): praça, casas, a casa do Theo com o caminhão de mudança, o ponto de ônibus e o parque.
// Os tempos vêm da narração (timeline.json, uma linha por fala). Cenas:
//   1 gancho: o Theo com a etiqueta "Biel 412"   2 a regra: etiquetas em todo mundo   3 a mãe / a menina
//   4 lembrança (golden): o videogame e a briga  5 o número sobe 413, 414            6 dívida? raiva? vingança?
//   7 a mudança no sábado                         8 o ponto de ônibus: escreve e apaga, 415
//   9 quantas vezes quase mandou                  10 o seu celular: 409                11 você manda
//   12 o celular dele vibra: "Player 2"           13 final (golden): os dois rindo no banco
import TL from "./timeline.json";

export const FPS = 30;
export const TOTAL = Math.ceil((TL.total + 0.4) * FPS);
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- narração ----------------
export const LINES = TL.lines;
/** início (s) da n-ésima palavra da fala i que casa com re */
export const W = (i: number, re: RegExp, n = 0) => {
  let c = 0;
  for (const w of LINES[i].words) if (re.test(w.text.toLowerCase())) { if (c === n) return w.start; c++; }
  return LINES[i].start;
};
const F = (s: number) => Math.round(s * FPS);
const CUT = (i: number) => (i === 0 ? 0 : F(LINES[i].start - 0.12));

export const T = {
  n412: W(0, /quatrocentos/), sobe: W(0, /sobe/),
  menina: W(2, /menina/), geo: W(2, /geografia/),
  briga: W(3, /briga/), videogame: W(3, /videogame/),
  n413: W(4, /treze/), n414: W(4, /catorze/),
  divida: W(5, /dívida/), raiva: W(5, /raiva/), vinganca: W(5, /vingança/),
  sabado: W(6, /sábado/),
  tela: W(7, /tela/), escreve: W(7, /escreve/), apaga: W(7, /apaga/), n415: W(7, /quatrocentos/),
  quase: W(8, /quase/),
  n409: W(9, /quatrocentos/),
  escreve2: W(10, /escreve/), manda: W(10, /manda/),
  vibra: W(11, /vibra/), muda: W(11, /muda/), player: W(11, /player/),
};

// ---------------- cenas ----------------
export type Light = "day" | "golden";
export type Crowd = "hook" | "tags" | "momcrush" | "memory" | "count" | "guess" | "moving" | "bus" | "ghosts" | "myphone" | "send" | "turn" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
const ORDER: [Light, Crowd][] = [
  ["day", "hook"], ["day", "tags"], ["day", "momcrush"], ["golden", "memory"], ["day", "count"], ["day", "guess"],
  ["day", "moving"], ["day", "bus"], ["day", "ghosts"], ["day", "myphone"], ["day", "send"], ["day", "turn"], ["golden", "end"],
];
export const SHOTS: ShotDef[] = ORDER.map(([light, crowd], i) => ({ id: i + 1, a: CUT(i), b: i + 1 < ORDER.length ? CUT(i + 1) : TOTAL, light, crowd }));
export const XFADE: Record<number, number> = { 4: 10, 5: 10, 13: 12 };
export const FLASH_AT = SHOTS[1].a;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- lugares (x, z) na rua ----------------
export const PLACE = {
  theoSquare: [1.6, 9.2] as const,
  mom: [-18, 11.2] as const,
  crush: [-7.2, 10.2] as const,
  bench: [38, 10.6] as const,
  truck: [23.5, 8.6] as const,
  busStop: [-36, 10.6] as const,
};

// ---------------- câmera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** toda espera avança devagar: zoom lento de lente (a câmera fica parada, então ninguém sai do quadro) */
const dolly = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, rest: Partial<Cam> = {}): Shot => {
  const k = Math.exp(-rate * Math.max(0, f - f0)), fov = rest.fov ?? 40;
  return { pos, look, ...rest, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k) };
};
const S = (id: number) => SHOTS[id - 1].a;
const [tx, tz] = PLACE.theoSquare, [mx, mz] = PLACE.mom, [cx, cz] = PLACE.crush, [bx, bz] = PLACE.bench, [kx, kz] = PLACE.truck, [ux, uz] = PLACE.busStop;

/** cenas de "celular na mão": o cast.ts põe o telefone a PHONE_D metros na frente da lente */
export const PHONE_D = 1.25;

const CAMS: Record<number, Key[]> = {
  // gancho: baixo, por cima do ombro do Biel, olhando o Theo e a etiqueta
  1: [
    { f: 0, s: (f) => dolly([-0.4, 1.3, 4.4], [tx, 1.85, tz], f, 0, 0.0016, { fov: 42, roll: 0.02 }) },
    { f: F(T.sobe) - 6, dur: 30, s: (f) => dolly([0.1, 1.4, 5.4], [tx, 2.05, tz], f, F(T.sobe), 0.0012, { fov: 40, roll: 0.03 }) },
  ],
  // a regra: praça aberta, etiquetas surgindo
  2: [{ f: S(2), s: (f) => dolly([0, 1.65, 2.6], [0, 1.75, 9], f, S(2), 0.0018, { fov: 50 }) }],
  // a mãe (corte) a menina
  3: [
    { f: S(3), s: (f) => dolly([mx + 1.2, 1.55, mz - 5.4], [mx, 1.75, mz], f, S(3), 0.0024, { fov: 40, roll: -0.02 }) },
    { f: F(T.menina) - 3, cut: true, s: (f) => dolly([cx - 2.6, 1.5, cz - 6.2], [cx - 0.6, 1.7, cz], f, F(T.menina), 0.0022, { fov: 42 }) },
  ],
  // lembrança: o banco do parque
  4: [{ f: S(4) - 6, s: (f) => dolly([bx + 0.4, 1.25, bz - 4.6], [bx, 1.05, bz], f, S(4), 0.0022, { fov: 40, roll: 0.02 }) }],
  // o número sobe: três lugares, três dias
  5: [
    { f: S(5) - 6, s: (f) => dolly([tx - 0.6, 1.6, tz - 3.6], [tx, 1.95, tz], f, S(5), 0.0025, { fov: 40 }) },
    { f: F(T.n413) - 3, cut: true, s: (f) => dolly([cx + 3.0, 1.55, cz - 3.4], [cx + 3.4, 1.95, cz], f, F(T.n413), 0.003, { fov: 40, roll: 0.03 }) },
    { f: F(T.n414) - 3, cut: true, s: (f) => dolly([12.6, 1.6, 6.0], [12, 1.95, 10], f, F(T.n414), 0.003, { fov: 40, roll: -0.03 }) },
  ],
  // dívida? raiva? vingança?
  6: [{ f: S(6), s: (f) => dolly([0.15, 1.65, 2.9], [0, 1.85, 6], f, S(6), 0.003, { fov: 46 }) }],
  // a mudança
  7: [{ f: S(7), s: (f) => dolly([kx - 6.4, 1.55, kz - 7.6], [kx - 3.0, 1.45, kz - 1.6], f, S(7), 0.0022, { fov: 44 }) }],
  // ponto de ônibus: aberto (corte) celular dele (corte) o número
  8: [
    { f: S(8), s: (f) => dolly([ux + 3.6, 1.6, uz - 6.6], [ux - 0.3, 1.25, uz], f, S(8), 0.002, { fov: 44 }) },
    { f: F(T.escreve) - 8, cut: true, s: (f) => dolly([ux - 0.6, 1.55, uz - 2.6], [ux - 0.6, 1.05, uz - 1.0], f, F(T.escreve), 0.001, { fov: 40 }) },
    { f: F(T.n415) - 4, cut: true, s: (f) => dolly([ux + 0.9, 1.5, uz - 3.9], [ux - 0.6, 1.75, uz], f, F(T.n415), 0.003, { fov: 40, roll: 0.03 }) },
  ],
  // quantas vezes quase mandou: as mensagens fantasmas
  9: [{ f: S(9), s: (f) => dolly([ux + 1.4, 1.45, uz - 4.6], [ux - 0.6, 1.5, uz], f, S(9), 0.0035, { fov: 46 }) }],
  // o seu celular / você manda
  10: [{ f: S(10), s: (f) => dolly([ux + 3.8, 1.62, uz - 3.4], [ux + 3.8, 1.2, uz - 2.2], f, S(10), 0.0012, { fov: 40 }) }],
  11: [{ f: S(11), s: (f) => dolly([ux + 3.8, 1.62, uz - 3.4], [ux + 3.8, 1.2, uz - 2.2], f, S(11), 0.0012, { fov: 40 }) }],
  // o celular dele vibra, ele vira: "Player 2"
  12: [
    { f: S(12), s: (f) => dolly([ux + 1.6, 1.4, uz - 4.4], [ux - 0.6, 1.4, uz], f, S(12), 0.0025, { fov: 42 }) },
    { f: F(T.muda) - 6, dur: 30, s: (f) => dolly([ux + 0.6, 1.5, uz - 3.4], [ux - 0.6, 1.9, uz], f, F(T.muda), 0.0025, { fov: 40, roll: 0.02 }) },
  ],
  // final: os dois no banco, abrindo devagar
  13: [{ f: S(13) - 6, s: (f) => dolly([ux + 1.0, 1.5, uz - 5.2], [ux - 0.4, 1.55, uz], f, S(13), -0.0025, { fov: 40, roll: 0.02 }) }],
};
/** tremidas de impacto */
const KICKS = [T.sobe, T.briga, T.sabado, T.manda + 0.2];
export const kickAt = (t: number) => {
  for (const k of KICKS) { const n = Math.round((t - k) * FPS); if (n >= 0 && n < 7) return (n % 2 ? -1 : 1) * (1 - n / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a * 2.5;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.006 };
};

// ---------------- desfoque por batida (cInf px a 1080; 0 = nítido) ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
/** ponto do celular na frente da lente (para o foco das cenas de tela) */
const phoneFocus = (id: number) => (f: number): V3 => { const c = camAt(id, f), d = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(d[0], d[1], d[2]); return [c.pos[0] + (d[0] / n) * PHONE_D, c.pos[1] + (d[1] / n) * PHONE_D, c.pos[2] + (d[2] / n) * PHONE_D]; };
export const DOF: Dof[] = [
  { f: 0, cInf: 12, focus: () => [tx, 1.7, tz] },
  { f: S(2), cInf: 6, focus: () => [0, 1.6, 8] },
  { f: S(3), cInf: 11, focus: () => [mx, 1.6, mz] },
  { f: F(T.menina) - 3, cInf: 11, focus: () => [cx, 1.6, cz] },
  { f: S(4), cInf: 9, focus: () => [bx, 1.0, bz] },
  { f: S(5), cInf: 12 },
  { f: S(6), cInf: 6, focus: () => [0, 1.7, 5.8] },
  { f: S(7), cInf: 8, focus: () => [kx - 4.5, 1.5, kz - 3.4] },
  { f: S(8), cInf: 7, focus: () => [ux - 0.6, 1.2, uz] },
  { f: F(T.escreve) - 8, cInf: 10, focus: phoneFocus(8) },
  { f: F(T.n415) - 4, cInf: 12, focus: () => [ux - 0.6, 1.6, uz] },
  { f: S(9), cInf: 4, focus: () => [ux - 0.3, 1.4, uz - 1.6] },
  { f: S(10), cInf: 10, focus: phoneFocus(10) },
  { f: S(11), cInf: 10, focus: phoneFocus(11) },
  { f: S(12), cInf: 10, focus: () => [ux - 0.6, 1.4, uz] },
  { f: S(13), cInf: 5, focus: () => [ux - 0.2, 1.3, uz] },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
