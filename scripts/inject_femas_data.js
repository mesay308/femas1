const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

async function injectData() {
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

        // 0. Disable foreign keys and wipe tables
        console.log('🧹 Wiping product catalog & profile tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE product_attribute_values');
        await connection.query('TRUNCATE TABLE category_attributes');
        await connection.query('TRUNCATE TABLE attributes');
        await connection.query('TRUNCATE TABLE product_models');
        await connection.query('TRUNCATE TABLE products');
        await connection.query('TRUNCATE TABLE categories');
        await connection.query('TRUNCATE TABLE brands');
        await connection.query('TRUNCATE TABLE company_profile');
        await connection.query('TRUNCATE TABLE site_settings');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables wiped.');

        // 1. Insert Brands
        console.log('📋 Seeding brands...');
        const brands = [
            { id: randomUUID(), name: 'Femaslux', logo_url: '/images/brands/femaslux.png', website_url: 'https://femaslux.com', category: 'Kitchen Appliances' },
            { id: randomUUID(), name: 'Lux', logo_url: '/images/brands/lux.png', website_url: 'https://lux.com', category: 'Kitchen Appliances' },
            { id: randomUUID(), name: 'Custom Design', logo_url: '/images/brands/custom-design.png', website_url: 'https://femas.com', category: 'Kitchen Cabinetry' }
        ];

        for (const b of brands) {
            await connection.query(
                'INSERT INTO brands (brand_id, name, logo_url, website_url, category, is_active, display_order) VALUES (?, ?, ?, ?, ?, TRUE, 0)',
                [b.id, b.name, b.logo_url, b.website_url, b.category]
            );
        }
        console.log('✅ Brands seeded.');

        // 2. Insert Categories
        console.log('📋 Seeding categories...');
        const categories = [
            {
                id: randomUUID(),
                name: 'Freestanding Stoves & Ovens',
                slug: 'freestanding-stoves-ovens',
                level: 1,
                description: 'Turkish freestanding dual-fuel and all-electric stoves & ovens.',
                short_description: 'Professional freestanding cooking ranges.',
                cover_image_url: '/images/categories/stoves.jpg',
                features: JSON.stringify(['Flame Failure Safety Device', 'Precision Thermostat Control', 'Easy Clean Enamel Coating']),
                hero_config: JSON.stringify({ theme: 'dark', layout: 'hero-split' })
            },
            {
                id: randomUUID(),
                name: 'Compact Round Ovens',
                slug: 'compact-round-ovens',
                level: 1,
                description: 'Energy-efficient round ovens perfect for baking traditional injera, pizza, and pastries.',
                short_description: 'Perfect for injera, pizza, and baking.',
                cover_image_url: '/images/categories/round-ovens.jpg',
                features: JSON.stringify(['1300W Energy Efficiency', 'Spacious Round Shape', 'Grill & Fan Functions']),
                hero_config: JSON.stringify({ theme: 'light', layout: 'hero-center' })
            },
            {
                id: randomUUID(),
                name: 'Premium Kitchen Cabinetry',
                slug: 'kitchen-cabinetry',
                level: 1,
                description: 'Fully custom-made kitchen cabinet systems crafted with premium imported Turkish materials.',
                short_description: 'Bespoke cabinet systems and granite countertops.',
                cover_image_url: '/images/categories/cabinets.jpg',
                features: JSON.stringify(['Imported Turkish Wood', 'Luxury Granite Countertops', 'Seamless Appliance Integration']),
                hero_config: JSON.stringify({ theme: 'dark', layout: 'hero-split' })
            }
        ];

        for (const c of categories) {
            await connection.query(
                `INSERT INTO categories (category_id, name, slug, level, description, short_description, cover_image_url, features, hero_config, display_order, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, TRUE)`,
                [c.id, c.name, c.slug, c.level, c.description, c.short_description, c.cover_image_url, c.features, c.hero_config]
            );
        }
        console.log('✅ Categories seeded.');

        // Find created IDs for easy reference
        const getBrandId = name => brands.find(b => b.name === name).id;
        const getCategoryId = slug => categories.find(c => c.slug === slug).id;

        // 3. Insert Attributes
        console.log('📋 Seeding attributes...');
        const attributes = [
            { id: randomUUID(), name: 'Dimensions', code: 'dimensions', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Burner Configuration', code: 'burner_config', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Material', code: 'material', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Available Colors', code: 'colors', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Oven/Cooking Functions', code: 'oven_functions', type: 'text', unit: null, is_filterable: false },
            { id: randomUUID(), name: 'Interior Finish', code: 'interior_finish', type: 'text', unit: null, is_filterable: false },
            { id: randomUUID(), name: 'Safety Features', code: 'safety_features', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Power Output', code: 'power_output', type: 'text', unit: 'W', is_filterable: true },
            { id: randomUUID(), name: 'Shape/Design', code: 'shape_design', type: 'text', unit: null, is_filterable: false },
            { id: randomUUID(), name: 'Best Used For', code: 'best_used_for', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Efficiency', code: 'efficiency', type: 'text', unit: null, is_filterable: false },
            { id: randomUUID(), name: 'Cabinet Material', code: 'cabinet_material', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Countertop', code: 'countertop', type: 'text', unit: null, is_filterable: true },
            { id: randomUUID(), name: 'Sink Options', code: 'sink_options', type: 'text', unit: null, is_filterable: false },
            { id: randomUUID(), name: 'Appliance Fitting', code: 'appliance_fitting', type: 'text', unit: null, is_filterable: false }
        ];

        for (const a of attributes) {
            await connection.query(
                'INSERT INTO attributes (attribute_id, name, code, type, unit, is_filterable, options) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [a.id, a.name, a.code, a.type, a.unit, a.is_filterable, JSON.stringify([])]
            );
        }
        console.log('✅ Attributes seeded.');

        // Helper to get attribute ID
        const getAttrId = code => attributes.find(a => a.code === code).id;

        // Link category attributes
        const stovesCatId = getCategoryId('freestanding-stoves-ovens');
        const roundOvenCatId = getCategoryId('compact-round-ovens');
        const cabinetCatId = getCategoryId('kitchen-cabinetry');

        const catAttrLinks = [
            // Stoves
            { category_id: stovesCatId, attribute_id: getAttrId('dimensions'), display_order: 1 },
            { category_id: stovesCatId, attribute_id: getAttrId('burner_config'), display_order: 2 },
            { category_id: stovesCatId, attribute_id: getAttrId('material'), display_order: 3 },
            { category_id: stovesCatId, attribute_id: getAttrId('colors'), display_order: 4 },
            { category_id: stovesCatId, attribute_id: getAttrId('oven_functions'), display_order: 5 },
            { category_id: stovesCatId, attribute_id: getAttrId('interior_finish'), display_order: 6 },
            { category_id: stovesCatId, attribute_id: getAttrId('safety_features'), display_order: 7 },
            
            // Round Ovens
            { category_id: roundOvenCatId, attribute_id: getAttrId('power_output'), display_order: 1 },
            { category_id: roundOvenCatId, attribute_id: getAttrId('shape_design'), display_order: 2 },
            { category_id: roundOvenCatId, attribute_id: getAttrId('oven_functions'), display_order: 3 },
            { category_id: roundOvenCatId, attribute_id: getAttrId('best_used_for'), display_order: 4 },
            { category_id: roundOvenCatId, attribute_id: getAttrId('efficiency'), display_order: 5 },

            // Cabinets
            { category_id: cabinetCatId, attribute_id: getAttrId('dimensions'), display_order: 1 },
            { category_id: cabinetCatId, attribute_id: getAttrId('cabinet_material'), display_order: 2 },
            { category_id: cabinetCatId, attribute_id: getAttrId('countertop'), display_order: 3 },
            { category_id: cabinetCatId, attribute_id: getAttrId('sink_options'), display_order: 4 },
            { category_id: cabinetCatId, attribute_id: getAttrId('appliance_fitting'), display_order: 5 },
            { category_id: cabinetCatId, attribute_id: getAttrId('colors'), display_order: 6 }
        ];

        for (const link of catAttrLinks) {
            await connection.query(
                'INSERT INTO category_attributes (link_id, category_id, attribute_id, display_order, is_required) VALUES (?, ?, ?, ?, FALSE)',
                [randomUUID(), link.category_id, link.attribute_id, link.display_order]
            );
        }
        console.log('✅ Category attributes linked.');

        // 4. Seed Products
        console.log('📋 Seeding products...');
        const productsList = [
            {
                name: 'Femaslux 60x60 Freestanding Dual-Fuel Stove & Oven',
                slug: 'femaslux-60x60-freestanding-dual-fuel-stove-oven',
                sku: 'FEM-6060-DF',
                model_number: 'FEM-6060-DF',
                category_slug: 'freestanding-stoves-ovens',
                brand_name: 'Femaslux',
                short_description: 'Bring family meals and professional-style home cooking to life with the Femaslux Freestanding Stove. Perfectly sized at 60x60 cm, this Turkish-made appliance is an ideal fit for standard kitchens.',
                detailed_description: 'Bring family meals and professional-style home cooking to life with the Femaslux Freestanding Stove. Perfectly sized at 60x60 cm, this Turkish-made appliance is an ideal fit for standard kitchens or homes with limited space. Featuring a versatile dual-fuel cooktop and a fully-equipped built-in oven, you can seamlessly transition from boiling and frying to baking, roasting, and grilling.',
                base_price: 45000.00,
                stock_status: 'in_stock',
                is_featured: true,
                badge: ['Made in Turkey', 'Dual-Fuel', 'Flame Failure Safety'],
                applications: ['Home Cooking', 'Baking', 'Grilling'],
                cover_image_url: '/images/products/femaslux_60x60.jpg',
                attributes: {
                    dimensions: '60 cm x 60 cm',
                    burner_config: '2 Gas + 2 Electric (Optional configurations available)',
                    material: 'Durable stainless steel or powder-coated body',
                    colors: 'White, Silver, Black',
                    oven_functions: 'Bake, Roast, Grill',
                    interior_finish: 'Easy-clean Enamel Coating',
                    safety_features: 'Flame Failure Device (FFD)'
                }
            },
            {
                name: 'Lux Compact Round Oven (1300W)',
                slug: 'lux-compact-round-oven-1300w',
                sku: 'LUX-RND-1300',
                model_number: 'LUX-RND-1300',
                category_slug: 'compact-round-ovens',
                brand_name: 'Lux',
                short_description: 'Bake, Grill & Roast in One Compact Design. Space-saving round oven specifically tailored for wide, flat foods like injera and large pizzas.',
                detailed_description: 'Upgrade your kitchen setup with the Lux Round Oven! Built with durable Turkish quality, this stylish and spacious round oven is the ultimate space-saving solution. Whether you are baking traditional injera, crisping up a pizza, or roasting Sunday dinner, its unique design ensures perfect, even cooking every single time.',
                base_price: 12000.00,
                stock_status: 'in_stock',
                is_featured: true,
                badge: ['Made in Turkey', '1300W Power', 'Perfect for Injera'],
                applications: ['Injera Baking', 'Pizza Baking', 'Pastries', 'Roasting'],
                cover_image_url: '/images/products/lux_round_oven.jpg',
                attributes: {
                    power_output: '1300 Watts',
                    shape_design: 'Spacious Round Interior',
                    oven_functions: 'Bake, Grill, Roast',
                    best_used_for: 'Injera, Pizza, Pastries, Roasting',
                    efficiency: 'High energy efficiency, Easy-clean interior'
                }
            },
            {
                name: 'Femaslux 50x50 Freestanding Dual-Fuel Stove & Oven',
                slug: 'femaslux-50x50-freestanding-dual-fuel-stove-oven',
                sku: 'FEM-5050-DF',
                model_number: 'FEM-5050-DF',
                category_slug: 'freestanding-stoves-ovens',
                brand_name: 'Femaslux',
                short_description: 'Ultra-Compact Design for Cozier Kitchens. Professional-style home cooking in a space-saving 50x50 cm footprint.',
                detailed_description: 'Enjoy professional-style home cooking without sacrificing valuable floor space. The Femaslux 50x50 cm Freestanding Stove offers the exact same high-quality Turkish manufacturing and dual-fuel versatility as our standard model, but in a highly compact footprint. It is the perfect all-in-one cooking station for smaller kitchens, apartments, or cozy homes.',
                base_price: 38000.00,
                stock_status: 'in_stock',
                is_featured: false,
                badge: ['Made in Turkey', 'Ultra-Compact', 'Flame Failure Safety'],
                applications: ['Cozy Kitchens', 'Apartments', 'Limited Space'],
                cover_image_url: '/images/products/femaslux_50x50_df.jpg',
                attributes: {
                    dimensions: '50 cm x 50 cm',
                    burner_config: '2 Gas + 2 Electric Burners',
                    material: 'Durable stainless steel or powder-coated body',
                    colors: 'White, Silver, Black',
                    oven_functions: 'Bake, Roast, Grill',
                    interior_finish: 'Easy-clean Enamel Coating',
                    safety_features: 'Flame Failure Device (FFD)'
                }
            },
            {
                name: 'Femaslux 60x90 Freestanding 6-Burner Dual-Fuel Stove & Oven',
                slug: 'femaslux-60x90-freestanding-6-burner-dual-fuel-stove-oven',
                sku: 'FEM-6090-DF',
                model_number: 'FEM-6090-DF',
                category_slug: 'freestanding-stoves-ovens',
                brand_name: 'Femaslux',
                short_description: 'The Ultimate Professional Setup for Large Families. Expansive cooktop featuring 6 burners and an extra-large capacity oven.',
                detailed_description: 'Take your culinary capabilities to the next level with the expansive Femaslux 60x90 cm Freestanding Stove. Designed for large families, passionate home chefs, and entertaining, this extra-wide cooking range features a massive 6-burner cooktop. Prepare multiple dishes simultaneously with ease while utilizing the extra-large capacity oven to bake and roast grand meals.',
                base_price: 65000.00,
                stock_status: 'in_stock',
                is_featured: true,
                badge: ['Made in Turkey', '6-Burner Cooktop', 'Extra-Large Oven'],
                applications: ['Large Families', 'Entertaining', 'Passionate Home Chefs'],
                cover_image_url: '/images/products/femaslux_60x90.jpg',
                attributes: {
                    dimensions: '60 cm x 90 cm',
                    burner_config: '4 Gas + 2 Electric Burners',
                    material: 'Durable stainless steel or powder-coated body',
                    colors: 'White, Silver, Black',
                    oven_functions: 'Bake, Roast, Grill',
                    interior_finish: 'Easy-clean Enamel Coating',
                    safety_features: 'Flame Failure Device (FFD)'
                }
            },
            {
                name: 'Femaslux 50x50 Freestanding All-Electric Stove & Oven',
                slug: 'femaslux-50x50-freestanding-all-electric-stove-oven',
                sku: 'FEM-5050-EL',
                model_number: 'FEM-5050-EL',
                category_slug: 'freestanding-stoves-ovens',
                brand_name: 'Femaslux',
                short_description: 'Sleek, Compact, and 100% Gas-Free setup. Perfect for modern apartments and homes looking for completely electric operation.',
                detailed_description: 'Modern cooking meets ultimate convenience with the Femaslux 50x50 cm All-Electric Stove. Completely eliminating the need for gas lines, this freestanding unit is perfect for modern apartments, dorms, or homes looking for a fully electric setup. It packs premium baking, roasting, and stovetop capabilities into a highly space-efficient design.',
                base_price: 39500.00,
                stock_status: 'in_stock',
                is_featured: false,
                badge: ['Made in Turkey', 'All-Electric', '100% Gas-Free'],
                applications: ['Modern Apartments', 'Dorms', 'Gas-Free Setup'],
                cover_image_url: '/images/products/femaslux_50x50_el.jpg',
                attributes: {
                    dimensions: '50 cm x 50 cm',
                    burner_config: '4 Electric Burners (No Gas)',
                    material: 'Durable stainless steel or powder-coated body',
                    colors: 'White, Silver, Black',
                    oven_functions: 'Bake, Roast, Grill',
                    interior_finish: 'Easy-clean Enamel Coating',
                    safety_features: 'Thermostat regulated; Gas-free operation'
                }
            },
            {
                name: 'Premium Custom-Made Kitchen Cabinet System',
                slug: 'premium-custom-made-kitchen-cabinet-system',
                sku: 'FEM-CAB-CUST',
                model_number: 'FEM-CAB-CUST',
                category_slug: 'kitchen-cabinetry',
                brand_name: 'Custom Design',
                short_description: 'Transform Your Kitchen with Tailor-Made Elegance. Bespoke design using imported Turkish materials, modular configurations, and granite countertops.',
                detailed_description: 'Turn your dream kitchen into a reality with our fully Custom-Made Kitchen Cabinet System. We understand that the kitchen is the heart of the home, which is why we offer bespoke design services tailored exactly to your unique floor plan and lifestyle. Featuring imported, premium materials and smart storage solutions, this is more than just cabinetry—it is a complete, personalized kitchen transformation built to last a lifetime.',
                base_price: null,
                stock_status: 'pre_order',
                is_featured: true,
                badge: ['Bespoke Sizing', 'Imported Turkish Wood', 'Granite Countertops', 'Seamless Integration'],
                applications: ['Bespoke Integration', 'Kitchen Transformation', 'Smart Storage Solutions'],
                cover_image_url: '/images/products/custom_cabinet.jpg',
                attributes: {
                    dimensions: '100% Custom (Measured to fit your floor plan)',
                    cabinet_material: 'Premium Imported Turkish Wood',
                    countertop: 'Highly Durable Granite (Multiple color options available)',
                    sink_options: 'High-Quality Imported Turkish Sinks (Single or Double basin)',
                    appliance_fitting: 'Custom-cut for refrigerators, stoves, and all-in-one oven setups',
                    colors: 'Modular, Modern, Minimalist, or Traditional finishes'
                }
            }
        ];

        for (const p of productsList) {
            const product_id = randomUUID();
            const brand_id = getBrandId(p.brand_name);
            const category_id = getCategoryId(p.category_slug);

            // Insert into products table
            await connection.query(
                `INSERT INTO products (
                    product_id, category_id, brand_id, name, slug, sku, model_number,
                    short_description, detailed_description, base_price, stock_status,
                    is_featured, badge, applications, is_active, cover_image_url, gallery_images,
                    video_urls, documents, guide_instruction_images, guide_instruction_video_urls
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?)`,
                [
                    product_id, category_id, brand_id, p.name, p.slug, p.sku, p.model_number,
                    p.short_description, p.detailed_description, p.base_price, p.stock_status,
                    p.is_featured ? 1 : 0, JSON.stringify(p.badge), JSON.stringify(p.applications),
                    p.cover_image_url, JSON.stringify([]), JSON.stringify([]), JSON.stringify([]),
                    JSON.stringify([]), JSON.stringify([])
                ]
            );

            // Insert attribute values
            for (const [code, val] of Object.entries(p.attributes)) {
                const attribute_id = getAttrId(code);
                const valId = randomUUID();

                let valText = val;
                let valNum = null;
                let valBool = null;

                await connection.query(
                    'INSERT INTO product_attribute_values (value_id, product_id, attribute_id, value_text, value_number, value_boolean) VALUES (?, ?, ?, ?, ?, ?)',
                    [valId, product_id, attribute_id, valText, valNum, valBool]
                );
            }
        }
        console.log('✅ Products and attribute values seeded.');

        // 5. Seed Company Profile
        console.log('📋 Seeding company profile...');
        const profileId = randomUUID();
        const coreValues = JSON.stringify([
            { title: 'Advanced Turkish Quality', desc: 'Renowned Turkish engineering and durable imported materials.' },
            { title: 'Tailored for Ethiopia', desc: 'Appliances and custom cabinetry optimized for Ethiopian lifestyles and local home layouts.' },
            { title: 'Seamless Integration', desc: 'Bespoke cabinet-to-appliance installation for beautiful kitchen transformations.' }
        ]);

        const socialMedia = JSON.stringify({
            facebook: 'https://facebook.com/femaskitchen',
            telegram: 'https://t.me/femaskitchen',
            instagram: 'https://instagram.com/femaskitchen',
            tiktok: 'https://tiktok.com/@femaskitchen'
        });

        const physicalAddresses = JSON.stringify([
            { city: 'Addis Ababa', location: 'Bole Medhanialem, Mall Center, 2nd Floor, Office 204' }
        ]);

        const salesContacts = JSON.stringify([
            { name: 'Sales Representative', phone: '+251911223344', email: 'sales@femasappliances.com' }
        ]);

        const corporateContacts = JSON.stringify([
            { name: 'Femas Head Office', phone: '+251116639876', email: 'info@femasappliances.com' }
        ]);

        const reasonsWhyUs = JSON.stringify([
            'Advanced Turkish Technology & safety features like Flame Failure Safety Devices.',
            'Bespoke cabinetry systems designed locally with imported high-quality Turkish wood.',
            'All-in-one kitchen solutions from initial 3D designs to final installation.',
            'Durability and performance designed specifically for the Ethiopian style of cooking.'
        ]);

        await connection.query(
            `INSERT INTO company_profile (
                profile_id, legal_name, brand_name, tagline, year_established, mission, vision,
                core_values, description_brief, overview, address, phone, email, website,
                logo_light, logo_dark, reasons_why_us, corporate_contacts, sales_contacts,
                social_media, physical_addresses, primary_color, secondary_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                profileId,
                'Femas Kitchen Appliance',
                'Femas',
                'Advanced Turkish Quality, Tailored for Ethiopia',
                '2023',
                'To elevate the home cooking experience in Ethiopia by delivering premium Turkish appliances and beautifully integrated, custom-made kitchen cabinetry.',
                'To be the leading and most trusted provider of comprehensive kitchen transformations in East Africa, recognized for durability, Turkish manufacturing excellence, and bespoke designs.',
                coreValues,
                'Femas Kitchen Appliance provides high-quality Turkish stoves, compact round ovens, and premium custom-made kitchen cabinet systems in Addis Ababa, Ethiopia.',
                'Femas Kitchen Appliance is a premier provider of high-quality kitchen solutions in Addis Ababa, Ethiopia. For the past three years, we have specialized in bringing advanced Turkish technology and manufacturing excellence to the Ethiopian market, offering durable and professional-style appliances designed to elevate the home cooking experience. Our range includes freestanding stoves, compact round ovens, and bespoke cabinet systems.',
                'Bole Medhanialem, Addis Ababa, Ethiopia',
                '+251911223344',
                'info@femasappliances.com',
                'https://femasappliances.com',
                '/images/logo-light.png',
                '/images/logo-dark.png',
                reasonsWhyUs,
                corporateContacts,
                salesContacts,
                socialMedia,
                physicalAddresses,
                '#1a1a1a',
                '#C0C0C0'
            ]
        );
        console.log('✅ Company profile seeded.');

        // 6. Seed Site Settings
        console.log('📋 Seeding site settings...');
        await connection.query(
            `INSERT INTO site_settings (
                setting_id, company_name, tagline, primary_phone, secondary_phone,
                company_email, sales_email, support_email, address,
                facebook_url, telegram_url, whatsapp_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                randomUUID(),
                'Femas Kitchen Appliance',
                'Advanced Turkish Quality, Tailored for Ethiopia',
                '+251 911 22 3344',
                '+251 116 63 9876',
                'info@femasappliances.com',
                'sales@femasappliances.com',
                'support@femasappliances.com',
                'Bole Medhanialem, Addis Ababa, Ethiopia',
                'https://facebook.com/femaskitchen',
                'https://t.me/femaskitchen',
                '+251911223344'
            ]
        );
        console.log('✅ Site settings seeded.');

        console.log('\n🎉 All data injected successfully!');
    } catch (err) {
        console.error('❌ Error during data injection:', err);
        process.exit(1);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

injectData();
