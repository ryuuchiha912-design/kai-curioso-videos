import React from "react";
import { Coin } from "../kit/props";
import { Cam, Stage } from "../kit/Stage";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, kf, kf3, pop, rand, sec } from "../kit/anim";
import { W, mouthFor } from "./timeline";
import { debtAt, short } from "./hud";
import {
  BG, Cartao, Clock, Cofre, GarageBack, GarageFront, GoldPile, LIGHTS, LIGHTS_DARK, Maleta, Moto, Nota, PastelTray,
  SchoolBack, SchoolFront, StreetBack, StreetFront,
} from "./world";

/**
 * Storyboard do short "E se o seu dinheiro dobrasse a cada hora?".
 * Cada plano: início/fim (s) literais e uma função do frame absoluto.
 * Regra 6: a câmera nunca para e corta ~1x por segundo. Regra 5: gesto termina 3–6 quadros antes da palavra.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };
type V3 = [number, number, number];

const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]]),
  target: kf3(f, [[s, a.target], [e, b.target]]),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]]),
  roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]]),
});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const T = (s: number) => sec(s);

/** Expressão por janelas; a troca acontece no meio de uma piscada forçada (regra 4). */
const exprAt = (f: number, keys: [number, ToonExpr][]) => {
  let expr = keys[0][1];
  let blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (d >= -2 && d <= 2 && at > keys[0][0]) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink };
};
const kai = (f: number, keys: [number, ToonExpr][], extra: Partial<ToonFace> = {}): ToonFace => {
  const ex = exprAt(f, keys);
  return { expr: ex.expr, blink: Math.max(ex.blink, blinkAt(f, 1, 66)), mouthOpen: mouthFor("kai", f), ...extra };
};
const bia = (f: number, keys: [number, ToonExpr][], extra: Partial<ToonFace> = {}): ToonFace => {
  const ex = exprAt(f, keys);
  return { expr: ex.expr, blink: Math.max(ex.blink, blinkAt(f, 4, 72)), mouthOpen: mouthFor("bia", f), ...extra };
};

// ---------------------------------------------------------------- poses
const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.09 + seed)) * 0.012,
  head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.035 + seed) * 0.1, Math.sin(f * 0.045 + seed) * 0.04],
  armL: [Math.sin(f * 0.07 + seed) * 0.05, 0, -0.14],
  armR: [-Math.sin(f * 0.07 + seed) * 0.05, 0, 0.14],
});
/** Mão direita oferecendo algo na frente do corpo. */
const offerR: V3 = [-1.15, 0, 0.25];
const offerL: V3 = [-1.15, 0, -0.25];
/** Item na mão, desfazendo a rotação do braço para ficar em pé. */
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;
/** Gesto que termina `lead` quadros antes da palavra. */
const gesture = (f: number, word: number, len = 6, lead = 4) => kf(f, [[word - lead - len, 0], [word - lead, 1]]);
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const wave = (f: number): V3 => [-0.2, 0, 2.5 + Math.sin(f * 0.6) * 0.25];
const walk = (f: number, k = 1): Pose => ({ legL: Math.sin(f * 0.5) * 0.45 * k, legR: -Math.sin(f * 0.5) * 0.45 * k, armL: [-Math.sin(f * 0.5) * 0.4 * k, 0, -0.12], armR: [Math.sin(f * 0.5) * 0.4 * k, 0, 0.12], bob: Math.abs(Math.cos(f * 0.5)) * 0.04 * k });

// ---------------------------------------------------------------- palcos
const KAI_ST: V3 = [2.0, 0, -1.3];
const BIA_ST: V3 = [3.15, 0, -1.3];
const Rua: React.FC<{ f: number; cam: Cam; children: React.ReactNode; dusk?: boolean }> = ({ f, cam, children, dusk }) => (
  <Stage cam={cam} background={dusk ? "#e9a07a" : BG} lights={dusk ? LIGHTS_DARK : LIGHTS} bg={<StreetBack f={f} />} fg={<><StreetFront f={f} />{children}</>} />
);
const Garagem: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <Stage cam={cam} background="#e8c79a" blur={5} lights={LIGHTS} bg={<GarageBack />} fg={<><GarageFront />{children}</>} />
);
const Escola: React.FC<{ cam: Cam; children: React.ReactNode; signPop?: number }> = ({ cam, children, signPop = 1 }) => (
  <Stage cam={cam} background={BG} lights={LIGHTS} blur={5} bg={<SchoolBack signPop={signPop} />} fg={<><SchoolFront />{children}</>} />
);

/** Câmera mirando a cabeça de alguém em `p`. */
const head = (p: V3, off: V3, fov = 34, look: V3 = [0, -0.12, 0]): Cam => {
  const o: V3 = [off[0] * 1.4, off[1] * 1.4 + 0.08, off[2] * 1.4];
  return { pos: add(add(p, [0, 1.64, 0]), o), target: add(add(p, [0, 1.64, 0]), add(look, [0, -0.08, 0])), fov };
};

