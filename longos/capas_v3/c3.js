// FELICIDADE: sorrindo no velório
const D = '<defs><radialGradient id="sp" cx="0.5" cy="0.52" r="0.45"><stop offset="0" stop-color="#FFE9B0" stop-opacity="0.55"/><stop offset="1" stop-color="#FFE9B0" stop-opacity="0"/></radialGradient></defs>';
let g = VOL + D + '<image href="bg/velorio.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(3px) brightness(0.45) saturate(0.7)"/>' + R(-10, -10, 1940, 1100, 0, 'rgba(20,16,40,0.35)', 0);
[[LUTO1, 230, 1.0], [LUTO2, 520, 1.05], [LUCIA_P, 1400, 1.05], [LUTO3, 1690, 1.0]].forEach(([c, x, s]) => { g += person(Object.assign({}, c, { x, y: 1240, s, sx: x > 960 ? -1 : 1, expr: 'sad' })) + tears(x, 1240 - 640 * s * 0.92 + 40, 0.4, 0.8 * s) + tears(x, 1240 - 640 * s * 0.92 + 40, 0.9, 0.8 * s); });
g += R(-10, -10, 1940, 1100, 0, 'url(#sp)', 0);
g += person(neoAt(25, { x: 960, y: 2150, s: 2.25, shirt: '#22222A', inner: '#22222A', expr: 'creepy' }));
g += '<ellipse cx="960" cy="520" rx="270" ry="250" fill="none" stroke="#FF2A2A" stroke-width="16"/>';
g += G('translate(960,95) rotate(-2)', T(0, 0, 'SORRINDO', 120, '#FFFFFF', 26)) + G('translate(560,1000) rotate(-3)', T(0, 0, 'NO VELÓRIO?!', 120, '#FFE14D', 26));
g += G('translate(1480,980) rotate(4) scale(1.1)', meterPill(-260, -37, 204800, 0.2));
return g;
