<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:#000;width:1080px;height:1920px;overflow:hidden}
  svg{display:block}
  text{font-family:'Montserrat',sans-serif;font-weight:800}
</style></head>
<body>
<svg id="s" width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"></svg>
<script>
const TL = __TIMELINE__;
const O = '#1A1210';
const DUR = TL.total;

// ---------------- helpers
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

const P = (d, f, sw = 7, ex = '') => `<path d="${d}" fill="${f}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${ex}/>`;
const C = (x, y, r, f, sw = 7, ex = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${sw ? O : 'none'}" stroke-width="${sw}" ${ex}/>`;
const E = (x, y, rx, ry, f, sw = 7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${sw ? O : 'none'}" stroke-width="${sw}"/>`;
const R = (x, y, w, h, rx, f, sw = 7, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${sw ? O : 'none'}" stroke-width="${sw}" ${ex}/>`;
const Ln = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const limb = (x1, y1, x2, y2, c, w, ow = 13) => Ln(x1, y1, x2, y2, O, w + ow) + Ln(x1, y1, x2, y2, c, w);
const T = (x, y, s, size, f = '#fff', sw = 0, ex = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${f}" text-anchor="middle" dominant-baseline="middle" ${sw ? `stroke="${O}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` : ''} ${ex}>${s}</text>`;
const G = (tr, inner) => `<g transform="${tr}">${inner}</g>`;
function star(cx, cy, r1, r2, n, f, rot = 0) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return P(d + 'Z', f, 7);
}
function sparkle(x, y, s, f = '#FFF6C8') {
  return G(`translate(${x},${y}) scale(${s})`, P('M0,-40 Q6,-6 40,0 Q6,6 0,40 Q-6,6 -40,0 Q-6,-6 0,-40Z', f, 5));
}

// ---------------- characters
const JUCA = { skin: '#FBE7D8', shirt: '#1F2E57', pants: '#2A2A33', hair: 'kai', hairCol: '#16161C', anime: true, scarf: true, hs: 1.28, shoe: '#2B2B33', sole: '#F07A1A' };
const OSHIYA = { skin: '#E8B98F', shirt: '#22355E', pants: '#1B2744', hair: 'cap', hairCol: '#1B1716', gloves: true, tie: '#22355E', shoe: '#1A1A1A' };
const SKINS = ['#F1C7A0', '#E8B98F', '#D9A47A', '#F5D2B0', '#C88F66'];
const SUITS = ['#3A3F4B', '#2F3B57', '#555B66', '#6B5B4B', '#3C4D3F', '#7A2E3A', '#4B4F7A'];
const TIES = ['#C62A2A', '#2C6FB6', '#E0B13A', '#3E9B4A'];
function passenger(seed, extra = {}) {
  const r = rng(seed * 7919 + 13);
  r();
  return Object.assign({
    skin: SKINS[Math.floor(r() * SKINS.length)], shirt: SUITS[Math.floor(r() * SUITS.length)],
    pants: '#262A36', hair: r() < 0.25 ? 'bun' : (r() < 0.15 ? 'bald' : 'short'), hairCol: '#1B1716',
    tie: r() < 0.7 ? TIES[Math.floor(r() * TIES.length)] : null, shoe: '#2B2B2B', glasses: false
  }, extra);
}

function animeFace(d) {
  const e = d.expr || 'neutral', lx = d.lx || 0;
  let g = '';
  const cy = 10;
  for (const sx of [-1, 1]) {
    const cx = sx * 52;
    if (e === 'sleep') { g += P(`M${cx - 28},${cy} Q${cx},${cy + 18} ${cx + 28},${cy}`, 'none', 9); continue; }
    if (e === 'happy') { g += P(`M${cx - 28},${cy + 8} Q${cx},${cy - 24} ${cx + 28},${cy + 8}`, 'none', 10); continue; }
    if (e === 'squish') { g += P(`M${sx * 74},${cy - 16} L${sx * 38},${cy} L${sx * 74},${cy + 16}`, 'none', 10); continue; }
    const big = e === 'surprised';
    g += E(cx, cy, 30, 37, '#fff', 5);
    const irx = big ? 16 : 24, iry = big ? 21 : 30, ox = lx * 7 + (e === 'sus' ? -6 * sx * 0 - 5 : 0);
    g += E(cx + ox, cy + 3, irx, iry, '#2B303E', 0) + E(cx + ox, cy + 5, irx * 0.5, iry * 0.5, '#0E0E12', 0);
    g += C(cx + ox + 8, cy - 10, big ? 5 : 8, '#fff', 0) + C(cx + ox - 8, cy + 14, 4, '#fff', 0);
    if (e === 'sus' || e === 'tired') {
      g += P(`M${cx - 33},${cy + 2} L${cx - 33},${cy - 40} L${cx + 33},${cy - 40} L${cx + 33},${cy + 2} Z`, d.skin, 0);
      g += P(`M${cx - 34},${cy + 2} Q${cx},${cy - 4} ${cx + 34},${cy + 4}`, 'none', 9);
    } else {
      g += P(`M${cx - 35},${cy - 18} Q${cx},${cy - 50} ${cx + 35},${cy - 22}`, 'none', 9);
    }
  }
  const br = { surprised: -66, worried: -50, neutral: -48, sus: -44, tired: -44, happy: -50, squish: -46 }[e] ?? -48;
  for (const sx of [-1, 1]) {
    const inner = e === 'worried' || e === 'tired' || e === 'sad' ? -10 : (e === 'squish' || e === 'angry' ? 14 : 0);
    g += Ln(sx * 30, br + inner, sx * 78, br, '#16161C', 7);
  }
  g += E(-82, 46, 18, 9, 'rgba(240,140,140,0.45)', 0) + E(82, 46, 18, 9, 'rgba(240,140,140,0.45)', 0);
  g += Ln(-2, 40, 2, 40, 'rgba(150,90,70,0.6)', 5);
  const m = { sleep: 'M-10,66 L10,66', angry: 'M-20,72 Q0,58 20,72', sad: 'M-18,72 Q0,60 18,72', neutral: 'M-14,66 L14,66', sus: 'M-18,66 Q4,70 22,60', tired: 'M-14,68 L14,68', worried: 'M-18,70 Q0,60 18,70', squish: 'M-24,66 q6,-8 12,0 t12,0 t12,0 t12,0' }[e];
  if (e === 'surprised') g += E(0, 66, 11, 15, '#5A1F1A', 5);
  else if (e === 'happy') g += P('M-26,58 Q0,90 26,58 Z', '#5A1F1A', 6) + P('M-14,76 Q0,86 14,76 Q0,70 -14,76Z', '#E86A6A', 0);
  else g += P(m, 'none', 7);
  return g;
}
function kaiBackHair(d) {
  return P('M-150,80 C-176,-190 176,-190 150,80 L120,40 L100,95 L-100,95 L-120,40 Z', d.hairCol, 7);
}
function kaiFrontHair(d) {
  const c = d.hairCol;
  let g = P('M-134,-14 C-150,-178 150,-178 134,-14 L106,-62 L94,4 L72,-58 L54,-6 L32,-62 L10,-4 L0,-72 L-10,-4 L-32,-62 L-54,-6 L-72,-58 L-94,4 L-106,-62 Z', c, 7);
  g += P('M-6,-66 L10,-66 L-4,22 Z', c, 5);
  for (const sx of [-1, 1]) g += P(`M${sx * 126},-60 L${sx * 156},108 L${sx * 128},74 L${sx * 118},118 L${sx * 102},-4 Z`, c, 7);
  return g;
}
function face(d) {
  if (d.anime) return animeFace(d);
  const e = d.expr || 'neutral', lx = d.lx || 0;
  let g = '';
  const ey = -5;
  if (e === 'squish') {
    for (const sx of [-1, 1]) g += P(`M${sx * 72},${ey - 16} L${sx * 38},${ey} L${sx * 72},${ey + 16}`, 'none', 9);
  } else if (e === 'sleep') {
    for (const sx of [-1, 1]) g += P(`M${sx * 52 - 26},${ey} Q${sx * 52},${ey + 16} ${sx * 52 + 26},${ey}`, 'none', 9);
  } else {
    const big = e === 'surprised', r = big ? 31 : 25, pr = big ? 9 : 12;
    for (const sx of [-1, 1]) {
      const cx = sx * 52;
      g += C(cx, ey, r, '#fff', 5) + C(cx + lx * 9, ey + 2, pr, O, 0);
      if (!big) g += C(cx + lx * 9 + 5, ey - 4, 4, '#fff', 0);
      if (e === 'sus' || e === 'tired') g += P(`M${cx - r - 3},${ey + 2} A${r + 3},${r + 3} 0 0 1 ${cx + r + 3},${ey + 2} Z`, d.skin, 5);
    }
  }
  const brows = {
    neutral: [[-80, -52, -28, -55], [28, -55, 80, -52]],
    happy: [[-80, -55, -28, -62], [28, -62, 80, -55]],
    surprised: [[-80, -78, -28, -84], [28, -84, 80, -78]],
    sus: [[-80, -42, -28, -38], [28, -58, 80, -64]],
    tired: [[-80, -45, -28, -45], [28, -45, 80, -45]],
    worried: [[-80, -48, -28, -64], [28, -64, 80, -48]],
    sad: [[-80, -48, -28, -64], [28, -64, 80, -48]],
    sleep: [[-80, -48, -28, -50], [28, -50, 80, -48]],
    angry: [[-80, -64, -28, -44], [28, -44, 80, -64]],
    squish: [[-80, -62, -30, -42], [30, -42, 80, -62]],
  }[e] || [[-80, -52, -28, -55], [28, -55, 80, -52]];
  for (const b of brows) g += Ln(b[0], b[1], b[2], b[3], d.hairCol === '#1B1716' || d.hair === 'cap' ? '#1B1716' : d.hairCol, 13);
  g += E(0, 30, 12, 10, 'rgba(120,60,30,0.35)', 0);
  const m = {
    neutral: `M-22,64 L22,64`, happy: `M-42,56 Q0,98 42,56`, sus: `M-30,66 Q5,72 36,56`,
    tired: `M-22,66 L22,66`, worried: `M-30,72 Q0,56 30,72`, sad: `M-30,74 Q0,58 30,74`, sleep: `M-14,66 L14,66`, angry: `M-30,74 Q0,60 30,74`, squish: `M-36,66 q9,-11 18,0 t18,0 t18,0 t18,0`,
  }[e];
  if (e === 'surprised') g += E(0, 66, 17, 24, '#5A1F1A', 6);
  else if (e === 'happy') g += P(`M-42,54 Q0,104 42,54 Z`, '#5A1F1A', 7) + P(`M-24,82 Q0,96 24,82 Q0,74 -24,82Z`, '#E86A6A', 0);
  else g += P(m, 'none', 9);
  if (d.mustache) g += P('M-46,46 Q-20,30 0,40 Q20,30 46,46 Q20,58 0,50 Q-20,58 -46,46Z', d.hairCol, 4);
  if (d.glasses) {
    for (const sx of [-1, 1]) g += C(sx * 54, ey, 48, 'none', 17) + C(sx * 54, ey, 48, 'none', 0, `stroke="#F07A1A" stroke-width="10"`);
    g += Ln(-8, ey - 4, 8, ey - 4, O, 16) + Ln(-8, ey - 4, 8, ey - 4, '#F07A1A', 9);
  }
  return g;
}

function hair(d) {
  const c = d.hairCol;
  if (d.hair === 'kai') return kaiFrontHair(d);
  if (d.hair === 'curly') {
    let g = '';
    const pts = [[-112, -66, 34], [-84, -100, 38], [-42, -116, 40], [0, -120, 40], [42, -116, 40], [84, -100, 38], [112, -66, 34], [-60, -132, 30], [20, -138, 30], [70, -128, 28], [10, -100, 34]];
    for (const [x, y, r] of pts) g += C(x, y, r, c, 6);
    return g;
  }
  if (d.hair === 'short' || d.hair === 'bun') {
    let g = P('M-124,-6 C-134,-130 134,-130 124,-6 C112,-62 60,-82 0,-80 C-60,-82 -112,-62 -124,-6Z', c, 7);
    if (d.hair === 'bun') g += C(0, -128, 36, c, 7);
    return g;
  }
  if (d.hair === 'cap') {
    return P('M-128,-44 C-130,-160 130,-160 128,-44 Z', '#22355E', 7) + R(-130, -64, 260, 26, 6, '#F2B636', 6)
      + P('M-128,-42 Q0,-6 128,-42 Q140,-30 128,-24 Q0,8 -128,-24 Q-140,-30 -128,-42Z', '#141E36', 6) + C(0, -104, 17, '#F2B636', 5);
  }
  return '';
}

function head(d) {
  let g = (d.hair === 'kai' && !d.back) ? kaiBackHair(d) : '';
  g += E(-123, 4, 20, 28, d.skin) + E(123, 4, 20, 28, d.skin);
  g += R(-122, -108, 244, 216, 82, d.skin);
  if (d.back) {
    if (d.hair === 'cap') g += P('M-124,40 C-132,-120 132,-120 124,40 C60,24 -60,24 -124,40Z', d.hairCol) + hair(d);
    else if (d.hair !== 'bald') g += P('M-126,50 C-136,-140 136,-140 126,50 C60,30 -60,30 -126,50Z', d.hairCol);
    return g;
  }
  return g + face(d) + hair(d);
}

function person(o) {
  const d = Object.assign({ x: 0, y: 0, s: 1, sx: 1, sy: 1, rot: 0, hl: [-150, -150], hr: [150, -150], legs: true, lift: 0, hrot: 0 }, o);
  const hand = d.gloves ? '#FFFFFF' : d.skin, hrd = d.gloves ? 28 : 22;
  let g = '';
  if (d.legs) {
    g += limb(-42, -125, -46, -34, d.pants, 42) + limb(42, -125, 46, -34, d.pants, 42);
    if (d.sole) g += E(-52, -12, 46, 14, d.sole) + E(52, -12, 46, 14, d.sole);
    g += E(-52, -22, 44, 24, d.shoe) + E(52, -22, 44, 24, d.shoe);
  }
  let arms = limb(-88, -238, d.hl[0], d.hl[1], d.shirt, 36) + C(d.hl[0], d.hl[1], hrd, hand)
    + limb(88, -238, d.hr[0], d.hr[1], d.shirt, 36) + C(d.hr[0], d.hr[1], hrd, hand);
  if (d.wrist !== undefined) {
    const k = 0.72, wx = 88 + (d.hr[0] - 88) * k, wy = -238 + (d.hr[1] + 238) * k;
    arms += (d.wristGlow ? C(wx, wy, 44, `rgba(255,214,90,${0.45 * d.wristGlow})`, 0) : '') + C(wx, wy, 27, '#FFF6C8', 5) + T(wx, wy + 3, d.wrist, 36, '#C62A2A');
  }
  if (d.back) g += arms;
  g += P('M-104,-118 C-118,-210 -100,-268 -50,-280 L50,-280 C100,-268 118,-210 104,-118 C60,-100 -60,-100 -104,-118Z', d.shirt);
  if (!d.back) {
    if (d.tie) g += P('M-42,-280 L0,-214 L42,-280Z', '#FFFFFF', 5) + P('M-11,-262 L11,-262 L17,-172 L0,-152 L-17,-172Z', d.tie, 5);
    if (d.collar) g += E(0, -276, 80, 24, d.collar) + limb(-24, -262, -28, -196, d.collar, 7, 8) + limb(24, -262, 28, -196, d.collar, 7, 8);
    g += arms;
    if (d.scarf) g += R(18, -272, 50, 150, 16, '#1A1A20', 7) + R(18, -150, 50, 22, 4, '#F07A1A', 6) + E(0, -278, 98, 32, '#1A1A20');
  } else if (d.collar) g += E(0, -276, 80, 24, d.collar);
  const hs = d.hs || 1;
  g += G(`translate(0,${-268 - 120 * hs}) rotate(${d.hrot}) scale(${hs})`, head(d));
  return G(`translate(${d.x},${d.y - d.lift}) rotate(${d.rot}) scale(${d.s * d.sx},${d.s * d.sy})`, g);
}

// ================= BRAIN 10x video =================
const KAI = JUCA;
const KID = s => passenger(s, { shirt: ['#F4F4F4', '#E9E4D8', '#F4F4F4'][s % 3], pants: '#2E3A5C', tie: null, hair: s % 3 === 0 ? 'bun' : 'short', shoe: '#2B2B2B' });
const MOM = { skin: '#F1C7A0', shirt: '#C2577A', pants: '#4A3A5C', hair: 'bun', hairCol: '#3A2418', shoe: '#5A2E3A', tie: null };
const LINE_START = TL.lines.map(l => l.start);
const NARR_END = TL.lines[TL.lines.length - 1].end;
const COVER_T = DUR - 0.6;


// word timing helper: time (scene-local) when word index i of line L starts
function wt(L, i) { const w = TL.lines[L].words; if (!w || !w.length) return 0; const k = Math.min(i, w.length - 1); return w[k].start - CUTS[L]; }
function wtLast(L) { const w = TL.lines[L].words; return (w && w.length ? w[w.length - 1].end : TL.lines[L].end) - CUTS[L]; }

function rays(t, c1, c2, cx = 540, cy = 960, n = 18, sp = 0.25) {
  let g = R(-60, -60, 1200, 2040, 0, c1, 0);
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n + t * sp, b = a + Math.PI / n;
    g += P(`M${cx},${cy} L${cx + Math.cos(a) * 1700},${cy + Math.sin(a) * 1700} L${cx + Math.cos(b) * 1700},${cy + Math.sin(b) * 1700}Z`, c2, 0);
  }
  return g;
}
function bolt(x, y, s, rot, f = '#FFE14D') {
  return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, P('M-10,-60 L22,-60 L4,-10 L28,-10 L-18,62 L-4,8 L-26,8 Z', f, 6));
}
function brainFx(x, y, s, t) { // lightning crackling around a head center
  let g = '';
  const pts = [[-200, -150, -25], [210, -140, 25], [-240, 30, -60], [240, 40, 60], [0, -240, 0]];
  pts.forEach(([dx, dy, r], i) => { const on = Math.sin(t * 14 + i * 2.1) > -0.2; if (on) g += bolt(x + dx * s, y + dy * s, s * (0.9 + 0.2 * Math.sin(t * 20 + i)), r); });
  return g;
}
function brainIcon(x, y, s, glow = 0) {
  let g = '';
  if (glow) g += C(0, 0, 210, `rgba(120,220,255,${0.25 * glow})`, 0) + C(0, 0, 170, `rgba(160,240,255,${0.3 * glow})`, 0);
  g += P('M-150,10 C-170,-90 -80,-150 -20,-120 C20,-160 120,-150 140,-80 C190,-50 180,40 130,60 C120,110 40,120 0,90 C-40,120 -130,110 -140,60 C-170,50 -170,30 -150,10Z', '#F59AB5', 9);
  g += P('M-100,-60 q30,-20 50,10 t50,0', 'none', 7) + P('M-120,20 q40,-30 70,0 t60,-10', 'none', 7) + P('M30,-90 q20,30 60,20', 'none', 7) + P('M60,30 q20,20 50,0', 'none', 7) + Ln(0, -110, 0, 85, O, 7);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function badge(x, y, s, txt, bg = '#C62A2A', fg = '#FFFFFF', rot = -6, size = 90) {
  const w = txt.length * size * 0.62 + 60;
  return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, R(-w / 2, -size * 0.75, w, size * 1.5, size * 0.4, bg, 9) + T(0, 6, txt, size, fg));
}
function floorRoom(wall, floor, y = 1450) { return R(-60, -60, 1200, y + 60, 0, wall, 0) + R(-60, y, 1200, 700, 0, floor, 8); }
function windowFrame(x, y, w, h, sky) { return R(x, y, w, h, 14, sky, 9) + Ln(x + w / 2, y, x + w / 2, y + h, O, 8) + Ln(x, y + h / 2, x + w, y + h / 2, O, 8); }
function clockFace(x, y, r, a1, a2, label) {
  let g = C(x, y, r, '#FFFFFF', 9) + Ln(x, y, x + Math.cos(a1) * r * 0.5, y + Math.sin(a1) * r * 0.5, O, 10) + Ln(x, y, x + Math.cos(a2) * r * 0.75, y + Math.sin(a2) * r * 0.75, O, 7) + C(x, y, 8, O, 0);
  if (label) g += R(x - 90, y + r + 14, 180, 64, 16, '#C62A2A', 7) + T(x, y + r + 48, label, 44, '#FFFFFF');
  return g;
}
function bubble(x, y, w, h, txt, size = 46, tail = 'left', fill = '#FFFFFF') {
  const tx = tail === 'left' ? x + 40 : x + w - 90;
  return R(x, y, w, h, 30, fill, 8) + P(`M${tx},${y + h - 4} L${tx + (tail === 'left' ? -10 : 60)},${y + h + 60} L${tx + 50},${y + h - 4}Z`, fill, 8) + R(tx + 4, y + h - 14, 42, 16, 0, fill, 0) + T(x + w / 2, y + h / 2 + 4, txt, size, '#1A1210');
}
function plate(x, y, s) {
  return G(`translate(${x},${y}) scale(${s})`, E(0, 0, 120, 34, '#FFFFFF', 7) + E(-30, -14, 52, 22, '#FFF8EC', 5) + E(40, -12, 46, 20, '#7A4A2A', 5) + C(30, -18, 6, '#4A2A18', 0) + C(52, -10, 6, '#4A2A18', 0));
}
function desk(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-130, -20, 260, 40, 8, '#B9874F', 7) + Ln(-110, 20, -110, 140, O, 10) + Ln(110, 20, 110, 140, O, 10)); }
function paper(x, y, s, rot, grade) {
  let g = R(-80, -105, 160, 210, 8, '#FFFFFF', 6);
  for (let i = 0; i < 5; i++) g += Ln(-55, -60 + i * 30, 55, -60 + i * 30, '#9AA6B8', 5);
  if (grade) g += C(30, 50, 46, 'none', 0, 'stroke="#C62A2A" stroke-width="9"') + T(30, 54, grade, 52, '#C62A2A');
  return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, g);
}
function fly(x, y, s, t, slow) {
  const flap = Math.sin(t * (slow ? 3 : 40)) * 0.5 + 0.5;
  return G(`translate(${x},${y}) scale(${s})`, E(-14, -22, 22, 12 + flap * 10, 'rgba(220,240,255,0.85)', 4) + E(14, -22, 22, 12 + (1 - flap) * 10, 'rgba(220,240,255,0.85)', 4) + E(0, 0, 26, 18, '#2B2B33', 5) + C(18, -4, 8, '#C62A2A', 0));
}
function speedLines(t, col = 'rgba(255,255,255,0.5)') {
  let g = ''; const r = rng(31);
  for (let i = 0; i < 26; i++) { const y = r() * 1920, x = ((r() * 2200 - t * 1400 * (0.5 + r())) % 2200 + 2200) % 2200 - 300; g += Ln(x, y, x + 200 + r() * 200, y, col, 6); }
  return g;
}
function guitar(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-14, -170, 28, 160, 8, '#6B4426', 6) + E(0, 30, 70, 60, '#E07B39', 7) + E(0, -20, 52, 44, '#E07B39', 7) + C(0, 20, 20, '#3A2516', 0)); }
function bookEn(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-90, -110, 180, 220, 12, '#2C6FB6', 8) + R(-70, -90, 140, 70, 8, '#FFFFFF', 0) + T(0, -54, 'HELLO!', 34, '#2C6FB6') + T(0, 40, 'EN', 60, '#FFFFFF')); }
function pan(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, Ln(60, 0, 190, -30, O, 30) + Ln(60, 0, 190, -30, '#5B3A29', 18) + E(0, 0, 110, 40, '#3A3F4B', 8) + E(-10, -10, 34, 26, '#FFFFFF', 4) + C(-10, -10, 14, '#F2B636', 0)); }
function check(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, C(0, 0, 44, '#4CAF50', 7) + P('M-20,0 L-4,16 L22,-14', 'none', 10, 'stroke="#FFFFFF"')); }
function battery(x, y, s, lvl) {
  const c = lvl > 0.5 ? '#4CAF50' : lvl > 0.2 ? '#F2B636' : '#E04B3C';
  return G(`translate(${x},${y}) scale(${s})`, R(-110, -50, 220, 100, 18, '#FFFFFF', 8) + R(110, -22, 20, 44, 6, '#FFFFFF', 7) + R(-96, -36, 192 * clamp(lvl, 0.03, 1), 72, 10, c, 0));
}
function sofa(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-330, -140, 660, 160, 40, '#7A2E3A', 8) + R(-380, -60, 100, 160, 30, '#8E3644', 8) + R(280, -60, 100, 160, 30, '#8E3644', 8) + R(-300, 0, 600, 110, 24, '#8E3644', 8)); }
function cobweb(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, P('M0,0 L120,0 M0,0 L0,120 M0,0 L95,95 M40,0 Q30,30 0,40 M80,0 Q60,60 0,80 M115,0 Q90,90 0,115', 'none', 3, 'stroke="#FFFFFF"')); }


