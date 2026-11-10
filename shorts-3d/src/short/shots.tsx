import React from "react";
import { Character, Fish, Pose } from "../kit/Character";
import { Expr } from "../kit/Face";
import { Bedroom, PetShop, Street } from "../kit/sets";
import { Bowl, Box, Coin, FancyFish, FishBag, FoodJar, Hammer, PiggyBank, Sign } from "../kit/props";
import { Cam, Lights, Stage } from "../kit/Stage";
import { blinkAt, kf, kf3, pop, rand, sec } from "../kit/anim";
import { W, mouthFor } from "./timeline";

/**
 * Storyboard em código. Cada plano: início/fim (s) e uma função do frame absoluto.
 * Regra 6: a câmera nunca para (todo plano tem um movimento), e corta ~1x por segundo.
 * Regra 5: o gesto termina 2–3 frames ANTES da palavra.
 */
export type Shot = { name: string; from: number; to: number; render: (f: number, s: number, e: number) => React.ReactNode };

type V3 = [number, number, number];
const glide = (f: number, s: number, e: number, a: Cam, b: Cam): Cam => ({
  pos: kf3(f, [[s, a.pos], [e, b.pos]], (x) => x),
  target: kf3(f, [[s, a.target], [e, b.target]], (x) => x),
  fov: kf(f, [[s, a.fov ?? 35], [e, b.fov ?? 35]], (x) => x),
});

const run = (f: number, speed = 0.55, amp = 0.9): Pose => {
  const p = Math.sin(f * speed);
  return { legL: p * amp, legR: -p * amp, armL: [-p * amp, 0, -0.3], armR: [p * amp, 0, 0.3], bob: Math.abs(Math.cos(f * speed)) * 0.09, lean: 0.18 };
};
const walk = (f: number, speed = 0.32): Pose => {
  const p = Math.sin(f * speed);
  return { legL: p * 0.5, legR: -p * 0.5, armL: [-p * 0.4, 0, -0.2], bob: Math.abs(Math.cos(f * speed)) * 0.04 };
};
const idle = (f: number, seed = 0): Pose => ({ bob: Math.sin(f * 0.12 + seed) * 0.01, head: [Math.sin(f * 0.05 + seed) * 0.04, Math.sin(f * 0.04 + seed) * 0.08, 0] });

/** Expressão por janelas de tempo; a troca acontece no meio de uma piscada forçada. */
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

const night = <Lights warm="#9db4ff" sky="#3a4a8a" key={0.9} keyPos={[-2, 5, 3]} />;
const sunset = <Lights warm="#ffb07a" sky="#ff9ec4" key={2.2} keyPos={[-6, 3, 4]} />;
const shopLights = <Lights warm="#fff0d6" sky="#8fd8ff" key={2.0} keyPos={[2, 6, 5]} />;

// moedas voando quando o porquinho quebra
const burst = (f: number, f0: number, origin: V3, n = 16) =>
  Array.from({ length: n }).map((_, i) => {
    const t = Math.max(0, (f - f0) / 30);
    const vx = (rand(i) - 0.5) * 2.4, vz = (rand(i + 50) - 0.2) * 1.8, vy = 1.6 + rand(i + 99) * 1.6;
    let y = origin[1] + vy * t - 4.9 * t * t;
    const landed = y < 0.012;
    if (landed) y = 0.012;
    const tl = landed ? (vy + Math.sqrt(vy * vy + 2 * 4.9 * origin[1])) / 9.8 : t;
    const x = origin[0] + vx * Math.min(t, tl), z = origin[2] + vz * Math.min(t, tl);
    return <Coin key={i} p={[x, y, z]} rot={landed ? [0, i, 0] : [t * 12 + i, t * 7, 0]} s={1.3} />;
  });

const LEO_SHOP: V3 = [-0.6, 0, 1.0];
const BOWL_P: V3 = [2.05, 1.03, 0.3];

const FancyTank: React.FC<{ f: number; tag?: React.ReactNode }> = ({ f, tag }) => (
  <group position={[-2.6, 0, -1.0]}>
    <Box s={[1.4, 0.9, 0.8]} p={[0, 0.45, 0]} c="#3a2a44" />
    <Box s={[1.5, 0.06, 0.9]} p={[0, 0.92, 0]} c="#ffd23f" />
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[1.3, 1.05, 0.7]} />
      <meshStandardMaterial color="#9fe3ff" emissive="#7a5cff" emissiveIntensity={0.35} transparent opacity={0.42} roughness={0.05} />
    </mesh>
    <Box s={[1.36, 0.06, 0.76]} p={[0, 2.05, 0]} c="#ffd23f" />
    <FancyFish frame={f} p={[Math.sin(f * 0.03) * 0.3, 1.5 + Math.sin(f * 0.07) * 0.05, 0]} s={1.25} rotY={Math.cos(f * 0.03) > 0 ? 0 : Math.PI} />
    {tag}
  </group>
);

