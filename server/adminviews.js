'use strict';
// Admin UI: sidebar app shell + section pages + forms.
const { esc } = require('./render');

let unreadFn = () => 0;
function setUnread(fn) { unreadFn = fn; }

// ---------- icons (16px, stroke) ----------
const I = {
  dash: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  svc: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  works: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>',
  news: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h6M7 13h10M7 17h10"/></svg>',
  recruit: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  site: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};

const NAV = [
  ['dashboard', '/admin', 'ダッシュボード', 'dash'],
  ['services', '/admin/services', 'サービス', 'svc'],
  ['works', '/admin/works', '実績（Works）', 'works'],
  ['news', '/admin/news', 'お知らせ', 'news'],
  ['recruit', '/admin/recruit', '採用ページ', 'recruit'],
  ['inquiries', '/admin/inquiries', 'お問い合わせ受信箱', 'inbox'],
  ['settings', '/admin/settings', '設定', 'settings'],
];

const CSS = `
:root{--ink:#0d1f27;--ink2:#15303b;--sand:#c9a86a;--sand2:#b8944f;--paper:#faf9f6;--line:#e6e2d9;--mute:#7a8288;--danger:#b23b3b;--ok:#1d6b2f;--sb:236px}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:system-ui,-apple-system,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;color:var(--ink);background:var(--paper);line-height:1.6;font-size:14px}
a{color:#1f6f8b;text-decoration:none}
svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
/* ---- shell ---- */
.sb{position:fixed;top:0;left:0;bottom:0;width:var(--sb);background:var(--ink);color:#fff;display:flex;flex-direction:column;z-index:40;transition:transform .3s ease}
.sb__brand{padding:22px 22px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb__brand b{display:block;font-size:15px;letter-spacing:.08em}
.sb__brand small{display:block;font-size:11px;opacity:.55;letter-spacing:.12em;margin-top:2px}
.sb__nav{padding:12px 12px;flex:1;overflow:auto}
.sb__nav a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:9px;color:rgba(255,255,255,.72);font-size:13.5px;margin:2px 0;transition:background .2s,color .2s}
.sb__nav a:hover{background:rgba(255,255,255,.07);color:#fff}
.sb__nav a.on{background:rgba(201,168,106,.16);color:#fff}
.sb__nav a.on svg{color:var(--sand)}
.badge{margin-left:auto;background:var(--sand);color:var(--ink);font-size:11px;font-weight:700;min-width:20px;height:20px;padding:0 6px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center}
.sb__foot{padding:12px;border-top:1px solid rgba(255,255,255,.08)}
.sb__foot a{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:9px;color:rgba(255,255,255,.6);font-size:13px}
.sb__foot a:hover{background:rgba(255,255,255,.07);color:#fff}
.sb-bg{display:none;position:fixed;inset:0;background:rgba(7,22,29,.5);z-index:35}
.main{margin-left:var(--sb);min-height:100vh;display:flex;flex-direction:column}
.top{position:sticky;top:0;z-index:30;background:rgba(250,249,246,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:14px 32px;display:flex;align-items:center;gap:14px}
.top h1{font-size:19px;margin:0;font-weight:600;letter-spacing:.02em}
.top .crumbs{font-size:12px;color:var(--mute);display:flex;gap:8px;align-items:center;margin-bottom:2px}
.top .crumbs a{color:var(--mute)}
.top .actions{margin-left:auto;display:flex;gap:8px;align-items:center}
.sbtoggle{display:none;border:1px solid var(--line);background:#fff;border-radius:8px;width:38px;height:38px;align-items:center;justify-content:center;cursor:pointer;color:var(--ink)}
.content{padding:28px 32px 90px;max-width:1080px;width:100%}
/* ---- components ---- */
.btn{display:inline-flex;align-items:center;gap:7px;background:var(--ink);color:#fff;border:1px solid var(--ink);border-radius:9px;padding:9px 15px;font-size:13px;font-weight:500;cursor:pointer;text-decoration:none;line-height:1.2;transition:background .2s,border-color .2s,color .2s;white-space:nowrap}
.btn:hover{background:var(--ink2)}
.btn.ghost{background:#fff;color:var(--ink);border-color:#cdc7ba}
.btn.ghost:hover{border-color:var(--ink)}
.btn.danger{background:#fff;color:var(--danger);border-color:#e3c3c3}
.btn.danger:hover{background:#fdf0f0;border-color:var(--danger)}
.btn.sm{padding:6px 11px;font-size:12px;border-radius:7px}
.btn.icon{padding:6px;width:30px;height:30px;justify-content:center}
.btn svg{width:15px;height:15px}
.btn[disabled]{opacity:.35;cursor:default}
.panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin:0 0 18px}
.panel__ttl{font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--mute);margin:0 0 14px;text-transform:uppercase}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px}
.stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;color:var(--ink);transition:border-color .2s,transform .2s}
.stat:hover{border-color:var(--sand);transform:translateY(-1px)}
.stat svg{width:22px;height:22px;color:var(--sand)}
.stat b{display:block;font-size:24px;line-height:1.1}
.stat small{color:var(--mute);font-size:12px}
.quick{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}
/* list rows */
.list{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.row{display:grid;grid-template-columns:72px 1fr auto auto;gap:16px;align-items:center;padding:12px 18px;border-top:1px solid var(--line)}
.row:first-child{border-top:0}
.row:hover{background:#fcfbf8}
.row img,.row .noimg{width:72px;height:50px;object-fit:cover;border-radius:7px;background:#eeece6;display:block}
.row .ttl{font-weight:600;font-size:14px}
.row .meta{font-size:12px;color:var(--mute);margin-top:2px}
.row .ord{display:flex;gap:4px;align-items:center}
.row .ord form{display:contents}
.row .act{display:flex;gap:6px;align-items:center}
.row.news{grid-template-columns:110px 1fr auto}
.row .date{font-size:12.5px;color:#2f6b72;letter-spacing:.06em;white-space:nowrap}
.empty{padding:44px 20px;text-align:center;color:var(--mute)}
.empty p{margin:0 0 14px}
/* forms */
label{display:block;font-size:12.5px;font-weight:600;margin:0 0 6px}
.field{margin:0 0 18px}
.field .hint{font-size:12px;color:var(--mute);margin-top:6px}
input[type=text],input[type=date],input[type=email],textarea,select{width:100%;padding:10px 12px;border:1px solid #cdc7ba;border-radius:9px;font:inherit;background:#fff;transition:border-color .2s,box-shadow .2s}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--sand);box-shadow:0 0 0 3px rgba(201,168,106,.2)}
input[type=date]{width:auto}
textarea{min-height:110px;resize:vertical}
input[type=file]{display:block;font-size:13px;padding:10px;border:1px dashed #cdc7ba;border-radius:9px;width:100%;background:#fcfbf8}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
.thumbs{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}
.thumb{border:1px solid var(--line);border-radius:10px;padding:8px;font-size:12px;background:#fcfbf8;width:160px}
.thumb img{display:block;width:100%;height:96px;object-fit:cover;border-radius:6px;margin-bottom:6px}
.thumb label{font-weight:400;font-size:12px;margin:6px 0 2px}
.thumb .del{display:flex;align-items:center;gap:6px;color:var(--danger);margin-top:6px;cursor:pointer}
.savebar{position:sticky;bottom:0;background:rgba(250,249,246,.95);backdrop-filter:blur(8px);border-top:1px solid var(--line);padding:14px 0;margin-top:10px;display:flex;gap:10px;align-items:center}
.savebar .spacer{flex:1}
/* inquiries */
.inq{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-bottom:12px;display:flex;gap:16px;align-items:flex-start}
.inq.unread{border-left:4px solid var(--sand)}
.inq .who{font-weight:600}
.inq .meta{font-size:12px;color:var(--mute);margin:2px 0 8px}
.inq .msg{white-space:pre-wrap;font-size:14px}
.inq .grow{flex:1;min-width:0}
/* feedback */
.toast{position:fixed;right:22px;bottom:22px;z-index:60;background:var(--ink);color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;box-shadow:0 12px 30px rgba(0,0,0,.25);animation:tin .3s ease;display:flex;gap:10px;align-items:center}
.toast.err{background:var(--danger)}
@keyframes tin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.alert{background:#fde8e8;color:#8a2020;padding:11px 14px;border-radius:9px;margin:0 0 16px;font-size:13px}
.muted{color:var(--mute);font-size:13px}
/* mobile */
@media(max-width:900px){
  .sb{transform:translateX(-100%)}
  body.sb-open .sb{transform:none}
  body.sb-open .sb-bg{display:block}
  .main{margin-left:0}
  .sbtoggle{display:inline-flex}
  .top{padding:12px 16px}
  .top h1{font-size:17px}
  .content{padding:18px 16px 90px}
  .row{grid-template-columns:56px 1fr;gap:10px 12px}
  .row img,.row .noimg{width:56px;height:42px}
  .row .ord,.row .act{grid-column:2}
  .row.news{grid-template-columns:1fr}
  .grid2{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr 1fr}
}
`;

