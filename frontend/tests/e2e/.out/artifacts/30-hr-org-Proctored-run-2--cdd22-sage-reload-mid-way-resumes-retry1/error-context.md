# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 30-hr-org.spec.ts >> Proctored run 2: complete -> closing message; reload mid-way resumes
- Location: tests\e2e\30-hr-org.spec.ts:206:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/already in progress/i).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/already in progress/i).first() with timeout 30000ms
  - waiting for getByText(/already in progress/i).first()

```

```yaml
- main:
  - status "Checking your invitation…"
  - paragraph: Secure, proctored interview link · Powered by AiRecruitex
```

# Test source

```ts
  120 |   await shot(page, "hr_invite_cancelled");
  121 |   const tokenB = inv.data.orgInterview.token;
  122 |   const g = await api("GET", `/api/applications/org-interview/${tokenB}`);
  123 |   expect(g.data?.status ?? g.status).toBe("cancelled");
  124 | 
  125 |   // AI interview: single + bulk — the UI has no control that opens the "ai" dialog
  126 |   const aiButtons = await page.getByRole("button", { name: /AI interview/i }).count();
  127 |   const single = await api("POST", `/api/applications/${S.apps[C.email]}/ai-interview`, { token: S.hr!.token, body: { dateTime: new Date(Date.now() + 86400000).toISOString(), message: "Good luck" } });
  128 |   const bulk = await api("POST", "/api/applications/bulk/ai-interview", { token: S.hr!.token, body: { applicationIds: [S.apps[A.email], S.apps[B.email]] } });
  129 |   finding(info, { kind: "check", id: "ai-interview-ui", aiButtonsOnApplicantsPage: aiButtons, apiSingle: single.status, apiBulk: bulk.status });
  130 |   expect(single.status).toBe(200);
  131 |   // candidate C completes the AI interview through the emailed session link
  132 |   const mail = await waitForMail(C.email, /AI interview/i);
  133 |   const link = (mail.html.match(/href="([^"]*\/candidate\/interview\/session\/[a-f0-9]+)"/) || [])[1];
  134 |   expect(link).toBeTruthy();
  135 |   const sessionId = link.split("/").pop()!;
  136 |   for (let i = 0; i < 20; i++) {
  137 |     const r = await api("POST", "/api/interview/answer", { token: C.token, body: { sessionId, answer: `Solid answer number ${i} with a concrete example [raw=8]` } });
  138 |     if (r.status !== 200 || r.data.status !== "in_progress") break;
  139 |   }
  140 | });
  141 | 
  142 | async function openInvite(page: Page, token: string) {
  143 |   await page.goto(`${WEB}/candidate/interview/org?token=${token}`);
  144 |   await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible({ timeout: 30000 });
  145 | }
  146 | async function startProctored(page: Page) {
  147 |   const start = page.getByRole("button", { name: /Start interview|Resume interview/i });
  148 |   await expect(start).toBeDisabled();
  149 |   await page.getByLabel(/I have read and agree/i).check();
  150 |   await expect(start).toBeDisabled(); // camera still off
  151 |   await page.getByLabel(/I have read and agree/i).uncheck();
  152 |   await page.getByRole("button", { name: /Turn on camera/i }).click();
  153 |   await expect(page.getByText(/Camera on/i).first()).toBeVisible({ timeout: 15000 });
  154 |   await expect(start).toBeDisabled(); // camera on, not agreed
  155 |   await page.getByLabel(/I have read and agree/i).check();
  156 |   await expect(start).toBeEnabled();
  157 |   await shot(page, "org_intro_ready");
  158 |   await start.click();
  159 | }
  160 | const answerOrg = async (page: Page, text: string) => {
  161 |   await page.locator("textarea").first().fill(text);
  162 |   await page.getByRole("button", { name: /^submit answer$/i }).click();
  163 | };
  164 | 
  165 | test("Proctored run 1: warm-ups, pool numbering, 3 violations -> cancelled", async ({ page }, info) => {
  166 |   const errors = watchConsole(page);
  167 |   const [A] = S.cands;
  168 |   const app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[A.email]) });
  169 |   await openInvite(page, app.orgInterview.token);
  170 |   await shot(page, "org_intro");
  171 |   await startProctored(page);
  172 |   await expect(page.getByText("Warm-up 1 of 3").first()).toBeVisible({ timeout: 30000 });
  173 |   await expect(page.getByText(/not scored/i).first()).toBeVisible();
  174 |   await shot(page, "org_warmup1");
  175 |   for (let i = 1; i <= 3; i++) {
  176 |     await answerOrg(page, `Warm-up answer ${i}, I am a fresh graduate.`);
  177 |     await expect(page.getByText(i < 3 ? `Warm-up ${i + 1} of 3` : "Question 1 of 4").first()).toBeVisible({ timeout: 30000 });
  178 |   }
  179 |   await shot(page, "org_pool_q1");
  180 |   // violation 1: tab hidden
  181 |   await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  182 |   await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
  183 |   await expect(page.getByText(/Warnings 1\/2|1 of 2|warning 1/i).first()).toBeVisible();
  184 |   await shot(page, "org_violation1");
  185 |   await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); });
  186 |   await page.getByRole("dialog").getByRole("button").last().click();
  187 |   await page.waitForTimeout(2500);
  188 |   // violation 2: window blur
  189 |   await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  190 |   await expect(page.getByText(/final warning/i).first()).toBeVisible({ timeout: 10000 });
  191 |   await shot(page, "org_violation2");
  192 |   await page.getByRole("dialog").getByRole("button").last().click();
  193 |   await page.waitForTimeout(2500);
  194 |   // violation 3: fullscreen exit (or blur if fullscreen not entered)
  195 |   const fs = await page.evaluate(() => Boolean(document.fullscreenElement));
  196 |   if (fs) await page.evaluate(() => document.exitFullscreen());
  197 |   else await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  198 |   await expect(page.getByText(/cancelled/i).first()).toBeVisible({ timeout: 15000 });
  199 |   await shot(page, "org_cancelled");
  200 |   const appAfter = await (await db()).collection("applications").findOne({ _id: oid(S.apps[A.email]) });
  201 |   expect(appAfter.orgInterview.status).toBe("cancelled");
  202 |   expect(appAfter.orgInterview.violations.length).toBe(3);
  203 |   finding(info, { kind: "check", id: "org-run1", fullscreenEntered: fs, consoleErrors: errors });
  204 | });
  205 | 
  206 | test("Proctored run 2: complete -> closing message; reload mid-way resumes", async ({ page }, info) => {
  207 |   const D = S.cands[3];
  208 |   let app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) });
  209 |   if (app.orgInterview?.status !== "invited") {
  210 |     await api("POST", `/api/applications/${S.apps[D.email]}/org-interview-invite`, { token: S.hr!.token, body: { validityDays: 3 } });
  211 |     app = await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) });
  212 |   }
  213 |   await openInvite(page, app.orgInterview.token);
  214 |   await startProctored(page);
  215 |   await expect(page.getByText("Warm-up 1 of 3").first()).toBeVisible({ timeout: 30000 });
  216 |   await answerOrg(page, "Warm-up one answer about myself.");
  217 |   await expect(page.getByText("Warm-up 2 of 3").first()).toBeVisible({ timeout: 30000 });
  218 |   // reload mid-interview
  219 |   await page.reload();
