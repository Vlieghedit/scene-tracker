# 🚀 Render Deployment Guide

## Quick Deploy to Render (Free Hosting)

### Prerequisites
- GitHub account
- Your code uploaded to GitHub

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Sign up/Login** to your account
3. **Create New Repository**:
   - Click the "+" icon → "New repository"
   - Repository name: `thuis-episode-tracker`
   - Make it **Public**
   - Don't initialize with README
   - Click "Create repository"

### Step 2: Upload Your Code

**Option A: Using GitHub Web Interface (No Git Required)**
1. Go to your new repository
2. Click "uploading an existing file"
3. Drag and drop ALL files from your project folder
4. Add commit message: "Initial commit"
5. Click "Commit changes"

**Option B: Using Git (Recommended)**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thuis-episode-tracker.git
git push -u origin main
```

### Step 3: Deploy to Render

1. **Go to Render**: https://render.com
2. **Sign up with GitHub** (recommended)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**:
   - Select your `thuis-episode-tracker` repository
   - Click "Connect"

5. **Configure the service**:
   - **Name**: `thuis-episode-tracker` (or any name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

6. **Click "Create Web Service"**

### Step 4: Wait for Deployment

- Render will automatically:
  - Install dependencies
  - Build your React app
  - Start your Express server
  - Give you a URL like `https://your-app-name.onrender.com`

### Step 5: Test Your App

1. Visit your Render URL
2. Create a group
3. Add episodes and scenes
4. Test all functionality
5. Refresh the page - data should persist!

## 🎯 Render Free Tier Benefits

- ✅ **750 hours/month** (about 31 days)
- ✅ **Automatic deployments** from GitHub
- ✅ **Custom domains** (optional)
- ✅ **SSL certificates** included
- ✅ **Global CDN** for fast loading
- ✅ **Database persistence** (SQLite)

## ⚠️ Important Notes

1. **App Sleep**: Free tier apps sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
   - Subsequent requests are fast

2. **Database**: SQLite database is persistent but resets if you redeploy
   - For production, consider using Render's PostgreSQL

3. **Environment Variables**: Already configured in `render.yaml`

## 🔧 Troubleshooting

**If deployment fails:**
1. Check the build logs in Render dashboard
2. Make sure all dependencies are in `package.json`
3. Verify `npm run build` works locally
4. Check that `npm start` works locally

**If app doesn't work:**
1. Check the logs in Render dashboard
2. Verify the URL is correct
3. Make sure the database is being created

## 🎉 Success!

Once deployed, your app will be:
- ✅ **Live on the internet**
- ✅ **Accessible worldwide**
- ✅ **Data automatically saved**
- ✅ **Free hosting**

Your URL will look like: `https://thuis-episode-tracker.onrender.com`



