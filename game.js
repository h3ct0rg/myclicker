(() => {
'use strict';

// ---------------------------------------------------------------------------
// Configuración del juego
// ---------------------------------------------------------------------------
const SAVE_KEY = 'startupclicker.v2b.save';   // v2b: estrellas por raíz cúbica (partidas anteriores no se importan)
const STAR_UNIT = 1e5;                         // $100.000 ganados en total = 1.ª estrella; n estrellas piden STAR_UNIT · n³
const MAX_DESKS = 40;          // escritorios dibujados; el resto trabaja "en remoto"
const CHARS_PER_KEY = 9;       // caracteres que aparecen en pantalla por tecla
const OFFLINE_CAP_S = 8 * 3600;
const DAY_SECONDS = 20;        // 1 día de calendario = 20 s jugando → 180 días = 1 hora
const BASE_DAYS = 180;
const SLEEP_MEAN_S = 75;       // tiempo medio hasta que un dev se atasca con un bug
const CLIENT_WAIT_S = 12;
const ORDER_TIME_S = 30;
const BOOK_BASE = 2000;        // commits para lanzar la primera v1.0
const BOOK_GROWTH = 5;         // cada startup vendida pide un producto 5 veces más grande

// Código que va apareciendo en tu monitor (se colorea por tipo de token)
const DOC_TEXT =
  'function lanzarApp(usuarios) {\n' +
  '  const api = conectar("prod");\n' +
  '  for (const u of usuarios) {\n' +
  '    if (!u.activo) continue;\n' +
  '    api.notificar(u.id, "hola");\n' +
  '  }\n' +
  '  return api.estado === 200;\n' +
  '}\n' +
  '// TODO: arreglar antes del demo\n' +
  'const precio = plan.base * 1.5;\n' +
  'export default lanzarApp;\n';

const NAMES = ['Ana', 'Luis', 'Sofía', 'Diego', 'Valentina', 'Mateo', 'Camila', 'Javier', 'Lucía', 'Tomás',
  'Martina', 'Pablo', 'Isabel', 'Andrés', 'Daniela', 'Gabriel', 'Paula', 'Nicolás', 'Elena', 'Hugo',
  'Carla', 'Bruno', 'Julia', 'Sebastián', 'Renata', 'Felipe', 'Mía', 'Joaquín', 'Clara', 'Emilio'];

const WRITERS = [
  { id: 'junior',    icon: '🧑', name: 'Practicante',            desc: 'Aprende rápido, pregunta mucho.',          baseCost: 10,     kps: 1,    shirt: '#4f8cff', hair: '#3b2a1a', skin: '#f1c27d' },
  { id: 'senior',    icon: '👩‍💻', name: 'Dev senior',             desc: 'Ya vio todos los errores posibles.',       baseCost: 100,    kps: 6,    shirt: '#2fbf71', hair: '#141414', skin: '#c68642' },
  { id: 'experto',   icon: '🧔',   name: 'Arquitecto de software', desc: 'Diseña sistemas antes del primer café.',   baseCost: 1100,   kps: 40,   shirt: '#a259ff', hair: '#7a4b2a', skin: '#e0ac69' },
  { id: 'ia',        icon: '🤖',   name: 'Agente de IA',           desc: 'Programa 24/7 y nunca se atasca.',         baseCost: 12000,  kps: 250,  shirt: '#8d99ae', robot: true },
  { id: 'editorial', icon: '🏭',   name: 'Software factory',       desc: 'Un equipo entero en un solo escritorio.',  baseCost: 140000, kps: 1600, shirt: '#e0a526', hair: '#d9d9d9', skin: '#f1c27d' },
];

const ASSIST = { id: 'asistente', icon: '🧭', name: 'Scrum master', desc: 'Recorre la oficina y desbloquea a quien se atasque con un bug. Si no hay nadie, descansa en el sillón.', baseCost: 300, growth: 2.2, max: 5 };

const UPGRADES = [
  { id: 'teclado',    icon: '⌨️', name: 'Teclado mecánico',       desc: '+1 tecla por cada clic tuyo.',                        baseCost: 5,   growth: 1.7 },
  { id: 'auto',       icon: '✨', name: 'Autocompletado con IA',  desc: 'Tu PC programa sola: +1 tecla/s.',                    baseCost: 20,  growth: 1.45 },
  { id: 'cartera',    icon: '🎧', name: 'Contrato de soporte',    desc: 'Llegan clientes con bugs en producción que pagan ×5.', baseCost: 150, growth: 1,   max: 1 },
  { id: 'clientes',   icon: '💼', name: 'Clientes enterprise',    desc: 'Todos los commits pagan ×1.5 (máximo 15 niveles).',   baseCost: 50,  growth: 3.2, max: 15 },
  { id: 'cafe',       icon: '☕', name: 'Café de especialidad',   desc: 'Los devs programan ×1.25 más rápido.',                 baseCost: 250, growth: 2.6 },
  { id: 'plantillas', icon: '📦', name: 'Frameworks y librerías', desc: 'Cada commit necesita 1 tecla menos (mínimo 4).',       baseCost: 400, growth: 4,   max: 6 },
];

const TREE_ROOT = { id: 'marca', icon: '⭐', name: 'Startup conocida', desc: 'Todos los ingresos ×1.25.', cost: 1 };
const BRANCHES = [
  { name: 'Código', nodes: [
    { id: 'dedos',  icon: '✊', name: 'Dedos de acero',     desc: 'Tus clics escriben +2 teclas.', cost: 1 },
    { id: 'racha',  icon: '🔥', name: 'Flow profundo',      desc: '"En la zona" baja más lento y llega hasta ×5.', cost: 3 },
    { id: 'suerte', icon: '👼', name: 'Imán de inversores', desc: 'Los inversionistas ángel aparecen el doble de seguido.', cost: 8 },
  ] },
  { name: 'Equipo', nodes: [
    { id: 'talento', icon: '🎓', name: 'Bootcamp propio',    desc: 'Empiezas cada startup con 3 practicantes.', cost: 2 },
    { id: 'baratos', icon: '🏷️', name: 'Reclutamiento ágil', desc: 'Contratar devs cuesta 15% menos.', cost: 4 },
    { id: 'siesta',  icon: '🧪', name: 'Tests automáticos',  desc: 'Los devs se atascan con bugs la mitad de veces.', cost: 6 },
  ] },
  { name: 'Negocio', nodes: [
    { id: 'semilla',   icon: '💰', name: 'Capital semilla', desc: 'Empiezas cada startup con $250.', cost: 1 },
    { id: 'contactos', icon: '🤝', name: 'Networking',      desc: 'Los bugs en producción llegan más seguido y pagan el doble.', cost: 4 },
    { id: 'lujo',      icon: '💎', name: 'Modelo SaaS',     desc: 'Todos los commits pagan ×2.', cost: 10 },
  ] },
  { name: 'Tiempo', nodes: [
    { id: 'agenda',   icon: '📅', name: 'Roadmap flexible', desc: 'El plazo de lanzamiento dura 1 mes más.', cost: 2 },
    { id: 'remoto',   icon: '🏠', name: 'Trabajo remoto',   desc: 'Mientras no juegas ganas el 100% (en vez del 50%).', cost: 5 },
    { id: 'prorroga', icon: '⏳', name: 'Sprint extra',     desc: 'El plazo de lanzamiento dura 2 meses más.', cost: 8 },
  ] },
  { name: 'Oficina', nodes: [
    { id: 'cafeina',   icon: '☕', name: 'Cafetera propia',   desc: 'Empiezas cada startup con el Café de especialidad nv 1.', cost: 1 },
    { id: 'asistfijo', icon: '🧭', name: 'Scrum master fijo', desc: 'Empiezas cada startup con 1 Scrum master.', cost: 3 },
    { id: 'maestras',  icon: '🧩', name: 'Código reutilizable', desc: 'Los commits necesitan 1 tecla menos (mínimo 3).', cost: 7 },
  ] },
];
const TREE = [TREE_ROOT];
for (const b of BRANCHES) b.nodes.forEach((n, i) => { n.req = i === 0 ? 'marca' : b.nodes[i - 1].id; TREE.push(n); });

const OFFICES = [
  [0, 'Cuarto en casa'], [1, 'Garaje'], [5, 'Coworking'],
  [15, 'Oficina startup'], [40, 'Campus tech'], [100, 'Unicornio 🦄'], [300, 'Big Tech'],
];

// ---------------------------------------------------------------------------
// Estado y fórmulas
// ---------------------------------------------------------------------------
const fresh = () => ({
  v: 2,
  // empresa actual (se reinicia al vender)
  money: 0, totalEarned: 0, docs: 0, progress: 0, writers: {}, upgrades: {}, hireLog: [], staff: 0, day: 0,
  // permanente
  lifetimeEarned: 0, docsAll: 0, clicks: 0, stars: 0, starsTotal: 0, starBase: 0, tree: {}, books: 0, sales: 0, ach: {},
  goldClicks: 0, ordersDone: 0, wakes: 0, bestCombo: 1, inPrestige: false,
  lastTick: Date.now(), muted: false,
});

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (!d.v) { d.lifetimeEarned = d.totalEarned || 0; d.docsAll = d.docs || 0; d.v = 2; }
      return Object.assign(fresh(), d);
    }
  } catch (e) { /* almacenamiento no disponible */ }
  return fresh();
}
function save() {
  S.lastTick = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignorar */ }
}

let S = load();

// estado de la sesión (no se guarda)
const combo = { heat: 0 };
const frenzy = { t: 0, mult: 1 };
let client = null, order = null, golds = [];
let nextGold = rand(40, 90), nextClient = rand(25, 50);
let paused = false;

function rand(a, b) { return a + Math.random() * (b - a); }

