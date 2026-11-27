import { test, expect, type Page } from "@playwright/test";
import { WEB, API, api, db, oid, makeUser, loginUI, waitHydrated, watchConsole, shot, finding, nextIp } from "./support/helpers";

const ctl = (p: string) => fetch(`http://localhost:5098${p}`, { method: "POST" }).then((r) => r.text());

/* ------------------------------------------------------------------ admin */

test("admin: dashboard, users (plan change, block), activity logs, content, reports", async ({ page }, info) => {
  const errors = watchConsole(page);
  const admin = await makeUser("admin", "adm");
  const victim = await makeUser("candidate", "victim");
  await loginUI(page, admin);
  await page.goto(`${WEB}/admin/dashboard`);
  await expect(page.getByText(/total users|users/i).first()).toBeVisible();
  await shot(page, "admin_dashboard");

  await page.goto(`${WEB}/admin/users`);
  await page.getByLabel("Search users by name or email").fill(victim.email);
  await expect(page.getByText(victim.email).first()).toBeVisible({ timeout: 15000 });
  // plan change -> premium
  await page.getByRole("button", { name: `Change plan for ${victim.name}` }).first().click();
  await page.locator("#admin-plan").selectOption("premium");
  await page.getByRole("dialog").getByRole("button", { name: /save/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15000 });
  const me = await api("GET", "/api/auth/me", { token: victim.token });
  expect(me.data.plan).toBe("premium");
  // block (deactivate)
  await page.getByRole("switch", { name: new RegExp(`Deactivate ${victim.name}`) }).or(page.getByLabel(new RegExp(`Deactivate ${victim.name}`))).first().click();
  await page.waitForTimeout(1500);
  const blocked = await api("GET", "/api/auth/me", { token: victim.token });
  expect(blocked.status).toBe(403);
  await shot(page, "admin_users_after_block");

  // blocked user's open session -> deactivated screen
  const ctx = await page.context().browser()!.newContext();
  const vp = await ctx.newPage();
  await vp.goto(`${WEB}/login/candidate`);
  await waitHydrated(vp);
  await vp.evaluate((t) => localStorage.setItem("airecruitx_token", t), victim.token);
  await vp.goto(`${WEB}/candidate/dashboard`);
  await vp.waitForTimeout(4000);
  finding(info, { kind: "check", id: "blocked-user-screen", url: vp.url(), screenshot: await shot(vp, "blocked_user_view") });
  await ctx.close();

  await page.goto(`${WEB}/admin/activity-logs`);
  await expect(page.getByText(/plan|active|user/i).first()).toBeVisible();
  await shot(page, "admin_activity_logs");
  await page.goto(`${WEB}/admin/content`);
  await shot(page, "admin_content");
  await page.goto(`${WEB}/admin/reports`);
  await shot(page, "admin_reports");
  await page.goto(`${WEB}/admin/monitoring`);
  await expect(page.getByText(/uptime|database|connected/i).first()).toBeVisible();
  await shot(page, "admin_monitoring");
  expect(errors.filter((e) => !/status of 4/.test(e))).toEqual([]);
});

test("admin: broadcast notification reaches candidate", async ({ page }) => {
  const admin = await makeUser("admin", "admb");
  const cand = await makeUser("candidate", "bcast");
  await loginUI(page, admin);
  await page.goto(`${WEB}/admin/notifications`);
  const msg = `Maintenance tonight ${Date.now()}`;
  const role = page.locator("#broadcast-role");
  if (await role.isVisible().catch(() => false)) await role.selectOption("candidate");
  await page.locator("#broadcast-message").fill(msg);
  await page.getByRole("button", { name: /send notification/i }).click();
  await expect(page.getByText(/sent|recipient/i).first()).toBeVisible({ timeout: 15000 });
  await shot(page, "admin_broadcast");
  const n = await api("GET", "/api/notifications/mine", { token: cand.token });
  expect(n.data.some((x: any) => x.message === msg)).toBe(true);
});

