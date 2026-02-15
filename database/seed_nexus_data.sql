-- NEXUS RAMADAN - SEED DATA (TESTING)
-- Gunakan script ini untuk memverifikasi logika View dan AI Trigger.

-- 1. Insert User Config
INSERT INTO nexus_user_config (username, total_quran_pages, zakat_target_amount, trading_risk_limit_percent)
VALUES 
('NexusCommander', 604, 5000000.00, 2.00);

-- 2. Insert Daily Metrics (Skenario Campuran)

-- Hari 1: Good Day (No Leaks, Profit)
INSERT INTO daily_metrics (log_date, sholat_fardhu, pages_read, leak_games, trading_pnl, workout_type)
VALUES 
('2026-03-01', 5, 20, FALSE, 150000.00, 'Cardio');

-- Hari 2: Leak Day (Gaming Addiction Triggered)
INSERT INTO daily_metrics (log_date, sholat_fardhu, pages_read, leak_games, trading_pnl, workout_type)
VALUES 
('2026-03-02', 4, 0, TRUE, -50000.00, NULL);

-- Hari 3: High Financial Loss (Risk Warning Triggered)
INSERT INTO daily_metrics (log_date, sholat_fardhu, pages_read, leak_games, trading_pnl, other_income)
VALUES 
('2026-03-03', 5, 10, FALSE, -1000000.00, 0.00);

-- 3. Insert Mock AI Feedback
INSERT INTO nexus_ai_feedback (log_date, feedback_type, ai_message, action_item)
VALUES 
('2026-03-02', 'CRITICAL', 'DETECTED: Gaming Leak. You promised perfection, yet you fall for pixels.', 'Uninstall game immediately. 100 Istighfar.');