const lvl = id => S.upgrades[id] || 0;
const owned = id => S.writers[id] || 0;
const has = id => !!S.tree[id];
const totalWriters = () => WRITERS.reduce((a, w) => a + owned(w.id), 0);
const achCount = () => Object.keys(S.ach).length;
const maxTier = () => (has('racha') ? 5 : 3);
const comboMult = () => 1 + Math.min(maxTier() - 1, Math.floor(combo.heat / 8));
const clickPower = () => 1 + lvl('teclado') + (has('dedos') ? 2 : 0);
const autoKps = () => lvl('auto');
const metaMult = () => (has('marca') ? 1.25 : 1) * (1 + 0.01 * S.starsTotal) * (1 + 0.05 * S.books) * (1 + 0.01 * achCount());
const docValue = () => Math.pow(1.5, lvl('clientes')) * (has('lujo') ? 2 : 1) * metaMult() * (frenzy.t > 0 ? frenzy.mult : 1);
const docLen = () => (has('maestras') ? Math.max(3, 9 - lvl('plantillas')) : Math.max(4, 10 - lvl('plantillas')));
const writerMult = () => Math.pow(1.25, lvl('cafe'));
const writersKpsTotal = () => WRITERS.reduce((a, w) => a + owned(w.id) * w.kps, 0) * writerMult();
const sleepingKps = () => desks.reduce((a, d) => a + (d.asleep ? writerById(d.type).kps : 0), 0) * writerMult();
const writersKps = () => Math.max(0, writersKpsTotal() - sleepingKps());
const incomePerSec = () => (writersKps() + autoKps()) / docLen() * docValue();
const deadlineDays = () => BASE_DAYS + (has('agenda') ? 30 : 0) + (has('prorroga') ? 60 : 0);
const bookTarget = () => BOOK_BASE * Math.pow(BOOK_GROWTH, S.sales);
const bookDone = () => S.docs >= bookTarget();
// estrellas que te corresponden por todo lo ganado en la partida, menos las ya cobradas
const basePoints = () => Math.max(0, Math.floor(Math.cbrt(S.lifetimeEarned / STAR_UNIT)) - S.starBase);
const bookBonus = () => (bookDone() ? Math.ceil(basePoints() * 0.5) : 0);
const pointsNow = () => basePoints() + bookBonus();
// dinero total (de toda la partida) para la siguiente estrella
const nextStarAt = () => STAR_UNIT * Math.pow(S.starBase + basePoints() + 1, 3);

const writerCost = w => Math.ceil(w.baseCost * Math.pow(1.15, owned(w.id)) * (has('baratos') ? 0.85 : 1));
const assistCost = () => Math.ceil(ASSIST.baseCost * Math.pow(ASSIST.growth, S.staff));
const upgradeCost = u => Math.ceil(u.baseCost * Math.pow(u.growth, lvl(u.id)));
const upgradeMaxed = u => u.max != null && lvl(u.id) >= u.max;
const writerById = id => WRITERS.find(w => w.id === id);
const tierOf = id => WRITERS.findIndex(w => w.id === id);

function earn(amount) { S.money += amount; S.totalEarned += amount; S.lifetimeEarned += amount; }
function addDocs(n) { S.docs += n; S.docsAll += n; }

const UNITS = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n.toFixed(2);
  let i = -1;
  while (n >= 1000 && i < UNITS.length - 1) { n /= 1000; i++; }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + UNITS[i];
}
function fmtInt(n) { return n < 1000 ? String(Math.floor(n)) : fmt(n); }
function fmtRate(n) { return n < 10 ? n.toFixed(n < 1 ? 2 : 1) : fmtInt(n); }

// ---------------------------------------------------------------------------
// Logros (cada uno da +1% de ingresos para siempre)
// ---------------------------------------------------------------------------
const ACH = [
  { id: 'doc1',    icon: '👋', name: 'Hola mundo',         desc: 'Haz tu primer commit.',               ok: () => S.docsAll >= 1 },
  { id: 'doc100',  icon: '📂', name: 'Repositorio vivo',   desc: 'Haz 100 commits.',                    ok: () => S.docsAll >= 100 },
  { id: 'doc10k',  icon: '🗄️', name: 'Monorepo',           desc: 'Haz 10.000 commits.',                 ok: () => S.docsAll >= 1e4 },
  { id: 'clic1k',  icon: '🖱️', name: '10x developer',      desc: 'Haz 1.000 clics.',                            ok: () => S.clicks >= 1000 },
  { id: 'hire1',   icon: '🤝', name: 'Primer pull request', desc: 'Contrata a tu primer dev.',              ok: () => totalWriters() >= 1 },
  { id: 'hire10',  icon: '👥', name: 'Equipo ágil',        desc: 'Ten 10 devs a la vez.',                 ok: () => totalWriters() >= 10 },
  { id: 'hire50',  icon: '🏢', name: 'Scale-up',           desc: 'Ten 50 devs a la vez.',                 ok: () => totalWriters() >= 50 },
  { id: 'robot',   icon: '🤖', name: 'El futuro llegó',    desc: 'Contrata un Agente de IA.',                   ok: () => owned('ia') >= 1 },
  { id: 'usd1k',   icon: '💵', name: 'Primeros clientes',  desc: 'Gana $1.000 en total.',                       ok: () => S.lifetimeEarned >= 1e3 },
  { id: 'usd1m',   icon: '💰', name: 'Ronda serie A',      desc: 'Gana $1 millón en total.',                    ok: () => S.lifetimeEarned >= 1e6 },
  { id: 'usd1b',   icon: '🦄', name: 'Unicornio',          desc: 'Gana $1.000 millones en total.',              ok: () => S.lifetimeEarned >= 1e9 },
  { id: 'combo3',  icon: '🔥', name: 'En la zona',         desc: 'Llega a "En la zona" ×3.',                       ok: () => S.bestCombo >= 3 },
  { id: 'combo5',  icon: '☄️', name: 'Flow total',         desc: 'Llega a "En la zona" ×5.',                       ok: () => S.bestCombo >= 5 },
  { id: 'gold1',   icon: '👼', name: 'Primer ángel',       desc: 'Atrapa a un inversionista ángel.',                     ok: () => S.goldClicks >= 1 },
  { id: 'gold25',  icon: '💸', name: 'Lluvia de capital',  desc: 'Atrapa a 25 inversionistas ángel.',                   ok: () => S.goldClicks >= 25 },
  { id: 'order1',  icon: '🩹', name: 'Hotfix',             desc: 'Arregla un bug en producción.',                ok: () => S.ordersDone >= 1 },
  { id: 'order10', icon: '🛡️', name: 'Cero caídas',        desc: 'Arregla 10 bugs en producción.',              ok: () => S.ordersDone >= 10 },
  { id: 'wake25',  icon: '🐞', name: 'Debugger humano',    desc: 'Desbloquea a 25 devs con tus propias manos.', ok: () => S.wakes >= 25 },
  { id: 'staff1',  icon: '🧭', name: 'Ceremonias ágiles',  desc: 'Contrata un Scrum master.',              ok: () => S.staff >= 1 },
  { id: 'sell1',   icon: '🤑', name: 'Exit',               desc: 'Vende tu startup por primera vez.',           ok: () => S.sales >= 1 },
  { id: 'book1',   icon: '🚀', name: 'Lanzamiento a tiempo', desc: 'Lanza la v1.0 antes del plazo.',           ok: () => S.books >= 1 },
];

function checkAchievements() {
  for (const a of ACH) {
    if (!S.ach[a.id] && a.ok()) {
      S.ach[a.id] = Date.now();
      showToast(`🏆 Logro: ${a.name} (+1% ingresos)`);
      sfxBuy();
    }
  }
}

