const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

async function run() {
    function envString(key, altKey) {
        const raw = process.env[key] ?? (altKey ? process.env[altKey] : undefined);
        if (raw == null || raw === '') return undefined;
        let s = String(raw).trim();
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1);
        }
        return s;
    }

    const dbSsl = envString('DB_SSL') === 'true' || !!envString('DB_SSL_CA_PATH') || !!envString('DB_SSL_CA');
    let sslConfig = null;
    if (dbSsl) {
        const fs = require('fs');
        sslConfig = { rejectUnauthorized: true };
        const caString = envString('DB_SSL_CA');
        if (caString) {
            sslConfig.ca = caString;
        } else {
            const caPath = envString('DB_SSL_CA_PATH') || 'ca.pem';
            const absoluteCaPath = path.isAbsolute(caPath) ? caPath : path.join(__dirname, '..', 'backend', caPath);
            if (fs.existsSync(absoluteCaPath)) {
                sslConfig.ca = fs.readFileSync(absoluteCaPath, 'utf8');
            }
        }
    }

    const connection = await mysql.createConnection({
        host: envString('DB_HOST') || 'localhost',
        port: parseInt(envString('DB_PORT') || '3306', 10),
        user: envString('DB_USER') || 'root',
        password: envString('DB_PASSWORD', 'DB_PASS') || '',
        database: envString('DB_NAME') || 'company_db',
        ssl: sslConfig,
    });

    try {
        console.log('🔌 Connected to MySQL server.');

        const categories = [
            {
                name: 'Freestanding Stoves & Ovens',
                slug: 'freestanding-stoves-ovens',
                level: 1,
                description: 'Premium Turkish dual-fuel and all-electric stoves and ovens. Featuring Flame Failure Safety Devices and easy-clean enamel.',
                short_description: 'Turkish stoves and ovens with Flame Failure Devices.',
                cover_image_url: '/images/categories/stoves.jpg',
                features: JSON.stringify(['Advanced Turkish Engineering', 'Flame Failure Safety Device (FFD)', 'Precision Thermostat Control', 'Easy-Clean Enamel Coating']),
                hero_config: JSON.stringify({ theme: 'dark', layout: 'hero-split' }),
                meta_title: 'Freestanding Stoves & Ovens | Femas Kitchen Appliance',
                meta_description: 'Explore Femaslux freestanding stoves and ovens, featuring dual-fuel options, all-electric configurations, and advanced safety features.'
            },
            {
                name: 'Compact Round Ovens',
                slug: 'compact-round-ovens',
                level: 1,
                description: 'Energy-efficient 1300W ovens designed specifically for baking injera, pizza, and pastries with even heat distribution.',
                short_description: 'Spacious, energy-efficient round ovens perfect for injera.',
                cover_image_url: '/images/categories/round-ovens.jpg',
                features: JSON.stringify(['1300W Energy Efficiency', 'Spacious Round Design', 'Grill, Fan & Timer Functions', 'Perfect for Injera & Pizza']),
                hero_config: JSON.stringify({ theme: 'light', layout: 'hero-center' }),
                meta_title: 'Compact Round Ovens | Femas Kitchen Appliance',
                meta_description: 'Discover our range of Lux compact round ovens, perfect for baking injera and pastries with high energy efficiency.'
            },
            {
                name: 'Premium Kitchen Cabinetry',
                slug: 'kitchen-cabinetry',
                level: 1,
                description: 'Bespoke kitchen cabinetry systems modularly crafted from imported moisture-resistant Turkish wood and finished with luxury granite countertops.',
                short_description: 'Bespoke kitchen cabinet systems with granite countertops.',
                cover_image_url: '/images/categories/cabinets.jpg',
                features: JSON.stringify(['Premium Imported Turkish Wood', 'Luxury Granite Countertops', 'Custom Sinks & Fittings', 'Seamless Appliance Integration']),
                hero_config: JSON.stringify({ theme: 'dark', layout: 'hero-split' }),
                meta_title: 'Premium Kitchen Cabinetry | Femas Kitchen Appliance',
                meta_description: 'Transform your kitchen with bespoke cabinet systems, imported Turkish wood, and luxury granite countertops designed to fit your appliances.'
            }
        ];

        const allowedSlugs = categories.map(c => c.slug);
        const categoryMap = new Map(); // Maps slug -> category_id

        // 1. Insert or Update target categories
        console.log('📋 Processing categories...');
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const displayOrder = i;
            const [existing] = await connection.query('SELECT category_id FROM categories WHERE slug = ?', [cat.slug]);

            let categoryId;
            if (existing.length > 0) {
                categoryId = existing[0].category_id;
                console.log(`Updating existing category: ${cat.name} (${cat.slug})`);
                await connection.query(
                    `UPDATE categories 
                     SET name = ?, level = ?, description = ?, short_description = ?, cover_image_url = ?, features = ?, hero_config = ?, meta_title = ?, meta_description = ?, is_active = TRUE, display_order = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE category_id = ?`,
                    [cat.name, cat.level, cat.description, cat.short_description, cat.cover_image_url, cat.features, cat.hero_config, cat.meta_title, cat.meta_description, displayOrder, categoryId]
                );
            } else {
                categoryId = randomUUID();
                console.log(`Inserting new category: ${cat.name} (${cat.slug})`);
                await connection.query(
                    `INSERT INTO categories (category_id, name, slug, level, description, short_description, cover_image_url, features, hero_config, meta_title, meta_description, is_active, display_order)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
                    [categoryId, cat.name, cat.slug, cat.level, cat.description, cat.short_description, cat.cover_image_url, cat.features, cat.hero_config, cat.meta_title, cat.meta_description, displayOrder]
                );
            }
            categoryMap.set(cat.slug, categoryId);
        }

        // 2. Delete categories that are not in the allowed list
        console.log('🧹 Cleaning up other categories...');
        const [allCats] = await connection.query('SELECT category_id, slug, name FROM categories');
        for (const c of allCats) {
            if (!allowedSlugs.includes(c.slug)) {
                console.log(`Deleting unauthorized category: ${c.name} (${c.slug})`);
                // Enforce foreign key constraints safely by setting null references
                await connection.query('UPDATE products SET category_id = NULL WHERE category_id = ?', [c.category_id]);
                await connection.query('DELETE FROM categories WHERE category_id = ?', [c.category_id]);
            }
        }

        // 3. Re-link existing products to correct categories
        console.log('🔗 Re-linking products to their correct categories...');
        const [products] = await connection.query('SELECT product_id, name, slug FROM products');
        for (const p of products) {
            let targetSlug = null;
            const nameLower = p.name.toLowerCase();

            if (nameLower.includes('cabinet') || nameLower.includes('cabinetry')) {
                targetSlug = 'kitchen-cabinetry';
            } else if (nameLower.includes('round') || nameLower.includes('oven') && nameLower.includes('lux') && !nameLower.includes('femaslux')) {
                // If it's the round oven
                targetSlug = 'compact-round-ovens';
            } else if (nameLower.includes('stove') || nameLower.includes('femaslux') || nameLower.includes('oven')) {
                // Otherwise freestanding stoves & ovens
                targetSlug = 'freestanding-stoves-ovens';
            }

            if (targetSlug && categoryMap.has(targetSlug)) {
                const targetCategoryId = categoryMap.get(targetSlug);
                console.log(`Linking product "${p.name}" to category "${targetSlug}"`);
                await connection.query(
                    'UPDATE products SET category_id = ? WHERE product_id = ?',
                    [targetCategoryId, p.product_id]
                );
            } else {
                console.log(`⚠️ Could not determine category for product: "${p.name}"`);
            }
        }

        console.log('\n🎉 Category update and product re-linking complete!');

    } catch (err) {
        console.error('❌ Error during category update:', err);
        process.exit(1);
    } finally {
        await connection.end();
        process.exit(0);
    }
}
run();
