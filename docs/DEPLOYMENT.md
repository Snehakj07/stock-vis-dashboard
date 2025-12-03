# Deployment Guide

## Quick Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Stock Market Dashboard"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Environment Setup

No environment variables needed! The app uses static data from `data/stocks.json`.

## Build Configuration

Vercel will automatically use these settings:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Performance Optimizations

The dashboard is already optimized:
- ✅ Static data loading (no API calls)
- ✅ Client-side rendering for interactivity
- ✅ Optimized images and assets
- ✅ TailwindCSS purging unused styles
- ✅ Next.js automatic code splitting

## Troubleshooting

### Build Fails
- Check that `data/stocks.json` exists
- Run `node scripts/generate-data.js` to regenerate data
- Ensure all dependencies are in `package.json`

### Slow Loading
- Data file is ~2-3MB, normal for 2 years of data
- Consider reducing date range or implementing pagination

### Charts Not Showing
- Check browser console for errors
- Ensure Recharts is installed: `npm install recharts`
- Verify data format matches TypeScript interfaces

## Post-Deployment Checklist

- [ ] Test all three stock tickers (AAPL, TSLA, MSFT)
- [ ] Verify date range slider works
- [ ] Toggle moving averages on/off
- [ ] Check mobile responsiveness
- [ ] Verify insights calculations are correct
- [ ] Test on different browsers (Chrome, Firefox, Safari)

## Monitoring

Vercel provides:
- Analytics (page views, visitors)
- Performance metrics (Core Web Vitals)
- Error tracking
- Deployment logs

Access these in your Vercel dashboard under "Analytics" and "Logs".
