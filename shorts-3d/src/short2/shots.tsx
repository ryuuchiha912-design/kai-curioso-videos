import React from "react";
import { Character, Pose } from "../kit/Character";
import { Expr, FaceState } from "../kit/Face";
import { Sign } from "../kit/props";
import { Backpack, Badge, Bill, GradCap, Candy, CandyBag, Console98, ConsoleNew, CrtTV, FlatTV, Note, Pad98, PadNew, SodaCan, Tear } from "../kit/props2";
import { LivingRoom, Room98 } from "../kit/sets2";
import { Cam, Lights } from "../kit/Stage";
import { blinkAt, clamp01, kf, kf3, pop, rand } from "../kit/anim";
import { GameState, useGameTexture } from "./game";
import { Stage2 } from "./stage";
import { FLUTE_AT, NOTE_GAP, W, mouthFor } from "./timeline";

/**
 * Storyboard do short 2. Cada plano: início/fim (s) e uma função do frame absoluto.
 * Mesma planta nos dois cômodos: TV no fundo (z<0), personagem sentado no tapete olhando pra -z.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };
type V3 = [number, number, number];

const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]], (x) => x),
  target: kf3(f, [[s, a.target], [e, b.target]], (x) => x),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]], (x) => x),
});
const exprAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1], blink = 0;
  for (const [at, ex] of keys) {
    if (f >= at) expr = ex;
    const d = f - at;
    if (d >= -2 && d <= 2) blink = Math.max(blink, 1 - Math.abs(d) / 2.5);
  }
  return { expr, blink };
};

/** Sentado no chão, braços pra frente segurando o controle. `k` 0 = em pé, 1 = sentado. */
const sit = (f: number, k = 1, seed = 0, lean = 0.12): Pose => ({
  legL: -1.45 * k, legR: -1.4 * k, bob: -0.34 * k + Math.sin(f * 0.15 + seed) * 0.006,
  armL: [-1.05 * k, 0, 0.32 * k - 0.18 * (1 - k)], armR: [-1.05 * k, 0, -0.32 * k + 0.18 * (1 - k)],
  lean: lean * k, head: [Math.sin(f * 0.06 + seed) * 0.03, Math.sin(f * 0.05 + seed) * 0.04, 0],
});
/** Afundado no sofá. */
const slump = (f: number): Pose => ({ legL: -1.35, legR: -1.3, bob: -0.05, lean: -0.3, armR: [-1.3, 0, -0.25], armL: [-0.2, 0, -0.35], head: [0.25, 0, 0.05 + Math.sin(f * 0.05) * 0.02] });

// ------------------------------------------------------------ luzes
const sunset98 = (glow = 1) => (
  <>
    <Lights warm="#ffb070" sky="#ffd6a8" key={2.1 * glow} keyPos={[-6, 3.2, 0.5]} />
    <pointLight position={[0, 0.95, -1.0]} color="#a8e6ff" intensity={3.5} distance={4} decay={2} />
  </>
);
const nightNow = (warm = 0) => (
  <>
    <Lights warm={warm > 0.5 ? "#ffb070" : "#9db4ff"} sky={warm > 0.5 ? "#ffd6a8" : "#45568f"} key={0.8 + warm * 1.4} keyPos={[-5, 3.2, 1]} />
    <pointLight position={[-2.3, 1.6, 2.3]} color="#ffb85c" intensity={4} distance={5} decay={2} />
    <pointLight position={[0, 1.25, -1.4]} color="#bfe6ff" intensity={5} distance={5} decay={2} />
  </>
);
const flat = (a: string) => <Lights warm="#fff1dc" sky={a} key={2.2} keyPos={[2, 4, 5]} shadows={false} />;

// ------------------------------------------------------------ TVs com o jogo (componentes: hooks ficam estáveis)
const OldTV: React.FC<{ g: Omit<GameState, "retro"> }> = ({ g }) => {
  const tex = useGameTexture({ ...g, retro: true });
  return (
    <>
      <CrtTV p={[0, 0.45, -1.65]} screen={tex} />
      <Console98 p={[0.3, 0.0, -1.15]} rot={[0, -0.2, 0]} />
    </>
  );
};
const NewTV: React.FC<{ g: Omit<GameState, "retro"> }> = ({ g }) => {
  const tex = useGameTexture({ ...g, retro: false });
  return (
    <>
      <FlatTV p={[0, 0, -2.05]} screen={tex} />
      <ConsoleNew p={[0.75, 0.38, -2.0]} />
    </>
  );
};
const PhoneGame: React.FC<{ g: Omit<GameState, "retro">; p: V3; rot: V3; s?: number }> = ({ g, p, rot, s = 1 }) => {
  const tex = useGameTexture({ ...g, retro: false });
  return (
    <group position={p} rotation={rot} scale={s}>
      <mesh castShadow><boxGeometry args={[0.16, 0.08, 0.01]} /><meshStandardMaterial color="#15161a" roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.0056]}><planeGeometry args={[0.148, 0.07]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};

