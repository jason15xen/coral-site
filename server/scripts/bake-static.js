'use strict';
// Regenerates the static fallback content baked between every <!--CMS:X--> marker
// in index.html from server/data/content.json, so the file previews correctly
// without the Node server (client design review, file:// opening).
// Run after changing render.js or the seed content:  node server/scripts/bake-static.js
const fs = require('fs');
const path = require('path');
const render = require('../render');
const store = require('../store');

const file = path.join(__dirname, '..', '..', 'index.html');
const c = store.getContent();
const parts = {
  SERVICES: render.servicesHtml(c.services),
  WORKS: render.worksHtml(c.works.slice(0, 3)),
  WORKS_PAGE: render.worksPageHtml(c.works),
  NEWS: render.newsItemsHtml(c.news.slice(0, 3)),
  NEWS_PAGE: render.newsPageHtml(c.news),
  NEWS_DETAIL: render.newsDetailHtml(c.news),
  RECRUIT_PAGE: render.recruitPageHtml(c.recruit),
  CONTACT: render.contactBtnHtml(c.settings),
  CONTACT_PAGE: render.contactFormPageHtml(c.settings),
};
let html = fs.readFileSync(file, 'utf8');
for (const [k, inner] of Object.entries(parts)) {
  const a = `<!--CMS:${k}-->`, b = `<!--/CMS:${k}-->`;
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i === -1 || j === -1) { console.warn('marker missing:', k); continue; }
  html = html.slice(0, i + a.length) + inner + html.slice(j);
  console.log('baked', k.padEnd(13), inner.length, 'chars');
}
fs.writeFileSync(file, html);