test("admin: settings save + are they enforced (signups, resume size, match threshold)", async ({ page }, info) => {
  const admin = await makeUser("admin", "adms");
  await loginUI(page, admin);
  await page.goto(`${WEB}/admin/settings`);
  await page.locator("#settings-threshold").fill("90");
  await page.locator("#settings-resume-size").fill("1");
  const signups = page.locator("#settings-allow-signups");
  if ((await signups.getAttribute("aria-checked")) !== "false") await signups.click();
  await page.getByRole("button", { name: /save settings/i }).click();
  await page.waitForTimeout(3000);
  finding(info, { kind: "check", id: "settings-saved-message", visible: await page.getByText("Settings saved.").isVisible().catch(() => false), screenshot: await shot(page, "admin_settings_saved") });
  const s = await api("GET", "/api/admin/settings", { token: admin.token });
  expect(s.data.matchThreshold).toBe(90);
  // enforcement
  const signup = await api("POST", "/api/auth/signup", { body: { name: "x", email: `blocked-${Date.now()}@example.com`, password: "Passw0rd!", role: "candidate" } });
  const c = await makeUser("candidate", "size").catch(() => null);
  let resumeStatus = -1;
  if (c) {
    const fd = new FormData();
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(2 * 1024 * 1024, 32)]);
    fd.append("resume", new Blob([pdf], { type: "application/pdf" }), "two-mb.pdf");
    resumeStatus = (await api("POST", "/api/resume/upload", { token: c.token, form: fd })).status;
  }
  // invalid values
  const bad = await api("PATCH", "/api/admin/settings", { token: admin.token, body: { matchThreshold: -5, maxResumeSizeMB: "abc" } });
  finding(info, { kind: "check", id: "settings-enforced", signupWhileDisabled: signup.status, resumeUpload2MBWithLimit1MB: resumeStatus, invalidSettingsPatch: [bad.status, bad.json.message] });
  // restore
  await api("PATCH", "/api/admin/settings", { token: admin.token, body: { matchThreshold: 50, maxResumeSizeMB: 5, allowSignups: true } });
});

test("admin: support desk reply, resolve, reopen", async ({ page }) => {
  const admin = await makeUser("admin", "admsd");
  const cand = await makeUser("candidate", "sdcand");
  const t = await api("POST", "/api/support/tickets", { token: cand.token, body: { subject: "Billing question", message: "Was I charged twice?" } });
  expect(t.status).toBe(201);
  await loginUI(page, admin);
  await page.goto(`${WEB}/admin/support`);
  await page.getByText("Billing question").first().click();
  await page.locator(`#support-composer-${t.data._id}`).fill("No, only once.");
  await page.getByRole("button", { name: /send|reply/i }).last().click();
  await expect(page.getByText("No, only once.").first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Mark resolved" }).click();
  await page.waitForTimeout(2000);
  await shot(page, "admin_support_after_resolve");
  await page.getByRole("tab", { name: /Resolved/ }).or(page.getByRole("button", { name: /^Resolved/ })).first().click();
  await page.getByText("Billing question").first().click();
  await expect(page.getByRole("button", { name: "Reopen" })).toBeVisible({ timeout: 15000 });
  await shot(page, "admin_support_resolved");
  await page.getByRole("button", { name: "Reopen" }).click();
  await expect(page.getByRole("button", { name: "Mark resolved" })).toBeVisible({ timeout: 15000 });
  const mine = await api("GET", `/api/support/tickets/${t.data._id}`, { token: cand.token });
  expect(mine.data.messages.some((m: any) => m.body === "No, only once.")).toBe(true);
  expect(mine.data.status).toBe("open");
});

/* --------------------------------------------------------------- billing */

test("billing: plan card, upgrade -> checkout redirect stub -> premium, cancel, resume; pricing matches /api/billing/plans", async ({ page }, info) => {
  const plans = (await api("GET", "/api/billing/plans")).data.plans;
  const premium = plans.find((p: any) => p.id === "premium");
  await page.goto(`${WEB}/pricing`);
  const pricing = await page.locator("main, body").first().innerText();
  finding(info, { kind: "check", id: "pricing-vs-api", apiPlans: plans.map((p: any) => `${p.name}=${p.priceCents}`), pricingShowsPremium: pricing.includes(`$${premium.priceCents / 100}`), pricingHasCareerPlus: /Career\+/.test(pricing) });

  const u = await makeUser("candidate", "bill");
  await loginUI(page, u);
  // The stub "hosted checkout page" -> immediately redirect to the success_url (what Stripe does after paying)
  await page.route("**/__stripe_stub_checkout**", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({ status: 302, headers: { location: url.searchParams.get("success")! } });
  });
  await page.goto(`${WEB}/candidate/billing`);
  await expect(page.getByText("Free plan").first()).toBeVisible();
  await shot(page, "billing_free");
  await page.getByRole("button", { name: /Upgrade/i }).first().click();
  await page.waitForURL(/checkout=success/, { timeout: 30000 });
  await expect(page.getByText(/Premium/).first()).toBeVisible();
  await page.waitForTimeout(3000);
  await shot(page, "billing_premium");
  const sub = await api("GET", "/api/billing/subscription", { token: u.token });
  expect(sub.data.plan).toBe("premium");
  await page.reload();
  await page.getByRole("button", { name: "Cancel subscription" }).click();
  const dlg = page.getByRole("dialog");
  if (await dlg.isVisible().catch(() => false)) await dlg.getByRole("button", { name: /cancel subscription|confirm|yes/i }).last().click();
  await expect(page.getByText(/Ends on|cancel/i).first()).toBeVisible({ timeout: 15000 });
  await shot(page, "billing_cancelled");
  expect((await api("GET", "/api/billing/subscription", { token: u.token })).data.cancelAtPeriodEnd).toBe(true);
  await page.getByRole("button", { name: /Resume|Keep/i }).first().click();
  await page.waitForTimeout(3000);
  expect((await api("GET", "/api/billing/subscription", { token: u.token })).data.cancelAtPeriodEnd).toBe(false);
  await shot(page, "billing_resumed");
  // premium candidate: learning page shows premium courses unlocked; practice limit 10
  const usage = await api("GET", "/api/interview/usage", { token: u.token });
  expect(usage.data.limit).toBe(10);
});

