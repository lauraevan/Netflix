import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // The product must still work with the discovery API unavailable.
  await page.route("https://api.themoviedb.org/**", route => route.abort());
  await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
  assert(await page.locator("#profilesScreen").isVisible(), "Expected real profile chooser on first visit");
  await page.locator('[data-profile="one"]').click();
  assert(await page.locator("#hero").isVisible(), "Homepage hero missing");
  assert((await page.locator(".rail").count()) >= 6, "Catalog rows missing");
  await page.locator("#heroInfo").click();
  assert(await page.locator("#detailsModal").isVisible(), "Details overlay missing");
  await page.locator("#modalList").click();
  await page.locator("#modalClose").click();
  await page.locator('.nav [data-nav="list"]').click();
  assert((await page.locator(".browse-grid .tile").count()) >= 1, "My List did not persist selected title");
  await page.locator("#searchToggle").click();
  await page.locator("#searchInput").fill("Stranger");
  assert((await page.locator(".browse-grid .tile").count()) >= 1, "Search results missing");
  await page.locator(".browse-grid .tile").first().click();
  await page.locator("#modalPlay").click();
  assert(await page.locator("#playerSetup").isVisible(), "Missing real EvanPlayer connection flow");
  await page.locator("#playerBack").click();
  await page.screenshot({ path: "desktop-smoke.png", fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.route("https://api.themoviedb.org/**", route => route.abort());
  await mobile.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded" });
  await mobile.locator('[data-profile="one"]').click();
  assert(await mobile.locator("#hero").isVisible(), "Mobile hero missing");
  await mobile.locator("#mobileBrowse").click();
  assert(await mobile.locator("#mobileMenu").isVisible(), "Mobile browse menu missing");
  await mobile.locator('#mobileMenu [data-nav="movie"]').click();
  assert((await mobile.locator(".browse-grid .tile").count()) >= 1, "Mobile movie browse is empty");
  await mobile.screenshot({ path: "mobile-smoke.png", fullPage: false });
  console.log("Desktop and mobile navigation, profiles, search, lists and player handoff passed.");
} finally {
  await browser.close();
}
