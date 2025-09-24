const puppeteer = require('puppeteer-core');
const { guardarValor } = require('./db');
const dayjs = require('dayjs');

async function actualizarValorBCV() {
  try {
    console.log('🟡 Iniciando scraping...');

    const browser = await puppeteer.launch({
      executablePath: '/opt/render/project/src/chrome-linux64/chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2' });

    const selectorUSD = '#dolar .field-content';
    const selectorEUR = '#euro .field-content';

    await page.waitForSelector(selectorUSD, { timeout: 5000 });
    await page.waitForSelector(selectorEUR, { timeout: 5000 });

    const valorUSD = await page.$eval(selectorUSD, el => el.textContent.trim());
    const valorEUR = await page.$eval(selectorEUR, el => el.textContent.trim());

    console.log('💵 USD extraído:', valorUSD);
    console.log('💶 EUR extraído:', valorEUR);

    guardarValor(valorUSD, valorEUR);

    console.log('✅ Valores guardados en la base de datos');
    await browser.close();
  } catch (error) {
    console.error('❌ Error en scraping:', error.message);
    throw error;
  }
}

module.exports = actualizarValorBCV;

if (require.main === module) {
  actualizarValorBCV();
}
