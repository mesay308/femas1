const mysql = require('mysql2/promise');

async function runMigration() {
    console.log('🚀 Starting Femas Database Migration...');

    // Source DB Configuration (Old Femas Host)
    const srcConfig = {
        host: '91.204.209.39',
        port: 3306,
        user: 'btbethre_hpadmin',
        password: 'Admin2026@hpadmin',
        database: 'btbethre_femas',
        connectTimeout: 30000
    };

    // Target DB Configuration (New Femas Host)
    const tgtConfig = {
        host: '185.73.8.1',
        port: 3306,
        user: 'VAMAdmin',
        password: 'd7GMW}am~SYZJhRv',
        database: 'femas',
        connectTimeout: 30000
    };

    console.log(`🔌 Connecting to SOURCE database: ${srcConfig.database} @ ${srcConfig.host}...`);
    let sourceConnection;
    try {
        sourceConnection = await mysql.createConnection(srcConfig);
        console.log('✅ Connected to SOURCE database.');
    } catch (err) {
        console.error('❌ Failed to connect to SOURCE database:', err.message);
        console.log('💡 Note: This is expected if your local IP is blocked by the old server firewall.');
        console.log('   The script is saved for you or the user to run on a whitelisted machine.');
        process.exit(1);
    }

    console.log(`🔌 Connecting to TARGET database: ${tgtConfig.database} @ ${tgtConfig.host}...`);
    let targetConnection;
    try {
        targetConnection = await mysql.createConnection(tgtConfig);
        console.log('✅ Connected to TARGET database.');
    } catch (err) {
        console.error('❌ Failed to connect to TARGET database:', err.message);
        await sourceConnection.end();
        process.exit(1);
    }

    try {
        // Disable Foreign Key Checks on Target to allow clean drop & recreate
        console.log('🔐 Disabling foreign key checks on target database...');
        await targetConnection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Retrieve list of tables from Source
        const [tablesResult] = await sourceConnection.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
        const dbNameKey = Object.keys(tablesResult[0] || {})[0] || 'Tables_in_database';
        const tables = tablesResult.map(r => r[dbNameKey]);
        console.log(`📋 Found ${tables.length} tables to migrate:`, tables);

        // Migrate each table
        for (const table of tables) {
            console.log(`\n----------------------------------------`);
            console.log(`📦 Table: [${table}]`);

            // Get Create Table Statement from Source
            const [createResult] = await sourceConnection.query(`SHOW CREATE TABLE \`${table}\``);
            let createSql = createResult[0]['Create Table'];

            // Patch MySQL 8+ syntax issues (wrap functions in parentheses)
            createSql = createSql.replace(/DEFAULT\s+uuid\(\)/gi, 'DEFAULT (uuid())');
            createSql = createSql.replace(/DEFAULT\s+json_array\(\)/gi, 'DEFAULT (json_array())');
            createSql = createSql.replace(/DEFAULT\s+json_object\(\)/gi, 'DEFAULT (json_object())');
            createSql = createSql.replace(/charset=utf8mb3/gi, 'CHARSET=utf8mb4');
            createSql = createSql.replace(/utf8mb3_unicode_ci/gi, 'utf8mb4_unicode_ci');
            createSql = createSql.replace(/utf8mb3_general_ci/gi, 'utf8mb4_general_ci');

            // Drop existing table on target
            console.log(`  - Recreating table on target...`);
            await targetConnection.query(`DROP TABLE IF EXISTS \`${table}\``);
            await targetConnection.query(createSql);
            console.log(`  - Schema successfully created.`);

            // Get data from source
            const [rows] = await sourceConnection.query(`SELECT * FROM \`${table}\``);
            console.log(`  - Found ${rows.length} rows in source.`);

            if (rows.length > 0) {
                const columns = Object.keys(rows[0]);
                const insertQuery = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES ?`;

                // Chunk and insert
                const CHUNK_SIZE = 500;
                let rowsCopied = 0;

                for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                    const chunk = rows.slice(i, i + CHUNK_SIZE);
                    
                    // Format values: ensure JSON columns are stringified and nulls/dates are handled
                    const values = chunk.map(row => columns.map(c => {
                        const val = row[c];
                        if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                            return JSON.stringify(val);
                        }
                        return val === undefined ? null : val;
                    }));

                    await targetConnection.query(insertQuery, [values]);
                    rowsCopied += chunk.length;
                    console.log(`  - Bulk inserted ${rowsCopied}/${rows.length} rows...`);
                }
                console.log(`  ✅ Successfully copied ${rows.length} rows.`);
            } else {
                console.log(`  - Table is empty; schema initialized.`);
            }
        }

        console.log(`\n----------------------------------------`);
        console.log('🎉 Migration to the new database completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed with error:', error);
    } finally {
        // Re-enable foreign key checks on target
        console.log('🔐 Re-enabling foreign key checks on target database...');
        try {
            await targetConnection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (err) {
            console.error('Failed to re-enable foreign key checks:', err.message);
        }

        // Close connections
        await sourceConnection.end();
        await targetConnection.end();
        console.log('🔌 Connections closed.');
    }
}

runMigration();
