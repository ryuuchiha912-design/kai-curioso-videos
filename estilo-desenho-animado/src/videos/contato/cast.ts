// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, KID, fxNote, fxBurst, fxSplash, fxStars, fxCreak, fxRing, fxBlob, fxShadow, fxContact, fxPlank, fxDrum,
  Outfit, Expr, FrontOpts, SideOpts, Prop,
} from "./toon";
import { FPS, D0, SHOTS, V3, smooth, clamp01, T, PLACE, PHONE_D } from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; top?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3; fwd?: THREE.Vector3; up?: THREE.Vector3; fov?: number };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const SWAPS: Record<number, number[]> = {};
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- crowd by shot ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };



// ================= elenco do "contato salvo" =================
const INK_ = "#241726";
const SK = ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067", "#a8714a"];
const BIEL: Outfit = { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#f4f1ea", hat: "hair", hair: "#2a201a", skin: SK[1] };
const THEO: Outfit = { jacket: "#2f8a4f", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#3a2516", skin: SK[3] };
const MAE: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: SK[2], dress: "#c0505a" };
const CRUSH: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#c9893a", skin: SK[0], dress: "#f3d35a" };
const KIDB: Outfit = { ...BIEL, build: "kid" };
const KIDT: Outfit = { ...THEO, build: "kid" };
const EXTRA = (v: number): Outfit => {
  const tees = ["#e2453c", "#7b5ac9", "#f3d35a", "#f08a2c", "#2f6f8a", "#b5653f"], hairs = ["#5a3b2a", "#2a201a", "#c9893a", "#4a3020"];
  return { jacket: tees[v % 6], pants: ["#3b5b9a", "#3b3f52", "#d9c7a0"][v % 3], boots: "#f4f1ea", hat: v % 5 === 3 ? "cap" : "hair", cap: "#3b5b9a", hair: hairs[v % 4], skin: SK[v % 5], moustache: v % 4 === 1 ? "#4a3020" : undefined };
};
const W_ = (i: number, o: Outfit, k: string): Who => ({ i, o, okey: k });
const WB = W_(1, BIEL, "biel"), WT = W_(2, THEO, "theo"), WM = W_(3, MAE, "mae"), WC = W_(4, CRUSH, "crush"), WKB = W_(5, KIDB, "kidb"), WKT = W_(6, KIDT, "kidt");

type PO = { expr?: Expr; prop?: Prop; look?: number; facing?: -1 | 0 | 1; mode?: "stand" | "sit"; wave?: number; headTilt?: number; scale?: number; side?: boolean; mirror?: boolean; y?: number; swap?: number[] };
const put = (out: Stage, cam: CamInfo, t: number, who: Who, x: number, z: number, o: PO = {}) => {
  const sc = o.scale ?? 1, y = D0 + (o.y ?? 0);
  const blink = lidAt(t, who.i, o.swap ?? []);
  const fo: FrontOpts = { mode: o.mode ?? "stand", expr: o.expr ?? "neutral", prop: o.prop ?? null, look: o.look ?? 0, facing: o.facing ?? 0, blink, wave: o.wave, headTilt: o.headTilt };
  const so: SideOpts = { mode: "stand", expr: o.expr ?? "neutral", blink };
  out.places.push(person(cam, who, x, y, z, { side: !!o.side, mirror: !!o.mirror }, fo, so, sc));
  if (o.mode !== "sit") blob(out, x, D0, z, sc);
};

// ---------------- desenhos de texto (etiqueta, celular, balões) ----------------
const FONT = (w: number, px: number) => `${w} ${px}px Nunito, "DejaVu Sans", sans-serif`;
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const inkFill = (g: CanvasRenderingContext2D, fill: string, lw: number) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK_; g.stroke(); };
/** etiqueta do contato: balão branco com avatar, nome e (opcional) número vermelho; canvas 1200 x 320 */
const drawTag = (nome: string, num: string) => (p: Pen) => {
  const g = p.g, H = 230;
  g.font = FONT(900, 120);
  const fs = Math.min(120, (120 * 760) / Math.max(1, g.measureText(nome).width + (num ? g.measureText(num).width + 90 : 0)));
  g.font = FONT(900, fs);
  const nw = g.measureText(nome).width, numW = num ? g.measureText(num).width + 90 : 0, w = Math.min(1180, nw + 250 + numW), x0 = (1200 - w) / 2;
  rr(g, x0, 10, w, H, H / 2); inkFill(g, "#fffdf6", 14);
  g.beginPath(); g.moveTo(560, H + 4); g.lineTo(600, 306); g.lineTo(640, H + 4); inkFill(g, "#fffdf6", 14);
  g.fillStyle = "#fffdf6"; g.fillRect(552, H - 20, 96, 26);
  g.beginPath(); g.arc(x0 + 118, 10 + H / 2, 70, 0, Math.PI * 2); g.fillStyle = "#8796b5"; g.fill();
  g.fillStyle = "#fffdf6"; g.beginPath(); g.arc(x0 + 118, 10 + H / 2 - 20, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x0 + 118, 10 + H / 2 + 36, 42, 24, 0, Math.PI, 0); g.fill();
  g.fillStyle = INK_; g.textBaseline = "middle"; g.fillText(nome, x0 + 210, 10 + H / 2 + 6);
  if (num) {
    const nx = x0 + 210 + nw + 30;
    rr(g, nx, 42, numW, H - 64, (H - 64) / 2); inkFill(g, "#e04b3c", 10);
    g.fillStyle = "#ffffff"; g.textAlign = "center"; g.fillText(num, nx + numW / 2, 10 + H / 2 + 6); g.textAlign = "left";
  }
};
type Msg = { txt: string; eu?: boolean };
type PhoneO = { titulo: string; num?: string; msgs?: Msg[]; data?: string; dig?: string; cursor?: boolean; sent?: number; vib?: number; list?: string[] };
/** tela de celular na mão (canvas 600 x 1100) */
const drawPhone = (o: PhoneO) => (p: Pen) => {
  const g = p.g;
  rr(g, 14, 14, 572, 1072, 80); inkFill(g, "#1f2230", 14);
  rr(g, 42, 42, 516, 1016, 58); g.fillStyle = "#f4efe2"; g.fill();
  g.save(); rr(g, 42, 42, 516, 1016, 58); g.clip();
  g.fillStyle = "#2e4f72"; g.fillRect(42, 42, 516, 150);
  g.beginPath(); g.arc(116, 118, 40, 0, Math.PI * 2); g.fillStyle = "#8796b5"; g.fill(); g.lineWidth = 6; g.strokeStyle = "#fff"; g.stroke();
  g.font = FONT(900, 52); g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(o.titulo, 176, 120);
  if (o.num) { const tw = g.measureText(o.titulo).width; g.font = FONT(900, 44); const nw = g.measureText(o.num).width + 40; rr(g, 196 + tw, 90, nw, 60, 30); inkFill(g, "#e04b3c", 6); g.fillStyle = "#fff"; g.textAlign = "center"; g.fillText(o.num, 196 + tw + nw / 2, 122); g.textAlign = "left"; }
  let y = 240;
  if (o.list) {
    g.font = FONT(800, 46);
    for (const n of o.list) { g.fillStyle = "#e6dfcf"; g.fillRect(62, y - 44, 476, 2); g.beginPath(); g.arc(104, y + 6, 30, 0, Math.PI * 2); g.fillStyle = "#b8c0d4"; g.fill(); g.fillStyle = INK_; g.fillText(n, 152, y + 8); y += 110; }
  } else {
    if (o.data) { g.font = FONT(900, 30); const w = g.measureText(o.data).width + 40; rr(g, 300 - w / 2, y - 26, w, 52, 26); g.fillStyle = "#ddd3bf"; g.fill(); g.fillStyle = "#6a6052"; g.textAlign = "center"; g.fillText(o.data, 300, y + 2); g.textAlign = "left"; y += 90; }
    g.font = FONT(800, 40);
    const bub = (m: Msg, yy: number, op = 1) => { const w = g.measureText(m.txt).width + 60, x = m.eu ? 538 - w : 62; g.globalAlpha = op; rr(g, x, yy - 40, w, 80, 32); inkFill(g, m.eu ? "#c4ecb4" : "#ffffff", 5); g.fillStyle = INK_; g.fillText(m.txt, x + 30, yy + 3); g.globalAlpha = 1; };
    for (const m of o.msgs ?? []) { bub(m, y); y += 106; }
    if (o.sent) { const k = clamp01(o.sent), yy = 900 + (y - 900) * (1 - (1 - k) ** 3); bub({ txt: "e aí, mano ✓✓", eu: true }, yy); }
  }
  // caixa de texto
  g.fillStyle = "#e3dbca"; g.fillRect(42, 930, 516, 128);
  rr(g, 62, 952, 380, 84, 42); inkFill(g, "#ffffff", 5);
  g.font = FONT(800, 40); g.fillStyle = o.dig ? INK_ : "#a69f94"; g.fillText(o.dig || "Mensagem", 92, 996);
  if (o.cursor) { const cw = o.dig ? g.measureText(o.dig).width : 0; g.fillStyle = "#2c8fd6"; g.fillRect(96 + cw, 970, 6, 52); }
  g.beginPath(); g.arc(494, 994, 44, 0, Math.PI * 2); inkFill(g, o.dig ? "#3e9b4a" : "#9aa3ad", 5);
  g.beginPath(); g.moveTo(478, 972); g.lineTo(518, 994); g.lineTo(478, 1016); g.closePath(); g.fillStyle = "#fff"; g.fill();
  g.restore();
  if (o.vib) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(300 + s * (300 - 4), 380 + i * 90); g.lineTo(300 + s * (300 - 4) + 0, 420 + i * 90); g.lineWidth = 10; g.strokeStyle = INK_; g.stroke(); }
};
/** mensagem fantasma (riscada) — canvas 700 x 200 */
const drawGhost = (txt: string) => (p: Pen) => {
  const g = p.g; g.font = FONT(800, 70);
  const w = Math.min(680, g.measureText(txt).width + 90), x = (700 - w) / 2;
  rr(g, x, 30, w, 140, 60); inkFill(g, "#ffffff", 9);
  g.fillStyle = INK_; g.textBaseline = "middle"; g.textAlign = "center"; g.fillText(txt, 350, 104);
  g.lineWidth = 12; g.strokeStyle = "#e04b3c"; g.beginPath(); g.moveTo(x + 30, 104); g.lineTo(x + w - 30, 104); g.stroke();
};
/** balão de pensamento com uma palavra + selo colorido — canvas 800 x 420 */
const drawThought = (txt: string, sub: string, col: string) => (p: Pen) => {
  const g = p.g; g.font = FONT(900, 92);
  const w = Math.min(780, g.measureText(txt).width + 120), x = (800 - w) / 2;
  rr(g, x, 20, w, 190, 95); inkFill(g, "#fffdf6", 10);
  g.beginPath(); g.arc(400, 250, 22, 0, Math.PI * 2); inkFill(g, "#fffdf6", 8);
  g.fillStyle = INK_; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 400, 118);
  g.font = FONT(900, 64); const sw = g.measureText(sub).width + 70;
  rr(g, 400 - sw / 2, 300, sw, 100, 50); inkFill(g, col, 8); g.fillStyle = "#fff"; g.fillText(sub, 400, 352);
};

