const mysql = require('mysql2/promise');

async function run() {
    const newPool = await mysql.createConnection({
        host: '91.204.209.39', user: 'btbethre_hpadmin', password: 'Admin2026@hpadmin', database: 'btbethre_femas'
    });
    
    await newPool.query(`DROP TABLE IF EXISTS company_profile`);
    await newPool.query(`
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
            expertise JSON,
            service_portfolio JSON,
            reasons_why_us JSON,
            corporate_contacts JSON,
            sales_contacts JSON,
            dedicated_admin JSON,
            social_media JSON,
            physical_addresses JSON,
            industry_verticals JSON,
            engineering_specialties JSON,
            primary_color VARCHAR(50),
            secondary_color VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);
    console.log("Created table company_profile");
    await newPool.end();
}
run().catch(console.error);
