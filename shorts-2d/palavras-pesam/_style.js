let TNOW = 0;
// ================= ESTILO "LIVRO ILUSTRADO": proporção mais normal, sombra em 2 tons, sombra no chão =================
function shade(hex, k = 0.16) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v, tint) => Math.max(0, Math.min(255, Math.round(v * (1 - k) + tint * k * 0.25)));
  return '#' + [f(r, 40), f(g, 30), f(b, 90)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function tint(hex, k = 0.25) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
const clipG = (shape, inner) => { const id = 'cl' + (ZID++); return `<clipPath id="${id}">${shape}</clipPath><g clip-path="url(#${id})">${inner}</g>`; };
const rawPath = (d, f) => `<path d="${d}" fill="${f}"/>`;
const strokeOnly = (d, col, w) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function head(d) {
  let g = (d.hair === 'kai' && !d.back) ? kaiBackHair(d) : '';
  g += E(-123, 4, 20, 28, d.skin) + E(123, 4, 20, 28, d.skin) + E(128, 8, 9, 14, shade(d.skin, 0.2), 0);
  g += R(-122, -108, 244, 216, 82, d.skin);
  g += clipG('<rect x="-122" y="-108" width="244" height="216" rx="82"/>', E(d.back ? 40 : 190, 40, 130, 200, shade(d.skin, 0.14), 0) + E(-60, -70, 60, 26, 'rgba(255,255,255,0.18)', 0));
  g += R(-122, -108, 244, 216, 82, 'url(#vol)', 0) + R(-122, -108, 244, 216, 82, 'none');
  if (d.back) {
    if (d.hair !== 'bald') g += P('M-126,50 C-136,-140 136,-140 126,50 C60,30 -60,30 -126,50Z', d.hairCol) + strokeOnly('M-80,-90 Q0,-130 70,-96', 'rgba(255,255,255,0.22)', 12);
    if (d.hair === 'bun') g += C(0, -128, 36, d.hairCol, 7);
    return g;
  }
  g += face(d);
  if (d.blink) { const ey = d.anime ? 10 : -5, rx = d.anime ? 36 : 30, ry = d.anime ? 42 : 32; for (const sx of [-1, 1]) g += E(sx * 52, ey, rx, ry, d.skin, 0) + strokeOnly(`M${sx * 52 - 28},${ey + 4} Q${sx * 52},${ey + 16} ${sx * 52 + 28},${ey + 4}`, O, 8); }
  g += hair(d);
  if (d.hair !== 'bald') g += strokeOnly(d.hair === 'kai' ? 'M-92,-96 Q-44,-124 16,-118' : 'M-84,-66 Q-44,-90 6,-88', 'rgba(255,255,255,0.25)', 12);
  return g;
}

/** Converte a mão do esquema antigo (ombro em ±88,-238) para o corpo novo (braço com cotovelo). */
function armPath(side, h, col, skin, hand) {
  const sx = side * 80, sy = -386;
  const odx = (h[0] - side * 88) * 1.1, ody = (h[1] + 238) * 1.5;
  const oL = Math.hypot(odx, ody) || 1;
  const L = Math.min(oL, 176), ux = odx / oL, uy = ody / oL;
  const hx = sx + ux * L, hy = sy + uy * L;
  const seg = 96, half = L / 2, bend = Math.sqrt(Math.max(0, seg * seg - half * half));
  let px = -uy, py = ux; if (px * side < 0 || (Math.abs(px) < 0.2 && py < 0)) { px = -px; py = -py; }
  const ex = sx + ux * half + px * bend * 0.7, ey = sy + uy * half + py * bend * 0.7;
  let g = limb(sx, sy, ex, ey, col, 50) + limb(ex, ey, hx, hy, col, 46);
  g += Ln(sx + 11, sy + 6, ex + 11, ey, shade(col, 0.2), 14) + Ln(sx - 12, sy + 4, ex - 12, ey, 'rgba(255,255,255,0.16)', 9) + Ln(ex - 11, ey, hx - 10, hy, 'rgba(255,255,255,0.14)', 8) + C(ex, ey, 24, col, 0) + Ln(ex, ey, hx, hy, col, 46);
  g += C(hx, hy, 26, skin) + C(hx, hy, 26, 'url(#vol)', 0);
  return g;
}
const TORSO = 'M-96,-196 C-112,-290 -114,-368 -76,-402 Q0,-418 76,-402 C114,-368 112,-290 96,-196 C50,-182 -50,-182 -96,-196Z';
function person(o) {
  const d = Object.assign({ x: 0, y: 0, s: 1, sx: 1, sy: 1, rot: 0, hl: [-150, -150], hr: [150, -150], legs: true, lift: 0, hrot: 0 }, o);
  const ph = (d.x || 0) * 0.0137 + (d.y || 0) * 0.0071 + (d.s || 1) * 3.1, tn = TNOW;
  d.hl = [d.hl[0] + Math.sin(tn * 1.9 + ph) * 6, d.hl[1] + Math.cos(tn * 1.6 + ph) * 7];
  d.hr = [d.hr[0] + Math.sin(tn * 1.7 + ph + 1) * 6, d.hr[1] + Math.cos(tn * 1.8 + ph + 2) * 7];
  d.hrot = (d.hrot || 0) + Math.sin(tn * 1.3 + ph) * 2.2;
  const bre = 1 + 0.014 * Math.sin(tn * 2.4 + ph);
  const bl = ((tn + ph * 0.7) % 3.6 + 3.6) % 3.6;
  d.blink = bl < 0.13 && !['sleep', 'happy', 'squish'].includes(d.expr);
  const hand = d.gloves ? '#FFFFFF' : d.skin;
  let g = '';
  if (d.legs && !d.rot) g += E(0, -4, 140, 24, 'rgba(30,18,40,0.22)', 0);
  if (d.legs) {
    g += R(-94, -236, 188, 64, 26, d.pants);
    for (const sd of [-1, 1]) {
      g += limb(sd * 46, -206, sd * 48, -42, d.pants, 62) + Ln(sd * 46 + 16, -200, sd * 48 + 16, -50, shade(d.pants, 0.22), 15) + Ln(sd * 46 - 16, -200, sd * 48 - 16, -60, 'rgba(255,255,255,0.12)', 9);
      g += E(sd * 54, -24, 54, 28, d.shoe) + E(sd * 54, -24, 54, 28, 'url(#vol)', 0) + R(sd * 54 - 52, -14, 104, 15, 7, tint(d.shoe, 0.6), 5) + E(sd * 54 - 14, -34, 18, 8, 'rgba(255,255,255,0.25)', 0);
    }
  }
  const arms = armPath(-1, d.hl, d.shirt, hand) + armPath(1, d.hr, d.shirt, hand);
  if (d.back) g += arms;
  g += P(TORSO, d.shirt) + clipG(`<path d="${TORSO}"/>`, R(34, -430, 100, 260, 0, shade(d.shirt, 0.18), 0) + strokeOnly('M-46,-270 Q-24,-258 -12,-232', shade(d.shirt, 0.25), 7)) + P(TORSO, 'url(#vol)', 0) + P(TORSO, 'none');
  g += R(-26, -430, 52, 36, 10, d.skin, 5) + R(6, -430, 20, 36, 6, shade(d.skin, 0.15), 0);
  if (!d.back) {
    if (d.scarf) { // moletom (bolso + cordão) e cachecol do Kai
      g += P('M-62,-280 L62,-280 L74,-212 L-74,-212Z', shade(d.shirt, 0.1), 5) + Ln(-24, -394, -28, -330, '#E8E8F0', 6) + Ln(24, -394, 28, -330, '#E8E8F0', 6);
      g += R(22, -404, 52, 140, 16, '#1A1A20', 6) + R(22, -284, 52, 22, 5, '#F07A1A', 5) + E(0, -406, 100, 32, '#1A1A20') + strokeOnly('M-66,-414 Q0,-396 66,-414', 'rgba(255,255,255,0.18)', 7);
    }
    if (d.tie) g += P('M-38,-406 L0,-352 L38,-406Z', '#FFFFFF', 5) + P('M-11,-390 L11,-390 L16,-300 L0,-282 L-16,-300Z', d.tie, 5);
    if (d.collar) g += E(0, -406, 80, 22, d.collar);
    g += arms;
  }
  const hs = (d.hs || 1) * 0.95;
  g += G(`translate(0,${-420 - 100 * hs + (bre - 1) * 400}) rotate(${d.hrot}) scale(${hs})`, head(d));
  return G(`translate(${d.x},${d.y - d.lift}) rotate(${d.rot}) scale(${d.s * d.sx * 0.92},${d.s * d.sy * 0.92 * (d.legs ? 1 : bre)})`, g);
}

/** Cômodo com degradê na parede, rodapé, tábuas no chão e sombra no canto. */
function floorRoom(wall, floor, y = 1450) {
  const id = 'rm' + (ZID++);
  let g = `<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(wall, 0.12)}"/><stop offset="1" stop-color="${shade(wall, 0.1)}"/></linearGradient>`;
  g += `<linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(floor, 0.12)}"/><stop offset="1" stop-color="${tint(floor, 0.08)}"/></linearGradient>`;
  g += R(-60, -60, 1200, y + 60, 0, `url(#${id}w)`, 0);
  for (let i = 0; i < 9; i++) g += Ln(-60 + i * 150, -60, -60 + i * 150, y, 'rgba(255,255,255,0.05)', 40);
  g += R(-60, y, 1200, 760, 0, `url(#${id}f)`, 0);
  for (let i = 1; i < 6; i++) g += Ln(-60, y + i * 70 + i * i * 6, 1140, y + i * 70 + i * i * 6, shade(floor, 0.18), 4);
  for (let i = 0; i < 8; i++) { const yy = y + 40 + (i % 5) * 90; g += Ln(-60 + ((i * 337) % 1200), yy, -60 + ((i * 337) % 1200), yy + 60, shade(floor, 0.18), 4); }
  g += R(-60, y - 34, 1200, 34, 0, tint(wall, 0.35), 0) + Ln(-60, y - 34, 1140, y - 34, O, 4) + Ln(-60, y, 1140, y, O, 5);
  g += R(-60, y, 1200, 40, 0, 'rgba(40,20,50,0.12)', 0);
  return g;
}