export const SHOTS: Shot[] = [
  // ---------------- 1. "Esse menino juntou moedas por três meses só pra comprar um peixe."
  {
    name: "1a close Léo com cofrinho", from: 0, to: 1.8,
    render: (f, s, e) => {
      const ex = exprAt(f, [[0, "determined"], [W(1, 2) - 3, "smile"]]);
      const heave = Math.sin(f * 0.25) * 0.03;
      return (
        <Stage cam={glide(f, s, e, { pos: [0.35, 1.25, 1.55], target: [0, 1.05, 0], fov: 38 }, { pos: [0.7, 1.15, 2.9], target: [0, 0.95, 0], fov: 36 })}
          bg={Bedroom.back({})} fg={<>
            {Bedroom.front({})}
            <Character kind="leo" pose={{ armL: [-1.15, 0, 0.45], armR: [-1.15, 0, -0.45], lean: -0.08 + heave, bob: heave * 0.5 }} face={{ ...ex, look: [0, -0.3] }} />
            <PiggyBank p={[0, 0.42 + heave, 0.33]} s={0.62} rot={[0, -0.3, 0]} />
          </>} />
      );
    },
  },
  {
    name: "1b calendário 3 MESES", from: 1.8, to: 2.72,
    render: (f, s, e) => (
      <Stage blur={0} cam={glide(f, s, e, { pos: [-2.05, 2.05, -1.05], target: [-2.2, 2.0, -2.46], fov: 40 }, { pos: [-2.2, 2.0, -1.3], target: [-2.2, 2.0, -2.46], fov: 40 })}
        fg={<>
          {Bedroom.back({})}
          <Sign text="3 MESES" p={[-2.2, 1.92, -2.4]} w={0.62} h={0.45} bg="#ffffff" fg="#e8432f" border="#ffffff" pop={pop(f, W(1, 5) - 4, 7)} />
          {/* folhas voando = tempo passando */}
          {[0, 1, 2].map((k) => {
            const t = Math.max(0, f - (W(1, 5) - 14) - k * 3);
            return t > 0 && t < 14 ? <Box key={k} s={[0.6, 0.45, 0.01]} p={[-2.2 + t * 0.04, 1.92 + t * 0.05, -2.38 + t * 0.03]} rot={[t * 0.15, 0, t * 0.1]} c="#ffffff" /> : null;
          })}
        </>} />
    ),
  },
  {
    name: "1c sonho: pôster de peixe", from: 2.72, to: 3.7,
    render: (f, s, e) => {
      const p = 1 + 0.12 * pop(f, W(1, 11) - 3, 5) - 0.12 * pop(f, W(1, 11) + 4, 6);
      return (
        <Stage blur={0} cam={glide(f, s, e, { pos: [2.7, 1.35, 0.5], target: [1.6, 1.9, -2.46], fov: 42 }, { pos: [2.6, 1.45, 0.1], target: [1.6, 2.05, -2.46], fov: 40 })}
          fg={<>
            {Bedroom.back({ posterPop: p })}
            {Bedroom.front({})}
            <Character kind="leo" position={[1.45, 0, -0.75]} rotationY={2.75} pose={{ head: [-0.25, 0, 0] }} face={{ expr: "amazed", blink: blinkAt(f, 2) }} />
          </>} />
      );
    },
  },
  // ---------------- 2. "Todo dia, uma moeda caía no porquinho."
  {
    name: "2a moeda caindo (dia)", from: 3.7, to: 4.98,
    render: (f, s, e) => {
      const fall = kf(f, [[W(2, 3) - 6, 1.25], [W(2, 4) + 2, 0.58]], (x) => x * x);
      const day = Math.floor(kf(f, [[s * 1, 1], [e, 30]], (x) => x));
      return (
        <Stage cam={glide(f, s, e, { pos: [0.55, 0.75, 1.05], target: [0, 0.55, 0], fov: 38 }, { pos: [0.25, 0.7, 0.95], target: [0, 0.6, 0], fov: 38 })}
          bg={Bedroom.back({})} fg={<>
            {Bedroom.front({})}
            <PiggyBank s={1} rot={[0, -0.5, 0]} squash={1 - 0.06 * pop(f, W(2, 4) + 2, 3) + 0.06 * pop(f, W(2, 4) + 5, 4)} />
            {fall > 0.6 && <Coin p={[0, fall, 0]} rot={[Math.PI / 2, 0, -0.5]} s={1.4} />}
            <Sign text={`DIA ${day}`} p={[-0.55, 0.95, -0.4]} rot={[0, 0.35, 0]} w={0.55} h={0.3} bg="#ffffff" fg="#e8432f" />
          </>} />
      );
    },
  },
  {
    name: "2b moeda à noite, Léo com sono", from: 4.98, to: 6.22,
    render: (f, s, e) => {
      const fall = kf(f, [[W(2, 6) - 8, 1.2], [W(2, 6) + 1, 0.58]], (x) => x * x);
      const day = Math.floor(kf(f, [[s, 31], [e, 90]], (x) => x));
      return (
        <Stage lights={night} background="#24305e" cam={glide(f, s, e, { pos: [1.7, 1.3, 2.4], target: [0.2, 0.75, 0], fov: 36 }, { pos: [1.3, 1.25, 2.1], target: [0.2, 0.75, 0], fov: 36 })}
          bg={Bedroom.back({ night: true })} fg={<>
            {Bedroom.front({})}
            <PiggyBank p={[0.45, 0, 0.3]} s={1} rot={[0, -0.9, 0]} />
            <Character kind="leo" position={[-0.25, 0, 0]} rotationY={0.6} pose={{ armR: [-1.0, 0, -0.1], head: [0.15, 0, 0.12] }} face={{ expr: "joy", blink: 0 }} />
            {fall > 0.6 && <Coin p={[0.45, fall, 0.3]} rot={[Math.PI / 2, 0, -0.9]} s={1.4} />}
            <Sign text={`DIA ${day}`} p={[1.3, 1.05, -0.6]} rot={[0, -0.3, 0]} w={0.55} h={0.3} bg="#ffffff" fg="#3a4a8a" />
          </>} />
      );
    },
  },
  // ---------------- 3. "No sábado, ele quebrou o cofrinho."
  {
    name: "3a SÁBADO", from: 6.22, to: 7.12,
    render: (f, s, e) => (
      <Stage blur={0} cam={glide(f, s, e, { pos: [-2.0, 1.95, -1.3], target: [-2.2, 2.0, -2.46], fov: 40 }, { pos: [-2.25, 2.0, -1.5], target: [-2.2, 2.0, -2.46], fov: 40 })}
        fg={<>
          {Bedroom.back({})}
          <Sign text="SÁBADO!" p={[-2.2, 1.92, -2.4]} w={0.62} h={0.45} bg="#ffd23f" fg="#e8432f" border="#ffd23f" pop={pop(f, W(3, 1) - 4, 7)} rot={[0, 0, -0.08]} />
        </>} />
    ),
  },
  {
    name: "3b martelada", from: 7.12, to: 8.35,
    render: (f, s, e) => {
      const hit = W(3, 3) - 2;
      const armX = kf(f, [[s, -0.5], [s + 5, -2.7], [hit - 4, -2.8], [hit, -0.85]], (x) => x);
      const crack = Math.min(1, Math.max(0, (f - hit) / 10));
      const ex = exprAt(f, [[s, "determined"], [hit - 3, "worried"], [hit + 8, "surprised"]]);
      return (
        <Stage cam={glide(f, s, e, { pos: [1.4, 1.0, 2.6], target: [0.15, 0.6, 0.3], fov: 38 }, { pos: [1.0, 0.85, 2.3], target: [0.15, 0.55, 0.3], fov: 38 })}
          bg={Bedroom.back({})} fg={<>
            {Bedroom.front({})}
            <Character kind="leo" pose={{ armR: [armX, 0, -0.05], armL: [-0.4, 0, -0.5], lean: f > hit ? 0.12 : -0.05 }} face={ex} holdR={<Hammer rot={[0, 0, 0]} />} />
            <PiggyBank p={[0.22, 0, 0.62]} s={0.75} rot={[0, -0.4, 0]} crack={crack} />
            {f >= hit && burst(f, hit, [0.22, 0.25, 0.62])}
          </>} />
      );
    },
  },
  // ---------------- 4. "Doze reais e cinquenta centavos."
  {
    name: "4 R$ 12,50", from: 8.35, to: 10.5,
    render: (f, s, e) => {
      const a = kf(f, [[s, 0.4], [e, -0.15]], (x) => x);
      const cheer = pop(f, W(4, 0) - 5, 6);
      const ex = exprAt(f, [[s, "surprised"], [W(4, 0) - 4, "excited"]]);
      return (
        <Stage cam={{ pos: [Math.sin(a) * 2.4, 1.1, Math.cos(a) * 2.4 + 0.3], target: [0, 0.85, 0.3], fov: 40 }}
          bg={Bedroom.back({})} fg={<>
            {Bedroom.front({})}
            <Character kind="leo" position={[0, 0, -0.35]} pose={{ armL: [-0.3, 0, -2.0 * cheer - 0.2], armR: [-0.3, 0, 2.0 * cheer + 0.2], bob: Math.abs(Math.sin(f * 0.4)) * 0.05 * cheer }} face={ex} />
            {[[-0.35, 0.4, 5], [0, 0.55, 4], [0.35, 0.4, 3]].map(([x, z, n], k) =>
              Array.from({ length: n }).map((_, i) => <Coin key={`${k}-${i}`} p={[x, 0.012 + i * 0.022, z]} rot={[0, i, 0]} s={1.3} />),
            )}
            <Coin p={[0.2, 0.012, 0.75]} rot={[0, 0, 0]} s={1.0} />
            <Sign text="R$ 12,50" p={[0, 1.95, -0.2]} rot={[-0.15, a * 0.8, 0]} w={1.0} h={0.42} bg="#7cf06b" fg="#1b4d12" border="#1b4d12" pop={pop(f, W(4, 0) - 4, 7)} />
          </>} />
      );
    },
  },
  // ---------------- 5. "Ele correu pela rua até o petshop da esquina."
  {
    name: "5a correndo na rua", from: 10.5, to: 11.75,
    render: (f, s, e) => {
      const x = kf(f, [[s, -3.5], [e, 3.2]], (t) => t);
      return (
        <Stage background="#9fdcff" blur={4} cam={{ pos: [x + 0.4, 1.0, 3.6], target: [x + 0.6, 0.85, -1.2], fov: 38 }}
          bg={Street.back({ frame: f })} fg={<>
            {Street.front({ frame: f })}
            <Character kind="leo" position={[x, 0, -1.2]} rotationY={Math.PI / 2} pose={run(f)} face={{ expr: "excited", blink: blinkAt(f, 4) }} />
          </>} />
      );
    },
  },
  {
    name: "5b chegando no petshop", from: 11.75, to: 12.9,
    render: (f, s, e) => {
      const x = kf(f, [[s, 5.0], [s + 18, 7.6]], (t) => t);
      const arrived = f > s + 18;
      return (
        <Stage background="#9fdcff" blur={1.5} cam={glide(f, s, e, { pos: [7.0, 0.55, 3.2], target: [8.0, 1.9, -2.2], fov: 46 }, { pos: [7.5, 0.5, 2.7], target: [8.2, 2.1, -2.2], fov: 46 })}
          bg={Street.back({ frame: f })} fg={<>
            {Street.front({ frame: f })}
            <Character kind="leo" position={[x, 0, -0.9]} rotationY={arrived ? Math.PI * 0.85 : Math.PI / 2} pose={arrived ? { head: [-0.35, 0, 0] } : run(f)} face={{ expr: arrived ? "amazed" : "excited", blink: blinkAt(f, 5) }} />
          </>} />
      );
    },
  },
  // ---------------- 6. "Lá dentro, uma parede inteira de aquários brilhando."
  {
    name: "6a Léo pequeno diante da parede", from: 12.9, to: 14.3,
    render: (f, s, e) => (
      <Stage lights={shopLights} background="#20365e" blur={2.5} cam={glide(f, s, e, { pos: [0.2, 0.35, 4.0], target: [0, 1.6, -2.9], fov: 50 }, { pos: [0.0, 0.3, 3.4], target: [0, 1.75, -2.9], fov: 50 })}
        bg={PetShop.back({ frame: f })} fg={<>
          {PetShop.front({ withCounter: false })}
          <Character kind="leo" position={[0, 0, 1.4]} rotationY={Math.PI} pose={{ head: [-0.3, Math.sin(f * 0.08) * 0.2, 0], armL: [0, 0, -0.5], armR: [0, 0, 0.5] }} face={{ expr: "amazed" }} />
        </>} />
    ),
  },
  {
    name: "6b travelling nos aquários", from: 14.3, to: 15.85,
    render: (f, s, e) => (
      <Stage lights={shopLights} background="#20365e" blur={0} cam={glide(f, s, e, { pos: [-2.6, 1.5, -1.5], target: [-2.0, 1.4, -2.9], fov: 42 }, { pos: [1.4, 1.75, -1.5], target: [2.0, 1.7, -2.9], fov: 42 })}
        fg={<>{PetShop.back({ frame: f, glow: 1.15 })}{PetShop.front({ withCounter: false })}</>} />
    ),
  },
  // ---------------- 7. Bia: "Oi! Posso te ajudar?"
  {
    name: "7 Bia aparece", from: 15.85, to: 17.55,
    render: (f, s, e) => {
      const up = pop(f, W(7, 0) - 6, 6);
      const wave = Math.sin(f * 0.6) * 0.35;
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [0.55, 1.35, 2.5], target: [1.0, 1.2, -0.4], fov: 36 }, { pos: [0.8, 1.32, 2.2], target: [1.0, 1.25, -0.4], fov: 36 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Character kind="bia" position={[1.0, -0.6 + 0.6 * up, -0.45]} pose={{ armR: [-0.4, 0, 1.75 + wave], head: [0, 0, wave * 0.2] }} face={{ expr: "happy", blink: blinkAt(f, 7), mouthOpen: mouthFor("bia", f) }} />
          </>} />
      );
    },
  },
  // ---------------- 8. Léo: "Eu quero o peixe mais bonito da loja!"
  {
    name: "8 Léo aponta", from: 17.55, to: 19.6,
    render: (f, s, e) => {
      const pt = pop(f, W(8, 3) - 6, 6);
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [0.9, 1.0, 3.3], target: [-0.6, 1.0, 1.0], fov: 36 }, { pos: [0.6, 1.0, 3.0], target: [-0.7, 1.05, 1.0], fov: 36 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Character kind="leo" position={LEO_SHOP} rotationY={-0.25} pose={{ armL: [-1.45 * pt, 0, -0.2 - 0.5 * pt], bob: Math.abs(Math.sin(f * 0.35)) * 0.03, lean: 0.05 * pt }}
              face={{ expr: "excited", blink: blinkAt(f, 8), mouthOpen: mouthFor("leo", f) }} />
          </>} />
      );
    },
  },
  // ---------------- 9. "Mas o peixe mais bonito custava trinta reais."
  {
    name: "9a o peixe chique", from: 19.6, to: 21.25,
    render: (f, s, e) => (
      <Stage lights={shopLights} background="#20365e" blur={5} cam={glide(f, s, e, { pos: [-1.6, 1.6, 1.0], target: [-2.6, 1.5, -1.0], fov: 34 }, { pos: [-2.0, 1.55, 0.45], target: [-2.6, 1.5, -1.0], fov: 34 })}
        bg={PetShop.back({ frame: f })} fg={<>{PetShop.front({})}<FancyTank f={f} /></>} />
    ),
  },
  {
    name: "9b etiqueta R$ 30", from: 21.25, to: 22.28,
    render: (f, s, e) => {
      const spin = kf(f, [[s, Math.PI], [W(9, 6) - 2, 0]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={5} cam={glide(f, s, e, { pos: [-2.25, 1.22, 0.25], target: [-2.35, 1.2, -0.55], fov: 34 }, { pos: [-2.3, 1.22, 0.05], target: [-2.35, 1.2, -0.55], fov: 34 })}
          bg={PetShop.back({ frame: f })} fg={<>{PetShop.front({})}
            <FancyTank f={f} tag={<Sign text="R$ 30,00" p={[0.25, 1.2, 0.45]} rot={[0, spin, 0.08]} w={0.5} h={0.26} bg="#ff4b4b" fg="#ffffff" border="#ffffff" />} />
          </>} />
      );
    },
  },
  // ---------------- 10. "O sorriso dele sumiu."
  {
    name: "10 sorriso some", from: 22.28, to: 23.78,
    render: (f, s, e) => {
      const ex = exprAt(f, [[s, "excited"], [W(10, 3) - 3, "sad"]]);
      const sad = f >= W(10, 3) - 3;
      return (
        <Stage lights={shopLights} background="#20365e" blur={7} cam={glide(f, s, e, { pos: [-0.25, 1.3, 2.6], target: [-0.6, 1.25, 1.0], fov: 32 }, { pos: [-0.35, 1.28, 2.1], target: [-0.6, 1.22, 1.0], fov: 32 })}
          bg={PetShop.back({ frame: f, glow: sad ? 0.6 : 1 })} fg={<>
            {PetShop.front({})}
            <Character kind="leo" position={LEO_SHOP} rotationY={0.2} pose={{ head: [sad ? 0.18 : 0, 0, 0], squash: sad ? 0.97 : 1 }} face={{ ...ex, sweat: sad, look: sad ? [0, 0.6] : [0, 0] }} />
          </>} />
      );
    },
  },
  // ---------------- 11. "Até que, num aquário pequeno no canto, um peixinho laranja nadou direto até ele."
  {
    name: "11a aquário pequeno no canto", from: 23.78, to: 25.5,
    render: (f, s, e) => (
      <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [3.0, 1.55, 1.9], target: [2.0, 1.25, 0.3], fov: 36 }, { pos: [2.65, 1.4, 1.45], target: [2.05, 1.3, 0.3], fov: 36 })}
        bg={<>{PetShop.back({ frame: f })}</>} fg={<>
          {PetShop.front({})}
          <Bowl p={BOWL_P} s={0.8}><Fish frame={f} position={[Math.sin(f * 0.05) * 0.12, 0, -0.05]} rotationY={Math.cos(f * 0.05) > 0 ? 0 : Math.PI} scale={0.55} /></Bowl>
          <Character kind="leo" position={LEO_SHOP} rotationY={0.2} pose={{ head: [0.18, 0, 0] }} face={{ expr: "sad", blink: blinkAt(f, 9) }} />
        </>} />
    ),
  },
  {
    name: "11b peixinho vem até o vidro", from: 25.5, to: 27.42,
    render: (f, s, e) => {
      const come = kf(f, [[W(11, 7) - 4, 0], [W(11, 9) - 2, 1]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [2.05, 1.32, 1.35], target: [2.05, 1.27, 0.3], fov: 34 }, { pos: [2.05, 1.3, 1.1], target: [2.05, 1.27, 0.3], fov: 34 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Bowl p={BOWL_P} s={0.8}>
              <Fish frame={f} position={[0.12 * (1 - come), Math.sin(f * 0.2) * 0.01, -0.05 + 0.28 * come]} rotationY={kf(f, [[W(11, 7) - 4, 0], [W(11, 8), -Math.PI / 2]])} scale={0.55} />
            </Bowl>
          </>} />
      );
    },
  },
  {
    name: "11c Léo percebe", from: 27.42, to: 28.45,
    render: (f, s, e) => {
      const turn = kf(f, [[s + 2, 0.2], [s + 8, 1.0]]);
      const ex = exprAt(f, [[s, "sad"], [s + 7, "surprised"]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={7} cam={glide(f, s, e, { pos: [1.2, 1.25, 1.35], target: [-0.6, 1.2, 1.0], fov: 32 }, { pos: [1.0, 1.25, 1.3], target: [-0.6, 1.2, 1.0], fov: 32 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Character kind="leo" position={LEO_SHOP} rotationY={turn} pose={{ head: [0, 0.2, 0] }} face={{ ...ex, look: [0.5, 0] }} />
          </>} />
      );
    },
  },
  // ---------------- 12. "A plaquinha dizia: doze reais."
  {
    name: "12 plaquinha R$ 12", from: 28.45, to: 30.8,
    render: (f, s, e) => {
      const flip = kf(f, [[W(12, 3) - 6, Math.PI], [W(12, 3) - 1, 0]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [2.35, 1.2, 1.3], target: [2.05, 1.12, 0.55], fov: 34 }, { pos: [2.2, 1.15, 1.05], target: [2.05, 1.12, 0.55], fov: 34 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Bowl p={BOWL_P} s={0.8}><Fish frame={f} position={[0, 0, 0.18]} rotationY={-Math.PI / 2} scale={0.55} /></Bowl>
            <group position={[2.05, 1.03, 0.62]} scale={pop(f, W(12, 1) - 4, 7)}>
              <Sign text="R$ 12" p={[0, 0.12, 0]} rot={[-0.25, flip, -0.12]} w={0.32} h={0.2} bg="#fff3c4" fg="#1d3d8f" border="#c9a35a" />
            </group>
          </>} />
      );
    },
  },
  // ---------------- 13. Léo: "É esse! É ele!"
  {
    name: "13 É esse!", from: 30.8, to: 32.3,
    render: (f, s, e) => {
      const j1 = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - (W(13, 0) - 4)) / 10))));
      const j2 = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - (W(13, 2) - 4)) / 10))));
      const jump = Math.max(j1, j2);
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [2.5, 1.75, -0.9], target: [1.7, 1.2, 1.1], fov: 40 }, { pos: [2.4, 1.7, -0.7], target: [1.7, 1.25, 1.1], fov: 40 })}
          bg={PetShop.back({ frame: f })} fg={<>
            <Bowl p={BOWL_P} s={0.8}><Fish frame={f} position={[0, jump * 0.08, 0.15]} rotationY={Math.PI / 2} scale={0.55} /></Bowl>
            <Character kind="leo" position={[1.7, 0.1 + jump * 0.28, 1.15]} rotationY={Math.PI} pose={{ armL: [-0.4, 0, -2.2 * jump - 0.4], armR: [-0.4, 0, 2.2 * jump + 0.4], squash: 1 + jump * 0.05 }}
              face={{ expr: "excited", blink: blinkAt(f, 3), mouthOpen: mouthFor("leo", f) }} />
          </>} />
      );
    },
  },
  // ---------------- 14. "Ele contou as moedas no balcão, uma por uma."
  {
    name: "14 contando moedas", from: 32.3, to: 34.92,
    render: (f, s, e) => {
      const start = W(14, 1);
      const per = (W(14, 8) - start) / 12;
      const n = Math.max(0, Math.min(12, Math.floor((f - start) / per) + 1));
      return (
        <Stage lights={shopLights} background="#20365e" blur={0} cam={glide(f, s, e, { pos: [0.7, 1.85, 1.35], target: [1.0, 1.05, 0.25], fov: 40 }, { pos: [1.2, 1.85, 1.3], target: [1.0, 1.05, 0.25], fov: 40 })}
          fg={<>
            {PetShop.front({})}
            {Array.from({ length: 12 }).map((_, i) => {
              const t0 = start + i * per;
              const k = kf(f, [[t0, 0], [t0 + per * 0.8, 1]]);
              return <Coin key={i} p={[0.62 + k * 0.7, 1.04 + (k > 0.99 ? i * 0.02 : 0), 0.32 + (i % 3) * 0.05 * (1 - k)]} rot={[0, i, 0]} s={1.2} />;
            })}
            <Sign text={`${n}`} p={[1.0, 1.42, -0.05]} rot={[-0.4, 0, 0]} w={0.45} h={0.35} bg="#ffd23f" fg="#1d3d8f" pop={n > 0 ? 1 + 0.15 * (1 - Math.min(1, ((f - start) % per) / 4)) : 0} />
          </>} />
      );
    },
  },
  // ---------------- 15. "Sobraram cinquenta centavos. E a Bia ainda deu um potinho de ração de presente."
  {
    name: "15a sobraram R$ 0,50", from: 34.92, to: 37.45,
    render: (f, s, e) => {
      const back = kf(f, [[W(15, 0), 0], [W(15, 1) - 3, 1]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={5} cam={glide(f, s, e, { pos: [0.6, 1.5, 1.4], target: [0.6, 1.05, 0.3], fov: 36 }, { pos: [0.5, 1.45, 1.2], target: [0.6, 1.05, 0.3], fov: 36 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            {Array.from({ length: 12 }).map((_, i) => <Coin key={i} p={[1.5, 1.04 + i * 0.02, 0.3]} rot={[0, i, 0]} s={1.2} />)}
            <Coin p={[1.3 - back * 0.85, 1.04, 0.3 + back * 0.1]} rot={[0, back * 6, 0]} s={0.9} />
            <Sign text="R$ 0,50" p={[0.45, 1.32, 0.35]} rot={[-0.2, 0, 0.06]} w={0.5} h={0.24} bg="#7cf06b" fg="#1b4d12" border="#1b4d12" pop={pop(f, W(15, 1) - 4, 7)} />
          </>} />
      );
    },
  },
  {
    name: "15b presente da Bia", from: 37.45, to: 40.25,
    render: (f, s, e) => {
      const give = pop(f, W(15, 9) - 6, 8);
      const exL = exprAt(f, [[s, "happy"], [W(15, 13) - 3, "tearsJoy"]]);
      const exB = exprAt(f, [[s, "smile"], [W(15, 13) - 2, "wink"]]);
      return (
        <Stage lights={shopLights} background="#20365e" blur={6} cam={glide(f, s, e, { pos: [1.8, 1.45, 2.8], target: [-0.15, 1.15, 0.35], fov: 40 }, { pos: [1.6, 1.4, 2.55], target: [-0.15, 1.15, 0.35], fov: 40 })}
          bg={PetShop.back({ frame: f })} fg={<>
            {PetShop.front({})}
            <Character kind="bia" position={[0.6, 0, -0.45]} rotationY={-0.2} pose={{ armR: [-1.3 * give - 0.1, 0, -0.2], lean: 0.12 * give }} face={{ ...exB }}
              holdR={give > 0.05 ? <FoodJar p={[0, -0.08, 0.06]} s={0.9} /> : undefined} />
            <Character kind="leo" position={[-0.55, 0, 1.0]} rotationY={Math.PI * 0.75} pose={{ armL: [-1.0 * give, 0, 0.3], armR: [-1.0 * give, 0, -0.3], head: [-0.2, 0, 0] }} face={exL}
              holdR={<FishBag p={[0, 0.05, 0]} s={0.6}><Fish frame={f} rotationY={-Math.PI / 2} scale={0.8} /></FishBag>} />
          </>} />
      );
    },
  },
  // ---------------- 16. "Ele voltou pra casa sem tirar os olhos do saquinho."
  {
    name: "16a voltando, pôr do sol", from: 40.25, to: 41.55,
    render: (f, s, e) => {
      const x = kf(f, [[s, 6.0], [e, 4.4]], (t) => t);
      return (
        <Stage lights={sunset} background="#ffb07a" blur={4} cam={{ pos: [x - 0.6, 1.0, 3.4], target: [x - 0.6, 1.0, -1.2], fov: 38 }}
          bg={Street.back({ frame: f, sky: "#ffa66b", sun: "#ffe08a" })} fg={<>
            {Street.front({ frame: f })}
            <Character kind="leo" position={[x, 0, -1.0]} rotationY={-Math.PI / 2 + 0.3} pose={{ ...walk(f), armR: [-1.6, 0, -0.25], head: [-0.15, 0.3, 0] }} face={{ expr: "joy" }}
              holdR={<FishBag p={[0, 0.05, 0]} s={0.6} swing={Math.sin(f * 0.3) * 0.15}><Fish frame={f} rotationY={0} scale={0.8} /></FishBag>} />
          </>} />
      );
    },
  },
  {
    name: "16b olhando o saquinho", from: 41.55, to: 42.98,
    render: (f, s, e) => (
      <Stage lights={sunset} background="#ffb07a" blur={8} cam={glide(f, s, e, { pos: [3.1, 1.3, 0.2], target: [4.0, 1.15, -1.0], fov: 34 }, { pos: [3.2, 1.28, 0.0], target: [4.0, 1.18, -1.0], fov: 34 })}
        bg={Street.back({ frame: f, sky: "#ffa66b", sun: "#ffe08a" })} fg={<>
          {Street.front({ frame: f })}
          <Character kind="leo" position={[4.0, 0, -1.0]} rotationY={-Math.PI / 2 + 0.9} pose={{ ...walk(f), armR: [-1.65, 0.2, -0.45], head: [0, 0.35, 0] }} face={{ expr: "tearsJoy", look: [0.4, 0] }}
            holdR={<FishBag p={[0, 0.05, 0]} s={0.6} swing={Math.sin(f * 0.3) * 0.1}><Fish frame={f} rotationY={Math.PI / 2} scale={0.8} /></FishBag>} />
        </>} />
    ),
  },
  // ---------------- 17. "E deu ao peixe o nome mais justo do mundo:"
  {
    name: "17 quarto à noite, aquário novo", from: 42.98, to: 45.36,
    render: (f, s, e) => (
      <Stage background="#24305e" blur={4}
        lights={<>{night}<pointLight position={[-1.5, 1.25, -1.45]} intensity={3.5} distance={4} color="#ffcf7a" /></>}
        cam={glide(f, s, e, { pos: [-0.4, 1.45, 1.6], target: [-2.2, 1.05, -1.0], fov: 38 }, { pos: [-0.8, 1.35, 1.0], target: [-2.25, 1.05, -1.05], fov: 38 })}
        bg={Bedroom.back({ night: true })} fg={<>
          {Bedroom.front({})}
          <Bowl p={[-2.05, 0.89, -1.25]} s={0.75}><Fish frame={f} position={[Math.sin(f * 0.05) * 0.1, 0, 0]} rotationY={Math.cos(f * 0.05) > 0 ? 0 : Math.PI} scale={0.55} /></Bowl>
          <Character kind="leo" position={[-2.8, 0, -0.5]} rotationY={2.36} pose={{ lean: 0.15, armL: [-1.4, 0, 0.4], armR: [-1.4, 0, -0.4], head: [0.1, 0, Math.sin(f * 0.05) * 0.06] }} face={{ expr: "smile", blink: blinkAt(f, 6) }} />
        </>} />
    ),
  },
  // ---------------- 18. Léo: "Moedinha!"
  {
    name: "18 MOEDINHA", from: 45.36, to: 99,
    render: (f, s, e) => {
      const bub = Math.max(0, f - (s + 25));
      return (
        <Stage background="#24305e" blur={5}
          lights={<>{night}<pointLight position={[-1.5, 1.35, -0.9]} intensity={3.5} distance={4} color="#ffcf7a" /></>}
          cam={glide(f, s, s + 80, { pos: [-2.05, 1.2, -0.15], target: [-2.05, 1.12, -1.25], fov: 36 }, { pos: [-2.05, 1.18, -0.35], target: [-2.05, 1.13, -1.25], fov: 36 })}
          bg={Bedroom.back({ night: true })} fg={<>
            {Bedroom.front({})}
            <Bowl p={[-2.05, 0.89, -1.25]} s={0.75}>
              <Fish frame={f} position={[0, Math.sin(f * 0.1) * 0.02, 0.1]} rotationY={-Math.PI / 2} scale={0.55} />
              {bub > 0 && bub < 40 && (
                <mesh position={[0.05, 0.05 + bub * 0.006, 0.18]}>
                  <sphereGeometry args={[0.025, 12, 10]} />
                  <meshStandardMaterial color="#e8faff" transparent opacity={0.6} />
                </mesh>
              )}
            </Bowl>
            <Sign text="MOEDINHA" p={[-2.05, 0.98, -0.88]} rot={[-0.2, 0, -0.04]} w={0.42} h={0.13} bg="#ffd23f" fg="#e8432f" border="#e8432f" pop={pop(f, W(18, 0) - 4, 8)} />
          </>} />
      );
    },
  },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
export { sec };
