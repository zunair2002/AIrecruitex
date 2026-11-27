/**
 * Every page, every role, desktop (1280) + mobile (375): loads, no console errors,
 * no horizontal overflow, screenshot. Dumps visible text to .out/pages/ for review.
 */
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { WEB, makeUser, loginUI, watchConsole, shot, finding, type TestUser } from "./support/helpers";

const PUBLIC = ["/", "/about", "/pricing", "/contact", "/terms", "/privacy", "/login/candidate", "/login/recruiter", "/register", "/login", "/does-not-exist", "/account-deactivated"];
const CANDIDATE = ["/candidate/dashboard", "/candidate/profile", "/candidate/resume", "/candidate/jobs", "/candidate/applications",
  "/candidate/interview/basic", "/candidate/interview/advanced", "/candidate/interview/result", "/candidate/learning",
  "/candidate/billing", "/candidate/notifications", "/candidate/support", "/candidate/interview/org"];
const HR = ["/recruiter/dashboard", "/recruiter/jobs", "/recruiter/jobs/create", "/recruiter/applicants", "/recruiter/question-pool",
  "/recruiter/reports", "/recruiter/shortlisted", "/recruiter/courses", "/recruiter/notifications", "/recruiter/support"];
const ADMIN = ["/admin", "/admin/dashboard", "/admin/users", "/admin/activity-logs", "/admin/content", "/admin/reports",
  "/admin/notifications", "/admin/settings", "/admin/support", "/admin/monitoring"];

const OUT = path.join(__dirname, ".out", "pages");
fs.mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 800 }, { name: "mobile", width: 375, height: 740 }];

async function crawl(page: any, routes: string[], role: string, info: any) {
  const results: any[] = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const r of routes) {
      const errors = watchConsole(page);
      const resp = await page.goto(WEB + r, { waitUntil: "load" }).catch((e: Error) => ({ status: () => `ERR ${e.message}` }));
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const text = await page.evaluate(() => document.body.innerText);
      const file = `${role}_${vp.name}_${r.replace(/\//g, "_") || "home"}`;
      if (vp.name === "desktop") fs.writeFileSync(path.join(OUT, `${role}${r.replace(/\//g, "_") || "_home"}.txt`), `URL: ${page.url()}\n\n${text}`);
      const s = await shot(page, file);
      const row = { role, vp: vp.name, route: r, finalUrl: page.url().replace(WEB, ""), status: typeof resp?.status === "function" ? resp.status() : "?", overflowPx: overflow, errors: [...new Set(errors)], screenshot: s };
      results.push(row);
      page.removeAllListeners("console"); page.removeAllListeners("pageerror");
    }
  }
  fs.writeFileSync(path.join(__dirname, ".out", `crawl_${role}.json`), JSON.stringify(results, null, 2));
  for (const r of results) {
    if (r.errors.length) finding(info, { kind: "console", ...r });
    if (r.overflowPx > 2) finding(info, { kind: "overflow", ...r });
  }
  return results;
}

test("crawl public pages", async ({ page }, info) => { await crawl(page, PUBLIC, "public", info); });

test("crawl candidate pages", async ({ page }, info) => {
  const u = await makeUser("candidate", "crawlc");
  await loginUI(page, u);
  await crawl(page, CANDIDATE, "candidate", info);
});

test("crawl hr pages", async ({ page }, info) => {
  const u = await makeUser("hr", "crawlh");
  await loginUI(page, u);
  await crawl(page, HR, "hr", info);
});

test("crawl admin pages", async ({ page }, info) => {
  const u = await makeUser("admin", "crawla");
  await loginUI(page, u);
  await crawl(page, ADMIN, "admin", info);
});
