/* eslint-disable */
// One-shot migration runner for 20260512_hero_dynamic_pages_and_badges.sql.
// Idempotent-ish: tolerates "duplicate column" / "duplicate key" / "table exists".
const db = require('../config/db');

const statements = [
    `ALTER TABLE hero_slides
        ADD COLUMN page_slug     VARCHAR(64)                    NOT NULL DEFAULT 'home'  AFTER slide_id,
        ADD COLUMN eyebrow       VARCHAR(120)                   NULL                     AFTER page_slug,
        ADD COLUMN image_side    ENUM('left','right')           NOT NULL DEFAULT 'right' AFTER image_url,
        ADD COLUMN content_ratio ENUM('40_60','50_50','60_40')  NOT NULL DEFAULT '40_60' AFTER image_side,
        ADD COLUMN theme         ENUM('light','dark')           NOT NULL DEFAULT 'dark'  AFTER content_ratio,
        ADD INDEX idx_hero_page_active_order (page_slug, is_active, display_order)`,
    `UPDATE hero_slides SET page_slug='home' WHERE page_slug IS NULL OR page_slug=''`,
    `CREATE TABLE IF NOT EXISTS hero_trust_badges (
        badge_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        slide_id      VARCHAR(36) NOT NULL,
        label         VARCHAR(120) NOT NULL,
        icon_url      VARCHAR(255) NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_badge_slide FOREIGN KEY (slide_id) REFERENCES hero_slides(slide_id) ON DELETE CASCADE,
        INDEX idx_badge_slide_order (slide_id, display_order)
    )`,
];

const TOLERATE = new Set([
    'ER_DUP_FIELDNAME',     // duplicate column on re-run
    'ER_DUP_KEYNAME',       // duplicate index on re-run
    'ER_TABLE_EXISTS_ERROR' // CREATE TABLE existed (covered by IF NOT EXISTS but just in case)
]);

(async () => {
    for (const [i, sql] of statements.entries()) {
        try {
            await db.query(sql);
            console.log(`[${i+1}/${statements.length}] OK`);
        } catch (e) {
            if (TOLERATE.has(e.code)) {
                console.log(`[${i+1}/${statements.length}] SKIP (${e.code})`);
            } else {
                console.error(`[${i+1}/${statements.length}] FAIL`, e.code, e.sqlMessage || e.message);
                process.exit(1);
            }
        }
    }
    console.log('Migration applied.');
    process.exit(0);
})();
