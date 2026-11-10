import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import data from "../data/ultimo-timeline.json";
import { Capybara } from "../kit/Capybara";
import { Pose } from "../kit/Character";
import { Cel } from "../kit/cel";
import { Cam, Stage } from "../kit/Stage";
import { Toon, ToonExpr, ToonFace } from "../kit/Toon";
import { blinkAt, clamp01, FPS, kf, kf3, rand } from "../kit/anim";
import { FONT } from "../kit/textures";
import {
  Bakery, Bird, Bridge, Cans, CarvedMountain, City, CityState, Deer, Dog, Earth, GasStation, Grave, Kitchen, LIGHT_DAY, LIGHT_GOLD, LIGHT_GREY, LIGHT_NIGHT,
  Mall, OverpassWall, PowerPlant, Pyramids, Radio, Rooftop, Satellite, Servers, Sky, Station, Tunnel, Voyager,
} from "./world";

type V3 = [number, number, number];
type Line = { cap: string; start: number; end: number; words: { text: string; start: number; end: number }[] };
export const LINES = (data as { lines: Line[] }).lines;
export const TOTAL = (data as { total: number }).total;
/** Quadro (absoluto) da primeira palavra da fala `li` que casa com `re`. */
export const WF = (li: number, re: RegExp) => { const w = LINES[li].words.find((x) => re.test(x.text.toLowerCase())); return Math.round((w ? w.start : LINES[li].start) * FPS); };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]]), target: kf3(f, [[s, a.target], [e, b.target]]),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]]), roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]]),
});
const face = (f: number, expr: ToonExpr, extra: Partial<ToonFace> = {}): ToonFace => ({ expr, blink: blinkAt(f, 3, 80), eyes: "big", iris: "#8d929c", lid: 0.22, ...extra });
const idle = (f: number, seed = 0): Pose => ({
  bob: Math.abs(Math.sin(f * 0.07 + seed)) * 0.01, head: [Math.sin(f * 0.04 + seed) * 0.04, Math.sin(f * 0.03 + seed) * 0.1, 0],
  armL: [Math.sin(f * 0.06) * 0.04, 0, -0.12], armR: [-Math.sin(f * 0.06) * 0.04, 0, 0.12],
});
const walk = (f: number, k = 1): Pose => ({ legL: Math.sin(f * 0.35) * 0.45 * k, legR: -Math.sin(f * 0.35) * 0.45 * k, armL: [-Math.sin(f * 0.35) * 0.4 * k, 0, -0.12], armR: [Math.sin(f * 0.35) * 0.4 * k, 0, 0.12], bob: Math.abs(Math.cos(f * 0.35)) * 0.035 * k });
const run = (f: number): Pose => ({ ...walk(f * 1.8, 1.4), lean: 0.25, armL: [-Math.sin(f * 0.63) * 1.0, 0, -0.2], armR: [Math.sin(f * 0.63) * 1.0, 0, 0.2] });
const Ren: React.FC<{ f: number; p?: V3; ry?: number; pose?: Pose; expr?: ToonExpr; fx?: Partial<ToonFace>; holdR?: React.ReactNode; holdL?: React.ReactNode }> = ({ f, p = [0, 0, 1.5], ry = 0, pose, expr = "neutral", fx, holdR, holdL }) => (
  <Toon kind="ren" position={p} rotationY={ry} pose={pose ?? idle(f)} face={face(f, expr, fx)} holdR={holdR} holdL={holdL} />
);
/** Close no rosto (formato 16:9: afasta 1,8x para caber a cabeça inteira com o cabelo). */
const head = (p: V3, off: V3, fov = 30, look: V3 = [0, -0.1, 0]): Cam => ({ pos: add(add(p, [0, 1.64, 0]), [off[0] * 1.8, off[1] * 1.8 + 0.1, off[2] * 1.8]), target: add(add(p, [0, 1.64, 0]), add(look, [0, -0.12, 0])), fov });

type Look = "day" | "gold" | "night" | "grey";
const LGT = { day: LIGHT_DAY, gold: LIGHT_GOLD, night: LIGHT_NIGHT, grey: LIGHT_GREY };
const BGC = { day: "#a9d4f2", gold: "#f2a66b", night: "#0b1030", grey: "#b9c4cc" };
/** Palco padrão: céu ao fundo (desfocado) + mundo em estilo cel na frente. */
const Scene: React.FC<{ f: number; cam: Cam; look?: Look; bg?: React.ReactNode; children: React.ReactNode; sky?: boolean; milky?: boolean }> = ({ f, cam, look = "day", bg, children, sky = true, milky = true }) => (
  <Stage flat cam={cam} background={BGC[look]} blur={1.2} lights={LGT[look]}
    bg={<>{sky && <Sky night={look === "night"} dusk={look === "gold"} frame={f} milky={milky} color={look === "grey" ? "#b9c4cc" : undefined} />}<Cel>{bg}</Cel></>}
    fg={<Cel>{children}</Cel>} />
);
const CityS: React.FC<{ f: number; cam: Cam; st?: Partial<CityState>; look?: Look; children?: React.ReactNode }> = ({ f, cam, st = {}, look = "day", children }) => (
  <Scene f={f} cam={cam} look={look}><City frame={f} night={look === "night"} {...st} />{children}</Scene>
);