// ================= OLHOS 100x =================
function heart(x, y, s, col = '#E04B3C') { return G(`translate(${x},${y}) scale(${s})`, P('M0,30 C-60,-10 -50,-70 0,-40 C50,-70 60,-10 0,30Z', col, 7) + E(-18, -30, 10, 6, 'rgba(255,255,255,0.6)', 0)); }
function nameTag(x, y, txt, bg = '#1A1210') { const w = txt.length * 26 + 50; return R(x - w / 2, y - 34, w, 64, 20, bg, 6) + T(x, y + 2, txt, 40, '#FFFFFF'); }
function houseFront(x, y, w, h, col, roof, win = true) {
  let g = R(x, y - h, w, h, 6, col, 8) + P(`M${x - 20},${y - h} L${x + w / 2},${y - h - w * 0.45} L${x + w + 20},${y - h}Z`, roof, 8);
  if (win) g += R(x + w * 0.18, y - h * 0.75, w * 0.28, h * 0.3, 6, '#FFE27A', 6) + R(x + w * 0.56, y - h * 0.75, w * 0.28, h * 0.3, 6, '#FFE27A', 6) + R(x + w * 0.38, y - h * 0.38, w * 0.24, h * 0.38, 6, '#7A4A2A', 6);
  return g;
}