const JS = `
(function(){
  var tg=document.getElementById('sbToggle');if(tg)tg.addEventListener('click',function(){document.body.classList.toggle('sb-open')});
  var bg=document.querySelector('.sb-bg');if(bg)bg.addEventListener('click',function(){document.body.classList.remove('sb-open')});
  addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('sb-open')});
  var t=document.querySelector('.toast');if(t)setTimeout(function(){t.style.transition='opacity .4s';t.style.opacity='0';setTimeout(function(){t.remove()},400)},3200);
  // image preview for file inputs
  document.querySelectorAll('input[type=file]').forEach(function(inp){inp.addEventListener('change',function(){
    var box=inp.parentNode.querySelector('.preview');if(!box){box=document.createElement('div');box.className='thumbs preview';inp.parentNode.appendChild(box)}
    box.innerHTML='';Array.prototype.forEach.call(inp.files,function(f){if(!/^image\\//.test(f.type))return;var d=document.createElement('div');d.className='thumb';var im=document.createElement('img');im.src=URL.createObjectURL(f);d.appendChild(im);var s=document.createElement('div');s.textContent=f.name.slice(0,22);d.appendChild(s);box.appendChild(d)});
  })});
})();
`;

function layout(title, body, o) {
  o = o || {};
  const unread = unreadFn();
  const nav = NAV.map(([key, href, label, icon]) =>
    `<a href="${href}" class="${o.active === key ? 'on' : ''}">${I[icon]}<span>${label}</span>${key === 'inquiries' && unread ? `<span class="badge">${unread}</span>` : ''}</a>`).join('');
  const crumbs = (o.crumbs || []).map(([l, h]) => h ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`).join('<span>›</span>');
  return `<!doctype html><html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · Coral CMS</title>
<style>${CSS}</style></head><body>
<aside class="sb">
  <div class="sb__brand"><b>Coral CMS</b><small>CORAL RESORT MANAGEMENT</small></div>
  <nav class="sb__nav">${nav}</nav>
  <div class="sb__foot"><a href="/" target="_blank" rel="noopener">${I.site}<span>サイトを表示</span></a><a href="/admin/logout">${I.logout}<span>ログアウト</span></a></div>
</aside>
<div class="sb-bg"></div>
<div class="main">
  <header class="top">
    <button class="sbtoggle" id="sbToggle" type="button" aria-label="メニュー">${I.menu}</button>
    <div>${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}<h1>${esc(title)}</h1></div>
    <div class="actions">${o.actions || ''}</div>
  </header>
  <div class="content">${body}</div>
</div>
${o.flash ? `<div class="toast${o.flashErr ? ' err' : ''}">${esc(o.flash)}</div>` : ''}
<script>${JS}</script>
</body></html>`;
}

// ---------- login ----------
function loginPage(error) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>ログイン · Coral CMS</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#0d1f27;display:flex;min-height:100vh;align-items:center;justify-content:center;color:#0d1f27}
.box{background:#fff;padding:34px 32px;border-radius:16px;width:340px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
h1{font-size:17px;margin:0 0 4px;letter-spacing:.06em}p{margin:0 0 18px;font-size:12px;color:#7a8288;letter-spacing:.12em}
input{width:100%;padding:12px;border:1px solid #cdc7ba;border-radius:9px;font:inherit;box-sizing:border-box}
input:focus{outline:none;border-color:#c9a86a;box-shadow:0 0 0 3px rgba(201,168,106,.2)}
button{width:100%;margin-top:14px;background:#0d1f27;color:#fff;border:0;border-radius:9px;padding:12px;font-size:14px;cursor:pointer}
.err{background:#fde8e8;color:#8a2020;padding:9px 12px;border-radius:8px;margin-bottom:12px;font-size:13px}</style></head>
<body><form class="box" method="post" action="/admin/login">
<h1>Coral CMS</h1><p>CORAL RESORT MANAGEMENT</p>
${error ? `<div class="err">${esc(error)}</div>` : ''}
<input type="password" name="password" placeholder="パスワード" autofocus required autocomplete="current-password">
<button type="submit">ログイン</button></form></body></html>`;
}

// ---------- dashboard ----------
function dashboard(d) {
  const c = d.content;
  const stats = `
    <div class="stats">
      <a class="stat" href="/admin/services">${I.svc}<div><b>${c.services.length}</b><small>サービス</small></div></a>
      <a class="stat" href="/admin/works">${I.works}<div><b>${c.works.length}</b><small>実績</small></div></a>
      <a class="stat" href="/admin/news">${I.news}<div><b>${c.news.length}</b><small>お知らせ</small></div></a>
      <a class="stat" href="/admin/inquiries">${I.inbox}<div><b>${d.unread}</b><small>未読のお問い合わせ（全${d.total}件）</small></div></a>
    </div>`;
  const quick = `
    <div class="quick">
      <a class="btn" href="/admin/service/new">${I.plus}サービスを追加</a>
      <a class="btn" href="/admin/work/new">${I.plus}実績を追加</a>
      <a class="btn" href="/admin/news/new">${I.plus}お知らせを追加</a>
      <a class="btn ghost" href="/" target="_blank" rel="noopener">${I.site}サイトを表示</a>
    </div>`;
  const recent = d.recent.length ? d.recent.map(q => `
      <div class="inq${q.read ? '' : ' unread'}"><div class="grow">
        <div class="who">${esc(q.name)}</div>
        <div class="meta">${esc((q.at || '').replace('T', ' ').slice(0, 16))} · ${esc(q.email)}</div>
        <div class="msg">${esc(q.message.length > 120 ? q.message.slice(0, 120) + '…' : q.message)}</div>
      </div></div>`).join('') : '<p class="muted">まだお問い合わせはありません。</p>';
  return layout('ダッシュボード', `
    ${stats}${quick}
    <div class="panel"><h2 class="panel__ttl">最近のお問い合わせ</h2>${recent}
      ${d.total > 3 ? `<p style="margin:8px 0 0"><a href="/admin/inquiries">すべて見る →</a></p>` : ''}</div>
  `, { active: 'dashboard', flash: d.flash });
}

// ---------- lists ----------
function orderCtl(kind, id, i, n) {
  return `<div class="ord">
    <form method="post" action="/admin/${kind}/${esc(id)}/move"><input type="hidden" name="dir" value="up"><button class="btn ghost icon" title="上へ" ${i === 0 ? 'disabled' : ''}>${I.up}</button></form>
    <form method="post" action="/admin/${kind}/${esc(id)}/move"><input type="hidden" name="dir" value="down"><button class="btn ghost icon" title="下へ" ${i === n - 1 ? 'disabled' : ''}>${I.down}</button></form>
  </div>`;
}
function delForm(action, label) {
  return `<form method="post" action="${action}" onsubmit="return confirm('「${esc(label)}」を削除しますか？')"><button class="btn danger sm">削除</button></form>`;
}
function emptyState(text, href, cta) {
  return `<div class="empty"><p>${esc(text)}</p><a class="btn" href="${href}">${I.plus}${esc(cta)}</a></div>`;
}

function listServices(content, flash) {
  const list = content.services;
  const rows = list.map((s, i) => `
    <div class="row">
      ${s.images && s.images[0] ? `<img src="/${esc(s.images[0].src)}" alt="">` : '<div class="noimg"></div>'}
      <div><div class="ttl">${esc(s.jp || s.en)}</div><div class="meta">${esc(s.en)}${s.images && s.images.length > 1 ? ` · 画像${s.images.length}枚（スライド）` : ''}</div></div>
      ${orderCtl('service', s.id, i, list.length)}
      <div class="act"><a class="btn ghost sm" href="/admin/service/${esc(s.id)}">編集</a>${delForm(`/admin/service/${esc(s.id)}/delete`, s.jp || s.en)}</div>
    </div>`).join('');
  return layout('サービス', `
    <p class="muted" style="margin:0 0 14px">トップページの Service セクションに表示されます。↑↓ で表示順を変更できます。</p>
    <div class="list">${rows || emptyState('まだサービスがありません。', '/admin/service/new', 'サービスを追加')}</div>
  `, { active: 'services', flash, actions: `<a class="btn" href="/admin/service/new">${I.plus}追加</a>` });
}

function listWorks(content, flash) {
  const list = content.works;
  const rows = list.map((w, i) => `
    <div class="row">
      ${w.image ? `<img src="/${esc(w.image)}" alt="">` : '<div class="noimg"></div>'}
      <div><div class="ttl">${esc(w.name)}</div><div class="meta">${esc(w.metaEn)} · ${esc(w.metaJp)}${w.url && w.url !== '#' ? ' · リンクあり' : ''}</div></div>
      ${orderCtl('work', w.id, i, list.length)}
      <div class="act"><a class="btn ghost sm" href="/admin/work/${esc(w.id)}">編集</a>${delForm(`/admin/work/${esc(w.id)}/delete`, w.name)}</div>
    </div>`).join('');
  return layout('実績（Works）', `
    <p class="muted" style="margin:0 0 14px">トップページには上から3件、「All works」ページには全件が表示されます。</p>
    <div class="list">${rows || emptyState('まだ実績がありません。', '/admin/work/new', '実績を追加')}</div>
  `, { active: 'works', flash, actions: `<a class="btn" href="/admin/work/new">${I.plus}追加</a>` });
}

function listNews(content, flash) {
  const rows = content.news.map(n => `
    <div class="row news">
      <div class="date">${esc(String(n.date || '').replace(/-/g, '.'))}</div>
      <div><div class="ttl">${esc(n.title)}</div></div>
      <div class="act"><a class="btn ghost sm" href="/admin/news/${esc(n.id)}">編集</a>${delForm(`/admin/news/${esc(n.id)}/delete`, n.title)}</div>
    </div>`).join('');
  return layout('お知らせ', `
    <p class="muted" style="margin:0 0 14px">日付の新しい順に表示され、トップページには最新3件が載ります。</p>
    <div class="list">${rows || emptyState('まだお知らせがありません。', '/admin/news/new', 'お知らせを追加')}</div>
  `, { active: 'news', flash, actions: `<a class="btn" href="/admin/news/new">${I.plus}追加</a>` });
}

// ---------- forms ----------
function sceneSelect(name, current, scenes) {
  return `<select name="${name}">${scenes.map(s => `<option value="${esc(s)}"${s === current ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select>`;
}
function savebar(cancelHref) {
  return `<div class="savebar"><button class="btn" type="submit">保存する</button><a class="btn ghost" href="${cancelHref}">キャンセル</a><span class="spacer"></span></div>`;
}
function field(label, input, hint) {
  return `<div class="field"><label>${label}</label>${input}${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
}

function serviceForm(item, scenes, isNew, err) {
  item = item || { images: [] };
  const imgs = (item.images || []).map((im, i) => `
    <div class="thumb"><img src="/${esc(im.src)}" alt="">
      <label>代替テキスト</label><input type="text" name="alt_${i}" value="${esc(im.alt)}">
      <label class="del"><input type="checkbox" name="del_${i}" value="1"> この画像を削除</label>
    </div>`).join('');
  const title = isNew ? 'サービスを追加' : 'サービスを編集';
  return layout(title, `
    ${err ? `<div class="alert">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/service${isNew ? '' : '/' + esc(item.id)}" enctype="multipart/form-data">
      <div class="panel"><h2 class="panel__ttl">基本情報</h2>
        <div class="grid2">
          ${field('英語ラベル', `<input type="text" name="en" value="${esc(item.en)}" required placeholder="Housekeeping">`)}
          ${field('日本語タイトル', `<input type="text" name="jp" value="${esc(item.jp)}" required placeholder="客室清掃・ハウスキーピング受託">`)}
        </div>
        ${field('説明文', `<textarea name="desc">${esc(item.desc)}</textarea>`)}
        <div class="grid2">
          ${field('背景イラスト', sceneSelect('scene', item.scene || 'sc-villa', scenes), '画像が無い／読み込めない時に表示されるイラスト')}
          ${field('キャプション（任意）', `<input type="text" name="caption" value="${esc(item.caption)}">`, '画像右下に小さく表示されます')}
        </div>
        <input type="hidden" name="order" value="${esc(item.order || '')}">
      </div>
      <div class="panel"><h2 class="panel__ttl">画像</h2>
        ${imgs ? `<div class="thumbs">${imgs}</div>` : '<p class="muted" style="margin:0 0 10px">まだ画像がありません。</p>'}
        ${field('画像を追加', `<input type="file" name="images" accept="image/*" multiple>`, '複数選択できます。2枚以上でスライド表示になります。1枚8MBまで。')}
      </div>
      ${savebar('/admin/services')}
    </form>`, { active: 'services', crumbs: [['サービス', '/admin/services'], [title]] });
}

function workForm(item, scenes, isNew, err) {
  item = item || {};
  const title = isNew ? '実績を追加' : '実績を編集';
  return layout(title, `
    ${err ? `<div class="alert">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/work${isNew ? '' : '/' + esc(item.id)}" enctype="multipart/form-data">
      <div class="panel"><h2 class="panel__ttl">基本情報</h2>
        ${field('施設名', `<input type="text" name="name" value="${esc(item.name)}" required placeholder="ヨーンヤード古宇利島">`)}
        <div class="grid2">
          ${field('英語地名', `<input type="text" name="metaEn" value="${esc(item.metaEn)}" placeholder="Kouri Island">`)}
          ${field('日本語地名', `<input type="text" name="metaJp" value="${esc(item.metaJp)}" placeholder="今帰仁村">`)}
        </div>
        <div class="grid2">
          ${field('リンク先URL（任意）', `<input type="text" name="url" value="${esc(item.url === '#' ? '' : item.url)}" placeholder="https://">`, '設定するとカードがリンクになります（別タブで開きます）')}
          ${field('背景イラスト', sceneSelect('scene', item.scene || 'sc-villa', scenes))}
        </div>
        <input type="hidden" name="order" value="${esc(item.order || '')}">
      </div>
      <div class="panel"><h2 class="panel__ttl">画像</h2>
        ${item.image ? `<div class="thumbs" style="margin:0 0 12px"><div class="thumb"><img src="/${esc(item.image)}" alt=""><div class="muted">現在の画像</div></div></div>` : ''}
        ${field(item.image ? '画像を差し替え' : '画像', `<input type="file" name="image" accept="image/*">`, '1枚。8MBまで。')}
      </div>
      ${savebar('/admin/works')}
    </form>`, { active: 'works', crumbs: [['実績（Works）', '/admin/works'], [title]] });
}

function newsForm(item, isNew, err) {
  item = item || {};
  const title = isNew ? 'お知らせを追加' : 'お知らせを編集';
  return layout(title, `
    ${err ? `<div class="alert">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/news${isNew ? '' : '/' + esc(item.id)}">
      <div class="panel">
        ${field('日付', `<input type="date" name="date" value="${esc(item.date)}" required>`)}
        ${field('タイトル', `<input type="text" name="title" value="${esc(item.title)}" required>`)}
        ${field('本文', `<textarea name="body" style="min-height:240px">${esc(item.body)}</textarea>`, '空行で段落が分かれます。HTMLタグもそのまま使えます。')}
      </div>
      ${savebar('/admin/news')}
    </form>`, { active: 'news', crumbs: [['お知らせ', '/admin/news'], [title]] });
}

function recruitForm(r, scenes, flash) {
  r = r || {};
  return layout('採用ページ', `
    <form method="post" action="/admin/recruit" enctype="multipart/form-data">
      <div class="panel"><h2 class="panel__ttl">見出し</h2>
        <div class="grid2">
          ${field('上部ラベル', `<input type="text" name="headEyebrow" value="${esc(r.headEyebrow)}" placeholder="Recruit">`)}
          ${field('英語サブ', `<input type="text" name="headEn" value="${esc(r.headEn)}">`)}
        </div>
        ${field('大見出し', `<textarea name="headTtl" style="min-height:70px">${esc((r.headTtl || '').replace(/<br>/g, '\n'))}</textarea>`, '改行はそのまま反映されます')}
        ${field('日本語サブ', `<input type="text" name="headJp" value="${esc(r.headJp)}">`)}
      </div>
      <div class="panel"><h2 class="panel__ttl">本文</h2>
        ${field('本文', `<textarea name="bodyHtml" style="min-height:220px">${esc(r.bodyHtml)}</textarea>`, 'HTML可。&lt;p&gt;で段落を分けます。')}
      </div>
      <div class="panel"><h2 class="panel__ttl">見出し画像</h2>
        ${r.headImg ? `<div class="thumbs" style="margin:0 0 12px"><div class="thumb"><img src="/${esc(r.headImg)}" alt=""><div class="muted">現在の画像</div></div></div>` : ''}
        ${field('画像を差し替え', `<input type="file" name="headImg" accept="image/*">`)}
      </div>
      ${savebar('/admin')}
    </form>`, { active: 'recruit', flash });
}

function settingsForm(st, err, flash) {
  st = st || {};
  return layout('設定', `
    ${err ? `<div class="alert">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/settings">
      <div class="panel"><h2 class="panel__ttl">お問い合わせ連絡先</h2>
        <p class="muted" style="margin:0 0 16px">お問い合わせフォームの下に「お急ぎの場合はこちらへ」として表示されます。未設定でもフォームは動作します。</p>
        <div class="grid2">
          ${field('メールアドレス', `<input type="text" name="contactEmail" value="${esc(st.contactEmail)}" placeholder="info@example.co.jp">`)}
          ${field('電話番号', `<input type="text" name="contactPhone" value="${esc(st.contactPhone)}" placeholder="0980-00-0000">`)}
        </div>
      </div>
      ${savebar('/admin')}
    </form>`, { active: 'settings', flash });
}

function inquiriesList(list, flash) {
  const rows = list.map(q => `
    <div class="inq${q.read ? '' : ' unread'}">
      <div class="grow">
        <div class="who">${esc(q.name)}${q.read ? '' : ' <span class="badge">NEW</span>'}</div>
        <div class="meta">${esc((q.at || '').replace('T', ' ').slice(0, 16))} · <a href="mailto:${esc(q.email)}">${esc(q.email)}</a>${q.phone ? ' · ' + esc(q.phone) : ''}</div>
        <div class="msg">${esc(q.message)}</div>
      </div>
      <div class="act"><a class="btn ghost sm" href="mailto:${esc(q.email)}?subject=${encodeURIComponent('お問い合わせありがとうございます')}">返信</a>${delForm(`/admin/inquiries/${esc(q.id)}/delete`, q.name)}</div>
    </div>`).join('');
  return layout('お問い合わせ受信箱', `
    <p class="muted" style="margin:0 0 14px">サイトのお問い合わせフォームから送信された内容です（新しい順・${list.length}件）。</p>
    ${rows || '<div class="list"><div class="empty"><p>まだお問い合わせはありません。</p></div></div>'}
  `, { active: 'inquiries', flash });
}

module.exports = { setUnread, loginPage, dashboard, listServices, listWorks, listNews, serviceForm, workForm, newsForm, recruitForm, settingsForm, inquiriesList };