// ------------------------------------------------------------------ 2D: cartões de tempo, celular, HUD
const SECTIONS: [number, string][] = [[6, "1 HORA"], [20, "1 DIA"], [28, "1 SEMANA"], [41, "1 MÊS"], [47, "1 ANO"], [57, "10 ANOS"], [68, "100 ANOS"], [73, "1.000 ANOS"]];
const TimeCard: React.FC<{ f: number; s: number; label: string }> = ({ f, s, label }) => {
  const k = interpolate(f - s, [0, 8], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0d0d10", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: FONT, color: "#8d929c", fontSize: 46, letterSpacing: 12 }}>SEM HUMANOS HÁ</div>
      <div style={{ fontFamily: FONT, color: "#ffffff", fontSize: 200, transform: `scale(${k})`, textShadow: "0 0 40px rgba(255,255,255,0.25)" }}>{label}</div>
    </AbsoluteFill>
  );
};
export const hudLabel = (f: number) => { let lab = ""; for (const [li, l] of SECTIONS) if (f >= Math.round(LINES[li].start * FPS) - 3) lab = l; return lab; };
const Phone: React.FC<{ f: number; s: number; mode: "signal" | "msg" }> = ({ f, s, mode }) => {
  const k = interpolate(f - s, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 220, pointerEvents: "none" }}>
      <div style={{ width: 360, height: 680, borderRadius: 48, background: "#111", border: "10px solid #2a2a30", transform: `translateY(${(1 - k) * 400}px) rotate(-4deg)`, padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: FONT, color: "#e04b3c", fontSize: 30 }}>{mode === "signal" ? "SEM SERVIÇO" : "Mãe"}</div>
        {mode === "msg" && <div style={{ alignSelf: "flex-end", background: "#2c6fb6", color: "#fff", fontFamily: FONT, fontSize: 30, padding: "14px 20px", borderRadius: 22 }}>mãe cadê vc??</div>}
        {mode === "msg" && <div style={{ alignSelf: "flex-end", color: "#9aa3ad", fontFamily: FONT, fontSize: 24 }}>Enviando{".".repeat(1 + (Math.floor(f / 10) % 3))}</div>}
        {mode === "signal" && <div style={{ fontFamily: FONT, color: "#9aa3ad", fontSize: 120, textAlign: "center", marginTop: 120 }}>✕</div>}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ planos (um por fala; alguns têm corte interno)
type R = (f: number, s: number, e: number) => React.ReactNode;
const half = (f: number, s: number, e: number) => f < (s + e) / 2;
const P0: V3 = [0, 0, 1.5];
const S: Record<number, R> = {};

