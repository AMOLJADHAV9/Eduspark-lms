#!/bin/bash

echo "🚀 LMS Deployment Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"

# Backend deployment
echo ""
echo "📦 Backend Deployment"
echo "-------------------"

cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating .env.example..."
    echo "PORT=5000" > .env.example
    echo "MONGO_URI=mongodb://localhost:27017/lms" >> .env.example
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env.example
    echo "NODE_ENV=development" >> .env.example
    echo "Please create a .env file with your production values"
fi

# Test backend
echo "Testing backend..."
node test-start.js

cd ..

# Frontend deployment
echo ""
echo "📦 Frontend Deployment"
echo "-------------------"

cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Set up your production environment variables"
echo "2. Deploy backend to your hosting platform"
echo "3. Deploy frontend build folder to your hosting platform"
echo "4. Configure your domain and SSL certificates"
echo ""
echo "For detailed instructions, see README.md" 