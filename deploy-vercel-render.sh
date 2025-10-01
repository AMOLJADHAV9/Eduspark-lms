#!/bin/bash

echo "🚀 Vercel + Render Deployment Script"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "All prerequisites are installed!"

# Step 1: Test builds
print_status "Step 1: Testing builds..."

# Test backend build
print_status "Testing backend build..."
cd backend
if npm install; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Backend build failed"
    exit 1
fi
cd ..

# Test frontend build
print_status "Testing frontend build..."
cd frontend
if npm install && npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Step 2: Git setup
print_status "Step 2: Setting up Git repository..."

if [ ! -d ".git" ]; then
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel + Render deployment" 2>/dev/null || git commit -m "Initial commit"

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote repository configured."
    echo ""
    echo "Please create a GitHub repository and run:"
    echo "git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "git push -u origin main"
    echo ""
else
    print_status "Remote repository is configured"
    
    # Push to GitHub
    print_status "Pushing to GitHub..."
    git push origin main || {
        print_error "Failed to push to GitHub. Please check your remote configuration."
        exit 1
    }
    
    print_status "Successfully pushed to GitHub!"
fi

echo ""
echo "🎉 Repository setup completed!"
echo ""
echo "📋 Next Steps for Vercel + Render Deployment:"
echo ""
echo "1. 🚀 Deploy Backend on Render:"
echo "   - Go to https://render.com"
echo "   - Sign up with GitHub"
echo "   - Click 'New' → 'Web Service'"
echo "   - Connect your repository"
echo "   - Configure:"
echo "     Name: lms-backend"
echo "     Build Command: cd backend && npm install"
echo "     Start Command: cd backend && npm start"
echo "   - Add Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT=10000"
echo "     JWT_SECRET=your-secret-key"
echo "     MONGO_URI=your-mongodb-uri"
echo ""
echo "2. ⚡ Deploy Frontend on Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Click 'New Project'"
echo "   - Import your repository"
echo "   - Configure:"
echo "     Framework Preset: Create React App"
echo "     Root Directory: frontend"
echo "     Build Command: npm run build"
echo "     Output Directory: build"
echo "   - Add Environment Variable:"
echo "     REACT_APP_API_URL=https://your-backend-url.onrender.com"
echo ""
echo "3. 🌐 Set up Custom Domains:"
echo "   - Buy domain ($10-15/year)"
echo "   - Configure DNS records"
echo "   - Add domains in both Vercel and Render dashboards"
echo ""
echo "4. 🔧 Configure CORS:"
echo "   - Update backend CORS settings"
echo "   - Redeploy backend"
echo ""
echo "📚 For detailed instructions, see VERCEL_RENDER_DEPLOYMENT.md"
echo ""
echo "🆘 Need help? Check the deployment guide or contact support." 