@echo off
echo ========================================
echo   My Blog - Startup Script
echo ========================================
echo.

echo [1/3] Starting database services...
docker compose up -d
echo [OK] PostgreSQL and Redis running

echo [2/3] Generating Prisma client...
call npx prisma generate
echo [OK] Prisma client ready

echo [3/3] Starting Next.js dev server...
echo.
echo ========================================
echo   All services started!
echo   Blog:    http://localhost:3000
echo   Admin:   http://localhost:3000/admin
echo   Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
