// ================= "E se você SENTISSE quando alguém pensa em você?" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const kid2 = (o) => Object.assign({ pants: '#2E3A5C', shoe: '#2B2B2B', tie: null, hs: 1.2 }, o);
const BIA = kid2({ skin: '#D9A47A', shirt: '#2C9A8A', hair: 'curly', hairCol: '#3A2418' });
const LEO = kid2({ skin: '#F5D2B0', shirt: '#E07B39', hair: 'short', hairCol: '#8A5A3A', glasses: true });
const PAIG = Object.assign({}, PAI, { shirt: '#26324A', pants: '#1F2636', shoe: '#1A1A1A', collar: '#3A4A6A' });
const PAI_CAP = Object.assign({}, PAIG, { hair: 'cap' });
const AVO = { skin: '#F1C7A0', shirt: '#8E5A9A', pants: '#4A3A5C', hair: 'bun', hairCol: '#D9D6DE', shoe: '#5A2E3A', tie: null, glasses: true };
const findWn = (L, re, n) => { const ws = TL.lines[L].words; let c = 0; for (let i = 0; i < ws.length; i++) if (re.test(ws[i].text.toLowerCase())) { if (c === n) return wt(L, i); c++; } return 0; };
const at = (L, re, n = 0, pre = 0.2) => findWn(L, re, n) - pre;
// altura do peito de uma pessoa em pé (pés em y, escala s)
const chestY = (y, s) => y - 335 * s * 0.92;

