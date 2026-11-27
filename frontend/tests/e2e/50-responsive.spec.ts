import { test, expect } from "@playwright/test";
import { WEB, db, oid, makeUser, loginUI, shot, finding } from "./support/helpers";

const overflowers = () => {
  const vw = document.documentElement.clientWidth;
  return [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && getComputedStyle(e).position !== "fixed"; })
    .slice(0, 8).map((e) => `${e.tagName.toLowerCase()}.${String((e as HTMLElement).className).split(" ").slice(0, 4).join(".")} right=${Math.round(e.getBoundingClientRect().right)} vw=${vw}`);
};

test("home page horizontal overflow source (375 + 1280)", async ({ page }, info) => {
  for (const w of [375, 1280]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(`${WEB}/`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    finding(info, { kind: "responsive", id: `home-overflow-${w}`, overflowPx: sw, elements: await page.evaluate(overflowers) });
  }
});

test("profile preview + sidebar card with long name on 375px", async ({ page }, info) => {
  const u = await makeUser("candidate", "longname");
  await (await db()).collection("users").updateOne({ _id: oid(u.id) }, { $set: { name: "Muhammad Abdullah Rehman Siddiqui Khan", headline: "Aspiring full-stack developer and data analyst with a passion for dashboards" } });
  await page.setViewportSize({ width: 375, height: 800 });
  await loginUI(page, u);
  for (const r of ["/candidate/profile", "/candidate/dashboard", "/candidate/billing", "/candidate/interview/basic", "/candidate/applications"]) {
    await page.goto(`${WEB}${r}`);
    await page.waitForTimeout(2500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const p = await shot(page, `mobile_longname${r.replace(/\//g, "_")}`);
    finding(info, { kind: "responsive", id: `longname${r}`, overflowPx: sw, elements: sw > 1 ? await page.evaluate(overflowers) : [], screenshot: p });
  }
});
