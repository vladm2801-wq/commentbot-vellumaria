import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// LOG DE TODO LO QUE LLEGA
app.use((req,res,next)=>{
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'vellumaria123';

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

app.get('/webhook', (req, res) => {
  console.log(`🔍 VERIFICACIÓN: token recibido=${req.query['hub.verify_token']} esperado=${VERIFY_TOKEN}`);
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('✅ VERIFICACIÓN EXITOSA');
    return res.send(req.query['hub.challenge']);
  }
  console.log('❌ TOKEN NO COINCIDE');
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📦 BODY WEBHOOK:', JSON.stringify(req.body).substring(0,500));
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
            await axios.post(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
              message: respuesta
            }, { params: { access_token: PAGE_TOKEN } });
            console.log(`✅ Respondido a ${commentId}`);
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('❌ ERROR:', e.response?.data || e.message);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => res.send('CommentBot Vellumaria está vivo ✨'));
app.get('/privacy', (req,res)=> res.send('<h1>Privacy Policy Vellumaria Bot</h1><p>No guardamos datos. Solo responde comentarios.</p>'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bot corriendo en puerto ${PORT}`));
