@echo off
title Goyal Coaching Center - ALL_RUN Master Orchestrator
color 0b

echo ===============================================================================
echo          GOYAL COACHING CENTER - ALL_RUN MASTER SYSTEM LAUNCHER
echo ===============================================================================
echo.
cd /d "%~dp0"

echo [STEP 1/5] Freeing ports 5000 and 5173 to ensure permanent port binding...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo          - Ports 5000 and 5173 are clean and ready.
echo.

echo [STEP 2/5] Pulling latest admissions and student registrations from cloud...
node scripts/sync.js
echo.

echo [STEP 3/5] Organizing all website data into Class - Subject - Student folders...
node scripts/exportClassHierarchies.js
echo.

echo [STEP 4/5] Starting Public ngrok Tunnel (Port 5000 & 5173)...
if exist "ngrok.exe" (
    start "Goyal Coaching Center - ngrok Tunnel" ngrok.exe http 5000
    echo          - ngrok tunnel started in separate console window!
) else (
    echo          - ngrok.exe not found in root, skipping tunnel startup.
)
echo.

echo [STEP 5/5] Launching Goyal Coaching Center Application (Permanent Ports)...
echo          - Main Website / Student Portal: http://localhost:5173
echo          - Backend API & Records Server: http://localhost:5000
echo          - Organized Records Folder: %~dp0Class_Organized_Records
echo.
echo Opening Google Chrome automatically in 3 seconds...
echo ===============================================================================
echo.

:: Automatically open Google Chrome (or default browser) in 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && (if exist ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else if exist ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" (start """" ""%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"" http://localhost:5173) else (start http://localhost:5173))"

npm run dev
pause