/* --------------------------------------------------------- error handling */

test("errors: backend down, 503 AI down, 429 rate limit on login, 409 already-applied, 410 time-up", async ({ page }, info) => {
  const u = await makeUser("candidate", "errs");
  await loginUI(page, u);

  // 503 practice questions / AI unavailable -> simulate via route interception (real 503 shape)
  await page.route("**/api/interview/start", (r) => r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, message: "The AI interviewer is not available right now. Please try again." }) }));
  await page.goto(`${WEB}/candidate/interview/basic`);
  await page.getByRole("button", { name: /Start Round 1/i }).last().click();
  await expect(page.getByText(/not available right now/i).first()).toBeVisible({ timeout: 15000 });
  await shot(page, "error_503_start");
  await page.unroute("**/api/interview/start");

  // 410 time-up on submit
  await page.reload();
  await page.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  await expect(page.getByText(/Question 1 of 5/).first()).toBeVisible({ timeout: 60000 });
  await page.route("**/api/interview/answer", (r) => r.fulfill({ status: 410, contentType: "application/json", body: JSON.stringify({ success: false, message: "Interview time expired" }) }));
  await page.locator("#interview-answer").fill("answer that arrives too late");
  await page.getByRole("button", { name: /^submit answer$/i }).click();
  await expect(page.getByText(/Time's up/i).first()).toBeVisible({ timeout: 10000 });
  await shot(page, "error_410_timeup");
  await page.unroute("**/api/interview/answer");

  // 409 on submit (answered elsewhere) -> what does the UI offer?
  await page.reload();
  await page.getByRole("button", { name: /Start Round 1|Resume/i }).last().click();
  await expect(page.getByText(/Question 1 of 5/).first()).toBeVisible({ timeout: 60000 });
  await page.route("**/api/interview/answer", (r) => r.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, message: "This question has already been answered" }) }));
  await page.locator("#interview-answer").fill("my answer");
  await page.getByRole("button", { name: /^submit answer$/i }).click();
  await expect(page.getByText(/already been answered/i).first()).toBeVisible({ timeout: 10000 });
  const stillQ1 = await page.getByText(/Question 1 of 5/).first().isVisible();
  finding(info, { kind: "check", id: "ui-409-submit", staysOnSameQuestionWithError: stillQ1, screenshot: await shot(page, "error_409_submit") });
  await page.unroute("**/api/interview/answer");

  // 500 on apply (e.g. resume storage unreachable)
  await page.route("**/api/applications/*/apply", (r) => r.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Internal server error" }) }));
  // backend down entirely
  await ctl("/backend/stop");
  try {
    for (const route of ["/candidate/dashboard", "/candidate/jobs"]) {
      await page.goto(`${WEB}${route}`);
      await page.waitForTimeout(4000);
      const body = await page.locator("body").innerText();
      finding(info, { kind: "check", id: `backend-down${route}`, url: page.url(), showsReachError: /could not reach the server|connection/i.test(body), screenshot: await shot(page, `backend_down${route.replace(/\//g, "_")}`) });
    }
    const lp = await page.context().newPage();
    await lp.goto(`${WEB}/login/candidate`);
    await waitHydrated(lp);
    await lp.getByLabel(/email/i).first().fill(u.email);
    await lp.getByLabel(/^password/i).first().fill(u.password);
    await lp.locator("form button[type=submit]").first().click();
    await lp.waitForTimeout(3000);
    finding(info, { kind: "check", id: "backend-down-login", text: (await lp.locator("form").first().innerText()).slice(0, 300), screenshot: await shot(lp, "backend_down_login") });
  } finally {
    await ctl("/backend/start");
  }

  // 429 on login (10 attempts per email / 15 min)
  const ip = nextIp();
  const statuses: number[] = [];
  for (let i = 0; i < 11; i++) statuses.push((await api("POST", "/api/auth/login", { ip, body: { email: u.email, password: "wrong" } })).status);
  const lp2 = await page.context().newPage();
  await lp2.goto(`${WEB}/login/candidate`);
  await waitHydrated(lp2);
  await lp2.waitForTimeout(1500);
  await lp2.getByLabel(/email/i).first().fill(u.email);
  await lp2.getByLabel(/^password/i).first().fill(u.password);
  await lp2.locator("form button[type=submit]").first().click();
  await lp2.waitForTimeout(3000);
  finding(info, { kind: "check", id: "429-login", apiStatuses: statuses, uiText: (await lp2.locator("form").first().innerText()).slice(0, 300), screenshot: await shot(lp2, "error_429_login") });
});

