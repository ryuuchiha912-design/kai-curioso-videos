const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
function shadowT(x, y, s, size, fill, rot = 0) { return G(`translate(${x},${y}) rotate(${rot})`, T(0, size * 0.09, s, size, '#2E2433', size * 0.22) + T(0, 0, s, size, fill, size * 0.16)); }
window.renderAt = function () {
  ZID = 0; TNOW = 0.7;
  let g = room('#F6E3C8', '#B9874F', 1560) + windowFrame(660, 470, 320, 300, '#BFE3F5') + sun(900, 560, 46, 0.5);
  g += R(60, 1000, 200, 240, 10, '#8A5A3A', 8) + R(80, 1020, 160, 90, 6, '#B9874F', 0) + R(80, 1130, 160, 90, 6, '#B9874F', 0);   // cômoda
  g += bedKid(560, 1620, 1.3);
  // corpo do Kai deitado (ombros + cobertor), ligado à cabeça
  g += P('M330,1400 Q380,1360 470,1380 L480,1545 L330,1545Z', KAI.shirt) + P('M330,1400 Q380,1360 470,1380 L480,1545 L330,1545Z', 'url(#vol)', 0);
  g += P('M352,1392 Q400,1440 470,1430', 'none', 0) + `<path d="M350,1395 Q400,1445 472,1428" fill="none" stroke="#1A1A20" stroke-width="34" stroke-linecap="round"/>` + R(440, 1420, 26, 70, 8, '#F07A1A', 4);
  g += P('M450,1545 L450,1430 Q520,1380 640,1400 Q760,1370 880,1410 Q960,1420 960,1470 L960,1545Z', '#7A90C8') + P('M450,1545 L450,1430 Q520,1380 640,1400 Q760,1370 880,1410 Q960,1420 960,1470 L960,1545Z', 'url(#vol)', 0);
  g += E(905, 1400, 48, 34, '#7A90C8') + E(840, 1395, 44, 32, '#7A90C8');   // pés embaixo do cobertor
  g += lying(Object.assign({}, KAI, { expr: 'squish' }), 255, 1415, 0.9) + tears(255, 1360, 0.3, 0.8);
  g += bag(690, 1280, 1.35, KAI_B, 8, -8);
  g += limb(440, 1450, 330, 1650, KAI.shirt, 44) + C(322, 1668, 30, KAI.skin) + C(322, 1668, 30, 'url(#vol)', 0);   // braço pedindo ajuda
  g += limb(470, 1420, 545, 1330, KAI.shirt, 40) + C(552, 1322, 28, KAI.skin);                                         // mão empurrando a mochila
  for (const [x, y, s, sd] of [[180, 820, 1.2, 1], [900, 900, 1.0, 2], [820, 1700, 1.1, 3], [380, 1800, 0.9, 4]]) g += stone(x, y, s, sd);
  for (let i = 0; i < 3; i++) g += Ln(250 + i * 50, 1140 - i * 30, 280 + i * 50, 1100 - i * 30, '#FFFFFF', 8);
  g += G('translate(820,690) rotate(8)', R(-180, -70, 360, 140, 34, '#C62A2A', 9) + T(0, 8, '50 KG', 88, '#FFFFFF'));
  g += G('translate(540,230) rotate(-2)', R(-510, -160, 1020, 320, 50, '#2E2433', 0) + shadowT(0, -55, 'MINHA MOCHILA', 82, '#FFFFFF') + shadowT(0, 70, 'PESA 50 KG', 104, '#F7D64A'));
  g += G('translate(250,560) rotate(-8)', R(-200, -50, 400, 100, 26, '#FFFFFF', 7) + T(0, 6, 'DE PALAVRAS!', 48, '#C62A2A'));
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs><g filter="url(#grade)">` + g + '</g>' + LOOK;
};
window.DUR = DUR;
window.renderAt(0);
</script>
</body></html>
