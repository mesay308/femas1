const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mysql = require('mysql2/promise');

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
                name: 'Compact Round Ovens',
                slug: 'compact-round-ovens',
                description: 'Upgrade your kitchen setup with our selection of compact round ovens. Built with durable Turkish quality, these space-saving appliances are the ultimate solution for dorms, small apartments, or limited countertop spaces. With powerful yet energy-efficient heating, you can bake, grill, and roast with perfect, even heat distribution every single time.',
                short_description: 'Discover versatile, energy-efficient round ovens designed for small spaces, traditional injera, pizzas, and everyday roasting.',
                cover_image_url: '/images/categories/round-ovens.jpg',
                features: JSON.stringify([
                    {
                        title: 'Total Versatility',
                        description: 'Equipped with built-in grill, fan, and timer functions to handle everything from delicate pastries to roasted meats.'
                    },
                    {
                        title: 'Specialty Baking Design',
                        description: 'The spacious round interior is specifically tailored for wide, flat foods like traditional injera and large pizzas, ensuring edge-to-edge perfection.'
                    },
                    {
                        title: 'Energy Efficient',
                        description: 'Operates at a powerful 1300 watts, keeping your electricity bills low without sacrificing cooking performance.'
                    },
                    {
                        title: 'Space-Saving Footprint',
                        description: 'Highly compact and stylish design makes it the perfect addition to cozy kitchens and limited spaces.'
                    }
                ]),
                hero_config: JSON.stringify({
                    headline: 'Space-Saving Ovens for Perfect Specialty Baking',
                    subheadline: 'Discover versatile, energy-efficient round ovens designed for small spaces, traditional injera, pizzas, and everyday roasting.',
                    cta_primary: { label: 'Explore Ovens', link: '#category-products' },
                    cta_secondary: { label: 'Inquire Now', link: '/contact' },
                    trust_badges: [
                        { label: '1300W Power' },
                        { label: 'Made in Turkey' },
                        { label: 'Perfect for Injera' }
                    ]
                }),
                meta_title: 'Compact Round Ovens | Femas Kitchen Appliance',
                meta_description: 'Upgrade your kitchen with our selection of Turkish-made compact round ovens. Energy-efficient 1300W design perfect for baking traditional injera, pizza, and pastries.'
            },
            {
                name: 'Freestanding Stoves & Ovens',
                slug: 'freestanding-stoves-ovens',
                description: 'Bring family meals to life with our premium collection of freestanding stoves and ovens. Manufactured in Turkey, these appliances combine durable stainless steel or powder-coated bodies with easy-to-clean enamel interiors. Whether you need an ultra-compact 50x50 cm unit for a cozy space, a standard 60x60 cm fit, or a massive 60x90 cm range for entertaining large families, our selection offers versatile cooking configurations to match your culinary needs.',
                short_description: 'From compact all-electric models to expansive 6-burner dual-fuel ranges, find the perfect freestanding stove and oven for your home.',
                cover_image_url: '/images/categories/stoves.jpg',
                features: JSON.stringify([
                    {
                        title: 'Versatile Configurations',
                        description: 'Choose between dual-fuel (gas and electric) or all-electric cooktops to perfectly suit your cooking style and home infrastructure.'
                    },
                    {
                        title: 'Multifunctional Built-In Ovens',
                        description: 'Fully equipped to bake, roast, and grill, featuring precision thermostats and clear interior lighting so you can monitor your meals.'
                    },
                    {
                        title: 'Ultimate Safety',
                        description: 'Gas-enabled models feature a Flame Failure Safety Device (FFD) that automatically cuts off the gas supply if the burner flame is accidentally extinguished.'
                    },
                    {
                        title: 'Multiple Size Options',
                        description: 'Available in ultra-compact (50x50 cm), standard (60x60 cm), and extra-wide (60x90 cm) footprints to accommodate any floor plan.'
                    },
                    {
                        title: 'Effortless Cleanup',
                        description: 'The smooth, durable enamel-coated interior makes wiping away grease and food splatters fast and simple.'
                    }
                ]),
                hero_config: JSON.stringify({
                    headline: 'Professional-Style Cooking for Every Kitchen',
                    subheadline: 'From compact all-electric models to expansive 6-burner dual-fuel ranges, find the perfect freestanding stove and oven for your home.',
                    cta_primary: { label: 'Explore Stoves', link: '#category-products' },
                    cta_secondary: { label: 'Inquire Now', link: '/contact' },
                    trust_badges: [
                        { label: 'Flame Failure Device' },
                        { label: 'Made in Turkey' },
                        { label: 'Enamel Coating' }
                    ]
                }),
                meta_title: 'Freestanding Stoves & Ovens | Femas Kitchen Appliance',
                meta_description: 'Discover Femaslux freestanding stoves and ovens. Premium Turkish dual-fuel and all-electric models available in 50x50, 60x60, and 60x90 sizes.'
            },
            {
                name: 'Premium Kitchen Cabinetry',
                slug: 'kitchen-cabinetry',
                description: 'Turn your dream kitchen into reality with our fully Custom-Made Kitchen Cabinet Systems. Designed specifically for your unique floor plan and lifestyle, our bespoke cabinetry solutions offer a flawless fit with zero wasted space. Crafted from moisture-resistant Turkish wood and topped with luxury granite, these modular systems provide an end-to-end transformation that beautifully integrates your ovens, sinks, and other essential appliances.',
                short_description: 'Bespoke cabinetry systems featuring premium imported woods, highly durable granite countertops, and seamless appliance integration.',
                cover_image_url: '/images/categories/cabinets.jpg',
                features: JSON.stringify([
                    {
                        title: 'Perfectly Tailored Sizing',
                        description: 'Every cabinet is uniquely designed and measured based on your specific kitchen floor plan, ensuring a flawless fit.'
                    },
                    {
                        title: 'Premium Imported Materials',
                        description: 'Constructed using high-quality, moisture-resistant wood imported directly from Turkey for stunning aesthetics and unmatched durability.'
                    },
                    {
                        title: 'Luxury Granite Countertops',
                        description: 'Topped with highly durable, scratch-resistant, and heat-resistant granite, providing a gorgeous workspace for all your culinary needs.'
                    },
                    {
                        title: 'Seamless Appliance Integration',
                        description: 'Custom-cut to seamlessly accommodate your refrigerators, freestanding or built-in stoves, and custom Turkish sink options.'
                    },
                    {
                        title: 'End-to-End Service',
                        description: 'Comprehensive design support, from the initial measurements and 3D modeling to the final, perfect installation.'
                    }
                ]),
                hero_config: JSON.stringify({
                    headline: 'Transform Your Kitchen with Tailor-Made Elegance',
                    subheadline: 'Bespoke cabinetry systems featuring premium imported woods, highly durable granite countertops, and seamless appliance integration.',
                    cta_primary: { label: 'Explore Cabinetry', link: '#category-products' },
                    cta_secondary: { label: 'Request Quote', link: '/contact' },
                    trust_badges: [
                        { label: 'Imported Turkish Wood' },
                        { label: 'Granite Countertops' },
                        { label: 'Bespoke Custom Fitting' }
                    ]
                }),
                meta_title: 'Premium Custom Kitchen Cabinetry | Femas Kitchen Appliance',
                meta_description: 'Custom-made kitchen cabinet systems crafted from premium moisture-resistant Turkish wood and luxury granite countertops in Addis Ababa.'
            }
        ];

        console.log('📋 Processing categories update with user data...');
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const displayOrder = i;

            const [existing] = await connection.query('SELECT category_id FROM categories WHERE slug = ?', [cat.slug]);

            if (existing.length > 0) {
                const categoryId = existing[0].category_id;
                console.log(`Updating existing category: ${cat.name} (${cat.slug})`);
                await connection.query(
                    `UPDATE categories 
                     SET name = ?, description = ?, short_description = ?, cover_image_url = ?, features = ?, hero_config = ?, meta_title = ?, meta_description = ?, is_active = TRUE, display_order = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE category_id = ?`,
                    [cat.name, cat.description, cat.short_description, cat.cover_image_url, cat.features, cat.hero_config, cat.meta_title, cat.meta_description, displayOrder, categoryId]
                );
            } else {
                console.log(`⚠️ Category not found for slug: ${cat.slug}`);
            }
        }

        console.log('\n🎉 Category update complete!');

    } catch (err) {
        console.error('❌ Error during category update:', err);
        process.exit(1);
    } finally {
        await connection.end();
        process.exit(0);
    }
}
run();