/** Moedas que se duplicam: 1 → 2 → 4 → 8 → 16, uma geração a cada `step` quadros a partir de `at`. */
const Doubling: React.FC<{ f: number; at: number; c: V3; step?: number; gens?: number; r?: number }> = ({ f, at, c, step = 4, gens = 5, r = 0.9 }) => {
  const n = 2 ** Math.max(0, Math.min(gens - 1, Math.floor((f - at) / step) + 1));
  if (f < at) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const born = at + Math.floor(Math.log2(Math.max(1, i)) + (i ? 1 : 0)) * step - step;
        const a = i * 2.4 + f * 0.02, rr = (i ? 0.25 + Math.sqrt(i / 16) * r : 0);
        const y = Math.sin(f * 0.1 + i) * 0.06 + (rand(i + 2) - 0.5) * 0.6;
        const s = Math.max(0.001, pop(f, born, 5)) * 3.2;
        return <Coin key={i} p={add(c, [Math.cos(a) * rr, y, Math.sin(a) * rr * 0.5])} rot={[Math.PI / 2 - 0.2, f * 0.15 + i, 0]} s={s} />;
      })}
    </>
  );
};

/** Chuva de notas: `n` notas caindo a partir de `at`. */
const NoteRain: React.FC<{ f: number; at: number; n: number; c: V3; spread?: number; pile?: boolean }> = ({ f, at, n, c, spread = 1.2, pile = true }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const t0 = at + i * 1.5;
      const tt = (f - t0) / 30;
      if (tt < 0) return null;
      const floor = pile ? 0.02 + Math.floor(i / 6) * 0.03 : -0.5;
      const y = Math.max(floor, 2.6 - 4.9 * tt * tt);
      const landed = y <= floor + 0.001;
      const x = (rand(i + 3) - 0.5) * spread, z = (rand(i + 5) - 0.5) * spread * 0.6;
      const rot: V3 = landed ? [-Math.PI / 2, 0, rand(i) * 3] : [Math.sin(f * 0.3 + i) * 0.8 - 0.6, rand(i) * 3 + f * 0.05, Math.cos(f * 0.25 + i) * 0.6];
      return <Nota key={i} p={add(c, [x + (landed ? 0 : Math.sin(f * 0.2 + i) * 0.1), y, z])} rot={rot} s={1.4} />;
    })}
  </>
);

