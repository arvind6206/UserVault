# Deployment Guide

This guide provides step-by-step instructions for deploying the User Management System to production.

## Architecture Overview

- **Backend**: Node.js/Express API deployed on Render
- **Frontend**: React/Vite application deployed on Vercel
- **Database**: MongoDB Atlas (cloud database)
- **Authentication**: JWT tokens with refresh mechanism

## Prerequisites

1. GitHub account
2. Render account
3. Vercel account
4. MongoDB Atlas account (for production database)

## Step 1: Setup Database

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to whitelist (0.0.0.0/0 for cloud access)

## Step 2: Deploy Backend to Render

### 2.1 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/user-management-system.git
git branch -M main
git push -u origin main
```

### 2.2 Create Render Service
1. Go to [Render](https://render.com)
2. Click "New +" -> "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `user-management-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`
   - **Plan**: Free

### 2.3 Environment Variables
Set these in Render dashboard:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/yourdb
ACCESS_TOKEN_SECRET=your_secure_secret_key_32_chars_long
REFRESH_TOKEN_SECRET=your_secure_refresh_key_32_chars_long
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2.4 Deploy
- Click "Create Web Service"
- Wait for deployment (2-5 minutes)
- Note your backend URL: `https://user-management-backend.onrender.com`

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
Update `client/.env.production`:
```env
VITE_API_URL=https://user-management-backend.onrender.com
```

### 3.2 Create Vercel Project
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Environment Variables
Add in Vercel dashboard:
```env
VITE_API_URL=https://user-management-backend.onrender.com
```

### 3.4 Deploy
- Click "Deploy"
- Wait for deployment (1-2 minutes)
- Note your frontend URL: `https://user-management-frontend.vercel.app`

## Step 4: Post-Deployment Setup

### 4.1 Update CORS
Update `server/server.js` to include your actual Vercel URL in the allowedOrigins array.

### 4.2 Seed Database
1. Go to Render dashboard
2. Click your service -> "Shell" tab
3. Run:
```bash
cd server
node seed.js
```

### 4.3 Test Deployment
1. **Backend Health Check**:
   ```bash
   curl https://user-management-backend.onrender.com/health
   ```

2. **Frontend Access**:
   - Visit your Vercel URL
   - Test login functionality

## Step 5: Environment Variables Reference

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/yourdb
ACCESS_TOKEN_SECRET=your_secure_secret_key_32_chars_long
REFRESH_TOKEN_SECRET=your_secure_refresh_key_32_chars_long
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://user-management-backend.onrender.com
```

## Default Login Credentials

After seeding, use these credentials:

- **Admin**: admin@example.com / admin123
- **Manager**: manager@example.com / manager123
- **User**: john@example.com / user123

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure FRONTEND_URL is set correctly in Render
   - Check that your Vercel URL is in allowedOrigins

2. **Database Connection**
   - Verify MONGO_URI is correct
   - Check MongoDB Atlas IP whitelist

3. **Build Failures**
   - Check package.json scripts
   - Verify all dependencies are installed

4. **Authentication Issues**
   - Check JWT secrets are set
   - Verify cookie settings

### Health Check Endpoints

- Backend Health: `GET /health`
- Frontend should load without errors

## Monitoring

### Render
- Automatic health checks
- Build logs
- Error logs

### Vercel
- Build logs
- Function logs
- Performance metrics

## Security Considerations

1. Change default passwords in production
2. Use strong JWT secrets
3. Enable MongoDB Atlas security features
4. Monitor for suspicious activity
5. Regularly update dependencies

## Scaling

### Backend Scaling
- Upgrade to paid Render plan for better performance
- Add load balancers if needed
- Consider serverless functions for specific endpoints

### Frontend Scaling
- Vercel automatically scales
- Consider CDN for static assets
- Optimize bundle size

## Backup and Recovery

### Database Backup
- Enable MongoDB Atlas automated backups
- Test restore procedures

### Code Backup
- GitHub provides version control
- Tag releases for major deployments

## Support

For issues:
1. Check deployment logs
2. Review environment variables
3. Test locally first
4. Consult documentation
5. Check platform status pages
