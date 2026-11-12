import React from "react";
import data from "../data/torre-en-timeline.json";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, FPS, kf, kf3, pop } from "../kit/anim";
import { Stamp, nicoFace } from "../short8/shots";
import { Car, Hallway, LIGHT_DAY, LIGHT_INSIDE, LIGHT_NIGHT, LIGHT_SEPIA, LIGHT_STORM, RoadTunnel, SchoolTunnel, Snow, Tower, TownSign, Train, Valley } from "./cena";

/** Short (inglês) "The town where everyone lives in ONE building" — canal do Nico, tudo em 3D (estilo do ep. 1). */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode; overlay?: (f: number) => React.ReactNode };
type V3 = [number, number, number];
type TL = { total: number; lines: { words: { text: string; start: number; end: number }[] }[] };
const D = data as TL;
export const WORDS = D.lines.flatMap((l) => l.words);
export const TOTAL = D.total;
const W = (i: number) => Math.round(WORDS[i].start * FPS);
const C = (i: number) => Math.max(0, WORDS[i].start - 0.08);

const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]]), target: kf3(f, [[s, a.target], [e, b.target]]),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]]), roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]]),
});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.09 + seed)) * 0.012,
  head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.035 + seed) * 0.1, Math.sin(f * 0.045 + seed) * 0.04],
  armL: [Math.sin(f * 0.07 + seed) * 0.05, 0, -0.14], armR: [-Math.sin(f * 0.07 + seed) * 0.05, 0, 0.14],
});
const walkPose = (f: number): Pose => ({ ...idle(f), legL: Math.sin(f * 0.35) * 0.5, legR: -Math.sin(f * 0.35) * 0.5, armL: [-Math.sin(f * 0.35) * 0.5, 0, -0.14], armR: [Math.sin(f * 0.35) * 0.5, 0, 0.14], bob: Math.abs(Math.sin(f * 0.35)) * 0.03 });
const kidFace = (f: number, expr: ToonExpr, seed: number): ToonFace => ({ expr, blink: blinkAt(f, seed, 75), eyes: "big" });

const Scene: React.FC<{ cam: Cam; bg?: string; light?: React.ReactNode; children: React.ReactNode }> = ({ cam, bg = "#cfe3f5", light = LIGHT_DAY, children }) => (
  <Stage flat cam={cam} background={bg} lights={light} fg={<Cel>{children}</Cel>} />
);
const Nico: React.FC<{ f: number; face: ToonFace; pose?: Pose; p: V3; ry?: number }> = ({ f, face, pose, p, ry = 0 }) => (
  <Toon kind="nico" position={p} rotationY={ry} face={face} pose={pose ?? idle(f)} />
);
const TOWER: V3 = [0, 0, -2];