// ------------------------------------------------------------ peças fixas
const KID_P: V3 = [0, 0, 0.3];
const ADULT_P: V3 = [0.3, 0, 0.25];
const GHOST_P: V3 = [-0.68, 0, -0.05];
const AS = 1.22; // escala do adulto
const kidFace = (f: number, expr: Expr, extra: Partial<FaceState> = {}): FaceState => ({ expr, blink: blinkAt(f, 3), mouthOpen: mouthFor("caio", f), look: [0, 0.05], ...extra });
const adultFace = (f: number, expr: Expr, extra: Partial<FaceState> = {}): FaceState => ({ expr, blink: blinkAt(f, 7, 80), mouthOpen: mouthFor("adulto", f), ...extra });

const Kid: React.FC<{ f: number; face: FaceState; pose?: Pose; p?: V3; ry?: number; hold?: boolean }> = ({ f, face, pose, p = KID_P, ry = Math.PI, hold = true }) => (
  <Character kind="caio" position={p} rotationY={ry} pose={pose ?? sit(f)} face={face} holdR={hold ? <Pad98 p={[-0.06, 0.02, 0.05]} rot={[0.3, 0, 0]} s={0.9} /> : undefined} />
);
const Adult: React.FC<{ f: number; face: FaceState; pose?: Pose; p?: V3; ry?: number; hold?: boolean }> = ({ f, face, pose, p = ADULT_P, ry = Math.PI, hold = true }) => (
  <Character kind="caioAdult" scale={AS} position={p} rotationY={ry} pose={pose ?? sit(f)} face={face} holdR={hold ? <PadNew p={[-0.06, 0.02, 0.05]} rot={[0.3, 0, 0]} s={0.75} /> : undefined} />
);

/** Lanchinho ao lado (1998 e hoje no mesmo lugar: é o "espelho"). */
const Snacks: React.FC<{ old: boolean; candyPop?: number; canPop?: number; canOpen?: number; base?: V3 }> = ({ old, candyPop = 1, canPop = 1, canOpen = 0, base = [-0.45, 0, 0.55] }) => (
  <group position={base}>
    <group scale={[1, Math.max(0.0001, candyPop), 1]}><CandyBag rot={[0, 0.6, 0]} s={1.6} /></group>
    <group position={[0.75, 0, -0.05]} scale={Math.max(0.0001, canPop)}><SodaCan old={old} s={1.7} open={canOpen} /></group>
  </group>
);

/** Notas 3D saindo da TV, a partir do frame `at`, uma a cada 5 frames. */
const NotesOut: React.FC<{ f: number; at: number; from: V3; dir?: V3 }> = ({ f, at, from, dir = [0, 0.25, 0.8] }) => (
  <>
    {[0, 1, 2].map((i) => {
      const t0 = at + i * NOTE_GAP, t = Math.max(0, f - t0) / 30;
      if (f < t0 - 1) return null;
      const s = pop(f, t0, 7);
      const p: V3 = [from[0] + (i - 1) * 0.28 + Math.sin(t * 4 + i) * 0.04, from[1] + dir[1] * t + i * 0.06, from[2] + dir[2] * t];
      return <Note key={i} p={p} rot={[0, 0, Math.sin(t * 5 + i) * 0.25]} s={s * 1.1} c={["#ffd23f", "#ff9e4a", "#ffe68a"][i]} glow={0.9} />;
    })}
  </>
);

/** Plano de "vida passando": um objeto voando na frente da câmera + o ano atrás. */
const lifeShot = (name: string, from: number, to: number, word: number, year: string, colors: [string, string], obj: (k: number, f: number) => React.ReactNode): Shot => ({
  name, from, to,
  render: (f, s, e) => {
    const k = pop(f, W(7, word) - 4, 8);
    const spin = (f - s) * 0.04;
    return (
      <Stage2 background={`radial-gradient(circle at 50% 42%, ${colors[0]} 0%, ${colors[1]} 78%)`} lights={flat(colors[0])}
        cam={glide(f, s, e, { pos: [0, 0.1, 2.3], target: [0, 0.1, 0], fov: 38 }, { pos: [0.15, 0.05, 1.9], target: [0, 0.1, 0], fov: 38 })}
        fg={<>
          <Sign text={year} p={[0, 1.2, -1.4]} w={1.5} h={0.62} bg={colors[1]} fg="#ffffff" border={colors[1]} pop={1} />
          <group position={[0, -0.05 + (1 - k) * -1.2, 0]} rotation={[0.15, -0.5 + spin, 0.08]}>{obj(k, f)}</group>
        </>} />
    );
  },
});

