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


/** Balão de pensamento simples. */
function think(x, y, w, txt, size = 44, t = 1, at = 0, tx = null, ty = null, fill = '#FFFFFF') {
  const k = back(prog(t, at, at + 0.25)); if (k <= 0) return '';
  const h = 150; let g = R(x, y, w, h, 70, fill, 8);
  if (tx !== null) for (let i = 1; i <= 2; i++) { const kk = i / 3; g += C(lerp(x + w / 2, tx, kk + 0.15), lerp(y + h, ty, kk + 0.15), 22 - i * 6, fill, 6); }
  g += T(x + w / 2, y + h / 2 + 4, txt, size, '#1A1210');
  return G(`translate(${x + w / 2},${y + h / 2}) scale(${k}) translate(${-(x + w / 2)},${-(y + h / 2)})`, g);
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
function sitPerson(d, x, y, s, o) {
  let g = '';
  for (const sd of [-1, 1]) g += limb(x + sd * 40 * s, y - 10 * s, x + sd * 46 * s, y + 160 * s, d.pants, 56 * s, 7) + E(x + sd * 52 * s, y + 175 * s, 50 * s, 26 * s, d.shoe);
  g += person(Object.assign({}, d, { x, y: y + 196 * 0.92 * s, s, legs: false }, o));
  return g;
}
// ================= "No dia em que as palavras começaram a pesar" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const LUCAS = { skin: '#E8B98F', shirt: '#C62A2A', pants: '#2E3A5C', hair: 'short', hairCol: '#B07A3A', shoe: '#2B2B2B', tie: null, hs: 1.2 };
const K2 = { skin: '#C88F66', shirt: '#3E9B4A', pants: '#3A3F4B', hair: 'curly', hairCol: '#1B1716', shoe: '#2B2B2B', tie: null, hs: 1.2 };
const K3 = { skin: '#F5D2B0', shirt: '#8E6CC8', pants: '#2E3A5C', hair: 'bun', hairCol: '#6A3A22', shoe: '#5A2E3A', tie: null, hs: 1.2 };
const MAE_B = '#C2577A', KAI_B = '#E07B39', LUC_B = '#4A5276';
window.CAMZ_OVR = { 4: [1.05, 40], 20: [1.05, 40] };
const findWn = (L, re, n) => { const ws = TL.lines[L].words; let c = 0; for (let i = 0; i < ws.length; i++) if (re.test(ws[i].text.toLowerCase())) { if (c === n) return wt(L, i); c++; } return 0; };
const GT = (L, re, n = 0) => CUTS[L] + findWn(L, re, n);   // tempo global de uma palavra

// ---------------- peso das mochilas (HUD)
function kg(T) {
  let k = 50, m = 200;
  for (let n = 0; n < 3; n++) if (T > GT(3, /^pedra/, n)) k += 4;
  for (let n = 0; n < 3; n++) if (T > TL.lines[12].start + 0.8 + n * 0.9) k -= 4;
  for (let n = 0; n < 3; n++) if (T > TL.lines[13].start + 1.2 + n * 0.5) m += 4;
  if (T > GT(17, /saiu/)) { m -= 4; k += 4; }
  for (let n = 0; n < 2; n++) if (T > GT(18, /outra/, n)) { m -= 4; k += 4; }
  return [k, m];
}
function kgPill(x, label, v, col) { return G(`translate(${x},110)`, R(-215, -52, 430, 104, 34, '#1A1210', 8) + G('translate(-160,0) scale(0.2)', bag(0, 0, 1, col, 0)) + T(40, 6, `${label} ${v} KG`, 50, '#FFE14D')); }
function levelHud(i, t) {
  const [k, m] = kg(t);
  if (i <= 4) return kgPill(540, 'KAI', k, KAI_B);
  if (i >= 6 && i <= 20) return kgPill(290, 'KAI', k, KAI_B) + kgPill(790, 'MÃE', m, MAE_B);
  return '';
}
// ---------------- objetos
function stone(x, y, s, seed = 1, label = '') {
  const r = rng(seed * 97 + 3); let d = '';
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = 46 * (0.8 + r() * 0.35); d += (i ? 'L' : 'M') + `${Math.cos(a) * rr * 1.2},${Math.sin(a) * rr}`; }
  let g = P(d + 'Z', '#8E949E', 6) + P(d + 'Z', 'url(#vol)', 0) + E(-14, -14, 16, 9, 'rgba(255,255,255,0.35)', 0);
  if (label) g += T(0, 6, label, 26, '#FFFFFF', 6);
  return G(`translate(${x},${y}) scale(${s})`, g);
}
function bag(x, y, s, col = KAI_B, n = 3, rot = 0) {
  let g = '';
  for (let i = 0; i < n; i++) g += stone(-80 + (i % 4) * 54, -170 - Math.floor(i / 4) * 34 - (i % 2) * 10, 0.75, i + 1);
  g += P('M-60,-200 Q0,-250 60,-200', 'none', 14) + `<path d="M-60,-200 Q0,-250 60,-200" fill="none" stroke="${shade(col, 0.3)}" stroke-width="8"/>`;
  g += P('M-130,-120 Q-140,-170 -90,-175 L90,-175 Q140,-170 130,-120 L142,150 Q142,182 110,182 L-110,182 Q-142,182 -142,150Z', col);
  g += P('M-128,-150 Q0,-205 128,-150 L124,-40 Q0,-8 -124,-40Z', shade(col, 0.15)) + R(-22, -40, 44, 40, 8, '#F2B636', 5);
  g += R(-86, 50, 172, 100, 24, tint(col, 0.2), 6) + Ln(-60, 70, 60, 70, shade(col, 0.3), 5);
  g += P('M-130,-120 Q-140,-170 -90,-175 L90,-175 Q140,-170 130,-120 L142,150 Q142,182 110,182 L-110,182 Q-142,182 -142,150Z', 'url(#vol)', 0);
  return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, g);
}
/** Pessoa usando mochila (a mochila aparece atrás, as alças na frente). */
function withBag(d, o, bs, col, n = 3) {
  const s = (o.s || 1) * 0.92, x = o.x, y = o.y - (o.lift || 0), sx = o.sx || 1;
  let g = bag(x, y - 320 * s, bs * (o.s || 1), col, n);
  g += person(Object.assign({}, d, o));
  for (const sd of [-1, 1]) g += Ln(x + sd * 58 * s * sx, y - 392 * s, x + sd * 66 * s * sx, y - 222 * s, O, 22 * s) + Ln(x + sd * 58 * s * sx, y - 392 * s, x + sd * 66 * s * sx, y - 222 * s, shade(col, 0.25), 13 * s);
  return g;
}
function flyStone(x1, y1, x2, y2, k, seed, h = 300, label = '') { if (k <= 0 || k >= 1) return ''; return stone(lerp(x1, x2, k), lerp(y1, y2, k) - Math.sin(k * Math.PI) * h, 0.9, seed, label) + sparkle(lerp(x1, x2, k) + 40, lerp(y1, y2, k) - Math.sin(k * Math.PI) * h - 40, 0.5); }
function lockers() { let g = room('#CFE0EA', '#B9A98A', 1500); for (let i = 0; i < 8; i++) { const x = -40 + i * 145; g += R(x, 640, 135, 860, 6, i % 2 ? '#3F86CF' : '#3878BE', 6) + Ln(x + 30, 700, x + 105, 700, 'rgba(0,0,0,0.25)', 6) + Ln(x + 30, 720, x + 105, 720, 'rgba(0,0,0,0.25)', 6) + R(x + 100, 1040, 14, 50, 4, '#D9DCE3', 4); } return g; }
function fridge(x, y, h = 760) { return R(x - 150, y - h, 300, h, 30, '#DDE6EE', 8) + Ln(x - 150, y - h * 0.62, x + 150, y - h * 0.62, O, 7) + Ln(x + 110, y - h + 60, x + 110, y - h * 0.7, O, 9) + R(x - 150, y - h, 300, h, 30, 'url(#vol)', 0); }
function doorFrame(x, y, open) { return R(x - 190, y - 640, 380, 640, 8, '#5A3A22', 9) + R(x - 170, y - 620, 340, 620, 0, open ? '#F6E7C8' : '#8A5A3A', 0) + (open ? P(`M${x - 170},${y - 620} L${x - 300},${y - 660} L${x - 300},${y + 30} L${x - 170},${y}Z`, '#8A5A3A', 7) : C(x + 120, y - 300, 14, '#F2B636', 5)); }

