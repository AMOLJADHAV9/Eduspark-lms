@echo off
echo 🚀 Vercel + Render Deployment Script
echo ====================================

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] All prerequisites are installed!

REM Step 1: Test builds
echo.
echo [INFO] Step 1: Testing builds...

REM Test backend build
echo [INFO] Testing backend build...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed
    pause
    exit /b 1
)
echo [INFO] Backend dependencies installed successfully
cd ..

REM Test frontend build
echo [INFO] Testing frontend build...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependencies installation failed
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
echo [INFO] Frontend build successful
cd ..

REM Step 2: Git setup
echo.
echo [INFO] Step 2: Setting up Git repository...

REM Check if git repository exists
if not exist .git (
    git init
    echo [INFO] Git repository initialized
) else (
    echo [INFO] Git repository already exists
)

REM Add all files
git add .

REM Commit changes
git commit -m "Prepare for Vercel + Render deployment" 2>nul
if %errorlevel% neq 0 (
    git commit -m "Initial commit"
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] No remote repository configured.
    echo.
    echo Please create a GitHub repository and run:
    echo git remote add origin https://github.com/yourusername/your-repo-name.git
    echo git push -u origin main
    echo.
) else (
    echo [INFO] Remote repository is configured
    
    REM Push to GitHub
    echo [INFO] Pushing to GitHub...
    git push origin main
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to push to GitHub. Please check your remote configuration.
        pause
        exit /b 1
    )
    
    echo [INFO] Successfully pushed to GitHub!
)

echo.
echo 🎉 Repository setup completed!
echo.
echo 📋 Next Steps for Vercel + Render Deployment:
echo.
echo 1. 🚀 Deploy Backend on Render:
echo    - Go to https://render.com
echo    - Sign up with GitHub
echo    - Click 'New' → 'Web Service'
echo    - Connect your repository
echo    - Configure:
echo      Name: lms-backend
echo      Build Command: cd backend && npm install
echo      Start Command: cd backend && npm start
echo    - Add Environment Variables:
echo      NODE_ENV=production
echo      PORT=10000
echo      JWT_SECRET=your-secret-key
echo      MONGO_URI=your-mongodb-uri
echo.
echo 2. ⚡ Deploy Frontend on Vercel:
echo    - Go to https://vercel.com
echo    - Sign up with GitHub
echo    - Click 'New Project'
echo    - Import your repository
echo    - Configure:
echo      Framework Preset: Create React App
echo      Root Directory: frontend
echo      Build Command: npm run build
echo      Output Directory: build
echo    - Add Environment Variable:
echo      REACT_APP_API_URL=https://your-backend-url.onrender.com
echo.
echo 3. 🌐 Set up Custom Domains:
echo    - Buy domain ($10-15/year)
echo    - Configure DNS records
echo    - Add domains in both Vercel and Render dashboards
echo.
echo 4. 🔧 Configure CORS:
echo    - Update backend CORS settings
echo    - Redeploy backend
echo.
echo 📚 For detailed instructions, see VERCEL_RENDER_DEPLOYMENT.md
echo.
echo 🆘 Need help? Check the deployment guide or contact support.
pause 