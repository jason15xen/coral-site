'use strict';
// Renders CMS content into HTML that matches the existing index.html design exactly.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// For fields where the admin is allowed simple line breaks (trusted, single editor).
function escBr(s) {
  return esc(s).replace(/\n/g, '<br>');
}
// Title fields may contain a literal <br> (stored) OR newlines; allow only <br> through.
function titleBr(s) {
  return esc(s).replace(/&lt;br\s*\/?&gt;/gi, '<br>').replace(/\n/g, '<br>');
}

function serviceRow(it) {
  const imgs = Array.isArray(it.images) ? it.images.filter(i => i && i.src) : [];
  const isSlide = imgs.length > 1;
  const scene = it.scene || 'sc-villa';
  let media;
  if (isSlide) {
    media = imgs.map((im, i) =>
      `<img class="slide__img${i === 0 ? ' on' : ''}" src="${esc(im.src)}" alt="${esc(im.alt)}">`
    ).join('\n        ') + '\n        <span class="slide__dots"></span>';
  } else if (imgs.length === 1) {
    media = `<img class="shot on" src="${esc(imgs[0].src)}" alt="${esc(imgs[0].alt)}">`;
  } else {
    media = '';
  }
  const cap = it.caption ? `\n        <span class="cap">${esc(it.caption)}</span>` : '';
  return `      <div class="svc__row">
        <p class="svc__en">${esc(it.en)}</p>
        <div>
          <h3 class="svc__jp">${esc(it.jp)}</h3>
          <p class="svc__desc">${escBr(it.desc)}</p>
        </div>
        <div class="ph svc__thumb${isSlide ? ' slide' : ''}">
          <svg class="scene" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><use href="#${esc(scene)}"/></svg>
          ${media}${cap}
        </div>
      </div>`;
}

function servicesHtml(list) {
  return '\n' + list.map(serviceRow).join('\n') + '\n    ';
}

function workCard(it) {
  const scene = it.scene || 'sc-villa';
  const url = it.url && it.url.trim() ? it.url.trim() : '#';
  return `      <a href="${esc(url)}" class="work">
        <div class="ph work__img">
          <svg class="scene" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><use href="#${esc(scene)}"/></svg>
          <img class="shot on" src="${esc(it.image)}" alt="${esc(it.name)}">
        </div>
        <p class="work__meta"><span>${esc(it.metaEn)}</span><span>${esc(it.metaJp)}</span></p>
        <p class="work__name">${esc(it.name)}</p>
      </a>`;
}

function worksHtml(list) {
  return '\n' + list.map(workCard).join('\n') + '\n    ';
}

// Full works list page ("All works"): every work from the CMS.
function worksPageHtml(list) {
  return `
  <section class="page-head">
    <img class="page-head__img" src="assets/img/message-hero.jpg" alt="Works">
    <div class="page-head__mask"></div>
    <div class="page-head__txt">
      <p class="eyebrow" style="color:var(--sand)">Works</p>
      <h1 class="page-head__ttl">実績一覧</h1>
      <p class="page-head__en">All works</p>
      <p class="page-head__jp">これまでに手がけた施設</p>
    </div>
  </section>
  <section class="sec">
    <div class="works rv">
${list.map(workCard).join('\n')}
    </div>
    <p style="margin-top:44px"><a href="#top" class="more" data-page="top">← Back to top</a></p>
  </section>`;
}

// ---------- News ----------
function fmtDate(d) { return String(d || '').replace(/-/g, '.'); }
// Admin may enter plain text (blank line = paragraph) or HTML.
function bodyToHtml(body) {
  body = String(body || '');
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return body.split(/\n\s*\n/).filter(Boolean).map(p => `<p>${escBr(p.trim())}</p>`).join('\n');
}
function newsItem(n) {
  return `<a href="#news-${esc(n.id)}" class="news__item" data-modal="modal-news" data-news="${esc(n.id)}"><span class="news__date">${esc(fmtDate(n.date))}</span><span class="news__ttl">${esc(n.title)}</span></a>`;
}
function newsItemsHtml(list) {
  return list.length ? '\n      ' + list.map(newsItem).join('\n      ') + '\n      ' : '\n      <p class="muted-note">お知らせはまだありません。</p>\n      ';
}
function newsPageHtml(list) {
  return `
  <section class="page-head">
    <img class="page-head__img" src="assets/img/message-hero.jpg" alt="News">
    <div class="page-head__mask"></div>
    <div class="page-head__txt">
      <p class="eyebrow" style="color:var(--sand)">News</p>
      <h1 class="page-head__ttl">お知らせ一覧</h1>
      <p class="page-head__en">All news</p>
    </div>
  </section>
  <section class="sec">
    <div class="msg rv">
      ${list.length ? list.map(newsItem).join('\n      ') : '<p>お知らせはまだありません。</p>'}
      <p style="margin-top:44px"><a href="#top" class="more" data-page="top">← Back to top</a></p>
    </div>
  </section>`;
}
function newsDetailHtml(list) {
  return list.map(n => `
    <article data-news-id="${esc(n.id)}" hidden>
      <p class="news__date">${esc(fmtDate(n.date))}</p>
      <h2 class="news-detail__ttl">${esc(n.title)}</h2>
      <div class="news-detail__body">${bodyToHtml(n.body)}</div>
    </article>`).join('');
}

