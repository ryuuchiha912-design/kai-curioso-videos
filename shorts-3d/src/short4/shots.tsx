import React from "react";
import { Character, Pose } from "../kit/Character";
import { Expr, FaceState } from "../kit/Face";
import { Robot } from "../kit/Robot";
import { Bedroom } from "../kit/sets";
import { Sign } from "../kit/props";
import { Cam, Stage } from "../kit/Stage";
import { blinkAt, kf, kf3, pop } from "../kit/anim";
import { LS, W, mouthFor, talking } from "./timeline";
import { Arrow, BigCoin, Bolt, ECO, FLASH, GiftBox, Knob, LAPTOP, LEO, Laptop, Mic, NIGHT, Panel, ScreenMode, TOP_Y, Table, WARM } from "./world";

/**
 * Storyboard do short 4 ("A voz do Leo").
 * O quarto inteiro é função do frame (room); cada plano só escolhe a câmera (regra 6: corte ~1x/s, câmera sempre andando).
 * Regra 3: número vira objeto na palavra (W = frame da palavra). Regra 5: gesto termina 2–6 quadros antes.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };
type V3 = [number, number, number];

const glide = (f: number, s: number, e: number, a: Cam, b: Cam, ease = (x: number) => x): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]], ease),
  target: kf3(f, [[s, a.target], [e, b.target]], ease),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]], ease),
  roll: kf(f, [[s, a.roll ?? 0], [e, b.roll ?? 0]], ease),
});
const C = (pos: V3, target: V3, fov = 38, roll = 0): Cam => ({ pos, target, fov, roll });

/** Regra 4: a expressão troca no meio de uma piscada forçada. */
const exprAt = (f: number, keys: [number, Expr][]) => {
  let expr = keys[0][1];
  let blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (d >= -2 && d <= 2) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink };
};
const between = (f: number, a: number, b: number) => f >= a && f < b;

// ------------------------------------------------------------------------- estado do mundo
const isNight = (f: number) => between(f, LS(8) - 3, LS(9) - 3);
const flashAmt = (f: number) => Math.max(0, ...[W(8, 3), W(8, 5)].map((w) => (between(f, w - 1, w + 7) ? 1 - Math.abs(f - w) / 7 : 0)));
export const flashAt = (f: number) => (isNight(f) ? flashAmt(f) : 0);

const screenAt = (f: number): ScreenMode => (f < LS(2) - 3 ? "wave" : f < W(3, 4) - 2 ? "prices" : "studio");

const leoFace = (f: number): FaceState => {
  const ex = exprAt(f, [
    [0, "focused"], [W(1, 13) - 3, "amazed"],
    [LS(2) - 3, "worried"],
    [W(3, 4) - 3, "surprised"], [W(3, 12) - 3, "excited"],
    [LS(4) - 2, "amazed"], [W(5, 0) - 3, "surprised"],
    [LS(6) - 3, "focused"], [LS(7) - 3, "excited"],
    [LS(8) - 2, "worried"], [LS(9) - 3, "joy"],
    [LS(10) - 3, "happy"], [LS(11) - 3, "smile"],
    [LS(12) - 3, "excited"], [W(12, 8) + 8, "wink"],
  ]);
  return { expr: ex.expr, blink: Math.max(ex.blink, blinkAt(f, 1, 62)), mouthOpen: mouthFor(["leo"], f), sweat: between(f, LS(2), LS(3)) };
};

const leoPose = (f: number): { pose: Pose; mic: boolean } => {
  const idle = { bob: Math.sin(f * 0.12) * 0.01 };
  const lookEco: V3 = [0, 0.45, 0];
  if (f < LS(2) - 4) return { pose: { ...idle, armR: [-1.25, 0.2, 0.15], head: [0.05, -0.15, 0] }, mic: true };
  if (f < LS(3)) return { pose: { ...idle, armL: [-0.6, 0, 0.5], armR: [-0.6, 0, -0.5], head: [0, -0.2, 0], lean: 0.05 }, mic: false };
  if (f < LS(4) - 4) return { pose: { ...idle, head: [0.15, 0.35, 0], lean: 0.08 }, mic: false };
  if (f < W(5, 0) - 6) return { pose: { ...idle, head: lookEco }, mic: false };
  if (f < LS(6)) {
    const a = pop(f, W(5, 0) - 8, 5);
    return { pose: { ...idle, armR: [-1.45 * a, 0.3 * a, 0.18], head: lookEco, lean: -0.06 * a }, mic: false };
  }
  if (f < LS(9) - 3) return { pose: { ...idle, head: [-0.05, 0.4, 0], lean: isNight(f) ? -0.12 : 0 }, mic: false };
  if (f < LS(10)) {
    const c = Math.abs(Math.sin((f - LS(9)) * 0.45));
    return { pose: { ...idle, armL: [-1.1, 0, 0.35 + c * 0.45], armR: [-1.1, 0, -0.35 - c * 0.45], head: [0.1, 0.2, 0], bob: c * 0.03 }, mic: false };
  }
  if (f < LS(12)) return { pose: { ...idle, head: [-0.15, 0.1, 0] }, mic: false };
  const up = pop(f, W(12, 1) - 8, 6);
  return { pose: { ...idle, armR: [-2.7 * up, 0, 0.15], head: [0, -0.15, 0] }, mic: false };
};

