let g = VOL;
// DIA 1 — portão lotado, tudo cancelado
let p1 = board(330, 330, 0.42, [['10:05', 'LISBOA', 'CANCELADO'], ['10:20', 'RECIFE', 'CANCELADO'], ['10:40', 'TÓQUIO', 'CANCELADO'], ['11:00', 'MIAMI', 'CANCELADO']], 0);
[[0, 90], [1, 230], [3, 470], [4, 590]].forEach(([i, x]) => { p1 += person(Object.assign({}, PAX[i], { x, y: 1250, s: 0.85, sx: x > 320 ? -1 : 1, expr: i % 2 ? 'angry' : 'worried' })); });
p1 += person(neoAt(25, { x: 330, y: 1880, s: 1.8, expr: 'worried' }));
g += panel(0, 640, 'portao', p1, 'blur(1px) saturate(1.25)', 0);
// DIA 7 — escuro, silhueta na névoa, mão no vidro
let p2 = fog(2, 0.8, 120, 520, 5) + shadowFig(1080, 760, 0.7, 0.55) + handPrint(860, 420, 1.0, 0.95) + person(Object.assign({}, LIA, { x: 820, y: 1500, s: 1.25, expr: 'worried', hl: [-100, -250] })) + person(neoAt(25, { x: 1010, y: 1880, s: 1.75, expr: 'surprised', hl: [-110, -270], hr: [110, -270] })) + vig(0.6);
g += panel(640, 640, 'portaoEscuro', p2, 'blur(1px) saturate(1.1)', 0);
// DIA 12 — 03:17: o avião abre a porta, alguém na porta; a Dona Cida sorri
const ND = '<defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1030" stop-opacity="0.75"/><stop offset="0.6" stop-color="#1A1440" stop-opacity="0.35"/><stop offset="1" stop-color="#05060A" stop-opacity="0.6"/></linearGradient><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0C0" stop-opacity="0.75"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></linearGradient><radialGradient id="dglow"><stop offset="0" stop-color="#FFF4D0" stop-opacity="0.9"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient></defs>';
let p3 = ND + R(1270, -10, 660, 1100, 0, 'url(#night)', 0);
p3 += P('M1580,640 L1700,640 L1860,1080 L1420,1080Z', 'url(#beam)', 0);
p3 += C(1640, 520, 260, 'url(#dglow)', 0);
p3 += G('translate(1640,520) scale(1.35)', R(-62, -110, 124, 220, 8, '#FFF6DA', 7) + shadowFig(0, 104, 0.33, 0.95));
p3 += stairs(1640, 900, 1, 290) + fog(3, 0.55, 780, 300, 7);
p3 += person(Object.assign({}, CIDA, { x: 1450, y: 1640, s: 1.3, expr: 'creepy' }));
p3 += '<ellipse cx="1640" cy="510" rx="150" ry="190" fill="none" stroke="#FF2A2A" stroke-width="12"/>';
p3 += G('translate(1395,620) rotate(-6)', R(-110, -46, 220, 92, 26, '#2A0E10', 7) + T(0, 22, '03:17', 60, '#FF4A3A'));
p3 += vig(0.55);
g += panel(1280, 640, 'pista', p3, 'blur(1px) brightness(0.62) saturate(0.85)', -572);
g += sep(640) + sep(1280);
g += BIG(320, 190, 'DIA 1', 160) + BIG(960, 190, 'DIA 7', 160, '#FFE14D') + BIG(1600, 190, 'DIA 12', 160, '#FF4A3A');
return g;
