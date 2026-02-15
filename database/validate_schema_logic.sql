-- VALIDASI SCHEMA & LOGIC TEST
-- Jalankan script ini untuk memverifikasi constraints dan view logic secara otomatis.
-- Script ini menggunakan TRANSACTION ROLLBACK, jadi database Anda akan tetap bersih setelah test.

DO $$
DECLARE
    -- Variables for assertions
    v_total_pages INT;
    v_zakat_target DECIMAL;
    v_current_capital DECIMAL;
    v_is_leaked BOOLEAN;
    v_config_id UUID;
BEGIN
    RAISE NOTICE '🚀 Starting Nexus Schema Validation...';

    -- 1. TEST CONFIG VALIDATION
    -- Skenario: Insert Config
    INSERT INTO nexus_user_config (username, total_quran_pages, zakat_target_amount, is_active)
    VALUES ('TestUser', 604, 10000000, TRUE)
    RETURNING id INTO v_config_id;
    
    RAISE NOTICE '✅ Config Inserted successfully.';

    -- Skenario: Test Unique Constraint (Should Fail)
    BEGIN
        INSERT INTO nexus_user_config (username, is_active) VALUES ('Duplicate', TRUE);
        RAISE EXCEPTION '❌ Constraint Validation Failed: duplicate active config allowed.';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✅ Unique Active Config Constraint works.';
    END;

    -- 2. TEST DAILY METRICS & VIEW LOGIC
    -- Skenario: Insert 3 Days of Logs
    INSERT INTO daily_metrics (log_date, pages_read, trading_pnl, leak_games)
    VALUES 
    ('2026-03-01', 10, 100000, FALSE), -- Day 1: +10 pages, +100k
    ('2026-03-02', 20, -50000, TRUE),  -- Day 2: +20 pages, -50k (Leak)
    ('2026-03-03', 0, 200000, FALSE);  -- Day 3: +0 pages, +200k

    -- 3. VERIFY VIEW AGGREGATION
    -- Check Cumulative Pages (Day 3 should be 10+20+0 = 30)
    SELECT cumulative_pages INTO v_total_pages 
    FROM v_ramadan_progress WHERE log_date = '2026-03-03';
    
    IF v_total_pages != 30 THEN
        RAISE EXCEPTION '❌ View Logic Error: Expected 30 pages, got %', v_total_pages;
    ELSE
        RAISE NOTICE '✅ Cumulative Pages Calculation correct.';
    END IF;

    -- Check Capital Calculation (100k - 50k + 200k = 250k)
    SELECT current_net_capital INTO v_current_capital
    FROM v_ramadan_progress WHERE log_date = '2026-03-03';
    
    IF v_current_capital != 250000.00 THEN
        RAISE EXCEPTION '❌ View Logic Error: Expected 250,000 capital, got %', v_current_capital;
    ELSE
        RAISE NOTICE '✅ Financial Aggregation correct.';
    END IF;

    -- Check Leak Flag (Day 2 should be TRUE)
    SELECT is_leaked_day INTO v_is_leaked
    FROM v_ramadan_progress WHERE log_date = '2026-03-02';
    
    IF v_is_leaked IS NOT TRUE THEN
        RAISE EXCEPTION '❌ Leak Detection Error: Day 2 should be flagged as leaked.';
    ELSE
        RAISE NOTICE '✅ Leak Detection correct.';
    END IF;

    -- 4. TEST AI FEEDBACK INTEGRITY
    INSERT INTO nexus_ai_feedback (log_date, feedback_type, ai_message)
    VALUES ('2026-03-02', 'CRITICAL', 'Test Feedback');
    
    RAISE NOTICE '✅ AI Feedback linked successfully.';

    RAISE NOTICE '🎉 ALL VALIDATION TESTS PASSED!';

    -- ROLLBACK to keep DB clean
    RAISE NOTICE '🔄 Rolling back test data...';
    ROLLBACK;
END $$;