const tagAt = (out: Stage, x: number, y: number, z: number, nome: string, num: string, k = 1, s = 1) => {
  if (k <= 0.01) return;
  out.fx.push({ key: `tag|${nome}|${num}`, cw: 1200, ch: 320, draw: drawTag(nome, num), x, y, z, w: 1.6 * s * k, h: 0.4267 * s * k, top: true });
};
/** objeto preso na frente da lente: d metros à frente, dx/dy em metros no plano da imagem */
const inFront = (cam: CamInfo, d: number, dx = 0, dy = 0): [number, number, number] => {
  const f = cam.fwd!, r = cam.right, u = cam.up!;
  return [cam.pos.x + f.x * d + r.x * dx + u.x * dy, cam.pos.y + f.y * d + r.y * dx + u.y * dy, cam.pos.z + f.z * d + r.z * dx + u.z * dy];
};
const phoneAt = (out: Stage, cam: CamInfo, o: PhoneO, dx = 0, dy = -0.02, s = 1) => {
  const [x, y, z] = inFront(cam, PHONE_D, dx, dy);
  out.fx.push({ key: `phone|${JSON.stringify(o)}`, cw: 600, ch: 1100, draw: drawPhone(o), x, y, z, w: 0.42 * s, h: 0.77 * s, top: true });
};
const pop = (t: number, a: number, d = 0.22) => { if (t < a) return 0; const k = clamp01((t - a) / d), c1 = 1.9, c3 = c1 + 1; return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2; };
const burst = (out: Stage, t: number, a: number, x: number, y: number, z: number, s = 1.4, col = "#fff3b0") => {
  if (t < a || t > a + 0.4) return;
  const u = q((t - a) / 0.4, 30);
  out.fx.push({ key: `burst${col}${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, col), x, y, z, w: s, h: s });
};
const TAGY = 2.12, TAGY_SIT = 1.62;
const typed = (t: number, a: number, del?: number) => {
  const full = "e aí, mano";
  let n = t > a ? Math.floor(clamp01((t - a) / 1.1) * full.length) : 0;
  if (del !== undefined && t > del) n = Math.max(0, full.length - Math.floor((t - del) / 0.05));
  return full.slice(0, n);
};
const CONVERSA_THEO: Msg[] = [{ txt: "bora jogar hj?", eu: true }, { txt: "não" }];
const CONVERSA_BIEL: Msg[] = [{ txt: "bora jogar hj?" }, { txt: "não", eu: true }];

/** tudo que tem rosto na cena `id` no tempo t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const [tx, tz] = PLACE.theoSquare, [mx, mz] = PLACE.mom, [cx, cz] = PLACE.crush, [bx, bz] = PLACE.bench, [kx, kz] = PLACE.truck, [ux, uz] = PLACE.busStop;
  const ex = (i: number, x: number, z: number, o: PO = {}) => put(out, cam, t, W_(100 + i, EXTRA(i), `x${i}`), x, z, o);
  switch (s.crowd) {
    case "hook": {
      put(out, cam, t, WT, tx, tz, { expr: "neutral", prop: "phone", look: 0.6 });
      put(out, cam, t, WB, -0.7, 7.3, { expr: t > T.n412 ? "shock" : "neutral", facing: 1, look: 1, swap: [T.n412] });
      ex(1, -4.2, 11.5, { expr: "smile" }); ex(2, 5.6, 12, { expr: "neutral", prop: "phone" });
      tagAt(out, tx, TAGY, tz, "Biel", t > T.n412 - 0.05 ? "412" : "", pop(t, 0.25), 1.0);
      burst(out, t, T.n412, tx + 0.5, TAGY + 0.1, tz - 0.1, 1.2);
      if (t > T.sobe) { const u = clamp01((t - T.sobe) / 0.6); out.fx.push({ key: `up${q(u, 20)}`, cw: 300, ch: 300, draw: (p) => { p.poly([[150, 30], [270, 170], [195, 170], [195, 280], [105, 280], [105, 170], [30, 170]], "#e04b3c", 14); }, x: tx + 1.05, y: TAGY + 0.15 + 0.25 * u, z: tz - 0.1, w: 0.45, h: 0.45, top: true }); }
      break;
    }
    case "tags": {
      const spots: [number, number, string][] = [[-3.4, 9.6, "Biel"], [-1.2, 10.6, "Biel vizinho"], [1.3, 10.2, "Biel (primo)"], [3.6, 9.4, "BIEL"], [-5.6, 12.4, "Biel :)"], [5.8, 12.6, "Bielzinho"]];
      spots.forEach(([x, z, n], i) => { ex(i + 10, x, z, { expr: (["smile", "neutral", "grin", "whistle", "smile_closed", "neutral"] as Expr[])[i], prop: i % 2 ? "phone" : null }); tagAt(out, x, TAGY, z, n, "", pop(t, s.a / FPS + 0.4 + i * 0.35), 0.62); });
      put(out, cam, t, WB, 0.2, 6.2, { expr: "shock", look: Math.sin(t * 2.2) });
      break;
    }
    case "momcrush": {
      if (t < T.menina - 0.1) {
        put(out, cam, t, WM, mx, mz, { expr: "stern", prop: "phoneUp", facing: 1 });
        tagAt(out, mx, TAGY + 0.05, mz, "Biel, ATENDE O TELEFONE", "", pop(t, s.a / FPS + 0.25), 1.05);
      } else {
        put(out, cam, t, WC, cx, cz, { expr: "smile", look: -0.5 });
        tagAt(out, cx, TAGY + 0.05, cz, "Biel, do trabalho de geografia", "", pop(t, T.menina + 0.6), 1.1);
        put(out, cam, t, WB, cx - 1.9, cz - 3.0, { expr: t > T.geo ? "nervous" : "relief", facing: 1, swap: [T.geo] });
      }
      break;
    }
    case "memory": {
      const briga = t > T.briga - 0.07;
      put(out, cam, t, WKB, bx - 0.45, bz - 0.05, { mode: "sit", y: 0.18, expr: briga ? "stern" : "laugh", prop: briga ? null : "phone", facing: briga ? -1 : 1, look: briga ? -1 : 0.5, swap: [T.briga] });
      put(out, cam, t, WKT, bx + 0.45, bz - 0.05, { mode: "sit", y: 0.18, expr: briga ? "stern" : "grin", prop: briga ? null : "phone", facing: briga ? 1 : -1, look: briga ? 1 : -0.5, swap: [T.briga] });
      burst(out, t, T.briga, bx, 1.4, bz - 0.4, 1.6, "#ffd0a0");
      if (t > T.videogame - 0.1) out.fx.push({ key: "pad", cw: 500, ch: 300, draw: (p) => { p.poly([[60, 110], [440, 110], [470, 230], [330, 250], [300, 200], [200, 200], [170, 250], [30, 230]], "#3a3f4b", 14); p.ell(130, 160, 26, 26, "#e04b3c", 8); p.ell(380, 140, 18, 18, "#2c6fb6", 6); p.ell(410, 180, 18, 18, "#3e9b4a", 6); }, x: bx, y: 1.75 + 0.05 * Math.sin(t * 6), z: bz - 0.3, w: 0.55 * pop(t, T.videogame - 0.1), h: 0.33 * pop(t, T.videogame - 0.1), top: true });
      break;
    }
    case "count": {
      const st = t < T.n413 - 0.1 ? 0 : t < T.n414 - 0.1 ? 1 : 2, n = ["412", "413", "414"][st];
      const [x, z] = ([[tx, tz], [cx + 3.4, cz], [12, 10]] as [number, number][])[st];
      put(out, cam, t, W_(2, { ...THEO, jacket: ["#2f8a4f", "#e2453c", "#f3d35a"][st] }, `theo${st}`), x, z, { expr: (["neutral", "whistle", "nervous"] as Expr[])[st], prop: st === 1 ? "phone" : null, look: [0.4, 0.6, -0.4][st] });
      tagAt(out, x, TAGY, z, "Biel", n, 1, 0.8);
      const a = st === 1 ? T.n413 : st === 2 ? T.n414 : -9;
      if (t > a && t < a + 0.9) { const u = (t - a) / 0.9; out.fx.push({ key: `plus${q(u, 15)}`, cw: 300, ch: 200, draw: (p) => { const g = p.g; g.font = FONT(900, 150); g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 22; g.strokeStyle = INK_; g.strokeText("+1", 150, 100); g.fillStyle = "#ffe14d"; g.fillText("+1", 150, 100); }, x: x + 0.75, y: TAGY + 0.25 + u * 0.35, z: z - 0.1, w: 0.42 * (1 - u * 0.3), h: 0.28 * (1 - u * 0.3), top: true }); }
      break;
    }
    case "guess": {
      put(out, cam, t, WB, 0, 6, { expr: t > T.vinganca ? "stern" : t > T.raiva ? "nervous" : "neutral", look: Math.sin(t * 1.6), headTilt: 4, swap: [T.raiva, T.vinganca] });
      const items: [number, string, string, string, number, number][] = [[T.divida, "DÍVIDA?", "R$ 412", "#3e9b4a", -0.24, 2.4], [T.raiva, "RAIVA?", "412 DIAS", "#e04b3c", 0.25, 2.12], [T.vinganca, "VINGANÇA?", "CONTAGEM", "#241726", -0.18, 1.12]];
      for (const [a, txt, sub, col, x, y] of items) { const k = pop(t, a - 0.05); if (k > 0) out.fx.push({ key: `th|${txt}`, cw: 800, ch: 420, draw: drawThought(txt, sub, col), x, y, z: 5.2, w: 0.5 * k, h: 0.263 * k, top: true }); }
      break;
    }
    case "moving": {
      put(out, cam, t, WT, kx - 3.0, kz - 1.6, { expr: "neutral", look: -0.6, wave: 0.2 });
      tagAt(out, kx - 3.0, TAGY, kz - 1.6, "Biel", "414", 1, 0.75);
      put(out, cam, t, WB, kx - 4.7, kz - 3.6, { expr: t > T.sabado - 0.07 ? "shock" : "neutral", facing: 1, look: 1, swap: [T.sabado] });
      ex(20, kx - 1.0, kz - 2.6, { expr: "neutral" });
      break;
    }
    case "bus": {
      const close = t > T.escreve - 0.27 && t < T.n415 - 0.13;
      put(out, cam, t, WT, ux - 0.6, uz - 0.05, { mode: "sit", y: 0.18, expr: t > T.apaga ? "nervous" : "neutral", prop: "phone", look: 0.6, swap: [T.apaga] });
      if (!close) put(out, cam, t, WB, ux + 0.7, uz - 1.5, { expr: "neutral", facing: -1, look: -1 });
      ex(30, ux + 0.6, uz + 0.0, { mode: "sit", y: 0.18, expr: "whistle" });
      if (close) phoneAt(out, cam, { titulo: "Biel", data: "HÁ 2 ANOS", msgs: CONVERSA_THEO, dig: typed(t, T.escreve, T.apaga), cursor: Math.sin(t * 12) > 0 }, 0, 0.0, 1.0);
      else tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Biel", t > T.n415 - 0.05 ? "415" : "414", 1, 0.7);
      burst(out, t, T.n415, ux - 0.1, TAGY_SIT + 0.1, uz - 0.15, 1.0);
      break;
    }
    case "ghosts": {
      put(out, cam, t, WT, ux - 0.6, uz - 0.05, { mode: "sit", y: 0.18, expr: "neutral", prop: "phone", look: 0.6 });
      tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Biel", "415", 1, 0.7);
      const txts = ["e aí, mano", "oi", "foi mal", "saudade", "bora jogar?", "viu o jogo novo?", "parabéns", "e aí"];
      for (let i = 0; i < 14; i++) {
        const ph = hh(i, 3), sp = 0.16 + 0.1 * hh(i, 4), k = ((t - s.a / FPS) * sp + ph) % 1;
        const x = ux + 0.05 + (hh(i, 5) - 0.5) * 1.1, y = 0.5 + k * 2.0, z = uz - 1.8 - hh(i, 6) * 0.6;
        out.fx.push({ key: `gh|${txts[i % txts.length]}|${q(Math.sin(Math.PI * k), 8)}`, cw: 700, ch: 200, draw: drawGhost(txts[i % txts.length]), x, y, z, w: 0.75 * (0.55 + 0.45 * Math.sin(Math.PI * k)), h: 0.214 * (0.55 + 0.45 * Math.sin(Math.PI * k)), top: true });
      }
      break;
    }
    case "myphone": {
      phoneAt(out, cam, { titulo: "Theo", num: t > T.n409 - 0.05 ? "409" : undefined, data: "HÁ 2 ANOS", msgs: CONVERSA_BIEL }, 0, 0.0, 1.0);
      burst(out, t, T.n409, ...inFront(cam, PHONE_D - 0.05, 0.05, 0.31), 0.35);
      break;
    }
    case "send": {
      const sent = t > T.manda ? clamp01((t - T.manda) / 0.35) : 0;
      phoneAt(out, cam, { titulo: "Theo", num: "409", data: "HÁ 2 ANOS", msgs: CONVERSA_BIEL, dig: sent ? "" : typed(t, T.escreve2), cursor: !sent && Math.sin(t * 12) > 0, sent }, 0, 0.0, 1.0);
      burst(out, t, T.manda + 0.05, ...inFront(cam, PHONE_D - 0.05, 0.17, -0.32), 0.3, "#c4ecb4");
      break;
    }
    case "turn": {
      const virou = t > T.vibra + 0.5;
      put(out, cam, t, WT, ux - 0.6, uz - 0.05, { mode: "sit", y: 0.18, expr: t > T.player ? "laugh" : virou ? "shock" : "neutral", prop: "phone", look: virou ? 1 : 0.6, facing: virou ? 1 : 0, swap: [T.vibra + 0.5, T.player] });
      put(out, cam, t, WB, ux + 0.55, uz - 1.3, { expr: t > T.player ? "grin" : "nervous", facing: -1, look: -1, swap: [T.player] });
      if (t > T.vibra - 0.05 && t < T.vibra + 0.9) { const u = q(((t - T.vibra) * 2.5) % 1, 15); out.fx.push({ key: `ring${u}`, cw: 600, ch: 600, draw: (p) => fxRing(p, u), x: ux - 0.35, y: 0.95, z: uz - 0.35, w: 0.7, h: 0.7, top: true }); }
      if (t < T.muda + 0.35) tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Biel", t > T.muda + 0.15 ? "" : "415", 1, 0.7);
      else if (t < T.player - 0.05) tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Biel", "", 1 - clamp01((t - T.muda - 0.35) / 0.25), 0.7);
      else tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Player 2", "", pop(t, T.player - 0.05), 0.85);
      burst(out, t, T.player - 0.05, ux - 0.6, TAGY_SIT + 0.05, uz - 0.15, 1.3, "#fff3b0");
      break;
    }
    case "end": {
      put(out, cam, t, WT, ux - 0.6, uz - 0.05, { mode: "sit", y: 0.18, expr: "laugh", prop: "phone", facing: 1, look: 1 });
      put(out, cam, t, WB, ux + 0.45, uz - 0.05, { mode: "sit", y: 0.18, expr: "laugh", prop: "phone", facing: -1, look: -1 });
      tagAt(out, ux - 0.6, TAGY_SIT, uz - 0.05, "Player 2", "", 1, 0.85);
      break;
    }
  }
  return out;
};
export { FPS, smooth, clamp01 };
