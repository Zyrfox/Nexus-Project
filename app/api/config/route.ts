import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nexusUserConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema Validation for PUT (update targets)
const updateConfigSchema = z.object({
    ramadanYear: z.number().optional(),
    totalQuranPages: z.number().optional(),
    dailyTilawahTarget: z.number().optional(),
    zakatTargetAmount: z.number().optional(),
    tradingRiskLimitPercent: z.number().optional(),
});

// Schema for POST (manage habits)
const habitActionSchema = z.object({
    action: z.enum(['add', 'remove']),
    habit: z.string().min(1).max(100),
});

// GET — Fetch active config
export async function GET() {
    try {
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
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT — Update targets
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        const validationResult = updateConfigSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { message: 'Invalid input', errors: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

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
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST — Add/Remove custom habit
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = habitActionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Invalid input', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { action, habit } = validation.data;

        // 1. Fetch current config
        const config = await db.query.nexusUserConfig.findFirst({
            where: eq(nexusUserConfig.isActive, true),
        });

        if (!config) {
            return NextResponse.json({ message: 'Config not found.' }, { status: 404 });
        }

        let currentHabits: string[] = (config.customHabits as string[]) || [];

        // 2. Modify habits array
        if (action === 'add') {
            if (!currentHabits.includes(habit)) {
                currentHabits.push(habit);
            }
        } else if (action === 'remove') {
            currentHabits = currentHabits.filter((h: string) => h !== habit);
        }

        // 3. Save back
        const updated = await db
            .update(nexusUserConfig)
            .set({ customHabits: currentHabits })
            .where(eq(nexusUserConfig.isActive, true))
            .returning();

        return NextResponse.json({
            success: true,
            habits: updated[0]?.customHabits || [],
        });
    } catch (error) {
        console.error('Error managing habits:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
