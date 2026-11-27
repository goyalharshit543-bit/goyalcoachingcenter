@echo off
title Goyal Coaching Center - Open In Chrome
color 0a

echo =====================================================================
echo          GOYAL COACHING CENTER - ONE-CLICK CHROME LAUNCHER
echo =====================================================================
echo.
echo [1/3] Ensuring ports 5000 and 5173 are free...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Starting backend server and frontend application...
echo.
echo [3/3] Launching Google Chrome at http://localhost:5173 ...
echo.
echo =====================================================================
echo NOTE: Keep this window open while using Goyal Coaching Center.
echo If Chrome does not open automatically, browse to: http://localhost:5173
echo =====================================================================
echo.

:: Automatically launch Chrome in 3 seconds once dev server binds
start "" cmd /c "timeout /t 3 /nobreak >nul && (if exist ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else if exist ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else (start http://localhost:5173))"

cd /d "%~dp0"
npm run dev
pause
