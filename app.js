import { downloadICS } from "./ics.js";

const groupSel = document.querySelector("#group");
const weekSel  = document.querySelector("#week");
const metaEl   = document.querySelector("#meta");
const tableEl  = document.querySelector("#table");
const refreshBtn = document.querySelector("#refresh");
const exportIcsBtn = document.querySelector("#export-ics");

async function listWeeks() {
  // Load weeks from data/index.json or data/weeks.json
  try {
    const res = await fetch("data/index.json");
    if (res.ok) {
      const data = await res.json();
      return data.weeks.map(w => ({ label: w.label, startISO: w.weekStartISO }));
    }
  } catch (e) {
    console.warn("Failed to load index.json, trying weeks.json", e);
  }
  
  try {
    const res = await fetch("data/weeks.json");
    if (res.ok) {
      const data = await res.json();
      return data.map(w => ({ label: w.label, startISO: w.weekStartISO }));
    }
  } catch (e) {
    console.warn("Failed to load weeks.json", e);
  }
  
  // Fallback to hardcoded weeks if both fail
  return [
    { label: "week 10 (03-NOV-25)", startISO: "2025-11-03" },
    { label: "week 11 (10-NOV-25)", startISO: "2025-11-10" }
  ];
}

function slug(s) { return s.replace(/[^a-z0-9_]+/gi, "_"); }

function renderTable(headers, rows) {
  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach(h => { const th = document.createElement("th"); th.textContent = h; trh.appendChild(th); });
  thead.appendChild(trh);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = r[h] || "";
      td.setAttribute("data-label", h);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  tableEl.innerHTML = "";
  tableEl.appendChild(table);
}

function toRows(payload) {
  const headers = ["Day","Start","End","Code","Title","Type","Room","Lecturer"];
  const rows = payload.events.map(e => ({
    "Day": e.day,
    "Start": e.start,
    "End": e.end,
    "Code": e.moduleCode,
    "Title": e.title,
    "Type": e.type,
    "Room": e.room,
    "Lecturer": e.lecturer
  }));
  return { headers, rows };
}

async function load() {
  const group = groupSel.value;
  const week = weekSel.value;      // ISO date string
  
  // Try the expected filename first: data/${week}/${slug(group)}.json
  let url = `data/${week}/${slug(group)}.json`;
  let res = await fetch(url);
  
  // If that fails, try timetable.json as fallback
  if (!res.ok) {
    url = `data/${week}/timetable.json`;
    res = await fetch(url);
  }
  
  if (!res.ok) { 
    tableEl.textContent = "No data yet."; 
    metaEl.textContent=""; 
    return; 
  }
  
  const payload = await res.json();

  metaEl.textContent = `${payload.meta.group} · ${payload.meta.weekLabel}`;
  const { headers, rows } = toRows(payload);
  renderTable(headers, rows);

  exportIcsBtn.onclick = () => downloadICS(payload);
}

async function loadGroups() {
  try {
    const res = await fetch("data/groups.json");
    if (res.ok) {
      const data = await res.json();
      groupSel.innerHTML = data.groups.map(g => 
        `<option value="${g.value}">${g.text}</option>`
      ).join("");
      return true;
    }
  } catch (e) {
    console.warn("Failed to load groups.json", e);
  }
  return false;
}

function findCurrentWeek(weeks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  // Find the week that contains today
  for (const week of weeks) {
    const weekStart = new Date(week.startISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7); // Week is 7 days
    
    if (today >= weekStart && today < weekEnd) {
      return week.startISO;
    }
  }
  
  // If there are weeks and today is before all weeks, return the first week
  if (weeks.length > 0 && today < new Date(weeks[0].startISO)) {
    return weeks[0].startISO;
  }
  
  // If there are weeks and today is after all weeks, return the last week
  return weeks.length > 0 ? weeks.at(-1).startISO : null;
}

async function init() {
  // Load groups first
  await loadGroups();
  
  const weeks = await listWeeks();
  weekSel.innerHTML = weeks.map(w => `<option value="${w.startISO}">${w.label}</option>`).join("");
  
  // Preselect current week, or latest week if no current week found
  const currentWeekISO = findCurrentWeek(weeks);
  weekSel.value = currentWeekISO || weeks.at(-1)?.startISO;

  weekSel.addEventListener("change", load);
  groupSel.addEventListener("change", load);
  refreshBtn.addEventListener("click", load);
  await load();
}
init();
