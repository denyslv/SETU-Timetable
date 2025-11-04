// scripts/scrape.js
// ES module (package.json must contain: { "type": "module" })

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

// ───────────────────────────────────────────────────────────────────────────────
// CONFIG: you can tweak these three strings if your labels differ
// ───────────────────────────────────────────────────────────────────────────────
const BASE = "https://studentssp.setu.ie/timetables/StudentGroupTT.aspx";
const SCHOOL_TEXT = "School of Science and Computing";
const DEPT_TEXT   = "Computing and Maths";
const GROUP_TEXT  = "KCRCO_B2-W_W"; // we will match by substring

// ───────────────────────────────────────────────────────────────────────────────
// OUTPUT
// ───────────────────────────────────────────────────────────────────────────────
const OUT_DIR = "data";
const DEBUG_DIR = "debug";
const TIMEZONE = "Europe/Dublin";

// ───────────────────────────────────────────────────────────────────────────────
// UTILITIES (Node side)
// ───────────────────────────────────────────────────────────────────────────────
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function saveJson(filepath, obj) {
  ensureDir(path.dirname(filepath));
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2));
  console.log("Wrote", filepath);
}
function slug(s) { return (s || "").replace(/[^a-z0-9_]+/gi, "_"); }

// Map "Mon".."Fri" to offset from week start (Monday is 0)
const dayOffset = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, (m || 0) + minutes);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function isoOfWeekday(weekStartISO, dayShort) {
  const base = new Date(weekStartISO + "T00:00:00");
  const add = dayOffset[dayShort] ?? 0;
  const d = new Date(base);
  d.setDate(base.getDate() + add);
  return d.toISOString().slice(0, 10);
}

// ───────────────────────────────────────────────────────────────────────────────
// FUNCTIONS that run in the browser context (page.evaluate)
// ───────────────────────────────────────────────────────────────────────────────

// Select an <option> by visible text (exact or substring), then set value without postback.
// We'll call __doPostBack separately so we can await network idle reliably.
function selectByVisibleText(selector, text, contains = true) {
  const sel =
    document.querySelector(selector) ||
    document.querySelector(`select[id*='${selector.replace('#','')}']`) ||
    document.querySelector("select[name*='" + selector.replace('#','') + "']");
  if (!sel) return false;

  const norm = (s) => (s || "").trim().toLowerCase();
  const want = norm(text);

  let chosen = null;
  for (const opt of Array.from(sel.options)) {
    const t = norm(opt.textContent);
    if ((contains && t.includes(want)) || (!contains && t === want)) {
      sel.value = opt.value;
      chosen = opt;
      break;
    }
  }
  return !!chosen;
}

// Return all options of a select as [{value, text}]
function readOptions(selector) {
  const sel =
    document.querySelector(selector) ||
    document.querySelector(`select[id*='${selector.replace('#','')}']`) ||
    document.querySelector("select[name*='" + selector.replace('#','') + "']");
  if (!sel) return [];
  return Array.from(sel.options).map(o => ({ value: o.value, text: (o.textContent || "").trim() }));
}

