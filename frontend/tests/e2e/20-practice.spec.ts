import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { WEB, api, db, oid, makeUser, loginUI, watchConsole, shot, finding } from "./support/helpers";

const STACK = JSON.parse(fs.readFileSync(path.join(__dirname, ".stack.json"), "utf8"));
const BANK: any[] = JSON.parse(fs.readFileSync(path.join(STACK.backendDir, "src", "ai", "practice_questions.json"), "utf8"));
const norm = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slotOf = (q: string) => BANK.find((b) => norm(b.question) === norm(q))?.slot;

async function progress(page: Page) {
  const t = await page.getByText(/Question \d+ of \d+/).first().innerText();
  const m = t.match(/Question (\d+) of (\d+)/)!;
  return { n: Number(m[1]), total: Number(m[2]), label: t };
}
async function currentQuestion(page: Page) {
  // QuestionCard: eyebrow "Interviewer · Question n" followed by the question text
  const card = page.locator("section, div").filter({ hasText: /^Interviewer · Question/ }).first();
  const txt = await card.innerText();
  return txt.replace(/^Interviewer · Question \d+.*\n?/, "").trim();
}
async function answer(page: Page, text: string) {
  await page.locator("#interview-answer").fill(text);
  await page.getByRole("button", { name: /^submit answer$/i }).click();
}
async function startRound(page: Page, round: 1 | 2, trackLabel?: RegExp) {
  await page.goto(`${WEB}/candidate/interview/${round === 1 ? "basic" : "advanced"}`);
  if (trackLabel) await page.getByRole("button", { name: trackLabel }).first().click();
  await page.getByRole("button", { name: new RegExp(`Start Round ${round}|Resume`, "i") }).last().click();
  await expect(page.getByText(/Question \d+ of \d+/).first()).toBeVisible({ timeout: 60000 });
}

test("Round 1 full: intro first, closing last, pass -> Round 2 unlocked; Round 2 on selected track", async ({ page }, info) => {
  const errors = watchConsole(page);
  const u = await makeUser("candidate", "r1pass");
  await loginUI(page, u);
  await startRound(page, 1, /Data \/ AI Engineer/i);
  await shot(page, "practice_r1_q1");
  const qs: string[] = [];
  let p = await progress(page);
  expect(p.total).toBe(5);
  while (true) {
    p = await progress(page);
    const q = await page.locator("main").innerText();
    const sess = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id), stage: "basic" }, { sort: { createdAt: -1 } });
    qs.push(sess.currentQuestion);
    expect(q).toContain(sess.currentQuestion.slice(0, 40));
    await answer(page, `For question ${p.n} I would explain the main idea clearly with a concrete example from my project [raw=8]`);
    if (p.n === p.total) break;
    await expect(page.getByText(`Question ${p.n + 1} of ${p.total}`).first()).toBeVisible({ timeout: 30000 });
  }
  expect(slotOf(qs[0])).toBe("intro");
  expect(slotOf(qs[qs.length - 1])).toBe("closing");
  await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  await expect(page.getByRole("heading", { name: "Round 2 unlocked" })).toBeVisible();
  await shot(page, "practice_r1_result_pass");
  // score rendering sanity: "Overall score: N%" with 0..100
  const scoreTxt = await page.getByText(/Overall score: \d+/).first().innerText();
  const score = Number(scoreTxt.match(/(\d+(\.\d+)?)/)![1]);
  expect(score).toBeGreaterThanOrEqual(50);
  expect(score).toBeLessThanOrEqual(100);

  await page.getByRole("link", { name: /Start Round 2/i }).click();
  await page.waitForURL(/interview\/advanced/);
  await expect(page.getByText(/Data \/ AI Engineer/).first()).toBeVisible();
  await page.getByRole("button", { name: /Start Round 2/i }).last().click();
  await expect(page.getByText(/Round 2 · Data \/ AI · Question 1 of 8/)).toBeVisible({ timeout: 60000 });
  const r2 = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id), stage: "technical" });
  expect(r2.track).toBe("data_ai");
  await shot(page, "practice_r2_q1");

  // answer one, then reload -> resume at Q2 (no allowance used)
  await answer(page, "Normalization removes redundancy in tables [raw=7]");
  await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  const usageBefore = (await api("GET", "/api/interview/usage", { token: u.token })).data.used;
  await page.reload();
  await shot(page, "practice_r2_after_reload");
  const resumeBtn = page.getByRole("button", { name: /Resume|Start Round 2/i }).last();
  await expect(resumeBtn).toBeVisible({ timeout: 90000 });
  const btnLabel = await resumeBtn.innerText();
  await resumeBtn.click();
  await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  const usageAfter = (await api("GET", "/api/interview/usage", { token: u.token })).data.used;
  expect(usageAfter).toBe(usageBefore);
  if (!/resume/i.test(btnLabel)) finding(info, { kind: "observation", id: "reload-resume-label", detail: `After reload the button says "${btnLabel}" instead of Resume; in-progress session is resumed only after clicking Start` });

  // timer: force expiry in 6s, reload, resume -> countdown -> time-up -> server finalises (sweep every 30s)
  await (await db()).collection("interviewsessions").updateOne({ _id: r2._id }, { $set: { expiresAt: new Date(Date.now() + 8000) } });
  await page.reload();
  await page.getByRole("button", { name: /Resume|Start Round 2/i }).last().click();
  await expect(page.getByText(/Question 2 of 8/).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("timer").or(page.getByText(/\b0?0:0\d\b/)).first()).toBeVisible();
  await shot(page, "practice_timer_running");
  await expect(page.getByText(/Time's up/i)).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: /Time expired/i })).toBeDisabled();
  await shot(page, "practice_time_up");
  await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  await shot(page, "practice_r2_expired_report");
  const done = await (await db()).collection("interviewsessions").findOne({ _id: r2._id });
  expect(done.status).toBe("expired");
  // history page
  await page.goto(`${WEB}/candidate/interview/result`);
  await expect(page.getByText(/Round 1|Basic/i).first()).toBeVisible();
  await shot(page, "practice_history");
  const real = errors.filter((e) => !/status of 4\d\d/.test(e));
  expect(real, real.join(" | ")).toEqual([]);
});

