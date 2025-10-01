#!/bin/bash

echo "🚀 LMS Deployment Script for GoDaddy VPS"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install MongoDB
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start and enable MongoDB
print_status "Starting MongoDB..."
systemctl start mongod
systemctl enable mongod

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/lms
cd /var/www/lms

# Clone repository (replace with your repo URL)
print_status "Cloning repository..."
# git clone https://github.com/yourusername/your-lms-repo.git .

# Or if you're uploading files manually:
print_warning "Please upload your LMS files to /var/www/lms/"

# Set proper permissions
chown -R www-data:www-data /var/www/lms
chmod -R 755 /var/www/lms

# Backend setup
print_status "Setting up backend..."
cd /var/www/lms/backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Start backend with PM2
print_status "Starting backend with PM2..."
pm2 start src/app.js --name "lms-backend"
pm2 save
pm2 startup

# Frontend setup
print_status "Setting up frontend..."
cd /var/www/lms/frontend

# Install dependencies
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Copy build files to web directory
print_status "Copying build files..."
cp -r build/* /var/www/html/

# Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/lms << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (static files)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for live classes
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    systemctl restart nginx
    systemctl enable nginx
else
    print_error "Nginx configuration is invalid"
    exit 1
fi

# Setup firewall
print_status "Setting up firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Final status check
print_status "Checking services..."
systemctl is-active --quiet mongod && print_status "MongoDB: Running" || print_error "MongoDB: Not running"
systemctl is-active --quiet nginx && print_status "Nginx: Running" || print_error "Nginx: Not running"
pm2 list | grep lms-backend && print_status "Backend: Running" || print_error "Backend: Not running"

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Point your domain to this server's IP address"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Update frontend API calls to use your domain"
echo ""
echo "Your LMS should be accessible at: http://your-server-ip"
echo "Backend API: http://your-server-ip/api"
echo ""
echo "PM2 Commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs lms-backend - View backend logs"
echo "  pm2 restart lms-backend - Restart backend"
echo ""
echo "Nginx Commands:"
echo "  sudo nginx -t       - Test configuration"
echo "  sudo systemctl restart nginx - Restart Nginx"
echo ""
echo "MongoDB Commands:"
echo "  sudo systemctl status mongod - Check MongoDB status"
echo "  mongo               - Access MongoDB shell" 