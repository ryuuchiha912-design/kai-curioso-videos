// Extrai a lista de planos de src/short2/shots.tsx para a folha de contato (uso: SHOTS=out/ocarina-shots.json node scripts/contact.mjs Ocarina ...)
import fs from "node:fs";
const src = fs.readFileSync("src/short2/shots.tsx", "utf8");
const re = /name: "([^"]+)", from: ([\d.]+), to: ([\d.]+)|lifeShot\("([^"]+)", ([\d.]+), ([\d.]+)/g;
const shots = [...src.matchAll(re)].map((m) => (m[1] ? { name: m[1], from: +m[2], to: +m[3] } : { name: m[4], from: +m[5], to: +m[6] }));
fs.writeFileSync("out/ocarina-shots.json", JSON.stringify(shots, null, 1));
console.log(shots.length, "planos");
