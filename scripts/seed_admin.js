/**
 * Seed Admin User Script
 * =======================
 * Creates the first admin user with a bcrypt-hashed password.
 * Run once per deployment:
 *
 *   node scripts/seed_admin.js --email mesay308@gmail.com --password YourSecurePass123
 *
 * Or with npm script:
 *   npm run seed:admin -- --email mesay308@gmail.com --password YourSecurePass123
 */
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables from backend/.env
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

const BCRYPT_SALT_ROUNDS = parseInt(envString('BCRYPT_SALT_ROUNDS') || '12', 10) || 12;

async function seedAdmin() {
    // Parse CLI arguments
    const args = process.argv.slice(2);
    let email = '';
    let password = '';
    let fullName = 'Admin';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--email' && args[i + 1]) email = args[++i];
        if (args[i] === '--password' && args[i + 1]) password = args[++i];
        if (args[i] === '--name' && args[i + 1]) fullName = args[++i];
    }

    if (!email || !password) {
        console.error('❌ Usage: node scripts/seed_admin.js --email <email> --password <password> [--name "Full Name"]');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
    }

    // Connect to database
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
        console.log('🔌 Connected to database.');

        // Check if users table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        if (tables.length === 0) {
            // Seed roles table if it doesn't exist
            const [roleTables] = await connection.query("SHOW TABLES LIKE 'roles'");
            if (roleTables.length === 0) {
                console.log('📋 Creating roles table...');
                await connection.query(`
                    CREATE TABLE roles (
                        role_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                        name VARCHAR(100) NOT NULL,
                        permissions JSON NOT NULL,
                        is_system_admin BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    );
                `);
            }

            console.log('📋 Creating users table...');
            await connection.query(`
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
            `);
            console.log('✅ Users and roles tables created.');
        }

        // Get or create Super Admin role
        const [roles] = await connection.query('SELECT role_id FROM roles WHERE is_system_admin = TRUE');
        let superAdminRoleId;
        if (roles.length === 0) {
            const defaultPermissions = JSON.stringify({
                "manage_product": {"view": true, "edit": true},
                "marketing": {"view": true, "edit": true},
                "company_data": {"view": true, "edit": true},
                "user_role": {"view": true, "edit": true}
            });
            await connection.query(
                'INSERT INTO roles (name, permissions, is_system_admin) VALUES (?, ?, ?)',
                ['Super Admin', defaultPermissions, true]
            );
            const [newRole] = await connection.query('SELECT role_id FROM roles WHERE is_system_admin = TRUE');
            superAdminRoleId = newRole[0].role_id;
            console.log('✅ Created Super Admin role.');
        } else {
            superAdminRoleId = roles[0].role_id;
        }

        // Check if user already exists
        const [existing] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log(`⚠️  User with email "${email}" already exists. Updating password and ensuring Super Admin role...`);
            const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
            await connection.query('UPDATE users SET password_hash = ?, full_name = ?, role_id = ?, updated_at = NOW() WHERE email = ?', [hash, fullName, superAdminRoleId, email]);
            console.log('✅ User updated successfully.');
        } else {
            // Create new admin user
            const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
            await connection.query(
                'INSERT INTO users (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
                [fullName, email, hash, superAdminRoleId]
            );
            console.log(`✅ Admin user created: ${email}`);
        }

        console.log('');
        console.log('🎉 Seed complete! You can now log in at /login with the credentials you provided.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

seedAdmin();
