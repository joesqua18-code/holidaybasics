@echo off
REM Holiday Basics Order App - Simple Server Startup Script for Windows

echo ================================
echo Holiday Basics Order App Server
echo ================================
echo.
echo Starting Python HTTP server...
echo.

REM Change to the directory where this script is located
cd /d "%~dp0"

REM Start the Python HTTP server
python -m http.server 8000

REM These lines won't print until the server stops
echo.
echo Server stopped.
echo.
pause