function eyeIcon(x, y, s, glow = 0, look = 0) {
  let g = '';
  if (glow) g += C(0, 0, 250, `rgba(120,220,255,${0.22 * glow})`, 0) + C(0, 0, 190, `rgba(170,240,255,${0.28 * glow})`, 0);
  g += P('M-190,0 Q0,-150 190,0 Q0,150 -190,0Z', '#FFFFFF', 12);
  g += C(look * 30, 0, 95, '#2C8FD8', 8) + C(look * 30, 0, 52, '#0E1A2A', 0) + C(look * 30 + 30, -32, 22, '#FFFFFF', 0) + C(look * 30 - 26, 30, 9, '#FFFFFF', 0);
  for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.28; g += Ln(Math.cos(a) * 150, -75 + Math.sin(a) * 40 - 20, Math.cos(a) * 185, -75 + Math.sin(a) * 60 - 45, O, 9); }
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function zoomLens(x, y, r, inner, label) {
  const id = 'z' + (ZID++);
  let g = `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`;
  g += `<g clip-path="url(#${id})">${R(x - r, y - r, 2 * r, 2 * r, 0, '#FFFFFF', 0)}${inner}</g>`;
  g += C(x, y, r + 10, 'none', 0, `stroke="#FFFFFF" stroke-width="14"`) + C(x, y, r + 20, 'none', 0, `stroke="${O}" stroke-width="12"`);
  g += Ln(x - r, y, x - r * 0.75, y, 'rgba(26,18,16,0.6)', 5) + Ln(x + r * 0.75, y, x + r, y, 'rgba(26,18,16,0.6)', 5) + Ln(x, y - r, x, y - r * 0.75, 'rgba(26,18,16,0.6)', 5) + Ln(x, y + r * 0.75, x, y + r, 'rgba(26,18,16,0.6)', 5);
  if (label) g += R(x - 90, y + r + 14, 180, 60, 18, '#E04B3C', 6) + T(x, y + r + 46, label, 38, '#FFFFFF');
  return g;
}
function kaiEyes(x, y, s, t, col = '#7FE3FF') {
  const hs = 1.28, hy = y - s * (268 + 120 * hs), k = 0.6 + 0.4 * Math.abs(Math.sin(t * 6));
  let g = '';
  for (const sx of [-1, 1]) { const ex = x + sx * s * hs * 52, ey = hy + s * hs * 10; g += C(ex, ey, s * hs * 40, 'none', 0, `stroke="rgba(127,227,255,${0.55 * k})" stroke-width="${5 * s}"`) + sparkle(ex + sx * s * hs * 34, ey - s * hs * 34, 0.25 * s * (0.6 + 0.6 * k), '#BFF6FF'); }
  return g;
}
function moon(x, y, r) { return C(x, y, r, '#D9DCE3', 8) + C(x - r * 0.3, y - r * 0.2, r * 0.18, '#B9BCC6', 5) + C(x + r * 0.3, y + r * 0.25, r * 0.24, '#B9BCC6', 5) + C(x + r * 0.15, y - r * 0.42, r * 0.1, '#B9BCC6', 4) + C(x - r * 0.35, y + r * 0.4, r * 0.12, '#B9BCC6', 4); }
function plane(x, y, s, faces) {
  let g = R(-200, -40, 400, 80, 40, '#FFFFFF', 7) + P('M-60,0 L-140,-120 L-90,-120 L40,0Z', '#C9D3DC', 6) + P('M-60,0 L-140,120 L-90,120 L40,0Z', '#C9D3DC', 6) + P('M-200,-10 L-240,-80 L-200,-80 L-160,-20Z', '#E04B3C', 6);
  for (let i = 0; i < 5; i++) { g += C(-100 + i * 55, -8, 16, '#7FC6F0', 4); if (faces) g += C(-100 + i * 55, -6, 9, ['#F1C7A0', '#E8B98F', '#C88F66'][i % 3], 0) + C(-104 + i * 55, -9, 2, O, 0) + C(-96 + i * 55, -9, 2, O, 0); }
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function dog(x, y, s, happy = true) {
  let g = E(0, 0, 90, 55, '#E8C28A', 7) + E(-80, -60, 55, 50, '#E8C28A', 7) + E(-120, -95, 18, 34, '#B98A4A', 6) + E(-45, -100, 18, 34, '#B98A4A', 6);
  g += C(-95, -65, 7, O, 0) + C(-62, -65, 7, O, 0) + E(-80, -40, 12, 9, O, 0) + (happy ? P('M-95,-28 Q-80,-14 -65,-28', 'none', 5) : P('M-95,-22 Q-80,-34 -65,-22', 'none', 5));
  for (const lx of [-55, -15, 30, 65]) g += R(lx - 12, 35, 24, 50, 10, '#E8C28A', 6);
  g += P('M85,-10 Q130,-60 120,-90', 'none', 14) + P('M85,-10 Q130,-60 120,-90', 'none', 0, 'stroke="#E8C28A" stroke-width="8"');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function phoneIcon(x, y, s, screen) { return G(`translate(${x},${y}) scale(${s})`, R(-80, -150, 160, 300, 24, '#1A1A20', 8) + R(-66, -128, 132, 240, 10, '#F4F8FF', 0) + (screen || '')); }
function busSide(x, y, s, label, col = '#F2B636') {
  return G(`translate(${x},${y}) scale(${s})`, R(0, -260, 520, 240, 30, col, 8) + R(20, -240, 200, 46, 8, '#1A1A20', 5) + T(120, -214, label, 30, '#7BE07B') + R(240, -230, 90, 80, 10, '#7FC6F0', 5) + R(345, -230, 90, 80, 10, '#7FC6F0', 5) + C(100, -10, 40, '#2A2A33', 7) + C(420, -10, 40, '#2A2A33', 7));
}
function envelope(x, y, s, grade) {
  let g = R(-150, -95, 300, 190, 10, '#FFFFFF', 7) + P('M-150,-95 L0,10 L150,-95', 'none', 6) + T(0, 55, 'BOLETIM', 38, '#2C6FB6');
  if (grade) g += G('translate(110,-120) rotate(10)', C(0, 0, 60, '#FFFFFF', 7) + T(0, 6, grade, 52, '#E04B3C'));
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function lampPost(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-14, -560, 28, 560, 8, '#5A6070', 7) + P('M0,-560 Q60,-600 110,-560', 'none', 14) + E(110, -540, 50, 26, '#FFE27A', 7)); }
function blurG(inner, amt = 7) { const id = 'b' + (ZID++); return `<filter id="${id}"><feGaussianBlur stdDeviation="${amt}"/></filter><g filter="url(#${id})">${inner}</g>`; }