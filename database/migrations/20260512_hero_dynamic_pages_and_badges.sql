-- Migration: Dynamic Hero CMS — page-scoped heroes + per-hero trust badges.
-- Run on existing MySQL deployments where hero_slides already exists.
-- Safe to run once. Re-running may error on duplicate columns / tables.

ALTER TABLE hero_slides
  ADD COLUMN page_slug     VARCHAR(64)         NOT NULL DEFAULT 'home' AFTER slide_id,
  ADD COLUMN eyebrow       VARCHAR(120)        NULL                    AFTER page_slug,
  ADD COLUMN image_side    ENUM('left','right') NOT NULL DEFAULT 'right' AFTER image_url,
  ADD COLUMN content_ratio ENUM('40_60','50_50','60_40') NOT NULL DEFAULT '40_60' AFTER image_side,
  ADD COLUMN theme         ENUM('light','dark') NOT NULL DEFAULT 'dark' AFTER content_ratio,
  ADD INDEX idx_hero_page_active_order (page_slug, is_active, display_order);

UPDATE hero_slides
SET page_slug = 'home'
WHERE page_slug IS NULL OR page_slug = '';

CREATE TABLE IF NOT EXISTS hero_trust_badges (
  badge_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  slide_id      VARCHAR(36) NOT NULL,
  label         VARCHAR(120) NOT NULL,
  icon_url      VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_badge_slide FOREIGN KEY (slide_id) REFERENCES hero_slides(slide_id) ON DELETE CASCADE,
  INDEX idx_badge_slide_order (slide_id, display_order)
);
