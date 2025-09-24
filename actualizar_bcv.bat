@echo off
setlocal enabledelayedexpansion

:: Paso 1: Solicitar token
echo Solicitando token JWT...
curl -s -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"usuario\":\"admin\",\"clave\":\"bcv123\"}" > token.json

:: Paso 2: Extraer token limpio del JSON
for /f "tokens=2 delims=:," %%A in ('findstr "token" token.json') do (
    set "TOKEN=%%~A"
)

:: Limpiar comillas y llaves
set "TOKEN=!TOKEN:"=!"
set "TOKEN=!TOKEN:{=!"
set "TOKEN=!TOKEN:}=!"
set "TOKEN=!TOKEN: =!"


:: Paso 3: Ejecutar scraping con token
echo Ejecutando scraping con token: !TOKEN!
curl -s -H "Authorization: Bearer !TOKEN!" http://localhost:3000/api/actualizar

:: Paso 4: Mostrar último valor
echo Último valor guardado:
curl -s http://localhost:3000/api/usd-bcv

:: Limpieza
del token.json
endlocal
pause
echo Token limpio: !TOKEN!