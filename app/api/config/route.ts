import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nexusUserConfig } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

// Schema Validation for Update
const updateConfigSchema = z.object({
    ramadanYear: z.number().optional(),
    totalQuranPages: z.number().optional(),
    dailyTilawahTarget: z.number().optional(),
    zakatTargetAmount: z.number().optional(),
    tradingRiskLimitPercent: z.number().optional(),
});

export async function GET() {
    try {
        // Fetch the single active configuration
        const config = await db.query.nexusUserConfig.findFirst({
            where: eq(nexusUserConfig.isActive, true),
        });

        if (!config) {
            return NextResponse.json(
                { message: 'Configuration not found. Please seed the database.' },
                { status: 404 }
            );
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = updateConfigSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { message: 'Invalid input', errors: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Update the active configuration
        // Note: In a stricter system, you might version configs (set old to inactive, create new).
        // Here we simply update the current active targets.
        const updatedConfig = await db
            .update(nexusUserConfig)
            .set({
                ...data,
                zakatTargetAmount: data.zakatTargetAmount ? data.zakatTargetAmount.toString() : undefined,
                tradingRiskLimitPercent: data.tradingRiskLimitPercent ? data.tradingRiskLimitPercent.toString() : undefined,
            })
            .where(eq(nexusUserConfig.isActive, true))
            .returning();

        if (updatedConfig.length === 0) {
            return NextResponse.json(
                { message: 'No active configuration found to update.' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedConfig[0]);
    } catch (error) {
        console.error('Error updating config:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
