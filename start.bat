@echo off
cd /d "%~dp0"

echo ============================================
echo  CHWS Dashboard - Portable Launcher
echo ============================================
echo.

if not exist "frontend\node_modules" goto :build
if not exist "frontend\dist" goto :build
if not exist "backend\node_modules" goto :install

:start
echo [*] Starting server...
echo [*] Open http://localhost:5000 in your browser
echo [*] Press Ctrl+C to stop
echo.
cd backend
node src/index.js
pause
goto :eof

:install
echo [*] Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo [!] Installation failed
    pause
    exit /b 1
)

:build
if not exist "frontend\node_modules" (
    echo [*] Installing frontend dependencies...
    call npm run install:frontend
)
echo [*] Building frontend...
call npm run build:frontend
if %errorlevel% neq 0 (
    echo [!] Build failed
    pause
    exit /b 1
)
echo.
goto :start
