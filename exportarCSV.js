const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { obtenerHistorialCompleto } = require('./db');

(async () => {
  const datos = await obtenerHistorialCompleto();
  const csvWriter = createCsvWriter({
    path: 'historial_bcv.csv',
    header: [
      { id: 'fecha', title: 'Fecha' },
      { id: 'hora', title: 'Hora' },
      { id: 'usd', title: 'USD' },
      { id: 'eur', title: 'EUR' }
    ]
  });
  await csvWriter.writeRecords(datos);
  console.log('CSV exportado como historial_bcv.csv');
})();