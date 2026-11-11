import React from "react";
import { interpolate } from "remotion";
import data from "../data/pombo-timeline.json";
import { Cam, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Pose } from "../kit/Character";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { FlatChar, FlatExpr, FlatPose } from "../kit/Flat";
import { blinkAt, FPS, kf, kf3, pop } from "../kit/anim";
import { Stamp, nicoFace } from "../short8/shots";
import { BigComputer, Bomb, Clouds, Folder, Lab, LIGHT_DARK, LIGHT_LAB, LIGHT_SKY, LIGHT_WARM, Pigeon, Screen, Sea, Ship } from "./cena";

/** Short "Os pombos que quase pilotaram bombas" — canal do Nico, estilo cel. */
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
const laugh = (f: number, seed = 0): Pose => ({ bob: Math.abs(Math.sin(f * 0.8 + seed)) * 0.05, head: [-0.2, 0, Math.sin(f * 0.8 + seed) * 0.15], lean: -0.1, armL: [-0.4, 0, -0.6], armR: [-0.4, 0, 0.6] });
const genFace = (f: number, expr: ToonExpr, seed: number): ToonFace => ({ expr, blink: blinkAt(f, seed, 80), eyes: "big" });

// ---------------------------------------------------------------- posições do laboratório
const NICO: V3 = [-0.75, 0, 0.2];
const TABLE_Y = 0.99;
const PIG: V3 = [0.75, TABLE_Y, -0.3];
const SCR: V3 = [1.2, TABLE_Y + 0.45, -0.45];

const LabStage: React.FC<{ cam: Cam; light?: React.ReactNode; bg?: string; children?: React.ReactNode }> = ({ cam, light = LIGHT_LAB, bg = "#c9b98f", children }) => (
  <Stage flat cam={cam} background={bg} lights={light} fg={<Cel><Lab />{children}</Cel>} />
);
const SkyStage: React.FC<{ cam: Cam; bg?: string; light?: React.ReactNode; children?: React.ReactNode }> = ({ cam, bg = "#9fd3ff", light = LIGHT_SKY, children }) => (
  <Stage flat cam={cam} background={bg} lights={light} fg={<Cel>{children}</Cel>} />
);
/** Nico em 2D (palito, cabeção) dentro do cenário 3D. Converte a pose 3D antiga para a pose 2D. */
const Nico: React.FC<{ f: number; face: ToonFace; pose?: Pose; p?: V3; ry?: number; holdR?: React.ReactNode; holdL?: React.ReactNode; flat?: FlatPose }> = ({ f, face, pose, p = NICO, flat }) => {
  const ps = pose ?? idle(f);
  const ang = (a?: V3) => (a ? Math.max(Math.abs(a[2]), Math.abs(a[0]) * 0.9) : 0.15);
  const fp: FlatPose = flat ?? { armL: ang(ps.armL as V3), armR: ang(ps.armR as V3), elbowR: ps.armR && Math.abs((ps.armR as V3)[0]) > 0.5 ? -0.8 : 0, headTilt: (ps.head?.[2] ?? 0) * 0.8, bob: ps.bob ? ps.bob * 2 : 0, lean: ps.lean ?? 0 };
  return <FlatChar kind="nico" position={p} h={2.15} pose={fp} face={{ expr: face.expr as FlatExpr, look: face.look, blink: face.blink, mouth: face.mouthOpen, sweat: face.sweat, blush: face.blush }} />;
};
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;
const peckAt = (f: number, every = 9) => { const k = (f % every) / every; return k < 0.35 ? Math.sin((k / 0.35) * Math.PI) : 0; };

