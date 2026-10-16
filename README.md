# Startup Clicker

Juego clicker web en 2.5D isométrico ambientado en la industria del software. Cada clic es una tecla, 10 teclas hacen un commit que paga $1; contratas devs (cada uno con su escritorio en la oficina), lanzas la v1.0 antes del plazo y vendes la startup para ganar estrellas de GitHub que mejoran tus próximas startups.

Hecho con HTML, JavaScript, Canvas 2D, WebGL y CSS. Arte pixel generado con PixelLab (ver `assets/CREDITOS.md`).

## Páginas

- `index.html`: portada con el dev animado, botones Jugar / Configurar / Compartir, jugadores en línea y jugadores recientes.
- `juego.html`: el juego.

## Jugadores en línea e historial (Firebase)

`online.js` usa Firebase Realtime Database (`https://spud-survival-default-rtdb.firebaseio.com`), todo bajo la ruta `/startupclicker`:

- `online/{id}`: quién está conectado ahora (`name`, `page`: `lobby` o `game`, `since`). Firebase lo borra solo al desconectarse.
- `players/{id}`: historial (`name`, `firstSeen`, `lastPlayed`, `plays`, `earned`, `stars`, `sales`, `books`, `devs`), se actualiza cada 30 s mientras juegas.

Reglas recomendadas para la base (en la consola de Firebase), para validar datos y que el orden por `lastPlayed` use índice:

```json
{
  "rules": {
    "startupclicker": {
      "online": { ".read": true, "$id": { ".write": true, ".validate": "newData.child('name').isString() && newData.child('name').val().length <= 20" } },
      "players": { ".read": true, ".indexOn": ["lastPlayed"], "$id": { ".write": true, ".validate": "newData.child('name').isString() && newData.child('name').val().length <= 20" } }
    }
  }
}
```

## Vista previa al compartir (WhatsApp, redes)

Las etiquetas Open Graph de `index.html` muestran `assets/og.png` con título y descripción. WhatsApp necesita la **URL pública completa**, así que se configura con la variable `PUBLIC_URL` (nginx la escribe en el HTML al servirlo). Debe ser `https` y accesible desde internet.

## Levantar con Docker

```bash
PUBLIC_URL=https://tu-dominio.com docker compose up -d --build
```

O define `PUBLIC_URL` en un archivo `.env` junto a `docker-compose.yml`. Luego abre http://localhost:8082. Para detenerlo:

```bash
docker compose down
```

## Sin Docker

Es un sitio estático: sirve esta carpeta con cualquier servidor web (por ejemplo `npx serve .`) y abre `index.html`. Sin nginx la vista previa al compartir no tendrá la URL completa.

## Controles

- Clic en tu computadora o cualquier tecla: programar.
- Clic en un dev atascado (🐛): desbloquearlo.
- Rueda del mouse o botones +/−: zoom; arrastrar: moverse por la oficina.
- `?debug` en la URL habilita herramientas de prueba en la consola (`dbg`).
