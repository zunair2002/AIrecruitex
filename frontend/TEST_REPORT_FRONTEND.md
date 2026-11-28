# Frontend Test Report: AIrecruitex

- **Frontend:** `frontend/`, branch `v2-aux-implementation` (Next.js 16.2.6, React 19.2)
- **Backend:** `C:\backend\Airecruitx-backend`, branch `premium-feature`
- **Date:** 2026-11-23
- **Scope:** testing only. No app code was changed, nothing was committed or pushed, and no `.env` values were printed.

## How it was tested

| Item | Setup |
|---|---|
| Static checks | `npm install`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Logs are in `tests/_out/`. |
| API contract | Every call in `src/lib/*Api.ts` was compared by hand with the backend routes, controllers and services. |
| E2E | Playwright 1.65 on Chromium with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`. Specs are in `tests/e2e/*.spec.ts` and the config is `playwright.e2e.config.ts`. |
| Backend test mode | `tests/e2e/support/stack.js` starts an in-memory MongoDB (mongodb-memory-server), `scripts/mock-ai.js`, and the backend on :5055 with dummy secrets. A preload stub (`tests/e2e/support/backend-stubs.js`) replaces **Cloudinary** (local file server), **nodemailer** (mailbox file `tests/e2e/.out/mailbox.jsonl`, which the tests read for the OTP and invite links), **Stripe** (in-memory checkout and subscriptions) and **firebase-admin**. |
| Frontend | `next dev --webpack` on :3100. The production build fails (BUG-01), so a prod server could not be used. Turbopack dev crashed the machine (BUG-27). |
| Evidence | Screenshots are in `tests/e2e/screenshots/` (149 files: every page at 1280px and 375px, plus each flow). Raw findings are in `tests/e2e/.out/findings.jsonl` and logs in `tests/e2e/.out/*.log`. |

Added dev dependency: `@playwright/test@1.65.0` (now in `package.json`).

---

## Summary

| | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| Static checks | 4 | 2 (install, tsc) | 2 (lint, **build**) | 0 |
| E2E test cases | 32 | 26 | 4 | 2 |
| **Total** | **36** | **28** | **6** | **2** |

A test can pass and still uncover a bug. Many of the bugs below were found inside passing tests, which record what the app actually did.

**Bugs found: 27.** Critical 2, High 6, Medium 10, Low 9. **API contract mismatches: 12.**

### E2E results per test

| Spec | Test | Result |
|---|---|---|
| 00-crawl | Public pages (12 routes × desktop/mobile): load, console, overflow | Pass |
| 00-crawl | Candidate pages (13 routes × 2) | Pass |
| 00-crawl | HR pages (10 routes × 2) | Pass |
| 00-crawl | Admin pages (10 routes × 2) | Pass |
| 10-candidate | Signup → OTP (wrong code, then correct) → profile gate → save → dashboard | Pass (BUG-20, BUG-21) |
| 10-candidate | Wrong password error, login, logout, protected route redirect | Pass |
| 10-candidate | Resume: bad type rejected, >5MB rejected, upload PDF, delete | Pass |
| 10-candidate | Job board → apply → My applications (match score shown) → notifications | Pass |
| 10-candidate | Support ticket + follow-up message | Pass |
| 20-practice | Round 1 full (intro first, closing last) → pass → "Round 2 unlocked" → Round 2 on selected track → reload/resume → timer expiry | **Fail (partial).** Everything up to and including the Round 2 start on the selected track was verified. The reload/timer part timed out on dev-server full reloads (env). |
| 20-practice | Round 1 fail → Round 2 locked card; Round 1 expired with a passing score | Pass (BUG-10) |
| 20-practice | Voice: "Speak answer" shown when supported; textarea only without the Speech API | Pass |
| 20-practice | Double-click submit records 1 answer; API retry without `questionNumber` | Pass (BUG-08) |
| 20-practice | Usage limit: 6th practice → 429, "0 of 5", upgrade CTA | Pass |
| 30-hr | Create job with JD upload → skills suggested | Pass (BUG-22, BUG-24) |
| 30-hr | Question pool upload `Data_Analyst_Question_Pool.docx` (20 Q, marks 5, 4 per interview) | Pass |
| 30-hr | Applicants + match score; status change; per-row invite (email with link); bulk invite with 1 ticked | Pass (**BUG-04 reproduced 3/3**) |
| 30-hr | Cancel invite; AI interview single + bulk | Pass via API only. **No UI exists** (BUG-05). |
| 30-hr | Proctored run 1: Start disabled until checkbox **and** camera; "Warm-up 1..3 of 3" + "not scored"; "Question 1 of 4"; tab-hidden → warning 1; blur → final warning; 3rd violation → cancelled screen; DB has 3 violations | Pass |
| 30-hr | Proctored run 2: reload mid-way → resume → complete → closing message | **Fail.** After the reload, the "already in progress" notice did not appear within 30s. It is not clear whether this is env or a real bug, so treat completion and the closing message as **not verified**. |
| 30-hr | Reports (AI report + org report "Introduction (not scored)", Q1/Q2 numbering); shortlisted | **Not run** (serial suite stopped after run 2 failed) |
| 30-hr | Courses CRUD + premium lock for free candidate | **Not run** (same reason) |
| 40-admin | Dashboard, users (plan change → premium, block → 403), activity logs, content, reports, monitoring | Pass (BUG-07) |
| 40-admin | Broadcast notification reaches candidate | Pass |
| 40-admin | Settings save + enforcement | Pass (BUG-09, BUG-14, BUG-23) |
| 40-admin | Support desk: reply, resolve, reopen | **Fail.** The reply works. After "Mark resolved" the view jumps to another ticket (BUG-18), and the test could not reach the Reopen button. |
| 40-admin | Billing: upgrade → checkout stub → premium → cancel → resume; pricing vs API | **Fail (env).** Dev `ChunkLoadError` and timeouts. The pricing comparison part ran (BUG-11). |
| 40-admin | Errors: 503 on start, 410 time-up, 409 on submit, backend down, 429 login | Pass (BUG-06, BUG-16) |
| 40-admin | Security: signup as admin; login submit without JS | Pass (**BUG-02, BUG-03 confirmed**) |
| 40-admin | A11y: unlabeled controls, img alt, h1, keyboard tab order | Pass (BUG-17, BUG-26) |
| 50-responsive | Home horizontal overflow source | Pass (BUG-13) |
| 50-responsive | Long-name profile/dashboard/billing/interview/applications at 375px | Pass (no overflow) |

---

## Step A: static checks

| Check | Result | Details |
|---|---|---|
| `npm install` | Pass | Warnings only: npm audit advisories, and 4 packages with install scripts that are not in `allowScripts` (`@firebase/util`, `protobufjs`, `sharp`, `unrs-resolver`). |
| `npx tsc --noEmit` | Pass | 0 errors |
| `npm run lint` | **Fail** | 24 problems: **21 errors**, 3 warnings (BUG-19). |
| `npm run build` | **Fail** | `useSearchParams() should be wrapped in a suspense boundary at page "/login/candidate"`, so the export fails (BUG-01). |

Lint detail:
- `react-hooks/refs` "Cannot access refs during render": 12 errors in `src/components/home/powerful-features/PowerfulFeatures.tsx` (lines 16, 18, 25, 27, 34, 36, 39, 43, 44, 45, 46, 50, 52) and 8 errors in `src/components/home/raas/RaaS.tsx` (lines 18, 20, 27, 29, 56, 58, 79, 81).
- Warning `no-unused-expressions` at `src/components/home/WhiteLabel.tsx:89`.
- Warning `exhaustive-deps` (missing `nextSlide`) at `src/components/home/product-showcase/useProductShowcaseCarousel.ts:32` and `src/components/home/white-label/useWhiteLabelCarousel.ts:23`.

---

## Bugs

Severity: **Critical** = blocks release or is a security hole. **High** = core flow broken or does the wrong thing. **Medium** = wrong behaviour that has a workaround. **Low** = polish.

| ID | Sev | Page / flow | Steps | Expected | Actual | Screenshot / evidence | File:line | Suggested fix (code not changed) |
|---|---|---|---|---|---|---|---|---|
| BUG-01 | **Critical** | Build (`/login/candidate`, `/login/recruiter`, `/register`) | `npm run build` | Build succeeds | Prerender error: `useSearchParams()` must be inside `<Suspense>`. Nothing can be deployed. | `tests/_out/build.log` | `src/components/auth/AuthCardParts.tsx:432` (used by `src/app/login/candidate/page.tsx:4` and `login/recruiter`) | Wrap `<CandidateAuthCard/>` / `<RecruiterAuthCard/>` in `<Suspense>` in each page, the same way `candidate/billing/page.tsx` does. Or read `next` from `window.location` inside an effect. |
| BUG-02 | **Critical** (backend) | Signup API | `POST /api/auth/signup {role:"admin"}` | Rejected (only candidate/hr can self-register) | **201, and the user is stored with role `admin`.** Anyone can become admin. | finding `signup-as-admin` | backend `src/shared/user/controller/auth.controller.ts:8` (`VALID_ROLES` includes admin), `:51` | Allow only `["candidate","hr"]` on signup. Create admins only from a seed script or admin panel. |
| BUG-03 | **High** (security) | Login / Create account / OTP forms | Submit the form before JS hydrates (slow network, failed chunk, JS blocked) | No credentials in the URL | Native GET to `/login/candidate?email=…&password=SuperSecret1`. The password ends up in the URL, browser history and server access logs (seen in `.out/next.log`). Reproduced with JS disabled, and in dev whenever a chunk failed. | `screenshots/login_no_js_submit.png` | `src/components/auth/AuthCardParts.tsx:375` (signup), `:464` (login); `src/components/auth/VerifyEmailForm.tsx:66` | Add `method="post"` (and `action=""`) to the forms, or disable the submit button until mounted. |
| BUG-04 | **High** | HR → Applicants → bulk "Invite to org interview" | Tick only applicant D (not the first in the list) and click the bulk Invite button | D gets the invite | Dialog says "E2E **appA**". **The first applicant in the list (A) is re-invited and D gets nothing.** Reproduced 3 out of 3 times. By the same logic, a per-row Invite while 2 or more rows are ticked acts on *all ticked rows* (code review, not E2E-confirmed). | `screenshots/hr_bulk_one_ticked.png` | `src/components/recruiter/applicants/ApplicantsList.tsx:413` (`application: filtered[0]`), `:163` (`selectedIds.size > 1`) | The bulk button should act on `selectedIds` whatever their count (`>= 1`). The row button should act only on its own application. Keep separate dialog states for "row" and "bulk". |
| BUG-05 | **High** | HR → Applicants: schedule AI interview (single + bulk) | Look for any control that schedules an AI interview | Single "Schedule AI interview" (date + message) and a bulk trigger | **No button anywhere** opens the dialog with `kind:"ai"`. Rows only offer "Invite to org interview". The `scheduleAiInterview` / `bulkTriggerAiInterview` code paths are dead. The API works (200/200). | finding `ai-interview-ui` (0 buttons) | `ApplicantsList.tsx:166-186` (dead branch); row actions around `:640-690` | Add a "Schedule AI interview" row button (`onSchedule("ai")`) and a bulk "Trigger AI interview" button. |
| BUG-06 | **High** | Any portal page when the backend is unreachable or returns 5xx | Logged-in candidate; stop the backend; reload `/candidate/dashboard` | A "Could not reach the server" message, still logged in | **Redirected to `/login/candidate` and the stored token is deleted.** Any outage or 5xx logs everyone out. | `screenshots/backend_down_candidate_dashboard.png` | `src/context/AuthContext.tsx:92-95` (`.catch(() => clearStoredToken())`) | Clear the token only on 401/403 (`apiErrorStatus(err)`). On status 0 or 5xx, keep the token and show a retry state. |
| BUG-07 | **Medium** | Deactivated user, fresh page load | Admin blocks the user; the user opens `/candidate/dashboard` | `/account-deactivated` screen | Lands on the normal login page with no explanation | `screenshots/blocked_user_view.png` | `src/context/AuthContext.tsx:92-95` together with `RequireAuth.tsx:50` | During restore, look at the error (403 "deactivated") and set `isDeactivated` before clearing the token, so `RequireAuth` routes to `/account-deactivated`. |
| BUG-08 | **Medium** | Practice + proctored interview answer submit | API retry of the same answer (e.g. a lost response followed by a retry) | 409 "already answered" | Both 200. **The retried text is saved as the answer to the *next* question.** The backend supports `questionNumber` for this, but the frontend never sends it. (UI double-click alone was OK: 1 turn.) | finding `double-submit` (`retryWithoutQn:[200,200]`, `withQn:[409,409]`) | `src/lib/interviewApi.ts` `submitAnswer`; `src/lib/applicationsApi.ts` `submitOrgInterviewAnswerByToken`; callers `InterviewRunner.tsx:125`, `OrgInterviewByToken.tsx:225` | Send `questionNumber: session.questionNumber` with each answer. |
| BUG-09 | **High** (backend) | Admin → Settings "Allow new sign-ups", "Max resume size" | Turn sign-ups off and set the resume limit to 1MB; then sign up / upload | Sign-up blocked; uploads above 1MB rejected | Sign-up still returns **201**. The upload limit is hard-coded to 5MB and never reads the setting. The UI even says "Stored for reference". | finding `settings-enforced`; `screenshots/admin_settings_saved.png` | backend `src/middleware/upload.middleware.ts:4` (`MAX_FILE_SIZE`), `auth.service.ts` signup (no `allowSignups` check); FE `src/lib/resumeApi.ts` `RESUME_MAX_BYTES` | Check `settings.allowSignups` in signup. Use `settings.maxResumeSizeMB` in the resume upload limit. Expose the limit to the frontend. |
| BUG-10 | **Medium** | Candidate → Technical interview (Round 2 lock) | Round 1 ends as `expired` with score 80 (≥ 50) | Round 2 unlocked (the backend allows it: start → 200) | UI shows "Complete Round 1 first" or locked | `screenshots/practice_r2_after_expired_r1.png` | `src/components/candidate/interview/PracticeInterview.tsx:164-166` (only `status === "completed"`); backend `interview.service.ts:187` accepts `completed` + `expired` | Accept `completed` or `expired` (as the backend does). Ideally take the unlock state from the API instead of recomputing it. |
| BUG-11 | **Medium** | `/pricing` | Compare with `GET /api/billing/plans` | Prices and plans come from the API (Free $0, Premium $29) | Prices are hard-coded. It shows a third plan **"Career+ $59/month"** that does not exist in the backend, and its CTA goes to billing, which only sells Premium. Free and Premium currently match by coincidence. | finding `pricing-vs-api`; `screenshots/public_desktop__pricing.png` | `src/components/home/pricingData.ts:40, 58-70` | Render candidate plans from `getBillingPlans()`. Remove Career+ or add it to the backend. |
| BUG-12 | **Medium** | Candidate → My profile → "Profile preview" Free-plan card (desktop) | Open `/candidate/profile` at 1280px | "Free plan" text and Upgrade button laid out cleanly | Text is crushed into a narrow column, almost one word per line ("Free / plan / Free / courses · / 5 / …"), beside the button. Fine at 375px. | `screenshots/cand_profile_gate_sidebar.png` | `src/components/candidate/profile/CandidateProfile.tsx:351` (`sm:flex-row` keys off the viewport, but the card is in a ~280px side column) | Always stack (`flex-col`), or switch only at `2xl`, or use a container query (`@container` / `@sm:flex-row`). Give the button `shrink-0`. |
| BUG-13 | **Medium** | Home `/` | Load at 375px and 1280px | No horizontal scroll | Page scrolls sideways: 34px on mobile, 18px on desktop. The contact form card starts at `x: 50` until it is scrolled into view. | finding `home-overflow-*`; `screenshots/public_mobile_home.png` | `src/components/home/contact/animationVariants.ts:14` (`fadeInRight hidden x:50`), used at `contact/Contact.tsx:39` | Add `overflow-x: clip` (`overflow-x-clip`) to the contact `<section>`, or animate opacity / y only. |
| BUG-14 | **Medium** | Admin → Settings → Save | Change the threshold and save | "Settings saved." shown | Saves correctly (API confirms 90) but **no success message appears**. The form remounts and loses its state. | finding `settings-saved-message: false` | `src/components/admin/SettingsForm.tsx:127` (`key={settings.data.updatedAt}`) with `:170` | Lift `success` state into the parent, or show a toast instead of local state. |
| BUG-15 | **Medium** (backend) | Candidate → Apply | Apply when the stored resume URL can't be fetched (storage 404 or outage) | A friendly error ("Couldn't read your resume, re-upload it") | Generic **500 "Internal server error"** shown on the job board | `.out/backend.log` (AxiosError 404 in `getResumeText`) | backend `src/candidate/applications/service/application.service.ts:35-38, 51` | Catch the fetch/parse error and throw an `AppError(…, 502/422)` with a clear message. |
| BUG-16 | **Medium** | Practice interview submit returns 409 | Answer was already recorded (another tab, or a retry) | UI refreshes to the current question | Shows "This question has already been answered" and **stays on the same question**. Every resubmit fails until a manual reload. | `screenshots/error_409_submit.png` | `src/components/candidate/interview/InterviewRunner.tsx:131-139` | On 409, re-fetch the session (`getInterviewReport`) and continue from the server's current question. |
| BUG-17 | **Medium** | Login → "Forgot password?" | Click it, or Tab from Email | A password reset flow | `href="#"` dead link (URL becomes `/login/candidate#`). It also sits between Email and Password in the tab order, so keyboard users land on it. No reset feature exists in the frontend or backend. | finding `a11y-keyboard` | `src/components/auth/AuthCardParts.tsx:489` | Implement reset (backend endpoint + page), or hide the link. If kept, place it after the password field in DOM order. |
| BUG-18 | **Low** | Admin → Support desk → Mark resolved | Resolve a ticket | Ticket stays selected, showing "Reopen" | The ticket leaves the Open tab and the panel **auto-selects another user's ticket**, so the next "Mark resolved" click would resolve the wrong ticket | `screenshots/admin_support_after_resolve.png` | `src/components/admin/SupportDesk.tsx` (selection after a status change) | Keep the resolved ticket selected (switch the tab, or show it under "All"). |
| BUG-19 | **Medium** | Lint / CI | `npm run lint` | 0 errors | 21 errors (`react-hooks/refs`) + 3 warnings | `tests/_out/lint.log` | `home/powerful-features/PowerfulFeatures.tsx:16-52`, `home/raas/RaaS.tsx:18-81` | Don't return refs inside the state object passed to JSX. Return the `ref` objects directly from the hooks, or destructure them before render. |
| BUG-20 | **Low** | Profile gate (new candidate) | Open any candidate page before the profile is complete | Sidebar items shown as locked | Gate works as a redirect back to the profile page, but sidebar links look normal and clickable (they just bounce back) | `screenshots/cand_profile_gate_sidebar.png` | `src/app/candidate/CandidateShell.tsx:57` / `CandidateSidebar.tsx` | Pass `profileComplete` to the sidebar and render the items as disabled with a lock icon and tooltip. |
| BUG-21 | **Low** | Profile → Interests field | Type an interest and press Enter | Adds a chip | Submits the whole profile form and navigates away | finding `interests-enter-submits` | `src/components/candidate/profile/CandidateProfile.tsx:149` (form), interests input around `:259` | `onKeyDown` Enter → `preventDefault()` + add chip. |
| BUG-22 | **Low** | HR → Create job | Open the page and submit | No console errors | React warning: "Can't perform a React state update on a component that hasn't mounted yet" | finding `create-job-console` | `src/components/recruiter/CreateJobForm.tsx` | Move the async state update out of render or into `useEffect`. |
| BUG-23 | **Medium** (backend) | Admin settings API | `PATCH /api/admin/settings {matchThreshold:-5, maxResumeSizeMB:"abc"}` | 400 validation error | **500 Internal server error** (and no range check on valid numbers) | finding `settings-enforced.invalidSettingsPatch` | backend `src/admin/settings/service/settings.service.ts:21-35`, controller `:12` | Validate types and ranges (threshold 0-100, size 1-20, boolean) and return 400. |
| BUG-24 | **Low** (backend) | HR → Create job with JD, skills left empty | JD lists SQL, Python, Excel, Tableau, Power BI, Statistics | All listed skills suggested | Only `["python","sql"]` | finding `jd-skill-suggestions` | backend `src/data/skills.ts` (no excel/tableau/power bi) | Extend the skills dictionary. Consider showing the suggestions in the UI before submit. |
| BUG-25 | **Low** | Practice / proctored UI | Change `ROUND2_UNLOCK_SCORE` (or the max violations) in the backend env | UI follows | UI hard-codes 50 and 3, so the copy and lock state drift from the backend | n/a | `PracticeInterview.tsx:75`, `OrgInterviewByToken.tsx:60`, `InterviewRunner.tsx:47` | Expose thresholds through an API (e.g. `/api/interview/usage` or `/tracks`) and read them from there. |
| BUG-26 | **Low** (a11y) | `/contact` | Inspect headings | One `<h1>` | No `<h1>` on the page. All other audited pages have one. | finding `a11y` | `src/app/contact/page.tsx` / `components/home/contact/Contact.tsx` | Make the page title an `<h1>`. |
| BUG-27 | **Low** (dev env) | `next dev` (Turbopack) on this Windows machine | Start the dev server and browse pages | Normal memory use | Spawned **360+ `postcss.js` worker processes**, used ~11GB RAM, and crashed with OOM twice. `--webpack` was stable. | `.out/next.log` (FATAL heap OOM) | `next.config.ts` (turbopack) | Report upstream or pin Next. Meanwhile use `next dev --webpack` on Windows. |

### Positive results (worked correctly)
- Every page loads for each role at both 1280px and 375px with no console errors (apart from the expected 404 page). No overflow on any portal page, including long names at 375px.
- OTP: a wrong code shows an error and the correct code logs in. Resume validation works (type, >5MB, upload, delete). Apply works, a duplicate apply is rejected, and the match score is shown to the candidate.
- Practice Round 1: intro is the first question and closing is the last (checked against the bank `slot`). "Round 2 unlocked" appears and Round 2 uses the selected track (`data_ai`). The "Round 2 locked" card appears after a failed Round 1.
- Usage limit: the 6th start returns 429 and the UI shows "0 of 5" with an Upgrade CTA. The 503 message is shown. A 410 switches to "Time's up" and the button reads "Time expired". A 429 on login shows "Too many requests…". Backend down on the login page shows "Could not reach the server…".
- Proctored run 1: Start stays disabled until **both** the checkbox and the camera are on. "Warm-up n of 3" with the "Warm-up · not scored" badge, then "Question 1 of 4". Warning 1, then the final warning, then the 3rd violation cancels (DB: 3 violations, status `cancelled`).
- Question pool parsing of the real `Data_Analyst_Question_Pool.docx`: 20 questions, 5 marks each, 4 per interview.
- Admin plan change → `/me` shows premium. Block → 403. Broadcast reaches the candidate. Support reply reaches the candidate.

---

## API contract mismatches (frontend `src/lib/*Api.ts` vs backend)

All 70+ method/path pairs exist on the backend (no missing endpoint). The mismatches are listed below.

| # | Endpoint | Frontend | Backend | Impact |
|---|---|---|---|---|
| C1 | `POST /api/interview/answer` | Sends `{sessionId, answer}` | Optional `questionNumber` (409 on mismatch) | A retry is recorded as the next question's answer (BUG-08) |
| C2 | `POST /api/applications/org-interview/:token/answer` | Sends `{answer}` | Optional `questionNumber` | Same as C1, in the proctored interview |
| C3 | `POST /api/auth/signup` | Offers roles `candidate`, `hr` | Accepts `admin` too | Privilege escalation (BUG-02) |
| C4 | `GET /api/billing/plans` | `/pricing` never calls it (hard-coded data, plus a "Career+" plan) | Returns Free + Premium only | Prices and plans can drift (BUG-11) |
| C5 | Round 2 unlock rule | Counts Round 1 `completed` only | Counts `completed` or `expired` | UI shows locked while the API allows it (BUG-10) |
| C6 | `PATCH /api/admin/settings` | Sends `Number(...)` values (may be `NaN` or 0) | No validation; a bad type gives 500 | BUG-23 |
| C7 | Settings `allowSignups`, `maxResumeSizeMB` | Edited in the admin UI; resume limit hard-coded to 5MB on the client | Stored but never enforced | BUG-09 |
| C8 | `POST /api/applications/:id/ai-interview`, `/bulk/ai-interview` | Client functions exist, no UI calls them | Working (200) | Feature unreachable (BUG-05) |
| C9 | `POST /api/applications/org-interview/:token/cancel` (`cancelOrgInterviewByToken`), `POST /api/ai/evaluate` (`evaluateAnswer`) | Defined, never used | Exist | Dead client code |
| C10 | Session view `turns[].kind` | `InterviewTurnView` has no `kind` | Sent (`warmup`/`pool`) | Type gap only |
| C11 | In-progress session `level` (`easy/medium/hard/general`) | Not in `InterviewSessionInProgress` | Sent | Type gap; the difficulty badge can't be typed |
| C12 | `POST /api/interview/start` `basicSessionId`, `level` | Not sent | Optional | OK (backend uses the latest Round 1), listed for completeness |

Checked and matching: auth (signup/verify/resend/login/google/me/profile multipart fields `headline, about, interests(JSON), avatar, removeAvatar`/logout), resume (`resume` field, response shape), jobs (`jd` field, comma-separated `requiredSkills`), question pool (`questionsFile`, `questionsPerInterview`), applications (candidate + HR + bulk + org invite/cancel, `validityDays`, `reason`), invite-by-token (GET/start/violation shape `{status, violationCount, maxViolations, cancelled, cancelReason}`), interview (tracks/start/answer/report/mine `type`/usage), billing (subscription/checkout/confirm/cancel/resume/payments), certificate (checkout/confirm `{paid}`/generate/get `{certificateUrl, certId, score}`), learning (candidate list with `tier`/`locked`, HR CRUD, delete `{deleted}`), notifications, support (tickets, messages `{body}`), and all admin endpoints (dashboard, reports, monitoring, users active/role/plan/delete, activity-logs filters, content, broadcast `{recipientCount}`, settings, support resolve `{adminReply}`/reopen).

---

## Not tested

| Area | Reason |
|---|---|
| HR interview reports (AI report + org report "Introduction (not scored)", Q1/Q2 pool numbering) and Shortlisted page | **Not tested.** The serial suite stopped before this test. Code review: `InterviewReportCard.tsx:507` renders "Introduction (not scored)" and `:547` uses `poolQuestionNumber`. Not verified in a browser. |
| HR courses CRUD + candidate premium-course lock | **Not tested** (same reason). The backend locks premium courses for free users (`learning.service.ts:25-28`). |
| Proctored run 2 to completion + closing message; reload-resume of the proctored interview | **Not tested** end to end (failed after reload; env vs app unclear) |
| Practice: page reload → resume, and timer countdown → server expiry → report | **Not tested** end to end (dev-server full reloads broke the step). The 410 → "Time's up" UI path was verified with a mocked 410. |
| Billing: upgrade → checkout redirect → Premium → cancel → resume | **Not tested** (dev `ChunkLoadError` / timeouts on both attempts) |
| Support desk Reopen | **Not tested** (blocked by BUG-18 behaviour plus selector). Reply works. |
| Google sign-in | Not tested. Firebase was stubbed; no real Google account in tests. |
| Real Stripe hosted checkout and webhooks (`/api/billing/webhook`) | Not tested. Stripe was stubbed in memory. |
| Certificate purchase / PDF generation | Not tested (not in scope list; Stripe/Cloudinary stubbed) |
| Real speech recognition / text-to-speech | Not tested. Headless Chromium; only the presence of the controls and the text fallback were checked. |
| Fullscreen-exit violation specifically | Not tested. Headless Chromium may not enter fullscreen; the 3rd violation was sent as a blur instead. |
| Socket.io realtime toasts | Not tested explicitly |
| Production build behaviour | Not tested. The build fails (BUG-01), so all E2E ran on `next dev --webpack`. Dev-mode flakiness caused the env failures above. |
| Colour contrast | Not tested with a tool (no axe/Lighthouse run). Only labels, alt text, headings and keyboard order were checked. |
| Safari / Firefox / real mobile devices | Not tested. Chromium only, with 375px emulation. |

## Files added (tests only)
- `playwright.e2e.config.ts`
- `tests/e2e/00-crawl.spec.ts`, `10-candidate-core.spec.ts`, `20-practice.spec.ts`, `30-hr-org.spec.ts`, `40-admin-billing-errors.spec.ts`, `50-responsive.spec.ts`
- `tests/e2e/support/stack.js`, `backend-stubs.js`, `helpers.ts`
- `tests/e2e/fixtures/` (resume.pdf, jd.pdf, bad.txt, big.pdf, a copy of Data_Analyst_Question_Pool.docx)
- `tests/e2e/screenshots/`, `tests/e2e/.out/` (logs, findings), `tests/_out/` (static check logs)

To re-run: `node tests/e2e/support/stack.js` (wait for `READY`), then `npx playwright test -c playwright.e2e.config.ts`.