// Heuristic timetable parser: finds the "big" table with time/subject columns.
function parseTimetable() {
  const tables = Array.from(document.querySelectorAll("table"));
  const table = tables.find(t => /Subject\s*Code|Subject\s*Code\s*and\s*Title|Time/i.test(t.textContent || "")) || tables[0];
  if (!table) return { header: [], events: [] };

  const rows = Array.from(table.querySelectorAll("tr"))
    .map(tr => Array.from(tr.children).map(td => td.textContent.replace(/\s+/g, " ").trim()))
    .filter(r => r.length > 0);

  // Identify header row (first with several columns and containing "Time" or "Subject")
  const header = rows.find(r => r.length >= 5 && (r.some(c => /time/i.test(c)) || r.some(c => /subject/i.test(c)))) || rows[0];

  const idx = (name) => header.findIndex(h => new RegExp(name, "i").test(h));
  const col = {
    time: 0,
    subject: idx("Subject|Subject Code") !== -1 ? idx("Subject|Subject Code") : -1,
    title:   idx("Title|Subject Code and Title"),
    type:    idx("Type"),
    dur:     idx("^Dur|Duration"),
    room:    idx("Room\\*?|Room"),
    lec:     idx("Lectur|Tutor|Teacher")
  };

  let currentDay = "";
  const events = [];

  for (const r of rows) {
    // One-cell day headers like "Monday", "Tuesday", etc.
    if (r.length === 1 && /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(r[0])) {
      currentDay = r[0].slice(0,3); // Mon/Tue/...
      continue;
    }

    // Skip header row(s)
    if (r === header) continue;

    const timeCell = r[col.time] || "";
    if (!/^\d{2}:\d{2}$/.test(timeCell)) continue;

    // Duration → end time (fallback 60 minutes)
    let end = "";
    if (col.dur >= 0 && /^\d+$/.test(r[col.dur])) {
      end = (function () {
        const mins = Number(r[col.dur]) * 60;
        const [hh, mm] = timeCell.split(":").map(Number);
        const d = new Date(2000, 0, 1, hh, (mm || 0) + mins);
        return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      })();
    } else {
      end = timeCell.replace(/:(\d{2})$/, (_,m)=> m) ? timeCell : timeCell; // guard
      end = (function () {
        const [hh, mm] = timeCell.split(":").map(Number);
        const d = new Date(2000, 0, 1, hh, (mm || 0) + 60);
        return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      })();
    }

    events.push({
      day: currentDay || "",
      start: timeCell,
      end,
      moduleCode: col.subject >= 0 ? r[col.subject] : "",
      title:      col.title   >= 0 ? r[col.title]   : "",
      type:       col.type    >= 0 ? r[col.type]    : "",
      room:       col.room    >= 0 ? r[col.room].replace(/\*$/, "") : "",
      lecturer:   col.lec     >= 0 ? r[col.lec]     : ""
    });
  }

  return { header, events };
}

// Trigger ASP.NET WebForms postback and wait for network idle
async function postback(page, controlId) {
  await page.evaluate((id) => {
    if (typeof window.__doPostBack === "function") {
      window.__doPostBack(id, "");
    } else {
      const form = document.forms.form1 || document.querySelector("form");
      if (form) form.submit();
    }
  }, controlId);
  await page.waitForNetworkIdle({ idleTime: 600, timeout: 30000 });
}

// ───────────────────────────────────────────────────────────────────────────────
// SCRAPE FLOW
// ───────────────────────────────────────────────────────────────────────────────

