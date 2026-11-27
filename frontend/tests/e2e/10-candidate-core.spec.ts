import { test, expect } from "@playwright/test";
import path from "node:path";
import { WEB, waitHydrated, api, db, oid, makeUser, loginUI, waitForMail, otpFrom, watchConsole, shot, finding } from "./support/helpers";

const FIX = path.join(__dirname, "fixtures");



test("candidate signup -> OTP -> lands on profile gate -> save -> dashboard", async ({ page }, info) => {
  const errors = watchConsole(page);
  const email = `e2e-signup-${Date.now()}@example.com`;
  await page.goto(`${WEB}/login/candidate`);
  await waitHydrated(page); await page.waitForTimeout(1500);
  await page.getByRole("tab", { name: "Create account" }).or(page.getByRole("button", { name: "Create account" })).first().click();
  await page.getByLabel(/full name|name/i).first().fill("Signup Candidate");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/^password/i).first().fill("Passw0rd!e2e");
  await page.locator("form button[type=submit]").first().click();
  await expect(page.getByLabel(/code|otp/i).first()).toBeVisible();
  await shot(page, "cand_otp_screen");
  const mail = await waitForMail(email, /verification code/i);
  // wrong OTP first
  await page.getByLabel(/code|otp/i).first().fill("000000");
  await page.locator("form button[type=submit]").first().click();
  await expect(page.getByRole("alert").or(page.getByText(/invalid|incorrect|wrong/i)).first()).toBeVisible();
  await page.getByLabel(/code|otp/i).first().fill(otpFrom(mail.html)!);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL(/\/candidate\/profile/, { timeout: 30000 });
  await shot(page, "cand_profile_gate");

  // gate: other candidate pages redirect back to profile
  await page.goto(`${WEB}/candidate/jobs`);
  await page.waitForURL(/\/candidate\/profile/, { timeout: 15000 });
  // sidebar state while profile is incomplete
  const nav = page.getByRole("navigation").first();
  const navText = await nav.innerText().catch(() => "");
  const lockedHint = /lock|complete your profile/i.test(navText) || (await page.locator("nav [aria-disabled=true]").count()) > 0;
  if (!lockedHint) finding(info, { kind: "observation", id: "profile-gate-sidebar", detail: "Sidebar links are not visibly locked while profile incomplete; gate is redirect-only", screenshot: await shot(page, "cand_profile_gate_sidebar") });

  await page.locator("#profile-headline").fill("Aspiring data analyst");
  await page.locator("#profile-about").fill("Fresh graduate who loves SQL and dashboards.");
  const interests = page.locator("#profile-interests");
  await interests.fill("sql");
  await interests.press("Enter");
  await page.waitForTimeout(1500);
  if (/\/candidate\/profile/.test(page.url())) {
    await page.getByRole("button", { name: /save profile/i }).click();
  } else {
    finding(info, { kind: "observation", id: "interests-enter-submits", detail: "Pressing Enter in the Interests field submits the whole profile form and navigates to the dashboard" });
  }
  await page.waitForURL(/\/candidate\/dashboard/, { timeout: 20000 });
  await shot(page, "cand_dashboard_after_profile");
  expect(errors.filter((e) => !/status of 40[01]/.test(e)), errors.join(" | ")).toEqual([]);
});

test("login with wrong password shows error; correct password works; logout", async ({ page }) => {
  const u = await makeUser("candidate", "login");
  await page.goto(`${WEB}/login/candidate`);
  await waitHydrated(page); await page.waitForTimeout(1500);
  await page.getByLabel(/email/i).first().fill(u.email);
  await page.getByLabel(/^password/i).first().fill("wrong-pass");
  await page.locator("form button[type=submit]").first().click();
  await expect(page.getByRole("alert").or(page.getByText(/invalid|incorrect/i)).first()).toBeVisible();
  await loginUI(page, u);
  await expect(page).toHaveURL(/\/candidate\/dashboard/);
  // logout
  await page.getByRole("button", { name: new RegExp(u.name, "i") }).first().click();
  await page.getByRole("menuitem", { name: /log out/i }).click();
  await page.waitForURL((url) => /login|^\/$/.test(url.pathname) || url.pathname === "/", { timeout: 15000 });
  await page.goto(`${WEB}/candidate/dashboard`);
  await page.waitForURL(/login/, { timeout: 15000 });
});

