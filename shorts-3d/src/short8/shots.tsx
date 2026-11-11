import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import data from "../data/aviao-timeline.json";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, FPS, kf, kf3, pop } from "../kit/anim";
import {
  Ashtray, ASHTRAY, BIN, Cigarette, Clipboard, Clouds, Lavatory, LIGHT_COLD, LIGHT_DIM, LIGHT_DUSK, LIGHT_FIRE, LIGHT_LAV, LIGHT_SKY, Plane, SneakyHand, Sparkles, TrashBin,
} from "./cena";

/**
 * Short "Por que o banheiro do avião tem cinzeiro?" — canal do Nico, estilo cel.
 * Cada plano começa um pouco antes da fala; reações caem 0–3 quadros antes da palavra.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode; overlay?: (f: number) => React.ReactNode };
type V3 = [number, number, number];

const LINES = data.lines as { cap: string; start: number; end: number; words: { text: string; start: number; end: number }[] }[];
export const WORDS = LINES.flatMap((l) => l.words);
export const TOTAL = data.total;
/** Quadro em que a palavra i começa. */
export const W = (i: number) => Math.round(WORDS[i].start * FPS);
/** Corte (s) um pouco antes da palavra i. */
const C = (i: number) => Math.max(0, WORDS[i].start - 0.08);

const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]]),
  target: kf3(f, [[s, a.target], [e, b.target]]),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]]),
  roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]]),
});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;

const nicoFace = (f: number, keys: [number, ToonExpr][], extra: Partial<ToonFace> = {}): ToonFace => {
  let expr = keys[0][1], blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (at > keys[0][0] && d >= -2 && d <= 2) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink: Math.max(blink, blinkAt(f, 3, 75)), eyes: "big", iris: "#e2a236", lid: -0.14, ...extra };
};
const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.09 + seed)) * 0.012,
  head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.035 + seed) * 0.1, Math.sin(f * 0.045 + seed) * 0.04],
  armL: [Math.sin(f * 0.07 + seed) * 0.05, 0, -0.14],
  armR: [-Math.sin(f * 0.07 + seed) * 0.05, 0, 0.14],
});

// ---------------------------------------------------------------- posições
const NICO: V3 = [-0.15, 0, 0.45];
const NICO_RY = 0.25;
const HEAD: V3 = add(NICO, [0, 1.64, 0]);

const Lav: React.FC<{ cam: Cam; light?: React.ReactNode; bg?: string; sign?: number; dark?: number; children?: React.ReactNode; ash?: { open?: number; glow?: number } }> = ({ cam, light = LIGHT_LAV, bg = "#d8d2c6", sign = 1, dark = 0, children, ash }) => (
  <Stage flat cam={cam} background={bg} lights={light} fg={
    <Cel>
      <Lavatory signLit={sign} dark={dark} />
      {ash && <Ashtray p={add(ASHTRAY, [-0.003, 0, 0])} open={ash.open} glow={ash.glow} />}
      {children}
    </Cel>
  } />
);

const Nico: React.FC<{ f: number; face: ToonFace; pose?: Pose; p?: V3; ry?: number; holdL?: React.ReactNode; holdR?: React.ReactNode }> = ({ f, face, pose, p = NICO, ry = NICO_RY, holdL, holdR }) => (
  <Toon kind="nico" position={p} rotationY={ry} face={face} pose={pose ?? idle(f)} holdL={holdL} holdR={holdR} />
);

/** Câmera olhando o cinzeiro na porta (de dentro do banheiro). */
const ashCam = (d: number, side: number, up: number, fov = 34, roll = 0): Cam => ({ pos: add(ASHTRAY, [-d, up, side]), target: add(ASHTRAY, [-0.05, 0.02, 0]), fov, roll });
const faceCam = (d: number, side: number, up: number, fov = 34, roll = 0): Cam => ({ pos: add(HEAD, [side, up, d]), target: add(HEAD, [0, -0.08, 0]), fov, roll });

