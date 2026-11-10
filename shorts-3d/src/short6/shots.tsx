import React from "react";
import { AbsoluteFill } from "remotion";
import data from "../data/micro-words.json";
import { Box } from "../kit/props";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, clamp01, FPS, kf, kf3, pop } from "../kit/anim";
import {
  BigOven, CandyBar, ChocoStain, Egg, EggFace, FloorScale, Heat, LAB_BG, LabBack, LabFront, LIGHT_DAY, LIGHT_GOLD, Magnetron, PopcornBowl,
} from "./lab";

/**
 * Short "O doce que inventou o micro-ondas" — estilo cel (contorno + sombra chapada).
 * Cada plano: início/fim (s) literais; tudo função do frame. Reações caem 0–3 quadros antes da palavra.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };
type V3 = [number, number, number];

export const WORDS = data.words as { text: string; start: number; end: number }[];
export const TOTAL = data.total;
/** Quadro em que a palavra i começa. */
export const W = (i: number) => Math.round(WORDS[i].start * FPS);
const sec = (s: number) => Math.round(s * FPS);

const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]]),
  target: kf3(f, [[s, a.target], [e, b.target]]),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]]),
  roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]]),
});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** Troca de expressão no meio de uma piscada. */
const face = (f: number, keys: [number, ToonExpr][], seed: number, extra: Partial<ToonFace> = {}): ToonFace => {
  let expr = keys[0][1], blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (at > keys[0][0] && d >= -2 && d <= 2) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink: Math.max(blink, blinkAt(f, seed, 70)), eyes: "big", ...extra };
};
const kai = (f: number, keys: [number, ToonExpr][], extra: Partial<ToonFace> = {}) => face(f, keys, 1, extra);
const bia = (f: number, keys: [number, ToonExpr][], extra: Partial<ToonFace> = {}) => face(f, keys, 4, extra);

const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.09 + seed)) * 0.012,
  head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.035 + seed) * 0.1, Math.sin(f * 0.045 + seed) * 0.04],
  armL: [Math.sin(f * 0.07 + seed) * 0.05, 0, -0.14],
  armR: [-Math.sin(f * 0.07 + seed) * 0.05, 0, 0.14],
});
/** Gargalhada: inclina para os lados e quica. */
const laugh = (f: number): Pose => ({ bob: Math.abs(Math.sin(f * 0.8)) * 0.05, head: [-0.15, 0, Math.sin(f * 0.8) * 0.15], lean: -0.08 });
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;
const gesture = (f: number, word: number, len = 6, lead = 3) => kf(f, [[word - lead - len, 0], [word - lead, 1]]);

// ---------------------------------------------------------------- posições fixas do laboratório
const KAI: V3 = [-0.55, 0, -0.35];
const KAI_RY = 0.35;
const BIA: V3 = [1.25, 0, -0.2];
const MAG: V3 = [0.25, 0.96, -1.15];
const MAG_RY = -0.75;
const BIA_EGG: V3 = [0.42, 0, -0.62];
const BIA_EGG_RY = -1.25;
const POCKET: V3 = [0.02, 0.9, 0.2]; // bolso canguru (local do Kai)
const FACING: V3 = [Math.sin(KAI_RY), 0, Math.cos(KAI_RY)];
/** Bolso em coordenadas do mundo. */
const POCKET_W: V3 = add(KAI, [POCKET[0] * Math.cos(KAI_RY) + POCKET[2] * Math.sin(KAI_RY), POCKET[1], -POCKET[0] * Math.sin(KAI_RY) + POCKET[2] * Math.cos(KAI_RY)]);
/** Câmera olhando o bolso de frente, a `d` metros, deslocada `side` para o lado. */
const pocketCam = (d: number, side: number, up: number, fov = 36): Cam => ({
  pos: add(POCKET_W, [FACING[0] * d + FACING[2] * side, up + 0.3, FACING[2] * d - FACING[0] * side]), target: add(POCKET_W, [0, 0.28, 0]), fov,
});

/** Algo preso ao corpo do Kai (mesma posição/rotação). */
const OnBody: React.FC<{ p: V3; ry: number; children: React.ReactNode }> = ({ p, ry, children }) => (
  <group position={p} rotation={[0, ry, 0]}>{children}</group>
);

