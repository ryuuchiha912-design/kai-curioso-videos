// ================= LONGO 1 — "E se você ficasse 1 ano MAIS NOVO todo dia?" (16:9) =================
// ---------- fundo 3D: imagens pré-carregadas atrás do SVG, com a mesma câmera
const BG_NAMES = ['banheiro', 'quarto', 'quartoNoite', 'sala', 'escritorio', 'banco', 'mercado', 'consultorio', 'infancia', 'infanciaNoite', 'maeSala', 'maeSalaNoite', 'maeCozinha', 'escola', 'rua', 'ruaTarde'];
const BGW = document.createElement('div');
BGW.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:#000;z-index:0';
const BGI = document.createElement('div'); BGI.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'; BGW.appendChild(BGI);
const BGIMG = {};
for (const n of BG_NAMES) { const im = document.createElement('img'); im.src = 'bg/' + n + '.png'; im.style.cssText = 'position:absolute;left:-192px;top:-108px;width:2304px;height:1296px;display:none;filter:blur(1.1px) saturate(1.12)'; BGI.appendChild(im); BGIMG[n] = im; }
document.body.insertBefore(BGW, document.body.firstChild);
document.getElementById('s').style.cssText = 'position:absolute;left:0;top:0;z-index:1';
let BGCUR = null;
function applyBg(name, cam, punch) {
  if (BGCUR !== name) { if (BGCUR && BGIMG[BGCUR]) BGIMG[BGCUR].style.display = 'none'; if (name && BGIMG[name]) BGIMG[name].style.display = 'block'; BGCUR = name; }
  if (name) BGI.style.transform = `translate(960px,540px) scale(${cam[2] * punch}) translate(${-cam[0]}px,${-cam[1]}px)`;
}
window.bgReady = () => Promise.all(Object.values(BGIMG).map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; })));

