# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 20-practice.spec.ts >> Round 1 full: intro first, closing last, pass -> Round 2 unlocked; Round 2 on selected track
- Location: tests\e2e\20-practice.spec.ts:33:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Resume|Start Round 2/i }).last()
Expected: visible
Timeout: 90000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /Resume|Start Round 2/i }).last() with timeout 90000ms
  - waiting for getByRole('button', { name: /Resume|Start Round 2/i }).last()

```

```yaml
- status "Loading"
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import fs from "node:fs";
  3   | import path from "node:path";
  4   | import { WEB, api, db, oid, makeUser, loginUI, watchConsole, shot, finding } from "./support/helpers";
  5   | 
  6   | const STACK = JSON.parse(fs.readFileSync(path.join(__dirname, ".stack.json"), "utf8"));
  7   | const BANK: any[] = JSON.parse(fs.readFileSync(path.join(STACK.backendDir, "src", "ai", "practice_questions.json"), "utf8"));
  8   | const norm = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  9   | const slotOf = (q: string) => BANK.find((b) => norm(b.question) === norm(q))?.slot;
  10  | 
  11  | async function progress(page: Page) {
  12  |   const t = await page.getByText(/Question \d+ of \d+/).first().innerText();
  13  |   const m = t.match(/Question (\d+) of (\d+)/)!;
  14  |   return { n: Number(m[1]), total: Number(m[2]), label: t };
  15  | }
  16  | async function currentQuestion(page: Page) {
  17  |   // QuestionCard: eyebrow "Interviewer · Question n" followed by the question text
  18  |   const card = page.locator("section, div").filter({ hasText: /^Interviewer · Question/ }).first();
  19  |   const txt = await card.innerText();
  20  |   return txt.replace(/^Interviewer · Question \d+.*\n?/, "").trim();
  21  | }
  22  | async function answer(page: Page, text: string) {
  23  |   await page.locator("#interview-answer").fill(text);
  24  |   await page.getByRole("button", { name: /^submit answer$/i }).click();
  25  | }
  26  | async function startRound(page: Page, round: 1 | 2, trackLabel?: RegExp) {
  27  |   await page.goto(`${WEB}/candidate/interview/${round === 1 ? "basic" : "advanced"}`);
  28  |   if (trackLabel) await page.getByRole("button", { name: trackLabel }).first().click();
  29  |   await page.getByRole("button", { name: new RegExp(`Start Round ${round}|Resume`, "i") }).last().click();
  30  |   await expect(page.getByText(/Question \d+ of \d+/).first()).toBeVisible({ timeout: 60000 });
  31  | }
  32  | 
  33  | test("Round 1 full: intro first, closing last, pass -> Round 2 unlocked; Round 2 on selected track", async ({ page }, info) => {
  34  |   const errors = watchConsole(page);
  35  |   const u = await makeUser("candidate", "r1pass");
  36  |   await loginUI(page, u);
  37  |   await startRound(page, 1, /Data \/ AI Engineer/i);
  38  |   await shot(page, "practice_r1_q1");
  39  |   const qs: string[] = [];
  40  |   let p = await progress(page);
  41  |   expect(p.total).toBe(5);
  42  |   while (true) {
  43  |     p = await progress(page);
  44  |     const q = await page.locator("main").innerText();
  45  |     const sess = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id), stage: "basic" }, { sort: { createdAt: -1 } });
  46  |     qs.push(sess.currentQuestion);
  47  |     expect(q).toContain(sess.currentQuestion.slice(0, 40));
  48  |     await answer(page, `For question ${p.n} I would explain the main idea clearly with a concrete example from my project [raw=8]`);
  49  |     if (p.n === p.total) break;
  50  |     await expect(page.getByText(`Question ${p.n + 1} of ${p.total}`).first()).toBeVisible({ timeout: 30000 });
  51  |   }
  52  |   expect(slotOf(qs[0])).toBe("intro");
  53  |   expect(slotOf(qs[qs.length - 1])).toBe("closing");
  54  |   await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  55  |   await expect(page.getByRole("heading", { name: "Round 2 unlocked" })).toBeVisible();
  56  |   await shot(page, "practice_r1_result_pass");
  57  |   // score rendering sanity: "Overall score: N%" with 0..100
  58  |   const scoreTxt = await page.getByText(/Overall score: \d+/).first().innerText();
  59  |   const score = Number(scoreTxt.match(/(\d+(\.\d+)?)/)![1]);
  60  |   expect(score).toBeGreaterThanOrEqual(50);
  61  |   expect(score).toBeLessThanOrEqual(100);
  62  | 
  63  |   await page.getByRole("link", { name: /Start Round 2/i }).click();
  64  |   await page.waitForURL(/interview\/advanced/);
  65  |   await expect(page.getByText(/Data \/ AI Engineer/).first()).toBeVisible();
  66  |   await page.getByRole("button", { name: /Start Round 2/i }).last().click();
  67  |   await expect(page.getByText(/Round 2 · Data \/ AI · Question 1 of 8/)).toBeVisible({ timeout: 60000 });
  68  |   const r2 = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id), stage: "technical" });
  69  |   expect(r2.track).toBe("data_ai");
  70  |   await shot(page, "practice_r2_q1");
  71  | 
  72  |   // answer one, then reload -> resume at Q2 (no allowance used)
  73  |   await answer(page, "Normalization removes redundancy in tables [raw=7]");
  74  |   await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  75  |   const usageBefore = (await api("GET", "/api/interview/usage", { token: u.token })).data.used;
  76  |   await page.reload();
  77  |   await shot(page, "practice_r2_after_reload");
  78  |   const resumeBtn = page.getByRole("button", { name: /Resume|Start Round 2/i }).last();
