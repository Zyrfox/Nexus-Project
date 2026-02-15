// Hell Week Simulation — 3-Day Dry Run
// Run: npx tsx scripts/hell-week-sim.ts
// Simulates: Day 1 (Perfect), Day 2 (Leak + Loss), Day 3 (Recovery)

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

const BASE_URL = process.env.NEXUS_URL || 'http://localhost:3000';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function postLog(data: any, label: string) {
    console.log(`\n📤 Mengirim: ${label}`);
    console.log('   Data:', JSON.stringify(data, null, 2));

    try {
        const res = await fetch(`${BASE_URL}/api/daily-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const json = await res.json();
        console.log(`   Status: ${res.status}`);
        console.log(`   Audit: ${json.meta?.auditModeTriggered ? '🚨 TRIGGERED' : '✅ CLEAN'}`);
        if (json.meta?.auditReason) {
            console.log(`   Reason: ${json.meta.auditReason}`);
        }
    } catch (err) {
        console.error(`   ❌ Error:`, err);
    }
}

async function checkDashboard() {
    console.log('\n📊 Checking Dashboard...');
    try {
        const res = await fetch(`${BASE_URL}/api/dashboard-full`);
        const data = await res.json();

        console.log('─── NEXUS STATUS ───');
        console.log(`Quran  : ${data.stats.totalPages}/${data.stats.targetPages} (${data.stats.progressPercent}%)`);
        console.log(`Capital: Rp ${Number(data.stats.totalCapital).toLocaleString()}`);
        console.log(`Leaks  : ${data.stats.leakDays} day(s)`);
        console.log(`Avg 🕌 : ${data.stats.avgSholat}/5`);
        console.log(`\nFeedback entries: ${data.feedbacks.length}`);

        if (data.feedbacks.length > 0) {
            const latest = data.feedbacks[0];
            console.log(`\n💬 Latest AI [${latest.feedbackType}]:`);
            console.log(`   ${latest.aiMessage?.substring(0, 200)}...`);
            console.log(`   ACTION: ${latest.actionItem}`);
        }
    } catch (err) {
        console.error('   ❌ Dashboard error:', err);
    }
}

async function runSimulation() {
    console.log('═══════════════════════════════════════════');
    console.log('  🔥 NEXUS HELL WEEK SIMULATION');
    console.log('  3-Day Dry Run Before Ramadan');
    console.log('═══════════════════════════════════════════');

    // ── DAY 1: The Perfect Day ──
    await postLog({
        logDate: '2026-02-20',
        sholatFardhu: 5,
        sholatTarawih: true,
        sholatTahajjud: true,
        pagesRead: 25,
        currentJuz: 1,
        leakGames: false,
        leakMovies: false,
        leakComicsNovel: false,
        skincareAm: true,
        skincarePm: true,
        haircareRoutine: true,
        workoutType: 'Push-ups + Plank',
        waterIntakeMl: 2500,
        tradingPnl: 250000,
        otherIncome: 0,
        expenseAmount: 50000,
        tradingNotes: 'Clean setup, followed plan.',
    }, '🟢 DAY 1 — THE PERFECT DAY');

    await delay(2000);

    // ── DAY 2: The Disaster ──
    await postLog({
        logDate: '2026-02-21',
        sholatFardhu: 2,
        sholatTarawih: false,
        sholatTahajjud: false,
        pagesRead: 0,
        currentJuz: 1,
        leakGames: true,
        leakMovies: true,
        leakComicsNovel: false,
        skincareAm: false,
        skincarePm: false,
        haircareRoutine: false,
        workoutType: '',
        waterIntakeMl: 500,
        tradingPnl: -500000,
        otherIncome: 0,
        expenseAmount: 150000,
        tradingNotes: 'Revenge traded. Lost control.',
    }, '🔴 DAY 2 — THE DISASTER (Leak + Loss)');

    await delay(2000);

    // ── DAY 3: The Recovery ──
    await postLog({
        logDate: '2026-02-22',
        sholatFardhu: 5,
        sholatTarawih: true,
        sholatTahajjud: false,
        pagesRead: 30,
        currentJuz: 2,
        leakGames: false,
        leakMovies: false,
        leakComicsNovel: false,
        skincareAm: true,
        skincarePm: true,
        haircareRoutine: true,
        workoutType: 'Jogging 30 min',
        waterIntakeMl: 3000,
        tradingPnl: 100000,
        otherIncome: 500000,
        expenseAmount: 75000,
        tradingNotes: 'Recovered. Smaller position, follow rules.',
    }, '🟡 DAY 3 — THE RECOVERY');

    await delay(2000);

    // ── CHECK DASHBOARD ──
    await checkDashboard();

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ SIMULATION COMPLETE');
    console.log('  Buka http://localhost:3000 untuk lihat dashboard');
    console.log('═══════════════════════════════════════════');
}

runSimulation();