// ---------------- efeitos
/** Brilho no peito: k = intensidade (0..1.4), col = cor (laranja quente, vermelho = dói, azul = frio). */
function chestGlow(x, y, k, t, col = '#FF8A2A', s = 1) {
  if (k <= 0) return '';
  const id = 'cg' + (ZID++), pul = 1 + 0.08 * Math.sin(t * 7);
  let g = `<radialGradient id="${id}"><stop offset="0" stop-color="#FFF4C8" stop-opacity="${Math.min(1, 0.95 * k)}"/><stop offset="0.35" stop-color="${col}" stop-opacity="${Math.min(0.9, 0.75 * k)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
  g += C(x, y, 190 * s * k * pul, `url(#${id})`, 0);
  if (k > 0.5) for (let i = 0; i < 3; i++) { const q = ((t * 0.7 + i / 3) % 1); g += `<path d="M${x - 50 * s + i * 50 * s},${y - 60 * s - q * 200 * s} q18,-22 0,-44 q-18,-22 0,-44" fill="none" stroke="${col}" stroke-width="${7 * s}" stroke-linecap="round" opacity="${(1 - q) * 0.8}"/>`; }
  return g;
}
/** Termômetro de "quente ou frio". */
function thermo(x, y, s, lvl, label, col = '#E8452A') {
  const h = 420, f = clamp(lvl, 0, 1);
  let g = R(-46, -h, 92, h, 46, '#FFFFFF', 8) + C(0, 40, 72, '#FFFFFF', 8);
  g += R(-26, -h + 20 + (h - 40) * (1 - f), 52, (h - 40) * f + 30, 26, col, 0) + C(0, 40, 54, col, 0);
  for (let i = 1; i < 5; i++) g += Ln(30, -i * 84, 46, -i * 84, O, 5);
  if (label) g += T(0, 170, label, 56, '#FFFFFF', 12);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function clockRed(x, y, s, txt = '03:17') { return G(`translate(${x},${y}) scale(${s})`, R(-150, -70, 300, 140, 26, '#1A1A20', 8) + R(-130, -52, 260, 104, 16, '#2A0E10', 0) + T(0, 24, txt, 74, '#FF3B30')); }
/** Porta do quarto com fresta de luz embaixo e (opcional) a sombra de dois pés. */
function roomDoor(x, y, s, feet = 0, crack = 0, inner = '') {
  let g = R(-170, -560, 340, 560, 8, '#6A4426', 9) + R(-150, -540, 300, 540, 4, '#7A4E2C', 0) + R(-120, -500, 240, 200, 6, 'rgba(0,0,0,0.12)', 0) + R(-120, -260, 240, 200, 6, 'rgba(0,0,0,0.12)', 0) + C(120, -270, 16, '#F2B636', 5);
  g += R(-160, -6, 320, 12, 3, '#FFE9A8', 0);
  if (feet > 0) g += `<g opacity="${feet}">` + E(-40, 2, 34, 8, '#1A1010', 0) + E(40, 2, 34, 8, '#1A1010', 0) + '</g>';
  if (crack > 0) g += R(-150, -540, 40 * crack, 540, 0, '#0A0A12', 0) + inner;
  return G(`translate(${x},${y}) scale(${s})`, g);
}
const BX = 690, BY = 1560, BS = 1.0, KCH = chestY(BY + 40 * BS, BS * 0.95) + 30;
function nightRoom(feet = 0) { return bedroom(0.6) + roomDoor(165, 1500, 0.95, feet) + clockRed(900, 760, 0.8); }
const kaiBed = (o) => kaiInBed(BX, BY, BS, o);
function bedroom(dark = 0.55) { let g = room('#3A4670', '#2A3352', 1500) + moonWin(600, 380); if (dark) g += R(-60, -60, 1200, 2200, 0, `rgba(8,10,30,${dark * 0.5})`, 0); return g; }
/** Kai sentado na cama (cobertor por cima das pernas). */
function kaiInBed(x, y, s, o = {}) { return bedNight(x, y, s, '#5A6FB0') + KAIs(Object.assign({ x: x - 40 * s, y: y + 40 * s, s: s * 0.95, legs: false }, o)) + blanket(x - 60 * s, y + 60 * s, s * 1.15, '#5A6FB0'); }
function hallway(dark = 0.4) {
  let g = room('#4A4060', '#3A3045', 1500);
  g += R(-60, 380, 160, 1120, 0, 'rgba(0,0,0,0.25)', 0) + R(980, 380, 160, 1120, 0, 'rgba(0,0,0,0.25)', 0);
  g += R(380, 300, 320, 60, 10, '#FFE9A8', 0) + C(540, 330, 60, 'rgba(255,233,168,0.25)', 0);
  if (dark) g += R(-60, -60, 1200, 2200, 0, `rgba(8,10,30,${dark})`, 0);
  return g;
}
function guardBooth() {
  let g = rays(0, '#141A33', '#2A3352') + stars(TNOW);
  g += R(-60, 1500, 1200, 700, 0, '#2A2F3A', 0) + R(560, 900, 420, 600, 14, '#3E4E6A', 9) + R(600, 960, 340, 220, 10, '#FFE9A8', 7) + T(770, 1260, 'PORTARIA', 46, '#FFE14D', 8);
  g += C(260, 600, 70, 'rgba(255,233,168,0.18)', 0) + Ln(260, 640, 260, 1500, '#5A6070', 14) + C(260, 600, 40, '#FFE9A8', 6);
  return g;
}
function crossOut(x, y, s, t, a0) { const k = pop1(t, a0, 0.18); if (k <= 0) return ''; return G(`translate(${x},${y}) scale(${k * s})`, Ln(-70, -70, 70, 70, O, 40) + Ln(70, -70, -70, 70, O, 40) + Ln(-70, -70, 70, 70, '#E04B3C', 24) + Ln(70, -70, -70, 70, '#E04B3C', 24)); }
function pen(x, y, s, rot = -20) { return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, R(-110, -16, 220, 32, 10, '#2C6FB6', 6) + P('M110,-16 L150,0 L110,16Z', '#F4E6D2', 5) + R(-110, -16, 30, 32, 6, '#1A1A20', 0)); }
function frost(x, y, k, s = 1) { if (k <= 0) return ''; let g = C(x, y, 120 * s * k, 'rgba(150,210,255,0.35)', 0); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g += Ln(x, y, x + Math.cos(a) * 80 * s * k, y + Math.sin(a) * 80 * s * k, '#D8F0FF', 7); } return g; }
function rewind(t) { let g = ''; for (let i = 0; i < 8; i++) { const y = ((i * 260 + t * 900) % 2100) - 100; g += R(-60, y, 1200, 6, 0, 'rgba(255,255,255,0.18)', 0); } return g + G('translate(900,300)', P('M0,-50 L-60,0 L0,50Z M60,-50 L0,0 L60,50Z', '#FFFFFF', 6)); }
function textBadge(x, y, k, txt, bg = '#1A1210', fg = '#FFE14D', size = 64, rot = -3) { if (k <= 0) return ''; const w = txt.length * size * 0.6 + 80; return G(`translate(${x},${y}) scale(${k}) rotate(${rot})`, R(-w / 2, -size * 0.85, w, size * 1.7, size * 0.5, bg, 8) + T(0, size * 0.32, txt, size, fg)); }

