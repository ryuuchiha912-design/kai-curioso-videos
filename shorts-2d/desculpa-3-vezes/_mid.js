// ================= "E se você só pudesse pedir desculpa 3 vezes na vida?" (mãe) =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const VIZ = passenger(21, { tie: null, shirt: '#8E6CC8', hair: 'bald', mustache: true, hairCol: '#5A4A3A', skin: '#E8B98F' });
const DIRETOR = passenger(2, { tie: '#C62A2A', glasses: true, hair: 'bald', shirt: '#555B66' });
const MOTORISTA = passenger(7, { tie: null, shirt: '#3E9B4A', hair: 'short' });
const MAE_SK = MAE.skin, MAE_SL = MAE.shirt;
const KAI_SK = KAI.skin, KAI_SL = KAI.shirt;

function ageTag(txt) { return G('translate(540,110)', R(-170, -55, 340, 110, 34, '#1A1210', 8) + T(0, 6, txt, 58, '#FFE14D')); }
function levelHud(i, t) {
  const tag = { 2: '6 ANOS', 3: '6 ANOS', 5: '12 ANOS', 6: '12 ANOS', 7: '15 ANOS', 8: '17 ANOS', 9: '19 ANOS', 10: '19 ANOS', 11: '19 ANOS', 12: '20 ANOS', 13: '20 ANOS', 14: '21 ANOS', 15: '21 ANOS' }[i];
  return tag ? ageTag(tag) : '';
}
function vase(x, y, s, broken = 0) {
  if (!broken) return G(`translate(${x},${y}) scale(${s})`, P('M-50,0 Q-90,-80 -40,-150 L-30,-190 L30,-190 L40,-150 Q90,-80 50,0Z', '#2C6FB6', 8) + P('M-60,-90 Q0,-70 60,-90', 'none', 6));
  let g = '';
  [[-90, 10, -30], [-20, 20, 20], [60, 5, 50], [10, -20, -10], [100, 25, 80]].forEach(([dx, dy, r], i) => g += G(`translate(${dx},${dy}) rotate(${r})`, P('M-30,0 L0,-36 L34,-6 L10,20Z', '#2C6FB6', 6)));
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function car(x, y, s, col = '#C62A2A', dent = 0) {
  let g = P('M-200,0 L-200,-70 Q-180,-100 -120,-104 L-70,-160 L80,-160 L140,-100 Q200,-96 210,-60 L210,0Z', col, 9) + R(-55, -148, 60, 46, 8, '#BFE3F5', 6) + R(20, -148, 60, 46, 8, '#BFE3F5', 6) + C(-120, 0, 44, '#2A2A33', 8) + C(130, 0, 44, '#2A2A33', 8);
  if (dent) g += P('M190,-80 L170,-60 L200,-45 L175,-25', 'none', 8) + star(205, -70, 40, 16, 6, '#FFE14D');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function windowBroken(x, y, w, h) {
  return R(x, y, w, h, 10, '#BFE3F5', 9) + P(`M${x + w * 0.5},${y + h * 0.45} L${x + w * 0.15},${y + h * 0.1} M${x + w * 0.5},${y + h * 0.45} L${x + w * 0.9},${y + h * 0.2} M${x + w * 0.5},${y + h * 0.45} L${x + w * 0.3},${y + h * 0.95} M${x + w * 0.5},${y + h * 0.45} L${x + w * 0.85},${y + h * 0.85}`, 'none', 7);
}
function ball(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, C(0, 0, 40, '#FFFFFF', 7) + P('M-12,-14 L12,-14 L18,8 L0,22 L-18,8Z', '#1A1210', 0)); }
function bench(x, y) { return R(x - 200, y - 110, 400, 30, 8, '#B9874F', 7) + Ln(x - 170, y - 80, x - 170, y, O, 10) + Ln(x + 170, y - 80, x + 170, y, O, 10); }
function angry(x, y, s, t) { let g = ''; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.sin(t * 9) * 0.1; g += Ln(x + Math.cos(a) * 18 * s, y + Math.sin(a) * 18 * s, x + Math.cos(a) * 46 * s, y + Math.sin(a) * 46 * s, '#E04B3C', 12 * s); } return g; }
/** Pulso grande com número; `sleeve`/`skin` definem de quem é. */
const wristOf = (who) => who === 'mae' ? [MAE_SK, MAE_SL] : [KAI_SK, KAI_SL];
function bigWrist(x, y, s, n, who, glow = 1) { const [sk, sl] = wristOf(who); return wristBig(x, y, s, n, glow, sk, sl); }

