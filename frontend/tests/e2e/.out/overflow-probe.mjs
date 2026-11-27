import { chromium } from "playwright";
const b = await chromium.launch(); 
for (const w of [375, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto("http://localhost:3100/", { waitUntil: "networkidle" }); await p.waitForTimeout(2000);
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) return true; } return false; };
    return { sw: document.documentElement.scrollWidth, vw, els: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > vw + 1 && !clipped(e) && getComputedStyle(e).position !== "fixed").slice(0, 6).map((e) => `${e.tagName}.${String(e.className).slice(0, 90)} right=${Math.round(e.getBoundingClientRect().right)} section=${e.closest("section")?.id || e.closest("section")?.className?.slice(0,40)}`) };
  });
  console.log(w, JSON.stringify(r, null, 1));
}
await b.close();
