# BCV API 🇻🇪

API ligera y segura para consultar el valor del dólar (USD) y euro (EUR) según el Banco Central de Venezuela (BCV), con scraping automatizado, autenticación JWT y almacenamiento en SQLite.

---

## 🚀 Características

- Scraping inteligente desde [bcv.org.ve](https://www.bcv.org.ve)
- Control de frecuencia: máximo 6 consultas diarias, cada 3 horas
- Autenticación segura con JWT
- Base de datos SQLite con historial
- Exportación a CSV


---

## 🧱 Requisitos

- Node.js 18+
- Git
-Render

---

## ⚙️ Instalación local

```bash
git clone https://github.com/chrisdelgadox/bcv-api.git
cd bcv-api
npm install
