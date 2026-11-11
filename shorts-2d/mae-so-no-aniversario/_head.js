
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

