'use strict';
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const store = require('./store');
const render = require('./render');
const views = require('./adminviews');

const ROOT = path.join(__dirname, '..');            // the site root (index.html, assets/)
const TEMPLATE = path.join(ROOT, 'index.html');
const UPLOAD_DIR = path.join(ROOT, 'assets', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const PORT = process.env.PORT || 3000;
store.ensurePasswordFromEnv();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));

// ---- uploads ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, crypto.randomUUID() + ext);
  },
});
const okImage = (req, file, cb) => cb(null, /^image\//.test(file.mimetype));
const upload = multer({ storage, fileFilter: okImage, limits: { fileSize: 8 * 1024 * 1024 } });
const relUpload = (f) => 'assets/uploads/' + f.filename;
function removeUpload(src) {
  if (!src || typeof src !== 'string' || !src.startsWith('assets/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(src)), () => {});
}

// ---- static assets (incl. uploaded images) ----
app.use('/assets', express.static(path.join(ROOT, 'assets'), { maxAge: '7d' }));

// ================= PUBLIC SITE =================
let _tpl = { mtime: 0, html: '' };
function template() {
  const st = fs.statSync(TEMPLATE);
  if (st.mtimeMs !== _tpl.mtime) _tpl = { mtime: st.mtimeMs, html: fs.readFileSync(TEMPLATE, 'utf8') };
  return _tpl.html;
}
function injectBetween(html, marker, inner) {
  const a = `<!--CMS:${marker}-->`, b = `<!--/CMS:${marker}-->`;
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i === -1 || j === -1) return html;
  return html.slice(0, i + a.length) + inner + html.slice(j);
}
app.get('/', (req, res) => {
  const c = store.getContent();
  let html = template();
  html = injectBetween(html, 'SERVICES', render.servicesHtml(c.services));
  html = injectBetween(html, 'WORKS', render.worksHtml(c.works));
  html = injectBetween(html, 'RECRUIT_PAGE', render.recruitPageHtml(c.recruit));
  res.type('html').send(html);
});
app.get('/api/content', (req, res) => res.json(store.getContent()));

// ================= AUTH =================
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(24).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === '1', maxAge: 1000 * 60 * 60 * 8 },
}));

// brute-force limiter for login (in-memory, per client IP)
const loginHits = new Map();
const LOGIN_MAX = 8, LOGIN_WINDOW = 15 * 60 * 1000;
function loginLimiter(req, res, next) {
  const h = loginHits.get(req.ip);
  if (h && Date.now() - h.ts < LOGIN_WINDOW && h.count >= LOGIN_MAX) {
    return res.status(429).type('html').send('<p style="font-family:sans-serif;padding:24px">ログイン試行が多すぎます。15分ほど待ってから再度お試しください。</p>');
  }
  next();
}
app.get('/admin/login', (req, res) => res.type('html').send(views.loginPage(req.query.e ? 'パスワードが違います。' : '')));
app.post('/admin/login', loginLimiter, (req, res) => {
  if (!store.hasPassword()) return res.status(500).send('管理パスワードが未設定です。サーバー側で set-password を実行してください。');
  if (store.verifyPassword(req.body.password || '')) {
    loginHits.delete(req.ip);
    req.session.auth = true;
    return res.redirect('/admin');
  }
  const h = loginHits.get(req.ip);
  if (!h || Date.now() - h.ts >= LOGIN_WINDOW) loginHits.set(req.ip, { count: 1, ts: Date.now() });
  else h.count++;
  res.redirect('/admin/login?e=1');
});
app.get('/admin/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login')));

function requireAuth(req, res, next) {
  if (req.session && req.session.auth) return next();
  res.redirect('/admin/login');
}

// ================= ADMIN =================
app.get('/admin', requireAuth, (req, res) => res.type('html').send(views.dashboard(store.getContent(), req.query.ok && '保存しました。')));

// ---- Service ----
app.get('/admin/service/new', requireAuth, (req, res) => res.type('html').send(views.serviceForm(null, store.SCENES, true)));
app.get('/admin/service/:id', requireAuth, (req, res) => {
  const it = store.getContent().services.find(s => s.id === req.params.id);
  if (!it) return res.redirect('/admin');
  res.type('html').send(views.serviceForm(it, store.SCENES, false));
});
function readServiceFields(body) {
  return {
    en: (body.en || '').trim(), jp: (body.jp || '').trim(), desc: (body.desc || '').trim(),
    scene: store.SCENES.includes(body.scene) ? body.scene : 'sc-villa',
    caption: (body.caption || '').trim(),
  };
}
app.post('/admin/service', requireAuth, upload.array('images', 12), (req, res) => {
  const f = readServiceFields(req.body);
  if (!f.en || !f.jp) {
    (req.files || []).forEach(file => removeUpload(relUpload(file)));
    return res.status(400).type('html').send(views.serviceForm({ ...f, order: req.body.order, images: [] }, store.SCENES, true, '英語ラベルと日本語タイトルは必須です。'));
  }
  const c = store.getContent();
  const it = { id: store.nextId('s', c.services), ...f, order: parseInt(req.body.order, 10) || store.nextOrder(c.services) };
  it.images = (req.files || []).map(file => ({ src: relUpload(file), alt: f.jp || f.en }));
  c.services.push(it); store.saveContent(c);
  res.redirect('/admin?ok=1');
});
app.post('/admin/service/:id', requireAuth, upload.array('images', 12), (req, res) => {
  const c = store.getContent();
  const it = c.services.find(s => s.id === req.params.id);
  if (!it) return res.redirect('/admin');
  const f = readServiceFields(req.body);
  if (!f.en || !f.jp) {
    (req.files || []).forEach(file => removeUpload(relUpload(file)));
    return res.status(400).type('html').send(views.serviceForm({ ...it, ...f }, store.SCENES, false, '英語ラベルと日本語タイトルは必須です。'));
  }
  Object.assign(it, f);
  { const o = parseInt(req.body.order, 10); if (!isNaN(o)) it.order = o; }
  // edit existing images: keep/alt, unlink removed uploads
  const kept = [];
  (it.images || []).forEach((im, i) => {
    if (req.body['del_' + i] === '1') removeUpload(im.src);
    else kept.push({ src: im.src, alt: (req.body['alt_' + i] || im.alt) });
  });
  (req.files || []).forEach(file => kept.push({ src: relUpload(file), alt: f.jp || f.en }));
  it.images = kept;
  store.saveContent(c);
  res.redirect('/admin?ok=1');
});
app.post('/admin/service/:id/delete', requireAuth, (req, res) => {
  const c = store.getContent();
  const gone = c.services.find(s => s.id === req.params.id);
  if (gone) (gone.images || []).forEach(im => removeUpload(im.src));
  c.services = c.services.filter(s => s.id !== req.params.id);
  store.saveContent(c);
  res.redirect('/admin?ok=1');
});

