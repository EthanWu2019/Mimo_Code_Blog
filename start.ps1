$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  My Blog - Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Starting database services..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
& docker compose up -d
Write-Host "[OK] PostgreSQL and Redis running" -ForegroundColor Green

Write-Host "[2/3] Generating Prisma client..." -ForegroundColor Yellow
& npx prisma generate
Write-Host "[OK] Prisma client ready" -ForegroundColor Green

Write-Host "[3/3] Starting Next.js..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "  Blog:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

& npm run dev
