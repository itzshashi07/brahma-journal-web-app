import assert from "node:assert/strict";

const base = process.env.PROMO_BASE_URL || "http://127.0.0.1:3033";
const play =
  "https://play.google.com/store/apps/details?id=com.brahma.brahmaApp";
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
];
const assets = new Set([
  "/images/a-quiet-evening.png",
  "/images/google-play-qr.svg",
  "/icon.svg",
]);
const internal = new Set();

for (const path of pages) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 200, `${path} must be a public page`);
  const html = await response.text();
  assert.match(html, /<h1[\s>]/, `${path} needs a page heading`);
  assert.match(html, /rel="canonical"/, `${path} needs a canonical URL`);
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
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308, `${path} must be permanently retired`);
  const target = new URL(response.headers.get("location"), base);
  assert.equal(target.pathname, "/download");
  assert.equal(
    target.origin,
    new URL(base).origin,
    "retired login must not become an open redirect",
  );
  checks++;
}
for (const path of [
  "/features/journal",
  "/sanctuary/old-article",
  "/guides/old-guide",
  "/wisdom",
  "/compare",
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(
    new URL(response.headers.get("location"), base).pathname,
    "/features",
  );
  checks++;
}
for (const path of internal) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `internal link ${path}`);
  checks++;
}
for (const path of assets) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `image ${path}`);
  assert.ok(
    response.headers.get("content-type")?.startsWith("image/"),
    `image content type ${path}`,
  );
  checks++;
}
for (const path of [
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/og",
]) {
  const response = await fetch(new URL(path, base));
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
  if (path === "/og")
    assert.ok(response.headers.get("content-type")?.startsWith("image/"));
  checks++;
}
console.log(`Passed ${checks} promotional-site HTTP checks at ${base}`);
