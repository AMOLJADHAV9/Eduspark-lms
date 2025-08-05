# 🚀 Vercel + Render Deployment Guide

## 🎯 **Why Vercel + Render?**

### **Vercel (Frontend)**
- ✅ Optimized for React applications
- ✅ Automatic deployments from GitHub
- ✅ Global CDN for fast loading
- ✅ Free tier with generous limits
- ✅ Custom domain support
- ✅ SSL certificates included
- ✅ Preview deployments for testing

### **Render (Backend)**
- ✅ Excellent Node.js support
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Built-in MongoDB support
- ✅ Custom domain support
- ✅ SSL certificates included
- ✅ Easy environment variable management

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
The API utility is already configured in `frontend/src/utils/api.js` to use environment variables.

---

## 🚀 **Step 2: Deploy Backend on Render**

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"

### 2.2 Connect Repository
1. Select "Connect a repository"
2. Choose your LMS repository
3. Click "Connect"

### 2.3 Configure Backend Service
Fill in the configuration:

**Basic Settings:**
- **Name**: `lms-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (will use root)

**Build & Deploy:**
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

**Environment Variables:**
Click "Advanced" → "Add Environment Variable" and add:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
MONGO_URI=your-mongodb-connection-string
```

### 2.4 Add MongoDB Database
1. In Render dashboard, click "New"
2. Select "Redis" → "MongoDB"
3. Choose "Free" plan
4. Name it `lms-database`
5. Copy the connection string
6. Update your `MONGO_URI` environment variable

### 2.5 Deploy Backend
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete
4. Note your backend URL: `https://lms-backend.onrender.com`

---

## ⚡ **Step 3: Deploy Frontend on Vercel**

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"

### 3.2 Import Repository
1. Select "Import Git Repository"
2. Choose your LMS repository
3. Click "Import"

### 3.3 Configure Frontend Project
Fill in the configuration:

**Project Settings:**
- **Project Name**: `lms-frontend`
- **Framework Preset**: `Create React App`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

**Environment Variables:**
Click "Environment Variables" and add:

```env
REACT_APP_API_URL=https://lms-backend.onrender.com
```

### 3.4 Deploy Frontend
1. Click "Deploy"
2. Vercel will automatically build and deploy
3. Wait for deployment to complete
4. Note your frontend URL: `https://lms-frontend.vercel.app`

---

## 🌐 **Step 4: Set Up Custom Domains**

### 4.1 Buy Domain (if needed)
- **GoDaddy**: $10-15/year
- **Namecheap**: $8-12/year
- **Google Domains**: $12/year

### 4.2 Configure Backend Domain (Render)
1. In Render dashboard, go to your backend service
2. Click "Settings" → "Custom Domains"
3. Add your domain: `api.yourdomain.com`
4. Configure DNS records as shown

### 4.3 Configure Frontend Domain (Vercel)
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain: `yourdomain.com`
4. Configure DNS records as shown

### 4.4 DNS Configuration
In your domain provider's DNS settings, add:

**For Frontend (Vercel):**
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Backend (Render):**
```
Type: CNAME
Name: api
Value: your-backend-service.onrender.com
```

### 4.5 Update Environment Variables
After setting up domains, update your frontend environment variable:

```env
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 🔧 **Step 5: Configure CORS**

### 5.1 Update Backend CORS Settings
In your backend `app.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://lms-frontend.vercel.app',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

### 5.2 Redeploy Backend
After updating CORS, redeploy your backend on Render.

---

## 📱 **Step 6: Test Your Deployment**

### 6.1 Health Check
Visit your backend URL + `/api/health`
Example: `https://api.yourdomain.com/api/health`

### 6.2 Test Frontend
Visit your frontend URL and test:
- ✅ User registration
- ✅ User login
- ✅ Course creation
- ✅ Live classes

### 6.3 Common Issues & Solutions

**Issue**: Frontend can't connect to backend
**Solution**: 
1. Check `REACT_APP_API_URL` environment variable
2. Verify CORS configuration
3. Check backend is running

**Issue**: CORS errors
**Solution**: 
1. Update CORS configuration in backend
2. Redeploy backend
3. Clear browser cache

**Issue**: Environment variables not working
**Solution**: 
1. Redeploy frontend after adding environment variables
2. Check variable names (must start with `REACT_APP_`)

---

## 🔒 **Step 7: Security & Monitoring**

### 7.1 Environment Variables
Never commit sensitive data:
- ✅ JWT_SECRET
- ✅ MONGO_URI
- ✅ API keys

### 7.2 SSL Certificates
Both Vercel and Render provide automatic SSL certificates

### 7.3 Monitoring
- **Vercel**: Built-in analytics and monitoring
- **Render**: Built-in logs and monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

## 💰 **Cost Breakdown**

### Vercel (Frontend)
- **Free Tier**: Unlimited deployments, 100GB bandwidth
- **Pro Tier**: $20/month (if needed)
- **Domain**: $10-15/year

### Render (Backend)
- **Free Tier**: 750 hours/month
- **Paid Tier**: $7/month for unlimited
- **MongoDB**: Free tier available

### Total Cost
- **Free Tier**: $10-15/year (domain only)
- **Paid Tier**: $27-32/year (domain + Render paid)

---

## 🎉 **Success Checklist**

- [ ] Repository pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] MongoDB database connected
- [ ] Environment variables configured
- [ ] Custom domains set up
- [ ] CORS configured
- [ ] SSL certificates active
- [ ] All features tested
- [ ] Monitoring configured

---

## 🆘 **Need Help?**

### Vercel Support
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### Render Support
- Documentation: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)

### Common Commands
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Redeploy
vercel --prod

# Update environment variables
vercel env add REACT_APP_API_URL
```

---

## 🔄 **Deployment Workflow**

### For Updates
1. **Push to GitHub**: `git push origin main`
2. **Automatic Deployment**: Both Vercel and Render will auto-deploy
3. **Test**: Check both frontend and backend URLs
4. **Monitor**: Check logs if issues arise

### For Environment Variable Changes
1. **Backend**: Update in Render dashboard → Redeploy
2. **Frontend**: Update in Vercel dashboard → Redeploy

---

**🎯 This setup gives you the best of both worlds: Vercel's excellent React hosting and Render's reliable Node.js backend hosting!** 