const ecoFace = (f: number): FaceState => {
  const ex = exprAt(f, [
    [0, "excited"], [LS(4) - 3, "happy"], [W(5, 2), "wink"], [LS(6) - 3, "focused"],
    [LS(7) - 3, "determined"], [LS(9) - 3, "smile"], [LS(11) - 3, "focused"], [W(11, 7) - 3, "smile"], [LS(12) - 3, "happy"],
  ]);
  return { expr: ex.expr, blink: Math.max(ex.blink, blinkAt(f, 4, 74)), mouthOpen: mouthFor(["eco", "ecoGrave"], f) };
};

const BOX_IN = W(3, 6), BOX_AT = W(3, 9), ARROW = W(3, 12), LID = W(3, 17) - 2;

const ecoNode = (f: number) => {
  if (f < LID) return null;
  const out = pop(f, LID, 7);
  const jump = kf(f, [[LID, -0.15], [LID + 7, 0.28], [LID + 14, 0]]);
  const night = isNight(f);
  const red = kf(f, [[W(7, 4) - 4, 0], [W(7, 4) - 1, 1], [LS(9) - 4, 1], [LS(9) - 1, 0]]);
  const brows = f < LS(9) - 3 ? pop(f, W(7, 6) - 4, 5) : 0;
  const mustache = pop(f, W(7, 8) - 4, 5);
  let wag = 0;
  if (between(f, LS(4) - 10, LS(4) + 14)) wag = Math.sin((f - LS(4) + 10) * 0.55) * 0.55;
  if (between(f, W(11, 0) - 6, W(11, 3) + 4)) wag = Math.sin((f - W(11, 0) + 6) * 0.7) * 0.5;
  const rotY = f < LS(5) ? -0.25 : f < LS(6) ? -0.7 : -0.3;
  const hop = between(f, LS(9) - 3, LS(10)) ? Math.abs(Math.sin((f - LS(9)) * 0.35)) * 0.08 : 0;
  return (
    <Robot
      frame={f} position={[ECO[0], ECO[1] + jump + hop, ECO[2]]} rotationY={rotY} scale={0.5 * (0.3 + 0.7 * out)}
      face={ecoFace(f)} talk={talking(["eco", "ecoGrave"], f)} red={night ? 1 : red} brows={brows} mustache={mustache} wag={wag}
      squash={1 + 0.08 * Math.sin(f * 0.15)} step={hop ? f * 0.5 : 0}
    />
  );
};

