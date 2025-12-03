# 🚀 Quick Start Guide

## Installation & Running

Due to PowerShell execution policy restrictions, you'll need to install dependencies manually:

### Option 1: Using Command Prompt (Recommended)
```cmd
cd stock-vis-dashboard
cmd /c "npm install"
cmd /c "npm run dev"
```

### Option 2: Change PowerShell Policy (Admin Required)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
npm run dev
```

### Option 3: Use Git Bash or WSL
```bash
cd stock-vis-dashboard
npm install
npm run dev
```

## What's Included

✅ **Complete Next.js Application** - All files created and ready  
✅ **Data Generation Script** - `scripts/generate-data.js` (already run)  
✅ **2 Years of Stock Data** - AAPL, TSLA, MSFT in `data/stocks.json`  
✅ **Interactive Dashboard** - All charts and controls implemented  
✅ **Comprehensive Documentation** - README, deployment guide, data processing docs

## After Installation

Once `npm install` completes successfully:

1. **Run the dev server**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Explore the dashboard**:
   - Switch between AAPL, TSLA, MSFT
   - Toggle moving averages (SMA 20, 50, 100)
   - Adjust date range with sliders
   - View volatility charts
   - See automated insights

## Project Structure

```
stock-vis-dashboard/
├── app/
│   ├── page.tsx              ← Main dashboard (all-in-one)
│   ├── layout.tsx            ← Root layout
│   └── globals.css           ← Minimal styles
├── data/
│   └── stocks.json           ← 2 years of processed data
├── scripts/
│   ├── generate-data.js      ← Node.js data generator ✅
│   └── process_data.py       ← Python alternative
├── docs/
│   ├── DATA_PROCESSING.md    ← Feature engineering docs
│   └── DEPLOYMENT.md         ← Vercel deployment guide
└── README.md                 ← Full documentation
```

## Deployment to Vercel

See `docs/DEPLOYMENT.md` for detailed instructions.

Quick version:
```bash
git init
git add .
git commit -m "Stock Market Dashboard"
# Push to GitHub, then import to Vercel
```

## Troubleshooting

**"Module not found" errors**: Run `npm install` first  
**Port 3000 in use**: Kill the process or use the alternate port shown  
**Build errors**: Clear `.next` folder: `rd /s /q .next` (Windows) or `rm -rf .next` (Unix)

## Features

- 📊 Interactive price charts with moving averages
- 📈 Volume and volatility visualizations  
- 🎯 Automated insights (best/worst months, crossover signals)
- 🎛️ Date range filtering
- 📱 Responsive design
- ⚡ Fast, client-side rendering

---

**Ready to go!** Just run `npm install` and `npm run dev` 🚀
