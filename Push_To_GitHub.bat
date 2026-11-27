@echo off
title Push Goyal Coaching Center to GitHub
cd /d "%~dp0"
echo ========================================================
echo Staging and pushing latest updates to GitHub (goyalcoachingcenter)...
echo ========================================================
git add -A
git commit -m "Update marks ledger, student portal reports, excel sync registers, and sync workflows"
git push origin main
echo.
echo ========================================================
echo PUSH COMPLETE! All files are now synchronized to GitHub!
echo ========================================================
pause
