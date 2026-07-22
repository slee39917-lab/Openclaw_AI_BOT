# Long-term Memory

## ⚠️ 部落格鐵律：絕對不可遺漏
**每次操作 blog-preview Hugo 部落格，必須確保：**
1. 所有文章同時寫入 `content/posts/`（Hugo 來源）和 `public/posts/`（靜態輸出）
2. **禁止只保留 public/ 的 HTML 而丟失 content/ 的 .md 來源檔**
3. 刪除任何 blog-preview 相關檔案前先檢查是否有其他文章依賴
4. git push 前必跑比對：`ls content/posts/*.md | wc -l` vs `ls public/posts/ | sort`
5. MEMORY.md 中的敏感 token 不得 commit 到 git（已在 .gitignore 排除）
6. 新增文章絕不能影響其他 .md 檔案的存在狀態

上次出錯原因：7篇文章只有 public/ 靜態 HTML，沒有 content/ 來源 `.md`，導致 Hugo 掃描不到。後續有 2 篇甚至藏在 workspace/posts/ 根目錄下，從來沒放進 Hugo 系統。

## 部落格部署：防錯流程（2026-07-22 建立）
**網站網址：** https://slee39917-lab.github.io/Openclaw_AI_BOT/

### 核心防錯設定
- `config.toml` 的 `pagination.pagerSize = 100`（所有文章顯示在同一頁，不分成多頁）
- layouts/index.html 使用 `.GroupByDate` 分組 → 正確

### 每次新增貼文的正確流程
1. 寫好文章 → 存入 `content/posts/`（Hugo 來源 .md 檔）
2. 手動更新 `public/index.html` → 把新文章卡片加進首頁清單
3. git add + commit + push → GitHub Actions 自動跑 hugo --minify
4. GitHub Pages CDN 自動更新（約 1-2 分鐘生效）

### 常見錯誤
- ❌ 只改 pagerSize 不夠！GitHub Actions 每次 hugo 會重新生成 index.html，如果 pagerSize 設太小（如 20），首頁就會被覆蓋回只有幾篇
- ❌ 不能只把 .md 放 content/posts/，必須同步更新 public/index.html 的首頁卡片
- ❌ root 目錄的 index.html 會被 Hugo 覆蓋，所以要確保 pagerSize > 總文章數

### 驗證步驟
- 本地確認：`grep -c "post-card" public/index.html`
- GitHub 確認：`curl -s https://raw.githubusercontent.com/slee39917-lab/Openclaw_AI_BOT/main/index.html | grep -c "post-card"`
- 兩邊數字一致才算成功

## Notion Integration
- **Token:** `ntn_27…z2b1`
- **Page ID:** `a5e28a64db5a4416895bb53c2e3de93b`
- **User:** Lee Steve01
- First configured: 2026-07-21
- Note: Token masked for safety; full token stored in memory_search only
