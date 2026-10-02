require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '001_init.sql'), 'utf8');
    await client.query(sql);
    console.log('Migration 001_init.sql applied successfully.');
  } finally { await client.end(); }
}
main().catch(err => { console.error(err.message); process.exit(1); });