const Lab: React.FC<{ f: number; cam: Cam; children: React.ReactNode; gold?: boolean; year?: number; bench?: boolean }> = ({ cam, children, gold, year = 1, bench = true }) => (
  <Stage
    flat
    cam={cam}
    background={gold ? "#f4c48a" : LAB_BG}
    blur={1.5}
    lights={gold ? LIGHT_GOLD : LIGHT_DAY}
    bg={<Cel><LabBack year={year} /></Cel>}
    fg={<Cel><LabFront bench={bench} />{children}</Cel>}
  />
);

const Screwdriver: React.FC = () => (
  <group position={[0, -0.02, 0.05]} rotation={[1.3, 0, 0]}>
    <Box s={[0.04, 0.12, 0.04]} p={[0, 0, 0]} c="#e2483a" />
    <Box s={[0.012, 0.14, 0.012]} p={[0, 0.12, 0]} c="#c9ced6" />
  </group>
);

/** Estado do doce/mancha ao longo da história. */
const meltAt = (f: number) => kf(f, [[W(33), 0], [W(38) + 2, 1]]);
const stainAt = (f: number) => kf(f, [[W(34), 0], [W(38) + 4, 1]]);

const kaiBody = (f: number, extra: { pose?: Pose; face: ToonFace; holdR?: React.ReactNode; holdL?: React.ReactNode; p?: V3; ry?: number }) => {
  const p = extra.p ?? KAI, ry = extra.ry ?? KAI_RY;
  return (
    <>
      <Toon kind="kai" position={p} rotationY={ry} pose={extra.pose ?? idle(f)} face={extra.face} holdR={extra.holdR} holdL={extra.holdL} />
      <OnBody p={p} ry={ry}>
        {meltAt(f) < 0.99 && <CandyBar p={add(POCKET, [0.05, 0.06 - meltAt(f) * 0.05, -0.02])} rot={[0.1, 0, -0.25]} s={0.9} melt={meltAt(f)} />}
        <ChocoStain p={add(POCKET, [0, -0.02, 0.03])} k={stainAt(f)} />
      </OnBody>
    </>
  );
};

