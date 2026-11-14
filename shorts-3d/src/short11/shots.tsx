import React from "react";
import data from "../data/bike-en-timeline.json";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, FPS, kf, kf3, pop } from "../kit/anim";
import { Stamp, nicoFace } from "../short8/shots";
import { LIGHT_ROOM, LIGHT_VELO, LyingBike, LyingRider, MeetingRoom, OFFICIALS, Paper, RecordBoard, RIDERS, Stopwatch, UprightRider, Velodrome, Wind } from "./cena";

/** Short (inglês) "This bike was so fast they BANNED it" — canal Nico Explains, tudo em 3D. */
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
const ff = (f: number, expr: ToonExpr, seed: number, extra: Partial<ToonFace> = {}): ToonFace => ({ expr, blink: blinkAt(f, seed, 80), eyes: "big", ...extra });
const Velo: React.FC<{ cam: Cam; f: number; laugh?: boolean; modern?: boolean; bg?: string; children: React.ReactNode }> = ({ cam, f, laugh, modern, bg = "#e8d2b0", children }) => (
  <Stage flat cam={cam} background={bg} lights={LIGHT_VELO} fg={<Cel><Velodrome f={f} laugh={laugh} modern={modern} />{children}</Cel>} />
);

export const SHOTS: Shot[] = [
  // "This bike was so fast… they banned it."  — gancho: já começa com ele passando deitado, rápido
  {
    name: "01 gancho deitado voando", from: 0, to: C(8),
    render: (f, s, e) => {
      const z = (f - s) * 0.16 - 3;
      return (
        <Velo f={f} cam={glide(f, s, e, { pos: [1.6, 0.55, z + 3.2], target: [0.3, 0.55, z], fov: 42 }, { pos: [1.3, 0.7, z + 2.4], target: [0.3, 0.6, z], fov: 40, roll: 0.05 })}>
          <LyingRider p={[0.3, 0, z]} f={f} speed={0.8} face={nicoFace(f, [[s, "smug"]], { blush: false })} />
          <UprightRider p={[1.5, 0, z - 3.5 + (f - s) * 0.02]} f={f} v={3} face={ff(f, "surprised", 3, { sweat: true })} c="#3e9b4a" speed={0.6} />
          <group position={[0, 0, z]}><Wind f={f} speed={0.14} y0={0.2} y1={1.0} x={0.3} /></group>
        </Velo>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={-20} text="TOO FAST?!" box={false} size={150} y={0.08} rot={-4} />
      {f >= W(6) - 2 && <Stamp f={f} at={W(6) - 2} text="BANNED" size={130} y={0.22} rot={5} />}
    </>,
  },
  // "In 1933, a French cyclist nobody had heard of showed up to a race… lying down."
  {
    name: "02 velodromo 1933", from: C(8), to: C(23),
    render: (f, s, e) => {
      const z = -8 + (f - s) * 0.03;
      return (
        <Velo f={f} cam={glide(f, s, e, { pos: [3.0, 2.6, 4.0], target: [-1, 1.2, -4], fov: 44 }, { pos: [2.2, 1.4, z + 4.6], target: [0.2, 0.7, z], fov: 40 })}>
          <LyingRider p={[0.3, 0, z]} f={f} speed={0.3} face={nicoFace(f, [[s, "smile"]])} />
          {[0, 1, 2].map((i) => <UprightRider key={i} v={i} p={[1.6 + (i % 2) * 0.9, 0, -2.5 - i * 1.6]} f={f + i * 7} face={ff(f, i === 1 ? "surprised" : "neutral", i + 2)} c={["#c62a2a", "#e0b13a", "#3e9b4a"][i]} speed={0.25} />)}
        </Velo>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(8) - 2} text="1933" box={false} size={180} y={0.08} rot={-4} />
      {f >= W(10) - 2 && <Stamp f={f} at={W(10) - 2} text="FRANCE" color="#2c6fb6" size={90} y={0.22} rot={4} />}
    </>,
  },
  // "His name was Francis Faure, and his bike looked ridiculous: long, low, and he rode it on his back."
  {
    name: "03 a bicicleta estranha", from: C(23), to: C(42),
    render: (f, s, e) => {
      const z = (f - s) * 0.025;
      return (
        <Velo f={f} cam={glide(f, s, e, { pos: [2.9, 1.0, z + 0.4], target: [0.3, 0.65, z - 0.5], fov: 42 }, { pos: [2.5, 0.9, z - 0.2], target: [0.3, 0.65, z - 0.5], fov: 42 })}>
          <LyingRider p={[0.3, 0, z]} f={f} speed={0.25} face={nicoFace(f, [[s, "smile"], [W(32), "smug"]])} />
        </Velo>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(26) - 2} text="FRANCIS FAURE" color="#2c6fb6" size={90} y={0.08} rot={-3} />
      {f >= W(33) - 2 && <Stamp f={f} at={W(33) - 2} text="LONG" size={80} y={0.2} rot={-6} />}
      {f >= W(34) - 2 && <Stamp f={f} at={W(34) - 2} text="LOW" size={80} y={0.28} rot={5} />}
      {f >= W(39) - 2 && <Stamp f={f} at={W(39) - 2} text="ON HIS BACK" size={80} y={0.36} rot={-3} />}
    </>,
  },
  // "The crowd laughed."  — 3 espectadores diferentes rindo e apontando, plateia atrás
  {
    name: "04 plateia ri", from: C(42), to: C(45),
    render: (f, s, e) => {
      const fans = [
        { x: -2.4, z: -0.2, look: { skin: "#f1c7a0", hoodie: "#c62a2a", hoodie2: "#a82222", pants: "#2e3440", hair: "#2a211c" }, style: { hair: "short" as const } },
        { x: -2.65, z: 0.45, look: { skin: "#c88f66", hoodie: "#f2b636", hoodie2: "#d99e26", pants: "#1b1b1f", hair: "#1b1716" }, style: { hair: "curly" as const } },
        { x: -2.35, z: 1.1, look: { skin: "#f5d2b0", hoodie: "#2c6fb6", hoodie2: "#245c98", pants: "#2e3440", hair: "#5a3a22" }, style: { hair: "bald" as const, mustache: true } },
      ];
      return (
        <Velo f={f} laugh cam={glide(f, s, e, { pos: [1.6, 1.75, 0.45], target: [-2.45, 1.35, 0.45], fov: 48 }, { pos: [1.2, 1.8, 0.45], target: [-2.45, 1.4, 0.45], fov: 46, roll: -0.03 })}>
          {fans.map((fa, i) => (
            <Toon key={i} kind="extra" look={fa.look} style={fa.style} position={[fa.x, 0, fa.z]} rotationY={Math.PI / 2 + (1 - i) * 0.25} face={ff(f + i * 9, "happy", i + 4)}
              pose={{ bob: Math.abs(Math.sin(f * 0.8 + i)) * 0.05, head: [-0.2, 0, Math.sin(f * 0.8 + i) * 0.15], lean: -0.1, armL: [-0.3, 0, -0.5], armR: i === 1 ? [-1.4, 0, 0.3] : [-0.3, 0, 0.6] }} />
          ))}
        </Velo>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(44) - 2} text="HAHAHA" box={false} size={150} y={0.08} rot={-6} />,
  },
  // "Then he started winning. He was beating top professional riders. Guys who were way stronger than him."
  {
    name: "05 ultrapassando os profissionais", from: C(45), to: C(62),
    render: (f, s, e) => {
      const base = (f - s) * 0.12;
      const nz = base + kf(f, [[s, -2.5], [e, 2.0]]);
      return (
        <Velo f={f} cam={{ pos: [3.6, 1.3, base + 3.4], target: [0.8, 0.7, base - 0.2], fov: 42 }}>
          <LyingRider p={[0.3, 0, nz]} f={f} speed={0.8} face={nicoFace(f, [[s, "smug"], [W(48), "happy"]])} />
          <UprightRider p={[1.5, 0, base]} f={f} v={1} face={ff(f, "worried", 3, { sweat: true })} c="#c62a2a" speed={0.7} />
          <UprightRider p={[2.5, 0, base - 1.2]} f={f + 5} v={2} face={ff(f, "surprised", 5, { sweat: true })} c="#e0b13a" speed={0.7} />
          <group position={[0, 0, base]}><Wind f={f} speed={0.16} y0={0.2} y1={1.6} x={1.4} /></group>
        </Velo>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(48) - 2} text="WINNING!" color="#1e8a4a" size={110} y={0.08} rot={-4} />
      {f >= W(53) - 2 && <Stamp f={f} at={W(53) - 2} text="vs. THE PROS" size={84} y={0.21} rot={4} />}
    </>,
  },
  // "The secret? Lying down, he cut through the wind. Less air pushing back means more speed from the same legs."
  {
    name: "06 o segredo: vento", from: C(62), to: C(82),
    render: (f, s, e) => {
      const z = (f - s) * 0.06;
      return (
        <Velo f={f} bg="#bfe3f5" cam={glide(f, s, e, { pos: [0.9, 1.0, z + 4.2], target: [0.9, 0.7, z], fov: 40 }, { pos: [0.9, 1.1, z + 3.5], target: [0.9, 0.7, z], fov: 40 })}>
          <LyingRider p={[0.3, 0, z]} f={f} speed={0.5} face={nicoFace(f, [[s, "smile"]])} />
          <UprightRider p={[1.5, 0, z]} f={f} v={0} face={ff(f, "worried", 3, { sweat: true })} c="#c62a2a" speed={0.5} />
          <group position={[0, 0, z]}>
            <Wind f={f} n={10} speed={0.12} y0={0.15} y1={0.75} x={0.3} />
            <Wind f={f + 20} n={22} speed={0.12} y0={0.3} y1={2.0} x={1.5} />
          </group>
        </Velo>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(70) - 2} text="LESS WIND" color="#2c6fb6" size={100} y={0.08} rot={-4} />
      {f >= W(76) - 2 && <Stamp f={f} at={W(76) - 2} text="= MORE SPEED" color="#1e8a4a" size={92} y={0.21} rot={4} />}
    </>,
  },
  // "So he went for the biggest record in cycling: how far can you ride in one hour?"
  {
    name: "07 recorde da hora", from: C(82), to: C(99),
    render: (f, s, e) => {
      const z = (f - s) * 0.1 - 2;
      return (
        <Velo f={f} cam={glide(f, s, e, { pos: [2.4, 1.5, z + 4.5], target: [0.6, 1.3, z + 1.2], fov: 42 }, { pos: [2.0, 1.4, z + 4.0], target: [0.6, 1.3, z + 1.2], fov: 40 })}>
          <LyingRider p={[0.3, 0, z]} f={f} speed={0.7} face={nicoFace(f, [[s, "smile"]])} />
          <Stopwatch p={[1.2, 2.0, z + 1.6]} s={1.1} t={(f - s) / 90} />
        </Velo>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(97) - 2} text="1 HOUR" size={130} y={0.08} rot={-4} />,
  },
  // "That record had stood for nineteen years."
  {
    name: "08 placar antigo", from: C(99), to: C(106),
    render: (f, s, e) => (
      <Velo f={f} cam={glide(f, s, e, { pos: [0.6, 1.8, 3.0], target: [0.2, 1.7, -0.5], fov: 40 }, { pos: [0.5, 1.8, 2.5], target: [0.2, 1.7, -0.5], fov: 38 })}>
        <RecordBoard p={[0.2, 1.8, -0.6]} mode="old" />
      </Velo>
    ),
    overlay: (f) => <Stamp f={f} at={W(104) - 2} text="19 YEARS" size={120} y={0.08} rot={-4} />,
  },
  // "Faure smashed it."
  {
    name: "09 quebrou o recorde", from: C(106), to: C(109),
    render: (f, s, e) => (
      <Velo f={f} laugh cam={glide(f, s, e, { pos: [0.9, 1.6, 3.6], target: [0.3, 1.4, -0.4], fov: 42 }, { pos: [0.7, 1.6, 3.2], target: [0.3, 1.4, -0.4], fov: 40, roll: 0.04 })}>
        <RecordBoard p={[-0.4, 1.9, -0.8]} mode="new" s={0.9} />
        <Toon kind="nico" position={[0.9, 0, 0.4]} rotationY={-0.3} face={nicoFace(f, [[s, "happy"]])} pose={{ ...idle(f), armL: [-0.2, 0, -2.5], armR: [-0.2, 0, 2.5], bob: Math.abs(Math.sin(f * 0.5)) * 0.08 }} />
      </Velo>
    ),
    overlay: (f) => <Stamp f={f} at={W(107) - 2} text="SMASHED!" color="#1e8a4a" size={130} y={0.08} rot={-5} />,
  },
  // "So the people who ran cycling held a meeting… and decided his bike wasn't a bicycle anymore."
  {
    name: "10 reuniao: nao e bicicleta", from: C(109), to: C(126),
    render: (f, s, e) => (
      <Stage flat background="#c9b48a" lights={LIGHT_ROOM} cam={glide(f, s, e, { pos: [0, 2.4, 3.4], target: [0, 1.2, -0.6], fov: 42 }, { pos: [0, 2.2, 1.0], target: [0, 1.0, -0.5], fov: 38 })} fg={
        <Cel>
          <MeetingRoom />
          {[-1.1, 0, 1.1].map((x, i) => <Toon key={i} kind="extra" look={OFFICIALS[i].look} style={OFFICIALS[i].style} position={[x, 0, -1.6]} rotationY={-x * 0.15} face={ff(f, (["worried", "smug", "neutral"] as const)[i], i + 6)} pose={{ ...idle(f, i), armL: [-0.6, 0, -0.2], armR: [-0.6, 0, i === 1 ? 0.2 + kf(f, [[W(119) - 6, 0], [W(119), 0.9]]) : 0.2] }} />)}
          <Paper p={[0, 1.01, -0.4]} stamp={kf(f, [[W(122) - 3, 0], [W(122) + 2, 1]])} />
        </Cel>
      } />
    ),
    overlay: (f) => <Stamp f={f} at={W(123) - 2} text="NOT A BICYCLE" size={96} y={0.08} rot={-4} />,
  },
  // "His record didn't count. His bike was banned from races."
  {
    name: "11 recorde anulado", from: C(126), to: C(136),
    render: (f, s, e) => (
      <Velo f={f} bg="#c9b4a0" cam={glide(f, s, e, { pos: [0.7, 1.7, 3.2], target: [0.1, 1.5, -0.3], fov: 40 }, { pos: [0.4, 1.6, 2.6], target: [0.1, 1.5, -0.3], fov: 38 })}>
        <RecordBoard p={[-0.3, 1.9, -0.8]} mode={f >= W(128) - 2 ? "x" : "new"} s={0.9} />
        <Toon kind="nico" position={[0.8, 0, 0.3]} rotationY={-0.3} face={nicoFace(f, [[s, "surprised"], [W(133), "sad"]])} pose={{ ...idle(f), head: [0.3, 0, 0] }} />
      </Velo>
    ),
    overlay: (f) => <Stamp f={f} at={W(133) - 2} text="BANNED" size={140} y={0.08} rot={-6} />,
  },
  // "And to this day, you will never see a lying-down bike in a pro race."
  {
    name: "12 corridas de hoje", from: C(136), to: C(151),
    render: (f, s, e) => {
      const base = (f - s) * 0.14;
      return (
        <Velo f={f} modern bg="#bfe3f5" cam={glide(f, s, e, { pos: [3.4, 1.6, base + 4.0], target: [0.8, 0.8, base], fov: 42 }, { pos: [3.0, 1.4, base + 3.2], target: [0.8, 0.8, base], fov: 40 })}>
          {[0, 1, 2, 3, 4].map((i) => <UprightRider key={i} v={i + 1} p={[0.4 + (i % 2) * 0.9, 0, base - i * 1.3]} f={f + i * 4} face={ff(f, "neutral", i + 2)} c={["#1b1b1f", "#e0312a", "#2c6fb6", "#f2b636", "#3e9b4a"][i]} speed={0.7} />)}
          <group position={[3.6, 0, base + 0.6]}>
            <Toon kind="nico" position={[0, 0, 0]} rotationY={-1.2} face={nicoFace(f, [[s, "sad"]])} pose={{ ...idle(f), head: [0.15, 0, 0] }} />
          </group>
        </Velo>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(142) - 2} text="NEVER IN PRO RACES" size={78} y={0.08} rot={-3} />,
  },
  // "Was it cheating… or just genius? Tell me in the comments."
  {
    name: "13 pergunta final", from: C(151), to: TOTAL,
    render: (f, s, e) => (
      <Velo f={f} cam={glide(f, s, e, { pos: [1.4, 1.5, 2.6], target: [0.3, 1.2, 0], fov: 40 }, { pos: [1.1, 1.5, 2.1], target: [0.3, 1.25, 0], fov: 38 })}>
        <group position={[-0.5, 0, -0.4]} rotation={[0, 0.6, 0]}><LyingBike spin={0} /></group>
        <Toon kind="nico" position={[0.5, 0, 0.2]} rotationY={-0.2} face={nicoFace(f, [[s, "smug"], [W(157), "happy"]])} pose={{ ...idle(f), armR: f >= W(157) - 3 ? [-0.2, 0, 2.5 + Math.sin(f * 0.5) * 0.25] : [0, 0, 0.14] }} />
      </Velo>
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(153) - 2} text="CHEATING..." color="#d62a1e" size={92} y={0.08} rot={-4} />
      {f >= W(156) - 2 && <Stamp f={f} at={W(156) - 2} text="...OR GENIUS?" color="#1e8a4a" size={92} y={0.2} rot={4} />}
    </>,
  },
];
export const _add = add;