// ================================================================= PLANOS
export const SHOTS: Shot[] = [
  // ---------------- 1. "E se o seu dinheiro dobrasse a cada hora?"
  {
    name: "01a kai e a moeda", from: 0, to: 1.2,
    render: (f, s, e) => {
      const arm: V3 = [-1.25, 0, 0.32];
      return (
        <Rua f={f} cam={glide(f, s, e, head(KAI_ST, [0.55, -0.05, 1.5], 34, [0.1, -0.2, 0]), head(KAI_ST, [0.15, -0.1, 1.15], 33, [0.08, -0.2, 0]))}>
          <Toon kind="kai" position={KAI_ST} pose={{ ...idle(f), armR: arm, head: [0.18, 0.1, 0] }} face={kai(f, [[s, "surprised"]], { look: [0.3, 0.7] })}
            holdR={held(arm, <Coin p={[0, 0.16 + Math.sin(f * 0.25) * 0.03, 0.05]} rot={[Math.PI / 2, f * 0.35, 0]} s={2.2} />)} />
        </Rua>
      );
    },
  },
  {
    name: "01b moedas se dobram", from: 1.2, to: 2.5,
    render: (f, s, e) => {
      const at = W(1, 5);
      const arm: V3 = [-1.25, 0, 0.32];
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: add(KAI_ST, [-0.9, 0.55, 2.0]), target: add(KAI_ST, [0.1, 1.35, 0]), fov: 38 }, { pos: add(KAI_ST, [0.5, 0.35, 2.4]), target: add(KAI_ST, [0.1, 1.45, 0]), fov: 38 })}>
          <Toon kind="kai" position={KAI_ST} pose={{ ...idle(f), armR: arm, bob: f > at ? Math.max(0, Math.sin((f - at) * 0.4)) * 0.05 : 0 }}
            face={kai(f, [[s, "surprised"], [at + 6, "happy"]], { look: [0.2, 0.3] })}
            holdR={held(arm, <Coin p={[0, 0.16, 0.05]} rot={[Math.PI / 2, f * 0.35, 0]} s={3} />)} />
          <Doubling f={f} at={at} c={add(KAI_ST, [0.1, 2.55, -0.6])} step={5} gens={6} r={1.5} />
        </Rua>
      );
    },
  },
  // ---------------- 2. "Eu só tenho um real."
  {
    name: "02 so um real", from: 2.5, to: 3.7,
    render: (f, s, e) => {
      const at = W(2, 3);
      const up = gesture(f, at, 6, 3);
      const arm = lerp3([0, 0, 0.14], offerR, up);
      return (
        <Rua f={f} cam={glide(f, s, e, head(KAI_ST, [-0.35, 0.0, 1.6], 34, [0.05, -0.25, 0]), head(KAI_ST, [-0.1, -0.05, 1.3], 33, [0.05, -0.25, 0]))}>
          <Toon kind="kai" position={KAI_ST} rotationY={-0.12} pose={{ ...idle(f), armR: arm }} face={kai(f, [[s, "smile"], [at - 2, "sad"]], { look: [0.4, 0.5] })}
            holdR={held(arm, <Coin p={[0, 0.12, 0.06]} rot={[Math.PI / 2 - 0.3, f * 0.1, 0]} s={3 * Math.max(0.001, pop(f, at - 2, 6))} />)} />
        </Rua>
      );
    },
  },
  // ---------------- 3. "Hora dez: mil e vinte e quatro reais."
  {
    name: "03a chuva de notas", from: 3.7, to: 4.9,
    render: (f, s, e) => {
      const at = W(3, 1);
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: add(KAI_ST, [0.3, 4.2, 2.2]), target: add(KAI_ST, [0, 0.6, 0.2]), fov: 40 }, { pos: add(KAI_ST, [0.1, 3.6, 1.6]), target: add(KAI_ST, [0, 0.7, 0.2]), fov: 40 })}>
          <Toon kind="kai" position={KAI_ST} pose={{ ...idle(f), armL: [-0.3, 0, -1.9], armR: [-0.3, 0, 1.9], head: [-0.5, 0, 0] }}
            face={kai(f, [[s, "sad"], [at - 2, "surprised"]], { look: [0, -1] })} />
          <NoteRain f={f} at={at - 6} n={24} c={add(KAI_ST, [0, 0, 0.5])} spread={1.8} />
        </Rua>
      );
    },
  },
  {
    name: "03b pilha de notas", from: 4.9, to: 6.2,
    render: (f, s, e) => {
      const at = W(3, 1);
      const arm: V3 = [-0.6, 0, 1.2];
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: add(KAI_ST, [2.6, 0.9, 1.6]), target: add(KAI_ST, [0, 1.1, 0.2]), fov: 36 }, { pos: add(KAI_ST, [2.0, 1.1, 2.3]), target: add(KAI_ST, [0, 1.2, 0.2]), fov: 36 })}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.35} pose={{ ...idle(f), armR: arm, armL: [-0.6, 0, -1.2], bob: Math.abs(Math.sin(f * 0.35)) * 0.06 }}
            face={kai(f, [[s, "happy"]], { blush: true })} />
          <NoteRain f={f} at={at - 6} n={24} c={add(KAI_ST, [0, 0, 0.5])} spread={1.8} />
          <NoteRain f={f} at={T(5.0)} n={8} c={add(KAI_ST, [0.3, 0, 0.6])} spread={1.4} />
        </Rua>
      );
    },
  },
  // ---------------- 4. "Bia! Pastel pra escola inteira!"
  {
    name: "04a chama a bia", from: 6.2, to: 7.4,
    render: (f, s, e) => {
      const at = W(4, 0);
      const up = gesture(f, at, 5, 3);
      const turn = kf(f, [[at + 2, 0], [at + 12, 1]]);
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: [2.6, 1.3, 2.7], target: [2.6, 1.2, -1.3], fov: 36 }, { pos: [2.4, 1.25, 2.3], target: [2.55, 1.25, -1.3], fov: 35 })}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.6} pose={{ ...idle(f), armR: lerp3([0, 0, 0.14], wave(f), up) }} face={kai(f, [[s, "happy"]])} />
          <Toon kind="bia" position={BIA_ST} rotationY={-0.2 - 0.6 * turn} pose={{ ...idle(f, 2), head: [0, -0.3 * turn, 0] }} face={bia(f, [[s, "neutral"], [at + 6, "surprised"]], { look: [-0.6 * turn, 0] })} />
        </Rua>
      );
    },
  },
  {
    name: "04b bandeja de pastel", from: 7.4, to: 9.0,
    render: (f, s, e) => {
      const at = W(4, 1);
      const up = gesture(f, at, 5, 3);
      const aR = lerp3([0, 0, 0.14], [-1.3, 0, -0.15], up), aL = lerp3([0, 0, -0.14], [-1.3, 0, 0.15], up);
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: add(KAI_ST, [1.0, 1.75, 2.4]), target: add(KAI_ST, [0.4, 1.2, 0]), fov: 38 }, { pos: add(KAI_ST, [0.4, 1.6, 2.7]), target: add(KAI_ST, [0.4, 1.2, 0]), fov: 38 })}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.25} pose={{ ...idle(f), armR: aR, armL: aL }} face={kai(f, [[s, "happy"]], { blush: true })} />
          <PastelTray p={add(KAI_ST, [0.05, 1.12, 0.48])} s={1.6 * Math.max(0.001, pop(f, at - 2, 7))} />
          {[1, 2].map((k) => <PastelTray key={k} p={add(KAI_ST, [k * 0.55 - 0.85, 0.4 + k * 0.05, 0.9])} s={1.3 * Math.max(0.001, pop(f, W(4, 4) - 2 + k * 3, 7))} n={6} />)}
          <Toon kind="bia" position={BIA_ST} rotationY={-0.9} pose={idle(f, 2)} face={bia(f, [[s, "surprised"], [W(4, 3), "smile"]])} />
        </Rua>
      );
    },
  },
  // ---------------- 5. "Hora vinte: mais de um milhão."
  {
    name: "05a maleta abre", from: 9.0, to: 10.0,
    render: (f, s, e) => {
      const at = W(5, 1);
      const open = kf(f, [[at - 6, 0], [at, 1]]);
      const m: V3 = add(KAI_ST, [0.1, 0.0, 0.6]);
      return (
        <Rua f={f} cam={glide(f, s, e, { pos: add(m, [1.3, 1.9, 2.2]), target: add(m, [0, 0.6, -0.3]), fov: 36 }, { pos: add(m, [0.7, 1.6, 1.9]), target: add(m, [0, 0.6, -0.3]), fov: 36 })}>
          <Maleta p={m} s={1.4} open={open} />
          {f > at && <NoteRain f={f} at={at} n={10} c={add(m, [0, 0.0, 0])} spread={0.9} pile={false} />}
          <Toon kind="kai" position={KAI_ST} pose={idle(f)} face={kai(f, [[s, "surprised"]])} />
        </Rua>
      );
    },
  },
  {
    name: "05b kai rico de oculos", from: 10.0, to: 11.05,
    render: (f, s, e) => {
      const arm: V3 = [-0.35, 0, 0.5];
      return (
        <Rua f={f} cam={glide(f, s, e, head(KAI_ST, [-0.8, 0.2, 1.8], 34, [0.1, -0.35, 0]), head(KAI_ST, [-0.2, 0.0, 1.9], 34, [0.1, -0.35, 0]))}>
          <Toon kind="kai" position={KAI_ST} rotationY={-0.15} pose={{ ...idle(f), armR: arm, armL: [0, 0, -0.5], head: [-0.15, 0, 0.08] }} face={kai(f, [[s, "smug"]])}
            holdR={held(arm, <Maleta p={[-0.05, -0.24, 0.02]} rot={[0, Math.PI / 2, 0]} s={0.7} />)} />
          <NoteRain f={f} at={s - 20} n={14} c={add(KAI_ST, [0, 0, 0.3])} spread={2.4} pile={false} />
        </Rua>
      );
    },
  },
  // ---------------- 6. "Kai... por que tem três motos na sua garagem?"
  {
    name: "06a bia desconfiada", from: 11.05, to: 12.2,
    render: (f, s, e) => (
      <Garagem cam={glide(f, s, e, head([0.6, 0, 0.4], [0.5, 0.0, 1.5], 34, [-0.05, -0.2, 0]), head([0.6, 0, 0.4], [0.2, -0.05, 1.3], 33, [-0.05, -0.2, 0]))}>
        <Toon kind="bia" position={[0.6, 0, 0.4]} rotationY={-0.25} pose={{ ...idle(f, 2), armL: [-0.2, 0, -0.5], armR: [-0.2, 0, 0.5], head: [0.06, 0, -0.1] }}
          face={bia(f, [[s, "worried"]], { look: [-0.6, 0] })} />
      </Garagem>
    ),
  },
  {
    name: "06b tres motos", from: 12.2, to: 13.8,
    render: (f, s, e) => {
      const at = W(6, 4);
      const C = ["#e04b3c", "#2f8fd8", "#f2b62c"];
      return (
        <Garagem cam={glide(f, s, e, { pos: [0.4, 2.2, 5.0], target: [0, 0.8, -0.8], fov: 40 }, { pos: [-0.6, 1.8, 4.4], target: [0, 0.8, -0.8], fov: 40 })}>
          {C.map((c, i) => (
            <Moto key={i} p={[-1.6 + i * 1.6, 0, -1.6 + Math.abs(i - 1) * 0.2]} rot={[0, 0.5, 0]} s={1.8 * Math.max(0.001, pop(f, at - 2 + i * 3, 7))} c={c} />
          ))}
          <Toon kind="bia" position={[1.9, 0, 0.6]} rotationY={-0.5} pose={{ ...idle(f, 2), armL: [-0.2, 0, -0.5], armR: [-0.2, 0, 0.5] }} face={bia(f, [[s, "worried"], [at + 4, "surprised"]], { look: [-1, 0] })} />
          <Toon kind="kai" position={[-1.9, 0, 0.6]} rotationY={0.5} pose={idle(f)} face={kai(f, [[s, "smug"]])} />
        </Garagem>
      );
    },
  },
  // ---------------- 7. "Uma pra cada dia que eu lembro de usar."
  {
    name: "07a kai explica", from: 13.8, to: 14.8,
    render: (f, s, e) => {
      const at = W(7, 2);
      const arm = lerp3([0, 0, 0.14], [-0.4, 0, 1.3], gesture(f, at, 5, 3));
      return (
        <Garagem cam={glide(f, s, e, head([-0.4, 0, 0.4], [-0.5, 0.05, 1.6], 34, [0.15, -0.25, 0]), head([-0.4, 0, 0.4], [-0.2, 0.0, 1.4], 33, [0.15, -0.25, 0]))}>
          <Toon kind="kai" position={[-0.4, 0, 0.4]} rotationY={0.3} pose={{ ...idle(f), armR: arm }} face={kai(f, [[s, "smug"]])} />
          <Moto p={[0.9, 0, -1.4]} rot={[0, 0.5, 0]} s={1.8} c="#2f8fd8" />
        </Garagem>
      );
    },
  },
  {
    name: "07b bia mao na testa", from: 14.8, to: 15.9,
    render: (f, s, e) => {
      const at = W(7, 6);
      const arm = lerp3([0, 0, 0.14], [-2.3, 0, 0.55], gesture(f, at, 6, 3));
      return (
        <Garagem cam={glide(f, s, e, { pos: [0.9, 1.5, 3.2], target: [0.2, 1.3, 0.4], fov: 36 }, { pos: [0.5, 1.45, 2.8], target: [0.3, 1.35, 0.4], fov: 35 })}>
          <Toon kind="bia" position={[0.9, 0, 0.4]} rotationY={-0.5} pose={{ ...idle(f, 2), armR: arm, head: [0.15, 0, 0] }} face={bia(f, [[s, "worried"], [at, "sad"]])} />
          <Toon kind="kai" position={[-0.5, 0, 0.4]} rotationY={0.5} pose={{ ...idle(f), armR: [-0.4, 0, 1.3] }} face={kai(f, [[s, "smug"]])} />
        </Garagem>
      );
    },
  },
  // ---------------- 8. "Hora trinta: mais de um bilhão."
  {
    name: "08a cofre gigante", from: 15.9, to: 16.9,
    render: (f, s, e) => {
      const at = W(8, 1);
      return (
        <Garagem cam={glide(f, s, e, { pos: [0.4, 0.25, 3.4], target: [0, 1.6, -1.2], fov: 42 }, { pos: [-0.3, 0.2, 2.9], target: [0, 1.7, -1.2], fov: 42 })}>
          <Cofre p={[0, 0, -1.4]} s={1.5 * Math.max(0.001, pop(f, at - 2, 8))} spin={kf(f, [[at, 0], [e, 3]])} />
          <Toon kind="kai" position={[-0.8, 0, 0.5]} rotationY={0.4} pose={{ ...idle(f), head: [-0.35, 0.3, 0] }} face={kai(f, [[s, "smug"], [at + 2, "surprised"]], { look: [0.4, -0.8] })} />
        </Garagem>
      );
    },
  },
  {
    name: "08b cofre abre", from: 16.9, to: 17.8,
    render: (f, s, e) => {
      const arm: V3 = [-0.2, 0, 2.6 + Math.sin(f * 0.5) * 0.2];
      return (
        <Garagem cam={glide(f, s, e, { pos: [-2.4, 1.4, 2.4], target: [-0.6, 1.2, -0.6], fov: 38 }, { pos: [-1.8, 1.3, 2.9], target: [-0.6, 1.2, -0.6], fov: 38 })}>
          <Cofre p={[0, 0, -1.4]} s={1.5} spin={3 + (f - s) * 0.1} />
          <Doubling f={f} at={s - 20} c={[0, 2.2, -0.4]} gens={6} r={1.6} />
          <Toon kind="kai" position={[-1.2, 0, 0.2]} rotationY={0.4} pose={{ ...idle(f), armR: arm, bob: Math.abs(Math.sin(f * 0.3)) * 0.08 }} face={kai(f, [[s, "happy"]], { blush: true })} />
        </Garagem>
      );
    },
  },
  // ---------------- 9. "Comprei a escola. Agora o recreio dura duas horas."
  {
    name: "09a comprei a escola", from: 17.8, to: 18.9,
    render: (f, s, e) => {
      const at = W(9, 2);
      return (
        <Escola signPop={Math.max(0.001, pop(f, at - 2, 8))} cam={glide(f, s, e, { pos: [0, 0.6, 6.5], target: [0, 2.6, -2.5], fov: 44 }, { pos: [0, 0.9, 5.4], target: [0, 2.8, -2.5], fov: 44 })}>
          <Toon kind="kai" position={[0.8, 0, 0.6]} rotationY={-0.2} pose={{ ...idle(f), armL: lerp3([0, 0, -0.14], [-0.2, 0, -2.5], gesture(f, at, 6, 3)) }} face={kai(f, [[s, "smug"]])} />
        </Escola>
      );
    },
  },
  {
    name: "09b recreio", from: 18.9, to: 20.0,
    render: (f, s, e) => (
      <Escola cam={glide(f, s, e, { pos: [2.4, 1.4, 3.4], target: [0.4, 1.1, 0], fov: 38 }, { pos: [1.4, 1.3, 3.8], target: [0.4, 1.1, 0], fov: 38 })}>
        <Toon kind="kai" position={[0.2, 0, 0.3]} rotationY={0.2} pose={{ ...idle(f), armR: wave(f), armL: [0, 0, -0.9 - Math.sin(f * 0.6) * 0.2], bob: Math.abs(Math.sin(f * 0.3)) * 0.1 }} face={kai(f, [[s, "happy"]])} />
        <Toon kind="bia" position={[1.5, 0, -0.2]} rotationY={-0.4} pose={idle(f, 2)} face={bia(f, [[s, "surprised"]], { look: [-0.7, 0] })} />
      </Escola>
    ),
  },
  {
    name: "09c dois relogios", from: 20.0, to: 21.55,
    render: (f, s, e) => {
      const at = W(9, 7);
      return (
        <Escola cam={glide(f, s, e, { pos: [0, 1.2, 3.4], target: [0, 1.5, 0], fov: 38 }, { pos: [0, 2.2, 3.6], target: [0, 1.7, 0], fov: 38 })}>
          {[-1, 1].map((k, i) => <Clock key={k} p={[k * 0.75, 2.45, 0.3]} s={1.4 * Math.max(0.001, pop(f, at - 2 + i * 4, 7))} frame={f} speed={0.25} />)}
          <Toon kind="kai" position={[0, 0, 0]} pose={{ ...idle(f), armL: [-0.2, 0, -2.4], armR: [-0.2, 0, 2.4], bob: Math.abs(Math.sin(f * 0.3)) * 0.06 }}
            face={kai(f, [[s, "smile"], [at - 2, "happy"]])} />
        </Escola>
      );
    },
  },
  // ---------------- 10. "Hora quarenta: mais de um trilhão."
  {
    name: "10a montanha de ouro", from: 21.55, to: 22.6,
    render: (f, s, e) => {
      const at = W(10, 1);
      const g = Math.max(0.001, pop(f, at - 2, 9));
      return (
        <Escola cam={glide(f, s, e, { pos: [0, 0.4, 5.2], target: [0, 1.4, 0], fov: 42 }, { pos: [0.6, 0.8, 4.6], target: [0, 1.6, 0], fov: 42 })}>
          <GoldPile p={[0, 0.7 * g, 0]} s={1.3 * g} frame={f} />
          <Toon kind="kai" position={[0, 1.82 * g, 0.05]} pose={{ ...idle(f), armR: [-0.2, 0, 2.4], armL: [-0.2, 0, -2.4] }} face={kai(f, [[s, "happy"], [at + 3, "surprised"]])} />
        </Escola>
      );
    },
  },
  {
    name: "10b orbita no ouro", from: 22.6, to: 23.7,
    render: (f, s, e) => {
      const a = kf(f, [[s, -0.5], [e, 0.5]]);
      return (
        <Escola cam={{ pos: [Math.sin(a) * 3.2, 2.9, Math.cos(a) * 3.2], target: [0, 3.0, 0], fov: 36 }}>
          <GoldPile p={[0, 0.7, 0]} s={1.3} frame={f} />
          <Toon kind="kai" position={[0, 1.82, 0.05]} pose={{ ...idle(f), armR: [-0.2, 0, 2.5 + Math.sin(f * 0.5) * 0.2], armL: [-0.2, 0, -2.5 - Math.sin(f * 0.5) * 0.2] }} face={kai(f, [[s, "happy"]], { blush: true })} />
          <Doubling f={f} at={s - 30} c={[0, 4.6, -0.8]} gens={6} r={1.8} />
        </Escola>
      );
    },
  },
  // ---------------- 11. "Kai... e aquela dívida de cinquenta reais no cartão?"
  {
    name: "11a bia lembra", from: 23.7, to: 24.9,
    render: (f, s, e) => (
      <Rua f={f} dusk cam={glide(f, s, e, head(BIA_ST, [0.5, 0.0, 1.5], 34, [-0.1, -0.2, 0]), head(BIA_ST, [0.15, -0.05, 1.25], 33, [-0.1, -0.2, 0]))}>
        <Toon kind="bia" position={BIA_ST} rotationY={-0.3} pose={{ ...idle(f, 2), armR: [-0.3, 0, 0.4] }} face={bia(f, [[s, "neutral"], [W(11, 3) - 2, "worried"]], { look: [-0.5, 0] })} />
      </Rua>
    ),
  },
  {
    name: "11b cartao de 50", from: 24.9, to: 26.65,
    render: (f, s, e) => {
      const at = W(11, 5);
      const arm = lerp3([0, 0, 0.14], offerR, gesture(f, at, 6, 3));
      return (
        <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.6, 1.2, 1.9], target: [2.6, 1.3, -1.3], fov: 36 }, { pos: [2.5, 1.3, 1.5], target: [2.6, 1.35, -1.3], fov: 35 })}>
          <Toon kind="bia" position={BIA_ST} rotationY={-0.6} pose={{ ...idle(f, 2), armR: arm }} face={bia(f, [[s, "worried"]])}
            holdR={held(arm, <Cartao p={[0, 0.14, 0.05]} rot={[0, -0.2, 0]} s={1.3 * Math.max(0.001, pop(f, at - 2, 6))} />)} />
          <Toon kind="kai" position={KAI_ST} rotationY={0.6} pose={idle(f)} face={kai(f, [[s, "smug"]], { look: [0.5, 0] })} />
        </Rua>
      );
    },
  },
  // ---------------- 12. "Que dívida?"
  {
    name: "12 que divida", from: 26.65, to: 27.5,
    render: (f, s, e) => (
      <Rua f={f} dusk cam={glide(f, s, e, head(KAI_ST, [-0.3, 0.0, 1.45], 34, [0.05, -0.2, 0]), head(KAI_ST, [-0.15, 0.0, 1.15], 33, [0.05, -0.2, 0]))}>
        <Toon kind="kai" position={KAI_ST} rotationY={0.25} pose={{ ...idle(f), armL: [-0.3, 0, -0.4], armR: [-0.3, 0, 0.4] }} face={kai(f, [[s, "smug"], [W(12, 1) - 1, "worried"]], { look: [0.4, 0] })} />
      </Rua>
    ),
  },
  // ---------------- 13. "O problema: tudo que é seu dobra. Inclusive a dívida."
  {
    name: "13a o problema", from: 27.5, to: 28.6,
    render: (f, s, e) => (
      <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.6, 1.0, 3.6], target: [2.6, 1.2, -1.3], fov: 38, roll: 0.0 }, { pos: [2.55, 1.2, 2.2], target: [2.6, 1.3, -1.3], fov: 36, roll: -0.08 })}>
        <Toon kind="kai" position={KAI_ST} rotationY={0.3} pose={idle(f)} face={kai(f, [[s, "worried"]], { sweat: true })} />
        <Toon kind="bia" position={BIA_ST} rotationY={-0.5} pose={{ ...idle(f, 2), armL: [-0.9, 0, 0.6], armR: [-0.9, 0, -0.6] }} face={bia(f, [[s, "neutral"]])} />
      </Rua>
    ),
  },
  {
    name: "13b cartao cresce", from: 28.6, to: 29.7,
    render: (f, s, e) => {
      const at = W(13, 6);
      const g = kf(f, [[at - 4, 1], [e, 2.6]]);
      const c: V3 = [2.55, 1.5, -0.6];
      return (
        <Rua f={f} dusk cam={glide(f, s, e, { pos: add(c, [0.2, 0.0, 1.6]), target: c, fov: 38, roll: 0.06 }, { pos: add(c, [-0.1, 0.0, 2.2]), target: c, fov: 38, roll: -0.06 })}>
          <Cartao p={add(c, [0, Math.sin(f * 0.3) * 0.02, 0])} rot={[0, Math.sin(f * 0.2) * 0.2, Math.sin(f * 0.6) * 0.05]} s={1.4 * g} red={f >= at} txt={short(debtAt(f))} />
        </Rua>
      );
    },
  },
  {
    name: "13c divida gigante", from: 29.7, to: 31.7,
    render: (f, s, e) => {
      const at = W(13, 9);
      const g = kf(f, [[s, 2.4], [at, 5.5]]);
      return (
        <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.3, 1.4, 4.0], target: [2.4, 1.5, -1.2], fov: 42, roll: -0.04 }, { pos: [2.3, 1.6, 5.2], target: [2.4, 1.7, -1.2], fov: 42, roll: 0.04 })}>
          <Cartao p={[2.5, 2.4 + Math.sin(f * 0.25) * 0.05, -2.2]} rot={[0, 0, Math.sin(f * 0.4) * 0.06]} s={g} red txt={short(debtAt(f))} />
          <Toon kind="kai" position={KAI_ST} rotationY={0.2} pose={{ ...idle(f), armL: [-0.3, 0, -0.9 - Math.sin(f * 0.9) * 0.4], armR: [-0.3, 0, 0.9 + Math.sin(f * 0.9 + 1) * 0.4], head: [-0.25, 0, 0] }}
            face={kai(f, [[s, "worried"], [at + 2, "sad"]], { sweat: true, look: [0.3, -0.6] })} />
          <Toon kind="bia" position={BIA_ST} rotationY={-0.4} pose={{ ...idle(f, 2), armL: [-0.9, 0, 0.6], armR: [-0.9, 0, -0.6], head: [-0.25, 0, 0] }} face={bia(f, [[s, "surprised"]], { look: [-0.3, -0.6] })} />
        </Rua>
      );
    },
  },
  // ---------------- 14. pausa
  {
    name: "14 silencio", from: 31.7, to: 32.4,
    render: (f, s, e) => {
      const a = kf(f, [[s, 0.25], [e, 0.05]]);
      return (
        <Rua f={f} dusk cam={{ pos: [KAI_ST[0] + Math.sin(a) * 1.4, 1.5, KAI_ST[2] + Math.cos(a) * 1.4], target: add(KAI_ST, [0, 1.5, 0]), fov: 34 }}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.15} pose={{ ...idle(f), lean: 0.08, head: [0.2, 0, 0] }} face={kai(f, [[s, "sad"]], { sweat: true, look: [0, 0.6] })} />
        </Rua>
      );
    },
  },
  // ---------------- 15. "Bia... me empresta um real?"
  {
    name: "15a kai pede", from: 32.4, to: 33.2,
    render: (f, s, e) => {
      const at = W(15, 3);
      const arm = lerp3([-0.3, 0, 0.3], [-1.35, 0, 0.15], gesture(f, at, 6, 3));
      return (
        <Rua f={f} dusk cam={glide(f, s, e, head(KAI_ST, [0.5, -0.1, 1.5], 34, [0.1, -0.25, 0]), head(KAI_ST, [0.3, -0.15, 1.25], 33, [0.1, -0.25, 0]))}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.45} pose={{ ...idle(f), armR: arm, head: [0.08, 0, 0.12] }} face={kai(f, [[s, "sad"]], { look: [0.6, 0] })} />
        </Rua>
      );
    },
  },
  {
    name: "15b bia de bracos cruzados", from: 33.2, to: 34.1,
    render: (f, s, e) => {
      const at = W(15, 3);
      return (
        <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.1, 1.3, 1.9], target: [2.6, 1.3, -1.3], fov: 36 }, { pos: [2.9, 1.35, 1.8], target: [2.6, 1.35, -1.3], fov: 35 })}>
          <Toon kind="kai" position={KAI_ST} rotationY={0.6} pose={{ ...idle(f), armR: [-1.35, 0, 0.15] }} face={kai(f, [[s, "sad"]], { look: [0.6, 0] })}
            holdR={held([-1.35, 0, 0.15], <Coin p={[0, 0.1, 0.05]} rot={[Math.PI / 2 - 0.4, 0, 0]} s={2.6 * Math.max(0.001, pop(f, at - 2, 6))} />)} />
          <Toon kind="bia" position={BIA_ST} rotationY={-0.6} pose={{ ...idle(f, 2), armL: [-0.9, 0, 0.6], armR: [-0.9, 0, -0.6], head: [0, 0.2, 0.1] }} face={bia(f, [[s, "smug"]], { look: [-0.4, 0] })} />
        </Rua>
      );
    },
  },
  // ---------------- 16. "Comenta DOBRA se você aceitaria esse poder!"
  {
    name: "16a tchau", from: 34.1, to: 35.3,
    render: (f, s, e) => (
      <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.6, 1.3, 2.6], target: [2.6, 1.15, -1.3], fov: 36 }, { pos: [2.6, 1.4, 2.2], target: [2.6, 1.2, -1.3], fov: 35 })}>
        <Toon kind="kai" position={KAI_ST} rotationY={0.15} pose={{ ...idle(f), armR: wave(f) }} face={kai(f, [[s, "smile"]])} />
        <Toon kind="bia" position={BIA_ST} rotationY={-0.15} pose={{ ...idle(f, 2), armL: [-0.2, 0, -2.4 - Math.sin(f * 0.6) * 0.25] }} face={bia(f, [[s, "happy"]])} />
      </Rua>
    ),
  },
  {
    name: "16b afasta", from: 35.3, to: 38.63,
    render: (f, s, e) => (
      <Rua f={f} dusk cam={glide(f, s, e, { pos: [2.6, 1.4, 2.4], target: [2.6, 1.2, -1.3], fov: 36 }, { pos: [2.6, 2.6, 5.4], target: [2.6, 1.6, -1.3], fov: 40 })}>
        <Toon kind="kai" position={add(KAI_ST, [kf(f, [[s + 20, 0], [e, -0.9]]), 0, 0])} rotationY={f > s + 20 ? -1.2 : 0.15} pose={f > s + 20 ? walk(f) : { ...idle(f), armR: wave(f) }} face={kai(f, [[s, "smile"]])} />
        <Toon kind="bia" position={add(BIA_ST, [kf(f, [[s + 26, 0], [e, -0.9]]), 0, 0])} rotationY={f > s + 26 ? -1.2 : -0.15} pose={f > s + 26 ? walk(f) : idle(f, 2)} face={bia(f, [[s, "happy"]])} />
      </Rua>
    ),
  },
];