test("resume: reject bad type, reject >5MB, upload pdf, delete", async ({ page }, info) => {
  const u = await makeUser("candidate", "resume");
  await loginUI(page, u);
  await page.goto(`${WEB}/candidate/resume`);
  const input = page.locator("input[type=file]").first();
  await input.setInputFiles(path.join(FIX, "bad.txt"));
  await expect(page.getByText(/pdf|docx/i).filter({ hasText: /only|must|accept|support/i }).first()).toBeVisible();
  await shot(page, "cand_resume_badtype");
  await input.setInputFiles(path.join(FIX, "big.pdf"));
  await expect(page.getByText(/5 ?MB|too large|smaller/i).first()).toBeVisible();
  await input.setInputFiles(path.join(FIX, "resume.pdf"));
  await page.getByRole("button", { name: /^(upload|replace) resume$/i }).click();
  await expect(page.getByText(/resume\.pdf/i).first()).toBeVisible({ timeout: 30000 });
  await shot(page, "cand_resume_uploaded");
  const mine = await api("GET", "/api/resume/mine", { token: u.token });
  expect(mine.data?.status).toBe("parsed");
  await page.getByRole("button", { name: /delete/i }).first().click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("button", { name: /delete|remove|yes/i }).last().click();
  await expect(page.getByText(/upload your resume/i).first()).toBeVisible({ timeout: 15000 });
  const after = await api("GET", "/api/resume/mine", { token: u.token });
  expect(after.data).toBeNull();
});

test("job board -> apply -> my applications (+ notifications)", async ({ page }) => {
  const hr = await makeUser("hr", "jobhr");
  const form = new FormData();
  form.append("title", `Data Analyst ${Date.now()}`);
  form.append("description", "SQL Python Excel Tableau");
  form.append("requiredSkills", "sql,python,excel,tableau");
  const job = await api("POST", "/api/jobs", { token: hr.token, form });
  expect(job.status).toBe(201);

  const u = await makeUser("candidate", "apply");
  const rf = new FormData();
  rf.append("resume", new Blob([require("node:fs").readFileSync(path.join(FIX, "resume.pdf"))], { type: "application/pdf" }), "resume.pdf");
  await api("POST", "/api/resume/upload", { token: u.token, form: rf });
  await loginUI(page, u);
  await page.goto(`${WEB}/candidate/jobs`);
  const card = page.locator("article, li, [data-job]").filter({ hasText: job.data.title }).first();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /apply now/i }).click();
  await expect(card.getByRole("link", { name: /applied/i })).toBeVisible({ timeout: 20000 });
  await shot(page, "cand_job_applied");
  // double-apply via API -> should be rejected
  const again = await api("POST", `/api/applications/${job.data._id}/apply`, { token: u.token });
  expect([400, 409]).toContain(again.status);
  await page.goto(`${WEB}/candidate/applications`);
  await expect(page.getByText(job.data.title).first()).toBeVisible();
  const body = await page.locator("main").innerText();
  const appDoc = await (await db()).collection("applications").findOne({ candidateId: oid(u.id) });
  finding(null, { kind: "check", id: "candidate-sees-match-score", matchScore: appDoc.matchScore, matched: appDoc.matched, shownOnPage: new RegExp(`${appDoc.matchScore}\s*%`).test(body) || /match score/i.test(body) });
  await shot(page, "cand_my_applications");
  await page.goto(`${WEB}/candidate/notifications`);
  await shot(page, "cand_notifications");
});

test("support ticket + messages; admin reply visible to candidate", async ({ page }) => {
  const u = await makeUser("candidate", "support");
  await loginUI(page, u);
  await page.goto(`${WEB}/candidate/support`);
  await page.getByLabel(/subject/i).fill("Cannot start interview");
  await page.getByLabel(/message|describe/i).first().fill("The start button spins forever.");
  await page.getByRole("button", { name: /submit|send|create/i }).first().click();
  await expect(page.getByText("Cannot start interview").first()).toBeVisible({ timeout: 15000 });
  await page.getByText("Cannot start interview").first().click();
  const reply = page.getByLabel(/reply|message/i).last();
  await reply.fill("Any update?");
  await page.getByRole("button", { name: /send|reply|post/i }).last().click();
  await expect(page.getByText("Any update?").first()).toBeVisible({ timeout: 15000 });
  await shot(page, "cand_support_thread");
  const tickets = await api("GET", "/api/support/tickets", { token: u.token });
  expect(tickets.data[0].messages.length).toBeGreaterThanOrEqual(2);
});