async function run() {
  ensureDir(OUT_DIR);
  ensureDir(DEBUG_DIR);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.on("console", msg => console.log("[browser]", msg.text()));
  await page.goto(BASE, { waitUntil: "networkidle2" });

  // 1) Select School by text → postback
  let ok = await page.evaluate(selectByVisibleText, "#cboSchool", SCHOOL_TEXT, true);
  if (ok) await postback(page, "cboSchool"); else console.warn("School not found:", SCHOOL_TEXT);

  // 2) Select Department by text → postback
  ok = await page.evaluate(selectByVisibleText, "#CboDept", DEPT_TEXT, true);
  if (ok) await postback(page, "CboDept"); else console.warn("Department not found:", DEPT_TEXT);

  await page.waitForFunction(() => {
    const tables = Array.from(document.querySelectorAll("table"));
    return tables.some(t => /Time/i.test(t.textContent || ""));
  }, { timeout: 20000 });


  // 3) Read groups (after dept is set) and save groups.json
  // after selecting School and Department + postbacks
  await page.waitForFunction(() => {
    const sel =
      document.querySelector("#CboStudentGroup") ||
      document.querySelector("select[id*='CboStudentGroup']") ||
      document.querySelector("select[name*='CboStudentGroup']");
    return sel && sel.options && sel.options.length > 1;
  }, { timeout: 20000 });

  const groups = await page.evaluate(() => {
    const sel =
      document.querySelector("#CboStudentGroup") ||
      document.querySelector("select[id*='CboStudentGroup']") ||
      document.querySelector("select[name*='CboStudentGroup']");
    return Array.from(sel.options).map(o => ({
      value: o.value,
      text: (o.textContent || "").trim()
    }));
  });
  saveJson(path.join(OUT_DIR, "groups.json"), groups);


  // 4) Read all weeks and save weeks.json
  const weeks = await page.evaluate(() => {
    const sel = document.querySelector("#CboWeeks")
      || document.querySelector("select[id*='CboWeeks']")
      || document.querySelector("select[name*='CboWeeks']");
    if (!sel) return [];
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    return Array.from(sel.options).map(o => {
      const text = (o.textContent || "").trim();
      const m = text.match(/\((\d{2})-(\w{3})-(\d{2})\)/);
      let iso = "";
      if (m) {
        const [, dd, mon, yy] = m;
        const d = new Date(2000 + Number(yy), months[mon], Number(dd));
        iso = d.toISOString().slice(0,10);
      }
      return { value: o.value, label: text, weekStartISO: iso };
    }).filter(w => w.weekStartISO);
  });
  saveJson(path.join(OUT_DIR, "weeks.json"), weeks);


  const scrapedAt = new Date().toISOString();

  // 5) Loop weeks → select week, select group, parse timetable, save JSON
  for (const w of weeks) {
    // Select week by value → postback
    const selectedWeek = await page.evaluate((value) => {
      const sel = document.querySelector("#CboWeeks");
      if (!sel) return false;
      sel.value = value;
      return true;
    }, w.value);
    if (selectedWeek) await postback(page, "CboWeeks");

    // Select group by visible text contains → postback
    const okGroup = await page.evaluate(selectByVisibleText, "#CboStudentGroup", GROUP_TEXT, true);
    if (okGroup) await postback(page, "CboStudentGroup");
    else {
      console.warn("Group not found:", GROUP_TEXT);
      continue;
    }

    // Select week by value → postback
    const weekSelected = await page.evaluate((val) => {
      const sel = document.querySelector("#CboWeeks");
      if (!sel) return false;
      sel.value = val;
      return true;
    }, w.value);
    if (weekSelected) await postback(page, "CboWeeks");

    // Pick the group by visible text (case-insensitive) → postback
    const pickGroupOk = await page.evaluate((needle) => {
      const sel = document.querySelector("#CboStudentGroup")
        || document.querySelector("select[id*='CboStudentGroup']")
        || document.querySelector("select[name*='CboStudentGroup']");
      if (!sel) return false;
      const want = (needle || "").trim().toLowerCase();
      const opt = Array.from(sel.options).find(o => (o.textContent || "").trim().toLowerCase().includes(want));
      if (!opt) return false;
      sel.value = opt.value;
      return true;
    }, "KCRCO_B2-W_W");

    if (pickGroupOk) {
      await postback(page, "CboStudentGroup");
    } else {
      console.warn("Group option not found: KCRCO_B2-W_W");
      continue; // skip this week gracefully
    }


    // Parse timetable
    const parsed = await page.evaluate(parseTimetable);

    

    if (!parsed.events.length) {
      // Save debug HTML for inspection
      const html = await page.content();
      fs.writeFileSync(path.join(DEBUG_DIR, "last.html"), html);
      console.warn(`No events parsed for week ${w.label}. Saved debug/last.html`);
    }

    // Attach dates and normalize
    const events = parsed.events.map(e => ({
      ...e,
      dateISO: w.weekStartISO && e.day ? isoOfWeekday(w.weekStartISO, e.day) : ""
    }));

    const payload = {
      meta: {
        source: BASE,
        timezone: TIMEZONE,
        scrapedAt,
        school: SCHOOL_TEXT,
        department: DEPT_TEXT,
        group: GROUP_TEXT,
        weekLabel: w.label,
        weekStartISO: w.weekStartISO
      },
      events
    };

    const outDir = path.join(OUT_DIR, w.weekStartISO);
    ensureDir(outDir);
    const file = path.join(outDir, `${slug(GROUP_TEXT)}.json`);
    saveJson(file, payload);
  }

  // 6) Write index.json (weeks + lastUpdated)
  saveJson(path.join(OUT_DIR, "index.json"), {
    lastUpdated: scrapedAt,
    timezone: TIMEZONE,
    weeks: weeks.map(({ weekStartISO, label, value }) => ({ weekStartISO, label, value })),
    groups  // snapshot for UI convenience
  });

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
