import React from "react";
import { AbsoluteFill } from "remotion";
import { Capybara, CapyPose, capyBody, capyHead } from "../kit/Capybara";
import { Expr, FaceState } from "../kit/Face";
import { Sign } from "../kit/props";
import { Cam, Stage } from "../kit/Stage";
import { blinkAt, kf, kf3, pop, rand, sec } from "../kit/anim";
import { W, mouthFor } from "./timeline";
import {
  BG, Bird, Bonbon, Brigadeiro, Cake, Cloud, IceCream, LIGHTS, Landscape, Lollipop, Plate, Riverbank, SkyBack, Sparkle, TOD, Watermelon,
} from "./world";

/**
 * Storyboard da capivara. Cada plano: início/fim (s) e uma função do frame absoluto.
 * Regra 6: a câmera nunca para e corta ~1x por segundo. Regra 5: gesto 2–3 quadros antes da palavra.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };
type V3 = [number, number, number];

const glide = (f: number, s: number, e: number, a: Cam, b: Cam, ease = (x: number) => x): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]], ease),
  target: kf3(f, [[s, a.target], [e, b.target]], ease),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]], ease),
  roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]], ease),
});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Expressão por janelas; a troca acontece no meio de uma piscada forçada (regra 4). */
const exprAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (d >= -2 && d <= 2) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink };
};
const face = (f: number, keys: [number, Expr][], extra: Partial<FaceState> = {}): FaceState => {
  const ex = exprAt(f, keys);
  return { expr: ex.expr, blink: Math.max(ex.blink, blinkAt(f, 2, 64)), mouthOpen: mouthFor("jujuba", f), ...extra };
};
const chew = (f: number, from: number, to: number) => (f >= from && f <= to ? 0.15 + 0.35 * Math.abs(Math.sin((f - from) * 0.45)) : undefined);

// ---------------------------------------------------------------- inchaço ao longo da história
const T = (s: number) => sec(s);
const P0 = T(30.69), P1 = T(32.0);
export const inflateAt = (f: number) => {
  if (f < T(3.1)) return 1; // flash-forward
  if (f >= P0) {
    const wob = f < P1 ? Math.sin((f - P0) * 1.3) * 0.05 : 0;
    return kf(f, [[P0, 1], [P1, 0.3], [T(33.7), 0]]) + wob;
  }
  return (
    0.06 * pop(f, T(5.1), 8) + // brigadeiro
    0.06 * pop(f, W(3, 5) + 4, 8) + // sorvetes
    0.16 * pop(f, W(5, 3), 8) + // dez bombons
    0.17 * pop(f, T(13.5), 8) + // bolo
    0.17 * pop(f, W(7, 7) - 2, 7) +
    0.2 * pop(f, W(7, 9) - 2, 7) +
    0.18 * pop(f, W(7, 11) - 2, 7)
  );
};

// ---------------------------------------------------------------- poses
const idle = (f: number, seed = 0): CapyPose => ({ bob: Math.sin(f * 0.12 + seed) * 0.01, head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.04 + seed) * 0.08, 0] });
const flail = (f: number, amp = 1): CapyPose => ({
  armL: [Math.sin(f * 0.7) * 0.4, 0, -2.2 - Math.sin(f * 0.9) * 0.4 * amp],
  armR: [Math.cos(f * 0.7) * 0.4, 0, 2.2 + Math.sin(f * 0.9 + 1) * 0.4 * amp],
  legL: Math.sin(f * 0.5) * 0.5, legR: -Math.sin(f * 0.5) * 0.5,
});
/** Item na pata, desfazendo mais ou menos a rotação do braço para ficar em pé. */
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;

// ---------------------------------------------------------------- palcos
const River: React.FC<{ f: number; tod: TOD; cam: Cam; children: React.ReactNode; towel?: boolean; blur?: number }> = ({ f, tod, cam, children, towel = true, blur = 7 }) => (
  <Stage cam={cam} background={BG[tod]} blur={blur} lights={LIGHTS[tod]} bg={Riverbank.back({ tod, frame: f })}
    fg={<>{Riverbank.front({ tod, frame: f, towel, lantern: tod === "night" })}{children}</>} />
);
const Sky: React.FC<{ f: number; tod?: TOD; cam: Cam; children: React.ReactNode; ground?: number; groundX?: number; blur?: number }> = ({ f, tod = "dawn", cam, children, ground = -30, groundX = 0, blur = 6 }) => (
  <Stage cam={cam} background={BG[tod]} blur={blur} lights={LIGHTS[tod]}
    bg={<><SkyBack tod={tod} frame={f} /><group position={[groundX, 0, 0]}><Landscape y={ground} tod={tod} /></group></>}
    fg={children} />
);

const headCam = (inf: number, off: V3, fov = 34, look: V3 = [0, 0, 0]): Cam => {
  const h = capyHead(inf);
  return { pos: add(h, off), target: add(h, look), fov };
};

