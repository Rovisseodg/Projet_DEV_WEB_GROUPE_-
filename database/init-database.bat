@echo off
REM 🗄️ MaMutuelle Database Initialization Script (Windows)
REM
REM Ce script initialise la base de données MaMutuelle simplement
REM
REM Usage:
REM   init-database.bat               (local - Docker)
REM   init-database.bat render        (Render - avec DATABASE_URL)
REM

setlocal enabledelayedexpansion

echo.
echo 🗄️  MaMutuelle Database Initialization
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Get environment from argument
set ENV=%1
if "%ENV%"=="" set ENV=local

if "%ENV%"=="render" (
    echo ⚠️  Mode Render
    echo.
    
    if "%DATABASE_URL%"=="" (
        echo ❌ ERROR: DATABASE_URL environment variable not set
        echo.
        echo Pour Render, définir la variable:
        echo   set DATABASE_URL=postgresql://user:password@host:5432/database
        exit /b 1
    )
    
    echo ✓ DATABASE_URL found
    echo.
    echo 📥 Executing SQL script...
    
    REM Use psql with DATABASE_URL
    psql %DATABASE_URL% -f database\database.sql
    
    if errorlevel 1 (
        echo.
        echo ❌ Error executing database script
        exit /b 1
    )
    
) else if "%ENV%"=="local" (
    echo ℹ️  Mode Local (Docker Compose)
    echo.
    
    where docker-compose >nul 2>&1
    if errorlevel 1 (
        echo ❌ ERROR: docker-compose not found
        echo Please install Docker Desktop
        exit /b 1
    )
    
    echo 📥 Executing SQL script in Docker...
    docker-compose exec -T db psql -U mamutuelle_user -d mamutuelle < database\database.sql
    
    if errorlevel 1 (
        echo.
        echo ❌ Error executing database script
        exit /b 1
    )
    
) else (
    echo ❌ Unknown environment: %ENV%
    echo.
    echo Usage:
    echo   init-database.bat         ^(local/Docker^)
    echo   init-database.bat render  ^(Render deployment^)
    exit /b 1
)

echo.
echo ✅ Database initialization complete!
echo.
echo 📊 Database ready!
echo.
echo 👤 Test accounts:
echo    Admin:     admin@mamutuelle.bf
echo    Agent:     agent@mamutuelle.bf
echo    Adherents: kone.oumar@email.bf, etc.
echo.
echo 📖 For more info: database\README.md
echo.
pause
