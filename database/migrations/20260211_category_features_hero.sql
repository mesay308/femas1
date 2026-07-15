-- Category page content: feature pillars + configurable hero (run once per environment)
ALTER TABLE categories
    ADD COLUMN features JSON NULL COMMENT 'Array of {title, description}' AFTER meta_description,
    ADD COLUMN hero_config JSON NULL COMMENT 'headline, subheadline, ctas, trust_badges' AFTER features;
