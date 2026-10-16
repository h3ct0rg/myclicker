// Portada: animación del dev, jugadores en línea / recientes, configuración y compartir.
import {
  goOnline, watchOnline, watchPlayers, watchConnection, renamePlayer,
  playerId, playerName, prefs, savePrefs, cleanName, SAVE_KEY,
} from './online.js';

const $ = id => document.getElementById(id);
const SHARE_TEXT = '¡Estoy armando mi startup en Startup Clicker! 🚀 Programa, contrata devs, esquiva bugs y conviértela en unicornio:';

// ---------------------------------------------------------------------------
// Animación: un dev programando, se atasca con un bug y llega el Scrum master
// ---------------------------------------------------------------------------
const cv = $('hero');
const ctx = cv.getContext('2d');
const IMG = {};
const NAMES = ['floor', 'desk_clean', 'dev_junior', 'stuck_junior', 'monitor_fix', 'angel'];
const WALK = ['north-west', 'south-east'];
const iso = (i, j) => [(i - j) * 32, (i + j) * 16];
const VIEW = { x0: -140, x1: 140, y0: -100, y1: 128 };
let scale = 2, ox = 0, oy = 0, t0 = performance.now(), floats = [], bits = [];
const CODE = ['{', '}', '</>', ';', '()', '=>', '01', 'fn', '[]'];

function load(name, src) {
  return new Promise(res => { const im = new Image(); im.onload = () => { IMG[name] = im; res(); }; im.onerror = res; im.src = src; });
}
const ready = Promise.all([
  ...NAMES.map(n => load(n, `assets/${n}.png`)),
  load('sm_idle', 'assets/sm/idle_north-west.png'),
  ...WALK.flatMap(d => [0, 1, 2, 3].map(k => load(`sm_${d}_${k}`, `assets/sm/walk_${d}_${k}.png`))),
]);

function fit() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  // escala entera en píxeles de pantalla para que el pixel art se vea nítido
  const s = Math.min(w / (VIEW.x1 - VIEW.x0), h / (VIEW.y1 - VIEW.y0)) * dpr;
  scale = (s >= 2 ? Math.floor(s) : s) / dpr;   // entero cuando hay espacio, si no ocupa todo el ancho
  ox = w / 2 - ((VIEW.x0 + VIEW.x1) / 2) * scale;
  oy = h / 2 - ((VIEW.y0 + VIEW.y1) / 2) * scale;
}
new ResizeObserver(fit).observe(cv);

