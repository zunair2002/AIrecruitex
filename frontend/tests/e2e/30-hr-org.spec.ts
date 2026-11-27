import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { WEB, api, db, oid, makeUser, loginUI, waitForMail, watchConsole, shot, finding, mailbox, type TestUser } from "./support/helpers";

const FIX = path.join(__dirname, "fixtures");
const blob = (f: string, type: string) => new Blob([fs.readFileSync(path.join(FIX, f))], { type });

async function candidateWithResume(tag: string) {
  const c = await makeUser("candidate", tag);
  const rf = new FormData();
  rf.append("resume", blob("resume.pdf", "application/pdf"), "resume.pdf");
  const r = await api("POST", "/api/resume/upload", { token: c.token, form: rf });
  expect(r.status).toBe(200);
  return c;
}

// Shared state across the serial HR tests
const S: { hr?: TestUser; jobId?: string; jobTitle?: string; cands: TestUser[]; apps: Record<string, string> } = { cands: [], apps: {} };
test.describe.configure({ mode: "serial" });

test("HR: create job with JD upload -> skills suggested", async ({ page }, info) => {
  const errors = watchConsole(page);
  S.hr = await makeUser("hr", "hr");
  await loginUI(page, S.hr);
  await expect(page).toHaveURL(/\/recruiter\/dashboard/);
  await page.goto(`${WEB}/recruiter/jobs/create`);
  S.jobTitle = `Data Analyst E2E ${Date.now()}`;
  await page.locator("#job-title").fill(S.jobTitle);
  await page.locator("#job-description").fill("Junior data analyst role. SQL, Python, Excel, Tableau and Power BI.");
  await page.locator("#job-jd").setInputFiles(path.join(FIX, "jd.pdf"));
  await page.waitForTimeout(1500);
  await shot(page, "hr_create_job_filled");
  const uiSuggested = await page.locator("main").innerText();
  await page.locator("form button[type=submit]").last().click();
  await page.waitForTimeout(4000);
  const job = await (await db()).collection("jobs").findOne({ title: S.jobTitle });
  expect(job, "job created").toBeTruthy();
  S.jobId = String(job._id);
  finding(info, { kind: "check", id: "jd-skill-suggestions", skills: job.requiredSkills, uiShowedSuggestionsBeforeSubmit: /suggest/i.test(uiSuggested) });
  expect(job.requiredSkills.length).toBeGreaterThan(0);
  await shot(page, "hr_job_created");
  const real = errors.filter((e) => !/status of 4/.test(e));
  if (real.length) finding(info, { kind: "console", id: "create-job-console", errors: real });
});

test("HR: question pool upload (Data_Analyst_Question_Pool.docx, Q1:/Answer:/Marks:)", async ({ page }) => {
  await loginUI(page, S.hr!);
  await page.goto(`${WEB}/recruiter/jobs/${S.jobId}/questions`);
  await page.locator("#questions-file").setInputFiles(path.join(FIX, "Data_Analyst_Question_Pool.docx"));
  await page.locator("#questions-per-interview").fill("4");
  await page.getByRole("button", { name: /upload pool|replace pool/i }).click();
  await expect(page.getByText(/20 questions|of 20|20 in pool/i).first()).toBeVisible({ timeout: 30000 });
  await shot(page, "hr_question_pool");
  const set = await api("GET", `/api/jobs/${S.jobId}/interview-questions`, { token: S.hr!.token });
  expect(set.data.questions.length).toBe(20);
  expect(set.data.questions[0].marks).toBe(5);
  expect(set.data.questionsPerInterview).toBe(4);
});

