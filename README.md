# 📈 Stock Market Analytics Dashboard

A beautiful, interactive data visualization dashboard for analyzing stock market data (AMZN, DPZ, BTC, NFLX) built with Next.js, TypeScript, and Recharts, featuring real Kaggle historical data (2013-2019).

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Recharts](https://img.shields.io/badge/Recharts-2.15-8b5cf6?style=for-the-badge)

**🌐 Live Demo:** https://stock-visual-dashboard.vercel.app/
**📂 GitHub:** https://github.com/Snehakj07/stock-vis-dashboard
---

## 🎯 Project Overview

This project demonstrates a complete end-to-end data analysis and visualization pipeline using **real historical stock market data** from Kaggle:

- **Data Source**: Kaggle dataset with 6 years of data (May 2013 - May 2019)
- **Stocks**: Amazon (AMZN), Domino's Pizza (DPZ), Bitcoin (BTC), Netflix (NFLX)
- **Data Points**: 1,520 trading days per stock (6,080 total)
- **Goal**: Provide interactive visualizations with technical indicators and actionable insights
- **Result**: Production-ready dashboard deployed on Vercel with advanced analytics

---

## ✨ Features

### 📊 Interactive Visualizations

1. **Price Chart**
   - Area chart with gradient fill showing stock price over time
   - Toggle 3 moving averages (SMA 20, 50, 100)
   - Real-time price metrics with % change indicator

2. **Volume Analysis** ✨ ENHANCED
   - Area chart with purple gradient showing trading volume
   - 20-day moving average overlay (orange line)
   - Clear visualization of volume spikes and patterns

3. **Correlation Heatmap** ✨ NEW
   - 4x4 matrix showing correlations between all stocks
   - Color-coded: Green (positive) → Red (negative)
   - Interactive tooltips with exact correlation values
   - Identifies which stocks move together

4. **Volatility Chart**
   - Line chart showing 20-day rolling volatility
   - Risk assessment indicator
   - Toggleable visibility

5. **Key Insights Section**
   - Best/worst performing months with returns
   - Bullish/bearish signals (SMA crossovers)
   - Price extremes with dates
   - Average volume statistics

### 🎨 UI/UX Features

- **🌙 Dark Mode**: Toggle with persistent localStorage preference
- **📅 Date Range Filtering**: Custom sliders + quick buttons (3M, 6M, 1Y, All)
- **🎛️ Interactive Controls**: Toggle indicators, switch stocks instantly
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **✨ Visual Highlights**: Enhanced charts with badges and borders

---

## 🛠️ Tech Stack

```
Frontend:     Next.js 16.0.7 (React 19)
Language:     TypeScript, Python
Charts:       Recharts 2.15.0
Styling:      Inline styles (responsive)
Deployment:   Vercel
Data:         Kaggle CSV → Processed JSON
```

---

## 📊 Data Pipeline

### 1. Data Source
**Kaggle Dataset**: `amzn-dpz-btc-ntfx-adjusted-may-2013may2019`
- Period: May 1, 2013 - May 31, 2019 (6 years)
- Format: CSV with columns: Date, AMZN, DPZ, BTC, NFLX
- Data points: 1,520 trading days per stock

### 2. Data Processing
**Script**: `scripts/process-kaggle-csv.js`

**Process**:
1. Parse CSV → Read raw Kaggle data
2. Calculate technical indicators:
   - SMA 20, 50, 100 (Simple Moving Averages)
   - Daily returns (% change from previous day)
   - 20-day rolling volatility
   - Volume moving average
3. Output JSON → Structured format for dashboard

**Run the script**:
```bash
node scripts/process-kaggle-csv.js
```

### 3. Stock Performance (2013-2019)
```
AMZN: $248.23 → $1,840.12 (+641.3%)
DPZ:  $51.19 → $272.86 (+433.0%)
BTC:  $106.25 → $8,183.83 (+7,602.4%) 🚀
NFLX: $30.42 → $345.61 (+1,036.3%)
```

---

## 📁 Project Structure

```
stock-vis-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard (single-file component)
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Minimal global styles
├── data/
│   ├── stocks.json           # Processed stock data (1520 days × 4 stocks)
│   └── raw/
│       └── kaggle_stock_data.csv  # Original Kaggle CSV
├── scripts/
│   ├── process-kaggle-csv.js      # CSV → JSON processor
│   ├── generate-data.js           # Mock data generator (backup)
│   └── save-kaggle-csv.js         # CSV saver utility
├── docs/
│   └── KAGGLE_DATASET.md          # Dataset documentation
└── components/                     # Legacy components (not used)
```

---

## 💻 Key Technical Implementations

### State Management
```typescript
- selectedTicker: Stock selection (AMZN, DPZ, BTC, NFLX)
- dateRange: Time period filtering
- isDarkMode: Theme preference (localStorage)
- showSMA20/50/100: Toggle moving averages
- showVolatility: Toggle volatility chart
```

### Data Transformations

**Volume with Moving Average**:
```typescript
const dataWithVolumeMA = useMemo(() => {
  return data.map((item, index, array) => {
    if (index < 19) return { ...item, volumeMA: null };
    const slice = array.slice(index - 19, index + 1);
    const volumeMA = slice.reduce((sum, d) => sum + d.volume, 0) / 20;
    return { ...item, volumeMA };
  });
}, [data]);
```

**Correlation Matrix**:
```typescript
const correlationMatrix = useMemo(() => {
  // Calculate Pearson correlation coefficient
  // between daily returns of each stock pair
}, [allData, dateRange]);
```

### Dark Mode
```typescript
// Load preference on mount
useEffect(() => {
  const saved = localStorage.getItem('darkMode');
  if (saved) setIsDarkMode(JSON.parse(saved));
}, []);

// Toggle and save
const toggleDarkMode = () => {
  const newMode = !isDarkMode;
  setIsDarkMode(newMode);
  localStorage.setItem('darkMode', JSON.stringify(newMode));
};
```

---

## 🚀 Deployment

### Vercel Deployment

**Configuration**: `.npmrc`
```
legacy-peer-deps=true
```

**Deploy Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-detects Next.js configuration
4. Deploy to production
5. Access at: https://stock-vis-kaggle.vercel.app

**Build Process**:
```bash
npm install          # Install dependencies
npm run build        # Next.js production build
npm run start        # Start production server
```

---

## 📈 Data Insights

### Correlation Patterns
- **AMZN ↔ NFLX**: High correlation (both tech/growth stocks)
- **BTC ↔ Others**: Lower correlation (different asset class)
- **DPZ ↔ AMZN**: Moderate correlation (consumer discretionary)

### Volume Analysis
- Volume spikes often precede major price moves
- 20-day MA helps identify unusual trading activity
- Low volume during consolidation periods

### Moving Average Signals
- **Bullish**: SMA 20 crosses above SMA 50 (potential buy)
- **Bearish**: SMA 20 crosses below SMA 50 (potential sell)

---

## 🎓 Learning Outcomes

### Technical Skills
✅ Full-stack web development (Next.js + TypeScript)  
✅ Data processing and transformation  
✅ Advanced data visualization (Recharts)  
✅ State management with React hooks  
✅ Responsive UI/UX design  
✅ Production deployment (Vercel)  

### Domain Knowledge
✅ Time series analysis  
✅ Technical indicators (SMA, volatility)  
✅ Correlation analysis (Pearson coefficient)  
✅ Financial data processing  

---

## 🔮 Future Enhancements

- [ ] Real-time data integration (Yahoo Finance API)
- [ ] Additional technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Comparison mode (overlay multiple stocks)
- [ ] Export features (download charts as images)
- [ ] Portfolio tracking
- [ ] News sentiment integration
- [ ] More stocks (S&P 500 companies)
- [ ] Candlestick chart view option

---

## 📊 Project Statistics

```
Total Lines of Code:    ~500 (main dashboard)
Data Points Processed:  6,080 (1,520 × 4 stocks)
Charts Implemented:     5 (Price, Volume, Correlation, Volatility, Insights)
Features:               10+ (toggles, filters, dark mode, etc.)
Deployment Time:        < 1 minute
Load Time:              < 2 seconds
```

---

## 🙏 Acknowledgments

- **Data Source**: Kaggle dataset (2013-2019 stock market data)
- **Charts**: Powered by Recharts
- **Framework**: Built with Next.js and TypeScript
- **Deployment**: Hosted on Vercel

---

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, and Recharts**

🌐 **Live Demo**: https://stock-visual-dashboard.vercel.app/
📂 **GitHub**: https://github.com/Snehakj07/stock-vis-dashboard