function bug(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.25);
  ctx.strokeStyle = '#1b1e25'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const k of [-4, 0, 4]) { const w = Math.sin(t * 10 + k) * 1.5; ctx.moveTo(-5, k); ctx.lineTo(-10, k + w); ctx.moveTo(5, k); ctx.lineTo(10, k - w); }
  ctx.moveTo(-2, -8); ctx.lineTo(-5, -13); ctx.moveTo(2, -8); ctx.lineTo(5, -13);
  ctx.stroke();
  ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.ellipse(0, 1, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1e25'; ctx.fillRect(-0.6, -6, 1.2, 14);
  ctx.beginPath(); ctx.ellipse(0, -8, 3.5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// guion que se repite cada 14 s
const LOOP = 14;
function scene(t) {
  const k = t % LOOP;
  const stuck = k >= 6 && k < 9.6;
  // Scrum master: entra caminando por la derecha, desbloquea y se va
  let sm = null;
  if (k >= 7 && k < 8.8) sm = { i: 4.2 - (k - 7) / 1.8 * 2.2, dir: 'north-west', walk: true };
  else if (k >= 8.8 && k < 9.6) sm = { i: 2, dir: 'north-west', walk: false, alert: true };
  else if (k >= 9.6 && k < 11.6) sm = { i: 2 + (k - 9.6) / 2 * 2.6, dir: 'south-east', walk: true };
  return { k, stuck, sm };
}

let lastK = 0;
function frame(now) {
  const t = (now - t0) / 1000;
  const { k, stuck, sm } = scene(t);
  // eventos del guion
  if (lastK < 9.6 && k >= 9.6) floats.push({ x: 0, y: -40, text: '¡Bug resuelto!', c: '#7fe3ff', life: 1 });
  if (!stuck && Math.floor(lastK / 1.6) !== Math.floor(k / 1.6)) floats.push({ x: 8, y: -48, text: '+$1', c: '#ffd166', life: 1 });
  if (!stuck && Math.random() < 0.05) bits.push({ x: -26 + Math.random() * 14, y: -40, t: CODE[Math.floor(Math.random() * CODE.length)], life: 1 });
  lastK = k;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  const dpr = cv.width / (cv.clientWidth || 1);
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
  ctx.imageSmoothingEnabled = false;

  // piso 4×4 alrededor del escritorio
  for (let s = -2; s <= 4; s++) for (let i = -1; i <= 2; i++) {
    const j = s - i; if (j < -1 || j > 2) continue;
    const [x, y] = iso(i, j);
    if (IMG.floor) ctx.drawImage(IMG.floor, x - 32, y - 22);
  }

  // escritorio (centro de la huella 2×2 en iso(1,1))
  const [cx, cy] = iso(1, 1);
  const x0 = cx - 64, y0 = cy - 88;
  const drawDesk = () => {
    if (!IMG.desk_clean) return;
    ctx.drawImage(IMG.desk_clean, x0, y0);
    ctx.drawImage(stuck ? IMG.stuck_junior : IMG.dev_junior, x0, y0);
    ctx.drawImage(IMG.monitor_fix, x0, y0);
    if (stuck) {
      ctx.save(); ctx.translate(x0 + 30, y0 + 31); ctx.transform(1, -0.57, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(200,30,45,.85)'; ctx.fillRect(0, 0, 35, 27);
      ctx.fillStyle = '#ffd6d6'; ctx.font = 'bold 7px monospace'; ctx.textBaseline = 'top'; ctx.fillText('ERROR', 4, 4);
      ctx.restore();
      bug(cx + 30, cy - 86 + Math.sin(t * 5) * 2, t);
    }
  };
  const drawSM = () => {
    if (!sm) return;
    const [x, y] = iso(sm.i + 0.5, 1.5);
    const fade = Math.max(0, Math.min(1, (4.4 - sm.i) * 1.5));
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    const im = sm.walk ? IMG[`sm_${sm.dir}_${Math.floor(t * 8) % 4}`] : IMG.sm_idle;
    if (im) ctx.drawImage(im, Math.round(x - 34), Math.round(y - 52));
    if (sm.alert) { ctx.fillStyle = '#ffd166'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', x, y - 58 + Math.sin(t * 20) * 2); }
    ctx.globalAlpha = 1;
  };
  drawDesk(); drawSM();

  // inversionista ángel cruzando el cielo
  const a = (t % 20) / 20;
  if (a < 0.45 && IMG.angel) {
    const ax = -160 + a / 0.45 * 320, ay = -84 + Math.sin(t * 3) * 6;
    ctx.drawImage(IMG.angel, ax - 20, ay - 20, 40, 40);
  }

  // código saliendo del monitor y textos flotantes
  ctx.textAlign = 'center';
  ctx.font = 'bold 8px monospace';
  for (const b of bits) { b.life -= 0.012; b.y -= 0.35; ctx.globalAlpha = Math.max(0, b.life); ctx.fillStyle = '#9be7c4'; ctx.fillText(b.t, b.x, b.y); }
  bits = bits.filter(b => b.life > 0);
  ctx.font = 'bold 11px system-ui, sans-serif';
  for (const f of floats) {
    f.life -= 0.012; ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
    const y = f.y - (1 - f.life) * 26;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(f.text, f.x, y);
    ctx.fillStyle = f.c; ctx.fillText(f.text, f.x, y);
  }
  floats = floats.filter(f => f.life > 0);
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
ready.then(() => { fit(); requestAnimationFrame(frame); });

// ---------------------------------------------------------------------------
// Jugadores en línea y recientes
// ---------------------------------------------------------------------------
const AVATARS = ['junior', 'senior', 'experto', 'ia', 'editorial', 'sm'];
const avatarFor = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return `assets/icon_${AVATARS[h % AVATARS.length]}.png`; };
const UNITS = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
function fmt(n) {
  if (!isFinite(n) || n < 1000) return String(Math.floor(n || 0));
  let i = -1; while (n >= 1000 && i < UNITS.length - 1) { n /= 1000; i++; }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + UNITS[i];
}
function ago(ts) {
  if (!ts) return '';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'hace un momento';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}
// los nombres vienen de otros jugadores: siempre se escriben como texto, nunca como HTML
function row({ id, name, meta, tag, tagClass }) {
  const li = document.createElement('li');
  if (id === playerId()) li.classList.add('me');
  const img = document.createElement('img'); img.className = 'av'; img.alt = ''; img.src = avatarFor(id);
  const box = document.createElement('div'); box.className = 'grow';
  const n = document.createElement('div'); n.className = 'pname'; n.textContent = cleanName(name) || 'Anónimo';
  if (id === playerId()) n.textContent += ' (tú)';
  const m = document.createElement('div'); m.className = 'meta'; m.textContent = meta;
  box.append(n, m); li.append(img, box);
  if (tag) { const t = document.createElement('span'); t.className = 'tag ' + (tagClass || ''); t.textContent = tag; li.append(t); }
  return li;
}
function fill(ul, items, emptyText) {
  ul.replaceChildren(...(items.length ? items : [Object.assign(document.createElement('li'), { className: 'empty', textContent: emptyText })]));
}

let lastPlayers = [];
function renderPlayers() {
  fill($('playersList'), lastPlayers.map(p => row({
    id: p.id, name: p.name,
    meta: `${ago(p.lastPlayed)} · $${fmt(p.earned || 0)} ganados · ⭐ ${p.stars || 0}` + (p.sales ? ` · ${p.sales} startup${p.sales > 1 ? 's' : ''} vendida${p.sales > 1 ? 's' : ''}` : ''),
    tag: p.devs ? `${p.devs} devs` : '',
  })), 'Todavía nadie jugó. ¡Sé el primero!');
}

function startOnline() {
  try {
    const me = goOnline('lobby');
    window.__presence = me;
    watchConnection(ok => { const el = $('dbStatus'); el.textContent = ok ? '● conectado' : '● sin conexión'; el.className = 'status ' + (ok ? 'ok' : 'bad'); });
    watchOnline(list => {
      $('onlineCount').textContent = list.length;
      fill($('onlineList'), list.map(p => row({
        id: p.id, name: p.name, meta: p.since ? `conectado ${ago(p.since)}` : 'conectado',
        tag: p.page === 'game' ? '🎮 jugando' : '🏠 en la portada', tagClass: p.page === 'game' ? 'game' : '',
      })), 'No hay nadie conectado ahora.');
    });
    watchPlayers(list => { lastPlayers = list; renderPlayers(); });
    setInterval(renderPlayers, 60000);   // refresca los "hace X min"
  } catch (e) {
    $('dbStatus').textContent = '● sin conexión'; $('dbStatus').className = 'status bad';
  }
}

// ---------------------------------------------------------------------------
// Configuración, nombre y compartir
// ---------------------------------------------------------------------------
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 2600);
}
function showName() { $('whoName').textContent = playerName(); }

function openConfig() {
  const p = prefs();
  $('cfgName').value = playerName();
  $('cfgSound').checked = p.muted !== true;
  $('cfgDlg').showModal();
}
$('cfgBtn').addEventListener('click', openConfig);
$('renameBtn').addEventListener('click', () => { openConfig(); $('cfgName').select(); });
$('cfgDlg').addEventListener('close', () => {
  if ($('cfgDlg').returnValue !== 'ok') return;
  const p = prefs();
  const name = cleanName($('cfgName').value) || playerName();
  const renamed = name !== p.name;
  p.name = name; p.muted = !$('cfgSound').checked;
  savePrefs(p);
  showName();
  if (renamed) {
    window.__presence?.rename(name).catch(() => {});
    renamePlayer(name).catch(() => {});
  }
  toast('Configuración guardada');
});
$('cfgReset').addEventListener('click', () => {
  if (!confirm('¿Borrar todo tu progreso (dinero, estrellas y logros) en este navegador? No se puede deshacer.')) return;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignorar */ }
  toast('Progreso borrado: tu próxima partida empieza de cero');
});

function siteUrl() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }
const isMobile = () => matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

$('shareBtn').addEventListener('click', async () => {
  const url = siteUrl();
  // en el celular se usa el menú nativo de compartir (WhatsApp, Telegram, etc.)
  if (navigator.share && isMobile()) {
    try { await navigator.share({ title: 'Startup Clicker', text: SHARE_TEXT, url }); } catch (e) { /* cancelado */ }
    return;
  }
  const msg = encodeURIComponent(`${SHARE_TEXT} ${url}`);
  $('shareUrl').value = url;
  $('shareWa').href = `https://wa.me/?text=${msg}`;
  $('shareX').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`;
  $('shareFb').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  $('shareTg').href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(SHARE_TEXT)}`;
  $('shareDlg').showModal();
});
$('copyBtn').addEventListener('click', async () => {
  const url = $('shareUrl').value;
  try { await navigator.clipboard.writeText(url); } catch (e) { $('shareUrl').select(); document.execCommand('copy'); }
  toast('¡Enlace copiado!');
});

showName();
startOnline();
