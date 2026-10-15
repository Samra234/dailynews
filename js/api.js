/**
 * Daily News - API Integration Module
 * Handles news retrieval from proxy backend, GNews, NewsAPI, and live RSS fallback.
 */

const NewsAPI = (function () {
  // Base endpoint for news proxy
  const API_BASE = '/api';

  // Local storage keys for user preferences
  const STORAGE_KEY_PROVIDER = 'dailynews_provider';
  const STORAGE_KEY_GNEWS = 'dailynews_gnews_key';
  const STORAGE_KEY_NEWSAPI = 'dailynews_newsapi_key';

  // In-memory cache for fast tab switching and rate limit friendliness
  const cache = new Map();
  const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache

  function getCacheKey(category, query, page) {
    return `${category || 'all'}_${query || ''}_${page || 1}`;
  }

  return {
    /**
     * Get active provider configuration from localStorage
     */
    getConfig() {
      return {
        provider: localStorage.getItem(STORAGE_KEY_PROVIDER) || 'auto',
        gnewsKey: localStorage.getItem(STORAGE_KEY_GNEWS) || '',
        newsapiKey: localStorage.getItem(STORAGE_KEY_NEWSAPI) || '',
      };
    },

    /**
     * Save custom provider configuration
     */
    async saveConfig(provider, gnewsKey, newsapiKey) {
      if (provider) localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
      if (gnewsKey !== undefined) localStorage.setItem(STORAGE_KEY_GNEWS, gnewsKey);
      if (newsapiKey !== undefined) localStorage.setItem(STORAGE_KEY_NEWSAPI, newsapiKey);

      // Invalidate cache on config change
      cache.clear();

      // Optionally notify backend
      try {
        if (gnewsKey) {
          await fetch(`${API_BASE}/config-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'gnews', key: gnewsKey }),
          });
        }
        if (newsapiKey) {
          await fetch(`${API_BASE}/config-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'newsapi', key: newsapiKey }),
          });
        }
      } catch (err) {
        console.warn('Could not sync key to server session:', err);
      }
    },

    /**
     * Fetch news articles by category or search query
     */
    async fetchNews({ category = 'home', query = '', page = 1, pageSize = 12, forceRefresh = false } = {}) {
      const cacheKey = getCacheKey(category, query, page);

      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return cached.data;
        }
      }

      const config = this.getConfig();
      const params = new URLSearchParams();

      if (category) params.append('category', category.toLowerCase());
      if (query && query.trim()) params.append('q', query.trim());
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));

      if (config.provider !== 'auto') {
        params.append('provider', config.provider);
      }

      if (config.provider === 'gnews' && config.gnewsKey) {
        params.append('apiKey', config.gnewsKey);
      } else if (config.provider === 'newsapi' && config.newsapiKey) {
        params.append('apiKey', config.newsapiKey);
      }

      try {
        const response = await fetch(`${API_BASE}/news?${params.toString()}`);
        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          throw new Error(errorJson.message || `News request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Store into cache
        cache.set(cacheKey, {
          timestamp: Date.now(),
          data: data,
        });

        return data;
      } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
      }
    },

    /**
     * Fetch breaking headlines for ticker
     */
    async fetchBreaking() {
      try {
        const response = await fetch(`${API_BASE}/breaking`);
        if (!response.ok) throw new Error('Failed to fetch breaking news');
        return await response.json();
      } catch (err) {
        console.warn('Breaking news ticker fallback:', err);
        return {
          success: true,
          items: [
            {
              title: 'Global markets adjust amid central bank quarterly inflation reviews',
              source: 'Daily News Wire',
              url: '#',
            },
            {
              title: 'International climate technology summit announces renewable grid benchmarks',
              source: 'World Tech Dispatch',
              url: '#',
            },
            {
              title: 'Pakistan cricket championship updates: National series schedule confirmed',
              source: 'Sports Desk',
              url: '#',
            },
          ],
        };
      }
    },

    /**
     * Check backend status & API key configuration
     */
    async getStatus() {
      try {
        const res = await fetch(`${API_BASE}/status`);
        if (!res.ok) throw new Error('Status offline');
        return await res.json();
      } catch (err) {
        return {
          status: 'offline',
          activeProvider: 'Live RSS Fallback',
        };
      }
    },

    /**
     * Clear client-side cache
     */
    clearCache() {
      cache.clear();
    },
  };
})();

// Export globally for vanilla JS modules
window.NewsAPI = NewsAPI;
