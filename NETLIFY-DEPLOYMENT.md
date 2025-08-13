# Netlify Deployment Guide

This guide will help you deploy your Episode Tracker app to Netlify.

## Prerequisites

1. A GitHub account with your project uploaded
2. A Netlify account (free at [netlify.com](https://netlify.com))

## Deployment Steps

### Method 1: Deploy from Git (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub as your Git provider
   - Select your repository

3. **Configure build settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or latest LTS)

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app

### Method 2: Manual Deploy

1. **Build locally**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist` folder to the deploy area
   - Your site will be live instantly

## Configuration Files

The project includes these Netlify-specific files:

- `netlify.toml` - Build configuration and redirects
- `public/_redirects` - SPA routing support

## Environment Variables

If you need to add environment variables later:
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add any required variables

## Custom Domain (Optional)

1. Go to your Netlify site dashboard
2. Navigate to Domain settings
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (18+ recommended)
- Check build logs in Netlify dashboard

### Routing Issues
- The `_redirects` file ensures SPA routing works
- All routes redirect to `index.html` for client-side routing

### Local Storage
- The app uses browser localStorage, which works fine on Netlify
- Data is stored locally in each user's browser

## Features

✅ **Automatic deployments** - Deploy on every Git push  
✅ **SPA routing** - All routes work correctly  
✅ **HTTPS** - Automatically enabled  
✅ **CDN** - Global content delivery  
✅ **Form handling** - Built-in form processing (if needed later)  

Your Episode Tracker app is now ready for production deployment on Netlify!
