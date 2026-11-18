let g = VOL;
const phoneUI = (x, y, r, s, big, sub, saldo, col) => G(`translate(${x},${y}) rotate(${r}) scale(${s})`, R(-150, -280, 300, 560, 40, '#1A1A20', 8) + R(-132, -250, 264, 500, 24, '#F4F6FA', 0) + R(-132, -250, 264, 70, 24, '#2E7D5A', 0) + T(0, -205, 'BANCO', 32, '#FFFFFF') + R(-115, -130, 230, 130, 16, '#E9FFF0', 5) + T(0, -76, big, big.length > 8 ? 38 : 52, big.startsWith('-') ? '#E0201A' : '#2E7D5A') + T(0, -30, sub, 18, '#C62A2A') + T(0, 60, 'SALDO', 26, '#5A6070') + T(0, 120, saldo, 62, col));
// 1) R$ 100 — o começo
let p1 = R(-10, -10, 660, 1100, 0, 'rgba(30,70,140,0.3)', 0) + C(520, 790, 200, 'rgba(120,255,170,0.3)', 0);
p1 += person(neoAt(25, { x: 250, y: 1960, s: 1.85, expr: 'surprised', hr: [200, -250], hl: [-120, -250] }));
p1 += phoneUI(520, 790, 10, 0.72, '+R$ 100', 'MENTIRA DETECTADA', 'R$ 100', '#1A1210');
g += panel(0, 640, 'quarto', p1, 'blur(1px) saturate(1.1) brightness(0.92)', 0);
// 2) R$ 58 MIL — explosão de dinheiro
let p2 = '<defs><radialGradient id="ouro" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#FFF3B0"/><stop offset="0.5" stop-color="#F2B636"/><stop offset="1" stop-color="#8A5A10"/></radialGradient></defs>' + R(630, -10, 660, 1100, 0, 'url(#ouro)', 0);
for (let i = 0; i < 22; i++) { const a = i * (Math.PI * 2 / 22); p2 += '<polygon points="960,520 ' + (960 + Math.cos(a) * 1400) + ',' + (520 + Math.sin(a) * 1400) + ' ' + (960 + Math.cos(a + 0.12) * 1400) + ',' + (520 + Math.sin(a + 0.12) * 1400) + '" fill="rgba(255,255,255,0.16)"/>'; }
const pile = (x, y, s) => { let p = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 5 - r; c++) p += G(`translate(${x + (c - (4 - r) / 2) * 92},${y - r * 40}) rotate(${(c + r) % 2 ? 4 : -5})`, R(-50, -24, 100, 48, 6, '#7BC67E', 4) + C(0, 0, 14, '#4E9A52', 0)); return `<g transform="translate(${x},${y}) scale(${s}) translate(${-x},${-y})">${p}</g>`; };
p2 += pile(760, 1070, 1.2) + pile(1170, 1070, 1.2);
p2 += bills(2.5, 34, 12).replace(/translate\((\d+(\.\d+)?)/g, (m, x) => 'translate(' + (640 + parseFloat(x) / 3));
p2 += C(960, 560, 250, 'rgba(255,255,255,0.35)', 0) + person(neoAt(25, { x: 960, y: 1900, s: 1.85, expr: 'happy', smile: true, hl: [-180, -470], hr: [180, -470] }));
g += panel(640, 640, 'maeCozinha', p2, 'blur(2px) saturate(1.2)', 0);
// 3) R$ 0 — hospital, tudo gasto
let p3 = R(1270, -10, 660, 1100, 0, 'rgba(20,30,60,0.45)', 0);
p3 += person(neoAt(25, { x: 1500, y: 1960, s: 1.85, expr: 'sad', hr: [200, -250] })) + tears(1500, 760, 0.4, 1.0);
p3 += phoneUI(1790, 790, -10, 0.72, '-R$ 58 MIL', 'CIRURGIA · HOSPITAL', 'R$ 0', '#E0201A');
g += panel(1280, 640, 'hospital', p3, 'blur(1.5px) saturate(0.8) brightness(0.8)', 0);
g += sep(640) + sep(1280);
g += BIG(320, 190, 'R$ 100', 160) + BIG(960, 190, 'R$ 58 MIL', 150, '#3BE36A') + BIG(1600, 190, 'R$ 0', 170, '#FF4A3A');
return g;
