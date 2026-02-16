import 'dotenv/config';
import postgres from 'postgres';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function migrate() {
  console.log('🔧 Adding JSONB columns for Custom Protocols...\n');

  // 1. custom_habits on nexus_user_config
  await sql.unsafe(`
    ALTER TABLE nexus_user_config 
    ADD COLUMN IF NOT EXISTS custom_habits JSONB DEFAULT '[]'::jsonb
  `);
  console.log('✅ nexus_user_config.custom_habits added');

  // 2. habit_logs on daily_metrics
  await sql.unsafe(`
    ALTER TABLE daily_metrics 
    ADD COLUMN IF NOT EXISTS habit_logs JSONB DEFAULT '{}'::jsonb
  `);
  console.log('✅ daily_metrics.habit_logs added');

  console.log('\n🎯 Migration complete!');
  await sql.end();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
