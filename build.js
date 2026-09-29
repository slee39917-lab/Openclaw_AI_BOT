#!/usr/bin/env node
/**
 * build.js
 * ------------------------------------------------------------------
 * 用途：以 posts.json 為「唯一資料來源」，自動產生 index.html 的
 *       首頁文章卡片（最新文章在最上方）。
 *
 * 使用方式： node build.js
 *
 * 設計原則：
 *   - 純靜態，不引入任何框架（維持 HTML + CSS + 原生 JS 架構）
 *   - 可重複執行（idempotent）：每次都由 posts.json 重新產生，
 *     不會造成重複或累積
 *   - 只改 index.html 中 <!-- POSTS:START --> ... <!-- POSTS:END -->
 *     之間的區塊，其餘 HTML 完全不動
 * ------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const POSTS_FILE = path.join(DIR, 'posts.json');
const INDEX_FILE = path.join(DIR, 'index.html');
const START = '<!-- POSTS:START -->';
const END = '<!-- POSTS:END -->';

// 首頁卡片摘要長度（字元）
const SUMMARY_LEN = 80;

/** 將文章 content（可能含 HTML）轉為純文字，用於產生摘要 */
function htmlToText(html) {
  if (!html) return '';
  let s = String(html);
  // 移除 script / style 內容
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  // 區塊與換行元素 → 空白，避免文字黏在一起
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = s.replace(/<\/(p|div|h[1-6]|li|blockquote|tr|td)\s*>/gi, ' ');
  // 移除其餘所有標籤（含 <img> <iframe> <video> <a> 等）
  s = s.replace(/<[^>]+>/g, ' ');
  // 還原常見 HTML 實體
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ', '&hellip;': '…',
    '&mdash;': '—', '&ndash;': '–'
  };
  s = s.replace(/&[a-z#0-9x]+;/gi, (m) => (entities[m] !== undefined ? entities[m] : m));
  // 壓縮空白
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** 由 content 產生摘要 */
function makeSummary(html) {
  const text = htmlToText(html);
  if (text.length <= SUMMARY_LEN) return text;
  return text.slice(0, SUMMARY_LEN) + '…';
}

/** HTML 文字轉義（用於標題、日期、摘要） */
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 產生單一文章卡片 HTML（格式與原本首頁一致） */
function renderCard(post) {
  const id = post.id;
  const title = escapeHtml(post.title);
  const date = escapeHtml(post.date);
  const summary = escapeHtml(makeSummary(post.content));
  return [
    '      <article class="post-card">',
    `        <h3><a href="post.html?id=${id}">${title}</a></h3>`,
    `        <time>${date}</time>`,
    `        <p>${summary}</p>`,
    `        <a href="post.html?id=${id}" class="read-more">閱讀更多 →</a>`,
    '      </article>'
  ].join('\n');
}

function main() {
  if (!fs.existsSync(POSTS_FILE)) throw new Error('找不到 posts.json');
  if (!fs.existsSync(INDEX_FILE)) throw new Error('找不到 index.html');

  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  if (!Array.isArray(posts)) throw new Error('posts.json 格式錯誤：必須是陣列');

  // 依 id 由大到小（最新在最上面），與現有首頁排序一致
  const sorted = posts.slice().sort((a, b) => Number(b.id) - Number(a.id));

  const block = sorted.map(renderCard).join('\n');

  let html = fs.readFileSync(INDEX_FILE, 'utf8');
  const markerRe = new RegExp(
    START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[\\s\\S]*?' +
    END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  if (!markerRe.test(html)) {
    throw new Error(
      'index.html 找不到 ' + START + ' / ' + END + ' 標記，請先確認檔案結構。'
    );
  }

  html = html.replace(markerRe, `${START}\n${block}\n      ${END}`);
  fs.writeFileSync(INDEX_FILE, html, 'utf8');

  console.log(`✅ build 完成：由 posts.json 產生 ${sorted.length} 張文章卡片`);
  console.log(`   （最新：id=${sorted[0].id} ${sorted[0].title}）`);
}

main();
