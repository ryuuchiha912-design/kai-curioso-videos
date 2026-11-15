// NEO — personagem fixo do canal de vídeos longos (versão B aprovada pelo usuário em 14/nov/2026)
const NEO = { skin: '#F7DDC9', shirt: '#F2F2F4', inner: '#1C1C22', stripe: '#1C1C22', pants: '#23232B', hair: 'neo', hairCol: '#1B1A22', anime: true, iris: '#8E949E', lid: 1, hs: 1.0, shoe: '#1A1A20', sole: '#F4F4F4' };
const neoAge = (age, o = {}) => { const A = { 30: [1.0, 0.85, 150, 70], 16: [0.92, 0.98, 110, 50], 8: [0.72, 1.2, 50, 20], 3: [0.52, 1.45, 0, 0] }[age]; return Object.assign({}, NEO, { s: A[0], hs: A[1], legX: A[2], torsoX: A[3] }, o); };
