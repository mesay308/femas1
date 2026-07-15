/**
 * Database Setup Script
 * =====================
 * Initializes the database schema from mysql_schema.sql.
 * Run once per deployment.
 *
 * Usage: node scripts/setup_database.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

/** Same trimming as backend/config/db.js */
function envString(key, altKey) {
    const raw = process.env[key] ?? (altKey ? process.env[altKey] : undefined);
    if (raw == null || raw === '') return undefined;
    let s = String(raw).trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
    }
    return s;
}

async function setupDatabase() {
    const dbPassword = envString('DB_PASSWORD', 'DB_PASS') || '';
    
    const dbSsl = envString('DB_SSL') === 'true' || !!envString('DB_SSL_CA_PATH') || !!envString('DB_SSL_CA');
    let sslConfig = null;
    if (dbSsl) {
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
        password: dbPassword,
        ssl: sslConfig,
        multipleStatements: true // Allow executing multiple queries from the file
    });

    try {
        console.log('🔌 Connected to MySQL server.');

        const dbName = envString('DB_NAME') || 'company_db';
        
        // Create database if it doesn't exist
        console.log(`📋 Creating database '${dbName}' if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        console.log(`✅ Using database '${dbName}'.`);

        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'mysql_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📋 Executing schema definitions...');
        await connection.query(schemaSql);

        console.log('✅ Schema executed successfully.');

        // Initialize site_settings if empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM site_settings');
        if (rows[0].count === 0) {
            console.log('📋 Initializing default site_settings...');
            await connection.query(`
                INSERT INTO site_settings (company_name, tagline, primary_phone)
                VALUES ('Your Company Name', 'Your Company Tagline', '+1234567890')
            `);
            console.log('✅ Default site_settings initialized.');
        }

        console.log('');
        console.log('🎉 Database setup complete!');
        console.log('Next step: Run node scripts/seed_admin.js to create the admin user.');

    } catch (err) {
        console.error('❌ Error during setup:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

setupDatabase();
