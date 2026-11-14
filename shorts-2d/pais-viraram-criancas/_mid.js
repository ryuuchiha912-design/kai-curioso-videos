// ================= "No dia em que todos os pais viraram crianças" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const MAEk = Object.assign({}, MAE, { hs: 1.35 });                 // mãe criança
const PAIk = Object.assign({}, PAI, { hs: 1.35, mustache: false });  // pai criança
const KS = 0.6;                                                       // escala das crianças

function ageTag(txt) { return G('translate(540,110)', R(-170, -55, 340, 110, 34, '#1A1210', 8) + T(0, 6, txt, 58, '#FFE14D')); }
function levelHud(i, t) {
  const tag = i >= 1 && i <= 9 ? 'DIA 1' : i === 10 ? 'DIA 2' : i >= 11 && i <= 13 ? 'DIA 3' : i >= 14 && i <= 16 ? 'DIA 4' : i >= 17 && i <= 20 ? 'DIA 5' : i === 21 ? 'HOJE' : '';
  return tag ? ageTag(tag) : '';
}
// ---------------- objetos
function kitchen(wall = '#F6E7C8', floor = '#C98A5A', dark = 0) {
  let g = room(wall, floor, 1500);
  g += R(600, 1180, 520, 320, 10, '#E8DCC0', 8) + R(590, 1150, 540, 44, 8, '#B9874F', 8);           // balcão
  g += R(640, 1260, 200, 200, 8, '#D9CBA8', 6) + R(870, 1260, 200, 200, 8, '#D9CBA8', 6);
  g += R(620, 520, 460, 280, 10, '#B9874F', 8) + Ln(850, 520, 850, 800, O, 8) + C(830, 700, 12, '#F2B636', 5) + C(870, 700, 12, '#F2B636', 5); // armário alto
  g += R(80, 820, 280, 680, 30, '#DDE6EE', 8) + Ln(80, 1080, 360, 1080, O, 7) + Ln(320, 900, 320, 1020, O, 9);      // geladeira
  if (dark) g += R(-60, -60, 1200, 2200, 0, `rgba(10,14,40,${dark})`, 0);
  return g;
}
function chair(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-90, -180, 180, 30, 8, '#B9874F', 7) + Ln(-75, -150, -75, 0, O, 12) + Ln(75, -150, 75, 0, O, 12) + R(-80, -420, 160, 30, 8, '#B9874F', 7) + Ln(-70, -390, -70, -180, O, 10) + Ln(70, -390, 70, -180, O, 10)); }
function crash(x, y, t, at, txt = 'CRASH!') { const k = pop1(t, at, 0.2); if (k <= 0 || t > at + 1.6) return ''; return G(`translate(${x},${y}) scale(${k}) rotate(-8)`, star(0, 0, 150, 90, 12, '#FFE14D') + T(0, 8, txt, 52, '#C62A2A')); }
function tears(x, y, t, s = 1) { let g = ''; for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { const k = ((t * 0.9 + i * 0.5) % 1); g += G(`translate(${x + sx * 60 * s},${y + k * 160 * s}) scale(${s})`, `<g opacity="${(1 - k) * 0.95}">` + P('M0,-26 Q20,0 0,18 Q-20,0 0,-26Z', '#7FC6F0', 4) + '</g>'); } return g; }
function sneaker(x, y, s, t) {
  let g = E(0, 0, 90, 40, '#FFFFFF', 7) + R(-90, 10, 180, 20, 8, '#C62A2A', 6);
  g += P(`M-20,-20 Q${-80 + Math.sin(t * 3) * 10},-60 -110,-10 M10,-20 Q${70 + Math.sin(t * 3 + 1) * 10},-70 110,-6`, 'none', 0, 'stroke="#E04B3C" stroke-width="8" fill="none"');
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function bigX(x, y, s, t, at) { const k = pop1(t, at, 0.2); if (k <= 0) return ''; return G(`translate(${x},${y}) scale(${k * s})`, Ln(-60, -60, 60, 60, O, 40) + Ln(60, -60, -60, 60, O, 40) + Ln(-60, -60, 60, 60, '#E04B3C', 24) + Ln(60, -60, -60, 60, '#E04B3C', 24)); }
function candy(x, y, s, col = '#E04B3C') { return G(`translate(${x},${y}) scale(${s})`, P('M-70,-26 L-40,0 L-70,26Z', col, 6) + P('M70,-26 L40,0 L70,26Z', col, 6) + C(0, 0, 42, col, 7) + P('M-24,-24 L24,24 M-6,-36 L36,6', 'none', 0, 'stroke="#FFFFFF" stroke-width="8"')); }
function lolli(x, y, s, col = '#F2B636') { return G(`translate(${x},${y}) scale(${s})`, Ln(0, 0, 0, 150, O, 16) + Ln(0, 0, 0, 150, '#FFFFFF', 8) + C(0, 0, 60, col, 7) + P('M0,0 m-34,0 a34,34 0 1,1 34,34 a20,20 0 1,1 -20,-20', 'none', 0, 'stroke="#FFFFFF" stroke-width="8" fill="none"')); }
function table(x, y, w = 700) { return R(x - w / 2, y - 30, w, 40, 10, '#B9874F', 8) + Ln(x - w / 2 + 50, y + 10, x - w / 2 + 50, y + 260, O, 14) + Ln(x + w / 2 - 50, y + 10, x + w / 2 - 50, y + 260, O, 14); }
function stove(x, y) { return R(x - 220, y - 360, 440, 360, 12, '#E9ECEF', 8) + R(x - 230, y - 400, 460, 50, 10, '#5A6070', 8) + R(x - 160, y - 280, 320, 200, 14, '#3A3F4B', 7) + C(x - 120, y - 330, 14, '#E04B3C', 5) + C(x + 120, y - 330, 14, '#E04B3C', 5); }
function pot(x, y, s, burnt, t) {
  let g = R(-130, -110, 260, 120, 20, '#9AA3AD', 8) + R(-160, -100, 40, 26, 10, '#5A6070', 6) + R(120, -100, 40, 26, 10, '#5A6070', 6) + E(0, -110, 130, 22, burnt ? '#2A2220' : '#FFFFFF', 7);
  if (burnt) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += C(Math.sin(i * 2 + t) * 50, -150 - k * 380, 50 + k * 70, `rgba(50,46,44,${0.75 * (1 - k)})`, 0); }
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function bulb(x, y, s, on, t = 0) {
  let g = '';
  if (on) for (let i = 0; i < 3; i++) g += C(0, 20, 120 + i * 70 + Math.sin(t * 3) * 6, `rgba(255,226,122,${0.28 - i * 0.07})`, 0);
  g += Ln(0, -400, 0, -40, O, 8) + R(-24, -50, 48, 40, 8, '#9AA3AD', 6) + C(0, 20, 48, on ? '#FFE27A' : '#C9CCD3', 7);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function switchPlate(x, y, on) { return R(x - 40, y - 60, 80, 120, 12, '#FFFFFF', 7) + R(x - 14, on ? y - 40 : y, 28, 40, 8, '#9AA3AD', 5); }
function bedKid(x, y, s, col = '#F28FB0') { return G(`translate(${x},${y}) scale(${s})`, R(-300, -60, 600, 140, 24, '#B9874F', 8) + R(-340, -220, 60, 300, 14, '#8A5A3A', 8) + R(-270, -130, 170, 70, 30, '#FFFFFF', 7)); }
function plates(x, y, s, n = 5) { let g = ''; for (let i = 0; i < n; i++) g += E(0, -i * 26, 110, 26, i % 2 ? '#FFFFFF' : '#EAF4FB', 6); return G(`translate(${x},${y}) scale(${s})`, g + C(70, -n * 26, 16, 'rgba(255,255,255,0.8)', 3) + C(100, -n * 26 - 30, 10, 'rgba(255,255,255,0.8)', 3)); }
function shirtIcon(x, y, s, col = '#3E9B4A') { return G(`translate(${x},${y}) scale(${s})`, P('M-60,-90 L-130,-50 L-100,10 L-70,-6 L-70,100 L70,100 L70,-6 L100,10 L130,-50 L60,-90 Q0,-50 -60,-90Z', col, 8)); }
function schoolIcon(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-150, -120, 300, 220, 8, '#E07B39', 8) + P('M-170,-120 L0,-220 L170,-120Z', '#C62A2A', 8) + R(-40, 20, 80, 80, 6, '#7A4A2A', 6) + R(-120, -80, 60, 50, 6, '#BFE3F5', 5) + R(60, -80, 60, 50, 6, '#BFE3F5', 5) + C(0, -150, 26, '#FFFFFF', 5)); }
function mug(x, y, s, t) { let g = R(-50, -80, 100, 110, 16, '#FFFFFF', 7) + P('M50,-60 Q100,-40 50,0', 'none', 9); for (let i = 0; i < 2; i++) { const k = ((t * 0.6 + i * 0.5) % 1); g += P(`M${-14 + i * 28},${-100 - k * 90} q16,-20 0,-40 q-16,-20 0,-40`, 'none', 0, `stroke="rgba(255,255,255,${1 - k})" stroke-width="8" fill="none"`); } return G(`translate(${x},${y}) scale(${s})`, g); }
function coffeePot(x, y, s, rot = 0) { return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, P('M-60,-140 L60,-140 L80,40 L-80,40Z', '#3A3F4B', 8) + R(-70, -170, 140, 40, 12, '#5A6070', 7) + P('M80,-110 Q150,-70 90,0', 'none', 12) + P('M-80,-100 L-130,-130 L-90,-70', '#3A3F4B', 7)); }
function sun(x, y, r, t) { let g = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.2; g += Ln(x + Math.cos(a) * (r + 20), y + Math.sin(a) * (r + 20), x + Math.cos(a) * (r + 60), y + Math.sin(a) * (r + 60), '#F2B636', 12); } return g + C(x, y, r, '#FFE14D', 8); }
function stars(t) { let g = ''; const r = rng(7); for (let i = 0; i < 22; i++) { const x = r() * 1080, y = r() * 900; g += C(x, y, 4 + 3 * Math.sin(t * 2 + i), '#F4F1EA', 0); } return g; }
function nightWin(x, y) { return windowFrame(x, y, 300, 320, '#1C2A55') + C(x + 210, y + 90, 40, '#F4F1EA', 6); }
/** Kai sentado no chão (abraçando os joelhos). */
function kaiSit(x, y, s, expr, t) {
  let g = G(`translate(${x},${y}) scale(${s})`, limb(-42, -60, -120, -150, KAI.pants, 46) + limb(-120, -150, -130, -10, KAI.pants, 44) + limb(42, -60, 120, -150, KAI.pants, 46) + limb(120, -150, 130, -10, KAI.pants, 44)
    + E(-140, -10, 50, 24, KAI.shoe) + E(140, -10, 50, 24, KAI.shoe));
  g += person(Object.assign({}, KAI, { x, y: y + 90 * s, s, legs: false, expr, hl: [-120, -160], hr: [120, -160] }));
  return g;
}
/** Painel de lembrança (sépia). */
function memPanel(x, y, w, h, k, inner, id, rot = 0) {
  if (k <= 0) return '';
  return G(`translate(${x + w / 2},${y + h / 2}) scale(${k}) rotate(${rot}) translate(${-w / 2},${-h / 2})`, R(0, 0, w, h, 20, '#F4EAD8', 10) + `<clipPath id="mp${id}"><rect x="12" y="12" width="${w - 24}" height="${h - 24}"/></clipPath><g clip-path="url(#mp${id})">` + inner + '</g>');
}