export const SHOTS: Shot[] = [
  // "Na Segunda Guerra, os Estados Unidos quase colocaram pombos pra pilotar bombas."
  {
    name: "01 bomba pilotada por pombo", from: 0, to: C(12),
    render: (f, s, e) => {
      const z = kf(f, [[W(8) - 6, 0], [W(8) + 4, 1]]);
      return (
        <SkyStage cam={glide(f, s, e, { pos: [1.5, 0.8, 6.5], target: [-0.2, 0, 0], fov: 38 }, { pos: [1.2 - z * 0.4, 0.35, 2.8 - z * 1.3], target: [0.35, -0.05, 0], fov: 34 })}>
          <Clouds frame={f} speed={0.12} />
          <Bomb p={[0, Math.sin(f * 0.08) * 0.05, 0]} rot={[0, -0.25, -0.12 + Math.sin(f * 0.05) * 0.04]} frame={f} goggles />
        </SkyStage>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(1) - 2} text="SEGUNDA GUERRA" box={false} size={120} y={0.1} rot={-4} />,
  },
  // "Sério."
  {
    name: "02 serio", from: C(12), to: C(13),
    render: (f, s, e) => (
      <LabStage cam={glide(f, s, e, { pos: add(NICO, [0.2, 1.4, 2.1]), target: add(NICO, [0, 1.3, 0]), fov: 34 }, { pos: add(NICO, [0.12, 1.42, 1.8]), target: add(NICO, [0, 1.32, 0]), fov: 33 })}>
        <Nico f={f} ry={0} face={nicoFace(f, [[s, "smug"]])} pose={{ ...idle(f), head: [kf(f, [[s + 3, 0], [s + 8, 0.25], [s + 13, 0]]), 0, 0] }} />
      </LabStage>
    ),
  },
  // "Um psicólogo chamado Skinner treinou pombos pra bicar a imagem de um navio numa telinha."
  {
    name: "03 laboratorio treino", from: C(13), to: C(28),
    render: (f, s, e) => {
      const scr = Math.max(0.001, pop(f, W(22) - 3, 7));
      const hits = f > W(20) ? Math.min(6, Math.floor((f - W(20)) / 9)) : 0;
      return (
        <LabStage cam={glide(f, s, e, { pos: [-0.2, 1.9, 3.4], target: [0.3, 1.2, -0.3], fov: 40 }, { pos: [0.9, 1.6, 1.6], target: [0.95, 1.2, -0.35], fov: 36 })}>
          <Nico f={f} face={nicoFace(f, [[s, "smile"], [W(20), "happy"]], { look: [0.7, 0.1] })} pose={{ ...idle(f), armR: [-0.6, 0, 0.5] }} />
          <FlatChar kind="pigeon" position={PIG} h={0.55} pose={{ headTilt: f > W(20) ? peckAt(f) * 0.7 : 0 }} face={{ expr: "neutral" }} />
          <group scale={scr}><Screen p={SCR} ry={-0.5} s={1} hits={hits} /></group>
        </LabStage>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(16) - 2} text="B. F. SKINNER" color="#2c6fb6" size={80} y={0.14} rot={-3} />,
  },
  // "Cada bicada mexia a bomba: pra esquerda, pra direita."
  {
    name: "04 bicada mexe a bomba", from: C(28), to: C(37),
    render: (f, s, e) => {
      const tilt = kf(f, [[W(34) - 4, 0], [W(34), -0.5], [W(36) - 4, -0.5], [W(36), 0.5], [e, 0.5]]);
      return (
        <SkyStage cam={glide(f, s, e, { pos: [0.4, 1.0, 4.6], target: [-0.4, 0, 0], fov: 38 }, { pos: [-0.4, 0.8, 4.2], target: [-0.5, 0, 0], fov: 38 })}>
          <Clouds frame={f} speed={0.12} />
          <Bomb p={[0, 0, 0]} rot={[0, tilt * 0.6, -0.1]} tilt={tilt} frame={f} goggles />
        </SkyStage>
      );
    },
    overlay: (f) => (
      <>
        <Stamp f={f} at={W(34) - 2} text="ESQUERDA!" color="#2c6fb6" size={100} y={0.1} rot={-4} />
        {f >= W(36) - 2 && <Stamp f={f} at={W(36) - 2} text="DIREITA!" color="#d62a1e" size={100} y={0.22} rot={4} />}
      </>
    ),
  },
  // "E pra não errar, cada bomba levava três pombos. A decisão era por votação."
  {
    name: "05 tres pombos votacao", from: C(37), to: C(51),
    render: (f, s, e) => {
      const vote = f >= W(50) - 2;
      return (
        <SkyStage bg="#f2d29a" light={LIGHT_WARM} cam={glide(f, s, e, { pos: [1.9, 0.5, 1.6], target: [0.35, -0.1, 0], fov: 36 }, { pos: [1.5, 0.35, 1.1], target: [0.35, -0.12, 0], fov: 34 })}>
          <Bomb p={[0, 0, 0]} rot={[0, -0.1, 0]} frame={f} pigeons={3} votes={vote ? [-1, -1, 1] : [0, 0, 0]} />
        </SkyStage>
      );
    },
    overlay: (f) => <>
      <Stamp f={f} at={W(44) - 2} text="3 POMBOS" color="#2c6fb6" size={110} y={0.1} rot={-4} />
      {f >= W(50) - 2 && <Stamp f={f} at={W(50) - 2} text="2 x 1" size={130} y={0.24} rot={5} />}
    </>,
  },
  // "Nos testes, os pombos acertavam o alvo muito bem."
  {
    name: "06 testes acertavam", from: C(51), to: C(60),
    render: (f, s, e) => (
      <SkyStage cam={glide(f, s, e, { pos: [0, 6, 7], target: [0, 0, 0], fov: 40 }, { pos: [0.5, 4.5, 5.5], target: [0, 0.2, 0], fov: 40 })}>
        <Sea frame={f} target={Math.max(0.001, pop(f, W(56) - 3, 8))} />
        <Ship frame={f} ry={0.3} s={0.9} />
        <group position={[1.5, 1.9, 0.8]}><Pigeon s={3} frame={f} happy ry={-0.6} flap={f > W(58) ? Math.abs(Math.sin(f * 0.6)) : 0} /></group>
      </SkyStage>
    ),
    overlay: (f) => <Stamp f={f} at={W(58) - 2} text="NA MOSCA!" color="#1e8a4a" size={110} y={0.1} rot={-5} />,
  },
  // "Mas os generais não levaram a ideia a sério."
  {
    name: "07 generais riem", from: C(60), to: C(69),
    render: (f, s, e) => {
      const lol = f >= W(64) - 2;
      return (
        <LabStage cam={glide(f, s, e, { pos: [-0.1, 1.7, 3.9], target: [0.2, 1.2, -0.1], fov: 44 }, { pos: [0.1, 1.6, 3.4], target: [0.25, 1.2, -0.1], fov: 44 })}>
          <Nico f={f} p={[-0.6, 0, 0.4]} ry={0.6} face={nicoFace(f, [[s, "smile"], [W(64), "worried"]], { look: [0.7, 0] })} pose={{ ...idle(f), armR: [-1.2, 0, 0.2] }} holdR={held([-1.2, 0, 0.2], <Pigeon p={[0, -0.05, 0.08]} s={0.9} ry={0} frame={f} />)} />
          <Toon kind="general" position={[0.6, 0, 0.1]} rotationY={-0.5} face={genFace(f, lol ? "happy" : "sus" as ToonExpr, 2)} pose={lol ? laugh(f) : idle(f, 1)} />
          <Toon kind="general" position={[1.5, 0, -0.4]} rotationY={-0.7} face={genFace(f, lol ? "happy" : "neutral" as ToonExpr, 5)} pose={lol ? laugh(f, 1.3) : idle(f, 3)} />
        </LabStage>
      );
    },
  },
  // "O projeto foi cancelado em 1944."
  {
    name: "08 cancelado 1944", from: C(69), to: C(74),
    render: (f, s, e) => (
      <LabStage light={LIGHT_DARK} bg="#3a3442" cam={glide(f, s, e, { pos: [0.6, 2.3, 0.5], target: [0.6, TABLE_Y, -0.4], fov: 38 }, { pos: [0.6, 2.0, 0.3], target: [0.6, TABLE_Y, -0.4], fov: 36, roll: 0.04 })}>
        <Folder p={[0.6, TABLE_Y + 0.02, -0.4]} rot={[0, 0.1, 0]} stamp={kf(f, [[W(72) - 3, 0], [W(72) + 2, 1]])} />
        <Pigeon p={[1.35, TABLE_Y, -0.55]} ry={-0.8} frame={f} s={1.1} />
      </LabStage>
    ),
    overlay: (f) => <Stamp f={f} at={W(73) - 2} text="1944" box={false} size={200} y={0.1} rot={-3} />,
  },
  // "Anos depois, a Marinha tentou de novo, com outro nome: Projeto Orcon."
  {
    name: "09 marinha orcon", from: C(74), to: C(86),
    render: (f, s, e) => (
      <SkyStage cam={glide(f, s, e, { pos: [3.2, 1.6, 5.0], target: [0, 0.8, 0], fov: 40 }, { pos: [1.8, 1.5, 4.2], target: [0, 0.9, 0], fov: 38 })}>
        <Sea frame={f} />
        <group position={[0, 0.05, -1.5]}><Ship frame={0} s={2.2} /></group>
        <Nico f={f} p={[-0.4, 0.33, 0.6]} ry={0.4} face={nicoFace(f, [[s, "smile"], [W(84), "happy"]])} pose={{ ...idle(f), armR: [0, 0, 2.4] }} />
        {[0, 1, 2].map((i) => <Pigeon key={i} p={[0.5 + i * 0.3, 0.33, 0.8 - i * 0.1]} ry={-0.4} s={1.5} frame={f + i * 5} />)}
        <mesh position={[0, 0.17, 0.4]}><boxGeometry args={[3.2, 0.32, 1.6]} /><meshStandardMaterial color="#8a929e" /></mesh>
      </SkyStage>
    ),
    overlay: (f) => <Stamp f={f} at={W(84) - 2} text="PROJETO ORCON" color="#2c6fb6" size={96} y={0.1} rot={-3} />,
  },
  // "E só desistiu de vez em 1953, quando a eletrônica ficou boa o bastante."
  {
    name: "10 computador 1953", from: C(86), to: C(99),
    render: (f, s, e) => {
      const walk = kf(f, [[W(94), 0], [e, 1]]);
      return (
        <LabStage light={LIGHT_LAB} cam={glide(f, s, e, { pos: [0.3, 1.6, 4.0], target: [0.3, 1.1, -1.0], fov: 40 }, { pos: [0.6, 1.4, 3.4], target: [0.4, 1.0, -1.0], fov: 40 })}>
          <BigComputer p={[0.3, 0, -1.6]} frame={f} />
          <Pigeon p={[-0.2 - walk * 1.6, 0, 0.4]} ry={-Math.PI / 2} s={1.6} frame={f} peck={0} />
        </LabStage>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(91) - 2} text="1953" box={false} size={200} y={0.1} rot={-3} />,
  },
  // "Ou seja: por um tempo, o computador mais avançado de uma bomba… era um pombo."
  {
    name: "11 o computador era um pombo", from: C(99), to: C(114),
    render: (f, s, e) => (
      <SkyStage bg="#ffd27a" light={LIGHT_WARM} cam={glide(f, s, e, { pos: [2.6, 0.6, 3.0], target: [0, 0, 0], fov: 38 }, { pos: [1.0, 0.25, 1.15], target: [0.35, -0.08, 0], fov: 34 })}>
          <Bomb p={[0, 0, 0]} rot={[0, -0.2, 0]} frame={f} goggles happy={f >= W(113) - 2} />
      </SkyStage>
    ),
    overlay: (f) => <Stamp f={f} at={W(105) - 2} text="COMPUTADOR DE BORDO:" color="#1a1210" size={66} y={0.1} rot={-2} />,
  },
  // "Você confiaria num pombo? Comenta aí."
  {
    name: "12 pergunta final", from: C(114), to: TOTAL,
    render: (f, s, e) => {
      const arm: V3 = [-1.1, 0, 0.25];
      return (
        <LabStage cam={glide(f, s, e, { pos: add(NICO, [0.4, 1.55, 1.9]), target: add(NICO, [0.15, 1.35, 0]), fov: 36 }, { pos: add(NICO, [0.3, 1.55, 1.5]), target: add(NICO, [0.12, 1.4, 0]), fov: 34 })}>
          <Nico f={f} ry={0.15} face={nicoFace(f, [[s, "smug"], [W(118), "happy"]])} pose={{ ...idle(f), armR: arm }} holdR={held(arm, <Pigeon p={[0, -0.05, 0.08]} s={1.1} frame={f} goggles />)} />
        </LabStage>
      );
    },
    overlay: (f) => <Stamp f={f} at={W(118) - 2} text="COMENTA AÍ!" size={100} y={0.12} rot={-4} />,
  },
];
export const interp = interpolate;
