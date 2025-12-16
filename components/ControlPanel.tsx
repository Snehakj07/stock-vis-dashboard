'use client';

import { Ticker } from '../lib/types';

interface ControlPanelProps {
    selectedTicker: Ticker;
    onTickerChange: (ticker: Ticker) => void;
    showSMA20: boolean;
    showSMA50: boolean;
    showSMA100: boolean;
    showVolatility: boolean;
    onToggleSMA20: () => void;
    onToggleSMA50: () => void;
    onToggleSMA100: () => void;
    onToggleVolatility: () => void;
    dateRange: [number, number];
    maxRange: number;
    onDateRangeChange: (range: [number, number]) => void;
}

export default function ControlPanel({
    selectedTicker,
    onTickerChange,
    showSMA20,
    showSMA50,
    showSMA100,
    showVolatility,
    onToggleSMA20,
    onToggleSMA50,
    onToggleSMA100,
    onToggleVolatility,
    dateRange,
    maxRange,
    onDateRangeChange,
}: ControlPanelProps) {
    const tickers: Ticker[] = ['AAPL', 'TSLA', 'MSFT'];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Controls</h3>

            {/* Ticker Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Stock</label>
                <div className="grid grid-cols-1 gap-2">
                    {tickers.map((ticker) => (
                        <button
                            key={ticker}
                            onClick={() => onTickerChange(ticker)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedTicker === ticker
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {ticker}
                        </button>
                    ))}
                </div>
            </div>

            {/* Moving Averages */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Moving Averages</label>
                <div className="space-y-2">
                    <ToggleButton label="SMA 20" checked={showSMA20} onChange={onToggleSMA20} color="green" />
                    <ToggleButton label="SMA 50" checked={showSMA50} onChange={onToggleSMA50} color="yellow" />
                    <ToggleButton label="SMA 100" checked={showSMA100} onChange={onToggleSMA100} color="red" />
                </div>
            </div>

            {/* Volatility Toggle */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Indicators</label>
                <ToggleButton label="Show Volatility" checked={showVolatility} onChange={onToggleVolatility} color="orange" />
            </div>

            {/* Date Range Slider */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Date Range</label>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-600">Start</label>
                        <input
                            type="range"
                            min={0}
                            max={maxRange}
                            value={dateRange[0]}
                            onChange={(e) => onDateRangeChange([parseInt(e.target.value), dateRange[1]])}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-600">End</label>
                        <input
                            type="range"
                            min={0}
                            max={maxRange}
                            value={dateRange[1]}
                            onChange={(e) => onDateRangeChange([dateRange[0], parseInt(e.target.value)])}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                        Showing {dateRange[1] - dateRange[0]} days
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToggleButton({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: () => void; color: string }) {
    const colorClasses = {
        green: 'bg-green-600',
        yellow: 'bg-yellow-600',
        red: 'bg-red-600',
        orange: 'bg-orange-600',
    };

    return (
        <button
            onClick={onChange}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${checked
                ? `${colorClasses[color as keyof typeof colorClasses]} text-white shadow-md`
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
        >
            {label}
        </button>
    );
}
