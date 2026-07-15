const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const db = require('../backend/config/db');
const { randomUUID } = require('crypto');

async function injectProfileData() {
    try {
        console.log('🔌 Connecting to database via backend/config/db...');

        // Wipe existing profile data
        console.log('🧹 Wiping existing company profile...');
        await db.query('TRUNCATE TABLE company_profile');
        
        // 1. Seed Company Profile with creative rich data based on Femas.md
        console.log('📋 Injecting enriched company profile data...');
        const profileId = randomUUID();
        
        const coreValues = JSON.stringify([
            { title: 'Excellence in Engineering', desc: 'Bringing renowned, advanced Turkish manufacturing technology to every product we offer.' },
            { title: 'Tailored for Local Lifestyles', desc: 'Designing solutions specifically for Ethiopian homes, from round ovens for injera to space-saving custom cabinetry.' },
            { title: 'Seamless Integration', desc: 'Delivering end-to-end bespoke kitchen transformations with perfect appliance-to-cabinetry fit.' },
            { title: 'Uncompromising Durability', desc: 'Using high-quality materials built to withstand daily heavy use while maintaining elegant aesthetics.' }
        ]);

        const socialMedia = JSON.stringify({
            facebook: 'https://facebook.com/femaskitchen',
            telegram: 'https://t.me/femaskitchen',
            instagram: 'https://instagram.com/femaskitchen',
            tiktok: 'https://tiktok.com/@femaskitchen'
        });

        const physicalAddresses = JSON.stringify([
            { city: 'Addis Ababa', location: 'Bole Medhanialem, Mall Center, 2nd Floor, Office 204' },
            { city: 'Addis Ababa', location: 'Bole Olympia, Showroom and Design Center' }
        ]);

        const salesContacts = JSON.stringify([
            { name: 'Primary Sales', phone: '+251911223344', email: 'sales@femasappliances.com' },
            { name: 'Custom Cabinetry Division', phone: '+251922334455', email: 'design@femasappliances.com' }
        ]);

        const corporateContacts = JSON.stringify([
            { name: 'Femas Head Office', phone: '+251116639876', email: 'info@femasappliances.com' }
        ]);

        const reasonsWhyUs = JSON.stringify([
            'Exclusive access to advanced Turkish technology and safety innovations like Flame Failure Safety Devices.',
            'Bespoke cabinetry systems designed locally with imported premium, moisture-resistant Turkish wood.',
            'Comprehensive, all-in-one kitchen solutions: from initial 3D design to final professional installation.',
            'Products explicitly crafted for the Ethiopian style of cooking, ensuring longevity and optimal performance.'
        ]);

        const industryVerticals = JSON.stringify([
            'Residential Kitchen Appliances',
            'Bespoke Interior Design & Cabinetry',
            'Real Estate & Property Development Partnerships'
        ]);

        const engineeringSpecialties = JSON.stringify([
            'Precision Appliance Integration',
            'Space Optimization & Ergonomics',
            'Modular Cabinet Configurations',
            'Dual-Fuel & Energy-Efficient Technologies'
        ]);

        const expertise = JSON.stringify([
            'Turkish Manufacturing Standards',
            'Custom Cabinetry Design & Assembly',
            'Modern Kitchen Transformations',
            'Specialty Appliance Sourcing (Round Ovens)'
        ]);

        const servicePortfolio = JSON.stringify([
            'Retail & Wholesale Appliance Sales',
            'Custom Kitchen Cabinetry Design',
            'Professional Installation Services',
            'End-to-End Kitchen Renovation Consultation'
        ]);

        const dedicatedAdmin = JSON.stringify({
            contact_person: 'Admin User',
            role: 'System Administrator',
            contact_email: 'mesay308@gmail.com'
        });

        await db.query(
            `INSERT INTO company_profile (
                profile_id, legal_name, brand_name, tagline, year_established, mission, vision,
                core_values, description_brief, overview, address, phone, email, website,
                logo_light, logo_dark, reasons_why_us, corporate_contacts, sales_contacts,
                dedicated_admin, social_media, physical_addresses, industry_verticals,
                engineering_specialties, expertise, service_portfolio, primary_color, secondary_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                profileId,
                'Femas Kitchen Appliance',
                'Femas',
                'Advanced Turkish Quality, Tailored for Ethiopia',
                '2021',
                'To elevate the home cooking experience in Ethiopia by delivering premium Turkish appliances and beautifully integrated, custom-made kitchen cabinetry that solves everyday culinary needs.',
                'To be the leading and most trusted provider of comprehensive kitchen transformations in East Africa, recognized for durability, Turkish manufacturing excellence, and bespoke ergonomic designs.',
                coreValues,
                'Femas Kitchen Appliance is a premier provider of high-quality kitchen solutions in Addis Ababa, specializing in Turkish technology and custom cabinetry.',
                'Femas Kitchen Appliance is a premier provider of high-quality kitchen solutions in Addis Ababa, Ethiopia. For the past three years, we have specialized in bringing advanced Turkish technology and manufacturing excellence to the Ethiopian market, offering durable and professional-style appliances designed to elevate the home cooking experience. Our comprehensive product range includes a diverse selection of freestanding dual-fuel and all-electric stoves, energy-efficient compact round ovens, and premium custom-made kitchen cabinetry systems. We pride ourselves on delivering long-lasting products that combine functionality with elegant design, ensuring every kitchen we touch is both beautiful and efficient.',
                'Bole Medhanialem, Addis Ababa, Ethiopia',
                '+251 911 22 3344',
                'info@femasappliances.com',
                'https://femasappliances.com',
                '/images/logo-light.png',
                '/images/logo-dark.png',
                reasonsWhyUs,
                corporateContacts,
                salesContacts,
                dedicatedAdmin,
                socialMedia,
                physicalAddresses,
                industryVerticals,
                engineeringSpecialties,
                expertise,
                servicePortfolio,
                '#1a1a1a',
                '#C0C0C0'
            ]
        );
        console.log('✅ Enriched company profile seeded.');

        console.log('\n🎉 Company profile data injected successfully!');
    } catch (err) {
        console.error('❌ Error during data injection:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

injectProfileData();
