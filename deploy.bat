@echo off
echo 🚀 LMS Deployment Script
echo ========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm is installed

echo.
echo 📦 Backend Deployment
echo -------------------

cd backend

REM Install dependencies
echo Installing backend dependencies...
call npm install

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating .env.example...
    echo PORT=5000 > .env.example
    echo MONGO_URI=mongodb://localhost:27017/lms >> .env.example
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env.example
    echo NODE_ENV=development >> .env.example
    echo Please create a .env file with your production values
)

REM Test backend
echo Testing backend...
node test-start.js

cd ..

echo.
echo 📦 Frontend Deployment
echo -------------------

cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install

REM Build frontend
echo Building frontend...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Frontend build successful
) else (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

cd ..

echo.
echo 🎉 Deployment preparation completed!
echo.
echo Next steps:
echo 1. Set up your production environment variables
echo 2. Deploy backend to your hosting platform
echo 3. Deploy frontend build folder to your hosting platform
echo 4. Configure your domain and SSL certificates
echo.
echo For detailed instructions, see README.md
pause 