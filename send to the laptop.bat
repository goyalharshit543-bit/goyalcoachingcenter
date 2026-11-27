@echo off
title Goyal Coaching Center - Cloud and Laptop Two-Way Synchronizer
color 0b
cd /d "%~dp0"

echo ===============================================================================
echo          GOYAL COACHING CENTER - TWO-WAY RECORD SYNCHRONIZER
echo ===============================================================================
echo.
echo [1/3] Connecting to Cloud Website (https://goyalcoachingcenter-production.up.railway.app)...
echo [2/3] Performing smart two-way merge (respecting deletions & syncing new students)...
echo [3/3] Uploading laptop edits to website and regenerating Class_Organized_Records...
echo.

node scripts/sync.js
node scripts/clean_and_export.js

echo.
echo ===============================================================================
echo All student marks, registers, and online website databases are now in sync!
echo ===============================================================================
echo.
pause
