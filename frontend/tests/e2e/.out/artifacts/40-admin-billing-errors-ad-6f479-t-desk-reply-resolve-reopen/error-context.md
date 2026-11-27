# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 40-admin-billing-errors.spec.ts >> admin: support desk reply, resolve, reopen
- Location: tests\e2e\40-admin-billing-errors.spec.ts:104:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Mark resolved' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Mark resolved' }) with timeout 15000ms
  - waiting for getByRole('button', { name: 'Mark resolved' })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- complementary:
  - link "AiRecruitex Admin Portal":
    - /url: /admin/dashboard
    - text: Admin Portal
  - navigation "Admin Portal navigation":
    - list:
      - listitem:
        - link "Overview":
          - /url: /admin/dashboard
    - button "Platform" [expanded]
    - list:
      - listitem:
        - link "User management":
          - /url: /admin/users
      - listitem:
        - link "Jobs & applications":
          - /url: /admin/content
    - button "Insight" [expanded]
    - list:
      - listitem:
        - link "Reports":
          - /url: /admin/reports
      - listitem:
        - link "Activity log":
          - /url: /admin/activity-logs
      - listitem:
        - link "Monitoring":
          - /url: /admin/monitoring
    - button "General" [expanded]
    - list:
      - listitem:
        - link "Support desk":
          - /url: /admin/support
      - listitem:
        - link "Broadcast":
          - /url: /admin/notifications
      - listitem:
        - link "Settings":
          - /url: /admin/settings
  - button "Live updates connected E2E admsd e2e-admsd-1795384835349-6@example.com": E2E admsd e2e-admsd-1795384835349-6@example.com
- main:
  - heading "Support desk" [level=1]
  - paragraph: 2 open tickets. Chat with users live; they're notified of every reply.
  - tablist "Ticket status":
    - tab "Open 2"
    - tab "Resolved 3" [selected]
    - tab "All tickets 5"
  - tabpanel "Resolved 3":
    - list:
      - listitem:
        - 'button "Billing question Resolved E2E sdcand · Candidate Admin: No, only once. 02:45 AM"':
          - paragraph: Billing question
          - text: Resolved
          - paragraph: E2E sdcand · Candidate
          - paragraph: "Admin: No, only once."
          - text: 02:45 AM
      - listitem:
        - 'button "Billing question Resolved E2E sdcand · Candidate Admin: No, only once. 02:32 AM"':
          - paragraph: Billing question
          - text: Resolved
          - paragraph: E2E sdcand · Candidate
          - paragraph: "Admin: No, only once."
          - text: 02:32 AM
      - listitem:
        - 'button "Billing question Resolved E2E sdcand · Candidate Admin: No, only once. 02:30 AM"':
          - paragraph: Billing question
          - text: Resolved
          - paragraph: E2E sdcand · Candidate
          - paragraph: "Admin: No, only once."
          - text: 02:30 AM
    - 'region "Support ticket: Billing question"':
      - heading "Billing question" [level=2]
      - text: Resolved
      - paragraph: E2E sdcand · e2e-sdcand-1795383902750-1@example.com · Opened Nov 23, 2026, 02:45 AM
      - button "Reopen"
      - log "Conversation":
        - paragraph: E2E sdcand
        - text: Was I charged twice?
        - time: 02:45 AM
        - paragraph: E2E admsd · Support team
        - text: No, only once.
        - time: 02:45 AM
      - text: Message
      - textbox "Message":
        - /placeholder: Write a message…
      - button "Send" [disabled]
      - paragraph: Enter to send · Shift + Enter for a new line