/** Placa de número que salta na palavra (regra 3). */
const NumSign: React.FC<{ f: number; at: number; text: string; p: V3; w?: number; h?: number; rot?: V3 }> = ({ f, at, text, p, w = 0.42, h = 0.36, rot = [0, 0, 0] }) => (
  <Sign text={text} p={add(p, [0, Math.sin(f * 0.15) * 0.015, 0])} rot={rot} w={w} h={h} bg="#ffd23f" fg="#5a2e18" border="#5a2e18" pop={pop(f, at - 2, 7)} />
);

/** Ar escapando: bolinhas brancas no rastro. */
const Puffs: React.FC<{ f: number; from: number; path: (f: number) => V3 }> = ({ f, from, path }) => (
  <>
    {Array.from({ length: 14 }).map((_, i) => {
      const born = f - i * 2;
      if (born < from) return null;
      const age = (f - born) / 28;
      const p = path(born);
      return (
        <mesh key={i} position={[p[0] + (rand(i) - 0.5) * 0.3, p[1] - 0.3 + age * 0.3, p[2] - 0.3]} scale={0.6 + age * 1.6}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={Math.max(0, 0.75 - age)} roughness={1} />
        </mesh>
      );
    })}
  </>
);

// trajetórias de voo (capivara-balão)
const floatBob = (f: number): V3 => [Math.sin(f * 0.04) * 0.15, Math.sin(f * 0.07) * 0.12, 0];
const zig = (f: number): V3 => {
  const t = (f - P0) / 30;
  return [Math.sin(t * 9) * 2.2 * (1 - t * 0.3), 1.2 - t * 1.6 + Math.sin(t * 13) * 0.4, -t * 1.5];
};

const BONBON_C = ["#e8b83a", "#ff6fa8", "#8a4ad6", "#e8413a", "#3dbf8a"];
const bonbonDrop = (f: number, i: number, start: number): V3 | null => {
  const t0 = start + i * 2;
  const tt = (f - t0) / 30;
  if (tt < 0) return null;
  const tx = (rand(i + 7) - 0.5) * 1.3, tz = 0.25 + rand(i + 9) * 0.5;
  const y = Math.max(0.05 + (i % 3) * 0.05, 3 - 9.8 * tt * tt * 0.5);
  return [tx, y, tz];
};

const MELON_ARM: V3 = [-1.1, 0, 0.9];