const S = [];
// 0 — gancho: preso na cama por uma mochila de 50 kg
S[0] = (t, d) => {
  const aC = findW(0, /cinquenta/) - 0.2;
  let g = room('#F6E3C8', '#B9874F', 1500) + windowFrame(640, 460, 320, 300, '#BFE3F5') + sun(880, 540, 40, t);
  g += bedKid(540, 1520, 1.25) + blanket(540, 1460, 1.25, '#7A90C8');
  g += lying(Object.assign({}, KAI, { expr: t > 1.5 ? 'squish' : 'surprised' }), 300, 1330, 0.62);
  const sh = Math.sin(t * 30) * (t < 1 ? 4 : 2);
  g += bag(640 + sh, 1250, 1.75, KAI_B, 6, -8);
  for (let i = 0; i < 3; i++) g += Ln(400 + i * 40, 1180 - i * 6, 420 + i * 40, 1150 - i * 6, '#FFFFFF', 7);
  g += G(`translate(800,860) scale(${1 + 0.15 * pop1(t, aC, 0.3) * (t < aC + 0.8 ? 1 : 0)}) rotate(8)`, R(-170, -70, 340, 140, 34, '#C62A2A', 9) + T(0, 8, '50 KG', 84, '#FFFFFF'));
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 1 — a regra: palavra ruim = pedra na mochila; palavra boa tira uma
S[1] = (t, d) => {
  const aR = findW(1, /ruim/) - 0.2, aP = findW(1, /^pedra/) - 0.2, aB = findW(1, /^boa/) - 0.2, aT = findW(1, /tira/) - 0.1;
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += bag(540, 1320, 1.3, KAI_B, t > aP + 0.6 && t < aT + 0.5 ? 4 : 3);
  g += G(`translate(300,560) scale(${pop1(t, aR)})`, bubble(-200, -70, 400, 140, 'ESQUISITO!', 50, 'right', '#FFFFFF'));
  g += flyStone(300, 640, 520, 1140, prog(t, aP, aP + 0.6), 7, 120);
  if (t > aB) g += G(`translate(780,560) scale(${pop1(t, aB)})`, bubble(-200, -70, 400, 140, 'VOCÊ É D+', 50, 'left', '#FFE9F0')) + heart(900, 470, 0.9);
  g += flyStone(540, 1140, 900, 760, prog(t, aT, aT + 0.7), 8, 260);
  g += G(`translate(240,1720) scale(${pop1(t, aP)})`, R(-150, -55, 300, 110, 30, '#1A1210', 0) + T(0, 6, 'RUIM = +1', 50, '#FF6B5E')) + G(`translate(840,1720) scale(${pop1(t, aB)})`, R(-150, -55, 300, 110, 30, '#1A1210', 0) + T(0, 6, 'BOA = -1', 50, '#7BE38A'));
  return { g, cam: [540, 1000, 1.0] };
};
// 2 — na escola: quase todas vinham do Lucas
S[2] = (t, d) => {
  const aL = findW(2, /lucas/) - 0.2;
  let g = lockers();
  g += withBag(KAI, { x: lerp(160, 300, prog(t, 0, d)), y: 1900, s: 0.95, expr: 'neutral', lift: Math.abs(Math.sin(t * 6)) * 10 }, 0.85, KAI_B, 4);
  g += pp(K2, { x: 640, y: 1880, s: 0.85, expr: 'happy' }) + pp(LUCAS, { x: 860, y: 1880, s: 0.95, sx: -1, expr: 'sus', hl: [-120, -230], hr: [120, -230] });
  if (t > aL) g += G(`translate(860,1020) scale(${pop1(t, aL)})`, R(-130, -50, 260, 100, 28, '#C62A2A', 7) + T(0, 6, 'LUCAS', 52, '#FFFFFF')) + P('M860,1080 l-26,40 l52,0Z', '#C62A2A', 6);
  return { g, cam: [540, 1180, 1.0] };
};
// 3 — "Esquisito." Pedra. "Ninguém quer sentar com você." Pedra. "Cabelo de vassoura." Pedra.
S[3] = (t, d) => {
  const ins = [['ESQUISITO!', findW(3, /esquisito/) - 0.2], ['NINGUÉM QUER|SENTAR COM VOCÊ!', findW(3, /ninguém/) - 0.2], ['CABELO DE|VASSOURA!', findW(3, /cabelo/) - 0.2]];
  const pe = [0, 1, 2].map(n => findWn(3, /^pedra/, n) - 0.35);
  const n = pe.filter(a => t > a + 0.5).length;
  let g = lockers();
  g += withBag(KAI, { x: 280, y: 1900, s: 1.0, expr: n ? 'sad' : 'worried', sy: 1 - n * 0.02, hrot: n * 3 }, 0.85 + n * 0.12, KAI_B, 4 + n * 2);
  g += pp(LUCAS, { x: 820, y: 1900, s: 1.0, sx: -1, expr: 'happy', hr: [230, -330 + Math.sin(t * 8) * 10], hl: [-120, -200] });
  g += pp(K3, { x: 1040, y: 1880, s: 0.85, sx: -1, expr: 'happy' });
  ins.forEach(([txt, a], i) => { if (t < a || (ins[i + 1] && t > ins[i + 1][1])) return; const ls = txt.split('|');
    g += G(`translate(640,${700}) scale(${pop1(t, a)})`, R(-300, -60 - ls.length * 30, 600, 120 + ls.length * 60, 30, '#FFFFFF', 8) + ls.map((l, j) => T(0, -ls.length * 30 + 30 + j * 64, l, 52, '#C62A2A')).join('') + P('M120,' + (60 + ls.length * 30) + ' l60,70 l10,-74Z', '#FFFFFF', 8)); });
  pe.forEach((a, i) => { g += flyStone(700, 860, 280, 1230, prog(t, a, a + 0.5), 11 + i, 160); if (t > a + 0.5 && t < a + 1.0) g += G(`translate(280,1160) scale(${pop1(t, a + 0.5, 0.15)})`, star(0, 0, 90, 50, 10, '#FFE14D') + T(0, 6, '+4', 40, '#C62A2A')); });
  return { g, cam: [540, 1180, 1.0] };
};
// 4 — curvado, igual um velhinho
S[4] = (t, d) => {
  let g = rays(t, '#F08A4A', '#F9D9A0') + sun(820, 520, 80, t) + R(-60, 1500, 1200, 700, 0, '#9A9488', 8) + houseFront(-60, 1500, 360, 420, '#F2D2A0', '#B5523B');
  const k = prog(t, 0, d);
  g += withBag(KAI, { x: lerp(300, 700, k), y: 1900, s: 1.0, expr: 'tired', sy: 0.88, hrot: 16, rot: 8, hl: [-90, -60], hr: [90, -60], lift: Math.abs(Math.sin(t * 3)) * 6 }, 1.35, KAI_B, 8);
  g += G(`translate(${lerp(300, 700, k) + 170},1420) scale(${pop1(t, 0.6)})`, `<g opacity="0.9">` + Ln(-10, -20, 40, -50, '#FFFFFF', 6) + Ln(0, 0, 50, -10, '#FFFFFF', 6) + '</g>');
  return { g, cam: [540, 1150, 1.0] };
};
// 5 — a mãe abriu a porta… e eu levei um susto
S[5] = (t, d) => {
  const aA = findW(5, /abriu/) - 0.2, aS = findW(5, /susto/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#E9C9A0', 0) + R(-60, 1500, 1200, 700, 0, '#9A9488', 8) + doorFrame(700, 1500, t > aA);
  if (t > aA) g += withBag(MAE, { x: 700, y: 1880, s: 0.95, sx: -1, expr: 'happy', sy: 0.94 }, 2.6 * pop1(t, aA, 0.4), MAE_B, 10);
  g += withBag(KAI, { x: 260, y: 1900, s: 1.0, sx: 1, expr: t > aS ? 'surprised' : 'tired', lx: 1, hl: [-160, -300], hr: [160, -300] }, 1.2, KAI_B, 6);
  return { g, cam: [540, 1150, 1.0 + 0.06 * eio(prog(t, aS, d))] };
};
// 6 — a mochila dela: maior que a geladeira
S[6] = (t, d) => {
  const aM = findW(6, /^maior/) - 0.2, aG = findW(6, /geladeira/) - 0.2;
  let g = room('#F6E7C8', '#C98A5A', 1500) + fridge(170, 1500, 700);
  g += withBag(MAE, { x: 640, y: 1900, s: 1.0, expr: 'happy', sy: 0.94 }, 3.2, MAE_B, 10);
  g += G(`translate(200,520) scale(${pop1(t, aG)}) rotate(-6)`, R(-180, -60, 360, 120, 30, '#1A1210', 0) + T(0, 6, '200 KG', 66, '#FFE14D'));
  g += Ln(170, 760, 170, 1500, 'rgba(255,255,255,0)', 1);
  if (t > aG) g += G(`translate(${170},${780}) scale(${pop1(t, aG)})`, `<path d="M-60,0 L60,0 M0,0 L0,-120 M-30,-90 L0,-120 L30,-90" stroke="#FFE14D" stroke-width="12" fill="none" stroke-linecap="round"/>`);
  return { g, cam: [540, 1050, 1.0 - 0.06 * eio(prog(t, 0, d))] };
};
// 7 — ela mal conseguia ficar em pé… "Como foi a escola, meu amor?"
S[7] = (t, d) => {
  const aC = findW(7, /como/) - 0.2;
  const sh = Math.sin(t * 22) * 6;
  let g = room('#F6E7C8', '#C98A5A', 1500);
  g += withBag(MAE, { x: 700 + sh, y: 1900, s: 1.05, sx: -1, expr: t > aC - 0.5 ? 'happy' : 'tired', sy: 0.9, hrot: -6 }, 3.0, MAE_B, 10);
  g += withBag(KAI, { x: 250, y: 1900, s: 0.95, expr: 'sad', lx: 1 }, 1.2, KAI_B, 6);
  g += say(60, 520, 700, 'COMO FOI A ESCOLA, MEU AMOR?', 40, 'right', '#FFFFFF', t, aC);
  return { g, cam: [540, 1100, 1.0] };
};
// 8 — quem fala tanta coisa ruim pra minha mãe?
S[8] = (t, d) => {
  let g = rays(t, '#5E6A86', '#A9A3BC');
  g += withBag(KAI, { x: 540, y: 2020, s: 1.15, expr: 'angry' }, 1.2, KAI_B, 6);
  g += think(140, 420, 800, 'QUEM FAZ ISSO COM ELA?', 46, t, 0.3, 560, 1150);
  return { g, cam: [540, 1000, 1.0] };
};
// 9 — re-gancho: "naquela noite eu descobri… e queria nunca ter descoberto"
S[9] = (t, d) => {
  const aQ = findW(9, /queria/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#14121C', 0) + stars(t) + C(540, 700, 160, '#F4F1EA', 8) + C(490, 660, 30, '#D9DCE3', 0) + C(600, 760, 40, '#D9DCE3', 0);
  g += G(`translate(540,1200) scale(${pop1(t, aQ)}) rotate(-3)`, R(-440, -110, 880, 220, 40, '#FFE14D', 0) + T(0, -32, 'EU QUERIA NUNCA', 70, '#1A1210') + T(0, 50, 'TER DESCOBERTO', 70, '#C62A2A'));
  return { g, cam: [540, 960, 1.0 + 0.1 * eio(prog(t, 0, d))] };
};
// 10 — de madrugada: a mãe sentada na minha cama
S[10] = (t, d) => {
  let g = room('#3A4670', '#2A3352', 1500) + nightWin(80, 460) + bedKid(560, 1520, 1.25) + blanket(560, 1460, 1.25, '#7A90C8');
  g += lying(Object.assign({}, KAI, { expr: prog(t, 0, d) > 0.4 ? 'neutral' : 'sleep' }), 330, 1330, 0.6);
  g += bag(150, 1770, 0.85, KAI_B, 6);
  g += bag(800, 1060, 1.9, MAE_B, 10) + sitPerson(MAE, 800, 1400, 0.95, { expr: 'happy', hl: [-150, -260], hr: [130, -250] });
  return { g, cam: [540, 1180, 1.0] };
};
// 11 — carinho: "Você não é esquisito. Você é o menino mais especial do mundo."
S[11] = (t, d) => {
  const aV = findW(11, /^você/) - 0.2, aE = findWn(11, /^você/, 1) - 0.2;
  let g = room('#3A4670', '#2A3352', 1500) + bedKid(560, 1520, 1.25) + blanket(560, 1460, 1.25, '#7A90C8');
  g += lying(Object.assign({}, KAI, { expr: 'sad' }), 330, 1330, 0.6) + bag(150, 1770, 0.85, KAI_B, 6);
  g += bag(800, 1060, 1.9, MAE_B, 10) + sitPerson(MAE, 800, 1400, 0.95, { expr: 'happy', hl: [-260 + Math.sin(t * 3) * 20, -260], hr: [130, -250] });
  g += say(60, 520, 640, 'VOCÊ NÃO É ESQUISITO.', 42, 'right', '#FFFFFF', t, aV);
  g += say(60, 720, 900, 'VOCÊ É O MENINO MAIS ESPECIAL DO MUNDO.', 34, 'right', '#FFE9F0', t, aE);
  return { g, cam: [540, 1150, 1.0] };
};
// 12 — a cada palavra, uma pedra saía da minha mochila
S[12] = (t, d) => {
  const T0 = TL.lines[12].start - CUTS[12];
  let g = room('#3A4670', '#2A3352', 1500) + bedKid(560, 1520, 1.25) + blanket(560, 1460, 1.25, '#7A90C8');
  g += lying(Object.assign({}, KAI, { expr: 'surprised' }), 330, 1330, 0.6);
  const n = [0, 1, 2].filter(i => t > T0 + 0.8 + i * 0.9).length;
  g += bag(150, 1770, 0.85, KAI_B, 6 - n * 2);
  for (let i = 0; i < 3; i++) { const k = prog(t, T0 + 0.8 + i * 0.9 - 0.2, T0 + 0.8 + i * 0.9 + 1.0); if (k > 0 && k < 1) g += stone(150, 1600 - k * 400, 0.9 * (1 - k * 0.2), 20 + i) + sparkle(190, 1560 - k * 400, 0.6); }
  g += bag(800, 1060, 1.9, MAE_B, 10) + sitPerson(MAE, 800, 1400, 0.95, { expr: 'happy', hl: [-260, -260], hr: [130, -250] });
  return { g, cam: [540, 1250, 1.05] };
};
// 13 — mas a pedra não sumia: ia direto pra mochila dela
S[13] = (t, d) => {
  const aI = findW(13, /^ia/) - 0.3;
  let g = room('#3A4670', '#2A3352', 1500) + bedKid(560, 1520, 1.25) + blanket(560, 1460, 1.25, '#7A90C8');
  g += lying(Object.assign({}, KAI, { expr: 'surprised' }), 330, 1330, 0.6) + bag(150, 1770, 0.85, KAI_B, 0);
  g += bag(800, 1060, 1.9 + 0.1 * prog(t, aI, d), MAE_B, 12) + sitPerson(MAE, 800, 1400, 0.95, { expr: 'tired', sy: 0.96, hl: [-240, -220], hr: [130, -250] });
  for (let i = 0; i < 3; i++) g += flyStone(150, 1200, 800, 720, prog(t, aI + i * 0.5, aI + i * 0.5 + 0.8), 30 + i, 200);
  return { g, cam: [540, 1150, 1.0] };
};
// 14 — ela tava carregando as minhas pedras. desde que eu nasci.
S[14] = (t, d) => {
  const aC = findW(14, /carregando/) - 0.2, aD = findW(14, /desde/) - 0.2;
  let g = rays(t, '#5A2230', '#C9708A');
  g += withBag(MAE, { x: 540, y: 1920, s: 1.0, expr: 'tired', sy: 0.92 }, 2.8, MAE_B, 8);
  const labs = ['CHORÃO', 'ESQUISITO', 'BURRO', 'FEIO', 'LERDO', 'CHATO'];
  labs.forEach((l, i) => { const a = aC + i * 0.25; if (t > a) g += stone(220 + (i % 3) * 320, 600 + Math.floor(i / 3) * 210, 2.1 * pop1(t, a), 40 + i, l); });
  g += G(`translate(540,1060) scale(${pop1(t, aD)}) rotate(-3)`, R(-400, -70, 800, 140, 30, '#1A1210', 0) + T(0, 6, 'DESDE QUE EU NASCI', 62, '#FFE14D'));
  return { g, cam: [540, 960, 1.0] };
};
// 15 — toda vez que alguém me machucava, ela pegava a dor pra ela
S[15] = (t, d) => {
  const aT = findW(15, /toda/) - 0.2, aP = findW(15, /pegava/) - 0.3, aN = findW(15, /nunca/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#C9A57A', 0);
  const p1 = R(0, 0, 440, 470, 0, '#CFE3C8', 0) + R(0, 360, 440, 120, 0, '#7CB65A', 0) + person(Object.assign({}, KAI, { x: 140, y: 460, s: 0.32, hs: 1.4, expr: 'sad' })) + tears(140, 260, t, 0.5) + pp(LUCAS, { x: 330, y: 460, s: 0.32, sx: -1, hs: 1.4, expr: 'happy' });
  const p2 = R(0, 0, 440, 470, 0, '#F6E7C8', 0) + pp(MAE, { x: 260, y: 470, s: 0.5, expr: 'happy', hl: [-200, -250], hr: [200, -250] }) + person(Object.assign({}, KAI, { x: 170, y: 470, s: 0.3, hs: 1.4, expr: 'sleep' })) + flyStone(170, 300, 330, 160, ((t * 0.6) % 1), 50, 60);
  g += memPanel(60, 260, 440, 470, pop1(t, aT, 0.3), p1, 'm1', -2) + memPanel(580, 340, 440, 470, pop1(t, aP, 0.3), p2, 'm2', 2);
  g = sepia(g);
  g += G(`translate(540,1200) scale(${pop1(t, aN)}) rotate(-3)`, R(-360, -70, 720, 140, 30, '#FFFFFF', 8) + T(0, 6, 'E NUNCA ME CONTOU', 58, '#1A1210'));
  return { g, cam: [540, 960, 1.0] };
};
// 16 — o abraço: "Mãe, você é a pessoa mais forte que eu conheço."
S[16] = (t, d) => {
  const aM = findW(16, /^mãe/) - 0.2;
  let g = rays(t, '#C9708A', '#F7C99A');
  g += bag(640, 1330, 2.6, MAE_B, 12);
  g += pp(MAE, { x: 610, y: 1900, s: 1.08, sx: -1, expr: 'surprised', hr: [180, -380], hl: [-150, -300] });
  g += KAIs({ x: 470, y: 1900, s: 1.0, expr: 'sleep', hr: [200, -390], hl: [-150, -300] });
  g += say(60, 440, 960, 'MÃE, VOCÊ É A PESSOA MAIS FORTE QUE EU CONHEÇO.', 32, 'right', '#FFFFFF', t, aM);
  return { g, cam: [540, 1100, 1.0] };
};
// 17 — e uma pedra saiu da mochila dela
S[17] = (t, d) => {
  const aS = findW(17, /saiu/) - 0.25;
  let g = rays(t, '#C9708A', '#F7C99A') + bag(640, 1330, 2.6, MAE_B, 11);
  g += pp(MAE, { x: 610, y: 1900, s: 1.08, sx: -1, expr: t > aS + 0.4 ? 'happy' : 'surprised', hr: [180, -380], hl: [-150, -300] });
  g += KAIs({ x: 470, y: 1900, s: 1.0, expr: 'sleep', hr: [200, -390], hl: [-150, -300] });
  g += flyStone(640, 900, 300, 1200, prog(t, aS, aS + 1.0), 60, 300);
  if (t > aS + 0.3) g += G(`translate(640,760) scale(${pop1(t, aS + 0.3)})`, star(0, 0, 100, 60, 10, '#FFE14D') + T(0, 6, '-4', 50, '#3E9B4A'));
  return { g, cam: [540, 1100, 1.0] };
};
// 18 — "Obrigado por tudo." Outra pedra. "Eu te amo." Outra.
S[18] = (t, d) => {
  const aO = findW(18, /obrigado/) - 0.2, aE = findW(18, /^eu/) - 0.2, o1 = findWn(18, /outra/, 0) - 0.3, o2 = findWn(18, /outra/, 1) - 0.3;
  let g = rays(t, '#F08A4A', '#F9D9A0') + bag(640, 1330, 2.5, MAE_B, t > o2 ? 9 : t > o1 ? 10 : 11);
  g += pp(MAE, { x: 610, y: 1900, s: 1.08, sx: -1, expr: 'happy', hr: [180, -380], hl: [-150, -300] });
  g += KAIs({ x: 470, y: 1900, s: 1.0, expr: 'happy', hr: [200, -390], hl: [-150, -300] });
  g += say(60, 440, 560, 'OBRIGADO POR TUDO.', 44, 'right', '#FFFFFF', t, aO);
  if (t > aE) g += say(460, 640, 460, 'EU TE AMO.', 56, 'left', '#FFE9F0', t, aE);
  g += flyStone(640, 900, 300, 1200, prog(t, o1, o1 + 0.9), 61, 260) + flyStone(640, 900, 300, 1200, prog(t, o2, o2 + 0.9), 62, 260);
  for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(420 + i * 70, 1150 - k * 400, 0.7 * (1 - k)); }
  return { g, cam: [540, 1100, 1.0] };
};
// 19 — a minha mochila foi ficando pesada… mas eu nunca me senti tão leve
S[19] = (t, d) => {
  const aL = findW(19, /leve/) - 0.3;
  let g = rays(t, '#F7B87A', '#FCE6C0');
  const fl = t > aL ? Math.sin((t - aL) * 2.5) * 20 + 40 * prog(t, aL, aL + 0.6) : 0;
  g += withBag(KAI, { x: 540, y: 2000, s: 1.15, expr: t > aL ? 'happy' : 'tired', lift: fl, sy: t > aL ? 1 : 0.94, hl: [-200, -360], hr: [200, -360] }, 1.45, KAI_B, 10);
  for (let i = 0; i < 8; i++) { const k = ((t * 0.4 + i / 8) % 1); g += sparkle(200 + (i * 137) % 700, 1500 - k * 900, 0.6 * (1 - k)); }
  return { g, cam: [540, 1000, 1.0] };
};
// 20 — hoje a gente divide as pedras
S[20] = (t, d) => {
  let g = rays(t, '#F08A4A', '#F9D9A0') + sun(840, 460, 80, t) + R(-60, 1500, 1200, 700, 0, '#9A9488', 8) + houseFront(-60, 1500, 360, 420, '#F2D2A0', '#B5523B') + houseFront(820, 1500, 360, 460, '#CFE3C8', '#3E6A8A');
  const k = prog(t, 0, d), bob = Math.abs(Math.sin(t * 5)) * 8;
  g += withBag(MAE, { x: lerp(380, 640, k), y: 1900, s: 1.05, expr: 'happy', lift: bob, hr: [180, -200] }, 1.5, MAE_B, 6);
  g += withBag(KAI, { x: lerp(180, 440, k), y: 1900, s: 0.95, expr: 'happy', lift: bob, hr: [190, -200] }, 1.3, KAI_B, 6);
  return { g, cam: [540, 1150, 1.0] };
};
// 21 — reviravolta: a mochila do Lucas era a mais pesada da escola
S[21] = (t, d) => {
  const aV = findW(21, /^vi$/) - 0.2, aP = findW(21, /pesada/) - 0.2;
  let g = lockers();
  if (t < aV) { g += R(-60, -60, 1200, 2200, 0, 'rgba(20,16,30,0.5)', 0) + G(`translate(540,960) scale(${pop1(t, 0.2)})`, T(0, 0, 'E O LUCAS?', 110, '#FFE14D', 14)); return { g, cam: [540, 960, 1.0] }; }
  g += withBag(LUCAS, { x: 600, y: 1900, s: 1.05, sx: -1, expr: 'sad', sy: 0.88, hrot: 14 }, 3.6, LUC_B, 12);
  const labs = ['INÚTIL', 'BURRO', 'CALA A BOCA', 'DECEPÇÃO'];
  labs.forEach((l, i) => { const a = aV + 0.6 + i * 0.35; if (t > a) g += stone(170 + (i % 2) * 740, 820 + Math.floor(i / 2) * 260, 2.0 * pop1(t, a), 70 + i, l); });
  g += G(`translate(540,520) scale(${pop1(t, aP)}) rotate(-3)`, R(-400, -70, 800, 140, 30, '#C62A2A', 0) + T(0, 6, 'A MAIS PESADA', 72, '#FFFFFF'));
  return { g, cam: [540, 1100, 1.0] };
};
// 22 — "Bom dia, Lucas." e pela primeira vez ele sorriu
S[22] = (t, d) => {
  const aB = findW(22, /^bom/) - 0.2, aS = findW(22, /sorriu/) - 0.3;
  let g = lockers();
  g += withBag(LUCAS, { x: 760, y: 1900, s: 1.0, sx: -1, expr: t > aS ? 'happy' : 'sad', sy: t > aS ? 0.96 : 0.9, hrot: t > aS ? 0 : 10 }, 3.3, LUC_B, 11);
  g += withBag(KAI, { x: 270, y: 1900, s: 1.0, expr: 'happy', lx: 1, hr: [200, -380] }, 1.4, KAI_B, 8);
  g += say(60, 560, 480, 'BOM DIA, LUCAS.', 48, 'left', '#FFFFFF', t, aB);
  g += flyStone(760, 1000, 380, 1200, prog(t, aB + 0.8, aB + 1.8), 80, 260);
  if (t > aS) for (let i = 0; i < 6; i++) { const k = ((t * 0.6 + i / 6) % 1); g += sparkle(600 + (i * 53) % 300, 1250 - k * 500, 0.7 * (1 - k)); }
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, aS, d))] };
};
// 23 — CTA
S[23] = (t, d) => {
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += withBag(KAI, { x: 540, y: 1960, s: 1.05, expr: 'happy', hl: [-200, -300], hr: [200, -300] }, 1.4, KAI_B, 8);
  for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(380 + i * 110, 1050 - k * 420, 0.8 * (1 - k)); }
  return { g, cam: [540, 1050, 1.0] };
};
function titleOverlay(t) {
  if (t > 5.2) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 4.8, 5.2);
  return G(`translate(540,330) scale(${k * out})`, R(-510, -140, 1020, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -45, 'NO DIA EM QUE AS PALAVRAS', 56, '#FFFFFF') + T(0, 60, 'COMEÇARAM A PESAR', 76, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[23].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,260) scale(${k})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -45, 'QUEM CARREGA', 74, '#FFFFFF') + T(0, 52, 'AS SUAS PEDRAS?', 80, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
