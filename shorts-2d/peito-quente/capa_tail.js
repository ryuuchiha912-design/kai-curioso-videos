const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#2E2433', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0; TNOW = 0.7;
  let g = bedroom(0.75) + roomDoor(165, 1500, 0.95, 1) + clockRed(860, 820, 1.15);
  g += bedNight(690, 1700, 1.15, '#5A6FB0') + KAIs({ x: 640, y: 1760, s: 1.45, legs: false, expr: 'surprised', hl: [-60, -330], hr: [60, -300] }) + blanket(620, 1770, 1.3, '#5A6FB0');
  g += chestGlow(640, chestY(1760, 1.45) + 40, 1.35, 0.7, '#FF6A1A', 1.25);
  g += `<ellipse cx="165" cy="1500" rx="190" ry="80" fill="none" stroke="#FF2A2A" stroke-width="12"/>` + G('translate(330,1330) rotate(-35)', P('M0,0 L70,-30 L60,0 L70,30Z', '#FF2A2A', 6) + R(60, -10, 120, 20, 6, '#FF2A2A', 0));
  g += G('translate(540,250) rotate(-2)', R(-510, -170, 1020, 340, 50, '#2E2433', 0) + shadowT(0, -60, 'ALGUÉM PENSA', 96, '#FFFFFF') + shadowT(0, 72, 'EM VOCÊ ÀS 3:17', 96, '#FFB347'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs><g filter="url(#grade)">` + g + '</g>' + LOOK;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
