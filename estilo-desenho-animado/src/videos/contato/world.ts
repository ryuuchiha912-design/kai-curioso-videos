// A rua do bairro: calçada e praça na frente de uma fileira de casas (fachadas viradas para as câmeras, em -z),
// árvores e postes, a casa do Theo com o caminhão de mudança e caixas, o ponto de ônibus com banco e o banco do parque.
// Céu, luz, nuvens e os cartões dos bonecos funcionam igual ao exemplo da Torre de Pisa.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house, Kit, quad } from "./build";
import { ctex, cobbleHD, grassHD, cloudHD, stoneHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, D0, SHOTS, camAt, ShotDef, V3, PLACE } from "./story";

export const loadKit = async (): Promise<Kit> => {
  try { await document.fonts.load("900 80px Nunito"); await document.fonts.load("700 60px Nunito"); } catch { /* sem a fonte, cai no sans-serif */ }
  return {};
};

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 4: { az: 30, el: 9 }, 13: { az: 25, el: 8 } };

const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = D0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
const cyl = (r0: number, r1: number, h: number, n = 24) => new THREE.CylinderGeometry(r1, r0, h, n).translate(0, h / 2, 0);
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const sideTex = (key: string, txt: string, bg: string, fg: string) => ctex(key, 1024, 384, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 384);
  g.fillStyle = fg; g.font = "900 190px Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 512, 200);
});