/* ------------------------------------------------------------- security */

test("security: signup role=admin; login form submitted before JS = credentials in URL", async ({ browser }, info) => {
  const email = `evil-${Date.now()}@example.com`;
  const s = await api("POST", "/api/auth/signup", { body: { name: "Evil", email, password: "Passw0rd!", role: "admin" } });
  let role = null;
  if (s.status === 201) role = (await (await db()).collection("users").findOne({ email }))?.role;
  finding(info, { kind: "check", id: "signup-as-admin", status: s.status, storedRole: role });

  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(`${WEB}/login/candidate`);
  const hasForm = await p.locator("form").count();
  if (hasForm) {
    await p.locator("input[type=email], input[name=email], #login-email").first().fill("someone@example.com").catch(() => {});
    await p.locator("input[type=password]").first().fill("SuperSecret1").catch(() => {});
    await p.locator("form button[type=submit]").first().click().catch(() => {});
    await p.waitForTimeout(2000);
  }
  finding(info, { kind: "check", id: "login-native-get", urlAfterSubmit: p.url(), leaked: /password=/.test(p.url()), screenshot: await shot(p, "login_no_js_submit") });
  await ctx.close();
});

/* ------------------------------------------------------------ a11y basics */

test("a11y: unlabeled controls, keyboard nav on login, image alts", async ({ page }, info) => {
  const u = await makeUser("candidate", "a11y");
  const audit = async (route: string) => {
    await page.goto(`${WEB}${route}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1000);
    return page.evaluate(() => {
      const name = (el: Element) => {
        const e = el as HTMLElement;
        const aria = e.getAttribute("aria-label") || (e.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.textContent || "").join(" ");
        const lbl = (e as HTMLInputElement).labels?.[0]?.textContent || "";
        return (aria || lbl || e.getAttribute("title") || e.textContent || (e as HTMLInputElement).placeholder || "").trim();
      };
      const visible = (el: Element) => { const r = (el as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const unlabeledButtons = [...document.querySelectorAll("button, a[href]")].filter((b) => visible(b) && !name(b)).map((b) => b.outerHTML.slice(0, 120));
      const unlabeledInputs = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter((i) => visible(i) && !((i as HTMLInputElement).labels?.length || i.getAttribute("aria-label") || i.getAttribute("aria-labelledby"))).map((i) => i.outerHTML.slice(0, 120));
      const imgsNoAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.outerHTML.slice(0, 100));
      return { unlabeledButtons, unlabeledInputs, imgsNoAlt, h1: document.querySelectorAll("h1").length, lang: document.documentElement.lang };
    });
  };
  const results: Record<string, unknown> = {};
  for (const r of ["/", "/pricing", "/contact", "/login/candidate", "/login/recruiter"]) results[r] = await audit(r);
  await loginUI(page, u);
  for (const r of ["/candidate/dashboard", "/candidate/jobs", "/candidate/resume", "/candidate/profile", "/candidate/billing", "/candidate/interview/basic"]) results[r] = await audit(r);
  finding(info, { kind: "a11y", results });

  // keyboard: login via Tab/Enter only
  const ctx = await page.context().browser()!.newContext();
  const kp = await ctx.newPage();
  await kp.goto(`${WEB}/login/candidate`);
  await waitHydrated(kp);
  await kp.waitForTimeout(1500);
  const order: string[] = [];
  for (let i = 0; i < 14; i++) {
    await kp.keyboard.press("Tab");
    order.push(await kp.evaluate(() => { const a = document.activeElement as HTMLElement; return `${a.tagName}${a.id ? "#" + a.id : ""}:${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 25)}`; }));
  }
  const focusVisible = await kp.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle + "/" + getComputedStyle(document.activeElement as Element).boxShadow.slice(0, 40));
  await kp.locator("#login-email").focus();
  await kp.keyboard.type(u.email);
  await kp.keyboard.press("Tab");
  await kp.keyboard.type(u.password);
  await kp.keyboard.press("Enter");
  await kp.waitForTimeout(5000);
  finding(info, { kind: "a11y-keyboard", tabOrder: order, focusStyle: focusVisible, loggedInByKeyboard: !/login/.test(kp.url()), url: kp.url() });
  await ctx.close();
});