// ---------------------------------------------------------------------------
// Audio (WebAudio, sin archivos)
// ---------------------------------------------------------------------------
let actx = null, noiseBuf = null;
function audio() {
  if (!actx) {
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const len = Math.floor(actx.sampleRate * 0.035);
    noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function sfxKey() {
  if (S.muted) return;
  const a = audio(); if (!a) return;
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  src.playbackRate.value = 0.75 + Math.random() * 0.5;
  const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1400;
  const g = a.createGain(); g.gain.value = 0.35;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}
function tone(freq, start, dur, vol, type) {
  const a = actx;
  const o = a.createOscillator(); o.type = type || 'triangle'; o.frequency.value = freq;
  const g = a.createGain();
  const t0 = a.currentTime + start;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function sfxCoin() {
  if (S.muted || !audio()) return;
  tone(988, 0, 0.09, 0.12, 'square');
  tone(1319, 0.07, 0.25, 0.10, 'square');
}
function sfxBuy() {
  if (S.muted || !audio()) return;
  tone(523, 0, 0.12, 0.12); tone(659, 0.06, 0.12, 0.12); tone(784, 0.12, 0.25, 0.12);
}
function sfxWake() {
  if (S.muted || !audio()) return;
  tone(880, 0, 0.06, 0.08, 'square'); tone(660, 0.07, 0.08, 0.08, 'square');
}
function sfxGold() {
  if (S.muted || !audio()) return;
  [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.3, 0.1));
}
function sfxBad() {
  if (S.muted || !audio()) return;
  tone(330, 0, 0.2, 0.1, 'sawtooth'); tone(247, 0.15, 0.35, 0.1, 'sawtooth');
}

// ---------------------------------------------------------------------------
// Fondo WebGL: cielo nocturno con luces de ciudad desenfocadas
// ---------------------------------------------------------------------------
function createBackground(canvas) {
  const none = { resize() {}, draw() {} };
  const gl = canvas.getContext('webgl', { antialias: false });
  if (!gl) { canvas.classList.add('fallback'); return none; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `
    precision mediump float;
    uniform vec2 r; uniform float t;
    float h(float n){return fract(sin(n)*43758.5453);}
    void main(){
      vec2 uv = gl_FragCoord.xy / r;
      vec3 col = mix(vec3(0.17, 0.10, 0.21), vec3(0.06, 0.05, 0.13), uv.y);
      for (int k = 0; k < 18; k++) {
        float fk = float(k);
        vec2 c = vec2(fract(h(fk * 3.1) + t * 0.003 * (0.5 + h(fk))), 0.1 + 0.8 * h(fk * 7.7));
        vec2 d = (uv - c) * vec2(r.x / r.y, 1.0);
        float rad = 0.02 + 0.05 * h(fk * 1.3);
        vec3 tint = mix(vec3(1.0, 0.65, 0.35), vec3(0.45, 0.6, 1.0), h(fk * 5.3));
        col += tint * 0.07 * smoothstep(rad, rad * 0.5, length(d)) * (0.7 + 0.3 * sin(t * 0.6 + fk));
      }
      gl_FragColor = vec4(col, 1.0);
    }`;
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.classList.add('fallback'); return none; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't');
  return {
    resize(w, h, dpr) {
      const px = Math.min(dpr, 1);
      canvas.width = Math.round(w * px); canvas.height = Math.round(h * px);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(time) {
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

// ---------------------------------------------------------------------------
// Escena isométrica 2.5D con sprites de PixelLab
// ---------------------------------------------------------------------------
const $ = id => document.getElementById(id);
const stage = $('stage');
const cv = $('game');
const ctx = cv.getContext('2d');
const bg = createBackground($('bg'));
let W = 0, H = 0, DPR = 1;

const TW = 64, TH = 32;        // baldosa isométrica 2:1 en píxeles del mundo
const WALL_H = 110;
const iso = (i, j) => [(i - j) * TW / 2, (i + j) * TH / 2];

const IMG = {};
let ready = false;
const SM_DIRS = ['south-east', 'south-west', 'north-east', 'north-west'];
const IMG_NAMES = ['floor', 'desk_clean', 'monitor_fix', 'skyline', 'desk_empty', 'couch', 'whiteboard', 'plant', 'coffee', 'server', 'arcade',
  'cooler', 'bookshelf', 'beanbag', 'pingpong', 'angel', 'client_east',
  ...WRITERS.map(w => 'dev_' + w.id), 'stuck_junior', 'stuck_senior', 'stuck_experto', 'stuck_editorial'];

function loadImages() {
  const list = IMG_NAMES.map(n => [n, `assets/${n}.png`]);
  for (const d of ['south', ...SM_DIRS]) list.push([`sm_idle_${d}`, `assets/sm/idle_${d}.png`]);
  for (const d of SM_DIRS) for (let k = 0; k < 4; k++) list.push([`sm_walk_${d}_${k}`, `assets/sm/walk_${d}_${k}.png`]);
  return Promise.all(list.map(([k, src]) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { IMG[k] = im; res(); };
    im.onerror = () => rej(new Error('No se pudo cargar ' + src));
    im.src = src;
  })));
}

// Huella en baldosas de cada objeto. (ax, ay) = píxel de la imagen que cae en el centro de la huella
// (medido desde la base de cada silueta; fijo para que funcione también abriendo el archivo directo).
const SPEC = {
  couch:      { w: 2, h: 1, ax: 64, ay: 58 },
  whiteboard: { w: 1, h: 1, ax: 48, ay: 70 },
  plant:      { w: 1, h: 1, ax: 32, ay: 68 },
  coffee:     { w: 1, h: 1, ax: 47, ay: 72 },
  server:     { w: 1, h: 1, ax: 32, ay: 73 },
  arcade:     { w: 1, h: 1, ax: 31, ay: 67 },
  cooler:     { w: 1, h: 1, ax: 31, ay: 70 },
  bookshelf:  { w: 1, h: 1, ax: 47, ay: 74 },
  beanbag:    { w: 2, h: 1, ax: 48, ay: 22 },
  pingpong:   { w: 2, h: 2, ax: 66, ay: 45 },
};

function resize() {
  const r = stage.getBoundingClientRect();
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  bg.resize(W, H, DPR);
  layout(true);
}

const room = { ni: 11, nj: 8 };
const player = { i: 4, j: 3, w: 2, h: 2, x: 0, y: 0, press: 0, flash: 0, flashText: '', hover: false };
const couch = { kind: 'couch', i: 1, j: 6, w: 2, h: 1, x: 0, y: 0 };
const door = { i: 0, j: 4, x: 0, y: 0 };
let decor = [];
let blocked = [];
let screenBuf = '', textPos = 0, charAcc = 0;
let desks = [], assistants = [];
let hoverDesk = null, hoverClient = false;
let floats = [], particles = [];
const world = { minX: -200, maxX: 200, minY: 0, maxY: 300 };
const cam = { s: 1, x: 0, y: 0, ts: 1, tx: 0, ty: 0 };
let time = 0;
let floorCache = null;
const FC = { ox: 0, oy: 0 };

const centerOf = o => iso(o.i + o.w / 2, o.j + o.h / 2);

function newDesk(id, born) {
  const w = writerById(id);
  const name = w.robot ? 'Agente-' + Math.floor(rand(100, 999)) : NAMES[Math.floor(Math.random() * NAMES.length)];
  return { type: id, prog: Math.random(), born: born == null ? -10 : born, asleep: false, awakeSince: time, name, w: 2, h: 2, nextChar: Math.random() };
}

function rebuildDesks() {
  if (!Array.isArray(S.hireLog) || (S.hireLog.length === 0 && totalWriters() > 0)) {
    S.hireLog = [];
    for (const w of WRITERS) for (let i = 0; i < owned(w.id); i++) logHire(w.id);
  }
  desks = S.hireLog.map(id => newDesk(id));
  assistants = [];
  layout(true);
  syncAssistants(true);
}

// Registra un escritorio visible. Si ya no caben, el nuevo reemplaza al de menor rango.
function logHire(id) {
  if (S.hireLog.length < MAX_DESKS) { S.hireLog.push(id); return S.hireLog.length - 1; }
  const t = tierOf(id);
  let best = -1, bestTier = t;
  S.hireLog.forEach((d, i) => { const dt = tierOf(d); if (dt < bestTier) { bestTier = dt; best = i; } });
  if (best >= 0) S.hireLog[best] = id;
  return best;
}

// --------------------------- distribución de la oficina ---------------------
function layout(snap) {
  const n = desks.length;
  const cols = n === 0 ? 1 : Math.min(7, Math.max(3, Math.ceil(Math.sqrt(n * 1.4))));
  const rows = Math.ceil(n / cols);
  desks.forEach((d, k) => {
    const r = Math.floor(k / cols), c = k % cols;
    d.i = 2 + c * 4; d.j = 2 + r * 3;      // pasillo de 2 baldosas entre columnas
    [d.x, d.y] = centerOf(d);
  });
  const j0 = n ? 2 + rows * 3 : 2;            // primera fila libre delante de los escritorios
  room.ni = Math.max(11, 2 + cols * 4 + 1);
  room.nj = j0 + 6;
  player.i = Math.floor(room.ni / 2) - 1; player.j = j0 + 1;
  [player.x, player.y] = centerOf(player);
  couch.i = 1; couch.j = j0 + 3;
  [couch.x, couch.y] = centerOf(couch);
  door.i = 0; door.j = j0 + 1;
  [door.x, door.y] = iso(0.5, door.j + 0.5);
  buildDecor(j0);
  buildBlocked();

  world.minX = iso(0, room.nj)[0] - 20; world.maxX = iso(room.ni, 0)[0] + 20;
  world.minY = -WALL_H - (totalWriters() > n ? 40 : 10); world.maxY = iso(room.ni, room.nj)[1] + 24;
  fitCamera(snap);

  for (const a of assistants) {
    const ti = Math.round(a.fi), tj = Math.round(a.fj);
    if (ti < 0 || tj < 0 || ti >= room.ni || tj >= room.nj || isBlocked(ti, tj)) { [a.fi, a.fj] = homeTile(a.seat); a.seated = a.seat < 3; }
    a.path = []; a.target = null;
  }
  if (ready) buildFloorCache();
}

// cámara: encuadra toda la oficina; el jugador puede acercar (rueda / botones) y arrastrar
const view = { zoom: 1, px: 0, py: 0 };
function fitCamera(snap) {
  const top = 96, pad = 16;
  const ww = world.maxX - world.minX, wh = world.maxY - world.minY;
  const fit = Math.max(0.2, Math.min((W - pad * 2) / ww, (H - top - pad) / wh, 2));
  cam.ts = fit * view.zoom;
  const lim = (v, m) => Math.max(-m, Math.min(m, v));
  view.px = lim(view.px, ww * cam.ts / 2); view.py = lim(view.py, wh * cam.ts / 2);
  cam.tx = W / 2 - ((world.minX + world.maxX) / 2) * cam.ts + view.px;
  cam.ty = top + (H - top - pad) / 2 - ((world.minY + world.maxY) / 2) * cam.ts + view.py;
  if (snap) { cam.s = cam.ts; cam.x = cam.tx; cam.y = cam.ty; }
}
function zoomAt(sx, sy, factor) {
  const wx = (sx - cam.tx) / cam.ts, wy = (sy - cam.ty) / cam.ts;
  view.zoom = Math.max(1, Math.min(4, view.zoom * factor));
  if (view.zoom === 1) { view.px = 0; view.py = 0; fitCamera(false); return; }
  fitCamera(false);
  view.px += sx - (wx * cam.ts + cam.tx); view.py += sy - (wy * cam.ts + cam.ty);
  fitCamera(false);
}

// la decoración aparece a medida que crece la startup
function buildDecor(j0) {
  const tw = totalWriters();
  const add = (kind, i, j) => { const s = SPEC[kind]; const o = { kind, i, j, w: s.w, h: s.h }; [o.x, o.y] = centerOf(o); decor.push(o); };
  decor = [];
  add('plant', 0, 0);
  add('plant', room.ni - 1, room.nj - 1);
  if (tw >= 3) add('plant', room.ni - 1, 0);
  const back = [];
  if (lvl('cafe') > 0) back.push('coffee');
  if (tw >= 5) back.push('whiteboard');
  if (owned('ia') > 0) back.push('server');
  if (tw >= 10) back.push('cooler');
  if (tw >= 15) back.push('bookshelf');
  if (tw >= 25) back.push('arcade');
  back.forEach((k, idx) => { const i = 2 + idx * 2; if (i < room.ni - 2) add(k, i, 0); });
  if (tw >= 20) add('beanbag', room.ni - 3, j0 + 1);
  if (tw >= 40) add('pingpong', room.ni - 4, j0 + 3);
}

function isBlocked(i, j) { return blocked[i] && blocked[i][j]; }
function buildBlocked() {
  blocked = Array.from({ length: room.ni }, () => new Array(room.nj).fill(false));
  const mark = o => { for (let a = 0; a < o.w; a++) for (let b = 0; b < o.h; b++) { const x = o.i + a, y = o.j + b; if (x < room.ni && y < room.nj) blocked[x][y] = true; } };
  desks.forEach(mark); decor.forEach(mark); mark(player); mark(couch);
}

// --------------------------- piso y paredes (en caché) ----------------------
function buildFloorCache() {
  const ni = room.ni, nj = room.nj;
  FC.ox = nj * TW / 2 + 40; FC.oy = WALL_H + 30;
  const c = floorCache || document.createElement('canvas');
  c.width = (ni + nj) * TW / 2 + 80; c.height = (ni + nj) * TH / 2 + WALL_H + 90;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height);
  g.save(); g.translate(FC.ox, FC.oy);
  drawWalls(g);
  for (let s = 0; s <= ni + nj - 2; s++) for (let i = 0; i < ni; i++) {
    const j = s - i;
    if (j < 0 || j >= nj) continue;
    const [x, y] = iso(i, j);
    g.drawImage(IMG.floor, x - 32, y - 22);
  }
  // alfombra bajo tu escritorio
  quad(g, [iso(player.i - 0.5, player.j - 0.5), iso(player.i + 2.5, player.j - 0.5), iso(player.i + 2.5, player.j + 2.5), iso(player.i - 0.5, player.j + 2.5)], 'rgba(109,36,51,.85)', '#d9a441');
  // alfombra de soporte frente a la puerta
  if (lvl('cartera') > 0) quad(g, [iso(0.05, door.j + 0.1), iso(0.95, door.j + 0.1), iso(0.95, door.j + 0.9), iso(0.05, door.j + 0.9)], '#3d4a3a', 'rgba(255,255,255,.25)');
  g.restore();
  floorCache = c;
}

function quad(g, pts, fill, stroke) {
  g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = fill; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); }
}

function drawWalls(g) {
  const ni = room.ni, nj = room.nj;
  const up = ([x, y], hgt) => [x, y - hgt];
  const A = iso(0, 0), L = iso(0, nj), R = iso(ni, 0);
  quad(g, [A, L, up(L, WALL_H), up(A, WALL_H)], '#cdb898');           // pared izquierda (i = 0)
  quad(g, [A, R, up(R, WALL_H), up(A, WALL_H)], '#e2d0b0');           // pared derecha (j = 0)
  quad(g, [A, L, up(L, 7), up(A, 7)], '#8a6a4a');                     // zócalos
  quad(g, [A, R, up(R, 7), up(A, 7)], '#8a6a4a');
  quad(g, [up(L, WALL_H), up(A, WALL_H), up(A, WALL_H + 6), up(L, WALL_H + 6)], '#b39e7d');
  quad(g, [up(A, WALL_H), up(R, WALL_H), up(R, WALL_H + 6), up(A, WALL_H + 6)], '#c9b694');
  // ventanas en la pared derecha
  for (let k = 1.5; k + 2.5 < ni - 0.5; k += 4.5) {
    const p0 = iso(k, 0), p1 = iso(k + 2.5, 0);
    quad(g, [up(p0, 20), up(p1, 20), up(p1, 88), up(p0, 88)], '#6b5440');
    g.save();
    g.beginPath(); [up(p0, 24), up(p1, 24), up(p1, 84), up(p0, 84)].forEach(([x, y], n) => (n ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    g.translate(p0[0], p0[1] - 84); g.transform(1, 0.5, 0, 1, 0, 0);   // plano de la pared derecha
    const gr = g.createLinearGradient(0, 0, 0, 60);
    gr.addColorStop(0, '#141a3d'); gr.addColorStop(0.6, '#3a2f63'); gr.addColorStop(1, '#6b3f66');
    g.fillStyle = gr; g.fillRect(0, 0, 80, 60);
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (let n = 0; n < 7; n++) g.fillRect((n * 23 + k * 31) % 78, (n * 13 + k * 7) % 22, 1, 1);
    const SK = [79, 14, 105, 69], sc = 0.95, off = -((k * 37) % 34);   // recorte de la ciudad y desplazamiento por ventana
    g.drawImage(IMG.skyline, SK[0], SK[1], SK[2], SK[3], off, 60 - SK[3] * sc + 6, SK[2] * sc, SK[3] * sc);
    g.drawImage(IMG.skyline, SK[0], SK[1], SK[2], SK[3], off + SK[2] * sc - 6, 60 - SK[3] * sc + 14, SK[2] * sc, SK[3] * sc);
    g.restore();
    const mid = iso(k + 1.25, 0);
    g.strokeStyle = '#6b5440'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(mid[0], mid[1] - 24); g.lineTo(mid[0], mid[1] - 84); g.stroke();
  }
  // puerta en la pared izquierda
  const d0 = iso(0, door.j + 0.12), d1 = iso(0, door.j + 0.88);
  quad(g, [d0, d1, up(d1, 74), up(d0, 74)], '#5b3d26');
  quad(g, [iso(0, door.j + 0.2), iso(0, door.j + 0.8), up(iso(0, door.j + 0.8), 68), up(iso(0, door.j + 0.2), 68)], '#8a5a36');
  const kn = iso(0, door.j + 0.72); g.fillStyle = '#ffd166'; g.fillRect(kn[0] - 1, kn[1] - 36, 3, 3);
  if (lvl('cartera') > 0) wallText(g, 'left', door.j + 0.5, 86, 'SOPORTE', '#4fd1a5', 8);
  // cuadro con el logo
  {
    const c = Math.min(2.4, door.j - 1.3);           // centrado en la pared, sin pisar la puerta
    const a = iso(0, c - 1), b = iso(0, c + 1);
    quad(g, [up(a, 34), up(b, 34), up(b, 84), up(a, 84)], '#2b2f3a');
    wallText(g, 'left', c, 66, '</>', '#4fd1a5', 13);
    wallText(g, 'left', c, 50, 'STARTUP', '#e8ebf2', 7);
  }
}

// texto pegado a una pared (con la inclinación de su plano)
function wallText(g, side, t, height, text, color, size) {
  const [x, y] = side === 'left' ? iso(0, t) : iso(t, 0);
  g.save();
  g.translate(x, y - height);
  g.transform(1, side === 'left' ? -0.5 : 0.5, 0, 1, 0, 0);
  g.fillStyle = color; g.font = `bold ${size}px ui-monospace, Consolas, monospace`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 0, 0);
  g.restore();
}

// --------------------------- Scrum masters ----------------------------------
function homeTile(k) { return k < 3 ? [couch.i + k, couch.j + 1] : [couch.i + k, couch.j]; }
function seatPos(k) { return iso(couch.i + 0.45 + k * 0.55, couch.j + 0.55); }

function syncAssistants(snap) {
  while (assistants.length < S.staff) {
    const k = assistants.length;
    const [hi, hj] = homeTile(k);
    assistants.push({ seat: k, fi: snap ? hi : door.i, fj: snap ? hj : door.j, path: [], target: null, waking: 0, walking: false, dir: 'south-east', seated: snap && k < 3 });
  }
  assistants.length = S.staff;
}

function bfs(from, to) {
  const ni = room.ni, nj = room.nj, key = (x, y) => x * nj + y;
  const prev = new Map([[key(...from), -1]]);
  const q = [from];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h];
    if (x === to[0] && y === to[1]) {
      const path = [];
      for (let k = key(x, y); k !== -1; k = prev.get(k)) path.unshift([Math.floor(k / nj), k % nj]);
      return path.slice(1);
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= ni || ny >= nj || isBlocked(nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      q.push([nx, ny]);
    }
  }
  return null;
}

// la silla queda del lado +i del escritorio: ahí se para quien viene a ayudar
const standTile = d => [d.i + 2, d.j + 1];

// --------------------------- dibujo -----------------------------------------
function ellipse(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fillRR(x, y, w, h, r, c) { ctx.fillStyle = c; rr(x, y, w, h, r); ctx.fill(); }

const toScreen = (x, y) => [x * cam.s + cam.x, y * cam.s + cam.y];
const toWorld = (sx, sy) => [(sx - cam.x) / cam.s, (sy - cam.y) / cam.s];

function drawDecor(o) {
  const s = SPEC[o.kind];
  ctx.drawImage(IMG[o.kind], Math.round(o.x - s.ax), Math.round(o.y - s.ay));
}

function drawBug(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.3) * 0.25);
  ctx.strokeStyle = '#1b1e25'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const k of [-4, 0, 4]) {
    const w = Math.sin(t + k) * 1.5;
    ctx.moveTo(-5, k); ctx.lineTo(-10, k + w); ctx.moveTo(5, k); ctx.lineTo(10, k - w);
  }
  ctx.moveTo(-2, -8); ctx.lineTo(-5, -13); ctx.moveTo(2, -8); ctx.lineTo(5, -13);
  ctx.stroke();
  ellipse(0, 1, 6, 8, '#e5484d');
  ctx.fillStyle = '#1b1e25'; ctx.fillRect(-0.6, -6, 1.2, 14);
  ellipse(-2.5, 0, 1.4, 1.4, '#1b1e25'); ellipse(2.5, 4, 1.4, 1.4, '#1b1e25');
  ellipse(0, -8, 3.5, 3, '#1b1e25');
  ctx.restore();
}