> 79  |   await expect(resumeBtn).toBeVisible({ timeout: 90000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  80  |   const btnLabel = await resumeBtn.innerText();
  81  |   await resumeBtn.click();
  82  |   await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  83  |   const usageAfter = (await api("GET", "/api/interview/usage", { token: u.token })).data.used;
  84  |   expect(usageAfter).toBe(usageBefore);
  85  |   if (!/resume/i.test(btnLabel)) finding(info, { kind: "observation", id: "reload-resume-label", detail: `After reload the button says "${btnLabel}" instead of Resume; in-progress session is resumed only after clicking Start` });
  86  | 
  87  |   // timer: force expiry in 6s, reload, resume -> countdown -> time-up -> server finalises (sweep every 30s)
  88  |   await (await db()).collection("interviewsessions").updateOne({ _id: r2._id }, { $set: { expiresAt: new Date(Date.now() + 8000) } });
  89  |   await page.reload();
  90  |   await page.getByRole("button", { name: /Resume|Start Round 2/i }).last().click();
  91  |   await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  92  |   await expect(page.getByRole("timer").or(page.getByText(/\b0?0:0\d\b/)).first()).toBeVisible();
  93  |   await shot(page, "practice_timer_running");
  94  |   await expect(page.getByText(/Time's up/i)).toBeVisible({ timeout: 20000 });
  95  |   await expect(page.getByRole("button", { name: /Time expired/i })).toBeDisabled();
  96  |   await shot(page, "practice_time_up");
  97  |   await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  98  |   await shot(page, "practice_r2_expired_report");
  99  |   const done = await (await db()).collection("interviewsessions").findOne({ _id: r2._id });
  100 |   expect(done.status).toBe("expired");
  101 |   // history page
  102 |   await page.goto(`${WEB}/candidate/interview/result`);
  103 |   await expect(page.getByText(/Round 1|Basic/i).first()).toBeVisible();
  104 |   await shot(page, "practice_history");
  105 |   const real = errors.filter((e) => !/status of 4\d\d/.test(e));
  106 |   expect(real, real.join(" | ")).toEqual([]);
  107 | });
  108 | 
  109 | test("Round 1 fail -> Round 2 locked card; expired-but-passing Round 1 vs Round 2 lock", async ({ page }, info) => {
  110 |   const u = await makeUser("candidate", "r1fail");
  111 |   await loginUI(page, u);
  112 |   await startRound(page, 1);
  113 |   for (let i = 1; i <= 5; i++) {
  114 |     await answer(page, `short weak answer number ${i} [raw=1]`);
  115 |     if (i < 5) await expect(page.getByText(`Question ${i + 1} of 5`).first()).toBeVisible({ timeout: 30000 });
  116 |   }
  117 |   await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  118 |   await expect(page.getByRole("heading", { name: "Round 2 unlocked" })).toHaveCount(0);
  119 |   await expect(page.getByRole("button", { name: /Retake Round 1/i }).or(page.getByRole("link", { name: /Retake Round 1/i })).first()).toBeVisible();
  120 |   await shot(page, "practice_r1_result_fail");
  121 |   await page.goto(`${WEB}/candidate/interview/advanced`);
  122 |   await expect(page.getByText(/Round 2 is locked/i).first()).toBeVisible();
  123 |   await shot(page, "practice_r2_locked");
  124 | 
  125 |   // Expired Round 1 with a passing score: backend allows Round 2, does the UI?
  126 |   const v = await makeUser("candidate", "r1expired");
  127 |   const s = await api("POST", "/api/interview/start", { token: v.token, body: { stage: "basic", track: "backend" } });
  128 |   for (let i = 0; i < 4; i++) await api("POST", "/api/interview/answer", { token: v.token, body: { sessionId: s.data.sessionId, answer: `good detailed answer with an example ${i} [raw=9]` } });
  129 |   await (await db()).collection("interviewsessions").updateOne({ _id: oid(s.data.sessionId) }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  130 |   let st: any;
  131 |   for (let i = 0; i < 40; i++) { st = await (await db()).collection("interviewsessions").findOne({ _id: oid(s.data.sessionId) }); if (st.status === "expired" && typeof st.score === "number") break; await page.waitForTimeout(2000); }
  132 |   const apiStart = await api("POST", "/api/interview/start", { token: v.token, body: { stage: "technical", track: "backend" } });
  133 |   await loginUI(page, v);
  134 |   await page.goto(`${WEB}/candidate/interview/advanced`);
  135 |   await page.waitForTimeout(2500);
  136 |   const uiLocked = await page.getByText(/Complete Round 1 first|Round 2 is locked/i).first().isVisible().catch(() => false);
  137 |   const p = await shot(page, "practice_r2_after_expired_r1");
  138 |   finding(info, { kind: "check", id: "expired-r1-unlock", r1Status: st.status, r1Score: st.score, apiTechnicalStart: apiStart.status, uiLocked, screenshot: p });
  139 | });
  140 | 
  141 | test("voice controls: Speak button when supported, text box only when not", async ({ page, context }) => {
  142 |   const u = await makeUser("candidate", "voice");
  143 |   await loginUI(page, u);
  144 |   await startRound(page, 1);
  145 |   const hasApi = await page.evaluate(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  146 |   if (hasApi) await expect(page.getByRole("button", { name: /Speak answer/i })).toBeVisible();
  147 |   await expect(page.locator("#interview-answer")).toBeVisible();
  148 |   const p2 = await context.newPage();
  149 |   await p2.addInitScript(() => { delete (window as any).webkitSpeechRecognition; delete (window as any).SpeechRecognition; });
  150 |   await p2.goto(`${WEB}/candidate/interview/basic`);
  151 |   await p2.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  152 |   await expect(p2.getByText(/Question \d+ of 5/).first()).toBeVisible({ timeout: 60000 });
  153 |   await expect(p2.locator("#interview-answer")).toBeVisible();
  154 |   await expect(p2.getByRole("button", { name: /Speak answer/i })).toHaveCount(0);
  155 |   await shot(p2, "practice_no_speech_api");
  156 | });
  157 | 
  158 | test("double-click submit records exactly one answer; API resubmit without questionNumber", async ({ page }, info) => {
  159 |   const u = await makeUser("candidate", "dbl");
  160 |   await loginUI(page, u);
  161 |   await startRound(page, 1);
  162 |   await page.locator("#interview-answer").fill("My double clicked answer text here [raw=6]");
  163 |   await page.getByRole("button", { name: /^submit answer$/i }).dblclick();
  164 |   await expect(page.getByText(/Question 2 of 5/).first()).toBeVisible({ timeout: 30000 });
  165 |   await page.waitForTimeout(1500);
  166 |   const sess = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id) });
  167 |   expect(sess.turns.length).toBe(1);
  168 |   const errVisible = await page.getByText(/already been answered/i).isVisible().catch(() => false);
  169 |   // API: same answer sent twice sequentially (e.g. client retry after a lost response)
  170 |   const a1 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]" } });
  171 |   const a2 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]" } });
  172 |   const a3 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]", questionNumber: 3 } });
  173 |   const a4 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]", questionNumber: 3 } });
  174 |   finding(info, { kind: "check", id: "double-submit", uiTurns: sess.turns.length, uiErrorShown: errVisible, retryWithoutQn: [a1.status, a2.status], retryWithQn: [a3.status, a4.status, a4.json.message] });
  175 | });
  176 | 
  177 | test("usage limit: 6th practice is locked with a message (free plan)", async ({ page }) => {
  178 |   const u = await makeUser("candidate", "limit");
  179 |   for (let i = 0; i < 5; i++) {
```