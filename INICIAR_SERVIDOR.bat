@echo off
echo ========================================
echo    SMARTTRASH - INICIANDO SERVIDOR
echo ========================================
echo.
echo 🚀 Iniciando servidor Flask...
echo 🌐 Servidor rodará em: http://localhost:5000
echo 📱 Abra login.html no navegador
echo.
echo ⚠️  Para parar: pressione Ctrl+C
echo ========================================
echo.

cd /d "%~dp0"
python api_example.py

pause
