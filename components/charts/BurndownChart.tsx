'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type BurndownProps = {
    data: Array<{
        date: string;
        target: number;
        actual: number;
    }>;
};

export default function BurndownChart({ data }: BurndownProps) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📖</span>
                    <h3>Quran Burn-down</h3>
                </div>
                <p className="card-subtitle">Target vs Realita Halaman</p>
            </div>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '12px',
                            }}
                        />
                        <Area type="monotone" dataKey="target" stroke="#22c55e" fill="url(#targetGrad)" strokeWidth={2} name="Target" />
                        <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#actualGrad)" strokeWidth={2} name="Aktual" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
