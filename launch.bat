@echo off
chcp 65001 > nul
title MAXI PLUS SARL - Lancement de la Plateforme
echo =====================================================================
echo                MAXI PLUS SARL - BTP ^& MAINTENANCE
echo             Plateforme Web, Vente de Pieces ^& Location
echo =====================================================================
echo.
echo Initialisation du serveur PHP local sur le port 8000...
echo.
echo URL Publique (Client) : http://127.0.0.1:8000/
echo URL Administration   : http://127.0.0.1:8000/admin/
echo Identifiants Admin   : admin@maxiplus.ci / admin123
echo.
echo Si XAMPP Apache est deja lance, vous pouvez aussi acceder via :
echo http://localhost/Maxi%%20Plus/
echo.
echo Ouverture automatique de votre navigateur...
start http://127.0.0.1:8000/
echo.
echo Le serveur est en cours d'execution. Fermez cette fenetre pour arreter.
"C:\xampp\php\php.exe" -S 127.0.0.1:8000
pause
