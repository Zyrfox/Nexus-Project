import { db } from '@/lib/db';
import { nexusAiFeedback, nexusUserConfig } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { generateNexusFeedback, type NexusContext } from './gemini-client';

type DailyLogData = {
    logDate: string;
    sholatFardhu: number;
    pagesRead: number;
    leakGames: boolean;
    leakMovies: boolean;
    leakComicsNovel: boolean;
    tradingPnl: number;
};

export async function triggerAiAudit(data: DailyLogData) {
    try {
        // 1. Fetch config for risk limits
        const config = await db.query.nexusUserConfig.findFirst({
            where: eq(nexusUserConfig.isActive, true),
        });

        if (!config) {
            console.error('AI Audit: No active config found.');
            return;
        }

        const riskLimit = parseFloat(config.tradingRiskLimitPercent || '2');
        const zakatTarget = parseFloat(config.zakatTargetAmount || '0');
        const targetPages = config.totalQuranPages || 604;

        // 2. Fetch cumulative progress from view
        const progressResult = await db.execute(sql`
      SELECT cumulative_pages, current_net_capital
      FROM v_ramadan_progress
      WHERE log_date = ${data.logDate}
      LIMIT 1
    `);

        const progress = progressResult[0] || { cumulative_pages: 0, current_net_capital: 0 };
        const cumulativePages = Number(progress.cumulative_pages) || 0;
        const cumulativeCapital = Number(progress.current_net_capital) || 0;

        // 3. Determine Audit Mode
        const hasLeak = data.leakGames || data.leakMovies || data.leakComicsNovel;

        // Trading Risk Check: if daily loss exceeds risk limit percentage of cumulative capital
        const absLoss = Math.abs(data.tradingPnl);
        const capitalBase = Math.max(cumulativeCapital + absLoss, 1); // avoid division by zero
        const lossPercent = (absLoss / capitalBase) * 100;
        const isFinancialRisk = data.tradingPnl < 0 && lossPercent > riskLimit;

        let auditMode: NexusContext['auditMode'] = 'NORMAL';
        let feedbackType: 'CRITICAL' | 'WARNING' | 'OPTIMIZED' = 'OPTIMIZED';
        let leakDetails = '';

        if (hasLeak) {
            auditMode = 'LEAK';
            feedbackType = 'CRITICAL';
            const leaks = [];
            if (data.leakGames) leaks.push('Gaming');
            if (data.leakMovies) leaks.push('Movies');
            if (data.leakComicsNovel) leaks.push('Comics/Novel');
            leakDetails = leaks.join(', ');
        } else if (isFinancialRisk) {
            auditMode = 'FINANCIAL_RISK';
            feedbackType = 'CRITICAL';
            leakDetails = `Loss: Rp ${absLoss.toLocaleString()} (${lossPercent.toFixed(1)}% > limit ${riskLimit}%)`;
        } else if (data.sholatFardhu < 5 || data.pagesRead === 0) {
            feedbackType = 'WARNING';
        }

        // 4. Skip feedback for perfect days (optional — save DB space)
        if (auditMode === 'NORMAL' && feedbackType === 'OPTIMIZED') {
            console.log(`Audit passed for ${data.logDate}. Clean day.`);
            return;
        }

        // 5. Generate AI Feedback (Gemini or Fallback)
        const context: NexusContext = {
            logDate: data.logDate,
            sholatFardhu: data.sholatFardhu,
            pagesRead: data.pagesRead,
            cumulativePages: cumulativePages,
            targetPages: targetPages,
            leakGames: data.leakGames,
            leakMovies: data.leakMovies,
            leakComicsNovel: data.leakComicsNovel,
            tradingPnl: data.tradingPnl,
            cumulativeCapital: cumulativeCapital,
            tradingRiskLimitPercent: riskLimit,
            zakatTarget: zakatTarget,
            auditMode: auditMode,
            leakDetails: leakDetails,
        };

        const feedback = await generateNexusFeedback(context);

        // 6. Save to Database
        await db.insert(nexusAiFeedback).values({
            logDate: data.logDate,
            feedbackType: feedbackType,
            aiMessage: feedback.message,
            actionItem: feedback.actionItem,
        });

        console.log(`AI Feedback [${feedbackType}] generated for ${data.logDate} (Mode: ${auditMode})`);

    } catch (error) {
        console.error('AI Audit Service Failed:', error);
        // Don't throw — prevent blocking the main API response
    }
}
