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
// ================= "No dia em que os mortos puderam ligar por 1 minuto" =================
const KAIs = (o) => person(Object.assign({}, KAI, o));
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
const VOVO = { skin: '#E8B98F', shirt: '#9A6B45', pants: '#4A4A55', hair: 'bald', hairCol: '#EDEAE3', mustache: true, shoe: '#3A2A20', tie: null, collar: '#F4EAD8' };
const VIZ = { skin: '#D9A47A', shirt: '#3E9B4A', pants: '#3A3F4B', hair: 'bun', hairCol: '#2A1C14', shoe: '#2B2B2B', tie: null };
const MENINO = { skin: '#F5D2B0', shirt: '#F2B636', pants: '#2E3A5C', hair: 'curly', hairCol: '#5A3A22', shoe: '#C62A2A', tie: null, hs: 1.3 };
const PAI_PALE = Object.assign({}, PAI, { skin: '#F1E2D3' });
window.CAMZ_OVR = { 2: [1.08, 60], 9: [1.1, 60], 10: [1.08, 60], 11: [1.1, 80], 19: [1.05, 60], 21: [1.08, 80] };

// ---------------- cronômetro da ligação (59 → 0 ao longo da conversa)
function timerAt(T) {
  const K = [[TL.lines[3].start, 59], [TL.lines[13].start, 40], [TL.lines[16].start, 20], [TL.lines[17].start, 10], [TL.lines[18].start + 0.3, 0]];
  if (T <= K[0][0]) return 59;
  for (let i = 0; i < K.length - 1; i++) if (T < K[i + 1][0]) return Math.round(lerp(K[i][1], K[i + 1][1], (T - K[i][0]) / (K[i + 1][0] - K[i][0])));
  return 0;
}
const fmt = (s) => '0:' + String(s).padStart(2, '0');
function levelHud(i, t) {
  if (i < 3 || i > 18) return '';
  const s = timerAt(t), red = s <= 20, pul = red ? 1 + 0.06 * Math.sin(t * 12) : 1;
  return G(`translate(540,110) scale(${pul})`, R(-170, -55, 340, 110, 34, red ? '#C62A2A' : '#1A1210', 8) + R(-130, -32, 34, 64, 8, '#FFFFFF', 0) + R(-124, -24, 22, 44, 4, red ? '#C62A2A' : '#1A1210', 0) + T(30, 6, fmt(s), 62, '#FFE14D'));
}
// ---------------- objetos
function miniVovo(expr = 'happy') { return head(Object.assign({}, VOVO, { expr })); }
function bigPhone(x, y, s, t, st = 'ring', name = 'VOVÔ', T0 = 0) {
  const sh = st === 'ring' ? Math.sin(t * 38) * 4 : 0;
  const id = 'ph' + (ZID++);
  let g = R(-175, -340, 350, 680, 54, '#1A1A20', 8) + R(-70, -322, 140, 16, 8, '#33333C', 0);
  g += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st === 'dark' ? '#0C0C10' : '#3A4C7E'}"/><stop offset="1" stop-color="${st === 'dark' ? '#14141A' : '#1E2846'}"/></linearGradient>`;
  g += R(-152, -296, 304, 600, 34, `url(#${id})`, 0);
  if (st !== 'dark') {
    g += C(0, -150, 92, '#F6C46A', 6) + clipG('<circle cx="0" cy="-150" r="88"/>', G('translate(0,-138) scale(0.62)', miniVovo('happy')));
    g += T(0, -20, name, 60, '#FFFFFF');
    if (st === 'ring') {
      g += T(0, 40, 'chamada…', 34, '#BFD0F0');
      g += C(-80, 200, 46, '#3CC46A', 6) + C(80, 200, 46, '#E04B3C', 6) + P('M-98,190 q18,-24 36,0', 'none', 0) ;
      for (let i = 0; i < 3; i++) { const k = ((t * 1.2 + i / 3) % 1); g += `<circle cx="0" cy="-150" r="${100 + k * 120}" fill="none" stroke="rgba(246,196,106,${0.6 * (1 - k)})" stroke-width="10"/>`; }
    } else if (st === 'call') {
      const sec = timerAt(T0), red = sec <= 20;
      g += T(0, 70, fmt(sec), 96, red ? '#FF6B5E' : '#FFFFFF') + C(0, 220, 46, '#E04B3C', 6);
    } else if (st === 'end') {
      g += T(0, 50, '0:00', 96, '#8A93A8') + T(0, 140, 'CHAMADA', 40, '#8A93A8') + T(0, 190, 'ENCERRADA', 40, '#8A93A8');
    }
  } else g += T(0, 40, '0 chamadas', 40, '#55555F');
  g += R(-152, -296, 304, 600, 34, 'url(#vol)', 0);
  return G(`translate(${x + sh},${y}) rotate(${st === 'ring' ? Math.sin(t * 38) * 2 : 0}) scale(${s})`, g);
}
/** Janela dourada com o avô (a ligação). */
function callPanel(cx, cy, w, h, t, o = {}) {
  const id = 'cp' + (ZID++);
  let inner = `<radialGradient id="${id}" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stop-color="#FFF8E2"/><stop offset="1" stop-color="#F3B95A"/></radialGradient>` + R(cx - w / 2, cy - h / 2, w, h, 0, `url(#${id})`, 0);
  for (let i = 0; i < 5; i++) { const k = ((t * 0.04 + i / 5) % 1); inner += E(cx - w / 2 - 160 + k * (w + 320), cy + h / 2 - 50 - (i % 2) * 60, 150, 54, 'rgba(255,255,255,0.8)', 0); }
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.15; inner += Ln(cx + (o.dx || 0), cy - h * 0.05, cx + (o.dx || 0) + Math.cos(a) * w, cy - h * 0.05 + Math.sin(a) * w, 'rgba(255,255,255,0.18)', 40); }
  const s = (o.s || 1) * 1.45;
  inner += pp(VOVO, { x: cx + (o.dx || 0), y: cy - h * 0.02 + 474 * s, s, expr: o.expr || 'happy', hl: o.hl || [-150, -150], hr: o.hr || [150, -150], legs: false });
  let g = `<rect x="${cx - w / 2 - 14}" y="${cy - h / 2 - 14}" width="${w + 28}" height="${h + 28}" rx="70" fill="rgba(255,226,140,${0.35 + 0.1 * Math.sin(t * 3)})"/>`;
  g += clipG(`<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="60"/>`, inner) + R(cx - w / 2, cy - h / 2, w, h, 60, 'none', 8);
  return g;
}
function angryMark(x, y, s, t) { let g = ''; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78 + Math.sin(t * 9) * 0.1; g += Ln(x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s, x + Math.cos(a) * 44 * s, y + Math.sin(a) * 44 * s, '#E04B3C', 12 * s); } return g; }
function rain(t, n = 40, col = 'rgba(200,220,255,0.55)') { let g = ''; const r = rng(5); for (let i = 0; i < n; i++) { const x = r() * 1200 - 60, sp = 900 + r() * 500, y = ((r() * 2200 + t * sp) % 2200) - 140; g += Ln(x, y, x - 14, y + 60, col, 4); } return g; }
function umbrella(x, y, s, col = '#2A2A33') { return G(`translate(${x},${y}) scale(${s})`, P('M-170,0 Q-170,-150 0,-160 Q170,-150 170,0 Q140,-24 113,0 Q85,-24 57,0 Q28,-24 0,0 Q-28,-24 -57,0 Q-85,-24 -113,0 Q-140,-24 -170,0Z', col, 7) + Ln(0, -160, 0, 210, O, 10) + P('M0,210 q0,30 -26,30', 'none', 9)); }
function tomb(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, P('M-120,0 L-120,-200 Q-120,-300 0,-300 Q120,-300 120,-200 L120,0Z', '#9AA3AD', 8) + P('M-40,-220 L40,-220 M0,-260 L0,-160', 'none', 10) + T(0, -90, 'SAUDADE', 40, '#4A505C') + C(-150, -10, 26, '#E04B3C', 5) + C(-120, -24, 22, '#F2B636', 5) + C(150, -14, 24, '#F28FB0', 5)); }
function reportCard(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, R(-110, -140, 220, 280, 12, '#FFFFFF', 7) + T(0, -90, 'BOLETIM', 32, '#1A1210') + Ln(-70, -40, 70, -40, '#9AA6B8', 6) + Ln(-70, 0, 70, 0, '#9AA6B8', 6) + C(40, 70, 48, 'none', 0) + T(0, 80, 'PASSEI!', 44, '#3E9B4A')); }
function bikeIcon(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, C(-110, 40, 70, 'none', 0) + `<circle cx="-110" cy="40" r="70" fill="none" stroke="${O}" stroke-width="16"/><circle cx="110" cy="40" r="70" fill="none" stroke="${O}" stroke-width="16"/>` + `<path d="M-110,40 L-20,-60 L90,-60 L110,40 M-20,-60 L0,40 L-110,40" fill="none" stroke="#2C6FB6" stroke-width="14" stroke-linejoin="round"/>` + Ln(90, -60, 80, -110, O, 12)); }
function bookIcon(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, P('M0,-100 Q-80,-130 -160,-100 L-160,100 Q-80,70 0,100Z', '#C62A2A', 7) + P('M0,-100 Q80,-130 160,-100 L160,100 Q80,70 0,100Z', '#E0473A', 7) + Ln(-130, -50, -30, -66, '#FFE14D', 6) + Ln(30, -66, 130, -50, '#FFE14D', 6)); }
function hospital(t) { return R(0, 0, 440, 470, 0, '#DDEBF0', 0) + R(260, 60, 140, 120, 10, '#1A2330', 5) + P(`M270,${120} L300,120 L315,85 L330,150 L345,120 L390,120`, 'none', 0, '') + `<path d="M270,120 L300,120 L315,85 L330,150 L345,120 L390,120" fill="none" stroke="#5BFF8A" stroke-width="6"/>` + R(40, 300, 360, 70, 16, '#FFFFFF', 6) + R(50, 270, 110, 50, 20, '#F4F8FF', 5) + G('translate(110,280) rotate(-80) scale(0.38)', head(Object.assign({}, VOVO, { expr: 'sad' }))) + R(300, 380, 90, 20, 6, '#7A4A2A', 5) + R(300, 300, 20, 90, 6, '#7A4A2A', 5) + T(345, 260, '?', 70, '#C62A2A'); }
function sitPerson(d, x, y, s, o) {
  let g = '';
  for (const sd of [-1, 1]) g += limb(x + sd * 40 * s, y - 10 * s, x + sd * 46 * s, y + 160 * s, d.pants, 56 * s, 7) + E(x + sd * 52 * s, y + 175 * s, 50 * s, 26 * s, d.shoe);
  g += person(Object.assign({}, d, { x, y: y + 196 * 0.92 * s, s, legs: false }, o));
  return g;
}
function hallway() { return room('#E9DCC6', '#B9874F', 1500) + R(80, 700, 220, 800, 8, '#7A4A2A', 9) + R(780, 700, 220, 800, 8, '#7A4A2A', 9) + C(270, 1120, 12, '#F2B636', 5) + C(810, 1120, 12, '#F2B636', 5) + R(420, 640, 240, 180, 10, '#F4EAD8', 7) + G('translate(540,760) scale(0.45)', miniVovo('happy')); }

