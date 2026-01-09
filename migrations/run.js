import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple migration runner.
 * Runs SQL files in the migrations folder in order.
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'ai_assistant',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
});

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map((row) => row.name);
}

async function markMigrationAsExecuted(name) {
  await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
}

async function getMigrationFiles() {
  const files = fs.readdirSync(__dirname);
  return files
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function runMigration(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  await pool.query(sql);
}

async function main() {
  console.log('🗃️  Running database migrations...\n');

  try {
    await createMigrationsTable();
    
    const executedMigrations = await getExecutedMigrations();
    const migrationFiles = await getMigrationFiles();
    
    const pendingMigrations = migrationFiles.filter(
      (f) => !executedMigrations.includes(f)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations.\n');
      return;
    }

    for (const migration of pendingMigrations) {
      console.log(`Running: ${migration}`);
      
      try {
        await runMigration(migration);
        await markMigrationAsExecuted(migration);
        console.log(`  ✓ Completed\n`);
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}\n`);
        throw error;
      }
    }

    console.log(`\n✅ Successfully ran ${pendingMigrations.length} migration(s).\n`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

