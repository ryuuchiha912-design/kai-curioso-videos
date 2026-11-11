window.renderAt = function () {
  ZID = 0;
  let g = splitAB(0.4, 1.05, 1.05);
  g += G('translate(540,170) rotate(-2)', R(-500, -120, 1000, 240, 46, '#1A1210', 0) + T(0, 8, 'VOCÊ PREFERE?', 110, '#FFE14D'));
  g += KAIs({ x: 540, y: 2180, s: 1.5, expr: 'surprised', lx: -1, hl: [-200, -560], hr: [200, -560] });
  g += G('translate(540,1835) rotate(-3)', R(-380, -70, 760, 140, 34, '#FFFFFF', 10) + T(0, 8, 'COMENTA A OU B!', 64, '#1A1210'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + g;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
