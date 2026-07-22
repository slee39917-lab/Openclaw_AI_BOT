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

## Notion Integration
- **Token:** `ntn_27…z2b1`
- **Page ID:** `a5e28a64db5a4416895bb53c2e3de93b`
- **User:** Lee Steve01
- First configured: 2026-07-21
- Note: Token masked for safety; full token stored in memory_search only
