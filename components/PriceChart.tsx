'use client';

import { StockData } from '../lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChartProps {
    data: StockData[];
    ticker: string;
    showSMA20: boolean;
    showSMA50: boolean;
    showSMA100: boolean;
}

export default function PriceChart({ data, ticker, showSMA20, showSMA50, showSMA100 }: PriceChartProps) {
    const latestPrice = data[data.length - 1]?.close || 0;
    const previousPrice = data[data.length - 2]?.close || 0;
    const priceChange = latestPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);
    const isPositive = priceChange >= 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{ticker} Stock Price</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-3xl font-bold text-slate-900">${latestPrice.toFixed(2)}</span>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-semibold">{isPositive ? '+' : ''}{priceChangePercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClose)"
                        name="Close Price"
                    />
                    {showSMA20 && (
                        <Area
                            type="monotone"
                            dataKey="sma20"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="none"
                            name="SMA 20"
                            dot={false}
                        />
                    )}
                    {showSMA50 && (
                        <Area
                            type="monotone"
                            dataKey="sma50"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="none"
                            name="SMA 50"
                            dot={false}
                        />
                    )}
                    {showSMA100 && (
                        <Area
                            type="monotone"
                            dataKey="sma100"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="none"
                            name="SMA 100"
                            dot={false}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
