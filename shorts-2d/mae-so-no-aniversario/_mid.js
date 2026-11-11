// ================= "E se você só pudesse ver a sua mãe no dia do seu aniversário?" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const KAI_ADULT = Object.assign({}, KAI, { shirt: '#3A3F4B', tie: '#2C6FB6', scarf: false, collar: '#FFFFFF' });
const MAE_V = Object.assign({}, MAE_OLD, { glasses: true });
const FRIENDS = [passenger(41, { tie: null, shirt: '#E07B39' }), passenger(42, { tie: null, shirt: '#3E9B4A', hair: 'bun' }), passenger(43, { tie: null, shirt: '#C2577A', hair: 'bun' }), passenger(44, { tie: null, shirt: '#F2B636' })];

// ---------------- objetos
function cake(x, y, s, lit = 1, t = 0) {
  let g = E(0, 40, 170, 30, '#FFFFFF', 7) + R(-130, -70, 260, 110, 30, '#E8913A', 8) + P('M-130,-60 Q-100,-20 -70,-60 Q-40,-20 -10,-60 Q20,-20 50,-60 Q80,-20 110,-60 Q125,-40 130,-60 L130,-80 Q0,-100 -130,-80Z', '#6B3A1E', 7);
  g += R(-10, -150, 20, 80, 6, '#F4F1EA', 6);
  if (lit) g += P(`M0,-${185 + Math.sin(t * 20) * 4} Q14,-160 0,-150 Q-14,-160 0,-${185 + Math.sin(t * 20) * 4}Z`, '#FFB627', 4);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function calGrid(x, y, s, crossed, gold = true, t = 0) {
  let g = R(-300, -330, 600, 660, 30, '#FFFFFF', 10) + R(-300, -330, 600, 110, 26, '#C62A2A', 10) + T(0, -272, 'ANO', 62, '#FFFFFF');
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const i = r * 7 + c, cx = -255 + c * 85, cy = -165 + r * 85;
    if (i === 33 && gold) { g += R(cx - 36, cy - 36, 72, 72, 14, '#FFE14D', 6) + heart(cx, cy + 6, 0.55 + 0.05 * Math.sin(t * 6)); continue; }
    g += R(cx - 36, cy - 36, 72, 72, 12, '#F4F1EA', 4);
    if (i < crossed) g += Ln(cx - 22, cy - 22, cx + 22, cy + 22, '#C62A2A', 9) + Ln(cx + 22, cy - 22, cx - 22, cy + 22, '#C62A2A', 9);
  }
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function gate(x, y, s) {
  let g = '';
  for (let i = -6; i <= 6; i++) g += R(i * 70 - 12, -260, 24, 260, 6, '#E9E4D8', 6) + P(`M${i * 70 - 12},-260 L${i * 70},-290 L${i * 70 + 12},-260Z`, '#E9E4D8', 6);
  g += R(-460, -200, 920, 26, 6, '#E9E4D8', 6) + R(-460, -80, 920, 26, 6, '#E9E4D8', 6);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function balloon(x, y, s, col, t, ph) { const dy = Math.sin(t * 2 + ph) * 12; return G(`translate(${x},${y + dy}) scale(${s})`, P('M0,90 Q-10,160 6,220', 'none', 4) + E(0, 0, 60, 76, col, 7) + E(-20, -24, 12, 18, 'rgba(255,255,255,0.5)', 0) + P('M-8,74 L8,74 L0,90Z', col, 5)); }
function bigPhone(x, y, s, msgs, t) {
  let g = R(-250, -440, 500, 880, 60, '#1A1A20', 10) + R(-222, -390, 444, 760, 20, '#ECE5DD', 0) + R(-222, -390, 444, 100, 20, '#2E7D5A', 0) + C(-160, -340, 32, '#C2577A', 4) + T(-60, -338, 'MÃE', 44, '#FFFFFF') + heart(40, -342, 0.45);
  msgs.forEach(([who, txt, at], i) => {
    const k = pop1(t, at, 0.3); if (k <= 0) return;
    const me = who === 'eu', lines = txt.split('|'), h = 50 + lines.length * 52, yy = -250 + i * 230;
    const bx = me ? 10 : -205, bw = Math.min(420, 70 + lines.reduce((a, l) => Math.max(a, l.length), 0) * 22);
    const xx = me ? 205 - bw : -205;
    g += G(`translate(${xx + bw / 2},${yy + h / 2}) scale(${k}) translate(${-(xx + bw / 2)},${-(yy + h / 2)})`, R(xx, yy, bw, h, 22, me ? '#DCF8C6' : '#FFFFFF', 5) + lines.map((l, j) => T(xx + bw / 2, yy + 52 + j * 52, l, 34, '#1A1210')).join(''));
    if (bx === 9999) g += '';
  });
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function letterBox(x, y, s, fill = 1) {
  let g = R(-300, -220, 600, 300, 16, '#C99A5B', 9) + R(-300, -220, 600, 60, 10, '#B5864A', 8);
  const r = rng(9);
  for (let i = 0; i < 26 * fill; i++) { const ex = -250 + r() * 500, ey = -230 - r() * 120; g += G(`translate(${ex},${ey}) rotate(${(r() - 0.5) * 50}) scale(0.32)`, R(-150, -95, 300, 190, 10, i % 4 ? '#FFFFFF' : '#FFF1D6', 7) + P('M-150,-95 L0,10 L150,-95', 'none', 6) + (i % 5 === 0 ? heart(0, 40, 0.8) : '')); }
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function envFly(t, n = 20, seed = 4) {
  let g = ''; const r = rng(seed);
  for (let i = 0; i < n; i++) { const x0 = r() * 1080, sp = 0.25 + r() * 0.25, ph = r(); const k = (t * sp + ph) % 1; g += G(`translate(${x0 + Math.sin(t * 2 + i) * 40},${-120 + k * 2100}) rotate(${Math.sin(t * 3 + i) * 40}) scale(0.4)`, R(-150, -95, 300, 190, 10, '#FFFFFF', 7) + P('M-150,-95 L0,10 L150,-95', 'none', 6)); }
  return g;
}
function letterPaper(t, lines) {
  let g = G('translate(540,820) rotate(-2)', R(-420, -520, 840, 1040, 20, '#FFF8EC', 10) + Array.from({ length: 12 }, (_, i) => Ln(-360, -380 + i * 75, 360, -380 + i * 75, '#D9CBB0', 4)).join(''));
  lines.forEach(([txt, at, col], i) => { const k = clamp(prog(t, at, at + 0.4)); if (k > 0) g += G(`translate(540,${470 + i * 110}) rotate(-2)`, `<g opacity="${k}">` + T(0, 0, txt, 58, col || '#2A2A6A') + '</g>'); });
  return g;
}
function ageTag(txt) { return G('translate(540,110)', R(-190, -55, 380, 110, 34, '#1A1210', 8) + T(0, 6, txt, 60, '#FFE14D')); }
function sky(k) { // 0 dia → 1 noite
  const lerpC = (a, b) => { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join(''); };
  const k0 = k; k = k0 < 0.5 ? k0 * 2 : (k0 - 0.5) * 2;
  return R(-60, -60, 1200, 2040, 0, k0 < 0.5 ? lerpC('BFE3F5', 'F4A26B') : lerpC('F4A26B', '1C2A55'), 0);
}
function levelHud(i, t) {
  const tag = { 2: '7 ANOS', 3: '16 ANOS', 4: '16 ANOS', 5: '25 ANOS', 6: '25 ANOS', 7: '30 ANOS', 8: '30 ANOS', 9: '30 ANOS' }[i];
  return tag ? ageTag(tag) : '';
}

const S = [];
// 0 — gancho: um ano inteiro riscado, só um dia dourado
S[0] = (t, d) => {
  let g = rays(t, '#3A2A7A', '#4A3A9A');
  g += calGrid(540, 760, 1.25, Math.min(42, Math.floor(t * 14)), true, t);
  g += KAIs({ x: 540, y: 2150, s: 1.35, expr: 'sad', lx: 0, hl: [-150, -150], hr: [150, -150] });
  return { g, cam: [540, 960, 1 + 0.04 * eio(prog(t, 0, d))] };
};
// 1 — a regra: 364 longe, 1 junto
S[1] = (t, d) => {
  const a1 = findW(1, /trezentos/) - 0.1, a2 = findW(1, /^um$/) - 0.1;
  let g = rays(t, '#2A2236', '#352A44');
  g += G(`translate(540,600) scale(${pop1(t, a1)})`, R(-420, -150, 840, 300, 40, '#5A5466', 9) + T(0, -30, '364 DIAS', 120, '#FFFFFF') + T(0, 80, 'LONGE', 64, '#C9C2D6'));
  g += G(`translate(540,1020) scale(${pop1(t, a2)})`, R(-420, -150, 840, 300, 40, '#FFE14D', 9) + T(0, -30, '1 DIA', 130, '#1A1210') + T(0, 80, 'JUNTO', 64, '#C62A2A') + heart(330, -100, 0.9));
  return { g, cam: [540, 960, 1] };
};
// 2 — 7 anos: riscando dias, mãe chega com bolo, fica até ele dormir
S[2] = (t, d) => {
  const aM = findW(2, /chegava/) - 0.2, aN = findW(2, /ficava/) - 0.1;
  if (t < aM) {
    let g = room('#F6D7A8', '#C98A5A', 1500) + calGrid(620, 760, 0.85, Math.min(41, 20 + Math.floor(t * 8)), true, t);
    g += KAIs({ x: 240, y: 1820, s: 0.7, expr: 'neutral', lx: 1, hr: [230, -520] });
    return { g, cam: [540, 1100, 1.0] };
  }
  if (t < aN) {
    let g = room('#FFE2B8', '#C98A5A', 1500) + R(80, 640, 280, 860, 10, '#7A4A2A', 9) + R(95, 655, 120, 830, 4, '#F6C96B', 0);
    g += pp(MAE, { x: 680, y: 1840, s: 1.05, sx: -1, expr: 'happy', hl: [-200, -360], hr: [200, -360] }) + cake(680, 1290, 0.8, 1, t);
    g += KAIs({ x: 300, y: 1840, s: 0.72, expr: 'happy', hl: [-180, -540], hr: [180, -540], lift: Math.abs(Math.sin(t * 9)) * 30 });
    return { g, cam: [540, 1150, 1.0] };
  }
  let g = R(-60, -60, 1200, 2040, 0, '#22305C', 0) + moonWin(640, 360) + bedNight(560, 1560, 1.1);
  g += lying(Object.assign({}, KAI, { expr: 'sleep' }), 330, 1420, 0.6) + blanket(560, 1560, 1.1, '#7A90C8') + zzz(420, 1240, t);
  g += pp(MAE, { x: 850, y: 1900, s: 0.95, sx: -1, expr: 'happy', hl: [-200, -330], hr: [-120, -300] });
  return { g, cam: [560, 1200, 1.0] };
};
// 3 — 16 anos: festa com os amigos
S[3] = (t, d) => {
  const aP = findW(3, /pensei/) - 0.2;
  let g = room('#7A4CC8', '#4A3A6A', 1500);
  [['#E04B3C', 120, 520], ['#F2B636', 300, 420], ['#2C6FB6', 780, 460], ['#3E9B4A', 960, 560]].forEach(([c, x, y], i) => g += balloon(x, y, 1, c, t, i));
  for (let i = 0; i < 14; i++) g += R((i * 83 + t * 60) % 1100 - 20, 300 + (i * 137) % 900, 16, 26, 4, ['#FFE14D', '#E04B3C', '#7FE3FF'][i % 3], 0);
  FRIENDS.forEach((f, i) => g += pp(f, { x: [150, 360, 730, 940][i], y: 1880 + (i % 2) * 20, s: 0.85, expr: 'happy', sx: i > 1 ? -1 : 1, hr: [170, -460 + Math.sin(t * 8 + i) * 30], hl: [-170, -460 - Math.sin(t * 8 + i) * 30] }));
  g += KAIs({ x: 545, y: 1900, s: 0.92, expr: 'happy', hl: [-190, -540], hr: [190, -540] });
  g += say(220, 560, 640, 'ANO QUE VEM EU VEJO ELA', 40, 'left', '#FFFFFF', t, aP);
  return { g, cam: [540, 1150, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 4 — ela esperou o dia inteiro no portão
S[4] = (t, d) => {
  const k = clamp(prog(t, 0.2, d - 0.4));
  let g = sky(k) + (k > 0.7 ? `<g opacity="${(k - 0.7) / 0.3}">` + C(880, 300, 60, '#F4F1EA', 6) + '</g>' : '') + houseFront(140, 1500, 800, 600, '#F2D2A0', '#B5523B');
  g += R(-60, 1500, 1200, 600, 0, '#7CB65A', 8);
  g += gate(540, 1820, 1.0);
  g += pp(MAE, { x: 540, y: 1880, s: 1.0, expr: k > 0.5 ? 'sad' : 'neutral', lx: 1, hl: [-110, -190], hr: [110, -190] }) + cake(540, 1700, 0.55, k < 0.85 ? 1 : 0, t);
  g += clockFace(900, 1680, 80, -Math.PI / 2 + k * 6, -Math.PI / 2 + k * 70);
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 5 — 25 anos: reunião, manda mensagem
S[5] = (t, d) => {
  const aM = findW(5, /mandei/) - 0.2;
  if (t < aM) {
    let g = room('#D9DCE3', '#8E96A3', 1500) + windowFrame(660, 360, 340, 300, '#BFE3F5');
    for (let i = 0; i < 3; i++) g += pp(passenger(50 + i, { tie: TIES[i] }), { x: 640 + i * 170, y: 1880, s: 0.7, expr: 'neutral', sx: -1 });
    g += R(380, 1450, 600, 40, 8, '#B9874F', 7);
    g += person(Object.assign({}, KAI_ADULT, { x: 230, y: 1880, s: 1.0, expr: 'tired', lx: 1 }));
    g += G('translate(540,560)', R(-200, -60, 400, 120, 20, '#FFFFFF', 7) + T(0, 6, 'REUNIÃO', 56, '#2C6FB6'));
    return { g, cam: [540, 1150, 1.0] };
  }
  let g = rays(t, '#2C6FB6', '#3F86CF') + bigPhone(540, 820, 1.25, [['eu', 'ANO QUE VEM, MÃE.|PROMETO.', aM + 0.3]], t);
  return { g, cam: [540, 960, 1.0] };
};
// 6 — ela responde
S[6] = (t, d) => {
  const aR = findW(6, /tá/) - 0.2;
  let g = rays(t, '#2C6FB6', '#3F86CF') + bigPhone(540, 820, 1.25, [['eu', 'ANO QUE VEM, MÃE.|PROMETO.', -1], ['mae', 'TÁ BOM, FILHO.|COME DIREITO.', aR]], t);
  return { g, cam: [540, 960, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 7 — 30 anos: volta pra casa; ela está mais devagar
S[7] = (t, d) => {
  const aD = findW(7, /^ela$/) - 0.2;
  if (t < aD) {
    let g = R(-60, -60, 1200, 2040, 0, '#F4C48A', 0) + houseFront(140, 1500, 800, 600, '#F2D2A0', '#B5523B') + R(-60, 1500, 1200, 600, 0, '#7CB65A', 8) + gate(540, 1820, 1.0);
    g += person(Object.assign({}, KAI_ADULT, { x: 540, y: 1960, s: 1.0, expr: 'neutral', back: true }));
    return { g, cam: [540, 1200, 1.0 + 0.05 * eio(prog(t, 0, aD))] };
  }
  let g = room('#F6D7A8', '#C98A5A', 1500) + R(700, 640, 280, 860, 10, '#7A4A2A', 9);
  g += pp(MAE_V, { x: 420, y: 1860, s: 0.95, expr: 'happy', rot: 4, hl: [-150, -150], hr: [210, -60] }) + R(620, 1490, 14, 380, 6, '#8A5A3A', 6);
  g += person(Object.assign({}, KAI_ADULT, { x: 860, y: 1880, s: 1.0, sx: -1, expr: 'worried' }));
  return { g, cam: [600, 1200, 1.0] };
};
// 8 — a caixa de cartas
S[8] = (t, d) => {
  const aC = findW(8, /caixa/) - 0.1;
  let g = room('#F6D7A8', '#C98A5A', 1500) + R(140, 1250, 800, 40, 10, '#B9874F', 8) + Ln(200, 1290, 200, 1500, O, 14) + Ln(880, 1290, 880, 1500, O, 14);
  g += G(`translate(540,1250) scale(${pop1(t, aC, 0.35)})`, letterBox(0, 0, 1.1, clamp(prog(t, aC, aC + 1.5))));
  g += person(Object.assign({}, KAI_ADULT, { x: 880, y: 1960, s: 0.9, sx: -1, expr: 'surprised' }));
  return { g, cam: [540, 1150, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 9 — uma pra cada dia: mais de dez mil
S[9] = (t, d) => {
  const aN = findW(9, /dez/) - 0.15;
  let g = rays(t, '#F6D7A8', '#F9E2BE') + envFly(t, 26) + letterBox(540, 1500, 1.2, 1);
  if (t > aN) g += G(`translate(540,560) scale(${pop1(t, aN)}) rotate(-4)`, R(-400, -110, 800, 220, 40, '#1A1210', 0) + T(0, 8, '+10.000 CARTAS', 84, '#FFE14D'));
  return { g, cam: [540, 960, 1.0] };
};
// 10 — a última carta
S[10] = (t, d) => {
  const w = (re) => findW(10, re) - 0.1;
  let g = R(-60, -60, 1200, 2040, 0, '#C99A5B', 0) + letterPaper(t, [['"HOJE É SEU', w(/hoje/)], ['ANIVERSÁRIO.', w(/aniversário/)], ['SE VOCÊ NÃO VIER,', w(/^se$/)], ['TUDO BEM.', w(/tudo/)], ['EU TE AMO DO', w(/^eu$/), '#C62A2A'], ['MESMO JEITO."', w(/mesmo/), '#C62A2A']]);
  if (t > w(/jeito/)) g += heart(780, 1290, 1.2 * pop1(t, w(/jeito/)));
  for (let i = 0; i < 2; i++) { const k = ((t * 0.5 + i * 0.5) % 1); if (t > w(/tudo/)) g += G(`translate(${300 + i * 420},${560 + k * 600})`, `<g opacity="${(1 - k) * 0.8}">` + P('M0,-30 Q22,0 0,20 Q-22,0 0,-30Z', '#7FC6F0', 4) + '</g>'); }
  return { g, cam: [540, 900, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 11 — aqui não tem regra: o abraço
S[11] = (t, d) => {
  let g = rays(t, '#F4A26B', '#F6B585');
  g += pp(MAE_V, { x: 450, y: 1880, s: 1.05, expr: 'happy', hr: [170, -380], hl: [-150, -300] });
  g += person(Object.assign({}, KAI_ADULT, { x: 650, y: 1880, s: 1.05, sx: -1, expr: 'happy', hr: [180, -380], hl: [-150, -300] }));
  for (let i = 0; i < 5; i++) { const k = ((t * 0.5 + i / 5) % 1); g += heart(380 + i * 80, 1000 - k * 500, 0.9 * (1 - k)); }
  g += G(`translate(540,360) scale(${pop1(t, 0.1)}) rotate(-3)`, R(-430, -90, 860, 180, 40, '#1A1210', 0) + T(0, 8, 'AQUI NÃO TEM REGRA', 66, '#FFFFFF'));
  return { g, cam: [540, 1100, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 12 — comenta o nome da sua mãe / liga pra ela
S[12] = (t, d) => {
  const aL = findW(12, /liga/) - 0.15;
  let g = rays(t, '#C2577A', '#D16C8E');
  g += phone(540, 900, 1.6 * (t > aL ? 1 : pop1(t, 0.1)), 'MÃE', t > aL ? t : 0);
  for (let i = 0; i < 6; i++) { const k = ((t * 0.6 + i / 6) % 1); g += heart(140 + i * 160, 1700 - k * 800, 0.8 * (1 - k)); }
  return { g, cam: [540, 960, 1.0] };
};

function titleOverlay(t) {
  if (t > 5.2) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 4.8, 5.2);
  return G(`translate(540,220) scale(${k * out})`, R(-500, -130, 1000, 260, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -40, 'SÓ 1 DIA POR ANO', 76, '#FFFFFF') + T(0, 55, 'COM A SUA MÃE', 80, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[12].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,250) scale(${k})`, R(-480, -130, 960, 260, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -40, 'COMENTA O NOME', 70, '#FFFFFF') + T(-30, 52, 'DA SUA MÃE', 76, '#FFE14D') + heart(260, 46, 0.8));
}
