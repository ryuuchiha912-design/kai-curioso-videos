// ================= "Você prefere R$ 1 milhão agora ou R$ 10 mil por mês pra sempre?" =================
const RED = '#D93A2F', RED2 = '#E85A45', BLUE = '#2C6FB6', BLUE2 = '#3F86CF', GREEN = '#3E9B4A', MONEY = '#7CC46A';
const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const VIZ = passenger(21, { tie: null, shirt: '#8E6CC8', hair: 'bald', mustache: true, hairCol: '#5A4A3A', skin: '#E8B98F' });
const PRIMOS = [passenger(31, { tie: null, shirt: '#E07B39' }), passenger(32, { tie: null, shirt: '#3E9B4A', hair: 'bun' }), passenger(33, { tie: '#F2B636', shirt: '#7A2E3A' }), passenger(34, { tie: null, shirt: '#2C6FB6', glasses: true }), passenger(35, { tie: null, shirt: '#C2577A', hair: 'bun' })];
const KAI_OLD = Object.assign({}, KAI, { hairCol: '#B8B2AC' });
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));

// ---------------- objetos
function bill(x, y, s, rot = 0) { return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, R(-90, -45, 180, 90, 10, MONEY, 6) + C(0, 0, 26, '#A8DC8F', 5) + T(0, 3, 'R$', 30, '#2E6B2A')); }
function moneyBag(x, y, s, label = '') {
  let g = P('M-120,40 C-150,-60 -70,-110 -40,-120 L40,-120 C70,-110 150,-60 120,40 C110,130 -110,130 -120,40Z', '#C99A5B', 9);
  g += P('M-50,-120 L-70,-170 L-20,-150 L0,-180 L20,-150 L70,-170 L50,-120Z', '#B5864A', 8) + R(-56, -132, 112, 26, 10, '#7A5A30', 7);
  g += T(0, 30, 'R$', 110, '#2E6B2A', 12);
  if (label) g += R(-150, 120, 300, 70, 18, '#FFFFFF', 7) + T(0, 156, label, 40, '#1A1210');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function cash(x, y, s, n = 5) { let g = ''; for (let i = 0; i < n; i++) g += R(-110, -i * 26 - 30, 220, 30, 6, i % 2 ? MONEY : '#6AB75A', 6); return G(`translate(${x},${y}) scale(${s})`, g); }
function calendar(x, y, s, head = 'MÊS', big = '30', col = RED) {
  return G(`translate(${x},${y}) scale(${s})`, R(-130, -150, 260, 300, 24, '#FFFFFF', 9) + R(-130, -150, 260, 80, 20, col, 9) + T(0, -108, head, 42, '#FFFFFF') + T(0, 40, big, big.length > 3 ? 58 : 120, '#1A1210') + C(-70, -160, 14, '#5A6070', 6) + C(70, -160, 14, '#5A6070', 6));
}
function counter(x, y, s, val, col = '#1A1210', fg = '#7BE07B') {
  const txt = 'R$ ' + fmt(val);
  const w = txt.length * 46 + 80;
  return G(`translate(${x},${y}) scale(${s})`, R(-w / 2, -70, w, 140, 30, col, 9) + T(0, 6, txt, 84, fg));
}
function car(x, y, s, col = RED) {
  return G(`translate(${x},${y}) scale(${s})`, P('M-200,0 L-200,-70 Q-180,-100 -120,-104 L-70,-160 L80,-160 L140,-100 Q200,-96 210,-60 L210,0Z', col, 9) + R(-55, -148, 60, 46, 8, '#BFE3F5', 6) + R(20, -148, 60, 46, 8, '#BFE3F5', 6) + C(-120, 0, 44, '#2A2A33', 8) + C(130, 0, 44, '#2A2A33', 8) + C(-120, 0, 16, '#C9D3DC', 0) + C(130, 0, 16, '#C9D3DC', 0));
}
function mansion(x, y, s) {
  let g = houseFront(-330, 0, 660, 360, '#F4EAD8', '#7A2E3A');
  g += houseFront(-480, 0, 200, 260, '#EFE0C8', '#7A2E3A', false) + houseFront(280, 0, 200, 260, '#EFE0C8', '#7A2E3A', false);
  for (let i = 0; i < 4; i++) g += R(-250 + i * 150, -330, 40, 330, 6, '#FFFFFF', 6);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function bigX(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, Ln(-120, -120, 120, 120, O, 70) + Ln(120, -120, -120, 120, O, 70) + Ln(-120, -120, 120, 120, RED, 46) + Ln(120, -120, -120, 120, RED, 46)); }
function bankPhone(x, y, s, val, k = 1) {
  const sc = '<g>' + R(-60, -110, 120, 44, 12, GREEN, 0) + T(0, -86, 'BANCO', 26, '#FFFFFF') + T(0, -20, 'PIX', 30, '#5A6070') + T(0, 30, '+R$', 34, GREEN) + T(0, 72, val, 24, '#1A1210') + '</g>';
  return G(`translate(${x},${y}) scale(${s * k}) rotate(-6)`, phoneIcon(0, 0, 1, sc));
}
function chair(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-110, -380, 30, 380, 8, '#8A5A3A', 7) + R(80, -380, 30, 380, 8, '#8A5A3A', 7) + R(-120, -420, 240, 70, 14, '#B9874F', 8) + R(-130, -170, 260, 50, 12, '#B9874F', 8) + R(-110, -120, 26, 120, 6, '#8A5A3A', 6) + R(84, -120, 26, 120, 6, '#8A5A3A', 6)); }
function scarfOn(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, P('M-120,-10 Q0,30 120,-10 L110,30 Q0,70 -110,30Z', '#1A1A20', 7) + R(60, 10, 46, 160, 14, '#1A1A20', 7) + R(60, 150, 46, 24, 4, '#F07A1A', 6)); }
function infinity(x, y, s, col = '#FFE14D') { return G(`translate(${x},${y}) scale(${s})`, P('M0,0 C-40,-60 -140,-60 -140,0 C-140,60 -40,60 0,0 C40,-60 140,-60 140,0 C140,60 40,60 0,0Z', 'none', 0, `stroke="${O}" stroke-width="44"`) + P('M0,0 C-40,-60 -140,-60 -140,0 C-140,60 -40,60 0,0 C40,-60 140,-60 140,0 C140,60 40,60 0,0Z', 'none', 0, `stroke="${col}" stroke-width="24"`)); }
function coinTree(x, y, s, k, t) {
  let g = R(-26, -260 * k, 52, 260 * k, 14, '#8A5A3A', 7);
  const pts = [[0, -330], [-110, -260], [110, -260], [-60, -380], [60, -380], [-150, -170], [150, -170], [0, -220]];
  pts.forEach(([px, py], i) => { const kk = back(clamp(k * 1.6 - i * 0.1)); if (kk > 0) g += G(`translate(${px},${py * k}) scale(${kk})`, C(0, 0, 44, '#F2C23A', 7) + T(0, 4, '$', 46, '#A5781A')); });
  return G(`translate(${x},${y}) scale(${s})`, P('M-160,0 Q0,-60 160,0Z', '#5B8C3A', 7) + g);
}
function rain(t, n = 14, seed = 1) {
  let g = ''; const r = rng(seed);
  for (let i = 0; i < n; i++) { const x0 = r() * 1080, sp = 0.35 + r() * 0.3, ph = r(); const k = (t * sp + ph) % 1; g += bill(x0, -100 + k * 2100, 0.7, Math.sin(t * 3 + i) * 30); }
  return g;
}
function optionCard(t, L, c1, c2, sub) {
  let g = rays(t, c1, c2);
  g += G(`translate(540,760) scale(${pop1(t, 0.02, 0.35)}) rotate(-4)`, R(-360, -150, 720, 300, 50, '#1A1210', 0) + T(0, -40, 'OPÇÃO', 90, '#FFFFFF') + T(0, 70, L, 150, '#FFE14D'));
  if (sub) g += G(`translate(540,1080) scale(${pop1(t, 0.3)})`, R(-420, -60, 840, 120, 30, '#FFFFFF', 8) + T(0, 6, sub, 54, '#1A1210'));
  return g;
}
function splitAB(t, hiA = 1, hiB = 1) {
  let g = R(-60, -60, 600, 2040, 0, RED, 0) + R(540, -60, 600, 2040, 0, BLUE, 0);
  for (let i = 0; i < 7; i++) { g += P(`M270,840 L${270 + Math.cos(i + t * 0.3) * 900},${840 + Math.sin(i + t * 0.3) * 900} L${270 + Math.cos(i + 0.35 + t * 0.3) * 900},${840 + Math.sin(i + 0.35 + t * 0.3) * 900}Z`, RED2, 0); }
  for (let i = 0; i < 7; i++) { g += P(`M810,840 L${810 + Math.cos(i - t * 0.3) * 900},${840 + Math.sin(i - t * 0.3) * 900} L${810 + Math.cos(i + 0.35 - t * 0.3) * 900},${840 + Math.sin(i + 0.35 - t * 0.3) * 900}Z`, BLUE2, 0); }
  g += R(536, -60, 8, 2040, 0, '#1A1210', 0);
  g += G(`translate(270,840) scale(${hiA})`, moneyBag(0, -20, 1.25) + R(-230, 170, 460, 150, 30, '#1A1210', 0) + T(0, 220, 'R$ 1 MILHÃO', 58, '#FFFFFF') + T(0, 282, 'AGORA', 50, '#FFE14D'));
  g += G(`translate(810,840) scale(${hiB})`, calendar(0, -30, 1.1, 'TODO MÊS', '+10 MIL', GREEN) + R(-230, 170, 460, 150, 30, '#1A1210', 0) + T(0, 220, 'R$ 10 MIL/MÊS', 54, '#FFFFFF') + T(0, 282, 'PRA SEMPRE', 50, '#FFE14D'));
  g += G(`translate(540,1180) rotate(-8) scale(${1 + 0.06 * Math.sin(t * 6)})`, C(0, 0, 92, '#FFE14D', 10) + T(0, 6, 'VS', 84, '#1A1210'));
  g += G('translate(270,380)', C(0, 0, 90, '#FFFFFF', 10) + T(0, 8, 'A', 120, RED)) + G('translate(810,380)', C(0, 0, 90, '#FFFFFF', 10) + T(0, 8, 'B', 120, BLUE));
  return g;
}
function street(sky = '#BFE3F5') { return R(-60, -60, 1200, 2040, 0, sky, 0) + houseFront(40, 1480, 300, 380, '#F2D2A0', '#B5523B') + houseFront(740, 1480, 300, 380, '#CFE3C8', '#3E6A8A') + R(-60, 1480, 1200, 600, 0, '#C9B48A', 8); }

