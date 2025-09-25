const express = require('express');
const router = express.Router();
const { obtenerUltimoValor } = require('../db');

router.get('/', async (req, res) => {
  const decimales = parseInt(req.query.decimales) || 2;
  const { usd, eur, fecha } = await obtenerUltimoValor();
  res.json({
    usd: parseFloat(usd).toFixed(decimales),
    eur: parseFloat(eur).toFixed(decimales),
    fecha
  });
});

module.exports = router;