// Recruit page (its own in-page "page", styled like the Company page-head).
function recruitPageHtml(r) {
  r = r || {};
  return `
  <section class="page-head">
    <img class="page-head__img" src="${esc(r.headImg || 'assets/img/message-hero.jpg')}" alt="${esc(r.headJp || 'Recruit')}">
    <div class="page-head__mask"></div>
    <div class="page-head__txt">
      <p class="eyebrow" style="color:var(--sand)">${esc(r.headEyebrow || 'Recruit')}</p>
      <h1 class="page-head__ttl">${titleBr(r.headTtl || '')}</h1>
      <p class="page-head__en">${esc(r.headEn || '')}</p>
      <p class="page-head__jp">${esc(r.headJp || '')}</p>
    </div>
  </section>
  <section class="sec">
    <div class="msg rv">
      ${r.bodyHtml || ''}
      <p style="margin-top:36px"><a href="#top" class="more" data-page="top">← Back to top</a></p>
    </div>
  </section>`;
}

// Contact button: opens the on-site inquiry form page.
function contactBtnHtml(settings) {
  return `<a href="#inquiry" class="contact__btn" data-modal="modal-contact">お問い合わせ</a>`;
}

// The inquiry form page (in-page "page" like Company/Recruit). Submissions POST
// to /api/inquiry and are stored for the admin; email/phone from settings are
// offered as alternative contact routes when configured.
function contactFormPageHtml(settings) {
  settings = settings || {};
  const email = (settings.contactEmail || '').trim();
  const phone = (settings.contactPhone || '').trim();
  let alt = '';
  if (email || phone) {
    const parts = [];
    if (phone) parts.push(`<a href="tel:${esc(phone.replace(/[^+\d]/g, ''))}">${esc(phone)}</a>`);
    if (email) parts.push(`<a href="mailto:${esc(email)}">${esc(email)}</a>`);
    alt = `<p class="cform__alt">お急ぎの場合はこちらへ：${parts.join(' ／ ')}</p>`;
  }
  return `
    <p class="eyebrow" style="color:var(--sand)">Contact</p>
    <h2 class="modal__ttl">お問い合わせ</h2>
    <p class="modal__lead">運営・清掃のご相談、採用のご応募など、お気軽にどうぞ。</p>
    <form class="cform" id="cform" method="post" action="/api/inquiry">
      <label for="cf-name">お名前 <span aria-hidden="true">*</span></label>
      <input id="cf-name" name="name" required maxlength="100" autocomplete="name">
      <label for="cf-email">メールアドレス <span aria-hidden="true">*</span></label>
      <input id="cf-email" type="email" name="email" required maxlength="200" autocomplete="email">
      <label for="cf-phone">電話番号（任意）</label>
      <input id="cf-phone" name="phone" maxlength="40" autocomplete="tel">
      <label for="cf-msg">お問い合わせ内容 <span aria-hidden="true">*</span></label>
      <textarea id="cf-msg" name="message" required maxlength="4000"></textarea>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit">送信する</button>
      <p class="cform__msg" id="cformMsg" aria-live="polite"></p>
    </form>
    ${alt}
  <script>
  (function(){var f=document.getElementById('cform');if(!f)return;
  if(location.protocol==='file:'){var b0=f.querySelector('button'),m0=document.getElementById('cformMsg');b0.disabled=true;m0.textContent='※プレビュー表示のため送信できません。公開サイト上でご利用ください。';return;}
  f.addEventListener('submit',function(e){e.preventDefault();
    var m=document.getElementById('cformMsg'),b=f.querySelector('button');
    b.disabled=true;m.textContent='送信中…';
    fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(Object.fromEntries(new FormData(f)))})
    .then(function(r){return r.json()})
    .then(function(j){if(j.ok){f.reset();m.textContent='送信しました。担当者よりご連絡いたします。';}
      else{m.textContent=j.error||'送信に失敗しました。時間をおいてお試しください。';b.disabled=false;}})
    .catch(function(){m.textContent='サーバーに接続できませんでした。時間をおいて再度お試しください。';b.disabled=false;});
  });})();
  </script>`;
}

module.exports = { esc, escBr, servicesHtml, worksHtml, worksPageHtml, newsItemsHtml, newsPageHtml, newsDetailHtml, recruitPageHtml, contactBtnHtml, contactFormPageHtml };
