// 1 ANO MAIS NOVO: o espelho mostra um bebê
const D = '<defs><radialGradient id="spot" cx="0.68" cy="0.45" r="0.6"><stop offset="0" stop-color="#FFF6D0" stop-opacity="0.55"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient></defs>';
let g = VOL + D + '<image href="bg/banheiro.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(3px) brightness(0.7) saturate(1.1)"/>' + R(-10, -10, 1940, 1100, 0, 'rgba(10,40,60,0.35)', 0) + R(-10, -10, 1940, 1100, 0, 'url(#spot)', 0);
const inner = R(900, 60, 800, 900, 0, '#CFE9F5', 0) + C(1300, 520, 330, 'rgba(255,255,255,0.35)', 0) + E(1300, 900, 300, 190, '#F4E6D8', 9) + E(1300, 900, 300, 190, 'url(#vol)', 0) + P('M1040,860 Q1300,760 1560,860', 'none', 0, 'stroke="#E8D2BE" stroke-width="14"') + G('translate(1300,520) scale(1.9)', head(Object.assign(neoAt(0), { hs: 1, expr: 'surprised', blink: false }))) + C(1300, 650, 34, '#FF8FC0', 7) + C(1300, 650, 14, '#FFFFFF', 0);
g += mirror2d(1300, 510, 760, 880, inner);
g += person(neoAt(28, { x: 520, y: 2050, s: 2.2, expr: 'surprised', hl: [-105, -265], hr: [105, -265] }));
g += G('translate(930,760) rotate(-15)', P('M-70,-26 L60,-26 L60,-62 L140,0 L60,62 L60,26 L-70,26Z', '#FF2A2A', 9));
g += '<ellipse cx="1300" cy="600" rx="330" ry="380" fill="none" stroke="#FF2A2A" stroke-width="16"/>';
g += G('translate(1300,120) rotate(3)', R(-210, -70, 420, 140, 36, '#C62A2A', 9) + T(0, 30, 'DIA 30', 88, '#FFFFFF'));
g += G('translate(1310,960) rotate(-2)', T(0, 0, 'SOU EU?!', 150, '#FFE14D', 30));
return g;
