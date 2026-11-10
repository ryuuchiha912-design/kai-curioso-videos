
// ================= "E se você só pudesse dizer eu te amo 3 vezes?" =================
let ZID = 0;
const CUTS = [0, ...LINE_START.slice(1).map(s => s - 0.08), DUR];
const PAI = { skin: '#E8B98F', shirt: '#3E6A8A', pants: '#2F3440', hair: 'short', hairCol: '#2A211C', shoe: '#3A2A20', tie: null, mustache: true };
const PAI_OLD = Object.assign({}, PAI, { hairCol: '#8E8A86' });
const MAE = { skin: '#F1C7A0', shirt: '#C2577A', pants: '#4A3A5C', hair: 'bun', hairCol: '#4A3022', shoe: '#5A2E3A', tie: null };
const MAE_OLD = Object.assign({}, MAE, { hairCol: '#9C948E' });
const SON = { skin: '#FBE7D8', shirt: '#F2B636', pants: '#2E3A5C', hair: 'short', hairCol: '#16161C', shoe: '#2B2B2B', tie: null };
const kid = (o) => Object.assign({}, KAI, o);

// ---------------- objetos
function wristBig(x, y, s, n, glow = 1, skin = '#E8B98F', sleeve = '#3E6A8A') {
  let g = '';
  g += limb(-700, 60, -40, 0, sleeve, 150, 16) + limb(-60, 0, 220, -10, skin, 120, 16);
  g += E(300, -14, 110, 82, skin) + P('M330,-80 q60,-10 90,10 q-30,10 -70,20', skin, 7);
  for (let i = 0; i < 4; i++) g += limb(370, -70 + i * 38, 440, -64 + i * 40, skin, 34, 12);
  if (glow > 0) for (let i = 0; i < 4; i++) { const k = ((Date.now ? 0 : 0) + i / 4); g += C(90, 0, 100 + i * 34, 'none', 0, `stroke="rgba(255,214,90,${0.35 * glow * (1 - i / 4)})" stroke-width="16"`); }
  g += C(90, 0, 92, '#FFF6C8', 9) + T(90, 8, String(n), 130, n === 0 ? '#1A1210' : '#C62A2A');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function heartAt(x, y, s, col) { return heart(x, y, s, col); }
function crib(x, y, s, n, pop) {
  let g = R(-150, -60, 300, 140, 20, '#F4EAD8', 7) + E(0, -40, 110, 40, '#BFE3F5', 6);
  g += C(-50, -80, 46, '#FBE7D8', 6) + E(-50, -84, 20, 4, '#1A1210', 0) + P('M-70,-84 q8,6 16,0 M-46,-84 q8,6 16,0', 'none', 5);
  for (let i = 0; i < 6; i++) g += Ln(-140 + i * 56, -60, -140 + i * 56, -150, O, 8);
  g += Ln(-150, -150, 150, -150, O, 9);
  if (pop > 0) g += G(`translate(70,-150) scale(${pop})`, C(0, 0, 40, '#FFF6C8', 6) + T(0, 4, String(n), 50, '#C62A2A'));
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function jar(x, y, s, n) {
  let g = P('M-130,-200 L130,-200 L150,140 Q0,190 -150,140 Z', 'rgba(200,235,255,0.55)', 9) + R(-140, -240, 280, 50, 14, '#B9874F', 8);
  for (let i = 0; i < n; i++) g += heart(-60 + (i % 3) * 60, 90 - Math.floor(i / 3) * 70, 0.9, '#E04B3C');
  g += R(-120, -60, 240, 70, 14, '#FFFFFF', 6) + T(0, -24, 'PRA HORA CERTA', 30, '#1A1210');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function medal(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, P('M-30,-120 L0,-40 L30,-120', 'none', 0, `stroke="#2C6FB6" stroke-width="22"`) + C(0, 0, 46, '#F2B636', 7) + T(0, 4, '1º', 40, '#1A1210')); }
function podium(x, y) { return R(x - 160, y - 160, 320, 160, 8, '#E8DCC0', 8) + T(x, y - 80, '1', 90, '#C62A2A') + R(x - 470, y - 90, 300, 90, 8, '#E8DCC0', 8) + R(x + 170, y - 60, 300, 60, 8, '#E8DCC0', 8); }
function bike(x, y, s, rot) { return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, C(-150, 0, 90, 'none', 0, `stroke="${O}" stroke-width="18"`) + C(150, 0, 90, 'none', 0, `stroke="${O}" stroke-width="18"`) + P('M-150,0 L-20,-120 L120,-120 L150,0 M-20,-120 L0,0 L-150,0', 'none', 0, `stroke="#E04B3C" stroke-width="16" stroke-linejoin="round"`) + Ln(120, -120, 110, -170, O, 14)); }
function door(x, y, open) { return R(x - 150, y - 520, 300, 520, 8, '#7A4A2A', 9) + (open ? R(x - 140, y - 510, 120, 500, 4, '#F6C96B', 0) : '') + C(x + 100, y - 260, 14, '#F2B636', 5); }
function bus(x, y, s, label = 'RODOVIÁRIA') {
  let g = R(-420, -330, 840, 300, 40, '#2C6FB6', 9) + R(-380, -290, 760, 120, 16, '#BFE3F5', 7);
  for (let i = 1; i < 4; i++) g += Ln(-380 + i * 190, -290, -380 + i * 190, -170, O, 7);
  g += C(-260, -20, 56, '#1A1A20', 8) + C(260, -20, 56, '#1A1A20', 8) + T(0, -110, label, 44, '#FFFFFF');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function phone(x, y, s, label, ring) {
  const sh = ring ? Math.sin(ring * 40) * 6 : 0;
  return G(`translate(${x + sh},${y}) scale(${s})`, R(-110, -200, 220, 400, 30, '#1A1A20', 9) + R(-92, -170, 184, 320, 14, '#F4F8FF', 0) + C(0, -80, 46, '#C2577A', 5) + T(0, 10, label, 44, '#1A1210') + C(-45, 100, 30, '#4CAF50', 5) + C(45, 100, 30, '#E04B3C', 5));
}
function hospBed(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-380, -120, 760, 90, 20, '#FFFFFF', 8) + R(-400, -260, 40, 300, 10, '#9AA3AD', 7) + R(360, -200, 40, 240, 10, '#9AA3AD', 7) + R(-330, -170, 160, 70, 30, '#F4F8FF', 7) + Ln(-360, 40, -360, 110, O, 10) + Ln(360, 40, 360, 110, O, 10)); }
function monitor(x, y, t) {
  let d = 'M-140,0';
  for (let i = 0; i < 28; i++) { const xx = -140 + i * 10, ph = ((t * 1.2 + i / 28) % 1); d += ` L${xx},${ph > 0.45 && ph < 0.5 ? -50 : ph > 0.5 && ph < 0.55 ? 30 : 0}`; }
  return G(`translate(${x},${y})`, R(-170, -110, 340, 220, 20, '#1A2330', 8) + P(d, 'none', 0, `stroke="#5BFF8A" stroke-width="7" fill="none"`));
}
function bedNight(x, y, s, blanket = '#7A90C8') { return G(`translate(${x},${y}) scale(${s})`, R(-360, -60, 720, 150, 24, '#B9874F', 8) + R(-400, -220, 60, 310, 14, '#8A5A3A', 8) + R(-330, -140, 190, 80, 34, '#FFFFFF', 7)); }
function blanket(x, y, s, col = '#7A90C8') { return G(`translate(${x},${y}) scale(${s})`, P('M-150,-110 Q100,-170 340,-100 L340,10 L-150,10Z', col, 8)); }
function moonWin(x, y) { return windowFrame(x, y, 300, 300, '#1C2A55') + C(x + 210, y + 90, 46, '#F4F1EA', 6); }
function zzz(x, y, t) { let g = ''; for (let i = 0; i < 3; i++) { const k = ((t * 0.6 + i / 3) % 1); g += T(x + k * 80, y - k * 160, 'z', 50 + i * 12, `rgba(255,255,255,${1 - k})`, 8); } return g; }
function sepia(inner) { const id = 'sp' + (ZID++); return `<filter id="${id}"><feColorMatrix type="matrix" values="0.39 0.65 0.19 0 0.06  0.35 0.6 0.17 0 0.04  0.27 0.47 0.13 0 0  0 0 0 1 0"/></filter><g filter="url(#${id})">${inner}</g>`; }
function plim(x, y, t, at) { if (t < at || t > at + 0.7) return ''; const k = back(prog(t, at, at + 0.2)); return G(`translate(${x},${y}) scale(${k}) rotate(-8)`, star(0, 0, 70, 34, 8, '#FFE14D') + T(0, 4, '-1', 46, '#C62A2A')); }
function say(x, y, w, txt, size = 52, tail = 'left', fill = '#FFFFFF', t = 1, at = 0) {
  const k = back(prog(t, at, at + 0.25)); if (k <= 0) return '';
  return G(`translate(${x + w / 2},${y + 70}) scale(${k}) translate(${-(x + w / 2)},${-(y + 70)})`, bubble(x, y, w, 140, txt, size, tail, fill));
}
/** Alguém deitado: só a cabeça no travesseiro (+ braço sobre o cobertor, com o número). */
function lying(d, hx, hy, s, arm) {
  let g = G(`translate(${hx},${hy}) rotate(-78) scale(${s})`, head(Object.assign({}, d)));
  if (arm) {
    const [x1, y1, x2, y2] = arm;
    g += limb(x1, y1, x2, y2, d.shirt, 30) + C(x2, y2, 20, d.skin);
    if (d.wrist !== undefined) { const wx = x1 + (x2 - x1) * 0.72, wy = y1 + (y2 - y1) * 0.72; g += (d.wristGlow ? C(wx, wy, 36, `rgba(255,214,90,${0.45 * d.wristGlow})`, 0) : '') + C(wx, wy, 22, '#FFF6C8', 5) + T(wx, wy + 3, d.wrist, 30, '#C62A2A'); }
  }
  return g;
}
function room(wall, floor, y = 1450) { return floorRoom(wall, floor, y); }
const W = (L, i) => wt(L, i);      // tempo local da palavra i da fala L
const WL = (L) => wtLast(L);
const findW = (L, re) => { const ws = TL.lines[L].words; const i = ws.findIndex(w => re.test(w.text.toLowerCase())); return i < 0 ? 0 : wt(L, i); };

