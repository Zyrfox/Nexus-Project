import { db } from '@/lib/db';
import { dailyMetrics, nexusAiFeedback, nexusUserConfig } from '@/lib/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Get active config
        const config = await db.query.nexusUserConfig.findFirst({
            where: eq(nexusUserConfig.isActive, true),
        });

        // 2. Get all daily metrics (for charts)
        const metrics = await db.query.dailyMetrics.findMany({
            orderBy: [asc(dailyMetrics.logDate)],
        });

        // 3. Get progress from view
        const progress = await db.execute(sql`
      SELECT * FROM v_ramadan_progress ORDER BY log_date ASC
    `);

        // 4. Get all AI feedbacks (for terminal)
        const feedbacks = await db.query.nexusAiFeedback.findMany({
            orderBy: [desc(nexusAiFeedback.createdAt)],
            limit: 20,
        });

        // 5. Build Burndown chart data
        const targetPages = config?.totalQuranPages || 604;
        const totalDays = 30; // Ramadan
        const dailyTarget = targetPages / totalDays;

        const burndownData = progress.map((p: any, i: number) => ({
            date: new Date(p.log_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
            target: Math.round(dailyTarget * (i + 1)),
            actual: Number(p.cumulative_pages) || 0,
        }));

        // 6. Build Equity curve data
        const equityData = progress.map((p: any) => ({
            date: new Date(p.log_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
            cumulative: Number(p.current_net_capital) || 0,
            pnl: 0, // We'll fill from daily metrics
        }));

        // Fill daily PnL from metrics
        metrics.forEach((m, i) => {
            if (equityData[i]) {
                equityData[i].pnl = Number(m.tradingPnl) || 0;
            }
        });

        // 7. Status cards data
        const latestMetric = metrics[metrics.length - 1];
        const totalPages = progress.length > 0 ? Number(progress[progress.length - 1].cumulative_pages) || 0 : 0;
        const totalCapital = progress.length > 0 ? Number(progress[progress.length - 1].current_net_capital) || 0 : 0;
        const leakDays = progress.filter((p: any) => p.is_leaked_day).length;

        return NextResponse.json({
            config: config || null,
            stats: {
                totalPages,
                targetPages,
                progressPercent: targetPages > 0 ? ((totalPages / targetPages) * 100).toFixed(1) : '0',
                totalCapital,
                zakatTarget: config?.zakatTargetAmount || '0',
                zakatPercent: Number(config?.zakatTargetAmount) > 0 ? ((totalCapital / Number(config?.zakatTargetAmount)) * 100).toFixed(1) : '0',
                leakDays,
                totalDaysLogged: metrics.length,
                avgSholat: metrics.length > 0 ? (metrics.reduce((acc, m) => acc + (m.sholatFardhu || 0), 0) / metrics.length).toFixed(1) : '0',
            },
            burndownData,
            equityData,
            feedbacks: feedbacks.map(f => ({
                feedbackType: f.feedbackType,
                aiMessage: f.aiMessage,
                actionItem: f.actionItem,
                logDate: f.logDate,
                createdAt: f.createdAt,
            })),
        });
    } catch (error) {
        console.error('Dashboard Full Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
