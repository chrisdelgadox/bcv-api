@echo off
setlocal enabledelayedexpansion

:: Paso 1: Login y obtener token
for /f "delims=" %%A in ('curl -k -s -X POST https://bcv-api-p7g0.onrender.com/api/login -H "Content-Type: application/json" -d "{\"usuario\":\"admin\",\"clave\":\"bcv123\"}"') do (
    set "response=%%A"
)

:: Paso 2: Extraer token del JSON
for /f "tokens=2 delims=:}" %%B in ("!response!") do (
    set "token=%%B"
)

:: Limpieza de espacios y comillas
set "token=!token:~1!"
set "token=!token:"=!"

:: Paso 3: Ejecutar /api/actualizar con el token
echo Usando token: !token!
curl -k -s https://bcv-api-p7g0.onrender.com/api/actualizar -H "Authorization: Bearer !token!"

endlocal
pause
