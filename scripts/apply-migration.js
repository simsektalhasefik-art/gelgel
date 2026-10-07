const { Client } = require('pg');
const fs = require('fs');

const envText = fs.readFileSync(__dirname + '/../.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([^=#]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
const ref = process.env.SUPABASE_PROJECT_REF;
const url = `postgresql://postgres.${ref}:${password}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`;

const file = process.argv[2];
const sql = fs.readFileSync(file, 'utf8');

(async () => {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('OK: applied', file);
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
