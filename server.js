import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'vellumaria123';

// CONFIGURA TUS RESPUESTAS AQUÍ - EDITA LIBRE
const RESPUESTAS = {
  precio: "Hola {nombre} ✨ Gracias por tu interés! Te mando los precios por DM para atenderte mejor 💌",
  info: "Hola {nombre}! Somos Vellumaria ✨ Horario: Lun-Sáb 10am-7pm. Envíos a todo México. ¿En qué te ayudo? 💫",
  defecto: "Gracias {nombre} por tu comentario! ✨ Nos encanta leerte 💜 Te escribimos por DM"
};

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (/(precio|costo|cuánto|cuanto|price|vale)/i.test(t)) return 'precio';
  if (/(info|horario|donde|dónde|ubicación|envio|envío)/i.test(t)) return 'info';
  return 'defecto';
}

// 1. Verificación webhook para Meta
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

// 2. Recibe comentarios
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'instagram' || body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          if (change.field === 'comments') {
            const commentId = change.value.id;
            const text = change.value.text || '';
            const username = change.value.from?.username || 'bella';
            
            const intencion = detectarIntencion(text);
            let respuesta = RESPUESTAS[intencion].replace('{nombre}', username);
            
            console.log(`💬 Comentario de ${username}: ${text} -> ${intencion}`);

            // Responder al comentario
            await axios.post(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
              message: respuesta
            }, {
              params: { access_token: PAGE_TOKEN }
            });
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => res.send('CommentBot Vellumaria está vivo ✨'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot corriendo en puerto ${PORT}`));