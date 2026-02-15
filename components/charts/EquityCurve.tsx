'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type EquityCurveProps = {
    data: Array<{
        date: string;
        pnl: number;
        cumulative: number;
    }>;
    zakatTarget?: number;
};

export default function EquityCurve({ data, zakatTarget }: EquityCurveProps) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <h3>Equity Curve</h3>
                </div>
                <p className="card-subtitle">Trading PnL & Target Zakat</p>
            </div>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '12px',
                            }}
                            formatter={(value: any) => [`Rp ${Number(value).toLocaleString()}`, '']}
                        />
                        {zakatTarget && (
                            <ReferenceLine y={zakatTarget} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Target Zakat', fill: '#f59e0b', fontSize: 11 }} />
                        )}
                        <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Kumulatif" />
                        <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={1} dot={{ r: 2 }} name="Daily PnL" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
