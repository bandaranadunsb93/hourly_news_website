const state = {
  articles: [],
  category: "all",
  search: "",
  sort: "newest"
};

const els = {
  grid: document.getElementById("newsGrid"),
  template: document.getElementById("articleTemplate"),
  loading: document.getElementById("loadingState"),
  empty: document.getElementById("emptyState"),
  tabs: document.getElementById("categoryTabs"),
  search: document.getElementById("searchInput"),
  sort: document.getElementById("sortSelect"),
  lastUpdated: document.getElementById("lastUpdated"),
  storyCount: document.getElementById("storyCount"),
  refresh: document.getElementById("refreshButton"),
  menuToggle: document.getElementById("menuToggle"),
  navLinks: document.getElementById("navLinks")
};

function formatDate(dateString) {
  if (!dateString) return "Unknown time";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function cleanText(text = "", max = 170) {
  const cleaned = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/\s+\S*$/, "") + "...";
}

function normalizeCategory(category) {
  return String(category || "general").toLowerCase();
}

async function loadNews() {
  els.loading.classList.remove("hidden");
  els.empty.classList.add("hidden");
  els.grid.innerHTML = "";

  try {
    const response = await fetch(`data/news.json?cache=${Date.now()}`);
    if (!response.ok) throw new Error("Could not load news.json");

    const data = await response.json();
    state.articles = Array.isArray(data.articles) ? data.articles : [];

    const updated = data.updatedAt ? new Date(data.updatedAt) : null;
    els.lastUpdated.textContent = updated && !Number.isNaN(updated.getTime())
      ? updated.toLocaleString()
      : "Not available";

    els.storyCount.textContent = `${state.articles.length} headlines available`;
    renderNews();
  } catch (error) {
    console.error(error);
    els.loading.textContent = "Could not load the news feed. Please check data/news.json.";
    els.storyCount.textContent = "Feed unavailable";
  }
}

function getFilteredArticles() {
  let articles = [...state.articles];

  if (state.category !== "all") {
    articles = articles.filter(article => normalizeCategory(article.category) === state.category);
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    articles = articles.filter(article => {
      return [
        article.title,
        article.summary,
        article.source,
        article.category
      ].join(" ").toLowerCase().includes(q);
    });
  }

  if (state.sort === "source") {
    articles.sort((a, b) => String(a.source).localeCompare(String(b.source)));
  } else {
    articles.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  }

  return articles;
}

function renderNews() {
  els.loading.classList.add("hidden");
  els.grid.innerHTML = "";

  const articles = getFilteredArticles();

  if (!articles.length) {
    els.empty.classList.remove("hidden");
    return;
  }

  els.empty.classList.add("hidden");

  for (const article of articles) {
    const node = els.template.content.cloneNode(true);
    node.querySelector(".category-pill").textContent = normalizeCategory(article.category).replace("-", " ");
    node.querySelector(".time").textContent = formatDate(article.publishedAt);
    node.querySelector("h3").textContent = article.title || "Untitled headline";
    node.querySelector("p").textContent = cleanText(article.summary || "No summary available.");
    node.querySelector(".source").textContent = article.source || "Unknown source";
    const link = node.querySelector("a");
    link.href = article.url || "#";
    link.setAttribute("aria-label", `Read full story: ${article.title}`);
    els.grid.appendChild(node);
  }
}

els.tabs.addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;

  state.category = button.dataset.category;
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  button.classList.add("active");
  renderNews();
});

els.search.addEventListener("input", event => {
  state.search = event.target.value.trim();
  renderNews();
});

els.sort.addEventListener("change", event => {
  state.sort = event.target.value;
  renderNews();
});

els.refresh.addEventListener("click", loadNews);

els.menuToggle.addEventListener("click", () => {
  els.navLinks.classList.toggle("open");
});

loadNews();
