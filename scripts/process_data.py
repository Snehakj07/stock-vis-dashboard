import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

# Configuration
TICKERS = ['AAPL', 'TSLA', 'MSFT']
PERIOD = '2y'  # 2 years of data
OUTPUT_FILE = '../data/stocks.json'

def fetch_and_process_data():
    print(f"Fetching data for {TICKERS}...")
    
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    all_data = {}
    
    for ticker in TICKERS:
        print(f"Processing {ticker}...")
        # Fetch data
        stock = yf.Ticker(ticker)
        df = stock.history(period=PERIOD)
        
        if df.empty:
            print(f"Warning: No data found for {ticker}")
            continue
            
        # Ensure index is datetime
        df.index = pd.to_datetime(df.index)
        
        # Calculate Moving Averages
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        df['SMA_100'] = df['Close'].rolling(window=100).mean()
        
        # Calculate Daily Returns
        df['Daily_Return'] = df['Close'].pct_change()
        
        # Calculate Volatility (20-day rolling standard deviation of returns)
        df['Volatility'] = df['Daily_Return'].rolling(window=20).std()
        
        # Clean NaN values (created by rolling windows)
        df = df.fillna(0)
        
        # Format data for JSON
        records = []
        for date, row in df.iterrows():
            records.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume']),
                'sma20': round(row['SMA_20'], 2) if row['SMA_20'] != 0 else None,
                'sma50': round(row['SMA_50'], 2) if row['SMA_50'] != 0 else None,
                'sma100': round(row['SMA_100'], 2) if row['SMA_100'] != 0 else None,
                'volatility': round(row['Volatility'], 4) if row['Volatility'] != 0 else None,
                'daily_return': round(row['Daily_Return'], 4) if row['Daily_Return'] != 0 else None
            })
            
        all_data[ticker] = records
        
    # Save to JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_data, f, indent=2)
        
    print(f"Data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_and_process_data()
