import data from "../data/ocarina-timeline.json";
import { FPS } from "../kit/anim";
import type { Word } from "../kit/Captions";

export type Who = "narrador" | "caio" | "adulto";
export type Line = {
  id: number; who: Who; text: string; audio: string;
  audioStart: number; fileDur: number; start: number; end: number; words: Word[];
};

export const LINES = data.lines as Line[];
export const TOTAL_SEC = data.total;

export const line = (id: number) => LINES.find((l) => l.id === id)!;
/** Frame em que a palavra `i` da fala `id` começa / termina. */
export const W = (id: number, i: number) => Math.round(line(id).words[i].start * FPS);
export const WE = (id: number, i: number) => Math.round(line(id).words[i].end * FPS);

export const mouthFor = (who: Who, frame: number) => {
  const t = frame / FPS;
  for (const l of LINES) {
    if (l.who !== who) continue;
    for (const w of l.words) if (t >= w.start - 0.02 && t <= w.end) return 0.35 + 0.65 * Math.abs(Math.sin((t - w.start) * 22));
  }
  return undefined;
};

/** Flauta mágica: as 3 notas começam nestes frames, uma a cada NOTE_GAP (bate com scripts/ocarina_sfx.py). */
export const NOTE_GAP = 8;
export const FLUTE_AT = [W(5, 6) - 3, W(12, 7) - 3];
