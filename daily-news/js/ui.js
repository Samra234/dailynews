/**
 * Daily News - UI Renderer & Interaction Module
 * Handles DOM rendering, theme switching, skeletons, modals, and formatters.
 */

const UI = (function () {
  const PLACEHOLDER_IMG = '/assets/images/placeholder.svg';
  const STORAGE_KEY_THEME = 'dailynews_theme';
  const STORAGE_KEY_CONSENT = 'dailynews_cookie_consent';

  // Helper to escape HTML and prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format relative timestamp ("15 minutes ago", "2 hours ago", "Yesterday")
  function formatRelativeTime(dateString) {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (isNaN(date.getTime())) return 'Recently';
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  }

  return {
    /**
     * Initialize Theme (Dark/Light mode)
     */
    initTheme() {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

      document.documentElement.setAttribute('data-theme', initialTheme);
      this.updateThemeButtonIcon(initialTheme);
    },

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY_THEME, next);
      this.updateThemeButtonIcon(next);
    },

    updateThemeButtonIcon(theme) {
      const btn = document.getElementById('themeToggleBtn');
      if (!btn) return;
      if (theme === 'dark') {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        btn.setAttribute('aria-label', 'Switch to light mode');
      } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        btn.setAttribute('aria-label', 'Switch to dark mode');
      }
    },

    /**
     * Render Breaking News Ticker
     */
    renderBreakingTicker(items) {
      const ticker = document.getElementById('breakingTicker');
      if (!ticker) return;

      if (!items || items.length === 0) {
        ticker.innerHTML = '<span class="ticker-item">Latest headlines will appear shortly as news updates.</span>';
        return;
      }

      // Duplicate list to achieve continuous seamless loop
      const duplicated = [...items, ...items];
      ticker.innerHTML = duplicated
        .map(
          (item) => `
        <a href="/article.html?id=${encodeURIComponent(item.id || item.url || '')}" class="ticker-item" data-article-id="${escapeHTML(item.id || item.url || '')}">
          <span class="ticker-bullet">&#x25CF;</span>
          <strong>[${escapeHTML(item.source || 'News')}]</strong>
          <span>${escapeHTML(item.title)}</span>
        </a>
      `
        )
        .join('');
    },

    /**
     * Render Primary Featured Hero Story
     */
    renderFeaturedStory(article, categoryName) {
      const heroContainer = document.getElementById('featuredHero');
      if (!heroContainer) return;

      if (!article) {
        heroContainer.innerHTML = '';
        return;
      }

      const imgUrl = article.image || PLACEHOLDER_IMG;
      const pubDate = formatRelativeTime(article.publishedAt);
      const source = article.source?.name || 'Daily News';
      const catLabel = (categoryName || 'Featured').toUpperCase();
      const readerUrl = `/article.html?id=${encodeURIComponent(article.id || article.url || '')}`;

      heroContainer.innerHTML = `
        <article class="hero-card" data-article-id="${escapeHTML(article.id || '')}">
          <div class="hero-media">
            <span class="category-tag">${escapeHTML(catLabel)}</span>
            <a href="${escapeHTML(readerUrl)}">
              <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(article.title)}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
            </a>
          </div>
          <div class="hero-body">
            <div class="article-meta">
              <span class="article-source">${escapeHTML(source)}</span>
              <span>&bull;</span>
              <time datetime="${escapeHTML(article.publishedAt || '')}">${escapeHTML(pubDate)}</time>
              <span>&bull;</span>
              <span>Verified Report</span>
            </div>
            <h2 class="hero-title">
              <a href="${escapeHTML(readerUrl)}">${escapeHTML(article.title)}</a>
            </h2>
            <p class="hero-excerpt">${escapeHTML(article.description || 'Full journalistic coverage and verified developments on this breaking report.')}</p>
            <a href="${escapeHTML(readerUrl)}" class="read-more-btn">
              Read Full Story
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </article>
      `;
    },

    /**
     * Render Secondary Featured Stories in Sidebar
     */
    renderSecondaryFeatured(articles) {
      const container = document.getElementById('featuredSidebarList');
      if (!container) return;

      if (!articles || articles.length === 0) {
        container.innerHTML = '<p class="text-muted">No secondary stories available.</p>';
        return;
      }

      container.innerHTML = articles
        .map((art) => {
          const imgUrl = art.image || PLACEHOLDER_IMG;
          const pubDate = formatRelativeTime(art.publishedAt);
          const source = art.source?.name || 'News Source';
          const readerUrl = `/article.html?id=${encodeURIComponent(art.id || art.url || '')}`;

          return `
          <div class="sub-featured-card" data-article-id="${escapeHTML(art.id || '')}">
            <div class="sub-featured-media">
              <a href="${escapeHTML(readerUrl)}">
                <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(art.title)}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
              </a>
            </div>
            <div class="sub-featured-body">
              <div class="article-meta" style="margin-bottom: 2px;">
                <span class="article-source" style="font-size: 0.75rem;">${escapeHTML(source)}</span>
                <span>&bull;</span>
                <span style="font-size: 0.72rem;">${escapeHTML(pubDate)}</span>
              </div>
              <h3 class="sub-featured-title">
                <a href="${escapeHTML(readerUrl)}">${escapeHTML(art.title)}</a>
              </h3>
            </div>
          </div>
        `;
        })
        .join('');
    },

    /**
     * Render Latest News Grid Cards
     */
    renderNewsGrid(articles, append = false) {
      const grid = document.getElementById('newsGrid') || document.getElementById('relatedNewsGrid');
      if (!grid) return;

      if (!articles || articles.length === 0) {
        if (!append) {
          grid.innerHTML = `
            <div class="state-message" style="grid-column: 1 / -1;">
              <div class="state-icon">&#128269;</div>
              <h3 class="state-title">No Articles Found</h3>
              <p class="state-desc">We could not find news matching your query. Try another keyword or explore our top categories.</p>
            </div>
          `;
        }
        return;
      }

      const cardsHTML = articles
        .map((art) => {
          const img = art.image || PLACEHOLDER_IMG;
          const pubDate = formatRelativeTime(art.publishedAt);
          const source = art.source?.name || 'Daily News Dispatch';
          const readerUrl = `/article.html?id=${encodeURIComponent(art.id || art.url || '')}`;

          return `
          <article class="news-card" data-article-id="${escapeHTML(art.id || '')}">
            <div class="news-card-media">
              <a href="${escapeHTML(readerUrl)}">
                <img src="${escapeHTML(img)}" alt="${escapeHTML(art.title)}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
              </a>
            </div>
            <div class="news-card-body">
              <div class="article-meta">
                <span class="article-source">${escapeHTML(source)}</span>
                <span>&bull;</span>
                <time datetime="${escapeHTML(art.publishedAt || '')}">${escapeHTML(pubDate)}</time>
              </div>
              <h3 class="news-card-title">
                <a href="${escapeHTML(readerUrl)}">${escapeHTML(art.title)}</a>
              </h3>
              <p class="news-card-desc">${escapeHTML(art.description || 'Click below to read the comprehensive news report directly on our website.')}</p>
              <div class="news-card-footer">
                <span>Verified Story</span>
                <a href="${escapeHTML(readerUrl)}" class="news-card-action">
                  Read Article &rarr;
                </a>
              </div>
            </div>
          </article>
        `;
        })
        .join('');

      if (append) {
        grid.insertAdjacentHTML('beforeend', cardsHTML);
      } else {
        grid.innerHTML = cardsHTML;
      }
    },

    /**
     * Render Trending / Most Read Headlines list
     */
    renderTrending(articles) {
      const list = document.getElementById('trendingList');
      if (!list) return;

      if (!articles || articles.length === 0) {
        list.innerHTML = '<li>No trending headlines recorded.</li>';
        return;
      }

      list.innerHTML = articles
        .slice(0, 5)
        .map((art, index) => {
          const source = art.source?.name || 'News Desk';
          const pubDate = formatRelativeTime(art.publishedAt);
          const readerUrl = `/article.html?id=${encodeURIComponent(art.id || art.url || '')}`;

          return `
          <li class="trending-item" data-article-id="${escapeHTML(art.id || '')}">
            <span class="trending-rank">${index + 1}</span>
            <div class="trending-body">
              <h4 class="trending-title">
                <a href="${escapeHTML(readerUrl)}">${escapeHTML(art.title)}</a>
              </h4>
              <div class="trending-source">${escapeHTML(source)} &bull; ${escapeHTML(pubDate)}</div>
            </div>
          </li>
        `;
        })
        .join('');
    },

    /**
     * Display Loading Skeletons in the Grid
     */
    showSkeletons(count = 6) {
      const grid = document.getElementById('newsGrid');
      if (!grid) return;

      let skeletons = '';
      for (let i = 0; i < count; i++) {
        skeletons += `
          <div class="skeleton-card">
            <div class="skeleton-box skeleton-media"></div>
            <div class="skeleton-box skeleton-line short"></div>
            <div class="skeleton-box skeleton-line full" style="height: 20px;"></div>
            <div class="skeleton-box skeleton-line medium" style="height: 20px;"></div>
            <div class="skeleton-box skeleton-line full"></div>
            <div class="skeleton-box skeleton-line medium"></div>
          </div>
        `;
      }
      grid.innerHTML = skeletons;
    },

    /**
     * Display User-Friendly Error Message with Retry
     */
    showError(message, retryCallback) {
      const grid = document.getElementById('newsGrid');
      if (!grid) return;

      grid.innerHTML = `
        <div class="state-message" style="grid-column: 1 / -1;">
          <div class="state-icon" style="color: #dc2626;">&#9888;</div>
          <h3 class="state-title">Unable to Load News Feed</h3>
          <p class="state-desc">${escapeHTML(message || 'A network error occurred while retrieving news articles. Please verify your connection or retry.')}</p>
          <button id="errorRetryBtn" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Try Again
          </button>
        </div>
      `;

      const retryBtn = document.getElementById('errorRetryBtn');
      if (retryBtn && typeof retryCallback === 'function') {
        retryBtn.addEventListener('click', retryCallback);
      }
    },

    /**
     * Update active category in navigation bar
     */
    setActiveNav(category) {
      const links = document.querySelectorAll('.nav-item');
      links.forEach((item) => {
        const link = item.querySelector('.nav-link');
        const cat = link?.getAttribute('data-category');
        if (cat === category.toLowerCase()) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      const sectionTitle = document.getElementById('currentSectionTitle');
      if (sectionTitle) {
        sectionTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} News`;
      }
    },

    /**
     * Update Last Fetched Timestamp & Provider Badge
     */
    updateLastFetched(timestamp, provider) {
      const timeElem = document.getElementById('lastUpdatedTime');
      if (timeElem) {
        const d = timestamp ? new Date(timestamp) : new Date();
        timeElem.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      const providerBadge = document.getElementById('activeProviderBadge');
      if (providerBadge && provider) {
        providerBadge.textContent = provider;
      }
    },

    /**
     * Cookie Consent Banner Logic
     */
    initCookieConsent() {
      const banner = document.getElementById('cookieConsentBanner');
      if (!banner) return;

      const consent = localStorage.getItem(STORAGE_KEY_CONSENT);
      if (!consent) {
        banner.classList.add('active');
      }

      const acceptBtn = document.getElementById('cookieAcceptBtn');
      const declineBtn = document.getElementById('cookieDeclineBtn');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          localStorage.setItem(STORAGE_KEY_CONSENT, 'accepted');
          banner.classList.remove('active');
        });
      }

      if (declineBtn) {
        declineBtn.addEventListener('click', () => {
          localStorage.setItem(STORAGE_KEY_CONSENT, 'declined');
          banner.classList.remove('active');
        });
      }
    },

    /**
     * Back-to-Top Button Handler
     */
    initBackToTop() {
      const btn = document.getElementById('backToTopBtn');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
  };
})();

// Export globally
window.UI = UI;
