let g = VOL;
g += panel(0, 640, 'escritorio', person(neoAt(29, { x: 330, y: 2000, s: 2.0, expr: 'neutral', hr: [150, -260] })), 'blur(1px) saturate(1.25)', 0);
g += panel(640, 640, 'infancia', person(neoAt(12, { x: 960, y: 1920, s: 2.2, expr: 'surprised', hl: [-110, -270], hr: [110, -270] })), 'blur(1px) saturate(1.3)', 0);
g += panel(1280, 640, 'maeSalaNoite', person(Object.assign({}, LUCIA, { x: 1600, y: 1330, s: 1.3, expr: 'sad', hl: [-90, -330], hr: [90, -330] })) + babyHeld(1600, 1330 - 0.92 * 1.3 * 330, 1.3), 'blur(1px) saturate(1.2) brightness(1.1)', 0);
g += sep(640) + sep(1280);
g += BIG(320, 190, '29 ANOS', 150) + BIG(960, 190, '12 ANOS', 150, '#FFE14D') + BIG(1600, 190, 'DIA 30', 150, '#FF4A3A');
g += G('translate(1600,1020)', `<ellipse cx="0" cy="-300" rx="0" ry="0"/>`);
return g;
