@echo off
REM Script pour ajouter les données de test supplémentaires (Windows)
REM Usage: add-test-data.bat [mysql|pgsql]

if "%1"=="" (
    set DB_TYPE=mysql
) else (
    set DB_TYPE=%1
)

echo === Ajout des donnees de test supplementaires ===
echo Base de donnees: %DB_TYPE%
echo.

if "%DB_TYPE%"=="mysql" (
    echo Connexion MySQL...
    echo Veuillez entrer vos identifiants MySQL:
    mysql -u root -p < database\test-data-additional.sql

) else if "%DB_TYPE%"=="pgsql" (
    echo Connexion PostgreSQL...
    echo Veuillez entrer vos identifiants PostgreSQL:
    psql -U postgres -d mamutuelle -f database\test-data-additional.sql

) else (
    echo Usage: %0 [mysql^|pgsql]
    echo Exemple: %0 mysql
    goto :error
)

if %errorlevel% equ 0 (
    echo.
    echo ^✅ Donnees de test ajoutees avec succes!
    echo.
    echo 📊 Statistiques ajoutees:
    echo    • 10 nouveaux adherents
    echo    • 25 nouvelles cotisations
    echo    • 10 nouveaux prets
    echo    • 10 nouveaux sinistres
    echo    • 9 nouvelles alertes
    echo.
    echo 📋 Comptes de test disponibles dans README-test-data.md
) else (
    echo.
    echo ❌ Erreur lors de l'ajout des donnees
    goto :error
)

goto :end

:error
exit /b 1

:end