const props = (f: number) => {
  const items: React.ReactNode[] = [];
  // moedona R$0 na palavra "nada"
  const cIn = W(1, 13) - 8;
  if (between(f, cIn, LS(2) + 12)) {
    const y = kf(f, [[cIn, 2.4], [W(1, 13), TOP_Y + 0.3], [W(1, 13) + 4, TOP_Y + 0.42], [W(1, 13) + 8, TOP_Y + 0.3]], (x) => x * x);
    items.push(<BigCoin key="coin" p={[-0.02, y, 0.48]} rot={[0, kf(f, [[cIn, 3], [W(1, 13), 0.2]]), 0]} s={0.8} />);
  }
  // etiquetas de preço em "todo mês"
  [W(2, 5) - 2, W(2, 5) + 3, W(2, 6) - 1].forEach((at, i) => {
    if (between(f, at - 1, W(3, 4)))
      items.push(<Sign key={`tag${i}`} text="R$" p={[0.12 + i * 0.2, 1.1 + (i % 2) * 0.07, 0.15]} rot={[0, -0.25, (i - 1) * 0.2]} w={0.17} h={0.12} bg="#ffd23f" fg="#e8432f" border="#e8432f" pop={pop(f, at, 6)} />);
  });
  // caixa saindo do notebook, seta "baixa", tampa em "computador"
  if (between(f, BOX_IN, LID + 16)) {
    const t = kf(f, [[BOX_IN, 0], [BOX_AT, 1]]);
    const p: V3 = [LAPTOP[0] + (ECO[0] - LAPTOP[0]) * t, kf(f, [[BOX_IN, TOP_Y + 0.2], [BOX_IN + 8, TOP_Y + 0.35], [BOX_AT, TOP_Y]]), LAPTOP[2] + (ECO[2] - LAPTOP[2]) * t];
    const shake = between(f, ARROW, ARROW + 12) ? Math.sin((f - ARROW) * 1.8) * 0.12 * (1 - (f - ARROW) / 12) : between(f, LID - 10, LID) ? Math.sin(f * 2.2) * 0.06 : 0;
    const vanish = 1 - pop(f, LID + 8, 8);
    items.push(<GiftBox key="box" p={p} s={(0.35 + 0.65 * t) * Math.max(vanish, 0.001)} shake={shake} lid={pop(f, LID, 6)} />);
  }
  if (between(f, ARROW - 9, ARROW + 6)) {
    const y = kf(f, [[ARROW - 9, TOP_Y + 1.1], [ARROW, TOP_Y + 0.42]], (x) => x * x);
    items.push(<Arrow key="arrow" p={[ECO[0], y, ECO[2]]} s={1 - pop(f, ARROW + 1, 5) * 0.99} />);
  }
  // "voz nova": placa que vira botões de girar
  if (between(f, W(6, 6) - 3, LS(7) - 4)) {
    const toKnob = pop(f, W(6, 8), 8);
    items.push(<Sign key="nova" text="VOZ NOVA" p={[ECO[0], TOP_Y + 0.62, ECO[2] + 0.3]} w={0.42} h={0.15} bg="#ffffff" fg="#7a5cff" border="#7a5cff" pop={pop(f, W(6, 6) - 2, 6) * (1 - toKnob)} />);
  }
  if (between(f, W(6, 8), LS(8) - 3)) {
    const turns = [kf(f, [[W(7, 4) - 6, 0], [W(7, 4), 2.2]]), kf(f, [[W(7, 6) - 6, 0], [W(7, 6), 2.2]]), kf(f, [[W(7, 8) - 6, 0], [W(7, 8), 2.2]])];
    const cols = ["#ff3b3b", "#ffd23f", "#4ff0d2"];
    [-1, 0, 1].forEach((k, i) =>
      items.push(<Knob key={`knob${i}`} p={[ECO[0] + k * 0.36, TOP_Y + 0.55 + (k === 0 ? 0.1 : 0) + Math.sin(f * 0.1 + i) * 0.02, ECO[2] + 0.15]} s={0.8 * pop(f, W(6, 8) + i * 3, 6)} turn={turns[i]} c={cols[i]} />),
    );
  }
  // placa 100 em "cem"
  if (between(f, W(7, 8) - 3, LS(8) - 3))
    items.push(<Sign key="100" text="100" p={[ECO[0] + 0.24, TOP_Y + 0.42, ECO[2] + 0.3]} rot={[0, -0.3, 0.12]} w={0.26} h={0.18} bg="#ffffff" fg="#e8432f" border="#e8432f" pop={pop(f, W(7, 8) - 2, 6)} />);
  // três telas em "três"
  if (between(f, W(10, 9) - 3, LS(11) - 2)) {
    const P: [V3, V3, "play" | "note" | "camera"][] = [
      [[-0.95, 1.6, 0.0], [0, 0.35, 0.06], "play"],
      [[0.05, 2.05, -0.2], [0, 0, 0], "note"],
      [[1.05, 1.6, 0.0], [0, -0.35, -0.06], "camera"],
    ];
    P.forEach(([p, r, ic], i) =>
      items.push(<Panel key={`panel${i}`} p={[p[0], p[1] + Math.sin(f * 0.08 + i) * 0.03, p[2]]} rot={r} s={1.35 * pop(f, W(10, 9) - 2 + i * 4, 7)} icon={ic} />),
    );
  }
  // regra de ouro
  if (between(f, W(11, 11) - 3, LS(12) - 1))
    items.push(<Sign key="perm" text="SÓ COM PERMISSÃO" p={[ECO[0], TOP_Y + 0.85, ECO[2] + 0.1]} rot={[0, -0.2, 0]} w={0.85} h={0.22} bg="#ffffff" fg="#2f9e6a" border="#2f9e6a" pop={pop(f, W(11, 11) - 2, 6)} />);
  // CTA
  if (f >= W(12, 0) - 3) {
    items.push(<Sign key="cta1" text="COMENTA" p={[0.05, 2.12, 0.2]} w={0.62} h={0.2} bg="#ffffff" fg="#2a1a10" border="#2a1a10" pop={pop(f, W(12, 0) - 2, 6)} />);
    items.push(<Sign key="cta2" text="VOICESTUDIO" p={[0.05, 1.86, 0.22]} w={1.15} h={0.3} bg="#ffd23f" fg="#7a3b8f" border="#2a1a10" pop={pop(f, W(12, 1) - 2, 7)} />);
  }
  // relâmpago na janela
  const fl = flashAt(f);
  if (fl > 0) items.push(<Bolt key="bolt" p={[-0.6, 2.05, -2.4]} s={1.1} on={fl} />);
  return items;
};