export const SHOTS: Shot[] = [
  // ================= 1998 =================
  // 1. "Mil novecentos e noventa e oito."
  {
    name: "1a rosto iluminado pela TV", from: 0, to: 1.0,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [0.75, 0.95, -0.9], target: [0, 0.84, 0.3], fov: 34 }, { pos: [0.9, 0.98, -1.05], target: [0, 0.82, 0.3], fov: 36 })}
        bg={Room98.back({})} fg={<>{Room98.front()}<Kid f={f} face={kidFace(f, "focused", { look: [0, 0.1] })} /></>} />
    ),
  },
  {
    name: "1b 1998 sobre a TV", from: 1.0, to: 2.0,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [0.8, 1.55, 1.5], target: [0, 0.95, -1.2], fov: 38 }, { pos: [0.6, 1.45, 1.25], target: [0, 1.0, -1.2], fov: 38 })}
        bg={Room98.back({})} fg={<>
          {Room98.front()}
          <OldTV g={{ frame: f, scene: "castle", walk: 0.2 }} />
          <Kid f={f} face={kidFace(f, "focused")} />
          <Snacks old />
          <Sign text="1998" p={[0, 1.55, -1.55]} w={0.95} h={0.42} bg="#ffd23f" fg="#e8432f" border="#ffd23f" pop={pop(f, W(1, 5) - 4, 7)} rot={[0, 0, -0.05]} />
        </>} />
    ),
  },
  // 2. "Esse menino tinha uma missão: salvar um reino inteiro."
  {
    name: "2a menino no tapete (lado)", from: 2.0, to: 3.5,
    render: (f, s, e) => {
      const ex = exprAt(f, [[s, "focused"], [W(2, 4) - 3, "determined"]]);
      return (
        <Stage2 lights={sunset98()} background="#e9a46a"
          cam={glide(f, s, e, { pos: [1.7, 0.75, 0.0], target: [0, 0.7, -0.3], fov: 36 }, { pos: [1.55, 0.85, -0.55], target: [0, 0.72, -0.4], fov: 36 })}
          bg={Room98.back({})} fg={<>
            {Room98.front()}
            <OldTV g={{ frame: f, scene: "castle", walk: (f - s) / 45 }} />
            <Kid f={f} face={{ ...kidFace(f, ex.expr), blink: ex.blink }} pose={sit(f, 1, 0, 0.22)} />
            <Snacks old />
          </>} />
      );
    },
  },
  {
    name: "2b dentro da TV: o reino", from: 3.5, to: 5.0,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [0, 0.93, -0.4], target: [0, 0.91, -1.34], fov: 40 }, { pos: [0, 0.91, -0.55], target: [0, 0.91, -1.34], fov: 40 })}
        bg={Room98.back({})} fg={<>{Room98.front()}<OldTV g={{ frame: f, scene: "castle", walk: 0.3 + (f - s) / 50 }} /></>} />
    ),
  },
  // 3. "Do lado, um pacote de bala e um refri."
  {
    name: "3a pacote de bala", from: 5.0, to: 6.75,
    render: (f, s, e) => {
      const at = W(3, 5) - 4;
      const jump = f >= at ? Math.max(0, Math.sin(clamp01((f - at) / 14) * Math.PI)) * 0.3 : 0;
      return (
        <Stage2 lights={sunset98()} background="#e9a46a"
          cam={glide(f, s, e, { pos: [-0.75, 0.4, 1.3], target: [-0.4, 0.12, 0.55], fov: 34 }, { pos: [-0.62, 0.33, 1.15], target: [-0.4, 0.12, 0.55], fov: 34 })}
          bg={Room98.back({})} fg={<>
            {Room98.front()}
            <Kid f={f} face={kidFace(f, "focused")} />
            <Snacks old candyPop={1 + 0.25 * pop(f, at, 5) - 0.25 * pop(f, at + 5, 6)} canPop={1} />
            <Candy p={[-0.3, 0.06 + jump, 0.62]} rot={[0, f * 0.2, f * 0.15]} s={2} c="#ff6fa3" />
          </>} />
      );
    },
  },
  {
    name: "3b refri suando", from: 6.75, to: 7.6,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [0.55, 0.3, 1.05], target: [0.3, 0.15, 0.5], fov: 32 }, { pos: [0.45, 0.27, 0.92], target: [0.3, 0.15, 0.5], fov: 32 })}
        bg={Room98.back({})} fg={<>
          {Room98.front()}
          <Kid f={f} face={kidFace(f, "focused")} />
          <Snacks old canPop={1 + 0.3 * pop(f, W(3, 8) - 4, 5) - 0.3 * pop(f, W(3, 8) + 1, 6)} />
        </>} />
    ),
  },
  // 4. Caio: "Só mais uma fase, mãe!"
  {
    name: "4a grita pra trás", from: 7.6, to: 8.75,
    render: (f, s, e) => {
      const turn = kf(f, [[s, 0], [s + 5, 1]]);
      return (
        <Stage2 lights={sunset98()} background="#e9a46a"
          cam={glide(f, s, e, { pos: [0.9, 0.95, 1.7], target: [0, 0.85, 0.3], fov: 34 }, { pos: [0.75, 0.9, 1.5], target: [0, 0.85, 0.3], fov: 34 })}
          bg={Room98.back({})} fg={<>
            {Room98.front()}
            <OldTV g={{ frame: f, scene: "castle", walk: 0.6 }} />
            <Kid f={f} face={kidFace(f, "excited", { look: [0.4, 0] })} pose={{ ...sit(f), twist: -0.55 * turn, head: [0, -0.95 * turn, 0] }} />
            <Snacks old />
          </>} />
      );
    },
  },
  {
    name: "4b volta pra TV", from: 8.75, to: 9.4,
    render: (f, s, e) => {
      const turn = kf(f, [[W(4, 4) + 4, 1], [W(4, 4) + 10, 0]]);
      return (
        <Stage2 lights={sunset98()} background="#e9a46a"
          cam={glide(f, s, e, { pos: [-0.85, 0.95, -0.9], target: [0, 0.84, 0.3], fov: 34 }, { pos: [-0.75, 0.92, -1.0], target: [0, 0.84, 0.3], fov: 34 })}
          bg={Room98.back({})} fg={<>{Room98.front()}<Kid f={f} face={kidFace(f, turn > 0.5 ? "happy" : "focused")} pose={{ ...sit(f), twist: -0.55 * turn, head: [0, -0.95 * turn, 0] }} /></>} />
      );
    },
  },
  // 5. "No jogo, tinha uma flauta mágica. Três notas, e uma ponte de luz aparecia."
  {
    name: "5a herói levanta a flauta", from: 9.4, to: 10.95,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [0.05, 0.92, -0.42], target: [0, 0.91, -1.34], fov: 40 }, { pos: [0, 0.91, -0.52], target: [0, 0.91, -1.34], fov: 40 })}
        bg={Room98.back({})} fg={<>{Room98.front()}<OldTV g={{ frame: f, scene: "abyss", flute: kf(f, [[W(5, 4) - 8, 0], [W(5, 4) - 2, 1]]) }} /></>} />
    ),
  },
  {
    name: "5b menino encantado", from: 10.95, to: 12.1,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [-0.85, 0.9, -0.9], target: [0, 0.84, 0.3], fov: 32 }, { pos: [-0.7, 0.92, -1.05], target: [0, 0.84, 0.3], fov: 32 })}
        bg={Room98.back({})} fg={<>{Room98.front()}<Kid f={f} face={kidFace(f, "amazed", { look: [0, 0.1] })} /></>} />
    ),
  },
  {
    name: "5c TRÊS notas saem da TV", from: 12.1, to: 13.5,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [1.15, 1.05, 0.5], target: [0, 0.95, -1.0], fov: 38 }, { pos: [0.95, 1.1, 0.25], target: [0, 1.0, -0.9], fov: 38 })}
        bg={Room98.back({})} fg={<>
          {Room98.front()}
          <OldTV g={{ frame: f, scene: "abyss", flute: 1, notes: (f - FLUTE_AT[0]) / NOTE_GAP + 0.3 }} />
          <Kid f={f} face={kidFace(f, "amazed")} />
          <NotesOut f={f} at={FLUTE_AT[0]} from={[0, 1.0, -1.25]} />
        </>} />
    ),
  },
  {
    name: "5d a ponte de luz", from: 13.5, to: 15.05,
    render: (f, s, e) => (
      <Stage2 lights={sunset98()} background="#e9a46a"
        cam={glide(f, s, e, { pos: [-0.04, 0.92, -0.4], target: [0, 0.91, -1.34], fov: 40 }, { pos: [0.02, 0.91, -0.52], target: [0, 0.91, -1.34], fov: 40 })}
        bg={Room98.back({})} fg={<>{Room98.front()}<OldTV g={{ frame: f, scene: "abyss", flute: 1, notes: 3, bridge: kf(f, [[W(5, 10) - 3, 0], [W(5, 13) + 6, 1]]) }} /></>} />
    ),
  },
  // 6. "Aí os anos passaram."
  {
    name: "6 calendário: anos passando", from: 15.05, to: 16.6,
    render: (f, s, e) => {
      const y = Math.floor(kf(f, [[W(6, 2) - 3, 1998], [e, 2003]], (x) => x));
      const dim = kf(f, [[s, 1], [e, 0.35]]);
      return (
        <Stage2 lights={sunset98(dim)} background="#8a5a3a" blur={0}
          cam={glide(f, s, e, { pos: [-1.0, 1.75, 0.2], target: [-1.5, 2.0, -2.46], fov: 38 }, { pos: [-1.4, 2.0, -1.2], target: [-1.5, 2.05, -2.46], fov: 38 })}
          fg={<>
            {Room98.back({ year: String(y), calendarPop: 1 + 0.08 * Math.sin(f * 1.3) * (y > 1998 ? 1 : 0) })}
            {Room98.front()}
            <Kid f={f} face={kidFace(f, "focused")} />
            {/* folhas voando */}
            {[0, 1, 2, 3].map((k) => {
              const t = (f - (W(6, 2) - 3) - k * 6);
              return t > 0 && t < 16 ? <mesh key={k} position={[-1.5 + t * 0.025, 2.0 + t * 0.02, -2.4 + t * 0.012]} rotation={[t * 0.2, 0, t * 0.12]}><planeGeometry args={[0.3, 0.32]} /><meshStandardMaterial color="#ffffff" side={2} /></mesh> : null;
            })}
          </>} />
      );
    },
  },
  // 7. "Escola. Faculdade. Trabalho. Boleto."
  lifeShot("7a ESCOLA", 16.6, 18.0, 0, "2004", ["#ffd98a", "#ff9a5a"], (k) => <Backpack s={1.3 * k + 0.0001} />),
  lifeShot("7b FACULDADE", 18.0, 19.6, 1, "2012", ["#c9b8ff", "#7a5cd8"], (k) => <GradCap s={1.4 * k + 0.0001} />),
  lifeShot("7c TRABALHO", 19.6, 20.95, 2, "2019", ["#a8dcff", "#4a86c8"], (k) => <Badge p={[0, -0.3, 0]} s={1.5 * k + 0.0001} />),
  lifeShot("7d BOLETO", 20.95, 21.7, 3, "2026", ["#d7dbe3", "#6b7488"], (k) => <Bill s={1.5 * k + 0.0001} />),
  // ================= HOJE =================
  // 8. "Vinte e oito anos depois,"
  {
    name: "8 adulto no sofá + 28 ANOS", from: 21.7, to: 23.3,
    render: (f, s, e) => (
      <Stage2 lights={nightNow()} background="#2c3550"
        cam={glide(f, s, e, { pos: [0.9, 1.5, 0.5], target: [0, 1.42, 2.4], fov: 38 }, { pos: [0.6, 1.5, 0.75], target: [0, 1.45, 2.4], fov: 38 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <Adult f={f} p={[0, 0.25, 2.45]} ry={Math.PI} pose={slump(f)} face={adultFace(f, "neutral", { look: [0.2, 0.4], blink: Math.max(0.35, blinkAt(f, 7, 80)) })} hold={false}
          />
          <PhoneGame g={{ frame: f, scene: "castle" }} p={[0.2, 1.05, 2.05]} rot={[-0.4, Math.PI, 0]} s={0.9} />
          <Sign text="28 ANOS" p={[0.1, 2.34, 2.5]} rot={[0.15, Math.PI + 0.25, 0.05]} w={0.8} h={0.32} bg="#ffffff" fg="#3a4a8a" border="#ffffff" pop={pop(f, W(8, 0) - 4, 7)} />
        </>} />
    ),
  },
  // 9. "saiu a versão nova daquele jogo de aventura."
  {
    name: "9a celular: versão nova", from: 23.3, to: 24.5,
    render: (f, s, e) => (
      <Stage2 lights={nightNow()} background="#2c3550"
        cam={glide(f, s, e, { pos: [0.24, 1.2, 1.75], target: [0.2, 1.05, 2.05], fov: 34 }, { pos: [0.22, 1.14, 1.84], target: [0.2, 1.05, 2.05], fov: 34 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <PhoneGame g={{ frame: f, scene: "castle", walk: (f - s) / 40 }} p={[0.2, 1.05, 2.05]} rot={[-0.4, Math.PI, 0]} s={0.9} />
          <Sign text="NOVO!" p={[0.28, 1.15, 2.0]} rot={[0.4, Math.PI, -0.2]} w={0.11} h={0.05} bg="#e8432f" fg="#ffffff" border="#e8432f" pop={pop(f, W(9, 3) - 4, 6)} />
        </>} />
    ),
  },
  {
    name: "9b olhos crescem", from: 24.5, to: 25.5,
    render: (f, s, e) => {
      const ex = exprAt(f, [[s, "neutral"], [W(9, 5) - 3, "amazed"]]);
      return (
        <Stage2 lights={nightNow()} background="#2c3550"
          cam={glide(f, s, e, { pos: [0.35, 1.6, 0.9], target: [0, 1.5, 2.45], fov: 32 }, { pos: [0.3, 1.58, 1.05], target: [0, 1.5, 2.45], fov: 32 })}
          bg={LivingRoom.back({})} fg={<>
            {LivingRoom.front()}
            <Adult f={f} p={[0, 0.25, 2.45]} ry={Math.PI} pose={slump(f)} face={{ ...adultFace(f, ex.expr), blink: ex.blink, look: [0.15, 0.35] }} hold={false} />
          </>} />
      );
    },
  },
  // 10. Adulto: "Não acredito."
  {
    name: "10 levanta, mão na boca", from: 25.5, to: 27.0,
    render: (f, s, e) => {
      const up = kf(f, [[s, 0], [s + 14, 1]]);
      const hand = kf(f, [[s + 2, 0], [W(10, 0) - 3, 1]]);
      const base = slump(f);
      const pose: Pose = {
        legL: (base.legL ?? 0) * (1 - up), legR: (base.legR ?? 0) * (1 - up), bob: (base.bob ?? 0) * (1 - up),
        lean: (base.lean ?? 0) * (1 - up), armL: [-0.2, 0, -0.35], armR: [-2.4 * hand, 0, -0.25 + 0.35 * hand], head: [0.1 * (1 - up), 0, 0],
      };
      return (
        <Stage2 lights={nightNow()} background="#2c3550"
          cam={glide(f, s, e, { pos: [0.6, 1.5, 0.4], target: [0, 1.45, 2.2], fov: 36 }, { pos: [0.45, 1.6, 0.6], target: [0, 1.7, 2.1], fov: 36 })}
          bg={LivingRoom.back({})} fg={<>
            {LivingRoom.front()}
            <Adult f={f} p={[0, 0.25 * (1 - up), 2.45 - 0.4 * up]} ry={Math.PI} pose={pose} face={adultFace(f, "amazed", { look: [0, 0] })} hold={false} />
          </>} />
      );
    },
  },
  // 11. "Ele sentou no chão. Pegou uma bala. Abriu um refri."
  {
    name: "11a senta no chão (espelho)", from: 27.0, to: 28.75,
    render: (f, s, e) => {
      const k = kf(f, [[s, 0.2], [W(11, 1) - 2, 1]]);
      return (
        <Stage2 lights={nightNow()} background="#2c3550"
          cam={glide(f, s, e, { pos: [2.3, 1.0, 0.3], target: [0.2, 0.9, 0.0], fov: 36 }, { pos: [2.1, 1.1, -0.2], target: [0.2, 0.95, 0.0], fov: 36 })}
          bg={LivingRoom.back({})} fg={<>
            {LivingRoom.front()}
            <NewTV g={{ frame: f, scene: "castle", walk: 0.1 }} />
            <Adult f={f} pose={sit(f, k, 1, 0.22)} face={adultFace(f, "smile")} />
            <Snacks old={false} candyPop={0.0001} canPop={0.0001} />
          </>} />
      );
    },
  },
  {
    name: "11b pegou uma bala (espelho)", from: 28.75, to: 30.45,
    render: (f, s, e) => {
      const at = W(11, 6) - 4;
      const jump = f >= at ? Math.sin(clamp01((f - at) / 14) * Math.PI) * 0.3 : 0;
      return (
        <Stage2 lights={nightNow()} background="#2c3550"
          cam={glide(f, s, e, { pos: [-0.75, 0.4, 1.3], target: [-0.4, 0.12, 0.55], fov: 34 }, { pos: [-0.62, 0.33, 1.15], target: [-0.4, 0.12, 0.55], fov: 34 })}
          bg={LivingRoom.back({})} fg={<>
            {LivingRoom.front()}
            <Adult f={f} face={adultFace(f, "smile")} />
            <Snacks old={false} candyPop={pop(f, W(11, 4) - 4, 7)} canPop={0.0001} />
            {f >= at - 1 && <Candy p={[-0.3, 0.06 + jump, 0.62]} rot={[0, f * 0.2, f * 0.15]} s={2} c="#4cc3ff" />}
          </>} />
      );
    },
  },
  {
    name: "11c abriu um refri (espelho)", from: 30.45, to: 31.85,
    render: (f, s, e) => (
      <Stage2 lights={nightNow()} background="#2c3550"
        cam={glide(f, s, e, { pos: [0.55, 0.3, 1.05], target: [0.3, 0.15, 0.5], fov: 32 }, { pos: [0.45, 0.27, 0.92], target: [0.3, 0.15, 0.5], fov: 32 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <Adult f={f} face={adultFace(f, "smile")} />
          <Snacks old={false} canPop={pop(f, W(11, 7) - 6, 7)} canOpen={kf(f, [[W(11, 9) - 6, 0], [W(11, 9) - 1, 1]])} />
          {/* espirro de gás */}
          {f > W(11, 9) - 2 && f < W(11, 9) + 12 && [0, 1, 2, 3, 4].map((i) => {
            const t = (f - W(11, 9) + 2) / 30;
            return <mesh key={i} position={[0.3 + (rand(i) - 0.5) * 0.1 * t * 8, 0.25 + t * (0.4 + rand(i + 5) * 0.3), 0.5 + (rand(i + 9) - 0.5) * 0.06]}><sphereGeometry args={[0.008, 8, 6]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.8} /></mesh>;
          })}
        </>} />
    ),
  },
  // 12. "E quando a flauta tocou as mesmas três notas,"
  {
    name: "12a herói novo e a flauta", from: 31.85, to: 33.4,
    render: (f, s, e) => (
      <Stage2 lights={nightNow()} background="#2c3550"
        cam={glide(f, s, e, { pos: [0, 1.25, -0.35], target: [0, 1.25, -2.02], fov: 40 }, { pos: [0, 1.25, -0.55], target: [0, 1.25, -2.02], fov: 40 })}
        bg={LivingRoom.back({})} fg={<>{LivingRoom.front()}<NewTV g={{ frame: f, scene: "abyss", flute: kf(f, [[W(12, 3) - 8, 0], [W(12, 3) - 2, 1]]) }} /></>} />
    ),
  },
  {
    name: "12b TRÊS notas saem da TV nova", from: 33.4, to: 34.67,
    render: (f, s, e) => (
      <Stage2 lights={nightNow()} background="#2c3550"
        cam={glide(f, s, e, { pos: [1.6, 1.5, 0.8], target: [0, 1.15, -1.4], fov: 38 }, { pos: [1.45, 1.55, 0.6], target: [0, 1.2, -1.3], fov: 38 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <NewTV g={{ frame: f, scene: "abyss", flute: 1, notes: (f - FLUTE_AT[1]) / NOTE_GAP + 0.3 }} />
          <Adult f={f} face={adultFace(f, "amazed")} />
          <Snacks old={false} />
          <NotesOut f={f} at={FLUTE_AT[1]} from={[0, 1.3, -1.9]} dir={[0, 0.2, 1.1]} />
        </>} />
    ),
  },
  // 13. (silêncio) a luz de 1998 invade a sala, o menino aparece
  {
    name: "13 clímax: a memória chega", from: 34.67, to: 36.27,
    render: (f, s, e) => {
      const warm = kf(f, [[s, 0], [s + 30, 1]]);
      const g = kf(f, [[s + 6, 0], [s + 34, 0.62]]);
      return (
        <Stage2 lights={nightNow(warm)} background={warm > 0.5 ? "#a8704a" : "#2c3550"} tint={["#ff9a3d", 0.55 * warm]}
          cam={glide(f, s, e, { pos: [-0.8, 1.5, -1.35], target: [-0.15, 0.9, 0.2], fov: 50 }, { pos: [0.45, 1.45, -1.45], target: [-0.15, 0.9, 0.2], fov: 50 })}
          bg={LivingRoom.back({ warm })} fg={<>
            {LivingRoom.front()}
            <Adult f={f} face={adultFace(f, "amazed", { look: [-0.3, 0] })} pose={{ ...sit(f, 1, 1), head: [0, -0.25 * warm, 0] }} />
            <Snacks old={false} canOpen={1} />
          </>}
          ghost={<Kid f={f} p={GHOST_P} face={kidFace(f, "focused")} />} ghostOpacity={g} />
      );
    },
  },
  // 14. "por um segundo, ele tinha oito anos de novo."
  {
    name: "14a os dois lado a lado + 8 ANOS", from: 36.27, to: 38.05,
    render: (f, s, e) => (
      <Stage2 lights={nightNow(1)} background="#a8704a" tint={["#ff9a3d", 0.5]}
        cam={glide(f, s, e, { pos: [-0.2, 1.55, -1.6], target: [-0.15, 0.92, 0.2], fov: 48 }, { pos: [-0.1, 1.45, -1.45], target: [-0.15, 0.92, 0.2], fov: 48 })}
        bg={LivingRoom.back({ warm: 1 })} fg={<>
          {LivingRoom.front()}
          <Adult f={f} face={adultFace(f, "amazed", { look: [-0.4, 0] })} pose={{ ...sit(f, 1, 1), head: [0, -0.3, 0] }} />
          <Snacks old={false} canOpen={1} />
          <Sign text="8 ANOS" p={[-0.68, 1.5, -0.05]} rot={[0, Math.PI, 0]} w={0.6} h={0.26} bg="#ffd23f" fg="#e8432f" border="#ffd23f" pop={pop(f, W(14, 5) - 4, 7)} />
        </>}
        ghost={<Kid f={f} p={GHOST_P} face={kidFace(f, "smile", { look: [0.4, 0] })} pose={{ ...sit(f), head: [0, 0.3, 0] }} />} ghostOpacity={0.62} />
    ),
  },
  {
    name: "14b lágrima", from: 38.05, to: 39.1,
    render: (f, s, e) => {
      const ex = exprAt(f, [[s, "amazed"], [s + 6, "tearsJoy"]]);
      // lágrima 3D: desce pela bochecha e cai (coordenadas locais da cabeça)
      const t = clamp01((f - (s + 8)) / 22);
      const slide = Math.min(t / 0.6, 1), fall = Math.max(0, (t - 0.6) / 0.4);
      const ang = 0.15 + slide * 0.6;
      const tear: V3 = [0.16, 0.85 - Math.sin(ang) * 0.47 - fall * fall * 0.5, Math.cos(ang) * 0.47 + 0.01 + fall * 0.05];
      return (
        <Stage2 lights={nightNow(1)} background="#a8704a" tint={["#ff9a3d", 0.45]}
          cam={glide(f, s, e, { pos: [1.1, 1.15, -1.05], target: [0.3, 1.0, 0.25], fov: 30 }, { pos: [1.0, 1.12, -0.95], target: [0.3, 1.0, 0.25], fov: 30 })}
          bg={LivingRoom.back({ warm: 1 })} fg={<>
            {LivingRoom.front()}
            <Adult f={f} face={{ ...adultFace(f, ex.expr), blink: ex.blink }} pose={{ ...sit(f, 1, 1, 0), head: [0, 0, 0] }} />
            {t > 0 && t < 1 && (
              <group position={ADULT_P} rotation={[0, Math.PI, 0]} scale={AS}>
                <Tear p={tear} s={1.1} stretch={1.3 + fall} />
              </group>
            )}
          </>} />
      );
    },
  },
  // 15. Adulto: "Valeu, moleque."
  {
    name: "15a valeu, moleque", from: 39.1, to: 40.25,
    render: (f, s, e) => (
      <Stage2 lights={nightNow(1)} background="#a8704a" tint={["#ff9a3d", 0.45]}
        cam={glide(f, s, e, { pos: [-0.25, 1.35, -1.45], target: [-0.15, 0.95, 0.2], fov: 42 }, { pos: [-0.15, 1.3, -1.3], target: [-0.15, 0.95, 0.2], fov: 42 })}
        bg={LivingRoom.back({ warm: 1 })} fg={<>
          {LivingRoom.front()}
          <Adult f={f} face={adultFace(f, "tearsJoy", { look: [-0.5, 0] })} pose={{ ...sit(f, 1, 1), head: [0, -0.35, 0] }} />
        </>}
        ghost={<Kid f={f} p={GHOST_P} face={kidFace(f, "joy", { look: [0.5, 0] })} pose={{ ...sit(f), head: [0, 0.4, 0] }} />} ghostOpacity={0.62} />
    ),
  },
  {
    name: "15b sobram as duas latas", from: 40.25, to: 41.6,
    render: (f, s, e) => {
      const g = kf(f, [[s, 0.6], [s + 18, 0]]);
      return (
        <Stage2 lights={nightNow(kf(f, [[s, 1], [e, 0.6]]))} background="#7a5a48" tint={["#ff9a3d", 0.35]}
          cam={glide(f, s, e, { pos: [-0.05, 0.4, 1.2], target: [-0.05, 0.12, 0.55], fov: 32 }, { pos: [0.0, 0.33, 1.05], target: [-0.05, 0.12, 0.55], fov: 32 })}
          bg={LivingRoom.back({ warm: 1 })} fg={<>
            {LivingRoom.front()}
            <SodaCan p={[-0.15, 0, 0.55]} old s={1.7} />
            <SodaCan p={[0.1, 0, 0.55]} s={1.7} open={1} />
            {/* brilho subindo onde o menino estava */}
            {Array.from({ length: 10 }).map((_, i) => {
              const t = ((f - s) / 30 + rand(i)) % 1;
              return <mesh key={i} position={[-0.45 + (rand(i + 3) - 0.5) * 0.5, 0.2 + t * 1.2, 0.3 + (rand(i + 7) - 0.5) * 0.3]}><sphereGeometry args={[0.012, 8, 6]} /><meshBasicMaterial color="#ffe6a8" transparent opacity={(1 - t) * Math.min(1, g * 3 + 0.3)} toneMapped={false} /></mesh>;
            })}
          </>}
          ghost={<Kid f={f} p={GHOST_P} face={kidFace(f, "joy")} hold={false} />} ghostOpacity={g} />
      );
    },
  },
  // 16. "Tem jogo que a gente zera. E tem jogo que fica com a gente pra sempre."
  {
    name: "16a de costas, jogando", from: 41.6, to: 43.4,
    render: (f, s, e) => (
      <Stage2 lights={nightNow(0.4)} background="#3a3550" tint={["#ff9a3d", 0.18]}
        cam={glide(f, s, e, { pos: [0.6, 1.0, 2.0], target: [0.1, 1.0, -1.5], fov: 40 }, { pos: [0.4, 1.05, 1.7], target: [0.1, 1.05, -1.5], fov: 40 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <NewTV g={{ frame: f, scene: "abyss", flute: 0, bridge: 1, walk: 0 }} />
          <Adult f={f} face={adultFace(f, "smile")} />
          <Snacks old={false} canOpen={1} />
          <SodaCan p={[0.0, 0, 0.55]} old s={1.7} />
        </>} />
    ),
  },
  {
    name: "16b câmera sobe, fim", from: 43.4, to: 48,
    render: (f, s, e) => (
      <Stage2 lights={nightNow(0.4)} background="#3a3550" tint={["#ff9a3d", 0.18]}
        cam={glide(f, s, e, { pos: [0.3, 1.3, 1.9], target: [0.05, 0.9, -1.0], fov: 42 }, { pos: [0.1, 3.0, 2.4], target: [0.0, 0.6, -0.6], fov: 44 })}
        bg={LivingRoom.back({})} fg={<>
          {LivingRoom.front()}
          <NewTV g={{ frame: f, scene: "castle", walk: (f - s) / 140 }} />
          <Adult f={f} face={adultFace(f, "smile")} />
          <Snacks old={false} canOpen={1} />
          <SodaCan p={[0.0, 0, 0.55]} old s={1.7} />
        </>} />
    ),
  },
];
