'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DailyInputForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        logDate: new Date().toISOString().split('T')[0],
        sholatFardhu: 0,
        sholatTarawih: false,
        sholatTahajjud: false,
        pagesRead: 0,
        currentJuz: 0,
        leakGames: false,
        leakMovies: false,
        leakComicsNovel: false,
        skincareAm: false,
        skincarePm: false,
        haircareRoutine: false,
        workoutType: '',
        waterIntakeMl: 0,
        tradingPnl: 0,
        otherIncome: 0,
        expenseAmount: 0,
        tradingNotes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/daily-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.meta?.auditModeTriggered
                    ? '⚠️ AUDIT MODE TRIGGERED — Cek terminal untuk feedback.'
                    : '✅ Log tersimpan. Keep grinding!'
                );
                onSuccess();
            } else {
                setMessage(`❌ ${data.message || 'Gagal menyimpan.'}`);
            }
        } catch {
            setMessage('❌ Network error.');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <h3>Daily Input</h3>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
                {/* Date */}
                <div className="form-group">
                    <label>Tanggal</label>
                    <input type="date" value={form.logDate} onChange={e => updateField('logDate', e.target.value)} className="input" />
                </div>

                {/* Spiritual */}
                <div className="form-section">
                    <h4>🕌 Spiritual</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sholat Fardhu</label>
                            <select value={form.sholatFardhu} onChange={e => updateField('sholatFardhu', Number(e.target.value))} className="input">
                                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Halaman Quran</label>
                            <input type="number" min="0" value={form.pagesRead} onChange={e => updateField('pagesRead', Number(e.target.value))} className="input" />
                        </div>
                    </div>
                    <div className="toggle-row">
                        <label className="toggle-label">
                            <input type="checkbox" checked={form.sholatTarawih} onChange={e => updateField('sholatTarawih', e.target.checked)} />
                            Tarawih
                        </label>
                        <label className="toggle-label">
                            <input type="checkbox" checked={form.sholatTahajjud} onChange={e => updateField('sholatTahajjud', e.target.checked)} />
                            Tahajjud
                        </label>
                    </div>
                </div>

                {/* Discipline */}
                <div className="form-section">
                    <h4>🛡️ The Firewall</h4>
                    <p className="form-hint">Centang jika BOCOR hari ini:</p>
                    <div className="toggle-row leak-toggles">
                        <label className="toggle-label leak">
                            <input type="checkbox" checked={form.leakGames} onChange={e => updateField('leakGames', e.target.checked)} />
                            🎮 Games
                        </label>
                        <label className="toggle-label leak">
                            <input type="checkbox" checked={form.leakMovies} onChange={e => updateField('leakMovies', e.target.checked)} />
                            🎬 Movies
                        </label>
                        <label className="toggle-label leak">
                            <input type="checkbox" checked={form.leakComicsNovel} onChange={e => updateField('leakComicsNovel', e.target.checked)} />
                            📚 Comics
                        </label>
                    </div>
                </div>

                {/* Physical */}
                <div className="form-section">
                    <h4>💪 Physical</h4>
                    <div className="toggle-row">
                        <label className="toggle-label">
                            <input type="checkbox" checked={form.skincareAm} onChange={e => updateField('skincareAm', e.target.checked)} />
                            Skincare AM
                        </label>
                        <label className="toggle-label">
                            <input type="checkbox" checked={form.skincarePm} onChange={e => updateField('skincarePm', e.target.checked)} />
                            Skincare PM
                        </label>
                        <label className="toggle-label">
                            <input type="checkbox" checked={form.haircareRoutine} onChange={e => updateField('haircareRoutine', e.target.checked)} />
                            Haircare
                        </label>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Workout</label>
                            <input type="text" placeholder="e.g., Cardio" value={form.workoutType} onChange={e => updateField('workoutType', e.target.value)} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Air (ml)</label>
                            <input type="number" min="0" value={form.waterIntakeMl} onChange={e => updateField('waterIntakeMl', Number(e.target.value))} className="input" />
                        </div>
                    </div>
                </div>

                {/* Capital */}
                <div className="form-section">
                    <h4>📈 Capital Growth</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Trading PnL (Rp)</label>
                            <input type="number" value={form.tradingPnl} onChange={e => updateField('tradingPnl', Number(e.target.value))} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Other Income</label>
                            <input type="number" min="0" value={form.otherIncome} onChange={e => updateField('otherIncome', Number(e.target.value))} className="input" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Expenses</label>
                        <input type="number" min="0" value={form.expenseAmount} onChange={e => updateField('expenseAmount', Number(e.target.value))} className="input" />
                    </div>
                    <div className="form-group">
                        <label>Trading Notes</label>
                        <textarea placeholder="Setup, entry, exit reasoning..." value={form.tradingNotes} onChange={e => updateField('tradingNotes', e.target.value)} className="input textarea" />
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Submit Daily Log'}
                </button>

                {message && (
                    <p className={`form-message ${message.startsWith('✅') ? 'success' : message.startsWith('⚠️') ? 'warning' : 'error'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
