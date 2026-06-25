require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

const username = process.argv[2] || process.env.SEED_ADMIN_USER || 'admin';
const password = process.argv[3] || process.env.SEED_ADMIN_PASS;

if (!password) {
  console.error('\nError: password is required.');
  console.error('Usage: node scripts/seedAdmin.js <username> <password>');
  console.error('   or: set SEED_ADMIN_USER and SEED_ADMIN_PASS in your .env\n');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`Admin "${username}" already exists. No changes made.`);
    process.exit(0);
  }

  await Admin.create({ username, password });
  console.log(`\n✓ Admin account created`);
  console.log(`  Username : ${username}`);
  console.log(`  Password : ${'*'.repeat(password.length)}`);
  console.log(`\nYou can now sign in at /admin/login\n`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