// ---- Works ----
app.get('/admin/work/new', requireAuth, (req, res) => res.type('html').send(views.workForm(null, store.SCENES, true)));
app.get('/admin/work/:id', requireAuth, (req, res) => {
  const it = store.getContent().works.find(w => w.id === req.params.id);
  if (!it) return res.redirect('/admin');
  res.type('html').send(views.workForm(it, store.SCENES, false));
});
function readWorkFields(body) {
  return {
    name: (body.name || '').trim(), metaEn: (body.metaEn || '').trim(), metaJp: (body.metaJp || '').trim(),
    scene: store.SCENES.includes(body.scene) ? body.scene : 'sc-villa',
    url: (body.url || '').trim() || '#',
  };
}
app.post('/admin/work', requireAuth, upload.single('image'), (req, res) => {
  const f = readWorkFields(req.body);
  if (!f.name) {
    if (req.file) removeUpload(relUpload(req.file));
    return res.status(400).type('html').send(views.workForm({ ...f, order: req.body.order }, store.SCENES, true, '施設名は必須です。'));
  }
  const c = store.getContent();
  const it = { id: store.nextId('w', c.works), ...f, order: parseInt(req.body.order, 10) || store.nextOrder(c.works) };
  it.image = req.file ? relUpload(req.file) : '';
  c.works.push(it); store.saveContent(c);
  res.redirect('/admin?ok=1');
});
app.post('/admin/work/:id', requireAuth, upload.single('image'), (req, res) => {
  const c = store.getContent();
  const it = c.works.find(w => w.id === req.params.id);
  if (!it) return res.redirect('/admin');
  const f = readWorkFields(req.body);
  if (!f.name) {
    if (req.file) removeUpload(relUpload(req.file));
    return res.status(400).type('html').send(views.workForm({ ...it, ...f }, store.SCENES, false, '施設名は必須です。'));
  }
  Object.assign(it, f);
  { const o = parseInt(req.body.order, 10); if (!isNaN(o)) it.order = o; }
  if (req.file) { removeUpload(it.image); it.image = relUpload(req.file); }
  store.saveContent(c);
  res.redirect('/admin?ok=1');
});
app.post('/admin/work/:id/delete', requireAuth, (req, res) => {
  const c = store.getContent();
  const gone = c.works.find(w => w.id === req.params.id);
  if (gone) removeUpload(gone.image);
  c.works = c.works.filter(w => w.id !== req.params.id);
  store.saveContent(c);
  res.redirect('/admin?ok=1');
});

// ---- Recruit ----
app.get('/admin/recruit', requireAuth, (req, res) => res.type('html').send(views.recruitForm(store.getContent().recruit, store.SCENES)));
app.post('/admin/recruit', requireAuth, upload.single('headImg'), (req, res) => {
  const c = store.getContent();
  const r = c.recruit || {};
  r.headEyebrow = (req.body.headEyebrow || '').trim();
  r.headTtl = (req.body.headTtl || '').trim().replace(/\r?\n/g, '<br>');
  r.headEn = (req.body.headEn || '').trim();
  r.headJp = (req.body.headJp || '').trim();
  r.bodyHtml = (req.body.bodyHtml || '').trim();
  if (req.file) { removeUpload(r.headImg); r.headImg = relUpload(req.file); }
  c.recruit = r; store.saveContent(c);
  res.redirect('/admin?ok=1');
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).type('html').send('<p style="font-family:sans-serif;padding:24px">画像のサイズが大きすぎます（上限8MB）。<a href="javascript:history.back()">← 戻る</a></p>');
  }
  res.status(500).type('html').send('<p style="font-family:sans-serif;padding:24px">エラーが発生しました。<a href="javascript:history.back()">← 戻る</a></p>');
});

app.listen(PORT, '127.0.0.1', () => console.log(`Coral CMS listening on http://127.0.0.1:${PORT}`));
