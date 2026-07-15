-- Removes company_profile.expertise and service_portfolio (admin + API + UI removed).
-- Run after deploying backend that no longer reads/writes these columns:
--   mysql -u USER -p YOUR_DB < database/migrations/20260512_drop_profile_expertise_service_portfolio.sql

ALTER TABLE company_profile
    DROP COLUMN expertise,
    DROP COLUMN service_portfolio;
