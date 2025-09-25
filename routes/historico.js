const express = require('express');
const router = express.Router();
const { obtenerHistorico } = require('../db');

router.get('/', async (req, res) => {
  const decimales = parseInt(req.query.decimales) || 2;
  const historico = await obtenerHistorico();
  const formateado = historico.map(r => ({
    ...r,
    usd: parseFloat(r.usd).toFixed(decimales),
    eur: parseFloat(r.eur).toFixed(decimales)
  }));
  res.json(formateado);
});

module.exports = router;
