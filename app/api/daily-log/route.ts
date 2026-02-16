import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyMetrics } from '@/lib/db/schema';
import { z } from 'zod';

// Zod Schema for Daily Log Input
const dailyLogSchema = z.object({
    logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

    // Spiritual
    sholatFardhu: z.number().min(0).max(5).default(0),
    sholatTarawih: z.boolean().default(false),
    sholatTahajjud: z.boolean().default(false),
    pagesRead: z.number().min(0).default(0),
    currentJuz: z.number().min(0).max(30).default(0),

    // Discipline
    leakGames: z.boolean().default(false),
    leakMovies: z.boolean().default(false),
    leakComicsNovel: z.boolean().default(false),

    // Physical
    skincareAm: z.boolean().default(false),
    skincarePm: z.boolean().default(false),
    haircareRoutine: z.boolean().default(false),
    workoutType: z.string().optional(),
    waterIntakeMl: z.number().min(0).default(0),

    // Capital Growth
    tradingPnl: z.number().default(0),
    otherIncome: z.number().default(0),
    expenseAmount: z.number().default(0),
    tradingNotes: z.string().optional(),

    // Custom Protocols (Side Quests)
    habitLogs: z.record(z.string(), z.boolean()).optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validate Input
        const validation = dailyLogSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Validation Error', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // 2. Insert Execution
        // Using simple approach first. In production, we might want to check for duplicates first 
        // or use ON CONFLICT DO UPDATE.
        // For now, let's try direct insert. The DB has UNIQUE constraint on log_date.

        const newLog = await db.insert(dailyMetrics).values({
            logDate: data.logDate,
            sholatFardhu: data.sholatFardhu,
            sholatTarawih: data.sholatTarawih,
            sholatTahajjud: data.sholatTahajjud,
            pagesRead: data.pagesRead,
            currentJuz: data.currentJuz,
            leakGames: data.leakGames,
            leakMovies: data.leakMovies,
            leakComicsNovel: data.leakComicsNovel,
            skincareAm: data.skincareAm,
            skincarePm: data.skincarePm,
            haircareRoutine: data.haircareRoutine,
            workoutType: data.workoutType,
            waterIntakeMl: data.waterIntakeMl,
            tradingPnl: data.tradingPnl.toString(),
            otherIncome: data.otherIncome.toString(),
            expenseAmount: data.expenseAmount.toString(),
            tradingNotes: data.tradingNotes,
            habitLogs: data.habitLogs || {},
        }).returning();

        // 3. AI Trigger Logic (Async - Fire and Forget)
        // We import the service dynamically or use static import
        const { triggerAiAudit } = await import('@/lib/services/ai-audit');

        // We pass the data to the audit service. 
        // We don't await this if we want fast response, BUT Vercel/Serverless might kill the process.
        // For safety in this environment, we await it, but catch errors inside the service.
        await triggerAiAudit({
            logDate: data.logDate,
            sholatFardhu: data.sholatFardhu,
            pagesRead: data.pagesRead,
            leakGames: data.leakGames,
            leakMovies: data.leakMovies,
            leakComicsNovel: data.leakComicsNovel,
            tradingPnl: data.tradingPnl
        });

        const auditTriggered = data.leakGames || data.leakMovies || data.leakComicsNovel;

        return NextResponse.json({
            message: 'Daily Log saved successfully.',
            data: newLog[0],
            meta: {
                auditModeTriggered: auditTriggered,
                auditReason: auditTriggered ? "Leak Detected (Games/Movies/Comics)" : null
            }
        });

    } catch (error: any) {
        // Handle Unique Constraint Violation (Duplicate Date)
        if (error.code === '23505') { // Postgres code for unique_violation
            return NextResponse.json(
                { message: 'Log for this date already exists.', code: 'DUPLICATE_DATE' },
                { status: 409 }
            );
        }

        console.error('Error saving daily log:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
