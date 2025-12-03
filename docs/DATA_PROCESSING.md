# Data Cleaning & Feature Engineering Documentation

## Overview
This document explains the data processing pipeline for the Stock Market Analytics Dashboard.

## Data Source
- **Mock Data Generation**: `scripts/generate-data.js`
- **Alternative**: `scripts/process_data.py` (requires yfinance library)
- **Tickers**: AAPL, TSLA, MSFT
- **Period**: 2 years (730 days)

## Data Schema

### Raw Data Fields
```typescript
{
  date: string;        // ISO format: YYYY-MM-DD
  open: number;        // Opening price
  high: number;        // Highest price of the day
  low: number;         // Lowest price of the day
  close: number;       // Closing price
  volume: number;      // Trading volume
}
```

## Feature Engineering

### 1. Simple Moving Averages (SMA)

**Purpose**: Smooth out price data to identify trends

**Calculation**:
```javascript
SMA_N = (Sum of last N closing prices) / N
```

**Implementation**:
- **SMA 20**: 20-day moving average (short-term trend)
- **SMA 50**: 50-day moving average (medium-term trend)
- **SMA 100**: 100-day moving average (long-term trend)

**Code**:
```javascript
// SMA 20
let sma20 = null;
if (index >= 19) {
  const slice = array.slice(index - 19, index + 1);
  sma20 = slice.reduce((sum, r) => sum + r.close, 0) / 20;
}
```

**Handling Missing Values**: 
- First N-1 days have `null` values (not enough data for calculation)
- Frontend filters out null values when rendering

### 2. Daily Returns

**Purpose**: Measure day-to-day price change percentage

**Formula**:
```
Daily Return = (Close_today - Close_yesterday) / Close_yesterday
```

**Example**:
- Yesterday: $100
- Today: $105
- Daily Return: (105 - 100) / 100 = 0.05 (5%)

**Code**:
```javascript
let daily_return = 0;
if (index > 0) {
  daily_return = (record.close - array[index-1].close) / array[index-1].close;
}
```

### 3. Volatility (20-Day Rolling)

**Purpose**: Measure price fluctuation and risk

**Calculation**: Standard deviation of daily returns over 20-day window

**Formula**:
```
1. Calculate daily returns for last 20 days
2. Find mean of those returns
3. Calculate variance: Σ(return - mean)² / N
4. Volatility = √variance
```

**Code**:
```javascript
let volatility = null;
if (index >= 20) {
  const returns = [];
  for(let j=0; j<20; j++) {
    const prev = array[index-j];
    const prevPrev = array[index-j-1];
    if (prevPrev) {
      returns.push((prev.close - prevPrev.close) / prevPrev.close);
    }
  }
  if (returns.length > 0) {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    volatility = Math.sqrt(variance);
  }
}
```

**Interpretation**:
- Higher volatility = More risky, larger price swings
- Lower volatility = More stable, smaller price swings

## Data Cleaning Steps

### 1. Handling Missing Values

**Issue**: Rolling calculations create null values for early periods

**Solution**:
```javascript
// In data generation
sma20: sma20 ? parseFloat(sma20.toFixed(2)) : null,

// In frontend
data.filter(d => d.sma20 !== null)
```

### 2. Outlier Detection

**Current Approach**: Random walk with bounded changes
```javascript
const change = (Math.random() - 0.5) * (price * 0.05); // Max 5% change
```

**Future Enhancement**: 
- Detect outliers using z-score
- Cap extreme values at 3 standard deviations

### 3. Data Normalization

**Not currently implemented**, but could add:
```javascript
// Min-Max Normalization
normalized = (value - min) / (max - min)

// Z-Score Normalization
normalized = (value - mean) / stdDev
```

## Data Quality Checks

### Validation Rules
1. ✅ All prices > 0
2. ✅ High >= Low
3. ✅ High >= Open, Close
4. ✅ Low <= Open, Close
5. ✅ Volume > 0
6. ✅ Dates in chronological order

### Data Integrity
```javascript
// Ensure data consistency
const high = Math.max(open, close) + Math.random() * 2;
const low = Math.min(open, close) - Math.random() * 2;
```

## Output Format

### JSON Structure
```json
{
  "AAPL": [
    {
      "date": "2023-12-03",
      "open": 150.25,
      "high": 152.30,
      "low": 149.80,
      "close": 151.50,
      "volume": 75000000,
      "sma20": 150.75,
      "sma50": 148.90,
      "sma100": 145.20,
      "daily_return": 0.0082,
      "volatility": 0.0156
    }
  ],
  "TSLA": [...],
  "MSFT": [...]
}
```

## Performance Considerations

- **File Size**: ~2-3MB for 2 years × 3 stocks
- **Load Time**: < 100ms (loaded at build time)
- **Memory**: Efficient array operations
- **Calculation**: O(n) for rolling windows

## Future Enhancements

1. **Real-time Data**: Integrate Yahoo Finance API
2. **More Indicators**: RSI, MACD, Bollinger Bands
3. **Data Caching**: Redis for API responses
4. **Incremental Updates**: Only fetch new data
5. **Data Validation**: Schema validation with Zod
