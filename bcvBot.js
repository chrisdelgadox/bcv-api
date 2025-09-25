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

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--disable-features=site-per-process',
        '--disable-features=TranslateUI',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-sync-types',
        '--disable-web-resources',
        '--disable-notifications',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-device-discovery-notifications',
        '--disable-crash-reporter',
        '--disable-in-process-stack-traces',
        '--disable-logging',
        '--disable-permissions-api',
        '--disable-remote-fonts',
        '--disable-web-security',
        '--disable-site-isolation-trials',
        '--disable-blink-features=AutomationControlled'
      ],
      timeout: 15000
    });
    console.log('🚀 Puppeteer lanzado correctamente');
    console.log('🧪 Tipo de browser:', typeof browser);

    const page = await browser.newPage();
    console.log('🧪 Creando nueva página...');
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36');

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

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
      valorUSD = await page.$eval(selectorUSD, el => el.textContent.trim());
      console.log('💵 USD extraído:', valorUSD);
    } catch (err) {
      console.error('❌ No se pudo extraer USD:', err.message);
    }

    try {
      valorEUR = await page.$eval(selectorEUR, el => el.textContent.trim());
      console.log('💶 EUR extraído:', valorEUR);
    } catch (err) {
      console.error('❌ No se pudo extraer EUR:', err.message);
    }

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