// ---------------- etiqueta "OPÇÃO A/B" no alto, durante cada metade
function levelHud(i, t) {
  const L = i >= 3 && i <= 7 ? 'A' : (i >= 9 && i <= 12 ? 'B' : '');
  if (!L) return '';
  const c = L === 'A' ? RED : BLUE;
  return G('translate(540,110)', R(-210, -55, 420, 110, 34, c, 8) + T(0, 6, 'OPÇÃO ' + L, 58, '#FFFFFF'));
}

const S = [];
// 0 — gancho: A x B
S[0] = (t, d) => {
  const look = Math.sin(t * 2.2) > 0 ? -1 : 1;
  let g = splitAB(t, 1 + 0.08 * Math.max(0, Math.sin(t * 2.2)), 1 + 0.08 * Math.max(0, -Math.sin(t * 2.2)));
  g += KAIs({ x: 540, y: 2120, s: 1.35, expr: 'surprised', lx: look, hl: [-170, -520], hr: [170, -520] });
  return { g, cam: [540, 960, 1.02 + 0.04 * eio(prog(t, 0, d))] };
};
// 1 — pensa bem, só uma
S[1] = (t, d) => {
  let g = room('#F6D7A8', '#C98A5A', 1500);
  g += R(70, 700, 300, 800, 14, RED, 9) + T(220, 900, 'A', 170, '#FFFFFF', 14) + C(330, 1120, 16, '#F2B636', 6);
  g += R(710, 700, 300, 800, 14, BLUE, 9) + T(860, 900, 'B', 170, '#FFFFFF', 14) + C(750, 1120, 16, '#F2B636', 6);
  g += KAIs({ x: 540, y: 1760, s: 1.0, expr: 'worried', lx: Math.sin(t * 3), hr: [130, -620], hl: [-150, -150] });
  const at = findW(1, /só/) - 0.05;
  g += badge(540, 560, pop1(t, at), 'SÓ UMA!', '#1A1210', '#FFE14D', -5, 80);
  return { g, cam: [540, 1180, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 2 — opção A: 1 milhão na conta
S[2] = (t, d) => {
  const at = findW(2, /conta/) - 0.15;
  if (t < 1.1) return { g: optionCard(t, 'A', RED, RED2, 'R$ 1 MILHÃO AGORA'), cam: [540, 960, 1] };
  let g = rays(t, '#2E7D3A', '#3E9B4A') + rain(t, 16, 3);
  g += KAIs({ x: 540, y: 2050, s: 1.3, expr: t > at ? 'happy' : 'surprised', hl: [-200, -560], hr: [200, -560] });
  g += bankPhone(540, 760, 1.5, '1.000.000,00', pop1(t, 1.15));
  return { g, cam: [540, 960, 1.0] };
};
// 3 — primos aparecem
S[3] = (t, d) => {
  let g = street();
  g += R(420, 1040, 240, 440, 10, '#7A4A2A', 9);
  g += KAIs({ x: 540, y: 1540, s: 0.8, expr: 'sus', hl: [-140, -200], hr: [140, -200] });
  const txt = ['OI, PRIMO!', 'LEMBRA DE MIM?', 'SOU SEU TIO!', 'E AÍ, PARÇA!'];
  PRIMOS.forEach((p, i) => {
    const at = 0.6 + i * 0.45, k = clamp(prog(t, at, at + 0.35));
    const xs = [120, 960, 230, 850, 540][i];
    g += pp(p, { x: lerp(i % 2 ? 1300 : -220, xs, eout(k)), y: 1900 + (i % 2) * 20, s: 0.95, expr: 'happy', sx: i % 2 ? -1 : 1, hr: [180, -420] });
  });
  txt.forEach((s, i) => { const at = 0.8 + i * 0.5; g += say(i % 2 ? 560 : 40, 300 + i * 150, 480, s, 44, i % 2 ? 'right' : 'left', '#FFFFFF', t, at); });
  return { g, cam: [540, 1100, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 4 — gastando: carro, viagem, celular
S[4] = (t, d) => {
  let g = rays(t, '#F2B636', '#F6C95A');
  const a1 = findW(4, /carro/) - 0.05, a2 = findW(4, /viagem/) - 0.05, a3 = findW(4, /celular/) - 0.05;
  const val = 1000000 - 120000 * clamp(prog(t, a1, a1 + 0.4)) - 60000 * clamp(prog(t, a2, a2 + 0.4)) - 45000 * clamp(prog(t, a3, a3 + 0.4)) - 25000 * clamp(prog(t, a3 + 0.8, a3 + 1.6));
  g += counter(540, 330, 1, val);
  g += G(`translate(300,800) scale(${pop1(t, a1)})`, car(0, 0, 1.15, RED)) + (t > a1 ? badge(330, 640, 0.6, '-120 MIL', RED, '#FFFFFF', 6, 60) : '');
  g += G(`translate(800,700) scale(${pop1(t, a2)})`, plane(0, 0, 1.3, true)) + (t > a2 ? badge(800, 560, 0.6, '-60 MIL', RED, '#FFFFFF', -6, 60) : '');
  for (let i = 0; i < 4; i++) g += G(`translate(${640 + i * 95},${1080}) scale(${pop1(t, a3 + i * 0.08)}) rotate(${(i - 1.5) * 8})`, phoneIcon(0, 0, 0.55));
  g += KAIs({ x: 330, y: 1900, s: 1.05, expr: 'happy', hl: [-190, -520], hr: [190, -520] });
  return { g, cam: [540, 960, 1.0] };
};
// 5 — o vizinho: "meu patrão"
S[5] = (t, d) => {
  let g = street('#FFE2B8');
  const at = findW(5, /chama/) - 0.3;
  g += KAIs({ x: 330, y: 1860, s: 1.0, expr: 'sus', lx: 1 });
  g += pp(VIZ, { x: 790, y: 1860, s: 1.0, sx: -1, expr: t > at ? 'happy' : 'neutral', rot: t > at ? -12 : 0, hr: [170, -300] });
  g += say(420, 640, 630, 'BOM DIA, MEU PATRÃO!', 44, 'right', '#FFFFFF', t, at);
  if (t < at) g += say(40, 700, 420, 'ELE NUNCA|ME DEU|BOM DIA...', 40, 'left', '#FFFFFF', t, 0.15);
  return { g, cam: [540, 1180, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 6 — a bolada acaba
S[6] = (t, d) => {
  const at = findW(6, /nada/) - 0.2;
  const val = 755000 * (1 - eio(clamp(prog(t, 0.6, at))));
  let g = room('#C9C2D6', '#8E86A0', 1500) + cobweb(30, 40, 1.4) + G('translate(1050,40) scale(-1,1)', cobweb(0, 0, 1.4));
  g += counter(540, 400, 1, val, '#1A1210', val < 1 ? '#FF6A5A' : '#7BE07B');
  g += KAIs({ x: 540, y: 1780, s: 1.1, expr: t > at ? 'sad' : 'worried', hl: [-230, -260], hr: [230, -260] });
  if (t > at) { g += E(310, 1500, 60, 40, '#FFFFFF') + E(770, 1500, 60, 40, '#FFFFFF'); g += fly(400 + Math.sin(t * 3) * 120, 1000 + Math.cos(t * 4) * 60, 1, t, false); }
  g += G(`translate(540,620) scale(${pop1(t, 0.25)})`, R(-380, -60, 760, 120, 30, '#FFFFFF', 8) + T(0, 6, 'EM POUCOS ANOS...', 56, '#1A1210'));
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 7 — investir: árvore de moedas
S[7] = (t, d) => {
  const at = findW(7, /investir/) - 0.1, at2 = findW(7, /render/) - 0.1;
  let g = rays(t, '#BDE7B0', '#D3F0C8');
  g += coinTree(700, 1500, 1.5, clamp(prog(t, at, at + 1.6)), t);
  g += moneyBag(250, 1300, 0.9, '1 MILHÃO');
  g += KAIs({ x: 280, y: 1900, s: 0.85, expr: t > at2 ? 'happy' : 'neutral', lx: 1, hr: [220, -380] });
  g += G(`translate(540,420) scale(${pop1(t, at2)})`, R(-440, -90, 880, 180, 40, '#1A1210', 0) + T(0, -22, '+ ALGUNS MIL', 70, '#7BE07B') + T(0, 52, 'POR MÊS', 50, '#FFFFFF'));
  if (t > at2) g += T(540, 560, '*depende dos juros', 34, '#2E6B2A');
  return { g, cam: [540, 960, 1.0] };
};
// 8 — opção B
S[8] = (t, d) => {
  if (t < 1.1) return { g: optionCard(t, 'B', BLUE, BLUE2, 'R$ 10 MIL POR MÊS'), cam: [540, 960, 1] };
  let g = rays(t, '#1F4F8A', '#2C6FB6');
  const n = Math.floor((t - 1.1) / 0.45);
  for (let i = 0; i <= Math.min(n, 5); i++) {
    const k = pop1(t, 1.1 + i * 0.45, 0.2);
    g += G(`translate(${540 + (i % 3 - 1) * 300},${640 + Math.floor(i / 3) * 420}) scale(${k}) rotate(${(i % 2 ? 6 : -6)})`, calendar(0, 0, 0.9, ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN'][i], '+10 MIL', GREEN));
  }
  const at = findW(8, /fim/) - 0.2;
  if (t > at) g += G(`translate(540,1500) scale(${pop1(t, at)})`, infinity(0, 0, 1.4));
  return { g, cam: [540, 960, 1.0] };
};
// 9 — mansão amanhã? não
S[9] = (t, d) => {
  const at = findW(9, /mansão/) - 0.1;
  let g = R(-60, -60, 1200, 2040, 0, '#BFE3F5', 0) + R(-60, 1350, 1200, 700, 0, '#7CB65A', 8) + mansion(540, 1350, 1.0);
  if (t > at) g += bigX(540, 1050, pop1(t, at));
  g += KAIs({ x: 540, y: 1900, s: 0.85, expr: 'sus', lx: -1 });
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 10 — sem medo do fim do mês
S[10] = (t, d) => {
  const at = findW(10, /medo/) - 0.1;
  let g = rays(t, '#FFE7A8', '#FFF1C8');
  g += calendar(740, 700, 1.4, 'DIA 30', '30', BLUE) + G(`translate(840,820) scale(${pop1(t, at)})`, check(0, 0, 1.6));
  g += KAIs({ x: 330, y: 1880, s: 1.05, expr: 'happy', hl: [-200, -560], hr: [200, -560] });
  return { g, cam: [540, 960, 1.0] };
};
// 11 — em 8 anos passou de 1 milhão
S[11] = (t, d) => {
  const at = findW(11, /milhão/) - 0.05;
  const k = eio(clamp(prog(t, 0.2, at)));
  const val = 1010000 * k, year = Math.max(1, Math.ceil(8 * k));
  let g = rays(t, '#1F4F8A', '#2C6FB6');
  g += counter(540, 360, 1, val);
  g += G('translate(540,560)', R(-150, -50, 300, 100, 26, '#FFFFFF', 8) + T(0, 6, 'ANO ' + year, 56, '#1A1210'));
  g += cash(540, 1260, 1.6, 2 + Math.round(10 * k));
  if (t > at) g += badge(540, 820, pop1(t, at), 'PASSOU DE 1 MILHÃO!', GREEN, '#FFFFFF', -5, 56);
  g += KAIs({ x: 870, y: 1920, s: 0.85, expr: t > at ? 'happy' : 'surprised', sx: -1 });
  return { g, cam: [540, 960, 1.0] };
};
// 12 — em 40 anos: 4,8 milhões
S[12] = (t, d) => {
  const at = findW(12, /quatro/) - 0.1;
  const k = eio(clamp(prog(t, 0.1, at + 0.6)));
  let g = rays(t, '#F2B636', '#F6C95A');
  g += counter(540, 360, 1, 1010000 + (4800000 - 1010000) * k);
  g += G('translate(540,560)', R(-180, -50, 360, 100, 26, '#FFFFFF', 8) + T(0, 6, 'ANO ' + Math.max(9, Math.ceil(40 * k)), 56, '#1A1210'));
  for (let i = 0; i < 4; i++) g += cash(220 + i * 210, 1450, 1.0, 4 + Math.round(k * (8 + i * 2)));
  g += person(Object.assign({}, KAI_OLD, { x: 540, y: 1940, s: 0.8, expr: 'happy', glasses: true, hl: [-190, -520], hr: [190, -520] }));
  return { g, cam: [540, 960, 1.0] };
};
// 13 — só que tem um detalhe
S[13] = (t, d) => {
  let g = R(-60, -60, 1200, 2040, 0, '#14121C', 0) + C(540, 1000, 520, 'rgba(255,255,255,0.06)', 0);
  g += KAIs({ x: 540, y: 2300, s: 2.0, expr: 'sus', lx: 0 });
  return { g, cam: [540, 960, 1.0 + 0.12 * eio(prog(t, 0, d))] };
};
// 14 — se você se for, o dinheiro para
S[14] = (t, d) => {
  const at = findW(14, /for/) - 0.1, at2 = findW(14, /para/) - 0.1, at3 = findW(14, /família/) - 0.1;
  let g = room('#5E6A86', '#3E4660', 1500);
  if (t < at) {
    g += calendar(540, 700, 1.3, 'TODO MÊS', '+10 MIL', GREEN) + infinity(540, 1060, 1.0);
    g += KAIs({ x: 540, y: 1900, s: 0.9, expr: 'neutral' });
  } else {
    g += chair(540, 1520, 1.0) + scarfOn(540, 1120, 1.0);
    g += G(`translate(540,620) scale(${pop1(t, at2)}) rotate(-6)`, R(-360, -90, 720, 180, 30, '#FFFFFF', 10) + T(0, -24, 'PAGAMENTO', 64, RED) + T(0, 50, 'ENCERRADO', 64, RED));
    if (t > at3) { g += pp(MAE, { x: 210, y: 1900, s: 0.95, expr: 'sad' }) + pp(SON, { x: 880, y: 1900, s: 0.75, sx: -1, expr: 'sad' }); g += badge(540, 900, pop1(t, at3), 'R$ 0', '#1A1210', '#FF6A5A', 4, 70); }
  }
  return { g, cam: [540, 1100, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 15 — o milhão fica pra quem você ama
S[15] = (t, d) => {
  const at = findW(15, /ama/) - 0.1;
  let g = rays(t, '#F6D7A8', '#F9E2BE');
  g += moneyBag(540, 900, 1.3, 'HERANÇA');
  g += pp(MAE, { x: 260, y: 1880, s: 0.95, expr: 'happy', hr: [190, -380] }) + pp(SON, { x: 820, y: 1880, s: 0.8, sx: -1, expr: 'happy', hr: [190, -380] });
  for (let i = 0; i < 5; i++) { const k = ((t * 0.6 + i / 5) % 1); if (t > at - 0.4) g += heart(300 + i * 120, 1300 - k * 500, 0.9 * (1 - k)); }
  return { g, cam: [540, 1080, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 16 — então me diz
S[16] = (t, d) => {
  let g = rays(t, '#3A2A7A', '#4A3A9A');
  g += KAIs({ x: 540, y: 2250, s: 1.9, expr: 'neutral', hr: [80, -470], hl: [-150, -150] });
  return { g, cam: [540, 960, 1.0 + 0.08 * eio(prog(t, 0, d))] };
};
// 17 — A ou B?
S[17] = (t, d) => {
  const aA = findW(17, /^a/) - 0.05, aB = findW(17, /^b/) - 0.05;
  const hiA = t < aB ? 1 + 0.12 * pop1(t, aA) : 0.9, hiB = t >= aB ? 1 + 0.12 * pop1(t, aB) : 0.9;
  let g = splitAB(t, hiA, hiB);
  g += KAIs({ x: 540, y: 2120, s: 1.35, expr: 'surprised', lx: t < aB ? -1 : 1, hl: t < aB ? [-260, -520] : [-150, -150], hr: t >= aB ? [260, -520] : [150, -150] });
  return { g, cam: [540, 960, 1.02] };
};
// 18 — comenta A ou B
S[18] = (t, d) => {
  let g = splitAB(t, 1 + 0.06 * Math.sin(t * 5), 1 + 0.06 * Math.sin(t * 5 + 3));
  g += KAIs({ x: 540, y: 2120, s: 1.35, expr: 'happy', hl: [-200, -560 + Math.sin(t * 8) * 30], hr: [200, -560 - Math.sin(t * 8) * 30] });
  return { g, cam: [540, 960, 1.02] };
};

function titleOverlay(t) {
  if (t > 5.4) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 5.0, 5.4);
  return G(`translate(540,170) scale(${k * out})`, R(-470, -95, 940, 190, 40, 'rgba(26,18,16,0.92)', 0) + T(0, 6, 'VOCÊ PREFERE...?', 92, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[18].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,170) scale(${k})`, R(-480, -110, 960, 220, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -30, 'COMENTA', 70, '#FFFFFF') + T(0, 52, 'A OU B?', 84, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