test("HR: applicants list shows match score; status + per-row invite; bulk-invite with 1 ticked", async ({ page }, info) => {
  for (const t of ["appA", "appB", "appC", "appD"]) {
    const c = await candidateWithResume(t);
    const a = await api("POST", `/api/applications/${S.jobId}/apply`, { token: c.token });
    expect(a.status).toBe(201);
    S.cands.push(c); S.apps[c.email] = String(a.data._id);
  }
  await loginUI(page, S.hr!);
  await page.goto(`${WEB}/recruiter/applicants?jobId=${S.jobId}`);
  for (const c of S.cands) await expect(page.getByText(c.email).first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByLabel("Match score").first()).toBeVisible();
  await shot(page, "hr_applicants");

  // mark A selected via the row select, then per-row invite
  const [A, B, C, D] = S.cands;
  const rowA = page.locator("li").filter({ hasText: A.email }).first();
  await rowA.getByLabel(/status/i).selectOption("selected");
  await expect(rowA.getByRole("button", { name: /Invite to org interview/i })).toBeEnabled({ timeout: 15000 });
  await rowA.getByRole("button", { name: /Invite to org interview/i }).click();
  const dlg = page.getByRole("dialog");
  await expect(dlg).toBeVisible();
  await shot(page, "hr_invite_dialog");
  await dlg.getByRole("button", { name: /send invite/i }).click();
  await expect(dlg).toBeHidden({ timeout: 20000 });
  const mailA = await waitForMail(A.email, /interview/i);
  expect(mailA.html).toMatch(/\/candidate\/interview\/org\?token=/);

  // bulk: tick ONLY D, press bulk "Invite to org interview"
  await page.reload();
  for (const c of S.cands) await api("PATCH", `/api/applications/${S.apps[c.email]}/status`, { token: S.hr!.token, body: { status: "selected" } });
  await page.reload();
  const rowD = page.locator("li").filter({ hasText: D.email }).first();
  await rowD.getByRole("checkbox").first().check();
  const bulk = page.getByRole("region", { name: "Bulk actions" });
  await bulk.getByRole("button", { name: /Invite to org interview/i }).click();
  const dlg2 = page.getByRole("dialog");
  const dlgText = await dlg2.innerText();
  await dlg2.getByRole("button", { name: /send invite/i }).click();
  await page.waitForTimeout(3000);
  const apps = await (await db()).collection("applications").find({ jobId: oid(S.jobId!) }).toArray();
  const invited = apps.filter((a: any) => a.orgInterview?.status === "invited").map((a: any) => S.cands.find((c) => S.apps[c.email] === String(a._id))?.email);
  const dInvited = invited.includes(D.email);
  finding(info, { kind: "check", id: "bulk-invite-single-ticked", ticked: D.email, invitedAfter: invited, dialogText: dlgText.slice(0, 200), screenshot: await shot(page, "hr_bulk_one_ticked") });
  void dInvited;
});

test("HR: cancel invite; AI interview single + bulk via API (no UI control)", async ({ page }, info) => {
  const [A, B, C] = S.cands;
  // cancel B's invite (send one first)
  const inv = await api("POST", `/api/applications/${S.apps[B.email]}/org-interview-invite`, { token: S.hr!.token, body: { validityDays: 3 } });
  expect(inv.status).toBe(200);
  await loginUI(page, S.hr!);
  await page.goto(`${WEB}/recruiter/applicants?jobId=${S.jobId}`);
  const rowB = page.locator("li").filter({ hasText: B.email }).first();
  await rowB.getByRole("button", { name: /cancel invite/i }).click();
  const reason = page.locator("#cancel-invite-reason");
  if (await reason.isVisible().catch(() => false)) await reason.fill("Position filled");
  await page.getByRole("dialog").getByRole("button", { name: /cancel invite|confirm|yes/i }).last().click();
  await expect(rowB.getByText(/cancelled/i).first()).toBeVisible({ timeout: 20000 });
  await shot(page, "hr_invite_cancelled");
  const tokenB = inv.data.orgInterview.token;
  const g = await api("GET", `/api/applications/org-interview/${tokenB}`);
  expect(g.data?.status ?? g.status).toBe("cancelled");

  // AI interview: single + bulk — the UI has no control that opens the "ai" dialog
  const aiButtons = await page.getByRole("button", { name: /AI interview/i }).count();
  const single = await api("POST", `/api/applications/${S.apps[C.email]}/ai-interview`, { token: S.hr!.token, body: { dateTime: new Date(Date.now() + 86400000).toISOString(), message: "Good luck" } });
  const bulk = await api("POST", "/api/applications/bulk/ai-interview", { token: S.hr!.token, body: { applicationIds: [S.apps[A.email], S.apps[B.email]] } });
  finding(info, { kind: "check", id: "ai-interview-ui", aiButtonsOnApplicantsPage: aiButtons, apiSingle: single.status, apiBulk: bulk.status });
  expect(single.status).toBe(200);
  // candidate C completes the AI interview through the emailed session link
  const mail = await waitForMail(C.email, /AI interview/i);
  const link = (mail.html.match(/href="([^"]*\/candidate\/interview\/session\/[a-f0-9]+)"/) || [])[1];
  expect(link).toBeTruthy();
  const sessionId = link.split("/").pop()!;
  for (let i = 0; i < 20; i++) {
    const r = await api("POST", "/api/interview/answer", { token: C.token, body: { sessionId, answer: `Solid answer number ${i} with a concrete example [raw=8]` } });
    if (r.status !== 200 || r.data.status !== "in_progress") break;
  }
});

