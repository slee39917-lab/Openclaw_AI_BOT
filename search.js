/* search.js — 首頁全站文章搜尋 + 標籤篩選
 * 純原生 JavaScript，無任何外部套件或框架。
 * 資料來源：posts.json（標題／日期／標籤／內容）＋ 首頁卡片的 data-* 屬性。
 * 支援中文關鍵字（子字串比對），即時篩選、不需重新載入頁面。
 */
(function () {
  'use strict';

  /** 去除 HTML 標籤，取得純文字（用於搜尋文章的內文） */
  function stripHtml(html) {
    if (!html) return '';
    return String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9x]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** 正規化字串（小寫、壓縮空白），讓搜尋比對更寬鬆 */
  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('search-input');
    var tagBar = document.getElementById('tag-bar');
    var countEl = document.getElementById('result-count');
    var emptyEl = document.getElementById('empty-state');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.post-card'));

    if (!input || !tagBar || cards.length === 0) return;

    var total = cards.length;
    var activeTag = null; // null = 全部
    var byId = {};

    // 先以 DOM 上的 data-* 建立基本索引（即使沒有 posts.json 也能搜尋標題/日期/標籤）
    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '')
        .split(',')
        .map(function (x) { return x.trim(); })
        .filter(Boolean);
      var h3a = card.querySelector('h3 a');
      var time = card.querySelector('time');
      var id = card.getAttribute('data-id');
      byId[id] = {
        title: h3a ? h3a.textContent : '',
        date: time ? time.textContent : '',
        tags: tags,
        text: ''
      };
      card._tags = tags;
    });

    // 取 posts.json 補上 content，讓搜尋範圍包含文章內文
    fetch('posts.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('no posts.json'); return r.json(); })
      .then(function (posts) {
        if (!Array.isArray(posts)) return;
        posts.forEach(function (p) {
          var rec = byId[String(p.id)];
          if (!rec) return;
          rec.title = p.title || rec.title;
          rec.date = p.date || rec.date;
          if (Array.isArray(p.tags) && p.tags.length) rec.tags = p.tags;
          rec.text = stripHtml(p.content);
        });
      })
      .catch(function () { /* 讀不到 posts.json 時，仍可用 DOM 索引搜尋 */ })
      .then(buildIndex);

    function buildIndex() {
      cards.forEach(function (card) {
        var rec = byId[card.getAttribute('data-id')] || { title: '', date: '', tags: [], text: '' };
        card._hay = normalize([rec.title, rec.date, rec.tags.join(' '), rec.text].join(' '));
        if (rec.tags.length) {
          card._tags = rec.tags;
          card.setAttribute('data-tags', rec.tags.join(','));
        }
      });
      buildTagBar();
      applyFilter();
    }

    function buildTagBar() {
      var counts = {};
      cards.forEach(function (c) {
        (c._tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
      });
      var tags = Object.keys(counts).sort(function (a, b) {
        return counts[b] - counts[a] || a.localeCompare(b, 'zh-Hant');
      });
      tagBar.innerHTML = '';
      tagBar.appendChild(makeBtn('全部', null));
      tags.forEach(function (t) { tagBar.appendChild(makeBtn(t, t)); });
    }

    function makeBtn(label, tag) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag-btn';
      b.textContent = label;
      var on0 = (tag === activeTag);
      if (on0) b.classList.add('active');
      b.setAttribute('aria-pressed', on0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        setActiveByTag(tag);
        applyFilter();
      });
      return b;
    }

    function setActiveByTag(tag) {
      activeTag = tag;
      Array.prototype.forEach.call(tagBar.children, function (x) {
        var on = (x.textContent === (tag === null ? '全部' : tag));
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function applyFilter() {
      var q = normalize(input.value);
      var qFlat = q.replace(/\s+/g, '');
      var visible = 0;
      cards.forEach(function (card) {
        var okTag = !activeTag || (card._tags || []).indexOf(activeTag) !== -1;
        var okText = true;
        if (q) {
          var hay = card._hay || '';
          okText = hay.indexOf(q) !== -1 || hay.replace(/\s+/g, '').indexOf(qFlat) !== -1;
        }
        var show = okTag && okText;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (countEl) {
        countEl.textContent =
          '顯示 ' + visible + ' / ' + total + ' 篇' + (activeTag ? '｜標籤：' + activeTag : '');
      }
      if (emptyEl) emptyEl.hidden = visible !== 0;
    }

    // 即時搜尋（輕度 debounce）
    var timer = null;
    input.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(applyFilter, 120);
    });

    // 點卡片上的標籤 chip 也能直接篩選
    cards.forEach(function (card) {
      Array.prototype.forEach.call(card.querySelectorAll('.post-tags .tag'), function (chip) {
        chip.addEventListener('click', function () {
          setActiveByTag(chip.textContent);
          applyFilter();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    });
  });
})();
