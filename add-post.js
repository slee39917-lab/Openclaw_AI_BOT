#!/usr/bin/env node
/**
 * add-post.js — 第五階段 V1：新增一篇文章（機械步驟）
 * ------------------------------------------------------------------
 * 設計原則：
 *   - posts.json 仍是「唯一文章來源」，此腳本只是把它寫得安全、可重複。
 *   - 只做三件事：驗證草稿 → 插入 posts.json（id = max(id)+1，插在最前面）→ 執行 build.js。
 *   - 不做任何「預覽 / 發布判斷」。是否發布，由助手在對話中依第五階段規範
 *     先給使用者看【文章預覽】，收到「發布」後才呼叫本腳本。
 *   - 不引入任何框架 / npm 套件 / 資料庫；不建立第二套文章來源。
 *
 * 用法：
 *   node add-post.js [--dry-run] [--no-build] <draft.json>
 *
 *   --dry-run   只計算與印出，不寫任何檔案（安全預檢）
 *   --no-build  寫入 posts.json 後，不自動執行 build.js
 *
 * draft.json 格式（由助手在收到「發布」後，依稿件產生）：
 *   {
 *     "title":   "文章標題",
 *     "date":    "YYYY-MM-DD",
 *     "tags":    ["退休生活", "人生覺察"],
 *     "content": "<p>第一段</p>\n\n<p>第二段</p>"
 *   }
 * ------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DIR = __dirname;
const POSTS_FILE = path.join(DIR, 'posts.json');
const BUILD_FILE = path.join(DIR, 'build.js');

function fail(msg) {
  console.error('❌ ' + msg);
  process.exit(1);
}

// ---- 參數 ----
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noBuild = args.includes('--no-build');
const draftPath = args.find((a) => !a.startsWith('--'));
if (!draftPath) fail('用法：node add-post.js [--dry-run] [--no-build] <draft.json>');

// ---- 讀取草稿 ----
let draft;
try {
  draft = JSON.parse(fs.readFileSync(path.resolve(draftPath), 'utf8'));
} catch (e) {
  fail('無法讀取或解析草稿 JSON：' + e.message);
}
if (typeof draft !== 'object' || draft === null || Array.isArray(draft)) {
  fail('草稿必須是一個 JSON 物件');
}

// ---- 驗證欄位 ----
const { title, date, tags, content } = draft;
if (typeof title !== 'string' || !title.trim()) fail('缺少有效的 title');
if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('date 需為 YYYY-MM-DD 格式');
if (!Array.isArray(tags) || tags.length === 0 ||
    tags.some((t) => typeof t !== 'string' || !t.trim())) {
  fail('tags 需為「非空字串」陣列');
}
if (typeof content !== 'string' || !content.trim()) fail('缺少有效的 content');

// ---- 讀取 posts.json ----
let posts;
try {
  posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
} catch (e) {
  fail('無法讀取或解析 posts.json：' + e.message);
}
if (!Array.isArray(posts)) fail('posts.json 格式錯誤：必須是陣列');

const beforeCount = posts.length;
const beforeSnapshot = posts.map((p) => JSON.stringify(p)); // 依原順序快照，用於寫入後比對
const beforeIds = new Set(posts.map((p) => Number(p.id)));
const maxId = posts.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
const newId = maxId + 1;

if (posts.some((p) => p.title === title)) {
  console.warn('⚠️  已存在相同標題的文章，請再次確認是否為重複：' + title);
}

// ---- 組裝新文章（key 順序與現有文章一致：id,title,date,tags,content）----
const newPost = { id: newId, title: title.trim(), date, tags: tags.slice(), content };

if (dryRun) {
  console.log('🔎 DRY RUN（不寫任何檔案）');
  console.log('   目前篇數：' + beforeCount + '，最大 id：' + maxId);
  console.log('   將新增 id=' + newId + '｜' + date + '｜' + title.trim());
  console.log('   tags：' + tags.join('、'));
  process.exit(0);
}

// ---- 寫入：新文章插在最前面；維持 2 空白縮排、key 順序、結尾不加換行 ----
posts.unshift(newPost);
fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');

// ---- 寫入後自我驗證：只多一篇，既有文章一字未改 ----
let after;
try {
  after = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
} catch (e) {
  fail('寫入後 posts.json 無法解析，請用備份還原：' + e.message);
}
if (after.length !== beforeCount + 1) {
  fail('寫入後篇數異常（預期 ' + (beforeCount + 1) + '，實際 ' + after.length + '），請用備份還原');
}
if (Number(after[0].id) !== newId) {
  fail('寫入後新文章不在最前面，請用備份還原');
}
const afterRest = after.slice(1).map((p) => JSON.stringify(p));
if (afterRest.length !== beforeSnapshot.length ||
    afterRest.some((s, i) => s !== beforeSnapshot[i])) {
  fail('偵測到既有文章內容被更動，已停止，請用備份還原');
}

// ---- 執行 build.js（重生首頁卡片）----
if (!noBuild) {
  if (!fs.existsSync(BUILD_FILE)) fail('找不到 build.js，無法重建首頁');
  const r = spawnSync(process.execPath, [BUILD_FILE], { stdio: 'inherit' });
  if (r.status !== 0) fail('build.js 執行失敗');
}

console.log('✅ 已新增文章 id=' + newId + '：' + title.trim());
console.log('   ' + date + '｜tags：' + tags.join('、'));
console.log('   後續步驟：git add posts.json index.html && git commit && git push');