async function openInvite(page: Page, token: string) {
  await page.goto(`${WEB}/candidate/interview/org?token=${token}`);
  await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible({ timeout: 30000 });
}
async function startProctored(page: Page) {
  const start = page.getByRole("button", { name: /Start interview|Resume interview/i });
  await expect(start).toBeDisabled();
  await page.getByLabel(/I have read and agree/i).check();
  await expect(start).toBeDisabled(); // camera still off
  await page.getByLabel(/I have read and agree/i).uncheck();
  await page.getByRole("button", { name: /Turn on camera/i }).click();
  await expect(page.getByText(/Camera on/i).first()).toBeVisible({ timeout: 15000 });
  await expect(start).toBeDisabled(); // camera on, not agreed
  await page.getByLabel(/I have read and agree/i).check();
  await expect(start).toBeEnabled();
  await shot(page, "org_intro_ready");
  await start.click();
}
const answerOrg = async (page: Page, text: string) => {
  await page.locator("textarea").first().fill(text);
  await page.getByRole("button", { name: /^submit answer$/i }).click();
};

test("Proctored run 1: warm-ups, pool numbering, 3 violations -> cancelled", async ({ page }, info) => {
  const errors = watchConsole(page);
  const [A] = S.cands;
  const app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[A.email]) });
  await openInvite(page, app.orgInterview.token);
  await shot(page, "org_intro");
  await startProctored(page);
  await expect(page.getByText("Warm-up 1 of 3").first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/not scored/i).first()).toBeVisible();
  await shot(page, "org_warmup1");
  for (let i = 1; i <= 3; i++) {
    await answerOrg(page, `Warm-up answer ${i}, I am a fresh graduate.`);
    await expect(page.getByText(i < 3 ? `Warm-up ${i + 1} of 3` : "Question 1 of 4").first()).toBeVisible({ timeout: 30000 });
  }
  await shot(page, "org_pool_q1");
  // violation 1: tab hidden
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Warnings 1\/2|1 of 2|warning 1/i).first()).toBeVisible();
  await shot(page, "org_violation1");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); });
  await page.getByRole("dialog").getByRole("button").last().click();
  await page.waitForTimeout(2500);
  // violation 2: window blur
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.getByText(/final warning/i).first()).toBeVisible({ timeout: 10000 });
  await shot(page, "org_violation2");
  await page.getByRole("dialog").getByRole("button").last().click();
  await page.waitForTimeout(2500);
  // violation 3: fullscreen exit (or blur if fullscreen not entered)
  const fs = await page.evaluate(() => Boolean(document.fullscreenElement));
  if (fs) await page.evaluate(() => document.exitFullscreen());
  else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.getByText(/cancelled/i).first()).toBeVisible({ timeout: 15000 });
  await shot(page, "org_cancelled");
  const appAfter = await (await db()).collection("applications").findOne({ _id: oid(S.apps[A.email]) });
  expect(appAfter.orgInterview.status).toBe("cancelled");
  expect(appAfter.orgInterview.violations.length).toBe(3);
  finding(info, { kind: "check", id: "org-run1", fullscreenEntered: fs, consoleErrors: errors });
});

test("Proctored run 2: complete -> closing message; reload mid-way resumes", async ({ page }, info) => {
  const D = S.cands[3];
  let app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) });
  if (app.orgInterview?.status !== "invited") {
    await api("POST", `/api/applications/${S.apps[D.email]}/org-interview-invite`, { token: S.hr!.token, body: { validityDays: 3 } });
    app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) });
  }
  await openInvite(page, app.orgInterview.token);
  await startProctored(page);
  await expect(page.getByText("Warm-up 1 of 3").first()).toBeVisible({ timeout: 30000 });
  await answerOrg(page, "Warm-up one answer about myself.");
  await expect(page.getByText("Warm-up 2 of 3").first()).toBeVisible({ timeout: 30000 });
  // reload mid-interview
  await page.reload();
  await expect(page.getByText(/already in progress/i).first()).toBeVisible({ timeout: 30000 });
  await shot(page, "org_reload_resume");
  await startProctored(page);
  await expect(page.getByText("Warm-up 2 of 3").first()).toBeVisible({ timeout: 30000 });
  const vAfterReload = (await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) })).orgInterview.violations?.length ?? 0;
  for (const label of ["Warm-up 3 of 3", "Question 1 of 4", "Question 2 of 4", "Question 3 of 4", "Question 4 of 4"]) {
    await answerOrg(page, "A detailed answer: SQL joins combine rows, and I used pandas to clean data [raw=8]");
    if (label !== "Question 4 of 4") await expect(page.getByText(label).first()).toBeVisible({ timeout: 30000 });
    else break;
  }
  await expect(page.getByText("Question 4 of 4").first()).toBeVisible({ timeout: 30000 });
  await answerOrg(page, "Final answer about dashboards and storytelling [raw=8]");
  await expect(page.getByText(/thank you|completed|closing/i).first()).toBeVisible({ timeout: 60000 });
  await shot(page, "org_completed_closing");
  finding(info, { kind: "check", id: "org-run2", violationsCountedByReload: vAfterReload, closingText: (await page.locator("main").innerText()).slice(0, 400) });
});

