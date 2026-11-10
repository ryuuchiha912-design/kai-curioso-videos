// Extrai a lista de planos de um storyboard para a folha de contato.
// Uso: node scripts/shots.mjs src/short4/shots.tsx out/reel-shots.json
//      SHOTS=out/reel-shots.json node scripts/contact.mjs Reel3D out/reel_contato.png
import fs from "node:fs";
import path from "node:path";
const [src = "src/short/shots.tsx", out = "out/shots.json"] = process.argv.slice(2);
const code = fs.readFileSync(src, "utf8");
const shots = [...code.matchAll(/name: "([^"]+)", from: ([\d.]+), to: ([\d.]+)/g)].map((m) => ({ name: m[1], from: +m[2], to: +m[3] }));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(shots, null, 1));
console.log(shots.length, "planos ->", out);
