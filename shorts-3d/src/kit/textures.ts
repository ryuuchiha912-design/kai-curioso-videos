import * as THREE from "three";

/** Cache de texturas de canvas: mesma chave = mesma textura (determinístico e barato). */
const cache = new Map<string, THREE.CanvasTexture>();

export const canvasTexture = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  if (cache.size > 400) {
    const first = cache.keys().next().value as string;
    cache.get(first)?.dispose();
    cache.delete(first);
  }
  cache.set(key, tex);
  return tex;
};

export const stripes = (a: string, b: string, n = 8) =>
  canvasTexture(`stripes-${a}-${b}-${n}`, 64, 256, (ctx, w, h) => {
    for (let i = 0; i < n * 2; i++) {
      ctx.fillStyle = i % 2 ? b : a;
      ctx.fillRect(0, (i * h) / (n * 2), w, h / (n * 2) + 1);
    }
  });

export const FONT = "'Lilita One', 'Arial Black', sans-serif";
export const fontReady = () => (typeof document !== "undefined" && document.fonts?.check("40px 'Lilita One'") ? 1 : 0);

/** Placa/etiqueta com texto: a "informação vira objeto". */
export const labelTexture = (text: string, bg: string, fg: string, w = 512, h = 256, border = "#2a1a10") =>
  canvasTexture(`label-${text}-${bg}-${fg}-${w}x${h}-${border}-${fontReady()}`, w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 14;
    ctx.strokeStyle = border;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = h * 0.55;
    ctx.font = `${size}px ${FONT}`;
    while (ctx.measureText(text).width > w * 0.86 && size > 10) {
      size -= 4;
      ctx.font = `${size}px ${FONT}`;
    }
    ctx.fillText(text, w / 2, h / 2 + size * 0.05);
  });
