import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import logger from '../utils/logger';

const schemaPath = path.join(__dirname, 'schema.sql');

const runMigration = async () => {
  try {
    logger.info('Starting database migration...');

    // Read SQL schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = schema
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        logger.info(`Executed: ${statement.substring(0, 50)}...`);
      }
    }

    logger.info('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database migration failed:', error);
    process.exit(1);
  }
};

runMigration();













