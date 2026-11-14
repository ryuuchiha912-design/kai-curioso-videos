const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#2E2433', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0;
  let g = rays(0.3, '#5B4A9A', '#F0A070');
  g += G('translate(540,230) rotate(-2)', R(-510, -150, 1020, 300, 50, '#2E2433', 0) + shadowT(0, -52, 'MEUS PAIS VIRARAM', 76, '#FFFFFF') + shadowT(0, 62, 'CRIANÇAS', 104, '#F7D64A'));
  g += pp(MAEk, { x: 250, y: 1900, s: 0.85, expr: 'worried', hr: [130, -560], hl: [-130, -300] });
  g += pp(PAIk, { x: 830, y: 1900, s: 0.85, sx: -1, expr: 'sad', hl: [-110, -170], hr: [110, -170] }) + tears(830, 1900 - 0.85 * (268 + 120 * 1.35) - 20, 0.4, 1.0);
  g += KAIs({ x: 540, y: 1640, s: 1.2, expr: 'surprised', hl: [-190, -380], hr: [190, -380] });
  g += G('translate(540,620) rotate(-5)', R(-260, -70, 520, 140, 36, '#FFFFFF', 8) + T(0, 8, 'EU: 16 ANOS', 70, '#C62A2A'));
  g += G('translate(250,1225) rotate(-6)', R(-120, -48, 240, 96, 26, '#2E2433', 0) + T(0, 6, '6 ANOS', 50, '#F7D64A')) + G('translate(830,1225) rotate(6)', R(-120, -48, 240, 96, 26, '#2E2433', 0) + T(0, 6, '7 ANOS', 50, '#F7D64A'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs><g filter="url(#grade)">` + g + '</g>' + LOOK;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
