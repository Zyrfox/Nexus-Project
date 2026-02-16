'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, TrendingDown, TrendingUp, ShieldAlert, Flame,
  Terminal, Activity, Zap, X, Loader2, Plus, CheckSquare
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts';

type DashboardData = {
  config: any;
  stats: {
    totalPages: number;
    targetPages: number;
    progressPercent: string;
    totalCapital: number;
    zakatTarget: string;
    zakatPercent: string;
    leakDays: number;
    totalDaysLogged: number;
    avgSholat: string;
  };
  burndownData: Array<{ date: string; target: number; actual: number }>;
  equityData: Array<{ date: string; pnl: number; cumulative: number }>;
  feedbacks: Array<{
    feedbackType: string;
    aiMessage: string;
    actionItem: string;
    logDate: string;
    createdAt: string;
  }>;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard-full');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="font-mono text-sm">Initializing NEXUS...</p>
      </div>
    );
  }

  const pnlValue = data?.stats.totalCapital || 0;
  const isLoss = pnlValue < 0;

  return (
    <main className="relative min-h-screen p-6 md:p-12 font-sans">

      {/* ═══ AURORA BACKGROUND ═══ */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[128px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">

        {/* ═══ 1. HEADER ═══ */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <p className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase">System Online</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-cyber">
              NEXUS <span className="text-gradient">ENGINE</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-light">
              {data?.config?.username || 'Commander'} <span className="text-white/20">|</span> Ramadan {data?.config?.ramadanYear || 2026}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-neon px-8 py-4 rounded-full flex items-center gap-2 group"
          >
            {showForm ? (
              <><X className="w-5 h-5" /> CLOSE FORM</>
            ) : (
              <><Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" /> LOG ACTIVITY</>
            )}
          </button>
        </header>

        {/* ═══ INPUT FORM (Collapsible) ═══ */}
        {showForm && (
          <div className="animate-[slideDown_0.3s_ease-out]">
            <DailyInputFormCosmic onSuccess={() => { setShowForm(false); fetchData(); }} />
          </div>
        )}

        {/* ═══ 2. STATS GRID ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Quran Progress"
            value={`${data?.stats.totalPages || 0}/${data?.stats.targetPages || 604}`}
            sub={`${data?.stats.progressPercent || '0'}% selesai`}
            icon={<BookOpen className="text-cyan-400" />}
            color="cyan"
          />
          <StatCard
            label="Capital vs Zakat"
            value={`Rp ${((pnlValue) / 1000000).toFixed(1)}M`}
            sub={`${data?.stats.zakatPercent || '0'}% target zakat`}
            icon={isLoss ? <TrendingDown className="text-pink-500" /> : <TrendingUp className="text-cyan-400" />}
            color={isLoss ? 'pink' : 'cyan'}
          />
          <StatCard
            label="Leak Days"
            value={`${data?.stats.leakDays || 0} Hari`}
            sub="Discipline Breach"
            icon={<ShieldAlert className={Number(data?.stats.leakDays) > 0 ? 'text-red-500' : 'text-green-400'} />}
            color={Number(data?.stats.leakDays) > 0 ? 'red' : 'green'}
          />
          <StatCard
            label="Sholat Score"
            value={data?.stats.avgSholat || '0'}
            sub="Avg / 5.0"
            icon={<Flame className="text-yellow-400" />}
            color="yellow"
          />
        </div>

        {/* ═══ 3. CHARTS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Burn-down Chart (2/3) */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></span>
                Burn-down Trajectory
              </h3>
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10 font-mono">
                {data?.stats.totalDaysLogged || 0} DAYS LOGGED
              </span>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.burndownData || []}>
                  <defs>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#4b5563" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0a1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRead)" name="Aktual" />
                  <Area type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" fill="url(#colorTarget)" name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trading Health Panel (1/3) */}
          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400">
                <Activity className="w-5 h-5" /> Trading Health
              </h3>
              <div className={`text-4xl font-mono font-bold mb-2 ${isLoss ? 'text-red-400' : 'text-green-400'}`}>
                {isLoss ? 'CRITICAL' : 'STABLE'}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {isLoss
                  ? 'Risk limit approaching. Review trading plan before next entry.'
                  : 'Capital growing steadily. Keep the discipline.'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Capital</span>
                <span className="text-white font-mono">Rp {(pnlValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Zakat Target</span>
                <span className="text-cyan-400 font-mono">{data?.stats.zakatPercent || '0'}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isLoss ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}
                  style={{ width: `${Math.min(Number(data?.stats.zakatPercent || 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 4. EQUITY CURVE ═══ */}
        {(data?.equityData?.length || 0) > 0 && (
          <div className="glass-card rounded-3xl p-8 h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-1.5 h-8 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                Equity Curve
              </h3>
            </div>
            <div className="w-full h-[calc(100%-3rem)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.equityData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#4b5563" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0a1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString()}`, '']}
                  />
                  {Number(data?.stats.zakatTarget) > 0 && (
                    <ReferenceLine y={Number(data?.stats.zakatTarget)} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Zakat', fill: '#f59e0b', fontSize: 11 }} />
                  )}
                  <Line type="monotone" dataKey="cumulative" stroke="#a855f7" strokeWidth={2} dot={false} name="Kumulatif" />
                  <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={1} dot={{ r: 2, fill: '#06b6d4' }} name="Daily PnL" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══ 5. TERMINAL ═══ */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-black/40">
          <div className="bg-black/40 px-6 py-3 border-b border-white/5 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="font-mono text-xs text-gray-500 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> nexus@ramadan-os:~
            </span>
          </div>
          <div className="p-6 font-mono text-sm space-y-2 max-h-[400px] overflow-y-auto terminal-scroll">
            <div className="flex gap-2 text-gray-500">
              <span>$</span>
              <span>./audit_system --status</span>
            </div>
            <div className="text-green-400">[NEXUS] Connected to Supabase... OK</div>
            <div className="text-green-400">[NEXUS] Gemini AI Model loaded... OK</div>
            <div className="text-gray-600 my-2">{'─'.repeat(50)}</div>

            {(!data?.feedbacks || data.feedbacks.length === 0) ? (
              <div className="text-gray-500">
                [NEXUS] No audit entries. Submit your first daily log.
              </div>
            ) : (
              data.feedbacks.map((fb, i) => (
                <div key={i} className="mt-3">
                  <div className="text-gray-500">[{fb.logDate}]
                    <span className={`ml-2 font-bold ${fb.feedbackType === 'CRITICAL' ? 'text-red-400 animate-pulse' : fb.feedbackType === 'WARNING' ? 'text-yellow-400' : 'text-green-400'}`}>
                      [{fb.feedbackType}]
                    </span>
                  </div>
                  <div className="text-green-300 mt-1 whitespace-pre-wrap pl-4 border-l-2 border-green-800/50">
                    {fb.aiMessage}
                  </div>
                  {fb.actionItem && (
                    <div className="text-cyan-300 pl-4 border-l-2 border-cyan-800 mt-1">
                      {'>'} ACTION: {fb.actionItem}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="text-center py-6 text-gray-600 text-xs font-mono border-t border-white/5">
          NEXUS ENGINE v3.0 · Powered by Gemini AI · Built for Ramadan {data?.config?.ramadanYear || 2026}
        </footer>
      </div>
    </main>
  );
}

/* ═══ STAT CARD COMPONENT ═══ */
function StatCard({ label, value, sub, icon, color }: any) {
  const colorMap: Record<string, string> = {
    cyan: 'group-hover:bg-cyan-400/10',
    pink: 'group-hover:bg-pink-500/10',
    red: 'group-hover:bg-red-500/10',
    green: 'group-hover:bg-green-400/10',
    yellow: 'group-hover:bg-yellow-400/10',
  };

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-colors ${colorMap[color] || ''}`}></div>
      <div className="relative z-10 space-y-4">
        <div className="p-3 rounded-xl bg-white/5 w-fit">{icon}</div>
        <div>
          <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
          <h4 className="text-3xl font-bold text-white font-sans">{value}</h4>
          <p className="text-white/30 text-xs mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══ DAILY INPUT FORM (Cosmic Theme) ═══ */
function DailyInputFormCosmic({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Side Quests state
  const [customHabits, setCustomHabits] = useState<string[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, boolean>>({});
  const [newHabit, setNewHabit] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);

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

  // Fetch habits on mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setCustomHabits(data.customHabits || []))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, habitLogs }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.meta?.auditModeTriggered
          ? '⚠️ AUDIT MODE TRIGGERED — Cek terminal.'
          : '✅ Log tersimpan. Keep grinding!');
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

  const u = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', habit: newHabit.trim() }),
    });
    if (res.ok) {
      setCustomHabits(prev => [...prev, newHabit.trim()]);
      setNewHabit('');
    }
  };

  const handleRemoveHabit = async (habit: string) => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', habit }),
    });
    if (res.ok) {
      setCustomHabits(prev => prev.filter(h => h !== habit));
      const newLogs = { ...habitLogs };
      delete newLogs[habit];
      setHabitLogs(newLogs);
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="px-8 py-5 border-b border-white/5">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <span className="w-1.5 h-6 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></span>
          Daily Input
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Date */}
        <input type="date" value={form.logDate} onChange={e => u('logDate', e.target.value)} className="input-cosmic w-full md:w-auto" />

        {/* Spiritual */}
        <div>
          <p className="form-section-title">🕌 Spiritual</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sholat Fardhu</label>
              <select value={form.sholatFardhu} onChange={e => u('sholatFardhu', Number(e.target.value))} className="select-cosmic w-full">
                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Halaman Quran</label>
              <input type="number" min="0" value={form.pagesRead} onChange={e => u('pagesRead', Number(e.target.value))} className="input-cosmic w-full" />
            </div>
            <label className="toggle-cosmic"><input type="checkbox" checked={form.sholatTarawih} onChange={e => u('sholatTarawih', e.target.checked)} className="accent-cyan-400" /> Tarawih</label>
            <label className="toggle-cosmic"><input type="checkbox" checked={form.sholatTahajjud} onChange={e => u('sholatTahajjud', e.target.checked)} className="accent-cyan-400" /> Tahajjud</label>
          </div>
        </div>

        {/* Firewall */}
        <div>
          <p className="form-section-title">🛡️ The Firewall — <span className="text-red-400 normal-case">centang jika BOCOR</span></p>
          <div className="flex flex-wrap gap-3">
            <label className="toggle-cosmic toggle-leak"><input type="checkbox" checked={form.leakGames} onChange={e => u('leakGames', e.target.checked)} /> 🎮 Games</label>
            <label className="toggle-cosmic toggle-leak"><input type="checkbox" checked={form.leakMovies} onChange={e => u('leakMovies', e.target.checked)} /> 🎬 Movies</label>
            <label className="toggle-cosmic toggle-leak"><input type="checkbox" checked={form.leakComicsNovel} onChange={e => u('leakComicsNovel', e.target.checked)} /> 📚 Comics</label>
          </div>
        </div>

        {/* Physical */}
        <div>
          <p className="form-section-title">💪 Physical</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <label className="toggle-cosmic"><input type="checkbox" checked={form.skincareAm} onChange={e => u('skincareAm', e.target.checked)} className="accent-cyan-400" /> Skincare AM</label>
            <label className="toggle-cosmic"><input type="checkbox" checked={form.skincarePm} onChange={e => u('skincarePm', e.target.checked)} className="accent-cyan-400" /> Skincare PM</label>
            <label className="toggle-cosmic"><input type="checkbox" checked={form.haircareRoutine} onChange={e => u('haircareRoutine', e.target.checked)} className="accent-cyan-400" /> Haircare</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Workout</label>
              <input type="text" placeholder="e.g., Cardio" value={form.workoutType} onChange={e => u('workoutType', e.target.value)} className="input-cosmic w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Air (ml)</label>
              <input type="number" min="0" value={form.waterIntakeMl} onChange={e => u('waterIntakeMl', Number(e.target.value))} className="input-cosmic w-full" />
            </div>
          </div>
        </div>

        {/* Capital */}
        <div>
          <p className="form-section-title">📈 Capital Growth</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Trading PnL (Rp)</label>
              <input type="number" value={form.tradingPnl} onChange={e => u('tradingPnl', Number(e.target.value))} className="input-cosmic w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Other Income</label>
              <input type="number" min="0" value={form.otherIncome} onChange={e => u('otherIncome', Number(e.target.value))} className="input-cosmic w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expenses</label>
              <input type="number" min="0" value={form.expenseAmount} onChange={e => u('expenseAmount', Number(e.target.value))} className="input-cosmic w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Trading Notes</label>
            <textarea placeholder="Setup, entry, exit reasoning..." value={form.tradingNotes} onChange={e => u('tradingNotes', e.target.value)} className="input-cosmic w-full min-h-[70px] resize-y" />
          </div>
        </div>

        {/* Side Quests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="form-section-title mb-0 pb-0 border-none flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" /> Side Quests
            </p>
            <button
              type="button"
              onClick={() => setIsManageMode(!isManageMode)}
              className="text-xs text-gray-500 hover:text-white transition-colors underline"
            >
              {isManageMode ? 'Selesai Edit' : '+ Atur Goal'}
            </button>
          </div>

          {/* Manage Mode */}
          {isManageMode && (
            <div className="glass-card rounded-xl p-4 space-y-3 mb-4">
              <div className="flex gap-2">
                <input
                  value={newHabit}
                  onChange={e => setNewHabit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddHabit())}
                  placeholder="Nama Goal (e.g., Sedekah Subuh)"
                  className="input-cosmic flex-1"
                />
                <button type="button" onClick={handleAddHabit} className="btn-neon px-4 py-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {customHabits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customHabits.map(h => (
                    <span key={h} className="text-xs bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                      {h}
                      <X className="w-3 h-3 cursor-pointer text-red-400 hover:text-red-300" onClick={() => handleRemoveHabit(h)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          <div className="grid grid-cols-2 gap-3">
            {customHabits.length === 0 && !isManageMode && (
              <p className="text-xs text-gray-600 italic col-span-2">Belum ada side quest. Klik &quot;+ Atur Goal&quot; buat nambahin.</p>
            )}
            {customHabits.map(habit => (
              <label
                key={habit}
                className={`toggle-cosmic cursor-pointer transition-all ${habitLogs[habit] ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400' : ''
                  }`}
              >
                <input
                  type="checkbox"
                  className="accent-cyan-400"
                  checked={!!habitLogs[habit]}
                  onChange={e => setHabitLogs(prev => ({ ...prev, [habit]: e.target.checked }))}
                />
                <span className={`text-sm ${habitLogs[habit] ? 'font-bold text-white' : 'text-gray-400'}`}>
                  {habit}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-neon w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg">
          {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Processing...</> : <><Zap className="w-5 h-5" /> SUBMIT DAILY LOG</>}
        </button>

        {message && (
          <p className={`text-center text-sm font-medium p-3 rounded-xl ${message.startsWith('✅') ? 'text-green-400 bg-green-400/10' : message.startsWith('⚠️') ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
