import data from "../data/reel-timeline.json";
import { FPS } from "../kit/anim";
import type { Word } from "../kit/Captions";

export type Who = "narrador" | "leo" | "eco" | "ecoGrave";
export type Line = {
  id: number; who: Who; text: string; audio: string;
  audioStart: number; fileDur: number; start: number; end: number; words: Word[];
};

export const LINES = data.lines as Line[];
export const TOTAL_SEC = data.total;

export const line = (id: number) => LINES.find((l) => l.id === id)!;
/** Frame em que a palavra `i` da fala `id` começa. */
export const W = (id: number, i: number) => Math.round(line(id).words[i].start * FPS);
/** Frame em que a fala `id` começa / termina. */
export const LS = (id: number) => Math.round(line(id).start * FPS);
export const LE = (id: number) => Math.round(line(id).end * FPS);

/** Boca mexendo enquanto alguém do grupo `whos` fala. */
export const mouthFor = (whos: Who[], frame: number) => {
  const t = frame / FPS;
  for (const l of LINES) {
    if (!whos.includes(l.who)) continue;
    for (const w of l.words) if (t >= w.start - 0.02 && t <= w.end) return 0.35 + 0.65 * Math.abs(Math.sin((t - w.start) * 22));
  }
  return undefined;
};
/** 0..1: o quanto alguém do grupo está falando agora (para as ondas do Eco). */
export const talking = (whos: Who[], frame: number) => {
  const t = frame / FPS;
  for (const l of LINES) if (whos.includes(l.who) && t >= l.start - 0.05 && t <= l.end + 0.1) return 1;
  return 0;
};
