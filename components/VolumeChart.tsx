'use client';

import { StockData } from '../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeChartProps {
    data: StockData[];
}

export default function VolumeChart({ data }: VolumeChartProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Trading Volume</h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        interval="preserveStartEnd"
                        minTickGap={30}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            domain = { ['dataMin - 100000', 'dataMax + 100000']}
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                            return value;
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#8b5cf6" barSize={6} radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