/** Texto grande por cima (carimbo, data, interrogação). */
const Stamp: React.FC<{ f: number; at: number; text: string; color?: string; y?: number; rot?: number; size?: number; box?: boolean }> = ({ f, at, text, color = "#d62a1e", y = 0.3, rot = -8, size = 130, box = true }) => {
  const k = pop(f, at, 6);
  if (k <= 0) return null;
  const sc = interpolate(k, [0, 1], [2.2, 1]);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: `${y * 100}%`, pointerEvents: "none" }}>
      <div style={{
        fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: size, color: box ? color : "#fff", padding: box ? "6px 34px" : 0,
        border: box ? `14px solid ${color}` : "none", borderRadius: 26, background: box ? "rgba(255,250,240,0.92)" : "transparent",
        transform: `rotate(${rot}deg) scale(${sc})`, opacity: Math.min(1, k * 1.5),
        WebkitTextStroke: box ? "0" : `${size * 0.1}px #1b0f08`, paintOrder: "stroke fill", textShadow: box ? "none" : `0 ${size * 0.07}px 0 rgba(0,0,0,.5)`,
      }}>{text}</div>
    </AbsoluteFill>
  );
};

// ================================================================= PLANOS
export const SHOTS: Shot[] = [
  // "Se fumar no avião é proibido…"
  {
    name: "01a cinzeiro e placa", from: 0, to: C(6),
    render: (f, s, e) => {
      const flash = f >= W(5) - 2 ? (Math.floor((f - W(5) + 2) / 4) % 2 === 0 ? 1 : 0.3) : 1;
      return (
        <Lav sign={flash} cam={glide(f, s, e, { pos: add(ASHTRAY, [-1.0, 0.45, -0.55]), target: add(ASHTRAY, [0, 0.25, 0]), fov: 38 }, { pos: add(ASHTRAY, [-0.8, 0.3, -0.35]), target: add(ASHTRAY, [0, 0.2, 0]), fov: 35 })} />
      );
    },
  },
  // "…por que o banheiro tem um cinzeiro?"
  {
    name: "01b nico aponta", from: C(6), to: C(13),
    render: (f, s, e) => {
      const arm: V3 = [kf(f, [[W(11) - 6, 0], [W(11) - 2, -0.1]]), 0, kf(f, [[W(11) - 7, 0.14], [W(11) - 2, 1.45]])];
      return (
        <Lav ash={{ glow: kf(f, [[W(12) - 2, 0], [W(12) + 4, 1]]) }} cam={glide(f, s, e, { pos: [-0.4, 1.7, 2.1], target: [0.35, 1.35, 0.35], fov: 38 }, { pos: [-0.25, 1.65, 1.85], target: [0.4, 1.35, 0.35], fov: 37 })}>
          <Nico f={f} face={nicoFace(f, [[s, "neutral"], [W(8) - 2, "surprised"]], { look: [0.6, 0.1] })} pose={{ ...idle(f), armR: arm, head: [0.05, 0.4, 0.05] }} />
        </Lav>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(12) - 2} text="?" box={false} size={300} y={0.08} rot={10} />,
  },
  // "Não é esquecimento."
  {
    name: "02a nico nega", from: C(13), to: C(16),
    render: (f, s, e) => (
      <Lav cam={glide(f, s, e, faceCam(1.3, 0.25, 0.05, 34), faceCam(1.1, 0.1, 0.02, 33))}>
        <Nico f={f} face={nicoFace(f, [[s, "smug"]])} pose={{ ...idle(f), head: [0, Math.sin((f - s) * 0.45) * 0.35 * kf(f, [[s, 1], [e, 0.2]]), 0], armL: [-0.3, 0, -0.5], armR: [-0.3, 0, 0.5] }} />
      </Lav>
    ),
  },
  // "É obrigatório."
  {
    name: "02b carimbo obrigatorio", from: C(16), to: C(18),
    render: (f, s, e) => (
      <Lav ash={{ glow: 0.6 }} cam={glide(f, s, e, ashCam(1.0, -0.3, 0.15, 34), ashCam(0.85, -0.2, 0.1, 33, f >= W(17) ? 0.03 : 0))} />
    ),
    overlay: (f) => <Stamp f={f} at={W(17) - 2} text="OBRIGATÓRIO" size={104} y={0.22} />,
  },
  // "As regras de segurança da aviação exigem…"
  {
    name: "03a prancheta", from: C(18), to: C(26),
    render: (f, s, e) => {
      const arm: V3 = [-1.15, 0, -0.35];
      return (
        <Lav cam={glide(f, s, e, faceCam(1.6, -0.35, -0.2, 36), faceCam(1.35, -0.2, -0.25, 35))}>
          <Nico f={f} face={nicoFace(f, [[s, "neutral"], [W(24) - 2, "smile"]], { look: [-0.2, 0.7] })}
            pose={{ ...idle(f), armL: arm, head: [0.3, -0.1, 0] }}
            holdL={held(arm, <group scale={Math.max(0.001, pop(f, W(19) - 3, 7))}><Clipboard p={[0.05, 0.05, 0.14]} rot={[-0.35, 0.3, 0]} s={1.1} /></group>)} />
        </Lav>
      );
    },
  },
  // "…um cinzeiro na porta do banheiro."
  {
    name: "03b porta e cinzeiro", from: C(26), to: C(31),
    render: (f, s, e) => (
      <Lav ash={{ glow: kf(f, [[W(28) - 3, 0.3], [W(28) + 3, 1]]) }} cam={glide(f, s, e, { pos: add(ASHTRAY, [-1.3, 0.2, 0.5]), target: add(ASHTRAY, [0, -0.1, -0.1]), fov: 40 }, ashCam(0.85, 0.15, 0.1, 34))} />
    ),
  },
  // "O motivo?"
  {
    name: "04a o motivo", from: C(31), to: C(33),
    render: (f, s, e) => {
      const arm: V3 = [0, 0, kf(f, [[s, 0.14], [s + 6, 2.6]])];
      return (
        <Lav cam={glide(f, s, e, faceCam(1.25, 0.2, 0.05, 34), faceCam(1.05, 0.1, 0.05, 33))}>
          <Nico f={f} face={nicoFace(f, [[s, "smug"]])} pose={{ ...idle(f), armR: arm, head: [0, 0, -0.1] }} />
        </Lav>
      );
    },
  },
  // "Sempre tem alguém que fuma escondido."
  {
    name: "04b fumando escondido", from: C(33), to: C(39),
    render: (f, s, e) => {
      const hp: V3 = [0.15 + kf(f, [[s, -0.5], [s + 10, 0]]), 1.35 + Math.sin(f * 0.08) * 0.02, 0.6];
      const hide = f >= W(38) - 2 ? kf(f, [[W(38) - 2, 0], [W(38) + 6, 1]]) : 0;
      return (
        <Lav light={LIGHT_DIM} bg="#3a3442" dark={1} cam={glide(f, s, e, { pos: [0.75, 1.55, 1.5], target: [0.1, 1.35, 0.6], fov: 36 }, { pos: [0.6, 1.48, 1.3], target: [0.15, 1.38, 0.6], fov: 34 })}>
          <SneakyHand p={add(hp, [-hide * 0.25, 0, 0])} rot={[0, 0.2, 0.15]} frame={f}>
            <Cigarette frame={f} />
          </SneakyHand>
        </Lav>
      );
    },
  },
  // "E, sem cinzeiro, onde essa pessoa apaga o cigarro?"
  {
    name: "05a procurando onde apagar", from: C(39), to: C(45),
    render: (f, s, e) => {
      const hp: V3 = [-0.1 + Math.sin((f - s) * 0.12) * 0.25, 1.15, 0.2 + Math.cos((f - s) * 0.09) * 0.1];
      return (
        <Lav light={LIGHT_DIM} bg="#3a3442" dark={1} cam={glide(f, s, e, { pos: [0.4, 1.7, 1.9], target: [-0.2, 1.1, -0.2], fov: 40 }, { pos: [0.2, 1.6, 1.6], target: [-0.3, 1.0, -0.3], fov: 38 })}>
          <SneakyHand p={hp} rot={[0, 0.3, -0.2]} frame={f}><Cigarette frame={f} /></SneakyHand>
        </Lav>
      );
    },
  },
  {
    name: "05b nico preocupado", from: C(45), to: C(48),
    render: (f, s, e) => (
      <Lav cam={glide(f, s, e, faceCam(1.1, -0.2, 0.05, 33), faceCam(0.95, -0.1, 0.02, 32))}>
        <Nico f={f} face={nicoFace(f, [[s, "worried"]], { sweat: true })} pose={{ ...idle(f), armL: [-0.2, 0, -0.9], armR: [-0.2, 0, 0.9], head: [0, 0, 0.12] }} />
      </Lav>
    ),
  },
  // "No lixo do banheiro. Cheio de papel."
  {
    name: "06 cigarro cai no lixo", from: C(48), to: C(55),
    render: (f, s, e) => {
      const at = W(49) - 4;
      const y = kf(f, [[s, 1.3], [at, 1.3], [at + 8, 0.5]], (x) => x * x);
      return (
        <Stage flat background="#3a3442" lights={LIGHT_DIM} cam={glide(f, s, e, { pos: [0, 1.6, 1.3], target: [0, 0.35, 0], fov: 40 }, { pos: [0.15, 1.35, 1.0], target: [0, 0.3, 0], fov: 38, roll: 0.03 })}
          fg={<Cel><TrashBin frame={f} papers={kf(f, [[W(52) - 4, 0.45], [W(54), 1]])} />
            <Cigarette p={[0.05, y, 0.05]} rot={[0.3, 0.4, f > at + 8 ? 0.2 : (f - s) * 0.15]} s={2} frame={f} smoke={1} /></Cel>} />
      );
    },
  },
  // "Em 1973, um avião brasileiro, do Rio para Paris,"
  {
    name: "07a aviao 1973", from: C(55), to: C(63),
    render: (f, s, e) => (
      <Stage flat background="#e9a37a" lights={LIGHT_DUSK} cam={glide(f, s, e, { pos: [3.5, 0.9, 7.5], target: [0, 0, 0], fov: 38 }, { pos: [1.5, 0.6, 6.5], target: [0, 0.1, 0], fov: 38 })}
        fg={<Cel><Clouds frame={f} color="#f6d2c0" /><Plane frame={f} rot={[0, 0, Math.sin(f * 0.04) * 0.03]} p={[0, Math.sin(f * 0.05) * 0.05, 0]} /></Cel>} />
    ),
    overlay: (f) => <Stamp f={f} at={W(55) - 2} text="1973" box={false} size={230} y={0.12} rot={-4} />,
  },
  // "…pegou fogo bem no banheiro."
  {
    name: "07b fumaca na cauda", from: C(63), to: C(68),
    render: (f, s, e) => {
      const k = kf(f, [[W(63) - 2, 0.15], [W(64) + 8, 1]]);
      return (
        <Stage flat background="#c9806a" lights={LIGHT_DUSK} cam={glide(f, s, e, { pos: [-1.2, 0.6, 3.6], target: [-1.3, 0.1, 0], fov: 36 }, { pos: [-1.6, 0.5, 3.0], target: [-1.5, 0.15, 0], fov: 35, roll: -0.03 })}
          fg={<Cel><Clouds frame={f} color="#e7b9a6" /><Plane frame={f} smoke={k} fireWin={k} p={[0, Math.sin(f * 0.05) * 0.05, 0]} rot={[0, 0, Math.sin(f * 0.3) * 0.01]} /></Cel>} />
      );
    },
  },
  // "A suspeita mais forte: um cigarro jogado no lixo."
  {
    name: "08 fogo no lixo", from: C(68), to: C(77),
    render: (f, s, e) => {
      const fire = kf(f, [[W(73) - 4, 0], [W(76), 0.7], [e, 1]]);
      return (
        <Stage flat background="#2c1a16" lights={LIGHT_FIRE} cam={glide(f, s, e, { pos: [-0.3, 1.2, 1.4], target: [0, 0.3, 0], fov: 40 }, { pos: [0.1, 1.0, 1.1], target: [0, 0.35, 0], fov: 38 })}
          fg={<Cel><TrashBin frame={f} papers={1} fire={fire} /><Cigarette p={[0.05, 0.42, 0.05]} rot={[0.3, 0.4, 0.2]} s={2} frame={f} smoke={1} /></Cel>} />
      );
    },
  },
  // "Mais de cem pessoas morreram."
  {
    name: "09 nico triste", from: C(77), to: C(82),
    render: (f, s, e) => (
      <Lav light={LIGHT_COLD} bg="#1f2433" dark={1} cam={glide(f, s, e, faceCam(2.0, 0.1, 0.2, 34), faceCam(1.6, 0.05, 0.15, 33))}>
        <Nico f={f} face={nicoFace(f, [[s, "sad"]], { look: [0, 0.8] })} pose={{ ...idle(f), head: [0.35, 0, 0], armL: [0, 0, -0.08], armR: [0, 0, 0.08] }} />
      </Lav>
    ),
  },
  // "Por isso o cinzeiro continua lá."
  {
    name: "10 cinzeiro continua", from: C(82), to: C(88),
    render: (f, s, e) => (
      <Lav ash={{ glow: kf(f, [[W(85) - 3, 0], [W(85) + 4, 1]]) }} cam={glide(f, s, e, { pos: [-0.5, 1.6, 2.0], target: [0.5, 1.3, 0.35], fov: 38 }, { pos: [-0.2, 1.5, 1.7], target: [0.6, 1.3, 0.35], fov: 36 })}>
        <Nico f={f} face={nicoFace(f, [[s, "neutral"], [W(85), "smile"]], { look: [0.7, 0.1] })} pose={{ ...idle(f), head: [Math.max(0, Math.sin((f - W(86)) * 0.4)) * 0.2 * (f > W(86) ? 1 : 0), 0.45, 0] }} />
      </Lav>
    ),
  },
  // "Ninguém deveria usar…"
  {
    name: "11a dedo nao", from: C(88), to: C(95),
    render: (f, s, e) => {
      const arm: V3 = [-0.4, 0, 2.4 + Math.sin(f * 0.6) * 0.18];
      return (
        <Lav cam={glide(f, s, e, faceCam(1.4, 0.25, -0.05, 35), faceCam(1.2, 0.15, -0.05, 34))}>
          <Nico f={f} face={nicoFace(f, [[s, "smug"], [W(91), "smile"]])} pose={{ ...idle(f), armR: arm, head: [0, Math.sin(f * 0.3) * 0.12, 0] }} />
        </Lav>
      );
    },
  },
  // "…ele pode salvar o avião."
  {
    name: "11b aviao salvo", from: C(95), to: C(100),
    render: (f, s, e) => (
      <Stage flat background="#9fd3ff" lights={LIGHT_SKY} cam={glide(f, s, e, { pos: [2.5, 1.2, 7.0], target: [0, 0, 0], fov: 38 }, { pos: [0.5, 0.6, 6.0], target: [0, 0.1, 0], fov: 38 })}
        fg={<Cel><Clouds frame={f} /><Plane frame={f} p={[0, Math.sin(f * 0.05) * 0.06, 0]} rot={[0, 0, Math.sin(f * 0.04) * 0.04]} /><Sparkles frame={f} r={2.2} n={14} /></Cel>} />
    ),
  },
  // "Você já tinha reparado nesse cinzeiro? Comenta aí."
  {
    name: "12 pergunta final", from: C(100), to: TOTAL,
    render: (f, s, e) => {
      const wave: V3 = [-0.2, 0, 2.5 + Math.sin(f * 0.5) * 0.25];
      return (
        <Lav ash={{ glow: 0.5 }} cam={glide(f, s, e, faceCam(1.7, -0.3, -0.1, 36), faceCam(1.35, -0.15, -0.1, 34))}>
          <Nico f={f} face={nicoFace(f, [[s, "smile"], [W(106), "happy"]])} pose={{ ...idle(f), armR: f >= W(106) - 3 ? wave : [0, 0, 0.14], armL: [-0.3, 0, -0.3], head: [0, -0.1, 0] }} />
        </Lav>
      );
    },
  },
];
