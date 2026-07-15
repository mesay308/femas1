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
        console.log('🔌 Connected.');
        const [cats] = await connection.query('SELECT category_id, name, slug FROM categories');
        console.log('\n--- Categories in DB ---');
        console.log(cats);

        const [prods] = await connection.query('SELECT product_id, name, category_id FROM products');
        console.log('\n--- Products in DB ---');
        console.log(prods);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}
run();