// ---------- personagens
const pp = (d, o) => person(Object.assign({}, d, o));
const pop1 = (t, at, d = 0.25) => back(prog(t, at, at + d));
function neoAt(age, o = {}) {
  const K = [[30, 1.0, 0.85, 150, 70], [21, 0.97, 0.9, 136, 62], [16, 0.92, 0.98, 110, 50], [12, 0.82, 1.08, 80, 35], [8, 0.72, 1.2, 50, 20], [4, 0.58, 1.38, 15, 5], [2, 0.48, 1.5, 0, 0], [0, 0.4, 1.6, 0, 0]];
  let i = 0; while (i < K.length - 2 && age < K[i + 1][0]) i++;
  const [a0, s0, h0, l0, t0] = K[i], [a1, s1, h1, l1, t1] = K[i + 1], k = clamp((a0 - age) / (a0 - a1));
  return Object.assign({}, NEO, { s: lerp(s0, s1, k), hs: lerp(h0, h1, k), legX: lerp(l0, l1, k), torsoX: lerp(t0, t1, k) }, o);
}
const NEOp = (age, o) => person(neoAt(age, o));
// elenco próprio do canal (olhos de anime, cabelos e roupas que não existem no canal do Kai)
const LUCIA = { skin: '#F3CDB0', shirt: '#3E8A8A', inner: '#F6EAD8', stripe: '#2E6A6A', skirt: '#5A4A6A', pants: '#6A5A7A', shoe: '#4A2E22', hair: 'bob', hairCol: '#CFCBD6', anime: true, iris: '#8A5A3A', old: true, specs: '#6A4A3A', earring: '#F4F1EA', legX: 50, torsoX: 24, hs: 0.95 };
const LUCIA_J = Object.assign({}, LUCIA, { hairCol: '#3A2418', shirt: '#E08A5A', stripe: '#B5603A', old: false, specs: null, skirt: '#2C3E66', pants: '#F3CDB0' });   // a mãe 30 anos atrás
const xt = (o) => Object.assign({ anime: true, tie: null, shoe: '#2B2B2B', pants: '#2E3442', legX: 60, torsoX: 25, hs: 0.95 }, o);
const CHEFE = xt({ skin: '#E8B98F', shirt: '#2C3550', tie: '#C62A2A', hair: 'side', hairCol: '#4A4A55', stubble: true, iris: '#5A4A3A', legX: 70 });
const MOCA = xt({ skin: '#D9A47A', shirt: '#2C6F5A', inner: '#F4F4F4', stripe: '#F4F4F4', hair: 'pony', hairCol: '#8A3A22', iris: '#3E8A6A', earring: '#E0B13A' });
const GERENTE = xt({ skin: '#F1C7A0', shirt: '#5A6070', tie: '#2C6FB6', hair: 'side', hairCol: '#1B1716', specs: '#2A2A33', iris: '#3A4A6A' });
const COLEGA1 = xt({ skin: '#F5D2B0', shirt: '#7A5AC8', hair: 'spiky', hairCol: '#C7782E', iris: '#4A8A3A' });
const COLEGA2 = xt({ skin: '#C88F66', shirt: '#E07B9A', hair: 'wavy', hairCol: '#2A1C14', iris: '#6A3A2A', earring: '#F2B636', skirt: '#2E3442', pants: '#C88F66' });
const CAIXA = xt({ skin: '#C88F66', shirt: '#3E9B4A', apron: '#C62A2A', hair: 'buzz', hairCol: '#2A211C', iris: '#4A3A2A', stubble: true });
const MEDICO = xt({ skin: '#F5D2B0', shirt: '#FFFFFF', longCoat: true, inner: '#9FC7E8', stripe: '#DDE3EA', hair: 'side', hairCol: '#B8B4AE', specs: '#3A3F4B', iris: '#3A5A7A', legX: 70 });
const KID1 = xt({ skin: '#E8B98F', shirt: '#2C6FB6', hair: 'spiky', hairCol: '#3A2418', iris: '#5A3A22', hs: 1.2, legX: 0, torsoX: 0 });
const KID2 = xt({ skin: '#F1C7A0', shirt: '#F28FB0', hair: 'pony', hairCol: '#E0B13A', iris: '#3A7AC8', skirt: '#2C3E66', pants: '#F1C7A0', hs: 1.2, legX: 0, torsoX: 0 });
const PAIV = xt({ skin: '#E8B98F', shirt: '#5A6070', hair: 'side', hairCol: '#2A211C' });
const MAEESC = xt({ skin: '#D9A47A', shirt: '#C2A04A', hair: 'wavy', hairCol: '#6A4A2A', iris: '#5A3A22', skirt: '#3A3F4B', pants: '#D9A47A' });
// ---------- dias e idade (contador)
const DAYK = [[3, 1], [4, 2], [5, 3], [6, 5], [7, 6], [9, 7], [12, 9], [15, 10], [16, 12], [21, 13], [24, 15], [29, 16], [32, 18], [33, 19], [35, 20], [39, 22], [42, 24], [46, 25], [49, 26], [52, 28], [54, 29], [59, 30]];
function dayAt(T) { let d = 1; for (const [L, v] of DAYK) if (T >= TL.lines[L].start - 0.15) d = v; return d; }
const ageNow = () => 30 - dayAt(TNOW);
function levelHud(i, t) {
  if (i < 3 || i > 59) return '';
  const d = dayAt(t), a = 30 - d, k = pop1(t, TL.lines[DAYK.find(x => x[1] === d)?.[0] ?? 3].start - 0.15, 0.3);
  return G('translate(70,62)', R(0, 0, 210, 74, 26, '#1A1210', 6) + T(105, 40, `DIA ${d}`, 44, '#FFFFFF')) + G(`translate(296,62)`, R(0, 0, 250, 74, 26, a <= 3 ? '#C62A2A' : '#F7D64A', 6) + G(`translate(125,40) scale(${0.8 + 0.2 * k})`, T(0, 0, `${a} ${a === 1 ? 'ANO' : 'ANOS'}`, 44, a <= 3 ? '#FFFFFF' : '#1A1210')));
}
// ---------- utilidades de cena
const sc = (bg, g, cam = [960, 540, 1]) => ({ bg, g, cam });
const drift = (t, d, a, b) => { const k = eio(prog(t, 0, d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; };
function rays(t, c1, c2) { const id = 'bg' + (ZID++); let g = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` + R(-200, -200, 2320, 1480, 0, `url(#${id})`, 0); g += `<radialGradient id="${id}g"><stop offset="0" stop-color="#FFF0D2" stop-opacity="0.35"/><stop offset="1" stop-color="#FFF0D2" stop-opacity="0"/></radialGradient>` + C(960, 600, 700, `url(#${id}g)`, 0); const r = rng(11); for (let i = 0; i < 26; i++) { const x = r() * 1920, y = ((r() * 1080 - t * (20 + r() * 30)) % 1080 + 1080) % 1080; g += C(x, y, 3 + r() * 4, `rgba(255,250,230,${0.35 + 0.3 * Math.sin(t * 2 + i)})`, 0); } return g; }
const dark = (a = 0.55) => R(-200, -200, 2320, 1480, 0, `rgba(10,8,20,${a})`, 0);
function badgeB(x, y, k, txt, bg = '#1A1210', fg = '#FFE14D', size = 64, rot = -3) { if (k <= 0) return ''; const w = txt.length * size * 0.62 + 70; return G(`translate(${x},${y}) scale(${k}) rotate(${rot})`, R(-w / 2, -size * 0.85, w, size * 1.7, size * 0.5, bg, 7) + T(0, 6, txt, size, fg)); }
function bigTxt(x, y, k, l1, l2, c1 = '#FFFFFF', c2 = '#FFE14D', s1 = 70, s2 = 86) { if (k <= 0) return ''; return G(`translate(${x},${y}) scale(${k})`, T(0, -s2 * 0.55, l1, s1, c1, 14) + (l2 ? T(0, s1 * 0.75, l2, s2, c2, 16) : '')); }
function mirror2d(x, y, w, h, inner) { return R(x - w / 2 - 18, y - h / 2 - 18, w + 36, h + 36, 30, '#8FA4B3', 7) + clipG(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="20"/>`, R(x - w / 2, y - h / 2, w, h, 0, '#CFE9F5', 0) + inner + `<path d="M${x - w * 0.35},${y + h * 0.1} L${x - w * 0.05},${y - h * 0.45}" stroke="rgba(255,255,255,0.55)" stroke-width="26"/>`); }
const neoHead = (age, o = {}) => head(Object.assign(neoAt(age), { hs: 1 }, o));
function phoneB(x, y, s, title, lines = [], t = 0, ring = 0) { const sh = ring ? Math.sin(t * 40) * 5 : 0; let g = R(-150, -280, 300, 560, 40, '#1A1A20', 8) + R(-132, -250, 264, 500, 24, '#F4F6FA', 0) + R(-132, -250, 264, 70, 24, '#2E7D5A', 0) + T(0, -212, title, 32, '#FFFFFF'); lines.forEach((l, i) => { const k = l[1]; if (k <= 0) return; g += G(`translate(${l[2] ? 20 : -20},${-130 + i * 110}) scale(${k})`, R(-110, -40, 220, 84, 18, l[2] ? '#DCF8C6' : '#FFFFFF', 4) + T(0, 4, l[0], 24, '#1A1210')); }); return G(`translate(${x + sh},${y}) scale(${s})`, g); }
function idCard(x, y, s, age) { return G(`translate(${x},${y}) scale(${s})`, R(-220, -140, 440, 280, 24, '#BFE3C8', 7) + R(-200, -120, 160, 200, 12, '#FFFFFF', 5) + clipG('<rect x="-200" y="-120" width="160" height="200" rx="12"/>', G('translate(-120,-10) scale(0.62)', neoHead(age, { expr: 'neutral' }))) + T(90, -80, 'IDENTIDADE', 30, '#2C6F5A') + R(0, -40, 190, 18, 6, '#8FB59A', 0) + R(0, 0, 160, 18, 6, '#8FB59A', 0) + R(0, 40, 180, 18, 6, '#8FB59A', 0) + T(90, 100, `${age} ANOS`, 30, '#1A1210')); }
function polaroid(x, y, s, rot, age, lab) { return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, R(-130, -150, 260, 300, 10, '#FFFFFF', 6) + R(-110, -130, 220, 200, 4, '#CFE6F2', 0) + clipG('<rect x="-110" y="-130" width="220" height="200"/>', G('translate(0,-20) scale(0.7)', neoHead(age, { expr: 'neutral' }))) + T(0, 110, lab, 34, '#1A1210')); }
function note(x, y, s, rot, lines, child = false) { let g = R(-330, -400, 660, 800, 14, '#FFF8E6', 7) + R(-330, -400, 660, 800, 14, 'url(#vol)', 0) + Ln(-250, -400, -250, 400, 'rgba(220,80,80,0.4)', 4); for (let i = 0; i < 11; i++) g += Ln(-320, -300 + i * 64, 320, -300 + i * 64, 'rgba(120,150,200,0.45)', 3); lines.forEach((l, i) => { if (!l) return; g += T(child ? 0 : -230, -318 + i * 64, l, child ? 50 : 36, child ? '#3A3FAA' : '#2C3E66', 0, child ? `transform="rotate(${(i % 2 ? 2 : -2)} 0 ${-318 + i * 64})"` : 'text-anchor="start"'); }); return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, g); }
function pills(x, y, s) { let g = ''; [['#E04B3C', -70], ['#2C6FB6', 0], ['#F2B636', 70]].forEach(([c, dx]) => { g += R(dx - 26, -80, 52, 80, 10, '#FFFFFF', 5) + R(dx - 28, -100, 56, 26, 8, c, 5); }); return G(`translate(${x},${y}) scale(${s})`, g); }
function xray(x, y, s, t) { let g = R(-260, -300, 520, 600, 20, '#101826', 8) + C(0, -190, 70, 'none', 0, 'stroke="#BFE8FF" stroke-width="10"'); g += `<g stroke="#BFE8FF" stroke-width="10" fill="none" opacity="${0.75 + 0.25 * Math.sin(t * 4)}"><path d="M0,-120 L0,120 M-90,-90 L90,-90 M-60,-50 L60,-50 M-60,-10 L60,-10 M-60,30 L60,30 M-90,-90 L-150,60 M90,-90 L150,60 M0,120 L-60,280 M0,120 L60,280"/></g>`; return G(`translate(${x},${y}) scale(${s})`, g); }
function boneIcon(x, y, s) { return G(`translate(${x},${y}) scale(${s})`, C(-110, -26, 34, '#FFF8E6', 6) + C(-110, 26, 34, '#FFF8E6', 6) + C(110, -26, 34, '#FFF8E6', 6) + C(110, 26, 34, '#FFF8E6', 6) + R(-110, -24, 220, 48, 10, '#FFF8E6', 0) + Ln(-110, -24, 110, -24, O, 5) + Ln(-110, 24, 110, 24, O, 5)); }
function tooth(x, y, s, milk = false) { return G(`translate(${x},${y}) scale(${s})`, P('M-50,-60 Q0,-80 50,-60 Q70,0 40,30 L30,90 Q20,100 10,60 L0,40 L-10,60 Q-20,100 -30,90 L-40,30 Q-70,0 -50,-60Z', milk ? '#FFFDF5' : '#F2EBD8', 7) + E(-20, -40, 14, 8, 'rgba(255,255,255,0.8)', 0)); }
function brainIco(x, y, s, fade = 0) { let g = P('M-120,0 C-150,-100 -40,-150 0,-110 C40,-150 150,-100 120,0 C150,80 60,130 0,100 C-60,130 -150,80 -120,0Z', '#F4A3B8', 8) + P('M0,-110 L0,100 M-80,-40 Q-40,-60 -20,-20 M80,-40 Q40,-60 20,-20 M-90,40 Q-50,30 -30,60 M90,40 Q50,30 30,60', 'none', 7); return G(`translate(${x},${y}) scale(${s})`, `<g opacity="${1 - fade}">${g}</g>`); }
function babyHeld(x, y, s, sleep = false) { let g = E(0, 40, 150, 90, '#F4E6D8', 7) + E(0, 40, 150, 90, 'url(#vol)', 0) + G('translate(-80,-10) scale(0.62)', head(Object.assign(neoAt(0), { hs: 1, expr: sleep ? 'sleep' : 'neutral', blink: false }))); return G(`translate(${x},${y}) scale(${s})`, g); }
function notes(t, x, y) { let g = ''; for (let i = 0; i < 4; i++) { const k = ((t * 0.35 + i / 4) % 1); g += G(`translate(${x + Math.sin(k * 6 + i) * 40 + i * 30},${y - k * 300})`, `<g opacity="${1 - k}">` + C(0, 0, 14, '#FFF6C8', 4) + Ln(12, 0, 12, -50, O, 6) + Ln(12, -50, 36, -40, O, 6) + '</g>'); } return g; }
function sweatLines(x, y, t) { let g = ''; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) g += Ln(x + sd * (40 + i * 6), y - 20 + i * 26, x + sd * (66 + i * 6), y - 26 + i * 26, '#FFFFFF', 7); return g; }
function doorIn(x, y) { return ''; }
// chão onde os personagens pisam (frente)
const FY = 1030;

const S = [];
// 0 — gancho: espelho no aniversário de 30… 29
S[0] = (t, d) => { const a9 = findW(0, /nove/) - 0.2;
  let g = mirror2d(960, 360, 560, 440, G(`translate(960,${430}) scale(1.25)`, neoHead(29, { expr: t > a9 ? 'surprised' : 'neutral' })));
  g += NEOp(30, { x: 960, y: 1420, s: 1.25, back: true, expr: 'neutral' });
  g += badgeB(1430, 300, pop1(t, a9), '29 ANOS?!', '#C62A2A', '#FFFFFF', 64, 6);
  g += G(`translate(420,430) scale(${pop1(t, findW(0, /aniversário/) - 0.2)})`, R(-170, -60, 340, 120, 30, '#FFFFFF', 7) + T(0, 6, 'HOJE: 30', 52, '#C62A2A'));
  return sc('banheiro', g, drift(t, d, [960, 560, 1.0], [960, 470, 1.12])); };
// 1 — 28, 27… todo dia um ano mais novo
S[1] = (t, d) => { const a8 = findW(1, /oito/) - 0.2, a7 = findW(1, /sete/) - 0.2, aT = findW(1, /^todo/) - 0.2;
  const age = t > a7 ? 27 : t > a8 ? 28 : 29;
  let g = mirror2d(960, 400, 620, 500, G(`translate(960,${480}) scale(1.35)`, neoHead(age, { expr: 'surprised' })));
  g += badgeB(380, 380, pop1(t, a8), '28', '#1A1210', '#FFE14D', 110, -6) + badgeB(1540, 380, pop1(t, a7), '27', '#1A1210', '#FFE14D', 110, 6);
  g += badgeB(960, 900, pop1(t, aT), '-1 ANO POR DIA', '#C62A2A', '#FFFFFF', 62, -2);
  return sc('banheiro', g, [960, 520, 1.05]); };
// 2 — em 30 dias, zero. ninguém sabe o que acontece.
S[2] = (t, d) => { const aZ = findW(2, /zero/) - 0.2, aN = findW(2, /ninguém/) - 0.2;
  let g = rays(t, '#14121C', '#2A2340');
  const n = Math.max(0, Math.round(lerp(30, 0, prog(t, 0.3, aZ))));
  g += G(`translate(960,470) scale(${1 + 0.06 * Math.sin(t * 6) * (n === 0 ? 1 : 0)})`, T(0, 0, String(n), 300, n === 0 ? '#FF5A4E' : '#FFFFFF', 20));
  g += bigTxt(960, 830, pop1(t, aN), 'O QUE ACONTECE', 'NO ZERO?', '#FFFFFF', '#FFE14D', 64, 80);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 540, 1.08])); };
// 3 — parece um presente
S[3] = (t, d) => { const aP = findW(3, /presente/) - 0.3;
  let g = NEOp(29, { x: 820, y: FY, s: 0.95, expr: 'happy', hl: [-230, -480 + Math.sin(t * 6) * 20], hr: [230, -480 + Math.cos(t * 6) * 20], lift: Math.abs(Math.sin(t * 4)) * 14 });
  if (t > aP) g += G(`translate(1300,760) scale(${pop1(t, aP)}) rotate(6)`, R(-110, -90, 220, 180, 12, '#C62A2A', 7) + R(-16, -90, 32, 180, 0, '#F7D64A', 0) + R(-110, -16, 220, 32, 0, '#F7D64A', 0) + P('M0,-90 Q-60,-150 -70,-100 Q-40,-90 0,-90 Q40,-90 70,-100 Q60,-150 0,-90Z', '#F7D64A', 6));
  return sc('quarto', g, drift(t, d, [960, 560, 1.0], [960, 520, 1.06])); };
// 4 — dor nas costas, olheiras, cabelo branco: sumiram
S[4] = (t, d) => { const as = [findW(4, /costas/), findW(4, /olheiras/), findW(4, /cabelo/)].map(a => a - 0.2);
  let g = mirror2d(700, 470, 640, 560, G('translate(700,560) scale(1.5)', neoHead(28, { expr: 'happy' })) + (t < as[2] + 0.6 ? `<path d="M${700 + 170},${470} q20,40 -6,80" stroke="#F4F4F4" stroke-width="10" fill="none"/>` : ''));
  ['DOR NAS COSTAS', 'OLHEIRAS', 'CABELO BRANCO'].forEach((l, i) => { const k = pop1(t, as[i]); if (k <= 0) return; g += G(`translate(1420,${260 + i * 190}) scale(${k})`, R(-260, -55, 520, 110, 30, '#FFFFFF', 7) + T(-20, 6, l, 40, '#1A1210')) + G(`translate(1640,${260 + i * 190}) scale(${pop1(t, as[i] + 0.35)})`, C(0, 0, 38, '#3CC46A', 6) + `<path d="M-16,0 L-4,14 L18,-14" stroke="#fff" stroke-width="9" fill="none"/>`); });
  return sc('banheiro', g, [960, 540, 1.0]); };
// 5 — "Você tá diferente. Mudou alguma coisa?"
S[5] = (t, d) => { const aV = findW(5, /^você/) - 0.2, aS = findW(5, /sorri/) - 0.3;
  let g = pp(COLEGA1, { x: 430, y: FY, s: 0.82, sx: 1, expr: 'surprised', lx: 1 }) + pp(COLEGA2, { x: 1470, y: FY, s: 0.8, sx: -1, expr: 'sus', lx: -1 });
  g += NEOp(27, { x: 960, y: FY, s: 0.86, expr: t > aS ? 'happy' : 'neutral' });
  g += say(120, 170, 640, 'VOCÊ TÁ DIFERENTE...', 46, 'right', '#FFFFFF', t, aV) + say(1140, 210, 640, 'MUDOU ALGUMA COISA?', 46, 'left', '#FFFFFF', t, findW(5, /mudou/) - 0.2);
  return sc('escritorio', g, drift(t, d, [960, 560, 1.0], [960, 540, 1.05])); };
// 6 — dia 5: sobe 3 andares correndo
S[6] = (t, d) => { const aS = findW(6, /sobe/) - 0.2;
  let g = speedLines(t, 'rgba(255,255,255,0.0)');
  const k = prog(t, aS, d);
  g += NEOp(25, { x: lerp(200, 1700, k), y: FY - Math.abs(Math.sin(t * 10)) * 30, s: 0.9, rot: 10, expr: 'happy', hl: [-150 + Math.sin(t * 10) * 90, -260], hr: [150 - Math.sin(t * 10) * 90, -260] });
  for (let i = 0; i < 10; i++) { const y = 300 + i * 70; g += Ln(((i * 197 + t * 1600) % 2200) - 200, y, ((i * 197 + t * 1600) % 2200) + 60, y, 'rgba(255,255,255,0.6)', 6); }
  g += badgeB(960, 220, pop1(t, findW(6, /três/) - 0.2), '3 ANDARES, 0 CANSAÇO', '#1A1210', '#FFE14D', 56);
  return sc('rua', g, [960, 540, 1.0]); };
// 7 — selfies lado a lado: um filme voltando
S[7] = (t, d) => { const aF = findW(7, /fotos/) - 0.3;
  let g = NEOp(25, { x: 360, y: FY, s: 0.85, expr: 'neutral', hr: [170, -480] }) + G('translate(520,430) rotate(-10) scale(0.5)', R(-150, -280, 300, 560, 40, '#1A1A20', 8) + R(-132, -250, 264, 500, 24, '#BFE3F5', 0));
  [[29, 'DIA 1'], [27, 'DIA 3'], [25, 'DIA 5'], [23, 'DIA 7']].forEach(([a, l], i) => { const k = pop1(t, aF + i * 0.35); if (k > 0) g += polaroid(820 + i * 290, 440 + (i % 2) * 40, 0.95 * k, i % 2 ? 4 : -4, a, l); });
  if (t > aF + 1.6) g += badgeB(1250, 820, pop1(t, aF + 1.6), 'UM FILME VOLTANDO', '#C62A2A', '#FFFFFF', 54);
  return sc('banheiro', g, [960, 540, 1.0]); };
// 8 — começam os probleminhas
S[8] = (t, d) => { let g = NEOp(23, { x: 960, y: FY + 40, s: 1.0, expr: 'worried', sweat: true }) + sweatLines(960, 300, t);
  g += G(`translate(960,170) scale(${pop1(t, 0.2)})`, P('M0,-90 L100,80 L-100,80Z', '#F7D64A', 9) + T(0, 30, '!', 90, '#1A1210'));
  return sc('sala', g, drift(t, d, [960, 540, 1.0], [960, 500, 1.1])); };
// 9 — no banco: a moça olha a identidade… chama o gerente
S[9] = (t, d) => { const aI = findW(9, /identidade/) - 0.2, aG = findW(9, /gerente/) - 0.3;
  let g = pp(MOCA, { x: 960, y: 900, s: 0.75, expr: t > aG ? 'surprised' : 'sus', hr: t > aG ? [230, -420] : [120, -300], lx: t > aI && t < aI + 1.2 ? 1 : 0 });
  if (t > aI) g += G('translate(1130,560)', idCard(0, 0, 0.5 * pop1(t, aI), 30));
  g += NEOp(22, { x: 600, y: 1300, s: 1.0, back: true });
  if (t > aG) g += say(1140, 200, 520, 'GERENTE!', 56, 'left', '#FFFFFF', t, aG);
  return sc('banco', g, [960, 540, 1.0]); };
// 10 — foto de 30 anos x menino
S[10] = (t, d) => { const aM = findW(10, /menino/) - 0.3;
  let g = rays(t, '#2C6F5A', '#9FD3B8') + idCard(620, 520, 1.25, 30);
  if (t > findW(10, /frente/) - 0.3) g += G(`translate(1360,560) scale(${pop1(t, findW(10, /frente/) - 0.3)})`, C(0, -40, 240, '#FFFFFF', 8) + clipG('<circle cx="0" cy="-40" r="232"/>', G('translate(0,-20) scale(1.25)', neoHead(22, { expr: 'worried' }))));
  g += badgeB(1000, 540, pop1(t, aM), '≠', '#C62A2A', '#FFFFFF', 110, 0);
  return sc(null, g, [960, 540, 1.0]); };
// 11 — "Eu tô ficando mais novo." a moça ri, o gerente não
S[11] = (t, d) => { const aE = findW(11, /^eu/) - 0.2, aR = findW(11, /^ri/) - 0.2, aG = findW(11, /gerente/) - 0.2;
  let g = pp(MOCA, { x: 760, y: 900, s: 0.75, expr: t > aR ? 'happy' : 'neutral' }) + pp(GERENTE, { x: 1200, y: 900, s: 0.78, sx: -1, expr: t > aG ? 'angry' : 'neutral', hl: [-120, -200], hr: [120, -200] });
  g += NEOp(22, { x: 400, y: FY, s: 0.95, expr: 'worried', hr: [180, -380] });
  g += say(110, 200, 620, 'EU TÔ FICANDO MAIS NOVO!', 40, 'left', '#FFFFFF', t, aE);
  return sc('banco', g, [960, 540, 1.0]); };
// 12 — dia 9: o chefe te chama
S[12] = (t, d) => { let g = pp(CHEFE, { x: 1330, y: FY, s: 0.9, sx: -1, expr: 'sus', hr: [220, -330] }) + NEOp(21, { x: 620, y: FY, s: 0.9, expr: 'neutral', lx: 1 });
  return sc('escritorio', g, drift(t, d, [960, 560, 1.0], [960, 520, 1.06])); };
// 13 — estagiário com o seu crachá; fica em casa
S[13] = (t, d) => { const aE = findW(13, /estagiário/) - 0.3, aC = findW(13, /casa/) - 0.4;
  let g = pp(CHEFE, { x: 1330, y: FY, s: 0.9, sx: -1, expr: 'angry', hr: [230, -420] }) + NEOp(21, { x: 620, y: FY, s: 0.9, expr: t > aE ? 'surprised' : 'neutral', lx: 1 });
  if (t > aE) g += G(`translate(960,330) scale(${pop1(t, aE)}) rotate(-5)`, R(-150, -100, 300, 200, 20, '#FFFFFF', 7) + R(-150, -100, 300, 50, 20, '#2C6FB6', 0) + T(0, -72, 'CRACHÁ', 30, '#FFFFFF') + G('translate(-80,20) scale(0.35)', neoHead(21)) + T(50, 30, 'ESTAGIÁRIO?', 26, '#C62A2A'));
  if (t > aC) g += say(1050, 120, 600, 'FICA EM CASA.', 54, 'right', '#FFFFFF', t, aC);
  return sc('escritorio', g, [960, 540, 1.0]); };
// 14 — você ri: é só documento
S[14] = (t, d) => { let g = NEOp(21, { x: 960, y: FY, s: 0.95, expr: 'happy', hl: [-90, -150], hr: [200, -380] }) + G('translate(1150,480) rotate(12)', idCard(0, 0, 0.45, 30));
  g += badgeB(960, 180, pop1(t, findW(14, /documento/) - 0.3), 'SÓ UM DOCUMENTO... NÉ?', '#1A1210', '#FFE14D', 50);
  return sc('sala', g, drift(t, d, [960, 540, 1.0], [960, 520, 1.06])); };
// 15 — o grupo do futebol: "quem é esse moleque na sua foto?"
S[15] = (t, d) => { const aQ = findW(15, /quem/) - 0.3, aT = findW(15, /troca/) - 0.3, aD = findW(15, /dois/) - 0.3;
  let g = NEOp(20, { x: 520, y: FY, s: 0.9, expr: t > aQ ? 'sad' : 'neutral', hr: [160, -420] });
  g += phoneB(1220, 520, 1.25, 'FUTEBOL ⚽'.replace('⚽', ''), [['QUEM É ESSE MOLEQUE?', pop1(t, aQ)], ['KKKKKK', pop1(t, aQ + 0.8)], ['SOU EU!', pop1(t, aT), 1], ['DE NOVO??', pop1(t, aD)]], t);
  return sc('quartoNoite', g, [960, 540, 1.0]); };
// 16 — dia 12: o caixa pede identidade pra um energético
S[16] = (t, d) => { const aI = findW(16, /identidade/) - 0.2, aE = findW(16, /energético/) - 0.2;
  let g = pp(CAIXA, { x: 1150, y: 860, s: 0.72, sx: -1, expr: 'sus', hr: [200, -330] }) + NEOp(18, { x: 620, y: FY, s: 0.9, expr: t > aI ? 'tired' : 'neutral', lx: 1, hr: [220, -330] });
  if (t > aE) g += G(`translate(840,700) scale(${pop1(t, aE)})`, R(-36, -80, 72, 160, 14, '#2C6FB6', 6) + R(-36, -40, 72, 50, 0, '#3CC46A', 0) + T(0, -10, 'ZAP', 22, '#FFFFFF'));
  g += say(1180, 160, 500, 'IDENTIDADE?', 52, 'left', '#FFFFFF', t, aI);
  return sc('mercado', g, [960, 540, 1.0]); };
// 17 — primeira vez no médico
S[17] = (t, d) => { const k = prog(t, 0, d); let g = pp(MEDICO, { x: 1300, y: FY, s: 0.9, sx: -1, expr: 'neutral' }) + NEOp(18, { x: lerp(300, 620, eio(k)), y: FY - Math.abs(Math.sin(k * 10)) * 10, s: 0.9, expr: 'worried' });
  return sc('consultorio', g, [960, 540, 1.0]); };
// 18 — raio-x: "os seus ossos estão ficando mais novos"
S[18] = (t, d) => { const aR = findW(18, /raio/) - 0.2, aO = findW(18, /^os$/) - 0.2;
  let g = pp(MEDICO, { x: 1380, y: FY, s: 0.9, sx: -1, expr: t > aO ? 'surprised' : 'sus', hr: [240, -400] }) + NEOp(18, { x: 420, y: FY, s: 0.88, expr: 'worried', lx: 1 });
  if (t > aR) g += xray(900, 470, 0.85 * pop1(t, aR), t);
  g += say(1050, 110, 820, 'OS SEUS OSSOS ESTÃO FICANDO MAIS NOVOS.', 36, 'right', '#FFFFFF', t, aO);
  return sc('consultorio', g, [960, 540, 1.0]); };
// 19 — ossos param de crescer lá pelos 20 anos
S[19] = (t, d) => { const aV = findW(19, /volta/) - 0.3;
  let g = rays(t, '#1B2A4A', '#3C5A8A') + boneIcon(960, 430, 2.0 + 0.3 * Math.sin(t * 2));
  g += badgeB(960, 700, pop1(t, findW(19, /vinte/) - 0.2), 'OSSOS PARAM DE CRESCER ~20 ANOS', '#FFFFFF', '#1A1210', 46, -2);
  if (t > aV) g += G(`translate(960,240) scale(${pop1(t, aV)})`, P('M120,0 A120,120 0 1,1 0,-120', 'none', 0, '') + `<path d="M120,0 A120,120 0 1,1 0,-120" stroke="#FFE14D" stroke-width="22" fill="none"/>` + P('M-30,-150 L20,-120 L-30,-90Z', '#FFE14D', 6));
  return sc(null, g, [960, 540, 1.0]); };
// 20 — "e se daqui a uma semana eu tiver 11?" ele não responde
S[20] = (t, d) => { const aE = findW(20, /^e$/) - 0.2, aN = findW(20, /responde/) - 0.5;
  let g = pp(MEDICO, { x: 1300, y: FY, s: 0.9, sx: -1, expr: t > aN ? 'sad' : 'neutral' }) + NEOp(18, { x: 620, y: FY, s: 0.9, expr: 'worried', lx: 1 });
  g += say(120, 140, 820, 'E SE DAQUI A UMA SEMANA EU TIVER 11 ANOS?', 36, 'left', '#FFFFFF', t, aE);
  if (t > aN) g += say(1120, 300, 300, '...', 80, 'right', '#FFFFFF', t, aN);
  return sc('consultorio', g, drift(t, d, [960, 540, 1.0], [1060, 520, 1.1])); };
// 21 — re-gancho: dia 13
S[21] = (t, d) => { let g = rays(t, '#0E0C16', '#1E1A30') + bigTxt(960, 470, pop1(t, findW(21, /treze/) - 0.2), 'DIA 13', 'NINGUÉM ESPERAVA', '#FFFFFF', '#FF5A4E', 120, 70);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 540, 1.1])); };
// 22 — a voz mudou
S[22] = (t, d) => { const aV = findW(22, /voz/) - 0.2;
  let g = NEOp(17, { x: 960, y: FY + 60, s: 1.05, expr: t > aV ? 'surprised' : 'sleep', hr: [40, -470], hl: [-150, -200] });
  if (t > aV) for (let i = 0; i < 3; i++) g += `<path d="M${1120 + i * 40},${420 - i * 10} q30,30 0,60 q-30,30 0,60" stroke="#FFFFFF" stroke-width="8" fill="none" opacity="${0.9 - i * 0.25}"/>`;
  return sc('quarto', g, drift(t, d, [960, 540, 1.0], [960, 470, 1.15])); };
// 23 — "Quer falar com quem, mocinho?"
S[23] = (t, d) => { const aL = findW(23, /ligou/) - 0.2, aQ = findW(23, /quer/) - 0.2;
  let g = NEOp(17, { x: 760, y: FY, s: 0.95, expr: t > aQ + 0.8 ? 'surprised' : 'neutral', hr: [130, -470] });
  if (t < aL) g += badgeB(960, 200, pop1(t, findW(23, /grossa/) - 0.2), 'VOZ GROSSA: ~13 ANOS', '#FFFFFF', '#1A1210', 48);
  g += say(1040, 200, 760, 'QUER FALAR COM QUEM, MOCINHO?', 40, 'left', '#FFFFFF', t, aQ);
  return sc('quarto', g, [960, 540, 1.0]); };
// 24 — dia 15: não consegue alugar, assinar, pagar
S[24] = (t, d) => { const as = [findW(24, /alugar/), findW(24, /assinar/), findW(24, /pagar/)].map(a => a - 0.2);
  let g = NEOp(15, { x: 520, y: FY, s: 0.9, expr: 'sad' });
  ['ALUGAR', 'ASSINAR', 'PAGAR'].forEach((l, i) => { const k = pop1(t, as[i]); if (k <= 0) return; g += G(`translate(1250,${250 + i * 220}) scale(${k}) rotate(${i % 2 ? 3 : -3})`, R(-230, -80, 460, 160, 16, '#FFFFFF', 7) + T(0, -20, l, 48, '#1A1210') + G('rotate(-12)', R(-150, 10, 300, 70, 10, 'none', 0, 'stroke="#C62A2A" stroke-width="8"') + T(0, 48, 'NEGADO', 44, '#C62A2A'))); });
  return sc('sala', g, [960, 540, 1.0]); };
// 25 — pra lei, menor de idade
S[25] = (t, d) => { let g = rays(t, '#5A2230', '#A0404A') + NEOp(15, { x: 960, y: 1300, s: 1.1, expr: 'sad' }) + G(`translate(960,360) scale(${pop1(t, 0.3)}) rotate(-8)`, R(-430, -100, 860, 200, 30, 'none', 0, 'stroke="#FFFFFF" stroke-width="14"') + T(0, 10, 'MENOR DE IDADE', 92, '#FFFFFF'));
  return sc(null, g, [960, 540, 1.0]); };
// 26 — você liga pra sua mãe
S[26] = (t, d) => { const aM = findW(26, /mãe/) - 0.3;
  let g = NEOp(15, { x: 640, y: FY, s: 0.9, expr: 'sad', hr: [170, -460] });
  if (t > aM) g += phoneB(1250, 540, 1.1 * pop1(t, aM), 'LIGANDO...', [['MÃE ❤'.replace('❤', ''), 1]], t, 1);
  return sc('quartoNoite', g, [960, 540, 1.0]); };
// 27 — ela demora… não liga faz meses
S[27] = (t, d) => { const aM = findW(27, /meses/) - 0.3;
  let g = NEOp(15, { x: 640, y: FY, s: 0.9, expr: t > aM ? 'sad' : 'neutral', hr: [130, -470] }) + phoneB(1250, 540, 1.1, 'LIGANDO...', [['MÃE', 1]], t, 1);
  g += badgeB(1250, 900, pop1(t, aM), 'ÚLTIMA LIGAÇÃO: 4 MESES', '#C62A2A', '#FFFFFF', 42);
  return sc('quartoNoite', g, drift(t, d, [960, 540, 1.0], [1000, 520, 1.06])); };
// 28 — "Filho? Que voz é essa?"
S[28] = (t, d) => { let g = R(-200, -200, 1160, 1480, 0, '#00000000', 0);
  g += clipG('<rect x="960" y="0" width="960" height="1080"/>', R(960, 0, 960, 1080, 0, '#F0DCC0', 0) + R(960, 760, 960, 320, 0, '#B07A4A', 0) + pp(LUCIA, { x: 1440, y: 1080, s: 0.95, expr: 'surprised', hr: [120, -470] }));
  g += Ln(960, 0, 960, 1080, '#1A1210', 12);
  g += clipG('<rect x="0" y="0" width="960" height="1080"/>', NEOp(15, { x: 480, y: 1080, s: 0.95, expr: 'worried', hr: [120, -470] }));
  g += say(1060, 140, 620, 'FILHO? QUE VOZ É ESSA?', 44, 'left', '#FFFFFF', t, 0.1);
  return sc('quartoNoite', g, [960, 540, 1.0]); };
// 29 — ela na porta… chora (não é de susto)
S[29] = (t, d) => { const aC = findW(29, /chorar/) - 0.3;
  let g = pp(LUCIA, { x: 480, y: FY, s: 0.92, expr: t > aC ? 'sad' : 'surprised', hl: [-120, -300], hr: [140, -420] }) + NEOp(14, { x: 1150, y: FY, s: 0.88, sx: -1, expr: 'sad', lx: -1 });
  if (t > aC) g += tears(480, FY - 0.92 * 0.92 * 520, t, 0.9);
  return sc('sala', g, drift(t, d, [800, 560, 1.0], [760, 500, 1.1])); };
// 30 — "Você tá igualzinho a quando saiu de casa."
S[30] = (t, d) => { let g = pp(LUCIA, { x: 600, y: FY, s: 0.92, expr: 'happy', hr: [260, -380], hl: [-130, -300] }) + tears(600, FY - 0.92 * 0.92 * 520, t, 0.9) + NEOp(14, { x: 1100, y: FY, s: 0.88, sx: -1, expr: 'sad' });
  g += say(120, 140, 880, 'VOCÊ TÁ IGUALZINHO A QUANDO SAIU DE CASA.', 36, 'right', '#FFFFFF', t, 0.2);
  return sc('sala', g, [880, 520, 1.06]); };
// 31 — de volta ao quarto antigo, o pôster
S[31] = (t, d) => { const aP = findW(31, /pôster/) - 0.3;
  let g = NEOp(14, { x: 1150, y: FY, s: 0.9, sx: -1, expr: t > aP ? 'surprised' : 'neutral', lx: -1 }) + pp(LUCIA, { x: 1560, y: FY, s: 0.9, sx: -1, expr: 'happy' });
  if (t > aP) g += C(500, 400, 150 + Math.sin(t * 4) * 8, 'rgba(255,240,170,0.35)', 0) + sparkle(600, 300, 1.2);
  return sc('infancia', g, drift(t, d, [1000, 540, 1.0], [900, 500, 1.08])); };
// 32 — dia 18: a mesma jaqueta. ela guardou.
S[32] = (t, d) => { const aA = findW(32, /armário/) - 0.3, aG = findW(32, /guardou/) - 0.3;
  let g = NEOp(12, { x: 960, y: FY, s: 0.9, expr: t > aG ? 'happy' : 'neutral', shirt: '#F2F2F4' }) + pp(LUCIA, { x: 420, y: FY, s: 0.9, expr: 'happy', hr: [250, -360] });
  if (t > aA) g += G(`translate(660,640) scale(${0.7 * pop1(t, aA)}) rotate(-8)`, P('M-120,-140 L120,-140 L160,-80 L130,140 L-130,140 L-160,-80Z', '#F2F2F4', 7) + R(-30, -140, 60, 280, 0, '#1C1C22', 0) + Ln(-34, -140, -40, 140, '#1C1C22', 6));
  g += badgeB(1350, 300, pop1(t, aG), 'ELA GUARDOU', '#C2577A', '#FFFFFF', 60, 4);
  return sc('infancia', g, [960, 540, 1.0]); };
// 33 — escola: prova fácil; a parte difícil é outra
S[33] = (t, d) => { const aF = findW(33, /fáceis/) - 0.3;
  let g = pp(KID1, { x: 420, y: 980, s: 0.7, expr: 'worried' }) + pp(KID2, { x: 1500, y: 980, s: 0.7, sx: -1, expr: 'tired' }) + NEOp(12, { x: 960, y: FY, s: 0.85, expr: 'happy' });
  if (t > aF) g += G(`translate(1180,560) scale(${pop1(t, aF)}) rotate(6)`, paper(0, 0, 1.4, 0, '10'));
  return sc('escola', g, [960, 540, 1.0]); };
// 34 — o pai foi embora quando você tinha seis
S[34] = (t, d) => { const aP = findW(34, /^mas/) - 0.3, aE = findW(34, /embora/) - 0.3;
  if (t < aP) { let g = pp(KID1, { x: 640, y: FY, s: 0.75, expr: 'sus', lx: 1 }) + NEOp(12, { x: 1150, y: FY, s: 0.85, sx: -1, expr: 'neutral' }) + say(120, 160, 700, 'VOCÊ FALA IGUAL MEU PAI!', 42, 'right', '#FFFFFF', t, 0.3); return sc('escola', g, [960, 540, 1.0]); }
  let inner = R(0, 0, 1300, 760, 0, '#E3D6C0', 0) + R(0, 560, 1300, 200, 0, '#B98A5E', 0) + R(80, 160, 200, 400, 6, '#8A5A33', 7);
  inner += pp(PAIV, { x: lerp(300, 120, prog(t, aE, aE + 1.5)), y: 760, s: 0.7, back: true }) + R(lerp(380, 200, prog(t, aE, aE + 1.5)), 600, 110, 130, 12, '#5A3A22', 6);
  inner += pp(LUCIA_J, { x: 820, y: 760, s: 0.72, expr: 'sad', hr: [-60, -150] }) + NEOp(6, { x: 1020, y: 760, s: 0.9, expr: 'sad' });
  let g = rays(t, '#B98C6A', '#E6C9A0') + sepia(memPanel(310, 140, 1300, 760, pop1(t, aP, 0.3), inner, 'pai', -1));
  return sc(null, g, [960, 540, 1.0]); };
// 35 — saída da escola: a sua mãe esperando, 62 anos
S[35] = (t, d) => { const aM = findW(35, /mãe/) - 0.3, aS = findW(35, /sessenta/) - 0.2;
  let g = pp(KID2, { x: 300, y: FY, s: 0.7, expr: 'happy' }) + pp(MAEESC, { x: 470, y: FY, s: 0.85, expr: 'happy', hl: [-200, -300] });
  g += NEOp(11, { x: 960, y: FY, s: 0.85, expr: 'neutral' }) + (t > aM ? pp(LUCIA, { x: 1450, y: FY, s: 0.9, sx: -1, expr: 'happy', hr: [230, -420] }) : '');
  g += badgeB(1450, 260, pop1(t, aS), '62 ANOS', '#C2577A', '#FFFFFF', 58);
  return sc('rua', g, [960, 540, 1.0]); };
// 36 — ela anda devagar, as mãos tremem, cabelo branco
S[36] = (t, d) => { const aD = findW(36, /devagar/) - 0.2, aM = findW(36, /tremem/) - 0.3, aC = findW(36, /branco/) - 0.3;
  const sh = t > aM ? Math.sin(t * 40) * 6 : 0;
  let g = pp(LUCIA, { x: 900 + prog(t, 0, d) * 200, y: FY, s: 0.95, expr: 'tired', hl: [-150 + sh, -150], hr: [150 - sh, -150] }) + NEOp(11, { x: 560 + prog(t, 0, d) * 200, y: FY, s: 0.82, expr: 'sad', lx: 1 });
  g += badgeB(1500, 200, pop1(t, aD), 'MAIS DEVAGAR', '#1A1210', '#FFE14D', 44) + badgeB(1500, 330, pop1(t, aM), 'MÃOS TREMENDO', '#1A1210', '#FFE14D', 44) + badgeB(1500, 460, pop1(t, aC), 'CABELO TODO BRANCO', '#1A1210', '#FFE14D', 44);
  return sc('ruaTarde', g, drift(t, d, [960, 540, 1.0], [1060, 500, 1.1])); };
// 37 — três remédios antes de dormir
S[37] = (t, d) => { const aT = findW(37, /três/) - 0.3;
  let g = dark(0.4) + pp(LUCIA, { x: 1100, y: FY, s: 0.92, expr: 'tired', hr: [90, -470] }) + pills(1000, 780, 1.2 * pop1(t, aT)) + NEOp(11, { x: 420, y: FY, s: 0.8, expr: 'sad', lx: 1 });
  return sc('maeCozinha', g, drift(t, d, [960, 540, 1.0], [1000, 520, 1.06])); };
// 38 — você fica mais novo, ela mais velha
S[38] = (t, d) => { const aE = findW(38, /^ela/) - 0.2;
  let g = rays(t, '#3B2A4A', '#C9708A') + NEOp(11, { x: 620, y: 1000, s: 0.9, expr: 'sad' }) + G(`translate(620,240) scale(${pop1(t, 0.3)})`, T(0, 0, '11 ↓', 110, '#7FE3FF', 14));
  if (t > aE) g += pp(LUCIA, { x: 1300, y: 1000, s: 0.95, sx: -1, expr: 'tired' }) + G(`translate(1300,240) scale(${pop1(t, aE)})`, T(0, 0, '62 ↑', 110, '#FF9E7A', 14));
  return sc(null, g, [960, 540, 1.0]); };
// 39 — dia 22: oito anos, perdendo os dentes
S[39] = (t, d) => { const aD = findW(39, /dentes/) - 0.3;
  let g = mirror2d(960, 430, 640, 520, G('translate(960,520) scale(1.5)', neoHead(8, { expr: t > aD ? 'surprised' : 'neutral' })));
  if (t > aD) g += tooth(1420, 300 + prog(t, aD, aD + 1) * 500, 0.9);
  return sc('banheiro', g, [960, 520, 1.04]); };
// 40 — dentes de leite ao contrário
S[40] = (t, d) => { const aC = findW(40, /contrário/) - 0.3;
  let g = rays(t, '#2C6FB6', '#9FD3E8') + badgeB(960, 180, pop1(t, 0.3), 'DENTES DE LEITE: 6 A 12 ANOS', '#FFFFFF', '#1A1210', 46);
  g += tooth(620, 560, 1.6, false) + G(`translate(960,560) scale(${pop1(t, aC)})`, T(0, 0, t > aC ? '←' : '→', 160, '#FFE14D', 14)) + tooth(1300, 560, 1.2, true);
  g += T(620, 820, 'ADULTO', 48, '#FFFFFF', 10) + T(1300, 820, 'LEITE', 48, '#FFFFFF', 10);
  return sc(null, g, [960, 540, 1.0]); };
// 41 — o pior não são os dentes
S[41] = (t, d) => { let g = rays(t, '#0E0C16', '#221C36') + NEOp(8, { x: 960, y: 1060, s: 1.1, expr: 'worried' }) + bigTxt(960, 230, pop1(t, findW(41, /pior/) - 0.2), 'O PIOR AINDA', 'TAVA POR VIR', '#FFFFFF', '#FF5A4E', 60, 70);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 540, 1.08])); };
// 42 — dia 24: não lembra o nome do chefe
S[42] = (t, d) => { const aL = findW(42, /lembra/) - 0.3;
  let g = NEOp(6, { x: 760, y: FY, s: 0.95, expr: 'surprised' });
  if (t > aL) g += think(1040, 200, 640, 'O NOME DO MEU CHEFE ERA...?', 38, t, aL, 860, 520);
  return sc('infancia', g, [960, 540, 1.0]); };
// 43 — e aí você entende o que vem pela frente
S[43] = (t, d) => { let g = rays(t, '#0E0C16', '#1E1A30') + NEOp(6, { x: 960, y: 1000, s: 0.9, expr: 'sad' }); for (let i = 0; i < 6; i++) g += C(260 + i * 280, 300 + Math.sin(t + i) * 30, 70, 'rgba(255,255,255,0.05)', 0);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 600, 1.15])); };
// 44 — amnésia infantil
S[44] = (t, d) => { const aA = findW(44, /amnésia/) - 0.3;
  let g = rays(t, '#3B2A6A', '#8A6AC8') + brainIco(960, 420, 1.6);
  for (let i = 0; i <= 4; i++) g += G(`translate(${560 + i * 200},760)`, C(0, 0, 50, i < 4 ? 'rgba(255,255,255,0.25)' : '#FFE14D', 6) + T(0, 6, `${i}`, 50, '#1A1210'));
  g += Ln(560, 760, 1360, 760, 'rgba(255,255,255,0.5)', 6) + badgeB(960, 160, pop1(t, aA), 'AMNÉSIA INFANTIL', '#FFFFFF', '#3B2A6A', 60);
  return sc(null, g, [960, 540, 1.0]); };
// 45 — vai esquecer tudo: trabalho, faculdade, 30 anos
S[45] = (t, d) => { const as = [findW(45, /trabalho/), findW(45, /faculdade/), findW(45, /inteiros/)].map(a => a - 0.3);
  let g = rays(t, '#B98C6A', '#E6C9A0');
  const P3 = [['ESCRITÓRIO', '#E6EBF0'], ['FACULDADE', '#E4E0C4'], ['30 ANOS', '#F0DCC0']];
  P3.forEach(([l, c], i) => { const k = pop1(t, as[i] - 0.6); if (k <= 0) return; const fade = prog(t, as[i] + 0.4, as[i] + 1.6); g += G(`translate(${460 + i * 500},500) rotate(${i % 2 ? 3 : -3}) scale(${k})`, `<g opacity="${1 - fade * 0.85}">` + R(-200, -240, 400, 480, 14, '#FFFFFF', 7) + R(-180, -220, 360, 340, 6, c, 0) + G('translate(0,-40) scale(0.6)', neoHead([30, 22, 29][i], { expr: 'happy' })) + T(0, 190, l, 40, '#1A1210') + '</g>'); });
  return sc(null, sepia(g), [960, 540, 1.0]); };
// 46 — começa a escrever um caderno
S[46] = (t, d) => { let g = NEOp(5, { x: 760, y: FY, s: 1.0, expr: 'neutral', hl: [-120, -240], hr: [200, -250] }) + G('translate(980,860) rotate(-8)', note(0, 0, 0.28, 0, []));
  return sc('infanciaNoite', g, drift(t, d, [880, 560, 1.0], [880, 520, 1.1])); };
// 47 — o caderno
S[47] = (t, d) => { const cues = [/neo/, /trinta/, /lúcia/, /açúcar/, /ligar/].map(r => findW(47, r) - 0.4);
  const ls = ['Meu nome é Neo.', 'Eu tinha 30 anos.', 'Minha mãe: Lúcia.', 'Café sem açúcar.', 'Passei muito tempo', 'sem ligar pra ela.'];
  const shown = [t > cues[0], t > cues[1], t > cues[2], t > cues[3], t > cues[4] - 1.2, t > cues[4]];
  let g = rays(t, '#2A3352', '#5A6488') + note(960, 540, 1.15, -2, ls.map((l, i) => shown[i] ? l : ''), true);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 560, 1.06])); };
// 48 — toda noite ela lê o caderno
S[48] = (t, d) => { const aM = findW(48, /manhã/) - 0.3;
  let g = sitPerson(LUCIA, 1250, 820, 0.9, { expr: 'happy', hl: [-120, -330], hr: [120, -330] }) + G('translate(1250,590) scale(0.25)', note(0, 0, 1, 0, [])) + lying(Object.assign(neoAt(5), { hs: 1, expr: t > aM ? 'sad' : 'sleep' }), 1640, 760, 0.55);
  if (t > aM) g += brainIco(400, 360, 0.6, prog(t, aM, aM + 2) * 0.7);
  return sc('infanciaNoite', g, [960, 540, 1.0]); };
// 49 — dia 26: quatro anos, não alcança a pia; ela cuida
S[49] = (t, d) => { const aB = findW(49, /banho/) - 0.3, aT = findW(49, /tênis/) - 0.3;
  let g = pp(LUCIA, { x: 1180, y: FY, s: 0.95, sx: -1, expr: 'happy', hr: [240, t > aT ? -150 : -330], hl: [-140, -300] }) + NEOp(4, { x: 760, y: FY, s: 1.0, expr: 'neutral', hr: [140, -520], lift: Math.abs(Math.sin(t * 5)) * 10 });
  ['BANHO', 'COMIDA', 'TÊNIS'].forEach((l, i) => { const a = [aB, findW(49, /comida/) - 0.3, aT][i]; g += badgeB(420 + i * 300, 220, pop1(t, a), l, '#FFFFFF', '#C2577A', 46, i % 2 ? 3 : -3); });
  return sc('maeCozinha', g, [960, 540, 1.0]); };
// 50 — igual 30 anos atrás
S[50] = (t, d) => { let inner = R(0, 0, 1300, 760, 0, '#F6E7C8', 0) + R(0, 560, 1300, 200, 0, '#D9C09A', 0) + pp(LUCIA_J, { x: 760, y: 760, s: 0.75, sx: -1, expr: 'happy', hr: [220, -150] }) + NEOp(4, { x: 480, y: 760, s: 0.9, expr: 'happy' });
  let g = rays(t, '#B98C6A', '#E6C9A0') + sepia(memPanel(310, 140, 1300, 760, pop1(t, 0.2, 0.3), inner, 'j30', 1)) + badgeB(960, 970, pop1(t, findW(50, /reclamar/) - 0.3), 'SEM RECLAMAR UMA VEZ', '#1A1210', '#FFE14D', 46);
  return sc(null, g, [960, 540, 1.0]); };
// 51 — "Mãe, você não tá cansada?" "De você? Nunca."
S[51] = (t, d) => { const aM = findW(51, /^mãe/) - 0.2, aN = findW(51, /^de$/) - 0.2;
  let g = sitPerson(LUCIA, 1250, 820, 0.9, { expr: t > aN ? 'happy' : 'tired', hl: [-260, -250] }) + lying(Object.assign(neoAt(4), { hs: 1, expr: 'neutral', lx: 1 }), 1640, 760, 0.55);
  g += say(180, 140, 700, 'MÃE, VOCÊ NÃO TÁ CANSADA?', 40, 'right', '#FFFFFF', t, aM) + say(900, 360, 520, 'DE VOCÊ? NUNCA.', 50, 'left', '#FFE9F0', t, aN);
  return sc('infanciaNoite', g, [960, 540, 1.0]); };
// 52 — dia 28: dois anos. "mamã"
S[52] = (t, d) => { const aM = findW(52, /mamã/) - 0.3;
  let g = NEOp(2, { x: 760, y: FY, s: 1.1, expr: 'worried', lift: Math.abs(Math.sin(t * 3)) * 6 }) + pp(LUCIA, { x: 1250, y: FY, s: 0.95, sx: -1, expr: 'happy' });
  g += say(560, 300, 420, 'OBRI... ', 54, 'left', '#FFFFFF', t, findW(52, /obrigado/) - 0.3);
  if (t > aM) g += say(560, 300, 420, 'MAMÃ', 64, 'left', '#FFE9F0', t, aM);
  return sc('maeSala', g, drift(t, d, [960, 560, 1.0], [960, 540, 1.06])); };
// 53 — ela sempre entendeu
S[53] = (t, d) => { let g = pp(LUCIA, { x: 1000, y: FY + 60, s: 0.95, sx: -1, expr: 'happy', hr: [200, -330], hl: [-200, -330] }) + NEOp(2, { x: 820, y: FY, s: 1.1, expr: 'happy', hr: [170, -360] });
  for (let i = 0; i < 5; i++) { const k = ((t * 0.45 + i / 5) % 1); g += heart(760 + i * 80, 560 - k * 360, 1.0 * (1 - k)); }
  return sc('maeSala', g, [940, 540, 1.08]); };
// 54 — dia 29: um ano. ela te carrega, coluna doendo
S[54] = (t, d) => { const aC = findW(54, /coluna/) - 0.3; const k = prog(t, 0, d);
  let g = pp(LUCIA, { x: lerp(500, 1300, k), y: FY - Math.abs(Math.sin(k * 14)) * 8, s: 0.95, expr: t > aC ? 'tired' : 'happy', hl: [-80, -330], hr: [80, -330], hrot: t > aC ? 6 : 0, rot: t > aC ? 4 : 0 }) + babyHeld(lerp(500, 1300, k), FY - 0.95 * 0.92 * 330, 0.75);
  if (t > aC) g += sweatLines(lerp(500, 1300, k), FY - 0.95 * 0.92 * 600, t);
  return sc('maeSala', g, [960, 540, 1.0]); };
// 55 — bebê ~300 ossos, adulto 206
S[55] = (t, d) => { const aA = findW(55, /adulto/) - 0.3;
  let g = rays(t, '#1B2A4A', '#3C5A8A') + G(`translate(560,460) scale(${pop1(t, 0.3)})`, boneIcon(0, 0, 1.1) + T(0, 170, '~300', 110, '#FFE14D', 14) + T(0, 260, 'BEBÊ', 50, '#FFFFFF', 10));
  if (t > aA) g += G(`translate(1360,460) scale(${pop1(t, aA)})`, boneIcon(0, 0, 1.1) + T(0, 170, '206', 110, '#FFFFFF', 14) + T(0, 260, 'ADULTO', 50, '#FFFFFF', 10));
  return sc(null, g, [960, 540, 1.0]); };
// 56 — a última noite: ela canta
S[56] = (t, d) => { let g = sitPerson(LUCIA, 1160, 860, 1.0, { expr: 'happy', hl: [-100, -300], hr: [100, -300] }) + babyHeld(1160, 860 - 0.92 * 1.0 * 100, 0.8, prog(t, 0, d) > 0.6) + notes(t, 1300, 420);
  return sc('maeSalaNoite', g, drift(t, d, [1080, 560, 1.0], [1140, 520, 1.12])); };
// 57 — recém-nascido enxerga 20–30 cm
S[57] = (t, d) => { const aD = findW(57, /distância/) - 0.3;
  let g = G('translate(960,600) scale(2.6)', head(Object.assign({}, LUCIA, { expr: 'happy', hs: 1 })));
  g += `<radialGradient id="pov"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1A1426" stop-opacity="0.92"/></radialGradient>` + R(-200, -200, 2320, 1480, 0, 'url(#pov)', 0);
  g += badgeB(960, 140, pop1(t, findW(57, /centímetros/) - 0.4), '~20 A 30 CM', '#FFFFFF', '#1A1210', 56);
  return sc('maeSalaNoite', g, drift(t, d, [960, 540, 1.0], [960, 560, 1.06])); };
// 58 — a última coisa que você vê é ela
S[58] = (t, d) => { const f = prog(t, d - 1.4, d);
  let g = G('translate(960,620) scale(3.0)', head(Object.assign({}, LUCIA, { expr: 'happy', hs: 1 }))) + tears(960, 640, t, 2.2);
  g += `<radialGradient id="pov2"><stop offset="${0.4 - f * 0.4}" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></radialGradient>` + R(-200, -200, 2320, 1480, 0, 'url(#pov2)', 0) + R(-200, -200, 2320, 1480, 0, `rgba(0,0,0,${f})`, 0);
  return sc('maeSalaNoite', g, drift(t, d, [960, 560, 1.05], [960, 580, 1.15])); };
// 59 — dia 30. zero.
S[59] = (t, d) => { const aZ = findW(59, /zero/) - 0.2;
  let g = R(-200, -200, 2320, 1480, 0, '#000', 0) + G(`translate(960,470) scale(${pop1(t, 0.1)})`, T(0, 0, 'DIA 30', 90, '#FFFFFF', 0)) + G(`translate(960,640) scale(${pop1(t, aZ)})`, T(0, 0, '0', 180, '#FF5A4E', 0));
  g += R(-200, -200, 2320, 1480, 0, `rgba(0,0,0,${prog(t, aZ + 1.2, d)})`, 0);
  return sc(null, g, [960, 540, 1.0]); };
// 60 — o despertador toca
S[60] = (t, d) => { const aD = findW(60, /despertador/) - 0.3; const sh = t > aD ? Math.sin(t * 50) * 10 : 0;
  let g = R(-200, -200, 2320, 1480, 0, '#000', 0);
  if (t > aD) g += G(`translate(${960 + sh},520) scale(${pop1(t, aD)})`, C(0, 0, 160, '#F2F2F4', 9) + C(-130, -140, 50, '#C62A2A', 7) + C(130, -140, 50, '#C62A2A', 7) + Ln(0, 0, 0, -100, O, 12) + Ln(0, 0, 70, 30, O, 10) + T(0, 260, 'TRRRIM!', 70, '#FFE14D', 12));
  return sc(null, g, [960, 540, 1.0]); };
// 61 — espelho: 30 anos de novo
S[61] = (t, d) => { const aT = findW(61, /^trinta/) - 0.3, aE = findW(61, /espelho/) - 0.3;
  if (t < aE) { let g = NEOp(30, { x: 960, y: FY + 20, s: 0.95, expr: 'surprised', hl: [-200, -420], hr: [200, -420] }); return sc('quarto', g, [960, 520, 1.05]); }
  let g = mirror2d(960, 360, 560, 440, G('translate(960,440) scale(1.25)', neoHead(30, { expr: 'surprised' }))) + NEOp(30, { x: 960, y: 1420, s: 1.25, back: true });
  g += badgeB(1430, 300, pop1(t, aT), '30 ANOS', '#3E9B4A', '#FFFFFF', 64, 6);
  return sc('banheiro', g, drift(t, d, [960, 520, 1.0], [960, 470, 1.08])); };
// 62 — foi um sonho? o caderno em cima da mesa
S[62] = (t, d) => { const aC = findW(62, /caderno/) - 0.3;
  let g = NEOp(30, { x: 1150, y: FY, s: 0.95, sx: -1, expr: t > aC ? 'surprised' : 'neutral', lx: -1 });
  g += G('translate(560,640) rotate(-10)', note(0, 0, 0.22, 0, [])) + (t > aC ? C(560, 640, 150 + Math.sin(t * 5) * 10, 'rgba(255,240,170,0.35)', 0) + sparkle(640, 560, 1.0) : '');
  return sc('quarto', g, drift(t, d, [960, 540, 1.0], [800, 560, 1.1])); };
// 63 — a última página, letra de criança
S[63] = (t, d) => { let g = rays(t, '#2A3352', '#5A6488') + note(960, 540, 1.15, 2, ['', '', '', '', '', '']);
  return sc(null, g, drift(t, d, [960, 540, 1.0], [960, 560, 1.08])); };
// 64 — "Não espera ficar pequeno de novo pra ligar pra ela."
S[64] = (t, d) => { const ws = TL.lines[64].words.length; const n = Math.ceil(prog(t, 0.1, d - 0.8) * 3);
  const ls = ['', '', 'Não espera ficar', 'pequeno de novo', 'pra ligar pra ela.', '', '', ''].map((l, i) => (i >= 2 && i - 2 < n) ? l : '');
  let g = rays(t, '#2A3352', '#5A6488') + note(960, 540, 1.15, 2, ls, true);
  return sc(null, g, drift(t, d, [960, 540, 1.04], [960, 520, 1.12])); };
// 65 — liga pra mãe; ela atende
S[65] = (t, d) => { const aA = findW(65, /atende/) - 0.3, aF = findW(65, /filho/) - 0.2;
  let g = clipG('<rect x="0" y="0" width="960" height="1080"/>', NEOp(30, { x: 480, y: 1100, s: 0.95, expr: 'neutral', hr: [130, -470] }));
  if (t > aA) g += clipG('<rect x="960" y="0" width="960" height="1080"/>', R(960, 0, 960, 1080, 0, '#F6E7C8', 0) + R(960, 760, 960, 320, 0, '#D9C09A', 0) + mug(1700, 700, 0.8, t) + pp(LUCIA, { x: 1400, y: 1100, s: 0.95, expr: 'surprised', hr: [120, -470] })) + Ln(960, 0, 960, 1080, '#1A1210', 12);
  else g += phoneB(1400, 540, 1.0, 'LIGANDO...', [['MÃE', 1]], t, 1);
  g += say(1040, 120, 820, 'FILHO? ACONTECEU ALGUMA COISA?', 36, 'left', '#FFFFFF', t, aF);
  return sc('quarto', g, [960, 540, 1.0]); };
// 66 — "Não aconteceu nada, mãe. Eu só queria ouvir a sua voz."
S[66] = (t, d) => { const aN = findW(66, /^não/) - 0.2;
  let g = clipG('<rect x="0" y="0" width="960" height="1080"/>', NEOp(30, { x: 480, y: 1100, s: 0.95, expr: 'happy', hr: [130, -470] }));
  g += clipG('<rect x="960" y="0" width="960" height="1080"/>', R(960, 0, 960, 1080, 0, '#F6E7C8', 0) + R(960, 760, 960, 320, 0, '#D9C09A', 0) + pp(LUCIA, { x: 1400, y: 1100, s: 0.95, expr: t > aN + 1.5 ? 'happy' : 'surprised', hr: [120, -470] }) + (t > aN + 1.5 ? tears(1400, 1100 - 0.95 * 0.92 * 520, t, 0.9) : '')) + Ln(960, 0, 960, 1080, '#1A1210', 12);
  g += say(60, 100, 860, 'NÃO ACONTECEU NADA, MÃE.', 40, 'right', '#FFFFFF', t, aN) + say(60, 290, 860, 'EU SÓ QUERIA OUVIR A SUA VOZ.', 38, 'right', '#FFE9F0', t, findW(66, /^eu/) - 0.2);
  for (let i = 0; i < 6; i++) { const k = ((t * 0.4 + i / 6) % 1); g += heart(860 + i * 40, 900 - k * 500, 0.9 * (1 - k)); }
  return sc('quarto', g, [960, 540, 1.0]); };
// 67 — CTA
S[67] = (t, d) => { let g = rays(t, '#3B4F8A', '#F0A070');
  [30, 16, 8, 2].forEach((a, i) => { g += NEOp(a, { x: 460 + i * 340, y: 1000, s: 0.85, expr: i === 3 ? 'happy' : 'neutral' }); });
  return sc(null, g, [960, 540, 1.0]); };

function titleOverlay(t) {
  if (t > 6.5) return '';
  const k = back(prog(t, 0, 0.3)), out = 1 - prog(t, 6.1, 6.5);
  return G(`translate(960,120) scale(${k * out})`, R(-640, -90, 1280, 180, 40, 'rgba(26,18,16,0.92)', 0) + T(0, -26, 'E SE VOCÊ FICASSE', 50, '#FFFFFF') + T(0, 46, '1 ANO MAIS NOVO TODO DIA?', 64, '#FFE14D'));
}
function ctaOverlay(t) {
  const a = TL.lines[67].start - 0.1;
  if (t < a) return '';
  const k = back(prog(t, a, a + 0.35));
  return G(`translate(960,170) scale(${k})`, R(-640, -110, 1280, 220, 40, 'rgba(26,18,16,0.94)', 0) + T(0, -36, 'ATÉ QUE IDADE VOCÊ', 58, '#FFFFFF') + T(0, 48, 'IA QUERER VOLTAR?', 70, '#FFE14D'));
}
