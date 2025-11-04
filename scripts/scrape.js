import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const BASE = "https://YOUR-UNI-DOMAIN/StudentGroupTT.aspx"; // TODO: set full URL

// Fill this with the groups you want:
const TARGETS = [
  { schoolValue: "SS", deptValue: "548715F70874B2B1561DDC98FE61E5C0", groupText: "KCRCO_B2-W_W" }
];

// Which weeks to scrape (use the option values as seen in the page)
const WEEK_VALUES = ["10", "11"];

const OUT_DIR = "data";

// -------- helpers that run in Node --------
function addMin(hhmm, m) {
  const [h, min] = hhmm.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, min + m);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function isoOfWeekday(weekStartISO, dowShort) {
  const base = new Date(weekStartISO + "T00:00:00");
  const map = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4 };
  const d = new Date(base); d.setDate(base.getDate() + (map[dowShort] ?? 0));
  return d.toISOString().slice(0,10);
}

// -------- code that runs in the page (browser) --------
function parseRows() {
  // Find the big timetable table by looking for a header like "Subject Code" etc.
  const tables = Array.from(document.querySelectorAll("table"));
  const table = tables.find(t => /Subject\s*Code/i.test(t.textContent || "")) || tables[0];
  if (!table) return { header: [], body: [] };

  const rows = Array.from(table.querySelectorAll("tr"))
    .map(tr => Array.from(tr.children).map(td => td.textContent.trim().replace(/\s+/g, " ")))
    .filter(r => r.length > 0);

  // Find a plausible header row (has several columns)
  const header = rows.find(r => r.length >= 6) || [];
  const body = rows.filter(r => r !== header);

  // Extract events; the timetable often has single-cell day separators ("Monday", etc.)
  let currentDay = "";
  const events = [];

  const colIndex = (name) => header.findIndex(h => new RegExp(name, "i").test(h));

  const idx = {
    time: 0,
    subject: colIndex("Subject") !== -1 ? colIndex("Subject") : colIndex("Subject Code"),
    title: colIndex("Title") !== -1 ? colIndex("Title") : colIndex("Subject Code and Title"),
    type: colIndex("Type"),
    dur:  colIndex("Dur"),
    room: colIndex("Room"),
    lec:  colIndex("Lectur|Tutor|Teacher")
  };

  for (const r of body) {
    if (r.length === 1 && /monday|tuesday|wednesday|thursday|friday/i.test(r[0])) {
      currentDay = r[0].slice(0,3);
      continue;
    }
    const timeCell = r[idx.time] || "";
    if (!/^\d{2}:\d{2}$/.test(timeCell)) continue;

    const durCell = idx.dur >= 0 ? r[idx.dur] : "";
    const hours = durCell && /^\d+$/.test(durCell) ? Number(durCell) : 1; // fallback 1h
    const end = (() => {
      const [h, m] = timeCell.split(":").map(Number);
      const d = new Date(2000,0,1,h, m + hours*60);
      return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    })();

    events.push({
      day: currentDay || "",
      start: timeCell,
      end,
      moduleCode: idx.subject >= 0 ? r[idx.subject] : "",
      title: idx.title >= 0 ? r[idx.title] : "",
      type: idx.type >= 0 ? r[idx.type] : "",
      room: idx.room >= 0 ? r[idx.room].replace(/\*$/, "") : "",
      lecturer: idx.lec >= 0 ? r[idx.lec] : ""
    });
  }

  return { header, events };
}

async function postback(page, controlId) {
  await page.evaluate((id) => {
    // Many WebForms pages define __doPostBack globally
    if (typeof window.__doPostBack === "function") {
      window.__doPostBack(id, "");
    } else {
      // Fallback: submit the form if present
      const form = document.forms.form1 || document.querySelector("form");
      if (form) form.submit();
    }
  }, controlId);
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
}

async function scrapeOne(page, { schoolValue, deptValue, groupText, weekValue }) {
  await page.goto(BASE, { waitUntil: "networkidle2" });

  // Select School and trigger postback
  if (await page.$("#cboSchool")) {
    await page.select("#cboSchool", schoolValue);
    await postback(page, "cboSchool");
  }

  // Select Department and trigger postback
  if (await page.$("#CboDept")) {
    await page.select("#CboDept", deptValue);
    await postback(page, "CboDept");
  }

  // Select Week and trigger postback
  if (weekValue && await page.$("#CboWeeks")) {
    await page.select("#CboWeeks", weekValue);
    await postback(page, "CboWeeks");
  }

  // Select Student Group by text (ID varies; match loosely)
  await page.evaluate((text) => {
    const sel = document.querySelector("select#CboStudentGroup")
      || document.querySelector("select[id*='CboStudentGroup']")
      || document.querySelector("select[name*='CboStudentGroup']");
    if (!sel) return;
    const opt = Array.from(sel.options).find(o => (o.textContent || "").trim().includes(text));
    if (opt) sel.value = opt.value;
  }, groupText);
  await postback(page, "CboStudentGroup");

  // Week label + ISO
  const weekLabel = await page.$eval("#CboWeeks option:checked", o => o.textContent.trim());
  const weekStartISO = await page.evaluate((label) => {
    const m = label.match(/\((\d{2})-(\w{3})-(\d{2})\)/);
    if (!m) return "";
    const [ , dd, mon, yy ] = m;
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    const d = new Date(2000 + Number(yy), months[mon], Number(dd));
    return d.toISOString().slice(0,10);
  }, weekLabel);

  // Parse the rendered table
  const { events } = await page.evaluate(parseRows);

  // Attach dates
  const dated = events.map(e => ({
    ...e,
    dateISO: weekStartISO ? isoOfWeekday(weekStartISO, e.day || "Mon") : ""
  }));

  return { weekLabel, weekStartISO, events: dated };
}

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  for (const t of TARGETS) {
    for (const weekValue of WEEK_VALUES) {
      const { weekLabel, weekStartISO, events } = await scrapeOne(page, { ...t, weekValue });

      const payload = {
        meta: {
          source: BASE,
          school: "School of Science and Computing",
          department: "Computing and Maths",
          group: t.groupText,
          weekLabel,
          weekStartISO
        },
        events
      };

      const outDir = path.join(OUT_DIR, weekStartISO);
      fs.mkdirSync(outDir, { recursive: true });
      const slug = t.groupText.replace(/[^a-z0-9_]+/gi, "_");
      fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(payload, null, 2));
      console.log(`Wrote ${path.join(outDir, `${slug}.json`)}`);
    }
  }

  await browser.close();
})();