// ---------------- cenas (uma por fala)
const S = [];
// 0 — gancho: o pulso com o 3
S[0] = (t, d) => {
  let g = rays(t, '#C62A2A', '#D9443A');
  g += wristBig(470, 1050, 1.25, 3, 0.7 + 0.3 * Math.sin(t * 5));
  g += heart(250 + Math.sin(t * 2) * 20, 640, 1.4, '#FFFFFF') + heart(820, 560 + Math.cos(t * 2) * 20, 1.1, '#FFFFFF') + heart(860, 1500, 1.2, '#FFFFFF');
  return { g, cam: [540, 960, 1 + 0.06 * eio(prog(t, 0, d))] };
};
// 1 — todo mundo nasce com um 3
S[1] = (t, d) => {
  let g = room('#BFE3F5', '#E8DCC0', 1400) + T(540, 330, 'MATERNIDADE', 64, '#2C6FB6', 12);
  for (let i = 0; i < 4; i++) g += crib(290 + (i % 2) * 500, 820 + Math.floor(i / 2) * 520, 1.25, 3, back(prog(t, findW(1, /pulso/) + i * 0.15, findW(1, /pulso/) + i * 0.15 + 0.3)));
  if (t > findW(1, /três/)) g += G(`translate(540,1730) scale(${back(prog(t, findW(1, /três/), findW(1, /três/) + 0.3))})`, R(-150, -80, 300, 160, 40, '#C62A2A', 8) + T(0, 8, '3', 120, '#FFFFFF'));
  return { g, cam: [540, 960, 1 + 0.04 * prog(t, 0, d)] };
};
// 2 — cada eu te amo diminui; zero = nunca mais
S[2] = (t, d) => {
  const a = findW(2, /diminui/), z = findW(2, /zero/);
  const n = t < a ? 3 : t < z ? 2 : 0;
  let g = room('#F6D7A8', '#C98A5A', 1500);
  const man = passenger(3, { shirt: '#2F6B4F', wrist: n, wristGlow: 1, hr: [150, -330], expr: n === 0 ? 'worried' : 'happy' });
  g += person(Object.assign(man, { x: 330, y: 1700, s: 1.05 }));
  g += person(Object.assign(passenger(8, { hair: 'bun', shirt: '#C2577A' }), { x: 760, y: 1700, s: 1.0, expr: 'happy', sx: -1 }));
  if (t < z) g += say(140, 480, 420, 'EU TE AMO', 60, 'left', '#FFFFFF', t, 0.2);
  g += plim(260, 900, t, a);
  if (t > z) g += G(`translate(540,560) scale(${back(prog(t, z, z + 0.3))}) rotate(-5)`, R(-320, -80, 640, 160, 30, '#1A1210', 0) + T(0, 8, 'NUNCA MAIS', 90, '#FFE14D'));
  return { g, cam: [540, 1080, 1.0] };
};
// 3 — as pessoas guardam
S[3] = (t, d) => {
  let g = rays(t, '#F6C96B', '#F9D98F');
  g += jar(540, 1050, 1.6 * back(prog(t, 0, 0.4)), 3);
  const labs = [[/casamento/, 'CASAMENTO', 220, 520], [/filhos/, 'FILHOS', 860, 640], [/hora/, 'HORA CERTA', 540, 1560]];
  for (const [re, txt, x, y] of labs) { const at = findW(3, re); if (t > at - 0.05) g += badge(x, y, back(prog(t, at - 0.05, at + 0.25)), txt, '#C62A2A', '#FFFFFF', -5, 60); }
  return { g, cam: [540, 960, 1.0] };
};
// 4 — meu pai nunca disse (pista: pulso dele já mostra 1)
S[4] = (t, d) => {
  let g = room('#E9D6B8', '#B9874F', 1500) + windowFrame(700, 420, 280, 260, '#9FD3F2');
  g += person(Object.assign({}, PAI, { x: 360, y: 1720, s: 1.15, expr: 'neutral', hl: [60, -200], hr: [-60, -200], wrist: 1 }));
  g += person(kid({ x: 800, y: 1760, s: 0.72, expr: 'sad', lx: -1 }));
  const at = findW(4, /nenhuma/);
  if (t > at) g += badge(540, 600, back(prog(t, at, at + 0.3)), '0 VEZES', '#1A1210', '#FFE14D', -4, 100);
  return { g, cam: [540, 1150, 1.0 + 0.05 * prog(t, 0, d)] };
};
// 5 — a medalha: "Hum. Bom."
S[5] = (t, d) => {
  let g = room('#9FD3F2', '#7BB662', 1500) + T(540, 330, 'ESCOLA', 60, '#2C6FB6', 10) + podium(560, 1500);
  g += person(kid({ x: 560, y: 1340, s: 0.72, expr: t < findW(5, /hum/) ? 'happy' : 'sad' })) + medal(600, 1010, 0.8);
  const pat = Math.sin(t * 12) * 12 * (t > findW(5, /ombro/) - 0.3 && t < findW(5, /ombro/) + 0.6 ? 1 : 0);
  g += person(Object.assign({}, PAI, { x: 870, y: 1720, s: 0.95, sx: -1, expr: 'neutral', hr: [120, -330 + pat], wrist: 1 }));
  g += say(540, 560, 420, 'HUM. BOM.', 64, 'right', '#FFFFFF', t, findW(5, /hum/));
  return { g, cam: [600, 1150, 1.0] };
};
// 6 — a bicicleta: "Levanta. Já passou."
S[6] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#9FD3F2', 0) + R(-60, 1350, 1200, 700, 0, '#7A7F8A', 8) + houseFront(120, 1350, 340, 420, '#F2C27A', '#C9673A') + houseFront(640, 1350, 320, 380, '#BFE3F5', '#2C6FB6');
  g += bike(330, 1640, 0.9, -24);
  g += person(kid({ x: 520, y: 1760, s: 0.66, expr: 'sad', rot: -6, hl: [-150, -120], hr: [150, -120] }));
  g += R(468, 1660, 40, 26, 8, '#F4D35E', 4);
  g += person(Object.assign({}, PAI, { x: 790, y: 1780, s: 0.9, sx: -1, expr: 'neutral', sy: 0.88, hr: [180, -150], wrist: 1 }));
  g += say(470, 560, 520, 'LEVANTA. JÁ PASSOU.', 50, 'right', '#FFFFFF', t, findW(6, /levanta/));
  return { g, cam: [560, 1250, 1.0] };
};
// 7 — o bordão
S[7] = (t, d) => {
  let g = room('#F6D7A8', '#B9874F', 1500) + door(300, 1500, true);
  g += person(kid({ x: 330, y: 1500, s: 0.7, expr: 'neutral', back: false, hl: [-130, -230], hr: [130, -230] })) + R(250, 1150, 160, 190, 30, '#E04B3C', 7);
  g += person(Object.assign({}, PAI, { x: 760, y: 1720, s: 1.05, sx: -1, expr: 'neutral', hl: [60, -200], hr: [-60, -200], wrist: 1 }));
  const at = findW(7, /avisa/) - 0.2;
  if (t > at) g += G(`translate(540,520) scale(${back(prog(t, at, at + 0.3)) * (1 + 0.03 * Math.sin(t * 6))}) rotate(-3)`, R(-470, -110, 940, 220, 40, '#FFE14D', 10) + T(0, -26, 'ME AVISA', 84, '#1A1210') + T(0, 60, 'QUANDO CHEGAR', 72, '#1A1210'));
  return { g, cam: [540, 1100, 1.0] };
};
// 8 — festa da escola: os outros pais falam; o dele no fundo
S[8] = (t, d) => {
  let g = room('#FFE3EC', '#E8DCC0', 1450) + T(540, 300, 'FESTA DA ESCOLA', 60, '#C2577A', 10);
  for (let i = 0; i < 6; i++) g += Ln(80 + i * 180, 380, 170 + i * 180, 420, ['#E04B3C', '#2C6FB6', '#F2B636'][i % 3], 14);
  g += person(Object.assign({}, PAI, { x: 540, y: 1300, s: 0.6, expr: 'neutral', hl: [60, -200], hr: [-60, -200], wrist: 1 }));
  for (const [x, sd] of [[200, 1], [880, 2]]) {
    g += person(Object.assign(passenger(sd + 20, { tie: null }), { x, y: 1760, s: 0.95, expr: 'happy', hl: [80, -330], hr: [150, -330] }));
    g += person(Object.assign(KID(sd), { x: x + 60, y: 1780, s: 0.6, expr: 'happy' }));
    g += say(x - 210, 700 + sd * 40, 380, 'EU TE AMO!', 46, 'left', '#FFFFFF', t, 0.3 + sd * 0.4);
    if (t > 0.6 + sd * 0.4) g += heart(x + 150, 1000 - ((t * 120) % 200), 0.7, '#E04B3C');
  }
  g += person(kid({ x: 540, y: 1800, s: 0.62, expr: 'sad', lx: 0 }));
  return { g, cam: [540, 1150, 1.0] };
};
// 9 — achava que ele guardava pra alguém mais importante
S[9] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#2A3366', 0) + moonWin(700, 360) + bedNight(540, 1500, 1.2);
  g += blanket(520, 1450, 1.2) + lying(kid({ expr: 'sad' }), 290, 1330, 0.5);
  const k = back(prog(t, 0.6, 1.0));
  g += G(`translate(540,700) scale(${k})`, E(0, 0, 360, 220, '#FFFFFF', 9) + C(-220, 230, 40, '#FFFFFF', 7) + C(-280, 300, 22, '#FFFFFF', 6)
    + G('translate(-120,140) scale(0.45)', person(Object.assign({}, PAI, { expr: 'neutral' }))) + T(140, -40, '???', 100, '#1A1210')
    + heart(60, 40, 0.6) + heart(150, 60, 0.6) + heart(240, 40, 0.6));
  return { g, cam: [540, 1050, 1.0] };
};
// 10 — rodoviária, 18 anos (pista: o pulso do pai já está em 0)
S[10] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#B7C4CF', 0) + R(-60, 1450, 1200, 700, 0, '#5C5F6B', 8) + bus(560, 1450, 1.0);
  g += person(kid({ x: 330, y: 1800, s: 0.95, expr: 'worried', lx: 1, hr: [150, -120] })) + R(420, 1580, 160, 200, 20, '#7A2E3A', 7);
  g += person(Object.assign({}, PAI, { x: 790, y: 1800, s: 1.0, sx: -1, expr: 'neutral', wrist: 0 }));
  g += badge(540, 520, back(prog(t, 0.1, 0.4)), '18 ANOS', '#1A1210', '#FFE14D', -4, 90);
  return { g, cam: [560, 1250, 1.0 + 0.04 * prog(t, 0, d)] };
};
// 11 — o abraço rápido
S[11] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#B7C4CF', 0) + R(-60, 1450, 1200, 700, 0, '#5C5F6B', 8) + bus(560, 1450, 1.0);
  const hug = t < findW(11, /disse/) + 0.2;
  g += person(kid({ x: hug ? 480 : 360, y: 1800, s: 0.95, expr: 'sad', hl: hug ? [150, -300] : [-150, -150] }));
  g += person(Object.assign({}, PAI, { x: hug ? 620 : 760, y: 1800, s: 1.0, sx: -1, expr: 'neutral', hr: hug ? [180, -300] : [150, -150], wrist: 0 }));
  g += say(500, 560, 520, 'ME AVISA QUANDO CHEGAR.', 42, 'right', '#FFE14D', t, findW(11, /avisa/) - 0.2);
  return { g, cam: [560, 1250, 1.0] };
};
// 12 — no ônibus com raiva
S[12] = (t, d) => {
  const dx = -prog(t, 0.6, d) * 900;
  let g = R(-60, -60, 1200, 2040, 0, '#B7C4CF', 0) + R(-60, 1450, 1200, 700, 0, '#5C5F6B', 8);
  g += G(`translate(${dx},0)`, bus(560, 1450, 1.0, '') + G('translate(470,1040) scale(0.5)', head(Object.assign({}, KAI, { expr: 'angry' }))));
  g += person(Object.assign({}, PAI, { x: 880, y: 1800, s: 0.75, sx: -1, expr: 'neutral', hr: [140, -420 + Math.sin(t * 8) * 30], wrist: 0 }));
  return { g, cam: [540, 1150, 1.0] };
};
// 13 — as ligações: tempo, carro, dinheiro... me avisa quando chegar
S[13] = (t, d) => {
  let g = R(-60, -60, 1200, 1020, 0, '#2A3366', 0) + R(-60, 960, 1200, 1020, 0, '#F6D7A8', 0) + Ln(-60, 960, 1200, 960, O, 12);
  for (let i = 0; i < 5; i++) g += R(80 + i * 200, 380 + (i % 2) * 60, 120, 580, 4, '#3E4A7A', 6) + R(110 + i * 200, 440, 30, 40, 4, '#FFE27A', 0);
  g += G('translate(420,720) scale(0.95)', head(Object.assign({}, KAI, { expr: 'tired' }))) + phone(820, 640, 0.6, 'PAI', 0);
  g += G('translate(640,1690) scale(0.95)', head(Object.assign({}, PAI_OLD, { expr: 'neutral' }))) + phone(250, 1620, 0.6, 'FILHO', 0);
  const qs = [[/tempo/, 'E O TEMPO?'], [/carro/, 'E O CARRO?'], [/dinheiro/, 'E O DINHEIRO?']];
  qs.forEach(([re, q], i) => { const at = findW(13, re); if (t > at - 0.1 && t < findW(13, /terminava/)) g += say(160 + i * 60, 1100 + i * 30, 400, q, 46, 'left', '#FFFFFF', t, at - 0.1); });
  g += say(240, 1160, 600, 'ME AVISA QUANDO CHEGAR.', 42, 'left', '#FFE14D', t, findW(13, /avisa/) - 0.2);
  return { g, cam: [540, 960, 1.0] };
};
// 14 — a ligação da mãe
S[14] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, t > findW(14, /hospital/) ? '#3A1220' : '#2A3366', 0);
  g += person(kid({ x: 540, y: 2050, s: 1.4, expr: t > findW(14, /hospital/) ? 'surprised' : 'neutral', hr: [170, -420] }));
  g += phone(720, 800, 0.8 * back(prog(t, 0, 0.3)), 'MÃE', t < findW(14, /pai/) ? t : 0);
  if (t > findW(14, /hospital/)) g += badge(540, 420, back(prog(t, findW(14, /hospital/), findW(14, /hospital/) + 0.3)), 'HOSPITAL', '#E04B3C', '#FFFFFF', -3, 100);
  return { g, cam: [540, 960, 1.0] };
};
// 15 — no hospital, o pulso de perto
S[15] = (t, d) => {
  const zk = eio(prog(t, findW(15, /pulso/) - 1.2, d));
  let g = room('#DDEBE4', '#B9C4BF', 1450) + monitor(860, 640, t) + hospBed(520, 1460, 1.2);
  g += blanket(520, 1400, 1.25, '#BFE3F5') + lying(Object.assign({}, PAI_OLD, { expr: 'sleep', wrist: 0 }), 250, 1250, 0.5, [380, 1300, 560, 1330]);
  g += person(kid({ x: 860, y: 1820, s: 1.0, expr: 'worried', lx: -1 }));
  return { g, cam: [lerp(540, 505, zk), lerp(1150, 1320, zk), 1 + zk * 2.2] };
};
// 16 — o número era zero
S[16] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#0E0E14', 0);
  g += wristBig(470, 960, 1.3, 0, 0, '#E8B98F', '#BFE3F5');
  return { g, cam: [540, 960, 1 + 0.08 * prog(t, 0, d)] };
};
// 17 — pra quem?
S[17] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#3A1220', 0);
  g += person(kid({ x: 540, y: 2100, s: 1.45, expr: 'angry' }));
  for (let i = 0; i < 3; i++) { const at = findW(17, /três/) + i * 0.15; if (t > at) g += G(`translate(${240 + i * 300},560) scale(${back(prog(t, at, at + 0.3))})`, C(0, -40, 70, '#5A5A66', 0) + R(-80, 30, 160, 170, 60, '#5A5A66', 0) + T(0, -30, '?', 90, '#FFFFFF')); }
  g += say(600, 860, 360, 'PRA QUEM?', 60, 'left', '#FFFFFF', t, findW(17, /quem/) - 0.1);
  return { g, cam: [540, 960, 1.0] };
};
// 18 — a mãe conta
S[18] = (t, d) => {
  let g = room('#DDEBE4', '#B9C4BF', 1450);
  g += person(Object.assign({}, MAE_OLD, { x: 360, y: 1760, s: 1.0, expr: 'sad', hr: [260, -330] }));
  g += person(kid({ x: 760, y: 1760, s: 1.0, expr: 'worried', lx: -1 }));
  return { g, cam: [540, 1150, 1.0 + 0.05 * prog(t, 0, d)] };
};
// 19/20/21 — os três (flashbacks em sépia; o pulso desce)
function flashTitle(n, t) { return G(`translate(540,330) scale(${back(prog(t, 0, 0.3))}) rotate(-3)`, R(-260, -80, 520, 160, 30, '#FFF6C8', 9) + T(0, 8, ['O PRIMEIRO', 'O SEGUNDO', 'O TERCEIRO'][n], 70, '#C62A2A')); }
S[19] = (t, d) => {
  const at = findW(19, /dormindo/) - 1.2;
  let g = room('#BFE3F5', '#E8DCC0', 1450);
  g += person(Object.assign({}, PAI, { x: 540, y: 1760, s: 1.15, expr: 'happy', hl: [-20, -300], hr: [60, -310], wrist: t < at ? 3 : 2, wristGlow: 1 }));
  g += G('translate(570,1260) scale(1.1)', E(0, 0, 130, 80, '#FFFFFF', 7) + C(-60, -20, 50, '#FBE7D8', 6) + P('M-84,-20 q10,8 20,0 M-56,-20 q10,8 20,0', 'none', 5) + zzz(-40, -80, t));
  g += say(120, 560, 360, 'eu te amo', 54, 'left', '#FFFFFF', t, at - 0.2) + plim(330, 1260, t, at);
  return { g: sepia(g) + flashTitle(0, t), cam: [540, 1150, 1.0] };
};
S[20] = (t, d) => {
  const at = findW(20, /eu/) - 0.8;
  let g = R(-60, -60, 1200, 2040, 0, '#2A3366', 0) + moonWin(80, 400) + bedNight(540, 1500, 1.2);
  g += blanket(520, 1450, 1.2) + lying(kid({ expr: 'sleep' }), 290, 1330, 0.5) + R(300, 1180, 100, 20, 8, '#FFFFFF', 4) + zzz(360, 1200, t);
  g += person(Object.assign({}, PAI, { x: 820, y: 1800, s: 0.95, sx: -1, expr: 'tired', hr: [230, -230], wrist: t < at ? 2 : 1, wristGlow: 1 }));
  g += say(500, 600, 380, 'eu te amo', 54, 'right', '#FFFFFF', t, at - 0.2) + plim(760, 1330, t, at);
  return { g: sepia(g) + flashTitle(1, t), cam: [540, 1150, 1.0] };
};
S[21] = (t, d) => {
  const at = findW(21, /quarto/) + 0.4;
  let g = R(-60, -60, 1200, 2040, 0, '#2A3366', 0) + moonWin(700, 360) + bedNight(540, 1500, 1.2) + R(120, 1300, 180, 220, 20, '#7A2E3A', 7);
  g += blanket(540, 1460, 1.3) + lying(kid({ expr: 'sleep' }), 290, 1330, 0.55) + zzz(360, 1190, t);
  g += person(Object.assign({}, PAI, { x: 860, y: 1800, s: 1.0, sx: -1, expr: 'sad', hr: [250, -260], wrist: t < at ? 1 : 0, wristGlow: 1 }));
  g += say(470, 620, 380, 'eu te amo', 54, 'right', '#FFFFFF', t, at - 0.2) + plim(800, 1330, t, at);
  return { g: sepia(g) + flashTitle(2, t), cam: [540, 1150, 1.0] };
};
// 22 — os três foram pra mim
S[22] = (t, d) => {
  let g = rays(t, '#F6C96B', '#F9D98F');
  for (let i = 0; i < 3; i++) {
    const k = back(prog(t, i * 0.3, i * 0.3 + 0.3));
    g += G(`translate(540,${520 + i * 420}) scale(${k}) rotate(${(i - 1) * 3})`, R(-380, -170, 760, 340, 20, '#FFF6C8', 9) + T(-200, 0, String(3 - i) + '→' + String(2 - i), 90, '#C62A2A') + T(130, -30, ['NASCEU', 'FEBRE', 'ANTES DE IR'][i], 46, '#1A1210') + T(130, 40, 'DORMINDO', 46, '#2C6FB6'));
  }
  return { g, cam: [540, 960, 1.0] };
};
// 23 — "me avisa quando chegar" = "eu te amo"
S[23] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#C62A2A', 0);
  g += G(`translate(540,620) scale(${back(prog(t, 0, 0.35))})`, R(-460, -110, 920, 220, 40, '#FFE14D', 10) + T(0, -24, 'ME AVISA', 80, '#1A1210') + T(0, 60, 'QUANDO CHEGAR', 70, '#1A1210'));
  const at = findW(23, /único/);
  if (t > at - 0.3) g += G(`translate(540,900) scale(${back(prog(t, at - 0.3, at))})`, T(0, 0, '=', 200, '#FFFFFF', 20));
  if (t > at) g += G(`translate(540,1160) scale(${back(prog(t, at, at + 0.35)) * (1 + 0.04 * Math.sin(t * 6))})`, R(-400, -110, 800, 220, 40, '#FFFFFF', 10) + T(0, 10, 'EU TE AMO', 110, '#C62A2A') + heart(330, -100, 0.8));
  return { g, cam: [540, 960, 1.0] };
};
// 24 — "Chegou bem, filho?"
S[24] = (t, d) => {
  let g = room('#DDEBE4', '#B9C4BF', 1450) + monitor(860, 640, t) + hospBed(520, 1460, 1.2);
  g += blanket(520, 1400, 1.25, '#BFE3F5') + lying(Object.assign({}, PAI_OLD, { expr: t > findW(24, /acordou/) ? 'tired' : 'sleep', wrist: 0 }), 250, 1250, 0.5, [380, 1300, 560, 1330]);
  g += person(kid({ x: 860, y: 1820, s: 1.0, expr: 'sad', lx: -1 }));
  g += say(80, 640, 500, 'CHEGOU BEM, FILHO?', 48, 'left', '#FFFFFF', t, findW(24, /chegou/) - 0.15);
  return { g, cam: [560, 1150, 1.0] };
};
// 25 — "Cheguei, pai. Eu te amo." (o pulso do Kai 3 → 2)
S[25] = (t, d) => {
  const at = findW(25, /amo/);
  let g = room('#FFE3D2', '#B9C4BF', 1450) + hospBed(520, 1460, 1.2);
  g += person(Object.assign({}, PAI_OLD, { x: 420, y: 1700, s: 0.95, expr: t > at ? 'happy' : 'tired', hl: [-150, -200], hr: [200, -330], legs: false }));
  g += person(kid({ x: 680, y: 1800, s: 1.0, sx: -1, expr: t > at ? 'happy' : 'sad', hr: [200, -320], wrist: t < at ? 3 : 2, wristGlow: 1 }));
  g += say(330, 520, 600, 'CHEGUEI, PAI. EU TE AMO.', 44, 'right', '#FFFFFF', t, findW(25, /cheguei/) - 0.15) + plim(620, 1260, t, at);
  if (t > at) for (let i = 0; i < 6; i++) { const k = ((t - at) * 0.5 + i / 6) % 1; g += heart(300 + i * 90, 1200 - k * 600, 0.6 * (1 - k), '#E04B3C'); }
  return { g, cam: [540, 1150, 1.0] };
};
// 26 — hoje eu tenho um filho
S[26] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#2A3366', 0) + moonWin(700, 360) + bedNight(540, 1500, 1.2);
  g += blanket(520, 1450, 1.2, '#F2B636') + lying(Object.assign({}, SON, { expr: 'sleep' }), 290, 1340, 0.45) + zzz(360, 1220, t);
  g += person(kid({ x: 860, y: 1820, s: 1.0, sx: -1, expr: 'happy', hr: [120, -330], wrist: 2, wristGlow: 0.6 + 0.4 * Math.sin(t * 3) }));
  const zk = eio(prog(t, findW(26, /pulso/) - 0.6, d));
  return { g, cam: [lerp(560, 760, zk), lerp(1150, 1420, zk), 1 + zk * 1.2] };
};
// 27 — ainda tem dois (espelha a abertura) + chamada pra comentar
S[27] = (t, d) => {
  let g = rays(t, '#2A3366', '#33407A');
  g += wristBig(470, 1000, 1.25, 2, 0.8 + 0.2 * Math.sin(t * 5), '#FBE7D8', '#1F2E57');
  return { g, cam: [540, 960, 1 + 0.04 * prog(t, 0, d)] };
};