// ================================================================= PLANOS
export const SHOTS: Shot[] = [
  // "Um engenheiro inventou o micro-ondas sem querer."
  {
    name: "01a gancho kai e o bolso quente", from: 0, to: 1.3,
    render: (f, s, e) => (
      <Lab f={f} cam={glide(f, s, e, { pos: add(KAI, [0.9, 1.7, 1.5]), target: add(KAI, [0.15, 1.2, 0]), fov: 38 }, { pos: add(KAI, [0.6, 1.65, 1.15]), target: add(KAI, [0.12, 1.25, 0]), fov: 36 })}>
        <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
        {kaiBody(f, { pose: { ...idle(f), head: [0.35, 0, 0.05], armL: [-0.3, 0, -0.5], armR: [-0.3, 0, 0.5] }, face: kai(f, [[s, "surprised"]], { look: [0, 1], sweat: true }) })}
        <OnBody p={KAI} ry={KAI_RY}><Heat p={add(POCKET, [0, 0.05, 0.05])} frame={f} k={1} s={1.4} /></OnBody>
      </Lab>
    ),
  },
  {
    name: "01b laboratorio abre", from: 1.3, to: 2.9,
    render: (f, s, e) => (
      <Lab f={f} cam={glide(f, s, e, { pos: [0.6, 1.5, 2.6], target: [0.1, 1.1, -0.6], fov: 40 }, { pos: [-0.2, 1.7, 3.3], target: [0.1, 1.1, -0.6], fov: 40 })}>
        <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
        {kaiBody(f, { face: kai(f, [[s, "surprised"], [W(6), "worried"]], { look: [0, 1] }), pose: { ...idle(f), head: [0.3, 0, 0] } })}
        <OnBody p={KAI} ry={KAI_RY}><Heat p={add(POCKET, [0, 0.05, 0.05])} frame={f} k={1} s={1.4} /></OnBody>
      </Lab>
    ),
  },
  // "Com um doce no bolso."
  {
    name: "02 doce no bolso", from: 2.9, to: 4.4,
    render: (f, s, e) => {
      return (
        <Lab f={f} cam={glide(f, s, e, pocketCam(1.15, 0.3, 0.1), pocketCam(0.95, 0.15, 0.08))}>
          {kaiBody(f, { face: kai(f, [[s, "smile"]]) })}
          <OnBody p={KAI} ry={KAI_RY}>
            <group position={add(POCKET, [0.05, 0.06, -0.02])} scale={Math.max(0.001, pop(f, W(9) - 3, 7))}><CandyBar s={1} rot={[0.1, 0, -0.25]} /></group>
          </OnBody>
        </Lab>
      );
    },
  },
  // "Era mil novecentos e quarenta e cinco."
  {
    name: "03 1945 plano geral", from: 4.4, to: 6.6,
    render: (f, s, e) => (
      <Lab f={f} year={Math.max(0.001, pop(f, W(13) - 3, 8))} cam={glide(f, s, e, { pos: [0.4, 2.6, 4.2], target: [0.4, 1.5, -1.5], fov: 42 }, { pos: [0.9, 1.9, 3.6], target: [0.6, 1.6, -1.5], fov: 42 })}>
        <Magnetron p={MAG} rotY={MAG_RY} frame={f} />
        {kaiBody(f, { face: kai(f, [[s, "smile"]]), pose: { ...idle(f), armR: [-0.9, 0, 0.3] }, holdR: held([-0.9, 0, 0.3], <Screwdriver />) })}
      </Lab>
    ),
  },
  // "Ele testava uma peça de radar chamada magnetron."
  {
    name: "04a kai testando", from: 6.6, to: 8.2,
    render: (f, s, e) => {
      const arm: V3 = [-1.1 + Math.sin(f * 0.5) * 0.1, 0, 0.45];
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(KAI, [-0.9, 1.6, 1.6]), target: add(KAI, [0.4, 1.25, -0.3]), fov: 38 }, { pos: add(KAI, [-0.5, 1.55, 1.9]), target: add(KAI, [0.4, 1.2, -0.3]), fov: 38 })}>
          <Magnetron p={MAG} rotY={MAG_RY} frame={f} />
          {kaiBody(f, { face: kai(f, [[s, "neutral"]], { look: [0.7, 0.3] }), pose: { ...idle(f), armR: arm, head: [0.1, 0.3, 0] }, holdR: held(arm, <Screwdriver />) })}
        </Lab>
      );
    },
  },
  {
    name: "04b magnetron liga", from: 8.2, to: 9.8,
    render: (f, s, e) => {
      const at = W(26);
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(MAG, [-0.45, 0.55, 1.05]), target: add(MAG, [-0.1, 0.25, 0]), fov: 38 }, { pos: add(MAG, [-0.55, 0.45, 0.85]), target: add(MAG, [-0.1, 0.28, 0]), fov: 38, roll: 0.04 })}>
          <Magnetron p={MAG} rotY={MAG_RY} on={kf(f, [[at - 3, 0], [at, 1]])} frame={f} />
        </Lab>
      );
    },
  },
  // "De repente, sentiu a calça esquentar."
  {
    name: "05a de repente", from: 9.8, to: 11.0,
    render: (f, s, e) => (
      <Lab f={f} cam={glide(f, s, e, { pos: add(KAI, [0.45, 1.75, 1.35]), target: add(KAI, [0.05, 1.55, 0]), fov: 36 }, { pos: add(KAI, [0.3, 1.72, 1.1]), target: add(KAI, [0.05, 1.55, 0]), fov: 35 })}>
        <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
        {kaiBody(f, { face: kai(f, [[s, "neutral"], [W(28) - 2, "surprised"]], { look: [0, 0.4] }), pose: { ...idle(f), squash: f >= W(28) && f < W(28) + 6 ? 1.06 : 1 } })}
      </Lab>
    ),
  },
  {
    name: "05b calca esquenta", from: 11.0, to: 12.2,
    render: (f, s, e) => {
      return (
        <Lab f={f} cam={glide(f, s, e, pocketCam(1.1, -0.3, 0.1), pocketCam(0.9, -0.15, 0.06))}>
          <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
          {kaiBody(f, { face: kai(f, [[s, "surprised"]]) })}
          <OnBody p={KAI} ry={KAI_RY}><Heat p={add(POCKET, [0, 0.08, 0.06])} frame={f} k={kf(f, [[W(32) - 4, 0], [W(32), 1]])} s={1.6} /></OnBody>
        </Lab>
      );
    },
  },
  // "O doce no bolso tinha derretido."
  {
    name: "06a doce derrete", from: 12.2, to: 13.4,
    render: (f, s, e) => {
      return (
        <Lab f={f} cam={glide(f, s, e, pocketCam(0.95, 0.2, 0.02), pocketCam(0.8, 0.1, 0))}>
          {kaiBody(f, { face: kai(f, [[s, "worried"]]) })}
          <OnBody p={KAI} ry={KAI_RY}><Heat p={add(POCKET, [0, 0.08, 0.06])} frame={f} k={1} s={1.6} /></OnBody>
        </Lab>
      );
    },
  },
  {
    name: "06b cara de nojo", from: 13.4, to: 14.2,
    render: (f, s, e) => (
      <Lab f={f} cam={glide(f, s, e, { pos: add(KAI, [-0.3, 1.95, 1.3]), target: add(KAI, [0.05, 1.62, 0]), fov: 35 }, { pos: add(KAI, [-0.2, 1.92, 1.1]), target: add(KAI, [0.05, 1.62, 0]), fov: 34, roll: -0.04 })}>
        {kaiBody(f, { face: kai(f, [[s, "sad"]], { look: [0, 1], sweat: true }), pose: { ...idle(f), head: [0.4, 0, 0], armL: [-0.4, 0, -0.6], armR: [-0.4, 0, 0.6] } })}
      </Lab>
    ),
  },
  // "Qualquer um ia reclamar da roupa."
  {
    name: "07 bia ri da mancha", from: 14.2, to: 16.2,
    render: (f, s, e) => {
      const at = W(39);
      const arm = lerp3([0, 0, 0.14], [-1.45, 0, -0.35], gesture(f, at, 5, 3));
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: [0.4, 1.55, 2.6], target: [0.35, 1.2, -0.3], fov: 40 }, { pos: [0.2, 1.5, 2.2], target: [0.35, 1.2, -0.3], fov: 40 })}>
          <Magnetron p={MAG} rotY={MAG_RY} frame={f} />
          {kaiBody(f, { face: kai(f, [[s, "sad"]], { look: [0.6, 0] }), pose: { ...idle(f), armL: [-0.5, 0, -0.3], armR: [-0.5, 0, 0.3] } })}
          <Toon kind="bia" position={BIA} rotationY={-0.75} pose={{ ...(f > at + 4 ? laugh(f) : idle(f, 2)), armL: arm }} face={bia(f, [[s, "neutral"], [at + 4, "happy"]])} />
        </Lab>
      );
    },
  },
  // "Ele foi buscar milho de pipoca."
  {
    name: "08 milho de pipoca", from: 16.2, to: 17.95,
    render: (f, s, e) => {
      const at = W(48);
      const arm = lerp3([0, 0, 0.14], [-1.2, 0, 0.2], gesture(f, at, 6, 3));
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(KAI, [0.2, 1.7, 1.6]), target: add(KAI, [0.15, 1.3, 0]), fov: 36 }, { pos: add(KAI, [0.5, 1.6, 1.4]), target: add(KAI, [0.2, 1.25, 0]), fov: 36 })}>
          <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
          {kaiBody(f, { face: kai(f, [[s, "smug"]]), pose: { ...idle(f), armR: arm }, holdR: held(arm, <group scale={Math.max(0.001, pop(f, at - 3, 7))}><PopcornBowl p={[0, -0.04, 0.12]} s={0.9} /></group>) })}
        </Lab>
      );
    },
  },
  // "A pipoca estourou na hora."
  {
    name: "09a pipoca estoura", from: 17.95, to: 18.95,
    render: (f, s, e) => {
      const bowl: V3 = add(MAG, [-0.35, 0, 0.32]);
      const at = W(53) - 2;
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(bowl, [-0.2, 0.5, 1.2]), target: add(bowl, [0.05, 0.25, 0]), fov: 38 }, { pos: add(bowl, [-0.1, 0.65, 1.45]), target: add(bowl, [0.05, 0.35, 0]), fov: 40 })}>
          <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
          <PopcornBowl p={bowl} since={f >= at ? f - at : -1} />
          {kaiBody(f, { face: kai(f, [[s, "smug"], [at + 3, "happy"]]) })}
        </Lab>
      );
    },
  },
  {
    name: "09b chuva de pipoca", from: 18.95, to: 19.85,
    render: (f, s, e) => {
      const bowl: V3 = add(MAG, [-0.35, 0, 0.32]);
      const at = W(53) - 2;
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: [0.3, 1.6, 2.3], target: [0.0, 1.25, -0.6], fov: 40 }, { pos: [0.1, 1.7, 2.6], target: [0.0, 1.3, -0.6], fov: 40 })}>
          <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
          <PopcornBowl p={bowl} since={f - at} />
          {kaiBody(f, { face: kai(f, [[s, "happy"]]), pose: { ...idle(f), armL: [-0.2, 0, -2.5], armR: [-0.2, 0, 2.5], bob: Math.abs(Math.sin(f * 0.4)) * 0.08 } })}
          <Toon kind="bia" position={BIA} rotationY={-0.6} pose={{ ...idle(f, 2), armL: [-0.2, 0, -2.3], armR: [-0.2, 0, 2.3] }} face={bia(f, [[s, "surprised"]], { look: [-0.4, -0.6] })} />
        </Lab>
      );
    },
  },
  // "Depois, testaram um ovo."
  {
    name: "10 o ovo", from: 19.85, to: 21.5,
    render: (f, s, e) => {
      const egg: V3 = add(MAG, [-0.3, 0, 0.35]);
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(egg, [-0.9, 0.55, 1.15]), target: add(egg, [0.15, 0.3, 0.05]), fov: 38 }, { pos: add(egg, [-0.75, 0.5, 0.95]), target: add(egg, [0.15, 0.32, 0.05]), fov: 37 })}>
          <Magnetron p={MAG} rotY={MAG_RY} frame={f} />
          <group scale={Math.max(0.001, pop(f, W(59) - 3, 7))} position={egg}><Egg s={1.4} /></group>
          <Toon kind="bia" position={BIA_EGG} rotationY={BIA_EGG_RY} pose={{ ...idle(f, 2), lean: 0.3, head: [0.25, 0, 0], armL: [-0.6, 0, 0.3], armR: [-0.6, 0, -0.3] }} face={bia(f, [[s, "neutral"]], { look: [-0.4, 0.5] })} />
        </Lab>
      );
    },
  },
  // "Dizem que o ovo explodiu na cara de um colega."
  {
    name: "11a ovo explode", from: 21.5, to: 22.9,
    render: (f, s, e) => {
      const egg: V3 = add(MAG, [-0.3, 0, 0.35]);
      const at = W(64) - 2;
      const flash = f >= at && f < at + 3;
      return (
        <AbsoluteFill>
          <Lab f={f} cam={glide(f, s, e, { pos: add(egg, [-0.75, 0.6, 0.85]), target: add(egg, [0.2, 0.4, 0.05]), fov: 37 }, { pos: add(egg, [-0.65, 0.58, 0.72]), target: add(egg, [0.2, 0.42, 0.05]), fov: 36, roll: f >= at ? 0.06 : 0 })}>
            <Magnetron p={MAG} rotY={MAG_RY} on={1} frame={f} />
            <Egg p={egg} s={1.4} shake={f < at ? clamp01((f - (at - 15)) / 15) : 0} boom={f >= at ? f - at : -1} />
            <Toon kind="bia" position={BIA_EGG} rotationY={BIA_EGG_RY} pose={{ ...idle(f, 2), lean: f >= at ? 0.05 : 0.3, head: [0.25, 0, 0], armL: [-0.6, 0, 0.3], armR: [-0.6, 0, -0.3] }}
              face={bia(f, [[s, "neutral"], [at, "surprised"]], { look: [-0.4, 0.5] })} />
            <OnBody p={BIA_EGG} ry={BIA_EGG_RY}><EggFace k={kf(f, [[at + 1, 0], [at + 5, 1]])} y={1.6} /></OnBody>
          </Lab>
          {flash && <AbsoluteFill style={{ background: "#fffbe8", opacity: 0.85 }} />}
        </AbsoluteFill>
      );
    },
  },
  {
    name: "11b colega melecada", from: 22.9, to: 24.1,
    render: (f, s, e) => {
      const bp: V3 = BIA_EGG;
      return (
        <Lab f={f} cam={glide(f, s, e, { pos: add(bp, [-1.25, 1.75, 0.75]), target: add(bp, [0, 1.48, 0]), fov: 36 }, { pos: add(bp, [-1.1, 1.72, 0.6]), target: add(bp, [0, 1.5, 0]), fov: 35 })}>
          <Toon kind="bia" position={bp} rotationY={BIA_EGG_RY} pose={{ armL: [-0.2, 0, -0.4], armR: [-0.2, 0, 0.4] }} face={bia(f, [[s, "neutral"]], { look: [-0.8, 0] })} />
          <OnBody p={bp} ry={BIA_EGG_RY}><EggFace k={1} y={1.6} /></OnBody>
          {kaiBody(f, { p: [1.35, 0, -1.05], ry: -1.1, face: kai(f, [[s, "happy"]]), pose: laugh(f) })}
        </Lab>
      );
    },
  },
  // "Assim nasceu o forno de micro-ondas."
  {
    name: "12 nasce o forno", from: 24.1, to: 26.3,
    render: (f, s, e) => {
      const at = W(73);
      const k = Math.max(0.001, pop(f, at - 3, 9));
      return (
        <Lab f={f} gold bench={false} cam={glide(f, s, e, { pos: [0.2, 0.7, 3.6], target: [0.2, 1.3, -1.0], fov: 42 }, { pos: [0.5, 1.4, 3.2], target: [0.2, 1.4, -1.0], fov: 42 })}>
          <BigOven p={[0.35, 0, -1.2]} s={k} frame={f} />
          {k > 0.5 && Array.from({ length: 8 }).map((_, i) => {
            const t = ((f * 0.04 + i / 8) % 1);
            return <mesh key={i} position={[0.35 + Math.cos(i * 2.3) * 0.75, 0.4 + t * 2.0, -0.7 + Math.sin(i * 2.3) * 0.2]} scale={(1 - t) * 0.07}><octahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#fff2a8" /></mesh>;
          })}
          {kaiBody(f, { p: [-0.75, 0, -0.5], ry: 0.4, face: kai(f, [[s, "smile"], [at, "happy"]], { blush: true }), pose: { ...idle(f), armR: [-0.2, 0, 2.3], armL: [0, 0, -0.5] } })}
        </Lab>
      );
    },
  },
  // "Só tinha um problema:"
  {
    name: "13 so tinha um problema", from: 26.3, to: 27.7,
    render: (f, s, e) => (
      <Lab f={f} gold bench={false} cam={glide(f, s, e, { pos: [-0.5, 1.6, 1.4], target: [-0.6, 1.55, -0.5], fov: 36, roll: 0 }, { pos: [-0.55, 1.62, 0.95], target: [-0.6, 1.58, -0.5], fov: 34, roll: 0.07 })}>
        <BigOven p={[0.35, 0, -1.2]} s={1} frame={f} />
        {kaiBody(f, { p: [-0.75, 0, -0.5], ry: 0.4, face: kai(f, [[s, "happy"], [W(79) - 2, "worried"]], { look: [0.8, 0.2] }) })}
      </Lab>
    ),
  },
  // "o primeiro pesava trezentos e quarenta quilos."
  {
    name: "14a empurrando o forno", from: 27.7, to: 28.7,
    render: (f, s, e) => {
      const push: V3 = [-1.3, 0, 0.1];
      return (
        <Lab f={f} gold bench={false} cam={glide(f, s, e, { pos: [-1.6, 1.3, 2.4], target: [-0.1, 1.1, -0.8], fov: 40 }, { pos: [-1.3, 1.25, 2.1], target: [-0.1, 1.1, -0.8], fov: 40 })}>
          <BigOven p={[0.35, 0, -1.2]} s={1} frame={f} rotY={Math.sin(f * 1.7) * 0.004} />
          {kaiBody(f, { p: [-0.35, 0, -0.75], ry: 1.2, face: kai(f, [[s, "worried"]], { sweat: true }), pose: { lean: 0.35, armL: push, armR: push, legL: 0.4, legR: -0.5 + Math.sin(f * 0.9) * 0.1, bob: Math.sin(f * 0.9) * 0.01 } })}
        </Lab>
      );
    },
  },
  {
    name: "14b balanca 340 kg", from: 28.7, to: 31.23,
    render: (f, s, e) => {
      const kg = Math.round(kf(f, [[W(83) - 2, 0], [W(83) + 6, 300], [W(85) - 2, 300], [W(85) + 3, 340]], (x) => x));
      const slam = f >= W(86) - 1 ? Math.max(0, 1 - (f - W(86) + 1) / 8) : 0;
      return (
        <Lab f={f} gold bench={false} cam={glide(f, s, e, { pos: [0.35, 1.25, 1.55], target: [0.35, 1.05, -0.6], fov: 40 }, { pos: [0.1, 1.5, 3.4], target: [0.2, 1.2, -0.8], fov: 42, roll: -0.03 })}>
          <FloorScale p={[0.35, 0, -1.2]} kg={kg} s={1.15} />
          <BigOven p={[0.35, 0.12 - slam * 0.04, -1.25]} s={1} squash={1 - slam * 0.06} frame={f} />
          {kaiBody(f, { p: [-0.75, 0, -0.4], ry: 0.5, face: kai(f, [[s, "worried"], [W(86) - 2, "sad"]], { sweat: true, look: [0.8, 0.3] }), pose: { ...idle(f), armL: [-0.3, 0, -0.6], armR: [-0.3, 0, 0.6], squash: 1 - slam * 0.08 } })}
        </Lab>
      );
    },
  },
];

export const shotSec = sec;