// gancho
S[0] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, head(P0, [0.6, 0.1, 2.4], 30), head(P0, [0.3, 0.05, 1.7], 28))}><Ren f={f} ry={0.1} expr="surprised" fx={{ look: [0.4, 0] }} /></CityS>;
S[1] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, { pos: [-10, 3, 12], target: [0, 2, 0], fov: 40 }, { pos: [-4, 2.5, 10], target: [0, 2, 0], fov: 40 })}><Ren f={f} ry={0.5} pose={{ ...idle(f), armL: [0, 0, -0.6], armR: [0, 0, 0.6] }} /></CityS>;
S[2] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, { pos: [0, 14, 10], target: [0, 0, 0], fov: 45 }, { pos: [0, 22, 12], target: [0, 0, 0], fov: 45 })}><Ren f={f} ry={0} /></CityS>;
S[3] = (f, s, e) => <Scene f={f} look="night" cam={glide(f, s, e, { pos: [0, 0, 22], target: [0, 0, 0], fov: 35 }, { pos: [4, 2, 16], target: [0, 0, 0], fov: 35 })} sky={true}><Earth frame={f} night /></Scene>;
S[4] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, head(P0, [-0.4, 0.05, 1.6], 28), head(P0, [-0.2, 0, 1.3], 26))}><Ren f={f} ry={-0.1} expr="sad" /></CityS>;
S[5] = (f, s, e) => <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [0, 2.6, 8], target: [0, 2.6, -3], fov: 35 }, { pos: [0, 2.8, 6], target: [0, 2.8, -3], fov: 30 })}><OverpassWall written={0} /><Ren f={f} p={[0, 0, 0]} ry={Math.PI} pose={idle(f)} /></Scene>;
// 1 hora
S[7] = (f, s, e) => <CityS f={f} cam={half(f, s, e) ? head(P0, [0.9, 0.0, 1.8], 28) : glide(f, (s + e) / 2, e, { pos: [-14, 1.5, 6], target: [0, 1.5, 0], fov: 38 }, { pos: [-9, 1.5, 6], target: [0, 1.5, 0], fov: 38 })}><Ren f={f} ry={0.3} expr="neutral" fx={{ look: [half(f, s, e) ? 0.8 : -0.6, 0] }} /></CityS>;
S[8] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, { pos: [-4, 1.2, 5], target: [-1, 0.8, 0], fov: 38 }, { pos: [2, 1.6, 6], target: [1, 0.9, 0], fov: 38 })}><Ren f={f} p={[-3, 0, 2.6]} ry={0.6} pose={walk(f)} /></CityS>;
S[9] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, { pos: [6.5, 3.2, 6], target: [5, 3.3, 3.2], fov: 30 }, { pos: [8, 2.4, 9], target: [4, 2, 2], fov: 40 })}><Ren f={f} p={[3, 0, 1.5]} ry={-0.4} /></CityS>;
S[10] = (f, s, e) => <Scene f={f} cam={glide(f, s, e, { pos: [0, 1.8, 8], target: [0, 1.3, -2], fov: 40 }, { pos: [0, 1.6, 6], target: [0, 1.3, -2], fov: 40 })} sky={false}><Mall frame={f} /><Ren f={f} p={[0, 0, 1]} ry={0} pose={walk(f, 0.6)} /></Scene>;
S[11] = (f, s, e) => {
  const arm: V3 = [-1.2, 0, 0.3];
  return <Scene f={f} sky={false} cam={glide(f, s, e, head([0, 0, 0], [0.8, -0.1, 1.8], 30), head([0, 0, 0], [0.4, -0.15, 1.4], 28))}><Mall frame={f} /><Ren f={f} p={[0, 0, 0]} expr="smug" pose={{ ...idle(f), armR: arm }} holdR={<group rotation={[-arm[0], 0, -arm[2]]}><mesh position={[0, 0.05, 0.08]}><boxGeometry args={[0.35, 0.35, 0.12]} /><meshStandardMaterial color="#7a4cc8" /></mesh></group>} /></Scene>;
};
S[12] = (f, s, e) => <Scene f={f} sky={false} cam={glide(f, s, e, { pos: [3, 1.2, 3], target: [0, 1, 0], fov: 38 }, { pos: [2, 1.0, 2.5], target: [0, 0.8, 0], fov: 38 })}><Mall frame={f} /><Ren f={f} p={[0, 0, 0]} pose={{ ...idle(f), lean: 0.1, armL: [-0.9, 0, 0.2], armR: [-0.9, 0, -0.2] }} expr="smile" /></Scene>;
S[13] = (f, s, e) => <Scene f={f} sky={false} cam={glide(f, s, e, { pos: [0, 2.0, 5], target: [0, 1.2, -1.5], fov: 38 }, { pos: [1.2, 1.7, 3.6], target: [0, 1.3, -1.5], fov: 34 })}><Bakery eaten={clamp01((f - s) / (e - s))} /><Ren f={f} p={[0, 0, 0]} pose={{ ...idle(f), armR: [-1.1 + Math.sin(f * 0.5) * 0.3, 0, 0.3] }} expr="happy" /></Scene>;
S[14] = (f, s, e) => <Scene f={f} sky={false} cam={glide(f, s, e, head([0, 0, 0], [0.2, 0, 1.4], 28), head([0, 0, 0], [0.1, 0, 1.2], 26))}><Bakery eaten={1} /><Ren f={f} p={[0, 0, 0]} pose={{ ...idle(f), squash: 0.95 + Math.sin(f * 0.6) * 0.02 }} expr="sad" fx={{ sweat: true }} /></Scene>;
S[15] = (f, s, e) => <><CityS f={f} cam={head(P0, [-0.8, -0.1, 2.0], 32)}><Ren f={f} ry={-0.3} pose={{ ...idle(f), armR: [-1.4, 0, 0.1] }} expr="worried" /></CityS><Phone f={f} s={s} mode="signal" /></>;
S[16] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, { pos: [0, 3, 14], target: [0, 6, -9], fov: 45 }, { pos: [0, 5, 10], target: [0, 9, -9], fov: 45 })}>{[-8, 0, 8].map((x, i) => <group key={i} position={[x, 0, -6]}><mesh position={[0, 5, 0]}><cylinderGeometry args={[0.15, 0.3, 10, 8]} /><meshStandardMaterial color="#7a7f8a" /></mesh><mesh position={[0, 10.2, 0]}><sphereGeometry args={[0.3, 10, 8]} /><meshStandardMaterial color={f < s + (i + 1) * (e - s) / 4 ? "#ff5252" : "#333"} emissive="#ff5252" emissiveIntensity={f < s + (i + 1) * (e - s) / 4 ? 1.2 : 0} /></mesh></group>)}</CityS>;
S[17] = (f, s, e) => <><CityS f={f} cam={head(P0, [0.9, -0.2, 1.7], 30)}><Ren f={f} ry={0.3} pose={{ ...idle(f), armR: [-1.4, 0, 0.1], head: [0.2, 0, 0] }} expr="sad" fx={{ look: [0, 0.8] }} /></CityS><Phone f={f} s={s} mode="msg" /></>;
S[18] = (f, s, e) => {
  const x = kf(f, [[s, -10], [e, 10]]);
  return half(f, s, e)
    ? <CityS f={f} cam={glide(f, s, e, { pos: [x - 6, 1.5, 7], target: [x, 1.2, 1], fov: 40 }, { pos: [x - 6, 1.5, 7], target: [x, 1.2, 1], fov: 40 })}><Ren f={f} p={[x, 0, 1]} ry={Math.PI / 2} pose={run(f)} expr="worried" /></CityS>
    : <CityS f={f} cam={glide(f, (s + e) / 2, e, head([2, 0, -4.3], [0.8, 0, 2], 32), head([2, 0, -4.3], [0.5, 0, 1.7], 30))}><Ren f={f} p={[2, 0, -4.3]} ry={Math.PI} pose={{ ...idle(f), armR: [-2.2 - Math.abs(Math.sin(f * 0.6)) * 0.5, 0, 0.2] }} expr="worried" /></CityS>;
};
S[19] = (f, s, e) => <CityS f={f} cam={glide(f, s, e, head(P0, [0.0, 0.1, 1.7], 28), head(P0, [0.0, 0.05, 1.4], 26))}><Ren f={f} pose={{ ...idle(f), armR: [-1.4, 0, 0.1] }} expr="sad" /></CityS>;
// 1 dia
S[21] = (f, s, e) => <Scene f={f} look="day" cam={glide(f, s, e, { pos: [-10, 4, 18], target: [0, 3, -5], fov: 40 }, { pos: [-4, 3, 14], target: [0, 3, -5], fov: 40 })}><PowerPlant on={1} frame={f} /></Scene>;
S[22] = (f, s, e) => {
  const off = WF(22, /apagou/) - 3;
  return f < (s + e) * 0.45 ? <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [-4, 3, 14], target: [0, 3, -5], fov: 40 }, { pos: [4, 3, 14], target: [0, 3, -5], fov: 40 })}><PowerPlant on={1 - clamp01((f - s) / ((e - s) * 0.45))} frame={f} /></Scene>
    : <CityS f={f} look="night" st={{ power: f < off }} cam={glide(f, s, e, { pos: [0, 10, 26], target: [0, 4, -6], fov: 42 }, { pos: [0, 9, 22], target: [0, 4, -6], fov: 42 })}><Ren f={f} p={[0, 0, 2]} ry={Math.PI} /></CityS>;
};
S[23] = (f, s, e) => <CityS f={f} look="night" st={{ power: false }} cam={glide(f, s, e, { pos: [0, 1.0, 5], target: [0, 6, -20], fov: 50 }, { pos: [0, 0.8, 4], target: [0, 9, -20], fov: 52 })}><Ren f={f} p={[0, 0, 2.5]} ry={Math.PI} pose={{ ...idle(f), head: [-0.5, 0, 0] }} /></CityS>;
S[24] = (f, s, e) => <CityS f={f} look="night" st={{ power: false }} cam={glide(f, s, e, head(P0, [0.2, -0.3, 1.6], 28, [0, 0.0, 0]), head(P0, [0.1, -0.3, 1.3], 26, [0, 0, 0]))}><Ren f={f} pose={{ ...idle(f), head: [-0.45, 0, 0] }} expr="surprised" fx={{ look: [0, -1] }} /></CityS>;
S[25] = (f, s, e) => <Scene f={f} cam={glide(f, s, e, { pos: [0, 12, 8], target: [0, 0, 0], fov: 45 }, { pos: [0, 16, 6], target: [0, 0, 0], fov: 45 })}><Rooftop painted={clamp01((f - s) / (e - s) * 1.4)} /><Ren f={f} p={[3.5, 0, 2]} ry={-0.5} pose={{ ...idle(f), armR: [-1.1, 0, 0.5] }} /></Scene>;
S[26] = (f, s, e) => <Scene f={f} cam={glide(f, s, e, { pos: [3, 1.0, 6], target: [0, 3, -4], fov: 40 }, { pos: [2, 0.8, 5], target: [0, 4, -4], fov: 42 })}><Rooftop /><Ren f={f} p={[0, 0, 1]} ry={Math.PI} pose={{ ...idle(f), head: [-0.4, 0, 0], armL: [-0.3, 0, -0.5], armR: [-2.5, 0, 0.3] }} /></Scene>;
S[27] = (f, s, e) => <Scene f={f} cam={{ pos: [0, 1.6, 6], target: [0, 4, -4], fov: 45 }}><Rooftop /><Ren f={f} p={[0, 0, 1]} ry={Math.PI} pose={{ ...idle(f), head: [-0.4, 0, 0] }} /><Bird p={[kf(f, [[s, -6], [e, 6]]), 6 + Math.sin(f * 0.05), -4]} frame={f} s={3} /></Scene>;
// 1 semana
S[29] = (f, s, e) => <Scene f={f} sky={false} cam={glide(f, s, e, { pos: [-2, 1.6, 2.2], target: [-2, 1.3, -2.3], fov: 32 }, { pos: [-1.6, 1.5, 1.4], target: [-2, 1.35, -2.3], fov: 30 })}><Kitchen frame={f} drip={1 - clamp01((f - s) / (e - s))} /><Ren f={f} p={[-1.0, 0, -0.8]} ry={-0.9} expr="worried" /></Scene>;
S[30] = (f, s, e) => <Scene f={f} sky={false} look="grey" cam={glide(f, s, e, { pos: [0, 1.6, 12], target: [0, 1.4, -10], fov: 50 }, { pos: [0, 1.2, 8], target: [0, 1.2, -10], fov: 50 })}><Tunnel water={0.1} frame={f} /></Scene>;
S[31] = (f, s, e) => <Scene f={f} sky={false} look="grey" cam={glide(f, s, e, { pos: [1, 2.0, 10], target: [0, 1.2, -10], fov: 50 }, { pos: [-1, 2.4, 10], target: [0, 1.6, -10], fov: 50 })}><Tunnel water={kf(f, [[s, 0.15], [e, 0.85]])} frame={f} /></Scene>;
S[32] = (f, s, e) => <Scene f={f} look="grey" cam={glide(f, s, e, { pos: [-14, 4, 20], target: [0, 4, -6], fov: 40 }, { pos: [-8, 3, 16], target: [0, 4, -6], fov: 40 })}><PowerPlant nuclear on={0.6} frame={f} /></Scene>;
S[33] = (f, s, e) => <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [10, 3, 16], target: [0, 4, -6], fov: 40 }, { pos: [6, 2, 13], target: [0, 4, -6], fov: 40 })}><PowerPlant nuclear on={kf(f, [[s, 0.6], [e, 0.1]])} frame={f} /></Scene>;
S[34] = (f, s, e) => <CityS f={f} st={{ green: 0.1, power: false }} cam={glide(f, s, e, { pos: [6, 1.6, 6], target: [0, 1.2, 1.5], fov: 38 }, { pos: [4, 1.6, 5], target: [0, 1.2, 1.5], fov: 36 })}><Ren f={f} ry={-1.4} pose={walk(f)} p={[kf(f, [[s, 2], [e, -2]]), 0, 1.5]} /></CityS>;
S[35] = (f, s, e) => <CityS f={f} st={{ green: 0.1, power: false }} cam={glide(f, s, e, head(P0, [-0.5, 0, 1.7], 30), head(P0, [-0.3, 0, 1.4], 28))}><Ren f={f} ry={kf(f, [[s, 0], [e - 10, 0], [e, 0.6]])} expr={f > e - 25 ? "surprised" : "neutral"} fx={{ look: [f > e - 25 ? 0.9 : 0, 0] }} /></CityS>;
S[36] = (f, s, e) => <CityS f={f} st={{ green: 0.12, power: false }} cam={glide(f, s, e, { pos: [4.2, 0.9, 4.6], target: [2.5, 0.5, 1.5], fov: 34 }, { pos: [3.8, 0.8, 4.0], target: [2.5, 0.55, 1.5], fov: 32 })}><Dog p={[2.5, 0, 1.5]} ry={2.6} frame={f} wag={0.3} /></CityS>;
S[37] = (f, s, e) => <CityS f={f} st={{ green: 0.12, power: false }} cam={glide(f, s, e, { pos: [1.2, 1.2, 5], target: [1.2, 0.8, 1.5], fov: 36 }, { pos: [1.2, 1.0, 4.2], target: [1.2, 0.8, 1.5], fov: 34 })}><Ren f={f} p={[0, 0, 1.5]} ry={0.9} expr="surprised" fx={{ look: [0.8, 0.6] }} /><Dog p={[2.4, 0, 1.6]} ry={Math.PI + 0.3} frame={f} wag={f > WF(37, /abanou/) - 3 ? 1 : 0} /></CityS>;
S[38] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.12, power: false }} cam={glide(f, s, e, { pos: [0, 1.5, 6], target: [0.5, 1, 1.5], fov: 36 }, { pos: [0.4, 1.3, 4.6], target: [0.5, 1, 1.5], fov: 34 })}><Ren f={f} p={[0, 0, 1.5]} ry={0.5} pose={{ ...idle(f), lean: 0.2, armR: [-0.9, 0, 0.4] }} expr="smile" /><Dog p={[1.2, 0, 1.8]} ry={Math.PI + 0.5} frame={f} wag={1} /></CityS>;
S[39] = (f, s, e) => <CityS f={f} st={{ green: 0.12, power: false }} cam={glide(f, s, e, { pos: [1, 0.9, 3.5], target: [0.8, 0.4, 1.5], fov: 34 }, { pos: [0.6, 0.8, 3], target: [0.8, 0.4, 1.5], fov: 32 })}><Ren f={f} p={[0, 0, 1.5]} ry={0.6} pose={{ ...idle(f), lean: 0.3, armR: [-1.0, 0, 0.3] }} expr="smile" /><Dog p={[1.0, 0, 1.6]} ry={Math.PI + 0.2} frame={f} wag={1} /><Cans p={[0.9, 0, 2.0]} n={1} /></CityS>;
S[40] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.15, power: false }} cam={glide(f, s, e, { pos: [-8, 1.6, 8], target: [0, 1, 1.5], fov: 38 }, { pos: [8, 1.6, 8], target: [0, 1, 1.5], fov: 38 })}><Ren f={f} p={[kf(f, [[s, -3], [e, 3]]), 0, 1.5]} ry={Math.PI / 2} pose={walk(f)} /><Dog p={[kf(f, [[s, -2.2], [e, 3.8]]), 0, 2.1]} ry={0} frame={f} wag={1} walk={1} /></CityS>;
// 1 mês
S[42] = (f, s, e) => <CityS f={f} look="grey" st={{ green: 0.25, power: false }} cam={glide(f, s, e, { pos: [-6, 1.0, 6], target: [0, 0.6, 1], fov: 36 }, { pos: [-3, 0.9, 5], target: [0, 0.6, 1], fov: 34 })}>{[0, 1, 2].map((i) => <Dog key={i} p={[-2 + i * 2, 0, 0.5 + i * 0.6]} ry={0.4 * i} frame={f + i * 20} walk={1} s={0.8 + i * 0.15} />)}</CityS>;
S[43] = (f, s, e) => <Scene f={f} sky={false} cam={glide(f, s, e, { pos: [2.5, 1.6, 2.5], target: [2.5, 1.4, -2.2], fov: 34 }, { pos: [1.5, 1.6, 2.2], target: [2.4, 1.4, -2.2], fov: 32 })}><Kitchen frame={f} drip={0} fridge={kf(f, [[s, 0], [s + 20, 1]])} /><Ren f={f} p={[0.6, 0, -0.5]} ry={-0.8} pose={{ ...idle(f), armR: [-1.5, 0, 0.1] }} expr="sad" fx={{ sweat: true }} /></Scene>;
S[44] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.3, power: false }} cam={glide(f, s, e, { pos: [0.5, 1.2, 4], target: [0.5, 0.7, 1.5], fov: 34 }, { pos: [0.5, 1.0, 3.4], target: [0.5, 0.7, 1.5], fov: 32 })}><Ren f={f} p={[0, 0, 1.4]} ry={0.2} pose={{ ...idle(f), armR: [-1.2, 0, 0.3] }} expr="neutral" /><Dog p={[1.2, 0, 1.6]} ry={Math.PI} frame={f} wag={0.6} /><Cans p={[0.6, 0, 2.3]} n={6} /></CityS>;
S[45] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.3, power: false }} cam={glide(f, s, e, head([0, 0, 1.4], [0.5, 0, 1.4], 28), head([0, 0, 1.4], [0.3, 0, 1.2], 26))}><Ren f={f} p={[0, 0, 1.4]} ry={0.2} expr="smug" /></CityS>;
S[46] = (f, s, e) => <CityS f={f} look="night" st={{ green: 0.3, power: false }} cam={glide(f, s, e, { pos: [1.5, 1.3, 3.5], target: [0.5, 0.7, 1.5], fov: 34 }, { pos: [1.0, 1.1, 2.8], target: [0.5, 0.7, 1.5], fov: 32 })}><Ren f={f} p={[0, 0, 1.4]} ry={0.3} pose={{ ...idle(f), lean: 0.2, armR: [-1.0, 0, 0.4] }} expr="sad" /><Radio p={[0.8, 0, 1.9]} frame={f} /><Dog p={[-1, 0, 2]} ry={0.5} frame={f} sleep /></CityS>;
// 1 ano
S[48] = (f, s, e) => <Scene f={f} cam={glide(f, s, e, { pos: [-4, 2, 7], target: [0, 1.5, -2], fov: 38 }, { pos: [-2, 1.8, 6], target: [0, 1.5, -2], fov: 36 })}><GasStation /><Ren f={f} p={[1.5, 0, 0]} ry={-0.4} expr="neutral" /><Dog p={[2.6, 0, 0.6]} ry={Math.PI} frame={f} wag={0.4} /></Scene>;
S[49] = (f, s, e) => half(f, s, e)
  ? <Scene f={f} cam={glide(f, s, e, { pos: [-1, 1.4, 6], target: [0, 1, 0], fov: 36 }, { pos: [-0.5, 1.3, 5], target: [0, 1, 0], fov: 34 })}><GasStation /><group position={[0, 0, 0.5]}><mesh position={[0, 0.5, 0]}><boxGeometry args={[2, 0.6, 1]} /><meshStandardMaterial color="#8a5a3a" /></mesh></group><Ren f={f} p={[-1.6, 0, 0.8]} ry={0.9} expr="sad" /></Scene>
  : <CityS f={f} st={{ green: 0.45, power: false }} cam={glide(f, (s + e) / 2, e, { pos: [-8, 1.5, 6], target: [0, 1, 1.5], fov: 38 }, { pos: [2, 1.5, 6], target: [2, 1, 1.5], fov: 38 })}><Ren f={f} p={[kf(f, [[(s + e) / 2, -5], [e, 4]]), 0, 1.5]} ry={Math.PI / 2} pose={{ ...walk(f * 1.5, 0.8), lean: 0.15 }} expr="smile" /><Dog p={[kf(f, [[(s + e) / 2, -6], [e, 3]]), 0, 2.2]} frame={f} walk={1} wag={1} /></CityS>;
