import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { kf, pop } from "../kit/anim";
import { W } from "./timeline";

/**
 * Placar do topo: HORA e saldo (dobra a cada hora) e, depois, a dívida.
 * ✱ 2^10 = 1.024 · 2^20 = 1.048.576 · 2^30 = 1.073.741.824 · 2^40 = 1.099.511.627.776
 * ✱ 50 · 2^40 = 54.975.581.388.800 (a dívida também dobrou 40 vezes)
 */
const STEPS = () => [[W(3, 1), 10], [W(5, 1), 20], [W(8, 1), 30], [W(10, 1), 40]] as const;
const RAMP = 14; // quadros contando até a hora certa, terminando na palavra (regra 3)

export const hourAt = (f: number) => {
  let h = 0;
  for (const [at, to] of STEPS()) if (f >= at - RAMP) h = Math.max(h, Math.floor(kf(f, [[at - RAMP, to - 10], [at, to]], (x) => x)));
  return h;
};
export const moneyAt = (f: number) => 2 ** hourAt(f);
export const debtHourAt = (f: number) => (f < W(13, 6) ? 0 : Math.floor(kf(f, [[W(13, 6), 0], [W(13, 9), 40]], (x) => x)));
export const debtAt = (f: number) => (f < W(11, 5) - 2 ? 0 : 50 * 2 ** debtHourAt(f));
/** Momentos em que o placar "aterrissa" (para o som de moeda). */
export const landings = () => STEPS().map(([at]) => at);

export const brl = (v: number) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const short = (v: number) => {
  const u: [number, string][] = [[1e12, "TRI"], [1e9, "BI"], [1e6, "MI"], [1e3, "MIL"]];
  for (const [d, n] of u) if (v >= d) return `R$ ${Math.floor(v / d)} ${n}`;
  return `R$ ${v}`;
};

const font = "'Lilita One', 'Arial Black', sans-serif";
const stroke = (px: number, c = "#1b0f08"): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: "stroke fill" });

export const Hud: React.FC<{ f: number; end: number }> = ({ f, end }) => {
  const h = hourAt(f);
  const money = moneyAt(f);
  const debt = debtAt(f);
  const land = Math.max(0, ...landings().map((at) => (f >= at && f < at + 10 ? 1 - (f - at) / 10 : 0)));
  const debtIn = pop(f, W(11, 5) - 2, 8);
  const broke = f >= W(13, 9);
  const shake = broke && f < W(13, 9) + 12 ? Math.sin(f * 2.3) * 10 : 0;
  const out = interpolate(f, [end - 70, end - 55], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 120, pointerEvents: "none", opacity: out }}>
      <div style={{ fontFamily: font, fontSize: 64, color: "#fff", letterSpacing: 2, ...stroke(12), textShadow: "0 6px 0 rgba(0,0,0,.45)" }}>
        HORA <span style={{ color: "#ffd23f" }}>{h}</span>
      </div>
      <div
        style={{
          marginTop: 8, padding: "6px 34px", borderRadius: 26, background: broke ? "#8a1f1f" : "#1f7a3a", border: "7px solid #1b0f08",
          fontFamily: font, fontSize: money >= 1e9 ? 70 : 84, color: "#fff", transform: `scale(${1 + land * 0.12}) translateX(${shake}px)`,
          boxShadow: "0 8px 0 rgba(0,0,0,.35)", whiteSpace: "nowrap", ...stroke(10),
        }}
      >
        R$ {brl(money)}
      </div>
      {debt > 0 && (
        <div
          style={{
            marginTop: 16, padding: "4px 26px", borderRadius: 22, background: "#e04b3c", border: "6px solid #1b0f08",
            fontFamily: font, fontSize: debt >= 1e9 ? 52 : 60, color: "#fff", whiteSpace: "nowrap", ...stroke(8),
            transform: `scale(${debtIn}) translateX(${shake}px)`, boxShadow: "0 7px 0 rgba(0,0,0,.35)",
          }}
        >
          DÍVIDA: −R$ {brl(debt)}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Chamada final: caixa de comentário genérica sendo digitada (sem logo de plataforma). */
export const CommentCta: React.FC<{ f: number }> = ({ f }) => {
  const at = W(16, 0) - 4;
  if (f < at) return null;
  const k = pop(f, at, 9);
  const word = "DOBRA";
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((f - W(16, 1) + 4) / 3))));
  const sent = f > W(16, 1) + 30;
  const heart = pop(f, W(16, 1) + 34, 8);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1480, pointerEvents: "none" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 22, width: 860, padding: "22px 30px", borderRadius: 34, background: "#ffffff",
          border: "6px solid #1b0f08", boxShadow: "0 10px 0 rgba(0,0,0,.35)", transform: `translateY(${(1 - k) * 220}px) scale(${0.8 + 0.2 * k})`,
        }}
      >
        <div style={{ width: 84, height: 84, borderRadius: 42, background: "linear-gradient(135deg,#ffd23f,#f07a1a)", border: "5px solid #1b0f08", flexShrink: 0 }} />
        <div style={{ flex: 1, fontFamily: font, fontSize: 64, color: typed ? "#1b0f08" : "#9a9087" }}>
          {typed || "Comente..."}
          {!sent && f % 16 < 8 && <span style={{ color: "#1b0f08" }}>|</span>}
        </div>
        <div style={{ fontFamily: font, fontSize: 70, transform: `scale(${0.6 + heart * 0.6})`, color: heart > 0.01 ? "#e04b3c" : "#cfc6bd" }}>♥</div>
      </div>
    </AbsoluteFill>
  );
};
