/**
 * Starts the full E2E stack, isolated from the real setup:
 *   in-memory MongoDB  ->  mock AI (backend/scripts/mock-ai.js)  ->  backend in test mode (stubs preloaded)
 *   ->  Next.js dev server pointed at that backend.
 *
 *   node tests/e2e/support/stack.js            (keeps running; Ctrl+C to stop)
 *
 * Writes tests/e2e/.stack.json with the Mongo URI + mailbox path for the tests. No env value
 * from either .env file is printed; the backend's real secrets are overridden with dummies.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const FRONTEND = path.resolve(__dirname, "..", "..", "..");
const BACKEND = process.env.BACKEND_DIR || "C:/backend/Airecruitx-backend";
const OUT = path.join(FRONTEND, "tests", "e2e", ".out");
fs.mkdirSync(OUT, { recursive: true });

const PORTS = { mock: 8011, api: 5055, web: 3100, files: 5099 };
const MAILBOX = path.join(OUT, "mailbox.jsonl");
fs.writeFileSync(MAILBOX, "");

const children = [];
function run(name, cmd, args, opts) {
  const log = fs.createWriteStream(path.join(OUT, `${name}.log`));
  const child = spawn(cmd, args, { ...opts, stdio: ["ignore", "pipe", "pipe"], shell: false });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  child.on("exit", (code) => console.log(`[stack] ${name} exited (${code})`));
  children.push(child);
  return child;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(url, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try { const r = await fetch(url); if (r.status < 500) return; } catch { /* not up */ }
    await sleep(500);
  }
  throw new Error(`${url} not up after ${ms}ms`);
}

(async () => {
  process.env.MONGOMS_SYSTEM_BINARY = process.env.MONGOMS_SYSTEM_BINARY || path.join(BACKEND, "node_modules", ".cache", "mongodb-memory-server", "mongod-x64-win32-8.2.6.exe");
  const { MongoMemoryServer } = require(path.join(BACKEND, "node_modules", "mongodb-memory-server"));
  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri("airecruitx_e2e");
  console.log("[stack] in-memory MongoDB up");

  const startMock = () => run("mock-ai", process.execPath, ["scripts/mock-ai.js"], {
    cwd: BACKEND, env: { ...process.env, PORT: String(PORTS.mock), MOCK_DELAY_MS: "30" },
  });
  let mockChild = startMock();
  await waitFor(`http://localhost:${PORTS.mock}/__mock/stats`, 15000);
  console.log("[stack] mock AI up");

  const backendEnv = {
    ...process.env,
    PORT: String(PORTS.api), MONGO_URI: mongoUri, NODE_ENV: "test",
    APP_BASE_URL: `http://localhost:${PORTS.web}`,
    AI_BASE_URL: `http://localhost:${PORTS.mock}`, AI_API_KEY: "", AI_MODEL: "mock", AI_JSON_SCHEMA: "true",
    AI_RETRY_WINDOW_MS: "4000", AI_TIMEOUT_MS: "8000", AI_FINAL_WAIT_MS: "8000",
    SMTP_USER: "stub", SMTP_PASS: "stub", SMTP_FROM: "noreply@example.test",
    JWT_SECRET: "e2e_jwt_secret_not_real",
    CLOUDINARY_CLOUD_NAME: "stub", CLOUDINARY_API_KEY: "stub", CLOUDINARY_API_SECRET: "stub",
    FIREBASE_PROJECT_ID: "stub", FIREBASE_CLIENT_EMAIL: "stub@example.test", FIREBASE_PRIVATE_KEY: "stub", FIREBASE_WEB_API_KEY: "stub",
    REDIS_URL: "", TRUST_PROXY_HOPS: "1",
    INTERVIEW_BASIC_QUESTIONS: "5", INTERVIEW_TECHNICAL_QUESTIONS: "8",
    ROUND2_UNLOCK_SCORE: "50", CERTIFICATE_PASS_SCORE: "70",
    BASIC_INTERVIEW_MINUTES: "10", TECHNICAL_INTERVIEW_MINUTES: "20", ORG_INTERVIEW_MINUTES: "20", ORG_WARMUP_MINUTES: "3",
    SCORE_SCALE: "1.15", SCORE_OFFSET: "0.8", SCORE_FLOOR_CORRECT: "6",
    STRIPE_SECRET_KEY: "sk_test_e2e_stub", STRIPE_WEBHOOK_SECRET: "whsec_e2e_stub", STRIPE_PREMIUM_PRICE_ID: "",
    PREMIUM_PRICE_CENTS: "2900", PREMIUM_CURRENCY: "usd", PREMIUM_INTERVAL: "month", PREMIUM_TRIAL_DAYS: "0",
    STUB_MAILBOX: MAILBOX, STUB_FILES_PORT: String(PORTS.files),
  };
  const startBackend = () => run("backend", process.execPath, ["-r", path.join(__dirname, "backend-stubs.js"), "-r", "ts-node/register/transpile-only", "src/server.ts"], {
    cwd: BACKEND, env: backendEnv,
  });
  let backendChild = startBackend();
  await waitFor(`http://localhost:${PORTS.api}/health`, 120000);
  console.log("[stack] backend up");

  const webEnv = {
    ...process.env,
    NEXT_PUBLIC_API_URL: `http://localhost:${PORTS.api}`,
    NEXT_PUBLIC_FIREBASE_API_KEY: "", NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "", NEXT_PUBLIC_FIREBASE_PROJECT_ID: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  run("next", process.execPath, [path.join(FRONTEND, "node_modules", "next", "dist", "bin", "next"), "dev", ...(process.env.E2E_TURBOPACK ? [] : ["--webpack"]), "-p", String(PORTS.web)], {
    cwd: FRONTEND, env: webEnv,
  });
  await waitFor(`http://localhost:${PORTS.web}/`, 180000);
  console.log("[stack] next dev up");

  fs.writeFileSync(path.join(FRONTEND, "tests", "e2e", ".stack.json"), JSON.stringify({ mongoUri, mailbox: MAILBOX, ports: PORTS, backendDir: BACKEND }, null, 2));
  // Control port for tests: POST /backend/stop|start|restart, /mock/stop|start
  require("http").createServer(async (req, res) => {
    try {
      const u = req.url;
      const killWait = async (c) => { if (c && c.exitCode === null) { c.kill(); for (let i = 0; i < 50 && c.exitCode === null; i++) await sleep(100); } };
      if (u === "/backend/stop" || u === "/backend/restart") await killWait(backendChild);
      if (u === "/backend/start" || u === "/backend/restart") { backendChild = startBackend(); await waitFor(`http://localhost:${PORTS.api}/health`, 120000); }
      if (u === "/mock/stop") await killWait(mockChild);
      if (u === "/mock/start") { mockChild = startMock(); await waitFor(`http://localhost:${PORTS.mock}/__mock/stats`, 15000); }
      res.end("ok");
    } catch (e) { res.statusCode = 500; res.end(String(e.message)); }
  }).listen(5098);
  console.log("[stack] READY");

  const stop = async () => {
    for (const c of children) try { c.kill(); } catch {}
    try { require("child_process").execSync(`wmic process where "name='node.exe' and commandline like '%AIrecruitex%frontend%.next%dev%'" call terminate`, { stdio: "ignore" }); } catch {}
    await mongo.stop().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
})().catch((e) => { console.error("[stack] failed:", e.message); for (const c of children) try { c.kill(); } catch {} process.exit(1); });
