-- MySQL 8+ schema aligned with Express backend controllers
-- Run via: node scripts/setup_database.js (uses backend/.env)

-- ==========================================
-- 1. USERS & AUTHENTICATION
-- ==========================================
CREATE TABLE roles (
    role_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    permissions JSON NOT NULL,
    is_system_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(36),
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
);

-- ==========================================
-- 2. PRODUCT MANAGEMENT
-- ==========================================
CREATE TABLE categories (
    category_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parent_category_id VARCHAR(36),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    description TEXT,
    short_description TEXT,
    cover_image_url VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    features JSON DEFAULT (JSON_ARRAY()),
    hero_config JSON DEFAULT (JSON_OBJECT()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE brands (
    brand_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) NOT NULL,
    website_url VARCHAR(255),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36),
    brand_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    model_number VARCHAR(100),
    short_description TEXT,
    detailed_description TEXT,
    base_price DECIMAL(12, 2),
    sale_price DECIMAL(12, 2),
    stock_status VARCHAR(50) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')),
    is_featured BOOLEAN DEFAULT FALSE,
    badge JSON DEFAULT (JSON_ARRAY()),
    applications JSON DEFAULT (JSON_ARRAY()),
    is_active BOOLEAN DEFAULT TRUE,
    cover_image_url VARCHAR(255),
    gallery_images JSON DEFAULT (JSON_ARRAY()),
    video_url VARCHAR(255),
    video_urls JSON DEFAULT (JSON_ARRAY()),
    brochure_pdf_url VARCHAR(255),
    documents JSON DEFAULT (JSON_ARRAY()),
    models_list_pdf_url VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    guide_scope TEXT,
    guide_instruction_images JSON DEFAULT (JSON_ARRAY()),
    guide_instruction_video_urls JSON DEFAULT (JSON_ARRAY()),
    showcase_video_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL
);

CREATE TABLE product_models (
    model_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    model_number VARCHAR(100),
    key_spec VARCHAR(255),
    note TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE attributes (
    attribute_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'number', 'select', 'multiselect', 'boolean')),
    unit VARCHAR(50),
    is_filterable BOOLEAN DEFAULT FALSE,
    options JSON DEFAULT (JSON_ARRAY()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_attribute_values (
    value_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36),
    attribute_id VARCHAR(36),
    value_text TEXT,
    value_number DECIMAL(12, 2),
    value_boolean BOOLEAN,
    display_order INTEGER DEFAULT 0,
    UNIQUE(product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(attribute_id) ON DELETE CASCADE
);

CREATE TABLE category_attributes (
    link_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36) NOT NULL,
    attribute_id VARCHAR(36) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, attribute_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(attribute_id) ON DELETE CASCADE
);

-- ==========================================
-- 3. CLIENTS & MARKETING
-- ==========================================
CREATE TABLE clients (
    client_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    category VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. SITE SETTINGS & CMS
-- ==========================================
CREATE TABLE site_settings (
    setting_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_name VARCHAR(100),
    tagline VARCHAR(255),
    primary_phone VARCHAR(50),
    secondary_phone VARCHAR(50),
    company_email VARCHAR(100),
    sales_email VARCHAR(100),
    support_email VARCHAR(100),
    address TEXT,
    google_map_embed_url TEXT,
    facebook_url VARCHAR(255),
    telegram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    youtube_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    whatsapp_number VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hero_slides (
    slide_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    page_slug VARCHAR(64) NOT NULL DEFAULT 'home',
    eyebrow VARCHAR(120) NULL,
    title VARCHAR(200),
    subtitle VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    image_side ENUM('left','right') NOT NULL DEFAULT 'right',
    content_ratio ENUM('40_60','50_50','60_40') NOT NULL DEFAULT '40_60',
    theme ENUM('light','dark') NOT NULL DEFAULT 'dark',
    cta_text VARCHAR(50),
    cta_link VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hero_page_active_order (page_slug, is_active, display_order)
);

CREATE TABLE hero_trust_badges (
    badge_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    slide_id VARCHAR(36) NOT NULL,
    label VARCHAR(120) NOT NULL,
    icon_url VARCHAR(255) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_badge_slide FOREIGN KEY (slide_id) REFERENCES hero_slides(slide_id) ON DELETE CASCADE,
    INDEX idx_badge_slide_order (slide_id, display_order)
);

CREATE TABLE testimonials (
    testimonial_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_name VARCHAR(100),
    position VARCHAR(100),
    company VARCHAR(100),
    quote TEXT NOT NULL,
    avatar_url VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
    blog_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT,
    content LONGTEXT,
    author VARCHAR(100),
    category VARCHAR(100),
    tags JSON,
    cover_image_url VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Company profile (primary source for /api/profile and /api/settings)
CREATE TABLE company_profile (
    profile_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    legal_name VARCHAR(255),
    brand_name VARCHAR(255),
    tagline VARCHAR(255),
    year_established VARCHAR(20),
    mission TEXT,
    vision TEXT,
    core_values JSON,
    description_brief TEXT,
    overview TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    logo_light VARCHAR(255),
    logo_dark VARCHAR(255),
    reasons_why_us JSON,
    corporate_contacts JSON,
    sales_contacts JSON,
    dedicated_admin JSON,
    social_media JSON,
    physical_addresses JSON,
    industry_verticals JSON,
    engineering_specialties JSON,
    expertise JSON,
    service_portfolio JSON,
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE media_assets (
    asset_id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. INDEXES
-- ==========================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_pav_product ON product_attribute_values(product_id);
CREATE INDEX idx_pav_attribute ON product_attribute_values(attribute_id);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(is_published, published_at);
