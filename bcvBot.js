const { chromium } = require('playwright-core');
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
    console.log('🟡 Iniciando scraping con Playwright...');
    console.log('🔍 Verificando existencia de Chrome en:', chromePath);

    console.log('📂 Archivos en /tmp/chrome:', fs.readdirSync('/tmp/chrome'));
    console.log('📂 Archivos en /tmp/chrome/chrome-linux64:', fs.readdirSync('/tmp/chrome/chrome-linux64'));
    console.log('🔒 Permisos de Chrome:', execSync(`ls -l ${chromePath}`).toString());

    try {
      const versionOutput = execSync(`${chromePath} --version`, { stdio: 'pipe' }).toString();
      console.log('✅ Chrome ejecutable:', versionOutput.trim());
    } catch (err) {
      console.error('❌ Chrome no se puede ejecutar:', err.message);
      throw err;
    }

    const browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox']
    });
    console.log('🚀 Playwright lanzó Chromium correctamente');

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    console.log('🧪 Página creada');

    console.log('🌐 Navegando a BCV...');
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('✅ Página cargada');

    await page.screenshot({ path: '/tmp/bcv.png' });
    console.log('📸 Captura de pantalla guardada');

    const selectorUSD = '#dolar .field-content';
    const selectorEUR = '#euro .field-content';

    console.log('🔎 Esperando selector USD...');
    await page.waitForSelector(selectorUSD, { timeout: 5000 });
    console.log('✅ Selector USD encontrado');

    console.log('🔎 Esperando selector EUR...');
    await page.waitForSelector(selectorEUR, { timeout: 5000 });
    console.log('✅ Selector EUR encontrado');

    console.log('📤 Extrayendo valores...');
    let valorUSD = 'N/A';
    let valorEUR = 'N/A';

    try {
      valorUSD = await page.$eval(selectorUSD, el =>
        el.textContent.replace(/[^\d.,]/g, '').trim()
      );
      console.log('💵 USD limpio:', valorUSD);
    } catch (err) {
      console.error('❌ No se pudo extraer USD:', err.message);
    }

    try {
      valorEUR = await page.$eval(selectorEUR, el =>
        el.textContent.replace(/[^\d.,]/g, '').trim()
      );
      console.log('💶 EUR limpio:', valorEUR);
    } catch (err) {
      console.error('❌ No se pudo extraer EUR:', err.message);
    }

    // Validación final
    const usdValido = valorUSD && !isNaN(parseFloat(valorUSD.replace(',', '.')));
    const eurValido = valorEUR && !isNaN(parseFloat(valorEUR.replace(',', '.')));

    if (usdValido && eurValido) {
      guardarValor(valorUSD, valorEUR);
      console.log('✅ Valores guardados en la base de datos');
    } else {
      console.warn('⚠️ Valores inválidos detectados, no se guardarán');
    }

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
