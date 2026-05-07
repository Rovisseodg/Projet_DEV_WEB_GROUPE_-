Write-Host "============================================================="
Write-Host "MaMutuelle Database Seeding (PowerShell)"
Write-Host "============================================================="

if (-not $env:DATABASE_URL) {
    Write-Error "ERROR: DATABASE_URL environment variable not set."
    exit 1
}

Write-Host "Seeding database from database/seed-data.sql..."
& psql $env:DATABASE_URL -f "database/seed-data.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Database seeding failed."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✅ Database seeding completed successfully!"
Write-Host "Test accounts: admin@mamutuelle.bf / password123"
