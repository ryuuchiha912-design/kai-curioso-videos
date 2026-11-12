function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#1A1210', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0;
  let g = rays(0.3, '#C62A2A', '#D94436', 540, 1000, 20, 0);
  g += G('translate(540,215) rotate(-2)', R(-510, -150, 1020, 300, 50, '#1A1210', 0) + shadowT(0, -52, 'SÓ DÁ PRA PEDIR', 78, '#FFFFFF') + shadowT(0, 62, '"DESCULPA" 3 VEZES', 84, '#FFE14D'));
  g += bigWrist(560, 720, 1.15, 0, 'mae', 0);
  g += G('translate(800,560) rotate(10)', R(-150, -60, 300, 120, 30, '#FFFFFF', 8) + T(0, 6, 'ZERO?!', 64, '#C62A2A'));
  g += pp(MAE_OLD, { x: 760, y: 1950, s: 1.25, sx: -1, expr: 'sad', hr: [200, -300], wrist: '0' });
  g += KAIs({ x: 300, y: 1950, s: 1.25, expr: 'surprised', lx: 1, wrist: '2', hr: [190, -330] });
  g += bubble(80, 1030, 380, 120, 'MÃE...?', 56, 'left');
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + g;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
