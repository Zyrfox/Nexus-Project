import { pgTable, uuid, text, integer, date, boolean, numeric, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. NEXUS USER CONFIG
export const nexusUserConfig = pgTable('nexus_user_config', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').default('User'),
    ramadanYear: integer('ramadan_year').default(2026),
    startDate: date('start_date').default('2026-03-01'),
    endDate: date('end_date').default('2026-03-30'),
    totalQuranPages: integer('total_quran_pages').default(604),
    dailyTilawahTarget: integer('daily_tilawah_target_default').default(20),
    zakatTargetAmount: numeric('zakat_target_amount', { precision: 15, scale: 2 }).default('0.00'),
    tradingRiskLimitPercent: numeric('trading_risk_limit_percent', { precision: 5, scale: 2 }).default('2.00'),
    customHabits: jsonb('custom_habits').$type<string[]>().default([]),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        uniqueActiveConfig: uniqueIndex('unique_active_config').on(table.isActive).where(sql`is_active = TRUE`),
    };
});

// 2. DAILY METRICS
export const dailyMetrics = pgTable('daily_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    logDate: date('log_date').unique().notNull().defaultNow(),

    // Spiritual
    sholatFardhu: integer('sholat_fardhu').default(0), // Check constraint handled in DB or App logic
    sholatTarawih: boolean('sholat_tarawih').default(false),
    sholatTahajjud: boolean('sholat_tahajjud').default(false),
    pagesRead: integer('pages_read').default(0),
    currentJuz: integer('current_juz').default(0),

    // Discipline (Leak Flags)
    leakGames: boolean('leak_games').default(false),
    leakMovies: boolean('leak_movies').default(false),
    leakComicsNovel: boolean('leak_comics_novel').default(false),

    // Physical
    skincareAm: boolean('skincare_am').default(false),
    skincarePm: boolean('skincare_pm').default(false),
    haircareRoutine: boolean('haircare_routine').default(false),
    workoutType: text('workout_type'),
    waterIntakeMl: integer('water_intake_ml').default(0),

    // Capital Growth
    tradingPnl: numeric('trading_pnl', { precision: 15, scale: 2 }).default('0.00'),
    otherIncome: numeric('other_income', { precision: 15, scale: 2 }).default('0.00'),
    expenseAmount: numeric('expense_amount', { precision: 15, scale: 2 }).default('0.00'),
    tradingNotes: text('trading_notes'),
    habitLogs: jsonb('habit_logs').$type<Record<string, boolean>>().default({}),

    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 3. AI FEEDBACK
export const nexusAiFeedback = pgTable('nexus_ai_feedback', {
    id: uuid('id').defaultRandom().primaryKey(),
    logDate: date('log_date').references(() => dailyMetrics.logDate, { onDelete: 'cascade' }),
    feedbackType: text('feedback_type'), // Enum handled in App logic: 'CRITICAL', 'WARNING', 'OPTIMIZED'
    aiMessage: text('ai_message'),
    actionItem: text('action_item'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
