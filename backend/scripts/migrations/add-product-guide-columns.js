/**
 * Idempotent MySQL ALTERs for product guide / showcase columns.
 * Run from repo root: node backend/scripts/migrations/add-product-guide-columns.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const db = require('../../config/db');

const STATEMENTS = [
    'ALTER TABLE products ADD COLUMN guide_scope TEXT',
    'ALTER TABLE products ADD COLUMN guide_instruction_images JSON DEFAULT (JSON_ARRAY())',
    'ALTER TABLE products ADD COLUMN guide_instruction_video_urls JSON DEFAULT (JSON_ARRAY())',
    'ALTER TABLE products ADD COLUMN showcase_video_url VARCHAR(512)',
];

async function main() {
    for (const sql of STATEMENTS) {
        try {
            await db.query(sql);
            console.log('[migrate] Applied:', sql.slice(0, 72) + (sql.length > 72 ? '…' : ''));
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('[migrate] Skip (column exists):', sql.match(/ADD COLUMN\s+(\S+)/i)?.[1] || sql);
            } else {
                console.error('[migrate] Failed:', err.message);
                throw err;
            }
        }
    }
    console.log('[migrate] Done.');
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
