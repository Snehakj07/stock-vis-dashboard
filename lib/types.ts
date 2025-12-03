export interface StockData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    sma20: number | null;
    sma50: number | null;
    sma100: number | null;
    daily_return: number;
    volatility: number | null;
}

export type Ticker = 'AAPL' | 'TSLA' | 'MSFT';

export interface StockDataset {
    [key: string]: StockData[];
}
