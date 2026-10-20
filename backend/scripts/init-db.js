require('dotenv').config();
// Use the PostgreSQL config whenever DATABASE_URL is provided, regardless of NODE_ENV
if (process.env.DATABASE_URL) process.env.NODE_ENV = 'production';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, knex } = require('../src/models');

async function seedUsersIfEmpty() {
  const [{ count }] = await db.users().count('id as count');
  if (parseInt(count) > 0) {
    console.log('Users already exist — skipping user seed');
    return;
  }
  const hash = await bcrypt.hash('Password123!', 12);
  const users = [
    { id: uuidv4(), username: 'admin', email: 'admin@chws.gov', password_hash: hash, first_name: 'System', last_name: 'Admin', role: 'admin', phone: '+254700100001', is_active: true },
    { id: uuidv4(), username: 'manager', email: 'manager@chws.gov', password_hash: hash, first_name: 'Jane', last_name: 'Wanjiku', role: 'manager', phone: '+254700100002', is_active: true },
    { id: uuidv4(), username: 'chw1', email: 'chw1@chws.gov', password_hash: hash, first_name: 'John', last_name: 'Kamau', role: 'chw', phone: '+254700100003', is_active: true },
    { id: uuidv4(), username: 'chw2', email: 'chw2@chws.gov', password_hash: hash, first_name: 'Mary', last_name: 'Achieng', role: 'chw', phone: '+254700100004', is_active: true },
  ];
  for (const u of users) await db.users().insert(u);
  console.log('Seeded users: admin / manager / chw1 / chw2 (password: Password123!)');
}

async function seedDepartmentsIfEmpty() {
  const [{ count }] = await db.departments().count('id as count');
  if (parseInt(count) > 0) {
    console.log('Departments already exist — skipping department seed');
    return;
  }
  const departments = [
    { name: 'Outpatient Department (OPD)', code: 'OPD', description: 'General outpatient consultations and treatment', display_order: 1 },
    { name: 'Triage', code: 'TRI', description: 'Initial assessment, vitals and patient prioritisation', display_order: 2 },
    { name: 'Maternity / Obstetrics & Gynaecology', code: 'MAT', description: 'Antenatal, labour, delivery and gynaecology care', display_order: 3 },
    { name: 'Pediatrics', code: 'PED', description: 'Care for infants, children and adolescents', display_order: 4 },
    { name: 'Surgery', code: 'SUR', description: 'Surgical consultations and theatre services', display_order: 5 },
    { name: 'Orthopedics', code: 'ORT', description: 'Bone, joint and musculoskeletal care', display_order: 6 },
    { name: 'Ophthalmology', code: 'OPH', description: 'Eye care and vision services', display_order: 7 },
    { name: 'Ear, Nose & Throat (ENT)', code: 'ENT', description: 'ENT consultations and procedures', display_order: 8 },
    { name: 'Dental', code: 'DEN', description: 'Dental and oral health services', display_order: 9 },
    { name: 'Mental Health', code: 'MHC', description: 'Psychiatric and counselling services', display_order: 10 },
    { name: 'Laboratory', code: 'LAB', description: 'Diagnostic laboratory and pathology services', display_order: 11 },
    { name: 'Radiology / Imaging', code: 'RAD', description: 'X-ray, ultrasound and imaging services', display_order: 12 },
    { name: 'Pharmacy', code: 'PHA', description: 'Medication dispensing and pharmaceutical care', display_order: 13 },
    { name: 'Nutrition / Dietetics', code: 'NUT', description: 'Nutrition assessment and dietary counselling', display_order: 14 },
    { name: 'Chronic Care Clinic', code: 'CHR', description: 'Long-term conditions: diabetes, hypertension, HIV, TB', display_order: 15 },
  ];
  await db.departments().insert(
    departments.map((d) => ({ id: uuidv4(), ...d, is_active: true }))
  );
  console.log(`Seeded ${departments.length} departments`);
}

(async () => {
  const client = knex.client.config.client;
  console.log(`Database client: ${client}`);
  if (client === 'pg' && !process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set. Set it first, e.g.:');
    console.error('  PowerShell: $env:DATABASE_URL="postgres://..."; npm run db:init');
    process.exit(1);
  }
  console.log('Running migrations...');
  const [batch, applied] = await knex.migrate.latest();
  console.log(`Migration batch ${batch}: ${applied.length ? applied.join(', ') : 'none pending'}`);
  await seedUsersIfEmpty();
  await seedDepartmentsIfEmpty();
  console.log('Database ready');
  await knex.destroy();
})().catch((err) => {
  console.error('Database init failed:', err.message);
  process.exit(1);
});
