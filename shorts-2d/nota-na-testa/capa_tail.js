const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#2E2433', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0; TNOW = 0.7;
  let g = classroom() + schoolDesk(540, 1700, 1.4) + paper(250, 1600, 1.1, -12, '10') + paper(830, 1620, 1.1, 10, '10');
  g += pp(ANA, { x: 150, y: 1500, s: 0.6, expr: 'happy', fore: 10 }) + pp(PEDRO, { x: 930, y: 1500, s: 0.6, sx: -1, expr: 'sus', fore: 9 });
  g += C(540, 1240, 200, 'rgba(255,90,78,0.18)', 0);
  g += KAIs({ x: 540, y: 2250, s: 1.75, expr: 'surprised', fore: '0' }) + tears(540, 1460, 0.3, 1.6);
  g += G('translate(540,1060) scale(1.5)', `<g opacity="0.0"></g>`);
  g += G('translate(540,230) rotate(-2)', R(-510, -160, 1020, 320, 50, '#2E2433', 0) + shadowT(0, -55, 'MINHA NOTA', 92, '#FFFFFF') + shadowT(0, 70, 'É ZERO', 116, '#FF5A4E'));
  g += G('translate(800,560) rotate(8)', R(-230, -50, 460, 100, 26, '#FFFFFF', 7) + T(0, 6, 'NA MINHA TESTA!', 48, '#C62A2A'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs><g filter="url(#grade)">` + g + '</g>' + LOOK;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
