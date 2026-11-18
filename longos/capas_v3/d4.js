let g = VOL;
// DIA 1 — portão lotado, tudo cancelado
let p1 = board(330, 330, 0.42, [['10:05', 'LISBOA', 'CANCELADO'], ['10:20', 'RECIFE', 'CANCELADO'], ['10:40', 'TÓQUIO', 'CANCELADO'], ['11:00', 'MIAMI', 'CANCELADO']], 0);
[[0, 90], [1, 230], [3, 470], [4, 590]].forEach(([i, x]) => { p1 += person(Object.assign({}, PAX[i], { x, y: 1250, s: 0.85, sx: x > 320 ? -1 : 1, expr: i % 2 ? 'angry' : 'worried' })); });
p1 += person(neoAt(25, { x: 330, y: 1880, s: 1.8, expr: 'worried' }));
g += panel(0, 640, 'portao', p1, 'blur(1px) saturate(1.25)', 0);
// DIA 7 — escuro, silhueta na névoa, mão no vidro
let p2 = fog(2, 0.8, 120, 520, 5) + shadowFig(1080, 760, 0.7, 0.55) + handPrint(860, 420, 1.0, 0.95) + person(Object.assign({}, LIA, { x: 820, y: 1500, s: 1.25, expr: 'worried', hl: [-100, -250] })) + person(neoAt(25, { x: 1010, y: 1880, s: 1.75, expr: 'surprised', hl: [-110, -270], hr: [110, -270] })) + vig(0.6);
g += panel(640, 640, 'portaoEscuro', p2, 'blur(1px) saturate(1.1)', 0);
// DIA 12 — o avião abre a porta; a Dona Cida sorri
let p3 = fog(3, 0.7, 300, 600, 7) + G('translate(1640,540)', R(-60, -108, 120, 216, 6, 'rgba(255,240,200,0.95)', 0) + C(0, 0, 200, 'rgba(255,240,200,0.18)', 0)) + stairs(1640, 830, 1, 210) + person(Object.assign({}, CIDA, { x: 1560, y: 1720, s: 1.5, expr: 'creepy' })) + vig(0.65);
g += panel(1280, 640, 'pista', p3, 'blur(1.5px) brightness(0.55) saturate(0.7)', -572);
g += sep(640) + sep(1280);
g += BIG(320, 190, 'DIA 1', 160) + BIG(960, 190, 'DIA 7', 160, '#FFE14D') + BIG(1600, 190, 'DIA 12', 160, '#FF4A3A');
return g;