/** O quarto completo no frame f. */
const room = (f: number, cam: Cam, blur = 7) => {
  const night = isNight(f);
  const lights = night ? (flashAt(f) > 0.5 ? FLASH : NIGHT) : WARM;
  const lp = leoPose(f);
  return (
    <Stage cam={cam} blur={blur} lights={lights} background={night ? "#1b2148" : "#f6d7a8"}
      bg={Bedroom.back({ night })}
      fg={<>
        {Bedroom.front({ withDesk: false })}
        <Table />
        <Laptop mode={screenAt(f)} f={f} />
        <Character kind="leo" position={LEO} rotationY={0.3} pose={lp.pose} face={leoFace(f)} holdR={lp.mic ? <Mic /> : undefined} />
        {ecoNode(f)}
        {props(f)}
      </>} />
  );
};

// Pontos de referência para as câmeras
const LEO_H: V3 = [LEO[0], 1.12, LEO[2]];
const ECO_H: V3 = [ECO[0], TOP_Y + 0.33, ECO[2]];

export const SHOTS: Shot[] = [
  // 1. "Dá pra narrar um vídeo inteiro com voz de inteligência artificial, sem pagar nada."
  { name: "1a close Leo microfone", from: 0.0, to: 1.4, render: (f, s, e) => room(f, glide(f, s, e, C([-0.15, 1.37, 1.92], LEO_H, 38), C([-0.64, 1.26, 1.43], LEO_H, 36))) },
  { name: "1b quarto aberto", from: 1.4, to: 2.6, render: (f, s, e) => room(f, glide(f, s, e, C([1.6, 1.6, 3.2], [0, 0.9, 0], 40), C([0.8, 1.4, 3.0], [0, 0.9, 0], 40))) },
  { name: "1c tela com ondas", from: 2.6, to: 3.7, render: (f, s, e) => room(f, glide(f, s, e, C([0.45, 1.0, 0.75], [0.3, 0.82, 0.02], 36), C([0.36, 0.95, 0.6], [0.3, 0.82, 0.02], 36)), 4) },
  { name: "1d moeda R$0", from: 3.7, to: 4.75, render: (f, s, e) => room(f, glide(f, s, e, C([0.15, 1.0, 1.7], [-0.1, 0.9, 0.4], 40), C([0.0, 0.95, 1.45], [-0.1, 0.9, 0.4], 40))) },
  // 2. "Mas voz boa custa caro todo mês!"
  { name: "2a Leo preocupado", from: 4.75, to: 5.9, render: (f, s, e) => room(f, glide(f, s, e, C([0.72, 1.36, 1.85], LEO_H, 38), C([0.44, 1.3, 1.65], LEO_H, 38))) },
  { name: "2b tela de preco R$", from: 5.9, to: 7.0, render: (f, s, e) => room(f, glide(f, s, e, C([0.4, 1.08, 1.05], [0.3, 0.95, 0.05], 40), C([0.3, 1.02, 0.9], [0.3, 0.95, 0.05], 40)), 4) },
  // 3. "Só que tem o Voice Studio, de código aberto no GitHub: você baixa e roda no seu computador."
  { name: "3a Leo surpreso", from: 7.0, to: 8.0, render: (f, s, e) => room(f, glide(f, s, e, C([-1.04, 1.3, 1.72], LEO_H, 38), C([-0.77, 1.23, 1.52], LEO_H, 38))) },
  { name: "3b tela Voice Studio", from: 8.0, to: 9.3, render: (f, s, e) => room(f, glide(f, s, e, C([0.3, 0.95, 0.7], [0.3, 0.84, 0.0], 38), C([0.36, 1.0, 0.95], [0.4, 0.82, 0.1], 40)), 4) },
  { name: "3c caixa na mesa", from: 9.3, to: 10.4, render: (f, s, e) => room(f, glide(f, s, e, C([1.3, 1.1, 1.3], [0.6, 0.75, 0.3], 38), C([1.1, 1.0, 1.2], [0.6, 0.75, 0.3], 38))) },
  { name: "3d seta baixa", from: 10.4, to: 11.5, render: (f, s, e) => room(f, glide(f, s, e, C([0.75, 1.5, 1.2], [0.62, 0.8, 0.32], 38), C([0.62, 1.4, 1.0], [0.62, 0.8, 0.32], 38))) },
  { name: "3e tampa pula Eco sai", from: 11.5, to: 12.6, render: (f, s, e) => room(f, glide(f, s, e, C([0.9, 0.95, 1.35], [0.62, 0.9, 0.32], 40), C([0.75, 0.95, 1.2], [0.62, 0.9, 0.32], 40))) },
  // 4. "Oi, Leo! Agora eu falo igualzinho a você."
  { name: "4a Eco oi Leo", from: 12.6, to: 13.9, render: (f, s, e) => room(f, glide(f, s, e, C([0.92, 1.08, 1.46], ECO_H, 36), C([0.62, 1.02, 1.2], ECO_H, 36))) },
  { name: "4b os dois", from: 13.9, to: 15.5, render: (f, s, e) => room(f, glide(f, s, e, C([0.3, 1.25, 2.4], [0.05, 1.0, 0.2], 46), C([-0.1, 1.2, 2.2], [0.05, 1.0, 0.2], 46))) },
  // 5. "Ei! Essa voz é minha!"
  { name: "5a Leo chocado", from: 15.5, to: 16.4, render: (f, s, e) => room(f, glide(f, s, e, C([-0.07, 1.31, 1.55], LEO_H, 36), C([-0.28, 1.24, 1.33], LEO_H, 36))) },
  { name: "5b Leo aponta Eco pisca", from: 16.4, to: 17.4, render: (f, s, e) => room(f, glide(f, s, e, C([-1.1, 1.4, 0.95], [0.5, 0.95, 0.3], 40), C([-1.0, 1.35, 1.15], [0.5, 0.95, 0.3], 40))) },
  // 6. "E dá pra inventar uma voz nova, só escrevendo como ela é."
  { name: "6a Eco e botoes", from: 17.4, to: 18.78, render: (f, s, e) => room(f, glide(f, s, e, C([1.2, 1.2, 1.4], [0.62, 1.0, 0.32], 40), C([0.9, 1.15, 1.3], [0.62, 1.0, 0.32], 40))) },
  { name: "6b VOZ NOVA", from: 18.78, to: 19.81, render: (f, s, e) => room(f, glide(f, s, e, C([0.62, 1.15, 1.35], [0.62, 1.1, 0.4], 40), C([0.6, 1.12, 1.15], [0.62, 1.1, 0.4], 40))) },
  { name: "6c placa vira botoes", from: 19.81, to: 20.9, render: (f, s, e) => room(f, glide(f, s, e, C([0.3, 1.05, 1.15], [0.62, 1.05, 0.35], 40), C([0.45, 1.08, 1.05], [0.62, 1.05, 0.35], 40))) },
  // 7. "Voz de contador de terror, bem grossa, com cem anos de idade!"
  { name: "7a terror antena vermelha", from: 20.9, to: 22.2, render: (f, s, e) => room(f, glide(f, s, e, C([0.62, 1.34, 1.14], [0.62, 1.1, 0.32], 38), C([0.74, 1.28, 1.02], [0.62, 1.1, 0.32], 38))) },
  { name: "7b grossa sobrancelha", from: 22.2, to: 22.95, render: (f, s, e) => room(f, glide(f, s, e, C([0.48, 0.99, 1.13], ECO_H, 32), C([0.59, 0.98, 0.99], ECO_H, 32))) },
  { name: "7c cem anos bigode", from: 22.95, to: 23.9, render: (f, s, e) => room(f, glide(f, s, e, C([1.0, 1.1, 1.25], [0.75, 1.05, 0.3], 40), C([0.85, 1.05, 1.1], [0.75, 1.05, 0.3], 40))) },
  { name: "7d Leo animado", from: 23.9, to: 24.67, render: (f, s, e) => room(f, glide(f, s, e, C([-0.23, 1.23, 1.58], LEO_H, 38), C([-0.5, 1.3, 1.45], LEO_H, 38))) },
  // 8. "Era uma noite escura... e tempestuosa."
  { name: "8a noite contra-plongee", from: 24.67, to: 25.97, render: (f, s, e) => room(f, glide(f, s, e, C([0.75, 0.62, 1.0], [0.62, 1.0, 0.32], 44), C([0.62, 0.66, 0.88], [0.62, 1.0, 0.32], 44, 0.06))) },
  { name: "8b close dramatico", from: 25.97, to: 27.62, render: (f, s, e) => room(f, glide(f, s, e, C([0.62, 0.95, 1.13], ECO_H, 34, -0.04), C([0.62, 0.95, 0.86], ECO_H, 30, 0.08))) },
  // 9. "Ficou melhor que a minha!"
  { name: "9a Leo ri e bate palma", from: 27.62, to: 28.97, render: (f, s, e) => room(f, glide(f, s, e, C([-0.02, 1.3, 1.72], [-0.5, 1.0, 0.1], 40), C([-0.62, 1.36, 1.66], [-0.5, 1.0, 0.1], 40))) },
  // 10. "Com isso, o Leo abriu canal de histórias em três lugares."
  { name: "10a quarto aberto", from: 28.97, to: 30.17, render: (f, s, e) => room(f, glide(f, s, e, C([-1.6, 1.7, 3.0], [0, 1.0, 0], 42), C([-0.8, 1.6, 3.2], [0, 1.0, 0], 42))) },
  { name: "10b Leo no notebook", from: 30.17, to: 31.37, render: (f, s, e) => room(f, glide(f, s, e, C([0.9, 1.3, 1.6], [-0.1, 1.0, 0.1], 40), C([0.6, 1.25, 1.5], [-0.1, 1.0, 0.1], 40))) },
  { name: "10c tres telas", from: 31.37, to: 32.57, render: (f, s, e) => room(f, glide(f, s, e, C([0, 1.4, 3.0], [0, 1.5, -0.3], 48), C([0.3, 1.3, 2.7], [0, 1.45, -0.3], 48))) },
  // 11. "Só uma regra: clone só a sua voz, ou de quem deixou."
  { name: "11a Eco nao-nao", from: 32.57, to: 33.77, render: (f, s, e) => room(f, glide(f, s, e, C([1.06, 1.11, 1.27], [0.62, 1.05, 0.32], 38), C([0.83, 1.05, 1.16], [0.62, 1.05, 0.32], 38))) },
  { name: "11b Eco sua voz", from: 33.77, to: 34.97, render: (f, s, e) => room(f, glide(f, s, e, C([0.38, 1.02, 1.2], ECO_H, 34), C([0.52, 1.02, 1.06], ECO_H, 34))) },
  { name: "11c so com permissao", from: 34.97, to: 35.92, render: (f, s, e) => room(f, glide(f, s, e, C([0.62, 1.3, 1.55], [0.62, 1.2, 0.32], 42), C([0.5, 1.25, 1.35], [0.62, 1.2, 0.32], 42))) },
  // 12. "Comenta Voice Studio que eu te mando o projeto!"
  { name: "12a Leo CTA", from: 35.92, to: 36.3, render: (f, s, e) => room(f, glide(f, s, e, C([0.04, 1.3, 1.85], [-0.15, 1.05, 0.1], 42), C([-0.21, 1.24, 1.6], [-0.15, 1.05, 0.1], 42))) },
  { name: "12b comenta voicestudio", from: 36.3, to: 37.6, render: (f, s, e) => room(f, glide(f, s, e, C([0, 1.35, 2.4], [0, 1.35, 0.1], 46), C([0.15, 1.45, 2.6], [0, 1.4, 0.1], 46))) },
  { name: "12c final sobe", from: 37.6, to: 41, render: (f, s, e) => room(f, glide(f, s, e, C([0.15, 1.45, 2.6], [0, 1.4, 0.1], 46), C([-0.2, 2.0, 3.3], [0, 1.3, 0.1], 46))) },
];
