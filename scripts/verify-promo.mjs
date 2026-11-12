import assert from "node:assert/strict";

const base = process.env.PROMO_BASE_URL || "http://127.0.0.1:3033";
const play =
  "https://play.google.com/store/apps/details?id=com.brahma.brahmaApp";
async function request(url, options = {}) {
  let failure;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(20000),
      });
    } catch (error) {
      failure = error;
    }
  }
  throw new Error(`Could not fetch ${url}`, { cause: failure });
}
let checks = 0;
const pages = [
  "/",
  "/features",
  "/download",
  "/about",
  "/support",
  "/privacy",
  "/terms",
  "/delete-account",
  "/moments",
  "/inside",
  ...[
    "journal",
    "meditation",
    "analytics",
    "small-wins",
    "anonymous-reflections",
    "focus",
    "library",
  ].map((slug) => `/features/${slug}`),
  ...[
    "exam-brain",
    "late-night-thoughts",
    "social-battery",
    "starting-again",
  ].map((slug) => `/moments/${slug}`),
];
const assets = new Set([
  "/images/a-quiet-evening.png",
  "/images/google-play-qr.svg",
  "/icon.svg",
  "/images/brain-tabs.gif",
  "/images/brain-tabs-poster.svg",
  "/images/brain-with-too-many-tabs.webp",
  "/images/late-night-brain.webp",
]);
const internal = new Set();
const htmlByPath = new Map();
const anchors = new Set();

for (const path of pages) {
  const response = await request(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 200, `${path} must be a public page`);
  const html = await response.text();
  htmlByPath.set(path, html);
  assert.match(html, /<h1[\s>]/, `${path} needs a page heading`);
  assert.match(html, /rel="canonical"/, `${path} needs a canonical URL`);
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `${path} needs exactly one main heading`,
  );
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.equal(
    new URL(canonical[1]).pathname,
    path,
    `${path} canonical must identify this page`,
  );
  assert.ok(
    !/<form[\s>]/i.test(html),
    `${path} must not mount an account/app form`,
  );
  assert.ok(
    !html.includes("localhost:3001"),
    `${path} must not publish development canonicals`,
  );
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.ok(
    response.headers.get("permissions-policy")?.includes("microphone=()"),
  );
  assert.equal(
    response.headers.get("set-cookie"),
    null,
    `${path} must not start an auth session`,
  );
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (href.startsWith("/")) {
      const target = new URL(href, base);
      assert.ok(
        !/^\/(login|signup|forgot-password|app)(\/|$)/.test(target.pathname),
        `${path} contains a retired app link`,
      );
      internal.add(target.pathname);
      if (target.hash) anchors.add(`${target.pathname}${target.hash}`);
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    const src = match[1].replaceAll("&amp;", "&");
    if (src.startsWith("/")) assets.add(src);
  }
  if (["/", "/features", "/download"].includes(path))
    assert.ok(html.includes(play), `${path} needs the official Play link`);
  checks++;
}

for (const href of anchors) {
  const target = new URL(href, base);
  const html = htmlByPath.get(target.pathname);
  assert.ok(
    html?.includes(`id="${target.hash.slice(1)}"`),
    `missing anchor ${href}`,
  );
  checks++;
}
for (const path of [
  "/features/not-a-feature",
  "/moments/not-a-moment",
  "/this-page-does-not-exist",
]) {
  const response = await request(new URL(path, base), { redirect: "manual" });
  assert.equal(
    response.status,
    404,
    `${path} must not pretend to be a valid page`,
  );
  await response.arrayBuffer();
  checks++;
}
for (const [path, destination] of Object.entries({
  "/features/affirmations": "/features",
  "/features/community": "/features",
  "/features/sanctuary": "/features/library",
  "/features/counselling": "/support",
  "/legal/privacy": "/privacy",
  "/legal/terms": "/terms",
})) {
  const response = await request(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308, path);
  assert.equal(
    new URL(response.headers.get("location"), base).pathname,
    destination,
    path,
  );
  await response.arrayBuffer();
  checks++;
}

for (const path of [
  "/login",
  "/signup",
  "/forgot-password",
  "/app",
  "/app/dashboard",
  "/app/journal",
  "/app/admin/accounts",
  "/profile",
  "/journal",
  "/meditation",
  "/games/leaderboard",
  "/counselling",
  "/login?next=https://example.net",
]) {
  const response = await request(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308, `${path} must be permanently retired`);
  const target = new URL(response.headers.get("location"), base);
  assert.equal(target.pathname, "/download");
  assert.equal(
    target.origin,
    new URL(base).origin,
    "retired login must not become an open redirect",
  );
  await response.arrayBuffer();
  checks++;
}
for (const path of [
  "/sanctuary/old-article",
  "/guides/old-guide",
  "/wisdom",
  "/compare",
]) {
  const response = await request(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(
    new URL(response.headers.get("location"), base).pathname,
    "/features",
  );
  await response.arrayBuffer();
  checks++;
}
for (const path of internal) {
  const response = await request(new URL(path, base));
  assert.equal(response.status, 200, `internal link ${path}`);
  await response.arrayBuffer();
  checks++;
}
for (const path of assets) {
  const response = await request(new URL(path, base));
  assert.equal(response.status, 200, `image ${path}`);
  assert.ok(
    response.headers.get("content-type")?.startsWith("image/"),
    `image content type ${path}`,
  );
  await response.arrayBuffer();
  checks++;
}
for (const path of [
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/og",
]) {
  const response = await request(new URL(path, base));
  assert.equal(response.status, 200, path);
  if (path === "/sitemap.xml") {
    const xml = await response.text();
    assert.ok(!/<loc>[^<]*\/(app|login|signup)(\/|<)/.test(xml));
  }
  if (path === "/manifest.webmanifest") {
    const manifest = await response.json();
    assert.equal(manifest.display, "browser");
    assert.equal(manifest.start_url, "/download");
  }
  if (path === "/robots.txt" || path === "/og") await response.arrayBuffer();
  if (path === "/og")
    assert.ok(response.headers.get("content-type")?.startsWith("image/"));
  checks++;
}
console.log(`Passed ${checks} promotional-site HTTP checks at ${base}`);
