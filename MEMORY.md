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

### 每日新增貼文正確流程（2026-07-22 最終修正版）
**工作流程：** blog-preview/ 目錄內操作，然後推到 GitHub root
1. 在 `blog-preview/content/posts/` 建立 .md 檔案
2. 確認 `blog-preview/layouts/_default/baseof.html` 存在 ✅
3. 在 `blog-preview/` 執行 `hugo --minify`（本地測試）
4. 本地驗證 post 頁面是否正確生成：
   - `grep -c 'class=post-card' blog-preview/public/index.html` （應該 = 文章數）
   - `wc -c blog-preview/public/posts/<slug>/index.html` （應該 > 5000 bytes）
5. 在 workspace 根目錄執行：`git add -A && git commit -m "new post: <標題>" && git push`
6. GitHub Actions 自動跑 `hugo --minify` + `cp -rf blog-preview/public/* ./` + 重新 commit + push
7. GitHub Pages CDN 自動更新（約 1-3 分鐘）
8. 最終驗證：
   - `curl -s https://raw.githubusercontent.com/slee39917-lab/Openclaw_AI_BOT/main/index.html | grep -c 'class=post-card'`
   - `curl -s -o /dev/null -w "%{http_code}" https://slee39917-lab.github.io/Openclaw_AI_BOT/posts/<slug>/`
   - 首頁文章數應為 26（27 content files - 1 about page = 26）

**重要注意事項：**
- GitHub Actions workflow 已修復啟用（2026-07-22），使用 Hugo 0.111.3
- baseof.html 是必要模板，single.html 使用 {{ define "main" }} 需要它包套，否則所有 post 頁面會空
- pagerSize = 100 保證所有文章在同一頁顯示
- deploy commit 會再次觸發 workflow，但不會無限循環（GitHub 去重機制）
- 手動在 workspace root 放了 index.html 後，下次 push 會被 GitHub Actions 覆蓋（正常行為）

### 驗證步驟
- 本地確認：`grep -c 'class=post-card' blog-preview/public/index.html`
- GitHub 確認：`curl -s https://raw.githubusercontent.com/slee39917-lab/Openclaw_AI_BOT/main/index.html | grep -c 'class=post-card'`
- 直播檢查：`curl -s -o /dev/null -w "%{http_code}" https://slee39917-lab.github.io/Openclaw_AI_BOT/posts/<slug>/`
- 本地與 GitHub 卡片數一致才算成功

## Notion Integration
- **Token:** `ntn_27…z2b1`
- **Page ID:** `a5e28a64db5a4416895bb53c2e3de93b`
- **User:** Lee Steve01
- First configured: 2026-07-21
- Note: Token masked for safety; full token stored in memory_search only
