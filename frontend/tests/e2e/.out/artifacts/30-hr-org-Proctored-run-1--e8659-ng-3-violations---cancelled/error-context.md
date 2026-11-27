# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 30-hr-org.spec.ts >> Proctored run 1: warm-ups, pool numbering, 3 violations -> cancelled
- Location: tests\e2e\30-hr-org.spec.ts:165:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Before you begin' })
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Before you begin' }) with timeout 30000ms
  - waiting for getByRole('heading', { name: 'Before you begin' })

```

```yaml
- main:
  - status "Checking your invitation…"
  - paragraph: Secure, proctored interview link · Powered by AiRecruitex
```

# Test source

```ts
  44  |   if (real.length) finding(info, { kind: "console", id: "create-job-console", errors: real });
  45  | });
  46  | 
  47  | test("HR: question pool upload (Data_Analyst_Question_Pool.docx, Q1:/Answer:/Marks:)", async ({ page }) => {
  48  |   await loginUI(page, S.hr!);
  49  |   await page.goto(`${WEB}/recruiter/jobs/${S.jobId}/questions`);
  50  |   await page.locator("#questions-file").setInputFiles(path.join(FIX, "Data_Analyst_Question_Pool.docx"));
  51  |   await page.locator("#questions-per-interview").fill("4");
  52  |   await page.getByRole("button", { name: /upload pool|replace pool/i }).click();
  53  |   await expect(page.getByText(/20 questions|of 20|20 in pool/i).first()).toBeVisible({ timeout: 30000 });
  54  |   await shot(page, "hr_question_pool");
  55  |   const set = await api("GET", `/api/jobs/${S.jobId}/interview-questions`, { token: S.hr!.token });
  56  |   expect(set.data.questions.length).toBe(20);
  57  |   expect(set.data.questions[0].marks).toBe(5);
  58  |   expect(set.data.questionsPerInterview).toBe(4);
  59  | });
  60  | 
  61  | test("HR: applicants list shows match score; status + per-row invite; bulk-invite with 1 ticked", async ({ page }, info) => {
  62  |   for (const t of ["appA", "appB", "appC", "appD"]) {
  63  |     const c = await candidateWithResume(t);
  64  |     const a = await api("POST", `/api/applications/${S.jobId}/apply`, { token: c.token });
  65  |     expect(a.status).toBe(201);
  66  |     S.cands.push(c); S.apps[c.email] = String(a.data._id);
  67  |   }
  68  |   await loginUI(page, S.hr!);
  69  |   await page.goto(`${WEB}/recruiter/applicants?jobId=${S.jobId}`);
  70  |   for (const c of S.cands) await expect(page.getByText(c.email).first()).toBeVisible({ timeout: 20000 });
  71  |   await expect(page.getByLabel("Match score").first()).toBeVisible();
  72  |   await shot(page, "hr_applicants");
  73  | 
  74  |   // mark A selected via the row select, then per-row invite
  75  |   const [A, B, C, D] = S.cands;
  76  |   const rowA = page.locator("li").filter({ hasText: A.email }).first();
  77  |   await rowA.getByLabel(/status/i).selectOption("selected");
  78  |   await expect(rowA.getByRole("button", { name: /Invite to org interview/i })).toBeEnabled({ timeout: 15000 });
  79  |   await rowA.getByRole("button", { name: /Invite to org interview/i }).click();
  80  |   const dlg = page.getByRole("dialog");
  81  |   await expect(dlg).toBeVisible();
  82  |   await shot(page, "hr_invite_dialog");
  83  |   await dlg.getByRole("button", { name: /send invite/i }).click();
  84  |   await expect(dlg).toBeHidden({ timeout: 20000 });
  85  |   const mailA = await waitForMail(A.email, /interview/i);
  86  |   expect(mailA.html).toMatch(/\/candidate\/interview\/org\?token=/);
  87  | 
  88  |   // bulk: tick ONLY D, press bulk "Invite to org interview"
  89  |   await page.reload();
  90  |   for (const c of S.cands) await api("PATCH", `/api/applications/${S.apps[c.email]}/status`, { token: S.hr!.token, body: { status: "selected" } });
  91  |   await page.reload();
  92  |   const rowD = page.locator("li").filter({ hasText: D.email }).first();
  93  |   await rowD.getByRole("checkbox").first().check();
  94  |   const bulk = page.getByRole("region", { name: "Bulk actions" });
  95  |   await bulk.getByRole("button", { name: /Invite to org interview/i }).click();
  96  |   const dlg2 = page.getByRole("dialog");
  97  |   const dlgText = await dlg2.innerText();
  98  |   await dlg2.getByRole("button", { name: /send invite/i }).click();
  99  |   await page.waitForTimeout(3000);
  100 |   const apps = await (await db()).collection("applications").find({ jobId: oid(S.jobId!) }).toArray();
  101 |   const invited = apps.filter((a: any) => a.orgInterview?.status === "invited").map((a: any) => S.cands.find((c) => S.apps[c.email] === String(a._id))?.email);
  102 |   const dInvited = invited.includes(D.email);
  103 |   finding(info, { kind: "check", id: "bulk-invite-single-ticked", ticked: D.email, invitedAfter: invited, dialogText: dlgText.slice(0, 200), screenshot: await shot(page, "hr_bulk_one_ticked") });
  104 |   void dInvited;
  105 | });
  106 | 
  107 | test("HR: cancel invite; AI interview single + bulk via API (no UI control)", async ({ page }, info) => {
  108 |   const [A, B, C] = S.cands;
  109 |   // cancel B's invite (send one first)
  110 |   const inv = await api("POST", `/api/applications/${S.apps[B.email]}/org-interview-invite`, { token: S.hr!.token, body: { validityDays: 3 } });
  111 |   expect(inv.status).toBe(200);
  112 |   await loginUI(page, S.hr!);
  113 |   await page.goto(`${WEB}/recruiter/applicants?jobId=${S.jobId}`);
  114 |   const rowB = page.locator("li").filter({ hasText: B.email }).first();
  115 |   await rowB.getByRole("button", { name: /cancel invite/i }).click();
  116 |   const reason = page.locator("#cancel-invite-reason");
  117 |   if (await reason.isVisible().catch(() => false)) await reason.fill("Position filled");
  118 |   await page.getByRole("dialog").getByRole("button", { name: /cancel invite|confirm|yes/i }).last().click();
  119 |   await expect(rowB.getByText(/cancelled/i).first()).toBeVisible({ timeout: 20000 });
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
> 144 |   await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible({ timeout: 30000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  220 |   await expect(page.getByText(/already in progress/i).first()).toBeVisible({ timeout: 30000 });
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
```