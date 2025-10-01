# 🚀 Simple LMS Deployment Guide

## 🎯 **Recommended: Railway (All-in-One Solution)**

### **Why Railway?**
- ✅ Deploys both frontend and backend automatically
- ✅ Free tier with 500 hours/month
- ✅ Built-in MongoDB database
- ✅ Custom domain support
- ✅ SSL certificates included
- ✅ No server management
- ✅ Automatic deployments from GitHub

---

## 📋 **Step 1: Prepare Your Repository**

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-lms-repo.git
git push -u origin main
```

### 1.2 Update Frontend API Configuration
Edit `frontend/src/context/AuthContext.js` to use environment variables:

```javascript
// Add this at the top of the file
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Update all fetch calls to use API_BASE_URL
// Example: fetch('/api/auth/login') becomes fetch(`${API_BASE_URL}/api/auth/login`)
```

---

## 🚀 **Step 2: Deploy on Railway**

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### 2.2 Deploy from GitHub
1. Select "Deploy from GitHub repo"
2. Choose your LMS repository
3. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
In Railway dashboard, go to "Variables" tab and add:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
```

### 2.4 Add MongoDB Database
1. In Railway dashboard, click "New"
2. Select "Database" → "MongoDB"
3. Copy the connection string to your `MONGO_URI` variable

### 2.5 Deploy Frontend
1. In Railway dashboard, click "New"
2. Select "GitHub Repo"
3. Choose the same repository
4. Set build command: `cd frontend && npm install && npm run build`
5. Set start command: `cd frontend && npx serve -s build -l 3000`

---

## 🌐 **Step 3: Set Up Custom Domain**

### 3.1 Buy Domain (if needed)
- **GoDaddy**: $10-15/year
- **Namecheap**: $8-12/year
- **Google Domains**: $12/year

### 3.2 Configure Domain in Railway
1. In Railway dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Railway will provide DNS records to configure

### 3.3 Configure DNS Records
In your domain provider's DNS settings, add:

```
Type: CNAME
Name: @
Value: your-railway-app.railway.app

Type: CNAME  
Name: www
Value: your-railway-app.railway.app
```

---

## 🔧 **Alternative: Render Deployment**

### Step 1: Deploy Backend on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: lms-backend
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     JWT_SECRET=your-secret-key
     MONGO_URI=your-mongodb-uri
     ```

### Step 2: Deploy Frontend on Render
1. Click "New" → "Static Site"
2. Connect your repository
3. Configure:
   - **Name**: lms-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     ```

---

## 📱 **Step 4: Test Your Deployment**

### 4.1 Health Check
Visit your backend URL + `/api/health`
Example: `https://your-app.railway.app/api/health`

### 4.2 Test Frontend
Visit your frontend URL and test:
- ✅ User registration
- ✅ User login
- ✅ Course creation
- ✅ Live classes

### 4.3 Common Issues & Solutions

**Issue**: Frontend can't connect to backend
**Solution**: Check `REACT_APP_API_URL` environment variable

**Issue**: Database connection failed
**Solution**: Verify `MONGO_URI` is correct

**Issue**: JWT errors
**Solution**: Ensure `JWT_SECRET` is set

---

## 🔒 **Step 5: Security & Monitoring**

### 5.1 Environment Variables
Never commit sensitive data:
- ✅ JWT_SECRET
- ✅ MONGO_URI
- ✅ API keys

### 5.2 SSL Certificate
Railway/Render provide automatic SSL certificates

### 5.3 Monitoring
- Railway/Render provide built-in monitoring
- Check logs in dashboard
- Set up uptime monitoring

---

## 💰 **Cost Breakdown**

### Railway (Recommended)
- **Free Tier**: 500 hours/month
- **Paid Tier**: $5/month for unlimited
- **Domain**: $10-15/year
- **Total**: $10-15/year (free tier) or $65-70/year (paid)

### Render Alternative
- **Free Tier**: Available
- **Paid Tier**: $7/month
- **Domain**: $10-15/year
- **Total**: $10-15/year (free tier) or $99/year (paid)

---

## 🎉 **Success Checklist**

- [ ] Repository pushed to GitHub
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Database connected
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] All features tested
- [ ] Environment variables set
- [ ] Monitoring configured

---

## 🆘 **Need Help?**

### Railway Support
- Documentation: [docs.railway.app](https://docs.railway.app)
- Discord: [discord.gg/railway](https://discord.gg/railway)

### Render Support
- Documentation: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)

### Common Commands
```bash
# Check deployment status
railway status

# View logs
railway logs

# Update environment variables
railway variables set KEY=value

# Redeploy
railway up
```

---

**🎯 Recommendation**: Start with Railway for the easiest deployment experience! 