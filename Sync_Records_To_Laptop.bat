@echo off
title Goyal Coaching Center - Cloud to Laptop Sync
cd /d "e:\goyal coaching center"
echo =======================================================
echo Pulling latest student admissions & records from Global Cloud...
echo =======================================================
node scripts/sync.js
echo.
pause
