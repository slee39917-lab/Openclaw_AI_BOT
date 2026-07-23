# Long-term Memory

## ⚠️ 部落格鐵律：絕對不可遺漏
**每次操作 blog-preview Hugo 部落格，必須確保：**
1. 所有文章同時寫入 `content/posts/`（Hugo 來源）和 `public/posts/`（靜態輸出）
2. **禁止只保留 public/ 的 HTML 而丟失 content/ 的 .md 來源檔**
3. 刪除任何 blog-preview 相關檔案前先檢查是否有其他文章依賴
4. git push 前必跑比對：`ls content/posts/*.md | wc -l` vs `ls public/posts/ | sort`
5. MEMORY.md 中的敏感 token 不得 commit 到 git（已在 .gitignore 排除）
6. 新增文章絕不能影響其他 .md 檔案的存在狀態

### 🔴 歷史教訓（已修復，但需牢記）

**坑 1：文章只有靜態 HTML，沒有 .md 來源檔**
- 7篇文章只存在 `public/posts/`，`content/posts/` 完全空白
- GitHub Actions build → Hugo 掃描不到文章 → 產生空頁或空白頁
- ✅ 解法：.md 來源檔才是根本，public/ 只是產物

**坑 2：部分 .md 藏在 workspace 根目錄**
- 有2篇甚至藏在 `/home/node/.openclaw/workspace/posts/`，不在 Hugo 系統內
- ✅ 解法：確認 .md 一律在 `blog-preview/content/posts/`

**坑 3：GitHub Actions 產生空白 post 頁面（1 byte）**
- single.html 用 `{{ define "main" }}`，但沒有 baseof.html 包套
- Hugo build 出來的 post 頁面全是空的（1 bytes）
- ✅ 解法：建立 `blog-preview/layouts/_default/baseof.html`

**坑 4：手動部署 public/ 被 GitHub Actions 覆蓋**
- 初期手動推 public/ 至 GitHub root → 成功但 workflow 停用
- 手動推的 index.html 會被 workflow build 結果覆蓋
- ✅ 解法：deploy.yml 修復後，停止手動推 public/

**坑 5：GitHub Actions workflow 重建後重複運行 loop**
- 本地先 hugo → git push → workflow 又 run 一次
- deploy commit 觸發二次 workflow
- ✅ 實際：GitHub 去重機制 → 不是問題，不需擔心

---

## 部落格部署：完整標準流程（2026-07-23 最終版）
**網站網址：** https://slee39917-lab.github.io/Openclaw_AI_BOT/

### 🛡️ 核心防錯設定
| 項目 | 值 | 說明 |
|------|-----|------|
| pagerSize | `pagination.pagerSize = 100` | 所有文章同一頁顯示，不分成多頁 |
| 模板包套 | `baseof.html` 存在 | single.html 用 {{ define }} 需要 baseof.html 包套 |
| 資料分組 | layouts/index.html 用 `.GroupByDate` | 按日期分組渲染 |
| .gitignore | 排除 token/敏感資料 | 金鑰不得進入 git |

### 📝 新增貼文標準流程
```
1. 建立 .md 來源檔案
   └─→ blog-preview/content/posts/<文章標題>.md

2. 驗證模板存在
   └─→ ls blog-preview/layouts/_default/baseof.html ✅

3. 本地構建測試
   └─→ cd blog-preview && hugo --minify

4. 本地驗證產出正確
   └─→ grep -c 'class=post-card' blog-preview/public/index.html （應=文章數）
   └─→ wc -c blog-preview/public/posts/<slug>/index.html （應 > 5000 bytes）

5. 推送到 GitHub
   └─→ cd /workspace && git add -A && git commit -m "new post: <標題>" && git push

6. GitHub Actions 自動部署
   └─→ .github/workflows/deploy.yml 會執行：
       a. checkout main
       b. Hugo 0.111.3 build (blog-preview/)
       c. cp -rf blog-preview/public/* ./
       d. git commit + push

7. 等待 GitHub Pages CDN 更新（1-3 分鐘）

8. 最終驗證
   └─→ curl -s https://raw.githubusercontent.com/slee39917-lab/Openclaw_AI_BOT/main/index.html | grep -c 'class=post-card'
   └─→ curl -s -o /dev/null -w "%{http_code}" https://slee39917-lab.github.io/Openclaw_AI_BOT/posts/<slug>/
   └─→ GitHub raw index.html 與 live site 卡片數一致才算成功
```

### 🏗️ GitHub Actions Workflow
- **位置：** `.github/workflows/deploy.yml`
- **Hugo 版本：** 0.111.3
- **觸發：** push main + workflow_dispatch
- **部署路徑：** blog-preview/ → GitHub root/
- **二次觸發：** deploy commit 會再次觸發 workflow（正常去重，非無限循環）

### 🔍 驗證清單（每次 push 後檢查）
| 項目 | 命令 | 預期結果 |
|------|------|----------|
| GitHub raw index 文章數 | `grep -c 'class=post-card' .../main/index.html` | = 文章數 |
| Live site HTTP 狀態 | `curl -s -o /dev/null -w "%{http_code}" POST_URL` | 200 |
| Post 頁面大小 | `curl -s -o /dev/null -w "%{size_download}" POST_URL` | > 5000 bytes |

### ⚠️ Troubleshooting
| 現象 | 原因 | 解法 |
|------|------|------|
| 首頁文章數減少 | content/posts/ 遺失 .md | 從 backups 恢復或重建 |
| Post 頁面空/1 byte | 缺少 baseof.html | 創建 layouts/_default/baseof.html |
| GitHub Actions 失敗 | Hugo build error | 本地先測試 `cd blog-preview && hugo --minify` |
| 部署後內容不一致 | 手動改了 public/ | 下次 push 會被 workflow 覆蓋（正常行為） |
