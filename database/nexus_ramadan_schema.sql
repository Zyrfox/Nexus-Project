-- NEXUS RAMADAN TRANSFORMATION ENGINE
-- Schema Version: 1.0.0
-- Created for: Self Growth & Ramadhan Optimization

-- =============================================
-- 1. EXTENSIONS & SETUP
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. USER CONFIGURATION (Static Parameters)
-- =============================================
CREATE TABLE nexus_user_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT DEFAULT 'User',
    ramadan_year INT DEFAULT 2026,
    
    -- Schedule
    start_date DATE DEFAULT '2026-03-01',
    end_date DATE DEFAULT '2026-03-30',
    
    -- Spiritual Goals
    total_quran_pages INT DEFAULT 604,
    daily_tilawah_target_default INT DEFAULT 20,
    
    -- Financial Goals
    zakat_target_amount DECIMAL(15, 2) DEFAULT 0.00,
    trading_risk_limit_percent DECIMAL(5, 2) DEFAULT 2.00, -- Maximum tolerable daily loss (%)
    
    -- System Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint: Hanya satu konfigurasi aktif dalam satu waktu
CREATE UNIQUE INDEX unique_active_config 
ON nexus_user_config (is_active) 
WHERE is_active = TRUE;

-- =============================================
-- 3. DAILY METRICS (The Battlefield)
-- =============================================
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    
    -- [Module: Spiritual]
    sholat_fardhu INT CHECK (sholat_fardhu BETWEEN 0 AND 5) DEFAULT 0,
    sholat_tarawih BOOLEAN DEFAULT FALSE,
    sholat_tahajjud BOOLEAN DEFAULT FALSE,
    pages_read INT DEFAULT 0,
    current_juz INT CHECK (current_juz BETWEEN 0 AND 30) DEFAULT 0,
    
    -- [Module: Discipline - The Firewall]
    -- TRUE triggers "Audit Mode" in AI Logic
    leak_games BOOLEAN DEFAULT FALSE,
    leak_movies BOOLEAN DEFAULT FALSE,
    leak_comics_novel BOOLEAN DEFAULT FALSE,
    
    -- [Module: Physical - UI Optimization]
    skincare_am BOOLEAN DEFAULT FALSE,
    skincare_pm BOOLEAN DEFAULT FALSE,
    haircare_routine BOOLEAN DEFAULT FALSE,
    workout_type TEXT, -- e.g., 'Weight lifting', 'Cardio', 'Stretch'
    water_intake_ml INT DEFAULT 0,
    
    -- [Module: Capital Growth]
    trading_pnl DECIMAL(15, 2) DEFAULT 0.00,
    other_income DECIMAL(15, 2) DEFAULT 0.00,
    expense_amount DECIMAL(15, 2) DEFAULT 0.00,
    trading_notes TEXT,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. AI AGENT INSIGHTS (The "Nyelekit" Memory)
-- =============================================
CREATE TABLE nexus_ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_date DATE REFERENCES daily_metrics(log_date) ON DELETE CASCADE,
    
    -- Feedback Categories
    feedback_type TEXT CHECK (feedback_type IN ('CRITICAL', 'WARNING', 'OPTIMIZED')),
    
    -- Content
    ai_message TEXT,    -- The core feedback message
    action_item TEXT,   -- Concrete next step
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ANALYTICAL VIEWS (AI Logic Layer)
-- =============================================
CREATE OR REPLACE VIEW v_ramadan_progress AS
SELECT 
    m.log_date,
    
    -- Quran Progress Calculation
    (SELECT total_quran_pages FROM nexus_user_config WHERE is_active = TRUE LIMIT 1) as target_pages,
    SUM(m.pages_read) OVER (ORDER BY m.log_date) as cumulative_pages,
    
    -- Financial Tracking
    (SELECT zakat_target_amount FROM nexus_user_config WHERE is_active = TRUE LIMIT 1) as target_zakat,
    SUM(m.trading_pnl + m.other_income - m.expense_amount) OVER (ORDER BY m.log_date) as current_net_capital,
    
    -- Discipline Flags (For Quick AI Scan)
    (CASE WHEN (m.leak_games OR m.leak_movies OR m.leak_comics_novel) THEN TRUE ELSE FALSE END) as is_leaked_day

FROM daily_metrics m;
