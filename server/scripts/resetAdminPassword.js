require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('\nUsage: node scripts/resetAdminPassword.js <username> <new-password>\n');
  process.exit(1);
}

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Admin.findOne({ username });
  if (!admin) {
    console.error(`Admin "${username}" not found.`);
    process.exit(1);
  }
  admin.password = password;
  await admin.save();
  console.log(`\n✓ Password updated for "${username}"\n`);
  process.exit(0);
}

reset().catch(err => { console.error(err); process.exit(1); });
