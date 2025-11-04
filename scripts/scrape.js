import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const BASE = "https://studentssp.setu.ie/timetables/StudentGroupTT.aspx"; // SETU timetable URL

const TARGETS = [
  // add the groups you care about
  { schoolValue: "SS", deptValue: "548715F70874B2B1561DDC98FE61E5C0", groupText: "KCRCO_B2-W_W" }
];

const OUT_DIR = "data";

function parseRows(document) {
  // find the big timetable table by header row (“Time / Subject Code…”)
  const tables = [...document.querySelectorAll("table")];
  const table = tables.find(t => /Subject\s*Code/i.test(t.textContent || ""));
  if (!table) return [];

  const rows = [...table.querySelectorAll("tr")].map(tr =>
    [...tr.children].map(td => td.textContent.trim().replace(/\s+/g, " "))
  );

  // figure out headings from first non-empty row
  const header = rows.find(r => r.length >= 6) || [];
  const body = rows.filter(r => r !== header && r.length >= 3);

  const col = (row, name) => {
    const idx = header.findIndex(h => new RegExp(name, "i").test(h));
    return idx >= 0 ? row[idx] : "";
  };

  // We also need the weekday boundaries; rows often have a day separator like “Monday”
  let currentDay = null;
  const events = [];
  for (const r of body) {
    if (r.length === 1 && /monday|tuesday|wednesday|thursday|friday/i.test(r[0])) {
      currentDay = r[0].slice(0,3); // Mon/Tue/…
      continue;
    }
    // skip blank time rows
    if (!/\d{2}:\d{2}/.test(r[0])) continue;

    const start = r[0];
    // infer end time by next slot or +60m (simple heuristic, can be improved if “Dur” column exists)
    const dur = col(r, "Dur");
    const end = dur ? addMin(start, parseInt(dur)*60) : addMin(start, 60);

    events.push({
      day: currentDay || "",
      start,
      end,
      moduleCode: col(r, "Subject") || col(r, "Subject Code"),
      title: col(r, "Title") || col(r, "Subject Code and Title"),
      type: col(r, "Type"),
      room: (col(r, "Room") || "").replace(/\*$/, ""), // drop asterisk if present
      lecturer: col(r, "Lecturer")
    });
  }
  return events;
}

function addMin(hhmm, m) {
  const [h, min] = hhmm.split(":").map(Number);
  const d = new Date(2000,0,1,h,min + m);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function isoOfWeekday(weekStartISO, dowShort) {
  const base = new Date(weekStartISO + "T00:00:00");
  const map = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4 };
  const add = map[dowShort] ?? 0;
  const d = new Date(base); d.setDate(base.getDate() + add);
  return d.toISOString().slice(0,10);
}

async function scrapeOne(page, { schoolValue, deptValue, groupText, weekValue }) {
  await page.goto(BASE, { waitUntil: "networkidle2" });

  // select School
  await page.select("#cboSchool", schoolValue);
  await page.waitForNetworkIdle();

  // select Department
  await page.select("#CboDept", deptValue);
  await page.waitForNetworkIdle();

  // select Week
  if (weekValue) {
    await page.select("#CboWeeks", weekValue);
    await page.waitForNetworkIdle();
  }

  // grab the selected week label + start date
  const weekLabel = await page.$eval("#CboWeeks option:checked", o => o.textContent.trim());
  const weekStartISO = (() => {
    const m = weekLabel.match(/\((\d{2})-(\w{3})-(\d{2})\)/);
    if (!m) return null;
    const [ , dd, mon, yy ] = m;
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    const d = new Date(2000 + Number(yy), months[mon], Number(dd));
    return d.toISOString().slice(0,10);
  })();

  // select Student Group (by text, because value is sometimes opaque)
  await page.evaluate((text) => {
    const sel = document.querySelector("#CboStudentGroup");
    if (!sel) return;
    const opt = [...sel.options].find(o => o.textContent.trim().includes(text));
    if (opt) sel.value = opt.value;
  }, groupText);
  await Promise.all([
    page.waitForNetworkIdle(),
    page.evaluate(() => __doPostBack && __doPostBack('CboStudentGroup',''))
  ]);

  const events = await page.evaluate(parseRows);

  // inject dates
  const dated = events.map(e => ({
    ...e,
    dateISO: weekStartISO ? isoOfWeekday(weekStartISO, e.day || "Mon") : ""
  }));

  return { weekLabel, weekStartISO, events: dated };
}

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  // choose the weeks you want; keep it light (e.g., current + next)
  const weekValues = ["10","11"]; // maps to “week 10 (03-NOV-25)” etc.

  for (const t of TARGETS) {
    for (const weekValue of weekValues) {
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
    }
  }

  await browser.close();
})();
