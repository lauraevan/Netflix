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
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "desktop-home.png", fullPage: false });
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
  assert.equal(await mobile.locator("#profileCards .profile-choice").count(),7,"All seven uploaded profiles must be available");
  await mobile.screenshot({ path:"mobile-profiles.png", fullPage:false });
  await mobile.locator("#manageProfiles").click();
  await mobile.locator('[data-profile="one"]').click();
  assert(await mobile.locator(".native-profile-edit").isVisible(),"Native profile editor missing");
  await mobile.locator('[data-native-avatar="4"]').click();
  await mobile.locator("#nativeProfileName").fill("Evan");
  await mobile.locator("[data-native-save]").click();
  await mobile.locator('[data-profile="one"]').click();
  await mobile.locator('[data-native-avatar="0"]').click();
  await mobile.locator("[data-native-save]").click();
  await mobile.locator("#manageProfiles").click();
  await mobile.locator('[data-profile="one"]').click();
  assert(await mobile.locator("#mobileRoot .m-feature").isVisible(), "Mobile featured portrait card missing");
  const frame=await mobile.locator("#mobileRoot .m-feature").boundingBox();
  assert(frame && Math.abs(frame.x-31)<4 && Math.abs(frame.y-153)<8
    && Math.abs(frame.width-322)<5 && Math.abs(frame.height-470)<9,
    "Home artwork geometry drifted from reference: "+JSON.stringify(frame));
  const photo=mobile.locator(".m-feature .m-feature-img");
  assert(await photo.evaluate(img => img.complete && img.naturalWidth>0 &&
    img.currentSrc.includes("srikanth-reference.webp")),
    "Reference hero photo must load from the local repo asset");
  const navBox=await mobile.locator(".m-bottom").boundingBox();
  assert(navBox && Math.abs(navBox.y-746)<7,
    "Bottom tab bar has drifted from the reference: "+JSON.stringify(navBox));

  assert(await mobile.locator('.m-feature').getAttribute('aria-label') === 'Featured: Srikanth', "Reference featured title should be Srikanth");
  assert((await mobile.locator('img.m-netflix-n').count())===1, "Use the local Netflix N vector, not an italic text substitute");
  const posterLoaded = await mobile.locator('.m-feature-img').evaluate(img => img.complete && img.naturalWidth > 0).catch(()=>false);
  console.log("Reference portrait artwork loaded:",posterLoaded);
  await mobile.screenshot({ path: "mobile-reference.png", fullPage: false });

  await mobile.waitForTimeout(1200);
  await mobile.screenshot({ path: "mobile-home.png", fullPage: false });
  await mobile.locator('.m-feature [data-m-add]').click();
  await mobile.locator('[data-m-tab="my"]').click();
  assert(await mobile.locator(".m-myn-page").isVisible(), "My Netflix tab failed");
  assert(await mobile.locator(".m-myn-page .m-shelf").count() >= 1, "My List did not update");
  await mobile.screenshot({ path: "mobile-mynetflix.png", fullPage: false });
  await mobile.locator('[data-m-tab="games"]').click();
  assert(await mobile.locator(".m-game-page").isVisible(), "Games tab must be a real browsing screen");
  assert(await mobile.locator("[data-m-game]").count() >= 4, "Games catalog tiles missing");
  await mobile.locator('[data-m-game="hades"]').first().click();
  assert(await mobile.locator(".m-game-detail").isVisible(), "Game details should open");
  await mobile.locator('[data-m-action="gamesBack"]').first().click();
  assert(await mobile.locator(".m-game-page").isVisible(), "Game back navigation failed");
  await mobile.screenshot({ path:"mobile-games.png", fullPage:false });
  await mobile.locator('[data-m-tab="hot"]').click();
  assert(await mobile.locator(".m-pagehead, .m-headtitle").filter({ hasText:"New & Hot" }).count() >= 1, "New & Hot tab missing");
  await mobile.locator('[data-m-news="watching"]').click();
  assert(await mobile.locator(".m-release").count() >= 1, "New & Hot catalog missing");
  await mobile.waitForTimeout(1100);
  await mobile.screenshot({ path: "mobile-newhot.png", fullPage: false });
  await mobile.locator('[data-m-tab="home"]').click();
  await mobile.locator('[data-m-action="search"]').first().click();
  await mobile.locator("#mSearchInput").fill("Stranger");
  assert((await mobile.locator("#mSearchResults .m-poster").count()) >= 1, "Mobile search missing");
  await mobile.locator("#mSearchResults .m-poster").first().click();
  assert(await mobile.locator(".native-details").isVisible(), "Native mobile title details missing");
  assert(!await mobile.locator("#detailsModal").isVisible(),"Legacy desktop modal must never open on phones");
  await mobile.screenshot({ path:"mobile-details.png", fullPage:false });
  await mobile.locator("[data-native-play]").click();
  assert(await mobile.locator("#playerSetup").isVisible(), "Mobile EvanPlayer handoff missing");
  await mobile.locator("#playerBack").click();
  await mobile.screenshot({ path: "mobile-smoke.png", fullPage: false });

  console.log("Desktop and mobile navigation, profiles, search, lists and player handoff passed.");
} finally {
  await browser.close();
}
