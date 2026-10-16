# Recursos de Startup Clicker v2 (2.5D)

Generados con PixelLab el 2026-10-16. Total: 39 generaciones del plan Tier 1 (13 de la muestra + 19 de la conversión + 7 de ventanas e íconos).

## Cómo se arman los escritorios

Todos los escritorios usan **dos capas**: `desk_clean.png` (escritorio vacío, idéntico para todos) y encima la capa de la persona (`dev_*.png` tecleando o `stuck_*.png` atascado). Las capas se generaron editando `desk_dev.png` con una máscara rectangular (x 48–114, y 14–104) con `create_map_object` en modo "style matching", así que solo cambia la persona. El monitor rojo de "ERROR" y el bicho se dibujan por código.

| Archivo | Qué es | ID en PixelLab |
|---|---|---|
| desk_dev.png | Escritorio base original (muestra) | 9ce7abc2-f86c-4749-bb9b-5afc4b03a07e |
| desk_clean.png | Base sin persona (parche 6948a669-94af-495e-9346-03ca98bd28be sobre desk_dev) | — |
| dev_junior.png | Practicante tecleando | 81dcb5f9-7ed9-4e0f-9957-0e688788d0a7 |
| dev_senior.png | Dev senior tecleando | f95fd6f5-79a1-451f-9be6-dbfce8763960 |
| dev_experto.png | Arquitecto tecleando | d802b3dc-15a6-48e6-a825-ae322cca1f1f |
| dev_ia.png | Agente de IA (robot) | 7bebd8e3-11e0-47d2-b4c0-36d4e785691d |
| dev_editorial.png | Líder de la software factory | b7bec034-3226-4cdd-92a4-c18e627def2a |
| stuck_junior.png | Practicante atascado | 221b6592-958e-45b9-a956-1da9ceedfcac |
| stuck_senior.png | Senior atascada | 92920adb-8c84-4709-96e1-bf18c70f3048 |
| stuck_experto.png | Arquitecto atascado | 09457d24-8955-4078-ae2e-f53fdc597cbc |
| stuck_editorial.png | Líder atascado | f2e44f17-78db-4834-aec4-3fe2cd0876ec |
| desk_empty.png | Tu escritorio (con patito) | 273d3dcf-98a1-4f78-ab8f-562b4d5bb725 |
| desk_stuck.png | Escritorio atascado de la muestra (ya no se usa) | 26fa9497-603c-4d2e-ab65-a660be466994 |
| floor.png | Piso claro (isometric tile 64 px, seed 7) | b30cb3f3-5158-431c-9fd7-5d70761b6a6f |
| couch.png | Sillón | b13b4e2c-ac6b-48f7-9582-25b2b04a15ef |
| whiteboard.png | Pizarrón kanban (≥ 5 devs) | f383c6b8-9611-4b69-a8ed-ecc85d00819f |
| plant.png | Planta | 3bedecb4-3c04-48f1-b842-a674d1423133 |
| coffee.png | Cafetera (con la mejora Café) | f654cf1f-d8cd-451a-9a9f-c5b6692fb583 |
| server.png | Servidor (con un Agente de IA) | 863f645e-8701-4ae5-be17-f1fca2119692 |
| cooler.png | Dispensador de agua (≥ 10 devs) | 4b3817db-1751-4ed3-bb77-499d284e5071 |
| bookshelf.png | Librero (≥ 15 devs) | aada6995-980d-4e96-b173-1a8dcfc03f26 |
| beanbag.png | Pufs (≥ 20 devs) | ef0813b0-a0fd-4e1b-adba-568bf358f3bf |
| arcade.png | Máquina arcade (≥ 25 devs) | 111101e7-c682-4498-9f7a-94fe35d2d05c |
| pingpong.png | Mesa de ping-pong (≥ 40 devs) | 1f095460-f068-4315-a572-976925d0f592 |
| angel.png | Inversionista ángel | 2e3128ed-78ba-446a-b4f9-ebd4c8e85932 |
| client_east.png, client_south.png | Cliente con bug en producción | 55266bb3-976d-4e0e-b12a-891a85ff773d |
| sm/*.png | Scrum master (8 direcciones + caminata en 4 diagonales) | 70182744-4378-49d3-b684-620a2ca1e945 |
| monitor_fix.png | Monitor original recortado de desk_dev; se dibuja sobre la persona para que no quede cortado | — |
| skyline.png | Ciudad nocturna con luna (ventanas) | cc1a3fa5-e30a-4a3b-912d-8a8304b5f096 |
| icon_junior/senior/experto/ia/editorial.png | Íconos del panel recortados de las capas dev_* | — |
| icon_sm.png | Ícono del Scrum master (recorte de sm/idle_south) | — |
| icon_teclado.png | Teclado mecánico | 6f6d422b-73da-4667-b992-e0b29ffc7edb |
| icon_auto.png | Autocompletado con IA | d3e20aeb-0775-4acf-9c85-229221e37d4f |
| icon_cartera.png | Contrato de soporte | 6a1fcc4c-8a2e-4218-9de2-aa06be1bad81 |
| icon_clientes.png | Clientes enterprise | 9651c359-55ff-47f4-9839-586fc87514ae |
| icon_cafe.png | Café de especialidad | 73f892e5-5724-43e5-8764-79e2009d998d |
| icon_plantillas.png | Frameworks y librerías | 68e9cbd3-d81f-408a-bf46-2d4bf609b241 |
