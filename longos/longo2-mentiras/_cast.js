// ================= ELENCO PRÓPRIO DO CANAL DO NEO (nada igual aos personagens do Kai) =================
// cabelos novos: bob, pony (rabo de cavalo), spiky, wavy, side (repartido), buzz (raspado)
function hair(d) {
  const c = d.hairCol, sh = parseInt(c.slice(1, 3), 16) < 90 ? tint(c, 0.2) : shade(c, 0.18);
  const strands = (arr) => arr.map(([x1, y1, x2, y2]) => `<path d="M${x1},${y1} Q${(x1 + x2) / 2 + 8},${(y1 + y2) / 2} ${x2},${y2}" fill="none" stroke="${sh}" stroke-width="6" stroke-linecap="round"/>`).join('');
  const gloss = `<path d="M-80,-104 Q-30,-128 30,-120" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="11" stroke-linecap="round"/>`;
  if (d.hair === 'kai') return kaiFrontHair(d);
  if (d.hair === 'neo') return neoFrontHair(d);
  if (d.hair === 'bob') return P('M-142,6 C-162,-196 162,-200 142,6 L126,-40 Q60,-60 -10,-96 Q-80,-70 -128,-30 Z', c, 7) + P('M-142,-30 L-152,96 L-114,84 L-120,-6Z', c, 6) + P('M142,-30 L152,96 L114,84 L120,-6Z', c, 6) + strands([[-80, -120, -60, -60], [10, -128, 30, -70], [80, -110, 100, -50]]) + gloss;
  if (d.hair === 'pony') return P('M-136,0 C-150,-186 150,-190 136,0 L118,-46 L92,-20 L70,-54 L40,-26 L10,-58 L-20,-26 L-50,-56 L-80,-22 L-104,-50 L-120,-14 Z', c, 7) + strands([[-60, -120, -40, -60], [30, -126, 40, -66]]) + R(-24, -150, 48, 26, 10, d.tie2 || '#E04B3C', 5) + gloss;
  if (d.hair === 'spiky') return P('M-132,-6 L-160,-110 L-108,-96 L-104,-176 L-50,-132 L-6,-206 L36,-134 L92,-180 L100,-100 L156,-116 L132,-6 C100,-66 50,-56 0,-60 C-50,-56 -100,-66 -132,-6Z', c, 7) + strands([[-60, -110, -40, -70], [40, -120, 50, -74]]);
  if (d.hair === 'wavy') return P('M-140,10 C-160,-196 160,-200 140,10 Q120,-50 60,-80 Q20,-96 0,-70 Q-20,-96 -60,-80 Q-120,-50 -140,10Z', c, 7) + strands([[-50, -120, -70, -60], [50, -120, 70, -60]]) + gloss;
  if (d.hair === 'side') return P('M-128,-4 C-138,-156 138,-160 128,-4 C118,-70 60,-96 -30,-84 L-40,-100 C-80,-84 -112,-54 -128,-4Z', c, 7) + Ln(-36, -98, -24, -140, sh, 5) + strands([[0, -120, 60, -96], [40, -130, 100, -96]]) + gloss;
  if (d.hair === 'buzz') { let g = P('M-126,-24 C-132,-146 132,-146 126,-24 C84,-92 -84,-92 -126,-24Z', c, 6); const r = rng(9); for (let i = 0; i < 26; i++) g += C(-100 + r() * 200, -118 + r() * 60, 3, sh, 0); return g; }
  if (d.hair === 'afro') { let g = P('M-150,-10 C-196,-150 -120,-236 0,-230 C120,-236 196,-150 150,-10 C120,-76 60,-92 0,-88 C-60,-92 -120,-76 -150,-10Z', c, 7); const r = rng(13); for (let i = 0; i < 40; i++) g += C(-150 + r() * 300, -200 + r() * 150, 5, sh, 0); return g; }
  if (d.hair === 'curly') { let g = ''; for (const [x, y, r] of [[-112, -66, 34], [-84, -100, 38], [-42, -116, 40], [0, -120, 40], [42, -116, 40], [84, -100, 38], [112, -66, 34], [-60, -132, 30], [20, -138, 30], [70, -128, 28], [10, -100, 34]]) g += C(x, y, r, c, 6); return g; }
  if (d.hair === 'short' || d.hair === 'bun') { let g = P('M-124,-6 C-134,-130 134,-130 124,-6 C112,-62 60,-82 0,-80 C-60,-82 -112,-62 -124,-6Z', c, 7); if (d.hair === 'bun') g += C(0, -128, 36, c, 7); return g; }
  return '';
}
/** cabelo de trás (fica atrás da cabeça) para os estilos compridos */
function backHairFor(d) {
  if (d.back) return '';
  if (d.hair === 'kai') return kaiBackHair(d);
  if (d.hair === 'neo') return neoBackHair(d);
  const c = shade(d.hairCol, 0.12);
  if (d.hair === 'bob') return P('M-156,-20 C-176,-210 176,-210 156,-20 L162,96 Q120,126 78,100 L-78,100 Q-120,126 -162,96 Z', c, 7);
  if (d.hair === 'wavy') return P('M-156,-20 C-176,-214 176,-214 156,-20 Q176,60 150,110 Q170,170 120,210 Q60,230 0,200 Q-60,230 -120,210 Q-170,170 -150,110 Q-176,60 -156,-20Z', c, 7);
  if (d.hair === 'afro') return E(0, -90, 200, 170, c, 7);
  if (d.hair === 'pony') return P('M110,-120 Q190,-110 180,10 Q178,90 140,150 Q150,70 120,-10 Z', c, 7);
  return '';
}
/** detalhes do rosto: óculos finos, rugas de idade, barba por fazer, brincos */
function faceExtras(d) {
  let g = '';
  const ey = d.anime ? 10 : -5;
  if (d.old) for (const sx of [-1, 1]) g += `<path d="M${sx * 92},${ey - 4} l${sx * 16},-8 M${sx * 92},${ey + 8} l${sx * 18},4" stroke="rgba(120,70,50,0.55)" stroke-width="4" stroke-linecap="round"/>` + `<path d="M${sx * 34},${ey + 50} q${sx * 10},14 ${sx * 4},26" stroke="rgba(120,70,50,0.35)" stroke-width="4" fill="none"/>`;
  if (d.stubble) { const r = rng(5); for (let i = 0; i < 40; i++) { const a = Math.PI * (0.15 + r() * 0.7), rr = 80 + r() * 22; g += C(Math.cos(a) * rr * 1.1, 20 + Math.sin(a) * rr * 0.75, 2.2, 'rgba(40,30,30,0.45)', 0); } }
  if (d.specs) { for (const sx of [-1, 1]) g += `<circle cx="${sx * 52}" cy="${ey + 2}" r="44" fill="rgba(255,255,255,0.08)" stroke="${d.specs}" stroke-width="6"/>`; g += Ln(-10, ey - 4, 10, ey - 4, d.specs, 6) + Ln(-96, ey - 6, -120, ey - 14, d.specs, 6) + Ln(96, ey - 6, 120, ey - 14, d.specs, 6); }
  if (d.earring) for (const sx of [-1, 1]) g += C(sx * 126, 38, 8, d.earring, 3);
  return g;
}