- alert: Support desk
```

# Test source

```ts
  23  |   await page.getByRole("dialog").getByRole("button", { name: /save/i }).click();
  24  |   await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15000 });
  25  |   const me = await api("GET", "/api/auth/me", { token: victim.token });
  26  |   expect(me.data.plan).toBe("premium");
  27  |   // block (deactivate)
  28  |   await page.getByRole("switch", { name: new RegExp(`Deactivate ${victim.name}`) }).or(page.getByLabel(new RegExp(`Deactivate ${victim.name}`))).first().click();
  29  |   await page.waitForTimeout(1500);
  30  |   const blocked = await api("GET", "/api/auth/me", { token: victim.token });
  31  |   expect(blocked.status).toBe(403);
  32  |   await shot(page, "admin_users_after_block");
  33  | 
  34  |   // blocked user's open session -> deactivated screen
  35  |   const ctx = await page.context().browser()!.newContext();
  36  |   const vp = await ctx.newPage();
  37  |   await vp.goto(`${WEB}/login/candidate`);
  38  |   await waitHydrated(vp);
  39  |   await vp.evaluate((t) => localStorage.setItem("airecruitx_token", t), victim.token);
  40  |   await vp.goto(`${WEB}/candidate/dashboard`);
  41  |   await vp.waitForTimeout(4000);
  42  |   finding(info, { kind: "check", id: "blocked-user-screen", url: vp.url(), screenshot: await shot(vp, "blocked_user_view") });
  43  |   await ctx.close();
  44  | 
  45  |   await page.goto(`${WEB}/admin/activity-logs`);
  46  |   await expect(page.getByText(/plan|active|user/i).first()).toBeVisible();
  47  |   await shot(page, "admin_activity_logs");
  48  |   await page.goto(`${WEB}/admin/content`);
  49  |   await shot(page, "admin_content");
  50  |   await page.goto(`${WEB}/admin/reports`);
  51  |   await shot(page, "admin_reports");
  52  |   await page.goto(`${WEB}/admin/monitoring`);
  53  |   await expect(page.getByText(/uptime|database|connected/i).first()).toBeVisible();
  54  |   await shot(page, "admin_monitoring");
  55  |   expect(errors.filter((e) => !/status of 4/.test(e))).toEqual([]);
  56  | });
  57  | 
  58  | test("admin: broadcast notification reaches candidate", async ({ page }) => {
  59  |   const admin = await makeUser("admin", "admb");
  60  |   const cand = await makeUser("candidate", "bcast");
  61  |   await loginUI(page, admin);
  62  |   await page.goto(`${WEB}/admin/notifications`);
  63  |   const msg = `Maintenance tonight ${Date.now()}`;
  64  |   const role = page.locator("#broadcast-role");
  65  |   if (await role.isVisible().catch(() => false)) await role.selectOption("candidate");
  66  |   await page.locator("#broadcast-message").fill(msg);
  67  |   await page.getByRole("button", { name: /send notification/i }).click();
  68  |   await expect(page.getByText(/sent|recipient/i).first()).toBeVisible({ timeout: 15000 });
  69  |   await shot(page, "admin_broadcast");
  70  |   const n = await api("GET", "/api/notifications/mine", { token: cand.token });
  71  |   expect(n.data.some((x: any) => x.message === msg)).toBe(true);
  72  | });
  73  | 
  74  | test("admin: settings save + are they enforced (signups, resume size, match threshold)", async ({ page }, info) => {
  75  |   const admin = await makeUser("admin", "adms");
  76  |   await loginUI(page, admin);
  77  |   await page.goto(`${WEB}/admin/settings`);
  78  |   await page.locator("#settings-threshold").fill("90");
  79  |   await page.locator("#settings-resume-size").fill("1");
  80  |   const signups = page.locator("#settings-allow-signups");
  81  |   if ((await signups.getAttribute("aria-checked")) !== "false") await signups.click();
  82  |   await page.getByRole("button", { name: /save settings/i }).click();
  83  |   await page.waitForTimeout(3000);
  84  |   finding(info, { kind: "check", id: "settings-saved-message", visible: await page.getByText("Settings saved.").isVisible().catch(() => false), screenshot: await shot(page, "admin_settings_saved") });
  85  |   const s = await api("GET", "/api/admin/settings", { token: admin.token });
  86  |   expect(s.data.matchThreshold).toBe(90);
  87  |   // enforcement
  88  |   const signup = await api("POST", "/api/auth/signup", { body: { name: "x", email: `blocked-${Date.now()}@example.com`, password: "Passw0rd!", role: "candidate" } });
  89  |   const c = await makeUser("candidate", "size").catch(() => null);
  90  |   let resumeStatus = -1;
  91  |   if (c) {
  92  |     const fd = new FormData();
  93  |     const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(2 * 1024 * 1024, 32)]);
  94  |     fd.append("resume", new Blob([pdf], { type: "application/pdf" }), "two-mb.pdf");
  95  |     resumeStatus = (await api("POST", "/api/resume/upload", { token: c.token, form: fd })).status;
  96  |   }
  97  |   // invalid values
  98  |   const bad = await api("PATCH", "/api/admin/settings", { token: admin.token, body: { matchThreshold: -5, maxResumeSizeMB: "abc" } });
  99  |   finding(info, { kind: "check", id: "settings-enforced", signupWhileDisabled: signup.status, resumeUpload2MBWithLimit1MB: resumeStatus, invalidSettingsPatch: [bad.status, bad.json.message] });
  100 |   // restore
  101 |   await api("PATCH", "/api/admin/settings", { token: admin.token, body: { matchThreshold: 50, maxResumeSizeMB: 5, allowSignups: true } });
  102 | });
  103 | 
  104 | test("admin: support desk reply, resolve, reopen", async ({ page }) => {
  105 |   const admin = await makeUser("admin", "admsd");
  106 |   const cand = await makeUser("candidate", "sdcand");
  107 |   const t = await api("POST", "/api/support/tickets", { token: cand.token, body: { subject: "Billing question", message: "Was I charged twice?" } });
  108 |   expect(t.status).toBe(201);
  109 |   await loginUI(page, admin);
  110 |   await page.goto(`${WEB}/admin/support`);
  111 |   await page.getByText("Billing question").first().click();
  112 |   await page.locator(`#support-composer-${t.data._id}`).fill("No, only once.");
  113 |   await page.getByRole("button", { name: /send|reply/i }).last().click();
  114 |   await expect(page.getByText("No, only once.").first()).toBeVisible({ timeout: 15000 });
  115 |   await page.getByRole("button", { name: "Mark resolved" }).click();
  116 |   await page.waitForTimeout(2000);
  117 |   await shot(page, "admin_support_after_resolve");
  118 |   await page.getByRole("tab", { name: /Resolved/ }).or(page.getByRole("button", { name: /^Resolved/ })).first().click();
  119 |   await page.getByText("Billing question").first().click();
  120 |   await expect(page.getByRole("button", { name: "Reopen" })).toBeVisible({ timeout: 15000 });
  121 |   await shot(page, "admin_support_resolved");
  122 |   await page.getByRole("button", { name: "Reopen" }).click();
> 123 |   await expect(page.getByRole("button", { name: "Mark resolved" })).toBeVisible({ timeout: 15000 });
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  124 |   const mine = await api("GET", `/api/support/tickets/${t.data._id}`, { token: cand.token });
  125 |   expect(mine.data.messages.some((m: any) => m.body === "No, only once.")).toBe(true);
  126 |   expect(mine.data.status).toBe("open");
  127 | });
  128 | 
  129 | /* --------------------------------------------------------------- billing */
  130 | 
  131 | test("billing: plan card, upgrade -> checkout redirect stub -> premium, cancel, resume; pricing matches /api/billing/plans", async ({ page }, info) => {
  132 |   const plans = (await api("GET", "/api/billing/plans")).data.plans;
  133 |   const premium = plans.find((p: any) => p.id === "premium");
  134 |   await page.goto(`${WEB}/pricing`);
  135 |   const pricing = await page.locator("main, body").first().innerText();
  136 |   finding(info, { kind: "check", id: "pricing-vs-api", apiPlans: plans.map((p: any) => `${p.name}=${p.priceCents}`), pricingShowsPremium: pricing.includes(`$${premium.priceCents / 100}`), pricingHasCareerPlus: /Career\+/.test(pricing) });
  137 | 
  138 |   const u = await makeUser("candidate", "bill");
  139 |   await loginUI(page, u);
  140 |   // The stub "hosted checkout page" -> immediately redirect to the success_url (what Stripe does after paying)
  141 |   await page.route("**/__stripe_stub_checkout**", (route) => {
  142 |     const url = new URL(route.request().url());
  143 |     return route.fulfill({ status: 302, headers: { location: url.searchParams.get("success")! } });
  144 |   });
  145 |   await page.goto(`${WEB}/candidate/billing`);
  146 |   await expect(page.getByText("Free plan").first()).toBeVisible();
  147 |   await shot(page, "billing_free");
  148 |   await page.getByRole("button", { name: /Upgrade/i }).first().click();
  149 |   await page.waitForURL(/checkout=success/, { timeout: 30000 });
  150 |   await expect(page.getByText(/Premium/).first()).toBeVisible();
  151 |   await page.waitForTimeout(3000);
  152 |   await shot(page, "billing_premium");
  153 |   const sub = await api("GET", "/api/billing/subscription", { token: u.token });
  154 |   expect(sub.data.plan).toBe("premium");
  155 |   await page.reload();
  156 |   await page.getByRole("button", { name: "Cancel subscription" }).click();
  157 |   const dlg = page.getByRole("dialog");
  158 |   if (await dlg.isVisible().catch(() => false)) await dlg.getByRole("button", { name: /cancel subscription|confirm|yes/i }).last().click();
  159 |   await expect(page.getByText(/Ends on|cancel/i).first()).toBeVisible({ timeout: 15000 });
  160 |   await shot(page, "billing_cancelled");
  161 |   expect((await api("GET", "/api/billing/subscription", { token: u.token })).data.cancelAtPeriodEnd).toBe(true);
  162 |   await page.getByRole("button", { name: /Resume|Keep/i }).first().click();
  163 |   await page.waitForTimeout(3000);
  164 |   expect((await api("GET", "/api/billing/subscription", { token: u.token })).data.cancelAtPeriodEnd).toBe(false);
  165 |   await shot(page, "billing_resumed");
  166 |   // premium candidate: learning page shows premium courses unlocked; practice limit 10
  167 |   const usage = await api("GET", "/api/interview/usage", { token: u.token });
  168 |   expect(usage.data.limit).toBe(10);
  169 | });
  170 | 
  171 | /* --------------------------------------------------------- error handling */
  172 | 
  173 | test("errors: backend down, 503 AI down, 429 rate limit on login, 409 already-applied, 410 time-up", async ({ page }, info) => {
  174 |   const u = await makeUser("candidate", "errs");
  175 |   await loginUI(page, u);
  176 | 
  177 |   // 503 practice questions / AI unavailable -> simulate via route interception (real 503 shape)
  178 |   await page.route("**/api/interview/start", (r) => r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, message: "The AI interviewer is not available right now. Please try again." }) }));
  179 |   await page.goto(`${WEB}/candidate/interview/basic`);
  180 |   await page.getByRole("button", { name: /Start Round 1/i }).last().click();
  181 |   await expect(page.getByText(/not available right now/i).first()).toBeVisible({ timeout: 15000 });
  182 |   await shot(page, "error_503_start");
  183 |   await page.unroute("**/api/interview/start");
  184 | 
  185 |   // 410 time-up on submit
  186 |   await page.reload();
  187 |   await page.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  188 |   await expect(page.getByText(/Question 1 of 5/).first()).toBeVisible({ timeout: 60000 });
  189 |   await page.route("**/api/interview/answer", (r) => r.fulfill({ status: 410, contentType: "application/json", body: JSON.stringify({ success: false, message: "Interview time expired" }) }));
  190 |   await page.locator("#interview-answer").fill("answer that arrives too late");
  191 |   await page.getByRole("button", { name: /^submit answer$/i }).click();
  192 |   await expect(page.getByText(/Time's up/i).first()).toBeVisible({ timeout: 10000 });
  193 |   await shot(page, "error_410_timeup");
  194 |   await page.unroute("**/api/interview/answer");
  195 | 
  196 |   // 409 on submit (answered elsewhere) -> what does the UI offer?
  197 |   await page.reload();
  198 |   await page.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  199 |   await expect(page.getByText(/Question 1 of 5/).first()).toBeVisible({ timeout: 60000 });
  200 |   await page.route("**/api/interview/answer", (r) => r.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, message: "This question has already been answered" }) }));
  201 |   await page.locator("#interview-answer").fill("my answer");
  202 |   await page.getByRole("button", { name: /^submit answer$/i }).click();
  203 |   await expect(page.getByText(/already been answered/i).first()).toBeVisible({ timeout: 10000 });
  204 |   const stillQ1 = await page.getByText(/Question 1 of 5/).first().isVisible();
  205 |   finding(info, { kind: "check", id: "ui-409-submit", staysOnSameQuestionWithError: stillQ1, screenshot: await shot(page, "error_409_submit") });
  206 |   await page.unroute("**/api/interview/answer");
  207 | 
  208 |   // 500 on apply (e.g. resume storage unreachable)
  209 |   await page.route("**/api/applications/*/apply", (r) => r.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Internal server error" }) }));
  210 |   // backend down entirely
  211 |   await ctl("/backend/stop");
  212 |   try {
  213 |     for (const route of ["/candidate/dashboard", "/candidate/jobs"]) {
  214 |       await page.goto(`${WEB}${route}`);
  215 |       await page.waitForTimeout(4000);
  216 |       const body = await page.locator("body").innerText();
  217 |       finding(info, { kind: "check", id: `backend-down${route}`, url: page.url(), showsReachError: /could not reach the server|connection/i.test(body), screenshot: await shot(page, `backend_down${route.replace(/\//g, "_")}`) });
  218 |     }
  219 |     const lp = await page.context().newPage();
  220 |     await lp.goto(`${WEB}/login/candidate`);
  221 |     await waitHydrated(lp);
  222 |     await lp.getByLabel(/email/i).first().fill(u.email);
  223 |     await lp.getByLabel(/^password/i).first().fill(u.password);
```