# 新新生活思維部落格

這是一個超簡單的靜態部落格，使用 Node.js 腳本生成。

## 快速開始

### 添加新文章

1. 編輯 `blog.json`，在 `posts` 數組中添加新文章：
```json
{
  "slug": "文章標識",
  "title": "文章標題",
  "date": "2026-07-31",
  "summary": "文章摘要",
  "content": "文章內容"
}
```

2. 執行生成命令：
```bash
node blog-generator.js
```

3. 提交並推送：
```bash
git add -A
git commit -m "new post: 文章標題"
git push
```

4. GitHub Pages 會在 2-3 分鐘內自動更新

## 部署

這個部落格使用 GitHub Pages 部署，網址為：
https://slee39917-lab.github.io/Openclaw_AI_BOT/

## 特點

- 超簡單，不需要任何框架
- 純靜態文件，直接部署
- 響應式設計，手機也能看
- 容易添加/刪除文章

## 文件結構

```
.
├── blog.json          # 文章數據（你只需要編輯這個）
├── blog-generator.js  # 生成腳本
├── index.html         # 首頁（自動生成）
├── about.html         # 關於頁面（自動生成）
├── post-*.html        # 文章頁面（自動生成）
└── style.css          # 樣式表（自動生成）
```
