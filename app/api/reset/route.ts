import { db } from '@/lib/db';
import { dailyMetrics, nexusAiFeedback } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

// POST /api/reset — Reset all daily data (keep config)
export async function POST(request: Request) {
    try {
        // Safety: require confirmation header
        const confirm = request.headers.get('X-Nexus-Confirm');
        if (confirm !== 'RESET-ALL-DATA') {
            return NextResponse.json(
                { message: 'Reset ditolak. Kirim header X-Nexus-Confirm: RESET-ALL-DATA' },
                { status: 403 }
            );
        }

        // 1. Delete AI Feedback first (FK constraint)
        await db.delete(nexusAiFeedback);

        // 2. Delete Daily Metrics
        await db.delete(dailyMetrics);

        return NextResponse.json({
            message: '🧹 Reset berhasil. Clean slate achieved.',
            deleted: {
                dailyMetrics: true,
                aiFeedback: true,
            },
        });
    } catch (error) {
        console.error('Reset Error:', error);
        return NextResponse.json({ message: 'Reset failed.' }, { status: 500 });
    }
}
