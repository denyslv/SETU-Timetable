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
  const norm = (s) => (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

  // Find headered table
  const tbl = Array.from(document.querySelectorAll("table")).find(t => {
    const hdr = t.querySelector("tr");
    if (!hdr) return false;
    const cells = Array.from(hdr.children).map(td => norm(td.textContent).toLowerCase());
    return cells.includes("time") &&
           cells.some(c => c.includes("subject code")) &&
           cells.includes("student group") &&
           cells.includes("type") &&
           cells.includes("dur") &&
           cells.some(c => c.includes("lecturer")) &&
           cells.some(c => c.includes("room"));
  });

  if (!tbl) return { header: [], events: [] };

  const rows = Array.from(tbl.querySelectorAll("tr"))
    .map(tr => Array.from(tr.children).map(td => norm(td.textContent)));

  // Header
  const header = rows[0] || [];
  const h = header.map(x => x.toLowerCase());

  const col = {
    time: h.indexOf("time"),
    subj: h.findIndex(c => c.includes("subject code")),
    group: h.indexOf("student group"),
    type: h.indexOf("type"),
    dur:  h.indexOf("dur"),
    lec:  h.findIndex(c => c.includes("lecturer")),
    room: h.findIndex(c => c.startsWith("room"))
  };

  let currentDay = "";
  const toDay = (txt) => {
    const t = txt.toLowerCase();
    if (t.includes("monday")) return "Mon";
    if (t.includes("tuesday")) return "Tue";
    if (t.includes("wednesday")) return "Wed";
    if (t.includes("thursday")) return "Thu";
    if (t.includes("friday")) return "Fri";
    if (t.includes("saturday")) return "Sat";
    if (t.includes("sunday")) return "Sun";
    return "";
  };

  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];

    // Day separators (single cell)
    if (r.length === 1) {
      const day = toDay(r[0]);
      if (day) currentDay = day;
      continue;
    }

    // Skip rows without time like "09:15"
    const time = col.time >= 0 ? r[col.time] : "";
    if (!/^\d{2}:\d{2}$/.test(time)) continue;

    const subj = col.subj >= 0 ? r[col.subj] : "";
    const groupsRaw = col.group >= 0 ? r[col.group] : "";
    const type = col.type >= 0 ? r[col.type] : "";
    const durTxt = col.dur >= 0 ? r[col.dur] : "1";
    const lecturer = col.lec >= 0 ? r[col.lec] : "";
    const room = col.room >= 0 ? r[col.room].replace(/\*$/, "") : "";

    // split subject → code + title
    let moduleCode = "", title = subj;
    const m = subj.match(/^([A-Z]{2,}-?\d{3,})\s+(.*)$/i);
    if (m) { moduleCode = m[1].trim(); title = m[2].trim(); }

    const durHours = /^\d+$/.test(durTxt) ? parseInt(durTxt, 10) : 1;
    const [hh, mm] = time.split(":").map(Number);
    const endDate = new Date(2000, 0, 1, hh, mm + durHours * 60);
    const end = `${String(endDate.getHours()).padStart(2,"0")}:${String(endDate.getMinutes()).padStart(2,"0")}`;

    out.push({
      day: currentDay,
      start: time,
      end,
      moduleCode,
      title,
      type,
      durationHours: durHours,
      lecturer,
      room,
      groupsRaw
    });
  }

    return { header, events: out };
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
