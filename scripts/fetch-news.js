import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "DailyNewsHubBot/1.0 (+https://example.com)"
  }
});

const ROOT = process.cwd();
const FEEDS_PATH = path.join(ROOT, "feeds.json");
const OUTPUT_PATH = path.join(ROOT, "data", "news.json");

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function makeId(article) {
  return Buffer.from(`${article.source}|${article.title}|${article.url}`).toString("base64url");
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

async function fetchFeed(feed) {
  try {
    if (!feed.url || !isValidUrl(feed.url)) {
      throw new Error("Invalid feed URL");
    }

    const result = await parser.parseURL(feed.url);

    return (result.items || []).slice(0, 15).map(item => {
      const title = stripHtml(item.title || "Untitled");
      const url = item.link || item.guid || "";
      const summary = stripHtml(item.contentSnippet || item.content || item.summary || item.description || "");
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();

      const article = {
        id: "",
        title,
        summary,
        url,
        source: feed.name,
        category: feed.category || "general",
        publishedAt
      };

      article.id = makeId(article);
      return article;
    }).filter(article => article.title && article.url && isValidUrl(article.url));
  } catch (error) {
    console.warn(`Failed to fetch ${feed.name}: ${error.message}`);
    return [];
  }
}

async function main() {
  const feedsRaw = await fs.readFile(FEEDS_PATH, "utf8");
  const feeds = JSON.parse(feedsRaw);

  const results = await Promise.all(feeds.map(fetchFeed));
  const allArticles = results.flat();

  const unique = new Map();
  for (const article of allArticles) {
    if (!unique.has(article.url)) {
      unique.set(article.url, article);
    }
  }

  const articles = [...unique.values()]
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 120);

  const output = {
    updatedAt: new Date().toISOString(),
    total: articles.length,
    articles
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log(`Saved ${articles.length} articles to data/news.json`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
