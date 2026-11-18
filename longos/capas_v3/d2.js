let g = VOL;
// R$ 100 — frio, um celular brilhando, uma nota
let left = R(-10, -10, 980, 1100, 0, 'rgba(30,70,140,0.32)', 0);
left += C(740, 540, 260, 'rgba(120,255,170,0.25)', 0);
left += person(neoAt(25, { x: 400, y: 1980, s: 2.15, expr: 'surprised', hr: [130, -420], hl: [-120, -250] })) + sweatLines(400, 600, 0);
left += G('translate(740,540) rotate(8) scale(1.15)', R(-150, -280, 300, 560, 40, '#1A1A20', 8) + R(-132, -250, 264, 500, 24, '#F4F6FA', 0) + R(-132, -250, 264, 70, 24, '#2E7D5A', 0) + T(0, -205, 'BANCO', 32, '#FFFFFF') + R(-115, -130, 230, 130, 16, '#E9FFF0', 5) + T(0, -76, '+R$ 100', 52, '#2E7D5A') + T(0, -30, 'MENTIRA DETECTADA', 18, '#C62A2A') + T(0, 60, 'SALDO', 26, '#5A6070') + T(0, 110, 'R$ 100', 54, '#1A1210'));
left += G('translate(820,900) rotate(-18) scale(1.6)', R(-50, -24, 100, 48, 6, '#7BC67E', 4) + C(0, 0, 14, '#4E9A52', 0) + T(0, 4, '100', 16, '#1F4D22'));
g += panel(0, 960, 'quarto', left, 'blur(1px) saturate(1.1) brightness(0.92)', 0);
// R$ 58 MIL — explosão dourada de dinheiro + a mãe "tô ótima" + MENTIRA
let right = '<defs><radialGradient id="ouro" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#FFF3B0"/><stop offset="0.5" stop-color="#F2B636"/><stop offset="1" stop-color="#8A5A10"/></radialGradient></defs>' + R(950, -10, 980, 1100, 0, 'url(#ouro)', 0);
for (let i = 0; i < 22; i++) { const a = i * (Math.PI * 2 / 22); right += '<polygon points="1440,520 ' + (1440 + Math.cos(a) * 1600) + ',' + (520 + Math.sin(a) * 1600) + ' ' + (1440 + Math.cos(a + 0.12) * 1600) + ',' + (520 + Math.sin(a + 0.12) * 1600) + '" fill="rgba(255,255,255,0.16)"/>'; }
const pile = (x, y, s) => { let p = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 6 - r; c++) p += G(`translate(${x + (c - (5 - r) / 2) * 92},${y - r * 40}) rotate(${(c + r) % 2 ? 4 : -5})`, R(-50, -24, 100, 48, 6, '#7BC67E', 4) + C(0, 0, 14, '#4E9A52', 0)); return G(`translate(0,0) scale(1)`, `<g transform="translate(${x},${y}) scale(${s}) translate(${-x},${-y})">${p}</g>`); };
right += pile(1110, 1060, 1.3) + pile(1790, 1060, 1.3);
right += bills(2.5, 40, 12).replace(/translate\((\d+(\.\d+)?)/g, (m, x) => 'translate(' + (960 + parseFloat(x) / 2));
const notif = (x, y, r, sc) => G(`translate(${x},${y}) rotate(${r}) scale(${sc})`, R(-190, -52, 380, 104, 22, '#FFFFFF', 7) + C(-138, 0, 32, '#2E7D5A', 0) + T(-138, 12, '$', 38, '#FFFFFF') + T(30, -6, '+R$ 100', 44, '#2E7D5A') + T(30, 32, 'MENTIRA DETECTADA', 20, '#C62A2A'));
right += notif(1170, 390, -8, 0.95) + notif(1730, 360, 7, 0.95) + notif(1150, 720, 6, 0.85) + notif(1745, 690, -6, 0.85);
right += C(1440, 560, 300, 'rgba(255,255,255,0.35)', 0);
right += person(neoAt(25, { x: 1440, y: 1900, s: 2.05, expr: 'happy', smile: true, hl: [-190, -470], hr: [190, -470] }));
g += panel(960, 960, 'maeCozinha', right, 'blur(2px) saturate(1.2)', 0);
g += sep(960);
g += BIG(480, 190, 'R$ 100', 175) + BIG(1440, 190, 'R$ 58 MIL', 185, '#3BE36A');
return g;