test("Round 1 fail -> Round 2 locked card; expired-but-passing Round 1 vs Round 2 lock", async ({ page }, info) => {
  const u = await makeUser("candidate", "r1fail");
  await loginUI(page, u);
  await startRound(page, 1);
  for (let i = 1; i <= 5; i++) {
    await answer(page, `short weak answer number ${i} [raw=1]`);
    if (i < 5) await expect(page.getByText(`Question ${i + 1} of 5`).first()).toBeVisible({ timeout: 30000 });
  }
  await expect(page.getByText(/Interview report/i).first()).toBeVisible({ timeout: 90000 });
  await expect(page.getByRole("heading", { name: "Round 2 unlocked" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Retake Round 1/i }).or(page.getByRole("link", { name: /Retake Round 1/i })).first()).toBeVisible();
  await shot(page, "practice_r1_result_fail");
  await page.goto(`${WEB}/candidate/interview/advanced`);
  await expect(page.getByText(/Round 2 is locked/i).first()).toBeVisible();
  await shot(page, "practice_r2_locked");

  // Expired Round 1 with a passing score: backend allows Round 2, does the UI?
  const v = await makeUser("candidate", "r1expired");
  const s = await api("POST", "/api/interview/start", { token: v.token, body: { stage: "basic", track: "backend" } });
  for (let i = 0; i < 4; i++) await api("POST", "/api/interview/answer", { token: v.token, body: { sessionId: s.data.sessionId, answer: `good detailed answer with an example ${i} [raw=9]` } });
  await (await db()).collection("interviewsessions").updateOne({ _id: oid(s.data.sessionId) }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  let st: any;
  for (let i = 0; i < 40; i++) { st = await (await db()).collection("interviewsessions").findOne({ _id: oid(s.data.sessionId) }); if (st.status === "expired" && typeof st.score === "number") break; await page.waitForTimeout(2000); }
  const apiStart = await api("POST", "/api/interview/start", { token: v.token, body: { stage: "technical", track: "backend" } });
  await loginUI(page, v);
  await page.goto(`${WEB}/candidate/interview/advanced`);
  await page.waitForTimeout(2500);
  const uiLocked = await page.getByText(/Complete Round 1 first|Round 2 is locked/i).first().isVisible().catch(() => false);
  const p = await shot(page, "practice_r2_after_expired_r1");
  finding(info, { kind: "check", id: "expired-r1-unlock", r1Status: st.status, r1Score: st.score, apiTechnicalStart: apiStart.status, uiLocked, screenshot: p });
});

test("voice controls: Speak button when supported, text box only when not", async ({ page, context }) => {
  const u = await makeUser("candidate", "voice");
  await loginUI(page, u);
  await startRound(page, 1);
  const hasApi = await page.evaluate(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  if (hasApi) await expect(page.getByRole("button", { name: /Speak answer/i })).toBeVisible();
  await expect(page.locator("#interview-answer")).toBeVisible();
  const p2 = await context.newPage();
  await p2.addInitScript(() => { delete (window as any).webkitSpeechRecognition; delete (window as any).SpeechRecognition; });
  await p2.goto(`${WEB}/candidate/interview/basic`);
  await p2.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  await expect(p2.getByText(/Question \d+ of 5/).first()).toBeVisible({ timeout: 60000 });
  await expect(p2.locator("#interview-answer")).toBeVisible();
  await expect(p2.getByRole("button", { name: /Speak answer/i })).toHaveCount(0);
  await shot(p2, "practice_no_speech_api");
});

test("double-click submit records exactly one answer; API resubmit without questionNumber", async ({ page }, info) => {
  const u = await makeUser("candidate", "dbl");
  await loginUI(page, u);
  await startRound(page, 1);
  await page.locator("#interview-answer").fill("My double clicked answer text here [raw=6]");
  await page.getByRole("button", { name: /^submit answer$/i }).dblclick();
  await expect(page.getByText(/Question 2 of 5/).first()).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(1500);
  const sess = await (await db()).collection("interviewsessions").findOne({ userId: oid(u.id) });
  expect(sess.turns.length).toBe(1);
  const errVisible = await page.getByText(/already been answered/i).isVisible().catch(() => false);
  // API: same answer sent twice sequentially (e.g. client retry after a lost response)
  const a1 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]" } });
  const a2 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]" } });
  const a3 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]", questionNumber: 3 } });
  const a4 = await api("POST", "/api/interview/answer", { token: u.token, body: { sessionId: String(sess._id), answer: "retry text [raw=5]", questionNumber: 3 } });
  finding(info, { kind: "check", id: "double-submit", uiTurns: sess.turns.length, uiErrorShown: errVisible, retryWithoutQn: [a1.status, a2.status], retryWithQn: [a3.status, a4.status, a4.json.message] });
});

test("usage limit: 6th practice is locked with a message (free plan)", async ({ page }) => {
  const u = await makeUser("candidate", "limit");
  for (let i = 0; i < 5; i++) {
    const s = await api("POST", "/api/interview/start", { token: u.token, body: { stage: "basic", track: "frontend" } });
    expect(s.status).toBe(200);
    // finish it so the next start is a new session
    await (await db()).collection("interviewsessions").updateOne({ _id: oid(s.data.sessionId) }, { $set: { status: "completed", score: 10, result: "fail" } });
  }
  const sixth = await api("POST", "/api/interview/start", { token: u.token, body: { stage: "basic", track: "frontend" } });
  expect(sixth.status).toBe(429);
  await loginUI(page, u);
  await page.goto(`${WEB}/candidate/interview/basic`);
  await expect(page.getByText(/0 of 5/).first()).toBeVisible();
  await expect(page.getByText(/limit|used all|practise again|try again/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Upgrade to Premium/i }).first()).toBeVisible();
  await shot(page, "practice_limit_reached");
  const start = page.getByRole("button", { name: /Start Round 1/i });
  if (await start.count()) await expect(start.last()).toBeDisabled();
});
