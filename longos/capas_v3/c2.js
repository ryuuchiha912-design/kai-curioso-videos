// R$100 POR MENTIRA: a mãe "tô ótima" + carimbo MENTIRA + celular do banco
const D = '<defs><radialGradient id="gold" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#FFE38A"/><stop offset="0.45" stop-color="#3FB06A"/><stop offset="1" stop-color="#0E3A24"/></radialGradient></defs>';
let g = VOL + D + R(-10, -10, 1940, 1100, 0, 'url(#gold)', 0);
for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; g += '<polygon points="1250,520 ' + (1250 + Math.cos(a) * 2200) + ',' + (520 + Math.sin(a) * 2200) + ' ' + (1250 + Math.cos(a + 0.13) * 2200) + ',' + (520 + Math.sin(a + 0.13) * 2200) + '" fill="rgba(255,255,255,0.08)"/>'; }
g += bills(2.2, 34, 9);
// celular gigante à esquerda
g += G('translate(430,560) rotate(-8) scale(1.45)', R(-190, -360, 380, 720, 50, '#1A1A20', 9) + R(-168, -330, 336, 660, 30, '#F4F6FA', 0) + R(-168, -330, 336, 110, 30, '#2E7D5A', 0) + T(0, -262, 'BANCO', 40, '#FFFFFF') + T(0, -170, 'SALDO', 34, '#5A6070') + T(0, -100, 'R$ 58.000', 66, '#2E7D5A')
  + [0, 1, 2].map(i => G(`translate(0,${-10 + i * 110})`, R(-150, -46, 300, 92, 18, i === 2 ? '#FFE3E3' : '#FFFFFF', 5) + C(-104, 0, 28, i === 2 ? '#C62A2A' : '#2E7D5A', 0) + T(-104, 10, '$', 32, '#FFFFFF') + T(26, -6, '+R$ 100', 36, i === 2 ? '#C62A2A' : '#2E7D5A') + T(26, 28, i === 2 ? 'origem: MÃE' : 'mentira detectada', 20, i === 2 ? '#C62A2A' : '#5A6070'))).join(''));
// a mãe sorrindo + balão + carimbo
g += person(Object.assign({}, LUCIA, { x: 1380, y: 1560, s: 1.55, expr: 'happy', hr: [210, -330] }));
g += G('translate(1520,170) rotate(-3)', R(-330, -100, 660, 200, 50, '#FFFFFF', 10) + P('M-160,96 L-220,190 L-60,96Z', '#FFFFFF', 10) + R(-140, 92, 120, 12, 0, '#FFFFFF', 0) + T(0, 34, '"TÔ ÓTIMA."', 104, '#1A1210'));
g += G('translate(1560,300) rotate(-14)', R(-260, -70, 520, 140, 18, 'rgba(255,255,255,0.0)', 0) + `<rect x="-260" y="-70" width="520" height="140" rx="18" fill="none" stroke="#E0201A" stroke-width="14"/>` + T(0, 34, 'MENTIRA', 100, '#E0201A'));
g += G('translate(1000,1005)', R(-560, -62, 1120, 112, 40, 'rgba(26,18,16,0.9)', 0) + T(0, 24, 'CADA MENTIRA = +R$100', 72, '#FFE14D'));
return g;