// ================================================================= PLANOS
export const SHOTS: Shot[] = [
  // ---------------- 1. "Essa capivara comeu tanto doce que saiu voando." (flash-forward)
  {
    name: "1a balao passa no ceu", from: 0, to: 1.3,
    render: (f, s, e) => (
      <Sky f={f} cam={glide(f, s, e, { pos: [2.6, 1.0, 5.4], target: [0, 1.5, 0], fov: 38 }, { pos: [1.2, 1.4, 4.2], target: [0, 1.4, 0], fov: 36 })}>
        <Capybara inflate={1} position={add([-1.2 + f * 0.03, 0, 0], floatBob(f))} rotationY={0.4} pose={{ ...flail(f, 0.3), armL: [0, 0, -1.6], armR: [0, 0, 1.6] }}
          face={face(f, [[0, "excited"]])} />
        <Cloud p={[-3, 0.2, -2]} s={1.2} tint="#ffe3ec" />
        <Cloud p={[3.4, 2.4, -3]} s={1.4} tint="#ffe3ec" />
      </Sky>
    ),
  },
  {
    name: "1b close balao", from: 1.3, to: 2.5,
    render: (f, s, e) => (
      <Sky f={f} cam={glide(f, s, e, headCam(1, [-0.5, 0.05, 2.0], 34), headCam(1, [0.4, 0.15, 1.6], 32))}>
        <Capybara inflate={1} position={floatBob(f)} rotationY={kf(f, [[s, -0.2], [e, 0.25]])} pose={{ armL: [0, 0, -1.6], armR: [0, 0, 1.4 + Math.sin(f * 0.8) * 0.4] }}
          face={face(f, [[s, "joy"], [W(1, 4) - 2, "happy"]])} />
        <Cloud p={[2.5, 0.8, -2.5]} s={1.0} tint="#ffe3ec" />
      </Sky>
    ),
  },
  {
    name: "1c rebobina", from: 2.5, to: 3.1,
    render: (f, s, e) => {
      const k = (f - s) / (e - s);
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ filter: `blur(${4 + k * 22}px) saturate(${1 - k * 0.6})`, transform: `rotate(${-k * 200}deg) scale(${1 + k * 0.6})` }}>
            <Sky f={f} cam={headCam(1, [0, 0.4, 3.2], 34)}>
              <Capybara inflate={1} position={floatBob(f)} rotationY={-f * 0.3} pose={flail(f)} face={face(f, [[s, "surprised"]])} />
            </Sky>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 170, color: "#fff", WebkitTextStroke: "14px #1b0f08", paintOrder: "stroke fill", opacity: f % 8 < 5 ? 1 : 0.4 }}>◀◀</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, (k - 0.75) * 4) }} />
        </AbsoluteFill>
      );
    },
  },
  // ---------------- 2. "De manhã, a Jujuba comeu um brigadeiro."
  {
    name: "2a manha na beira do rio", from: 3.1, to: 4.3,
    render: (f, s, e) => (
      <River f={f} tod="morning" cam={glide(f, s, e, { pos: [-1.6, 1.9, 5.6], target: [0, 0.6, -0.5], fov: 38 }, { pos: [-0.7, 1.4, 3.8], target: [0, 0.7, 0], fov: 36 })}>
        <Capybara inflate={inflateAt(f)} rotationY={0.25} pose={{ ...idle(f), armR: [0, 0, 0.6 + Math.sin(f * 0.4) * 0.5] }} face={face(f, [[s, "smile"]], { look: [0.2, -0.1] })} />
        <Bird frame={f} p={[1.4, 1.7 + Math.sin(f * 0.1) * 0.1, -1.2]} rotY={-1} s={0.8} />
      </River>
    ),
  },
  {
    name: "2b brigadeiro gulp", from: 4.3, to: 5.5,
    render: (f, s, e) => {
      const at = W(2, 5);
      const toss = (f - T(5.0)) / 6;
      const h = capyHead(0);
      const bp: V3 = toss < 0 ? [0.25, 0.006, 0.55] : toss < 1 ? [0.25 - 0.25 * toss, 0.006 + Math.sin(toss * Math.PI) * 0.5 + toss * (h[1] - 0.15), 0.55 - 0.1 * toss] : [0, -5, 0];
      return (
        <River f={f} tod="morning" cam={glide(f, s, e, { pos: [0.6, 1.15, 2.2], target: [0.05, 0.95, 0.2], fov: 36 }, { pos: [0.3, 1.15, 1.9], target: [0, 1.0, 0.1], fov: 34 })}>
          <Capybara inflate={inflateAt(f)} rotationY={0.12} pose={{ ...idle(f), squash: 1 - 0.08 * Math.max(0, Math.sin(Math.max(0, f - T(5.2)) * 0.5)) * (f > T(5.2) ? 1 : 0) }}
            face={face(f, [[s, "happy"], [at - 2, "excited"], [T(5.2), "joy"]], { mouthOpen: f >= T(4.95) && f < T(5.2) ? 1 : chew(f, T(5.2), e) })} />
          <Brigadeiro p={bp} s={1.6 * Math.max(0.001, pop(f, at - 2, 6))} />
          <NumSign f={f} at={at} text="1" p={[0.32, 1.58, 0.3]} rot={[0, -0.2, 0.08]} />
        </River>
      );
    },
  },
  // ---------------- 3. "No almoço, dois pirulitos e três sorvetes."
  {
    name: "3a dois pirulitos", from: 5.5, to: 7.2,
    render: (f, s, e) => {
      const at = W(3, 2);
      const up = kf(f, [[at - 5, 0], [at - 1, 1]]);
      const aL: V3 = [-0.9 * up, 0, -0.35 - 0.6 * up], aR: V3 = [-0.9 * up, 0, 0.35 + 0.6 * up];
      const lp = Math.max(0.001, pop(f, at - 2, 6));
      return (
        <River f={f} tod="noon" cam={glide(f, s, e, { pos: [-0.9, 1.05, 2.6], target: [0, 0.95, 0], fov: 36 }, { pos: [0.4, 1.1, 2.3], target: [0, 1.0, 0], fov: 35 })}>
          <Capybara inflate={inflateAt(f)} pose={{ ...idle(f), armL: aL, armR: aR, bob: Math.max(0, Math.sin((f - at) * 0.35)) * 0.04 * (f > at ? 1 : 0) }}
            face={face(f, [[s, "smile"], [at - 2, "excited"]])}
            holdL={held(aL, <Lollipop s={lp * 1.2} p={[0, -0.05, 0.03]} a="#ff4f8b" />)} holdR={held(aR, <Lollipop s={lp * 1.2} p={[0, -0.05, 0.03]} a="#4fb3ff" b="#fffbe0" />)} />
          <NumSign f={f} at={at} text="2" p={[0.3, 1.62, 0.2]} rot={[0, -0.2, -0.08]} />
        </River>
      );
    },
  },
  {
    name: "3b tres sorvetes", from: 7.2, to: 8.4,
    render: (f, s, e) => {
      const at = W(3, 5);
      const aL: V3 = [-0.9, 0, -0.95], aR: V3 = [-0.9, 0, 0.95];
      return (
        <River f={f} tod="noon" cam={glide(f, s, e, { pos: [1.4, 0.45, 2.3], target: [0, 0.55, 0.2], fov: 38 }, { pos: [0.5, 0.4, 2.6], target: [0, 0.6, 0.2], fov: 36 })}>
          <Capybara inflate={inflateAt(f)} pose={{ ...idle(f), armL: aL, armR: aR }} face={face(f, [[s, "excited"], [at + 4, "joy"]])}
            holdL={held(aL, <Lollipop s={1.2} p={[0, -0.05, 0.03]} />)} holdR={held(aR, <Lollipop s={1.2} p={[0, -0.05, 0.03]} a="#4fb3ff" b="#fffbe0" />)} />
          {[-0.45, 0, 0.45].map((x, i) => (
            <IceCream key={i} p={[x, 0, 0.62]} s={1.6 * Math.max(0.001, pop(f, at - 2 + i * 2, 6))} c={["#ffb3c7", "#a8f0d0", "#6b3a1f"][i]} />
          ))}
          <NumSign f={f} at={at} text="3" p={[-0.32, 1.5, 0.4]} rot={[0, 0.4, 0.06]} />
        </River>
      );
    },
  },
  // ---------------- 4. Jujuba: "Sobremesa também é comida!"
  {
    name: "4 sobremesa e comida", from: 8.4, to: 10.0,
    render: (f, s, e) => {
      const inf = inflateAt(f);
      const aR: V3 = [-1.45, 0.2, 0.15];
      return (
        <River f={f} tod="noon" cam={glide(f, s, e, headCam(inf, [-0.35, 0.0, 2.2], 34, [0.05, -0.2, 0]), headCam(inf, [0.25, 0.05, 1.85], 33, [0.05, -0.18, 0]))}>
          <Capybara inflate={inf} pose={{ ...idle(f), armR: [aR[0] + Math.sin(f * 0.5) * 0.08, aR[1], aR[2]] }} face={face(f, [[s, "happy"], [W(4, 3) - 2, "joy"]], { look: [0, 0] })}
            holdR={held(aR, <IceCream s={1.3} p={[0, -0.02, 0.05]} c="#a8f0d0" />)} />
          <IceCream p={[-0.5, 0, 0.6]} s={1.5} />
        </River>
      );
    },
  },
  // ---------------- 5. "De tarde, foram dez bombons."
  {
    name: "5a chuva de bombons", from: 10.0, to: 11.0,
    render: (f, s, e) => (
      <River f={f} tod="afternoon" cam={glide(f, s, e, { pos: [0.3, 0.5, 2.4], target: [0, 1.1, 0], fov: 40 }, { pos: [-0.3, 0.55, 2.0], target: [0, 1.2, 0], fov: 38 })}>
        <Capybara inflate={inflateAt(f)} pose={{ ...idle(f), armL: [0, 0, -2.3], armR: [0, 0, 2.3], head: [-0.25, 0, 0] }} face={face(f, [[s, "amazed"]], { look: [0, -0.8] })} />
        {Array.from({ length: 10 }).map((_, i) => {
          const p = bonbonDrop(f, i, s - 10);
          return p && <Bonbon key={i} p={p} rot={[f * 0.2 + i, i, 0]} s={1.6} c={BONBON_C[i % 5]} />;
        })}
      </River>
    ),
  },
  {
    name: "5b dez bombons", from: 11.0, to: 12.2,
    render: (f, s, e) => {
      const at = W(5, 3);
      const aL: V3 = [-0.9, 0, -0.7], aR: V3 = [-0.9, 0, 0.7];
      return (
        <River f={f} tod="afternoon" cam={glide(f, s, e, { pos: [-1.3, 1.2, 2.6], target: [0, 0.6, 0.2], fov: 36 }, { pos: [-0.6, 1.0, 2.2], target: [0, 0.65, 0.2], fov: 35 })}>
          <Capybara inflate={inflateAt(f)} rotationY={-0.2} pose={{ ...idle(f), armL: aL, armR: aR }} face={face(f, [[s, "excited"], [at + 2, "joy"]], { mouthOpen: chew(f, at + 6, e) })}
            holdL={held(aL, <Bonbon s={1.6} p={[0, 0.02, 0.05]} c="#ff6fa8" />)} holdR={held(aR, <Bonbon s={1.6} p={[0, 0.02, 0.05]} />)} />
          {Array.from({ length: 8 }).map((_, i) => (
            <Bonbon key={i} p={[(rand(i + 7) - 0.5) * 1.3, 0.05 + (i % 3) * 0.05, 0.25 + rand(i + 9) * 0.5]} rot={[0, i, 0]} s={1.6} c={BONBON_C[i % 5]} />
          ))}
          <NumSign f={f} at={at} text="10" p={[0.62, 1.15, 0.3]} w={0.55} rot={[0, -0.3, -0.06]} />
        </River>
      );
    },
  },
  // ---------------- 6. "E de noite, um bolo inteiro de chocolate."
  {
    name: "6a bolo gigante", from: 12.2, to: 13.5,
    render: (f, s, e) => {
      const at = W(6, 3);
      return (
        <River f={f} tod="night" cam={glide(f, s, e, { pos: [1.6, 0.9, 2.8], target: [0, 0.7, 0.3], fov: 38 }, { pos: [0.9, 0.8, 2.3], target: [0, 0.75, 0.3], fov: 36 })}>
          <Capybara inflate={inflateAt(f)} rotationY={0.15} pose={{ ...idle(f), armL: [-0.6, 0, -1.2], armR: [-0.6, 0, 1.2] }}
            face={face(f, [[s, "smile"], [at - 1, "amazed"]], { mouthOpen: f >= at + 6 ? 1 : undefined })} />
          <Cake p={[0, 0, 0.75]} s={1.3 * Math.max(0.001, pop(f, at - 2, 7))} />
          <NumSign f={f} at={at} text="1" p={[-0.38, 1.4, 0.6]} rot={[0, 0.4, 0.06]} />
        </River>
      );
    },
  },
  {
    name: "6b prato vazio", from: 13.5, to: 14.75,
    render: (f, s, e) => (
      <River f={f} tod="night" cam={glide(f, s, e, { pos: [-0.4, 1.3, 2.2], target: [0, 0.6, 0.4], fov: 36 }, { pos: [-0.9, 1.15, 2.0], target: [0, 0.7, 0.3], fov: 35 })}>
        <Capybara inflate={inflateAt(f)} pose={{ ...idle(f), armL: [-0.5, 0, -0.5], armR: [-0.5, 0, 0.5], squash: 1 - 0.06 * Math.abs(Math.sin((f - s) * 0.3)) }}
          face={face(f, [[s, "joy"]], { mouthOpen: chew(f, s, e), blush: true })} />
        <Plate p={[0, 0.02, 0.75]} s={1.6} />
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[(rand(i) - 0.5) * 0.6, 0.045, 0.75 + (rand(i + 3) - 0.5) * 0.5]}><sphereGeometry args={[0.015 + rand(i + 5) * 0.015, 6, 5]} /><meshStandardMaterial color="#5a2e18" /></mesh>
        ))}
      </River>
    ),
  },
  // ---------------- 7. "Só que a barriga dela começou a crescer, e crescer, e crescer."
  {
    name: "7a barriga", from: 14.75, to: 16.15,
    render: (f, s, e) => (
      <River f={f} tod="night" cam={glide(f, s, e, { pos: [0.3, 0.75, 1.6], target: [0, 0.5, 0], fov: 36 }, { pos: [0.6, 0.8, 2.0], target: [0, 0.55, 0], fov: 36 })}>
        <Capybara inflate={inflateAt(f)} pose={{ ...idle(f), armL: [-0.7, 0, -0.25 + Math.sin(f * 0.4) * 0.15], armR: [-0.7, 0, 0.25 - Math.sin(f * 0.4) * 0.15] }}
          face={face(f, [[s, "smile"], [W(7, 3), "neutral"]], { look: [0, 0.8] })} />
        <Plate p={[0.6, 0.02, 0.75]} s={1.0} />
      </River>
    ),
  },
  ...[[16.15, 17.0, 7, "7b crescer 1"], [17.0, 17.85, 9, "7c crescer 2"], [17.85, 18.55, 11, "7d crescer 3"]].map(([from, to, wi, name], i): Shot => ({
    name: name as string, from: from as number, to: to as number,
    render: (f, s, e) => {
      const inf = inflateAt(f);
      const at = W(7, wi as number) - 2;
      const dist = [2.6, 3.4, 4.4][i];
      const ang = [-0.5, 0.45, -0.15][i];
      const b = capyBody(inf);
      return (
        <River f={f} tod="night" cam={glide(f, s, e,
          { pos: [Math.sin(ang) * dist * 0.85, b[1] + 0.35, Math.cos(ang) * dist * 0.85], target: [0, b[1] + 0.2, 0], fov: 36 },
          { pos: [Math.sin(ang) * dist, b[1] + 0.45, Math.cos(ang) * dist], target: [0, b[1] + 0.25, 0], fov: 36 })}>
          <Capybara inflate={inf} pose={{ armL: [0, 0, -0.9 - i * 0.3], armR: [0, 0, 0.9 + i * 0.3], squash: 1 + 0.08 * Math.sin(Math.max(0, f - at) * 0.9) * Math.exp(-Math.max(0, f - at) * 0.15) }}
            face={face(f, [[s, i === 0 ? "neutral" : "surprised"], [at, "surprised"]])} />
        </River>
      );
    },
  })),
  // ---------------- 8. Jujuba: "Ih... acho que exagerei."
  {
    name: "8 exagerei", from: 18.55, to: 20.05,
    render: (f, s, e) => (
      <River f={f} tod="night" cam={glide(f, s, e, headCam(1, [0.3, 0.0, 2.4], 33, [0, -0.1, 0]), headCam(1, [-0.1, -0.05, 2.0], 32, [0, -0.1, 0]))}>
        <Capybara inflate={inflateAt(f)} pose={{ armL: [0, 0, -1.2], armR: [0, 0, 1.2], head: [0.05, Math.sin(f * 0.1) * 0.06, 0] }}
          face={face(f, [[s, "smile"], [W(8, 0) - 2, "worried"]], { sweat: f >= W(8, 0) })} />
      </River>
    ),
  },
  // ---------------- 9. "E os pezinhos saíram do chão."
  {
    name: "9 pezinhos sobem", from: 20.05, to: 21.8,
    render: (f, s, e) => {
      const lift = kf(f, [[W(9, 3) - 4, 0], [e, 0.55]]);
      return (
        <River f={f} tod="night" cam={glide(f, s, e, { pos: [1.5, 0.35, 3.4], target: [0, 0.5, 0], fov: 38 }, { pos: [1.2, 0.4, 3.2], target: [0, 0.8, 0], fov: 38 })}>
          <Capybara inflate={inflateAt(f)} position={[0, lift, 0]} pose={{ legL: lift > 0 ? Math.sin(f * 0.6) * 0.6 : 0, legR: lift > 0 ? -Math.sin(f * 0.6) * 0.6 : 0, armL: [0, 0, -1.3], armR: [0, 0, 1.3] }}
            face={face(f, [[s, "worried"]])} />
          <Sparkle p={[0, 0.05, 0.2]} t={(f - W(9, 3)) / 10} c="#ffffff" />
        </River>
      );
    },
  },
  // ---------------- 10. "A Jujuba virou um balão!"
  {
    name: "10 sobe acima das arvores", from: 21.8, to: 23.5,
    render: (f, s, e) => {
      const y = kf(f, [[s, 0.6], [e, 3.4]], (x) => x);
      return (
        <River f={f} tod="night" cam={glide(f, s, e, { pos: [0.6, 1.2, 5.4], target: [0, 1.6, 0], fov: 42 }, { pos: [0.3, 1.0, 6.0], target: [0, 3.6, -0.5], fov: 44 })}>
          <Capybara inflate={1} position={[Math.sin(f * 0.05) * 0.2, y, 0]} rotationY={(f - s) * 0.03} pose={flail(f, 0.4)}
            face={face(f, [[s, "worried"], [W(10, 4) - 2, "surprised"]])} />
        </River>
      );
    },
  },
  // ---------------- 11. "Passou por cima do rio, das árvores, e subiu até as nuvens."
  {
    name: "11a por cima do rio", from: 23.5, to: 24.9,
    render: (f, s, e) => (
      <Sky f={f} ground={-14} groundX={-(f - s) * 0.08} cam={glide(f, s, e, { pos: [2.2, 3.0, 3.6], target: [0, 0.6, 0], fov: 40 }, { pos: [1.4, 3.3, 3.0], target: [0, 0.5, 0], fov: 40 })}>
        <Capybara inflate={1} position={floatBob(f)} rotationY={0.6} pose={flail(f, 0.3)} face={face(f, [[s, "surprised"]], { look: [0.3, 0.8] })} />
      </Sky>
    ),
  },
  {
    name: "11b arvores", from: 24.9, to: 25.95,
    render: (f, s, e) => (
      <Sky f={f} ground={-5.5} groundX={-(f - s) * 0.12 + 8} cam={glide(f, s, e, { pos: [-2.6, 0.2, 3.2], target: [0, 0.4, 0], fov: 40 }, { pos: [-2.0, 0.0, 3.4], target: [0, 0.6, 0], fov: 40 })}>
        <Capybara inflate={1} position={floatBob(f)} rotationY={-0.5} pose={flail(f, 0.3)} face={face(f, [[s, "amazed"]], { look: [-0.4, 0.6] })} />
        <Bird frame={f} p={[1.6 - (f - s) * 0.05, 0.6, -1]} rotY={-1.4} s={1.1} />
      </Sky>
    ),
  },
  {
    name: "11c nuvens", from: 25.95, to: 27.5,
    render: (f, s, e) => (
      <Sky f={f} ground={-60} cam={glide(f, s, e, { pos: [0.4, 0.3, 4.6], target: [0, 1.0, 0], fov: 40 }, { pos: [-0.3, 0.6, 4.2], target: [0, 1.6, 0], fov: 38 })}>
        <Capybara inflate={1} position={add([0, (f - s) * 0.012, 0], floatBob(f))} rotationY={0.15} pose={flail(f, 0.2)} face={face(f, [[s, "amazed"], [W(11, 11) - 2, "excited"]])} />
        <Cloud p={[-1.8 + (f - s) * 0.04, 0.4, 1.0]} s={1.3} tint="#ffe3ec" />
        <Cloud p={[2.0 - (f - s) * 0.03, 1.8, 0.6]} s={1.2} tint="#ffe3ec" />
        <Cloud p={[0.6, -0.8 - (f - s) * 0.02, 1.4]} s={1.5} tint="#ffffff" />
      </Sky>
    ),
  },
  // ---------------- 12. Jujuba: "Alguém me desce daqui!"
  {
    name: "12 alguem me desce", from: 27.5, to: 28.7,
    render: (f, s, e) => (
      <Sky f={f} ground={-60} cam={glide(f, s, e, headCam(1, [0.6, -0.2, 2.3], 36), headCam(1, [0.2, -0.1, 1.9], 34))}>
        <Capybara inflate={1} position={floatBob(f)} pose={flail(f, 1)} face={face(f, [[s, "worried"]], { sweat: true })} />
        <Bird frame={f} p={[-1.2, 2.0, 0.2]} rotY={0.9} s={1.1} flap={0.4} look={Math.sin(f * 0.2) * 0.3} />
        <Bird frame={f + 7} p={[1.3, 2.2, -0.2]} rotY={-0.9} s={1.0} flap={0.4} />
      </Sky>
    ),
  },
  // ---------------- 13. "Aí um passarinho deu uma bicadinha."
  {
    name: "13a passarinho chega", from: 28.7, to: 29.7,
    render: (f, s, e) => {
      const land = s + 18;
      const bp: V3 = f < land ? kf3(f, [[s, [2.6, 3.4, -0.4]], [land, [0.55, 2.05, -0.2]]]) : [0.55, 2.05, -0.2];
      return (
        <Sky f={f} ground={-60} cam={glide(f, s, e, { pos: [2.4, 1.8, 3.8], target: [0.2, 1.6, 0], fov: 38 }, { pos: [1.8, 2.0, 3.4], target: [0.3, 1.8, 0], fov: 37 })}>
          <Capybara inflate={1} position={floatBob(f).map((v, i) => (i === 1 ? v * 0.3 : v * 0.3)) as V3} rotationY={0.2} pose={{ armL: [0, 0, -1.6], armR: [0, 0, 1.6] }}
            face={face(f, [[s, "worried"]], { look: [0.6, -0.6] })} />
          <Bird frame={f} p={bp} rotY={f < land ? -2.2 : -1.7} s={1.2} flap={f < land ? 1 : 0} />
        </Sky>
      );
    },
  },
  {
    name: "13b bicadinha", from: 29.7, to: 30.65,
    render: (f, s, e) => {
      const at = W(13, 5) - 2;
      const pk = Math.max(0, 1 - Math.abs(f - at) / 3);
      return (
        <Sky f={f} ground={-60} cam={glide(f, s, e, { pos: [1.6, 2.6, 1.6], target: [0.45, 1.85, -0.1], fov: 36 }, { pos: [1.3, 2.4, 1.4], target: [0.45, 1.85, -0.1], fov: 34 })}>
          <Capybara inflate={1} pose={{ armL: [0, 0, -1.6], armR: [0, 0, 1.6], squash: 1 - 0.05 * Math.max(0, 1 - Math.abs(f - at - 2) / 4) }}
            face={face(f, [[s, "worried"], [at + 1, "surprised"]], { look: [0.6, -0.6] })} />
          <Bird frame={f} p={[0.55, 2.05, -0.2]} rotY={-1.7} s={1.2} flap={0} peck={pk} />
          <Sparkle p={[0.42, 1.95, -0.05]} t={(f - at) / 9} />
        </Sky>
      );
    },
  },
  // ---------------- 14. "Pfffff" (efeito)
  {
    name: "14 pfff zigue-zague", from: 30.65, to: 32.0,
    render: (f, s, e) => {
      const p = zig(f);
      const sh = Math.sin(f * 2.1) * 0.03;
      return (
        <Sky f={f} ground={-60} cam={{ pos: [p[0] * 0.5 + sh, p[1] + 0.8, p[2] + 4.2], target: [p[0] * 0.8, p[1] + 0.9 + sh, p[2]], fov: 42, roll: Math.sin(f * 0.4) * 0.06 }}>
          <Capybara inflate={inflateAt(f)} position={p} rotationY={(f - s) * 0.45} pose={{ ...flail(f, 1), head: [0, 0, Math.sin(f * 0.5) * 0.3] }}
            face={face(f, [[s, "surprised"]], { mouthOpen: 0.8, sweat: true })} />
          <Puffs f={f} from={P0} path={(g) => add(zig(g), [0, 0.6, 0])} />
          <Bird frame={f} p={[0.6, 2.6 - (f - s) * 0.01, -1]} rotY={-1.2} s={1.1} look={0.6} />
        </Sky>
      );
    },
  },
  // ---------------- 15. "E ela desceu, devagarinho, de volta pra beira do rio."
  {
    name: "15a desce devagar", from: 32.0, to: 33.8,
    render: (f, s, e) => {
      const inf = inflateAt(f);
      return (
        <Sky f={f} tod="morning" ground={kf(f, [[s, -14], [e, -4]], (x) => x)} groundX={2} cam={glide(f, s, e, { pos: [1.0, 1.6, 3.6], target: [0, 0.9, 0], fov: 38 }, { pos: [0.6, 1.2, 3.0], target: [0, 0.7, 0], fov: 38 })}>
          <Capybara inflate={inf} position={[Math.sin(f * 0.12) * 0.25, 0.3 + Math.sin(f * 0.08) * 0.05, 0]} rotationY={Math.sin(f * 0.12) * 0.3}
            pose={{ armL: [0, 0, -2.0], armR: [0, 0, 2.0], legL: 0.3, legR: -0.3 }} face={face(f, [[s, "worried"], [W(15, 3), "neutral"]])} messy={0.6} />
        </Sky>
      );
    },
  },
  {
    name: "15b pousa na beira do rio", from: 33.8, to: 35.5,
    render: (f, s, e) => {
      const touch = T(34.55);
      const y = f < touch ? kf(f, [[s, 1.4], [touch, 0]], (x) => x) : Math.abs(Math.sin((f - touch) * 0.35)) * 0.12 * Math.exp(-(f - touch) * 0.12);
      return (
        <River f={f} tod="morning" cam={glide(f, s, e, { pos: [-1.4, 1.3, 3.0], target: [0, 0.8, 0], fov: 36 }, { pos: [-0.8, 1.0, 2.3], target: [0, 0.75, 0], fov: 35 })}>
          <Capybara inflate={inflateAt(f)} position={[0, y, 0]} rotationY={-0.2} messy={1}
            pose={{ armL: [0, 0, f < touch ? -2 : -0.5], armR: [0, 0, f < touch ? 2 : 0.5], squash: f >= touch ? 1 - 0.12 * Math.exp(-(f - touch) * 0.2) : 1 }}
            face={face(f, [[s, "surprised"], [touch + 8, "smile"]])} />
          <Sparkle p={[0, 0.05, 0.3]} t={(f - touch) / 10} c="#ffffff" />
        </River>
      );
    },
  },
  // ---------------- 16. "Desde aquele dia, a Jujuba come doce só uma vez por semana."
  {
    name: "16a um brigadeiro so", from: 35.5, to: 37.0,
    render: (f, s, e) => (
      <River f={f} tod="morning" cam={glide(f, s, e, { pos: [0.9, 0.95, 2.4], target: [0.15, 0.75, 0.3], fov: 36 }, { pos: [0.5, 1.0, 2.1], target: [0.1, 0.8, 0.3], fov: 35 })}>
        <Capybara inflate={0} rotationY={0.2} messy={0.3} pose={{ ...idle(f), head: [0.3, 0.2, 0] }} face={face(f, [[s, "neutral"], [W(16, 2), "smile"]], { look: [0.4, 0.8] })} />
        <Plate p={[0.3, 0.02, 0.6]} s={0.7} />
        <Brigadeiro p={[0.3, 0.035, 0.6]} s={1.6} />
      </River>
    ),
  },
  {
    name: "16b uma vez por semana", from: 37.0, to: 39.1,
    render: (f, s, e) => {
      const at = W(16, 8);
      const aR: V3 = [-1.0, 0, 0.5];
      return (
        <River f={f} tod="morning" cam={glide(f, s, e, { pos: [-0.5, 1.2, 2.7], target: [0.1, 1.05, 0], fov: 36 }, { pos: [0.1, 1.2, 2.4], target: [0.1, 1.1, 0], fov: 35 })}>
          <Capybara inflate={0} messy={0.3} pose={{ ...idle(f), armR: aR }} face={face(f, [[s, "smile"], [at + 6, "wink"]])}
            holdR={held(aR, <Brigadeiro s={1.6} p={[0, -0.02, 0.05]} />)} />
          <Plate p={[0.3, 0.02, 0.6]} s={0.7} />
          <Sign text="1x POR SEMANA" p={[0.05, 1.65 + Math.sin(f * 0.15) * 0.015, 0.2]} rot={[0, 0.05, 0.04]} w={0.95} h={0.34} bg="#ffd23f" fg="#5a2e18" border="#5a2e18" pop={pop(f, at - 2, 7)} />
        </River>
      );
    },
  },
  // ---------------- 17. Jujuba: "E melancia todo dia!"
  {
    name: "17a melancia", from: 39.1, to: 40.6,
    render: (f, s, e) => {
      const bite = W(17, 2) - 3;
      return (
        <River f={f} tod="morning" cam={glide(f, s, e, headCam(0, [0.5, -0.1, 2.5], 36, [0, -0.3, 0]), headCam(0, [0.2, -0.05, 2.2], 35, [0, -0.28, 0]))}>
          <Capybara inflate={0} messy={0.3} pose={{ armL: [MELON_ARM[0], 0, -MELON_ARM[2]], armR: MELON_ARM, head: [kf(f, [[bite - 4, 0], [bite, 0.3], [bite + 5, 0]]), 0, 0] }}
            face={face(f, [[s, "happy"], [bite + 4, "joy"]], { mouthOpen: f >= bite - 4 && f < bite ? 1 : chew(f, bite + 4, e) ?? mouthFor("jujuba", f) })} />
          <Watermelon p={[0, 0.66, 0.38]} rot={[0.15, 0, 0]} s={1.25} bite={f >= bite ? 1 : 0} />
        </River>
      );
    },
  },
  {
    name: "17b fim sobe a camera", from: 40.6, to: 50,
    render: (f, s, e) => (
      <River f={f} tod="morning" cam={glide(f, s, s + 60, { pos: [0.4, 0.9, 2.6], target: [0, 0.7, 0], fov: 36 }, { pos: [0.2, 3.2, 4.6], target: [0, 0.6, -0.4], fov: 40 }, (x) => x)}>
        <Capybara inflate={0} messy={0.3} pose={{ armL: [MELON_ARM[0], 0, -MELON_ARM[2]], armR: MELON_ARM, bob: Math.abs(Math.sin(f * 0.25)) * 0.03 }}
          face={face(f, [[s, "joy"]], { mouthOpen: chew(f, s, s + 30) })} />
        <Watermelon p={[0, 0.66, 0.38]} rot={[0.15, 0, 0]} s={1.25} bite={1} />
        <Bird frame={f} p={[1.0, 0.25, 0.4]} rotY={-0.8} s={0.9} flap={0} look={Math.sin(f * 0.2) * 0.5} />
      </River>
    ),
  },
];