function drawDesk(d, k) {
  const age = time - d.born;
  const pop = age < 0.5 ? easeOutBack(Math.max(0, age) / 0.5) : 1;
  ctx.save();
  if (pop !== 1) { ctx.translate(d.x, d.y); ctx.scale(pop, pop); ctx.translate(-d.x, -d.y); }
  const x0 = Math.round(d.x - 64), y0 = Math.round(d.y - 88);
  if (d.asleep && hoverDesk === d) { ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 14; }
  ctx.drawImage(IMG.desk_clean, x0, y0);
  ctx.shadowBlur = 0;
  const layer = (d.asleep && IMG['stuck_' + d.type]) || IMG['dev_' + d.type];
  ctx.drawImage(layer, x0, y0);
  ctx.drawImage(IMG.monitor_fix, x0, y0);
  if (d.asleep) {
    // pantalla de error, en el plano inclinado del monitor
    ctx.save(); ctx.translate(x0 + 30, y0 + 31); ctx.transform(1, -0.57, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(200,30,45,.85)'; ctx.fillRect(0, 0, 35, 27);
    ctx.fillStyle = '#ffd6d6'; ctx.font = 'bold 7px ui-monospace, Consolas, monospace'; ctx.textBaseline = 'top';
    ctx.fillText('ERROR', 4, 4);
    ctx.fillStyle = 'rgba(255,214,214,.6)';
    for (let r = 0; r < 3; r++) ctx.fillRect(4, 14 + r * 4, [26, 18, 22][r], 1.5);
    ctx.restore();
  }
  if (d.asleep) drawBug(d.x + 30, d.y - 86 + Math.sin(time * 5 + k) * 2, time * 10 + k);
  ctx.restore();
}

function drawPlayerDesk() {
  const s = 1 - 0.03 * player.press;
  ctx.save();
  ctx.translate(player.x, player.y); ctx.scale(s, s); ctx.translate(-player.x, -player.y);
  const x0 = Math.round(player.x - 64), y0 = Math.round(player.y - 88);
  if (player.hover) { ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 14; }
  ctx.drawImage(IMG.desk_empty, x0, y0);
  ctx.shadowBlur = 0;
  // tu monitor muestra el código que vas escribiendo
  ctx.save();
  ctx.translate(x0 + 35, y0 + 30); ctx.transform(1, -0.5, 0, 1, 0, 0);
  ctx.beginPath(); ctx.rect(0, 0, 36, 25); ctx.clip();
  ctx.fillStyle = '#141926'; ctx.fillRect(0, 0, 36, 25);
  drawPlayerCode();
  ctx.restore();
  ctx.restore();
}

// colorea una línea de código: palabras clave, textos, comentarios y números
const KW = /^(function|const|let|for|of|if|continue|return|export|default)$/;
function drawCodeLine(line, x, y) {
  const re = /(\/\/.*$)|("[^"]*"?)|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    const t = m[0];
    ctx.fillStyle = m[1] ? '#697098' : m[2] ? '#c3e88d' : m[3] ? '#f78c6c'
      : m[4] ? (KW.test(t) ? '#c792ea' : (line[re.lastIndex] === '(' ? '#82aaff' : '#d6deeb')) : '#89ddff';
    if (!m[5]) ctx.fillText(t, x, y);
    x += ctx.measureText(t).width;
  }
}

