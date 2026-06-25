# Daily News Hub - Hourly Updating News Website

This is a complete starter website for an automatically updating news aggregator.

## What it does

- Displays latest headlines in a modern mobile-friendly layout
- Updates news from RSS feeds
- Supports categories: Sri Lanka, World, Business, Sports, Technology, Entertainment
- Has search and sorting
- Includes About, Contact, Privacy Policy, and Disclaimer pages
- Includes a GitHub Actions workflow to update `data/news.json` every hour

## Important legal note

This website is designed as a news aggregator. It shows headlines, short summaries, source names, dates, and links to the original articles. Do not copy and publish full articles from other publishers without permission.

## How to test locally

1. Install Node.js.
2. Open this folder in VS Code or terminal.
3. Run:

```bash
npm install
npm run update-news
npm start
```

4. Open:

```text
http://localhost:8080
```

## How to publish free with GitHub Pages

1. Create a new GitHub repository.
2. Upload all these files.
3. Go to Settings → Pages.
4. Under "Build and deployment", choose:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root
5. Save.
6. Go to Actions and enable workflows if GitHub asks.
7. The news feed will update every hour.

## How to change news sources

Edit `feeds.json`.

Example:

```json
{
  "name": "Source Name",
  "category": "world",
  "url": "https://example.com/feed/"
}
```

Supported categories:

- sri-lanka
- world
- business
- sports
- technology
- entertainment

## Before applying for AdSense

Add original content, for example:

- Daily simple news brief
- Weekly Sri Lanka business summary
- Technology news explained
- Visa and migration news summaries
- Original articles written by you

A pure RSS feed site may be considered too thin for monetization.
