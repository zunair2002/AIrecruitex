# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 40-admin-billing-errors.spec.ts >> errors: backend down, 503 AI down, 429 rate limit on login, 409 already-applied, 410 time-up
- Location: tests\e2e\40-admin-billing-errors.spec.ts:173:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Start Round 1|Resume/i }).last()

```

# Page snapshot

```yaml
- generic [active] [ref=f5e1]:
  - generic [ref=f5e2]:
    - status "Loading" [ref=f5e3]
    - paragraph [aria-hidden] [ref=f5e4]: Loading your workspace…
  - button "Open Next.js Dev Tools" [ref=f5e10] [cursor=pointer]
```

# Test source

```ts
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
  123 |   await expect(page.getByRole("button", { name: "Mark resolved" })).toBeVisible({ timeout: 15000 });
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
> 198 |   await page.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
      |                                                                            ^ Error: locator.click: Test timeout of 180000ms exceeded.
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
  224 |     await lp.locator("form button[type=submit]").first().click();
  225 |     await lp.waitForTimeout(3000);
  226 |     finding(info, { kind: "check", id: "backend-down-login", text: (await lp.locator("form").first().innerText()).slice(0, 300), screenshot: await shot(lp, "backend_down_login") });
  227 |   } finally {
  228 |     await ctl("/backend/start");
  229 |   }
  230 | 
  231 |   // 429 on login (10 attempts per email / 15 min)
  232 |   const ip = nextIp();
  233 |   const statuses: number[] = [];
  234 |   for (let i = 0; i < 11; i++) statuses.push((await api("POST", "/api/auth/login", { ip, body: { email: u.email, password: "wrong" } })).status);
  235 |   const lp2 = await page.context().newPage();
  236 |   await lp2.goto(`${WEB}/login/candidate`);
  237 |   await waitHydrated(lp2);
  238 |   await lp2.waitForTimeout(1500);
  239 |   await lp2.getByLabel(/email/i).first().fill(u.email);
  240 |   await lp2.getByLabel(/^password/i).first().fill(u.password);
  241 |   await lp2.locator("form button[type=submit]").first().click();
  242 |   await lp2.waitForTimeout(3000);
  243 |   finding(info, { kind: "check", id: "429-login", apiStatuses: statuses, uiText: (await lp2.locator("form").first().innerText()).slice(0, 300), screenshot: await shot(lp2, "error_429_login") });
  244 | });
  245 | 
  246 | /* ------------------------------------------------------------- security */
  247 | 
  248 | test("security: signup role=admin; login form submitted before JS = credentials in URL", async ({ browser }, info) => {
  249 |   const email = `evil-${Date.now()}@example.com`;
  250 |   const s = await api("POST", "/api/auth/signup", { body: { name: "Evil", email, password: "Passw0rd!", role: "admin" } });
  251 |   let role = null;
  252 |   if (s.status === 201) role = (await (await db()).collection("users").findOne({ email }))?.role;
  253 |   finding(info, { kind: "check", id: "signup-as-admin", status: s.status, storedRole: role });
  254 | 
  255 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  256 |   const p = await ctx.newPage();
  257 |   await p.goto(`${WEB}/login/candidate`);
  258 |   const hasForm = await p.locator("form").count();
  259 |   if (hasForm) {
  260 |     await p.locator("input[type=email], input[name=email], #login-email").first().fill("someone@example.com").catch(() => {});
  261 |     await p.locator("input[type=password]").first().fill("SuperSecret1").catch(() => {});
  262 |     await p.locator("form button[type=submit]").first().click().catch(() => {});
  263 |     await p.waitForTimeout(2000);
  264 |   }
  265 |   finding(info, { kind: "check", id: "login-native-get", urlAfterSubmit: p.url(), leaked: /password=/.test(p.url()), screenshot: await shot(p, "login_no_js_submit") });
  266 |   await ctx.close();
  267 | });
  268 | 
  269 | /* ------------------------------------------------------------ a11y basics */
  270 | 
  271 | test("a11y: unlabeled controls, keyboard nav on login, image alts", async ({ page }, info) => {
  272 |   const u = await makeUser("candidate", "a11y");
  273 |   const audit = async (route: string) => {
  274 |     await page.goto(`${WEB}${route}`);
  275 |     await page.waitForLoadState("networkidle").catch(() => {});
  276 |     await page.waitForTimeout(1000);
  277 |     return page.evaluate(() => {
  278 |       const name = (el: Element) => {
  279 |         const e = el as HTMLElement;
  280 |         const aria = e.getAttribute("aria-label") || (e.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.textContent || "").join(" ");
  281 |         const lbl = (e as HTMLInputElement).labels?.[0]?.textContent || "";
  282 |         return (aria || lbl || e.getAttribute("title") || e.textContent || (e as HTMLInputElement).placeholder || "").trim();
  283 |       };
  284 |       const visible = (el: Element) => { const r = (el as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  285 |       const unlabeledButtons = [...document.querySelectorAll("button, a[href]")].filter((b) => visible(b) && !name(b)).map((b) => b.outerHTML.slice(0, 120));
  286 |       const unlabeledInputs = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter((i) => visible(i) && !((i as HTMLInputElement).labels?.length || i.getAttribute("aria-label") || i.getAttribute("aria-labelledby"))).map((i) => i.outerHTML.slice(0, 120));
  287 |       const imgsNoAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.outerHTML.slice(0, 100));
  288 |       return { unlabeledButtons, unlabeledInputs, imgsNoAlt, h1: document.querySelectorAll("h1").length, lang: document.documentElement.lang };
  289 |     });
  290 |   };
  291 |   const results: Record<string, unknown> = {};
  292 |   for (const r of ["/", "/pricing", "/contact", "/login/candidate", "/login/recruiter"]) results[r] = await audit(r);
  293 |   await loginUI(page, u);
  294 |   for (const r of ["/candidate/dashboard", "/candidate/jobs", "/candidate/resume", "/candidate/profile", "/candidate/billing", "/candidate/interview/basic"]) results[r] = await audit(r);
  295 |   finding(info, { kind: "a11y", results });
  296 | 
  297 |   // keyboard: login via Tab/Enter only
  298 |   const ctx = await page.context().browser()!.newContext();
```