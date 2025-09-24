require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generarToken, verificarToken } = require('./auth');
const { obtenerUltimoValor, obtenerHistorialCompleto } = require('./db');
const actualizarValorBCV = require('./bcvBot');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (usuario === 'admin' && clave === 'bcv123') {
    const token = generarToken(usuario);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

app.get('/api/usd-bcv', async (req, res) => {
  const valor = await obtenerUltimoValor();
  res.json(valor || {});
});

app.get('/api/actualizar', verificarToken, async (req, res) => {
  try {
    await actualizarValorBCV();
    res.send('Scraping ejecutado y actualizado si hubo cambios');
  } catch {
    res.status(500).send('Error al ejecutar scraping');
  }
});

app.get('/api/historial', verificarToken, async (req, res) => {
  const historial = await obtenerHistorialCompleto();
  res.json(historial);
});

app.listen(3000, () => {
  console.log('API activa en http://localhost:3000');
});