function drawPlayerCode() {
  const perLine = 17, maxLines = 7;
  const lines = [];
  for (const raw of screenBuf.split('\n')) {
    if (raw.length === 0) { lines.push(''); continue; }
    for (let i = 0; i < raw.length; i += perLine) lines.push(raw.slice(i, i + perLine));
  }
  const shown = lines.slice(-maxLines);
  ctx.font = '3.4px ui-monospace, Consolas, monospace';
  ctx.textBaseline = 'top';
  shown.forEach((l, i) => drawCodeLine(l, 1.5, 1.5 + i * 3.4));
  if (Math.sin(time * 8) > 0) {
    const last = shown[shown.length - 1] || '';
    ctx.fillStyle = '#fff';
    ctx.fillRect(1.5 + ctx.measureText(last).width, 1.5 + Math.max(0, shown.length - 1) * 3.4, 0.8, 3.2);
  }
  if (player.flash > 0) {
    ctx.globalAlpha = Math.min(1, player.flash * 2);
    ctx.fillStyle = '#1f9d6f'; ctx.fillRect(0, 0, 36, 25);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = 'bold 4.5px system-ui, sans-serif'; ctx.fillText('✓ COMMIT', 18, 5);
    ctx.font = 'bold 6px system-ui, sans-serif'; ctx.fillText(player.flashText, 18, 12);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
  ctx.textBaseline = 'alphabetic';
}

function drawAssistant(a) {
  if (a.seated) {
    const [sx, sy] = seatPos(a.seat);
    ctx.drawImage(IMG.sm_idle_south, 0, 0, 68, 40, Math.round(sx - 34), Math.round(sy - 50), 68, 40);
    const k = (time * 0.6 + a.seat * 0.3) % 1;
    ctx.globalAlpha = Math.sin(k * Math.PI);
    ctx.fillStyle = '#cfe8ff'; ctx.font = 'bold 9px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('z', sx + 10 + k * 8, sy - 48 - k * 14);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
    return;
  }
  const [x, y] = iso(a.fi + 0.5, a.fj + 0.5);
  const im = a.walking ? IMG[`sm_walk_${a.dir}_${Math.floor(time * 8 + a.seat) % 4}`] : IMG[`sm_idle_${a.dir}`];
  ellipse(x, y, 12, 5, 'rgba(0,0,0,.25)');
  ctx.drawImage(im, Math.round(x - 34), Math.round(y - 52));
  if (a.waking > 0) {
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', x, y - 58 + Math.sin(time * 20) * 2);
    ctx.textAlign = 'left';
  }
}

function drawClient() {
  const bob = client ? Math.abs(Math.sin(time * 4)) * 3 : 0;
  ellipse(door.x, door.y, 12, 5, 'rgba(0,0,0,.25)');
  ctx.drawImage(IMG.client_east, Math.round(door.x - 34), Math.round(door.y - 52 - bob));
}

function drawGold(g) {
  const [sx, sy] = toScreen(g.x, g.y);
  const fade = Math.min(1, g.age * 2, g.life);
  const pulse = 1 + Math.sin(time * 8) * 0.08;
  const size = Math.max(48, 64 * cam.s);
  ctx.save(); ctx.translate(sx, sy + Math.sin(time * 3 + g.seed) * 4); ctx.scale(pulse, pulse);
  ctx.globalAlpha = fade;
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, size * 0.7);
  glow.addColorStop(0, 'rgba(255,220,100,.6)'); glow.addColorStop(1, 'rgba(255,220,100,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(IMG.angel, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!ready) return;
  ctx.setTransform(DPR * cam.s, 0, 0, DPR * cam.s, DPR * cam.x, DPR * cam.y);
  ctx.imageSmoothingEnabled = cam.s * DPR < 1.5;
  ctx.drawImage(floorCache, -FC.ox, -FC.oy);

  // todo lo que tiene volumen se ordena por profundidad (lo del fondo primero)
  const items = [];
  for (const o of decor) items.push([o.i + o.w / 2 + o.j + o.h / 2, () => drawDecor(o)]);
  items.push([couch.i + 1 + couch.j + 0.5, () => drawDecor(couch)]);
  desks.forEach((d, k) => items.push([d.i + d.j + 2, () => drawDesk(d, k)]));
  items.push([player.i + player.j + 2, drawPlayerDesk]);
  for (const a of assistants) items.push([a.seated ? couch.i + couch.j + 1.6 : a.fi + a.fj + 1.5, () => drawAssistant(a)]);
  if (client || order) items.push([door.i + door.j + 1.2, drawClient]);
  items.sort((p, q) => p[0] - q[0]).forEach(it => it[1]());

  // código flotando sobre los monitores (en el mundo)
  ctx.textAlign = 'center';
  ctx.font = 'bold 8px ui-monospace, Consolas, monospace';
  for (const p of particles) {
    if (!p.code) continue;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.c; ctx.fillText(p.code, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  // ------- overlay en espacio de pantalla -------
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const [lx, ly] = toScreen(player.x, player.y + 44);
  ctx.font = '600 12px system-ui, sans-serif';
  fillRR(lx - 18, ly - 10, 36, 20, 10, 'rgba(0,0,0,.55)');
  ctx.fillStyle = '#ffd166'; ctx.fillText('TÚ', lx, ly);

  if (S.clicks < 3) {
    const [ax, ay] = toScreen(player.x - 10, player.y - 100);
    const b = Math.sin(time * 5) * 6;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.moveTo(ax, ay + b); ctx.lineTo(ax - 10, ay - 14 + b); ctx.lineTo(ax + 10, ay - 14 + b); ctx.fill();
  }

  // "En la zona"
  const cm = comboMult();
  if (combo.heat > 0.5) {
    const [cx, cy] = toScreen(player.x + 72, player.y - 70);
    const tierProg = cm >= maxTier() ? 1 : (combo.heat % 8) / 8;
    ctx.save(); ctx.translate(cx, cy);
    const pulse = cm > 1 ? 1 + Math.sin(time * 14) * 0.05 : 1;
    ctx.scale(pulse, pulse);
    ctx.font = '800 11px system-ui, sans-serif'; ctx.fillStyle = '#ffd9a8';
    ctx.fillText('EN LA ZONA', 0, -16);
    ctx.font = `900 ${cm > 1 ? 26 : 20}px system-ui, sans-serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText('×' + cm, 0, 4);
    ctx.fillStyle = cm >= 4 ? '#ff4d4d' : cm >= 2 ? '#ff9f43' : '#ffd166'; ctx.fillText('×' + cm, 0, 4);
    fillRR(-22, 20, 44, 5, 3, 'rgba(0,0,0,.5)');
    fillRR(-22, 20, 44 * tierProg, 5, 3, '#ff9f43');
    ctx.restore();
  }

  // cliente con bug en producción
  if (client || order) {
    const [bx, by] = toScreen(door.x, door.y - 62);
    const txt = client ? '🔥 ¡Bug en producción!' : `Hotfix ${order.got}/${order.need} commits · ${Math.ceil(order.t)}s`;
    ctx.font = '700 12px system-ui, sans-serif';
    const tw = ctx.measureText(txt).width + 18;
    const bob = client ? Math.sin(time * 5) * 3 : 0;
    fillRR(bx - tw / 2, by - 14 + bob, tw, 24, 8, client ? '#ffd166' : '#4f8cff');
    ctx.fillStyle = client ? '#1b1e25' : '#fff'; ctx.fillText(txt, bx, by - 2 + bob);
    if (client) fillRR(bx - tw / 2, by + 13 + bob, tw * (client.t / CLIENT_WAIT_S), 3, 2, '#ffd166');
  }

  // nombre al pasar el mouse
  if (hoverDesk) {
    const d = hoverDesk;
    const [nx, ny] = toScreen(d.x, d.y - 100);
    const txt = d.asleep ? `${d.name} 🐛 atascado · clic para ayudar` : d.name;
    ctx.font = '600 12px system-ui, sans-serif';
    const tw = ctx.measureText(txt).width + 16;
    fillRR(nx - tw / 2, ny - 10, tw, 20, 10, 'rgba(0,0,0,.72)');
    ctx.fillStyle = '#fff'; ctx.fillText(txt, nx, ny);
  }

  const hidden = totalWriters() - desks.length;
  if (hidden > 0) {
    const [hx, hy] = toScreen(0, -WALL_H - 22);
    const txt = `+${fmtInt(hidden)} devs trabajando en remoto`;
    ctx.font = '600 12px system-ui, sans-serif';
    const tw = ctx.measureText(txt).width + 20;
    fillRR(hx - tw / 2, hy - 10, tw, 20, 10, 'rgba(0,0,0,.55)');
    ctx.fillStyle = '#e8ebf2'; ctx.fillText(txt, hx, hy);
  }

  for (const g of golds) drawGold(g);

  for (const p of particles) {
    if (p.code) continue;
    const [sx, sy] = toScreen(p.x, p.y);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.r);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
    ctx.fillStyle = p.c;
    if (p.flame) { ctx.beginPath(); ctx.arc(0, 0, p.size * p.life * Math.max(0.6, cam.s), 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(-4, -5, 8, 10);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  for (const f of floats) {
    const [sx, sy] = toScreen(f.x, f.y);
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
    ctx.font = `800 ${f.size}px system-ui, sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.strokeText(f.text, sx, sy - (1 - f.life) * 40);
    ctx.fillStyle = f.color; ctx.fillText(f.text, sx, sy - (1 - f.life) * 40);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

function easeOutBack(x) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

// ---------------------------------------------------------------------------
// Mecánicas
// ---------------------------------------------------------------------------
function addFloat(x, y, text, color, size) {
  if (floats.length > 60) return;
  floats.push({ x, y, text, color: color || '#ffd166', size: size || 16, life: 1 });
}

function burst(x, y, n) {
  const colors = ['#ffffff', '#f7f5ee', '#ffd166', '#7fe3ff'];
  for (let i = 0; i < n && particles.length < 200; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const v = 120 + Math.random() * 160;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, life: 1.2, g: 500, c: colors[i % colors.length] });
  }
}

function flames(n) {
  const colors = ['#ff9f43', '#ff6b35', '#ffd166', '#ff4d4d'];
  for (let i = 0; i < n && particles.length < 200; i++) {
    particles.push({
      x: player.x - 4 + rand(-14, 14), y: player.y - 24 + rand(-3, 3),
      vx: rand(-15, 15), vy: rand(-90, -50), r: 0, vr: 0, life: rand(0.5, 0.9), g: -40,
      c: colors[Math.floor(Math.random() * colors.length)], flame: true, size: rand(4, 8),
    });
  }
}

function typeKeys(k) {
  S.progress += k;
  charAcc += k * CHARS_PER_KEY;
  if (charAcc > 200) charAcc = 200;
  while (charAcc >= 1) {
    screenBuf += DOC_TEXT[textPos];
    textPos = (textPos + 1) % DOC_TEXT.length;
    charAcc -= 1;
  }
  const L = docLen();
  if (S.progress >= L) {
    const n = Math.floor(S.progress / L);
    S.progress -= n * L;
    const pay = n * docValue();
    earn(pay);
    addDocs(n);
    if (order) order.got = Math.min(order.need, order.got + n);
    screenBuf = '';
    player.flash = 0.9;
    player.flashText = '+$' + fmt(pay);
    addFloat(player.x, player.y - 95, '+$' + fmt(pay), '#ffd166', 24);
    burst(player.x - 10, player.y - 60, 14);
    sfxCoin();
  }
}

const CODE_BITS = ['{', '}', '</>', ';', '()', '=>', '01', 'fn', '[]', '#'];
function codeBit(x, y, c) {
  if (particles.length > 180) return;
  particles.push({ x: x + rand(-6, 6), y, vx: 0, vy: -20, r: 0, vr: 0, g: 0, life: 1, c, code: CODE_BITS[Math.floor(Math.random() * CODE_BITS.length)] });
}

function clickComputer() {
  if (paused) return;
  S.clicks++;
  player.press = 1;
  const m = comboMult();
  combo.heat = Math.min(maxTier() * 8 + 4, combo.heat + 1);
  const now = comboMult();
  if (now > S.bestCombo) S.bestCombo = now;
  if (now > m) addFloat(player.x + 72, player.y - 92, '¡En la zona ×' + now + '!', '#ff9f43', 18);
  typeKeys(clickPower() * m);
  codeBit(player.x - 12, player.y - 78, '#7fe3ff');
  sfxKey();
  $('hint').classList.add('gone');
}

function wake(d, manual) {
  if (!d.asleep) return;
  d.asleep = false;
  d.awakeSince = time;
  if (manual) S.wakes++;
  addFloat(d.x, d.y - 70, manual ? '¡Bug resuelto!' : '🧭 ¡Desbloqueado!', '#7fe3ff', 14);
  sfxWake();
}

function buyWriter(w) {
  const c = writerCost(w);
  if (S.money < c || paused) return;
  S.money -= c;
  S.writers[w.id] = owned(w.id) + 1;
  const idx = logHire(w.id);
  if (idx >= 0) {
    if (idx < desks.length) desks[idx] = newDesk(w.id, time);
    else desks.push(newDesk(w.id, time));
  }
  layout(false);
  const d = desks[idx >= 0 ? idx : desks.length - 1];
  if (d) addFloat(d.x, d.y - 100, '¡' + d.name + ' contratado!', '#4fd1a5', 14);
  sfxBuy();
  updateUI();
}

function buyAssistant() {
  const c = assistCost();
  if (S.money < c || S.staff >= ASSIST.max || paused) return;
  S.money -= c;
  S.staff++;
  layout(false);
  syncAssistants(false);
  addFloat(door.x, door.y - 60, '¡Scrum master!', '#a99bff', 15);
  sfxBuy();
  updateUI();
}

function buyUpgrade(u) {
  const c = upgradeCost(u);
  if (S.money < c || upgradeMaxed(u) || paused) return;
  S.money -= c;
  S.upgrades[u.id] = lvl(u.id) + 1;
  addFloat(player.x, player.y - 105, u.name + ' ↑', '#4fd1a5', 16);
  if (u.id === 'cartera') nextClient = 4;
  layout(false);
  sfxBuy();
  updateUI();
}

function spawnGold() {
  const x = rand(world.minX + 40, world.maxX - 40);
  const y = rand(world.minY + 40, world.maxY - 60);
  golds.push({ x, y, vx: rand(-25, 25), vy: rand(-12, -4), age: 0, life: 9, seed: Math.random() * 10 });
}

function clickGold(g) {
  golds = golds.filter(o => o !== g);
  S.goldClicks++;
  sfxGold();
  burst(g.x, g.y, 20);
  if (Math.random() < 0.65) {
    const cash = Math.max(incomePerSec() * 90, docValue() * 25) * rand(0.8, 1.2);
    earn(cash);
    addFloat(g.x, g.y, '+$' + fmt(cash), '#ffd166', 26);
    showToast(`👼 Un inversionista ángel invirtió ¡+$${fmt(cash)}!`);
  } else {
    frenzy.t = 20; frenzy.mult = 5;
    addFloat(g.x, g.y, '¡RONDA DE INVERSIÓN ×5!', '#ff9f43', 26);
    showToast('👼 ¡Ronda de inversión! Todo paga ×5 durante 20 segundos');
  }
}

function acceptOrder() {
  const need = Math.max(3, Math.round(120 * clickPower() / docLen()));
  order = { need, got: 0, t: ORDER_TIME_S };
  client = null;
  addFloat(door.x, door.y - 70, `¡Hotfix: ${need} commits!`, '#7fe3ff', 16);
  sfxBuy();
}

function finishOrder(ok) {
  if (ok) {
    const reward = order.need * docValue() * 5 * (has('contactos') ? 2 : 1) + incomePerSec() * 20;
    earn(reward);
    S.ordersDone++;
    addFloat(door.x, door.y - 70, '+$' + fmt(reward), '#ffd166', 24);
    burst(door.x, door.y - 40, 18);
    showToast(`🩹 ¡Bug arreglado a tiempo! +$${fmt(reward)}`);
    sfxGold();
  } else {
    showToast('😤 El bug siguió en producción: el cliente se fue molesto');
    sfxBad();
  }
  order = null;
  nextClient = rand(45, 90) * (has('contactos') ? 0.6 : 1);
}

let warned = new Set();
function update(dt) {
  time += dt;
  if (paused) {
    for (const f of floats) f.life -= dt * 0.9;
    floats = floats.filter(f => f.life > 0);
    return;
  }

  // calendario del contrato
  S.day += dt / DAY_SECONDS;
  const left = deadlineDays() - S.day;
  for (const w of [30, 7, 1]) {
    if (left <= w && !warned.has(w)) {
      warned.add(w);
      if (left > 0) showToast(w === 1 ? '⏳ ¡Mañana es el lanzamiento!' : `⏳ Quedan ${w} días para el lanzamiento`);
    }
  }
  if (left <= 0) { openSell(true); return; }

  combo.heat = Math.max(0, combo.heat - (has('racha') ? 2 : 3) * dt);
  if (comboMult() >= 2 && Math.random() < dt * 30 * (comboMult() - 1)) flames(1);
  if (frenzy.t > 0) frenzy.t = Math.max(0, frenzy.t - dt);

  if (autoKps() > 0) typeKeys(autoKps() * dt);

  const wk = writersKps();
  if (wk > 0) {
    const docs = wk / docLen() * dt;
    earn(docs * docValue());
    addDocs(docs);
  }

  // escritorios: progreso visual y bugs que atascan
  const L = docLen(), mult = writerMult();
  const sleepMean = SLEEP_MEAN_S * (has('siesta') ? 2 : 1);
  for (const d of desks) {
    const w = writerById(d.type);
    if (d.asleep) continue;
    if (!w.robot && time - d.awakeSince > 15 && Math.random() < dt / sleepMean) { d.asleep = true; continue; }
    const rate = Math.min(w.kps * mult, L * 2.5) / L;
    d.prog += rate * dt;
    d.nextChar -= dt;
    if (d.nextChar <= 0) { d.nextChar = rand(0.5, 1.1) * (desks.length > 20 ? 2 : 1); codeBit(d.x - 26, d.y - 72, '#9be7c4'); }
    if (d.prog >= 1) {
      d.prog -= Math.floor(d.prog);
      if (time - (d.lastFloat || -9) > 0.8) {
        d.lastFloat = time;
        addFloat(d.x + (Math.random() - 0.5) * 30, d.y - 82, '+$' + fmt(docValue()), '#ffd166', 13);
      }
    }
  }

  updateAssistants(dt);

  // inversionistas ángel
  nextGold -= dt;
  if (nextGold <= 0) { spawnGold(); nextGold = rand(60, 150) / (has('suerte') ? 2 : 1); }
  for (const g of golds) { g.age += dt; g.life -= dt / 9 * 1; g.x += g.vx * dt; g.y += g.vy * dt + Math.sin(time * 2 + g.seed) * 0.3; }
  golds = golds.filter(g => g.life > 0);

  // clientes con bugs en producción
  if (lvl('cartera') > 0) {
    if (client) {
      client.t -= dt;
      if (client.t <= 0) { client = null; nextClient = rand(45, 90); showToast('🚪 El cliente se cansó de esperar soporte'); }
    } else if (order) {
      order.t -= dt;
      if (order.got >= order.need) finishOrder(true);
      else if (order.t <= 0) finishOrder(false);
    } else {
      nextClient -= dt;
      if (nextClient <= 0) { client = { t: CLIENT_WAIT_S }; sfxWake(); }
    }
  }

  player.press = Math.max(0, player.press - dt * 8);
  player.flash = Math.max(0, player.flash - dt);

  for (const f of floats) f.life -= dt * 0.9;
  floats = floats.filter(f => f.life > 0);
  for (const p of particles) {
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);

  const k = 1 - Math.pow(0.002, dt);
  cam.s += (cam.ts - cam.s) * k; cam.x += (cam.tx - cam.x) * k; cam.y += (cam.ty - cam.y) * k;
}

function updateAssistants(dt) {
  for (const a of assistants) {
    if (a.waking > 0) {
      a.waking -= dt;
      if (a.waking <= 0) { if (a.target) wake(a.target, false); a.target = null; a.path = []; }
      continue;
    }
    if (a.target && (!a.target.asleep || !desks.includes(a.target))) { a.target = null; a.path = []; }
    if (!a.target && a.path.length === 0) {
      const cur = [Math.round(a.fi), Math.round(a.fj)];
      let best = null, bestPath = null;
      for (const d of desks) {
        if (!d.asleep || assistants.some(o => o !== a && o.target === d)) continue;
        const p = bfs(cur, standTile(d));
        if (p && (!bestPath || p.length < bestPath.length)) { best = d; bestPath = p; }
      }
      if (best) { a.target = best; a.path = bestPath; a.seated = false; }
      else {
        const h = homeTile(a.seat);
        if (cur[0] !== h[0] || cur[1] !== h[1]) { a.path = bfs(cur, h) || []; a.seated = false; if (!a.path.length) { [a.fi, a.fj] = h; } }
        else a.seated = a.seat < 3;
      }
    }
    if (a.path.length) {
      const [tx, ty] = a.path[0];
      const dx = tx - a.fi, dy = ty - a.fj, dist = Math.hypot(dx, dy);
      const step = 3 * dt;
      if (Math.abs(dx) > 0.01) a.dir = dx > 0 ? 'south-east' : 'north-west';
      else if (Math.abs(dy) > 0.01) a.dir = dy > 0 ? 'south-west' : 'north-east';
      if (dist <= step) { a.fi = tx; a.fj = ty; a.path.shift(); }
      else { a.fi += dx / dist * step; a.fj += dy / dist * step; }
      a.walking = true;
      if (!a.path.length && a.target) { a.waking = 0.7; a.dir = 'north-west'; a.walking = false; }
    } else a.walking = false;
  }
}

// ---------------------------------------------------------------------------
// Vender la empresa (prestigio)
// ---------------------------------------------------------------------------
let forcedSale = false;
function openSell(forced) {
  if (paused) return;
  const pts = forced ? Math.max(1, pointsNow()) : pointsNow();
  if (!forced && pts < 1) return;
  paused = true; forcedSale = forced;
  const done = bookDone();
  $('mTitle').textContent = forced ? '⏳ Llegó la fecha de lanzamiento' : '🤑 Vender la startup';
  $('mBody').innerHTML = `
    <p>${forced ? 'Pasaron los ' + deadlineDays() + ' días del roadmap. Una gran empresa compra tu startup y tú fundas otra.' : 'Vendes todo (dinero, devs y mejoras) y fundas otra startup con más estrellas de GitHub.'}</p>
    <p>Ganaste <b>$${fmt(S.totalEarned)}</b> con esta startup ($${fmt(S.lifetimeEarned)} en toda la partida).</p>
    <p>Producto v1.0: <b>${fmtInt(S.docs)} / ${fmtInt(bookTarget())}</b> commits ${done ? '<span class="ok">✓ ¡lanzado a tiempo! +50% ⭐</span>' : '<span class="bad">no se llegó a lanzar</span>'}</p>
    <div class="big">+${pts} ⭐</div>
    <p class="muted small">Cada estrella cuesta más que la anterior: dependen de todo lo que ganaste en la partida y para duplicarlas necesitas ganar 8 veces más. La siguiente llega al juntar $${fmt(nextStarAt())} en total. Cada estrella da +1% de ingresos para siempre y los logros se conservan.</p>`;
  $('mCancel').hidden = forced;
  $('modal').hidden = false;
  $('mOk').focus();
}

function doPrestige() {
  const pts = forcedSale ? Math.max(1, pointsNow()) : pointsNow();
  S.starBase += basePoints();
  if (bookDone()) S.books++;
  S.stars += pts; S.starsTotal += pts; S.sales++;
  Object.assign(S, {
    money: 0, totalEarned: 0, docs: 0, progress: 0,
    writers: {}, upgrades: {}, hireLog: [], staff: 0, day: 0, inPrestige: true,
  });
  combo.heat = 0; frenzy.t = 0; client = null; order = null; golds = []; floats = []; particles = [];
  screenBuf = ''; charAcc = 0; warned = new Set();
  assistants = [];
  rebuildDesks();
  $('modal').hidden = true;
  checkAchievements();
  save();
  openStarView();
}

// Aplica las ventajas iniciales del árbol y arranca la nueva startup.
function startNewCompany() {
  if (has('semilla')) S.money = 250;
  if (has('talento')) S.writers.junior = 3;
  if (has('cafeina')) S.upgrades.cafe = 1;
  if (has('asistfijo')) S.staff = 1;
  S.inPrestige = false;
  S.hireLog = [];
  nextGold = rand(40, 90); nextClient = rand(25, 50);
  rebuildDesks();
  $('starView').hidden = true;
  paused = false;
  save();
  updateUI();
  showToast(`🚀 ¡Nueva startup fundada! Meta de la v1.0: ${fmtInt(bookTarget())} commits`);
}

function buyNode(n) {
  if (has(n.id) || (n.req && !has(n.req)) || S.stars < n.cost) return;
  S.stars -= n.cost;
  S.tree[n.id] = true;
  sfxGold();
  save();
  updateStarView();
  showNode(n);
  const el = nodeEls[n.id];
  el.animate([{ transform: 'translate(-50%,-50%) scale(1.5)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 450, easing: 'ease-out' });
}

// ---------------------------------------------------------------------------
// Constelación de estrellas de GitHub (solo visible entre startups)
// ---------------------------------------------------------------------------
const nodeEls = {};
const starLines = [];
let selNode = null;

function nodePos(bi, ni) {
  const a = (-90 + bi * 72) * Math.PI / 180;
  const r = [17, 31, 44][ni];
  return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
}

function buildStarView() {
  const view = $('starView'), sky = $('svSky'), svg = $('svLines');
  for (let i = 0; i < 90; i++) {
    const t = document.createElement('span');
    t.className = 'twinkle';
    t.style.left = Math.random() * 100 + '%';
    t.style.top = Math.random() * 100 + '%';
    t.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    if (Math.random() < 0.2) t.style.width = t.style.height = '3px';
    view.prepend(t);
  }
  const NS = 'http://www.w3.org/2000/svg';
  const line = (p, q, cls, a, b) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', p[0]); l.setAttribute('y1', p[1]); l.setAttribute('x2', q[0]); l.setAttribute('y2', q[1]);
    l.setAttribute('class', cls);
    svg.appendChild(l);
    starLines.push({ el: l, a, b });
  };
  TREE_ROOT.pos = [50, 50];
  BRANCHES.forEach((br, bi) => br.nodes.forEach((n, ni) => { n.pos = nodePos(bi, ni); }));
  // contorno de la estrella: une las puntas en orden de pentagrama
  const tips = BRANCHES.map(b => b.nodes[2]);
  [0, 2, 4, 1, 3, 0].reduce((i, j) => { line(tips[i].pos, tips[j].pos, 'outline', tips[i].id, tips[j].id); return j; });
  for (const n of TREE) if (n.req) line(TREE.find(t => t.id === n.req).pos, n.pos, '', n.req, n.id);

  for (const n of TREE) {
    const b = document.createElement('button');
    b.className = 'sv-node' + (n === TREE_ROOT ? ' root' : '');
    b.style.left = n.pos[0] + '%';
    b.style.top = n.pos[1] + '%';
    b.innerHTML = `<span>${n.icon}</span><span class="cost">${n.cost}⭐</span><span class="lbl">${n.name}</span>`;
    b.addEventListener('click', () => showNode(n));
    sky.appendChild(b);
    nodeEls[n.id] = b;
  }
}

function openStarView() {
  paused = true;
  selNode = null;
  $('svDetail').innerHTML = 'Toca una estrella para ver qué hace. Las estrellas doradas brillando son las que puedes comprar ahora.';
  for (const id in nodeEls) nodeEls[id].classList.remove('sel');
  updateStarView();
  $('starView').hidden = false;
}

function updateStarView() {
  setText($('svStars'), String(S.stars));
  setText($('svSub'), `${S.starsTotal} ⭐ ganadas en total (+${S.starsTotal}% ingresos para siempre) · ` +
    `${S.books} producto${S.books === 1 ? '' : 's'} lanzado${S.books === 1 ? '' : 's'} a tiempo · ` +
    `próxima v1.0: ${fmtInt(bookTarget())} commits en ${deadlineDays()} días`);
  for (const n of TREE) {
    const el = nodeEls[n.id];
    const own = has(n.id), reqOk = !n.req || has(n.req);
    el.classList.toggle('owned', own);
    el.classList.toggle('avail', !own && reqOk && S.stars >= n.cost);
    el.classList.toggle('locked', !own && !reqOk);
  }
  for (const l of starLines) l.el.classList.toggle('lit', has(l.a) && has(l.b));
}

function showNode(n) {
  selNode = n;
  const req = n.req ? TREE.find(t => t.id === n.req) : null;
  let action;
  if (has(n.id)) action = '<div class="ok" style="margin-top:6px">✓ Ya brilla en tu constelación</div>';
  else if (req && !has(req.id)) action = `<div style="margin-top:6px">🔒 Primero necesitas <b>${req.name}</b>.</div>`;
  else action = `<button class="btn-primary" id="buyNodeBtn" ${S.stars < n.cost ? 'disabled' : ''}>${S.stars < n.cost ? 'Te faltan estrellas · ' : 'Comprar por '}${n.cost} ⭐</button>`;
  $('svDetail').innerHTML = `<b>${n.icon} ${n.name}</b><div>${n.desc}</div>${action}`;
  const btn = $('buyNodeBtn');
  if (btn) btn.addEventListener('click', () => buyNode(n));
  for (const id in nodeEls) nodeEls[id].classList.toggle('sel', id === n.id);
}

// ---------------------------------------------------------------------------
// Interfaz
// ---------------------------------------------------------------------------
function buildList(container, items, onBuy) {
  for (const it of items) {
    const b = document.createElement('button');
    b.className = 'item';
    b.innerHTML = '<span class="ico"></span><span class="info"><span class="name"></span><span class="desc"></span></span><span class="meta"><span class="cost"></span><span class="own"></span></span>';
    if (it.img) b.querySelector('.ico').innerHTML = `<img src="${it.img}" alt="">`;
    b.addEventListener('click', () => onBuy(it));
    container.appendChild(b);
    it.el = b;
    it.ui = { ico: b.querySelector('.ico'), name: b.querySelector('.name'), desc: b.querySelector('.desc'), cost: b.querySelector('.cost'), own: b.querySelector('.own') };
  }
}

function setItem(it, o) {
  it.el.disabled = !o.can;
  it.el.classList.toggle('can', o.can);
  it.el.classList.toggle('locked', !!o.locked);
  if (!it.img) setText(it.ui.ico, o.icon);
  setText(it.ui.name, o.name); setText(it.ui.desc, o.desc);
  setText(it.ui.cost, o.cost); setText(it.ui.own, o.own);
}

function buildAchievements() {
  const list = $('achList');
  for (const a of ACH) {
    const d = document.createElement('div');
    d.className = 'ach off';
    d.innerHTML = `<span class="a-ico">${a.icon}</span><span><div class="a-name">${a.name}</div><div class="a-desc">${a.desc}</div></span>`;
    list.appendChild(d);
    a.el = d;
  }
}

function setText(el, v) { if (el.textContent !== v) el.textContent = v; }

function updateUI() {
  setText($('money'), fmt(S.money));
  setText($('rate'), fmt(incomePerSec()));
  const L = docLen();
  setText($('docProg'), String(Math.floor(S.progress)));
  setText($('docLen'), String(L));
  $('docBar').style.width = (S.progress / L * 100).toFixed(1) + '%';
  setText($('docValue'), fmt(docValue()));
  setText($('docs'), fmtInt(S.docsAll));
  setText($('clickPow'), String(clickPower()));
  setText($('kps'), fmtRate(writersKps() + autoKps()));
  const tw = totalWriters();
  let office = OFFICES[0][1];
  for (const [n, name] of OFFICES) if (tw >= n) office = name;
  setText($('office'), office);

  // calendario y producto
  const dl = deadlineDays();
  setText($('day'), String(Math.min(dl, Math.floor(S.day) + 1)));
  setText($('dayMax'), String(dl));
  $('calBar').style.width = Math.min(100, S.day / dl * 100).toFixed(1) + '%';
  setText($('pages'), fmtInt(S.docs));
  setText($('bookTarget'), fmtInt(bookTarget()));
  $('bookBar').style.width = Math.min(100, S.docs / bookTarget() * 100).toFixed(1) + '%';
  document.querySelector('.hud-right').classList.toggle('urgent', dl - S.day <= 7);

  // buffs
  let buffs = '';
  if (frenzy.t > 0) buffs += `<span class="buff fire">👼 Ronda de inversión ×${frenzy.mult} · ${Math.ceil(frenzy.t)}s</span>`;
  if (order) buffs += `<span class="buff order">🩹 Hotfix ${order.got}/${order.need} commits · ${Math.ceil(order.t)}s</span>`;
  const sleeping = desks.filter(d => d.asleep).length;
  if (sleeping) buffs += `<span class="buff">🐛 ${sleeping} atascado${sleeping > 1 ? 's' : ''}</span>`;
  const bEl = $('buffs');
  if (bEl.innerHTML !== buffs) bEl.innerHTML = buffs;

  WRITERS.forEach((w, i) => {
    const unlocked = i === 0 || owned(w.id) > 0 || S.totalEarned >= w.baseCost * 0.4 || owned(WRITERS[i - 1].id) > 0;
    const cost = writerCost(w);
    setItem(w, {
      can: unlocked && S.money >= cost, locked: !unlocked,
      icon: unlocked ? w.icon : '❔', name: unlocked ? w.name : '???',
      desc: unlocked ? `${w.desc} +${fmtRate(w.kps * writerMult())} teclas/s` : 'Sigue ganando para desbloquear.',
      cost: '$' + fmt(cost), own: String(owned(w.id)),
    });
  });
  {
    const unlocked = tw >= 3 || S.staff > 0;
    const maxed = S.staff >= ASSIST.max;
    const cost = assistCost();
    setItem(ASSIST, {
      can: unlocked && !maxed && S.money >= cost, locked: !unlocked,
      icon: unlocked ? ASSIST.icon : '❔', name: unlocked ? ASSIST.name : '???',
      desc: unlocked ? ASSIST.desc : 'Contrata 3 devs para desbloquear.',
      cost: maxed ? 'MÁX' : '$' + fmt(cost), own: S.staff + '/' + ASSIST.max,
    });
  }
  UPGRADES.forEach(u => {
    const maxed = upgradeMaxed(u);
    const cost = upgradeCost(u);
    setItem(u, {
      can: !maxed && S.money >= cost, icon: u.icon, name: u.name, desc: u.desc,
      cost: maxed ? (u.max === 1 ? '✓' : 'MÁX') : '$' + fmt(cost), own: u.max === 1 ? '' : 'nv ' + lvl(u.id),
    });
  });

  // botón de venta en el panel del calendario
  const pts = pointsNow();
  const sell = $('sellBtn');
  sell.disabled = pts < 1 || paused;
  const sellHtml = (pts < 1 ? 'Vender startup' : `🤑 Vender startup · +${pts} ⭐`) +
    `<small>siguiente ⭐ al juntar $${fmt(nextStarAt())} en total</small>`;
  if (sell.innerHTML !== sellHtml) sell.innerHTML = sellHtml;
  sell.title = (bookDone() ? 'v1.0 lanzada: ya incluye el +50% de estrellas. ' : 'Si lanzas la v1.0 antes de vender ganas +50% de estrellas. ') +
    `Llevas $${fmt(S.lifetimeEarned)} ganados en toda la partida.`;

  // logros
  for (const a of ACH) a.el.classList.toggle('off', !S.ach[a.id]);
  setText($('achHead'), `${achCount()} / ${ACH.length} logros · +${achCount()}% ingresos`);

  setText($('mute'), S.muted ? '🔇' : '🔊');
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(showToast.h);
  showToast.h = setTimeout(() => { t.hidden = true; }, 4000);
}

function selectTab(name) {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x.dataset.tab === name));
  for (const id of ['hire', 'up', 'ach']) $('list-' + id).hidden = id !== name;
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------
function hitPlayer(wx, wy) {
  return wx > player.x - 50 && wx < player.x + 50 && wy > player.y - 85 && wy < player.y + 30;
}
function hitDesk(wx, wy) {
  for (let i = desks.length - 1; i >= 0; i--) {
    const d = desks[i];
    if (wx > d.x - 50 && wx < d.x + 50 && wy > d.y - 85 && wy < d.y + 32) return d;
  }
  return null;
}
function hitClient(wx, wy) {
  return !!client && Math.abs(wx - door.x) < 24 && wy > door.y - 56 && wy < door.y + 8;
}
function hitGold(sx, sy) {
  for (const g of golds) { const [gx, gy] = toScreen(g.x, g.y); if (Math.hypot(sx - gx, sy - gy) < Math.max(34, 40 * cam.s)) return g; }
  return null;
}

function stagePoint(e) {
  const r = cv.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}

cv.addEventListener('pointerdown', e => {
  if (paused) return;
  const [sx, sy] = stagePoint(e);
  const [wx, wy] = toWorld(sx, sy);
  const g = hitGold(sx, sy);
  if (g) { e.preventDefault(); clickGold(g); return; }
  if (hitClient(wx, wy)) { e.preventDefault(); acceptOrder(); return; }
  if (hitPlayer(wx, wy)) { e.preventDefault(); clickComputer(); return; }
  const d = hitDesk(wx, wy);
  if (d && d.asleep) { e.preventDefault(); wake(d, true); }
});
cv.addEventListener('pointermove', e => {
  const [sx, sy] = stagePoint(e);
  const [wx, wy] = toWorld(sx, sy);
  player.hover = hitPlayer(wx, wy);
  hoverDesk = player.hover ? null : hitDesk(wx, wy);
  hoverClient = hitClient(wx, wy);
  const clickable = player.hover || hoverClient || !!hitGold(sx, sy) || (hoverDesk && hoverDesk.asleep);
  cv.style.cursor = clickable ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { player.hover = false; hoverDesk = null; });
cv.addEventListener('wheel', e => {
  e.preventDefault();
  const [sx, sy] = stagePoint(e);
  zoomAt(sx, sy, e.deltaY < 0 ? 1.2 : 1 / 1.2);
}, { passive: false });
let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, px: view.px, py: view.py, moved: false }; });
addEventListener('pointermove', e => {
  if (!drag || !e.buttons || view.zoom <= 1) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 6) drag.moved = true;
  if (drag.moved) { view.px = drag.px + dx; view.py = drag.py + dy; fitCamera(true); cv.style.cursor = 'grabbing'; }
});
addEventListener('pointerup', () => { drag = null; });
$('zin').addEventListener('click', () => zoomAt(W / 2, H / 2 + 40, 1.3));
$('zout').addEventListener('click', () => zoomAt(W / 2, H / 2 + 40, 1 / 1.3));

window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || paused) return;
  if (e.key.length !== 1 && e.key !== 'Enter' && e.key !== 'Backspace') return;
  const a = document.activeElement;
  if (a && a.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
  clickComputer();
});

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => selectTab(t.dataset.tab)));

