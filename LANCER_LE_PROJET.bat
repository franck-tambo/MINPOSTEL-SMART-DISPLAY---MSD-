@echo off
title MINPOSTEL SMART DISPLAY (MSD) - Launcher
color 0A

echo =========================================================================
echo               MINPOSTEL SMART DISPLAY (MSD) - DEMARRAGE
echo =========================================================================
echo.
echo Demarrage du serveur Backend et du client Frontend...
echo.

cd /d "%~dp0minpostel-smart-display"

:: Demarrer le serveur Backend (Port 5000) dans une fenetre
start "MSD - Serveur Backend (Port 5000)" cmd /k "npm --prefix server run dev"

:: Attendre 3 secondes
timeout /t 3 /nobreak >nul

:: Demarrer le client Frontend (Port 5173) dans une fenetre
start "MSD - Client Frontend (Port 5173)" cmd /k "npm --prefix client run dev"

:: Attendre 3 secondes et ouvrir le navigateur
timeout /t 3 /nobreak >nul

start http://localhost:5173/login

echo.
echo =========================================================================
echo [OK] Le projet est en cours d'execution !
echo.
echo - Panneau d'Administration : http://localhost:5173/login
echo   Identifiant : admin
echo   Mot de passe : admin123
echo.
echo - Ecran d'Affichage Kiosque : http://localhost:5173/display
echo - Guide Visiteur Mobile    : http://localhost:5173/visitor
echo =========================================================================
pause
