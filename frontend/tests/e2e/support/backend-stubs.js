/**
 * Preloaded into the backend process (node -r) for E2E tests ONLY. Replaces the external
 * services with local fakes so no real credentials are used and nothing leaves the machine:
 *   - cloudinary   -> files are kept in memory and served from http://localhost:STUB_FILES_PORT
 *   - nodemailer   -> every email is appended to STUB_MAILBOX (JSON lines) so tests can read OTPs/links
 *   - stripe       -> in-memory customers / checkout sessions / subscriptions
 *   - firebase-admin -> no-op app (Google sign-in is not exercised)
 * The backend source is not modified.
 */
const Module = require("module");
const fs = require("fs");
const http = require("http");
const { Writable } = require("stream");

const MAILBOX = process.env.STUB_MAILBOX;
const FILES_PORT = Number(process.env.STUB_FILES_PORT || 5099);
const APP_BASE = (process.env.APP_BASE_URL || "http://localhost:3100").replace(/\/$/, "");

/* ---------------------------------------------------------- file store (cloudinary) */
const files = new Map(); // publicId -> { buf, type }
http
  .createServer((req, res) => {
    const id = decodeURIComponent((req.url || "/").split("?")[0].replace(/^\/files\/v1\//, ""));
    const f = files.get(id);
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (!f) { res.statusCode = 404; return res.end("not found"); }
    res.setHeader("Content-Type", f.type);
    res.end(f.buf);
  })
  .listen(FILES_PORT);

let seq = 0;
const cloudinaryV2 = {
  config() {},
  uploader: {
    upload_stream(options, cb) {
      const chunks = [];
      return new Writable({
        write(chunk, _enc, next) { chunks.push(chunk); next(); },
        final(done) {
          const publicId = String(options?.public_id || `stub_${++seq}`);
          const folder = options?.folder ? `${options.folder}/` : "";
          const id = `${folder}${publicId}`;
          files.set(id, { buf: Buffer.concat(chunks), type: options?.resource_type === "image" ? "image/png" : "application/octet-stream" });
          const url = `http://localhost:${FILES_PORT}/files/v1/${encodeURIComponent(id)}`;
          setImmediate(() => cb(null, { secure_url: url, public_id: id, bytes: Buffer.concat(chunks).length }));
          done();
        },
      });
    },
    async upload(_path, options) {
      const id = String(options?.public_id || `stub_${++seq}`);
      return { secure_url: `http://localhost:${FILES_PORT}/files/v1/${id}`, public_id: id };
    },
    async destroy(publicId) { files.delete(publicId); return { result: "ok" }; },
  },
  url: (id) => `http://localhost:${FILES_PORT}/files/v1/${id}`,
};

/* ---------------------------------------------------------------- mailbox (nodemailer) */
const nodemailerStub = {
  createTransport() {
    return {
      async sendMail(msg) {
        if (MAILBOX) fs.appendFileSync(MAILBOX, JSON.stringify({ to: msg.to, subject: msg.subject, html: msg.html, at: new Date().toISOString() }) + "\n");
        return { messageId: `stub-${Date.now()}` };
      },
      verify: async () => true,
    };
  },
};

/* ------------------------------------------------------------------------ stripe */
const now = () => Math.floor(Date.now() / 1000);
const stripeState = { customers: new Map(), sessions: new Map(), subs: new Map(), n: 0 };
function StripeStub() {
  const id = (p) => `${p}_stub${++stripeState.n}${Date.now()}`;
  const makeSub = (sess) => {
    const sub = {
      id: id("sub"), object: "subscription", status: "active", customer: sess.customer,
      cancel_at_period_end: false, metadata: { ...(sess.subscription_data?.metadata || {}), ...(sess.metadata || {}) },
      items: { data: [{ current_period_start: now(), current_period_end: now() + 30 * 86400 }] },
      latest_invoice: { id: id("in"), status: "paid", amount_paid: 2900, currency: "usd", number: "STUB-0001", customer: sess.customer,
        subscription: null, lines: { data: [{ period: { start: now(), end: now() + 30 * 86400 } }] }, hosted_invoice_url: null, invoice_pdf: null,
        created: now(), metadata: {} },
    };
    sub.latest_invoice.subscription = sub.id;
    stripeState.subs.set(sub.id, sub);
    return sub;
  };
  return {
    customers: {
      async create(p) { const c = { id: id("cus"), ...p }; stripeState.customers.set(c.id, c); return c; },
    },
    checkout: {
      sessions: {
        async create(p) {
          const sid = `cs_test_stub${++stripeState.n}x${Date.now()}`;
          const sess = { id: sid, ...p, status: "open", payment_status: "unpaid" };
          stripeState.sessions.set(sid, sess);
          // The "hosted checkout page" is a tiny stub page on the frontend origin that is never
          // served -> tests intercept it; success_url is what a real Stripe would redirect to.
          return { ...sess, url: `${APP_BASE}/__stripe_stub_checkout?session=${sid}&success=${encodeURIComponent((p.success_url || "").replace("{CHECKOUT_SESSION_ID}", sid))}` };
        },
        async retrieve(sid) {
          const sess = stripeState.sessions.get(sid);
          if (!sess) throw new Error("No such checkout session");
          // Retrieving = the candidate finished paying on the hosted page.
          if (sess.status !== "complete") {
            sess.status = "complete"; sess.payment_status = "paid";
            if (sess.mode === "subscription") sess.subscription = makeSub(sess);
          }
          return sess;
        },
      },
    },
    subscriptions: {
      async retrieve(sid) { const s = stripeState.subs.get(sid); if (!s) throw new Error("No such subscription"); return s; },
      async update(sid, p) { const s = stripeState.subs.get(sid); if (!s) throw new Error("No such subscription"); Object.assign(s, p); return s; },
    },
    webhooks: { constructEvent() { throw new Error("webhooks are not stubbed"); } },
  };
}

/* ------------------------------------------------------------------ firebase-admin */
const firebaseStub = {
  apps: [{}],
  initializeApp() { return {}; },
  credential: { cert: () => ({}) },
  auth: () => ({ verifyIdToken: async () => { throw new Error("Google sign-in is stubbed in tests"); } }),
};

const STUBS = {
  cloudinary: { v2: cloudinaryV2, default: { v2: cloudinaryV2 } },
  nodemailer: nodemailerStub,
  stripe: StripeStub,
  "firebase-admin": firebaseStub,
};
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(STUBS, request)) return STUBS[request];
  return origLoad.call(this, request, parent, isMain);
};
console.log("[e2e-stubs] cloudinary/nodemailer/stripe/firebase-admin stubbed");
