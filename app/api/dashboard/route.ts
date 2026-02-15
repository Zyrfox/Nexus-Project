import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nexusAiFeedback } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';

export async function GET() {
    try {
        // 1. Fetch Progress Summary (From View)
        // Drizzle doesn't support Views natively in 'query' builder elegantly yet without defining them as tables.
        // For Views, raw SQL is often cleaner or defining a table schema that maps to the view.
        // Let's use raw SQL for the view query to ensure we get the latest aggregated data.

        const progressResult = await db.execute(sql`
        SELECT * FROM v_ramadan_progress 
        ORDER BY log_date DESC 
        LIMIT 1
    `);

        const currentProgress = progressResult[0] || null;

        // 2. Fetch Latest AI Feedback
        const latestFeedback = await db.query.nexusAiFeedback.findFirst({
            orderBy: [desc(nexusAiFeedback.createdAt)],
        });

        return NextResponse.json({
            progress: currentProgress,
            latestFeedback: latestFeedback || null,
            message: 'Dashboard data fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