const tree = (b: Batch, x: number, z: number, s: number, M: Record<string, THREE.Material>, seed: number) => {
  b.add(cyl(0.22 * s, 0.16 * s, 2.6 * s, 8), M.bark, at(x, D0, z));
  b.add(new THREE.IcosahedronGeometry(1.5 * s, 1), seed % 2 ? M.leafA : M.leafB, at(x, D0 + 3.4 * s, z));
  b.add(new THREE.IcosahedronGeometry(1.1 * s, 1), seed % 3 ? M.leafB : M.leafA, at(x + 0.6 * s, D0 + 4.2 * s, z - 0.3 * s));
};
const bench = (b: Batch, x: number, z: number, M: Record<string, THREE.Material>) => {
  b.add(boxGeo(V(x - 1.0, D0 + 0.42, z - 0.22), V(x + 1.0, D0 + 0.5, z + 0.22)), M.wood);
  b.add(boxGeo(V(x - 1.0, D0 + 0.6, z + 0.24), V(x + 1.0, D0 + 0.92, z + 0.3)), M.wood);
  for (const dx of [-0.85, 0.85]) b.add(boxGeo(V(x + dx - 0.05, D0, z - 0.18), V(x + dx + 0.05, D0 + 0.42, z + 0.28)), M.iron);
};
const lamp = (b: Batch, x: number, z: number, M: Record<string, THREE.Material>) => {
  b.add(cyl(0.07, 0.06, 4.2, 10), M.iron, at(x, D0, z));
  b.add(new THREE.SphereGeometry(0.22, 14, 10), M.lampGlass, at(x, D0 + 4.3, z));
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Record<string, THREE.Material> = {};
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- materiais ----
    M.grass = lam("grassHD", () => ({ map: grassHD() }));
    M.cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    M.pave = lam("paveHD", () => ({ map: stoneHD("paveHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    M.curb = lam("curb", () => ({ color: "#cfc6b6" }));
    M.bark = lam("bark", () => ({ color: "#8a5a3c" }));
    M.leafA = lam("leafA", () => ({ color: "#62ae4c" }));
    M.leafB = lam("leafB", () => ({ color: "#4f9a43" }));
    M.wood = lam("benchWood", () => ({ color: "#b5753f" }));
    M.iron = lam("iron", () => ({ color: "#3d4450" }));
    M.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.45, 1.1) });
    M.glass = lam("busGlass", () => ({ color: "#bfe0f2", transparent: true, opacity: 0.45 }));
    M.roofBus = lam("busRoof", () => ({ color: "#2f6fb5" }));
    M.truckBox = lam("truckBox", () => ({ color: "#f3efe6" }));
    M.truckCab = lam("truckCab", () => ({ color: "#d9473a" }));
    M.tyre = lam("tyre", () => ({ color: "#26262c" }));
    M.window = lam("cabWin", () => ({ color: "#9fd0ea" }));
    M.box = lam("cardboard", () => ({ color: "#c98f55" }));
    M.boxTape = lam("tape", () => ({ color: "#e8c890" }));
    M.sign = new THREE.MeshBasicMaterial({ map: sideTex("mudanca", "MUDANÇA", "#f3efe6", "#c9373a") });
    M.busSign = new THREE.MeshBasicMaterial({ map: sideTex("ponto", "ÔNIBUS", "#2f6fb5", "#ffffff") });
    const hm = [lam("hillA", () => ({ color: "#78b257" })), lam("hillB", () => ({ color: "#6aa24e" })), lam("hillC", () => ({ color: "#8bbf63" }))];

    // ---- chão: grama, rua, calçada, praça ----
    const b = new Batch();
    b.add(quadUp(-900, 900, -900, 900, 450, 450), M.grass);
    b.add(quadUp(-90, 90, -6, 5, 45, 5.5, D0 + 0.01), M.cobble);
    b.add(quadUp(-90, 90, 5, 15, 60, 6, D0 + 0.03), M.pave);
    b.add(boxGeo(V(-90, D0, 4.85), V(90, D0 + 0.12, 5.15)), M.curb);
    b.add(new THREE.CircleGeometry(7.5, 48).rotateX(-Math.PI / 2), M.pave, at(0, D0 + 0.035, 9));
    // ---- casas viradas para a rua (fachada em -z) ----
    let hs = 1;
    for (let x = -80; x <= 80; x += 11.5) {
      if (Math.abs(x) < 7) continue; // a praça fica aberta
      const h = [7, 8.4, 9.8][hs % 3];
      house(b, x, 19.5 + (hs % 2) * 0.6, Math.PI, 10, 8, h, hs); hs++;
    }
    for (let x = -80; x <= 80; x += 13) { house(b, x + 5, 36, Math.PI, 12, 8, 11 + (hs % 2) * 3, hs); hs++; }
    ([[-360, 300, 200, 60, 130], [160, 420, 260, 70, 150], [460, 180, 180, 50, 140]] as const)
      .forEach(([x, z, sx, sy, sz], i) => b.add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), hm[i % 3], new THREE.Matrix4().compose(V(x, D0 - 2, z), new THREE.Quaternion(), V(sx, sy, sz))));
    // ---- árvores e postes ----
    let ts = 0;
    for (let x = -84; x <= 84; x += 9.5) { if (Math.abs(x - PLACE.busStop[0]) < 4 || Math.abs(x - PLACE.truck[0]) < 5) continue; tree(b, x + (ts % 3) * 0.4, 13.6, 0.95 + (ts % 3) * 0.12, M, ts); ts++; }
    for (let x = -80; x <= 80; x += 19) { const lx = x + 4; if ([0, PLACE.busStop[0], PLACE.bench[0], PLACE.truck[0], PLACE.crush[0], PLACE.mom[0], 12].some((v) => Math.abs(lx - v) < 6)) continue; lamp(b, lx, 5.6, M); }
    for (const [x, z] of [[-5.5, 14], [5.5, 14]] as const) tree(b, x, z, 1.15, M, ts++);
    // ---- banco do parque (lembrança) ----
    const [bx, bz] = PLACE.bench;
    bench(b, bx, bz, M); tree(b, bx - 2.6, bz + 2.0, 1.2, M, 7); tree(b, bx + 2.8, bz + 2.4, 1.05, M, 8);
    // ---- ponto de ônibus ----
    const [ux, uz] = PLACE.busStop;
    bench(b, ux, uz, M);
    for (const dx of [-1.6, 1.6]) b.add(boxGeo(V(ux + dx - 0.06, D0, uz + 0.5), V(ux + dx + 0.06, D0 + 2.6, uz + 0.62)), M.iron);
    b.add(boxGeo(V(ux - 1.7, D0 + 2.6, uz - 0.6), V(ux + 1.7, D0 + 2.75, uz + 0.75)), M.roofBus);
    b.add(boxGeo(V(ux - 1.6, D0 + 0.3, uz + 0.62), V(ux + 1.6, D0 + 2.5, uz + 0.66)), M.glass);
    b.add(boxGeo(V(ux + 1.9, D0, uz - 0.2), V(ux + 1.98, D0 + 2.9, uz - 0.12)), M.iron);
    b.add(quad(V(ux + 1.55, D0 + 2.45, uz - 0.24), V(ux + 2.35, D0 + 2.45, uz - 0.24), V(ux + 2.35, D0 + 2.75, uz - 0.24), V(ux + 1.55, D0 + 2.75, uz - 0.24)), M.busSign);
    // ---- caminhão de mudança e caixas ----
    const [kx, kz] = PLACE.truck;
    b.add(boxGeo(V(kx - 2.4, D0 + 0.55, kz - 1.1), V(kx + 1.6, D0 + 3.0, kz + 1.1)), M.truckBox);
    b.add(quad(V(kx - 2.3, D0 + 1.1, kz - 1.12), V(kx + 1.5, D0 + 1.1, kz - 1.12), V(kx + 1.5, D0 + 2.6, kz - 1.12), V(kx - 2.3, D0 + 2.6, kz - 1.12)), M.sign);
    b.add(boxGeo(V(kx + 1.6, D0 + 0.55, kz - 1.0), V(kx + 3.1, D0 + 2.3, kz + 1.0)), M.truckCab);
    b.add(boxGeo(V(kx + 2.3, D0 + 1.45, kz - 1.02), V(kx + 3.0, D0 + 2.1, kz - 0.98)), M.window);
    for (const wx of [kx - 1.6, kx + 0.6, kx + 2.4]) for (const wz of [kz - 1.05, kz + 1.05]) b.add(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 20).rotateX(Math.PI / 2), M.tyre, at(wx, D0 + 0.45, wz));
    for (const [x, z, s, y] of [[kx - 3.4, kz - 0.9, 0.55, 0], [kx - 4.1, kz - 0.6, 0.5, 0], [kx - 3.6, kz - 0.8, 0.42, 0.55]] as const) {
      b.add(boxGeo(V(x - s / 2, D0 + y, z - s / 2), V(x + s / 2, D0 + y + s, z + s / 2)), M.box);
      b.add(boxGeo(V(x - s / 2 - 0.005, D0 + y + s * 0.45, z - s / 2 - 0.005), V(x + s / 2 + 0.005, D0 + y + s * 0.55, z + s / 2 + 0.005)), M.boxTape);
    }
    b.build(R);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 14, 110);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar * 1.4;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    // ---- elenco + efeitos ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const fwd = V(0, 0, 0); cam.getWorldDirection(fwd);
    const up = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
    const st = stage(id, t, { pos: cam.position, right, fwd, up, fov: c.fov });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      (e2 as Fx & { top?: boolean }).top = !!p.top;
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) {
      e3.bind();
      const top = !!(e3 as Fx & { top?: boolean }).top;
      if (top) e3.mesh.renderOrder = 10;
      for (const m of [e3.mat, e3.soft]) m.depthTest = !top;
    }
    return focus;
  }
}
export type { V3 };