export const SHOTS: Shot[] = [
  // "There's a town in Alaska where almost everyone lives in the same building."
  {
    name: "01 cidade vista de cima", from: 0, to: C(13),
    render: (f, s, e) => (
      <Scene cam={glide(f, s, e, { pos: [6, 9, 14], target: [0, 1.5, -2], fov: 40 }, { pos: [2.5, 3.2, 7.5], target: [0, 3.0, -2], fov: 40 })}>
        <Valley /><Tower p={TOWER} /><Snow frame={f} area={16} />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(4) - 2} text="ALASKA" color="#2c6fb6" size={110} y={0.1} rot={-4} />,
  },
  // "One building. Fourteen floors."
  {
    name: "02 contra-plongee 14 andares", from: C(13), to: C(17),
    render: (f, s, e) => (
      <Scene cam={glide(f, s, e, { pos: [1.2, 0.6, 2.6], target: [0, 2.0, -2], fov: 50 }, { pos: [1.0, 0.5, 2.2], target: [0, 4.6, -2], fov: 52 })}>
        <Valley /><Tower p={TOWER} /><Snow frame={f} area={10} />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(15) - 2} text="14 FLOORS" size={120} y={0.1} rot={-4} />,
  },
  // "It's called Whittier, and only around two hundred and seventy people live there."
  {
    name: "03 nico e placa", from: C(17), to: C(30),
    render: (f, s, e) => (
      <Scene cam={glide(f, s, e, { pos: [0.6, 1.6, 4.6], target: [0, 1.3, 0.8], fov: 40 }, { pos: [0.3, 1.5, 3.8], target: [0, 1.35, 0.8], fov: 40 })}>
        <Valley /><Tower p={TOWER} />
        <TownSign p={[1.0, 0, 1.0]} pop={pop(f, W(19) - 3, 7)} />
        <Nico f={f} p={[-0.6, 0, 1.2]} ry={0.3} face={nicoFace(f, [[s, "smile"], [W(26), "surprised"]])} pose={{ ...idle(f), armR: [0, 0, kf(f, [[W(19) - 6, 0.14], [W(19) - 1, 1.3]])] }} />
        <Snow frame={f} area={8} />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(26) - 2} text="~270 PEOPLE" size={110} y={0.1} rot={-3} />,
  },
  // "Inside the tower, there's the police station, the post office, a clinic, a little grocery store… and a church."
  {
    name: "04 corredor com tudo", from: C(30), to: C(49),
    render: (f, s, e) => {
      const at = [W(35), W(38), W(41), W(44), W(48)];
      const pops = at.map((a) => pop(f, a - 3, 7));
      const z = kf(f, [[s, 6.5], [e, -3.0]]);
      return (
        <Scene bg="#e8dcc0" light={LIGHT_INSIDE} cam={{ pos: [0.0, 1.8, z + 2.2], target: [0, 1.9, z - 2.5], fov: 54 }}>
          <Hallway pops={pops} />
          <Nico f={f} p={[0.2, 0, z - 0.4]} ry={Math.PI} face={nicoFace(f, [[s, "smile"]])} pose={walkPose(f)} />
        </Scene>
      );
    },
  },
  // "The kids don't even go outside to get to school. There's a tunnel straight to it."
  {
    name: "05 tunel da escola", from: C(49), to: C(65),
    render: (f, s, e) => {
      const z = kf(f, [[s, 2.5], [e, -3.5]]);
      return (
        <Scene bg="#2a2a30" light={LIGHT_INSIDE} cam={glide(f, s, e, { pos: [0.6, 1.3, 6.0], target: [0, 1.0, 0], fov: 46 }, { pos: [0.4, 1.3, 2.0], target: [0, 1.0, -5], fov: 46 })}>
          <SchoolTunnel frame={f} lights={kf(f, [[W(61) - 4, 0.3], [W(61), 1.2]])} />
          {[[-0.5, 0], [0.5, 0.4], [0, 0.9]].map(([x, dz], i) => (
            <Toon key={i} kind="bia" position={[x, 0, z + dz]} rotationY={Math.PI} scale={0.7} face={kidFace(f, "happy", i + 2)} pose={walkPose(f + i * 6)} />
          ))}
          <Nico f={f} p={[0.9, 0, z + 1.5]} ry={Math.PI + 0.2} face={nicoFace(f, [[s, "smile"]])} pose={walkPose(f + 3)} />
        </Scene>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(61) - 2} text="SECRET TUNNEL" color="#2c6fb6" size={96} y={0.1} rot={-4} />,
  },
  // "Why? The tower was built for the army in the 1950s,"
  {
    name: "06a exercito anos 50", from: C(65), to: C(76),
    render: (f, s, e) => {
      const build = kf(f, [[s + 10, 0.35], [e, 1]]);
      return (
        <Scene bg="#e8c89a" light={LIGHT_SEPIA} cam={glide(f, s, e, { pos: [4, 3, 9], target: [0, 2.5, -2], fov: 40 }, { pos: [2.5, 2.5, 7.5], target: [0, 2.8, -2], fov: 40 })}>
          <Valley sepia /><Tower p={TOWER} sepia build={build} />
          <Toon kind="general" position={[1.8, 0, 1.0]} rotationY={-0.4} face={{ expr: "smug", eyes: "big", blink: blinkAt(f, 4, 80) }} pose={{ ...idle(f), armR: [0, 0, 1.4] }} />
          <Nico f={f} p={[-1.6, 0, 1.4]} ry={0.4} face={nicoFace(f, [[s, "worried"], [W(69), "surprised"]])} />
        </Scene>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(72) - 2} text="U.S. ARMY" color="#4e5a30" size={100} y={0.1} rot={-4} />
      {f >= W(75) - 2 && <Stamp f={f} at={W(75) - 2} text="1950s" box={false} size={170} y={0.22} rot={4} />}
    </>,
  },
  // "...and winters here are brutal: snow, wind and storms."
  {
    name: "06b nevasca", from: C(76), to: C(85),
    render: (f, s, e) => (
      <Scene bg="#8a98b0" light={LIGHT_STORM} cam={glide(f, s, e, { pos: [1.2, 1.6, 4.2], target: [0, 1.6, 0.6], fov: 42 }, { pos: [0.6, 1.5, 3.4], target: [0, 1.6, 0.6], fov: 40, roll: 0.04 })}>
        <Valley /><Tower p={TOWER} />
        <Nico f={f} p={[0, 0, 1.0]} ry={0.2} face={nicoFace(f, [[s, "worried"]], { sweat: true })} pose={{ ...idle(f), lean: 0.25 + Math.sin(f * 0.6) * 0.04, armL: [-0.6, 0, -0.9], armR: [-0.6, 0, 0.9], head: [0.25, 0, 0] }} />
        <Snow frame={f} n={160} wind={kf(f, [[W(81), 0.4], [W(84), 1.4]])} area={8} />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(80) - 2} text="BRUTAL WINTERS" color="#2c6fb6" size={92} y={0.1} rot={-4} />,
  },
  // "And the only road into town goes through a one-lane tunnel… shared with a train."
  {
    name: "07 tunel com trem", from: C(85), to: C(100),
    render: (f, s, e) => {
      const tz = kf(f, [[W(96) - 12, 9], [e, -1]]);
      return (
        <Scene cam={glide(f, s, e, { pos: [4.5, 3.2, 10], target: [0, 1.4, 1], fov: 40 }, { pos: [3.0, 2.2, 8.0], target: [0, 1.2, 1.5], fov: 40 })}>
          <Valley /><RoadTunnel lamp={f >= W(96) - 12 ? "red" : "green"} />
          <Train z={tz} />
          <Car p={[0, 0, 7.5]} c="#c62a2a" />
        </Scene>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(94) - 2} text="ONE LANE" size={110} y={0.1} rot={-4} />
      {f >= W(99) - 2 && <Stamp f={f} at={W(99) - 2} text="+ A TRAIN" color="#2c6fb6" size={96} y={0.22} rot={4} />}
    </>,
  },
  // "At night, the tunnel closes."
  {
    name: "08 noite fecha", from: C(100), to: C(105),
    render: (f, s, e) => (
      <Scene bg="#1c2a48" light={LIGHT_NIGHT} cam={glide(f, s, e, { pos: [2.5, 1.8, 7.0], target: [0, 1.1, 1.5], fov: 40 }, { pos: [1.8, 1.5, 5.6], target: [0, 1.0, 1.8], fov: 38 })}>
        <Valley night /><RoadTunnel night gate={kf(f, [[W(104) - 6, 0], [W(104) + 2, 1]])} lamp="red" />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(104) - 2} text="CLOSED" size={140} y={0.1} rot={-6} />,
  },
  // "Miss the last car, and you're not going home."
  {
    name: "09 perdeu o ultimo", from: C(105), to: C(114),
    render: (f, s, e) => (
      <Scene bg="#1c2a48" light={LIGHT_NIGHT} cam={glide(f, s, e, { pos: [-0.6, 1.9, 7.6], target: [-0.3, 1.3, 3.0], fov: 40 }, { pos: [-0.9, 1.8, 6.6], target: [-0.5, 1.4, 3.2], fov: 38 })}>
        <Valley night /><RoadTunnel night gate={1} lamp="red" />
        <Car p={[0.4, 0, 3.6]} c="#c62a2a" lights />
        <Nico f={f} p={[-0.7, 0, 4.0]} ry={0.25} face={nicoFace(f, [[s, "worried"], [W(111), "sad"]])} pose={{ ...idle(f), head: [0.3, 0, 0], armL: [-0.3, 0, -0.5], armR: [-0.3, 0, 0.5] }} />
        <Snow frame={f} area={8} />
      </Scene>
    ),
  },
  // "So the whole town lives like neighbors in one giant apartment."
  {
    name: "10 torre acesa a noite", from: C(114), to: C(125),
    render: (f, s, e) => (
      <Scene bg="#1c2a48" light={LIGHT_NIGHT} cam={glide(f, s, e, { pos: [3.5, 2.0, 8.5], target: [0, 2.8, -2], fov: 42 }, { pos: [1.8, 1.6, 6.5], target: [0, 2.6, -2], fov: 42 })}>
        <Valley night /><Tower p={TOWER} lit={1} />
        <Nico f={f} p={[0.8, 0, 2.2]} ry={-0.2} face={nicoFace(f, [[s, "smile"], [W(123), "happy"]], { blush: true })} />
        <Snow frame={f} area={10} />
      </Scene>
    ),
    overlay: (f) => <Stamp f={f} at={W(123) - 2} text="1 GIANT APARTMENT" color="#e07b39" size={84} y={0.1} rot={-3} />,
  },
  // "Could you live in a town inside one building? Tell me in the comments."
  {
    name: "11 pergunta final", from: C(125), to: TOTAL,
    render: (f, s, e) => {
      const wave: V3 = [-0.2, 0, 2.5 + Math.sin(f * 0.5) * 0.25];
      return (
        <Scene bg="#1c2a48" light={LIGHT_NIGHT} cam={glide(f, s, e, { pos: [0.9, 1.8, 4.2], target: [0.3, 1.6, 1.4], fov: 38 }, { pos: [0.7, 1.75, 3.6], target: [0.3, 1.65, 1.4], fov: 36 })}>
          <Valley night /><Tower p={TOWER} lit={1} />
          <Nico f={f} p={[0.3, 0, 1.6]} ry={0.1} face={nicoFace(f, [[s, "smile"], [W(134), "happy"]])} pose={{ ...idle(f), armR: f >= W(134) - 3 ? wave : [0, 0, 0.14] }} />
          <Snow frame={f} area={8} />
        </Scene>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(134) - 2} text="COMMENT!" size={110} y={0.1} rot={-4} />,
  },
];
