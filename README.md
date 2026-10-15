# Daily News - Modern Live News Portal (Google AdSense Ready)

A modern, responsive, high-performance news portal built using **HTML5, CSS3, and vanilla JavaScript**, powered by a lightweight Express proxy server that seamlessly integrates with **GNews API**, **NewsAPI**, and **Live Real-Time Global Feeds**.

Designed strictly to meet and exceed **Google AdSense site approval policies**, international digital journalism ethics, and GDPR/CCPA compliance standards.

---

## Key Features

- **HTML5, CSS3 & Vanilla JavaScript**: Zero frontend framework bloat. Fast loading, accessible semantic HTML5 elements (`<article>`, `<header>`, `<nav>`, `<aside>`, `<time>`, `<footer>`).
- **Real-Time Live News Integration**:
  - Out-of-the-box support for **GNews API** (100 free requests/day).
  - Out-of-the-box support for **NewsAPI.org**.
  - **Live Fallback Engine**: If no API key is entered or if quota limits are reached, the platform automatically switches to authentic live Google News RSS feeds (World, Pakistan, Business, Technology, Sports, Entertainment, Health, Science) so the website always displays real, fresh news without breaking.
- **Google AdSense Compliant Architecture**:
  - Standard IAB ad units: **Top Leaderboard (728x90 responsive)**, **In-Feed Native Banner**, and **Sidebar Medium Rectangle (300x250)** clearly labeled with required `"ADVERTISEMENT"` / `"SPONSORED"` headers.
  - Complete legal & policy pages required for AdSense approval:
    - **About Us** (`about.html`): Editorial mission, team masthead, independence.
    - **Contact Us** (`contact.html`): Working form, newsroom email, press desk.
    - **Privacy Policy** (`privacy.html`): Specific Google AdSense DoubleClick DART cookie notices, GDPR data rights, CCPA compliance, opt-out links.
    - **Terms of Use** (`terms.html`): Fair use, copyright, link disclaimers.
    - **Editorial & Fact-Checking Policy** (`editorial-policy.html`): Corrections procedure, source corroboration, DMCA notice.
  - Interactive GDPR / ePrivacy Cookie Consent banner with preference persistence.
- **Visual Design & Typography**:
  - Classic news aesthetic inspired by Reuters, BBC, and The New York Times.
  - Clean white background, deep navy `#0f172a`, and bold red `#dc2626` accents.
  - Dark mode & Light mode toggle with automatic system preference detection and `localStorage` persistence.
- **Breaking News Ticker**:
  - Real-time animated ticker bar featuring the latest breaking dispatches.
- **Categories Covered**:
  - Home, World, Pakistan, Business, Technology, Sports, Entertainment, Health, Science.
- **Search & Filtering**:
  - Instant keyword search with loading states, error handling, and debouncing.
- **Pagination & Load More**:
  - Seamless "Load More Stories" pagination without duplicate articles.
- **Safe Publisher Attribution**:
  - All articles link directly to the original publisher with `target="_blank" rel="noopener noreferrer"`.
  - Fallback placeholder image (`assets/images/placeholder.svg`) ensures zero broken image icons.

---

## Project Structure

```
daily-news/
├── index.html              # Main news portal homepage
├── about.html              # About Us & Editorial Masthead
├── contact.html            # Contact Us & Newsroom Desks
├── privacy.html            # AdSense & GDPR Privacy Policy
├── editorial-policy.html   # Editorial & Fact-Checking Policy
├── terms.html              # Terms of Service & User Agreement
├── css/
│   └── style.css           # Responsive styles, themes, AdSense slots
├── js/
│   ├── app.js              # Application controller & event listeners
│   ├── api.js              # News API proxy client & cache manager
│   └── ui.js               # UI rendering, dark mode, ticker, skeletons
├── assets/
│   └── images/
│       └── placeholder.svg # Fallback news card image
├── server.ts               # Express backend proxy protecting API keys
├── .env.example            # Environment variables template
├── .gitignore              # Ignores .env and build output
└── README.md               # Documentation & setup instructions
```

---

## 1. Quick Start / Running Locally

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)

### Installation
```bash
# Clone or open the repository
cd daily-news

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser. The website will immediately begin streaming real live news!

---

## 2. API Key Configuration & Security

The project uses a secure backend proxy (`server.ts`) so your secret API keys are **never** exposed to client-side browsers or public git repositories.

### Option A: Via `.env` (Recommended for Production)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your GNews or NewsAPI key:
   ```env
   # GNews.io API key (Optional)
   GNEWS_API_KEY="your_actual_gnews_key_here"

   # NewsAPI.org key (Optional)
   NEWS_API_KEY="your_actual_newsapi_key_here"
   ```
3. Restart the dev server (`npm run dev`).

### Option B: Via the In-App "API Settings" Modal
1. On the top utility bar, click **"API Settings"**.
2. Select your provider (**Automatic**, **GNews.io**, or **NewsAPI.org**).
3. Paste your API key and click **"Save & Reload Feed"**.
4. The key is securely forwarded to the proxy session.

---

## 3. How to Obtain a Free News API Key

### GNews API (Recommended)
1. Go to [https://gnews.io/](https://gnews.io/) and click **Get API Key**.
2. Sign up with your email.
3. Your API key will appear in the dashboard.
4. **Free Tier Limits**:
   - 100 requests per day.
   - Max 10 articles per request.
   - Articles up to 30 days old.
5. If your 100 request quota is depleted, Daily News will automatically fall back to live Google News RSS feeds, ensuring zero downtime!

### NewsAPI.org (Alternative)
1. Visit [https://newsapi.org/register](https://newsapi.org/register).
2. Create a free developer account.
3. Note: NewsAPI free keys are restricted to localhost and return up to 100 results per request.

---

## 4. Google AdSense Approval Guide

To apply and get approved for Google AdSense:
1. **Domain Ownership**: Deploy this site to your custom domain (e.g., `https://yourdailynews.com`).
2. **AdSense Application**: Sign up at [https://adsense.google.com/](https://adsense.google.com/) and add your site URL.
3. **Insert AdSense Script**: In `<head>` of `index.html`, add:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
4. **Replace Ad Placeholders**:
   Locate the `<div class="ad-box ...">` containers in `index.html` and replace the inner preview content with your AdSense `<ins class="adsbygoogle" ...></ins>` tags.
5. **Review Compliance Checklist**:
   - [x] Clear "Advertisement" labels above all ad units.
   - [x] Dedicated Privacy Policy disclosing Google DoubleClick cookies and opt-out links.
   - [x] Contact page with valid newsroom email and working form.
   - [x] About Us page with editorial masthead and journalistic standards.
   - [x] Editorial Policy with corrections protocol and fair use statement.
   - [x] Fast, responsive, mobile-first design with accessible navigation.

---

## 5. Deployment

To build a production bundle:
```bash
npm run build
```
The compiled static assets and pages will be placed in the `dist/` directory, ready to deploy to platforms like Cloud Run, Vercel, Netlify, or any Node.js hosting service.

---

## License

MIT License. Designed and developed for modern digital newsrooms.
