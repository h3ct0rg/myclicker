// En la página del juego: aparece "jugando" en línea y sube el progreso al historial.
import { goOnline, recordPlay, syncStats } from './online.js';

try {
  goOnline('game');
  recordPlay().catch(() => {});
  setTimeout(() => syncStats().catch(() => {}), 5000);
  setInterval(() => syncStats().catch(() => {}), 30000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) syncStats().catch(() => {}); });
} catch (e) {
  // sin conexión con la base: el juego funciona igual
}
