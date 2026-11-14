const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#2E2433', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0; TNOW = 0.7;
  let g = room('#3A4670', '#2A3352', 1560);
  g += stars(1.3) + windowFrame(70, 470, 300, 330, '#16224A') + C(290, 560, 46, '#F4F1EA', 6) + C(170, 690, 4, '#FFFFFF', 0) + C(130, 560, 3, '#FFFFFF', 0);
  // estante com o porta-retrato do avô e a vela
  g += R(-20, 1240, 340, 26, 6, '#8A5A3A', 7) + R(30, 1010, 170, 230, 14, '#7A4A2A', 8) + R(46, 1026, 138, 198, 8, '#F6C46A', 0) + clipG('<rect x="46" y="1026" width="138" height="198"/>', G('translate(115,1130) scale(0.5)', miniVovo('happy')));
  g += R(222, 1170, 34, 70, 8, '#FFF6E0', 6) + P('M239,1170 q8,-24 0,-44 q-8,20 0,44', '#F2B636', 5) + C(239, 1140, 46, 'rgba(255,214,120,0.25)', 0);
  // luz dourada saindo do celular
  const id = 'cg';
  g += `<radialGradient id="${id}"><stop offset="0" stop-color="#FFE9A8" stop-opacity="0.85"/><stop offset="1" stop-color="#FFB84A" stop-opacity="0"/></radialGradient>` + C(540, 1060, 520, `url(#${id})`, 0);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.2; g += P(`M540,1060 L${540 + Math.cos(a) * 900},${1060 + Math.sin(a) * 900} L${540 + Math.cos(a + 0.12) * 900},${1060 + Math.sin(a + 0.12) * 900}Z`, 'rgba(255,236,170,0.10)', 0); }
  // o avô numa janela de luz (canto direito)
  g += G('translate(0,0)', callPanel(840, 760, 380, 400, 0.5, { expr: 'happy', s: 0.62, hr: [170, -380] }));
  g += bigPhone(540, 1060, 1.1, 0.33, 'ring');
  for (const [x, y, s] of [[180, 880, 1.0], [760, 1300, 0.8], [640, 600, 0.7], [300, 1420, 0.6], [880, 1060, 0.9]]) g += sparkle(x, y, s);
  g += KAIs({ x: 840, y: 1990, s: 1.05, sx: -1, expr: 'surprised', hl: [-170, -320], hr: [170, -320] }) + tears(840, 1990 - 474 * 1.05 * 1.28 + 120, 0.3, 0.8);
  g += G('translate(250,1600) rotate(-6)', R(-150, -55, 300, 110, 34, '#C62A2A', 7) + R(-118, -30, 30, 60, 6, '#FFFFFF', 0) + T(30, 6, '1:00', 64, '#FFE14D'));
  g += G('translate(540,230) rotate(-2)', R(-510, -160, 1020, 320, 50, '#2E2433', 0) + shadowT(0, -55, 'O VOVÔ', 96, '#FFFFFF') + shadowT(0, 70, 'ME LIGOU', 110, '#F7D64A'));
  g += G('translate(800,500) rotate(8)', R(-210, -50, 420, 100, 26, '#FFFFFF', 7) + T(0, 6, 'ELE MORREU!', 52, '#C62A2A'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs><g filter="url(#grade)">` + g + '</g>' + LOOK;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