S[50] = (f, s, e) => <Scene f={f} sky={false} look="grey" cam={glide(f, s, e, { pos: [0, 2.2, 9], target: [0, 1.4, -1], fov: 40 }, { pos: [3, 1.8, 7], target: [0, 1.4, -1], fov: 38 })}><Servers frame={f} on={kf(f, [[s, 1], [e - 30, 0]])} /></Scene>;
S[51] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.45, power: false }} cam={glide(f, s, e, head(P0, [0.6, 0, 1.5], 28), head(P0, [0.4, 0, 1.3], 26))}><Ren f={f} expr="sad" pose={{ ...idle(f), armR: [-1.4, 0, 0.1] }} /></CityS>;
S[52] = (f, s, e) => <CityS f={f} st={{ green: kf(f, [[s, 0.4], [e, 0.55]]), power: false }} cam={glide(f, s, e, { pos: [0, 0.3, 4], target: [0, 0.2, 0], fov: 40 }, { pos: [0, 0.5, 3], target: [0, 0.3, 0], fov: 38 })} />;
S[53] = (f, s, e) => <CityS f={f} st={{ green: kf(f, [[s, 0.55], [e, 0.8]]), power: false }} cam={glide(f, s, e, { pos: [-12, 4, 14], target: [0, 2, 0], fov: 40 }, { pos: [-6, 3, 11], target: [0, 2, 0], fov: 40 })}><Ren f={f} p={[0, 0, 1.5]} ry={0.4} /><Dog p={[1, 0, 1.9]} ry={Math.PI} frame={f} wag={0.5} /></CityS>;
S[54] = (f, s, e) => <Scene f={f} look="night" cam={glide(f, s, e, { pos: [0, 4, 24], target: [0, 0, 0], fov: 35 }, { pos: [6, 3, 20], target: [0, 0, 0], fov: 35 })}><Earth frame={f} /><Satellite p={[kf(f, [[s, -4], [e, 2]]), 6.8 - (f - s) * 0.002, 4]} rot={[0.3, f * 0.01, 0.2]} s={0.6} /><Satellite p={[5, -2, 6]} rot={[0, -f * 0.01, 0.4]} s={0.5} /></Scene>;
S[55] = (f, s, e) => {
  const k = clamp01((f - s) / (e - s));
  return <Scene f={f} look="night" cam={glide(f, s, e, { pos: [0, 2, 20], target: [0, 0, 0], fov: 35 }, { pos: [-3, 1, 16], target: [0, -1, 0], fov: 35 })}><Earth frame={f} /><Station p={[kf(f, [[s, -5], [e, 0]]), kf(f, [[s, 7.2], [e, 6.3]]), 3]} rot={[0.2, 0.4, 0.3 + k * 0.6]} s={0.7} burn={clamp01((k - 0.55) / 0.3)} /></Scene>;
};
S[56] = (f, s, e) => <CityS f={f} look="night" st={{ green: 0.6, power: false }} cam={glide(f, s, e, { pos: [0, 1.0, 5], target: [0, 6, -20], fov: 52 }, { pos: [0, 1.0, 4.5], target: [0, 7, -20], fov: 52 })}><Ren f={f} p={[0, 0, 2.5]} ry={Math.PI} pose={{ ...idle(f), head: [-0.5, 0, 0] }} /><Dog p={[1, 0, 2.7]} ry={Math.PI} frame={f} /><Satellite p={[kf(f, [[s, -14], [e, 14]]), kf(f, [[s, 22], [e, 14]]), -30]} s={0.3} burn={1} /></CityS>;
// 10 anos
S[58] = (f, s, e) => <CityS f={f} st={{ green: 0.8, decay: kf(f, [[s, 0.3], [e, 0.55]]), power: false }} cam={glide(f, s, e, { pos: [-8, 5, 10], target: [-6, 4, -8], fov: 40 }, { pos: [-3, 5, 10], target: [-2, 4, -8], fov: 40 })} />;
S[59] = (f, s, e) => <CityS f={f} st={{ green: 0.9, decay: 0.55, power: false }} cam={glide(f, s, e, { pos: [-10, 2.5, 10], target: [0, 1.5, 0], fov: 40 }, { pos: [-5, 2.2, 9], target: [0, 1.5, 0], fov: 40 })}>{[[-2, 1, 0.6], [2.5, -1.2, -2], [5, 0.4, 2.5]].map(([x, z, r], i) => <Deer key={i} p={[x + Math.sin(f * 0.01 + i) * 0.3, 0, z]} ry={r} s={1.2} />)}{[0, 1, 2, 3].map((i) => <Bird key={i} p={[-6 + i * 4, 6 + Math.sin(f * 0.05 + i), -3 + Math.cos(f * 0.04 + i) * 2]} frame={f + i * 7} s={1.6} />)}</CityS>;
S[60] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.9, decay: 0.55, power: false }} cam={glide(f, s, e, { pos: [-10, 1.6, 8], target: [kf(f, [[s, -6], [e, 6]]), 1, 1.5], fov: 38 }, { pos: [10, 1.6, 8], target: [kf(f, [[s, -6], [e, 6]]), 1, 1.5], fov: 38 })}><Ren f={f} p={[kf(f, [[s, -6], [e, 6]]), 0, 1.5]} ry={Math.PI / 2} pose={{ ...walk(f * 1.4, 0.7), lean: 0.12 }} /><Dog p={[kf(f, [[s, -7], [e, 5]]), 0, 2.2]} frame={f} walk={1} old={0.4} /></CityS>;
S[61] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.9, decay: 0.6, power: false }} cam={glide(f, s, e, head(P0, [-0.5, 0, 1.6], 30), head(P0, [-0.3, 0, 1.4], 28))}><Ren f={f} expr="sad" fx={{ lid: 0.35 }} /></CityS>;
S[62] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.95, decay: 0.6, power: false }} cam={glide(f, s, e, { pos: [3, 0.6, 3], target: [2, 0.5, 1.6], fov: 32 }, { pos: [2.6, 0.55, 2.6], target: [2, 0.5, 1.6], fov: 30 })}><Dog p={[2, 0, 1.6]} ry={2.4} frame={f} old={1} wag={0.2} /><Bird p={[0, 1.2 + Math.sin(f * 0.1) * 0.3, 1]} frame={f} /></CityS>;
S[63] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.95, decay: 0.6, power: false }} cam={glide(f, s, e, { pos: [1.4, 0.9, 3.5], target: [0.4, 0.4, 1.5], fov: 34 }, { pos: [1.0, 0.8, 3.0], target: [0.4, 0.4, 1.5], fov: 32 })}><Ren f={f} p={[0, 0, 1.4]} ry={0.4} expr="smile" /><Dog p={[0.55, 0, 1.75]} ry={Math.PI + 0.5} frame={f} old={1} sleep /></CityS>;
S[64] = (f, s, e) => <CityS f={f} look="grey" st={{ green: 0.95, decay: 0.6, power: false }} cam={glide(f, s, e, { pos: [0.4, 1.7, 2.5], target: [0.4, 0.3, 1.6], fov: 34 }, { pos: [0.4, 1.4, 2.1], target: [0.4, 0.3, 1.6], fov: 32 })}><Dog p={[0.55, 0, 1.75]} ry={Math.PI + 0.5} frame={0} old={1} sleep /><Ren f={f} p={[0, 0, 1.4]} ry={0.4} pose={{ ...idle(f), lean: 0.3, armR: [-1.1, 0, 0.3] }} expr="worried" /></CityS>;
S[65] = (f, s, e) => <CityS f={f} look="grey" st={{ green: 0.95, decay: 0.62, power: false }} cam={glide(f, s, e, { pos: [4, 2, 6], target: [1, 1.2, 1], fov: 38 }, { pos: [3, 1.8, 5], target: [1, 1.2, 1], fov: 36 })}><group position={[0, 0, 0]}><mesh position={[1.8, 1.6, -0.2]} castShadow><cylinderGeometry args={[0.25, 0.35, 3.2, 10]} /><meshStandardMaterial color="#7a4f2a" /></mesh><mesh position={[1.8, 3.6, -0.2]}><sphereGeometry args={[1.6, 16, 12]} /><meshStandardMaterial color="#3f9a46" /></mesh></group><Grave p={[1.2, 0, 1]} flowers={false} /><Ren f={f} p={[0, 0, 1.6]} ry={0.6} pose={{ ...idle(f), head: [0.4, 0, 0] }} expr="sad" fx={{ lid: 0.4 }} /></CityS>;
S[66] = (f, s, e) => <CityS f={f} look="grey" st={{ green: 0.95, decay: 0.62, power: false }} cam={glide(f, s, e, head([0, 0, 1.6], [0.6, -0.15, 1.5], 28), head([0, 0, 1.6], [0.35, -0.2, 1.2], 25))}><Ren f={f} p={[0, 0, 1.6]} ry={0.3} pose={{ ...idle(f), head: [0.35, 0, 0] }} expr="sad" fx={{ lid: 0.45, look: [0, 0.6] }} /></CityS>;
S[67] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.95, decay: 0.65, power: false }} cam={glide(f, s, e, { pos: [2, 1.8, 7], target: [0.6, 1, 1], fov: 38 }, { pos: [0, 4, 14], target: [0.6, 1, 1], fov: 42 })}><group><mesh position={[1.8, 1.6, -0.2]}><cylinderGeometry args={[0.25, 0.35, 3.2, 10]} /><meshStandardMaterial color="#7a4f2a" /></mesh><mesh position={[1.8, 3.6, -0.2]}><sphereGeometry args={[1.6, 16, 12]} /><meshStandardMaterial color="#3f9a46" /></mesh></group><Grave p={[1.2, 0, 1]} /><Ren f={f} p={[0, 0, 1.6]} ry={0.6} pose={{ ...idle(f), head: [0.3, 0, 0] }} expr="sad" /></CityS>;
// 100 anos
S[69] = (f, s, e) => <CityS f={f} st={{ green: 1, decay: 0.75, forest: 0.3, power: false }} cam={glide(f, s, e, { pos: [-14, 6, 16], target: [0, 2, -2], fov: 42 }, { pos: [-8, 5, 14], target: [0, 2, -2], fov: 42 })} />;
S[70] = (f, s, e) => half(f, s, e)
  ? <CityS f={f} st={{ green: 1, decay: 0.85, forest: 0.4, power: false }} cam={glide(f, s, e, { pos: [6, 4, 12], target: [4, 2, -8], fov: 40 }, { pos: [2, 4, 12], target: [0, 2, -8], fov: 40 })} />
  : <Scene f={f} look="grey" cam={glide(f, (s + e) / 2, e, { pos: [-20, 4, 26], target: [0, 4, 0], fov: 40 }, { pos: [-14, 3, 22], target: [0, 4, 0], fov: 40 })}><Bridge rust={0.9} fall={clamp01((f - (s + e) / 2) / ((e - s) / 2) * 1.2)} /></Scene>;