const S = [];
// 0 — gancho: os pais viraram crianças; eu tinha 16
S[0] = (t, d) => {
  const aV = findW(0, /viraram/) - 0.15, aD = findW(0, /dezesseis/) - 0.15;
  let g = rays(t, '#5B4A9A', '#F0A070');
  const sh = t > aV ? pop1(t, aV, 0.35) : 0;
  const ms = lerp(1.0, KS, sh), ps = lerp(1.05, KS, sh);
  g += pp(t > aV ? MAEk : MAE, { x: 210, y: 1880, s: ms * 1.0, expr: t > aV ? 'happy' : 'neutral', hr: [150, -330] });
  g += pp(t > aV ? PAIk : PAI, { x: 870, y: 1880, s: ps, sx: -1, expr: t > aV ? 'happy' : 'neutral', hr: [150, -330] });
  if (t > aV && t < aV + 0.6) g += star(210, 1880 - 500 * ms, 120, 60, 10, 'rgba(255,240,150,0.9)') + star(870, 1880 - 500 * ps, 120, 60, 10, 'rgba(255,240,150,0.9)');
  g += KAIs({ x: 540, y: 1960, s: 1.05, expr: 'surprised', hl: [-160, -330], hr: [160, -330] });
  g += G(`translate(540,640) scale(${pop1(t, aD)}) rotate(-4)`, R(-230, -70, 460, 140, 34, '#FFFFFF', 8) + T(0, 6, 'EU: 16 ANOS', 66, '#C62A2A'));
  return { g, cam: [540, 1100, 1 + 0.04 * eio(prog(t, 0, d))] };
};
// 1 — barulho na cozinha: a mãe com 6 anos tentando alcançar o armário
S[1] = (t, d) => {
  const aB = findW(1, /barulho/) - 0.15, aE = findW(1, /^era/) - 0.15, aS = findW(1, /seis/) - 0.15;
  let g = kitchen();
  const pk = prog(t, aB, aB + 0.4);
  g += chair(760, 1500, 0.9);
  g += pp(MAEk, { x: 760, y: 1500 - 160 * 0.9, s: KS, expr: t > aE + 0.8 ? 'worried' : 'neutral', hr: [130, -560 + Math.sin(t * 6) * 20], hl: [-120, -300], lift: Math.max(0, Math.sin(t * 5)) * 20 });
  g += pan(lerp(900, 980, pk), lerp(820, 1480, eout(pk)), 0.9);
  g += crash(960, 1300, t, aB + 0.35);
  if (t > aE) g += KAIs({ x: 230, y: 1900, s: 1.0, expr: 'surprised', hl: [-160, -300], hr: [160, -300] });
  g += G(`translate(760,1060) scale(${pop1(t, aS)}) rotate(6)`, R(-130, -50, 260, 100, 26, '#1A1210', 0) + T(0, 6, '6 ANOS', 54, '#FFE14D'));
  return { g, cam: [lerp(700, 560, eio(prog(t, aE - 0.4, aE + 0.4))), 1180, 1.0] };
};
// 2 — o pai com 7, chorando porque não sabia amarrar o tênis
S[2] = (t, d) => {
  const aC = findW(2, /chorando/) - 0.15, aS = findW(2, /sete/) - 0.15, aT = findW(2, /tênis/) - 0.2;
  let g = room('#CFE3C8', '#B9874F', 1500) + windowFrame(640, 560, 340, 300, '#BFE3F5') + sofa(540, 1460, 1.15);
  g += pp(PAIk, { x: 540, y: 1430, s: KS, expr: t > aC ? 'sad' : 'worried', hl: [-110, -120], hr: [110, -120] });
  if (t > aC) g += tears(540, 1430 - 520 * KS - 40, t, 0.8);
  g += sneaker(700, 1560, 0.8, t) + (t > aT ? G(`translate(700,1500) scale(${pop1(t, aT)})`, T(0, -80, '?', 110, '#FFFFFF', 10)) : '');
  g += G(`translate(330,860) scale(${pop1(t, aS)}) rotate(-6)`, R(-130, -50, 260, 100, 26, '#1A1210', 0) + T(0, 6, '7 ANOS', 54, '#FFE14D'));
  return { g, cam: [540, 1200, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 3 — no começo eu ri: sem castigo, sem "vai arrumar o quarto"
S[3] = (t, d) => {
  const aR = findW(3, /^ri/) - 0.15, aC = findW(3, /castigo/) - 0.15, aQ = findW(3, /quarto/) - 0.25;
  let g = rays(t, '#F08A4A', '#F9D9A0');
  g += KAIs({ x: 540, y: 1950, s: 1.15, expr: t > aR ? 'happy' : 'neutral', hl: [-200, -470 + Math.sin(t * 9) * 20], hr: [200, -470 + Math.cos(t * 9) * 20], lift: Math.abs(Math.sin(t * 5)) * 30 });
  g += G(`translate(540,520) scale(${pop1(t, aC)}) rotate(-3)`, R(-300, -70, 600, 140, 30, '#FFFFFF', 8) + T(0, 6, 'CASTIGO', 70, '#1A1210')) + bigX(540, 520, 1.3, t, aC + 0.35);
  g += G(`translate(540,780) scale(${pop1(t, aQ - 0.3)}) rotate(3)`, R(-380, -70, 760, 140, 30, '#FFFFFF', 8) + T(0, 6, 'ARRUMAR O QUARTO', 62, '#1A1210')) + bigX(540, 780, 1.3, t, aQ + 0.1);
  return { g, cam: [540, 1050, 1.0] };
};
// 4 — "Você é o adulto agora?"
S[4] = (t, d) => {
  const aO = findW(4, /olhou/) - 0.15, aV = findW(4, /você/) - 0.2;
  let g = room('#CFE3C8', '#B9874F', 1500);
  g += pp(PAIk, { x: 330, y: 1880, s: KS * 1.1, expr: 'neutral', lx: 1, hr: [140, -260], hl: [-120, -200] });
  g += KAIs({ x: 760, y: 1880, s: 1.05, expr: t > aV + 0.8 ? 'worried' : 'neutral', lx: -1 });
  g += say(60, 700, 620, 'VOCÊ É O ADULTO', 46, 'left', '#FFFFFF', t, aV) + (t > aV ? T(370, 890, 'AGORA?', 50, '#FFFFFF', 12) : '');
  const z = eio(prog(t, aO, d));
  return { g, cam: [lerp(540, 480, z), lerp(1180, 1240, z), lerp(1.0, 1.15, z)] };
};
// 5 — doce no café da manhã; às dez, dor de barriga
S[5] = (t, d) => {
  const aDz = findW(5, /^dez/) - 0.2;
  const sick = t > aDz;
  let g = room(sick ? '#C8D8B0' : '#F6E3EC', '#C98A5A', 1500) + clockFace(880, 520, 100, -Math.PI / 2 + (sick ? Math.PI * 2 * 10 / 12 : Math.PI * 2 * 7 / 12) - Math.PI * 2, -Math.PI / 2, sick ? '10:00' : '07:00');
  g += table(540, 1420, 820);
  if (!sick) { g += candy(330, 1370, 0.8) + candy(560, 1370, 0.7, '#3F86CF') + lolli(740, 1240, 0.8) + candy(820, 1380, 0.6, '#3E9B4A') + candy(450, 1330, 0.55, '#C2577A'); }
  else g += P('M200,1390 L260,1380 M600,1385 L640,1392', 'none', 6);
  const bel = [[-60, -150], [60, -150]];
  g += pp(MAEk, { x: 330, y: 1880, s: KS, expr: sick ? 'sad' : 'happy', hl: sick ? bel[0] : [-130, -420], hr: sick ? bel[1] : [130, -420] });
  g += pp(PAIk, { x: 740, y: 1880, s: KS, sx: -1, expr: sick ? 'sad' : 'happy', hl: sick ? bel[0] : [-130, -420], hr: sick ? bel[1] : [130, -420] });
  if (sick) for (const x of [330, 740]) g += P(`M${x - 40},${1880 - 210 * KS} q20,-20 40,0 t40,0`, 'none', 0, 'stroke="#4CAF50" stroke-width="8" fill="none"') + G(`translate(${x},${1150}) scale(${pop1(t, aDz + 0.2)})`, T(0, 0, 'AI!', 70, '#E04B3C', 10));
  return { g, cam: [540, 1180, 1.0] };
};
// 6 — eu tive que fazer a comida: queimei o arroz duas vezes
S[6] = (t, d) => {
  const aQ = findW(6, /queimei/) - 0.15, aD = findW(6, /duas/) - 0.15;
  let g = kitchen('#F6E7C8', '#C98A5A') + stove(560, 1500) + pot(560, 1100, 1.0, t > aQ, t);
  g += KAIs({ x: 230, y: 1900, s: 1.0, expr: t > aQ ? 'worried' : 'neutral', sweat: t > aQ, hl: [-150, -300], hr: [200, -330] });
  if (t > aQ) g += R(-60, -60, 1200, 2200, 0, `rgba(60,55,50,${0.25 * prog(t, aQ, aQ + 1)})`, 0);
  g += G(`translate(800,640) scale(${pop1(t, aD)}) rotate(-8)`, star(0, 0, 150, 100, 12, '#FFE14D') + T(0, 10, '2X', 90, '#C62A2A'));
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 7 — ela comeu mesmo assim: "tá gostoso!"; ela mentiu, do jeito que eu mentia pra ela
S[7] = (t, d) => {
  const aT = findW(7, /^tá/) - 0.2, aM = findW(7, /mentiu/) - 0.15, aJ = findW(7, /jeito/) - 0.2;
  if (t < aJ) {
    let g = room('#F6E7C8', '#C98A5A', 1500) + table(540, 1400, 700) + E(540, 1360, 160, 40, '#FFFFFF', 7) + E(540, 1345, 110, 22, '#2A2220', 0);
    g += pp(MAEk, { x: 540, y: 1880, s: KS * 1.1, expr: t > aT ? 'happy' : 'neutral', hr: [110, -440], hl: [-120, -260] }) + Ln(540 + 110 * KS * 1.1, 1880 - 440 * KS * 1.1, 540 + 110 * KS * 1.1 - 40, 1880 - 440 * KS * 1.1 + 60, '#9AA3AD', 10);
    g += say(560, 600, 460, 'TÁ GOSTOSO!', 54, 'left', '#FFFFFF', t, aT);
    g += G(`translate(300,620) scale(${pop1(t, aM)}) rotate(-6)`, R(-200, -55, 400, 110, 26, '#1A1210', 0) + T(0, 6, 'MENTIRA', 58, '#FFE14D'));
    return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, aJ))] };
  }
  // lembrança: Kai pequeno dizendo o mesmo pra mãe
  let inner = R(0, 0, 900, 900, 0, '#F6E7C8', 0) + R(0, 640, 900, 300, 0, '#C98A5A', 0) + E(450, 600, 150, 36, '#FFFFFF', 6) + E(450, 590, 90, 18, '#7A4A2A', 0);
  inner += person(Object.assign({}, KAI, { x: 260, y: 900, s: 0.55, hs: 1.3, expr: 'happy' })) + pp(MAE, { x: 660, y: 900, s: 0.8, sx: -1, expr: 'happy' });
  inner += bubble(40, 60, 440, 120, 'TÁ GOSTOSO!', 46, 'left');
  let g = rays(t, '#B98C6A', '#E6C9A0') + sepia(memPanel(90, 480, 900, 900, pop1(t, aJ, 0.3) * (1 + 0.04 * prog(t, aJ, d)), inner, 7, -2));
  return { g, cam: [540, 960, 1.0] };
};
// 8 — na hora de dormir: "deixa a luz acesa? eu tenho medo do escuro"
S[8] = (t, d) => {
  const aD = findW(8, /deixa/) - 0.2, aE = findW(8, /^eu/) - 0.2;
  let g = room('#3A4670', '#2A3352', 1500) + nightWin(640, 520) + bedKid(560, 1500, 1.0) + blanket(560, 1440, 1.0, '#F28FB0');
  g += lying(Object.assign({}, MAEk, { expr: 'worried', lx: 1 }), 380, 1340, 0.55);
  g += switchPlate(980, 1100, false);
  g += KAIs({ x: 900, y: 1900, s: 1.0, expr: 'neutral', sx: -1, hr: [150, -460] });
  g += say(80, 640, 560, 'DEIXA A LUZ ACESA?', 44, 'left', '#FFFFFF', t, aD);
  g += say(80, 860, 640, 'EU TENHO MEDO DO ESCURO.', 38, 'left', '#FFFFFF', t, aE);
  return { g, cam: [540, 1180, 1.0] };
};
// 9 — eu nunca soube que a minha mãe tinha medo do escuro
S[9] = (t, d) => {
  let g = room('#3A4670', '#2A3352', 1500) + bedKid(560, 1500, 1.0) + blanket(560, 1440, 1.0, '#F28FB0') + bulb(540, 520, 1.0, true, t);
  g += lying(Object.assign({}, MAEk, { expr: 'sleep' }), 380, 1340, 0.55) + zzz(460, 1200, t);
  g += switchPlate(980, 1100, true);
  g += KAIs({ x: 880, y: 1900, s: 1.0, expr: 'sad', lx: -1 });
  return { g, cam: [lerp(540, 700, eio(prog(t, 0, d))), lerp(1180, 1300, eio(prog(t, 0, d))), lerp(1.0, 1.25, eio(prog(t, 0, d)))] };
};
// 10 — o pai caiu e ralou o joelho; eu peguei no colo e soprei, como ele fazia comigo
S[10] = (t, d) => {
  const aC = findW(10, /caiu/) - 0.15, aP = findW(10, /peguei/) - 0.15, aS = findW(10, /soprei/) - 0.15, aF = findW(10, /^jeito/) - 0.25;
  if (t < aF) {
    let g = R(-60, -60, 1200, 1600, 0, '#BFE3F5', 0) + sun(900, 300, 70, t) + R(-60, 1450, 1200, 700, 0, '#7CB65A', 8) + R(60, 1100, 20, 360, 4, '#B9874F', 6) + R(-60, 1180, 400, 20, 4, '#B9874F', 6) + R(-60, 1300, 400, 20, 4, '#B9874F', 6);
    if (t < aP) {
      const fall = prog(t, aC, aC + 0.35);
      g += pp(PAIk, { x: 560, y: 1800, s: KS, rot: 80 * eout(fall), expr: t > aC + 0.3 ? 'sad' : 'happy', hl: [-160, -330], hr: [160, -330] });
      if (t > aC + 0.3) g += tears(560 + 260 * KS, 1800 - 130, t, 0.6) + crash(700, 1540, t, aC + 0.3, 'AI!');
      g += KAIs({ x: 900, y: 1900, s: 1.0, sx: -1, expr: t > aC ? 'surprised' : 'neutral' });
    } else {
      g += KAIs({ x: 560, y: 1900, s: 1.05, expr: t > aS ? 'neutral' : 'worried', hl: [-130, -330], hr: [130, -330] });
      g += pp(PAIk, { x: 520, y: 1900 - 330 * 1.05 + 40, s: KS * 0.85, rot: -70, expr: 'sad', hl: [-140, -200], hr: [140, -260] });
      g += C(400, 1520, 16, '#E04B3C', 5);
      if (t > aS) for (let i = 0; i < 3; i++) { const k = ((t * 1.4 + i / 3) % 1); g += P(`M${520 - k * 90},${1330 + i * 26 + k * 40} q-20,-10 -40,0`, 'none', 0, `stroke="rgba(255,255,255,${1 - k})" stroke-width="9" fill="none"`); }
    }
    return { g, cam: [540, 1200, 1.0] };
  }
  // lembrança: o pai adulto soprando o joelho do Kai pequeno
  let inner = R(0, 0, 900, 900, 0, '#BFE3F5', 0) + R(0, 620, 900, 300, 0, '#7CB65A', 0);
  inner += pp(PAI, { x: 560, y: 900, s: 0.8, sx: -1, expr: 'happy', hl: [-140, -200], hr: [140, -200] }) + person(Object.assign({}, KAI, { x: 300, y: 900, s: 0.5, hs: 1.3, expr: 'sad' }));
  for (let i = 0; i < 3; i++) inner += P(`M${450 - i * 10},${640 + i * 24} q-20,-10 -40,0`, 'none', 0, 'stroke="#FFFFFF" stroke-width="8" fill="none"');
  let g = rays(t, '#B98C6A', '#E6C9A0') + sepia(memPanel(90, 480, 900, 900, pop1(t, aF, 0.3) * (1 + 0.04 * prog(t, aF, d)), inner, 10, 2));
  return { g, cam: [540, 960, 1.0] };
};
// 11 — terceiro dia: exausto. louça, roupa, escola. ninguém agradeceu.
S[11] = (t, d) => {
  const aL = findW(11, /louça/) - 0.15, aR = findW(11, /roupa/) - 0.15, aE = findW(11, /escola/) - 0.15, aN = findW(11, /ninguém/) - 0.15;
  let g = rays(t, '#56607E', '#A9A3BC');
  g += KAIs({ x: 540, y: 1950, s: 1.05, expr: 'tired', sweat: true, hl: [-140, -130], hr: [140, -130], rot: Math.sin(t * 2) * 3 });
  g += battery(540, 380, 1.3, lerp(0.6, 0.05, prog(t, 0, aN)));
  g += G(`translate(220,760) scale(${pop1(t, aL)})`, plates(0, 60, 0.9)) + G(`translate(540,700) scale(${pop1(t, aR)})`, shirtIcon(0, 0, 0.8)) + G(`translate(860,760) scale(${pop1(t, aE)})`, schoolIcon(0, 40, 0.65));
  for (const [a, x] of [[aL, 220], [aR, 540], [aE, 860]]) if (t > a + 0.5) g += check(x + 90, 640, 0.8);
  g += G(`translate(540,1060) scale(${pop1(t, aN)}) rotate(-3)`, R(-330, -60, 660, 120, 28, '#1A1210', 0) + T(0, 6, 'OBRIGADO: 0', 62, '#FFE14D'));
  return { g, cam: [540, 1050, 1.0] };
};
// 12 — e aí eu entendi: ela fazia isso todo dia. há 16 anos. e eu nunca agradeci.
S[12] = (t, d) => {
  const aM = findW(12, /minha/) - 0.15, aT = findW(12, /todo/) - 0.15, aH = findW(12, /dezesseis/) - 0.2, aN = findW(12, /nunca/) - 0.2;
  let g = R(-60, -60, 1200, 2100, 0, '#C9A57A', 0);
  const pans = [
    (k) => R(0, 0, 440, 440, 0, '#F6E7C8', 0) + plates(300, 360, 0.7) + pp(MAE, { x: 160, y: 470, s: 0.5, expr: 'tired', hr: [140, -200] }),
    (k) => R(0, 0, 440, 440, 0, '#CFE3C8', 0) + pp(MAE, { x: 240, y: 470, s: 0.5, expr: 'happy', hl: [-120, -230], hr: [120, -230] }) + person(Object.assign({}, KAI, { x: 240, y: 300, s: 0.28, hs: 1.3, expr: 'sleep', legs: false })),
    (k) => R(0, 0, 440, 440, 0, '#F6E7C8', 0) + stove(260, 440) + pot(260, 230, 0.5, false, t) + pp(MAE, { x: 90, y: 470, s: 0.5, expr: 'neutral' }),
    (k) => R(0, 0, 440, 440, 0, '#3A4670', 0) + bulb(220, 120, 0.4, true, t) + pp(MAE, { x: 220, y: 470, s: 0.5, expr: 'tired', hl: [-120, -120], hr: [120, -120] }),
  ];
  const ats = [aM, aM + 0.6, aT, aT + 0.5];
  pans.forEach((fn, i) => { g += memPanel(i % 2 ? 580 : 60, 260 + Math.floor(i / 2) * 520, 440, 470, pop1(t, ats[i], 0.3), fn(), 'r' + i, i % 2 ? 2 : -2); });
  g = sepia(g);
  g += G(`translate(540,1340) scale(${pop1(t, aH)}) rotate(-4)`, R(-280, -80, 560, 160, 36, '#C62A2A', 9) + T(0, 8, '16 ANOS', 96, '#FFFFFF'));
  if (t > aN) g += R(-60, -60, 1200, 2100, 0, `rgba(10,10,20,${0.55 * prog(t, aN, aN + 0.5)})`, 0) + G(`translate(540,960) scale(${pop1(t, aN + 0.1)})`, R(-380, -80, 760, 160, 36, '#FFFFFF', 9) + T(0, 8, 'NUNCA AGRADECI', 72, '#1A1210'));
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, 0, d))] };
};
// 13 — sentei no chão da cozinha e chorei
S[13] = (t, d) => {
  const aC = findW(13, /chorei/) - 0.2;
  let g = kitchen('#F6E7C8', '#C98A5A', 0.55);
  g += kaiSit(540, 1720, 1.05, t > aC ? 'sad' : 'tired', t);
  if (t > aC) g += tears(540, 1720 + 90 * 1.05 - (268 + 120 * KAI.hs) * 1.05 + 40, t, 0.9);
  return { g, cam: [540, lerp(1200, 1300, eio(prog(t, 0, d))), lerp(1.0, 1.15, eio(prog(t, 0, d)))] };
};
// 14 — quarta noite: ela me abraçou: "você vai cuidar da gente pra sempre?"
S[14] = (t, d) => {
  const aA = findW(14, /abraçou/) - 0.2, aV = findW(14, /você/) - 0.2, aS = findW(14, /sempre/) - 0.2;
  let g = room('#3A4670', '#2A3352', 1500) + nightWin(80, 480) + bulb(800, 420, 0.8, true, t);
  const hug = prog(t, aA, aA + 0.5);
  g += KAIs({ x: 640, y: 1980, s: 1.05, expr: 'sad', legs: false, hl: [-150, -260], hr: [150, -260] });
  g += pp(MAEk, { x: lerp(300, 470, eio(hug)), y: 1900, s: KS * 1.05, expr: 'sad', hr: [lerp(120, 200, hug), lerp(-300, -440, hug)], hl: [-120, -300] });
  g += say(60, 560, 700, 'VOCÊ VAI CUIDAR DA GENTE', 40, 'left', '#FFFFFF', t, aV);
  if (t > aS) g += say(220, 760, 400, 'PRA SEMPRE?', 48, 'left', '#FFFFFF', t, aS);
  return { g, cam: [540, 1180, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 15 — "Vou." a primeira promessa de adulto
S[15] = (t, d) => {
  const aV = findW(15, /vou/) - 0.2, aP = findW(15, /primeira/) - 0.2;
  let g = rays(t, '#3B5FA8', '#E8A88A');
  g += KAIs({ x: 540, y: 2350, s: 1.7, expr: 'neutral' });
  g += say(600, 420, 360, 'VOU.', 80, 'left', '#FFFFFF', t, aV);
  g += G(`translate(540,1180) scale(${pop1(t, aP)}) rotate(-3)`, R(-430, -110, 860, 220, 36, '#1A1210', 0) + T(0, -30, '1ª PROMESSA', 70, '#FFE14D') + T(0, 52, 'DE ADULTO', 60, '#FFFFFF'));
  return { g, cam: [540, 960, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 16 — naquela noite, dormi no chão do quarto deles. com a luz acesa.
S[16] = (t, d) => {
  const aL = findW(16, /luz/) - 0.2;
  let g = room('#3A4670', '#2A3352', 1450) + nightWin(660, 400) + bulb(300, 380, 0.8, t > aL, t);
  g += bedKid(560, 1330, 1.1) + blanket(560, 1270, 1.1, '#7A90C8');
  g += lying(Object.assign({}, MAEk, { expr: 'sleep' }), 340, 1150, 0.5) + lying(Object.assign({}, PAIk, { expr: 'sleep' }), 470, 1170, 0.5);
  g += lying(Object.assign({}, KAI, { expr: 'sleep' }), 230, 1700, 0.62) + P('M300,1660 Q620,1610 960,1680 L960,1780 L300,1780Z', '#C2577A', 8);
  g += zzz(520, 1050, t) + zzz(330, 1580, t + 0.4);
  if (t < aL) g += R(-60, -60, 1200, 2100, 0, 'rgba(5,8,25,0.45)', 0);
  return { g, cam: [540, 1250, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 17 — manhã seguinte: tudo normal. a mãe do tamanho certo, passando café.
S[17] = (t, d) => {
  const aN = findW(17, /normal/) - 0.2, aM = findW(17, /minha/) - 0.2;
  let g = kitchen('#FFF1D6', '#C98A5A') + windowFrame(380, 520, 220, 220, '#BFE3F5') + C(540, 580, 36, '#FFE14D', 6);
  g += R(-60, -60, 1200, 2200, 0, `rgba(255,230,160,${0.25 * Math.sin(prog(t, 0, d) * Math.PI)})`, 0);
  g += pp(MAE, { x: 820, y: 1900, s: 1.05, sx: -1, expr: 'neutral', hr: [170, -380], hl: [-140, -320] }) + coffeePot(990, 1180, 0.7, -25) + mug(700, 1130, 0.7, t);
  g += KAIs({ x: 250, y: 1900, s: 1.0, expr: t > aM ? 'surprised' : 'sleep' });
  g += G(`translate(560,900) scale(${pop1(t, aN)}) rotate(-4)`, R(-220, -55, 440, 110, 26, '#1A1210', 0) + T(0, 6, 'NORMAL?', 58, '#FFE14D'));
  return { g, cam: [540, 1180, 1.0] };
};
// 18 — "Bom dia, filho. Dormiu bem?"
S[18] = (t, d) => {
  const aB = findW(18, /bom/) - 0.2, aD = findW(18, /dormiu/) - 0.2;
  let g = kitchen('#FFF1D6', '#C98A5A') + mug(900, 1130, 0.7, t);
  g += pp(MAE, { x: 680, y: 2050, s: 1.35, sx: -1, expr: 'happy', hr: [170, -300] });
  g += say(80, 560, 520, 'BOM DIA, FILHO.', 50, 'right', '#FFFFFF', t, aB);
  g += say(160, 780, 440, 'DORMIU BEM?', 50, 'right', '#FFFFFF', t, aD);
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 19 — eu atravessei a cozinha e abracei ela por muito tempo
S[19] = (t, d) => {
  const aA = findW(19, /abracei/) - 0.2;
  const walk = prog(t, 0.2, aA);
  if (t < aA) {
    let g = kitchen('#FFF1D6', '#C98A5A');
    g += pp(MAE, { x: 780, y: 1900, s: 1.05, sx: -1, expr: 'neutral' });
    g += KAIs({ x: lerp(150, 560, eio(walk)), y: 1900 - Math.abs(Math.sin(walk * 14)) * 14, s: 1.0, expr: 'sad', hl: [-170, -250], hr: [170, -250] });
    return { g, cam: [lerp(400, 640, eio(walk)), 1180, 1.0] };
  }
  let g = rays(t, '#C9708A', '#F7C99A');
  g += pp(MAE, { x: 600, y: 1900, s: 1.08, sx: -1, expr: 'surprised', hr: [180, -380], hl: [-150, -300] });
  g += KAIs({ x: 470, y: 1900, s: 1.03, expr: 'sleep', hr: [200, -390], hl: [-150, -300] });
  for (let i = 0; i < 5; i++) { const k = ((t * 0.45 + i / 5) % 1); g += heart(380 + i * 80, 1000 - k * 500, 0.9 * (1 - k)); }
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, aA, d))] };
};
// 20 — ela não entendeu nada. mas eu entendi tudo.
S[20] = (t, d) => {
  const aM = findW(20, /mas/) - 0.2;
  let g = rays(t, '#C9708A', '#F7C99A');
  g += pp(MAE, { x: 600, y: 1900, s: 1.08, sx: -1, expr: t > aM ? 'happy' : 'surprised', hr: [180, -380], hl: [-150, -300] });
  g += KAIs({ x: 470, y: 1900, s: 1.03, expr: 'sleep', hr: [200, -390], hl: [-150, -300] });
  g += G(`translate(760,620) scale(${pop1(t, 0.3)})`, T(0, 0, '?', 150, '#FFFFFF', 14));
  if (t > aM) for (let i = 0; i < 6; i++) { const k = ((t * 0.5 + i / 6) % 1); g += heart(330 + i * 80, 1050 - k * 520, 1.0 * (1 - k)); }
  const z = eio(prog(t, 0, d));
  return { g, cam: [lerp(540, 540, z), lerp(1150, 1050, z), lerp(1.0, 1.2, z)] };
};
// 21 — hoje eu deixo a luz do corredor acesa. ela finge que não percebe.
S[21] = (t, d) => {
  const aF = findW(21, /finge/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#2A3352', 0) + R(-60, 1500, 1200, 700, 0, '#1E2540', 8);
  g += P('M-60,1500 L380,1100 L700,1100 L1140,1500Z', '#26304E', 0) + R(380, 560, 320, 540, 0, '#323D62', 6);
  g += bulb(540, 520, 1.0, true, t) + P('M440,560 L640,560 L900,2000 L180,2000Z', 'rgba(255,226,122,0.12)', 0);
  g += R(60, 700, 240, 760, 8, '#7A4A2A', 9) + R(76, 716, 120, 740, 4, '#F6C96B', 0);   // porta do quarto dela
  if (t > aF) g += G(`translate(150,1130) scale(${pop1(t, aF, 0.4)})`, G('scale(0.55)', head(Object.assign({}, MAE, { expr: 'happy', lx: 1 }))));
  g += switchPlate(820, 1150, true);
  g += KAIs({ x: 820, y: 1950, s: 1.0, back: true, hr: [130, -560], hl: [-150, -150] });
  return { g, cam: [540, 1200, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 22 — CTA: se os seus pais virassem crianças amanhã…
S[22] = (t, d) => {
  let g = rays(t, '#5B4A9A', '#F0A070');
  g += pp(MAEk, { x: 230, y: 1880, s: KS * 1.05, expr: 'happy', hr: [130, -420] });
  g += pp(PAIk, { x: 850, y: 1880, s: KS * 1.05, sx: -1, expr: 'happy', hr: [130, -420] });
  g += KAIs({ x: 540, y: 1960, s: 1.05, expr: 'happy', hl: [-200, -300], hr: [200, -300] });
  for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(380 + i * 110, 1050 - k * 420, 0.8 * (1 - k)); }
  return { g, cam: [540, 1100, 1.0] };
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
  if (t > 4.6) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 4.2, 4.6);
  return G(`translate(540,230) scale(${k * out})`, R(-510, -140, 1020, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -45, 'NO DIA EM QUE OS PAIS', 66, '#FFFFFF') + T(0, 60, 'VIRARAM CRIANÇAS', 80, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[22].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,260) scale(${k})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -45, 'O QUE VOCÊ FARIA', 72, '#FFFFFF') + T(0, 52, 'POR ELES?', 86, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
/** Fundo suave em degradê (no lugar dos raios de quadrinho), com brilho e poeirinha flutuando. */
function rays(t, c1, c2) {
  const id = 'bg' + (ZID++);
  let g = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` + R(-60, -60, 1200, 2200, 0, `url(#${id})`, 0);
  g += `<radialGradient id="${id}g"><stop offset="0" stop-color="#FFF0D2" stop-opacity="0.38"/><stop offset="1" stop-color="#FFF0D2" stop-opacity="0"/></radialGradient>` + C(540, 1150, 620, `url(#${id}g)`, 0);
  const r = rng(11);
  for (let i = 0; i < 16; i++) { const x = r() * 1080, y0 = r() * 1920, y = ((y0 - t * (20 + r() * 30)) % 1920 + 1920) % 1920; g += C(x, y, 3 + r() * 4, `rgba(255,250,230,${0.35 + 0.3 * Math.sin(t * 2 + i)})`, 0); }
  return g;
}
