// Folha de contato: renderiza 1 quadro por plano e monta uma grade. Uso: node scripts/contact.mjs [comp] [saida] [fracao]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const comp = process.argv[2] ?? "Short";
const out = process.argv[3] ?? "out/contact.png";
const frac = Number(process.argv[4] ?? 0.6);
const only = process.argv[5]; // filtro opcional por índice "0,3,5"
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions: { gl: "angle" } });
// lista de planos: lida direto do storyboard (src/short/shots.tsx), ou de um JSON em $SHOTS
let shots;
if (process.env.SHOTS) shots = JSON.parse(fs.readFileSync(process.env.SHOTS, "utf8"));
else {
  const src = fs.readFileSync("src/short/shots.tsx", "utf8");
  shots = [...src.matchAll(/name: "([^"]+)", from: ([\d.]+), to: ([\d.]+)/g)].map((m) => ({ name: m[1], from: +m[2], to: +m[3] }));
}
fs.mkdirSync("out/contact", { recursive: true });
const files = [];
for (const [i, s] of shots.entries()) {
  if (only && !only.split(",").includes(String(i))) continue;
  const frame = s.frame ?? Math.min(composition.durationInFrames - 1, Math.round((s.from + (Math.min(s.to, s.from + 3) - s.from) * frac) * 30));
  const file = `out/contact/${String(i).padStart(2, "0")}.png`;
  await renderStill({ serveUrl, composition, frame, output: file, chromiumOptions: { gl: "angle" }, scale: 0.3 });
  files.push(file);
  console.log(i, s.name, frame);
}
const cols = Math.min(files.length, Number(process.env.COLS ?? 7));
const inputs = files.map((f) => `-i ${f}`).join(" ");
const layout = files.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, (_, k) => `w${k}`).join("+") : 0}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, (_, k) => `h${k}`).join("+") : 0}`).join("|");
execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "xstack=inputs=${files.length}:layout=${layout}:fill=black" ${out}`);
console.log("ok", out);
