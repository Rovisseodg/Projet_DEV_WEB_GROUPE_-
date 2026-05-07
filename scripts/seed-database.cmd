@echo off

echo ============================================================
echo MaMutuelle Database Seeding (Windows)
echo ============================================================

if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable not set.
    echo Please set it before running this script.
    exit /b 1
)

echo.
echo Seeding database from database\seed-data.sql...
psql "%DATABASE_URL%" -f database\seed-data.sql

if errorlevel 1 (
    echo.
    echo ❌ Database seeding failed.
    exit /b 1
)

necho.
echo ✅ Database seeding completed successfully!
echo Test accounts: admin@mamutuelle.bf / password123
exit /b 0
