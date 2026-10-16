# Startup Clicker

Juego clicker web en 2.5D isométrico ambientado en la industria del software. Cada clic es una tecla, 10 teclas hacen un commit que paga $1; contratas devs (cada uno con su escritorio en la oficina), lanzas la v1.0 antes del plazo y vendes la startup para ganar estrellas de GitHub que mejoran tus próximas startups.

Hecho con HTML, JavaScript, Canvas 2D, WebGL y CSS, sin dependencias. Arte pixel generado con PixelLab (ver `assets/CREDITOS.md`).

## Levantar con Docker

```bash
docker compose up -d --build
```

Luego abre http://localhost:8080. Para detenerlo:

```bash
docker compose down
```

## Sin Docker

Es un sitio estático: sirve esta carpeta con cualquier servidor web (por ejemplo `npx serve .` o `python -m http.server`) y abre `index.html`.

## Controles

- Clic en tu computadora o cualquier tecla: programar.
- Clic en un dev atascado (🐛): desbloquearlo.
- Rueda del mouse o botones +/−: zoom; arrastrar: moverse por la oficina.
- `?debug` en la URL habilita herramientas de prueba en la consola (`dbg`).
