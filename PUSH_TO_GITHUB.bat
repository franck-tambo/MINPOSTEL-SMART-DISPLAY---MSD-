@echo off
title MSD - Publication vers GitHub
color 0b
echo =======================================================
echo    MINPOSTEL SMART DISPLAY - SYNCHRONISATION GITHUB
echo =======================================================
echo.
echo Depot distant : https://github.com/franck-tambo/MINPOSTEL-SMART-DISPLAY---MSD-.git
echo Branche       : main
echo.
echo Envoi en cours vers GitHub...
echo NOTE : Si une boite de dialogue "Git Credential Manager" s'ouvre,
echo cliquez simplement sur "Sign in with your browser" pour vous connecter a votre compte.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    color 0a
    echo =======================================================
    echo  [SUCCES] Projet publie sur GitHub avec succes !
    echo  Consultez votre repo : https://github.com/franck-tambo/MINPOSTEL-SMART-DISPLAY---MSD-
    echo =======================================================
) else (
    color 0c
    echo =======================================================
    echo  [ATTENTION] L'envoi a necessite une authentification ou a ete annule.
    echo  Vous pouvez reessayer ou utiliser un Token GitHub (PAT).
    echo =======================================================
)
echo.
pause
