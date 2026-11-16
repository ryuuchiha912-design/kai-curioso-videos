import React from "react";
import { AbsoluteFill } from "remotion";
import data from "../data/javelin-en-timeline.json";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, clamp01, FPS, kf, kf3, pop } from "../kit/anim";
import { Stamp, nicoFace } from "../short8/shots";
import { Arc, Blueprint, Board, CGMark, flight, Ice, JUDGES, Javelin, LIGHT_ROOM, LIGHT_STADIUM, MODERNS, Runner, SoccerOutline, Stadium, Trail, TRACK_X0 } from "./cena";

/** Short (inglês) "This throw was so far they had to change the javelin" — canal Nico Explains, tudo em 3D. */
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
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;
const ff = (f: number, expr: ToonExpr, seed: number, extra: Partial<ToonFace> = {}): ToonFace => ({ expr, blink: blinkAt(f, seed, 80), eyes: "big", ...extra });
const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.09 + seed)) * 0.012,
  head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.035 + seed) * 0.1, Math.sin(f * 0.045 + seed) * 0.04],
  armL: [Math.sin(f * 0.07 + seed) * 0.05, 0, -0.14], armR: [-Math.sin(f * 0.07 + seed) * 0.05, 0, 0.14],
});
const Sky: React.FC<{ cam: Cam; f: number; mood?: "cheer" | "still" | "shock"; hundred?: boolean; bg?: string; crowd?: boolean; children?: React.ReactNode }> = ({ cam, f, mood, hundred, bg = "#bfe3f5", crowd = true, children }) => (
  <Stage flat cam={cam} background={bg} lights={LIGHT_STADIUM} fg={<Cel><Stadium f={f} mood={mood} hundred={hundred} crowd={crowd} />{children}</Cel>} />
);

// ---------------------------------------------------------------- o lançador (Nico como Uwe Hohn)
const CARRY: V3 = [0.4, 0, 2.2], DRAW: V3 = [1.5, 0, 0.9], RELEASE: V3 = [-2.6, 0, 0.3], FOLLOW: V3 = [-1.4, 0, 0.2];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** Corrida + lançamento. `rel` = quadro em que o dardo sai da mão. Retorna o nó e a posição x do lançador. */
const thrower = (f: number, start: number, rel: number, face: ToonFace, runLen = 14): { node: React.ReactNode; x: number } => {
  const k = clamp01((f - start) / Math.max(1, rel - start));
  const x = -runLen + runLen * (1 - (1 - k) * (1 - k) * 0.35 - 0.65 * (1 - k)) ;
  const a = f * 0.55; const running = f < rel + 4;
  let arm: V3 = CARRY, tilt = -0.25, lean = 0.15, twist = 0;
  if (f >= rel - 12 && f < rel - 3) { const q = (f - (rel - 12)) / 9; arm = lerp3(CARRY, DRAW, q); tilt = -0.25 - 0.1 * q; twist = -0.45 * q; lean = 0.05; }
  else if (f >= rel - 3 && f < rel) { const q = (f - (rel - 3)) / 3; arm = lerp3(DRAW, RELEASE, q); tilt = -0.5; twist = -0.45 + 0.6 * q; lean = 0.3; }
  else if (f >= rel) { const q = clamp01((f - rel) / 8); arm = lerp3(RELEASE, FOLLOW, q); lean = 0.45; twist = 0.15; }
  const pose: Pose = {
    lean, twist,
    legL: running ? Math.sin(a) * 0.8 : 0.5, legR: running ? -Math.sin(a) * 0.8 : -0.4,
    armL: f >= rel - 12 ? [-1.2, 0, -0.3] : [-Math.sin(a) * 0.6, 0, -0.25], armR: arm,
    bob: running ? Math.abs(Math.sin(a)) * 0.06 : 0, head: [-0.1, 0, 0],
  };
  const node = <Toon kind="nico" position={[x, 0, 0]} rotationY={Math.PI / 2} face={face} pose={pose}
    holdR={f < rel ? held(arm, <Javelin rot={[tilt, -Math.PI / 2, 0]} s={0.95} />) : undefined} />;
  return { node, x };
};
/** Dardo voando na trajetória (u de 0 a 1). */
const flyingJavelin = (u: number, dist = 104.8, peak = 26, dive = false) => {
  const { p, a } = flight(u, dist, peak);
  const ang = dive ? a - 0.35 * u * u : a;
  const trail: V3[] = [];
  for (let i = 6; i >= 0; i--) { const uu = Math.max(0, u - i * 0.012); trail.push(flight(uu, dist, peak).p); }
  return { p, node: <>{u < 1 && <Trail pts={trail} />}<Javelin p={p} rot={[0, 0, u >= 1 ? -0.55 : ang]} s={1.6} /></> };
};
const REL = W(39) - 2, LAND = W(45) - 4;
const uAt = (f: number) => clamp01((f - REL) / (LAND - REL));
const meterCounter = (f: number, from: number) => {
  if (f < from) return null;
  const u = uAt(f), m = u >= 1 ? "104.80" : String(Math.floor(104.8 * u));
  const hot = 104.8 * u >= 100;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: "34%", pointerEvents: "none" }}>
      <div style={{ fontFamily: "'Lilita One', 'Arial Black', sans-serif", fontSize: u >= 1 ? 190 : 170, color: hot ? "#ffd23f" : "#ffffff", WebkitTextStroke: "16px #1b0f08", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,.5)", transform: `scale(${1 + (u >= 1 ? 0.12 * Math.max(0, 1 - (f - LAND) / 8) : 0)})` }}>{m} m</div>
    </AbsoluteFill>
  );
};

