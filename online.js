// Conexión con Firebase Realtime Database: jugadores en línea e historial de jugadores.
// Todo se guarda bajo /startupclicker para no mezclarse con otros juegos de la misma base.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, update, get, onValue, onDisconnect, serverTimestamp, increment,
  query, orderByChild, limitToLast,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const DB_URL = 'https://spud-survival-default-rtdb.firebaseio.com';
const ROOT = 'startupclicker';
export const PREFS_KEY = 'startupclicker.prefs';
export const SAVE_KEY = 'startupclicker.v2b.save';

// --------------------------- preferencias locales ---------------------------
export function prefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (e) { return {}; }
}
export function savePrefs(p) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) { /* sin almacenamiento */ }
}
export function cleanName(s) {
  return String(s || '').replace(/[<>"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
}
export function playerId() {
  const p = prefs();
  if (!p.id) {
    p.id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, '');
    savePrefs(p);
  }
  return p.id;
}
export function playerName() {
  const p = prefs();
  if (!p.name) { p.name = 'Dev-' + Math.floor(1000 + Math.random() * 9000); savePrefs(p); }
  return p.name;
}

// --------------------------- base de datos ----------------------------------
let db = null;
function connect() {
  if (!db) db = getDatabase(initializeApp({ databaseURL: DB_URL }));
  return db;
}

// Marca al jugador como "en línea" mientras la pestaña esté abierta; Firebase lo borra al desconectarse.
export function goOnline(page) {
  const d = connect();
  const me = ref(d, `${ROOT}/online/${playerId()}`);
  onValue(ref(d, '.info/connected'), snap => {
    if (snap.val() !== true) return;
    onDisconnect(me).remove().then(() => set(me, { name: playerName(), page, since: serverTimestamp() }));
  });
  return {
    rename(name) { return update(me, { name }); },
  };
}

// Escucha la conexión con la base (para mostrar "conectado / sin conexión").
export function watchConnection(cb) {
  onValue(ref(connect(), '.info/connected'), snap => cb(snap.val() === true));
}

export function watchOnline(cb) {
  onValue(ref(connect(), `${ROOT}/online`), snap => {
    const list = [];
    snap.forEach(c => { list.push({ id: c.key, ...c.val() }); });
    list.sort((a, b) => (b.since || 0) - (a.since || 0));
    cb(list);
  });
}

export function watchPlayers(cb, n = 25) {
  const q = query(ref(connect(), `${ROOT}/players`), orderByChild('lastPlayed'), limitToLast(n));
  onValue(q, snap => {
    const list = [];
    snap.forEach(c => { list.push({ id: c.key, ...c.val() }); });
    cb(list.reverse());
  });
}

// Registra que el jugador entró a jugar (cuenta partidas y guarda la primera vez).
export async function recordPlay() {
  const d = connect();
  const r = ref(d, `${ROOT}/players/${playerId()}`);
  const prev = await get(r);
  const data = { name: playerName(), lastPlayed: serverTimestamp(), plays: increment(1) };
  if (!prev.exists()) data.firstSeen = serverTimestamp();
  await update(r, data);
}

// Copia a la base un resumen del progreso guardado (dinero total, estrellas, startups vendidas).
export function syncStats() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { /* ignorar */ }
  if (!s) return Promise.resolve();
  const devs = Object.values(s.writers || {}).reduce((a, b) => a + b, 0);
  return update(ref(connect(), `${ROOT}/players/${playerId()}`), {
    name: playerName(),
    lastPlayed: serverTimestamp(),
    earned: Math.floor(s.lifetimeEarned || 0),
    stars: s.starsTotal || 0,
    sales: s.sales || 0,
    books: s.books || 0,
    devs,
  });
}

// Cambia el nombre en línea y en el historial (si ya jugó).
export async function renamePlayer(name) {
  const d = connect();
  const r = ref(d, `${ROOT}/players/${playerId()}`);
  if ((await get(r)).exists()) await update(r, { name });
}
