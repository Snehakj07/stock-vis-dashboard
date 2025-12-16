'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-slate-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                    {subtitle && (
                        <p className={`text-sm font-medium ${trend ? trendColors[trend] : 'text-slate-500'}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
