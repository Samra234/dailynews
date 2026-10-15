/**
 * Daily News - Main Application Controller
 * Coordinates API fetching, user events, category switching, search, and UI state.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    category: 'home',
    query: '',
    page: 1,
    pageSize: 12,
    isLoading: false,
    hasMore: true,
  };

  // Cache of articles displayed on the current page for instant reading
  const loadedArticlesMap = new Map();

  // DOM Elements
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const navList = document.getElementById('navList');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const refreshBtn = document.getElementById('navRefreshBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const settingsBtn = document.getElementById('settingsModalBtn');
  const configModal = document.getElementById('configModal');
  const configModalClose = document.getElementById('configModalClose');
  const configForm = document.getElementById('configForm');

  // Initialize UI Features
  UI.initTheme();
  UI.initCookieConsent();
  UI.initBackToTop();

  // Load Breaking News Ticker
  async function loadBreakingNews() {
    try {
      const data = await NewsAPI.fetchBreaking();
      if (data && data.items) {
        UI.renderBreakingTicker(data.items);
      }
    } catch (err) {
      console.warn('Breaking news failed to load:', err);
    }
  }

  // Load News Articles
  async function loadArticles({ append = false, forceRefresh = false } = {}) {
    if (state.isLoading) return;
    state.isLoading = true;

    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = `
        <svg class="rotating" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Loading Stories...
      `;
    }

    if (!append) {
      UI.showSkeletons(6);
    }

    try {
      const result = await NewsAPI.fetchNews({
        category: state.category,
        query: state.query,
        page: state.page,
        pageSize: state.pageSize,
        forceRefresh,
      });

      const articles = result.articles || [];

      // Store in memory for instant on-site opening
      for (const a of articles) {
        loadedArticlesMap.set(a.id, { ...a, category: state.category });
      }

      // Update Header info
      UI.updateLastFetched(result.fetchedAt, result.provider);

      if (state.page === 1 && !state.query) {
        // On first page of home/category, show featured hero story and secondary sidebar
        const featuredSection = document.getElementById('featuredSection');
        if (featuredSection) {
          if (articles.length > 0) {
            featuredSection.style.display = 'block';
            UI.renderFeaturedStory(articles[0], state.category);
            UI.renderSecondaryFeatured(articles.slice(1, 4));
            // Rest goes to news grid
            UI.renderNewsGrid(articles.slice(4), false);
          } else {
            featuredSection.style.display = 'none';
            UI.renderNewsGrid([], false);
          }
        }
        UI.renderTrending(articles);
      } else {
        // For search results or subsequent pages, hide hero and show in grid
        const featuredSection = document.getElementById('featuredSection');
        if (featuredSection && state.query) {
          featuredSection.style.display = 'none';
        }
        UI.renderNewsGrid(articles, append);
      }

      // Check pagination boundary
      state.hasMore = result.hasMore !== undefined ? result.hasMore : articles.length >= state.pageSize;

      if (loadMoreBtn) {
        if (state.hasMore) {
          loadMoreBtn.style.display = 'inline-flex';
          loadMoreBtn.disabled = false;
          loadMoreBtn.innerHTML = `
            <span>Load More Stories</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          `;
        } else {
          loadMoreBtn.style.display = 'none';
        }
      }

      const paginationInfo = document.getElementById('paginationInfo');
      if (paginationInfo) {
        paginationInfo.textContent = state.hasMore
          ? `Page ${state.page} loaded`
          : 'All current news reports retrieved.';
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
      UI.showError(err.message, () => loadArticles({ append: false, forceRefresh: true }));
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } finally {
      state.isLoading = false;
      if (refreshBtn) refreshBtn.classList.remove('rotating');
    }
  }

  // Event: Category Navigation Click
  if (navList) {
    navList.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (!link) return;

      const category = link.getAttribute('data-category');
      if (!category) return;

      e.preventDefault();
      state.category = category;
      state.query = '';
      state.page = 1;
      if (searchInput) searchInput.value = '';

      UI.setActiveNav(category);

      // Close mobile menu if open
      navList.classList.remove('mobile-open');

      loadArticles({ append: false, forceRefresh: false });
    });
  }

  // Event: Search Form Submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput?.value.trim();
      if (!val) {
        // Reset to home if empty search
        state.category = 'home';
        state.query = '';
        state.page = 1;
        UI.setActiveNav('home');
        loadArticles({ append: false });
        return;
      }

      state.query = val;
      state.page = 1;

      const titleElem = document.getElementById('currentSectionTitle');
      if (titleElem) {
        titleElem.textContent = `Search: "${val}"`;
      }

      loadArticles({ append: false, forceRefresh: true });
    });
  }

  // Event: Load More Button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (state.isLoading || !state.hasMore) return;
      state.page += 1;
      loadArticles({ append: true });
    });
  }

  // Event: Refresh News Button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('rotating');
      NewsAPI.clearCache();
      loadBreakingNews();
      loadArticles({ append: false, forceRefresh: true });
    });
  }

  // Event: Theme Toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      UI.toggleTheme();
    });
  }

  // Event: Mobile Hamburger
  if (hamburgerBtn && navList) {
    hamburgerBtn.addEventListener('click', () => {
      navList.classList.toggle('mobile-open');
    });
  }

  // Event: API Configuration Modal
  if (settingsBtn && configModal) {
    settingsBtn.addEventListener('click', async () => {
      configModal.classList.add('active');
      const config = NewsAPI.getConfig();
      const status = await NewsAPI.getStatus();

      const providerSelect = document.getElementById('providerSelect');
      const gnewsInput = document.getElementById('gnewsKeyInput');
      const newsapiInput = document.getElementById('newsapiKeyInput');
      const statusText = document.getElementById('apiStatusDetails');

      if (providerSelect) providerSelect.value = config.provider || 'auto';
      if (gnewsInput) gnewsInput.value = config.gnewsKey || '';
      if (newsapiInput) newsapiInput.value = config.newsapiKey || '';
      if (statusText) {
        statusText.innerHTML = `
          <strong>Active Engine:</strong> ${status.activeProvider} <br>
          <strong>Rate Quota:</strong> ${status.rateLimitNote} <br>
          <strong>Server Time:</strong> ${new Date(status.timestamp).toLocaleTimeString()}
        `;
      }
    });
  }

  if (configModalClose && configModal) {
    configModalClose.addEventListener('click', () => {
      configModal.classList.remove('active');
    });

    configModal.addEventListener('click', (e) => {
      if (e.target === configModal) {
        configModal.classList.remove('active');
      }
    });
  }

  if (configForm) {
    configForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const provider = document.getElementById('providerSelect')?.value;
      const gnewsKey = document.getElementById('gnewsKeyInput')?.value.trim();
      const newsapiKey = document.getElementById('newsapiKeyInput')?.value.trim();

      await NewsAPI.saveConfig(provider, gnewsKey, newsapiKey);
      configModal.classList.remove('active');

      // Refresh news with new provider settings
      state.page = 1;
      loadArticles({ append: false, forceRefresh: true });
    });
  }

  // Handle clicking articles to store in session and navigate cleanly on-site
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="article.html"]');
    if (!link) return;

    try {
      const url = new URL(link.href, window.location.origin);
      const articleId = url.searchParams.get('id');
      if (articleId && loadedArticlesMap.has(articleId)) {
        sessionStorage.setItem('currentArticle', JSON.stringify(loadedArticlesMap.get(articleId)));
      }
    } catch (err) {
      console.warn('Could not cache article into sessionStorage:', err);
    }
  });

  // Initial Boot
  loadBreakingNews();
  loadArticles();
});
