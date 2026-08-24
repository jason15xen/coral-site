'use strict';
const { esc } = require('./render');

function layout(title, body) {
  return `<!doctype html><html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · Coral CMS</title>
<style>
:root{--ink:#0d1f27;--sand:#c9a86a;--line:#e4e0d8;--paper:#faf9f6}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,"Hiragino Kaku Gothic ProN",Meiryo,sans-serif;color:var(--ink);background:#f3f1ec;line-height:1.6}
a{color:#1f6f8b}
header.top{background:var(--ink);color:#fff;padding:14px 22px;display:flex;justify-content:space-between;align-items:center}
header.top a{color:#fff;text-decoration:none;font-size:13px;opacity:.85}
.wrap{max-width:860px;margin:0 auto;padding:26px 20px 80px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:34px 0 12px;padding-bottom:8px;border-bottom:1px solid #ddd8cf}
.card{background:#fff;border:1px solid #e6e2d9;border-radius:10px;padding:14px 16px;margin:10px 0;display:flex;gap:14px;align-items:center}
.card img{width:88px;height:60px;object-fit:cover;border-radius:6px;background:#eee}
.card .grow{flex:1;min-width:0}
.card .grow b{display:block}.card .grow small{color:#777}
.btn{display:inline-block;background:var(--ink);color:#fff;border:0;border-radius:8px;padding:9px 16px;font-size:13px;text-decoration:none;cursor:pointer}
.btn.ghost{background:#fff;color:var(--ink);border:1px solid #cdc7ba}
.btn.danger{background:#b23b3b}
.btn.sm{padding:6px 12px;font-size:12px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
label{display:block;font-size:13px;font-weight:600;margin:14px 0 5px}
input[type=text],textarea,select{width:100%;padding:9px 11px;border:1px solid #cdc7ba;border-radius:8px;font:inherit;background:#fff}
textarea{min-height:90px;resize:vertical}
.hint{font-size:12px;color:#888;margin-top:4px}
.thumbs{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.thumb{border:1px solid #ddd;border-radius:8px;padding:6px;text-align:center;font-size:12px}
.thumb img{display:block;width:120px;height:80px;object-fit:cover;border-radius:5px}
.err{background:#fde8e8;color:#8a2020;padding:10px 14px;border-radius:8px;margin:12px 0}
.ok{background:#e7f5ea;color:#1d6b2f;padding:10px 14px;border-radius:8px;margin:12px 0}
.muted{color:#888;font-size:13px}
</style></head><body>
<header class="top"><a href="/admin"><b>Coral CMS</b></a><a href="/admin/logout">ログアウト</a></header>
<div class="wrap">${body}</div></body></html>`;
}

