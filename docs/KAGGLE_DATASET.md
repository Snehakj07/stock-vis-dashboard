# Kaggle Dataset Integration

## Dataset Information
- **Source**: https://www.kaggle.com/datasets/hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019
- **Stocks**: AMZN (Amazon), DPZ (Domino's Pizza), BTC (Bitcoin), NFLX (Netflix)
- **Date Range**: May 2013 - May 2019
- **Data**: Adjusted prices (Open, High, Low, Close, Volume)

## Download Instructions

### Option 1: Manual Download (Recommended)
1. Go to: https://www.kaggle.com/datasets/hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019
2. Click "Download" button
3. Extract the ZIP file
4. Create folder: `stock-vis-dashboard/data/raw/`
5. Copy all CSV files to `data/raw/`
6. Run: `node scripts/process-kaggle-data.js`

### Option 2: Using Kaggle API
```bash
# Install Kaggle CLI
pip install kaggle

# Set up API credentials (get from https://www.kaggle.com/settings)
# Place kaggle.json in ~/.kaggle/

# Download dataset
kaggle datasets download -d hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019

# Extract
unzip amzn-dpz-btc-ntfx-adjusted-may-2013may2019.zip -d data/raw/

# Process
node scripts/process-kaggle-data.js
```

## Expected CSV Format
```
Date,Open,High,Low,Close,Volume
2013-05-01,100.00,105.00,99.00,104.00,1000000
...
```

## Processing Steps
The `process-kaggle-data.js` script will:
1. Read CSV files from `data/raw/`
2. Calculate technical indicators:
   - SMA 20, 50, 100
   - Daily returns
   - 20-day volatility
3. Output to `data/stocks.json`

## After Processing
1. Update dashboard to use new tickers: AMZN, DPZ, BTC, NFLX
2. Test the application: `npm run dev`
3. Commit and push changes
4. Redeploy to Vercel
