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

module.exports = { esc, escBr, servicesHtml, worksHtml, recruitPageHtml };