export const SHOTS: Shot[] = [
  // "This throw was so far… they had to change the javelin."  — gancho: o dardo já voando por cima do estádio
  {
    name: "01 gancho: dardo voando", from: 0, to: C(11),
    render: (f, s, e) => {
      const u = kf(f, [[s, 0.3], [e, 0.82]], (x) => x);
      const { p, node } = flyingJavelin(u);
      return (
        <Sky f={f} cam={{ pos: add(p, [-3.4, 0.9, 4.0]), target: add(p, [1.2, -0.6, 0]), fov: 50, roll: 0.06 }}>{node}</Sky>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={-20} text="TOO FAR?!" box={false} size={150} y={0.07} rot={-4} />
      {f >= W(4) - 2 && <Stamp f={f} at={W(4) - 2} text="104.80 m" color="#d62a1e" size={120} y={0.2} rot={4} />}
      {f >= W(8) - 2 && <Stamp f={f} at={W(8) - 2} text="CHANGED IT" color="#1e5aa8" size={96} y={0.33} rot={-3} />}
    </>,
  },
  // "July 1984, East Berlin. A twenty-two-year-old named Uwe Hohn picks up a javelin."
  {
    name: "02 1984 estádio", from: C(11), to: C(23),
    render: (f, s, e) => (
      <Sky f={f} cam={glide(f, s, e, { pos: [40, 30, 50], target: [20, 0, 0], fov: 50 }, { pos: [-10.5, 1.8, 4.5], target: [-14, 1.3, 0], fov: 42 })}>
        <Toon kind="nico" position={[-14, 0, 0]} rotationY={Math.PI / 2 - 0.5} face={nicoFace(f, [[s, "neutral"], [W(19), "smug"]])} pose={{ ...idle(f), armR: CARRY, armL: [-0.3, 0, -0.3] }}
          holdR={held(CARRY, <Javelin rot={[-0.25, -Math.PI / 2, 0]} s={0.95} />)} />
      </Sky>
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(11) - 2} text="1984" box={false} size={180} y={0.07} rot={-4} />
      {f >= W(12) - 2 && <Stamp f={f} at={W(12) - 2} text="EAST BERLIN" color="#2c6fb6" size={84} y={0.22} rot={4} />}
      {f >= W(17) - 2 && <Stamp f={f} at={W(17) - 2} text="UWE HOHN, 22" color="#d62a1e" size={90} y={0.33} rot={-3} />}
    </>,
  },
  // "Nobody had ever thrown one hundred meters. That's longer than a soccer field."
  {
    name: "03 100 m vista de cima", from: C(23), to: C(36),
    render: (f, s, e) => (
      <Sky f={f} hundred cam={glide(f, s, e, { pos: [52, 150, 0.1], target: [52, 0, 0], fov: 52, roll: Math.PI / 2 }, { pos: [52, 130, 0.1], target: [52, 0, 0], fov: 52, roll: Math.PI / 2 + 0.05 })}>
        <SoccerOutline k={kf(f, [[W(33) - 3, 0], [W(33) + 6, 1]])} />
      </Sky>
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(27) - 2} text="100 m" box={false} size={170} y={0.07} rot={-3} />
      {f >= W(23) - 2 && <Stamp f={f} at={W(23) - 2} text="NEVER" color="#d62a1e" size={90} y={0.21} rot={4} />}
      {f >= W(34) - 2 && <Stamp f={f} at={W(34) - 2} text="> SOCCER FIELD" color="#1e8a4a" size={78} y={0.31} rot={-3} />}
    </>,
  },
  // "He runs. He throws."
  {
    name: "04 corrida e lançamento", from: C(36), to: C(40),
    render: (f, s, e) => {
      const T = thrower(f, s - 20, REL, nicoFace(f, [[s, "neutral"], [REL - 8, "smug"]]));
      const fly = f >= REL ? flyingJavelin(uAt(f)) : null;
      return (
        <Sky f={f} cam={{ pos: [T.x - 1.0, 1.3, 5.5], target: [T.x + 1.2, 1.3, 0], fov: 46 }}>{T.node}{fly?.node}</Sky>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(37) - 2} text="RUN" box={false} size={150} y={0.08} rot={-4} />
      {f >= W(39) - 2 && <Stamp f={f} at={W(39) - 2} text="THROW!" color="#d62a1e" size={120} y={0.22} rot={5} />}
    </>,
  },
  // "And it just… keeps… going."  — câmera persegue o dardo, contador de metros subindo
  {
    name: "05 continua voando", from: C(40), to: C(45),
    render: (f, s, e) => {
      const { p, node } = flyingJavelin(uAt(f));
      return <Sky f={f} cam={{ pos: add(p, [-3.6, 0.7, 4.2]), target: add(p, [1.5, -1.0, -0.5]), fov: 52, roll: -0.05 }}>{node}</Sky>;
    },
    overlay: (f) => meterCounter(f, 0),
  },
  // "One hundred and four point eight meters."
  {
    name: "06 cravou: 104.80", from: C(45), to: C(52),
    render: (f, s, e) => {
      const { node } = flyingJavelin(uAt(f));
      return <Sky f={f} cam={glide(f, s, e, { pos: [99, 1.2, 6], target: [104.8, 1.0, 0], fov: 46 }, { pos: [100.5, 1.6, 5], target: [105.5, 1.2, 0], fov: 42 })}>{node}</Sky>;
    },
    overlay: (f) => <>{meterCounter(f, 0)}<Stamp f={f} at={W(45) - 2} text="WORLD RECORD" color="#1e8a4a" size={90} y={0.08} rot={-3} /></>,
  },
  // "The crowd went silent."
  {
    name: "07 torcida em silêncio", from: C(52), to: C(56),
    render: (f, s, e) => (
      <Sky f={f} mood="shock" cam={glide(f, s, e, { pos: [100, 5, -12], target: [TRACK_X0 + 17, 4.5, -4], fov: 44 }, { pos: [101.5, 5.2, -11], target: [TRACK_X0 + 17, 4.5, -4], fov: 40 })}>
        {flyingJavelin(1).node}
      </Sky>
    ),
    overlay: (f) => <Stamp f={f} at={W(54) - 2} text="SILENCE..." box={false} size={130} y={0.08} rot={-3} />,
  },
  // "It almost flew right onto the running track."
  {
    name: "08 quase na pista", from: C(56), to: C(64),
    render: (f, s, e) => (
      <Sky f={f} mood="shock" cam={glide(f, s, e, { pos: [96, 9, 10], target: [107, 0, 0], fov: 46 }, { pos: [99, 6, 8], target: [107, 0.5, 0], fov: 44 })}>
        {flyingJavelin(1).node}
        {[0, 1, 2].map((i) => <Runner key={i} p={[TRACK_X0 + 1.2 + i * 2.4, 0, 18 - ((f - s) * (0.18 + i * 0.02)) % 40]} ry={Math.PI} f={f + i * 5} v={i} face={ff(f, i === 1 ? "surprised" : "neutral", i)} />)}
        <mesh position={[106.4, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.2, 1.6, 32]} /><meshBasicMaterial color="#ff3b30" /></mesh>
      </Sky>
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(57) - 2} text="ALMOST..." box={false} size={130} y={0.07} rot={-4} />
      {f >= W(62) - 2 && <Stamp f={f} at={W(62) - 2} text="ON THE TRACK!" color="#d62a1e" size={92} y={0.2} rot={4} />}
    </>,
  },
  // "And old javelins often landed flat, so judges couldn't even tell where they hit."
  {
    name: "09 caiu deitado, juízes", from: C(64), to: C(78),
    render: (f, s, e) => {
      const land = W(68), u = clamp01((f - (land - 12)) / 12);
      const jx = 58 + u * 4, jy = 3 * (1 - u) + 0.08, slide = f > land ? Math.min(1.5, (f - land) * 0.08) : 0;
      return (
        <Sky f={f} cam={glide(f, s, e, { pos: [57, 2.0, 7], target: [61, 0.6, 0], fov: 46 }, { pos: [58.5, 1.8, 5.8], target: [61.5, 0.9, 0], fov: 42 })}>
          <Javelin p={[jx + slide, jy, 0]} rot={[0, 0, u >= 1 ? 0.02 : -0.12]} s={1.6} />
          {JUDGES.map((j, i) => <Toon key={i} kind="extra" look={j.look} style={j.style} position={[60 + i * 3.2, 0, -1.6]} rotationY={i ? -0.6 : 0.6} face={ff(f + i * 7, f > W(72) ? "worried" : "surprised", i + 3)}
            pose={{ ...idle(f, i), armR: f > W(72) ? [-1.3, 0, 0.3 + Math.sin(f * 0.4 + i) * 0.3] : [0, 0, 0.14], head: [0, Math.sin(f * 0.2 + i) * 0.4, 0] }} />)}
        </Sky>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(69) - 2} text="FLAT?!" box={false} size={150} y={0.07} rot={-4} />
      {f >= W(75) - 2 && <Stamp f={f} at={W(75) - 2} text="WHERE DID IT HIT?" color="#d62a1e" size={76} y={0.2} rot={3} />}
    </>,
  },
  // "But here's the crazy part."
  {
    name: "10 a parte maluca", from: C(78), to: C(83),
    render: (f, s, e) => (
      <Sky f={f} cam={glide(f, s, e, { pos: [-12.5, 1.5, 4.5], target: [-14, 1.35, 0], fov: 40 }, { pos: [-13.4, 1.4, 2.2], target: [-14, 1.35, 0], fov: 34 })}>
        <Toon kind="nico" position={[-14, 0, 0]} rotationY={0.3} face={nicoFace(f, [[s, "smug"]], { look: [0.3, 0] })} pose={{ ...idle(f), armR: [-0.4, 0, 0.6] }} />
      </Sky>
    ),
    overlay: (f) => <Stamp f={f} at={W(81) - 2} text="THE CRAZY PART" color="#d62a1e" size={92} y={0.08} rot={-3} />,
  },
  // "Instead of building bigger stadiums, they changed the javelin itself."
  {
    name: "11 estádio maior? não: mudam o dardo", from: C(83), to: C(93),
    render: (f, s, e) => {
      if (f < W(88)) {
        return <Sky f={f} cam={glide(f, s, W(88), { pos: [50, 90, 80], target: [55, 0, 0], fov: 50 }, { pos: [50, 110, 100], target: [55, 0, 0], fov: 52 })} />;
      }
      return (
        <Stage flat background="#1d2a44" lights={LIGHT_ROOM} cam={glide(f, W(88), e, { pos: [0, 0.4, 3.2], target: [0, 0, 0], fov: 38 }, { pos: [0, 0.3, 2.6], target: [0, 0, 0], fov: 36 })} fg={
          <Cel><Javelin rot={[0.2, (f - W(88)) * 0.05, -0.1]} s={1.2} glow /></Cel>} />
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(85) - 2} text="BIGGER STADIUMS?" box={false} size={92} y={0.07} rot={-3} />
      {f >= W(88) - 2 && <Stamp f={f} at={W(88) - 2} text="NOPE." color="#d62a1e" size={110} y={0.2} rot={5} />}
      {f >= W(91) - 2 && <Stamp f={f} at={W(91) - 2} text="CHANGE THE JAVELIN" color="#1e5aa8" size={74} y={0.32} rot={-3} />}
    </>,
  },
  // "In 1986, they moved its center of gravity four centimeters forward."
  {
    name: "12 1986 centro de gravidade", from: C(93), to: C(103),
    render: (f, s, e) => {
      const cg = kf(f, [[W(100) - 2, 0], [W(102), 0.55]]);
      return (
        <Stage flat background="#24364f" lights={LIGHT_ROOM} cam={glide(f, s, e, { pos: [0.2, 3.4, 1.6], target: [0.2, 0, 0], fov: 46 }, { pos: [0.3, 2.9, 1.2], target: [0.3, 0, 0], fov: 44 })} fg={
          <Cel>
            <Blueprint p={[0, 0, 0]} />
            <Javelin p={[0, 0.06, 0]} s={1.25} old />
            {f >= W(97) - 2 && <CGMark p={[0.06 + cg, 0.16, 0]} s={pop(f, W(97) - 2, 6)} />}
            {f >= W(100) && <CGMark p={[0.06, 0.16, 0]} c="#ffffff" s={0.6} />}
          </Cel>} />
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(93) - 2} text="1986" box={false} size={170} y={0.07} rot={-4} />
      {f >= W(97) - 2 && <Stamp f={f} at={W(97) - 2} text="CENTER OF GRAVITY" color="#d62a1e" size={70} y={0.2} rot={3} />}
      {f >= W(100) - 2 && <Stamp f={f} at={W(100) - 2} text="+4 cm FORWARD" color="#1e8a4a" size={84} y={0.3} rot={-3} />}
    </>,
  },
  // "Now the tip drops sooner and stabs into the ground. It flies about ten percent shorter."
  {
    name: "13 nova trajetória", from: C(103), to: C(119),
    render: (f, s, e) => {
      const u = clamp01((f - (s + 6)) / (W(110) - (s + 6)));
      const { node } = flyingJavelin(u, 94, 22, true);
      return (
        <Sky f={f} crowd={false} cam={glide(f, s, e, { pos: [48, 14, 52], target: [50, 11, 0], fov: 58 }, { pos: [62, 10, 46], target: [70, 8, 0], fov: 56 })}>
          <Arc dist={104.8} peak={26} c="#ffd23f" z={-2} />
          <Arc dist={94} peak={22} c="#ffffff" upto={u} dive />
          {node}
        </Sky>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(105) - 2} text="TIP DOWN" color="#d62a1e" size={96} y={0.07} rot={-3} />
      {f >= W(109) - 2 && <Stamp f={f} at={W(109) - 2} text="STABS IN" color="#1e5aa8" size={90} y={0.19} rot={4} />}
      {f >= W(116) - 2 && <Stamp f={f} at={W(116) - 2} text="-10%" box={false} size={190} y={0.29} rot={-4} />}
    </>,
  },
  // "So Uwe Hohn's record was frozen. Forever."
  {
    name: "14 recorde congelado", from: C(119), to: C(126),
    render: (f, s, e) => (
      <Stage flat background="#0f1a2b" lights={LIGHT_ROOM} cam={glide(f, s, e, { pos: [0, 0.2, 5.4], target: [0, 0, 0], fov: 40 }, { pos: [0, 0.2, 4.6], target: [0, 0, 0], fov: 38 })} fg={
        <Cel>
          <Board p={[0, 0, 0]} k="old" lines={[["WORLD RECORD", 46, "#ffe9a8"], ["104.80 m", 100, "#ffffff"], ["U. HOHN · 1984", 42, "#ffd23f"]]} />
          <Ice p={[0, -1.25, 0.3]} s={[3.8, 2.6, 0.5]} k={kf(f, [[W(123) - 4, 0], [W(124) + 4, 1]])} />
        </Cel>} />
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(124) - 2} text="FROZEN" color="#2c8fd6" size={130} y={0.07} rot={-4} />
      {f >= W(125) - 2 && <Stamp f={f} at={W(125) - 2} text="FOREVER" box={false} size={140} y={0.2} rot={4} />}
    </>,
  },
  // "Today's world record with the new javelin? Ninety-eight point four eight."
  {
    name: "15 recorde de hoje", from: C(126), to: C(137),
    render: (f, s, e) => (
      <Stage flat background="#122033" lights={LIGHT_ROOM} cam={glide(f, s, e, { pos: [0.6, 0.2, 5.2], target: [0, 0, 0], fov: 40 }, { pos: [0.2, 0.2, 4.4], target: [0, 0, 0], fov: 38 })} fg={
        <Cel>
          <Board p={[0, 0, 0]} k="new" bg="#1f3a2a" lines={[["NEW JAVELIN RECORD", 40, "#ffe9a8"], [f >= W(133) - 2 ? "98.48 m" : "??.?? m", 100, "#7dff9a"], ["J. ZELEZNY · 1996", 40, "#ffd23f"]]} />
        </Cel>} />
    ),
    overlay: (f) => <>
      <Stamp f={f} at={W(126) - 2} text="TODAY" box={false} size={150} y={0.07} rot={-3} />
      {f >= W(133) - 2 && <Stamp f={f} at={W(133) - 2} text="98.48 m" color="#1e8a4a" size={110} y={0.2} rot={4} />}
    </>,
  },
  // "Forty years later, nobody has even reached one hundred again."
  {
    name: "16 ninguém chega a 100", from: C(137), to: C(147),
    render: (f, s, e) => {
      const tries = [s + 4, s + 30, s + 56];
      return (
        <Sky f={f} hundred cam={glide(f, s, e, { pos: [70, 16, 40], target: [88, 0, 0], fov: 46 }, { pos: [78, 12, 32], target: [94, 0, 0], fov: 44 })}>
          {tries.map((t0, i) => {
            if (f < t0) return null;
            const u = clamp01((f - t0) / 40), d = [91, 94, 97][i];
            const { node } = flyingJavelin(u, d, 20, true);
            return <group key={i} position={[0, 0, (i - 1) * 2.2]}>{node}</group>;
          })}
        </Sky>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(137) - 2} text="40 YEARS" box={false} size={150} y={0.07} rot={-3} />
      {f >= W(140) - 2 && <Stamp f={f} at={W(140) - 2} text="NOBODY" color="#d62a1e" size={110} y={0.2} rot={4} />}
      {f >= W(144) - 2 && <Stamp f={f} at={W(144) - 2} text="NOT EVEN 100" color="#1e5aa8" size={84} y={0.31} rot={-3} />}
    </>,
  },
  // "All because one man threw it so far…"  — fecha em loop com o começo
  {
    name: "17 loop: ele lança de novo", from: C(147), to: TOTAL,
    render: (f, s, e) => {
      const rel = Math.round(TOTAL * FPS) - 10;
      const T = thrower(f, s - 30, rel, nicoFace(f, [[s, "smug"]]));
      const fly = f >= rel ? flyingJavelin(clamp01((f - rel) / 40) * 0.3) : null;
      return <Sky f={f} cam={{ pos: [T.x - 3.5, 1.1, 4.8], target: [T.x + 2, 2.0, 0], fov: 46, roll: 0.04 }}>{T.node}{fly?.node}</Sky>;
    },
    overlay: (f) => <Stamp f={f} at={W(149) - 2} text="ONE MAN" box={false} size={150} y={0.07} rot={-4} />,
  },
];