test("HR: reports (AI report + org report: Introduction (not scored), Q1/Q2 pool numbering); shortlisted", async ({ page }, info) => {
  const C = S.cands[2], D = S.cands[3];
  await loginUI(page, S.hr!);
  await page.goto(`${WEB}/recruiter/reports?jobId=${S.jobId}&applicationId=${S.apps[D.email]}`);
  await expect(page.getByText("Organisational interview").first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Introduction (not scored)").first()).toBeVisible();
  const txt = await page.locator("main").innerText();
  await shot(page, "hr_report_org");
  const hasQ1 = /Q1\b|Question 1\b/.test(txt), hasQ2 = /Q2\b|Question 2\b/.test(txt);
  const hasQ4plus = /Q[5-7]\.|Question [5-7]\b/.test(txt);
  finding(info, { kind: "check", id: "org-report-numbering", hasQ1, hasQ2, hasWarmupNumbersLeaking: hasQ4plus });
  expect(hasQ1 && hasQ2).toBe(true);
  await page.goto(`${WEB}/recruiter/reports?jobId=${S.jobId}&applicationId=${S.apps[C.email]}`);
  await page.waitForTimeout(3000);
  await shot(page, "hr_report_ai");
  const aiTxt = await page.locator("main").innerText();
  finding(info, { kind: "check", id: "ai-report-visible", hasAiSection: /AI interview/i.test(aiTxt), hasScore: /\d+\s*%/.test(aiTxt) });
  await page.goto(`${WEB}/recruiter/shortlisted?jobId=${S.jobId}`);
  await page.waitForTimeout(2500);
  await shot(page, "hr_shortlisted");
  const sl = await page.locator("main").innerText();
  expect(S.cands.some((c) => sl.includes(c.email) || sl.includes(c.name))).toBe(true);
});

test("HR: courses CRUD + candidate premium lock", async ({ page, browser }) => {
  await loginUI(page, S.hr!);
  await page.goto(`${WEB}/recruiter/courses`);
  const title = `SQL Deep Dive ${Date.now()}`;
  await page.locator("#course-title").fill(title);
  await page.locator("#course-description").fill("Joins, window functions.");
  await page.locator("#course-video").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const premium = page.getByRole("radio", { name: /premium/i }).or(page.getByLabel(/premium/i)).first();
  if (await premium.count()) await premium.check().catch(() => premium.click());
  await page.locator("form button[type=submit]").first().click();
  await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 });
  await shot(page, "hr_course_created");
  // edit
  const card = page.locator("li, article").filter({ hasText: title }).first();
  await card.getByRole("button", { name: /edit/i }).click();
  await page.locator("#course-title").fill(title + " v2");
  await page.locator("form button[type=submit]").first().click();
  await expect(page.getByText(title + " v2").first()).toBeVisible({ timeout: 15000 });
  const course = await (await db()).collection("courses").findOne({ title: title + " v2" });
  expect(course).toBeTruthy();
  // candidate (free) sees it locked
  const cctx = await browser.newContext();
  const cp = await cctx.newPage();
  const cand = await makeUser("candidate", "learn");
  await loginUI(cp, cand);
  await cp.goto(`${WEB}/candidate/learning`);
  await expect(cp.getByText(title + " v2").first()).toBeVisible({ timeout: 20000 });
  const lockedTxt = await cp.locator("main").innerText();
  await shot(cp, "cand_learning_premium_locked");
  expect(course.tier === "premium" ? /premium|locked|upgrade/i.test(lockedTxt) : true).toBe(true);
  await cctx.close();
  // delete
  const card2 = page.locator("li, article").filter({ hasText: title + " v2" }).first();
  await card2.getByRole("button", { name: /delete/i }).click();
  const dlg = page.getByRole("dialog");
  if (await dlg.isVisible().catch(() => false)) await dlg.getByRole("button", { name: /delete/i }).last().click();
  await expect(page.getByText(title + " v2")).toHaveCount(0, { timeout: 15000 });
});
