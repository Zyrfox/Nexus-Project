// Deploy Nexus Schema to Supabase
// Run: npx tsx scripts/deploy-schema.ts

import dns from 'dns';
// Fix: Node.js defaults to IPv4 but Supabase may resolve to IPv6 only
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
  idle_timeout: 5,
  prepare: false,
  connect_timeout: 15,
});

async function deploySchema() {
  console.log('🚀 Connecting to Supabase...');

  try {
    // Test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connected! Server time:', result[0].current_time);

    // 1. Create Extension
    console.log('\n📦 Creating uuid-ossp extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ Extension ready.');

    // 2. Create nexus_user_config
    console.log('\n📋 Creating table: nexus_user_config...');
    await sql`
      CREATE TABLE IF NOT EXISTS nexus_user_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT DEFAULT 'User',
        ramadan_year INT DEFAULT 2026,
        start_date DATE DEFAULT '2026-03-01',
        end_date DATE DEFAULT '2026-03-30',
        total_quran_pages INT DEFAULT 604,
        daily_tilawah_target_default INT DEFAULT 20,
        zakat_target_amount DECIMAL(15, 2) DEFAULT 0.00,
        trading_risk_limit_percent DECIMAL(5, 2) DEFAULT 2.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ nexus_user_config created.');

    // 3. Create unique index
    console.log('\n🔒 Creating unique active config constraint...');
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_config
      ON nexus_user_config (is_active)
      WHERE is_active = TRUE
    `;
    console.log('✅ Constraint created.');

    // 4. Create daily_metrics
    console.log('\n📋 Creating table: daily_metrics...');
    await sql`
      CREATE TABLE IF NOT EXISTS daily_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        log_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
        sholat_fardhu INT CHECK (sholat_fardhu BETWEEN 0 AND 5) DEFAULT 0,
        sholat_tarawih BOOLEAN DEFAULT FALSE,
        sholat_tahajjud BOOLEAN DEFAULT FALSE,
        pages_read INT DEFAULT 0,
        current_juz INT CHECK (current_juz BETWEEN 0 AND 30) DEFAULT 0,
        leak_games BOOLEAN DEFAULT FALSE,
        leak_movies BOOLEAN DEFAULT FALSE,
        leak_comics_novel BOOLEAN DEFAULT FALSE,
        skincare_am BOOLEAN DEFAULT FALSE,
        skincare_pm BOOLEAN DEFAULT FALSE,
        haircare_routine BOOLEAN DEFAULT FALSE,
        workout_type TEXT,
        water_intake_ml INT DEFAULT 0,
        trading_pnl DECIMAL(15, 2) DEFAULT 0.00,
        other_income DECIMAL(15, 2) DEFAULT 0.00,
        expense_amount DECIMAL(15, 2) DEFAULT 0.00,
        trading_notes TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ daily_metrics created.');

    // 5. Create nexus_ai_feedback
    console.log('\n📋 Creating table: nexus_ai_feedback...');
    await sql`
      CREATE TABLE IF NOT EXISTS nexus_ai_feedback (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        log_date DATE REFERENCES daily_metrics(log_date) ON DELETE CASCADE,
        feedback_type TEXT CHECK (feedback_type IN ('CRITICAL', 'WARNING', 'OPTIMIZED')),
        ai_message TEXT,
        action_item TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ nexus_ai_feedback created.');

    // 6. Create View
    console.log('\n📊 Creating view: v_ramadan_progress...');
    await sql`
      CREATE OR REPLACE VIEW v_ramadan_progress AS
      SELECT
        m.log_date,
        (SELECT total_quran_pages FROM nexus_user_config WHERE is_active = TRUE LIMIT 1) as target_pages,
        SUM(m.pages_read) OVER (ORDER BY m.log_date) as cumulative_pages,
        (SELECT zakat_target_amount FROM nexus_user_config WHERE is_active = TRUE LIMIT 1) as target_zakat,
        SUM(m.trading_pnl + m.other_income - m.expense_amount) OVER (ORDER BY m.log_date) as current_net_capital,
        (CASE WHEN (m.leak_games OR m.leak_movies OR m.leak_comics_novel) THEN TRUE ELSE FALSE END) as is_leaked_day
      FROM daily_metrics m
    `;
    console.log('✅ v_ramadan_progress view created.');

    // 7. Seed initial config
    console.log('\n🌱 Seeding initial config...');
    const existing = await sql`SELECT id FROM nexus_user_config WHERE is_active = TRUE LIMIT 1`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO nexus_user_config (username, total_quran_pages, zakat_target_amount, trading_risk_limit_percent)
        VALUES ('NexusCommander', 604, 5000000.00, 2.00)
      `;
      console.log('✅ Config seeded.');
    } else {
      console.log('⏭️  Config already exists, skipping seed.');
    }

    console.log('\n🎉 DEPLOYMENT COMPLETE! All tables and views are ready on Supabase.');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

deploySchema();
