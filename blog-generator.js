const fs = require('fs');
const path = require('path');

// 讀取部落格數據
const blogData = JSON.parse(fs.readFileSync('blog.json', 'utf8'));
const posts = blogData.posts;

// 生成首頁
function generateIndex() {
  let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogData.site.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>${blogData.site.title}</h1>
    <p>${blogData.site.subtitle}</p>
  </header>
  <div class="container">
    <nav>
      <a href="index.html">首頁</a>
      <a href="about.html">關於</a>
    </nav>
    <div class="post-list">
`;

  posts.forEach(post => {
    html += `
      <article class="post-card">
        <h2><a href="post-${post.slug}.html">${post.title}</a></h2>
        <time>${post.date}</time>
        <p class="summary">${post.summary}</p>
      </article>
`;
  });

  html += `
    </div>
  </div>
  <footer>
    <p>© ${blogData.site.year} ${blogData.site.author}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync('index.html', html);
  console.log('Generated index.html');
}

// 生成單篇文章
function generatePost(post) {
  const contentHtml = post.content.split('\n').map(p => `<p>${p}</p>`).join('');
  
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - ${blogData.site.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1><a href="index.html">${blogData.site.title}</a></h1>
    <p>${blogData.site.subtitle}</p>
  </header>
  <div class="container">
    <nav>
      <a href="index.html">首頁</a>
      <a href="about.html">關於</a>
    </nav>
    <article class="post-content">
      <h2>${post.title}</h2>
      <time>${post.date}</time>
      <div class="content">
        ${contentHtml}
      </div>
    </article>
    <div class="back-link">
      <a href="index.html">← 回首頁</a>
    </div>
  </div>
  <footer>
    <p>© ${blogData.site.year} ${blogData.site.author}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(`post-${post.slug}.html`, html);
  console.log(`Generated post-${post.slug}.html`);
}

// 生成關於頁面
function generateAbout() {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>關於 - ${blogData.site.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1><a href="index.html">${blogData.site.title}</a></h1>
    <p>${blogData.site.subtitle}</p>
  </header>
  <div class="container">
    <nav>
      <a href="index.html">首頁</a>
      <a href="about.html">關於</a>
    </nav>
    <article class="post-content">
      <h2>關於我</h2>
      <div class="content">
        <p>歡迎來到我的個人部落格！</p>
        <p>這裡記錄我的生活隨筆、思考與發現。</p>
      </div>
    </article>
    <div class="back-link">
      <a href="index.html">← 回首頁</a>
    </div>
  </div>
  <footer>
    <p>© ${blogData.site.year} ${blogData.site.author}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync('about.html', html);
  console.log('Generated about.html');
}

// 生成 CSS
function generateCSS() {
  const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

header {
  background: #fff;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

header h1 a {
  color: #333;
  text-decoration: none;
}

header h1 a:hover {
  color: #007bff;
}

header p {
  color: #666;
  font-size: 1.1em;
}

nav {
  background: #fff;
  padding: 15px 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

nav a {
  color: #333;
  text-decoration: none;
  margin-right: 20px;
  font-weight: 500;
}

nav a:hover {
  color: #007bff;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.post-card {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-3px);
}

.post-card h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.post-card h2 a {
  color: #333;
  text-decoration: none;
}

.post-card h2 a:hover {
  color: #007bff;
}

.post-card time {
  color: #999;
  font-size: 0.9em;
  margin-bottom: 15px;
  display: block;
}

.post-card .summary {
  color: #666;
}

.post-content {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.post-content h2 {
  font-size: 2em;
  margin-bottom: 20px;
}

.post-content time {
  color: #999;
  margin-bottom: 30px;
  display: block;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.post-content .content {
  font-size: 1.1em;
  line-height: 1.8;
}

.post-content .content p {
  margin-bottom: 20px;
}

.post-content .content a {
  color: #007bff;
  text-decoration: none;
}

.post-content .content a:hover {
  text-decoration: underline;
}

.back-link {
  text-align: center;
  margin: 30px 0;
}

.back-link a {
  color: #007bff;
  text-decoration: none;
  font-size: 1.1em;
}

.back-link a:hover {
  text-decoration: underline;
}

footer {
  text-align: center;
  padding: 40px;
  color: #999;
  margin-top: 40px;
  border-top: 1px solid #eee;
}

@media (max-width: 600px) {
  header h1 {
    font-size: 1.8em;
  }
  
  .post-content {
    padding: 20px;
  }
  
  .post-content h2 {
    font-size: 1.5em;
  }
}
`;

  fs.writeFileSync('style.css', css);
  console.log('Generated style.css');
}

// 執行生成
generateCSS();
generateIndex();
posts.forEach(post => generatePost(post));
generateAbout();

console.log('\n✅ 部落格生成完成！');
console.log('Generated files:');
console.log('- index.html (首頁)');
console.log('- about.html (關於頁面)');
console.log('- style.css (樣式表)');
posts.forEach(post => console.log(`- post-${post.slug}.html (${post.title})`));
