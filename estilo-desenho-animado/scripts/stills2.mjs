// Uso: node scripts/stills.mjs <Composição> <pasta> <quadro1,quadro2,...> [escala]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, outDir, framesArg, scale = "0.4"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000 });
for (const f of framesArg.split(",").map(Number)) {
  await renderStill({ serveUrl, composition, frame: f, output: `${outDir}/f${String(f).padStart(5, "0")}.jpg`, imageFormat: "jpeg", scale: Number(scale), browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000 });
  process.stdout.write(".");
}
console.log(" ok");