const S = [];
// 0 — gancho
S[0] = (t, d) => {
  let g = rays(t, '#3A2A7A', '#4A3A9A');
  g += bigWrist(560, 760, 1.25, 3, 'kai', 0.7 + 0.3 * Math.sin(t * 6));
  g += KAIs({ x: 540, y: 2150, s: 1.3, expr: 'surprised', hl: [-150, -150], hr: [150, -150] });
  return { g, cam: [540, 960, 1 + 0.04 * eio(prog(t, 0, d))] };
};
// 1 — a regra: nasce com 3, cada desculpa gasta 1
S[1] = (t, d) => {
  const aC = findW(1, /^cada/) - 0.15;
  if (t < aC) {
    let g = room('#F6E3EC', '#C9A8B8', 1500) + crib(540, 1300, 1.6, 3, pop1(t, findW(1, /três/) - 0.1));
    g += pp(MAE, { x: 240, y: 1820, s: 0.95, expr: 'happy', hr: [190, -360] });
    return { g, cam: [540, 1150, 1.0] };
  }
  let g = rays(t, '#2A2236', '#352A44') + bigWrist(560, 900, 1.2, t > aC + 1.0 ? 2 : 3, 'kai') + plim(820, 680, t, aC + 0.9);
  g += G(`translate(540,1180) scale(${pop1(t, aC + 0.2)})`, R(-360, -70, 720, 140, 30, '#FFFFFF', 8) + T(0, 6, '"DESCULPA" = -1', 64, '#C62A2A'));
  return { g, cam: [540, 960, 1.0] };
};
// 2 — 6 anos: vaso da sala
S[2] = (t, d) => {
  const aB = findW(2, /quebrei/) - 0.1, aP = findW(2, /pedi/) - 0.1, aD = findW(2, /dois/) - 0.15;
  let g = room('#F6D7A8', '#C98A5A', 1500) + R(620, 1300, 300, 200, 10, '#B9874F', 8) + vase(770, 1300, 1.0, t > aB ? 1 : 0);
  if (t > aB) g += vase(780, 1530, 1.0, 1);
  g += KAIs({ x: 380, y: 1840, s: 0.72, expr: t > aP ? 'sad' : 'surprised', wrist: t > aD ? '2' : '3', wristGlow: t > aD - 0.2 && t < aD + 0.6 ? 1 : 0, hr: [170, -380], hl: [-150, -150] });
  g += say(80, 760, 460, 'DESCULPA...', 50, 'left', '#FFFFFF', t, aP) + plim(520, 1250, t, aD);
  return { g, cam: [540, 1180, 1.0] };
};
// 3 — mãe: "guarda isso, filho"
S[3] = (t, d) => {
  const aG = findW(3, /guarda/) - 0.2;
  let g = room('#F6D7A8', '#C98A5A', 1500);
  g += pp(MAE, { x: 690, y: 1840, s: 1.05, sx: -1, expr: 'neutral', rot: 6, hr: [200, -300] });
  g += KAIs({ x: 330, y: 1840, s: 0.72, expr: 'sad', wrist: '2', hr: [190, -330], lx: 1 });
  g += say(220, 560, 660, 'GUARDA ISSO, FILHO.|DESCULPA É COISA SÉRIA.'.split('|')[0], 46, 'right', '#FFFFFF', t, aG);
  if (t > findW(3, /desculpa/) - 0.1) g += say(220, 760, 660, 'DESCULPA É COISA SÉRIA.', 44, 'right', '#FFFFFF', t, findW(3, /desculpa/) - 0.1);
  return { g, cam: [540, 1180, 1.0] };
};
// 4 — o pulso dela: 3, nunca usou
S[4] = (t, d) => {
  const aN = findW(4, /nunca/) - 0.1;
  let g = rays(t, '#F6B585', '#F9CBA4') + bigWrist(560, 860, 1.2, 3, 'mae');
  g += G(`translate(540,1160) scale(${pop1(t, aN)}) rotate(-4)`, R(-330, -70, 660, 140, 30, '#1A1210', 0) + T(0, 6, 'NUNCA USOU', 70, '#FFE14D'));
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 5 — 12 anos: janela do vizinho
S[5] = (t, d) => {
  const aJ = findW(5, /janela/) - 0.2, aV = findW(5, /veio/) - 0.2;
  let g = R(-60, -60, 1200, 2040, 0, '#BFE3F5', 0) + houseFront(560, 1500, 480, 520, '#CFE3C8', '#3E6A8A', false) + R(-60, 1500, 1200, 600, 0, '#7CB65A', 8);
  g += (t > aJ ? windowBroken(640, 1080, 160, 150) : R(640, 1080, 160, 150, 10, '#BFE3F5', 9)) + R(840, 1260, 120, 240, 6, '#7A4A2A', 7);
  const bx = t < aJ ? lerp(300, 700, prog(t, 0.1, aJ)) : 700, by = t < aJ ? 1500 - Math.sin(prog(t, 0.1, aJ) * Math.PI) * 500 - prog(t, 0.1, aJ) * 300 : 1180;
  g += ball(bx, by, 1);
  g += KAIs({ x: 240, y: 1880, s: 0.8, expr: t > aJ ? 'worried' : 'happy', sweat: t > aJ, hr: [200, -380] });
  if (t > aV) { g += pp(VIZ, { x: 900, y: 1880, s: 0.9, sx: -1, expr: 'angry', hr: [200, -440 + Math.sin(t * 14) * 30] }) + angry(960, 1300, 1.2, t); g += say(560, 600, 460, 'QUEM FOI?!', 52, 'right', '#FFFFFF', t, aV); }
  return { g, cam: [540, 1180, 1.0] };
};
// 6 — a mãe vai lá fora (de costas — o pulso dela não aparece)
S[6] = (t, d) => {
  const aC = findW(6, /calmo/) - 0.3;
  let g = R(-60, -60, 1200, 2040, 0, '#BFE3F5', 0) + R(-60, 1500, 1200, 600, 0, '#7CB65A', 8);
  g += pp(MAE, { x: 420, y: 1880, s: 1.0, back: true });
  g += pp(VIZ, { x: 780, y: 1880, s: 0.95, sx: -1, expr: t > aC ? 'happy' : 'neutral' });
  g += G('translate(0,0)', windowFrame(40, 520, 300, 300, '#F6D7A8')) + G('translate(190,830) scale(0.55)', head(Object.assign({}, KAI, { expr: 'worried', lx: 1 })));
  g += think(560, 560, 420, '?', 70, t, findW(6, /não/) - 0.2, 300, 760);
  return { g, cam: [540, 1180, 1.0] };
};
// 7 — 15 anos: diretoria
S[7] = (t, d) => {
  const aS = findW(7, /saiu/) - 0.2, aR = findW(7, /resolvido/) - 0.2;
  let g = room('#E8DCC0', '#B9A98A', 1500) + R(640, 760, 300, 740, 8, '#7A4A2A', 9) + R(670, 680, 240, 70, 10, '#FFFFFF', 6) + T(790, 718, 'DIRETOR', 40, '#1A1210') + bench(300, 1500);
  g += KAIs({ x: 300, y: 1520, s: 0.85, expr: 'sad', hl: [-110, -200], hr: [110, -200] });
  if (t > aS) g += pp(MAE, { x: 780, y: 1860, s: 1.0, sx: -1, expr: 'neutral' });
  g += say(420, 560, 460, 'RESOLVIDO.', 54, 'right', '#FFFFFF', t, aR);
  return { g, cam: [540, 1180, 1.0] };
};
// 8 — 17 anos: bateu o carro
S[8] = (t, d) => {
  const aE = findW(8, /ela/) - 0.2, aV = findW(8, /voltou/) - 0.2, aT = findW(8, /tá/) - 0.2;
  let g = R(-60, -60, 1200, 2040, 0, '#BFE3F5', 0) + R(-60, 1400, 1200, 700, 0, '#5A6070', 8) + Ln(-60, 1650, 1140, 1650, '#FFE14D', 10);
  g += car(300, 1600, 1.0, '#C62A2A', 1) + car(780, 1600, 1.0, '#2C6FB6');
  g += KAIs({ x: 120, y: 1900, s: 0.9, expr: 'worried', sweat: true });
  if (t > aE && t < aV) g += pp(MAE, { x: 600, y: 1900, s: 1.0, back: true }) + pp(MOTORISTA, { x: 900, y: 1900, s: 0.95, sx: -1, expr: 'neutral' });
  if (t > aV) { g += pp(MAE, { x: 380, y: 1900, s: 1.0, sx: -1, expr: 'smile' }); g += say(200, 560, 520, 'TÁ TUDO BEM.', 52, 'right', '#FFFFFF', t, aT); }
  return { g, cam: [540, 1150, 1.0] };
};
// 9 — 19 anos: a briga
S[9] = (t, d) => {
  const aF = findW(9, /falou/) - 0.2;
  let g = room('#C9584A', '#7A3A30', 1500);
  g += pp(MAE, { x: 700, y: 1860, s: 1.05, sx: -1, expr: 'angry', hr: [200, -380 + Math.sin(t * 10) * 20] }) + angry(800, 1150, 1.1, t);
  g += KAIs({ x: 330, y: 1860, s: 1.0, expr: 'angry', hl: [-200, -300], hr: [200, -300] }) + angry(250, 1150, 1.1, t + 1);
  if (t > aF) g += G(`translate(560,700) scale(${pop1(t, aF)})`, star(0, 0, 260, 150, 12, '#1A1210') + T(0, 6, '@#!%', 90, '#E04B3C'));
  return { g, cam: [540, 1180, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 10 — esperou… ela não pediu
S[10] = (t, d) => {
  let g = room('#5E6A86', '#3E4660', 1500) + clockFace(820, 640, 110, -Math.PI / 2 + t * 0.6, -Math.PI / 2 + t * 4);
  g += KAIs({ x: 400, y: 1860, s: 1.0, expr: 'sad', lx: 1 });
  g += think(540, 860, 360, '...', 80, t, 0.6, 470, 1280, '#FFFFFF');
  return { g, cam: [540, 1180, 1.0] };
};
// 11 — dois anos sem falar
S[11] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#2A3352', 0) + windowFrame(560, 420, 400, 460, '#5A6A8E');
  for (let i = 0; i < 18; i++) { const k = ((t * 1.4 + i / 18) % 1); g += Ln(580 + (i * 23) % 360, 430 + k * 440, 570 + (i * 23) % 360, 470 + k * 440, '#BFE3F5', 4); }
  g += G(`translate(300,760) scale(${pop1(t, 0.2)})`, R(-180, -120, 360, 240, 20, '#FFFFFF', 8) + T(0, -40, '2 ANOS', 80, '#C62A2A') + T(0, 50, 'SEM FALAR', 44, '#1A1210'));
  g += person(Object.assign({}, KAI, { x: 540, y: 1880, s: 1.0, back: true }));
  return { g, cam: [540, 1150, 1.0] };
};
// 12 — volta pra casa: o pulso dela de perto
S[15] = (t, d) => {
  const aP = findW(15, /pulso/) - 0.3;
  let g = room('#F6D7A8', '#C98A5A', 1500) + R(80, 640, 300, 860, 10, '#7A4A2A', 9) + R(95, 655, 130, 830, 4, '#F6C96B', 0);
  g += pp(MAE_OLD, { x: 700, y: 1860, s: 1.0, sx: -1, expr: 'worried', hr: [230, -330], wrist: t > aP ? ' ' : undefined });
  g += KAIs({ x: 300, y: 1860, s: 1.0, expr: 'surprised', lx: 1 });
  return { g, cam: [lerp(540, 600, eio(prog(t, aP, d))), lerp(1180, 1400, eio(prog(t, aP, d))), lerp(1.0, 1.5, eio(prog(t, aP, d)))] };
};
// 13 — ZERO
S[16] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#14121C', 0) + C(540, 900, 460, 'rgba(255,255,255,0.05)', 0) + bigWrist(560, 900, 1.35, 0, 'mae', 0);
  return { g, cam: [540, 960, 1.0 + 0.1 * eio(prog(t, 0, d + 1))] };
};
// 14 — flashback: a janela, a prova, o carro (ela pedindo desculpa por ele)
S[17] = (t, d) => {
  const at = [findW(17, /janela/), findW(17, /prova/), findW(17, /carro/)].map((a) => a - 0.15);
  let g = R(-60, -60, 1200, 2040, 0, '#C9A57A', 0);
  const panels = [
    (k) => windowBroken(40, 60, 160, 150) + pp(VIZ, { x: 330, y: 460, s: 0.55, sx: -1, expr: 'neutral' }) + pp(MAE, { x: 140, y: 470, s: 0.55, expr: 'sad', wrist: '2' }),
    (k) => R(250, 40, 130, 300, 6, '#7A4A2A', 6) + pp(DIRETOR, { x: 320, y: 470, s: 0.55, sx: -1, expr: 'neutral' }) + pp(MAE, { x: 130, y: 470, s: 0.55, expr: 'sad', wrist: '1' }),
    (k) => car(260, 420, 0.5, '#C62A2A', 1) + pp(MOTORISTA, { x: 350, y: 470, s: 0.55, sx: -1, expr: 'neutral' }) + pp(MAE, { x: 130, y: 470, s: 0.55, expr: 'sad', wrist: '0' }),
  ];
  panels.forEach((fn, i) => {
    const k = pop1(t, at[i], 0.3); if (k <= 0) return;
    const y = 220 + i * 520;
    g += G(`translate(${i % 2 ? 560 : 80},${y}) scale(${k}) rotate(${i % 2 ? 2 : -2})`, R(0, 0, 440, 480, 20, '#F4EAD8', 10) + `<clipPath id="pc${i}"><rect x="10" y="10" width="420" height="460"/></clipPath><g clip-path="url(#pc${i})">` + fn(k) + '</g>' + bubble(150, 20, 270, 90, 'DESCULPA', 38, 'left') );
    g += plim(i % 2 ? 560 : 520, y + 60, t, at[i] + 0.2);
  });
  return { g: sepia(g), cam: [540, 960, 1.0] };
};
// 15 — ela gastou as três por mim
S[18] = (t, d) => {
  let g = rays(t, '#8A6A9A', '#9A7AAA') + bigWrist(560, 800, 1.1, 0, 'mae', 0);
  for (let i = 0; i < 3; i++) g += G(`translate(${300 + i * 240},${1240}) scale(${pop1(t, 0.3 + i * 0.35)})`, C(0, 0, 80, '#FFF6C8', 8) + T(0, 6, '-1', 70, '#C62A2A'));
  g += G(`translate(540,1500) scale(${pop1(t, findW(18, /por/) - 0.1)})`, R(-300, -70, 600, 140, 30, '#1A1210', 0) + T(0, 6, 'POR MIM', 76, '#FFE14D'));
  return { g, cam: [540, 960, 1.0] };
};
// 16 — não sobrou nenhuma pra ela
S[19] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#1C1A26', 0) + E(540, 1880, 260, 50, 'rgba(255,255,255,0.12)', 0) + P('M380,-60 L700,-60 L860,1900 L220,1900Z', 'rgba(255,240,200,0.08)', 0);
  g += pp(MAE_OLD, { x: 540, y: 1880, s: 1.05, expr: 'sad', lx: 0, wrist: '0', hr: [170, -260] });
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 17 — eu olhei pro meu pulso: ainda tinha duas
S[20] = (t, d) => {
  const aD = findW(20, /duas/) - 0.15;
  let g = rays(t, '#2C6FB6', '#3F86CF') + bigWrist(560, 900, 1.2, 2, 'kai', t > aD ? 1 : 0.3);
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 18 — "desculpa, mãe."
S[21] = (t, d) => {
  const aD = findW(21, /desculpa/) - 0.2;
  let g = room('#F6D7A8', '#C98A5A', 1500);
  g += pp(MAE_OLD, { x: 700, y: 1860, s: 1.0, sx: -1, expr: t > aD + 0.5 ? 'worried' : 'sad', wrist: '0', hr: [200, -300] });
  g += KAIs({ x: 330, y: 1860, s: 1.0, expr: 'sad', wrist: t > aD + 0.4 ? '1' : '2', wristGlow: t > aD && t < aD + 1 ? 1 : 0, hr: [210, -330] });
  g += say(120, 600, 560, 'DESCULPA, MÃE.', 56, 'left', '#FFFFFF', t, aD) + plim(560, 1350, t, aD + 0.4);
  return { g, cam: [540, 1180, 1.0] };
};
// 19 — o abraço
S[22] = (t, d) => {
  let g = rays(t, '#F4A26B', '#F6B585');
  g += pp(MAE_OLD, { x: 460, y: 1880, s: 1.05, expr: 'happy', hr: [170, -380], hl: [-150, -300] });
  g += KAIs({ x: 650, y: 1880, s: 1.05, sx: -1, expr: 'happy', hr: [180, -380], hl: [-150, -300] });
  for (let i = 0; i < 6; i++) { const k = ((t * 0.5 + i / 6) % 1); g += heart(360 + i * 75, 1000 - k * 500, 0.9 * (1 - k)); }
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 20 — pra quem seria a sua desculpa?
S[26] = (t, d) => {
  let g = rays(t, '#3A2A7A', '#4A3A9A') + bigWrist(560, 900, 1.1, 1, 'kai', 0.6 + 0.4 * Math.sin(t * 5));
  return { g, cam: [540, 960, 1.0] };
};


// 12 — todo aniversário ela mandava mensagem; eu nunca respondi
S[12] = (t, d) => {
  const aN = findW(12, /nunca/) - 0.2;
  let g = rays(t, '#2A3352', '#33406A');
  const msgs = [['PARABÉNS, FILHO!|TE AMO.', 0.2], ['FELIZ ANIVERSÁRIO,|MEU AMOR.', 0.9], ['SAUDADE DE VOCÊ.', 1.6]];
  let ph = '';
  msgs.forEach(([m, a], i) => { const k = pop1(t, a, 0.3); if (k <= 0) return; const lines = m.split('|'), h = 50 + lines.length * 50, yy = -250 + i * 200;
    ph += G(`translate(-20,${yy + h / 2}) scale(${k}) translate(20,${-(yy + h / 2)})`, R(-205, yy, 380, h, 22, '#FFFFFF', 5) + lines.map((l, j) => T(-15, yy + 50 + j * 50, l, 34, '#1A1210')).join('')); });
  ph += t > aN ? T(150, 360, 'VISTO ✓✓', 30, '#5A6070') : '';
  g += G('translate(540,860) scale(1.3)', R(-250, -440, 500, 880, 60, '#1A1A20', 10) + R(-222, -390, 444, 760, 20, '#ECE5DD', 0) + R(-222, -390, 444, 100, 20, '#2E7D5A', 0) + C(-160, -340, 32, '#C2577A', 4) + T(-60, -338, 'MÃE', 44, '#FFFFFF') + ph);
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 13 — a luz da varanda acesa, todo dia
S[13] = (t, d) => {
  const night = (Math.floor(t / 1.1) % 2) === 1;
  let g = R(-60, -60, 1200, 2040, 0, night ? '#1C2A55' : '#F4C48A', 0) + (night ? C(860, 300, 60, '#F4F1EA', 6) : C(860, 300, 70, '#FFE27A', 6));
  g += houseFront(140, 1500, 800, 600, '#F2D2A0', '#B5523B') + R(-60, 1500, 1200, 600, 0, night ? '#3E5A3A' : '#7CB65A', 8);
  g += C(540, 1010, 26, '#FFE27A', 6) + (night ? C(540, 1010, 110, 'rgba(255,226,122,0.35)', 0) + C(540, 1010, 60, 'rgba(255,226,122,0.5)', 0) : '');
  g += G(`translate(860,1700) scale(${pop1(t, 0.3)})`, R(-140, -60, 280, 120, 26, '#FFFFFF', 7) + T(0, 6, 'TODO DIA', 44, '#C62A2A'));
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 14 — eu voltei. A luz ainda tava acesa.
S[14] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#1C2A55', 0) + C(860, 300, 60, '#F4F1EA', 6) + houseFront(140, 1500, 800, 600, '#F2D2A0', '#B5523B') + R(-60, 1500, 1200, 600, 0, '#3E5A3A', 8);
  g += C(540, 1010, 26, '#FFE27A', 6) + C(540, 1010, 120 + Math.sin(t * 3) * 6, 'rgba(255,226,122,0.35)', 0);
  g += person(Object.assign({}, KAI, { x: 540, y: 1960, s: 1.0, back: true }));
  return { g, cam: [540, 1200, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 23 — ela chorou: "eu queria tanto te pedir desculpa… mas não tinha mais nenhuma"
S[23] = (t, d) => {
  const aQ = findW(23, /queria/) - 0.2;
  let g = rays(t, '#F4A26B', '#F6B585');
  g += pp(MAE_OLD, { x: 540, y: 2150, s: 1.6, expr: 'sad', lx: 0, wrist: '0', hr: [170, -300] });
  for (let i = 0; i < 2; i++) { const k = ((t * 0.6 + i * 0.5) % 1); g += G(`translate(${470 + i * 140},${1250 + k * 220})`, `<g opacity="${(1 - k) * 0.9}">` + P('M0,-30 Q22,0 0,20 Q-22,0 0,-30Z', '#7FC6F0', 4) + '</g>'); }
  g += say(130, 380, 820, 'EU QUERIA TANTO TE PEDIR DESCULPA...', 38, 'left', '#FFFFFF', t, aQ);
  if (t > findW(23, /mas/) - 0.2) g += say(170, 600, 740, '...MAS NÃO TINHA MAIS NENHUMA.', 40, 'left', '#FFFFFF', t, findW(23, /mas/) - 0.2);
  return { g, cam: [540, 960, 1.0] };
};
// 24 — hoje, o meu pulso mostra um
S[24] = (t, d) => {
  let g = rays(t, '#2C6FB6', '#3F86CF') + bigWrist(560, 900, 1.2, 1, 'kai', 0.8 + 0.2 * Math.sin(t * 5));
  g += G(`translate(540,1170) scale(${pop1(t, 0.4)})`, R(-180, -60, 360, 120, 26, '#FFFFFF', 7) + T(0, 6, 'HOJE', 60, '#1A1210'));
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 25 — tô guardando, pra pedir desculpa por alguém que eu amo
S[25] = (t, d) => {
  const aA = findW(25, /alguém/) - 0.2;
  let g = rays(t, '#F6D7A8', '#F9E2BE');
  g += KAIs({ x: 380, y: 1880, s: 1.05, expr: 'smile', wrist: '1', wristGlow: 0.6, hr: [200, -360] });
  if (t > aA) g += G(`translate(780,1880) scale(${pop1(t, aA, 0.4)})`, person(Object.assign({}, SON, { x: 0, y: 0, s: 0.7, sx: -1, expr: 'happy', hr: [180, -380] })));
  if (t > aA) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(520 + i * 70, 1150 - k * 400, 0.8 * (1 - k)); }
  g += G(`translate(540,520) scale(${pop1(t, 0.2)}) rotate(-3)`, R(-380, -80, 760, 160, 36, '#1A1210', 0) + T(0, 6, 'TÔ GUARDANDO', 76, '#FFE14D'));
  return { g, cam: [540, 1100, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};

/** Balão de pensamento simples. */
function think(x, y, w, txt, size = 44, t = 1, at = 0, tx = null, ty = null, fill = '#FFFFFF') {
  const k = back(prog(t, at, at + 0.25)); if (k <= 0) return '';
  const h = 150; let g = R(x, y, w, h, 70, fill, 8);
  if (tx !== null) for (let i = 1; i <= 2; i++) { const kk = i / 3; g += C(lerp(x + w / 2, tx, kk + 0.15), lerp(y + h, ty, kk + 0.15), 22 - i * 6, fill, 6); }
  g += T(x + w / 2, y + h / 2 + 4, txt, size, '#1A1210');
  return G(`translate(${x + w / 2},${y + h / 2}) scale(${k}) translate(${-(x + w / 2)},${-(y + h / 2)})`, g);
}
function titleOverlay(t) {
  if (t > 3.9) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 3.5, 3.9);
  return G(`translate(540,230) scale(${k * out})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -45, 'SÓ 3 "DESCULPAS"', 80, '#FFFFFF') + T(0, 60, 'NA VIDA INTEIRA', 80, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[26].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,260) scale(${k})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -45, 'PRA QUEM SERIA', 72, '#FFFFFF') + T(0, 52, 'A SUA DESCULPA?', 80, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