function titleOverlay(t) {
  if (t > 3.9) return '';
  const k = back(prog(t, 0, 0.35)), out = 1 - prog(t, 3.5, 3.9);
  return G(`translate(540,330) scale(${k * out})`, R(-500, -190, 1000, 380, 40, 'rgba(26,18,16,0.88)', 0) + T(0, -95, 'E SE VOCÊ SÓ PUDESSE', 68, '#FFFFFF') + T(0, 0, 'DIZER "EU TE AMO"', 68, '#FFFFFF') + T(0, 105, '3 VEZES NA VIDA?', 84, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[27].start;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,330) scale(${k})`, R(-500, -170, 1000, 340, 40, 'rgba(26,18,16,0.9)', 0) + T(0, -80, 'SE VOCÊ SÓ TIVESSE 3,', 66, '#FFFFFF') + T(0, 10, 'PRA QUEM VOCÊ', 66, '#FFFFFF') + T(0, 100, 'FALARIA?', 80, '#FFE14D'))
    + G(`translate(540,${1640 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}

// ---------------- legenda: uma palavra por vez
const CHUNKS = [];
for (const line of TL.lines) {
  const ws = line.words; let i = 0;
  while (i < ws.length) {
    let txt = ws[i].text, st = ws[i].start, en = ws[i].end;
    while (txt.replace(/[^\p{L}\d]/gu, '').length <= 2 && i + 1 < ws.length) { i++; txt += ' ' + ws[i].text; en = ws[i].end; }
    CHUNKS.push([st, en, txt.replace(/["“”]/g, '').replace(/[,.:;…?!]+$/, '').toUpperCase()]);
    i++;
  }
}
for (let i = 0; i < CHUNKS.length - 1; i++) if (CHUNKS[i + 1][0] - CHUNKS[i][1] < 0.35) CHUNKS[i][1] = CHUNKS[i + 1][0];
function caption(t) {
  for (const [a, b, s] of CHUNKS) if (t >= a - 0.03 && t < b + 0.05) {
    const k = back(prog(t, a - 0.03, a + 0.08));
    return G(`translate(540,1380) scale(${0.8 + 0.2 * k})`, T(0, 0, s, s.length > 12 ? 82 : 100, '#FFFFFF', 22));
  }
  return '';
}
window.renderAt = function (t) {
  ZID = 0;
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const lt = t - CUTS[i];
  const res = S[i](lt, CUTS[i + 1] - CUTS[i]);
  const punch = 1 + 0.05 * (1 - eout(prog(lt, 0, 0.3)));
  const fade = i === S.length - 1 ? prog(t, DUR - 0.5, DUR) : 0;
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` +
    G(`translate(540,960) scale(${res.cam[2] * punch}) translate(${-res.cam[0]},${-res.cam[1]})`, res.g) +
    caption(t) + titleOverlay(t) + ctaOverlay(t) + (fade > 0 ? `<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>` : '');
};
window.DUR = DUR;
renderAt(0);
</script>
</body></html>
