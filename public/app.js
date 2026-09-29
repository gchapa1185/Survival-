const $ = (id) => document.getElementById(id);
const TOKEN_KEY = "episodic.token";
const BRIEF_KEY = "episodic.brief";

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

let config = { billing: false, price: "$9/month" };
let lastSeason = null;

async function api(path, options = {}) {
  const token = store.get(TOKEN_KEY);
  const res = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Request failed");
  return body;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node[k] = v;
  node.append(...children.filter((c) => c != null));
  return node;
}

function renderEpisode(ep) {
  const full = `${ep.caption}\n\n${ep.hashtags.join(" ")}`;
  const copy = el("button", { className: "copy", type: "button", textContent: "Copy caption" });
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(full); copy.textContent = "Copied"; } catch { copy.textContent = "Select and copy manually"; }
  };
  return el("li", { className: "ep" },
    el("div", { className: "ep-top" }, el("span", { textContent: `Episode ${ep.n} · ${ep.series}` }), el("span", { textContent: `🔎 ${ep.searchKeyword}` })),
    el("h3", { textContent: ep.title }),
    el("p", { className: "hook", textContent: `Hook: “${ep.hook}”` }),
    el("ul", {}, ...ep.shots.map((s) => el("li", { textContent: s }))),
    el("p", { className: "caption", textContent: full }),
    el("p", { className: "muted small", textContent: `CTA: ${ep.cta}` }),
    copy,
  );
}

function render(season) {
  lastSeason = season;
  $("show-title").textContent = season.showTitle;
  $("premise").textContent = season.premise;
  $("cadence").textContent = season.cadence;
  $("keywords").replaceChildren(...season.keywords.map((k) => el("li", { textContent: k })));
  $("episodes").replaceChildren(...season.episodes.map(renderEpisode));
  $("paywall").hidden = !season.locked;
  $("locked-count").textContent = season.locked;
  $("price").textContent = config.price;
  $("upgrade").disabled = !config.billing;
  $("export").hidden = !season.paid;
  $("result").hidden = false;
}

function toCsv(season) {
  const cols = ["n", "series", "title", "hook", "shots", "caption", "hashtags", "searchKeyword", "cta"];
  const cell = (v) => `"${String(Array.isArray(v) ? v.join(" | ") : v).replace(/"/g, '""')}"`;
  return [cols.join(","), ...season.episodes.map((e) => cols.map((c) => cell(e[c])).join(","))].join("\n");
}

$("brief").addEventListener("submit", async (e) => {
  e.preventDefault();
  const brief = Object.fromEntries(new FormData(e.target));
  store.set(BRIEF_KEY, JSON.stringify(brief));
  $("go").disabled = true;
  $("go").textContent = "Planning your season…";
  $("error").hidden = true;
  try {
    render(await api("/api/season", { method: "POST", body: JSON.stringify(brief) }));
    $("result").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    $("error").textContent = err.message;
    $("error").hidden = false;
  } finally {
    $("go").disabled = false;
    $("go").textContent = "Plan my season";
  }
});

$("upgrade").addEventListener("click", async () => {
  try {
    const { url } = await api("/api/checkout", { method: "POST" });
    location.href = url;
  } catch (err) {
    alert(err.message);
  }
});

$("export").addEventListener("click", () => {
  if (!lastSeason) return;
  const blob = new Blob([toCsv(lastSeason)], { type: "text/csv" });
  const a = el("a", { href: URL.createObjectURL(blob), download: "episodic-season.csv" });
  a.click();
  URL.revokeObjectURL(a.href);
});

async function init() {
  try { config = await (await fetch("/api/config")).json(); } catch {}
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  if (sessionId) {
    try {
      const { token } = await api(`/api/activate?session_id=${encodeURIComponent(sessionId)}`);
      store.set(TOKEN_KEY, token);
    } catch (err) {
      $("error").textContent = err.message;
      $("error").hidden = false;
    }
    history.replaceState(null, "", "/");
  }
  const saved = store.get(BRIEF_KEY);
  if (saved) {
    try {
      const brief = JSON.parse(saved);
      for (const [k, v] of Object.entries(brief)) if ($("brief").elements[k]) $("brief").elements[k].value = v;
      if (sessionId) $("brief").requestSubmit();
    } catch {}
  }
}
init();
