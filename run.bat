@echo off
echo ======================================================
echo   KHOI DONG DU AN CLEAN FOOD (SAAS VERSION 2026)
echo ======================================================

echo [1/2] Dang khoi dong Backend (Spring Boot)...
start "CleanFood Backend" cmd /k "cd cleanfood-server && mvn spring-boot:run"

echo [2/2] Dang khoi dong Frontend (React + Vite)...
start "CleanFood Frontend" cmd /k "cd cleanfood-client && npm run dev"

echo ======================================================
echo   HE THONG DANG DUOC KHOI TẠO TREN CAC CUA SO MOI
echo   Backend: http://localhost:8080
echo   Frontend: http://localhost:5173
echo ======================================================
pause
