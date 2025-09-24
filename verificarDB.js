const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bcv.db');

db.all(`SELECT * FROM historial ORDER BY id DESC`, (err, rows) => {
  if (err) {
    console.error('Error al consultar la base de datos:', err);
  } else {
    console.log('Datos guardados:', rows);
  }
  db.close();
});
