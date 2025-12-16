'use client';

import { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis, Cell } from 'recharts';
import stocksData from '../data/stocks.json';

type Ticker = 'AMZN' | 'DPZ' | 'BTC' | 'NFLX';

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<Ticker>('AMZN');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA100, setShowSMA100] = useState(false);
  const [showVolatility, setShowVolatility] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);

  // Save dark mode preference
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const allData = stocksData as any;
  const fullData = allData[selectedTicker] || [];

  const [dateRange, setDateRange] = useState<[number, number]>([
    Math.max(0, fullData.length - 365),
    fullData.length - 1
  ]);

  const data = useMemo(() => fullData.slice(dateRange[0], dateRange[1] + 1), [fullData, dateRange]);

  // Calculate volume moving average
  const dataWithVolumeMA = useMemo(() => {
    return data.map((item: any, index: number, array: any[]) => {
      if (index < 19) return { ...item, volumeMA: null };
      const slice = array.slice(index - 19, index + 1);
      const volumeMA = slice.reduce((sum, d) => sum + d.volume, 0) / 20;
      return { ...item, volumeMA };
    });
  }, [data]);

  // Calculate scatter plot data for volume-price relationship
  const scatterData = useMemo(() => {
    return data.map((item: any, index: number, array: any[]) => {
      if (index === 0) return null;
      const prevClose = array[index - 1].close;
      const priceChange = ((item.close - prevClose) / prevClose) * 100;
      return {
        date: item.date,
        priceChange: parseFloat(priceChange.toFixed(2)),
        volume: item.volume,
        volatility: item.volatility || 0,
        isUp: item.close >= item.open,
        close: item.close,
        open: item.open
      };
    }).filter(Boolean);
  }, [data]);


  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    const tickers: Ticker[] = ['AMZN', 'DPZ', 'BTC', 'NFLX'];
    const matrix: { [key: string]: { [key: string]: number } } = {};

    tickers.forEach(ticker1 => {
      matrix[ticker1] = {};
      tickers.forEach(ticker2 => {
        if (ticker1 === ticker2) {
          matrix[ticker1][ticker2] = 1;
        } else {
          const data1 = allData[ticker1]?.slice(dateRange[0], dateRange[1] + 1) || [];
          const data2 = allData[ticker2]?.slice(dateRange[0], dateRange[1] + 1) || [];

          const returns1 = data1.map((d: any) => d.daily_return).filter((r: number) => r !== 0);
          const returns2 = data2.map((d: any) => d.daily_return).filter((r: number) => r !== 0);

          const minLength = Math.min(returns1.length, returns2.length);
          if (minLength < 2) {
            matrix[ticker1][ticker2] = 0;
            return;
          }

          const mean1 = returns1.slice(0, minLength).reduce((a: number, b: number) => a + b, 0) / minLength;
          const mean2 = returns2.slice(0, minLength).reduce((a: number, b: number) => a + b, 0) / minLength;

          let numerator = 0, denom1 = 0, denom2 = 0;
          for (let i = 0; i < minLength; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            numerator += diff1 * diff2;
            denom1 += diff1 * diff1;
            denom2 += diff2 * diff2;
          }

          const correlation = numerator / Math.sqrt(denom1 * denom2);
          matrix[ticker1][ticker2] = isNaN(correlation) ? 0 : correlation;
        }
      });
    });

    return matrix;
  }, [allData, dateRange]);

  const getCorrelationColor = (value: number) => {
    if (value >= 0.7) return isDarkMode ? '#059669' : '#10b981';
    if (value >= 0.4) return isDarkMode ? '#10b981' : '#34d399';
    if (value >= 0.1) return '#fbbf24';
    if (value >= -0.1) return '#f59e0b';
    return '#ef4444';
  };

  const insights = useMemo(() => {
    if (data.length === 0) return null;
    const prices = data.map((d: any) => d.close);
    const volumes = data.map((d: any) => d.volume);
    const volatilities = data.map((d: any) => d.volatility).filter((v: any) => v !== null);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const currentPrice = prices[prices.length - 1];
    const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
    const maxVolatility = volatilities.length > 0 ? Math.max(...volatilities) : 0;
    const highestPriceDate = data[prices.indexOf(highestPrice)]?.date;
    const lowestPriceDate = data[prices.indexOf(lowestPrice)]?.date;
    const monthlyReturns: { [key: string]: number } = {};
    data.forEach((d: any) => {
      const month = d.date.substring(0, 7);
      monthlyReturns[month] = (monthlyReturns[month] || 0) + d.daily_return;
    });
    const bestMonth = Object.entries(monthlyReturns).reduce((a, b) => a[1] > b[1] ? a : b);
    const worstMonth = Object.entries(monthlyReturns).reduce((a, b) => a[1] < b[1] ? a : b);
    let bullishSignals = 0, bearishSignals = 0;
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1], curr = data[i];
      if (prev.sma20 && prev.sma50 && curr.sma20 && curr.sma50) {
        if (prev.sma20 <= prev.sma50 && curr.sma20 > curr.sma50) bullishSignals++;
        if (prev.sma20 >= prev.sma50 && curr.sma20 < curr.sma50) bearishSignals++;
      }
    }
    return { highestPrice, lowestPrice, currentPrice, avgVolume, maxVolatility, highestPriceDate, lowestPriceDate, bestMonth, worstMonth, bullishSignals, bearishSignals };
  }, [data]);

  const latestPrice = insights?.currentPrice || 0;
  const priceChange = data.length > 1 ? latestPrice - data[data.length - 2].close : 0;
  const priceChangePercent = data.length > 1 ? ((priceChange / data[data.length - 2].close) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  // Theme colors
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : 'white',
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#cbd5e1' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    gridColor: isDarkMode ? '#334155' : '#e2e8f0',
    axisColor: isDarkMode ? '#94a3b8' : '#64748b',
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, transition: 'all 0.3s ease' }}>
      <header style={{ background: isDarkMode ? 'linear-gradient(to right, #1e3a8a, #581c87, #9f1239)' : 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)', color: 'white', padding: '4rem 1.5rem', position: 'relative' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>📈 Stock Market Analytics</h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Interactive visualization dashboard for AMZN, DPZ, BTC, and NFLX analysis (May 2013 - May 2019)</p>
            </div>
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5rem',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {(['AMZN', 'DPZ', 'BTC', 'NFLX'] as Ticker[]).map((ticker) => (
              <button key={ticker} onClick={() => setSelectedTicker(ticker)} style={{ padding: '1rem', borderRadius: '1rem', fontWeight: '600', border: 'none', cursor: 'pointer', background: selectedTicker === ticker ? '#2563eb' : (isDarkMode ? '#334155' : '#f1f5f9'), color: selectedTicker === ticker ? 'white' : theme.text, transition: 'all 0.2s' }}>{ticker}</button>
            ))}
          </div>

          {insights && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Current Price</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${latestPrice.toFixed(2)}</div>
                <div style={{ fontSize: '0.875rem', color: isPositive ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>{isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{priceChangePercent}%</div>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Highest Price</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${insights.highestPrice.toFixed(2)}</div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>{insights.highestPriceDate}</div>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Lowest Price</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${insights.lowestPrice.toFixed(2)}</div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>{insights.lowestPriceDate}</div>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Avg Volume</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(insights.avgVolume / 1000000).toFixed(2)}M</div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>Daily Average</div>
              </div>
            </div>
          )}

          <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedTicker} Stock Price</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${latestPrice.toFixed(2)}</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: isPositive ? '#dcfce7' : '#fee2e2', color: isPositive ? '#166534' : '#991b1b', fontWeight: '600' }}>{isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{priceChangePercent}%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <defs><linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
                <XAxis dataKey="date" stroke={theme.axisColor} tick={{ fontSize: 12, fill: theme.axisColor }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke={theme.axisColor} tick={{ fontSize: 12, fill: theme.axisColor }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: theme.text }} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Legend />
                <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" name="Close Price" />
                {showSMA20 && <Area type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={2} fill="none" name="SMA 20" dot={false} />}
                {showSMA50 && <Area type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={2} fill="none" name="SMA 50" dot={false} />}
                {showSMA100 && <Area type="monotone" dataKey="sma100" stroke="#ef4444" strokeWidth={2} fill="none" name="SMA 100" dot={false} />}
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setShowSMA20(!showSMA20)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA20 ? '#10b981' : (isDarkMode ? '#334155' : '#f1f5f9'), color: showSMA20 ? 'white' : theme.text, fontWeight: '500' }}>SMA 20</button>
              <button onClick={() => setShowSMA50(!showSMA50)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA50 ? '#f59e0b' : (isDarkMode ? '#334155' : '#f1f5f9'), color: showSMA50 ? 'white' : theme.text, fontWeight: '500' }}>SMA 50</button>
              <button onClick={() => setShowSMA100(!showSMA100)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA100 ? '#ef4444' : (isDarkMode ? '#334155' : '#f1f5f9'), color: showSMA100 ? 'white' : theme.text, fontWeight: '500' }}>SMA 100</button>
              <button onClick={() => setShowVolatility(!showVolatility)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showVolatility ? '#f97316' : (isDarkMode ? '#334155' : '#f1f5f9'), color: showVolatility ? 'white' : theme.text, fontWeight: '500' }}>Volatility</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: showVolatility ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '1.5rem' }}>
            <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.2)', border: `3px solid ${isDarkMode ? '#8b5cf6' : '#a855f7'}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', color: 'white', padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}>
                ✨ ENHANCED
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Volume Analysis
              </h3>
              <p style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '1rem' }}>
                Trading volume with 20-day moving average • Area shows volume trend over time
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={dataWithVolumeMA} margin={{ top: 10, right: 20, bottom: 50, left: 10 }}>
                  <defs>
                    <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.axisColor}
                    tick={{ fontSize: 10, fill: theme.axisColor }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval={Math.floor(dataWithVolumeMA.length / 10)}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    stroke={theme.axisColor}
                    tick={{ fontSize: 11, fill: theme.axisColor }}
                    tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text, padding: '12px' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number, name: string) => {
                      if (name === 'Volume') return [value.toLocaleString(), name];
                      if (name === '20-Day MA') return [(value as number).toLocaleString(), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#volumeAreaGradient)"
                    name="Volume"
                  />
                  <Line
                    type="monotone"
                    dataKey="volumeMA"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    name="20-Day MA"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {showVolatility && (
              <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Volatility (20-Day)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
                    <XAxis dataKey="date" stroke={theme.axisColor} tick={{ fontSize: 12, fill: theme.axisColor }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis stroke={theme.axisColor} tick={{ fontSize: 12, fill: theme.axisColor }} />
                    <Tooltip contentStyle={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.text }} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="volatility" stroke="#f97316" strokeWidth={2} dot={false} name="Volatility" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Correlation Heatmap */}
          <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.2)', border: `3px solid ${isDarkMode ? '#10b981' : '#059669'}`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}>
              ✨ NEW
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔗 Stock Correlation Matrix</h3>
            <p style={{ color: theme.textSecondary, marginBottom: '1rem', fontSize: '0.875rem' }}>Shows how stocks move together. Green = positive correlation, Red = negative correlation</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, 1fr)', gap: '0.5rem', maxWidth: '600px', margin: '0 auto' }}>
              <div></div>
              {(['AMZN', 'DPZ', 'BTC', 'NFLX'] as Ticker[]).map(ticker => (
                <div key={ticker} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem', color: theme.text }}>{ticker}</div>
              ))}
              {(['AMZN', 'DPZ', 'BTC', 'NFLX'] as Ticker[]).map(ticker1 => (
                <>
                  <div key={`label-${ticker1}`} style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'flex', alignItems: 'center', color: theme.text }}>{ticker1}</div>
                  {(['AMZN', 'DPZ', 'BTC', 'NFLX'] as Ticker[]).map(ticker2 => {
                    const value = correlationMatrix[ticker1]?.[ticker2] || 0;
                    return (
                      <div
                        key={`${ticker1}-${ticker2}`}
                        style={{
                          background: getCorrelationColor(value),
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          fontSize: '0.875rem'
                        }}
                        title={`${ticker1} vs ${ticker2}: ${value.toFixed(3)}`}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {value.toFixed(2)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {insights && (
            <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>💡 Key Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '0.5rem', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Best Month</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{insights.bestMonth[0]}</div>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>+{(insights.bestMonth[1] * 100).toFixed(2)}% return</div>
                </div>
                <div style={{ padding: '1rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '0.5rem', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Worst Month</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>{insights.worstMonth[0]}</div>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>{(insights.worstMonth[1] * 100).toFixed(2)}% return</div>
                </div>
                <div style={{ padding: '1rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '0.5rem', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Bullish Signals</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{insights.bullishSignals}</div>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>SMA 20/50 crossovers</div>
                </div>
                <div style={{ padding: '1rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '0.5rem', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem' }}>Bearish Signals</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>{insights.bearishSignals}</div>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>SMA 20/50 crossovers</div>
                </div>
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div style={{ background: theme.cardBg, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: `1px solid ${theme.border}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: theme.text }}>📅 Date Range Filter</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.875rem', color: theme.textSecondary, display: 'block', marginBottom: '0.5rem' }}>Start: {fullData[dateRange[0]]?.date || 'N/A'}</label>
                <input
                  type="range"
                  min="0"
                  max={fullData.length - 1}
                  value={dateRange[0]}
                  onChange={(e) => setDateRange([parseInt(e.target.value), dateRange[1]])}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.875rem', color: theme.textSecondary, display: 'block', marginBottom: '0.5rem' }}>End: {fullData[dateRange[1]]?.date || 'N/A'}</label>
                <input
                  type="range"
                  min="0"
                  max={fullData.length - 1}
                  value={dateRange[1]}
                  onChange={(e) => setDateRange([dateRange[0], parseInt(e.target.value)])}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setDateRange([Math.max(0, fullData.length - 90), fullData.length - 1])}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: isDarkMode ? '#334155' : '#f1f5f9', color: theme.text, fontWeight: '500', fontSize: '0.875rem' }}
                >
                  3M
                </button>
                <button
                  onClick={() => setDateRange([Math.max(0, fullData.length - 180), fullData.length - 1])}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: isDarkMode ? '#334155' : '#f1f5f9', color: theme.text, fontWeight: '500', fontSize: '0.875rem' }}
                >
                  6M
                </button>
                <button
                  onClick={() => setDateRange([Math.max(0, fullData.length - 365), fullData.length - 1])}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: isDarkMode ? '#334155' : '#f1f5f9', color: theme.text, fontWeight: '500', fontSize: '0.875rem' }}
                >
                  1Y
                </button>
                <button
                  onClick={() => setDateRange([0, fullData.length - 1])}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: '500', fontSize: '0.875rem' }}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
