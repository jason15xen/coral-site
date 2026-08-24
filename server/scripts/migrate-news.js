'use strict';
// One-time migration: adds the `news` collection (seeded with the three
// mockup items) to an existing content.json that predates the News CMS.
// Safe to run repeatedly — does nothing if `news` already exists.
const fs = require('fs');
const path = require('path');
const { SEED_NEWS } = require('../store');

const file = path.join(__dirname, '..', 'data', 'content.json');
const c = JSON.parse(fs.readFileSync(file, 'utf8'));
if (Array.isArray(c.news)) {
  console.log('news already present (' + c.news.length + ' items) — nothing to do');
  process.exit(0);
}
c.news = SEED_NEWS;
const tmp = file + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(c, null, 2), 'utf8');
fs.renameSync(tmp, file);
console.log('added news collection with ' + SEED_NEWS.length + ' seed items');