const S = [];
// 0 — gancho: o celular tocando "VOVÔ"
S[0] = (t, d) => {
  const aV = findW(0, /vovô/) - 0.15;
  let g = room('#6A7BB0', '#3E4A72', 1500) + R(700, 1300, 320, 200, 12, '#8A5A3A', 8);
  g += KAIs({ x: 830, y: 1880, s: 0.9, sx: -1, expr: 'surprised', hl: [-160, -300], hr: [160, -300] });
  g += bigPhone(480, 860 + Math.sin(t * 2) * 8, 1.2 * (1 + 0.06 * pop1(t, aV, 0.3) * (t < aV + 0.6 ? 1 : 0)), t, 'ring');
  return { g, cam: [540, 1000, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 1 — o avô morreu faz 2 anos; cada um ganhou 1 ligação de 1 minuto
S[1] = (t, d) => {
  const aC = findW(1, /^cada/) - 0.2, aD = findW(1, /dois/) - 0.15;
  if (t < aC) {
    let g = room('#E9DCC6', '#B9874F', 1500) + R(200, 1100, 680, 30, 6, '#8A5A3A', 7);
    g += R(400, 760, 280, 340, 16, '#7A4A2A', 8) + R(424, 784, 232, 292, 8, '#F6C46A', 0) + clipG('<rect x="424" y="784" width="232" height="292"/>', G('translate(540,930) scale(0.8)', miniVovo('happy')));
    g += R(280, 1010, 40, 90, 8, '#FFF6E0', 6) + P(`M300,1010 q${Math.sin(t * 8) * 6},-30 0,-50 q${-Math.sin(t * 8) * 6},20 0,50`, '#F2B636', 5);
    g += C(760, 1040, 24, '#E04B3C', 5) + C(790, 1010, 22, '#F28FB0', 5) + Ln(775, 1060, 775, 1100, '#3E9B4A', 8);
    g += G(`translate(540,600) scale(${pop1(t, aD)}) rotate(-4)`, R(-200, -60, 400, 120, 30, '#1A1210', 0) + T(0, 6, 'HÁ 2 ANOS', 60, '#FFE14D'));
    return { g, cam: [540, 960, 1.0 + 0.05 * eio(prog(t, 0, aC))] };
  }
  const aM = findW(1, /^de$/) - 0.15;
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += G(`translate(540,760) scale(${pop1(t, aC + 0.2)}) rotate(-3)`, R(-330, -90, 660, 180, 40, '#FFFFFF', 9) + T(0, 8, '1 LIGAÇÃO', 96, '#C62A2A'));
  g += G(`translate(540,1060) scale(${pop1(t, aM)}) rotate(3)`, R(-300, -80, 600, 160, 40, '#1A1210', 0) + T(0, 8, '1 MINUTO', 92, '#FFE14D'));
  g += clockFace(540, 1330, 90, -Math.PI / 2 + t * 0.4, -Math.PI / 2 + t * 6);
  return { g, cam: [540, 960, 1.0] };
};
// 2 — a rua: todo mundo no celular
S[2] = (t, d) => {
  let g = rays(t, '#9FC7E8', '#F6D9B0') + houseFront(-40, 1400, 420, 460, '#F2D2A0', '#B5523B') + houseFront(640, 1400, 460, 480, '#CFE3C8', '#3E6A8A') + R(-60, 1400, 1200, 700, 0, '#B9B4AA', 8) + R(-60, 1560, 1200, 600, 0, '#7A7F8A', 6);
  g += pp(VIZ, { x: 260, y: 1880, s: 1.0, expr: 'sad', hr: [150, -440], hl: [-120, -200] }) + tears(260, 1880 - 520, t, 0.8);
  g += C(260 + 150 * 0.92 * 0.95, 1880 - 400, 60, 'rgba(255,226,140,0.35)', 0);
  g += pp(MENINO, { x: 800, y: 1880, s: 0.7, sx: -1, expr: 'happy', hr: [150, -440], hl: [-140, -330], lift: Math.abs(Math.sin(t * 6)) * 16 });
  for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); g += heart(760 + i * 40, 1280 - k * 300, 0.6 * (1 - k)); }
  return { g, cam: [540, 1150, 1.0] };
};
// 3 — "Oi, campeão."
S[3] = (t, d) => {
  const aO = findW(3, /^oi/) - 0.2;
  let g = rays(t, '#2E3A6A', '#6A5A9A') + callPanel(540, 640, 860, 700, t, { expr: 'happy', hr: [160, -420] });
  g += KAIs({ x: 540, y: 2050, s: 1.15, expr: t > aO ? 'happy' : 'surprised', hr: [120, -420] });
  g += say(560, 1020, 420, 'OI, CAMPEÃO.', 50, 'left', '#FFFFFF', t, aO);
  return { g, cam: [540, 1000, 1.0] };
};
// 4 — mil coisas pra contar
S[4] = (t, d) => {
  const aP = findW(4, /passei/) - 0.2, aB = findW(4, /bicicleta/) - 0.25, aH = findW(4, /histórias/) - 0.25;
  let g = rays(t, '#F08A4A', '#F9D9A0');
  g += KAIs({ x: 540, y: 2000, s: 1.15, expr: 'happy', hr: [120, -420], hl: [-200, -330 + Math.sin(t * 10) * 30], lift: Math.abs(Math.sin(t * 5)) * 10 });
  g += G(`translate(230,620) scale(${pop1(t, aP)}) rotate(-6)`, reportCard(0, 0, 1.0));
  g += G(`translate(780,560) scale(${pop1(t, aB)}) rotate(5)`, bikeIcon(0, 0, 1.0));
  g += G(`translate(540,1000) scale(${pop1(t, aH)}) rotate(-2)`, bookIcon(0, 0, 0.9));
  return { g, cam: [540, 1000, 1.0] };
};
// 5 — "Eu só tenho um minuto. Passa pro seu pai."
S[5] = (t, d) => {
  const aS = findW(5, /^eu/) - 0.2, aP = findW(5, /passa/) - 0.2;
  let g = rays(t, '#2E3A6A', '#6A5A9A') + callPanel(540, 640, 860, 700, t, { expr: 'neutral', s: 1.05 });
  g += KAIs({ x: 540, y: 2050, s: 1.15, expr: t > aP + 0.3 ? 'surprised' : 'happy', hr: [120, -420] });
  g += say(80, 1020, 560, 'SÓ TENHO 1 MINUTO.', 44, 'right', '#FFFFFF', t, aS);
  g += say(380, 1200, 620, 'PASSA PRO SEU PAI.', 50, 'left', '#FFE14D', t, aP);
  return { g, cam: [540, 1000, 1.0 + 0.04 * eio(prog(t, aP, d))] };
};
// 6 — fiquei bravo
S[6] = (t, d) => {
  const aE = findW(6, /^era/) - 0.2;
  let g = rays(t, '#C9584A', '#F09A6A');
  g += KAIs({ x: 540, y: 2000, s: 1.2, expr: 'angry', hl: [-160, -200], hr: [120, -420] }) + angryMark(760, 1050, 1.6, t);
  g += G(`translate(540,620) scale(${pop1(t, aE)}) rotate(-4)`, R(-400, -110, 800, 220, 40, '#FFFFFF', 9) + T(0, -30, 'ERA A MINHA', 72, '#1A1210') + T(0, 52, 'LIGAÇÃO!', 84, '#C62A2A'));
  return { g, cam: [540, 1000, 1.0] };
};
// 7 — "aquele minuto ia mudar a minha família pra sempre"
S[7] = (t, d) => {
  const aM = findW(7, /mudar/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#14121C', 0) + P('M380,-60 L700,-60 L900,2000 L180,2000Z', 'rgba(255,230,170,0.10)', 0);
  g += bigPhone(540, 800, 0.9, t, 'call', 'VOVÔ', TNOW);
  g += G(`translate(540,1260) scale(${pop1(t, aM)})`, R(-420, -80, 840, 160, 36, '#FFE14D', 0) + T(0, 8, 'MUDOU TUDO', 90, '#1A1210'));
  return { g, cam: [540, 1000, 1.0 + 0.1 * eio(prog(t, 0, d))] };
};
// 8 — a briga; nunca foi no hospital; nunca pediu desculpa
S[8] = (t, d) => {
  const aB = findW(8, /brigaram/) - 0.2, aH = findW(8, /hospital/) - 0.2, aD = findW(8, /desculpa/) - 0.2;
  let g = R(-60, -60, 1200, 2200, 0, '#C9A57A', 0);
  const p1 = R(0, 0, 440, 470, 0, '#E9DCC6', 0) + pp(PAI, { x: 120, y: 470, s: 0.5, expr: 'angry' }) + pp(VOVO, { x: 320, y: 470, s: 0.5, sx: -1, expr: 'angry', hr: [190, -330] }) + angryMark(220, 120, 1, t);
  g += memPanel(60, 240, 440, 470, pop1(t, aB, 0.3), p1, 'b1', -2) + memPanel(580, 320, 440, 470, pop1(t, aH, 0.3), hospital(t), 'b2', 2);
  g = sepia(g);
  g += G(`translate(540,1180) scale(${pop1(t, aD)}) rotate(-3)`, R(-330, -70, 660, 140, 30, '#FFFFFF', 8) + T(0, 6, '"DESCULPA"', 70, '#1A1210')) + bigX(540, 1180, 1.6, t, aD + 0.4);
  return { g, cam: [540, 960, 1.0] };
};
// 9 — enterro: ele nem chorou
S[9] = (t, d) => {
  let g = rays(t, '#6A7280', '#9AA0AA') + R(-60, 1450, 1200, 700, 0, '#5E7A5A', 8) + tomb(860, 1480, 1.0);
  g += pp(PAI, { x: 480, y: 1900, s: 1.05, expr: 'neutral', hrot: 10, hl: [-60, -150], hr: [60, -150] }) + umbrella(480, 1100, 1.2, '#2A2A33');
  g += KAIs({ x: 200, y: 1900, s: 0.95, expr: 'sad', lx: 1 }) + umbrella(200, 1170, 1.0, '#3E4A72');
  g += rain(t);
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 10 — corri até o quarto do meu pai; o celular dele nunca tocou
S[10] = (t, d) => {
  const aQ = findW(10, /^ele$/) - 0.2, aN = findW(10, /nunca/) - 0.2;
  if (t < aQ) {
    let g = hallway() + speedLines(t, 'rgba(255,255,255,0.35)');
    const k = prog(t, 0, aQ);
    g += KAIs({ x: lerp(-100, 1100, k), y: 1900 - Math.abs(Math.sin(t * 9)) * 26, s: 1.0, rot: 8, expr: 'worried', hl: [-150 + Math.sin(t * 9) * 80, -200], hr: [150 - Math.sin(t * 9) * 80, -200] });
    return { g, cam: [540, 1180, 1.0] };
  }
  let g = room('#5E6A86', '#3E4660', 1500) + nightWin(640, 480) + R(140, 1340, 800, 160, 20, '#8A5A3A', 8) + R(160, 1280, 760, 90, 30, '#7A90C8', 7);
  g += sitPerson(PAI, 540, 1330, 1.0, { expr: 'sad', hl: [-60, -150], hr: [60, -150], hrot: 8 });
  g += G(`translate(540,${1330 - 120})`, R(-34, -60, 68, 120, 12, '#1A1A20', 5) + R(-26, -50, 52, 96, 6, '#0C0C10', 0));
  if (t > aN) g += G(`translate(820,760) scale(${pop1(t, aN)}) rotate(6)`, bigPhone(0, 0, 0.55, t, 'dark'));
  return { g, cam: [540, 1180, 1.0] };
};
// 11 — "Pai… é o vovô."
S[11] = (t, d) => {
  const aP = findW(11, /^pai/) - 0.25;
  let g = room('#5E6A86', '#3E4660', 1500) + R(-60, 1340, 760, 160, 20, '#8A5A3A', 8) + R(-60, 1280, 740, 90, 30, '#7A90C8', 7);
  g += sitPerson(PAI, 320, 1330, 1.0, { expr: 'surprised', lx: 1 });
  g += KAIs({ x: 820, y: 1900, s: 1.0, sx: -1, expr: 'sad', hr: [200, -320] });
  g += bigPhone(620, 1240, 0.42, t, 'call', 'VOVÔ', TNOW);
  g += say(380, 560, 560, 'PAI... É O VOVÔ.', 50, 'right', '#FFFFFF', t, aP);
  return { g, cam: [540, 1180, 1.0] };
};
// 12 — ficou branco; as mãos tremiam
S[12] = (t, d) => {
  const aM = findW(12, /mãos/) - 0.2;
  const sh = t > aM ? Math.sin(t * 50) * 10 : 0;
  let g = rays(t, '#4A5276', '#7A82A6');
  g += pp(PAI_PALE, { x: 540, y: 1800, s: 1.6, expr: 'surprised', hl: [-40 + sh, -60], hr: [40 - sh, -60] });
  g += bigPhone(540 + sh, 1420, 0.36, t, 'call', 'VOVÔ', TNOW);
  for (const sx of [-1, 1]) if (t > aM) g += P(`M${540 + sx * 230},1400 l${sx * 30},-20 M${540 + sx * 230},1450 l${sx * 36},0`, 'none', 0, '') + `<path d="M${540 + sx * 150},1360 l${sx * 40},-24 M${540 + sx * 160},1420 l${sx * 46},0 M${540 + sx * 150},1480 l${sx * 40},24" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>`;
  return { g, cam: [540, 960, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 13 — faltavam 40 segundos
S[13] = (t, d) => {
  let g = rays(t, '#5A2230', '#A0404A') + bigPhone(540, 960, 1.1 + 0.03 * Math.sin(t * 8), t, 'call', 'VOVÔ', TNOW);
  return { g, cam: [540, 960, 1.0] };
};
// 14 — o pai não conseguiu falar nada. só chorou.
S[14] = (t, d) => {
  const aC = findW(14, /chorou/) - 0.2;
  let g = room('#5E6A86', '#3E4660', 1500) + R(-60, 1340, 1200, 160, 20, '#8A5A3A', 8);
  g += sitPerson(PAI, 540, 1330, 1.25, { expr: 'sad', hr: [130, -430], hl: [-130, -200] });
  if (t > aC) g += tears(540, 1330 + 196 * 0.92 * 1.25 - 520 * 1.25 * 0.92 + 30, t, 1.0);
  g += say(120, 560, 360, '...', 80, 'right', '#FFFFFF', t, 0.5);
  return { g, cam: [540, 1100, 1.0 + 0.06 * eio(prog(t, 0, d))] };
};
// 15 — "Filho… eu também te peço desculpa."
S[15] = (t, d) => {
  const aF = findW(15, /filho/) - 0.2, aT = findW(15, /também/) - 0.2;
  let g = rays(t, '#2E3A6A', '#6A5A9A') + callPanel(540, 640, 860, 700, t, { expr: 'sad', s: 1.05 });
  g += pp(PAI, { x: 540, y: 2060, s: 1.15, expr: 'sad', hr: [120, -420] }) + tears(540, 2060 - 520 * 1.15 * 0.92 + 40, t, 1.0);
  g += say(80, 1020, 380, 'FILHO...', 52, 'right', '#FFFFFF', t, aF);
  g += say(300, 1200, 720, 'EU TAMBÉM TE PEÇO DESCULPA.', 38, 'left', '#FFE14D', t, aT);
  return { g, cam: [540, 1000, 1.0] };
};
// 16 — 20 s: "Desculpa, pai. Eu tive medo de te ver morrendo."
S[16] = (t, d) => {
  const aD = findW(16, /^desculpa/) - 0.2, aM = findW(16, /medo/) - 0.4;
  let g = rays(t, '#5A2230', '#A0404A');
  g += pp(PAI, { x: 540, y: 1950, s: 1.6, expr: 'sad', hr: [110, -420] }) + tears(540, 1950 - 474 * 1.6 + 60, t, 1.3);
  g += say(120, 420, 520, 'DESCULPA, PAI.', 56, 'right', '#FFFFFF', t, aD);
  g += say(120, 640, 840, 'EU TIVE MEDO DE TE VER MORRENDO.', 38, 'right', '#FFE14D', t, aM);
  return { g, cam: [540, 960, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 17 — 10 s: "Cuida do meu campeão."
S[17] = (t, d) => {
  const aC = findW(17, /cuida/) - 0.2;
  let g = rays(t, '#2E3A6A', '#F0A070') + callPanel(540, 620, 860, 660, t, { expr: 'happy', s: 1.0, hr: [170, -330] });
  g += pp(PAI, { x: 360, y: 2000, s: 1.05, expr: 'sad', hr: [120, -420] }) + KAIs({ x: 760, y: 2000, s: 0.95, sx: -1, expr: 'sad' });
  g += say(220, 1000, 640, 'CUIDA DO MEU CAMPEÃO.', 44, 'left', '#FFE14D', t, aC);
  return { g, cam: [540, 1000, 1.0] };
};
// 18 — a ligação caiu
S[18] = (t, d) => {
  let g = R(-60, -60, 1200, 2200, 0, '#0E0D14', 0);
  g += bigPhone(540, 960, 1.0, t, t > 0.5 ? 'end' : 'call', 'VOVÔ', TNOW);
  return { g, cam: [540, 960, 1.0 - 0.04 * eio(prog(t, 0, d))] };
};
// 19 — o abraço; a primeira vez que vi meu pai chorar
S[19] = (t, d) => {
  let g = rays(t, '#C9708A', '#F7C99A');
  g += pp(PAI, { x: 620, y: 1900, s: 1.1, sx: -1, expr: 'sad', hr: [180, -380], hl: [-150, -300] }) + tears(620, 1900 - 520 * 1.1 * 0.92 + 40, t, 0.9);
  g += KAIs({ x: 470, y: 1900, s: 1.0, expr: 'sleep', hr: [200, -390], hl: [-150, -300] });
  for (let i = 0; i < 5; i++) { const k = ((t * 0.45 + i / 5) % 1); g += heart(380 + i * 80, 1000 - k * 500, 0.9 * (1 - k)); }
  return { g, cam: [540, 1150, 1.0 + 0.05 * eio(prog(t, 0, d))] };
};
// 20 — ele sabia que o meu pai não ia atender
S[20] = (t, d) => {
  const aS = findW(20, /sabia/) - 0.2, aA = findW(20, /atender/) - 0.3;
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += KAIs({ x: 540, y: 2050, s: 1.15, expr: 'sad', lx: 0 });
    if (t > aS) g += G(`translate(540,900) scale(${pop1(t, aS)})`, bigPhone(0, 0, 0.62, t, 'ring')) + bigX(540, 900, 2.2, t, aA);
  if (t > aA) g += G(`translate(540,1360) scale(${pop1(t, aA + 0.2)}) rotate(-3)`, R(-400, -70, 800, 140, 30, '#1A1210', 0) + T(0, 6, 'ELE NÃO IA ATENDER', 58, '#FFE14D'));
  return { g, cam: [540, 960, 1.0] };
};
// 21 — hoje meu pai me chama de campeão
S[21] = (t, d) => {
  const aC = findW(21, /campeão/) - 0.2;
  let g = rays(t, '#F08A4A', '#F9D9A0') + sun(800, 420, 90, t) + R(-60, 1450, 1200, 700, 0, '#7CB65A', 8);
  g += bikeIcon(780, 1730, 0.9);
  g += pp(PAI, { x: 330, y: 1900, s: 1.05, expr: 'happy', hr: [170, -440], hl: [-140, -200] });
  g += KAIs({ x: 640, y: 1900, s: 0.95, sx: -1, expr: 'happy' });
  g += say(80, 680, 520, 'BOA, CAMPEÃO!', 52, 'right', '#FFFFFF', t, aC);
  g += sparkle(880, 300 + Math.sin(t * 2) * 10, 1.2);
  return { g, cam: [540, 1150, 1.0] };
};
// 22 — CTA: quem você queria que te ligasse?
S[22] = (t, d) => {
  let g = rays(t, '#3B4F8A', '#F0A070');
  g += KAIs({ x: 760, y: 1950, s: 1.05, sx: -1, expr: 'surprised' });
  g += bigPhone(400, 1080, 0.85, t, 'ring', '???');
  return { g, cam: [540, 1000, 1.0] };
};
function titleOverlay(t) {
  if (t > 5.2) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 4.8, 5.2);
  return G(`translate(540,230) scale(${k * out})`, R(-510, -140, 1020, 280, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -45, 'NO DIA EM QUE OS MORTOS', 60, '#FFFFFF') + T(0, 60, 'PUDERAM LIGAR', 86, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[22].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(540,260) scale(${k})`, R(-500, -140, 1000, 280, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -45, 'QUEM VOCÊ QUERIA', 70, '#FFFFFF') + T(0, 52, 'QUE TE LIGASSE?', 78, '#FFE14D'))
    + G(`translate(540,${1700 + Math.sin(t * 8) * 18})`, P('M-60,-60 L60,-60 L60,20 L110,20 L0,120 L-110,20 L-60,20Z', '#FFE14D', 9));
}
