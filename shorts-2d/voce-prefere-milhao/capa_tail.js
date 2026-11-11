// ---------------- capa cartoon (mais brilho, sombra e volume)
function shadowT(x, y, s, size, fill, rot = 0) {
  return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#1A1210', size * 0.22) + T(0, 0, s, size, fill, size * 0.16));
}
function coinC(x, y, s, rot = 0) {
  return G(`translate(${x},${y}) rotate(${rot}) scale(${s})`, E(0, 6, 46, 46, '#B07A12') + C(0, 0, 46, '#F2C23A', 7) + C(0, 0, 32, 'none', 0, 'stroke="#D9A21E" stroke-width="6"') + T(0, 4, 'R$', 30, '#A5781A') + E(-16, -18, 10, 6, 'rgba(255,255,255,0.8)', 0));
}
function shine(x, y, rx, ry, rot = -30) { return G(`translate(${x},${y}) rotate(${rot})`, E(0, 0, rx, ry, 'rgba(255,255,255,0.55)', 0)); }
function pill(x, y, w, h, fill, txt, size, col, rot = 0) {
  return G(`translate(${x},${y}) rotate(${rot})`, R(-w / 2, -h / 2 + 12, w, h, h / 2, '#1A1210', 0) + R(-w / 2, -h / 2, w, h, h / 2, fill, 9) + R(-w / 2 + 24, -h / 2 + 12, w - 48, h * 0.28, h * 0.14, 'rgba(255,255,255,0.35)', 0) + T(0, 6, txt, size, col, 0));
}
window.renderAt = function () {
  ZID = 0;
  let g = '';
  // fundo: metade vermelha / metade azul com raios e brilho no centro
  g += R(-60, -60, 600, 2040, 0, RED, 0) + R(540, -60, 600, 2040, 0, BLUE, 0);
  for (let i = 0; i < 9; i++) { const a = i * 0.7; g += P(`M270,900 L${270 + Math.cos(a) * 1100},${900 + Math.sin(a) * 1100} L${270 + Math.cos(a + 0.32) * 1100},${900 + Math.sin(a + 0.32) * 1100}Z`, RED2, 0); }
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.35; g += P(`M810,900 L${810 + Math.cos(a) * 1100},${900 + Math.sin(a) * 1100} L${810 + Math.cos(a + 0.32) * 1100},${900 + Math.sin(a + 0.32) * 1100}Z`, BLUE2, 0); }
  
  g = `<defs><radialGradient id="glw"><stop offset="0" stop-color="#FFF6C8" stop-opacity="0.75"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient></defs>` + g;
  g += C(270, 760, 330, 'url(#glw)', 0) + C(810, 760, 330, 'url(#glw)', 0);
  g += R(532, -60, 16, 2040, 0, '#1A1210', 0);
  // dinheiro voando
  const bills = [[90, 520, -25], [980, 600, 20], [120, 1180, 15], [960, 1240, -18], [700, 330, 30], [380, 340, -20]];
  bills.forEach(([x, y, r]) => g += bill(x, y, 0.75, r));
  [[70, 860, 0.9, -10], [1000, 900, 0.8, 15], [430, 1330, 0.7, 0], [660, 1300, 0.75, 20], [200, 640, 0.6, 0], [890, 470, 0.65, 0]].forEach(([x, y, s, r]) => g += coinC(x, y, s, r));
  // A: saco de dinheiro brilhando, em cima de pilha de moedas
  g += E(270, 990, 200, 34, 'rgba(0,0,0,0.25)', 0);
  for (let i = 0; i < 6; i++) g += coinC(170 + i * 40, 980 - (i % 2) * 10, 0.75);
  g += moneyBag(270, 800, 1.45) + shine(205, 735, 30, 60);
  g += pill(270, 1110, 440, 150, '#1A1210', '', 1, '#fff') + T(270, 1085, 'R$ 1 MILHÃO', 60, '#FFFFFF') + T(270, 1148, 'AGORA', 54, '#FFE14D');
  // B: calendário com dinheiro e infinito
  g += E(810, 990, 200, 34, 'rgba(0,0,0,0.25)', 0);
  g += calendar(810, 790, 1.3, 'TODO MÊS', '+10 MIL', GREEN) + cash(960, 1000, 0.55, 5);
  g += pill(810, 1110, 440, 150, '#1A1210', '', 1, '#fff') + T(810, 1085, 'R$ 10 MIL/MÊS', 56, '#FFFFFF') + T(810, 1148, 'PRA SEMPRE', 54, '#FFE14D');
  // letras A e B em botões brilhantes
  for (const [x, L, c] of [[270, 'A', RED], [810, 'B', BLUE]]) g += G(`translate(${x},430)`, C(0, 10, 92, '#1A1210', 0) + C(0, 0, 92, '#FFFFFF', 10) + C(0, 0, 74, 'none', 0, `stroke="${c}" stroke-width="10"`) + T(0, 10, L, 120, c, 0) + shine(-30, -40, 26, 14));
  // VS: moeda dourada
  g += G('translate(540,1250) rotate(-8)', C(0, 12, 104, '#8A5A12', 0) + C(0, 0, 104, '#F2C23A', 10) + C(0, 0, 82, 'none', 0, 'stroke="#D9A21E" stroke-width="10"') + T(0, 10, 'VS', 92, '#1A1210', 0) + shine(-40, -50, 30, 14));
  for (const [x, y, s] of [[420, 1170, 1], [665, 1160, 0.8], [640, 1360, 0.7]]) g += star(x, y, 26 * s, 10 * s, 4, '#FFF6C8');
  // título com sombra e contorno grosso
  g += G('translate(540,215) rotate(-2)', R(-505, -112, 1010, 236, 52, '#1A1210', 0) + R(-505, -124, 1010, 236, 52, '#2A1E3A', 9) + R(-470, -104, 940, 60, 30, 'rgba(255,255,255,0.12)', 0) + shadowT(0, 0, 'VOCÊ PREFERE?', 110, '#FFE14D'));
  // Kai grande, surpreso, olhos livres
  g += KAIs({ x: 540, y: 2260, s: 1.6, expr: 'surprised', lx: -0.6, hl: [-210, -600], hr: [210, -600] });
  g += G('translate(845,1430) rotate(14)', shadowT(0, 0, '!', 130, '#FFE14D')) + G('translate(240,1440) rotate(-14)', shadowT(0, 0, '?', 120, '#FFFFFF'));
  // chamada no pé
  g += pill(540, 1835, 760, 130, '#FFFFFF', 'COMENTA A OU B!', 66, '#1A1210', -2);
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + g;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
