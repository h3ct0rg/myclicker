# Startup Clicker v2: sitio estático servido con nginx
FROM nginx:1.27-alpine

# URL pública del sitio (sin "/" final). Se usa en la vista previa al compartir (WhatsApp, redes).
ENV PUBLIC_URL=http://localhost:8082

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY index.html juego.html landing.css landing.js online.js game-online.js game.js style.css /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
