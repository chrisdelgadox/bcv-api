const express = require('express');
const router = express.Router();
const actualizarValorBCV = require('../bcvBot');
const verificarToken = require('../middleware/verificarToken');

router.get('/', verificarToken, async (req, res) => {
  try {
    await actualizarValorBCV();
    res.json({ status: 'Scraping ejecutado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
