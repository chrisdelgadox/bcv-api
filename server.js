require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { generarToken, verificarToken } = require('./auth');
const { obtenerUltimoValor, obtenerHistorialCompleto } = require('./db');
const actualizarValorBCV = require('./bcvBot');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Login y token
app.post('/api/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (usuario === 'admin' && clave === 'bcv123') {
    const token = generarToken(usuario);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// 📈 Último valor con decimales
app.get('/api/usd-bcv', async (req, res) => {
  const decimales = parseInt(req.query.decimales) || 2;
  const valor = await obtenerUltimoValor();
  if (!valor) return res.status(404).json({ error: 'Sin datos disponibles' });

  res.json({
    usd: parseFloat(valor.usd).toFixed(decimales),
    eur: parseFloat(valor.eur).toFixed(decimales),
    fecha: valor.fecha
  });
});

// 🔄 Scraping protegido
app.get('/api/actualizar', verificarToken, async (req, res) => {
  try {
    await actualizarValorBCV();
    res.send('Scraping ejecutado y actualizado si hubo cambios');
  } catch {
    res.status(500).send('Error al ejecutar scraping');
  }
});

// 📊 Histórico con decimales
app.get('/api/historial', verificarToken, async (req, res) => {
  const decimales = parseInt(req.query.decimales) || 2;
  const historial = await obtenerHistorialCompleto();
  const formateado = historial.map(r => ({
    ...r,
    usd: parseFloat(r.usd).toFixed(decimales),
    eur: parseFloat(r.eur).toFixed(decimales)
  }));
  res.json(formateado);
});

// 📘 Documentación Swagger
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'swagger.json'));
});

// 🚀 Inicio
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API activa en http://localhost:${PORT}`);
});

