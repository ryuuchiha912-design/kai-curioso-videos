import data from "../data/short-timeline.json";
import { FPS } from "../kit/anim";
import type { Word } from "../kit/Captions";

export type Line = {
  id: number; who: "narrador" | "leo" | "bia"; text: string; audio: string;
  audioStart: number; fileDur: number; start: number; end: number; words: Word[];
};

export const LINES = data.lines as Line[];
export const ALL_WORDS: Word[] = LINES.flatMap((l) => l.words);
export const TOTAL_SEC = LINES[LINES.length - 1].end + 2.3; // segura o final

export const line = (id: number) => LINES.find((l) => l.id === id)!;
/** Frame em que a palavra `i` da fala `id` começa. */
export const W = (id: number, i: number) => Math.round(line(id).words[i].start * FPS);
export const WE = (id: number, i: number) => Math.round(line(id).words[i].end * FPS);

/** Boca mexendo enquanto o personagem fala (só nas falas dele). */
export const mouthFor = (who: Line["who"], frame: number) => {
  const t = frame / FPS;
  for (const l of LINES) {
    if (l.who !== who) continue;
    for (const w of l.words) {
      if (t >= w.start - 0.02 && t <= w.end) return 0.35 + 0.65 * Math.abs(Math.sin((t - w.start) * 22));
    }
  }
  return undefined;
};
