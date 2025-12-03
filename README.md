# 📈 Stock Market Analytics Dashboard

A beautiful, interactive data visualization dashboard for analyzing stock market data (AAPL, TSLA, MSFT) built with Next.js, TypeScript, TailwindCSS, and Recharts.

![Stock Market Dashboard](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🎯 Project Overview

This project demonstrates a complete end-to-end data analysis and visualization pipeline:

- **Problem Statement**: Investors need clear, interactive visualizations to understand stock price movements, volatility, and trading patterns.
- **Goals**: Provide an intuitive dashboard with real-time filtering, multiple technical indicators, and actionable insights.
- **Why It Matters**: Visual analysis helps identify trends, support investment decisions, and understand market behavior.
- **Results**: A production-ready dashboard with interactive charts, moving averages, volatility tracking, and automated insights.

## ✨ Features

### Interactive Visualizations
- 📊 **Price Chart**: Area chart with candlestick-style data showing open, high, low, close prices
- 📈 **Moving Averages**: Toggle SMA 20, 50, and 100-day overlays
- 📉 **Volume Chart**: Bar chart showing trading volume over time
- 🌊 **Volatility Indicator**: 20-day rolling volatility visualization
- 🎯 **Correlation Insights**: Automated detection of moving average crossovers

### Interactive Controls
- 🎛️ **Stock Selector**: Switch between AAPL, TSLA, and MSFT
- 📅 **Date Range Slider**: Filter data by custom date ranges
- 🔘 **Toggle Indicators**: Show/hide moving averages and volatility
- 🎨 **Responsive Design**: Works beautifully on desktop, tablet, and mobile

### Automated Insights
- 💰 Highest and lowest closing prices with dates
- 📆 Best and worst performing months
- ⚡ Maximum volatility periods
- 🔄 Moving average crossover signals (bullish/bearish)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.0
- **Charts**: Recharts 2.10
- **Icons**: Lucide React
- **Data Processing**: Node.js

## 📊 Data Pipeline

### Data Sources
The project includes a data generation script that creates realistic stock data with:
- Open, High, Low, Close prices
- Trading volume
- Moving averages (20, 50, 100-day)
- Daily returns
- 20-day rolling volatility

### Data Processing Steps
1. **Generation**: `scripts/generate-data.js` creates 2 years of stock data
2. **Feature Engineering**:
   - Calculate Simple Moving Averages (SMA)
   - Compute daily returns: `(close - prev_close) / prev_close`
   - Calculate volatility: 20-day rolling standard deviation of returns
3. **Cleaning**: Handle null values for early periods where rolling windows are incomplete
4. **Export**: Save processed data to `data/stocks.json`

### Running the Data Script
```bash
node scripts/generate-data.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project**:
```bash
cd stock-vis-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Generate data** (already done, but you can regenerate):
```bash
node scripts/generate-data.js
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
stock-vis-dashboard/
├── app/
│   ├── globals.css          # Global styles and design system
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main dashboard page
├── components/
│   ├── ControlPanel.tsx      # Filter controls and toggles
│   ├── MetricCard.tsx        # Reusable metric display card
│   ├── PriceChart.tsx        # Main price area chart
│   ├── VolatilityChart.tsx   # Volatility line chart
│   └── VolumeChart.tsx       # Volume bar chart
├── data/
│   └── stocks.json           # Processed stock data
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
├── scripts/
│   ├── generate-data.js      # Data generation script (Node.js)
│   └── process_data.py       # Alternative Python script
└── package.json
```

## 🎨 Design Philosophy

This dashboard follows modern web design principles:

- **Vibrant Colors**: Gradient hero, color-coded metrics
- **Glassmorphism**: Subtle shadows and rounded corners
- **Micro-animations**: Smooth hover effects and transitions
- **Typography**: Inter font for clean, professional look
- **Responsive**: Mobile-first design that scales beautifully

## 📈 Data Insights Explained

### Moving Average Crossovers
- **Bullish Signal**: When SMA 20 crosses above SMA 50 (potential buy signal)
- **Bearish Signal**: When SMA 20 crosses below SMA 50 (potential sell signal)

### Volatility
- Measured as 20-day rolling standard deviation of daily returns
- Higher volatility = more price fluctuation = higher risk

### Daily Returns
- Percentage change in closing price from previous day
- Used to calculate volatility and identify trends

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Follow the prompts** to link your project

Alternatively, deploy via the [Vercel Dashboard](https://vercel.com):
1. Import your Git repository
2. Vercel auto-detects Next.js
3. Click "Deploy"

Your dashboard will be live at `https://your-project.vercel.app`

## 🔮 Future Improvements

- [ ] Real-time data integration with Yahoo Finance API
- [ ] Additional technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Comparison view (multiple stocks on same chart)
- [ ] Export data to CSV
- [ ] Dark mode toggle
- [ ] More stocks (add S&P 500 companies)
- [ ] Candlestick chart view option
- [ ] News sentiment integration
- [ ] Portfolio tracking features

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments


- Built with modern web technologies
- Data visualization powered by Recharts

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
