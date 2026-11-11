function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#1A1210', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0;
  let g = sky(0.5) + C(880, 600, 80, '#FFE7A8', 6);
  g += houseFront(140, 1500, 800, 600, '#F2D2A0', '#B5523B') + R(-60, 1500, 1200, 600, 0, '#4E7E3A', 8);
  g += gate(540, 1960, 1.25);
  g += pp(MAE, { x: 540, y: 2060, s: 1.5, expr: 'sad', lx: 0, hl: [-120, -190], hr: [120, -190] }) + cake(540, 1760, 0.85, 1, 0.3);
  g += G('translate(540,230) rotate(-2)', R(-510, -150, 1020, 300, 50, '#1A1210', 0) + R(-510, -162, 1020, 300, 50, '#2A1E3A', 9) + shadowT(0, -50, 'SÓ 1 DIA POR ANO', 84, '#FFFFFF') + shadowT(0, 60, 'COM SUA MÃE', 100, '#FFE14D'));
  g += G('translate(820,1060) rotate(8)', R(-170, -60, 340, 120, 30, '#FFFFFF', 8) + T(0, 6, 'ELA ESPEROU...', 40, '#C62A2A'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + g;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
