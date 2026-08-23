'use strict';
// Usage: node scripts/set-password.js 'your-new-password'
const store = require('../store');
const pw = process.argv[2];
if (!pw || pw.length < 8) {
  console.error('Usage: node scripts/set-password.js <password>   (min 8 chars)');
  process.exit(1);
}
store.setPassword(pw);
console.log('Admin password updated (stored hashed in data/config.json).');
