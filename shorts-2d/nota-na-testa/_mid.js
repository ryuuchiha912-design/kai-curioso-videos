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
// ================= "Nessa escola, a sua nota aparece na sua testa" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const kid2 = (o) => Object.assign({ pants: '#2E3A5C', shoe: '#2B2B2B', tie: null, hs: 1.2 }, o);
const ANA = kid2({ skin: '#F1C7A0', shirt: '#F28FB0', hair: 'bun', hairCol: '#3A2418' });
const PEDRO = kid2({ skin: '#D9A47A', shirt: '#3E6A8A', hair: 'short', hairCol: '#1B1716' });
const DORME = kid2({ skin: '#F5D2B0', shirt: '#F2B636', hair: 'curly', hairCol: '#8A5A3A' });
const TEO = kid2({ skin: '#C88F66', shirt: '#3E9B4A', hair: 'curly', hairCol: '#1B1716' });
const CLARA = kid2({ skin: '#F1C7A0', shirt: '#8E6CC8', hair: 'bun', hairCol: '#C98A3A' });
const SEMLANCHE = kid2({ skin: '#E8B98F', shirt: '#E07B39', hair: 'short', hairCol: '#5A3A22' });
const NOVO = kid2({ skin: '#FBE7D8', shirt: '#2C6FB6', hair: 'short', hairCol: '#C98A3A' });
window.CAMZ_OVR = { 1: [1.05, 40], 12: [1.05, 40], 13: [1.08, 60], 16: [1.05, 40] };
const findWn = (L, re, n) => { const ws = TL.lines[L].words; let c = 0; for (let i = 0; i < ws.length; i++) if (re.test(ws[i].text.toLowerCase())) { if (c === n) return wt(L, i); c++; } return 0; };
const GT = (L, re, n = 0) => CUTS[L] + findWn(L, re, n);
function kaiNota(T) { let n = 0; if (T > GT(15, /^um/) - 0.2) n = 1; if (T > GT(16, /dois/) - 0.2) n = 2; if (T > GT(16, /três/) - 0.2) n = 3; return n; }
function levelHud(i, t) {
  if (i < 1 || i > 20) return '';
  const n = kaiNota(t), z = n === 0;
  return G('translate(540,110)', R(-250, -52, 500, 104, 34, z ? '#7A1E1E' : '#1A1210', 8) + T(0, 6, `MINHA NOTA: ${n}`, 54, z ? '#FFB3AC' : '#FFE14D'));
}
// ---------------- cenários e objetos
function classroom() {
  let g = room('#E4E0C4', '#B9874F', 1500) + R(150, 470, 780, 400, 14, '#2F5A46', 10) + R(150, 470, 780, 400, 14, 'url(#vol)', 0) + R(140, 860, 800, 22, 6, '#B9874F', 6);
  g += T(540, 560, '2 + 2 = 4', 60, 'rgba(255,255,255,0.85)') + `<path d="M260,720 q60,-50 120,0 t120,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="6"/>` + T(760, 760, 'A B C', 50, 'rgba(255,255,255,0.7)');
  g += clockFace(980, 380, 56, -Math.PI / 2 + 0.9, -Math.PI / 2 + 3.2);
  return g;
}
function schoolDesk(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-170, -30, 340, 36, 8, '#C98A3A', 7) + R(-170, -30, 340, 36, 8, 'url(#vol)', 0) + Ln(-140, 6, -140, 170, O, 12) + Ln(140, 6, 140, 170, O, 12)); }
function patio() { let g = rays(0, '#9FC7E8', '#DDEFFF') + R(-60, 1100, 1200, 420, 0, '#E9C9A0', 7) + R(-60, 1500, 1200, 700, 0, '#C9C2B4', 8); for (let i = 0; i < 6; i++) g += R(60 + i * 180, 1180, 110, 140, 6, '#BFE3F5', 6); g += C(980, 1000, 120, '#5FA35A', 7) + R(965, 1080, 30, 420, 6, '#8A5A3A', 6); return g; }
function bench(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-240, -120, 480, 36, 10, '#B9874F', 7) + R(-240, -200, 480, 30, 10, '#B9874F', 7) + Ln(-200, -84, -200, 0, O, 12) + Ln(200, -84, 200, 0, O, 12)); }
function mirror(x, y, inner) { return R(x - 220, y - 280, 440, 560, 40, '#9AA3AD', 10) + clipG(`<rect x="${x - 200}" y="${y - 260}" width="400" height="520" rx="30"/>`, R(x - 200, y - 260, 400, 520, 0, '#CFE6F2', 0) + inner + P(`M${x - 150},${y - 220} L${x - 60},${y - 260} M${x - 170},${y - 120} L${x - 20},${y - 200}`, 'none', 0, '') + `<path d="M${x - 160},${y - 120} L${x - 40},${y - 220}" stroke="rgba(255,255,255,0.6)" stroke-width="14"/>`); }
function lamp(x, y) { return P(`M${x - 70},${y - 200} L${x + 70},${y - 200} L${x + 40},${y - 280} L${x - 40},${y - 280}Z`, '#F2B636', 7) + Ln(x, y - 200, x, y, O, 10) + R(x - 60, y - 14, 120, 20, 6, '#5A6070', 6) + P(`M${x - 70},${y - 200} L${x - 220},${y + 60} L${x + 220},${y + 60} L${x + 70},${y - 200}Z`, 'rgba(255,230,140,0.18)', 0); }
function books(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-120, -40, 240, 40, 6, '#C62A2A', 6) + R(-110, -80, 220, 40, 6, '#2C6FB6', 6) + R(-130, -120, 250, 40, 6, '#3E9B4A', 6)); }
function sandwich(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, E(0, 10, 80, 26, '#E8B66A', 6) + E(0, -6, 84, 14, '#7CB65A', 0) + E(0, -14, 80, 12, '#E04B3C', 0) + E(0, -30, 80, 30, '#F2C77A', 6)); }
function zeroStamp(x, y, s, t, at) { const k = pop1(t, at, 0.18); if (k <= 0) return ''; return G(`translate(${x},${y}) scale(${k * s}) rotate(-10)`, C(0, 0, 110, 'rgba(255,90,78,0.2)', 0) + `<circle r="100" fill="none" stroke="#E04B3C" stroke-width="16"/>` + T(0, 10, '0', 140, '#E04B3C')); }
function note(x, y, s, rot, lines) { let g = R(-260, -300, 520, 600, 14, '#FFF8E6', 7) + R(-260, -300, 520, 600, 14, 'url(#vol)', 0); for (let i = 0; i < 9; i++) g += Ln(-220, -220 + i * 60, 220, -220 + i * 60, 'rgba(120,150,200,0.45)', 3); lines.forEach((l, i) => g += T(0, -230 + i * 60 + 22, l, 34, '#2C3E66')); g += heart(170, 230, 0.7); return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, g); }
function gate() { let g = rays(0, '#F6B585', '#F9DDB8') + R(-60, 1500, 1200, 700, 0, '#C9C2B4', 8) + R(-60, 900, 260, 600, 0, '#D9A47A', 7) + R(880, 900, 260, 600, 0, '#D9A47A', 7); for (let i = 0; i < 10; i++) g += Ln(220 + i * 70, 900, 220 + i * 70, 1500, '#3A3F4B', 12); g += Ln(200, 920, 880, 920, '#3A3F4B', 16) + R(320, 780, 440, 100, 16, '#2C6FB6', 7) + T(540, 836, 'ESCOLA', 56, '#FFFFFF'); return g; }

