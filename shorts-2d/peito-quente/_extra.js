function classroom() {
  let g = room('#E4E0C4', '#B9874F', 1500) + R(150, 470, 780, 400, 14, '#2F5A46', 10) + R(150, 470, 780, 400, 14, 'url(#vol)', 0) + R(140, 860, 800, 22, 6, '#B9874F', 6);
  g += T(540, 560, '2 + 2 = 4', 60, 'rgba(255,255,255,0.85)') + `<path d="M260,720 q60,-50 120,0 t120,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="6"/>` + T(760, 760, 'A B C', 50, 'rgba(255,255,255,0.7)');
  g += clockFace(980, 380, 56, -Math.PI / 2 + 0.9, -Math.PI / 2 + 3.2);
  return g;
}
function schoolDesk(x, y, s = 1) { return G(`translate(${x},${y}) scale(${s})`, R(-170, -30, 340, 36, 8, '#C98A3A', 7) + R(-170, -30, 340, 36, 8, 'url(#vol)', 0) + Ln(-140, 6, -140, 170, O, 12) + Ln(140, 6, 140, 170, O, 12)); }
function sweatLines(x, y, t) { let g = ''; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) g += Ln(x + sd * (40 + i * 6), y - 20 + i * 26, x + sd * (66 + i * 6), y - 26 + i * 26, '#FFFFFF', 7); return g; }
