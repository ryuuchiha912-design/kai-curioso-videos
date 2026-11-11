import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const [comp, shotsFile, out, frac = "0.6", only] = process.argv.slice(2);
const co = { gl: "swangle" };
const bx = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions: co, browserExecutable: bx, inputProps: { audio: false } });
const shots = JSON.parse(fs.readFileSync(shotsFile, "utf8"));
const dir = path.dirname(out) + "/frames"; fs.mkdirSync(dir, { recursive: true });
const files = [];
for (const [i, s] of shots.entries()) {
  if (only && !only.split(",").includes(String(i))) continue;
  const frame = Math.min(composition.durationInFrames - 1, Math.round((s.from + (s.to - s.from) * Number(frac)) * 30));
  const file = `${dir}/${String(i).padStart(2, "0")}.png`;
  await renderStill({ serveUrl, composition, frame, output: file, chromiumOptions: co, browserExecutable: bx, chromeMode: "chrome-for-testing", scale: 0.3, inputProps: { audio: false } });
  files.push(file); console.log(i, s.name, frame);
}
const cols = Math.min(files.length, 7);
const inputs = files.map((f) => `-i ${f}`).join(" ");
const layout = files.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, (_, k) => `w${k}`).join("+") : 0}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, (_, k) => `h${k}`).join("+") : 0}`).join("|");
execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "xstack=inputs=${files.length}:layout=${layout}:fill=black" ${out}`);
console.log("ok", out);
