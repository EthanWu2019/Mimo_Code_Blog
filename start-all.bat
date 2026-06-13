@echo off
chcp 65001 >nul
echo ========================================
echo   Ethan's Blog - One-Click Startup
echo ========================================
echo.

echo [1/7] Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo Waiting for Docker to be ready...
:wait_loop
timeout /t 5 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker not ready yet, waiting...
    goto wait_loop
)
echo [OK] Docker Desktop started
echo.

echo [2/7] Starting Docker services (PostgreSQL + Redis)...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker services
    pause
    exit /b 1
)
echo [OK] Docker services started
echo.

echo [3/7] Waiting for database to be ready...
timeout /t 3 /nobreak >nul
echo [OK] Database ready
echo.

echo [4/7] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [5/7] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma generate failed
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo [6/7] Syncing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [WARNING] Database sync had issues, but continuing...
)
echo [OK] Database schema synced
echo.

echo [7/7] Cleaning cache and starting Next.js...
if exist ".next" (
    rmdir /s /q .next
    echo [OK] Cleaned .next cache
)
echo.

echo ========================================
echo   All services started!
echo   Blog:  http://localhost:3000
echo   Admin: http://localhost:3000/admin
echo.
echo   Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