// ---------------- HUD: hora
const HORAS = { 0: '03:17', 2: '09:40', 3: '09:41', 4: '12:00', 5: '03:17', 6: '03:17', 10: '03:17', 11: '03:17', 12: '03:17', 13: '03:17', 14: '03:17', 15: '03:18', 16: '03:18', 17: '03:18' };
function levelHud(i, t) {
  const h = HORAS[i]; if (!h || (i === 0 && t < 5.5)) return '';
  const night = h.startsWith('03');
  return G('translate(540,110)', R(-130, -46, 260, 92, 30, night ? '#2A0E10' : '#1A1210', 7) + T(0, 20, h, 58, night ? '#FF5A4E' : '#FFE14D'));
}

const S = [];
// 0 — gancho: 03:17, o peito queimando; a sombra dos pés embaixo da porta (pista)
S[0] = (t, d) => {
  const aQ = at(0, /queimando/), aA = at(0, /alguém/);
  let g = nightRoom(1);
  g += kaiBed({ expr: t > aQ ? 'surprised' : 'worried', hl: [-60, -330], hr: [60, -300] });
  g += chestGlow(BX - 40, KCH, 1.0 + 0.25 * prog(t, aA, aA + 1), t, '#FF7A1A', 0.85);
  return { g, cam: [560, lerp(1150, 1120, eio(prog(t, 0, d))), lerp(1.18, 1.0, eio(prog(t, 0, d)))] };
};
// 1 — a regra: quem pensa em você esquenta o seu peito
S[1] = (t, d) => {
  const aQ = at(1, /quanto/), aM = at(1, /quente/);
  let g = rays(t, '#5A2A3A', '#F09A5A');
  const xs = [[200, 520], [880, 560], [540, 360]];
  xs.forEach(([x, y], i) => { const k = pop1(t, 0.5 + i * 0.5); if (k <= 0) return; g += G(`translate(${x},${y}) scale(${k})`, C(0, 0, 70, '#F4EAD8', 7) + T(0, 18, '?', 70, '#5A2A3A')) + `<path d="M${x},${y + 70} Q540,${(y + 1150) / 2} 540,1180" fill="none" stroke="#FFD27A" stroke-width="10" stroke-dasharray="20 16" opacity="${k}"/>`; });
  g += KAIs({ x: 540, y: 1900, s: 1.15, expr: t > aM ? 'surprised' : 'happy' }) + chestGlow(540, chestY(1900, 1.15), 0.5 + 0.7 * prog(t, aQ, aM + 0.5), t, '#FF7A1A', 1.1);
  g += thermo(900, 1250, 0.8, 0.2 + 0.75 * prog(t, aQ, aM + 0.5), '', '#E8452A');
  g += textBadge(540, 200, pop1(t, 1.2), 'PENSOU EM VOCÊ = CALOR', '#1A1210', '#FFE14D', 50);
  if (t > aQ) g += textBadge(540, 330, pop1(t, aQ), '+ AMOR = + QUENTE', '#C62A2A', '#FFFFFF', 54, 3);
  return { g, cam: [540, 1050, 1.0] };
};
// 2 — na escola: a Bia (calorzinho, corações)
S[2] = (t, d) => {
  const aB = at(2, /bia/), aD = at(2, /desmaia/);
  let g = classroom() + schoolDesk(540, 1640, 1.3);
  g += pp(BIA, { x: 540, y: 1720, s: 1.05, back: true });
  g += KAIs({ x: 540, y: 2350, s: 1.45, expr: t > aD ? 'happy' : 'surprised', hl: [-140, -200], hr: [140, -200] }) + chestGlow(540, chestY(2350, 1.45), 0.45, t, '#FF8A2A', 1.4);
  if (t > aB) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(380 + i * 110, 1350 - k * 300, 0.9 * (1 - k), '#FF5A8A'); }
  g += thermo(940, 1300, 0.6, 0.35, '', '#E8452A');
  return { g, cam: [540, lerp(1150, 1080, eio(prog(t, 0, d))), 1.0] };
};
// 3 — "você trouxe a minha caneta?" — era a caneta
S[3] = (t, d) => {
  const aE = at(3, /^era/);
  let g = classroom() + schoolDesk(540, 1640, 1.3);
  g += pp(BIA, { x: 540, y: 1760, s: 1.1, expr: 'happy', hr: [170, -300] }) + pen(760, 1100, 1.0 * pop1(t, 1.0));
  g += say(120, 560, 840, 'VOCÊ TROUXE A MINHA CANETA?', 48, 'right', '#FFFFFF', t, 0.3);
  g += KAIs({ x: 540, y: 2350, s: 1.45, expr: t > aE ? 'squish' : 'happy', lift: 0 }) + chestGlow(540, chestY(2350, 1.45), t > aE ? 0.15 : 0.45, t, '#FF8A2A', 1.4);
  g += thermo(940, 1300, 0.6, t > aE ? 0.08 : 0.35, '', '#E8452A');
  if (t > aE) g += textBadge(540, 380, pop1(t, aE), 'ERA A CANETA.', '#1A1210', '#FFFFFF', 64, -4);
  return { g, cam: [540, 1100, 1.0 + 0.06 * eio(prog(t, aE, d))] };
};
// 4 — meio-dia: a avó rezando; o calorzinho na escola
S[4] = (t, d) => {
  const aV = at(4, /avó/), aN = at(4, /nunca/);
  let top = kitchen('#F6E7C8', '#C98A5A') + pp(AVO, { x: 540, y: 1640, s: 1.3, expr: 'sleep', hl: [-30, -280], hr: [30, -280] }) + clockFace(880, 1060, 70, -Math.PI / 2, -Math.PI / 2, '12:00');
  for (let i = 0; i < 3; i++) { const k = ((t * 0.4 + i / 3) % 1); top += heart(440 + i * 100, 1180 - k * 260, 0.8 * (1 - k), '#FFB3C8'); }
  let bot = classroom() + KAIs({ x: 540, y: 2050, s: 1.2, expr: t > aN ? 'surprised' : 'happy' }) + chestGlow(540, chestY(2050, 1.2), 0.38, t, '#FFC27A', 1.2);
  let g = R(-60, -60, 1200, 2200, 0, '#1A1210', 0);
  g += clipG('<rect x="-60" y="-60" width="1200" height="1000"/>', G('translate(0,-660)', top)) + clipG('<rect x="-60" y="960" width="1200" height="1100"/>', G('translate(0,-120)', bot));
  g += Ln(-60, 950, 1140, 950, '#FFFFFF', 14);
  if (t > aV) g += textBadge(540, 860, pop1(t, aV), 'A VÓ, REZANDO', '#8E5A9A', '#FFFFFF', 52, -3);
  return { g, cam: [540, 960, 1.0] };
};
// 5 — "mas nada chega perto do que acontece às 03:17"
S[5] = (t, d) => {
  let g = R(-60, -60, 1200, 2200, 0, '#0A0B14', 0) + chestGlow(540, 1250, 1.1 + 0.2 * Math.sin(t * 5), t, '#FF5A1A', 1.6);
  g += G(`translate(540,780) scale(${pop1(t, 0.6) * (1 + 0.04 * Math.sin(t * 8))})`, T(0, 0, '03:17', 230, '#FF3B30', 22));
  return { g, cam: [540, 1000, 1.0 + 0.08 * eio(prog(t, 0, d))] };
};
// 6 — toda madrugada, no mesmo minuto (3 noites seguidas)
S[6] = (t, d) => {
  const n = Math.min(2, Math.floor(t / (d / 3)));
  let g = nightRoom(0);
  g += kaiBed({ expr: 'surprised', hl: [-60, -330], hr: [60, -300], hrot: [-8, 6, -4][n] });
  g += chestGlow(BX - 40, KCH, 1.1 + n * 0.12, t, '#FF6A1A', 0.85);
  g += textBadge(540, 640, 1, ['NOITE 1', 'NOITE 2', 'NOITE 3'][n], '#1A1210', '#FFFFFF', 58, n % 2 ? 3 : -3);
  return { g, cam: [560, 1150, 1.08 + n * 0.05] };
};
// 7 — investigação: Bia dormindo ✗, amigo dormindo ✗, mãe roncando ✗
S[7] = (t, d) => {
  const a = [at(7, /dormindo/, 0), at(7, /dormindo/, 1), at(7, /roncando/)];
  let g = rays(t, '#1E2A5A', '#3C4A7A') + textBadge(540, 200, pop1(t, 0.2), 'SUSPEITOS', '#FFE14D', '#1A1210', 70);
  const panels = [[BIA, 'BIA', 380], [LEO, 'MELHOR AMIGO', 900], [MAE, 'MÃE', 1420]];
  panels.forEach(([c, nm, y], i) => {
    const k = pop1(t, a[i] - 1.0, 0.3); if (k <= 0) return;
    g += memPanel(110, y - 200, 860, 440, k, R(0, 0, 860, 440, 0, '#2A3352', 0) + moonWin(560, 60) + lying(Object.assign({}, c, { expr: 'sleep' }), 330, 300, 0.75) + zzz(450, 200, t) + T(700, 380, nm, 48, '#FFFFFF', 8), 'p' + i, i % 2 ? 2 : -2);
    g += crossOut(860, y, 1.0, t, a[i] + 0.3);
  });
  return { g, cam: [540, 960, 1.0] };
};
// 8 — o pai: vigia noturno; não se falam desde a briga
S[8] = (t, d) => {
  const aV = at(8, /vigia/), aB = at(8, /briga/);
  let g = guardBooth() + pp(PAI_CAP, { x: 420, y: 1700, s: 1.15, expr: 'tired', hr: [140, -330] }) + G('translate(560,1030)', C(0, 0, 26, '#FFE9A8', 6));
  if (t > aV) g += textBadge(540, 330, pop1(t, aV), 'VIGIA NOTURNO', '#1A1210', '#FFE14D', 60);
  if (t > aB) g += textBadge(540, 470, pop1(t, aB), 'SEM SE FALAR', '#C62A2A', '#FFFFFF', 56, 3);
  return { g, cam: [540, 1080, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 9 — a briga (lembrança): "você não leva nada a sério" — porta batendo
S[9] = (t, d) => {
  const aB = at(9, /bateu/);
  let inner = kitchen('#F6E7C8', '#C98A5A') + pp(PAI, { x: 330, y: 1750, s: 1.1, expr: 'angry', hr: [220, -380] });
  inner += KAIs({ x: 800, y: 1760, s: 1.05, sx: -1, expr: t > aB ? 'angry' : 'sad' });
  inner += say(60, 520, 760, 'VOCÊ NÃO LEVA NADA A SÉRIO!', 46, 'right', '#FFFFFF', t, 0.4);
  let g = sepia(inner);
  if (t > aB) g += crash(540, 1050, t, aB, 'BAM!') + R(-60, -60, 1200, 2200, 0, `rgba(0,0,0,${0.3 * prog(t, aB, aB + 0.4)})`, 0);
  const sh = t > aB && t < aB + 0.4 ? Math.sin(t * 90) * 12 : 0;
  return { g, cam: [540 + sh, 1150, 1.0] };
};
// 10 — o calor fica mais forte… até doer
S[10] = (t, d) => {
  const aD = at(10, /doer/);
  let g = nightRoom(0);
  g += kaiBed({ expr: t > aD ? 'squish' : 'worried', hl: [10, -300], hr: [-10, -300] }) + sweatLines(BX - 40, KCH - 330, t);
  g += chestGlow(BX - 40, KCH, 1.2 + 0.3 * prog(t, 0, aD + 0.5), t, t > aD ? '#E8201A' : '#FF5A1A', 0.95);
  if (t > aD) g += textBadge(540, 360, pop1(t, aD), 'DÓI', '#C62A2A', '#FFFFFF', 110, -5);
  return { g, cam: [560, 1150, 1.0 + 0.12 * eio(prog(t, 0, d))] };
};
// 11 — você não dorme; segue o calor (quente ou frio)
S[11] = (t, d) => {
  const aS = at(11, /segue/), aJ = at(11, /jogo/);
  let g = nightRoom(0);
  if (t < aS) g += kaiBed({ expr: 'sus' }) + chestGlow(BX - 40, KCH, 1.0, t, '#FF6A1A', 0.85);
  else g += bedNight(BX, BY, BS, '#5A6FB0') + KAIs({ x: 520, y: 1920, s: 1.1, sx: -1, expr: 'sus', hl: [-200, -260] }) + chestGlow(520, chestY(1920, 1.1), 1.0, t, '#FF6A1A', 1.1);
  if (t > aJ) g += textBadge(540, 360, pop1(t, aJ), 'QUENTE OU FRIO?', '#1A1210', '#FFE14D', 66);
  return { g, cam: [540, 1150, 1.0] };
};
// 12 — morno… quente… FERVENDO
S[12] = (t, d) => {
  const a = [at(12, /quarto/), at(12, /corredor/), at(12, /porta/)];
  const st = t < a[1] ? 0 : t < a[2] ? 1 : 2;
  const lvl = [0.35, 0.65, 1.0][st], lab = ['MORNO', 'QUENTE', 'FERVENDO'][st];
  let g = st === 0 ? bedroom(0.6) : hallway(0.45);
  if (st === 2) g += roomDoor(540, 1500, 1.15, 1);
  g += KAIs({ x: st === 2 ? 820 : 540, y: 2050, s: 1.15, back: st !== 2, sx: st === 2 ? -1 : 1, expr: st === 2 ? 'surprised' : 'sus' }) + chestGlow(st === 2 ? 820 : 540, chestY(2050, 1.15), lvl * 1.2, t, '#FF5A1A', 1.1);
  if (st === 2) for (let i = 0; i < 4; i++) { const q = ((t * 0.6 + i / 4) % 1); g += `<path d="M${420 + i * 80},${1480 - q * 300} q16,-20 0,-40 q-16,-20 0,-40" fill="none" stroke="rgba(255,150,90,${0.8 * (1 - q)})" stroke-width="9"/>`; }
  g += thermo(150, 1250, 0.75, lvl, lab, '#E8452A');
  return { g, cam: [540, 1100, 1.0 + st * 0.03] };
};
// 13 — a frestinha: o pai, ainda de uniforme
S[13] = (t, d) => {
  const aP = at(13, /pai/);
  let inner = hallway(0.35) + pp(PAI_CAP, { x: 560, y: 1900, s: 1.2, expr: 'tired', lx: 1 });
  const open = 0.12 + 0.18 * prog(t, 0.3, 1.5);
  let g = R(-60, -60, 1200, 2200, 0, '#05060A', 0) + clipG(`<rect x="${540 - 600 * open}" y="-60" width="${1200 * open}" height="2200"/>`, inner) + R(540 + 600 * open, -60, 30, 2200, 0, '#6A4426', 0) + R(540 - 600 * open - 30, -60, 30, 2200, 0, '#6A4426', 0);
  if (t > aP) g += textBadge(540, 300, pop1(t, aP), 'PAI?!', '#FFE14D', '#1A1210', 80, -4);
  return { g, cam: [540, 1100, 1.0 + 0.1 * eio(prog(t, 0, d))] };
};
// 14 — ele chega às 03:15… e fica parado na sua porta, só olhando
S[14] = (t, d) => {
  const aC = at(14, /chega/), aO = at(14, /olhando/, 0, 0.4);
  if (t < aO) {
    let g = hallway(0.35) + roomDoor(780, 1500, 1.0, 0) + pp(PAI_CAP, { x: 380, y: 1900, s: 1.15, expr: 'tired', lx: 1 });
    if (t > aC) g += G(`translate(540,620) scale(${pop1(t, aC)})`, clockRed(0, 0, 1.0, '03:15') + T(0, 130, 'FIM DO TURNO', 44, '#FFFFFF', 8));
    return { g, cam: [540, 1150, 1.0] };
  }
  let g = hallway(0.35) + G('translate(540,1150) scale(2.3)', head(Object.assign({}, PAI_CAP, { expr: 'sad', lx: 1, blink: false })));
  return { g, cam: [540, 1150, 1.0 + 0.08 * eio(prog(t, aO, d))] };
};
// 15 — volta pra cama e pensa nele com toda a força (feixe atravessa a parede)
S[15] = (t, d) => {
  const aP = at(15, /pensa/), aF = at(15, /força/);
  let left = bedroom(0.55) + bedNight(560, 1560, 1.2, '#5A6FB0') + lying(Object.assign({}, KAI, { expr: 'sleep' }), 380, 1390, 1.0);
  let g = clipG('<rect x="-60" y="-60" width="640" height="2200"/>', G('translate(-120,0)', left)) + clipG('<rect x="600" y="-60" width="600" height="2200"/>', G('translate(380,0)', hallway(0.4) + pp(PAI_CAP, { x: 560, y: 1900, s: 1.0, expr: 'tired', lx: -1 })));
  g += R(570, -60, 40, 2200, 0, '#2A2238', 0);
  if (t > aP) { const k = prog(t, aP, aF + 0.4); g += `<path d="M340,1320 Q600,${1200 - 80 * Math.sin(t * 6)} ${340 + 620 * k},1240" fill="none" stroke="#FFD27A" stroke-width="${12 + 6 * Math.sin(t * 9)}" stroke-linecap="round" opacity="0.9"/>`; }
  if (t > aP) g += think(80, 600, 420, 'PAI…', 64, t, aP, 300, 1180);
  return { g, cam: [540, 1150, 1.0] };
};
// 16 — do outro lado, ele para e coloca a mão no peito
S[16] = (t, d) => {
  const aM = at(16, /mão/);
  let g = hallway(0.35) + roomDoor(820, 1500, 1.0, 0) + pp(PAI_CAP, { x: 460, y: 2000, s: 1.3, expr: t > aM ? 'surprised' : 'tired', lx: 1, hr: t > aM ? [-20, -260] : [150, -150] });
  g += chestGlow(460, chestY(2000, 1.3), t > aM ? 0.4 + 0.6 * prog(t, aM, aM + 1.2) : 0, t, '#FF8A2A', 1.3);
  return { g, cam: [480, lerp(1150, 1050, eio(prog(t, 0, d))), 1.0 + 0.12 * eio(prog(t, 0, d))] };
};
// 17 — ele também sente… todas essas noites, o peito dele ficou frio
S[17] = (t, d) => {
  const aT = at(17, /todas/), aF = at(17, /frio/, 0, 0.4);
  if (t < aT) {
    let g = hallway(0.3) + pp(PAI_CAP, { x: 540, y: 2100, s: 1.45, expr: 'sad', hr: [-20, -270] }) + chestGlow(540, chestY(2100, 1.45), 1.0, t, '#FF8A2A', 1.4) + tears(540, 1000, t, 0.9);
    g += textBadge(540, 330, pop1(t, 0.3), 'ELE TAMBÉM SENTE', '#1A1210', '#FFE14D', 58);
    return { g, cam: [540, 1150, 1.0] };
  }
  let g = R(-60, -60, 1200, 2200, 0, '#0E1828', 0);
  ['NOITE 1', 'NOITE 12', 'NOITE 40'].forEach((nl, i) => {
    const k = pop1(t, aT + i * 0.5, 0.3); if (k <= 0) return;
    g += memPanel(110, 260 + i * 520, 860, 460, k, R(0, 0, 860, 460, 0, '#2A2640', 0) + R(0, 400, 860, 60, 0, '#3A3045', 0) + roomDoor(640, 420, 0.62, 0) + pp(PAI_CAP, { x: 330, y: 440, s: 0.6, expr: 'tired', lx: 1 }) + frost(330, chestY(440, 0.6), 1, 0.6) + T(200, 70, nl, 46, '#D8F0FF', 8), 'n' + i, i % 2 ? 2 : -2);
  });
  if (t > aF) g += textBadge(540, 1700, pop1(t, aF), 'FRIO.', '#2C8FD6', '#FFFFFF', 110, -4);
  return { g, cam: [540, 960, 1.0] };
};
// 18 — volta pro começo… e olha embaixo da porta
S[18] = (t, d) => {
  let g = nightRoom(1) + kaiBed({ expr: 'surprised', hl: [-60, -330], hr: [60, -300] }) + chestGlow(BX - 40, KCH, 1.1, t, '#FF7A1A', 0.85);
  const k = pop1(t, 1.0, 0.3);
  if (k > 0) g += `<ellipse cx="165" cy="1500" rx="${200 * k}" ry="${90 * k}" fill="none" stroke="#FF2A2A" stroke-width="14"/>` + G(`translate(330,1300) rotate(-35) scale(${k})`, P('M0,0 L70,-30 L60,0 L70,30Z', '#FF2A2A', 6) + R(60, -10, 120, 20, 6, '#FF2A2A', 0));
  if (t < 0.9) g += rewind(t);
  return { g, cam: [lerp(560, 330, eio(prog(t, 0.9, 2.2))), lerp(1150, 1380, eio(prog(t, 0.9, 2.2))), lerp(1.0, 1.7, eio(prog(t, 0.9, 2.2)))] };
};
// 19 — CTA: café da manhã em silêncio, os dois peitos quentinhos
S[19] = (t, d) => {
  let g = kitchen('#F6E7C8', '#C98A5A') + table(540, 1560, 860);
  g += sitPerson(PAI, 300, 1400, 0.9, { expr: 'happy' }) + sitPerson(KAI, 780, 1400, 0.9, { expr: 'happy', sx: -1 });
  g += chestGlow(300, 1400 + 196 * 0.92 * 0.9 - 335 * 0.9 * 0.92, 0.5, t, '#FFB45A', 0.9) + chestGlow(780, 1400 + 196 * 0.92 * 0.9 - 335 * 0.9 * 0.92, 0.5, t, '#FFB45A', 0.9);
  g += mug(420, 1500, 0.8, t) + mug(660, 1500, 0.8, t);
  return { g, cam: [540, 1150, 1.0] };
};

function titleOverlay(t) {
  if (t > 5.4) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 5.0, 5.4);
  return G(`translate(540,250) scale(${k * out})`, R(-510, -140, 1020, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -40, 'E SE VOCÊ SENTISSE QUANDO', 52, '#FFFFFF') + T(0, 58, 'ALGUÉM PENSA EM VOCÊ?', 70, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[19].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,280) scale(${k})`, R(-510, -150, 1020, 300, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -48, 'QUEM PENSA EM VOCÊ', 70, '#FFFFFF') + T(0, 56, 'ÀS 3 DA MANHÃ?', 86, '#FFE14D'))
    + G(`translate(540,${1720 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
