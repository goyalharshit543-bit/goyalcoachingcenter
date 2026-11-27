@echo off
title Goyal Coaching Center - Permanent Port Launcher (5173 & 5000)
color 0b

echo =====================================================================
echo          GOYAL COACHING CENTER - PERMANENT LAUNCHER
echo =====================================================================
echo.
echo [1/3] Checking and clearing any lingering processes on ports 5173 & 5000...

:: Free port 5000 if held by previous session or stale background task
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Freeing occupied port 5000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Free port 5173 if held by previous session or stale background task
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Freeing occupied port 5173 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Verified ports 5000 and 5173 are clean and ready.
echo.
echo [3/3] Starting Goyal Coaching Center:
echo       - Main Website / Student Portal: http://localhost:5173
echo       - Backend API & Records Server: http://localhost:5000
echo.
echo Opening Google Chrome automatically in 3 seconds...
echo Please leave this window open while using the coaching center.
echo =====================================================================
echo.

:: Automatically open Google Chrome (or default browser) in 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && (if exist ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else if exist ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else (start http://localhost:5173))"

cd /d "%~dp0"
npm run dev
pause
