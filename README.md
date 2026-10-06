
# CommentBot Gratis - Vellumaria

### PASO 1: Crea tu App en Meta (2 min)
1. Ve a developers.facebook.com > Mis Apps > Crear App > Tipo: Empresa
2. Agrega productos: Instagram Graph API + Webhooks
3. En Webhooks > Suscribirte a: comments

### PASO 2: Consigue tu token
En Graph API Explorer:
- Selecciona tu página de Facebook vinculada a @vellumaria
- Permisos: instagram_basic, instagram_manage_comments, pages_manage_metadata, pages_read_engagement
- Copia el token a .env

### PASO 3: Súbelo gratis a Render.com
1. Sube esta carpeta a un repo de GitHub
2. Ve a render.com > New Web Service > Conecta tu repo
3. Build: npm install / Start: npm start
4. Agrega variables de entorno de tu .env
5. Copia la URL que te da Render (ej: https://tu-bot.onrender.com)

### PASO 4: Conecta webhook
En Meta Developers > Webhooks > Editar Callback URL:
URL: https://tu-bot.onrender.com/webhook
Verify Token: vellumaria123

¡Listo! Cada comentario será respondido automáticamente.

Para editar respuestas, solo cambia el objeto RESPUESTAS en server.js