$('sellBtn').addEventListener('click', () => openSell(false));
$('mOk').addEventListener('click', doPrestige);
$('mCancel').addEventListener('click', () => { if (!forcedSale) { paused = false; $('modal').hidden = true; } });
$('svStart').addEventListener('click', startNewCompany);
$('mute').addEventListener('click', () => { S.muted = !S.muted; updateUI(); });
$('reset').addEventListener('click', () => {
  if (!confirm('¿Borrar TODO el progreso, incluidas estrellas y logros? No se puede deshacer.')) return;
  S = fresh(); screenBuf = ''; textPos = 0; charAcc = 0; floats = []; particles = [];
  combo.heat = 0; frenzy.t = 0; client = null; order = null; golds = []; assistants = []; warned = new Set();
  paused = false; $('modal').hidden = true; $('starView').hidden = true;
  rebuildDesks(); save(); updateUI();
  $('hint').classList.remove('gone');
});

window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
setInterval(save, 5000);

// ---------------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------------
for (const w of WRITERS) w.img = 'assets/icon_' + w.id + '.png';
ASSIST.img = 'assets/icon_sm.png';
for (const u of UPGRADES) u.img = 'assets/icon_' + u.id + '.png';
buildList($('list-hire'), WRITERS.concat([ASSIST]), it => (it === ASSIST ? buyAssistant() : buyWriter(it)));
buildList($('list-up'), UPGRADES, buyUpgrade);
buildStarView();
buildAchievements();
rebuildDesks();
if (S.clicks > 0) $('hint').classList.add('gone');
for (const w of [30, 7, 1]) if (deadlineDays() - S.day <= w) warned.add(w);

