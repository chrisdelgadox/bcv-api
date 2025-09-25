const puppeteer = require('puppeteer-core');
const { guardarValor } = require('./db');
const dayjs = require('dayjs');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chromePath = '/tmp/chrome/chrome-linux64/chrome';

if (!fs.existsSync(chromePath)) {
  console.log('⬇️ Descargando Chrome en tiempo de ejecución...');
  execSync(`
    mkdir -p /tmp/chrome &&
    curl -o /tmp/chrome.zip https://storage.googleapis.com/chrome-for-testing-public/114.0.5735.90/linux64/chrome-linux64.zip &&
    unzip /tmp/chrome.zip -d /tmp/chrome &&
    chmod +x /tmp/chrome/chrome-linux64/chrome
  `, { stdio: 'inherit', shell: '/bin/bash' });
}

async function actualizarValorBCV() {
  try {
    console.log('🟡 Iniciando scraping...');
    console.log('🔍 Verificando existencia de Chrome en:', chromePath);

    // Verifica contenido del directorio
    console.log('📂 Archivos en /tmp/chrome:', fs.readdirSync('/tmp/chrome'));
    console.log('📂 Archivos en /tmp/chrome/chrome-linux64:', fs.readdirSync('/tmp/chrome/chrome-linux64'));

    // Verifica permisos del binario
    console.log('🔒 Permisos de Chrome:', execSync(`ls -l ${chromePath}`).toString());

    // Verifica ejecutabilidad
    try {
      const versionOutput = execSync(`${chromePath} --version`, { stdio: 'pipe' }).toString();
      console.log('✅ Chrome ejecutable:', versionOutput.trim());
    } catch (err) {
      console.error('❌ Chrome no se puede ejecutar:', err.message);
      throw err;
    }

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 10000
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    console.log('🌐 Navegando a BCV...');
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2', timeout: 15000 });

    const selectorUSD = '#dolar .field-content';
    const selectorEUR = '#euro .field-content';

    console.log('🔎 Esperando selector USD...');
    await page.waitForSelector(selectorUSD, { timeout: 5000 });

    console.log('🔎 Esperando selector EUR...');
    await page.waitForSelector(selectorEUR, { timeout: 5000 });

    console.log('📤 Extrayendo valores...');
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