function loginPage(error) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>ログイン · Coral CMS</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#0d1f27;color:#0d1f27;display:flex;min-height:100vh;align-items:center;justify-content:center}
.box{background:#fff;padding:30px;border-radius:12px;width:320px}
h1{font-size:18px;margin:0 0 16px}
input{width:100%;padding:11px;border:1px solid #cdc7ba;border-radius:8px;font:inherit;box-sizing:border-box}
button{width:100%;margin-top:14px;background:#0d1f27;color:#fff;border:0;border-radius:8px;padding:11px;font-size:14px;cursor:pointer}
.err{background:#fde8e8;color:#8a2020;padding:9px 12px;border-radius:8px;margin-bottom:12px;font-size:13px}</style></head>
<body><form class="box" method="post" action="/admin/login">
<h1>Coral CMS ログイン</h1>
${error ? `<div class="err">${esc(error)}</div>` : ''}
<input type="password" name="password" placeholder="パスワード" autofocus required>
<button type="submit">ログイン</button></form></body></html>`;
}

function dashboard(content, flash, inquiryCount) {
  const svc = content.services.map(s => `
    <div class="card">
      ${s.images && s.images[0] ? `<img src="/${esc(s.images[0].src)}" alt="">` : '<img alt="">'}
      <div class="grow"><b>${esc(s.jp || s.en)}</b><small>${esc(s.en)}${s.images && s.images.length > 1 ? ` · 画像${s.images.length}枚` : ''}</small></div>
      <a class="btn ghost sm" href="/admin/service/${esc(s.id)}">編集</a>
      <form method="post" action="/admin/service/${esc(s.id)}/delete" onsubmit="return confirm('「${esc(s.jp || s.en)}」を削除しますか？')"><button class="btn danger sm">削除</button></form>
    </div>`).join('');
  const wk = content.works.map(w => `
    <div class="card">
      ${w.image ? `<img src="/${esc(w.image)}" alt="">` : '<img alt="">'}
      <div class="grow"><b>${esc(w.name)}</b><small>${esc(w.metaEn)} · ${esc(w.metaJp)}</small></div>
      <a class="btn ghost sm" href="/admin/work/${esc(w.id)}">編集</a>
      <form method="post" action="/admin/work/${esc(w.id)}/delete" onsubmit="return confirm('「${esc(w.name)}」を削除しますか？')"><button class="btn danger sm">削除</button></form>
    </div>`).join('');
  return layout('ダッシュボード', `
    <h1>コンテンツ管理</h1>
    <p class="muted">サービス・ワークスの追加／削除、リクルートページの編集ができます。<a href="/" target="_blank">サイトを表示 ↗</a></p>
    ${flash ? `<div class="ok">${esc(flash)}</div>` : ''}
    <h2>Service（サービス）<a class="btn sm" style="float:right" href="/admin/service/new">＋ 追加</a></h2>
    ${svc || '<p class="muted">まだ項目がありません。</p>'}
    <h2>Works（実績）<a class="btn sm" style="float:right" href="/admin/work/new">＋ 追加</a></h2>
    ${wk || '<p class="muted">まだ項目がありません。</p>'}
    <h2>News（お知らせ）<a class="btn sm" style="float:right" href="/admin/news/new">＋ 追加</a></h2>
    ${content.news.map(n => `
    <div class="card">
      <div class="grow"><b>${esc(n.title)}</b><small>${esc(String(n.date||'').replace(/-/g,'.'))}</small></div>
      <a class="btn ghost sm" href="/admin/news/${esc(n.id)}">編集</a>
      <form method="post" action="/admin/news/${esc(n.id)}/delete" onsubmit="return confirm('「${esc(n.title)}」を削除しますか？')"><button class="btn danger sm">削除</button></form>
    </div>`).join('') || '<p class="muted">まだお知らせがありません。</p>'}
    <h2>お問い合わせ受信箱${typeof inquiryCount==='number' ? `（${inquiryCount}件）` : ''}<a class="btn sm" style="float:right" href="/admin/inquiries">開く</a></h2>
    <div class="card"><div class="grow"><b>フォームからのお問い合わせ</b><small>サイトの「お問い合わせ」フォームで送信された内容が届きます</small></div></div>
    <h2>お問い合わせ設定</h2>
    <div class="card"><div class="grow"><b>連絡先（メール・電話）</b><small>設定するとサイトの「お問い合わせ」ボタンが有効になります</small></div>
      <a class="btn ghost sm" href="/admin/settings">編集</a></div>
    <h2>Recruit（採用ページ）</h2>
    <div class="card"><div class="grow"><b>採用ページの文言・見出し</b><small>クリックで表示されるページの内容</small></div>
      <a class="btn ghost sm" href="/admin/recruit">編集</a></div>
  `);
}

function sceneSelect(name, current, scenes) {
  return `<select name="${name}">${scenes.map(s => `<option value="${esc(s)}"${s === current ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select>`;
}

function serviceForm(item, scenes, isNew, err) {
  item = item || { images: [] };
  const imgs = (item.images || []).map((im, i) => `
    <div class="thumb"><img src="/${esc(im.src)}" alt="">
      <label style="font-weight:400;margin:6px 0 3px">alt<input type="text" name="alt_${i}" value="${esc(im.alt)}"></label>
      <label style="font-weight:400"><input type="checkbox" name="del_${i}" value="1"> この画像を削除</label>
    </div>`).join('');
  return layout(isNew ? 'サービス追加' : 'サービス編集', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>${isNew ? 'サービスを追加' : 'サービスを編集'}</h1>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/service${isNew ? '' : '/' + esc(item.id)}" enctype="multipart/form-data">
      <label>英語ラベル (例: Housekeeping)</label><input type="text" name="en" value="${esc(item.en)}" required>
      <label>日本語タイトル</label><input type="text" name="jp" value="${esc(item.jp)}" required>
      <label>説明文</label><textarea name="desc">${esc(item.desc)}</textarea>
      <label>背景イラスト (scene)</label>${sceneSelect('scene', item.scene || 'sc-villa', scenes)}
      <label>キャプション (任意・画像右下の小さな注記)</label><input type="text" name="caption" value="${esc(item.caption)}">
      <label>表示順</label><input type="text" name="order" value="${esc(item.order || '')}">
      ${imgs ? `<label>現在の画像</label><div class="thumbs">${imgs}</div>` : ''}
      <label>画像を追加（複数可・2枚以上でスライド表示）</label>
      <input type="file" name="images" accept="image/*" multiple>
      <div class="hint">追加した画像の alt は日本語タイトルが初期値になります。</div>
      <div class="row" style="margin-top:22px"><button class="btn" type="submit">保存</button><a class="btn ghost" href="/admin">キャンセル</a></div>
    </form>`);
}

function workForm(item, scenes, isNew, err) {
  item = item || {};
  return layout(isNew ? 'ワークス追加' : 'ワークス編集', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>${isNew ? '実績を追加' : '実績を編集'}</h1>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/work${isNew ? '' : '/' + esc(item.id)}" enctype="multipart/form-data">
      <label>施設名</label><input type="text" name="name" value="${esc(item.name)}" required>
      <label>英語地名 (例: Kouri Island)</label><input type="text" name="metaEn" value="${esc(item.metaEn)}">
      <label>日本語地名 (例: 今帰仁村)</label><input type="text" name="metaJp" value="${esc(item.metaJp)}">
      <label>背景イラスト (scene)</label>${sceneSelect('scene', item.scene || 'sc-villa', scenes)}
      <label>リンク先URL (任意・未設定なら # )</label><input type="text" name="url" value="${esc(item.url)}">
      <label>表示順</label><input type="text" name="order" value="${esc(item.order || '')}">
      ${item.image ? `<label>現在の画像</label><div class="thumbs"><div class="thumb"><img src="/${esc(item.image)}" alt=""></div></div>` : ''}
      <label>画像${item.image ? 'を差し替え' : ''}（1枚）</label>
      <input type="file" name="image" accept="image/*">
      <div class="row" style="margin-top:22px"><button class="btn" type="submit">保存</button><a class="btn ghost" href="/admin">キャンセル</a></div>
    </form>`);
}

function recruitForm(r, scenes) {
  r = r || {};
  return layout('リクルート編集', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>採用ページを編集</h1>
    <form method="post" action="/admin/recruit" enctype="multipart/form-data">
      <label>ページ上部ラベル</label><input type="text" name="headEyebrow" value="${esc(r.headEyebrow)}">
      <label>大見出し（改行可）</label><textarea name="headTtl">${esc((r.headTtl || '').replace(/<br>/g, '\n'))}</textarea>
      <label>英語サブ</label><input type="text" name="headEn" value="${esc(r.headEn)}">
      <label>日本語サブ</label><input type="text" name="headJp" value="${esc(r.headJp)}">
      <label>本文 (HTML可・&lt;p&gt;で段落)</label><textarea name="bodyHtml" style="min-height:160px">${esc(r.bodyHtml)}</textarea>
      ${r.headImg ? `<label>現在の見出し画像</label><div class="thumbs"><div class="thumb"><img src="/${esc(r.headImg)}" alt=""></div></div>` : ''}
      <label>見出し画像を差し替え</label><input type="file" name="headImg" accept="image/*">
      <div class="row" style="margin-top:22px"><button class="btn" type="submit">保存</button><a class="btn ghost" href="/admin">キャンセル</a></div>
    </form>`);
}

function inquiriesList(list) {
  const rows = list.map(q => `
    <div class="card" style="align-items:flex-start">
      <div class="grow">
        <b>${esc(q.name)}</b>
        <small>${esc((q.at || '').replace('T', ' ').slice(0, 16))} · <a href="mailto:${esc(q.email)}">${esc(q.email)}</a>${q.phone ? ' · ' + esc(q.phone) : ''}</small>
        <p style="margin:8px 0 0;white-space:pre-wrap;font-size:14px">${esc(q.message)}</p>
      </div>
      <form method="post" action="/admin/inquiries/${esc(q.id)}/delete" onsubmit="return confirm('この問い合わせを削除しますか？')"><button class="btn danger sm">削除</button></form>
    </div>`).join('');
  return layout('お問い合わせ受信箱', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>お問い合わせ受信箱</h1>
    ${rows || '<p class="muted">まだお問い合わせはありません。</p>'}
  `);
}

function newsForm(item, isNew, err) {
  item = item || {};
  return layout(isNew ? 'お知らせ追加' : 'お知らせ編集', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>${isNew ? 'お知らせを追加' : 'お知らせを編集'}</h1>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <form method="post" action="/admin/news${isNew ? '' : '/' + esc(item.id)}">
      <label>日付</label><input type="date" name="date" value="${esc(item.date)}" required style="width:auto;padding:9px 11px;border:1px solid #cdc7ba;border-radius:8px;font:inherit">
      <label>タイトル</label><input type="text" name="title" value="${esc(item.title)}" required>
      <label>本文</label><textarea name="body" style="min-height:220px">${esc(item.body)}</textarea>
      <div class="hint">空行で段落が分かれます。HTMLタグもそのまま使えます。</div>
      <div class="row" style="margin-top:22px"><button class="btn" type="submit">保存</button><a class="btn ghost" href="/admin">キャンセル</a></div>
    </form>`);
}

function settingsForm(st, err) {
  st = st || {};
  return layout('お問い合わせ設定', `
    <p><a href="/admin">← 戻る</a></p>
    <h1>お問い合わせ設定</h1>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <p class="muted">メールアドレスを設定すると「お問い合わせ」ボタンがメール作成画面を開くようになります。メール未設定で電話番号のみの場合は電話発信リンクになります。</p>
    <form method="post" action="/admin/settings">
      <label>お問い合わせ用メールアドレス</label><input type="text" name="contactEmail" value="${esc(st.contactEmail)}" placeholder="info@example.co.jp">
      <label>電話番号（任意）</label><input type="text" name="contactPhone" value="${esc(st.contactPhone)}" placeholder="0980-00-0000">
      <div class="row" style="margin-top:22px"><button class="btn" type="submit">保存</button><a class="btn ghost" href="/admin">キャンセル</a></div>
    </form>`);
}

module.exports = { layout, loginPage, dashboard, serviceForm, workForm, recruitForm, settingsForm, inquiriesList, newsForm };
