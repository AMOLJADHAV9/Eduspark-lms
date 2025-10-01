#!/bin/bash

echo "🚀 Quick LMS Deployment Script"
echo "==============================="

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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "All prerequisites are installed!"

# Step 1: Initialize Git repository
print_status "Step 1: Setting up Git repository..."

if [ ! -d ".git" ]; then
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Step 2: Add all files
print_status "Step 2: Adding files to Git..."
git add .

# Step 3: Commit changes
print_status "Step 3: Committing changes..."
git commit -m "Prepare for deployment" 2>/dev/null || git commit -m "Initial commit"

# Step 4: Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote repository configured."
    echo ""
    echo "Please create a GitHub repository and run:"
    echo "git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "git push -u origin main"
    echo ""
    echo "Then continue with the deployment steps below."
else
    print_status "Remote repository is configured"
    
    # Step 5: Push to GitHub
    print_status "Step 4: Pushing to GitHub..."
    git push origin main || {
        print_error "Failed to push to GitHub. Please check your remote configuration."
        exit 1
    }
    
    print_status "Successfully pushed to GitHub!"
fi

echo ""
echo "🎉 Repository setup completed!"
echo ""
echo "📋 Next Steps for Deployment:"
echo ""
echo "1. 🚀 Deploy on Railway (Recommended):"
echo "   - Go to https://railway.app"
echo "   - Sign up with GitHub"
echo "   - Click 'New Project' → 'Deploy from GitHub repo'"
echo "   - Select your repository"
echo "   - Add environment variables:"
echo "     NODE_ENV=production"
echo "     JWT_SECRET=your-secret-key"
echo "     MONGO_URI=your-mongodb-uri"
echo ""
echo "2. 🌐 Set up Custom Domain:"
echo "   - Buy domain from GoDaddy/Namecheap ($10-15/year)"
echo "   - In Railway dashboard: Settings → Domains"
echo "   - Add your custom domain"
echo "   - Configure DNS records as shown"
echo ""
echo "3. 🔧 Alternative: Render Deployment:"
echo "   - Go to https://render.com"
echo "   - Sign up with GitHub"
echo "   - Deploy backend: New → Web Service"
echo "   - Deploy frontend: New → Static Site"
echo ""
echo "📚 For detailed instructions, see SIMPLE_DEPLOYMENT_GUIDE.md"
echo ""
echo "🆘 Need help? Check the deployment guide or contact support." 