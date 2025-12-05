'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import stocksData from '../data/stocks.json';

type Ticker = 'AMZN' | 'DPZ' | 'BTC' | 'NFLX';

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<Ticker>('AMZN');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA100, setShowSMA100] = useState(false);
  const [showVolatility, setShowVolatility] = useState(true);

  const allData = stocksData as any;
  const fullData = allData[selectedTicker] || [];

  const [dateRange, setDateRange] = useState<[number, number]>([
    Math.max(0, fullData.length - 365),
    fullData.length - 1
  ]);

  const data = useMemo(() => fullData.slice(dateRange[0], dateRange[1] + 1), [fullData, dateRange]);

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
    return { highestPrice, lowestPrice, highestPriceDate, lowestPriceDate, currentPrice, avgVolume, maxVolatility, bestMonth, worstMonth, bullishSignals, bearishSignals };
  }, [data]);

  const latestPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || 0;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)', color: 'white', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>📈 Stock Market Analytics</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Interactive visualization dashboard for AMZN, DPZ, BTC, and NFLX analysis (May 2013 - May 2019)</p>
        </div>
      </header>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {(['AMZN', 'DPZ', 'BTC', 'NFLX'] as Ticker[]).map((ticker) => (
              <button key={ticker} onClick={() => setSelectedTicker(ticker)} style={{ padding: '1rem', borderRadius: '1rem', fontWeight: '600', border: 'none', cursor: 'pointer', background: selectedTicker === ticker ? '#2563eb' : '#f1f5f9', color: selectedTicker === ticker ? 'white' : '#334155', transition: 'all 0.2s' }}>{ticker}</button>
            ))}
          </div>

          {insights && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Current Price</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>${insights.currentPrice.toFixed(2)}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Highest Price</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>${insights.highestPrice.toFixed(2)}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{new Date(insights.highestPriceDate).toLocaleDateString()}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Lowest Price</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>${insights.lowestPrice.toFixed(2)}</p>
                <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>{new Date(insights.lowestPriceDate).toLocaleDateString()}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Max Volatility</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{(insights.maxVolatility * 100).toFixed(2)}%</p>
              </div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedTicker} Stock Price</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${latestPrice.toFixed(2)}</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: isPositive ? '#dcfce7' : '#fee2e2', color: isPositive ? '#166534' : '#991b1b', fontWeight: '600' }}>{isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{priceChangePercent}%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <defs><linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Legend />
                <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" name="Close Price" />
                {showSMA20 && <Area type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={2} fill="none" name="SMA 20" dot={false} />}
                {showSMA50 && <Area type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={2} fill="none" name="SMA 50" dot={false} />}
                {showSMA100 && <Area type="monotone" dataKey="sma100" stroke="#ef4444" strokeWidth={2} fill="none" name="SMA 100" dot={false} />}
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setShowSMA20(!showSMA20)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA20 ? '#10b981' : '#f1f5f9', color: showSMA20 ? 'white' : '#334155', fontWeight: '500' }}>SMA 20</button>
              <button onClick={() => setShowSMA50(!showSMA50)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA50 ? '#f59e0b' : '#f1f5f9', color: showSMA50 ? 'white' : '#334155', fontWeight: '500' }}>SMA 50</button>
              <button onClick={() => setShowSMA100(!showSMA100)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showSMA100 ? '#ef4444' : '#f1f5f9', color: showSMA100 ? 'white' : '#334155', fontWeight: '500' }}>SMA 100</button>
              <button onClick={() => setShowVolatility(!showVolatility)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: showVolatility ? '#f97316' : '#f1f5f9', color: showVolatility ? 'white' : '#334155', fontWeight: '500' }}>Volatility</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: showVolatility ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem' }}>Trading Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '12px' }} labelFormatter={(value) => new Date(value).toLocaleDateString()} formatter={(value: number) => [value.toLocaleString(), 'Volume']} />
                  <Bar dataKey="volume" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {showVolatility && (
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem' }}>Volatility (20-Day)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '12px' }} labelFormatter={(value) => new Date(value).toLocaleDateString()} formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Volatility']} />
                    <Line type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {insights && (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem' }}>📊 Key Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Best Month</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>{insights.bestMonth[0]}</p>
                  <p style={{ fontSize: '0.875rem', color: '#10b981' }}>Return: {(insights.bestMonth[1] * 100).toFixed(2)}%</p>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Worst Month</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>{insights.worstMonth[0]}</p>
                  <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>Return: {(insights.worstMonth[1] * 100).toFixed(2)}%</p>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Average Volume</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>{insights.avgVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>MA Crossover Signals</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>{insights.bullishSignals} 📈 / {insights.bearishSignals} 📉</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>Date Range Filter</h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Start: Day {dateRange[0]}</label>
                <input type="range" min={0} max={fullData.length - 1} value={dateRange[0]} onChange={(e) => setDateRange([parseInt(e.target.value), dateRange[1]])} style={{ width: '100%', height: '0.5rem', borderRadius: '0.5rem', appearance: 'none', background: '#e2e8f0', cursor: 'pointer' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>End: Day {dateRange[1]}</label>
                <input type="range" min={0} max={fullData.length - 1} value={dateRange[1]} onChange={(e) => setDateRange([dateRange[0], parseInt(e.target.value)])} style={{ width: '100%', height: '0.5rem', borderRadius: '0.5rem', appearance: 'none', background: '#e2e8f0', cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>Showing {dateRange[1] - dateRange[0]} days of data</p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: '#0f172a', color: 'white', padding: '2rem 1.5rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>Stock Market Analytics Dashboard • Built with Next.js, TypeScript, and Recharts</p>
        </div>
      </footer>
    </div>
  );
}
