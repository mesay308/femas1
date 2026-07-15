-- Instruction media + showcase video — MySQL 8.0.12+ (JSON, not JSONB)
ALTER TABLE products ADD COLUMN IF NOT EXISTS guide_instruction_images JSON DEFAULT (JSON_ARRAY());
ALTER TABLE products ADD COLUMN IF NOT EXISTS guide_instruction_video_urls JSON DEFAULT (JSON_ARRAY());
ALTER TABLE products ADD COLUMN IF NOT EXISTS showcase_video_url VARCHAR(512);
