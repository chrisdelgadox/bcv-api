const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bcv.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usd REAL,
    eur REAL,
    fecha TEXT,
    hora TEXT
  )`);
});

function guardarValor(usd, eur) {
  const fecha = new Date().toISOString().split('T')[0];
  const hora = new Date().toISOString().split('T')[1].split('.')[0];
  db.run(`INSERT INTO historial (usd, eur, fecha, hora) VALUES (?, ?, ?, ?)`, [usd, eur, fecha, hora]);
}

function obtenerUltimoValor() {
  return new Promise((resolve, reject) => {
    db.get(`SELECT usd, eur, fecha, hora FROM historial ORDER BY id DESC LIMIT 1`, (err, row) => {
      if (err) reject(err);
      else resolve(row || {});
    });
  });
}

function obtenerHistorialHoy() {
  const hoy = new Date().toISOString().split('T')[0];
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM historial WHERE fecha = ?`, [hoy], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function obtenerHistorialCompleto() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM historial ORDER BY id DESC`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { guardarValor, obtenerUltimoValor, obtenerHistorialHoy, obtenerHistorialCompleto };