S[71] = (f, s, e) => <CityS f={f} st={{ green: 1, decay: 0.95, forest: kf(f, [[s, 0.5], [e, 1]]), power: false, cars: false }} cam={glide(f, s, e, { pos: [-16, 10, 22], target: [0, 2, -4], fov: 45 }, { pos: [-8, 7, 18], target: [0, 2, -4], fov: 45 })} />;
S[72] = (f, s, e) => <Scene f={f} sky={false} look="gold" cam={glide(f, s, e, { pos: [1.5, 1.0, 4], target: [0, 0.6, 0], fov: 36 }, { pos: [1.0, 0.8, 3], target: [0, 0.6, 0], fov: 34 })}><Mall frame={f} dark /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><circleGeometry args={[5, 32]} /><meshStandardMaterial color="#6f9a54" /></mesh><Capybara inflate={0} position={[0, 0, 0]} rotationY={0.6} pose={{}} face={{ expr: "smile", blink: 0 }} /></Scene>;
// 1000 anos
S[74] = (f, s, e) => <CityS f={f} st={{ green: 1, decay: 1, forest: 1, power: false, cars: false }} cam={glide(f, s, e, { pos: [0, 18, 24], target: [0, 0, -4], fov: 45 }, { pos: [0, 12, 18], target: [0, 0, -4], fov: 45 })} />;
S[75] = (f, s, e) => <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [-18, 3, 22], target: [0, 5, -18], fov: 40 }, { pos: [-8, 3, 20], target: [0, 5, -18], fov: 40 })}><Pyramids /></Scene>;
S[76] = (f, s, e) => <Scene f={f} look="day" cam={glide(f, s, e, { pos: [0, 4, 18], target: [0, 8, -10], fov: 40 }, { pos: [4, 5, 14], target: [0, 8, -10], fov: 40 })}><CarvedMountain /></Scene>;
S[77] = (f, s, e) => <CityS f={f} look="grey" st={{ green: 1, decay: 1, forest: 1, power: false, cars: false }} cam={glide(f, s, e, { pos: [0, 0.6, 4], target: [0, 0.2, 0], fov: 38 }, { pos: [0, 0.5, 3], target: [0, 0.2, 0], fov: 36 })}><mesh position={[0.3, 0.06, 0.8]} rotation={[0.2, 0.5, 1.2]}><cylinderGeometry args={[0.12, 0.1, 0.5, 12]} /><meshStandardMaterial color="#4fb3ff" transparent opacity={0.7} /></mesh></CityS>;
S[78] = (f, s, e) => <Scene f={f} look="night" milky cam={glide(f, s, e, { pos: [0, 0, 30], target: [0, 0, 0], fov: 35 }, { pos: [0, 0, 24], target: [0, 0, 0], fov: 35 })}><Voyager p={[kf(f, [[s, -3], [e, 3]]), 0, 0]} rot={[0.3, f * 0.003, 0.2]} s={1.2} /></Scene>;
S[79] = (f, s, e) => <Scene f={f} look="night" cam={glide(f, s, e, { pos: [6, 2, 10], target: [0.5, -0.4, 0], fov: 34 }, { pos: [3.5, 0.6, 6], target: [0.55, -0.6, 0], fov: 32 })}><Voyager rot={[0.15, 1.05, 0.05]} s={1} /></Scene>;
S[80] = (f, s, e) => <Scene f={f} look="night" cam={glide(f, s, e, { pos: [0, 0, 12], target: [0, 0, 0], fov: 35 }, { pos: [0, 0, 26], target: [0, 0, 0], fov: 35 })}><Voyager p={[0, 0, -(f - s) * 0.01]} rot={[0.3, f * 0.003, 0.2]} s={1} /></Scene>;
S[81] = (f, s, e) => <Scene f={f} look="night" cam={glide(f, s, e, { pos: [0, 0, 26], target: [0, 0, 0], fov: 35 }, { pos: [0, 0, 60], target: [0, 0, 0], fov: 35 })}><Voyager p={[0, 0, 0]} rot={[0.3, f * 0.003, 0.2]} s={1} /></Scene>;
S[82] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.15, power: false }} cam={glide(f, s, e, { pos: [0.6, 1.0, 4], target: [0.4, 0.8, 1.5], fov: 34 }, { pos: [0.4, 0.9, 3.4], target: [0.4, 0.8, 1.5], fov: 32 })}><Ren f={f} p={[0, 0, 1.4]} ry={0.3} expr="neutral" /><Dog p={[0.9, 0, 1.7]} ry={Math.PI + 0.4} frame={f} wag={0.6} /></CityS>;
S[83] = (f, s, e) => <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [3, 1.6, 4], target: [0, 2.4, -2.6], fov: 38 }, { pos: [1.5, 1.8, 3.2], target: [0, 2.6, -2.6], fov: 36 })}><OverpassWall written={clamp01((f - s) / (e - s) * 1.2)} /><Ren f={f} p={[1.2, 0, -1.8]} ry={Math.PI + 0.3} pose={{ ...idle(f), armR: [-2.0 + Math.sin(f * 0.5) * 0.15, 0, 0.5] }} /><Dog p={[2.4, 0, -1.2]} ry={2.5} frame={f} wag={0.5} /></Scene>;
S[84] = (f, s, e) => <Scene f={f} look="gold" cam={glide(f, s, e, { pos: [0, 2.6, 6], target: [0, 2.6, -3], fov: 40 }, { pos: [0, 2.6, 9], target: [0, 2.4, -3], fov: 40 })}><OverpassWall written={1} second={clamp01((f - WF(84, /biscoito/) + 6) / 20)} /><Ren f={f} p={[-1.4, 0, -1]} ry={Math.PI + 0.4} /><Dog p={[-0.4, 0, -0.9]} ry={2.2} frame={f} wag={1} /></Scene>;
S[85] = (f, s, e) => <CityS f={f} look="gold" st={{ green: 0.1, power: false }} cam={glide(f, s, e, head(P0, [0.3, -0.05, 1.8], 30), head(P0, [0.15, -0.05, 1.5], 28))}><Ren f={f} expr="neutral" fx={{ look: [0, 0] }} /></CityS>;

/** Plano da fala `li` (cartão de tempo nas falas de título). */
export const renderLine = (li: number, f: number, s: number, e: number): React.ReactNode => {
  const sec = SECTIONS.find(([i]) => i === li);
  if (sec) return <TimeCard f={f} s={s} label={sec[1]} />;
  const r = S[li];
  return r ? r(f, s, e) : <CityS f={f} cam={head(P0, [0.5, 0, 1.8], 30)}><Ren f={f} /></CityS>;
};
export const SHOT_BOUNDS = LINES.map((l, i) => [Math.max(0, l.start - 0.1), i + 1 < LINES.length ? LINES[i + 1].start - 0.1 : TOTAL] as [number, number]);
export const lineAt = (t: number) => { let i = 0; while (i + 1 < SHOT_BOUNDS.length && t >= SHOT_BOUNDS[i + 1][0]) i++; return i; };
