-- Drops tables removed from the app (Projects, Staff Management, Sectors).
-- Run once against your existing database after deploying the code changes:
--   mysql -u USER -p YOUR_DB < database/migrations/20260511_drop_projects_staff_sectors.sql
-- Order respects foreign keys: product_sectors before sectors.

DROP TABLE IF EXISTS product_sectors;
DROP TABLE IF EXISTS sectors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS staff;