const S = [];
// 0 — gancho: o zero na testa
S[0] = (t, d) => {
  const aZ = findW(0, /zero/) - 0.25;
  let g = classroom() + schoolDesk(540, 1640, 1.3);
  const k = pop1(t, aZ, 0.3);
  g += KAIs({ x: 540, y: 2120, s: 1.6, expr: t > aZ + 0.3 ? 'surprised' : 'sad', fore: '0' });
  g += C(540, 2120 - 474 * 1.6 * 1.28 * 0.86 - 70, 130 + 20 * Math.sin(t * 6), 'rgba(255,90,78,0.18)', 0);
  if (t > aZ) g += star(540, 2120 - 474 * 1.6 * 1.28 * 0.86 - 60, 150 * k, 90 * k, 12, 'rgba(255,120,100,0.35)');
  return { g, cam: [540, lerp(1000, 1100, eio(prog(t, 0, d))), lerp(1.0, 1.12, eio(prog(t, aZ - 0.5, d)))] };
};
// 1 — Ana 10, Pedro 9, o que dormia 7
S[1] = (t, d) => {
  const aA = findW(1, /ana/) - 0.2, aP = findW(1, /pedro/) - 0.2, aD = findW(1, /dormia/) - 0.2;
  let g = classroom();
  g += pp(ANA, { x: 190, y: 1880, s: 0.9, expr: 'happy', lx: 1, fore: t > aA ? 10 : undefined });
  g += pp(PEDRO, { x: 420, y: 1880, s: 0.9, expr: 'sus', lx: 1, fore: t > aP ? 9 : undefined });
  g += pp(DORME, { x: 650, y: 1880, s: 0.9, expr: 'sleep', hrot: 12, fore: t > aD ? 7 : undefined }) + zzz(700, 1260, t);
  g += KAIs({ x: 900, y: 1900, s: 0.95, sx: -1, expr: 'sad', fore: '0' });
  return { g, cam: [540, 1180, 1.0] };
};
// 2 — estudei a noite inteira → tirei 10 → espelho: zero
S[2] = (t, d) => {
  const aS = findW(2, /seguinte/) - 0.2, aE = findW(2, /corri/) - 0.2, aZ = findW(2, /zero/) - 0.2;
  if (t < aS) {
    let g = room('#3A4670', '#2A3352', 1500) + nightWin(640, 420) + schoolDesk(480, 1560, 1.4) + lamp(760, 1520) + books(330, 1520, 1.0);
    g += KAIs({ x: 480, y: 1960, s: 1.0, expr: 'tired', hl: [-130, -210], hr: [130, -210], hrot: 6 }) + clockFace(220, 620, 70, -Math.PI / 2 + t * 1.5, -Math.PI / 2 + t * 12, '03:00');
    return { g, cam: [540, 1180, 1.0] };
  }
  if (t < aE) {
    let g = classroom() + paper(540, 1000, 2.0, -6, '10');
    g += KAIs({ x: 540, y: 2150, s: 1.2, expr: 'happy', hl: [-200, -420], hr: [200, -420] });
    return { g, cam: [540, 1100, 1.0] };
  }
  let g = room('#CFE0EA', '#9AA3AD', 1500) + mirror(540, 900, G(`translate(540,${980}) scale(1.1)`, head(Object.assign({}, KAI, { expr: t > aZ + 0.2 ? 'surprised' : 'happy', fore: t > aZ ? '0' : 10 }))));
  g += KAIs({ x: 540, y: 2300, s: 1.4, back: true });
  return { g, cam: [540, 1000, 1.0 + 0.06 * eio(prog(t, aZ, d))] };
};
// 3 — dez, dez… e na testa: zero, zero, zero
S[3] = (t, d) => {
  const a1 = findWn(3, /^dez/, 0) - 0.2, a2 = findWn(3, /^dez/, 1) - 0.2, z = [0, 1, 2].map(n => findWn(3, /zero/, n) - 0.2);
  let g = rays(t, '#5E6A86', '#A9A3BC');
  g += G(`translate(250,650) scale(${pop1(t, a1)})`, paper(0, 0, 1.4, -8, '10')) + G(`translate(820,620) scale(${pop1(t, a2)})`, paper(0, 0, 1.4, 7, '10'));
  g += KAIs({ x: 540, y: 2200, s: 1.4, expr: t > z[0] ? 'sad' : 'happy', fore: '0' });
  g += zeroStamp(230, 1180, 0.9, t, z[0]) + zeroStamp(850, 1180, 0.9, t, z[1]) + zeroStamp(540, 560, 1.2, t, z[2]);
  return { g, cam: [540, 1000, 1.0] };
};
// 4 — "Kai Zero"
S[4] = (t, d) => {
  const aK = findW(4, /^kai/) - 0.3;
  let g = classroom();
  g += KAIs({ x: 540, y: 1900, s: 1.0, expr: 'sad', fore: '0', hl: [-100, -150], hr: [100, -150] });
  g += pp(PEDRO, { x: 200, y: 1880, s: 0.85, expr: 'happy', hr: [220, -330] }) + pp(DORME, { x: 880, y: 1880, s: 0.85, sx: -1, expr: 'happy', hr: [220, -330] });
  g += say(80, 560, 520, 'KAI ZERO!', 60, 'right', '#FFFFFF', t, aK) + say(560, 700, 440, 'HAHAHA!', 54, 'left', '#FFFFFF', t, aK + 0.4);
  return { g, cam: [540, 1150, 1.0] };
};
// 5 — Ana: dez na testa, cinco na prova
S[5] = (t, d) => {
  const aA = findW(5, /ana/) - 0.2, aC = findW(5, /cinco/) - 0.2;
  let g = classroom() + schoolDesk(540, 1640, 1.3);
  g += pp(ANA, { x: 540, y: 2250, s: 1.4, expr: 'happy', fore: 10, hr: [180, -420] });
  if (t > aC) g += G(`translate(780,980) scale(${pop1(t, aC)})`, paper(0, 0, 1.6, 8, '5'));
  g += think(60, 1000, 300, '?', 90, t, aC + 0.4, 200, 1300);
  return { g, cam: [540, 1050, 1.0] };
};
// 6 — Teo: nunca acertava nada… e tinha nove
S[6] = (t, d) => {
  const aN = findW(6, /nove/) - 0.25;
  let g = classroom() + schoolDesk(540, 1640, 1.3) + paper(800, 1500, 1.0, 10, '2') + paper(300, 1520, 1.0, -10, '3');
  g += pp(TEO, { x: 540, y: 2250, s: 1.4, expr: 'happy', fore: t > aN ? 9 : undefined });
  return { g, cam: [540, 1050, 1.0 + 0.06 * eio(prog(t, aN, d))] };
};
// 7 — o que essa nota media de verdade?
S[7] = (t, d) => {
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += KAIs({ x: 540, y: 2100, s: 1.25, expr: 'sus', fore: '0', hr: [150, -300] });
  g += G(`translate(540,640) scale(${pop1(t, 0.3)})`, T(0, 0, '?', 300, '#FFE14D', 20));
  return { g, cam: [540, 1000, 1.0] };
};
// 8 — re-gancho: fiquei com vergonha de mim mesmo
S[8] = (t, d) => {
  const aV = findW(8, /vergonha/) - 0.3;
  let g = R(-60, -60, 1200, 2200, 0, '#14121C', 0) + P('M380,-60 L700,-60 L900,2000 L180,2000Z', 'rgba(255,230,170,0.10)', 0);
  g += KAIs({ x: 540, y: 2050, s: 1.2, expr: t > aV ? 'sad' : 'surprised', fore: '0', hrot: t > aV ? 10 : 0 });
  g += G(`translate(540,620) scale(${pop1(t, aV)}) rotate(-3)`, R(-430, -100, 860, 200, 40, '#FFE14D', 0) + T(0, -26, 'FIQUEI COM VERGONHA', 62, '#1A1210') + T(0, 52, 'DE MIM MESMO', 62, '#C62A2A'));
  return { g, cam: [540, 1000, 1.0 + 0.08 * eio(prog(t, 0, d))] };
};
// 9 — o Teo dividiu o lanche: nove… dez
S[9] = (t, d) => {
  const aDv = findW(9, /dividiu/) - 0.2, aD = findW(9, /^dez/) - 0.2;
  let g = patio() + bench(540, 1700, 1.2);
  g += pp(SEMLANCHE, { x: 760, y: 1880, s: 0.95, sx: -1, expr: t > aDv + 0.6 ? 'happy' : 'sad', hr: [170, -240], fore: 6 });
  g += pp(TEO, { x: 330, y: 1880, s: 0.95, expr: 'happy', hr: [220, -240], fore: t > aD ? 10 : 9 });
  const k = prog(t, aDv, aDv + 0.8);
  g += sandwich(lerp(470, 640, k), 1560 - Math.sin(k * Math.PI) * 60, 0.8);
  if (t > aD) g += G(`translate(330,1200) scale(${pop1(t, aD)})`, star(0, 0, 120, 70, 10, 'rgba(255,225,77,0.5)')) + sparkle(400, 1150, 1.0);
  return { g, cam: [540, 1180, 1.0] };
};
// 10 — a nota era de quantas pessoas você ajudou
S[10] = (t, d) => {
  const aA = findW(10, /^era/) - 0.2;
  let g = rays(t, '#F08A4A', '#F9D9A0');
  g += G(`translate(540,560) scale(${pop1(t, 0.2)}) rotate(-3)`, R(-330, -70, 660, 140, 30, '#FFFFFF', 8) + T(0, 6, 'NOTA DA PROVA', 62, '#1A1210')) + bigX(540, 560, 2.0, t, aA - 0.3);
  g += G(`translate(540,960) scale(${pop1(t, aA)}) rotate(3)`, R(-450, -150, 900, 300, 40, '#1A1210', 0) + T(0, -50, 'QUANTAS PESSOAS', 74, '#FFFFFF') + T(0, 50, 'VOCÊ AJUDOU', 84, '#FFE14D'));
  return { g, cam: [540, 960, 1.0] };
};
// 11 — e a minha era zero: estudava sozinho, nunca ajudei ninguém
S[11] = (t, d) => {
  const aP = findW(11, /porque/) - 0.2, aN = findW(11, /nunca/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#C9A57A', 0);
  const p1 = classroom() + schoolDesk(540, 1640, 1.3) + books(400, 1610, 1.0) + KAIs({ x: 540, y: 2000, s: 1.0, expr: 'tired', fore: '0', hl: [-130, -210], hr: [130, -210] }) + pp(NOVO, { x: 900, y: 1880, s: 0.85, sx: -1, expr: 'sad' }) + books(880, 1880, 0.8);
  g += memPanel(90, 380, 900, 900, pop1(t, aP, 0.3), G('scale(0.85) translate(-60,-1000)', p1), 'z1', -2);
  g = sepia(g);
  g += G(`translate(540,1360) scale(${pop1(t, aN)}) rotate(-3)`, R(-400, -60, 800, 120, 30, '#C62A2A', 0) + T(0, 6, 'NUNCA AJUDEI NINGUÉM', 56, '#FFFFFF'));
  return { g, cam: [540, 960, 1.0] };
};
// 12 — Clara chorando no canto; todo mundo passava reto
S[12] = (t, d) => {
  const aT = findW(12, /todo/) - 0.2;
  let g = patio() + bench(860, 1700, 1.0);
  g += sitPerson(CLARA, 860, 1540, 0.85, { expr: 'sad', hl: [-80, -260], hr: [80, -260], fore: 3 }) + tears(860, 1540 + 196 * 0.92 * 0.85 - 474 * 0.85 * 1.2 + 120, t, 0.7);
  if (t > aT) { const k = prog(t, aT, d); g += pp(PEDRO, { x: lerp(-100, 700, k), y: 1900, s: 0.9, expr: 'neutral', lift: Math.abs(Math.sin(t * 7)) * 10, fore: 9 }) + pp(ANA, { x: lerp(-350, 450, k), y: 1900, s: 0.9, expr: 'happy', lift: Math.abs(Math.sin(t * 7 + 1)) * 10, fore: 10 }); }
  return { g, cam: [600, 1180, 1.0] };
};
// 13 — sentei do lado dela. não falei nada.
S[13] = (t, d) => {
  let g = patio() + bench(600, 1700, 1.2);
  g += sitPerson(CLARA, 720, 1520, 0.9, { expr: 'sad', hl: [-80, -260], hr: [80, -260], fore: 3 });
  g += sitPerson(KAI, 470, 1520, 0.95, { expr: 'neutral', lx: 1, fore: '0' });
  return { g, cam: [600, 1150, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 14 — "Kai! Olha a sua testa!"
S[14] = (t, d) => {
  const aK = findW(14, /^kai/) - 0.3;
  let g = gate();
  g += KAIs({ x: 330, y: 1900, s: 1.0, expr: t > aK + 0.5 ? 'surprised' : 'neutral', fore: '?', lx: 1 });
  g += pp(TEO, { x: 800, y: 1900, s: 0.95, sx: -1, expr: 'surprised', hr: [230, -380], fore: 10 });
  g += say(380, 560, 640, 'KAI! OLHA A SUA TESTA!', 44, 'left', '#FFFFFF', t, aK);
  return { g, cam: [540, 1150, 1.0] };
};
// 15 — UM.
S[15] = (t, d) => {
  let g = rays(t, '#F08A4A', '#FFE3A0');
  g += KAIs({ x: 540, y: 2400, s: 1.8, expr: t > 1.0 ? 'happy' : 'surprised', fore: 1 });
  for (let i = 0; i < 8; i++) { const k = ((t * 0.4 + i / 8) % 1); g += sparkle(150 + (i * 137) % 800, 1300 - k * 900, 0.8 * (1 - k)); }
  return { g, cam: [540, 980, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 16 — ajudei o menino novo (2), emprestei o caderno (3)
S[16] = (t, d) => {
  const aD = findW(16, /dois/) - 0.2, aE = findW(16, /emprestei/) - 0.2, aT = findW(16, /três/) - 0.2;
  if (t < aE) {
    let g = lockersLike() + R(760, 760, 240, 740, 8, '#7A4A2A', 9) + R(780, 690, 200, 60, 10, '#FFFFFF', 6) + T(880, 726, 'SALA 7', 36, '#1A1210');
    g += KAIs({ x: 380, y: 1900, s: 1.0, expr: 'happy', hr: [260, -380], fore: t > aD ? 2 : 1 }) + pp(NOVO, { x: 600, y: 1880, s: 0.9, expr: 'happy', fore: 5 });
    return { g, cam: [540, 1180, 1.0] };
  }
  let g = classroom() + schoolDesk(540, 1640, 1.3);
  g += KAIs({ x: 320, y: 1950, s: 1.0, expr: 'happy', hr: [240, -260], fore: t > aT ? 3 : 2 }) + pp(DORME, { x: 760, y: 1950, s: 0.95, sx: -1, expr: 'happy', fore: 7 });
  g += G(`translate(${lerp(400, 600, prog(t, aE, aE + 0.6))},1560)`, R(-80, -60, 160, 110, 8, '#2C6FB6', 6) + Ln(-60, -30, 60, -30, '#FFFFFF', 5));
  return { g, cam: [540, 1180, 1.0] };
};
function lockersLike() { let g = room('#CFE0EA', '#B9A98A', 1500); for (let i = 0; i < 5; i++) { const x = -40 + i * 145; g += R(x, 640, 135, 860, 6, i % 2 ? '#3F86CF' : '#3878BE', 6) + Ln(x + 30, 700, x + 105, 700, 'rgba(0,0,0,0.25)', 6) + R(x + 100, 1040, 14, 50, 4, '#D9DCE3', 4); } return g; }
// 17 — re-gancho: a maior surpresa veio no último dia
S[17] = (t, d) => {
  const aU = findW(17, /último/) - 0.2;
  let g = gate();
  for (let i = 0; i < 30; i++) { const r = rng(i + 3), x = r() * 1080, sp = 200 + r() * 200, y = ((r() * 2000 + t * sp) % 2000) - 100; g += R(x, y, 16, 26, 3, ['#E04B3C', '#F2B636', '#3F86CF', '#3E9B4A'][i % 4], 0); }
  g += G(`translate(540,560) scale(${pop1(t, aU)}) rotate(-3)`, R(-380, -90, 760, 180, 40, '#FFE14D', 0) + T(0, 8, 'ÚLTIMO DIA', 92, '#1A1210'));
  g += KAIs({ x: 540, y: 1900, s: 1.0, expr: 'happy', fore: 3 });
  return { g, cam: [540, 1150, 1.0] };
};
// 18 — o bilhete da Clara
S[18] = (t, d) => {
  const aB = findW(18, /bilhete/) - 0.2, aV = findW(18, /^você/) - 0.2;
  if (t < aB + 0.6) {
    let g = gate();
    g += pp(CLARA, { x: 640, y: 1900, s: 0.95, sx: -1, expr: 'happy', hr: [240, -260], fore: 10 }) + KAIs({ x: 330, y: 1900, s: 1.0, expr: 'surprised', fore: 3 });
    g += G(`translate(470,1520) scale(0.3) rotate(-10)`, note(0, 0, 1, 0, []));
    return { g, cam: [540, 1150, 1.0] };
  }
  const ls = ['Naquele dia, eu ia', 'sair da escola', 'pra sempre.', '', t > aV ? 'Você não falou nada…' : '', t > aV + 1.5 ? 'e foi exatamente o' : '', t > aV + 1.5 ? 'que eu precisava.' : '', '', t > aV + 2.5 ? '— Clara' : ''];
  let g = rays(t, '#C9708A', '#F7C99A') + note(540, 960, 1.5, -2, ls);
  return { g, cam: [540, 960, 1.0 + 0.04 * eio(prog(t, aB, d))] };
};
// 19 — dez na testa dela; ela começou a sentar do lado de quem tava sozinho
S[19] = (t, d) => {
  const aD = findW(19, /^dez/) - 0.2, aE = findW(19, /começado/) - 0.2;
  if (t < aE) {
    let g = rays(t, '#C9708A', '#F7C99A') + pp(CLARA, { x: 540, y: 2350, s: 1.75, expr: 'happy', fore: t > aD ? 10 : undefined });
    return { g, cam: [540, 980, 1.0] };
  }
  let g = patio() + bench(540, 1700, 1.2);
  g += sitPerson(CLARA, 420, 1520, 0.9, { expr: 'happy', lx: 1, hr: [200, -250], fore: 10 }) + sitPerson(NOVO, 680, 1520, 0.85, { expr: t > aE + 1.2 ? 'happy' : 'sad', fore: 5 });
  return { g, cam: [540, 1150, 1.0] };
};
// 20 — o meu um virou o dez dela
S[20] = (t, d) => {
  const aV = findW(20, /virou/) - 0.2;
  let g = rays(t, '#F08A4A', '#FFE3A0');
  g += G(`translate(270,760) scale(${pop1(t, 0.3)})`, C(0, 0, 150, '#1A1210', 8) + T(0, 14, '1', 180, '#FFE14D'));
  if (t > aV) g += G(`translate(540,760) scale(${pop1(t, aV)})`, P('M-90,-30 L40,-30 L40,-80 L120,0 L40,80 L40,30 L-90,30Z', '#FFFFFF', 8)) + G(`translate(810,760) scale(${pop1(t, aV + 0.4)})`, C(0, 0, 150, '#1A1210', 8) + T(0, 14, '10', 160, '#FFE14D'));
  g += KAIs({ x: 330, y: 1960, s: 1.0, expr: 'happy', fore: 3 }) + pp(CLARA, { x: 760, y: 1960, s: 0.95, sx: -1, expr: 'happy', fore: 10 });
  return { g, cam: [540, 1080, 1.0] };
};
// 21 — CTA
S[21] = (t, d) => {
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += KAIs({ x: 540, y: 2250, s: 1.5, expr: 'happy', fore: '?' });
  return { g, cam: [540, 1000, 1.0] };
};
function titleOverlay(t) {
  if (t > 5.2) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 4.8, 5.2);
  return G(`translate(540,230) scale(${k * out})`, R(-510, -140, 1020, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -45, 'NESSA ESCOLA, A NOTA', 64, '#FFFFFF') + T(0, 60, 'APARECE NA TESTA', 80, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[21].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,260) scale(${k})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -45, 'QUAL SERIA', 76, '#FFFFFF') + T(0, 52, 'A SUA NOTA?', 84, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
