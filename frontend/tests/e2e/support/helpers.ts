import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { Page, ConsoleMessage, TestInfo } from "@playwright/test";

const STACK = JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".stack.json"), "utf8"));
export const API = `http://localhost:${STACK.ports.api}`;
export const WEB = `http://localhost:${STACK.ports.web}`;
export const MOCK = `http://localhost:${STACK.ports.mock}`;
export const SHOTS = path.join(__dirname, "..", "..", "..", "tests", "e2e", "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const req = createRequire(path.join(STACK.backendDir, "package.json"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MongoClient, ObjectId } = req("mongoose").mongo;
let client: any;
export async function db() {
  if (!client) client = await new MongoClient(STACK.mongoUri).connect();
  return client.db();
}
export const oid = (id: string) => new ObjectId(String(id));

let ipSeq = Math.floor(Math.random() * 200);
export const nextIp = () => { ipSeq++; return `10.88.${(ipSeq >> 8) & 255}.${ipSeq & 255}`; };

export async function api(method: string, p: string, opts: { body?: unknown; token?: string; ip?: string; form?: FormData } = {}) {
  const headers: Record<string, string> = { "X-Forwarded-For": opts.ip ?? nextIp() };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(API + p, { method, headers, body: opts.form ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body)) });
  const json: any = await res.json().catch(() => ({}));
  return { status: res.status, json, data: json.data };
}

export function mailbox(): { to: string; subject: string; html: string }[] {
  if (!fs.existsSync(STACK.mailbox)) return [];
  return fs.readFileSync(STACK.mailbox, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
export async function waitForMail(to: string, re: RegExp, ms = 15000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const m = mailbox().reverse().find((x) => x.to.toLowerCase() === to.toLowerCase() && re.test(x.subject + x.html));
    if (m) return m;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`no mail to ${to} matching ${re}`);
}
export const otpFrom = (html: string) => (html.match(/>(\d{6})</) || [])[1];

let seq = 0;
export type TestUser = { email: string; password: string; token: string; id: string; name: string; role: string };
export async function makeUser(role: "candidate" | "hr" | "admin", tag = role, profile = true): Promise<TestUser> {
  const email = `e2e-${tag}-${Date.now()}-${seq++}@example.com`;
  const password = "Passw0rd!e2e";
  const name = `E2E ${tag}`;
  const ip = nextIp();
  const signupRole = role === "admin" ? "candidate" : role;
  const s = await api("POST", "/api/auth/signup", { ip, body: { name, email, password, role: signupRole } });
  if (s.status !== 201) throw new Error(`signup ${s.status} ${s.json.message}`);
  const mail = await waitForMail(email, /verification code/i);
  const v = await api("POST", "/api/auth/verify-email", { ip, body: { email, otp: otpFrom(mail.html) } });
  if (v.status !== 200) throw new Error(`verify ${v.status} ${v.json.message}`);
  const id = String(v.data.user.id);
  if (role === "admin") await (await db()).collection("users").updateOne({ _id: oid(id) }, { $set: { role: "admin" } });
  if (role === "candidate" && profile) {
    await (await db()).collection("users").updateOne({ _id: oid(id) }, { $set: { headline: "Junior developer", about: "I build web apps.", interests: ["web"] } });
  }
  return { email, password, token: v.data.token, id, name, role };
}

/** Waits until React has hydrated (Next sets __next_f / the form gets its handlers). */
export async function waitHydrated(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForFunction(() => { const f = document.querySelector("form"); return !f || Object.keys(f).some((k) => k.startsWith("__react")); }, null, { timeout: 60000 }).catch(() => {});
}

/** Logs in through the real form (retries if the click hit the page before hydration). */
export async function loginUI(page: Page, user: TestUser) {
  const portal = user.role === "candidate" ? "candidate" : "recruiter";
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(`${WEB}/login/${portal}`);
    await waitHydrated(page);
    await page.waitForTimeout(1500);
    await page.getByLabel(/email/i).first().fill(user.email);
    await page.getByLabel(/^password/i).first().fill(user.password);
    await page.locator("form button[type=submit]").first().click();
    try {
      await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 20000 });
      return;
    } catch { /* native submit before hydration -> retry */ }
  }
  throw new Error("login failed after retries");
}

/** Collects console errors + page errors + failed requests. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m: ConsoleMessage) => { if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 300)}`); });
  // "Unexpected end of (JSON) input" = next-dev webpack compile race (server 500 while compiling), not app code.
  page.on("pageerror", (e) => { if (!/Unexpected end of (JSON )?input|Invalid or unexpected token/.test(e.message)) errors.push(`pageerror: ${e.message.slice(0, 300)}`); });
  return errors;
}

export async function shot(page: Page, name: string) {
  const p = path.join(SHOTS, `${name.replace(/[^a-z0-9_-]+/gi, "_")}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return path.relative(path.join(__dirname, "..", "..", ".."), p).replace(/\\/g, "/");
}

/** Records a finding for the report (tests/e2e/.out/findings.jsonl). */
export function finding(info: TestInfo | null, f: Record<string, unknown>) {
  fs.appendFileSync(path.join(__dirname, "..", ".out", "findings.jsonl"), JSON.stringify({ test: info?.title, ...f }) + "\n");
}
