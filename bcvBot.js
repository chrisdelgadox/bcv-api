const puppeteer = require('puppeteer');
const { guardarValor, obtenerUltimoValor, obtenerHistorialHoy } = require('./db');

async function actualizarValorBCV() {
  console.log('Ejecutando scraping...');

  const hoy = await obtenerHistorialHoy();
  console.log('Consultas hoy:', hoy.length);
  if (hoy.length >= 6) return console.log('Límite diario alcanzado');

  const ultimo = await obtenerUltimoValor();
  const ahora = new Date();
  const ultimaHora = ultimo?.hora ? parseInt(ultimo.hora.split(':')[0]) : null;
  const diferenciaHoras = ultimaHora !== null ? ahora.getHours() - ultimaHora : null;
  if (diferenciaHoras !== null && diferenciaHoras < 3) return console.log('Debe esperar 3 horas entre consultas');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 Chrome/117.0.0.0 Safari/537.36');
  await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#dolar strong', { timeout: 5000 });
  await page.waitForSelector('#euro strong', { timeout: 5000 });

  const resultado = await page.evaluate(() => {
    const usd = document.querySelector('#dolar strong')?.textContent.trim();
    const eur = document.querySelector('#euro strong')?.textContent.trim();
    const fecha = document.querySelector('.date-display-single')?.textContent.trim();
    return { usd, eur, fecha };
  });

  await browser.close();

  if (!resultado.usd || !resultado.eur) return console.log('No se encontraron ambos valores');

  const valorUSD = parseFloat(parseFloat(resultado.usd.replace(',', '.')).toFixed(2));
  const valorEUR = parseFloat(parseFloat(resultado.eur.replace(',', '.')).toFixed(2));
  console.log('USD:', valorUSD, '| EUR:', valorEUR);

  if (!ultimo || valorUSD !== ultimo.usd || valorEUR !== ultimo.eur) {
    console.log('Guardando nuevos valores...');
    await guardarValor(valorUSD, valorEUR);
  } else {
    console.log('Valores no han cambiado');
  }
}

module.exports = actualizarValorBCV;