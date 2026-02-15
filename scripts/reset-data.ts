// Reset Nexus Data — Clean Slate for Ramadan
// Run: npx tsx scripts/reset-data.ts
// WARNING: This will DELETE ALL data from daily_metrics, nexus_ai_feedback, and reset config.

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    prepare: false,
    connect_timeout: 15,
});

async function resetData() {
    const args = process.argv.slice(2);
    const forceMode = args.includes('--force');

    if (!forceMode) {
        console.log('⚠️  PERINGATAN: Ini akan menghapus SEMUA data dari database!');
        console.log('   Jalankan dengan flag --force untuk konfirmasi:');
        console.log('   npx tsx scripts/reset-data.ts --force');
        process.exit(0);
    }

    console.log('🔥 NEXUS RESET PROTOCOL INITIATED...\n');

    try {
        // 1. Delete AI Feedback (FK constraint, harus duluan)
        const fbResult = await sql`DELETE FROM nexus_ai_feedback`;
        console.log(`✅ nexus_ai_feedback: ${fbResult.count} record(s) deleted.`);

        // 2. Delete Daily Metrics
        const dmResult = await sql`DELETE FROM daily_metrics`;
        console.log(`✅ daily_metrics: ${dmResult.count} record(s) deleted.`);

        // 3. Reset Config (optional: keep config, just update username/targets)
        console.log('\n📋 Config tetap dipertahankan (tidak dihapus).');
        console.log('   Update manual jika target berubah via API PUT /api/config.');

        // 4. Verify empty state
        const metricsCount = await sql`SELECT COUNT(*) as c FROM daily_metrics`;
        const feedbackCount = await sql`SELECT COUNT(*) as c FROM nexus_ai_feedback`;

        console.log('\n─── VERIFICATION ───');
        console.log(`daily_metrics:    ${metricsCount[0].c} records`);
        console.log(`nexus_ai_feedback: ${feedbackCount[0].c} records`);
        console.log('\n🧹 CLEAN SLATE ACHIEVED. Ready for Ramadan Day 1.');

    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

resetData();