// ganancias mientras no estabas (el calendario no avanza)
const away = S.inPrestige ? 0 : Math.min(OFFLINE_CAP_S, Math.max(0, (Date.now() - S.lastTick) / 1000));
const offlineDocs = writersKpsTotal() / docLen() * away * (has('remoto') ? 1 : 0.5);
if (away > 30 && offlineDocs * docValue() >= 0.01) {
  const gain = offlineDocs * docValue();
  earn(gain);
  addDocs(offlineDocs);
  showToast(`Mientras no estabas, tu equipo ganó $${fmt(gain)} USD`);
}

// herramientas de prueba: solo con ?debug en la URL
if (/[?&]debug\b/.test(location.search)) {
  window.dbg = {
    get S() { return S; },
    gold: spawnGold,
    client() { nextClient = 0; },
    sleepAll() { desks.forEach(d => { if (!writerById(d.type).robot) d.asleep = true; }); },
    day(v) { S.day = v; },
    money(v) { earn(v); },
  };
}

new ResizeObserver(resize).observe(stage);
resize();
loadImages().then(() => { ready = true; layout(true); }).catch(err => {
  showToast(err.message + '. Abre el juego con el servidor local (node game/serve.js).');
});
updateUI();
if (S.inPrestige) openStarView();
setInterval(() => { updateUI(); if (!paused) checkAchievements(); }, 100);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  update(dt);
  bg.draw(time);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
