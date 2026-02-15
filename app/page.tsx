'use client';

import { useEffect, useState, useCallback } from 'react';
import BurndownChart from '@/components/charts/BurndownChart';
import EquityCurve from '@/components/charts/EquityCurve';
import NexusTerminal from '@/components/NexusTerminal';
import DailyInputForm from '@/components/DailyInputForm';
import { BookOpen, TrendingUp, ShieldAlert, Flame, Moon } from 'lucide-react';

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
        <p>Initializing NEXUS...</p>
      </div>
    );
  }

  return (
    <main className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="logo">
            <Moon size={28} className="text-emerald-400" />
            NEXUS <span className="logo-sub">Ramadan Engine</span>
          </h1>
          <p className="header-subtitle">
            {data?.config?.username || 'User'} &bull; Ramadan {data?.config?.ramadanYear || 2026}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="input-toggle-btn">
          {showForm ? 'Close Form' : '+ Input Harian'}
        </button>
      </header>

      {/* Input Form (Collapsible) */}
      {showForm && (
        <section className="form-section-wrapper animate-slide-down">
          <DailyInputForm onSuccess={() => { setShowForm(false); fetchData(); }} />
        </section>
      )}

      {/* Status Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon quran"><BookOpen size={20} /></div>
          <div>
            <p className="stat-value">{data?.stats.totalPages}<span className="stat-unit">/{data?.stats.targetPages}</span></p>
            <p className="stat-label">Halaman Quran</p>
            <div className="progress-bar">
              <div className="progress-fill quran" style={{ width: `${Math.min(Number(data?.stats.progressPercent || 0), 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon capital"><TrendingUp size={20} /></div>
          <div>
            <p className="stat-value">Rp {((data?.stats.totalCapital || 0) / 1000000).toFixed(1)}<span className="stat-unit">M</span></p>
            <p className="stat-label">Capital vs Zakat</p>
            <div className="progress-bar">
              <div className="progress-fill capital" style={{ width: `${Math.min(Number(data?.stats.zakatPercent || 0), 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${Number(data?.stats.leakDays) > 0 ? 'leak-danger' : 'leak-safe'}`}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="stat-value">{data?.stats.leakDays}<span className="stat-unit"> hari</span></p>
            <p className="stat-label">Leak Days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sholat"><Flame size={20} /></div>
          <div>
            <p className="stat-value">{data?.stats.avgSholat}<span className="stat-unit">/5</span></p>
            <p className="stat-label">Avg Sholat Fardhu</p>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="charts-grid">
        <BurndownChart data={data?.burndownData || []} />
        <EquityCurve data={data?.equityData || []} zakatTarget={Number(data?.stats.zakatTarget) || undefined} />
      </section>

      {/* AI Terminal */}
      <section className="terminal-section">
        <NexusTerminal feedbacks={data?.feedbacks || []} />
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>NEXUS Ramadan Engine v3.0 &bull; Powered by Gemini AI</p>
      </footer>
    </main>
  );
}