> 220 |   await expect(page.getByText(/already in progress/i).first()).toBeVisible({ timeout: 30000 });
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  221 |   await shot(page, "org_reload_resume");
  222 |   await startProctored(page);
  223 |   await expect(page.getByText("Warm-up 2 of 3").first()).toBeVisible({ timeout: 30000 });
  224 |   const vAfterReload = (await (await db()).collection("applications").findOne({ _id: oid(S.apps[D.email]) })).orgInterview.violations?.length ?? 0;
  225 |   for (const label of ["Warm-up 3 of 3", "Question 1 of 4", "Question 2 of 4", "Question 3 of 4", "Question 4 of 4"]) {
  226 |     await answerOrg(page, "A detailed answer: SQL joins combine rows, and I used pandas to clean data [raw=8]");
  227 |     if (label !== "Question 4 of 4") await expect(page.getByText(label).first()).toBeVisible({ timeout: 30000 });
  228 |     else break;
  229 |   }
  230 |   await expect(page.getByText("Question 4 of 4").first()).toBeVisible({ timeout: 30000 });
  231 |   await answerOrg(page, "Final answer about dashboards and storytelling [raw=8]");
  232 |   await expect(page.getByText(/thank you|completed|closing/i).first()).toBeVisible({ timeout: 60000 });
  233 |   await shot(page, "org_completed_closing");
  234 |   finding(info, { kind: "check", id: "org-run2", violationsCountedByReload: vAfterReload, closingText: (await page.locator("main").innerText()).slice(0, 400) });
  235 | });
  236 | 
  237 | test("HR: reports (AI report + org report: Introduction (not scored), Q1/Q2 pool numbering); shortlisted", async ({ page }, info) => {
  238 |   const C = S.cands[2], D = S.cands[3];
  239 |   await loginUI(page, S.hr!);
  240 |   await page.goto(`${WEB}/recruiter/reports?jobId=${S.jobId}&applicationId=${S.apps[D.email]}`);
  241 |   await expect(page.getByText("Organisational interview").first()).toBeVisible({ timeout: 30000 });
  242 |   await expect(page.getByText("Introduction (not scored)").first()).toBeVisible();
  243 |   const txt = await page.locator("main").innerText();
  244 |   await shot(page, "hr_report_org");
  245 |   const hasQ1 = /Q1\b|Question 1\b/.test(txt), hasQ2 = /Q2\b|Question 2\b/.test(txt);
  246 |   const hasQ4plus = /Q[5-7]\.|Question [5-7]\b/.test(txt);
  247 |   finding(info, { kind: "check", id: "org-report-numbering", hasQ1, hasQ2, hasWarmupNumbersLeaking: hasQ4plus });
  248 |   expect(hasQ1 && hasQ2).toBe(true);
  249 |   await page.goto(`${WEB}/recruiter/reports?jobId=${S.jobId}&applicationId=${S.apps[C.email]}`);
  250 |   await page.waitForTimeout(3000);
  251 |   await shot(page, "hr_report_ai");
  252 |   const aiTxt = await page.locator("main").innerText();
  253 |   finding(info, { kind: "check", id: "ai-report-visible", hasAiSection: /AI interview/i.test(aiTxt), hasScore: /\d+\s*%/.test(aiTxt) });
  254 |   await page.goto(`${WEB}/recruiter/shortlisted?jobId=${S.jobId}`);
  255 |   await page.waitForTimeout(2500);
  256 |   await shot(page, "hr_shortlisted");
  257 |   const sl = await page.locator("main").innerText();
  258 |   expect(S.cands.some((c) => sl.includes(c.email) || sl.includes(c.name))).toBe(true);
  259 | });
  260 | 
  261 | test("HR: courses CRUD + candidate premium lock", async ({ page, browser }) => {
  262 |   await loginUI(page, S.hr!);
  263 |   await page.goto(`${WEB}/recruiter/courses`);
  264 |   const title = `SQL Deep Dive ${Date.now()}`;
  265 |   await page.locator("#course-title").fill(title);
  266 |   await page.locator("#course-description").fill("Joins, window functions.");
  267 |   await page.locator("#course-video").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  268 |   const premium = page.getByRole("radio", { name: /premium/i }).or(page.getByLabel(/premium/i)).first();
  269 |   if (await premium.count()) await premium.check().catch(() => premium.click());
  270 |   await page.locator("form button[type=submit]").first().click();
  271 |   await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 });
  272 |   await shot(page, "hr_course_created");
  273 |   // edit
  274 |   const card = page.locator("li, article").filter({ hasText: title }).first();
  275 |   await card.getByRole("button", { name: /edit/i }).click();
  276 |   await page.locator("#course-title").fill(title + " v2");
  277 |   await page.locator("form button[type=submit]").first().click();
  278 |   await expect(page.getByText(title + " v2").first()).toBeVisible({ timeout: 15000 });
  279 |   const course = await (await db()).collection("courses").findOne({ title: title + " v2" });
  280 |   expect(course).toBeTruthy();
  281 |   // candidate (free) sees it locked
  282 |   const cctx = await browser.newContext();
  283 |   const cp = await cctx.newPage();
  284 |   const cand = await makeUser("candidate", "learn");
  285 |   await loginUI(cp, cand);
  286 |   await cp.goto(`${WEB}/candidate/learning`);
  287 |   await expect(cp.getByText(title + " v2").first()).toBeVisible({ timeout: 20000 });
  288 |   const lockedTxt = await cp.locator("main").innerText();
  289 |   await shot(cp, "cand_learning_premium_locked");
  290 |   expect(course.tier === "premium" ? /premium|locked|upgrade/i.test(lockedTxt) : true).toBe(true);
  291 |   await cctx.close();
  292 |   // delete
  293 |   const card2 = page.locator("li, article").filter({ hasText: title + " v2" }).first();
  294 |   await card2.getByRole("button", { name: /delete/i }).click();
  295 |   const dlg = page.getByRole("dialog");
  296 |   if (await dlg.isVisible().catch(() => false)) await dlg.getByRole("button", { name: /delete/i }).last().click();
  297 |   await expect(page.getByText(title + " v2")).toHaveCount(0, { timeout: 15000 });
  298 | });
  299 | 
```