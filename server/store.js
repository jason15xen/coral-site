'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Illustration scenes available in index.html (<symbol id="sc-...">)
const SCENES = ['sc-reef', 'sc-room', 'sc-villa', 'sc-pool', 'sc-building', 'sc-coral', 'sc-staff', 'sc-bridge', 'sc-abstract'];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

// atomic write: temp file + rename
function writeJson(file, obj) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function getContent() {
  let c;
  if (!fs.existsSync(CONTENT_FILE)) {
    c = { services: [], works: [], recruit: {} };
  } else {
    try { c = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8')); }
    catch (e) { throw new Error('content.json is corrupt \u2014 refusing to load so a save cannot overwrite good data. Restore from data/content.json.bak.'); }
  }
  c.services = (c.services || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  c.works = (c.works || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  c.recruit = c.recruit || {};
  c.settings = c.settings || {};
  return c;
}

function saveContent(c) {
  try { if (fs.existsSync(CONTENT_FILE)) fs.copyFileSync(CONTENT_FILE, CONTENT_FILE + '.bak'); } catch (e) {}
  writeJson(CONTENT_FILE, c);
}

function nextId(prefix, list) {
  let n = 1;
  const ids = new Set(list.map(x => x.id));
  while (ids.has(prefix + n)) n++;
  return prefix + n;
}

function nextOrder(list) {
  return list.reduce((m, x) => Math.max(m, x.order || 0), 0) + 1;
}

// ---------- auth / config ----------
function scryptHash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function setPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = scryptHash(password, salt);
  const cfg = readJson(CONFIG_FILE, {});
  cfg.salt = salt;
  cfg.hash = hash;
  writeJson(CONFIG_FILE, cfg);
  return cfg;
}

function verifyPassword(password) {
  const cfg = readJson(CONFIG_FILE, null);
  if (!cfg || !cfg.salt || !cfg.hash) return false;
  const hash = scryptHash(password, cfg.salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(cfg.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function hasPassword() {
  const cfg = readJson(CONFIG_FILE, null);
  return !!(cfg && cfg.salt && cfg.hash);
}

// If ADMIN_PASSWORD env is set and no config yet (or FORCE_RESET), seed it.
function ensurePasswordFromEnv() {
  if (process.env.ADMIN_PASSWORD && (!hasPassword() || process.env.ADMIN_PASSWORD_FORCE === '1')) {
    setPassword(process.env.ADMIN_PASSWORD);
    return true;
  }
  return false;
}

module.exports = {
  SCENES, DATA_DIR,
  getContent, saveContent, nextId, nextOrder,
  setPassword, verifyPassword, hasPassword, ensurePasswordFromEnv,
};
