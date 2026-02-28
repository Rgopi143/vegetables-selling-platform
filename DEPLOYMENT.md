# 🚀 Deployment Guide for Vegetable Selling Platform

## 📋 Prerequisites

- Render.com account
- GitHub repository with the project code
- Node.js 18+ (for local testing)

## 🛠️ Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render

1. **Login to Render Dashboard**
   - Go to [render.com](https://render.com)
   - Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `vegetables-selling-platform` repository

3. **Configure Deployment**
   - **Name**: `vegetable-selling-platform` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `./render-build.sh`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add any additional env vars needed

4. **Advanced Settings**
   - **Auto-Deploy**: Enabled (pushes trigger new deployments)
   - **Pull Request Previews**: Enabled
   - **Health Check Path**: `/`

### 3. Environment Variables

Add these in Render Dashboard:

```bash
NODE_ENV=production
VITE_APP_NAME=Vegetable Selling Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

Optional (if using external services):
```bash
VITE_API_URL=https://your-api-url.com
VITE_API_KEY=your-api-key-here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## 🔧 Build Process

The deployment uses `render-build.sh` which:

1. Installs dependencies with `npm ci --only=production`
2. Builds the application with `npm run build`
3. Verifies the `dist` directory was created
4. Outputs build logs for debugging

## 📁 Files Required for Deployment

Make sure these files are in your repository:

- ✅ `render.yaml` - Render configuration
- ✅ `render-build.sh` - Build script
- ✅ `package.json` - Dependencies and scripts
- ✅ `vite.config.ts` - Vite configuration
- ✅ `index.html` - Entry point
- ✅ `src/` - Source code directory
- ✅ `.gitignore` - Git ignore rules

## 🚨 Troubleshooting

### Build Fails

1. Check build logs in Render Dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `vite.config.ts` has correct `outDir: 'dist'`
4. Check for TypeScript errors

### 404 Errors on Routes

The `render.yaml` includes SPA fallback:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### Environment Variables Not Working

1. Ensure variables are prefixed with `VITE_` for client-side access
2. Restart the service after adding new variables
3. Check Render Dashboard logs for loading errors

### Performance Issues

1. Enable gzip compression (automatic on Render)
2. Use the code splitting configured in `vite.config.ts`
3. Optimize images and assets

## 🔄 Continuous Deployment

With `autoDeploy: true` in `render.yaml`:

- Every push to `main` triggers a new deployment
- Pull requests create preview environments
- Failed builds are automatically rolled back

## 📊 Monitoring

- Check Render Dashboard for build status
- Monitor response times and error rates
- Set up alerts for downtime
- Review logs for any runtime errors

## 🎉 Post-Deployment

1. **Test the application** - Visit your Render URL
2. **Test all features** - Login, browse products, checkout flow
3. **Check mobile responsiveness** - Test on different devices
4. **Monitor performance** - Check load times and Core Web Vitals
5. **Set up custom domain** (optional) - Configure in Render Dashboard

## 📞 Support

If you encounter issues:

1. Check the [Render Documentation](https://render.com/docs)
2. Review build logs in the Render Dashboard
3. Check the GitHub repository for any recent changes
4. Test locally with `npm run build` and `npm run preview`

---

**Note**: This is a static site deployment. For backend functionality, you'll need to deploy a separate service or use Render's backend services.
